# SyncOps AI Development Context

> Drop this into your AI assistant (Cursor, Windsurf, Claude Code, etc.)

## Platform Overview

SyncOps is a production operations OS for creative teams. It manages the entire media production lifecycle from brief to archive.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** AWS Amplify Gen 2 (GraphQL, Lambda, DynamoDB)
- **Auth:** AWS Cognito (Email + SSO: Google, Microsoft, Okta, Azure AD)
- **Storage:** AWS S3 with Glacier tiering
- **AI:** AWS Bedrock (Claude) for Smart Brief
- **Payments:** Stripe

## Directory Structure
```
app/
├── components/           # All React components
│   ├── ui/              # Design system (Button, Card, Input, Modal, etc.)
│   └── [Component].tsx  # Feature components
├── projects/[id]/       # Project routes
│   └── page.tsx         # Main project hub
├── (marketing)/         # Public pages (landing, pricing)
├── admin/               # Admin dashboard
├── library/             # Media library
└── page.tsx             # Main app entry (auth + dashboard)

amplify/
├── data/resource.ts     # Schema (38+ models)
├── function/            # Lambda handlers
└── storage/             # S3 config
```

## Component Pattern
```tsx
'use client';
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

interface Props {
  projectId: string;
  currentUserEmail: string;
}

export default function ComponentName({ projectId, currentUserEmail }: Props) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Use client.models.[Model].list/get/create/update/delete
  // Filter: { filter: { fieldName: { eq: value } } }
  // Real-time: client.models.[Model].observeQuery().subscribe()

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Content */}
    </div>
  );
}
```

## Styling
- **Layout:** Tailwind (`flex`, `grid`, `gap-4`, `p-6`, `rounded-xl`)
- **Theming:** CSS variables in inline styles
  - Backgrounds: `var(--bg-0)`, `var(--bg-1)`, `var(--bg-2)`, `var(--bg-3)`
  - Text: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
  - Borders: `var(--border)`, `var(--border-subtle)`
  - Colors: `var(--primary)`, `var(--secondary)`, `var(--success)`, `var(--warning)`, `var(--danger)`
  - Muted: `var(--primary-muted)`, `var(--danger-muted)`, etc.
- **Icons:** Lucide-style SVGs (stroke-width: 1.5) or import from `Icons.tsx`

## Project Lifecycle States
```
INTAKE → LEGAL_REVIEW → BUDGET_APPROVAL → GREENLIT →
PRE_PRODUCTION → PRODUCTION → POST_PRODUCTION →
REVIEW → DISTRIBUTION → COMPLETED → ARCHIVED
```

## Phase Modules (activeModule in /projects/[id]/page.tsx)
| Phase | Modules |
|-------|---------|
| Development | `overview`, `brief`, `budget`, `greenlight`, `approvals` |
| Pre-Production | `team`, `locations`, `equipment`, `call-sheets`, `calendar`, `rights` |
| Production | `field-intel`, `ingest`, `tasks`, `communication` |
| Post-Production | `assets`, `versions`, `review`, `timeline` |
| Delivery | `distribution`, `master-archive`, `archive`, `reports`, `kpis` |

## Key Data Models
```typescript
Organization { id, name, slug, industry, billingEmail, stripeCustomerId, ... }
Project { id, organizationId, name, lifecycleState, budgetCap, deadline, stakeholderEmails, greenlightApprovals, ... }
Brief { id, projectId, projectDescription, deliverables, crewRoles, risks, creativeProposals, scenes, ... }
Asset { id, projectId, s3Key, fileSize, mimeType, type, storageClass, aiTags, ... }
AssetVersion { id, assetId, versionNumber, status, changelog, ... }
CallSheet { id, projectId, shootDate, scenes, cast, crew, ... }
Task { id, projectId, title, status, priority, assignedTo, dueDate, ... }
Equipment { id, organizationId, name, category, status, ... }
RightsDocument { id, projectId, type, status, title, expirationDate, ... }
Review { id, assetVersionId, status, reviewers, signedOffAt, ... }
DistributionLink { id, assetId, accessCode, expiresAt, viewCount, ... }
```

## Adding New Features

### 1. Add to Navigation (if needed)
```tsx
// /app/components/LifecycleNavigation.tsx - PHASE_MODULES
preproduction: [
  { id: 'new-module', label: 'New Module', icon: 'IconName' },
],
```

### 2. Create Component
```tsx
// /app/components/NewModule.tsx
// Follow the component pattern above
```

### 3. Wire into Project Page
```tsx
// /app/projects/[id]/page.tsx
{activeModule === 'new-module' && (
  <NewModule projectId={projectId} currentUserEmail={userEmail} />
)}
```

### 4. Add Data Model (if needed)
```typescript
// /amplify/data/resource.ts
NewModel: a.model({
  projectId: a.id().required(),
  organizationId: a.id().required(),
  // fields...
}).authorization(allow => [allow.authenticated()]),
```

## Current Gaps (Priority Order)
1. **Marketing:** Features page, About, Contact, Problem/Solution sections
2. **Dashboard:** Unified approvals queue, risk flags, deadline calendar
3. **Post-Production:** VideoPlayer, AudioWaveform, ReviewHeatmap completion
4. **Pre-Production:** LocationMaps (actual maps), CalendarSync (provider integration)
5. **Intelligence:** ROI reports, usage analytics, knowledge graph

## Commands
```bash
npm run dev          # Dev server
npm run build        # Production build (must pass)
npx ampx sandbox     # Amplify sandbox
```
