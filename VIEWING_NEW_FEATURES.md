# How to See the New Features

## Overview
The new components ARE integrated and working, but require specific project data to be fully visible. Here's what you should see and how to activate each feature.

---

## What You Should See Right Now at http://localhost:3001/projects/[any-project-id]:

### ✅ 1. Lifecycle Stepper (Top of Overview Tab)
**Location:** Top of Overview tab
**Appearance:** Horizontal row of 12 stage bubbles
**Status:** ✅ VISIBLE NOW

This should be visible immediately. Look for:
- 12 circular stage indicators
- Icons: 📋 💼 💰 🚦 📅 🎬 ✂️ 👀 🔒 📤 🌐 📦
- Current stage highlighted in teal
- Progress stats at bottom showing "X completed, 1 current, Y remaining"

**If you don't see it:** Check browser console for errors

---

### ⚠️ 2. Greenlight Gate (Below Lifecycle Stepper)
**Location:** Below LifecycleStepper
**Appearance:** Purple/indigo gradient card with "🚦 Greenlight Gate"
**Status:** ⚠️ CONDITIONALLY VISIBLE

**Only appears when:** `lifecycleState` is `'INTAKE'`, `'LEGAL_REVIEW'`, or `'BUDGET_APPROVAL'`

**To make it visible:**
1. Open browser console
2. Check what `lifecycleState` your project has
3. If it's `null` or a different state, you won't see Greenlight Gate

**Quick test:** Create a NEW project - it should default to INTAKE state and show Greenlight Gate

---

### ✅ 3. Field Intelligence Widget
**Location:** Below Greenlight Gate (or below Lifecycle Stepper if no Greenlight Gate)
**Appearance:** Blue gradient card with "🌍 Field Intelligence"
**Status:** ✅ VISIBLE NOW (with placeholder message)

**What you currently see:**
```
🌍 Field Intelligence
Add a shoot location to enable weather intelligence and feasibility scoring.
```

**To activate full features:**

#### Option A: Via Database Console
1. Go to AWS Console → DynamoDB → Tables
2. Find your project
3. Add these fields:
   ```
   shootLocationCity: "Los Angeles"
   shootLocationCountry: "USA"
   shootLocationCoordinates: "34.0522,-118.2437"
   ```

#### Option B: Via Code (recommended)
Add a quick edit form to allow setting location in the UI (we can build this if needed)

#### Option C: Test with OpenWeatherMap
1. Get free API key from https://openweathermap.org/api
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
   ```
3. Set location data (Option A or B)
4. Click "Refresh Field Intelligence" button

---

### ✅ 4. Production Pipeline (Existing, Enhanced)
**Location:** Bottom of Overview tab
**Appearance:** 8 stage bubbles + timeline section below
**Status:** ✅ VISIBLE NOW

**What you see:**
- 8-stage pipeline (Development → Pre-Production → Production → Post-Production → Review → Legal → Distribution → Archive)
- Progress bar at bottom

**Timeline Section** (NEW - at very bottom):
**Status:** ⚠️ CONDITIONALLY VISIBLE

Only appears if project has ANY of these date fields set:
- `kickoffDate`
- `preProductionStartDate`
- `productionStartDate`
- `postProductionStartDate`
- `reviewDeadline`
- `legalLockDeadline`
- `distributionDate`
- `deadline`

**To make timeline visible:**
Add dates to your project in DynamoDB:
```json
{
  "kickoffDate": "2025-01-15",
  "productionStartDate": "2025-02-01",
  "productionEndDate": "2025-02-28",
  "deadline": "2025-04-30"
}
```

---

## Quick Verification Checklist

Navigate to http://localhost:3001 → Click any project → Overview tab

Should see (in order from top to bottom):

1. ✅ **Lifecycle Stepper** - 12 horizontal stage bubbles
2. ⚠️ **Greenlight Gate** - Purple card (if lifecycleState is INTAKE/LEGAL_REVIEW/BUDGET_APPROVAL)
3. ✅ **Field Intelligence** - Blue card (shows "Add location" message)
4. ✅ **Next Actions** - Existing component
5. ✅ **Project Overview** - Existing component
6. ✅ **Production Pipeline** - 8-stage pipeline
7. ⚠️ **Timeline** - Inside ProductionPipeline (if dates exist)

---

## Screenshots of What You Should See

### Lifecycle Stepper (Always Visible):
```
┌─────────────────────────────────────────────────────────────┐
│  🚦 Greenlight Gate                                          │
│  Project Lifecycle                                           │
│  📋 Intake • Smart Brief creation                            │
│                                                               │
│  [📋] ─ [⚖️] ─ [💰] ─ [🚦] ─ [📅] ─ [🎬] ─ [✂️] ─ [👀] ... │
│   ^current                                                    │
│                                                               │
│  [0 Completed] [1 Current] [11 Remaining]                    │
└─────────────────────────────────────────────────────────────┘
```

### Field Intelligence (Always Visible):
```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Field Intelligence                                        │
│  Add a shoot location to enable weather intelligence         │
└─────────────────────────────────────────────────────────────┘
```

### Field Intelligence (With Location Data):
```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Field Intelligence                  [Score: 85]          │
│  Los Angeles, USA                                            │
│                                                               │
│  [Temp: 22°C] [Wind: 5 m/s] [Humidity: 65%] [Clear Sky]    │
│                                                               │
│  ⚠️ Risk Alerts                                              │
│  • No significant risks detected                             │
│                                                               │
│  [Refresh Field Intelligence]                                │
└─────────────────────────────────────────────────────────────┘
```

---

## If You Still Don't See Anything:

1. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Check browser console** (F12) for errors
3. **Verify you're on Overview tab** (not Timeline, Assets, etc.)
4. **Check you're viewing a project detail page** (URL should be `/projects/[some-id]`)

---

## Next Steps to Fully Activate Features:

Would you like me to:

**A)** Create a simple UI form to edit project fields (location, dates, lifecycleState)?

**B)** Create a database migration script to populate test data for existing projects?

**C)** Create a "Demo Project" with all fields populated so you can see everything working?

**D)** Add better visual indicators / placeholders to make it clearer when components are present but waiting for data?

Let me know which would be most helpful!
