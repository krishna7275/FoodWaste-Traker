import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Leaf, 
  Droplet, 
  Utensils, 
  TreePine, 
  DollarSign,
  Download,
  Share2,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import { analyticsAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, insightsRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getInsights()
      ]);
      setData(overviewRes.data);
      setInsights(insightsRes.data.insights || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      addToast('Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    
    const report = {
      generatedAt: new Date().toISOString(),
      overview: data.overview,
      environmentalImpact: data.environmentalImpact,
      trends: {
        last30Days: data.trends.last30Days,
        last7Days: data.trends.last7Days
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `food-waste-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Report exported successfully!', 'success');
  };

  const handleShare = async () => {
    if (!data) return;
    
    const shareText = `🌱 My Food Waste Reduction Impact:\n\n` +
      `✅ Items Saved: ${data.overview.itemsSaved}\n` +
      `💰 Money Saved: ₹${data.overview.moneySaved.toFixed(2)}\n` +
      `🌍 CO₂ Saved: ${data.environmentalImpact.co2Saved} kg\n` +
      `💧 Water Saved: ${data.environmentalImpact.waterSaved}L\n` +
      `🍽️ Meals Equivalent: ${data.environmentalImpact.mealsEquivalent}\n\n` +
      `Join me in reducing food waste! #FoodWasteReduction #EcoFriendly`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Food Waste Impact',
          text: shareText
        });
        addToast('Shared successfully!', 'success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(shareText);
          addToast('Copied to clipboard!', 'success');
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      addToast('Copied to clipboard!', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container-custom py-20">
          <Loader size="lg" text="Loading analytics..." />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container-custom py-8">
          <Card>
            <p className="text-neutral-600">No analytics data available yet.</p>
          </Card>
        </div>
      </div>
    );
  }

  const categoryData = Object.entries(data.breakdown.byCategory).map(([name, value]) => ({
    name,
    value
  }));

  const statusData = Object.entries(data.breakdown.byStatus).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  }));

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning': return AlertCircle;
      case 'success': return CheckCircle;
      case 'info': return Info;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning': return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'success': return 'text-success-600 bg-success-50 border-success-200';
      case 'info': return 'text-primary-600 bg-primary-50 border-primary-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-dark-bg transition-colors duration-300">
      <Navbar />

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-dark-text mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-neutral-600 dark:text-neutral-dark-text-secondary">
              Track your food waste reduction impact and trends
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-dark-surface hover:bg-neutral-200 dark:hover:bg-neutral-dark-surface-hover text-neutral-700 dark:text-neutral-dark-text-secondary rounded-lg flex items-center gap-2 transition-colors duration-200 border dark:border-neutral-dark-border"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md dark:shadow-black/30"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </motion.div>

        {/* Environmental Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-success-700 mb-1">CO₂ Saved</p>
                  <p className="text-3xl font-bold text-success-900">
                    {data.environmentalImpact.co2Saved} kg
                  </p>
                  <p className="text-xs text-success-600 mt-1">
                    ≈ {data.environmentalImpact.treesEquivalent} trees
                  </p>
                </div>
                <Leaf className="w-12 h-12 text-success-600" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-700 mb-1">Water Saved</p>
                  <p className="text-3xl font-bold text-primary-900">
                    {data.environmentalImpact.waterSaved}L
                  </p>
                  <p className="text-xs text-primary-600 mt-1">Liters</p>
                </div>
                <Droplet className="w-12 h-12 text-primary-600" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warning-700 mb-1">Meals Equivalent</p>
                  <p className="text-3xl font-bold text-warning-900">
                    {data.environmentalImpact.mealsEquivalent}
                  </p>
                  <p className="text-xs text-warning-600 mt-1">Approximate meals</p>
                </div>
                <Utensils className="w-12 h-12 text-warning-600" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Money Saved</p>
                  <p className="text-3xl font-bold text-purple-900">
                    ₹{data.overview.moneySaved.toFixed(2)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Total savings</p>
                </div>
                <DollarSign className="w-12 h-12 text-purple-600" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Smart Insights
              </h2>
              <div className="space-y-3">
                {insights.map((insight, index) => {
                  const Icon = getInsightIcon(insight.type);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{insight.title}</h3>
                          <p className="text-sm opacity-90">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                30-Day Activity Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trends.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="itemsAdded" 
                    stroke="#3b82f6" 
                    name="Items Added"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="itemsConsumed" 
                    stroke="#10b981" 
                    name="Items Consumed"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Items by Category
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Items by Status
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Performance Overview
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Waste Reduction Rate</span>
                    <span className="text-sm font-bold text-success-600">
                      {data.overview.wasteReductionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div
                      className="bg-success-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${data.overview.wasteReductionRate}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600 mb-1">Items Saved</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {data.overview.itemsSaved}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600 mb-1">Items Wasted</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {data.overview.itemsWasted}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600 mb-1">Last 30 Days</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {data.trends.last30Days.itemsAdded}
                    </p>
                    <p className="text-xs text-success-600 mt-1">
                      +{data.trends.last30Days.growth}% growth
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600 mb-1">Last 7 Days</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {data.trends.last7Days.itemsAdded}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

