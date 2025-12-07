# SyncOps Information Architecture Redesign

## Problem Statement
Current UI suffers from:
- Information overload on single page
- Poor visual hierarchy
- Unclear user guidance
- No contextual navigation
- Critical actions buried in scroll

## Proposed Architecture

### 1. PROJECT DETAIL PAGE - Tab-Based Navigation

**Primary Navigation Tabs:**
```
[Overview] [Timeline] [Approvals] [Assets] [Budget] [Team] [Activity]
```

**Tab Descriptions:**

#### Tab 1: OVERVIEW (Default)
**Purpose**: Executive summary + Next Actions
**Content**:
- Project Status Card (large, top)
  - Current phase with visual indicator
  - Days remaining until deadline
  - Overall progress percentage
  - Health status (on-track/at-risk/delayed)

- Next Actions Widget (prominent, actionable)
  - "What you need to do now"
  - Context-aware based on role and project phase
  - Example: "Awaiting your approval as Legal" → direct button
  - Example: "Upload final deliverables" → upload zone

- Key Metrics (3-column grid)
  - Budget utilization (visual gauge)
  - Asset count (with status breakdown)
  - Team health (all stakeholders assigned?)

- Smart Brief Summary (collapsible)
  - AI-generated project brief
  - Key deliverables
  - Target audience

#### Tab 2: TIMELINE
**Purpose**: Milestone tracking and scheduling
**Content**:
- Gantt-style timeline (main focus)
- Milestone cards with deadlines
- Phase transition gates
- Calendar integration
- Dependency visualization

#### Tab 3: APPROVALS
**Purpose**: Dedicated approval workflow
**Content**:
- Only visible when status = DEVELOPMENT
- Large approval cards (current design works here)
- Approval progress
- Greenlight gate status
- Activity log for approvals only

#### Tab 4: ASSETS
**Purpose**: Media library and ingest
**Content**:
- Upload zone (prominent at top)
- Search and filters
- Asset grid
- Preview and review modals
- Version stacks

#### Tab 5: BUDGET
**Purpose**: Financial tracking
**Content**:
- Budget tracker (current component)
- Phase breakdown
- Expense tracking (future)
- Variance alerts
- Purchase orders (future)

#### Tab 6: TEAM
**Purpose**: Stakeholder management
**Content**:
- Stakeholder directory (from ProjectOverview)
- Contact information
- Role assignments
- Communication hub (future)
- Permissions management (future)

#### Tab 7: ACTIVITY
**Purpose**: Audit trail
**Content**:
- Activity log (current)
- Filterable by action type
- User timeline
- Export for compliance

---

### 2. DASHBOARD PAGE - Card-Based Design

**Current Problem**: Project cards show approval progress but don't guide action

**Proposed Redesign:**

```
┌─────────────────────────────────────────┐
│ 🟡 ACTION REQUIRED (2)                  │ ← Section for user's pending items
│                                         │
│ ┌─────────────────┐ ┌─────────────────┐│
│ │ Project Alpha   │ │ Project Beta    ││
│ │ ⚠️ APPROVE NOW  │ │ 📤 UPLOAD DUE   ││
│ │ [Legal]         │ │ [Assets]        ││
│ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🟢 IN PROGRESS (3)                      │
│                                         │
│ ┌─────────────────┐ ┌─────────────────┐│
│ │ Project Gamma   │ │ Project Delta   ││
│ │ Production      │ │ Post-Production ││
│ │ ████████░░ 80%  │ │ ████░░░░░░ 40%  ││
│ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚪ COMPLETED (5)                         │ ← Collapsible section
└─────────────────────────────────────────┘
```

**Card States:**
- **Red Border + Pulse** - User has overdue action
- **Yellow Border + Pulse** - User has pending action
- **Green Border** - On track, no action needed
- **Gray Border** - Completed/archived

**Card Content Hierarchy:**
1. Project name (largest)
2. Action required (if any) - PROMINENT
3. Current phase
4. Progress indicator
5. Quick actions (inline buttons)

---

### 3. NAVIGATION ARCHITECTURE

**Global Navigation:**
```
┌────────────────────────────────────────────────┐
│ 🎬 SyncOps    [Projects] [Library] [Reports]  │
│               user@email.com [Sign Out]        │
└────────────────────────────────────────────────┘
```

**Breadcrumb Navigation:**
```
Projects > Project Alpha > Timeline
```

**Context-Aware Actions:**
- Floating action button (bottom-right) adapts to current view
- Example on Assets tab: "Upload Asset"
- Example on Approvals tab: "Approve All"

---

### 4. VISUAL HIERARCHY PRINCIPLES

**Typography Scale:**
```
H1: 3xl - Page title (SyncOps)
H2: 2xl - Section headers (Projects, Project Name)
H3: xl  - Tab labels, Card titles
H4: lg  - Subsection headers
Body: base - Content
Small: sm/xs - Metadata, timestamps
```

