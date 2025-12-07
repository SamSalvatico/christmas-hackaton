'use client';

import { Spinner } from '@heroui/spinner';
import { christmasColors } from '@/lib/utils/christmas-theme';

/**
 * Props for ChristmasSpinner component
 */
export interface ChristmasSpinnerProps {
  /** Loading message to display (default: "Santa is searching for Christmas traditions...") */
  message?: string;
  /** Spinner size (default: "lg") */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ChristmasSpinner component
 * Displays a Christmas-themed loading spinner with festive message
 */
export function ChristmasSpinner({
  message = "Santa is searching for Christmas traditions...",
  size = 'lg',
}: ChristmasSpinnerProps) {
  // Use default message if empty string provided
  const displayMessage = message || "Santa is searching for Christmas traditions...";

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <Spinner
        size={size}
        color="primary"
        className="text-red-600"
        style={{
          color: christmasColors.red,
        }}
        aria-label="Loading Christmas traditions"
      />
      <p className="text-center text-gray-700 font-medium" style={{ color: christmasColors.darkGreen }}>
        {displayMessage}
      </p>
    </div>
  );
}

