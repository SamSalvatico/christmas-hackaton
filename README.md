# Christmas Hackathon - SSR Web Application

A Next.js 16 SSR application with AI integration, built with TypeScript strict mode and HeroUI.

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

## Project Structure

```
app/              # Next.js App Router (routes + API)
components/       # React components
lib/             # Utilities and business logic
public/          # Static assets
tests/           # Test files
```

## Technology Stack

- **Framework**: Next.js 16
- **Language**: TypeScript 5.1+ (strict mode)
- **UI Library**: HeroUI
- **Runtime**: Node.js 24

## License

MIT

