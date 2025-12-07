import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { mediaProcessor } from '../function/mediaProcessor/resource';
import { smartBriefAI } from '../function/smartBriefAI/resource';

/* * SYNC OPS - DATA SCHEMA
 * This defines the Database (DynamoDB) and Permissions (Cognito)
 */

const schema = a.schema({
  // 1. THE PROJECT HUB
  Project: a.model({
    name: a.string().required(),
    description: a.string(),
    status: a.enum([
      'INITIATION',
      'PRE_PROD',
      'PRODUCTION',
      'POST',
      'LEGAL_REVIEW',
      'APPROVED',
      'ARCHIVED'
    ]),
    budgetCap: a.float(), // For the "Burn Rate" bar
    deadline: a.date(),   // Drives the Timeline
    department: a.string(), // "Marketing", "HR"

    // Relationships
    assets: a.hasMany('Asset', 'projectId'),
    brief: a.hasOne('Brief', 'projectId'),
    callSheets: a.hasMany('CallSheet', 'projectId'),
    activityLogs: a.hasMany('ActivityLog', 'projectId'),
    reviews: a.hasMany('Review', 'projectId'),
  })
  .authorization(allow => [
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

    // Risk assessment
    riskLevel: a.enum(['LOW', 'MEDIUM', 'HIGH']),
    hasDroneRisk: a.boolean(),
    hasMinorRisk: a.boolean(),
    hasPublicSpaceRisk: a.boolean(),
    hasStuntRisk: a.boolean(),
    hasHazardousLocationRisk: a.boolean(),
    requiredPermits: a.string().array(),

    // Scene breakdown
    scenes: a.json(), // Array of {description, location, props}
    complexity: a.enum(['LOW', 'MEDIUM', 'HIGH']),

    // Approval tracking
    aiProcessedAt: a.datetime(),
    approvedByProducer: a.boolean(),
    approvedByLegal: a.boolean(),
    approvedByFinance: a.boolean(),
  })
  .authorization(allow => [allow.authenticated()]),

  CallSheet: a.model({
    projectId: a.id().required(),
    project: a.belongsTo('Project', 'projectId'),
    shootDate: a.date(),
    location: a.string(),
    crewList: a.string().array(), // Simple list of names for now
  })
  .authorization(allow => [allow.authenticated()]),

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
    ]),

    targetType: a.string(), // 'Asset', 'Project', 'User', 'Review', 'Comment'
    targetId: a.string(), // ID of affected resource
    targetName: a.string(), // Friendly name for display

    metadata: a.json(), // Additional context (e.g., old/new values)
    ipAddress: a.string(), // Security tracking
  })
  .authorization(allow => [
    allow.authenticated().to(['read']),
    allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
  ]),

  // 5. CUSTOM QUERIES
  analyzeProjectBrief: a
    .query()
    .arguments({
      projectDescription: a.string().required(),
      scriptOrNotes: a.string(),
    })
    .returns(a.json())
    .handler(a.handler.function(smartBriefAI))
    .authorization(allow => [allow.authenticated()]),
})
.authorization(allow => [allow.resource(mediaProcessor)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});