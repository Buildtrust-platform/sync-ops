# LIVE CALL SHEETS IMPLEMENTATION PLAN

**Module:** FR-12 Call Sheets (Live)
**Status:** Planning Phase
**Priority:** High
**Current Progress:** 0% → Target: 100%

---

## EXECUTIVE SUMMARY

Live Call Sheets is a production coordination feature that enables producers to create, update, and distribute call sheets to crew and talent in real-time. This implementation will eliminate offline call sheets, manual formatting, and communication delays by providing:

- Auto-updating call sheets with real-time synchronization
- Multi-timezone support for distributed teams
- SMS/email notifications for updates
- PDF export for traditional distribution
- Integration with existing project and crew management

---

## REQUIREMENTS ANALYSIS

### Functional Requirements (FR-12)
From PRD and vision documents:
- **Auto-update**: Real-time synchronization using GraphQL subscriptions
- **Timezone-aware**: Display times in crew member's local timezone
- **SMS/email notifications**: Alert crew when call sheets are created or updated
- **Live collaboration**: Multiple producers can edit simultaneously

### User Stories
1. **Producer**: "I want SyncOps to auto-generate a call sheet so I don't waste time manually formatting schedules"
2. **Crew Member**: "I want to receive call sheet updates on my phone so I never miss a schedule change"
3. **1st AD**: "I want to see who has viewed the call sheet so I know the crew is informed"

### Industry Standard Requirements
Based on 2025 production standards, call sheets must include:

#### Header Information
- Production title and company
- Shoot day number (e.g., "Day 3 of 10")
- Date and episode number
- Production office contact

#### Key Personnel
- Director, Producer, 1st AD, Production Manager
- Contact information (phone, email)

#### Scheduling Information
- General crew call time
- Individual call times by department
- Scene schedule with numbers and descriptions
- Estimated wrap time
- Next day's schedule preview

#### Location Details
- Primary filming location address
- Secondary locations (if applicable)
- Parking information and instructions
- Nearest hospital with emergency room
- Weather forecast (temperature, conditions, sunset)

#### Cast Information
- Actor names and character names
- Makeup/wardrobe call times
- Call to set times
- Pickup locations (if applicable)

#### Crew Roster
- Department breakdown
- Names and roles
- Contact information
- Walkie channel assignments

#### Additional Information
- Special equipment requirements
- Meal times and catering location
- Transportation/shuttle information
- Safety notes and requirements
- Special instructions

---

## CURRENT STATE ANALYSIS

