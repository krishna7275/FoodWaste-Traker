import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChefHat, Sparkles } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { itemsAPI, mealPlanningAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';

const MealPlanning = () => {
  const { addToast } = useToast();
  const [expiringItems, setExpiringItems] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchExpiringItems();
  }, []);

  const fetchExpiringItems = async () => {
    try {
      const response = await itemsAPI.getExpiring(7);
      setExpiringItems(response.data.items);
    } catch (error) {
      console.error('Error fetching items:', error);
      addToast('Failed to load items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMealPlan = async () => {
    if (expiringItems.length === 0) {
      addToast('No expiring items to plan meals for', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await mealPlanningAPI.suggest(7);
      setMealPlan(response.data.plan || []);
      addToast(response.data.message || 'Meal plan generated!', 'success');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      addToast('Failed to generate meal plan', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container-custom py-20">
          <Loader size="lg" text="Loading meal planning..." />
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
            AI-Powered Meal Planner
          </h1>
          <p className="text-neutral-600 dark:text-neutral-dark-text-secondary">
            Get personalized meal plans using AI to reduce food waste
          </p>
        </motion.div>

        {/* Expiring Items Summary */}
        {expiringItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Items Expiring This Week
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {expiringItems.map((item) => (
                  <span
                    key={item._id}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <Button
                variant="primary"
                icon={Sparkles}
                onClick={generateMealPlan}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating Plan...' : 'Generate Weekly Plan'}
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Meal Plan */}
        {mealPlan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
              {mealPlan.map((dayPlan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-dark-border">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-dark-text">
                        Day {dayPlan.day}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {dayPlan.meals && (
                        <>
                          {dayPlan.meals.breakfast && (
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-dark-surface rounded">
                              <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-dark-text mb-1">
                                🍳 Breakfast
                              </h4>
                              <p className="text-xs text-neutral-600 dark:text-neutral-dark-text-secondary">
                                {dayPlan.meals.breakfast.name}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-dark-text-muted">
                                {dayPlan.meals.breakfast.time}
                              </p>
                            </div>
                          )}
                          {dayPlan.meals.lunch && (
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-dark-surface rounded">
                              <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-dark-text mb-1">
                                🥗 Lunch
                              </h4>
                              <p className="text-xs text-neutral-600 dark:text-neutral-dark-text-secondary">
                                {dayPlan.meals.lunch.name}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-dark-text-muted">
                                {dayPlan.meals.lunch.time}
                              </p>
                            </div>
                          )}
                          {dayPlan.meals.dinner && (
                            <div className="p-2 bg-neutral-50 dark:bg-neutral-dark-surface rounded">
                              <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-dark-text mb-1">
                                🍽️ Dinner
                              </h4>
                              <p className="text-xs text-neutral-600 dark:text-neutral-dark-text-secondary">
                                {dayPlan.meals.dinner.name}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-dark-text-muted">
                                {dayPlan.meals.dinner.time}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      {dayPlan.priorityItems && dayPlan.priorityItems.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-dark-border">
                          <p className="text-xs font-medium text-warning mb-1">Priority Items:</p>
                          <div className="flex flex-wrap gap-1">
                            {dayPlan.priorityItems.map((item, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400 rounded">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {mealPlan.length === 0 && expiringItems.length === 0 && (
          <Card className="text-center py-20">
            <Calendar className="w-20 h-20 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No Items to Plan
            </h3>
            <p className="text-neutral-600">
              Add items to your inventory to get meal planning suggestions
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MealPlanning;
