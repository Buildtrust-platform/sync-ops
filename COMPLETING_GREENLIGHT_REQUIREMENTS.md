# How to Complete the 5 Greenlight Requirements

## Overview
Good news! The system **already has a fully functional approval interface** in the **Approvals** tab. You don't need to manually edit database fields.

---

## The 5 Greenlight Requirements

The GreenlightGate component checks these 5 requirements:

1. ✅ **Smart Brief Completed** - Checks if `project.brief` exists
2. ✅ **Producer Approved** - Checks if `project.greenlightProducerApproved === true`
3. ✅ **Legal Approved** - Checks if `project.greenlightLegalApproved === true`
4. ✅ **Finance Approved** - Checks if `project.greenlightFinanceApproved === true`
5. ✅ **Executive Approved** - Checks if `project.greenlightExecutiveApproved === true`

---

## How to Complete Each Requirement

### Requirement 1: Smart Brief Completed ✅

**Location:** Settings Tab → (requires creating a Brief first)

**How to complete:**
1. Create a Smart Brief for the project (this sets the `project.brief` relationship)
2. Once a Brief exists, this requirement automatically becomes ✅ green

**What it does:** Checks if a Brief record exists for the project

---

### Requirements 2-5: Stakeholder Approvals ✅

**Location:** Navigate to the **Approvals** tab (top of project detail page)

**How the approval system works:**

#### Step 1: Assign Stakeholders (One-Time Setup)

Before anyone can approve, you need to assign stakeholder emails:

1. Go to **Settings** tab (new tab at the end of the tab bar: ⚙️)
2. Find the **Stakeholder Assignments** section
3. Fill in these email fields:
   - **Producer Email** (for Producer approval)
   - **Legal Contact Email** (for Legal approval)
   - **Finance Contact Email** (for Finance approval)
   - **Executive Sponsor Email** (for Executive approval)
   - **Client Contact Email** (optional, for 5th approval)
4. Click **Save All Settings** at the bottom

**Important:** Only stakeholders with matching emails can approve their role!

---

#### Step 2: Complete Approvals

Once stakeholders are assigned, go to the **Approvals** tab.

You'll see a card for each assigned stakeholder:

```
┌─────────────────────────────────────────────────────┐
│  🎬 Producer                         👆 REVIEW NOW  │
│  producer@example.com                               │
└─────────────────────────────────────────────────────┘
```

**To approve:**

1. **Log in as the stakeholder** (or use their email for testing)
2. Navigate to **Approvals** tab
3. Find your role's card (it will be highlighted in **yellow** with a pulsing "REVIEW NOW" button)
4. Click **"REVIEW NOW"**
5. Optionally add a comment
6. Click **"APPROVE"** (green button) or **"REJECT"** (red button)

**What happens:**
- ✅ Approval is logged permanently (cannot be undone)
- ✅ Timestamp and approver email recorded
- ✅ Activity log entry created
- ✅ Progress bar updates
- ✅ When all approvals complete → "🎉 GREENLIT" badge appears

---

## Testing the Full Workflow (Quick Method)

If you want to test the entire workflow quickly without switching user accounts:

### Option A: Use Your Current Email for All Roles (Development Testing)

1. **Assign yourself to all roles:**
   - Go to **Settings** tab (⚙️ at the end of the tab bar)
   - In the **Stakeholder Assignments** section, set ALL email fields to your current email:
     - Producer Email: `your-email@example.com`
     - Legal Contact Email: `your-email@example.com`
     - Finance Contact Email: `your-email@example.com`
     - Executive Sponsor Email: `your-email@example.com`
   - Click **Save All Settings** at the bottom

2. **Complete all approvals:**
   - Go to **Approvals** tab
   - You'll see 4 cards, all with "👆 REVIEW NOW" buttons (since all match your email)
   - Click "REVIEW NOW" on each card
   - Click "APPROVE" for each role
   - Watch the progress bar reach 100%
   - See the "🎉 GREENLIT" badge appear

3. **Advance the project:**
   - Return to **Overview** tab
   - Scroll to **Greenlight Gate** component
   - All 5 checkboxes should now be ✅ green
   - Click **"Grant Greenlight & Advance"** button
   - Project automatically moves to `GREENLIT` state

---

### Option B: Direct Database Method (For Testing Only)

If you want to skip the approval workflow for testing:

