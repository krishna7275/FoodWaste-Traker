import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, CheckCircle, AlertTriangle, TrendingDown, Calendar, Filter, Search, Package } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import { itemsAPI } from '../services/api';
import { formatDate, getDaysUntilExpiry, getStatusColor, getStatusLabel, formatCurrency } from '../utils/auth';
import { useToast } from '../components/ui/Toast';

const WasteManagement = () => {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, expiring, expired, wasted, saved

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchQuery, filterType]);

  const fetchItems = async () => {
    try {
      const response = await itemsAPI.getAll();
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      addToast('Failed to load items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    switch (filterType) {
      case 'expiring':
        filtered = filtered.filter(item => {
          const days = getDaysUntilExpiry(item.expiryDate);
          return item.status !== 'consumed' && days > 0 && days <= 7;
        });
        break;
      case 'expired':
        filtered = filtered.filter(item => 
          item.status === 'expired' || getDaysUntilExpiry(item.expiryDate) < 0
        );
        break;
      case 'wasted':
        filtered = filtered.filter(item => {
          const days = getDaysUntilExpiry(item.expiryDate);
          return item.status === 'expired' || (item.status === 'consumed' && days < 0);
        });
        break;
      case 'saved':
        filtered = filtered.filter(item => 
          item.status === 'consumed' && getDaysUntilExpiry(item.expiryDate) >= 0
        );
        break;
      default:
        // Show all non-consumed items
        filtered = filtered.filter(item => item.status !== 'consumed');
    }

    // Sort by expiry date (soonest first)
    filtered.sort((a, b) => {
      const daysA = getDaysUntilExpiry(a.expiryDate);
      const daysB = getDaysUntilExpiry(b.expiryDate);
      return daysA - daysB;
    });

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

  const stats = {
    total: items.filter(i => i.status !== 'consumed').length,
    expiring: items.filter(i => {
      const days = getDaysUntilExpiry(i.expiryDate);
      return i.status !== 'consumed' && days > 0 && days <= 7;
    }).length,
    expired: items.filter(i => i.status === 'expired' || getDaysUntilExpiry(i.expiryDate) < 0).length,
    saved: items.filter(i => i.status === 'consumed' && getDaysUntilExpiry(i.expiryDate) >= 0).length,
    wasted: items.filter(i => {
      const days = getDaysUntilExpiry(i.expiryDate);
      return i.status === 'expired' || (i.status === 'consumed' && days < 0);
    }).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-dark-bg transition-colors duration-300">
        <Navbar />
        <div className="container-custom py-20">
          <Loader size="lg" text="Loading waste management..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-dark-bg transition-colors duration-300">
      <Navbar />

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-dark-text mb-2">
            Waste Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-dark-text-secondary">
            Track, manage, and reduce food waste effectively
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
            <div className="text-center">
              <Package className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-dark-text">{stats.total}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Total Items</p>
            </div>
          </Card>
          <Card className="bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-dark-text">{stats.expiring}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Expiring Soon</p>
            </div>
          </Card>
          <Card className="bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800">
            <div className="text-center">
              <Trash2 className="w-8 h-8 text-danger mx-auto mb-2" />
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-dark-text">{stats.expired}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Expired</p>
            </div>
          </Card>
          <Card className="bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-dark-text">{stats.saved}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Items Saved</p>
            </div>
          </Card>
          <Card className="bg-neutral-100 dark:bg-neutral-dark-surface border-neutral-200 dark:border-neutral-dark-border">
            <div className="text-center">
              <TrendingDown className="w-8 h-8 text-neutral-600 dark:text-neutral-dark-text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-dark-text">{stats.wasted}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">Items Wasted</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Items', icon: Package },
                { value: 'expiring', label: 'Expiring', icon: AlertTriangle },
                { value: 'expired', label: 'Expired', icon: Trash2 },
                { value: 'saved', label: 'Saved', icon: CheckCircle },
                { value: 'wasted', label: 'Wasted', icon: TrendingDown }
              ].map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setFilterType(filter.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors duration-200 ${
                      filterType === filter.value
                        ? 'border-primary bg-primary-50 dark:bg-primary-900/20 text-primary dark:text-primary-400'
                        : 'border-neutral-300 dark:border-neutral-dark-border hover:border-neutral-400 dark:hover:border-neutral-dark-text-secondary text-neutral-700 dark:text-neutral-dark-text-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-neutral-300 dark:text-neutral-dark-text-muted mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-dark-text-secondary">
                  No items found. {filterType !== 'all' && 'Try changing the filter.'}
                </p>
              </div>
            </Card>
          ) : (
            filteredItems.map((item) => {
              const daysLeft = getDaysUntilExpiry(item.expiryDate);
              const isExpired = daysLeft < 0;
              const isExpiringSoon = daysLeft >= 0 && daysLeft <= 7;
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`${
                    isExpired ? 'border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-900/10' :
                    isExpiringSoon ? 'border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/10' :
                    ''
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-dark-text">
                            {item.name}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-600 dark:text-neutral-dark-text-secondary mb-4">
                          <div>
                            <span className="font-medium">Category:</span> {item.category}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                          </div>
                          <div>
                            <span className="font-medium">Expiry:</span> {formatDate(item.expiryDate)}
                          </div>
                          {item.estimatedPrice && (
                            <div>
                              <span className="font-medium">Price:</span> {formatCurrency(item.estimatedPrice)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          <span className={`text-sm font-medium ${
                            isExpired ? 'text-danger-600 dark:text-danger-400' :
                            isExpiringSoon ? 'text-warning-600 dark:text-warning-400' :
                            'text-neutral-600 dark:text-neutral-dark-text-secondary'
                          }`}>
                            {isExpired 
                              ? `Expired ${Math.abs(daysLeft)} day(s) ago`
                              : daysLeft === 0
                              ? 'Expires today!'
                              : daysLeft === 1
                              ? 'Expires tomorrow'
                              : `${daysLeft} days left`
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {item.status !== 'consumed' && (
                          <Button
                            size="sm"
                            variant="success"
                            icon={CheckCircle}
                            onClick={() => handleConsume(item._id)}
                          >
                            Mark Used
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
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteManagement;

