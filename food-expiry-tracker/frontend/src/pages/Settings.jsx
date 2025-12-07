import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Trash2, Save, Mail, MessageCircle, Send } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getUser } from '../utils/auth';
import { useToast } from '../components/ui/Toast';
import { notificationsAPI } from '../services/api';
import Loader from '../components/ui/Loader';

const Settings = () => {
  const { addToast } = useToast();
  const user = getUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    notificationsEnabled: true,
    emailNotifications: true,
    whatsappNotifications: false,
    reminderDays: [7, 3, 1],
    phoneNumber: ''
  });

  useEffect(() => {
    fetchNotificationPreferences();
  }, []);

  const fetchNotificationPreferences = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getPreferences();
      setNotificationSettings({
        notificationsEnabled: res.data.notificationsEnabled ?? true,
        emailNotifications: res.data.emailNotifications ?? true,
        whatsappNotifications: res.data.whatsappNotifications ?? false,
        reminderDays: res.data.reminderDays || [7, 3, 1],
        phoneNumber: res.data.phoneNumber || ''
      });
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const handleProfileUpdate = () => {
    // TODO: Implement profile update API call
    addToast('Profile updated successfully!', 'success');
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);
      await notificationsAPI.updatePreferences({
        notificationsEnabled: notificationSettings.notificationsEnabled,
        emailNotifications: notificationSettings.emailNotifications,
        whatsappNotifications: notificationSettings.whatsappNotifications,
        reminderDays: notificationSettings.reminderDays,
        phoneNumber: notificationSettings.phoneNumber
      });
      addToast('Notification settings updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      addToast('Failed to update notification settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestingEmail(true);
      const res = await notificationsAPI.testEmail();
      addToast('Test email sent! Check your inbox.', 'success');
    } catch (error) {
      console.error('Error sending test email:', error);
      addToast(error.response?.data?.error || 'Failed to send test email', 'error');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestWhatsApp = async () => {
    try {
      if (!notificationSettings.phoneNumber) {
        addToast('Please enter your phone number first', 'error');
        return;
      }
      setTestingWhatsApp(true);
      const res = await notificationsAPI.testWhatsApp();
      addToast('Test WhatsApp message sent! Check your phone.', 'success');
    } catch (error) {
      console.error('Error sending test WhatsApp:', error);
      addToast(error.response?.data?.error || 'Failed to send test WhatsApp', 'error');
    } finally {
      setTestingWhatsApp(false);
    }
  };

  const toggleReminderDay = (day) => {
    setNotificationSettings(prev => ({
      ...prev,
      reminderDays: prev.reminderDays.includes(day)
        ? prev.reminderDays.filter(d => d !== day)
        : [...prev.reminderDays, day].sort((a, b) => b - a)
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-dark-bg transition-colors duration-300">
      <Navbar />

      <div className="container-custom py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-dark-text mb-2">
            Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-dark-text-secondary">
            Manage your account preferences and notifications
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary text-white dark:bg-primary-600'
                          : 'text-neutral-700 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-dark-text mb-6">
                  Profile Information
                </h2>
                <div className="space-y-6">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                  <Button
                    variant="primary"
                    icon={Save}
                    onClick={handleProfileUpdate}
                  >
                    Save Changes
                  </Button>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-dark-text mb-6">
                  Notification Preferences
                </h2>
                {loading && !notificationSettings.phoneNumber ? (
                  <Loader text="Loading preferences..." />
                ) : (
                  <div className="space-y-6">
                    {/* Enable Notifications */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-dark-surface rounded-lg border dark:border-neutral-dark-border">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-dark-text">Enable Notifications</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">
                          Receive alerts about expiring items
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.notificationsEnabled}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            notificationsEnabled: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-dark-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-dark-surface rounded-lg border dark:border-neutral-dark-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-5 h-5 text-primary" />
                          <p className="font-medium text-neutral-900 dark:text-neutral-dark-text">Email Notifications</p>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">
                          Receive email alerts when items are about to expire
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            disabled={!notificationSettings.notificationsEnabled}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-dark-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
                        </label>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Send}
                          onClick={handleTestEmail}
                          disabled={!notificationSettings.emailNotifications || testingEmail}
                        >
                          {testingEmail ? 'Sending...' : 'Test'}
                        </Button>
                      </div>
                    </div>

                    {/* WhatsApp Notifications */}
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-dark-surface rounded-lg border dark:border-neutral-dark-border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageCircle className="w-5 h-5 text-success" />
                            <p className="font-medium text-neutral-900 dark:text-neutral-dark-text">WhatsApp Notifications</p>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-dark-text-secondary">
                            Receive WhatsApp alerts when items are about to expire
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.whatsappNotifications}
                            disabled={!notificationSettings.notificationsEnabled}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              whatsappNotifications: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-dark-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success peer-disabled:opacity-50"></div>
                        </label>
                      </div>
                      <div className="mt-4">
                        <Input
                          label="Phone Number (with country code)"
                          placeholder="+1234567890 or +919876543210"
                          value={notificationSettings.phoneNumber}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            phoneNumber: e.target.value
                          })}
                          disabled={!notificationSettings.whatsappNotifications}
                          className="mb-3"
                        />
                        <Button
                          size="sm"
                          variant="success"
                          icon={Send}
                          onClick={handleTestWhatsApp}
                          disabled={!notificationSettings.whatsappNotifications || !notificationSettings.phoneNumber || testingWhatsApp}
                        >
                          {testingWhatsApp ? 'Sending...' : 'Test WhatsApp'}
                        </Button>
                        <p className="text-xs text-neutral-500 dark:text-neutral-dark-text-muted mt-2">
                          Format: +[country code][number], e.g., +1234567890 or +919876543210
                        </p>
                      </div>
                    </div>

                    {/* Reminder Days */}
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-dark-text mb-3">
                        Remind me when items expire in:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[1, 3, 7, 14].map((day) => (
                          <button
                            key={day}
                            onClick={() => toggleReminderDay(day)}
                            disabled={!notificationSettings.notificationsEnabled}
                            className={`px-4 py-3 rounded-lg border-2 transition-colors duration-200 ${
                              notificationSettings.reminderDays.includes(day)
                                ? 'border-primary bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                : 'border-neutral-300 dark:border-neutral-dark-border hover:border-neutral-400 dark:hover:border-neutral-dark-text-secondary text-neutral-700 dark:text-neutral-dark-text-secondary'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {day} day{day !== 1 ? 's' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      icon={Save}
                      onClick={handleNotificationUpdate}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-dark-text mb-6">
                  Security Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-dark-text mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <Input label="Current Password" type="password" />
                      <Input label="New Password" type="password" />
                      <Input label="Confirm New Password" type="password" />
                      <Button variant="primary">Update Password</Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-200 dark:border-neutral-dark-border">
                    <h3 className="font-medium text-neutral-900 dark:text-danger-400 mb-4 text-danger-600">
                      Danger Zone
                    </h3>
                    <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
                      <p className="text-sm text-danger-800 dark:text-danger-300 mb-4">
                        Deleting your account will permanently remove all your data including
                        items, recipes, and statistics. This action cannot be undone.
                      </p>
                      <Button variant="danger" icon={Trash2}>
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
