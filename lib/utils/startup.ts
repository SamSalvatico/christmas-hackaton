import { loadConfiguration } from '../config/loader';

/**
 * Display startup information
 */
export function displayStartupInfo(): void {
  const config = loadConfiguration();
  const port = config.serverPort;
  const url = `http://localhost:${port}`;

  console.log('\n🚀 Application starting...\n');
  console.log(`📍 Server running on port ${port}`);
  console.log(`🌐 Access the application at: ${url}\n`);
  console.log('✅ Application is ready!\n');
}

