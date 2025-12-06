import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { mediaProcessor } from '../function/mediaProcessor/resource';

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
  })
  .authorization(allow => [
    allow.owner(),
    allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
    // Legal can only READ assets, unless they are in review (handled by UI logic)
    allow.groups(['Legal']).to(['read']),
  ]),

  // 3. LOGISTICS (Pre-Prod)
  Brief: a.model({
    projectId: a.id().required(),
    project: a.belongsTo('Project', 'projectId'),
    targetAudience: a.string(),
    distributionChannels: a.string().array(),
    riskLevel: a.enum(['LOW', 'MEDIUM', 'HIGH']), // For Drone/Hazard checks
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
})
.authorization(allow => [allow.resource(mediaProcessor)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});