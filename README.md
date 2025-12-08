# 🎄 Santa's Global Feast Finder

A Next.js SSR application that helps you discover Christmas traditions, dishes, and carols from around the world, powered by AI.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 24 or later** - [Download Node.js](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **OpenAI API Key** (optional for testing, required for full functionality) - [Get your API key](https://platform.openai.com/account/api-keys)
- **Spotify Client ID and Secret** (required for Spotify carol links) - [Get your credentials](https://developer.spotify.com/dashboard)

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd christmas-hackaton
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional for basic functionality)
   ```bash
   # Copy the sample environment file
   cp .env.sample .env.local
   
   # Add your API keys
   # OPENAI_API_KEY=sk-your-api-key-here
   # SPOTIFY_CLIENT_ID=your-spotify-client-id
   # SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   ```
   
   **Getting Spotify Credentials:**
   1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   2. Log in and click **"Create App"**
   3. Fill in app details (name, description)
   4. Copy your **Client ID** and **Client Secret** (click "Show client secret" to reveal)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

That's it! The application will run with default configurations if you don't provide API keys (some features will be limited - OpenAI is needed for dish/carol discovery, Spotify is needed for carol links).

---

## How We Built This

This application was built using **Speckit** (Spec-Driven Development) with **Cursor** (AI-powered IDE). The development process followed a structured, specification-first approach:

### Development Methodology

1. **Specification-Driven Development**: Each feature was first defined as a detailed specification in the `specs/` directory, including:
   - User stories and acceptance criteria
   - API contracts and data models
   - Component contracts and UI requirements
   - Research and planning documents

2. **AI-Assisted Implementation**: Using Cursor's AI capabilities, we:
   - Generated code from specifications
   - Implemented features following the defined contracts
   - Ensured type safety and consistency across the codebase
   - Maintained alignment with the specification requirements

3. **Incremental Feature Development**: The application was built feature-by-feature:
   - `001-ssr-web-app`: Core SSR application setup
   - `002-countries-dropdown`: Country selection interface
   - `003-country-dishes`: Dish discovery functionality
   - `004-country-carol`: Christmas carol integration
   - `005-spotify-carol-link`: Spotify integration for carols
   - `006-improve-api-naming`: API improvements
   - `007-christmas-home-redesign`: UI/UX enhancements
   - `008-santa-search-mode`: Select model to search with

Each specification includes detailed documentation, contracts, and checklists that guided the implementation process. This approach ensured consistency, maintainability, and clear documentation throughout the development lifecycle.

---

## What This Application Does

**Santa's Global Feast Finder** is a web application that helps you explore Christmas traditions from countries around the world. Here's what it does:

- **🌍 Country Selection**: Browse and search through a comprehensive list of countries with an intuitive dropdown interface

- **🍽️ Discover Traditional Dishes**: Select a country to discover its famous Christmas dishes, including:
  - Entry/appetizer dishes
  - Main courses
  - Desserts
  
  Each dish includes detailed descriptions and ingredient lists, powered by OpenAI.

- **🎵 Christmas Carols**: Learn about famous Christmas carols from each country, including the carol name and author when available

- **🎧 Spotify Integration**: When available, get direct links to listen to Christmas carols on Spotify

- **✨ Beautiful UI**: Enjoy a festive, Christmas-themed interface with:
  - Animated Santa sled spinner during loading
  - Decorative Christmas baubles in the background
  - Smooth transitions and animations
  - Responsive design for all devices

The application uses AI to provide accurate, culturally relevant information about Christmas traditions, making it easy to explore how different countries celebrate the holiday season.

---

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Framework**: Next.js 16.0.7
- **Language**: TypeScript 5.9.3 (strict mode)
- **React**: 19.2.1
- **Runtime**: Node.js 24
- **Styling**: Tailwind CSS 4
- **AI Integration**: OpenAI API

## License

MIT
