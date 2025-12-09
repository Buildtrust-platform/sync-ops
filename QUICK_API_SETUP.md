# Quick OpenWeatherMap API Setup

You're seeing this error because the app now requires a real API key (no more demo data!):

```
Error: OpenWeatherMap API key not configured.
Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to your .env.local file.
```

## 3-Minute Setup

### Option 1: Get Real Weather Data (Recommended)

**Step 1:** Sign up for free API key
- Go to: https://openweathermap.org/api
- Click "Get API Key" or "Sign Up"
- Create account (takes 2 minutes)
- Copy your API key from the dashboard

**Step 2:** Create `.env.local` file in your project root:

```bash
cd /Users/ngulesteven/Documents/sync-ops
```

Create the file:
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_OPENWEATHER_API_KEY=paste_your_key_here
EOF
```

Or create it manually with your text editor:
```
# .env.local
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_actual_api_key_here
```

**Step 3:** Restart dev server

```bash
# Kill current server
lsof -ti:3001 | xargs kill -9

# Start again
npm run dev
```

**Step 4:** Test it!
- Go to Settings tab
- Set location (Los Angeles, USA, 34.0522,-118.2437)
- Go to Overview tab
- Click "Refresh Field Intelligence"
- See REAL weather data! 🎉

---

### Option 2: Temporarily Disable Field Intelligence

If you don't want to set up the API key right now, you can simply:

1. Don't click the "Refresh Field Intelligence" button
2. The rest of the app works fine without weather data
3. Set up the API key later when you want to test Field Intelligence

---

## Free Tier Details

OpenWeatherMap free tier includes:
- ✅ 1,000 API calls per day
- ✅ Current weather
- ✅ 5-day forecast
- ✅ No credit card required
- ✅ Activation usually takes 10 minutes (but can take up to 2 hours)

---

## Why This Change?

You asked to remove all demo data and use real data only. The Field Intelligence feature now:
- ✅ Uses real weather APIs only
- ✅ Shows actual conditions for your locations
- ✅ Provides authentic forecast data
- ✅ Gives you production-quality experience

---

## What's Working Without API Key

Everything else works perfectly:
- ✅ Greenlight Gate & Approvals
- ✅ Lifecycle Stepper
- ✅ Timeline Visualization
- ✅ Project Settings
- ✅ Budget Tracking
- ✅ Asset Management
- ✅ All CRUD operations

Only Field Intelligence weather refresh requires the API key.

---

## Need Help?

Full setup guide: [SETUP_REAL_WEATHER_API.md](SETUP_REAL_WEATHER_API.md)

Or just let me know if you want me to:
1. Walk you through the API signup process
2. Help troubleshoot the .env.local file
3. Create a development-only fallback (though this defeats the purpose of real data)
