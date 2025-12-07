'use client';

import { Link } from '@heroui/link';
import type { ChristmasCarol } from '@/lib/types/cultural-data';
import { christmasColors } from '@/lib/utils/christmas-theme';

/**
 * Props for CarolLink component
 */
export interface CarolLinkProps {
  /** The carol information */
  carol: ChristmasCarol;
  /** Spotify URL for the carol (can be null) */
  spotifyUrl: string | null;
}

/**
 * CarolLink component
 * Displays Christmas carol information with Spotify link that opens in new tab
 */
export function CarolLink({ carol, spotifyUrl }: CarolLinkProps) {
  return (
    <div className="p-6 bg-green-50 border-2 rounded-lg" style={{ borderColor: christmasColors.green }}>
      <h3 className="text-xl font-bold mb-2" style={{ color: christmasColors.darkGreen }}>
        🎄 Christmas Carol: {carol.name}
      </h3>
      {carol.author && (
        <p className="text-sm text-gray-600 mb-4">
          by {carol.author}
        </p>
      )}
      {spotifyUrl ? (
        <Link
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          color="success"
          showAnchorIcon
          className="font-semibold"
          style={{
            color: christmasColors.green,
          }}
        >
          🎵 Listen on Spotify
        </Link>
      ) : (
        <p className="text-gray-600 italic">
          not found on spotify
        </p>
      )}
    </div>
  );
}

