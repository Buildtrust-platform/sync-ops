# SyncOps - Project Status Documentation

**Last Updated:** December 5, 2025
**Status:** Active Development
**Environment:** AWS Amplify Gen2 Sandbox

---

## Overview

SyncOps is an Enterprise Media Operating System built with Next.js 16 and AWS Amplify Gen2. The application manages media production projects from initiation through post-production, with automated processing pipelines.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16.0.7 (App Router)
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS 4
- **Authentication UI:** @aws-amplify/ui-react 6.13.1
- **Language:** TypeScript 5.9.3

### Backend (AWS Amplify Gen2)
- **Authentication:** AWS Cognito (email-based)
- **Database:** DynamoDB (via Amplify Data)
- **Storage:** S3 (via Amplify Storage)
- **Functions:** AWS Lambda (Node.js 18)
- **API:** AWS AppSync (GraphQL)

---

## Architecture

### 1. Authentication ([amplify/auth/resource.ts](amplify/auth/resource.ts))
- Email/password authentication via AWS Cognito
- User pool management
- No social providers configured

### 2. Data Layer ([amplify/data/resource.ts](amplify/data/resource.ts))

**Models:**

#### Project
- **Purpose:** Tracks project lifecycle
- **Statuses:** INITIATION → PRE_PROD → PRODUCTION → POST → LEGAL_REVIEW → APPROVED → ARCHIVED
- **Fields:**
  - `name` (string, required)
  - `description` (string)
  - `status` (enum)
  - `budgetCap` (float) - for burn rate tracking
  - `deadline` (date)
  - `department` (string) - e.g., "Marketing", "HR"
- **Relationships:**
  - `assets` (hasMany Asset)
  - `brief` (hasOne Brief)
  - `callSheets` (hasMany CallSheet)
- **Authorization:**
  - Owner: full access
  - Authenticated users: read
  - Admin group: full CRUD

#### Asset
- **Purpose:** Media file metadata and tracking
- **Fields:**
  - `projectId` (id, required)
  - `s3Key` (string, required) - S3 file path
  - `type` (enum) - RAW, MASTER, PROXY, DOCUMENT, PROCESSING
  - `storageClass` (enum) - STANDARD, GLACIER
  - `version` (integer, default: 1)
  - `usageHeatmap` (integer, default: 0) - ROI tracking
- **Relationships:**
  - `project` (belongsTo Project)
- **Authorization:**
  - Owner: full access
  - Admin group: full CRUD
  - Legal group: read only

#### Brief
- **Purpose:** Project requirements and risk assessment
- **Fields:**
  - `projectId` (id, required)
  - `targetAudience` (string)
  - `distributionChannels` (string array)
  - `riskLevel` (enum) - LOW, MEDIUM, HIGH
- **Authorization:** Authenticated users

#### CallSheet
- **Purpose:** Production logistics
- **Fields:**
  - `projectId` (id, required)
  - `shootDate` (date)
  - `location` (string)
  - `crewList` (string array)
- **Authorization:** Authenticated users

**Schema-Level Authorization:**
- Lambda function `mediaProcessor` has resource-level access to all models via `allow.resource(mediaProcessor)`

### 3. Storage ([amplify/storage/resource.ts](amplify/storage/resource.ts))
- **Bucket Name:** syncOpsDrive
- **Path Pattern:** `media/{entity_id}/*`
- **Access Rules:**
  - Authenticated users: read, write, delete
  - Guest users: read (for future share links)

### 4. Lambda Function - Media Processor ([amplify/function/mediaProcessor/](amplify/function/mediaProcessor/))

**Purpose:** Automated media processing pipeline triggered by S3 uploads

**Trigger:** S3 OBJECT_CREATED events on the syncOpsDrive bucket

**Flow:**
1. S3 upload triggers Lambda
2. Lambda queries DynamoDB for Asset record by S3 key
3. Updates Asset `type` from 'RAW' to 'PROCESSING'
4. Logs success/failure

**Configuration:**
- Runtime: Node.js 18
- Entry: `handler.ts`
- Uses `getAmplifyDataClientConfig(env)` for Amplify client setup
- IAM authentication to AppSync GraphQL API

**Key Files:**
- [handler.ts](amplify/function/mediaProcessor/handler.ts) - Lambda handler logic
- [resource.ts](amplify/function/mediaProcessor/resource.ts) - Function definition

