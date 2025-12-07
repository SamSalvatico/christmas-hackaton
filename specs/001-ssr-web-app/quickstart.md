# Quickstart Guide: SSR Web Application

**Feature**: SSR Web Application with AI Integration  
**Date**: 2024-12-19

## Prerequisites

- Node.js 24 or later installed
- npm or yarn package manager
- Git (for cloning the repository)

## One-Command Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd christmas-hackaton
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required dependencies including:
- Next.js 16
- React and React DOM
- HeroUI components
- TypeScript
- Testing libraries

### Step 3: Run the Application

```bash
npm run dev
```

That's it! The application will:
- Start the development server
- Use default configurations
- Be accessible at `http://localhost:3000`
- Display clear startup information in the terminal

## What Happens on Startup

1. **Server Initialization**: Next.js starts the development server
2. **Configuration Loading**: Application loads default configurations from `lib/config/defaults.ts`
3. **Environment Variables**: Reads from `.env.local` if present, falls back to defaults
4. **Service Verification**: Checks availability of configured external data sources and AI services
5. **Ready State**: Server is ready and displays access URL

## Default Configuration

The application works out of the box with default settings:

- **Server Port**: 3000 (or next available port)
- **External Data Sources**: Sample/test data sources configured
- **AI Services**: Demo mode or test credentials (if available)
- **Environment**: Development mode with hot reloading

## Accessing the Application

Once running, open your browser and navigate to:

```
http://localhost:3000
```

You should see the application's home page with a functional UI built with HeroUI components.

## Available Scripts

- `npm run dev`: Start development server (default command)
- `npm run build`: Build for production
- `npm run start`: Start production server (after build)
- `npm run lint`: Run ESLint
- `npm test`: Run tests
- `npm run test:e2e`: Run end-to-end tests

## Customizing Configuration

### Environment Variables

Create a `.env.local` file in the root directory to override defaults:

```env
# Server Configuration
PORT=3000

# External Data Sources
EXTERNAL_DATA_SOURCE_1_URL=https://api.example.com
EXTERNAL_DATA_SOURCE_1_API_KEY=your-api-key

# AI Service Configuration
AI_SERVICE_PROVIDER=openai
AI_SERVICE_API_KEY=your-ai-api-key
AI_SERVICE_MODEL=gpt-4
```

See `.env.example` for all available configuration options.

### Configuration Files

- `lib/config/defaults.ts`: Default configuration values
- `next.config.ts`: Next.js configuration
- `tsconfig.json`: TypeScript configuration

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, the application will automatically try the next available port. Check the terminal output for the actual port number.

**Solution**: Either stop the process using port 3000, or set a custom port:
```bash
PORT=3001 npm run dev
```

### Dependencies Installation Fails

**Solution**: Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

**Solution**: Ensure you're using Node.js 24+ and TypeScript 5.1+:
```bash
node --version  # Should be v24.x.x or later
npm list typescript  # Should be 5.1.0 or later
```

### External Data Source Errors

If external data sources fail to connect:

1. Check your internet connection
2. Verify API keys in `.env.local` (if using real sources)
3. Default test sources should work without configuration

### AI Service Errors

If AI services fail:

1. Verify API keys in `.env.local` (if using real services)
2. Check rate limits haven't been exceeded
3. Default demo mode should work without API keys

## Next Steps

1. **Explore the Application**: Navigate through the pages to see the UI
2. **Review Documentation**: Check `README.md` for detailed documentation
3. **Customize**: Modify configuration files to use your own data sources and AI services
4. **Develop**: Start building features following the project structure

## Getting Help

- Check the application logs in the terminal for error messages
- Review `specs/001-ssr-web-app/` for detailed specifications
- Consult Next.js documentation: https://nextjs.org/docs
- Consult HeroUI documentation: https://heroui.com/docs

## Verification Checklist

After running `npm run dev`, verify:

- [ ] Server starts without errors
- [ ] Terminal shows "Ready" message with localhost URL
- [ ] Browser can access `http://localhost:3000`
- [ ] Home page loads and displays UI
- [ ] No console errors in browser developer tools
- [ ] External data endpoints respond (if configured)
- [ ] AI processing endpoints respond (if configured)

If all items are checked, the application is successfully set up and ready for development!

