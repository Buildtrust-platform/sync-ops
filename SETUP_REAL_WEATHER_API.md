# Setting Up Real Weather Data

## Overview
I've removed all mock/demo data from the Field Intelligence component. Now it will only use real weather data from OpenWeatherMap API.

---

## Step 1: Get Your Free API Key

### Sign Up for OpenWeatherMap (5 minutes)

1. **Go to OpenWeatherMap:**
   - Visit: https://openweathermap.org/api

2. **Click "Sign Up"** (top right)
   - Or go directly to: https://home.openweathermap.org/users/sign_up

3. **Fill in the form:**
   - Username
   - Email address
   - Password
   - Agree to terms

4. **Verify your email**
   - Check your inbox for verification email
   - Click the verification link

5. **Get your API key:**
   - Log in to https://home.openweathermap.org
   - Go to "API keys" tab
   - You'll see a default API key already created
   - Copy the key (it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

---

## Step 2: Add API Key to Your Project

### Create .env.local file

```bash
cd /Users/ngulesteven/Documents/sync-ops
touch .env.local
```

### Add your API key to .env.local

Open `.env.local` in your editor and add:

```
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_actual_api_key_here
```

**Replace `your_actual_api_key_here` with the key you copied from OpenWeatherMap.**

Example:
```
NEXT_PUBLIC_OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## Step 3: Restart Your Dev Server

The dev server needs to restart to pick up the new environment variable:

```bash
# Kill the current server (Ctrl+C in the terminal)
# Or run this command:
lsof -ti:3001 | xargs kill -9

# Start it again:
npm run dev
```

---

## Step 4: Test Field Intelligence

1. **Go to Settings tab**
   - Set location data if you haven't already:
     - City: `Los Angeles`
     - Country: `USA`
     - Coordinates: `34.0522,-118.2437`
   - Click **Save All Settings**

2. **Go to Overview tab**
   - Find the Field Intelligence widget
   - Click **"Refresh Field Intelligence"**

3. **You should see REAL weather data!**
   - Current temperature for Los Angeles
   - Real wind speed
   - Real humidity
   - Real weather conditions
   - Real 5-day forecast

---

## Free Tier Limits

OpenWeatherMap Free Tier includes:

✅ **1,000 API calls per day**
✅ **Current weather data**
✅ **5-day / 3-hour forecast**
✅ **Real-time updates**
✅ **No credit card required**

Each time you click "Refresh Field Intelligence", it uses **1 API call**.

If you need more calls per day, you can upgrade to a paid plan later.

---

## API Key Security

### Important Notes:

⚠️ **The API key is in .env.local which is gitignored** - Good! It won't be committed to your repo.

⚠️ **NEXT_PUBLIC_ prefix means it's exposed to the browser** - This is fine for development, but for production you should:

1. Create a Next.js API route (server-side)
2. Store the API key in server-only environment variables
3. Have the client call YOUR API route instead of OpenWeatherMap directly

### Quick Production Fix (Optional):

If you want to make it production-ready now, I can create a Next.js API route that:
- Keeps your API key secret on the server
- Prevents abuse (rate limiting)
- Caches responses to reduce API calls

Just let me know if you want this!

---

## What Changed

### Files Modified:

**app/components/FieldIntelligence.tsx**
- ❌ Removed mock weather data generation
- ❌ Removed "DEMO MODE" badge
- ❌ Removed demo mode info box
- ✅ Now requires real API key
- ✅ Shows clear error if API key missing
- ✅ Only makes real API calls to OpenWeatherMap

**Files Created:**
- `.env.local.example` - Template showing what the .env.local file should look like
- `SETUP_REAL_WEATHER_API.md` - This guide

---

## Troubleshooting

### Error: "API key not configured"
**Solution:** You haven't created the .env.local file yet. Follow Step 2 above.

### Error: "Weather API error: 401 Unauthorized"
**Solution:** Your API key is invalid or not activated yet. Wait a few minutes after creating your account (activation can take 1-2 hours). Check that you copied the key correctly.

### Error: "Weather API error: 429 Too Many Requests"
**Solution:** You've exceeded 1,000 API calls today. Wait until tomorrow or upgrade your plan.

### No errors but button doesn't work
**Solution:**
1. Make sure you restarted the dev server after adding .env.local
2. Check browser console (F12) for errors
3. Make sure coordinates are set in Settings tab

---

## Testing Checklist

Once you have your API key set up:

- [ ] Created OpenWeatherMap account
- [ ] Copied API key
- [ ] Created .env.local file in project root
- [ ] Added `NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key` to .env.local
- [ ] Restarted dev server (`npm run dev`)
- [ ] Set location in Settings tab
- [ ] Clicked "Refresh Field Intelligence"
- [ ] See REAL weather data appear! 🎉

---

## Ready to Go!

Your SyncOps app is now using 100% real data - no more demos or mocks. Field Intelligence will show actual weather conditions for your shoot locations.

Next time you click that refresh button, you'll see the real temperature, wind speed, and weather forecast for Los Angeles (or wherever you set your location)!
