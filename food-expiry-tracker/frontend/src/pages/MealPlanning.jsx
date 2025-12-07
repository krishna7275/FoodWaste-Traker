import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChefHat, Sparkles } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { itemsAPI, recipesAPI } from '../services/api';
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
      const ingredients = expiringItems.map(item => item.name);
      const response = await recipesAPI.generate(ingredients);
      
      // Create a week-long meal plan
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const recipes = response.data.recipes;
      const plan = weekDays.map((day, index) => ({
        day,
        meal: recipes[index % recipes.length],
      }));

      setMealPlan(plan);
      addToast('Weekly meal plan generated!', 'success');
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
            Weekly Meal Planner
          </h1>
          <p className="text-neutral-600">
            Plan your week using ingredients that need to be used up
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mealPlan.map((dayPlan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover>
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-neutral-900">
                        {dayPlan.day}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-neutral-900 flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-primary" />
                        {dayPlan.meal.title}
                      </h4>
                      <p className="text-sm text-neutral-600">
                        ⏱️ {dayPlan.meal.time_mins} minutes
                      </p>
                      <p className="text-sm text-neutral-600">
                        📊 {dayPlan.meal.difficulty}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        ♻️ {dayPlan.meal.waste_reduction_score}% waste reduced
                      </p>
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
