'use client';

import { Button } from '@heroui/react';

/**
 * Props for SantaSearchButton component
 */
interface SantaSearchButtonProps {
  /**
   * Currently selected country name, or null if no country is selected
   */
  selectedCountry: string | null;
  /**
   * Optional callback function called when the button is clicked
   * @param country - The selected country name
   */
  onSearch?: (country: string) => void;
}

/**
 * SantaSearchButton component
 * Displays a "Santa Search" button that is enabled only when a country is selected
 * When clicked, logs the selected country to console (placeholder for future functionality)
 */
export function SantaSearchButton({
  selectedCountry,
  onSearch,
}: SantaSearchButtonProps) {
  const handleClick = () => {
    if (selectedCountry) {
      // Log to console as placeholder for future functionality
      console.log('Santa Search clicked for country:', selectedCountry);
      onSearch?.(selectedCountry);
    }
  };

  return (
    <Button
      color="primary"
      size="lg"
      isDisabled={!selectedCountry}
      onPress={handleClick}
    >
      Santa Search
    </Button>
  );
}

