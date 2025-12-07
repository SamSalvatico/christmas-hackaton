'use client';

import { useState, useEffect, useMemo } from 'react';
import { Select, SelectItem, Spinner } from '@heroui/react';
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
 * Fetches countries from /api/countries and displays them in a searchable dropdown
 * HeroUI Select has built-in search functionality with case-insensitive matching
 */
export function CountryDropdown({ onCountrySelect }: CountryDropdownProps) {
  const [countries, setCountries] = useState<CountriesList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

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

  // Convert countries to objects for HeroUI Select
  const countryItems = useMemo(() => {
    return countries.map((country) => ({ key: country, label: country }));
  }, [countries]);

  // Handle country selection
  const handleSelectionChange = (keys: 'all' | Set<string | number>) => {
    if (keys === 'all' || keys.size === 0) {
      setSelectedCountry(null);
      onCountrySelect?.(null);
    } else {
      const selected = Array.from(keys)[0] as string;
      setSelectedCountry(selected);
      onCountrySelect?.(selected);
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

  // Normal state with countries - HeroUI Select has built-in search
  return (
    <Select
      label="Select Country"
      placeholder="Search countries..."
      selectedKeys={selectedCountry ? new Set([selectedCountry]) : new Set()}
      onSelectionChange={handleSelectionChange}
      selectionMode="single"
      isClearable={true}
      items={countryItems}
    >
      {(item) => (
        <SelectItem key={item.key}>
          {item.label}
        </SelectItem>
      )}
    </Select>
  );
}

