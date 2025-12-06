import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Trash2, Edit, CheckCircle } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import { itemsAPI } from '../services/api';
import { formatDate, getDaysUntilExpiry, getStatusColor, getStatusLabel, formatCurrency } from '../utils/auth';
import { useToast } from '../components/ui/Toast';

const ItemList = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const categories = ['All', 'Dairy', 'Meat', 'Vegetables', 'Fruits', 'Grains', 'Beverages', 'Snacks', 'Condiments', 'Frozen', 'Bakery', 'Other'];
  const statuses = ['All', 'fresh', 'expiring_soon', 'expired'];

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchQuery, filterCategory, filterStatus]);

  const fetchItems = async () => {
    try {
      const response = await itemsAPI.getAll();
      setItems(response.data.items);
    } catch (error) {
      console.error('Error fetching items:', error);
      addToast('Failed to load items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    setFilteredItems(filtered);
  };

  const handleConsume = async (itemId) => {
    try {
      await itemsAPI.consume(itemId);
      addToast('Item marked as consumed!', 'success');
      fetchItems();
    } catch (error) {
      addToast('Failed to update item', 'error');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await itemsAPI.delete(itemId);
      addToast('Item deleted successfully', 'success');
      fetchItems();
    } catch (error) {
      addToast('Failed to delete item', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container-custom py-20">
          <Loader size="lg" text="Loading items..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              My Items
            </h1>
            <p className="text-neutral-600">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => navigate('/add')}>
            Add Item
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />

              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <option value="All">All Status</option>
                  <option value="fresh">Fresh</option>
                  <option value="expiring_soon">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No items found
              </h3>
              <p className="text-neutral-600 mb-6">
                {searchQuery || filterCategory !== 'All' || filterStatus !== 'All'
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first item'}
              </p>
              <Button variant="primary" icon={Plus} onClick={() => navigate('/add')}>
                Add Your First Item
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => {
              const daysLeft = getDaysUntilExpiry(item.expiryDate);
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {item.quantity} {item.unit} • {item.category}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Expires:</span>
                        <span className="font-medium text-neutral-900">
                          {formatDate(item.expiryDate)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Days left:</span>
                        <span className={`font-medium ${
                          daysLeft < 0 ? 'text-danger-600' :
                          daysLeft <= 3 ? 'text-warning-600' :
                          'text-success-600'
                        }`}>
                          {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} days ago` :
                           daysLeft === 0 ? 'Expires today' :
                           daysLeft === 1 ? 'Expires tomorrow' :
                           `${daysLeft} days`}
                        </span>
                      </div>
                      {item.estimatedPrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Value:</span>
                              <span className="font-medium text-neutral-900">
                                {formatCurrency(item.estimatedPrice)}
                              </span>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-sm text-neutral-600 mb-4 p-3 bg-neutral-50 rounded-lg">
                        {item.notes}
                      </p>
                    )}

                    <div className="flex space-x-2">
                      {item.status !== 'consumed' && (
                        <Button
                          size="sm"
                          variant="success"
                          icon={CheckCircle}
                          onClick={() => handleConsume(item._id)}
                          className="flex-1"
                        >
                          Used
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemList;