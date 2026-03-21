import { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle, History } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../common/components/Button';
import Card, { CardContent } from '../../../common/components/Card';
import { StatusBadge } from '../../../common/components/Badge';
import { useOrderById, useUpdateOrderStatus } from '../../../services/queries/order.queries';
import { formatCurrency, formatDateTime } from '../../../common/utils';
import { ORDER_STATUS } from '../../../config/constants';

// QR Scanner Page - Scan order QR codes for pickup verification
// Why? Vendors need quick way to verify and mark orders as picked up
const QRScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedOrderId, setScannedOrderId] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [scanError, setScanError] = useState(null);
  const scannerRef = useRef(null);

  // Fetch order details after scanning
  const { data: order, isLoading: orderLoading } = useOrderById(scannedOrderId, {
    enabled: !!scannedOrderId,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  // Initialize scanner
  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            // Use back camera by default on mobile
            videoConstraints: {
              facingMode: { ideal: 'environment' }
            }
          },
          /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanError);
        scannerRef.current = scanner;
      } catch (err) {
        console.error('Scanner initialization error:', err);
        setScanError('Failed to initialize camera. Please check permissions.');
        setIsScanning(false);
      }
    }

    // Cleanup on unmount or when scanning stops
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {
          console.error('Scanner cleanup error:', err);
        });
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  // Handle successful scan
  const onScanSuccess = (decodedText) => {
    console.log('QR Code scanned:', decodedText);
    setScanError(null);

    // Extract order ID from QR code
    // Expected format: "BITEDASH-ORDER-{orderId}" or just the orderId
    let orderId = decodedText;
    if (decodedText.includes('BITEDASH-ORDER-')) {
      orderId = decodedText.split('BITEDASH-ORDER-')[1];
    }

    // Validate order ID is numeric
    if (!/^\d+$/.test(orderId)) {
      setScanError('Invalid QR code format. Please scan a valid order QR code.');
      return;
    }

    setScannedOrderId(parseInt(orderId));
    stopScanning();

    // Add to scan history
    setScanHistory(prev => [{
      orderId: parseInt(orderId),
      timestamp: new Date().toISOString(),
      success: true,
    }, ...prev.slice(0, 9)]); // Keep last 10 scans
  };

  // Handle scan error
  const onScanError = (error) => {
    // Don't show errors for "No QR code found" - this is normal during scanning
    if (error.includes('No MultiFormat Readers')) {
      return;
    }
    console.warn('QR scan error:', error);
  };

  // Start scanning
  const startScanning = () => {
    setScanError(null);
    setScannedOrderId(null);
    setIsScanning(true);
  };

  // Stop scanning
  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(err => {
        console.error('Scanner stop error:', err);
      });
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Handle mark as picked up
  const handleMarkPickedUp = () => {
    if (!order) return;

    updateStatusMutation.mutate(
      { orderId: order.id, status: ORDER_STATUS.PICKED_UP },
      {
        onSuccess: () => {
          // Update scan history with success
          setScanHistory(prev => prev.map(item =>
            item.orderId === order.id
              ? { ...item, markedPickedUp: true }
              : item
          ));
          // Reset for next scan
          setScannedOrderId(null);
        },
      }
    );
  };

  // Handle cancel and scan again
  const handleScanAgain = () => {
    setScannedOrderId(null);
    setScanError(null);
    startScanning();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-outline-variant/15 bg-surface-container-low">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-headline text-display-sm text-on-surface">QR Scanner</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Scan order QR codes to verify pickup
            </p>
          </div>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Scanner Card */}
          <Card>
            <CardContent>
              <AnimatePresence mode="wait">
                {/* Initial State - Not Scanning */}
                {!isScanning && !scannedOrderId && (
                  <motion.div
                    key="initial"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 space-y-6"
                  >
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                      <QrCode size={48} className="text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-headline text-headline-md text-on-surface">
                        Ready to Scan
                      </h3>
                      <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                        Position the QR code within the camera frame to scan
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      icon={<Camera size={20} />}
                      onClick={startScanning}
                    >
                      Start Camera
                    </Button>

                    {/* Instructions */}
                    <div className="bg-surface-container rounded-xl p-4 text-left space-y-2">
                      <h4 className="font-headline text-label-lg text-on-surface">
                        How to Use:
                      </h4>
                      <ul className="space-y-2 text-body-sm text-on-surface-variant">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">1.</span>
                          <span>Click "Start Camera" to activate the scanner</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">2.</span>
                          <span>Ask customer to show their order QR code</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">3.</span>
                          <span>Position QR code within the frame</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">4.</span>
                          <span>Verify order details and mark as picked up</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Scanning State */}
                {isScanning && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Scanner Container */}
                    <div id="qr-reader" className="rounded-xl overflow-hidden" />

                    {/* Scan Error */}
                    {scanError && (
                      <div className="bg-error/10 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle size={20} className="text-error flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-label-md text-error font-semibold">Scan Error</p>
                          <p className="text-body-sm text-error mt-1">{scanError}</p>
                        </div>
                      </div>
                    )}

                    {/* Stop Button */}
                    <Button variant="outline" fullWidth onClick={stopScanning}>
                      Stop Camera
                    </Button>
                  </motion.div>
                )}

                {/* Scanned Order Details */}
                {scannedOrderId && !isScanning && (
                  <motion.div
                    key="scanned"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-6"
                  >
                    {/* Loading */}
                    {orderLoading && (
                      <div className="text-center py-8">
                        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                        <p className="text-body-md text-on-surface-variant mt-4">
                          Loading order details...
                        </p>
                      </div>
                    )}

                    {/* Order Not Found */}
                    {!orderLoading && !order && (
                      <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-error/10 flex items-center justify-center">
                          <XCircle size={32} className="text-error" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-headline text-headline-sm text-on-surface">
                            Order Not Found
                          </h3>
                          <p className="text-body-md text-on-surface-variant">
                            Order #{scannedOrderId} could not be found
                          </p>
                        </div>
                        <Button variant="primary" onClick={handleScanAgain}>
                          Scan Another
                        </Button>
                      </div>
                    )}

                    {/* Order Details */}
                    {!orderLoading && order && (
                      <div className="space-y-4">
                        {/* Success Header */}
                        <div className="text-center py-4">
                          <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                            <CheckCircle size={32} className="text-green-600" />
                          </div>
                          <h3 className="font-headline text-headline-md text-on-surface">
                            Order #{order.id}
                          </h3>
                          <StatusBadge status={order.status} size="lg" className="mt-2" />
                        </div>

                        {/* Order Info */}
                        <div className="bg-surface-container rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-label-md text-on-surface-variant">Customer</span>
                            <span className="font-headline text-body-md text-on-surface">
                              {order.customerName || 'Customer'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-label-md text-on-surface-variant">Order Time</span>
                            <span className="font-headline text-body-md text-on-surface">
                              {formatDateTime(order.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-label-md text-on-surface-variant">Items</span>
                            <span className="font-headline text-body-md text-on-surface">
                              {order.items?.length || 0} items
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15">
                            <span className="font-headline text-body-lg text-on-surface">Total</span>
                            <span className="font-headline text-headline-md text-primary">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-surface-container rounded-xl p-4">
                          <h4 className="font-headline text-label-lg text-on-surface mb-3">
                            Order Items
                          </h4>
                          <div className="space-y-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-body-sm">
                                <span className="text-on-surface">
                                  {item.quantity}x {item.itemName || item.name}
                                </span>
                                <span className="text-on-surface-variant">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button variant="outline" fullWidth onClick={handleScanAgain}>
                            Scan Another
                          </Button>
                          {order.status === ORDER_STATUS.READY && (
                            <Button
                              variant="primary"
                              fullWidth
                              icon={<CheckCircle size={18} />}
                              onClick={handleMarkPickedUp}
                              disabled={updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending ? 'Updating...' : 'Mark Picked Up'}
                            </Button>
                          )}
                        </div>

                        {/* Status Warning */}
                        {order.status !== ORDER_STATUS.READY && (
                          <div className="bg-yellow-500/10 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-label-md text-yellow-600 font-semibold">
                                Order Not Ready
                              </p>
                              <p className="text-body-sm text-yellow-600 mt-1">
                                This order is currently {order.status.toLowerCase().replace('_', ' ')}.
                                Only orders marked as "READY" can be picked up.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Scan History */}
          {scanHistory.length > 0 && !isScanning && (
            <Card>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <History size={20} className="text-on-surface-variant" />
                  <h3 className="font-headline text-body-lg text-on-surface">Recent Scans</h3>
                </div>
                <div className="space-y-2">
                  {scanHistory.map((scan, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-surface-container rounded-lg"
                    >
                      <div>
                        <p className="font-headline text-body-md text-on-surface">
                          Order #{scan.orderId}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          {formatDateTime(scan.timestamp)}
                        </p>
                      </div>
                      {scan.markedPickedUp && (
                        <CheckCircle size={20} className="text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;
