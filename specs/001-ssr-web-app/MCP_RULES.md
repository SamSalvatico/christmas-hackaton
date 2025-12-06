# Next.js DevTools MCP Integration Rules

**Date**: 2024-12-19  
**Feature**: SSR Web Application with AI Integration

## Overview

This project uses Next.js DevTools MCP (Model Context Protocol) server for AI-assisted debugging and development. The MCP server is configured in `.mcp.json` and provides AI agents with insights into Next.js routing, caching, and rendering behaviors.

## Configuration

The MCP server is configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

## Usage Rules

### 1. Development Only

- **Rule**: MCP server is for development and debugging purposes only
- **Rationale**: Provides AI-assisted insights during development, not required for production
- **Action**: No production deployment considerations needed

### 2. AI Agent Integration

- **Rule**: AI agents (like Cursor) can use MCP server to understand Next.js 16 routing, caching, and rendering
- **Rationale**: Enables better AI assistance with Next.js-specific debugging and optimization
- **Action**: MCP server automatically provides context when AI agents analyze the codebase

### 3. No Code Changes Required

- **Rule**: MCP integration does not require any application code changes
- **Rationale**: MCP server runs as a separate process, providing context to AI tools
- **Action**: Application code remains unchanged; MCP is a tooling layer

### 4. Documentation

- **Rule**: MCP setup must be documented in README.md
- **Rationale**: Helps developers understand available AI-assisted debugging capabilities
- **Action**: Include MCP information in setup/development section of README

### 5. Optional Usage

- **Rule**: MCP server is optional - application works without it
- **Rationale**: Keeps setup simple; developers can use standard Next.js tooling if preferred
- **Action**: No blocking dependencies on MCP server

## Benefits

- **AI-Assisted Debugging**: AI agents can better understand Next.js routing and caching
- **Context-Aware Suggestions**: MCP provides unified logs and automatic error access
- **Development Efficiency**: Faster issue diagnosis and resolution suggestions

## Setup

The MCP server is automatically available when:
1. `.mcp.json` is present in the repository root
2. AI development tools (like Cursor) are configured to use MCP servers
3. Next.js application is running in development mode

No additional setup steps required beyond the existing `.mcp.json` configuration.

## Notes

- MCP server runs via `npx` and automatically uses the latest version
- No version pinning needed - always uses latest `next-devtools-mcp@latest`
- MCP server does not affect application runtime or performance
- Works seamlessly with Next.js 16 App Router and all features

