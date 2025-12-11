# SyncOps Platform Architecture & Implementation Guide

> **Last Updated:** December 2024
> **Purpose:** Master reference for end-to-end platform structure, implementation patterns, and AI assistant prompts

---

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Three-Layer Architecture](#three-layer-architecture)
3. [Current Implementation Status](#current-implementation-status)
4. [Screen-by-Screen Flow](#screen-by-screen-flow)
5. [Data Models Reference](#data-models-reference)
6. [Implementation Patterns](#implementation-patterns)
7. [AI Assistant Master Prompt](#ai-assistant-master-prompt)
8. [Gap Analysis & Roadmap](#gap-analysis--roadmap)

---

## Platform Overview

**SyncOps** is the operating system for creative operations — a unified platform that manages the entire lifecycle of media production from initial brief through final archive.

### Core Value Proposition
- **For Producers:** Single source of truth for project status, approvals, and logistics
- **For Editors:** Version control, review workflows, and asset management
- **For Legal/Compliance:** Rights tracking, approval gates, and audit trails
- **For Leadership:** ROI visibility, resource utilization, and risk management

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | AWS Amplify Gen 2 (GraphQL API, Lambda) |
| Database | DynamoDB (via Amplify Data) |
| Auth | AWS Cognito (Email, SSO: Google, Microsoft, Okta, Azure AD, SAML) |
| Storage | AWS S3 (with Glacier tiering for archive) |
| AI | AWS Bedrock (Claude) for Smart Brief |
| Payments | Stripe (subscription billing) |

---

## Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: PUBLIC                               │
│  Landing → Features → Pricing → About → Contact                  │
│  Goal: Convert visitors to signups/demos                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 LAYER 2: ACCESS & SETUP                          │
│  Auth → Workspace Creation → Role Selection → First Project      │
│  Goal: Onboard users into their workspace                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  LAYER 3: PRODUCT OS                             │
│  Dashboard + Project Phases + Archive + Intelligence             │
│  Goal: Run production operations end-to-end                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Implementation Status

### Layer 1: Public/Marketing

| Page | Route | Status | Component |
|------|-------|--------|-----------|
| Landing | `/` (marketing) | ✅ Complete | `LandingPage.tsx` |
| Pricing | `/pricing` | ✅ Complete | `PricingPage.tsx` |
| Features | `/features` | ❌ Missing | - |
| About | `/about` | ❌ Missing | - |
| Contact | `/contact` | ❌ Missing | - |

### Layer 2: Access & Setup

| Feature | Route | Status | Component |
|---------|-------|--------|-----------|
| Authentication | `/` | ✅ Complete | Amplify Authenticator |
| Workspace Creation | `/onboarding` | ✅ Complete | `OnboardingFlow.tsx` |
| Role Selection | `/onboarding` | ✅ Complete | `OnboardingFlow.tsx` |
| First Project Wizard | `/onboarding` | ✅ Complete | `ComprehensiveIntake.tsx` |

### Layer 3: Product OS

#### Global Views
| Feature | Route | Status | Component |
|---------|-------|--------|-----------|
| Dashboard | `/` (authenticated) | ✅ Complete | `GlobalDashboard.tsx` |
| Global Search | Modal | ✅ Complete | `UniversalSearch.tsx` |
| Media Library | `/library` | ✅ Complete | Library page |
| Reports | `/reports` | ⚠️ Partial | Reports page |
| Admin | `/admin` | ✅ Complete | `AdminDashboard.tsx` |

#### Project Phases
| Phase | Module ID | Status | Component |
|-------|-----------|--------|-----------|
| **DEVELOPMENT** |
| Overview | `overview` | ✅ Complete | `ProjectOverview.tsx` |
| Creative Brief | `brief` | ✅ Complete | `SmartBrief.tsx` |
| Budget | `budget` | ✅ Complete | `BudgetTracker.tsx` |
| Greenlight Gate | `greenlight` | ✅ Complete | `GreenlightGate.tsx` |
| Approvals | `approvals` | ✅ Complete | `GreenlightStatus.tsx` |
| **PRE-PRODUCTION** |
| Team & Crew | `team` | ✅ Complete | `TeamManagement.tsx` |
| Locations | `locations` | ⚠️ Partial | `LocationMaps.tsx` |
| Equipment | `equipment` | ✅ Complete | `EquipmentOS.tsx` |
| Call Sheets | `call-sheets` | ✅ Complete | `/call-sheets/` routes |
| Schedule | `calendar` | ⚠️ Partial | `CalendarSync.tsx` |
| Rights & Permits | `rights` | ✅ Complete | `DigitalRightsLocker.tsx` |
| **PRODUCTION** |
| Field Intelligence | `field-intel` | ✅ Complete | `FieldIntelligence.tsx` |
| Media Ingest | `ingest` | ✅ Complete | `GovernedIngest.tsx` |
| Tasks | `tasks` | ✅ Complete | `TaskManager.tsx` |
| Communication | `communication` | ⚠️ Partial | `ProjectChat.tsx` |
| **POST-PRODUCTION** |
| Asset Library | `assets` | ✅ Complete | Asset grid in page |
| Versions | `versions` | ✅ Complete | `AssetVersioning.tsx` |
| Review & Notes | `review` | ⚠️ Partial | `AssetReview.tsx` |
| Timeline | `timeline` | ⚠️ Partial | `ProjectTimeline.tsx` |
| **DELIVERY** |
| Distribution | `distribution` | ✅ Complete | `DistributionEngine.tsx` |
| MasterOps Archive | `master-archive` | ✅ Complete | `MasterOpsArchive.tsx` |
| Legacy Archive | `archive` | ✅ Complete | `ArchiveIntelligence.tsx` |
| Reports | `reports` | ✅ Complete | `ReportsExports.tsx` |
| Analytics | `kpis` | ⚠️ Partial | `DashboardKPIs.tsx` |

---

## Screen-by-Screen Flow

### 1. Marketing Site Flow

```
Landing Page
├── Hero Section
│   ├── Headline: "The operating system for creative operations"
│   ├── Subline: Target audience + value prop
│   └── CTAs: "Start with one project" / "Book a demo"
├── Problem Section
│   └── The chaos: vague briefs, version hell, scattered tools
├── Solution Section
│   └── Visual pipeline: Brief → Pre-Pro → Production → Post → Review → Distribution → Archive
├── Features Grid
│   ├── Smart Brief
│   ├── Logistics & Greenlight
│   ├── Governed Ingest
│   ├── Version Intelligence
│   ├── Rights & Legal
│   └── Living Archive
├── Personas Section
│   ├── Producers
│   ├── Editors
│   ├── Marketing/Comms
│   ├── Legal
│   └── Leadership
├── ROI Section
│   └── Time saved, reshoots avoided, cost optimization
└── Final CTA
    ��── "Run your next project on SyncOps"
```

### 2. Auth & Onboarding Flow

```
Sign Up / Log In
├── Email + Password
├── SSO Options (Google, Microsoft)
└── Guest Sandbox (optional)
        ↓
Workspace Creation
├── Workspace Name
├── Company Size
├── Industry Selection
│   ├── Studio
│   ├── Brand
│   ├── Agency
│   ├── Internal Comms
│   └── Media Company
└── Role Selection
    ├── Producer
    ├── Editor
    ├── Marketing
    ├── Legal
    ├── Executive
    └── Operations
        ↓
First Project Wizard
├── Project Title
├── Project Type
├── Target Regions
├── Timeline (Start/End)
├── Budget Band
└── Pipeline Preview
```

### 3. In-App Flow

```
Global Layout
├── Top Bar
│   ├── Logo
│   ├── Workspace Switcher
│   ├── Project Dropdown
│   ├── Global Search (⌘K)
│   ├── Notifications
│   └── User Menu
└── Main Content Area
    ├── Dashboard (default)
    ├── Project Detail
    │   ├── Left Sidebar: LifecycleNavigation
    │   └── Content: Phase Module
    ├── Library
    ├── Reports
    └── Admin
```

### 4. Project Phase Flow

```
Project Page (/projects/[id])
├── Header
│   ├── Breadcrumb
│   ├── Project Title
│   ├── Phase Badge
│   └── Quick Actions
├── LifecycleNavigation (Left Sidebar)
│   ├── Progress Indicator (5 phase dots)
│   ├── Current Phase Card
│   ├── Phase Sections (collapsible)
│   │   ├── Development
│   │   ├── Pre-Production
│   │   ├── Production
│   │   ├── Post-Production
│   │   └── Delivery
│   ├── Utility Links
│   │   ├── Activity Log
│   │   └── Settings
│   └── Quick Actions Footer
│       ├── Chat
│       └── Tasks
└── Module Content Area
    └── [Renders based on activeModule state]
```

---

## Data Models Reference

### Core Models

```typescript
// Organization (Multi-tenant workspace)
Organization {
  id: ID
  name: string
  slug: string
  industry: enum
  size: enum
  billingEmail: string
  stripeCustomerId?: string
  subscriptionPlanId?: string
  features: JSON // Feature flags
  ssoEnabled: boolean
  ssoProvider?: enum
  // ... branding, compliance settings
}

// Project (Production project)
Project {
  id: ID
  organizationId: ID
  name: string
  department: string
  status: enum (DEVELOPMENT, ACTIVE, COMPLETED, ARCHIVED, ON_HOLD)
  lifecycleState: enum (INTAKE → LEGAL_REVIEW → BUDGET_APPROVAL → GREENLIT →
                        PRE_PRODUCTION → PRODUCTION → POST_PRODUCTION →
                        REVIEW → DISTRIBUTION → COMPLETED → ARCHIVED)
  budgetCap?: number
  deadline?: date
  // Stakeholder emails for approvals
  producerEmail?: string
  legalContactEmail?: string
  financeContactEmail?: string
  executiveSponsorEmail?: string
  clientContactEmail?: string
  // Greenlight approval flags
  greenlightProducerApproved?: boolean
  greenlightLegalApproved?: boolean
  greenlightFinanceApproved?: boolean
  greenlightExecutiveApproved?: boolean
  greenlightClientApproved?: boolean
}

// Brief (AI-generated creative brief)
Brief {
  id: ID
  projectId: ID
  projectDescription: string
  scriptOrNotes?: string
  // AI-extracted fields
  deliverables: string[]
  estimatedDuration: string
  targetAudience: string
  tone: string
  budgetRange: string
  crewRoles: string[]
  // Risk assessment
  riskLevel: enum
  hasDroneRisk: boolean
  hasMinorRisk: boolean
  hasPublicSpaceRisk: boolean
  hasStuntRisk: boolean
  hasHazardousLocationRisk: boolean
  requiredPermits: string[]
  // Creative proposals
  creativeProposals: JSON // Array of 3 proposals with scripts & shot lists
  selectedProposalId?: string
  scenes: JSON
  complexity: enum
  // Approvals
  approvedByProducer: boolean
  approvedByLegal: boolean
  approvedByFinance: boolean
}

// Asset (Media file)
Asset {
  id: ID
  projectId: ID
  organizationId: ID
  s3Key: string
  fileSize: number
  mimeType: string
  type: enum (RAW, MASTER, PROXY, DOCUMENT, PROCESSING)
  storageClass: enum (STANDARD, INTELLIGENT_TIERING, GLACIER, DEEP_ARCHIVE)
  aiTags?: string[]
  aiTranscript?: string
  // Metadata
  cameraModel?: string
  shootDate?: date
  shootLocation?: string
}

// AssetVersion (Version control)
AssetVersion {
  id: ID
  assetId: ID
  projectId: ID
  versionNumber: number
  s3Key: string
  status: enum (DRAFT, READY_FOR_REVIEW, APPROVED, REJECTED, ARCHIVED)
  changelog?: string
  createdBy: string
}
```

### Supporting Models

```typescript
// Call Sheets
CallSheet { projectId, shootDate, generalCrewCall, primaryLocation, ... }
CallSheetScene { callSheetId, sceneNumber, description, location, ... }
CallSheetCast { callSheetId, characterName, actorName, callTime, ... }
CallSheetCrew { callSheetId, department, role, name, callTime, ... }

// Equipment
Equipment { organizationId, name, category, status, serialNumber, ... }
EquipmentCheckout { equipmentId, projectId, checkedOutBy, ... }
EquipmentKit { organizationId, name, description, ... }

// Rights & Documents
RightsDocument { projectId, type, status, title, expirationDate, ... }

// Tasks
Task { projectId, title, description, status, priority, assignedTo, dueDate, ... }

// Team
TeamMember { organizationId, email, name, role, department, ... }

// Reviews
Review { assetVersionId, projectId, status, reviewers, signedOffAt, ... }
ReviewComment { reviewId, userId, comment, timestamp, resolved, ... }

// Distribution
DistributionLink { assetId, projectId, accessCode, expiresAt, viewCount, ... }

// Archive
ArchivePolicy { organizationId, name, retentionDays, storageClass, ... }
RestoreRequest { assetId, requestedBy, status, expiresAt, ... }

// Activity & Notifications
ActivityLog { projectId, userId, action, targetType, targetId, metadata, ... }
Notification { userId, title, message, type, read, actionUrl, ... }
```

---

## Implementation Patterns

### 1. Component Structure

```tsx
'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

/**
 * COMPONENT_NAME - Brief description
 *
 * Purpose:
 * - What this component does
 * - Key features
 */

// Types
interface ComponentProps {
  projectId: string;
  currentUserEmail: string;
  // ... other props
}

// Icons (Lucide-style SVGs)
const IconName = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
       strokeLinejoin="round">
    {/* paths */}
  </svg>
);

export default function ComponentName({ projectId, currentUserEmail }: ComponentProps) {
  // Client initialization (SSR-safe)
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // State
  const [data, setData] = useState<SomeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data fetching
  useEffect(() => {
    if (!client) return;
    loadData();
  }, [client, projectId]);

  const loadData = async () => {
    if (!client) return;
    setIsLoading(true);
    try {
      const { data } = await client.models.ModelName.list({
        filter: { projectId: { eq: projectId } }
      });
      setData(data || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time subscription (optional)
  useEffect(() => {
    if (!client) return;
    const sub = client.models.ModelName.observeQuery({
      filter: { projectId: { eq: projectId } }
    }).subscribe({
      next: ({ items }) => setData([...items]),
      error: (err) => console.error(err)
    });
    return () => sub.unsubscribe();
  }, [client, projectId]);

  // Render
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Component content using CSS variables */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)'
        }}
      >
        {/* ... */}
      </div>
    </div>
  );
}
```

### 2. Styling Convention

```tsx
// CSS Variables (defined in globals.css)
// Backgrounds: var(--bg-0), var(--bg-1), var(--bg-2), var(--bg-3)
// Text: var(--text-primary), var(--text-secondary), var(--text-tertiary)
// Borders: var(--border), var(--border-subtle)
// Colors: var(--primary), var(--secondary), var(--success), var(--warning), var(--danger)
// Muted: var(--primary-muted), var(--danger-muted), etc.

// Pattern: Tailwind for layout, CSS variables for theming
<div
  className="flex items-center gap-4 p-6 rounded-xl"
  style={{
    background: 'var(--bg-1)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)'
  }}
>
```

### 3. Data Operations

```tsx
// Create
await client.models.Task.create({
  projectId,
  organizationId,
  title: 'New task',
  status: 'TODO',
  priority: 'MEDIUM',
});

// Read (list with filter)
const { data } = await client.models.Task.list({
  filter: {
    projectId: { eq: projectId },
    status: { ne: 'COMPLETED' }
  }
});

// Read (single item)
const { data } = await client.models.Task.get({ id: taskId });

// Update
await client.models.Task.update({
  id: taskId,
  status: 'COMPLETED',
  completedAt: new Date().toISOString(),
});

// Delete
await client.models.Task.delete({ id: taskId });

// Real-time subscription
const sub = client.models.Task.observeQuery({
  filter: { projectId: { eq: projectId } }
}).subscribe({
  next: ({ items }) => setTasks([...items]),
});
```

### 4. File Structure

```
sync-ops/
├── amplify/
│   ├── data/
│   │   └── resource.ts          # Schema definitions
│   ├── function/
│   │   └── smartBriefAI/        # Lambda functions
│   └── storage/
│       └── resource.ts          # S3 configuration
├── app/
│   ├── (marketing)/             # Public marketing pages
│   │   └── landing/page.tsx
│   ├── components/              # All React components
│   │   ├── ui/                  # Design system primitives
│   │   └── [ComponentName].tsx
│   ├── projects/
│   │   └── [id]/
│   │       ├── page.tsx         # Project detail hub
│   │       ├── assets/[assetId]/versions/page.tsx
│   │       └── call-sheets/
│   ├── admin/page.tsx
│   ├── library/page.tsx
│   ├── reports/page.tsx
│   ├── pricing/page.tsx
│   ├── onboarding/page.tsx
│   ├── layout.tsx
│   └── page.tsx                 # Main app entry
├── components/
│   └── call-sheets/             # Shared call sheet components
└── public/
```

---

## AI Assistant Master Prompt

Copy this prompt into your AI dev assistant (Cursor, Windsurf, VS Code + Claude, etc.):

```
# SyncOps Development Context

You are working on SyncOps, a production operations platform for creative teams.

## Tech Stack
- Next.js 14 (App Router) with TypeScript
- AWS Amplify Gen 2 (DynamoDB, Cognito, S3, Lambda)
- Tailwind CSS with CSS variables for theming
- Stripe for billing

## Key Directories
- `/app/components/` - All React components
- `/app/components/ui/` - Design system primitives
- `/app/projects/[id]/page.tsx` - Main project hub (orchestrates all phase modules)
- `/amplify/data/resource.ts` - Data schema (38+ models)
- `/amplify/function/` - Lambda functions

## Component Pattern
Always use this structure:
1. 'use client' directive
2. Initialize Amplify client in useEffect (SSR-safe)
3. Use CSS variables for theming: var(--bg-1), var(--text-primary), var(--border), etc.
4. Use Tailwind for layout: flex, grid, gap-4, p-6, rounded-xl
5. Icons: Lucide-style SVGs (stroke-width: 1.5)

## Data Access Pattern
```tsx
const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
useEffect(() => { setClient(generateClient<Schema>()); }, []);

// Then use: client.models.[Model].list/get/create/update/delete
// Filter: { filter: { fieldName: { eq: value } } }
// Real-time: client.models.[Model].observeQuery().subscribe()
```

## Project Lifecycle States
INTAKE → LEGAL_REVIEW → BUDGET_APPROVAL → GREENLIT → PRE_PRODUCTION → PRODUCTION → POST_PRODUCTION → REVIEW → DISTRIBUTION → COMPLETED → ARCHIVED

## Phase Modules (activeModule state in project page)
- Development: overview, brief, budget, greenlight, approvals
- Pre-Production: team, locations, equipment, call-sheets, calendar, rights
- Production: field-intel, ingest, tasks, communication
- Post-Production: assets, versions, review, timeline
- Delivery: distribution, master-archive, archive, reports, kpis

## When Adding Features
1. Check if data model exists in /amplify/data/resource.ts
2. If not, add model with authorization rules
3. Create component in /app/components/
4. Wire into project page (add to activeModule switch) or create new route
5. Use existing UI components from /app/components/ui/
6. Follow existing component patterns for consistency

## Current Gaps to Address
- Marketing: Features page, About page, Contact page
- Dashboard: Unified approvals queue, deadline calendar
- Post-Production: VideoPlayer, AudioWaveform completion
- Pre-Production: LocationMaps, CalendarSync completion
- Intelligence: ROI reports, usage analytics
```

---

## Gap Analysis & Roadmap

### Priority 1: Marketing & Conversion (Week 1-2)

| Task | Status | Effort |
|------|--------|--------|
| Features page with phase breakdown | ❌ | Medium |
| Problem/Solution sections on landing | ❌ | Small |
| Persona sections (who it's for) | ❌ | Small |
| ROI calculator/section | ❌ | Medium |
| About page | ❌ | Small |
| Contact page with form | ❌ | Small |

### Priority 2: Dashboard Consolidation (Week 2-3)

| Task | Status | Effort |
|------|--------|--------|
| Unified approvals queue widget | ⚠️ | Medium |
| Risk flags aggregation | ⚠️ | Medium |
| Deadline calendar view | ⚠️ | Medium |
| Quick actions panel | ⚠️ | Small |

### Priority 3: Core Experience Polish (Week 3-4)

| Task | Status | Effort |
|------|--------|--------|
| VideoPlayer completion | ⚠️ | Large |
| AudioWaveform completion | ⚠️ | Medium |
| ReviewHeatmap completion | ⚠️ | Medium |
| LocationMaps with actual maps | ⚠️ | Large |
| CalendarSync with providers | ⚠️ | Large |
| ProjectChat completion | ⚠️ | Medium |

### Priority 4: Intelligence & Differentiation (Week 4+)

| Task | Status | Effort |
|------|--------|--------|
| ROI metrics dashboard | ⚠️ | Large |
| Usage analytics | ⚠️ | Medium |
| Asset knowledge graph | ❌ | Large |
| Controlled stakeholder portals | ⚠️ | Large |

---

## Quick Reference: Adding a New Module

1. **Add to LifecycleNavigation.tsx:**
```tsx
// In PHASE_MODULES constant
preproduction: [
  // ... existing modules
  { id: 'new-module', label: 'New Module', icon: 'IconName' },
],
```

2. **Create Component:**
```tsx
// /app/components/NewModule.tsx
'use client';
import { useState, useEffect } from 'react';
// ... standard pattern
```

3. **Wire into Project Page:**
```tsx
// In /app/projects/[id]/page.tsx
{activeModule === 'new-module' && (
  <NewModule
    projectId={projectId}
    currentUserEmail={userEmail}
  />
)}
```

4. **Add Data Model (if needed):**
```typescript
// In /amplify/data/resource.ts
NewModel: a.model({
  projectId: a.id().required(),
  organizationId: a.id().required(),
  // ... fields
})
.authorization(allow => [
  allow.authenticated(),
]),
```

---

*This document should be kept updated as the platform evolves.*
