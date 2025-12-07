'use client';

import { useState, useEffect, useMemo } from 'react';
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete';
import { Spinner } from '@heroui/spinner';
import type { CountriesList, CountriesApiResponse } from '@/lib/types/countries';

/**
 * Props for CountryDropdown component
 */
interface CountryDropdownProps {
  /**
   * Callback function called when a country is selected or deselected
   * @param country - Selected country name, or null if no country is selected
   */
  onCountrySelect?: (country: string | null) => void;
}

/**
 * CountryDropdown component with search functionality
 * Fetches countries from /api/countries and displays them in a searchable autocomplete
 * HeroUI Autocomplete provides built-in search functionality with case-insensitive matching
 */
export function CountryDropdown({ onCountrySelect }: CountryDropdownProps) {
  const [countries, setCountries] = useState<CountriesList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/countries');
        const result: CountriesApiResponse = await response.json();

        if (result.success && result.data) {
          setCountries(result.data);
        } else if (!result.success && 'error' in result) {
          setError(
            result.error.message ||
              'Unable to load countries. Please try again later.'
          );
        } else {
          setError('Unable to load countries. Please try again later.');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load countries. Please try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Convert countries to objects for HeroUI Autocomplete
  const countryItems = useMemo(() => {
    return countries.map((country) => ({ key: country, label: country }));
  }, [countries]);

  // Handle country selection
  const handleSelectionChange = (key: string | number | null) => {
    if (key === null) {
      setSelectedCountry(null);
      setInputValue('');
      onCountrySelect?.(null);
    } else {
      const selected = key as string;
      setSelectedCountry(selected);
      setInputValue(selected);
      onCountrySelect?.(selected);
    }
  };

  // Handle input value change (for search)
  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Clear selection if user is typing a new search
    if (value !== selectedCountry) {
      setSelectedCountry(null);
      onCountrySelect?.(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-gray-600">Loading countries...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    );
  }

  // Normal state with countries - HeroUI Autocomplete has built-in search
  return (
    <Autocomplete
      label="Select a Country"
      placeholder="Search for a country to discover its Christmas traditions..."
      selectedKey={selectedCountry}
      allowsCustomValue={false}
      items={countryItems}
      onSelectionChange={handleSelectionChange}
      onInputChange={handleInputChange}
      size="lg"
    >
      {(item) => (
        <AutocompleteItem key={item.key}>
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}

