'use client';

import { Select, SelectItem } from '@heroui/react';
import type { SearchMode } from '@/lib/types/cultural-data';
import type { Selection } from '@heroui/react';

/**
 * Props for SearchModeSelector component
 */
export interface SearchModeSelectorProps {
  /**
   * Currently selected mode
   */
  selectedMode: SearchMode;
  /**
   * Callback function called when the mode selection changes
   * @param mode - The selected search mode
   */
  onModeChange: (mode: SearchMode) => void;
}

/**
 * SearchModeSelector component
 * Displays a dropdown selector for choosing between "Fast search" and "Detective Santa" response modes
 * Default selection is "Fast search" mode
 */
export function SearchModeSelector({
  selectedMode,
  onModeChange,
}: SearchModeSelectorProps) {
  const handleSelectionChange = (keys: Selection) => {
    if (keys === 'all' || (typeof keys === 'object' && keys.size === 0)) {
      // Default to 'fast' if nothing selected
      onModeChange('fast');
    } else if (typeof keys === 'object') {
      const selected = Array.from(keys)[0] as SearchMode;
      onModeChange(selected);
    }
  };

  return (
    <Select
      label="Santa Search Mode"
      selectedKeys={selectedMode ? new Set([selectedMode]) : new Set(['fast'])}
      onSelectionChange={handleSelectionChange}
      defaultSelectedKeys={['fast']}
      size="lg"
      classNames={{
        listbox: 'text-gray-900 bg-white',
        popoverContent: 'bg-white',
      }}
    >
      <SelectItem
        key="fast"
        className="text-gray-900 data-[hover=true]:bg-gray-100 data-[focus=true]:bg-gray-100"
      >
        Fast search
      </SelectItem>
      <SelectItem
        key="detailed"
        className="text-gray-900 data-[hover=true]:bg-gray-100 data-[focus=true]:bg-gray-100"
      >
        Detective Santa
      </SelectItem>
    </Select>
  );
}