### Existing CallSheet Model
Location: [amplify/data/resource.ts:251-261](amplify/data/resource.ts#L251-L261)

```typescript
CallSheet: a.model({
  projectId: a.id().required(),
  project: a.belongsTo('Project', 'projectId'),
  shootDate: a.date(),
  location: a.string(),
  crewList: a.string().array(), // Simple list of names
})
```

**Limitations:**
- Only 4 basic fields
- No detailed scheduling information
- No cast information
- No contact details
- No location details
- No weather integration
- No timezone support
- No notification mechanism

### Related Models
- **Project**: Has `callSheets: a.hasMany('CallSheet', 'projectId')` relationship
- **Notification**: Existing notification system can be leveraged for alerts

---

## PROPOSED SOLUTION

### 1. Enhanced Data Schema

#### CallSheet Model (Primary)
```typescript
CallSheet: a.model({
  // Core Fields
  projectId: a.id().required(),
  project: a.belongsTo('Project', 'projectId'),

  // Production Information
  productionTitle: a.string(),
  productionCompany: a.string(),
  shootDayNumber: a.integer(),
  totalShootDays: a.integer(),
  shootDate: a.date().required(),
  episodeNumber: a.string(),

  // General Call Information
  generalCrewCall: a.time(),
  estimatedWrap: a.time(),
  timezone: a.string(), // IANA timezone (e.g., "America/Los_Angeles")

  // Location Information
  primaryLocation: a.string(),
  primaryLocationAddress: a.string(),
  parkingInstructions: a.string(),
  nearestHospital: a.string(),
  hospitalAddress: a.string(),

  // Weather
  weatherForecast: a.string(),
  temperature: a.string(),
  sunset: a.time(),

  // Production Contacts
  directorName: a.string(),
  directorPhone: a.string(),
  producerName: a.string(),
  producerPhone: a.string(),
  firstADName: a.string(),
  firstADPhone: a.string(),
  productionManagerName: a.string(),
  productionManagerPhone: a.string(),
  productionOfficePhone: a.string(),

  // Additional Information
  mealTimes: a.string(),
  cateringLocation: a.string(),
  transportationNotes: a.string(),
  safetyNotes: a.string(),
  specialInstructions: a.string(),
  nextDaySchedule: a.string(),

  // Metadata
  status: a.enum(['DRAFT', 'PUBLISHED', 'UPDATED', 'CANCELLED']),
  version: a.integer(), // Auto-increment on updates
  publishedAt: a.datetime(),
  lastUpdatedBy: a.string(),

  // Relationships
  scenes: a.hasMany('CallSheetScene', 'callSheetId'),
  castMembers: a.hasMany('CallSheetCast', 'callSheetId'),
  crewMembers: a.hasMany('CallSheetCrew', 'callSheetId'),
  notifications: a.hasMany('CallSheetNotification', 'callSheetId'),
})
```

#### CallSheetScene Model (Related)
```typescript
CallSheetScene: a.model({
  callSheetId: a.id().required(),
  callSheet: a.belongsTo('CallSheet', 'callSheetId'),

  sceneNumber: a.string().required(),
  sceneHeading: a.string(),
  description: a.string(),
  location: a.string(),
  pageCount: a.float(),
  estimatedDuration: a.integer(), // minutes
  scheduledTime: a.time(),
  status: a.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'MOVED']),
  notes: a.string(),

  // Order for display
  sortOrder: a.integer(),
})
```

#### CallSheetCast Model (Related)
```typescript
CallSheetCast: a.model({
  callSheetId: a.id().required(),
  callSheet: a.belongsTo('CallSheet', 'callSheetId'),

  actorName: a.string().required(),
  characterName: a.string(),
  phone: a.string(),
  email: a.string(),

  // Call Times
  makeupCall: a.time(),
  wardrobeCall: a.time(),
  callToSet: a.time(),

  // Logistics
  pickupLocation: a.string(),
  pickupTime: a.time(),

  notes: a.string(),
  sortOrder: a.integer(),
})
```

#### CallSheetCrew Model (Related)
```typescript
CallSheetCrew: a.model({
  callSheetId: a.id().required(),
  callSheet: a.belongsTo('CallSheet', 'callSheetId'),

  name: a.string().required(),
  role: a.string().required(),
  department: a.enum(['CAMERA', 'SOUND', 'LIGHTING', 'GRIP', 'ELECTRIC', 'PRODUCTION', 'ART', 'MAKEUP', 'WARDROBE', 'VFX', 'OTHER']),
  phone: a.string(),
  email: a.string(),
  callTime: a.time(),
  walkieChannel: a.string(),

  notes: a.string(),
  sortOrder: a.integer(),
})
```

#### CallSheetNotification Model (Track who has been notified)
```typescript
CallSheetNotification: a.model({
  callSheetId: a.id().required(),
  callSheet: a.belongsTo('CallSheet', 'callSheetId'),

  userId: a.string().required(),
  userEmail: a.string(),
  userPhone: a.string(),

  notificationType: a.enum(['EMAIL', 'SMS', 'IN_APP']),
  sentAt: a.datetime(),
  deliveredAt: a.datetime(),
  viewedAt: a.datetime(),

  status: a.enum(['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'VIEWED']),
})
```

---

### 2. Real-Time Updates Architecture

**Implementation Strategy:**
- Use AWS AppSync GraphQL subscriptions for live updates
- Clients subscribe to call sheet changes by projectId
- Any update triggers real-time push to all connected clients
- Version tracking prevents conflicts

**Subscription Pattern:**
```typescript
// Client-side subscription
const subscription = client.models.CallSheet.onUpdate({
  filter: { projectId: { eq: currentProjectId } }
}).subscribe({
  next: (data) => {
    // Update UI with new call sheet data
    updateCallSheetDisplay(data);
    showUpdateNotification();
  }
});
```

---

### 3. Multi-Timezone Support

**Implementation Strategy:**
- Store all times in UTC in database
- Store call sheet timezone in `timezone` field (IANA format)
- Client-side conversion using `date-fns-tz` library
- Display toggle: "View in my timezone" vs "View in shoot timezone"

**Example:**
```typescript
import { formatInTimeZone } from 'date-fns-tz';

// Convert UTC time to call sheet timezone
const localCallTime = formatInTimeZone(
  callSheet.generalCrewCall,
  callSheet.timezone,
  'h:mm a zzz'
);

// Convert to user's timezone
const myTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const myLocalTime = formatInTimeZone(
  callSheet.generalCrewCall,
  myTimezone,
  'h:mm a zzz'
);
```

---

### 4. SMS/Email Notifications

**Integration with Existing Notification System:**
- Leverage existing `Notification` table and `notificationGenerator` Lambda
- Create new notification types: `CALL_SHEET_PUBLISHED`, `CALL_SHEET_UPDATED`
- Use AWS SNS for SMS delivery
- Use AWS SES for email delivery

**Notification Triggers:**
1. **Call Sheet Published**: Notify all cast and crew
2. **Call Sheet Updated**: Notify with change summary
3. **Call Sheet Cancelled**: Urgent notification

**Lambda Function:** `callSheetNotifier`
- Triggered when CallSheet status changes to PUBLISHED or UPDATED
- Reads crew/cast email/phone from CallSheetCrew and CallSheetCast
- Sends notifications via SNS (SMS) and SES (Email)
- Creates CallSheetNotification records for tracking

---

### 5. PDF Export

**Implementation Strategy:**
- Use `react-pdf` or `jsPDF` for client-side PDF generation
- Server-side option: AWS Lambda with Puppeteer for high-fidelity PDFs
- Standard call sheet layout template
- Include all sections: header, schedule, cast, crew, locations

**Export Flow:**
```
User clicks "Export PDF"
  → Client calls Lambda function with callSheetId
  → Lambda fetches all related data
  → Renders HTML template
  → Converts to PDF using Puppeteer
  → Uploads to S3
  → Returns download URL
```

---

### 6. UI Components Architecture

#### Component Structure
```
src/app/projects/[id]/call-sheets/
├── page.tsx                          # List all call sheets for project
├── new/
│   └── page.tsx                      # Create new call sheet
├── [callSheetId]/
│   ├── page.tsx                      # View call sheet
│   ├── edit/
│   │   └── page.tsx                  # Edit call sheet
│   └── pdf/
│       └── page.tsx                  # PDF preview/export

src/components/call-sheets/
├── CallSheetForm.tsx                 # Form for creating/editing
├── CallSheetViewer.tsx               # Display call sheet
├── SceneScheduleSection.tsx          # Scene list with times
├── CastSection.tsx                   # Cast list with call times
├── CrewSection.tsx                   # Crew roster
├── LocationSection.tsx               # Location details
├── WeatherSection.tsx                # Weather forecast
├── ContactsSection.tsx               # Key personnel
├── CallSheetPDFTemplate.tsx          # PDF layout
└── TimezoneToggle.tsx                # Switch between timezones
```

#### Key Features
- **Autosave**: Debounced saves while editing
- **Real-time Collaboration**: Show who else is viewing/editing
- **Version History**: View previous versions of call sheet
- **Change Highlights**: Show what changed in updates
- **Mobile Responsive**: Crew views on phones
- **Offline Support**: Cache last version for offline viewing

---

## IMPLEMENTATION PHASES

### Phase 1: Data Schema (Week 1)
- [x] Design enhanced schema
- [ ] Update `amplify/data/resource.ts`
- [ ] Deploy schema changes
- [ ] Test data relationships
- [ ] Verify authorization rules

### Phase 2: Basic UI (Week 1-2)
- [ ] Create CallSheetForm component
- [ ] Create CallSheetViewer component
- [ ] Build scene schedule section
- [ ] Build cast section
- [ ] Build crew section
- [ ] Implement create/read operations

### Phase 3: Real-Time Updates (Week 2)
- [ ] Implement GraphQL subscriptions
- [ ] Add subscription client code
- [ ] Test live updates across multiple clients
- [ ] Add version tracking
- [ ] Handle conflicts

### Phase 4: Timezone Support (Week 2-3)
- [ ] Install `date-fns-tz` library
- [ ] Implement timezone conversion utilities
- [ ] Add timezone selector to form
- [ ] Add "View in my timezone" toggle
- [ ] Test across multiple timezones

### Phase 5: Notifications (Week 3)
- [ ] Create `callSheetNotifier` Lambda function
- [ ] Configure AWS SNS for SMS
- [ ] Configure AWS SES for Email
- [ ] Design email template
- [ ] Design SMS message format
- [ ] Add DynamoDB trigger for call sheet updates
- [ ] Test notification delivery
- [ ] Implement notification tracking

### Phase 6: PDF Export (Week 3-4)
- [ ] Design PDF template layout
- [ ] Implement PDF generation Lambda
- [ ] Add export button to UI
- [ ] Test PDF quality and formatting
- [ ] Add download functionality

### Phase 7: Polish & Testing (Week 4)
- [ ] Mobile optimization
- [ ] Offline support
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Documentation

---

## TECHNICAL CONSIDERATIONS

### Performance
- **Pagination**: Call sheet lists with many items
- **Lazy Loading**: Load scenes/cast/crew on demand
- **Caching**: Cache call sheets for offline viewing
- **Optimistic Updates**: Update UI before server confirmation

### Security
- **Authorization**: Only project members can view call sheets
- **PII Protection**: Phone numbers and emails are sensitive
- **External Sharing**: Secure links with expiration for vendors
- **Audit Trail**: Track who made changes and when

### Scalability
- **DynamoDB GSI**: Index by projectId and shootDate for fast queries
- **S3 for PDFs**: Store generated PDFs in S3 with CloudFront
- **Lambda Concurrency**: Handle notification bursts
- **Rate Limiting**: Prevent notification spam

### Integration Points
- **Weather API**: Auto-populate weather forecast based on location and date
- **Calendar**: Export call sheet to Google Calendar / Outlook
- **Maps**: Link to location in Google Maps / Apple Maps
- **Contacts**: Sync crew contact info from project members

---

## SUCCESS METRICS

### User Adoption
- 80% of projects use call sheets within first month
- 90% of crew view call sheets via mobile
- Average time to create call sheet < 10 minutes

### System Performance
- Real-time updates delivered < 2 seconds
- Notifications sent within 1 minute of update
- PDF generation < 5 seconds
- 99.9% uptime

### User Satisfaction
- Positive feedback on ease of use
- Reduction in missed call times
- Elimination of manual call sheet creation
- Crew reports feeling more informed

---

## RISKS & MITIGATIONS

### Risk 1: SMS Costs
**Impact:** High notification volume = high SMS costs
**Mitigation:**
- Make SMS opt-in
- Default to email + in-app notifications
- Batch notifications (daily digest option)
- Use WhatsApp/Telegram as alternatives

### Risk 2: Timezone Confusion
**Impact:** Crew shows up at wrong time
**Mitigation:**
- Always show both timezones prominently
- Add timezone indicator to all times
- Confirmation prompt when switching timezones
- Clear labeling: "Your time" vs "Shoot location time"

### Risk 3: Data Entry Burden
**Impact:** Producers find it tedious to enter all details
**Mitigation:**
- Auto-populate from project data
- Import from previous call sheets
- Templates for common scenarios
- AI assistant to extract from uploaded documents

### Risk 4: Adoption Resistance
**Impact:** Crew prefers PDFs emailed traditionally
**Mitigation:**
- Support both digital and PDF workflows
- Gradual rollout with pilot teams
- Training and documentation
- Highlight benefits (real-time updates, no lost emails)

---

## FUTURE ENHANCEMENTS

### V2 Features (Post-Launch)
- **Check-in System**: Crew confirms arrival via app
- **Weather Alerts**: Auto-notify if weather changes significantly
- **Traffic Alerts**: Notify crew of delays to location
- **Equipment Integration**: Link to Equipment OS for gear lists
- **Scene Progress**: Mark scenes as completed on call sheet
- **Call Sheet Templates**: Save and reuse common formats
- **Multi-Day Call Sheets**: Week view for series production
- **Talent Agency Integration**: Auto-send to talent agents

### V3 Features (Future)
- **AI Call Sheet Generator**: Generate from shot list and crew availability
- **Smart Scheduling**: Optimize call times based on scene requirements
- **Conflict Detection**: Flag scheduling conflicts with other projects
- **Resource Optimization**: Suggest efficient crew/equipment sharing
- **Predictive Delays**: AI predicts likely delays based on complexity

---

## DEPENDENCIES

### External Services
- **AWS SNS**: SMS notifications
- **AWS SES**: Email notifications
- **Weather API**: OpenWeatherMap or similar
- **Maps API**: Google Maps or Mapbox
- **date-fns-tz**: Timezone handling

### Internal Dependencies
- Notification system (already implemented)
- Project model
- User authentication
- File storage (S3)

---

## CONCLUSION

The Live Call Sheets implementation represents a critical step in eliminating manual production coordination workflows. By providing real-time, timezone-aware, notification-enabled call sheets, SyncOps will become the central hub for production coordination.

**Estimated Timeline:** 4 weeks
**Estimated Effort:** 1 full-time developer
**Impact:** High - Directly addresses producer pain points
**Risk:** Low - Well-understood domain with clear requirements

Next step: User approval to proceed with Phase 1 implementation.

---

## REFERENCES

### Industry Standards
- [How to Make a Call Sheet for a Film: Step-by-Step Guide - MasterClass](https://www.masterclass.com/articles/how-to-make-a-call-sheet-for-a-film)
- [StudioBinder – Online Call Sheet Templates](https://www.studiobinder.com/sample-call-sheet-templates/)
- [Call Sheet: How to Craft It + Free Template Included - Wrapbook](https://www.wrapbook.com/blog/call-sheet)

### Internal Documentation
- syncops_product_requirements.md (FR-12)
- syncops_full_multi_team_user_journey.md (Phase 2.7)
- syncops_locked_brief.md (Section 2.2)

---

**Document Status:** Draft for Review
**Author:** Claude Sonnet 4.5
**Date:** 2025-12-07
