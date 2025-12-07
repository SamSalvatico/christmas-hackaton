/**
 * Authentication configuration for external data sources and AI services
 */
export type AuthenticationMethod = 'apiKey' | 'bearer' | 'basic' | 'none';

export interface AuthenticationConfig {
  method: AuthenticationMethod;
  apiKey: string | null;
  bearerToken: string | null;
  username: string | null;
  password: string | null;
  headerName: string | null; // Default: "X-API-Key"
}

