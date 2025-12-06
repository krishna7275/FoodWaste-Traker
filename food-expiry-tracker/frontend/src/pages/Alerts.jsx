import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { itemsAPI } from '../services/api';
import { formatDate, getDaysUntilExpiry, formatCurrency } from '../utils/auth';
import { useToast } from '../components/ui/Toast';

const Alerts = () => {
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      // Get expiring items as alerts
      const response = await itemsAPI.getExpiring(14);
      const items = response.data.items;
      
      // Convert items to alert format
      const alertData = items.map(item => {
        const daysLeft = getDaysUntilExpiry(item.expiryDate);
        let type, priority, message;

        if (daysLeft < 0) {
          type = 'expired';
          priority = 'high';
          message = `${item.name} expired ${Math.abs(daysLeft)} day(s) ago`;
        } else if (daysLeft === 0) {
          type = 'expiring_today';
          priority = 'high';
          message = `${item.name} expires today!`;
        } else if (daysLeft === 1) {
          type = 'expiring_soon';
          priority = 'high';
          message = `${item.name} expires tomorrow`;
        } else if (daysLeft <= 3) {
          type = 'expiring_soon';
          priority = 'medium';
          message = `${item.name} expires in ${daysLeft} days`;
        } else {
          type = 'reminder';
          priority = 'low';
          message = `${item.name} expires in ${daysLeft} days`;
        }

        return {
          id: item._id,
          itemId: item._id,
          type,
          priority,
          message,
          item,
          daysLeft,
          createdAt: new Date()
        };
      });

      // Sort by priority and days left
      alertData.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.daysLeft - b.daysLeft;
      });

      setAlerts(alertData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      addToast('Failed to load alerts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await itemsAPI.consume(alertId);
      addToast('Alert dismissed!', 'success');
      fetchAlerts();
    } catch (error) {
      addToast('Failed to dismiss alert', 'error');
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-danger-600" />;
      case 'expiring_today':
      case 'expiring_soon':
        return <Bell className="w-5 h-5 text-warning-600" />;
      default:
        return <Info className="w-5 h-5 text-primary-600" />;
    }
  };

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-danger-500 bg-danger-50';
      case 'medium':
        return 'border-l-4 border-warning-500 bg-warning-50';
      default:
        return 'border-l-4 border-primary-500 bg-primary-50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container-custom py-20">
          <Loader size="lg" text="Loading alerts..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container-custom py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Alerts & Notifications
          </h1>
          <p className="text-neutral-600">
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center py-20">
              <CheckCircle className="w-20 h-20 text-success-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                All Clear!
              </h3>
              <p className="text-neutral-600">
                No urgent alerts at the moment. Keep up the great work!
              </p>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${getAlertColor(alert.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {alert.message}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-neutral-600">
                          <span>{alert.item.category}</span>
                          <span>•</span>
                          <span>{alert.item.quantity} {alert.item.unit}</span>
                          <span>•</span>
                          <span>Expires: {formatDate(alert.item.expiryDate)}</span>
                        </div>
                        {alert.item.estimatedPrice && (
                          <p className="text-sm text-neutral-600 mt-2">
                            Estimated value: <span className="font-medium">{formatCurrency(alert.item.estimatedPrice)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleDismiss(alert.itemId)}
                      >
                        Mark as Used
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-primary-50 to-success-50">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-danger-600">
                  {alerts.filter(a => a.priority === 'high').length}
                </p>
                <p className="text-sm text-neutral-600 mt-1">High Priority</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-warning-600">
                  {alerts.filter(a => a.priority === 'medium').length}
                </p>
                <p className="text-sm text-neutral-600 mt-1">Medium Priority</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary-600">
                  {alerts.filter(a => a.priority === 'low').length}
                </p>
                <p className="text-sm text-neutral-600 mt-1">Low Priority</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Alerts;