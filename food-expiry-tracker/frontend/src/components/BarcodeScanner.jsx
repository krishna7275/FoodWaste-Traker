import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { barcodeAPI } from '../services/api';
import { useToast } from './ui/Toast';

const BarcodeScanner = ({ isOpen, onClose, onScanSuccess }) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = () => {
    if (isScanning || !scannerRef.current) return;

    try {
      const html5Scanner = new Html5QrcodeScanner(
        'barcode-reader',
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
        },
        false
      );

      html5Scanner.render(
        async (decodedText) => {
          console.log('Barcode detected:', decodedText);
          
          // Stop scanner temporarily
          await html5Scanner.pause();

          try {
            const response = await barcodeAPI.lookup(decodedText);
            addToast('Product found!', 'success');
            onScanSuccess(response.data.product);
            onClose();
          } catch (error) {
            console.error('Barcode lookup error:', error);
            addToast(
              error.response?.data?.message || 'Product not found. Please enter details manually.',
              'error'
            );
            // Restart scanner if lookup fails
            try {
              await html5Scanner.resume();
            } catch (e) {
              console.error('Error resuming scanner:', e);
            }
          }
        },
        (errorMessage) => {
          // Ignore continuous error messages during scanning
          console.debug('Scanner error:', errorMessage);
        }
      );

      setScanner(html5Scanner);
      setIsScanning(true);
    } catch (err) {
      console.error('Barcode scanner initialization error:', err);
      addToast('Failed to start camera. Please check permissions.', 'error');
    }
  };

  const stopScanner = async () => {
    if (scanner && isScanning) {
      try {
        await scanner.clear();
        setScanner(null);
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Barcode" size="md">
      <div className="space-y-4">
        <div className="bg-neutral-100 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
          <div id="barcode-reader" ref={scannerRef} className="w-full h-full" />
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-neutral-600">
          <Camera className="w-5 h-5" />
          <p className="text-sm">
            {isScanning ? 'Point camera at barcode...' : 'Initializing camera...'}
          </p>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-primary-800">
            <strong>Tip:</strong> Hold the barcode steady and ensure good lighting for best results.
          </p>
        </div>

        <Button variant="secondary" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default BarcodeScanner;