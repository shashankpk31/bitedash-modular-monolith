import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

function QRScanner({ onScan, onError }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (scanning && scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          
          setScannedData(decodedText);
          setScanning(false);
          toast.success('QR Code scanned successfully!');

          if (onScan) {
            onScan(decodedText);
          }

          scanner.clear();
        },
        (errorMessage) => {
          
          console.log('QR Scan error:', errorMessage);
        }
      );

      return () => {
        scanner.clear().catch((err) => console.log('Scanner cleanup error:', err));
      };
    }
  }, [scanning, onScan]);

  const startScanning = () => {
    setScanning(true);
    setScannedData(null);
    setError(null);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
      {}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl mb-3 mx-auto">
          <Camera className="text-brand-primary" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Scan Order QR Code</h3>
        <p className="text-sm text-gray-500 mt-1">
          Position the QR code within the frame to scan
        </p>
      </div>

      {}
      {!scanning && !scannedData && (
        <button
          onClick={startScanning}
          className="w-full px-6 py-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-100 active:scale-95"
        >
          <div className="flex items-center justify-center gap-2">
            <Camera size={20} />
            Start Scanning
          </div>
        </button>
      )}

      {scanning && (
        <div className="w-full">
          <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
          <button
            onClick={stopScanning}
            className="w-full mt-4 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-xl transition-colors"
          >
            Stop Scanning
          </button>
        </div>
      )}

      {}
      {scannedData && (
        <div className="w-full p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-medium text-green-900">QR Code Scanned</p>
              <p className="text-sm text-green-700 mt-1 break-all">
                {scannedData.substring(0, 50)}...
              </p>
            </div>
          </div>
          <button
            onClick={startScanning}
            className="w-full mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Scan Another
          </button>
        </div>
      )}

      {}
      {error && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-medium text-red-900">Scan Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="w-full p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-600 font-medium mb-2">How to scan:</p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Allow camera access when prompted</li>
          <li>Hold the QR code steady within the frame</li>
          <li>Ensure good lighting for best results</li>
          <li>The order details will appear automatically</li>
        </ul>
      </div>
    </div>
  );
}

export default QRScanner;
