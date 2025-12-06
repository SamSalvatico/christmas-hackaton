# Christmas Hackathon - SSR Web Application

A Next.js 16 SSR application with AI integration, built with TypeScript strict mode.

## Quick Start

### Prerequisites

- Node.js 24 or later
- npm or yarn

### One-Command Setup

```bash
# Clone the repository
git clone <repository-url>
cd christmas-hackaton

# Install dependencies
npm install

# Start the development server
npm run dev
```

That's it! The application will be available at `http://localhost:3000`.

## Features

- **Single Service SSR**: Frontend and backend in one Next.js service
- **External Data Integration**: Connect to external APIs and data sources
- **AI-Powered Processing**: Integrate AI services for intelligent data processing
- **One-Command Setup**: Run with default configuration, no setup required
- **TypeScript Strict Mode**: Full type safety throughout

## Available Pages

- `/` - Home page with application status
- `/external-data` - View and process external data sources
- `/ai` - AI-powered processing interface
- `/api/health` - Health check endpoint

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Next.js DevTools MCP Integration

This project uses Next.js DevTools MCP (Model Context Protocol) for AI-assisted debugging. The MCP server is configured in `.mcp.json` and provides AI agents with insights into Next.js routing, caching, and rendering behaviors.

**Key Points:**
- MCP server is for development and debugging purposes only
- No application code changes required
- Automatically available when using AI development tools (like Cursor)
- Optional - application works without it

For detailed MCP rules and usage, see [specs/001-ssr-web-app/MCP_RULES.md](./specs/001-ssr-web-app/MCP_RULES.md).

## Configuration

Default configuration allows the application to run immediately. To customize:

1. Copy `.env.example` to `.env.local`
2. Update environment variables as needed
3. Restart the development server

### Default Configuration

The application includes default configurations that work out of the box:

- **External Data Source**: Sample API (JSONPlaceholder) - no authentication required
- **AI Service**: Demo mode - returns mock responses for testing
- **Server Port**: 3000 (or next available port)

## API Endpoints

### GET /api/health
Health check endpoint. Returns application status and service availability.

### GET /api/external-data
Retrieve data from external sources.

**Query Parameters:**
- `sourceId` (required): ID of the external data source
- `endpoint` (optional): Additional endpoint path
- `params` (optional): JSON string of query parameters

**Example:**
```
GET /api/external-data?sourceId=sample-api&endpoint=posts&params={"_limit":"5"}
```

### POST /api/external-data
Send data to external sources.

**Query Parameters:**
- `sourceId` (required): ID of the external data source
- `endpoint` (optional): Additional endpoint path

**Body:** JSON data to send

### POST /api/ai/process
Process requests using AI services.

**Body:**
```json
{
  "serviceId": "demo-ai",
  "prompt": "Your prompt here",
  "context": { "optional": "context data" },
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

## Project Structure

```
app/                          # Next.js App Router
├── api/                      # API routes
│   ├── health/              # Health check
│   ├── external-data/       # External data API
│   └── ai/                  # AI processing API
├── (routes)/                 # Route groups
│   ├── external-data/       # External data page
│   └── ai/                  # AI processing page
├── layout.tsx               # Root layout
├── page.tsx                 # Home page
└── globals.css              # Global styles

components/                   # React components
├── features/                # Feature-specific components
└── shared/                  # Shared components

lib/                         # Utilities
├── api/                     # API clients
├── config/                  # Configuration
├── types/                   # TypeScript types
└── utils/                   # Utilities

public/                      # Static assets
tests/                       # Test files
```

## Technology Stack

- **Framework**: Next.js 16.0.7
- **Language**: TypeScript 5.9.3 (strict mode)
- **React**: 19.2.1
- **Runtime**: Node.js 24

## Error Handling

All API routes return standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "retryable": true
  },
  "metadata": {
    "timestamp": 1234567890
  }
}
```

Error codes:
- `VALIDATION_ERROR` - Request validation failed
- `EXTERNAL_SERVICE_ERROR` - External service error
- `AUTHENTICATION_ERROR` - Authentication failed
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `TIMEOUT_ERROR` - Request timeout
- `SERVICE_UNAVAILABLE` - Service unavailable
- `INTERNAL_ERROR` - Internal server error

## License

MIT

