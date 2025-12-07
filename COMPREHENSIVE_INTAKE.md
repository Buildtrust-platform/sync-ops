# Comprehensive Project Intake System

## Overview
Complete redesign of project intake to capture all production pipeline details from the start, ensuring nothing is missed and all stakeholders are identified.

## What Was Built

### 1. Database Schema Expansion

#### **Project Model** ([amplify/data/resource.ts](amplify/data/resource.ts:11-81))
Added comprehensive fields to capture:

**Project Classification:**
- `projectType`: COMMERCIAL | CORPORATE | SOCIAL_MEDIA | EVENT | TRAINING | DOCUMENTARY | OTHER
- `priority`: URGENT | HIGH | NORMAL | LOW
- `confidentiality`: PUBLIC | INTERNAL | CONFIDENTIAL | HIGHLY_CONFIDENTIAL

**Stakeholders (Email-based for now):**
- `projectOwnerEmail`: Who commissioned the project
- `executiveSponsorEmail`: Budget approval authority
- `creativeDirectorEmail`: Creative vision owner
- `producerEmail`: Execution manager
- `legalContactEmail`: Compliance handler
- `financeContactEmail`: Budget manager
- `clientContactEmail`: External stakeholder (if applicable)

**Timeline Milestones:**
- `kickoffDate`
- `preProductionStartDate / preProductionEndDate`
- `productionStartDate / productionEndDate`
- `postProductionStartDate / postProductionEndDate`
- `reviewDeadline`
- `legalLockDeadline`
- `distributionDate`

**Budget Breakdown:**
- `budgetPreProduction`
- `budgetProduction`
- `budgetPostProduction`
- `budgetDistribution`
- `budgetContingency`
- `fundingSource`: e.g., "Marketing Budget Q4 2025"
- `purchaseOrderNumber`

**Success Metrics:**
- `primaryKPI`: "Views", "Engagement", "Conversions", etc.
- `targetMetric`: "100K views in 30 days"

**Greenlight Approvals:**
- `greenlightProducerApproved`
- `greenlightLegalApproved`
- `greenlightFinanceApproved`
- `greenlightExecutiveApproved`
- `greenlightClientApproved`
- `greenlightApprovedAt`

#### **Brief Model** ([amplify/data/resource.ts](amplify/data/resource.ts:125-192))
Expanded to include:

**Creative Brief Details:**
- `keyMessages`: Main points to communicate
- `brandGuidelines`: Link or description
- `inspirationReferences`: URLs or descriptions

**Distribution & Format Requirements:**
- `masterFormat`: "4K ProRes", "HD H.264", etc.
- `socialCropsRequired`: ["16:9", "9:16", "1:1", "4:5"]
- `subtitlesRequired`
- `languageVersions`: ["EN", "ES", "FR"]
- `accessibilityRequired`: Audio description, etc.
- `geoRights`: ["US", "EU", "Global"]
- `embargoDate`: When can it be published?

**Production Details:**
- `talentOnScreen`: ["John Doe - CEO", "Jane Smith - Presenter"]
- `talentVoiceOver`
- `equipmentNeeds`: {cameras: 2, lighting: true, audio: "boom+lavs", drones: true}
- `locationDetails`: Array of {name, address, permitRequired, insurance}

**Compliance & Legal:**
- `insuranceRequired`
- `safetyOfficerNeeded`
- `covidProtocolsRequired`
- `unionRules`: ["SAG-AFTRA", "DGA"]
- `copyrightOwnership`: COMPANY | CLIENT | SHARED
- `usageRightsDuration`: "Perpetual", "1 Year", etc.
- `musicLicensing`: LICENSED | ROYALTY_FREE | ORIGINAL_SCORE | NONE
- `stockFootageNeeded`
- `talentReleasesRequired`
- `locationReleasesRequired`

### 2. Multi-Step Intake Wizard Component

**File:** [app/components/ComprehensiveIntake.tsx](app/components/ComprehensiveIntake.tsx)

A 6-step wizard that guides users through comprehensive project setup:

#### **Step 1: Project Basics**
- Project Name, Type, Priority, Confidentiality
- Department
- All 7 stakeholders with email addresses
- Kickoff Date, Distribution Date

