/**
 * Type definitions for Spotify Web API integration
 */

/**
 * OAuth2 access token response from Spotify
 */
export interface SpotifyAccessToken {
  /** The access token value */
  access_token: string;
  /** Token type (always "Bearer" for Spotify) */
  token_type: 'Bearer';
  /** Token expiration time in seconds */
  expires_in: number;
  /** Unix timestamp (milliseconds) when token was obtained (added for cache management) */
  timestamp?: number;
}

/**
 * External URLs for a Spotify resource
 */
export interface SpotifyExternalUrls {
  /** Open Spotify URL */
  spotify: string;
}

/**
 * Single track from Spotify search results
 */
export interface SpotifyTrack {
  /** Spotify track ID */
  id: string;
  /** Track name */
  name: string;
  /** External URLs for the track */
  external_urls: SpotifyExternalUrls;
  /** Track artists */
  artists: Array<{
    id: string;
    name: string;
  }>;
  /** Track album */
  album: {
    id: string;
    name: string;
  };
}

/**
 * Tracks portion of Spotify search response
 */
export interface SpotifyTracksObject {
  /** Link to full search results */
  href: string;
  /** Array of track results */
  items: SpotifyTrack[];
  /** Maximum number of items returned */
  limit: number;
  /** Offset of results */
  offset: number;
  /** Total number of results available */
  total: number;
}

/**
 * Response from Spotify search API
 */
export interface SpotifySearchResponse {
  /** Tracks search results */
  tracks: SpotifyTracksObject;
  /** Albums search results (not used in this feature) */
  albums?: {
    items: unknown[];
  };
  /** Artists search results (not used in this feature) */
  artists?: {
    items: unknown[];
  };
}

