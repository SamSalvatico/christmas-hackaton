# API Routes Contracts

**Date**: 2024-12-19  
**Feature**: SSR Web Application with AI Integration  
**Format**: Next.js 16 Route Handlers (App Router)

## Overview

All API routes are located in `app/api/` directory and follow Next.js 16 Route Handler conventions. Routes handle server-side logic for external data integration and AI service communication.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `{DEPLOYMENT_URL}/api`

## Common Response Format

All API routes return JSON responses with the following structure:

```typescript
{
  success: boolean;
  data?: unknown;
  error?: {
    message: string;
    code?: string;
    retryable?: boolean;
  };
  metadata?: {
    timestamp: number;
    [key: string]: unknown;
  };
}
```

## Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `EXTERNAL_SERVICE_ERROR`: External service returned an error
- `AUTHENTICATION_ERROR`: Authentication failed
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `TIMEOUT_ERROR`: Request timeout
- `SERVICE_UNAVAILABLE`: Service is temporarily unavailable
- `INTERNAL_ERROR`: Internal server error

## Routes

### GET /api/external-data

Retrieves data from an external data source.

**Request**:
```typescript
// Query Parameters
{
  sourceId: string;        // Required: ID of the external data source
  endpoint?: string;        // Optional: Additional endpoint path
  params?: string;          // Optional: URL-encoded query parameters (JSON string)
}
```

**Response** (200 OK):
```typescript
{
  success: true;
  data: unknown;            // Data from external source
  metadata: {
    sourceId: string;
    timestamp: number;
    responseTime: number;
  };
}
```

**Error Response** (400/500):
```typescript
{
  success: false;
  error: {
    message: string;
    code: string;
    retryable: boolean;
  };
  metadata: {
    sourceId: string;
    timestamp: number;
  };
}
```

**Example**:
```bash
GET /api/external-data?sourceId=weather-api&endpoint=forecast&params={"city":"London"}
```

---

### POST /api/external-data

Sends data to an external data source.

**Request**:
```typescript
// Query Parameters
{
  sourceId: string;        // Required: ID of the external data source
  endpoint?: string;        // Optional: Additional endpoint path
}

// Request Body
{
  [key: string]: unknown;  // Data to send (format depends on external source)
}
```

**Response** (200 OK):
```typescript
{
  success: true;
  data: unknown;            // Response from external source
  metadata: {
    sourceId: string;
    timestamp: number;
    responseTime: number;
  };
}
```

**Error Response**: Same format as GET

---

### POST /api/ai/process

Processes a request using an AI service.

**Request**:
```typescript
// Request Body
{
  serviceId: string;       // Required: ID of the AI service
  prompt: string;          // Required: Prompt for AI processing
  context?: unknown;       // Optional: Additional context data
  options?: {
    temperature?: number;  // Optional: Override default temperature (0-2)
    maxTokens?: number;    // Optional: Override default max tokens
    stream?: boolean;      // Optional: Enable streaming response (default: false)
  };
}
```

**Response** (200 OK):
```typescript
{
  success: true;
  result: string;          // AI-generated result
  metadata: {
    serviceId: string;
    model: string;
    tokensUsed?: number;
    processingTime: number;
    timestamp: number;
  };
}
```

**Streaming Response** (200 OK, when stream: true):
- Content-Type: `text/event-stream`
- Format: Server-Sent Events (SSE)
- Each chunk: `data: {JSON.stringify(chunk)}\n\n`

**Error Response** (400/429/500):
```typescript
{
  success: false;
  error: {
    message: string;
    code: string;          // RATE_LIMIT_EXCEEDED, AUTHENTICATION_ERROR, etc.
    retryable: boolean;
  };
  metadata: {
    serviceId: string;
    timestamp: number;
  };
}
```

**Example**:
```bash
POST /api/ai/process
Content-Type: application/json

{
  "serviceId": "openai",
  "prompt": "Summarize the following data: ...",
  "context": { "data": "..." },
  "options": {
    "temperature": 0.7,
    "maxTokens": 500
  }
}
```

---

### GET /api/health

Health check endpoint for monitoring and deployment verification.

**Request**: No parameters required

**Response** (200 OK):
```typescript
{
  success: true;
  data: {
    status: "healthy";
    timestamp: number;
    version: string;
    services: {
      externalData: {
        available: number;      // Number of available data sources
        total: number;          // Total configured data sources
      };
      ai: {
        available: number;      // Number of available AI services
        total: number;         // Total configured AI services
      };
    };
  };
}
```

**Error Response** (503 Service Unavailable):
```typescript
{
  success: false;
  error: {
    message: string;
    code: "SERVICE_UNAVAILABLE";
  };
}
```

---

## Authentication

API routes do not require client authentication for this initial implementation. All external service authentication is handled server-side using environment variables.

## Rate Limiting

- AI service routes (`/api/ai/*`) implement rate limiting per service configuration
- External data routes (`/api/external-data`) may implement rate limiting based on source configuration
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Caching

- External data responses may be cached based on source configuration
- Cache headers:
  - `Cache-Control`: Cache control directives
  - `ETag`: Entity tag for cache validation
- AI processing responses are not cached (always fresh)

## Timeouts

- External data requests: 5 seconds default (configurable per source)
- AI processing requests: 30 seconds default (configurable per service)
- Timeout errors return `TIMEOUT_ERROR` code

## Validation

All requests are validated:
- Required parameters must be present
- Parameter types must match expected types
- Service/source IDs must exist in configuration
- Request body must match expected schema

Validation errors return `VALIDATION_ERROR` code with descriptive message.

