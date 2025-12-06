import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle, TrendingUp, Plus, ChefHat } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { itemsAPI } from '../services/api';
import { formatDate, getDaysUntilExpiry, getStatusColor } from '../utils/auth';
import { useToast } from '../components/ui/Toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [expiringItems, setExpiringItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, expiringRes] = await Promise.all([
        itemsAPI.getStats(),
        itemsAPI.getExpiring(7)
      ]);

      setStats(statsRes.data);
      setExpiringItems(expiringRes.data.items);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsumeItem = async (itemId) => {
    try {
      await itemsAPI.consume(itemId);
      addToast('Item marked as consumed!', 'success');
      fetchDashboardData();
    } catch (error) {
      addToast('Failed to update item', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container-custom py-20">
          <Loader size="lg" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Items',
      value: stats?.totalItems || 0,
      icon: Package,
      color: 'bg-primary-50 text-primary-600',
      trend: null,
    },
    {
      title: 'Expiring Soon',
      value: stats?.expiringItems || 0,
      icon: AlertTriangle,
      color: 'bg-warning-50 text-warning-600',
      trend: null,
    },
    {
      title: 'Items Saved',
      value: stats?.itemsSaved || 0,
      icon: CheckCircle,
      color: 'bg-success-50 text-success-600',
      trend: '+' + ((stats?.itemsSaved || 0) - (stats?.itemsWasted || 0)),
    },
    {
      title: 'Money Saved',
      value: `$${stats?.moneySaved || 0}`,
      icon: TrendingUp,
      color: 'bg-success-50 text-success-600',
      trend: null,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Dashboard
          </h1>
          <p className="text-neutral-600">
            Welcome back! Here's an overview of your food inventory.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-neutral-900">
                      {stat.value}
                    </p>
                    {stat.trend && (
                      <p className="text-sm text-success-600 mt-1">
                        {stat.trend} this month
                      </p>
                    )}
                  </div>
                  <div className={`p-4 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => navigate('/add')}
                className="w-full"
              >
                Add New Item
              </Button>
              <Button
                variant="secondary"
                icon={Package}
                onClick={() => navigate('/items')}
                className="w-full"
              >
                View All Items
              </Button>
              <Button
                variant="success"
                icon={ChefHat}
                onClick={() => navigate('/recipes')}
                className="w-full"
              >
                Get Recipes
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Expiring Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                Expiring Soon (Next 7 Days)
              </h2>
              <span className="text-sm text-neutral-600">
                {expiringItems.length} item{expiringItems.length !== 1 ? 's' : ''}
              </span>
            </div>

            {expiringItems.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-success-400 mx-auto mb-4" />
                <p className="text-neutral-600">
                  Great! No items expiring in the next 7 days.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiringItems.map((item) => {
                  const daysLeft = getDaysUntilExpiry(item.expiryDate);
                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900">
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-neutral-600">
                            {item.quantity} {item.unit}
                          </span>
                          <span className="text-sm text-neutral-400">•</span>
                          <span className="text-sm text-neutral-600">
                            {item.category}
                          </span>
                          <span className="text-sm text-neutral-400">•</span>
                          <span
                            className={`text-sm font-medium ${
                              daysLeft === 0
                                ? 'text-danger-600'
                                : daysLeft <= 3
                                ? 'text-warning-600'
                                : 'text-neutral-600'
                            }`}
                          >
                            {daysLeft === 0
                              ? 'Expires today'
                              : daysLeft === 1
                              ? 'Expires tomorrow'
                              : `${daysLeft} days left`}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleConsumeItem(item._id)}
                      >
                        Used It
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Environmental Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-success-50 to-primary-50 border-success-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Your Environmental Impact
                </h3>
                <p className="text-neutral-600 mb-4">
                  By using FreshTrack, you've prevented approximately{' '}
                  <span className="font-bold text-success-600">
                    {Math.round((stats?.itemsSaved || 0) * 0.5)} kg
                  </span>{' '}
                  of CO₂ emissions! 🌍
                </p>
                <p className="text-sm text-neutral-500">
                  Keep up the great work reducing food waste!
                </p>
              </div>
              <div className="text-6xl">🌱</div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;