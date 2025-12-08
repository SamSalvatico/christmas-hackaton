'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { ChristmasSpinner } from '@/components/features/christmas-spinner';
import type { RecipeModalProps } from '@/lib/types/cultural-data';
import { christmasColors } from '@/lib/utils/christmas-theme';

/**
 * RecipeModal component
 * Displays recipe in a modal dialog with step-by-step navigation
 */
export function RecipeModal({
  isOpen,
  onClose,
  recipe,
  dishName,
  isLoading = false,
  error = null,
  onRetry,
}: RecipeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const previousRecipeRef = useRef<typeof recipe>(null);

  // Reset to first step when recipe changes
  useEffect(() => {
    if (recipe && recipe.steps && recipe.steps.length > 0) {
      // Only reset if recipe actually changed
      if (previousRecipeRef.current !== recipe) {
        previousRecipeRef.current = recipe;
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => setCurrentStep(0), 0);
      }
    }
  }, [recipe]);

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (recipe && recipe.steps && currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const currentRecipeStep =
    recipe && recipe.steps && recipe.steps.length > 0
      ? recipe.steps[currentStep]
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      aria-label={`Recipe for ${dishName}`}
    >
      <ModalContent>
        <ModalHeader>
          <h2
            className="text-2xl font-bold"
            style={{ color: christmasColors.darkGreen }}
          >
            Recipe: {dishName}
          </h2>
        </ModalHeader>
        <ModalBody>
          {isLoading && (
            <ChristmasSpinner message="Santa is finding the recipe..." />
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <p
                className="text-center text-gray-700 font-medium"
                style={{ color: christmasColors.darkRed }}
              >
                {error}
              </p>
              {onRetry && (
                <Button
                  onPress={onRetry}
                  color="primary"
                  style={{ backgroundColor: christmasColors.darkGreen }}
                >
                  Try Again
                </Button>
              )}
            </div>
          )}

          {recipe && !isLoading && !error && currentRecipeStep && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: christmasColors.darkGreen }}
                >
                  Step {currentRecipeStep.stepNumber} of {recipe.steps.length}
                </h3>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 text-base leading-relaxed">
                  {currentRecipeStep.instruction}
                </p>
                {currentRecipeStep.details && (
                  <p className="text-sm text-gray-600 italic mt-2">
                    {currentRecipeStep.details}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button
                  onPress={handlePreviousStep}
                  isDisabled={currentStep === 0}
                  variant="bordered"
                  style={{
                    borderColor: christmasColors.darkGreen,
                    color: christmasColors.darkGreen,
                  }}
                >
                  Previous Step
                </Button>
                <Button
                  onPress={handleNextStep}
                  isDisabled={currentStep === recipe.steps.length - 1}
                  style={{ backgroundColor: christmasColors.darkGreen }}
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {recipe && !isLoading && !error && (!recipe.steps || recipe.steps.length === 0) && (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-center text-gray-700 font-medium">
                No recipe steps available for this dish.
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            onPress={onClose}
            variant="bordered"
            style={{
              borderColor: christmasColors.darkGreen,
              color: christmasColors.darkGreen,
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

