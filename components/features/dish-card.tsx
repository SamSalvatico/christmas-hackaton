'use client';

import { Card, CardHeader, CardBody, Tooltip } from '@heroui/react';
import type { Dish, SearchMode } from '@/lib/types/cultural-data';
import { getDishTypeColor } from '@/lib/utils/christmas-theme';

/**
 * Props for DishCard component
 */
export interface DishCardProps {
  /** The dish to display */
  dish: Dish;
  /** Category label for the dish */
  dishType: 'Entry' | 'Main Course' | 'Dessert';
  /** Optional CSS classes for additional styling */
  className?: string;
  /** Callback when dish name is clicked to view recipe */
  onRecipeClick?: (dishName: string, country: string) => void;
  /** Currently selected search mode */
  selectedMode?: SearchMode;
}

/**
 * Truncate ingredient list to first 8 items, adding "There's more!" if list exceeds 8
 * @param ingredients - Full list of ingredients
 * @returns Truncated list with "There's more!" message if applicable
 */
function truncateIngredients(ingredients: string[]): string[] {
  if (ingredients.length <= 8) {
    return ingredients;
  }
  return [...ingredients.slice(0, 8), "There's more!"];
}

/**
 * DishCard component
 * Displays individual dish information in a card format with Christmas-themed styling
 */
export function DishCard({
  dish,
  dishType,
  className,
  onRecipeClick,
}: DishCardProps) {
  const dishTypeColor = getDishTypeColor(
    dish.type || (dishType === 'Entry' ? 'entry' : dishType === 'Main Course' ? 'main' : 'dessert')
  );

  const truncatedIngredients = truncateIngredients(dish.ingredients);

  const handleDishNameClick = () => {
    if (onRecipeClick && dish.name) {
      // Pass only dish name, country will be handled by parent
      onRecipeClick(dish.name, '');
    }
  };

  return (
    <Card
      className={`card-font ${className || ''}`}
      style={{
        borderColor: dishTypeColor,
        borderWidth: '2px',
      }}
    >
      <CardHeader className="flex flex-col items-start gap-2">
        {onRecipeClick ? (
          <Tooltip
            content="View the recipe"
            classNames={{
              content: 'text-gray-900 bg-white',
            }}
          >
            <button
              onClick={handleDishNameClick}
              className="text-xl font-bold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
              style={{ color: dishTypeColor }}
              aria-label={`View recipe for ${dish.name}`}
            >
              {dish.name}
            </button>
          </Tooltip>
        ) : (
          <h3 className="text-xl font-bold" style={{ color: dishTypeColor }}>
            {dish.name}
          </h3>
        )}
        <p className="text-sm font-semibold text-gray-600">{dishType}</p>
      </CardHeader>
      <CardBody className="pt-0">
        <p className="text-gray-700 mb-4">{dish.description}</p>
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Ingredients:</h4>
          {truncatedIngredients.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {truncatedIngredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No ingredients listed</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

