import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cleanup scanner on component unmount
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanner = () => {
    try {
      setError(null);
      setIsScanning(true);
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Handle success
          html5QrCode.stop();
          setIsScanning(false);
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Handle error (ignore - this is called continuously when no QR is detected)
          if (onScanError) {
            onScanError(errorMessage);
          }
        }
      ).catch((err) => {
        setError(`Error starting scanner: ${err.message || err}`);
        setIsScanning(false);
        if (onScanError) {
          onScanError(err);
        }
      });
    } catch (err) {
      setError(`Error initializing scanner: ${err.message || err}`);
      setIsScanning(false);
      if (onScanError) {
        onScanError(err);
      }
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.stop().then(() => {
        setIsScanning(false);
      }).catch(err => {
        console.error('Error stopping scanner:', err);
      });
    }
  };

  return (
    <div className="qr-scanner-container">
      <div id="qr-reader" className="w-full max-w-sm mx-auto rounded overflow-hidden shadow-lg"></div>
      
      {error && (
        <div className="text-red-500 mt-2 text-center">
          {error}
        </div>
      )}
      
      <div className="flex justify-center mt-4">
        {!isScanning ? (
          <button 
            onClick={startScanner}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Start Scanning
          </button>
        ) : (
          <button 
            onClick={stopScanner}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Stop Scanning
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;