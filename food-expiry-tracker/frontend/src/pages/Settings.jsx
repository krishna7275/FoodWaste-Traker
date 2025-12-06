import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Trash2, Save } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getUser } from '../utils/auth';
import { useToast } from '../components/ui/Toast';

const Settings = () => {
  const { addToast } = useToast();
  const user = getUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    reminderDays: [7, 3, 1],
    emailNotifications: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const handleProfileUpdate = () => {
    // TODO: Implement profile update API call
    addToast('Profile updated successfully!', 'success');
  };

  const handleNotificationUpdate = () => {
    // TODO: Implement notification settings update
    addToast('Notification settings updated!', 'success');
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
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container-custom py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Settings
          </h1>
          <p className="text-neutral-600">
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
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
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
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">
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
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-6">
                  {/* Enable Notifications */}
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900">Enable Notifications</p>
                      <p className="text-sm text-neutral-600">
                        Receive alerts about expiring items
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.enabled}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          enabled: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Reminder Days */}
                  <div>
                    <p className="font-medium text-neutral-900 mb-3">
                      Remind me when items expire in:
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 3, 7, 14].map((day) => (
                        <button
                          key={day}
                          onClick={() => toggleReminderDay(day)}
                          className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                            notificationSettings.reminderDays.includes(day)
                              ? 'border-primary bg-primary-50 text-primary-700'
                              : 'border-neutral-300 hover:border-neutral-400'
                          }`}
                        >
                          {day} day{day !== 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900">Email Notifications</p>
                      <p className="text-sm text-neutral-600">
                        Receive daily email summaries
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <Button
                    variant="primary"
                    icon={Save}
                    onClick={handleNotificationUpdate}
                  >
                    Save Preferences
                  </Button>
                </div>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                  Security Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <Input label="Current Password" type="password" />
                      <Input label="New Password" type="password" />
                      <Input label="Confirm New Password" type="password" />
                      <Button variant="primary">Update Password</Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-200">
                    <h3 className="font-medium text-neutral-900 mb-4 text-danger-600">
                      Danger Zone
                    </h3>
                    <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                      <p className="text-sm text-danger-800 mb-4">
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