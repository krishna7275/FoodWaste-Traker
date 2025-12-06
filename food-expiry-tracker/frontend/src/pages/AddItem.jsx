import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Camera, ScanBarcode, Package } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import BarcodeScanner from '../components/BarcodeScanner';
import OCRScanner from '../components/OCRScanner';
import { itemsAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';

const AddItem = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    quantity: 1,
    unit: 'pieces',
    expiryDate: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
    estimatedPrice: '',
    barcode: ''
  });
  const [errors, setErrors] = useState({});

  const categories = [
    'Dairy', 'Meat', 'Vegetables', 'Fruits', 'Grains',
    'Beverages', 'Snacks', 'Condiments', 'Frozen', 'Bakery', 'Other'
  ];

  const units = ['pieces', 'kg', 'g', 'l', 'ml', 'packets'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleBarcodeSuccess = (productData) => {
    setFormData({
      ...formData,
      name: productData.name || formData.name,
      category: productData.category || formData.category,
      barcode: productData.barcode || formData.barcode
    });
    addToast('Product details auto-filled from barcode!', 'success');
  };

  const handleOCRSuccess = (ocrData) => {
    if (ocrData.expiryDate) {
      setFormData({
        ...formData,
        expiryDate: ocrData.expiryDate
      });
      addToast(`Expiry date detected: ${ocrData.expiryDate}`, 'success');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        quantity: Number(formData.quantity),
        estimatedPrice: formData.estimatedPrice ? Number(formData.estimatedPrice) : undefined
      };

      await itemsAPI.create(submitData);
      addToast('Item added successfully!', 'success');
      navigate('/items');
    } catch (error) {
      console.error('Add item error:', error);
      addToast(error.response?.data?.error || 'Failed to add item', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container-custom py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Add New Item
          </h1>
          <p className="text-neutral-600">
            Add items manually, scan barcode, or use OCR for expiry dates
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            {/* Quick Scan Options */}
            <div className="mb-6 pb-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Quick Add Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="secondary"
                  icon={ScanBarcode}
                  onClick={() => setShowBarcodeScanner(true)}
                  className="w-full"
                >
                  Scan Barcode
                </Button>
                <Button
                  variant="secondary"
                  icon={Camera}
                  onClick={() => setShowOCRScanner(true)}
                  className="w-full"
                >
                  Scan Expiry Label
                </Button>
              </div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Item Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="e.g., Fresh Milk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Quantity *"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    error={errors.quantity}
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Expiry Date *"
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    error={errors.expiryDate}
                  />
                </div>

                <div>
                  <Input
                    label="Purchase Date"
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Input
                    label="Estimated Price (₹)"
                    type="number"
                    name="estimatedPrice"
                    value={formData.estimatedPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Add any additional notes..."
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-6 border-t border-neutral-200">
                <Button
                  type="submit"
                  variant="primary"
                  icon={Save}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Adding Item...' : 'Add Item'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/items')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Scanners */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScanSuccess={handleBarcodeSuccess}
      />

      <OCRScanner
        isOpen={showOCRScanner}
        onClose={() => setShowOCRScanner(false)}
        onScanSuccess={handleOCRSuccess}
      />
    </div>
  );
};

export default AddItem;