#### **Step 2: AI-Powered Creative Brief**
- Project Description (free text)
- Script or Notes (optional)
- AI analysis via existing Smart Brief AI Lambda
- Extracts: deliverables, crew, scenes, risks, complexity

#### **Step 3: Budget & Resources**
- Budget breakdown by phase (Pre-Prod, Prod, Post, Distribution, Contingency)
- Total budget calculation
- Funding source
- Purchase order number

#### **Step 4: Distribution & Success Metrics**
- Distribution channels (YouTube, Instagram, LinkedIn, etc.)
- Master format selection
- Social crops required (16:9, 9:16, etc.)
- Subtitles/language versions
- Primary KPI and target metric

#### **Step 5: Legal & Compliance**
- Copyright ownership
- Usage rights duration
- Music licensing
- Insurance, talent releases, location releases

#### **Step 6: Review & Greenlight**
- Summary of all entered information
- Creates project in DEVELOPMENT status
- Sets greenlight flags to false (awaiting approval)
- Activity log entry

### 3. User Interface Updates

**File:** [app/page.tsx](app/page.tsx)
- Replaced "Smart Brief" button with "New Project" button
- Updated to use ComprehensiveIntake component
- Button now shows "+" icon instead of lightning bolt

## User Flow

1. User clicks "New Project" button on homepage
2. **Step 1:** User enters project basics and stakeholder emails
   - Validates: Project Name, Project Owner Email, Distribution Date required
3. **Step 2:** User describes the project and adds script/notes
   - AI analyzes and extracts key information
   - Automatically moves to Step 3 after AI completes
4. **Step 3:** User allocates budget across phases
   - Shows total budget calculation in real-time
5. **Step 4:** User selects distribution channels and formats
   - Defines success metrics (KPI + target)
6. **Step 5:** User specifies legal requirements
   - Copyright, licensing, compliance needs
7. **Step 6:** User reviews all information
   - Creates project with all details captured
   - Project enters DEVELOPMENT phase
   - Awaits Greenlight approval from stakeholders

## Benefits

### Complete Project Context
Every project now has:
- Clear stakeholder ownership
- Detailed budget allocation
- Distribution plan from day 1
- Legal requirements upfront
- Success metrics defined

### Eliminates Missing Information
No more projects starting without:
- Budget approval authority
- Legal contact identified
- Distribution channels unknown
- Success metrics undefined

### Structured Approval Workflow
Greenlight gates ensure:
- Producer approves feasibility
- Legal approves compliance
- Finance approves budget
- Executive approves strategic fit
- Client approves vision (if external)

### AI-Enhanced Planning
Smart Brief AI still extracts:
- Deliverables
- Crew requirements
- Scene breakdowns
- Risk assessment
- Complexity analysis

## Next Steps

### Phase 2 Enhancements:
1. **Greenlight Approval Workflow**
   - Email notifications to stakeholders
   - Approval interface for each stakeholder
   - Project blocked from Pre-Production until all approvals

2. **Stakeholder Management**
   - User model integration instead of email strings
   - Stakeholder roles and permissions
   - Team directory

3. **Template System**
   - Save intake data as templates
   - "Corporate Video Template", "Event Coverage Template"
   - Pre-fill common fields

4. **Enhanced AI Extraction**
   - Extract stakeholder suggestions from description
   - Suggest budget allocation based on project type
   - Recommend distribution channels from target audience

5. **Integration with Production Pipeline**
   - Auto-create Call Sheets from crew roles
   - Auto-populate equipment OS from equipment needs
   - Generate permit checklist from locations

## Technical Implementation

**Backend:**
- DynamoDB tables: Project, Brief
- GraphQL API via Amplify
- Smart Brief AI Lambda (existing)

**Frontend:**
- React component: ComprehensiveIntake.tsx
- 6-step wizard with progress bar
- Real-time validation
- Total budget calculation

**State Management:**
- Single `intakeData` object holds all wizard state
- Step validation before proceeding
- AI results stored in state
- Creates Project and Brief records on final step

## Database Migration Notes

New fields added to existing models are all optional, so existing projects won't break. However, new projects created via ComprehensiveIntake will have significantly more data populated.

**Existing projects:** Still functional, missing new fields will be null/undefined
**New projects:** Full comprehensive data captured from intake wizard
