import React from 'react';
import { Clock, TrendingUp, ChefHat } from 'lucide-react';
import Modal from './ui/Modal';

const RecipeModal = ({ recipe, isOpen, onClose }) => {
  if (!recipe) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recipe.title} size="lg">
      <div className="space-y-6">
        {/* Recipe Info */}
        <div className="flex items-center space-x-6 pb-6 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-neutral-600" />
            <span className="text-neutral-900 font-medium">
              {recipe.time_mins} minutes
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-neutral-600" />
            <span className="text-neutral-900 font-medium">
              {recipe.difficulty}
            </span>
          </div>
          {recipe.waste_reduction_score && (
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-success-600" />
              <span className="text-success-600 font-medium">
                {recipe.waste_reduction_score}% waste reduction
              </span>
            </div>
          )}
        </div>

        {/* Uses Ingredients */}
        {recipe.uses && recipe.uses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              Uses Your Ingredients
            </h3>
            <div className="flex flex-wrap gap-2">
              {recipe.uses.map((ingredient, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-success-100 text-success-700 rounded-full text-sm font-medium"
                >
                  ✓ {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Ingredients
          </h3>
          <ul className="space-y-2">
            {recipe.ingredients?.map((ingredient, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 text-neutral-700"
              >
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Instructions
          </h3>
          <ol className="space-y-4">
            {recipe.steps?.map((step, index) => (
              <li key={index} className="flex space-x-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </span>
                <p className="text-neutral-700 pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Waste Reduction Message */}
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <p className="text-success-800 text-sm">
            <strong>🌱 Eco Impact:</strong> By making this recipe, you're helping reduce
            food waste and save money! Keep up the great work.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default RecipeModal;