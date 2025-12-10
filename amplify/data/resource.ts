import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { mediaProcessor } from '../function/mediaProcessor/resource';
import { smartBriefAI } from '../function/smartBriefAI/resource';
import { feedbackSummarizer } from '../function/feedbackSummarizer/resource';
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

  // 10. EQUIPMENT OS (Module 4 - Pre-Production Logistics)
  // Equipment inventory management with check-in/check-out tracking
  Equipment: a.model({
    // Basic Information
    name: a.string().required(),
    description: a.string(),
    category: a.enum([
      'CAMERA',
      'LENS',
      'LIGHTING',
      'AUDIO',
      'GRIP',
      'ELECTRIC',
      'MONITORS',
      'STORAGE',
      'DRONES',
      'STABILIZERS',
      'ACCESSORIES',
      'VEHICLES',
      'OTHER'
    ]),
    subcategory: a.string(), // e.g., "Prime Lens", "LED Panel", "Wireless Mic"

    // Identification
    serialNumber: a.string(),
    assetTag: a.string(), // Internal tracking number
    barcode: a.string(), // For scanning

    // Ownership & Status
    ownershipType: a.enum(['OWNED', 'RENTED', 'LEASED', 'BORROWED']),
    status: a.enum([
      'AVAILABLE',
      'CHECKED_OUT',
      'IN_MAINTENANCE',
      'DAMAGED',
      'LOST',
      'RETIRED'
    ]),
    condition: a.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEEDS_REPAIR']),

    // Financial
    purchasePrice: a.float(),
    purchaseDate: a.date(),
    replacementValue: a.float(),
    rentalRate: a.float(), // Daily rental rate if applicable
    insuranceValue: a.float(),
    insurancePolicyNumber: a.string(),

    // Technical Specs
    manufacturer: a.string(),
    model: a.string(),
    specifications: a.json(), // Flexible JSON for category-specific specs

    // Location & Storage
    storageLocation: a.string(), // "Warehouse A, Shelf 3"
    homeBase: a.string(), // Default location when not in use

    // Maintenance
    lastMaintenanceDate: a.date(),
    nextMaintenanceDate: a.date(),
    maintenanceNotes: a.string(),
    calibrationDate: a.date(), // For cameras, monitors, etc.

    // Images
    imageKey: a.string(), // S3 key for equipment photo

    // Relationships
    checkouts: a.hasMany('EquipmentCheckout', 'equipmentId'),
    kitItems: a.hasMany('EquipmentKitItem', 'equipmentId'),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read']),
    allow.groups(['Admin', 'Producer', 'EquipmentManager']).to(['create', 'read', 'update', 'delete']),
  ]),

  // Equipment checkout/check-in tracking
  EquipmentCheckout: a.model({
    equipmentId: a.id().required(),
    equipment: a.belongsTo('Equipment', 'equipmentId'),
    projectId: a.id(), // Optional - may be checked out for non-project use

    // Who
    checkedOutBy: a.string().required(), // User email
    checkedOutByName: a.string(),
    approvedBy: a.string(), // Manager who approved
    returnedBy: a.string(),

    // When
    checkoutDate: a.datetime().required(),
    expectedReturnDate: a.datetime(),
    actualReturnDate: a.datetime(),

    // Status
    status: a.enum(['CHECKED_OUT', 'RETURNED', 'OVERDUE', 'LOST']),

    // Condition tracking
    conditionAtCheckout: a.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
    conditionAtReturn: a.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
    conditionNotes: a.string(),
    damageReported: a.boolean().default(false),
    damageDescription: a.string(),

    // Purpose
    purpose: a.string(), // "Principal Photography", "B-Roll Shoot", etc.
    shootLocation: a.string(),

    // Signature/Confirmation
    checkoutSignature: a.string(), // Could be S3 key for signature image
    returnSignature: a.string(),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer', 'EquipmentManager']).to(['create', 'read', 'update', 'delete']),
  ]),

  // Equipment Kits - Pre-configured packages
  EquipmentKit: a.model({
    name: a.string().required(), // "A-Camera Package", "Audio Kit"
    description: a.string(),
    category: a.enum([
      'CAMERA_PACKAGE',
      'LIGHTING_PACKAGE',
      'AUDIO_PACKAGE',
      'GRIP_PACKAGE',
      'DRONE_PACKAGE',
      'INTERVIEW_KIT',
      'RUN_AND_GUN',
      'STUDIO_KIT',
      'CUSTOM'
    ]),

    // Kit items linked separately
    kitContents: a.hasMany('EquipmentKitItem', 'kitId'),

    // Status
    isActive: a.boolean().default(true),

    // Templates
    isTemplate: a.boolean().default(false), // Can be used as starting point for new kits

    // Totals (calculated/cached)
    totalValue: a.float(),
    itemCount: a.integer(),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read']),
    allow.groups(['Admin', 'Producer', 'EquipmentManager']).to(['create', 'read', 'update', 'delete']),
  ]),

  // Items within a kit
  EquipmentKitItem: a.model({
    kitId: a.id().required(),
    kit: a.belongsTo('EquipmentKit', 'kitId'),
    equipmentId: a.id().required(),
    equipment: a.belongsTo('Equipment', 'equipmentId'),

    quantity: a.integer().default(1),
    isRequired: a.boolean().default(true), // Required vs optional item
    notes: a.string(),
    sortOrder: a.integer(),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read']),
    allow.groups(['Admin', 'Producer', 'EquipmentManager']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 11. DIGITAL RIGHTS LOCKER (Module 6 - Legal Document Management)
  // Centralized storage for all production legal documents
  RightsDocument: a.model({
    // Basic Information
    name: a.string().required(),
    description: a.string(),
    documentType: a.enum([
      'LOCATION_PERMIT',
      'TALENT_RELEASE',
      'MODEL_RELEASE',
      'MINOR_RELEASE',
      'PROPERTY_RELEASE',
      'DRONE_PERMIT',
      'FILMING_PERMIT',
      'INSURANCE_CERTIFICATE',
      'LIABILITY_WAIVER',
      'NDA',
      'CONTRACT',
      'WORK_PERMIT',
      'VISA',
      'RISK_ASSESSMENT',
      'SAFETY_PLAN',
      'MUSIC_LICENSE',
      'STOCK_LICENSE',
      'ARCHIVE_LICENSE',
      'DISTRIBUTION_AGREEMENT',
      'OTHER'
    ]),

    // Status Workflow
    status: a.enum([
      'DRAFT',
      'PENDING_REVIEW',
      'PENDING_SIGNATURE',
      'APPROVED',
      'REJECTED',
      'EXPIRED',
      'REVOKED'
    ]),

    // Dates
    issueDate: a.date(),
    effectiveDate: a.date(),
    expirationDate: a.date(),
    renewalDate: a.date(), // For recurring documents

    // Linkage (Project → Shoot Day → Location → Person)
    projectId: a.id().required(),
    shootDay: a.string(), // Optional - specific shoot day
    locationName: a.string(), // Location this document covers
    locationAddress: a.string(),
    personName: a.string(), // Person this document covers (talent, crew)
    personEmail: a.string(),
    personRole: a.string(), // Actor, Extra, Crew, Location Owner, etc.

    // Document Details
    documentNumber: a.string(), // Permit number, contract ID, etc.
    issuingAuthority: a.string(), // FilmLA, Borough Council, etc.
    jurisdiction: a.string(), // Country/State/City

    // Coverage Details
    coverageType: a.string(), // "All locations", "Interior only", etc.
    coverageAmount: a.string(), // For insurance: "$1M liability"
    restrictions: a.string(), // Any limitations noted in document

    // File Storage
    fileKey: a.string(), // S3 key for uploaded document
    fileName: a.string(),
    fileSize: a.integer(),
    mimeType: a.string(),
    thumbnailKey: a.string(), // Preview thumbnail

    // Approval Workflow
    uploadedBy: a.string().required(),
    uploadedByName: a.string(),
    reviewedBy: a.string(),
    reviewedByName: a.string(),
    reviewDate: a.datetime(),
    approvedBy: a.string(),
    approvedByName: a.string(),
    approvalDate: a.datetime(),
    rejectionReason: a.string(),

    // Notes & Tags
    notes: a.string(),
    tags: a.string().array(), // For filtering: ["outdoor", "drone", "night"]
    isRequired: a.boolean().default(false), // Required for Greenlight Gate
    isCritical: a.boolean().default(false), // Production cannot proceed without

    // Version Control
    version: a.integer().default(1),
    previousVersionId: a.id(),
    isLatestVersion: a.boolean().default(true),

    // Reminders
    reminderDays: a.integer(), // Days before expiration to remind
    lastReminderSent: a.datetime(),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer', 'Legal', 'ProjectManager']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 12. DISTRIBUTION ENGINE (Module 9 - Secure Streaming & Distribution)
  // Manages secure link sharing, watermarked playback, and distribution tracking
  DistributionLink: a.model({
    // Basic Information
    name: a.string().required(),
    description: a.string(),

    // Link Configuration
    linkType: a.enum([
      'REVIEW',           // For stakeholder review
      'CLIENT_PREVIEW',   // For client previews
      'PRESS',            // For press/media
      'PARTNER',          // For distribution partners
      'INTERNAL',         // Internal sharing
      'PUBLIC',           // Public release
      'SCREENER',         // Festival/awards screener
      'INVESTOR',         // Investor preview
    ]),

    // Security Settings
    accessCode: a.string(), // Optional password protection
    isPasswordProtected: a.boolean().default(false),
    maxViews: a.integer(), // Maximum number of views allowed (null = unlimited)
    currentViews: a.integer().default(0),

    // Expiration
    expiresAt: a.datetime(),
    isExpired: a.boolean().default(false),

    // Geo-Rights Enforcement (FR-32)
    geoRestriction: a.enum(['NONE', 'ALLOW_LIST', 'BLOCK_LIST']),
    allowedCountries: a.string().array(), // ISO country codes
    blockedCountries: a.string().array(), // ISO country codes

    // Watermark Settings (FR-31)
    isWatermarked: a.boolean().default(true),
    watermarkType: a.enum(['VISIBLE', 'FORENSIC', 'BOTH']),
    watermarkText: a.string(), // Custom watermark text (e.g., recipient email)
    watermarkPosition: a.enum(['TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT', 'CENTER', 'DIAGONAL']),
    watermarkOpacity: a.float(), // 0.0 to 1.0

    // Content
    projectId: a.id().required(),
    assetId: a.id(), // Specific asset to share (optional)
    assetVersionId: a.id(), // Specific version to share (optional)
    playlistAssetIds: a.string().array(), // For sharing multiple assets

    // Recipient Information
    recipientEmail: a.string(),
    recipientName: a.string(),
    recipientCompany: a.string(),
    recipientRole: a.string(), // Reviewer, Client, Press, etc.

    // Notification Settings
    notifyOnView: a.boolean().default(true),
    notifyOnDownload: a.boolean().default(true),

    // Permissions
    allowDownload: a.boolean().default(false),
    allowShare: a.boolean().default(false),
    downloadResolution: a.enum(['PROXY', 'HD', 'FULL_RES']),

    // Stream Quality
    streamQuality: a.enum(['AUTO', 'SD', 'HD', 'UHD_4K']),

    // Tracking
    createdBy: a.string().required(),
    createdByEmail: a.string(),
    lastAccessedAt: a.datetime(),
    lastAccessedBy: a.string(),
    lastAccessedFrom: a.string(), // IP or location

    // Status
    status: a.enum(['ACTIVE', 'PAUSED', 'EXPIRED', 'REVOKED']),
    revokedAt: a.datetime(),
    revokedBy: a.string(),
    revokedReason: a.string(),

    // Analytics
    totalViewDuration: a.integer(), // Total seconds watched
    averageViewDuration: a.integer(), // Average seconds per view
    completionRate: a.float(), // Percentage of content viewed

    // Unique token for URL
    accessToken: a.string().required(), // UUID for secure URL

    // Relationships
    viewLogs: a.hasMany('DistributionViewLog', 'distributionLinkId'),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer', 'Marketing']).to(['create', 'read', 'update', 'delete']),
  ]),

  // View logs for distribution links (analytics and audit trail)
  DistributionViewLog: a.model({
    distributionLinkId: a.id().required(),
    distributionLink: a.belongsTo('DistributionLink', 'distributionLinkId'),

    // Viewer Information
    viewerEmail: a.string(), // If known
    viewerName: a.string(),
    viewerIP: a.string(),
    viewerCountry: a.string(), // Detected from IP
    viewerCity: a.string(),
    viewerDevice: a.string(), // Device type
    viewerBrowser: a.string(),
    viewerOS: a.string(),

    // Session Information
    sessionId: a.string().required(),
    startTime: a.datetime().required(),
    endTime: a.datetime(),
    duration: a.integer(), // Seconds watched

    // Playback Details
    percentageWatched: a.float(), // 0-100
    seekEvents: a.integer(), // Number of seek operations
    pauseEvents: a.integer(), // Number of pauses
    playbackSpeed: a.float(), // Last playback speed used

    // Quality
    qualityChanges: a.integer(), // Number of quality changes
    averageBitrate: a.integer(), // Average bitrate in kbps
    bufferingEvents: a.integer(),
    bufferingDuration: a.integer(), // Total buffering time in ms

    // Security Events
    downloadAttempted: a.boolean().default(false),
    screenshotAttempted: a.boolean().default(false), // If detected

    // Geo-Restriction Events
    geoBlocked: a.boolean().default(false),
    geoBlockReason: a.string(),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create']),
    allow.groups(['Admin', 'Producer', 'Marketing']).to(['create', 'read', 'update', 'delete']),
  ]),

  // Social Output Configuration (FR-33)
  SocialOutput: a.model({
    // Basic Information
    name: a.string().required(),
    description: a.string(),

    // Source
    projectId: a.id().required(),
    sourceAssetId: a.id().required(),
    sourceVersionId: a.id(),

    // Output Configuration
    platform: a.enum([
      'YOUTUBE',
      'VIMEO',
      'FACEBOOK',
      'INSTAGRAM_FEED',
      'INSTAGRAM_STORY',
      'INSTAGRAM_REELS',
      'TIKTOK',
      'TWITTER',
      'LINKEDIN',
      'WEBSITE',
      'CMS',
      'OTHER',
    ]),

    // Crop/Aspect Ratio (FR-33: Auto-crops)
    aspectRatio: a.enum(['LANDSCAPE_16_9', 'PORTRAIT_9_16', 'SQUARE_1_1', 'PORTRAIT_4_5', 'STANDARD_4_3', 'CINEMATIC_21_9', 'CUSTOM']),
    customWidth: a.integer(),
    customHeight: a.integer(),
    cropPosition: a.enum(['CENTER', 'TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'CUSTOM']),
    cropX: a.integer(), // For custom positioning
    cropY: a.integer(),

    // Duration
    maxDuration: a.integer(), // Max seconds for platform (e.g., 60 for Instagram)
    trimStart: a.float(), // Start trim point in seconds
    trimEnd: a.float(), // End trim point in seconds

    // Captions/Subtitles (FR-33)
    includeCaptions: a.boolean().default(false),
    captionLanguage: a.string(), // ISO language code
    captionStyle: a.enum(['BURNED_IN', 'EMBEDDED', 'SIDECAR']),
    captionFileKey: a.string(), // S3 key for caption file (.srt, .vtt)

    // Subtitles
    includeSubtitles: a.boolean().default(false),
    subtitleLanguages: a.string().array(), // Multiple language support

    // Audio
    audioTrack: a.enum(['ORIGINAL', 'MUSIC_ONLY', 'VO_ONLY', 'MIX', 'MUTED']),
    normalizeAudio: a.boolean().default(true),
    targetLoudness: a.float(), // LUFS value

    // Visual
    addWatermark: a.boolean().default(false),
    watermarkKey: a.string(), // S3 key for watermark image
    addEndCard: a.boolean().default(false),
    endCardKey: a.string(), // S3 key for end card
    endCardDuration: a.integer(), // Seconds

    // Output
    outputFormat: a.enum(['MP4', 'MOV', 'WEBM', 'GIF']),
    outputCodec: a.enum(['H264', 'H265', 'VP9', 'AV1']),
    outputBitrate: a.string(), // e.g., "8M", "15M"
    outputResolution: a.enum(['SD', 'HD', 'FHD', 'UHD_4K', 'CUSTOM']),

    // Processing Status
    status: a.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']),
    processingStartedAt: a.datetime(),
    processingCompletedAt: a.datetime(),
    processingError: a.string(),
    processingProgress: a.integer(), // 0-100

    // Output File
    outputFileKey: a.string(), // S3 key for output file
    outputFileSize: a.integer(),
    outputDuration: a.float(),

    // CMS Integration (FR-33: CMS exports)
    cmsIntegration: a.string(), // CMS name/type
    cmsEndpoint: a.string(),
    cmsPublishStatus: a.enum(['NOT_PUBLISHED', 'PUBLISHING', 'PUBLISHED', 'FAILED']),
    cmsPublishedAt: a.datetime(),
    cmsPublishedUrl: a.string(),

    // Social Media Post Content
    postCaption: a.string(), // The caption/text for the social post
    postHashtags: a.string().array(), // Array of hashtags
    postMentions: a.string().array(), // Array of @mentions
    postLocation: a.string(), // Location tag for the post
    postTitle: a.string(), // Title (for YouTube, LinkedIn)
    postDescription: a.string(), // Description (for YouTube, Vimeo)
    postTags: a.string().array(), // Platform tags (for YouTube)
    postCategory: a.string(), // Category (for YouTube)
    postPrivacy: a.enum(['PUBLIC', 'UNLISTED', 'PRIVATE', 'FRIENDS_ONLY']),
    postThumbnailKey: a.string(), // Custom thumbnail S3 key
    postCallToAction: a.string(), // CTA button text
    postCallToActionUrl: a.string(), // CTA link URL

    // Social Publishing Status
    socialPublishStatus: a.enum(['DRAFT', 'READY', 'PUBLISHING', 'PUBLISHED', 'SCHEDULED', 'FAILED']),
    socialPublishedAt: a.datetime(),
    socialPublishedUrl: a.string(), // URL of the published post
    socialPostId: a.string(), // Platform's post ID
    socialPublishError: a.string(),

    // Scheduling
    scheduledPublishAt: a.datetime(),
    isScheduled: a.boolean().default(false),

    // Creator
    createdBy: a.string().required(),
    createdByEmail: a.string(),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer', 'Marketing', 'Editor']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 13. ARCHIVE & ASSET INTELLIGENCE (Module 10 - FR-34 to FR-36)
  // Manages intelligent storage tiering, asset analytics, and quality scoring

  // Archive Policy - Defines rules for automatic archival
  ArchivePolicy: a.model({
    name: a.string().required(),
    description: a.string(),
    projectId: a.id(), // Optional - if null, applies globally

    // Trigger Conditions
    triggerType: a.enum(['LAST_ACCESS', 'CREATION_DATE', 'MANUAL', 'SIZE_THRESHOLD', 'USAGE_SCORE']),
    daysUntilArchive: a.integer(), // Days since last access before archiving
    minFileSizeMB: a.integer(), // Minimum file size to consider for archival
    usageScoreThreshold: a.float(), // Archive if usage score below this

    // Target Storage
    targetStorageClass: a.enum([
      'STANDARD',           // S3 Standard
      'STANDARD_IA',        // Infrequent Access
      'ONEZONE_IA',         // One Zone IA
      'INTELLIGENT_TIERING', // Auto-tiering
      'GLACIER_IR',         // Glacier Instant Retrieval
      'GLACIER_FR',         // Glacier Flexible Retrieval
      'GLACIER_DA',         // Glacier Deep Archive
    ]),

    // Asset Filters
    includeAssetTypes: a.string().array(), // VIDEO, AUDIO, IMAGE, DOCUMENT
    excludeAssetTypes: a.string().array(),
    excludeTaggedWith: a.string().array(), // Don't archive assets with these tags
    onlyProjectStatus: a.string().array(), // Only archive from projects with these statuses

    // Policy Status
    isEnabled: a.boolean().default(true),
    lastExecutedAt: a.datetime(),
    nextScheduledRun: a.datetime(),
    assetsProcessed: a.integer().default(0),
    storageFreedGB: a.float().default(0),

    // Creator
    createdBy: a.string().required(),
    createdByEmail: a.string(),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer']).to(['create', 'read', 'update', 'delete']),
  ]),

  // Asset Analytics - Tracks usage and performance of each asset
  AssetAnalytics: a.model({
    assetId: a.id().required(),
    projectId: a.id().required(),

    // View/Usage Metrics
    totalViews: a.integer().default(0),
    uniqueViewers: a.integer().default(0),
    totalPlayDuration: a.integer().default(0), // Total seconds played
    averageWatchPercentage: a.float().default(0), // 0-100
    downloadCount: a.integer().default(0),
    shareCount: a.integer().default(0),

    // Usage Heatmap Data (JSON for flexibility)
    viewsByHour: a.json(), // { "0": 5, "1": 3, ... "23": 10 }
    viewsByDay: a.json(), // { "Mon": 50, "Tue": 45, ... }
    viewsByWeek: a.json(), // Last 12 weeks data
    viewsByMonth: a.json(), // Last 12 months data
    viewerLocations: a.json(), // { "US": 100, "UK": 50, ... }
    viewerDevices: a.json(), // { "Desktop": 60, "Mobile": 35, "Tablet": 5 }

    // Engagement Metrics
    commentCount: a.integer().default(0),
    approvalCount: a.integer().default(0),
    revisionRequestCount: a.integer().default(0),
    feedbackSentiment: a.float(), // -1 to 1 sentiment score
    averageRating: a.float(), // 0-5 star rating

    // Usage Score (computed metric for archival decisions)
    usageScore: a.float().default(50), // 0-100, higher = more used
    usageScoreUpdatedAt: a.datetime(),
    usageTrend: a.enum(['RISING', 'STABLE', 'DECLINING', 'INACTIVE']),

    // Time-based tracking
    firstViewedAt: a.datetime(),
    lastViewedAt: a.datetime(),
    peakUsageDate: a.datetime(),
    peakUsageCount: a.integer(),

    // Distribution tracking
    distributionLinksCreated: a.integer().default(0),
    socialOutputsCreated: a.integer().default(0),
    externalEmbeds: a.integer().default(0),

    // ROI Tracking
    estimatedValue: a.float(), // Estimated value in dollars
    productionCost: a.float(), // Cost to produce
    revenueGenerated: a.float(), // Revenue attributed to this asset
    roiPercentage: a.float(), // (Revenue - Cost) / Cost * 100
    roiLastCalculated: a.datetime(),

    // Update tracking
    lastUpdated: a.datetime(),
    dataIntegrity: a.enum(['COMPLETE', 'PARTIAL', 'STALE']),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer', 'Marketing']).to(['create', 'read', 'update', 'delete']),
  ]),

  // Quality Score - AI-powered quality assessment
  QualityScore: a.model({
    assetId: a.id().required(),
    assetVersionId: a.id(), // Optional - can score specific version
    projectId: a.id().required(),

    // Overall Score
    overallScore: a.float().required(), // 0-100
    grade: a.enum(['A', 'B', 'C', 'D', 'F']), // Letter grade

    // Video Quality Metrics
    videoResolution: a.string(), // e.g., "3840x2160"
    videoBitrate: a.integer(), // kbps
    videoCodec: a.string(), // e.g., "H.264", "H.265"
    videoFrameRate: a.float(), // e.g., 23.976, 29.97, 60
    videoColorSpace: a.string(), // e.g., "Rec.709", "Rec.2020"
    videoBitDepth: a.integer(), // 8, 10, 12 bit
    videoHDR: a.boolean(),
    videoResolutionScore: a.float(), // 0-100
    videoBitrateScore: a.float(), // 0-100
    videoStabilityScore: a.float(), // 0-100 (shakiness detection)
    videoExposureScore: a.float(), // 0-100

    // Audio Quality Metrics
    audioCodec: a.string(), // e.g., "AAC", "PCM"
    audioBitrate: a.integer(), // kbps
    audioSampleRate: a.integer(), // e.g., 48000
    audioChannels: a.integer(), // e.g., 2 (stereo), 6 (5.1)
    audioLoudnessLUFS: a.float(), // Integrated loudness
    audioPeakdB: a.float(), // Peak level
    audioNoiseFloor: a.float(), // dB
    audioQualityScore: a.float(), // 0-100
    audioClippingDetected: a.boolean(),
    audioSilencePercentage: a.float(),

    // Technical Compliance
    formatCompliance: a.boolean(), // Meets broadcast/streaming standards
    complianceIssues: a.string().array(), // List of issues found
    recommendedFixes: a.string().array(), // Suggestions for improvement

    // AI Content Analysis
    contentClarity: a.float(), // 0-100 based on AI analysis
    compositionScore: a.float(), // 0-100 framing/composition
    colorGradeConsistency: a.float(), // 0-100
    motionSmoothnessScore: a.float(), // 0-100

    // Metadata
    analyzedAt: a.datetime().required(),
    analysisDuration: a.integer(), // Seconds to analyze
    analysisVersion: a.string(), // Version of analysis algorithm
    analyzedBy: a.string(), // 'AI' or user email

    // File Integrity
    checksumMD5: a.string(),
    checksumSHA256: a.string(),
    fileIntegrity: a.enum(['VERIFIED', 'CORRUPTED', 'UNKNOWN']),
    corruptionDetails: a.string(),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer', 'Editor']).to(['create', 'read', 'update', 'delete']),
  ]),

  // Storage Tier Record - Tracks current storage location of assets
  StorageTier: a.model({
    assetId: a.id().required(),
    projectId: a.id().required(),

    // Current Storage Info
    currentStorageClass: a.enum([
      'STANDARD',
      'STANDARD_IA',
      'ONEZONE_IA',
      'INTELLIGENT_TIERING',
      'GLACIER_IR',
      'GLACIER_FR',
      'GLACIER_DA',
    ]),
    s3Key: a.string().required(),
    s3Bucket: a.string(),
    fileSizeBytes: a.integer().required(),

    // Archive Status
    isArchived: a.boolean().default(false),
    archivedAt: a.datetime(),
    archivedBy: a.string(), // Policy name or user email
    archiveReason: a.string(), // Why it was archived
    originalStorageClass: a.string(), // Where it was before archival

    // Restoration
    isRestoring: a.boolean().default(false),
    restoreRequestedAt: a.datetime(),
    restoreRequestedBy: a.string(),
    restoreType: a.enum(['STANDARD', 'BULK', 'EXPEDITED']),
    restoreExpiresAt: a.datetime(), // Glacier restore temporary copy expiry
    lastRestoredAt: a.datetime(),
    restoreCount: a.integer().default(0),

    // Smart Thaw (Partial Restore)
    partialRestoreRanges: a.json(), // [{ start: 0, end: 60 }, ...] seconds
    partialRestoreKey: a.string(), // S3 key for partial restore
    partialRestoreExpiresAt: a.datetime(),

    // Cost Tracking
    monthlyStorageCost: a.float(), // Estimated monthly cost
    lastCostCalculation: a.datetime(),
    totalStorageCostToDate: a.float(),
    projectedAnnualCost: a.float(),

    // Lifecycle
    lifecyclePolicyApplied: a.string(), // Name of policy
    nextTransitionDate: a.datetime(),
    nextTransitionClass: a.string(),

    // Audit
    transitionHistory: a.json(), // Array of { date, from, to, reason }
    lastChecked: a.datetime(),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer']).to(['create', 'read', 'update', 'delete']),
  ]),

  // Restore Request - Tracks restoration requests from Glacier
  RestoreRequest: a.model({
    assetId: a.id().required(),
    projectId: a.id().required(),
    storageTierId: a.id(),

    // Request Details
    requestType: a.enum(['FULL', 'PARTIAL', 'SMART_THAW']),
    restoreTier: a.enum(['EXPEDITED', 'STANDARD', 'BULK']),

    // For partial restores
    partialStartSeconds: a.float(),
    partialEndSeconds: a.float(),
    partialReason: a.string(), // Why partial restore needed

    // Status
    status: a.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']),
    requestedAt: a.datetime().required(),
    requestedBy: a.string().required(),
    requestedByEmail: a.string(),
    estimatedCompletion: a.datetime(),
    completedAt: a.datetime(),
    errorMessage: a.string(),

    // Cost
    estimatedCost: a.float(),
    actualCost: a.float(),

    // Expiry
    restoreDurationDays: a.integer(), // How long restore will be available
    expiresAt: a.datetime(),

    // Result
    restoredKey: a.string(), // S3 key where restored file is available
    restoredSize: a.integer(),

    // Notifications
    notifyOnComplete: a.boolean().default(true),
    notificationSent: a.boolean().default(false),
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer', 'Editor']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 14. TEAM MANAGEMENT (Stakeholder & Crew Assignment)
  TeamMember: a.model({
    projectId: a.id().required(),

    // Member Identity
    email: a.string().required(),
    name: a.string(),
    avatar: a.string(), // S3 key for profile image

    // Role & Access
    role: a.enum([
      'PROJECT_OWNER',
      'EXECUTIVE_SPONSOR',
      'CREATIVE_DIRECTOR',
      'PRODUCER',
      'LEGAL_CONTACT',
      'FINANCE_CONTACT',
      'CLIENT_CONTACT',
      'DIRECTOR',
      'EDITOR',
      'CINEMATOGRAPHER',
      'SOUND_DESIGNER',
      'VFX_ARTIST',
      'PRODUCTION_ASSISTANT',
      'VIEWER',
      'CUSTOM',
    ]),
    customRoleTitle: a.string(), // For CUSTOM role type
    permissions: a.string(), // JSON stringified array of permissions
    department: a.string(),

    // Invitation Status
    status: a.enum(['PENDING', 'ACTIVE', 'DECLINED', 'REMOVED']),
    invitedBy: a.string(),
    invitedAt: a.datetime(),
    acceptedAt: a.datetime(),
    removedAt: a.datetime(),
    removedBy: a.string(),
    removalReason: a.string(),

    // Activity Tracking
    lastActiveAt: a.datetime(),
    contributionCount: a.integer().default(0), // Tasks completed, comments, uploads

    // Notification Preferences
    notifyOnMessages: a.boolean().default(true),
    notifyOnTasks: a.boolean().default(true),
    notifyOnApprovals: a.boolean().default(true),
    notifyOnAssets: a.boolean().default(true),

    // External Contact Info
    phone: a.string(),
    company: a.string(),
    title: a.string(), // Job title
  })
  .authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read', 'create', 'update']),
    allow.groups(['Admin', 'Producer']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 15. CUSTOM QUERIES
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

  // AI FEEDBACK SUMMARIZATION - Analyze review comments and generate insights
  summarizeFeedback: a
    .query()
    .arguments({
      comments: a.json().required(),
    })
    .returns(a.json())
    .handler(a.handler.function(feedbackSummarizer))
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