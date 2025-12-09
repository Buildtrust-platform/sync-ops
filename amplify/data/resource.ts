import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { mediaProcessor } from '../function/mediaProcessor/resource';
import { smartBriefAI } from '../function/smartBriefAI/resource';
import { universalSearch } from '../functions/universal-search/resource';

/* * SYNC OPS - DATA SCHEMA
 * This defines the Database (DynamoDB) and Permissions (Cognito)
 */

const schema = a.schema({
  // 1. THE PROJECT HUB
  Project: a.model({
    name: a.string().required(),
    description: a.string(),
    status: a.enum([
      'DEVELOPMENT',        // Phase 1: Smart Brief, Intake, Planning
      'PRE_PRODUCTION',     // Phase 2: Logistics, Permits, Call Sheets
      'PRODUCTION',         // Phase 3: Filming, On-set, Ingest
      'POST_PRODUCTION',    // Phase 4: Editing, VFX, Color, Sound
      'REVIEW_APPROVAL',    // Phase 5: Stakeholder Review & Feedback
      'LEGAL_COMPLIANCE',   // Phase 6: Legal Lock, Rights Clearance
      'DISTRIBUTION',       // Phase 7: Marketing, Delivery, Publishing
      'ARCHIVE'             // Phase 8: Long-term Storage, Glacier
    ]),

    // GOVERNANCE: Lifecycle State Machine (SyncOps Vision)
    // Default value 'INTAKE' will be set at creation time in application logic
    lifecycleState: a.enum([
      'INTAKE',              // Smart Brief being created
      'LEGAL_REVIEW',        // Legal reviewing brief and requirements
      'BUDGET_APPROVAL',     // Finance reviewing and approving budget
      'GREENLIT',            // All approvals granted - ready for pre-production
      'PRE_PRODUCTION',      // Logistics, permits, equipment, call sheets
      'PRODUCTION',          // Active filming/shooting
      'POST_PRODUCTION',     // Editing, VFX, color, sound
      'INTERNAL_REVIEW',     // Internal stakeholder review
      'LEGAL_APPROVED',      // Legal has locked the master
      'DISTRIBUTION_READY',  // Approved for distribution
      'DISTRIBUTED',         // Actively distributed
      'ARCHIVED'             // In long-term storage
    ]),

    // GOVERNANCE: Greenlight Gate Requirements Tracking
    greenlightRequirements: a.json(), // { briefCompleted, legalReviewed, budgetApproved, insuranceUploaded, permitsIdentified }
    greenlightBlockers: a.string().array(), // Array of human-readable blocker messages

    budgetCap: a.float(), // For the "Burn Rate" bar
    deadline: a.date(),   // Drives the Timeline
    department: a.string(), // "Marketing", "HR"

    // EXPANDED: Project Classification
    projectType: a.enum(['COMMERCIAL', 'CORPORATE', 'SOCIAL_MEDIA', 'EVENT', 'TRAINING', 'DOCUMENTARY', 'OTHER']),
    priority: a.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW']),
    confidentiality: a.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'HIGHLY_CONFIDENTIAL']),

    // EXPANDED: Stakeholders (email addresses for now - can link to User model later)
    projectOwnerEmail: a.string(),
    executiveSponsorEmail: a.string(),
    creativeDirectorEmail: a.string(),
    producerEmail: a.string(),
    legalContactEmail: a.string(),
    financeContactEmail: a.string(),
    clientContactEmail: a.string(),

    // EXPANDED: Timeline Milestones
    kickoffDate: a.date(),
    preProductionStartDate: a.date(),
    preProductionEndDate: a.date(),
    productionStartDate: a.date(),
    productionEndDate: a.date(),
    postProductionStartDate: a.date(),
    postProductionEndDate: a.date(),
    reviewDeadline: a.date(),
    legalLockDeadline: a.date(),
    distributionDate: a.date(),

    // EXPANDED: Budget Breakdown
    budgetPreProduction: a.float(),
    budgetProduction: a.float(),
    budgetPostProduction: a.float(),
    budgetDistribution: a.float(),
    budgetContingency: a.float(),
    fundingSource: a.string(), // "Marketing Budget Q4", "HR Training Fund"
    purchaseOrderNumber: a.string(),

    // EXPANDED: Success Metrics
    primaryKPI: a.string(), // "Views", "Engagement", "Conversions"
    targetMetric: a.string(), // "100K views in 30 days"

    // EXPANDED: Greenlight Approvals
    greenlightProducerApproved: a.boolean().default(false),
    greenlightProducerApprovedAt: a.datetime(),
    greenlightProducerApprovedBy: a.string(),
    greenlightProducerComment: a.string(),

    greenlightLegalApproved: a.boolean().default(false),
    greenlightLegalApprovedAt: a.datetime(),
    greenlightLegalApprovedBy: a.string(),
    greenlightLegalComment: a.string(),

    greenlightFinanceApproved: a.boolean().default(false),
    greenlightFinanceApprovedAt: a.datetime(),
    greenlightFinanceApprovedBy: a.string(),
    greenlightFinanceComment: a.string(),

    greenlightExecutiveApproved: a.boolean().default(false),
    greenlightExecutiveApprovedAt: a.datetime(),
    greenlightExecutiveApprovedBy: a.string(),
    greenlightExecutiveComment: a.string(),

    greenlightClientApproved: a.boolean().default(false),
    greenlightClientApprovedAt: a.datetime(),
    greenlightClientApprovedBy: a.string(),
    greenlightClientComment: a.string(),

    greenlightCompletedAt: a.datetime(), // When all approvals were completed

    // FIELD INTELLIGENCE: Situational Awareness for Shoots
    shootLocationCity: a.string(), // Primary shoot location city
    shootLocationCountry: a.string(), // Primary shoot location country
    shootLocationCoordinates: a.string(), // "lat,lng" format for weather API
    fieldIntelligenceLastUpdated: a.datetime(), // When field intelligence was last refreshed
    fieldIntelligenceFeasibilityScore: a.integer(), // 0-100 score based on weather, risks, readiness
    fieldIntelligenceWeatherData: a.json(), // Cached weather forecast data
    fieldIntelligenceRiskAlerts: a.string().array(), // ["High winds expected", "Major event nearby"]
    fieldIntelligenceHealthAlerts: a.string().array(), // ["Air quality poor", "Heat advisory"]

    // Relationships
    assets: a.hasMany('Asset', 'projectId'),
    brief: a.hasOne('Brief', 'projectId'),
    callSheets: a.hasMany('CallSheet', 'projectId'),
    activityLogs: a.hasMany('ActivityLog', 'projectId'),
    reviews: a.hasMany('Review', 'projectId'),
    messages: a.hasMany('Message', 'projectId'),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.owner(), // Creator can do anything
    allow.authenticated().to(['read']), // Logged in users can view projects
    allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 2. THE ASSET (Video Files)
  Asset: a.model({
    projectId: a.id().required(),
    project: a.belongsTo('Project', 'projectId'),

    s3Key: a.string().required(), // The file path in the bucket
    type: a.enum(['RAW', 'MASTER', 'PROXY', 'DOCUMENT', 'PROCESSING']),
    storageClass: a.enum(['STANDARD', 'GLACIER']),
    version: a.integer().default(1),
    usageHeatmap: a.integer().default(0), // ROI Tracking

    // AI/Rekognition metadata
    aiTags: a.string().array(), // Labels detected by Rekognition (e.g., ["Person", "Car", "Building"])
    aiConfidence: a.float(), // Average confidence score from Rekognition (0-100)
    aiProcessedAt: a.datetime(), // When Rekognition analysis completed

    // File metadata
    fileSize: a.integer(), // File size in bytes
    mimeType: a.string(), // MIME type (e.g., "image/jpeg", "video/mp4")
    dimensions: a.string(), // Image/video dimensions (e.g., "1920x1080")
    duration: a.float(), // Video duration in seconds
    thumbnailKey: a.string(), // S3 key for thumbnail image

    // Relationships
    reviews: a.hasMany('Review', 'assetId'),
    versions: a.hasMany('AssetVersion', 'assetId'),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.owner(),
    allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
    allow.groups(['Editor']).to(['create', 'read', 'update']), // Editors can upload, view, and edit
    allow.groups(['Legal']).to(['read']), // Legal can only view
  ]),

  // 3. LOGISTICS (Pre-Prod)
  Brief: a.model({
    projectId: a.id().required(),
    project: a.belongsTo('Project', 'projectId'),

    // Original user input
    projectDescription: a.string(),
    scriptOrNotes: a.string(),

    // AI-extracted fields
    deliverables: a.string().array(),
    estimatedDuration: a.string(),
    targetAudience: a.string(),
    tone: a.string(),
    budgetRange: a.string(),
    crewRoles: a.string().array(),
    distributionChannels: a.string().array(),

    // EXPANDED: Creative Brief Details
    keyMessages: a.string().array(), // Main points to communicate
    brandGuidelines: a.string(), // Link to brand guidelines or description
    inspirationReferences: a.string().array(), // URLs or descriptions of inspiration

    // EXPANDED: Distribution & Format Requirements
    masterFormat: a.string(), // "4K ProRes", "HD H.264", etc.
    socialCropsRequired: a.string().array(), // ["16:9", "9:16", "1:1", "4:5"]
    subtitlesRequired: a.boolean().default(false),
    languageVersions: a.string().array(), // ["EN", "ES", "FR"]
    accessibilityRequired: a.boolean().default(false), // Audio description, etc.
    geoRights: a.string().array(), // ["US", "EU", "Global"]
    embargoDate: a.datetime(), // When can it be published?

    // EXPANDED: Production Details
    talentOnScreen: a.string().array(), // ["John Doe - CEO", "Jane Smith - Presenter"]
    talentVoiceOver: a.string().array(),
    equipmentNeeds: a.json(), // {cameras: 2, lighting: true, audio: "boom+lavs", drones: true}
    locationDetails: a.json(), // Array of {name, address, permitRequired, insurance}

    // Risk assessment
    riskLevel: a.enum(['LOW', 'MEDIUM', 'HIGH']),
    hasDroneRisk: a.boolean(),
    hasMinorRisk: a.boolean(),
    hasPublicSpaceRisk: a.boolean(),
    hasStuntRisk: a.boolean(),
    hasHazardousLocationRisk: a.boolean(),
    requiredPermits: a.string().array(),

    // EXPANDED: Compliance & Legal
    insuranceRequired: a.boolean().default(false),
    safetyOfficerNeeded: a.boolean().default(false),
    covidProtocolsRequired: a.boolean().default(false),
    unionRules: a.string().array(), // ["SAG-AFTRA", "DGA"]
    copyrightOwnership: a.enum(['COMPANY', 'CLIENT', 'SHARED']),
    usageRightsDuration: a.string(), // "Perpetual", "1 Year", etc.
    musicLicensing: a.enum(['LICENSED', 'ROYALTY_FREE', 'ORIGINAL_SCORE', 'NONE']),
    stockFootageNeeded: a.boolean().default(false),
    talentReleasesRequired: a.boolean().default(false),
    locationReleasesRequired: a.boolean().default(false),

    // Scene breakdown
    scenes: a.json(), // Array of {description, location, props}
    complexity: a.enum(['LOW', 'MEDIUM', 'HIGH']),

    // Approval tracking
    aiProcessedAt: a.datetime(),
    approvedByProducer: a.boolean(),
    approvedByLegal: a.boolean(),
    approvedByFinance: a.boolean(),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.authenticated(),
  ]),

  // CALL SHEETS - Live Production Coordination (PRD FR-12)
  CallSheet: a.model({
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
    generalCrewCall: a.string(), // Time stored as string (HH:mm format)
    estimatedWrap: a.string(),
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
    sunset: a.string(),

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
    version: a.integer().default(1),
    publishedAt: a.datetime(),
    lastUpdatedBy: a.string(),

    // Relationships
    scenes: a.hasMany('CallSheetScene', 'callSheetId'),
    castMembers: a.hasMany('CallSheetCast', 'callSheetId'),
    crewMembers: a.hasMany('CallSheetCrew', 'callSheetId'),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.authenticated(),
  ]),

  CallSheetScene: a.model({
    callSheetId: a.id().required(),
    callSheet: a.belongsTo('CallSheet', 'callSheetId'),

    sceneNumber: a.string().required(),
    sceneHeading: a.string(),
    description: a.string(),
    location: a.string(),
    pageCount: a.float(),
    estimatedDuration: a.integer(), // minutes
    scheduledTime: a.string(), // Time stored as string (HH:mm format)
    status: a.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'MOVED']),
    notes: a.string(),
    sortOrder: a.integer(),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.authenticated(),
  ]),

  CallSheetCast: a.model({
    callSheetId: a.id().required(),
    callSheet: a.belongsTo('CallSheet', 'callSheetId'),

    actorName: a.string().required(),
    characterName: a.string(),
    phone: a.string(),
    email: a.string(),

    // Call Times
    makeupCall: a.string(), // Time stored as string (HH:mm format)
    wardrobeCall: a.string(),
    callToSet: a.string(),

    // Logistics
    pickupLocation: a.string(),
    pickupTime: a.string(),

    notes: a.string(),
    sortOrder: a.integer(),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.authenticated(),
  ]),

  CallSheetCrew: a.model({
    callSheetId: a.id().required(),
    callSheet: a.belongsTo('CallSheet', 'callSheetId'),

    name: a.string().required(),
    role: a.string().required(),
    department: a.enum(['CAMERA', 'SOUND', 'LIGHTING', 'GRIP', 'ELECTRIC', 'PRODUCTION', 'ART', 'MAKEUP', 'WARDROBE', 'VFX', 'OTHER']),
    phone: a.string(),
    email: a.string(),
    callTime: a.string(), // Time stored as string (HH:mm format)
    walkieChannel: a.string(),

    notes: a.string(),
    sortOrder: a.integer(),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.authenticated(),
  ]),

  // 4. REVIEW & APPROVAL SYSTEM (PRD FR-24 to FR-27)
  Review: a.model({
    assetId: a.id().required(),
    asset: a.belongsTo('Asset', 'assetId'),
    projectId: a.id().required(),
    project: a.belongsTo('Project', 'projectId'),

    // Reviewer information
    reviewerId: a.string().required(), // Cognito user ID
    reviewerEmail: a.string().required(),
    reviewerRole: a.enum(['INTERNAL', 'CLIENT', 'LEGAL', 'COMPLIANCE']),

    // Review status
    status: a.enum(['IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED']),

    // Legal lock (PRD FR-27: Legal Approval Lock - immutable)
    isLegalApproved: a.boolean().default(false),
    legalApprovedAt: a.datetime(),
    legalApprovedBy: a.string(),

    // Relationships
    comments: a.hasMany('ReviewComment', 'reviewId'),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.owner(), // Reviewer owns their review
    allow.authenticated().to(['read']), // All authenticated users can view reviews
    allow.groups(['Admin', 'Legal']).to(['create', 'read', 'update', 'delete']),
  ]),

  // PRD FR-24: Time-coded comments
  ReviewComment: a.model({
    reviewId: a.id().required(),
    review: a.belongsTo('Review', 'reviewId'),
    assetId: a.id().required(),
    projectId: a.id().required(),

    // Comment metadata
    commenterId: a.string().required(), // Cognito user ID
    commenterEmail: a.string().required(),
    commenterRole: a.string(),

    // Time-coded position (for video/audio)
    timecode: a.float(), // Position in seconds (e.g., 45.5 = 00:45.5)
    timecodeFormatted: a.string(), // Human-readable format (e.g., "00:00:45.5")

    // Comment content
    commentText: a.string().required(),
    commentType: a.enum(['NOTE', 'ISSUE', 'APPROVAL', 'REJECTION']),
    priority: a.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),

    // Thread management (PRD FR-24: resolve/reopen threads)
    isResolved: a.boolean().default(false),
    resolvedAt: a.datetime(),
    resolvedBy: a.string(),

    // Attachments
    attachmentKeys: a.string().array(), // S3 keys for attached files/screenshots

    // Relationships
    replies: a.hasMany('ReviewCommentReply', 'parentCommentId'),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.owner(),
    allow.authenticated().to(['read', 'create']),
    allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
  ]),

  // Threaded replies to comments
  ReviewCommentReply: a.model({
    parentCommentId: a.id().required(),
    parentComment: a.belongsTo('ReviewComment', 'parentCommentId'),

    replierId: a.string().required(),
    replierEmail: a.string().required(),
    replierRole: a.string(),

    replyText: a.string().required(),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.owner(),
    allow.authenticated().to(['read', 'create']),
    allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 5. VERSION MANAGEMENT (PRD FR-20, FR-21)
  AssetVersion: a.model({
    assetId: a.id().required(), // Parent asset
    asset: a.belongsTo('Asset', 'assetId'),
    projectId: a.id().required(),

    versionNumber: a.integer().required(), // v1, v2, v3, etc.
    versionLabel: a.string(), // "Final Cut", "Client Review v2", etc.

    s3Key: a.string().required(), // S3 path for this version
    fileSize: a.integer(),
    mimeType: a.string(),

    // Change tracking (PRD FR-21: side-by-side comparison)
    changeDescription: a.string(), // What changed from previous version
    previousVersionId: a.id(), // Link to previous version for comparison

    // Status
    isCurrentVersion: a.boolean().default(false),
    isReviewReady: a.boolean().default(false), // PRD: No version shareable until marked "Review Ready"

    // Creator
    createdBy: a.string().required(),
    createdByEmail: a.string(),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.authenticated().to(['read']),
    allow.groups(['Admin', 'Editor']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 6. ACTIVITY LOG (Audit Trail)
  ActivityLog: a.model({
    projectId: a.id().required(),
    project: a.belongsTo('Project', 'projectId'),

    userId: a.string().required(), // Cognito user ID
    userEmail: a.string(), // User email for display
    userRole: a.string(), // User's role at time of action

    action: a.enum([
      'ASSET_UPLOADED',
      'ASSET_DELETED',
      'ASSET_UPDATED',
      'PROJECT_CREATED',
      'PROJECT_UPDATED',
      'PROJECT_DELETED',
      'USER_ADDED',
      'USER_REMOVED',
      'PERMISSION_CHANGED',
      'AI_PROCESSING_STARTED',
      'AI_PROCESSING_COMPLETED',
      'REVIEW_CREATED',
      'REVIEW_COMPLETED',
      'COMMENT_ADDED',
      'COMMENT_RESOLVED',
      'VERSION_CREATED',
      'LEGAL_APPROVED',
      'LEGAL_REJECTED',
      // Lifecycle state transitions
      'LIFECYCLE_STATE_CHANGED',
      'GREENLIGHT_APPROVED',
      'GREENLIGHT_REJECTED',
      'REQUIREMENTS_UPDATED',
    ]),

    targetType: a.string(), // 'Asset', 'Project', 'User', 'Review', 'Comment'
    targetId: a.string(), // ID of affected resource
    targetName: a.string(), // Friendly name for display

    metadata: a.json(), // Additional context (e.g., old/new values)
    ipAddress: a.string(), // Security tracking
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.authenticated().to(['read']),
    allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 7. COMMUNICATION LAYER (PRD FR-28 to FR-30)
  Message: a.model({
    projectId: a.id().required(),
    project: a.belongsTo('Project', 'projectId'),

    // Asset-level messages (optional - for time-coded asset discussions)
    assetId: a.id(), // Optional: If message is about a specific asset
    timecode: a.float(), // Optional: If message references a specific time in video
    timecodeFormatted: a.string(), // Human-readable format (e.g., "00:01:23")

    // Message content
    senderId: a.string().required(), // Cognito user ID
    senderEmail: a.string().required(),
    senderName: a.string(),
    senderRole: a.string(), // User's role (Producer, Legal, etc.)

    messageText: a.string().required(),
    messageType: a.enum(['GENERAL', 'TASK', 'ALERT', 'APPROVAL_REQUEST', 'FILE_SHARE']),
    priority: a.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),

    // Threading
    parentMessageId: a.id(), // For threaded discussions
    threadDepth: a.integer().default(0), // 0 = top-level, 1+ = reply depth

    // Attachments
    attachmentKeys: a.string().array(), // S3 keys for files
    attachmentNames: a.string().array(), // Original file names

    // Task conversion (PRD FR-30: Message → Task)
    convertedToTask: a.boolean().default(false),
    taskId: a.string(), // Future: Link to Task model
    taskAssignedTo: a.string(),
    taskDeadline: a.datetime(),

    // Status
    isEdited: a.boolean().default(false),
    editedAt: a.datetime(),
    isDeleted: a.boolean().default(false),
    deletedAt: a.datetime(),

    // Read receipts
    readBy: a.string().array(), // Array of user IDs who read this

    // Mentions
    mentionedUsers: a.string().array(), // Array of user IDs mentioned with @
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.owner(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 8. NOTIFICATION CENTER (PRD FR-29, FR-30)
  Notification: a.model({
    userId: a.string().required(), // Cognito user ID of recipient

    // Notification content
    type: a.enum([
      'MESSAGE',              // New message in project chat
      'MENTION',              // You were @mentioned
      'TASK_ASSIGNED',        // Task assigned to you
      'TASK_DUE_SOON',        // Task deadline approaching
      'APPROVAL_REQUESTED',   // Your approval needed
      'APPROVAL_GRANTED',     // Your approval request was granted
      'APPROVAL_DENIED',      // Your approval request was denied
      'COMMENT_ADDED',        // New comment on asset you're watching
      'COMMENT_REPLY',        // Reply to your comment
      'ASSET_UPLOADED',       // New asset uploaded to project
      'LIFECYCLE_CHANGED',    // Project state changed
      'GREENLIGHT_APPROVED',  // Project greenlit
      'LEGAL_LOCK',           // Asset legally locked
      'REVIEW_ASSIGNED',      // Review assigned to you
      'DEADLINE_APPROACHING', // Project/shoot deadline near
      'FIELD_ALERT',          // Weather/risk alert for shoot
    ]),

    title: a.string().required(),
    message: a.string().required(),

    // Links and actions
    actionUrl: a.string(), // Where to go when clicked (e.g., /projects/123/assets/456)
    actionLabel: a.string(), // Button text (e.g., "View Asset", "Approve Now")

    // Source tracking
    projectId: a.id(),
    projectName: a.string(),
    assetId: a.id(),
    assetName: a.string(),
    messageId: a.id(),
    reviewId: a.id(),
    senderId: a.string(), // Who triggered this notification
    senderEmail: a.string(),
    senderName: a.string(),

    // Status
    isRead: a.boolean().default(false),
    readAt: a.datetime(),

    // Multi-channel delivery (PRD FR-30: Slack/Teams/Email/SMS integrations)
    deliveryChannels: a.string().array(), // ['IN_APP', 'EMAIL', 'SLACK', 'SMS']
    emailSent: a.boolean().default(false),
    emailSentAt: a.datetime(),
    slackSent: a.boolean().default(false),
    slackSentAt: a.datetime(),
    smsSent: a.boolean().default(false),
    smsSentAt: a.datetime(),

    // Priority for sorting
    priority: a.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),

    // Expiration (auto-delete old notifications)
    expiresAt: a.datetime(),
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.owner(), // User can only see their own notifications
    allow.authenticated().to(['read', 'update']), // Can mark as read
    allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 9. TASK SYSTEM (Section 5, Final Locked Brief)
  // Tasks linked to assets, timestamps, comments, or messages
  Task: a.model({
    projectId: a.id().required(),

    // Task content
    title: a.string().required(),
    description: a.string(),

    // Task type and source
    taskType: a.enum([
      'GENERAL',           // Manually created task
      'FROM_COMMENT',      // Auto-created from review comment
      'FROM_MESSAGE',      // Auto-created from message
      'APPROVAL',          // Approval task
      'REVIEW',            // Review task
      'UPLOAD',            // Upload task
      'TECHNICAL',         // Technical/QC task
      'CREATIVE',          // Creative feedback task
      'LEGAL',             // Legal review task
      'COMPLIANCE'         // Compliance check task
    ]),

    // Source tracking (where did this task come from?)
    sourceCommentId: a.id(), // If created from a comment
    sourceMessageId: a.id(), // If created from a message
    sourceAssetId: a.id(),   // Related asset

    // Asset/timestamp linking (PRD: Tasks linked to specific assets or timestamps)
    linkedAssetId: a.id(),
    linkedAssetName: a.string(),
    linkedTimecode: a.float(), // Position in seconds for video/audio tasks
    linkedTimecodeFormatted: a.string(), // Human-readable (e.g., "00:02:15")

    // Assignment
    assignedToEmail: a.string(), // Who should do this task
    assignedToName: a.string(),
    assignedBy: a.string(),      // Who assigned it
    assignedByEmail: a.string(),
    assignedAt: a.datetime(),

    // Priority and status
    priority: a.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
    status: a.enum([
      'TODO',
      'IN_PROGRESS',
      'BLOCKED',
      'IN_REVIEW',
      'COMPLETED',
      'CANCELLED'
    ]),

    // Dates
    dueDate: a.datetime(),
    startDate: a.datetime(),
    completedAt: a.datetime(),
    completedBy: a.string(),
    completedByEmail: a.string(),

    // Blockers and dependencies (PRD: Blockers and dependencies)
    blockedBy: a.string().array(), // Array of task IDs that block this task
    blockedReason: a.string(),     // Why is this blocked?
    dependsOn: a.string().array(), // Array of task IDs this depends on

    // Progress tracking
    progressPercentage: a.integer(), // 0-100
    estimatedHours: a.float(),
    actualHours: a.float(),

    // Creator info
    createdBy: a.string().required(),
    createdByEmail: a.string(),

    // Tags for filtering
    tags: a.string().array(), // ['color-correction', 'urgent', 'client-feedback']

    // Attachments
    attachmentKeys: a.string().array(), // S3 keys for files
  })
  .authorization(allow => [
    allow.publicApiKey(), // TEMPORARY: Allow public access for development
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer', 'ProjectManager']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 10. CUSTOM QUERIES
  analyzeProjectBrief: a
    .query()
    .arguments({
      projectDescription: a.string().required(),
      scriptOrNotes: a.string(),
    })
    .returns(a.json())
    .handler(a.handler.function(smartBriefAI))
    .authorization(allow => [
      allow.publicApiKey(), // TEMPORARY: Allow public access for development
      allow.authenticated(),
    ]),

  // UNIVERSAL SEARCH (Section 5, Final Locked Brief)
  // UNIVERSAL SEARCH - Search across all entities
  universalSearch: a
    .query()
    .arguments({
      query: a.string().required(),
      limit: a.integer(),
    })
    .returns(a.json())
    .handler(a.handler.function(universalSearch))
    .authorization(allow => [
      allow.publicApiKey(),
      allow.authenticated(),
    ]),
})
.authorization(allow => [allow.resource(mediaProcessor)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey', // TEMPORARY: Use API key for development
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});