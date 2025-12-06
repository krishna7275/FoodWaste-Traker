import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Clock, TrendingUp, Sparkles } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import RecipeModal from '../components/RecipeModal';
import { itemsAPI, recipesAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';

const Recipes = () => {
  const { addToast } = useToast();
  const [expiringItems, setExpiringItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    fetchExpiringItems();
  }, []);

  const fetchExpiringItems = async () => {
    try {
      const response = await itemsAPI.getExpiring(14);
      setExpiringItems(response.data.items);
    } catch (error) {
      console.error('Error fetching items:', error);
      addToast('Failed to load items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemSelection = (itemName) => {
    setSelectedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(i => i !== itemName)
        : [...prev, itemName]
    );
  };

  const handleGenerateRecipes = async () => {
    if (selectedItems.length === 0) {
      addToast('Please select at least one ingredient', 'warning');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await recipesAPI.generate(selectedItems);
      setRecipes(response.data.recipes);
      addToast('Recipes generated successfully!', 'success');
    } catch (error) {
      console.error('Recipe generation error:', error);
      addToast(error.response?.data?.error || 'Failed to generate recipes', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container-custom py-20">
          <Loader size="lg" text="Loading ingredients..." />
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
            AI Recipe Generator
          </h1>
          <p className="text-neutral-600">
            Select ingredients and let AI create delicious recipes to reduce waste
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Ingredient Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Select Ingredients
              </h2>

              {expiringItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-600">No items expiring soon</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                    {expiringItems.map((item) => (
                      <label
                        key={item._id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedItems.includes(item.name)
                            ? 'bg-primary-50 border-2 border-primary-400'
                            : 'bg-neutral-50 border-2 border-transparent hover:bg-neutral-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.name)}
                          onChange={() => toggleItemSelection(item.name)}
                          className="w-5 h-5 text-primary focus:ring-primary-400 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{item.name}</p>
                          <p className="text-xs text-neutral-600">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    icon={Sparkles}
                    onClick={handleGenerateRecipes}
                    disabled={isGenerating || selectedItems.length === 0}
                    className="w-full"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Recipes'}
                  </Button>

                  {selectedItems.length > 0 && (
                    <p className="text-sm text-neutral-600 mt-3 text-center">
                      {selectedItems.length} ingredient{selectedItems.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </>
              )}
            </Card>
          </motion.div>

          {/* Right: Generated Recipes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {isGenerating ? (
              <Card className="py-20">
                <Loader size="lg" text="AI is generating your recipes..." />
              </Card>
            ) : recipes.length === 0 ? (
              <Card className="text-center py-20">
                <ChefHat className="w-20 h-20 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  No Recipes Yet
                </h3>
                <p className="text-neutral-600">
                  Select ingredients and click "Generate Recipes" to get AI-powered suggestions
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Your Recipes
                  </h2>
                  <span className="text-sm text-neutral-600">
                    {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {recipes.map((recipe, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card hover onClick={() => setSelectedRecipe(recipe)}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                              {recipe.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-neutral-600">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {recipe.time_mins} mins
                              </span>
                              <span>•</span>
                              <span>{recipe.difficulty}</span>
                              {recipe.waste_reduction_score && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center text-success-600">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    {recipe.waste_reduction_score}% waste reduction
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChefHat className="w-8 h-8 text-primary-400" />
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-neutral-700 mb-2">
                            Uses ingredients:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recipe.uses?.map((ingredient, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-success-100 text-success-700 rounded-full text-xs font-medium"
                              >
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecipe(recipe);
                          }}
                        >
                          View Full Recipe
                        </Button>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Recipe Detail Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
};

export default Recipes;