**Color System:**
```
Critical Action:  Yellow (#EAB308) - Pulsing
Success:          Green (#22C55E)
Warning:          Orange (#F97316)
Error:            Red (#EF4444)
Info:             Blue (#3B82F6)
Neutral:          Slate (#64748B)
```

**Spacing System:**
```
Page padding:     10 (2.5rem)
Section gap:      8 (2rem)
Card gap:         6 (1.5rem)
Element gap:      4 (1rem)
Tight spacing:    2 (0.5rem)
```

---

### 5. USER FLOW EXAMPLES

**Flow 1: Approver receives notification**
1. Dashboard highlights project with yellow border + "ACTION NEEDED"
2. Card shows: "Your approval required as Legal"
3. Click → Goes directly to Approvals tab
4. Large approve/reject buttons (no scrolling needed)
5. After action → Returns to dashboard, card moves to "In Progress"

**Flow 2: Producer creates new project**
1. Click "New Project" → Comprehensive Intake wizard
2. Submit → Returns to dashboard
3. New project card appears in "In Progress" with status "Development"
4. Card shows: "Assign stakeholders" or "Request approvals"
5. Click → Goes to Team tab or Approvals tab

**Flow 3: Editor uploads assets**
1. Dashboard shows project with "Upload assets" action
2. Click → Goes directly to Assets tab
3. Upload zone is prominent at top (no scrolling)
4. Drag-drop or click to upload
5. Assets appear in grid below with AI processing status

---

### 6. IMPLEMENTATION PRIORITY

**Phase 1: Critical Fixes (Immediate)**
- ✅ Implement tab navigation on project detail page
- ✅ Move components into appropriate tabs
- ✅ Add "Next Actions" widget to Overview tab
- ✅ Redesign dashboard with grouped sections

**Phase 2: Enhanced Navigation (Week 2)**
- Global navigation bar
- Breadcrumb navigation
- Floating action button
- Search functionality

**Phase 3: Context-Aware Features (Week 3)**
- Smart routing (approvers → Approvals tab)
- Role-based default tabs
- Notification system
- Quick actions from cards

---

### 7. RESPONSIVE DESIGN

**Desktop (>1024px):**
- Tabs horizontal
- Side-by-side layouts (Budget + Timeline)
- 3-column grid for cards

**Tablet (768-1024px):**
- Tabs horizontal (scrollable if needed)
- Stacked layouts
- 2-column grid for cards

**Mobile (<768px):**
- Tabs as dropdown selector
- All stacked layouts
- 1-column grid for cards
- Bottom navigation for primary actions

---

### 8. ACCESSIBILITY REQUIREMENTS

- Keyboard navigation for all tabs
- ARIA labels for all interactive elements
- Focus indicators on tab selection
- Screen reader announcements for tab changes
- Color-blind safe palette (not relying solely on color)

---

### 9. PERFORMANCE CONSIDERATIONS

- Lazy load tab content (only render active tab)
- Virtualized asset grid for large libraries
- Debounced search
- Optimistic UI updates for approvals
- Background sync for activity log

---

## Success Metrics

After implementation, users should:
- ✅ Find their next action within 3 seconds
- ✅ Complete approvals without scrolling
- ✅ Navigate between sections in 1 click
- ✅ Understand project status at a glance
- ✅ Never feel lost or confused about location

---

## Technical Implementation Notes

**Component Structure:**
```
/app/projects/[id]/page.tsx
  ├── ProjectHeader (breadcrumb, status badge)
  ├── TabNavigation (horizontal tabs)
  ├── TabContent (lazy-loaded)
  │   ├── OverviewTab
  │   │   ├── NextActionsWidget ⭐ NEW
  │   │   ├── ProjectStatusCard ⭐ NEW
  │   │   ├── KeyMetrics
  │   │   └── SmartBriefSummary
  │   ├── TimelineTab
  │   │   └── ProjectTimeline
  │   ├── ApprovalsTab
  │   │   ├── GreenlightStatus
  │   │   └── ProductionPipeline (gate section only)
  │   ├── AssetsTab
  │   │   ├── UploadZone
  │   │   ├── SearchFilters
  │   │   └── AssetGrid
  │   ├── BudgetTab
  │   │   └── BudgetTracker
  │   ├── TeamTab
  │   │   └── StakeholderDirectory
  │   └── ActivityTab
  │       └── ActivityLog
  └── FloatingActionButton ⭐ NEW
```

**State Management:**
```typescript
const [activeTab, setActiveTab] = useState('overview');
const [project, setProject] = useState<Project | null>(null);
const [nextActions, setNextActions] = useState<Action[]>([]);

// Context-aware tab routing
useEffect(() => {
  const userRole = getCurrentUserRole(project, userEmail);
  const hasPendingApproval = checkPendingApproval(project, userEmail);

  if (hasPendingApproval) {
    setActiveTab('approvals'); // Auto-navigate to approvals
  }
}, [project, userEmail]);
```

---

This redesign provides:
1. ✅ Clear information hierarchy
2. ✅ Contextual user guidance
3. ✅ Logical navigation structure
4. ✅ Reduced cognitive load
5. ✅ Role-based workflows
