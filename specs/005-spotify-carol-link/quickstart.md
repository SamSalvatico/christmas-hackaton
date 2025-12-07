# Quickstart Guide: Spotify Christmas Carol Link

**Date**: 2024-12-19  
**Feature**: Spotify Christmas Carol Link

## Overview

This guide provides step-by-step instructions for setting up and using the Spotify Christmas Carol Link feature. The feature automatically searches Spotify for Christmas carols when they are available in the cultural data response.

---

## Prerequisites

1. **Node.js 24+** installed
2. **npm** or **yarn** package manager
3. **Spotify Developer Account** with application created
4. **Spotify Client ID and Client Secret** from your Spotify application

---

## Setup Instructions

### Step 1: Create Spotify Application

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create App"**
4. Fill in app details:
   - **App name**: "Christmas Hackathon App" (or your preferred name)
   - **App description**: "Search for Christmas carols"
   - **Redirect URI**: Not required for client credentials flow
   - **Website**: Optional
5. Click **"Save"**
6. Note your **Client ID** and **Client Secret** (click "Show client secret" to reveal)

### Step 2: Configure Environment Variables

1. Copy `.env.sample` to `.env.local` (if not exists):
   ```bash
   cp .env.sample .env.local
   ```

2. Add Spotify credentials to `.env.local`:
   ```bash
   # Spotify API Credentials
   SPOTIFY_CLIENT_ID=your-client-id-here
   SPOTIFY_CLIENT_SECRET=your-client-secret-here
   ```

3. Replace `your-client-id-here` and `your-client-secret-here` with your actual credentials from Step 1.

**Security Note**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### Step 3: Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

**Note**: No new npm packages are required. The feature uses native `fetch` API and built-in `Buffer` for base64 encoding.

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Usage

### Basic Flow

1. **Open the application** in your browser: `http://localhost:3000`

2. **Select a country** from the dropdown (e.g., "Italy")

3. **Click "Santa Search"** button

4. **Wait for results**:
   - Cultural data (dishes and carol) loads first
   - Spotify search runs automatically if carol is available
   - Total time: < 12 seconds

5. **View results**:
   - Cultural data displayed in JSON format
   - Spotify URL displayed if carol found on Spotify
   - "not found on spotify" message if carol not found

### Example Response

```json
{
  "dishes": {
    "entry": { "name": "Bruschetta", ... },
    "main": { "name": "Pasta Carbonara", ... },
    "dessert": { "name": "Tiramisu", ... }
  },
  "carol": {
    "name": "Tu scendi dalle stelle",
    "author": "Alfonso Maria de' Liguori",
    "country": "Italy"
  },
  "spotifyUrl": "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh"
}
```

### Clicking Spotify Link

- Click the Spotify URL to open the song in Spotify (web or app)
- If Spotify app is installed, it opens in the app
- Otherwise, opens in web browser

---

## Testing Scenarios

### Scenario 1: Country with Carol Found on Spotify

1. Select "Italy"
2. Click "Santa Search"
3. **Expected**: Cultural data + Spotify URL displayed

### Scenario 2: Country with Carol Not Found on Spotify

1. Select a country with a traditional/folk carol
2. Click "Santa Search"
3. **Expected**: Cultural data + "not found on spotify" message

### Scenario 3: Country without Carol

1. Select a country that doesn't have a famous Christmas carol
2. Click "Santa Search"
3. **Expected**: Cultural data (dishes only) + no Spotify search performed

### Scenario 4: Cache Hit

1. Select "Italy" and search (first time)
2. Wait for results
3. Select "Italy" again and search (within 20 minutes)
4. **Expected**: Results returned instantly from cache (no API calls)

### Scenario 5: Spotify API Error

1. Temporarily set invalid `SPOTIFY_CLIENT_SECRET` in `.env.local`
2. Select a country with carol
3. Click "Santa Search"
4. **Expected**: Cultural data displayed + `spotifyUrl: null` (graceful degradation)

---

## Troubleshooting

### Issue: "SPOTIFY_CLIENT_ID environment variable is required"

**Cause**: Environment variables not set or not loaded.

**Solution**:
1. Verify `.env.local` exists in project root
2. Verify `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are set
3. Restart development server: `npm run dev`
4. Check for typos in variable names

### Issue: "Invalid client credentials"

**Cause**: Incorrect client ID or client secret.

**Solution**:
1. Verify credentials in [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Copy credentials exactly (no extra spaces)
3. Ensure `.env.local` is in project root (not in subdirectory)
4. Restart development server

### Issue: Spotify URL always null

**Possible Causes**:
1. Carol name doesn't match any Spotify tracks
2. Spotify API rate limit exceeded
3. Network timeout

**Solution**:
1. Check browser console for errors
2. Verify carol name is correct
3. Wait a few minutes and try again (rate limit)
4. Check network connectivity

### Issue: "API rate limit exceeded"

**Cause**: Too many requests to Spotify API (limit: 10 requests/second).

**Solution**:
1. Wait a few seconds and try again
2. Use cached results (wait 20 minutes for cache expiration)
3. Reduce number of requests

### Issue: Slow response times

**Possible Causes**:
1. First request (no cache)
2. Token refresh needed
3. Network latency

**Solution**:
1. First request is slower (token + search), subsequent requests use cache
2. Check network connection
3. Verify Spotify API status

---

## API Testing

### Test Spotify Search Directly

You can test the Spotify search endpoint directly using curl:

```bash
# 1. Get access token
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic $(echo -n 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' | base64)" \
  -d "grant_type=client_credentials"

# 2. Use token to search
curl "https://api.spotify.com/v1/search?q=tu%20scendi%20dalle%20stelle&type=track&limit=1&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Replace `YOUR_CLIENT_ID`, `YOUR_CLIENT_SECRET`, and `YOUR_ACCESS_TOKEN` with actual values.

---

## Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SPOTIFY_CLIENT_ID` | Yes | Spotify application client ID | `abc123def456` |
| `SPOTIFY_CLIENT_SECRET` | Yes | Spotify application client secret | `xyz789uvw012` |

### Cache Settings

- **Spotify URL Cache TTL**: 20 minutes (1,200,000 milliseconds)
- **Access Token Cache TTL**: 1 hour (3,600,000 milliseconds, from Spotify)
- **Cache Storage**: In-memory (Map-based)

### API Settings

- **Search Limit**: 1 result (fixed)
- **Search Type**: `track` (fixed)
- **Timeout**: 5 seconds per API call
- **Retry**: Automatic token refresh on 401, no retry on other errors

---

## Next Steps

After setup:

1. **Test the feature** with different countries
2. **Verify Spotify links** open correctly
3. **Check error handling** (invalid credentials, network issues)
4. **Monitor cache behavior** (first request vs cached requests)

---

## Support

For issues or questions:

1. Check [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
2. Review error messages in browser console
3. Check server logs for detailed error information
4. Verify environment variables are set correctly

---

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Rotate credentials** if exposed
3. **Use environment-specific credentials** (dev vs production)
4. **Monitor API usage** in Spotify Developer Dashboard
5. **Set up rate limiting** if needed (Spotify enforces 10 req/s)

---

## Performance Tips

1. **Cache is your friend**: First request is slower, subsequent requests are fast
2. **Token reuse**: Access tokens are cached and reused until expiration
3. **Parallel execution**: Spotify search can run in parallel with cultural data (if not cached)
4. **Monitor API calls**: Check Spotify Developer Dashboard for usage statistics


