# Live Call Sheets - Quick Reference

**Feature Status:** 60% Complete - Core functionality working
**Last Updated:** December 7, 2025

---

## 🚀 Quick Start

### Try It Out
1. Navigate to your development server: `http://localhost:3001`
2. Go to any project: `/projects/[projectId]`
3. Click "Call Sheets" or navigate to: `/projects/[projectId]/call-sheets`
4. Click "Create Call Sheet"
5. Fill in the form and click "Publish Call Sheet"
6. View your professional call sheet!

### Routes
- **List:** `/projects/[projectId]/call-sheets`
- **Create:** `/projects/[projectId]/call-sheets/new`
- **View:** `/projects/[projectId]/call-sheets/[callSheetId]`

---

## 📂 File Locations

### Components
- Form: `src/components/call-sheets/CallSheetForm.tsx`
- Viewer: `src/components/call-sheets/CallSheetViewer.tsx`

### Pages
- List: `src/app/projects/[id]/call-sheets/page.tsx`
- Create: `src/app/projects/[id]/call-sheets/new/page.tsx`
- Detail: `src/app/projects/[id]/call-sheets/[callSheetId]/page.tsx`

### Schema
- Models: `amplify/data/resource.ts` (lines 251-380)

### Documentation
- Implementation Plan: `LIVE_CALL_SHEETS_IMPLEMENTATION_PLAN.md`
- Progress Tracker: `LIVE_CALL_SHEETS_PROGRESS.md`
- Session Summary: `SESSION_SUMMARY_CALL_SHEETS_DEC_7_2025.md`
- Final Summary: `DEVELOPMENT_SESSION_DEC_7_2025_FINAL_SUMMARY.md`

---

## ✅ What's Working

- ✅ Create call sheet with all production details
- ✅ Save as draft or publish
- ✅ View list of all call sheets
- ✅ View individual call sheet details
- ✅ Professional industry-standard layout
- ✅ Status badges (DRAFT/PUBLISHED/UPDATED/CANCELLED)
- ✅ Version tracking

---

## ⏳ What's Not Working Yet

- ⏳ Edit call sheet
- ⏳ Add scenes to call sheet
- ⏳ Add cast members to call sheet
- ⏳ Add crew members to call sheet
- ⏳ Real-time updates
- ⏳ Timezone conversion
- ⏳ SMS/email notifications
- ⏳ PDF export

---

## 🗄️ Database Models

### CallSheet (Main)
- 35+ fields covering all production requirements
- Status: DRAFT, PUBLISHED, UPDATED, CANCELLED
- Version tracking
- Timezone support

### CallSheetScene
- Scene number, heading, description
- Scheduled time, status
- Sort order

### CallSheetCast
- Actor name, character name
- Makeup call, wardrobe call, call to set
- Contact info, pickup details

### CallSheetCrew
- Name, role, department
- Call time, walkie channel
- Contact info

---

## 🎯 Next Development Priorities

1. **Scene/Cast/Crew Forms** - Add ability to populate tables
2. **Edit Functionality** - Modify existing call sheets
3. **Real-Time Subscriptions** - Auto-update when changes occur
4. **Timezone Toggle** - View in local or shoot timezone

---

## 📖 Full Documentation

For complete details, see:
1. [Implementation Plan](LIVE_CALL_SHEETS_IMPLEMENTATION_PLAN.md) - Full technical design
2. [Progress Tracker](LIVE_CALL_SHEETS_PROGRESS.md) - Status and metrics
3. [Session Summary](DEVELOPMENT_SESSION_DEC_7_2025_FINAL_SUMMARY.md) - Complete session recap

---

## 🐛 Known Issues

None currently - core functionality working as expected!

---

## 💡 Tips

1. **Test Data:** Create a call sheet with minimal data first to test
2. **Timezone:** Set to your local timezone when creating
3. **Status:** Use DRAFT while testing, PUBLISHED for real use
4. **Navigation:** Use "Back to Call Sheets" button to return to list

---

**Questions?** Check the documentation files or ask for help!