1. Open **AWS Console** → **DynamoDB** → **Tables**
2. Find your project
3. Add/edit these fields:
   ```json
   {
     "brief": "Test brief content",
     "greenlightProducerApproved": true,
     "greenlightLegalApproved": true,
     "greenlightFinanceApproved": true,
     "greenlightExecutiveApproved": true
   }
   ```
4. Save and refresh your browser

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Fill Smart Brief                                │
│ Location: Overview Tab → Project Overview               │
│ Result: ✅ Requirement 1 complete                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Assign Stakeholder Emails                       │
│ Location: Overview Tab → Project Overview               │
│ Fields: Producer, Legal, Finance, Executive emails      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Get Approvals                                   │
│ Location: Approvals Tab                                 │
│ Action: Each stakeholder clicks REVIEW NOW → APPROVE    │
│ Result: ✅ Requirements 2-5 complete                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Advance Through Greenlight Gate                 │
│ Location: Overview Tab → Greenlight Gate                │
│ Button: "Grant Greenlight & Advance"                    │
│ Result: Project moves to GREENLIT state                 │
└─────────────────────────────────────────────────────────┘
```

---

## What You Should See

### Before Any Approvals:
```
Approvals Tab:
┌─────────────────────────────────────────────────────┐
│ 📋 Stakeholder Approvals                            │
│ 0 of 4 required approvals received                  │
│ Progress: [░░░░░░░░░░░░░░░░░░░░] 0%                 │
└─────────────────────────────────────────────────────┘
```

### After 2/4 Approvals:
```
Approvals Tab:
┌─────────────────────────────────────────────────────┐
│ 📋 Stakeholder Approvals                            │
│ 2 of 4 required approvals received                  │
│ Progress: [████████████░░░░░░░░] 50%                │
└─────────────────────────────────────────────────────┘
```

### After All Approvals Complete:
```
Approvals Tab:
┌─────────────────────────────────────────────────────┐
│ 🎉 Stakeholder Approvals              ✓ GREENLIT   │
│ All stakeholder approvals received.                 │
│ Project is greenlit for Pre-Production.             │
│ Progress: [████████████████████] 100%               │
└─────────────────────────────────────────────────────┘
```

### Greenlight Gate (All Requirements Met):
```
Overview Tab:
┌─────────────────────────────────────────────────────┐
│ 🚦 Greenlight Gate                                   │
│                                                      │
│ ✅ Smart Brief completed                             │
│ ✅ Producer approved (producer@example.com)          │
│ ✅ Legal reviewed & approved                         │
│ ✅ Finance reviewed & approved                       │
│ ✅ Executive approved                                │
│                                                      │
│ [Grant Greenlight & Advance] ← Button now enabled   │
└─────────────────────────────────────────────────────┘
```

---

## Current User Detection

The approval system automatically detects which roles YOU can approve based on:

1. Your currently logged-in email (from Amplify Auth)
2. Comparing it against stakeholder email fields

**Example:**
- Your email: `steven@example.com`
- Producer Email: `steven@example.com`
- Legal Email: `legal@example.com`

**Result:** You'll see a "👆 REVIEW NOW" button ONLY on the Producer card (not Legal)

---

## Troubleshooting

### Problem: "No approval cards showing in Approvals tab"
**Solution:** You haven't assigned any stakeholder emails yet. Go to Overview → Project Overview and fill in at least one stakeholder email field.

### Problem: "I don't see REVIEW NOW button"
**Solution:** The stakeholder email doesn't match your logged-in email. Either:
1. Assign your email to that role, OR
2. Log in with the stakeholder's email

### Problem: "Greenlight Gate button still disabled after approvals"
**Solution:** Check that:
1. Smart Brief is filled in (Requirement 1)
2. ALL assigned stakeholders have approved (check Approvals tab for 100% progress)

### Problem: "I approved but it's not showing in Greenlight Gate"
**Solution:** Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R) to reload project data

---

## Next Steps After Greenlight

Once all 5 requirements are ✅ green:

1. Click **"Grant Greenlight & Advance"** in Greenlight Gate
2. Project automatically moves to `GREENLIT` state
3. LifecycleStepper updates to show 🚦 Greenlit as current stage
4. Greenlight Gate component disappears (no longer needed)
5. Project is ready for Pre-Production phase

---

## Need Help?

If you're still having trouble:

**Option 1:** Share a screenshot of your Approvals tab so I can see what's happening

**Option 2:** Tell me your current user email and I can create a test project with all fields pre-configured

**Option 3:** I can create a "Quick Test" button that auto-approves everything for development testing
