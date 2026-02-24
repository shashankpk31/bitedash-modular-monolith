import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

function QRCodeDisplay({ qrCodeData, orderNumber, size = 200 }) {
  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `order-${orderNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!qrCodeData) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-2xl">
        <p className="text-gray-500">QR code not available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
      {}
      <div className="p-4 bg-white rounded-xl border-2 border-gray-100">
        <QRCodeSVG
          id="qr-code-svg"
          value={qrCodeData}
          size={size}
          level="H"
          includeMargin={true}
          className="rounded-lg"
        />
      </div>

      {}
      {orderNumber && (
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium">Order Number</p>
          <p className="text-lg font-bold text-gray-800">{orderNumber}</p>
        </div>
      )}

      {}
      <button
        onClick={downloadQR}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
      >
        <Download size={16} />
        Download QR Code
      </button>

      {}
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Show this QR code to the vendor for order verification
      </p>
    </div>
  );
}

export default QRCodeDisplay;
