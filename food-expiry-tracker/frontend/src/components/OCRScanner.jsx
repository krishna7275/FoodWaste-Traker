import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader as LoaderIcon } from 'lucide-react';
import Tesseract from 'tesseract.js';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { ocrAPI } from '../services/api';
import { useToast } from './ui/Toast';

const OCRScanner = ({ isOpen, onClose, onScanSuccess }) => {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    fileInputRef.current.click();
  };

  const processImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Extract text using Tesseract.js
      const result = await Tesseract.recognize(image, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const extractedText = result.data.text;
      console.log('Extracted text:', extractedText);

      // Send to backend for AI parsing
      const response = await ocrAPI.parse(extractedText);
      
      if (response.data.expiryDate) {
        addToast('Expiry date detected successfully!', 'success');
        onScanSuccess(response.data);
        onClose();
      } else {
        addToast('No expiry date found in image. Please try again or enter manually.', 'warning');
      }
    } catch (error) {
      console.error('OCR error:', error);
      addToast('Failed to process image. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setImage(null);
    setProgress(0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Expiry Label" size="md">
      <div className="space-y-4">
        {!image ? (
          <>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-12 text-center">
              <Camera className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 mb-4">
                Take a photo or upload an image of the expiry date label
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="primary" icon={Camera} onClick={handleCapture}>
                Take Photo / Upload
              </Button>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-primary-800">
                <strong>Tips for best results:</strong>
              </p>
              <ul className="text-sm text-primary-700 mt-2 space-y-1 list-disc list-inside">
                <li>Ensure good lighting</li>
                <li>Hold camera steady and close to the label</li>
                <li>Make sure text is clear and in focus</li>
                <li>Avoid shadows and glare</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <img
                src={image}
                alt="Captured"
                className="w-full rounded-lg border border-neutral-200"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <LoaderIcon className="w-12 h-12 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Processing... {progress}%</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={processImage}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Extract Date'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={isProcessing}
              >
                Retake
              </Button>
            </div>
          </>
        )}

        <Button variant="ghost" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default OCRScanner;