**S3 Trigger Setup:** [backend.ts:17-23](amplify/backend.ts#L17-L23)

---

## Frontend Pages

### 1. Dashboard ([app/page.tsx](app/page.tsx))

**Route:** `/`

**Features:**
- Lists all projects in a responsive grid
- Create new projects via modal prompt
- Real-time project updates using `observeQuery()`
- User authentication with Amplify Authenticator
- Sign out functionality

**Project Creation Flow:**
1. User clicks "New Project" button
2. Prompts for project name and department
3. Creates project with default values:
   - Status: 'INITIATION'
   - Budget: $5,000.00
   - Deadline: Current date

**UI Components:**
- Header with app name and user info
- Project cards showing:
  - Status badge
  - Department tag
  - Project name
  - Deadline
  - Progress bar (static 10%)

### 2. Project Detail ([app/projects/[id]/page.tsx](app/projects/[id]/page.tsx))

**Route:** `/projects/[id]`

**Features:**
- View project details
- Upload media files to S3
- Display uploaded assets in grid
- Real-time file listing

**Upload Flow (CRITICAL - Order Matters):**
1. **Create DynamoDB Asset record FIRST** (lines 60-66)
   - Ensures record exists before Lambda trigger
2. **Upload file to S3** (lines 69-72)
   - Triggers Lambda function
   - Lambda finds existing Asset record and updates status
3. **Refresh file list** (lines 77-78)

**Why Order Matters:**
- S3 upload triggers Lambda immediately
- Lambda queries DynamoDB for Asset record
- If Asset created after upload, Lambda fails with "record not found"

**UI Components:**
- Back navigation to dashboard
- Project header with status badge
- Drag-and-drop upload zone
- Asset grid with file metadata

---

## Recent Fixes & Issues Resolved

### Issue 1: Asset Type Enum Mismatch
**Problem:** Lambda tried to update Asset type to 'PROCESSING', but enum only had RAW, MASTER, PROXY, DOCUMENT

**Fix:** Added 'PROCESSING' to Asset type enum in [data/resource.ts:42](amplify/data/resource.ts#L42)

### Issue 2: Amplify Configuration Error in Lambda
**Problem:** "Amplify has not been configured" error in Lambda logs

**Fix:** Implemented proper Amplify Gen2 pattern:
- Used `getAmplifyDataClientConfig(env)` in handler
- Added schema-level authorization with `allow.resource(mediaProcessor)`
- Removed manual IAM grant configurations

### Issue 3: TypeScript Validation Errors
**Problem:** `AMPLIFY_DATA_DEFAULT_NAME` environment variable missing

**Fix:** Amplify automatically provides this when using `allow.resource()` in schema authorization

### Issue 4: Lambda Cannot Find Asset Record
**Problem:** "Cannot read properties of undefined (reading '0')" - Lambda tried to access `assetResult.items[0]` which was undefined

**Root Cause:** Upload flow created S3 file BEFORE DynamoDB record, causing race condition

**Fixes:**
1. **Frontend:** Reversed order - create Asset record before S3 upload ([page.tsx:59-72](app/projects/[id]/page.tsx#L59-L72))
2. **Lambda:**
   - Changed from `.items[0]` to `.data[0]` (correct Amplify Gen2 API)
   - Added null check for `assetResult.data`
   - Improved error messages
   - Removed type assertions

---

## Current Git Status

**Branch:** main
**Uncommitted Changes:**
- Modified: `package.json`
- Modified: `package-lock.json`
- Untracked: `amplify/` directory

**Last Commit:** "Initial commit from Create Next App"

---

## Environment Variables

### Frontend (Next.js)
Configuration loaded from `amplify_outputs.json` (auto-generated)

### Lambda (mediaProcessor)
Auto-provided by Amplify when using `allow.resource()`:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`
- `AMPLIFY_DATA_DEFAULT_NAME`

---

## File Structure

```
sync-ops/
├── amplify/
│   ├── auth/
│   │   └── resource.ts          # Cognito auth config
│   ├── data/
│   │   └── resource.ts          # DynamoDB schema & authorization
│   ├── storage/
│   │   └── resource.ts          # S3 bucket config
│   ├── function/
│   │   └── mediaProcessor/
│   │       ├── handler.ts       # Lambda function logic
│   │       └── resource.ts      # Lambda definition
│   ├── backend.ts               # Backend resource aggregation & S3 triggers
│   ├── package.json
│   └── tsconfig.json
├── app/
│   ├── projects/
│   │   └── [id]/
│   │       └── page.tsx         # Project detail page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard (home page)
│   ├── globals.css              # Global styles
│   └── favicon.ico
├── public/
├── amplify_outputs.json         # Auto-generated config
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## Deployment

### Development (Sandbox)
```bash
npx ampx sandbox
```

### Production
```bash
npx ampx pipeline-deploy
```

---

## Known Limitations

1. **No Retry Logic:** If DynamoDB create fails but S3 upload succeeds, Lambda won't find the record
2. **No File Validation:** Frontend doesn't check file types or sizes before upload
3. **Static Progress Bar:** Project progress bars show hardcoded 10%
4. **No Pagination:** All projects and assets loaded at once
5. **Single User Owner:** Assets owned by uploader, no team collaboration features yet
6. **No File Preview:** Asset grid shows placeholder instead of thumbnails
7. **Lambda Timeout:** 300 seconds max - may not be sufficient for large files

---

## Next Steps / Roadmap

### Immediate
- [ ] Add retry logic for race conditions
- [ ] Implement file type validation
- [ ] Add loading states during uploads
- [ ] Display actual file thumbnails

### Short Term
- [ ] Calculate actual project progress
- [ ] Add pagination to lists
- [ ] Implement Brief and CallSheet UI
- [ ] Add team member management

### Long Term
- [ ] Video transcoding pipeline
- [ ] AI metadata extraction
- [ ] Legal review workflow
- [ ] Usage analytics dashboard
- [ ] Archive to Glacier automation

---

## Contact & Support

**Repository:** Local development (not pushed to GitHub yet)
**AWS Region:** Default from amplify_outputs.json
**Amplify CLI Version:** Latest (@aws-amplify/backend-cli ^1.8.0)

---

## Troubleshooting

### Multiple Sandbox Instances Error
```bash
# Kill existing process
kill -9 <PID>

# Restart sandbox
npx ampx sandbox
```

### Lambda Not Updating Assets
1. Check CloudWatch logs for Lambda function
2. Verify Asset record exists in DynamoDB before S3 upload
3. Confirm S3 key matches Asset.s3Key exactly

### Authentication Issues
1. Clear browser local storage
2. Sign out and sign back in
3. Check Cognito user pool in AWS Console

---

*This documentation reflects the state of the project as of the latest sandbox deployment.*
