/* eslint-disable @typescript-eslint/no-explicit-any */
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Schema } from '../../data/resource';
import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectFacesCommand,
  StartLabelDetectionCommand,
  StartFaceDetectionCommand,
  StartSegmentDetectionCommand,
} from '@aws-sdk/client-rekognition';
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
} from '@aws-sdk/client-transcribe';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import {
  MediaConvertClient,
  CreateJobCommand,
  type CreateJobCommandInput,
} from '@aws-sdk/client-mediaconvert';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(process.env as any);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION });
const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// MediaConvert client - requires endpoint discovery
const MEDIACONVERT_ENDPOINT = process.env.MEDIACONVERT_ENDPOINT;
const mediaConvertClient = MEDIACONVERT_ENDPOINT
  ? new MediaConvertClient({ region: process.env.AWS_REGION, endpoint: MEDIACONVERT_ENDPOINT })
  : null;

// SNS topic ARN for Rekognition async notifications (set via environment variable)
const REKOGNITION_SNS_TOPIC = process.env.REKOGNITION_SNS_TOPIC_ARN;
const REKOGNITION_ROLE_ARN = process.env.REKOGNITION_ROLE_ARN;
const MEDIACONVERT_ROLE_ARN = process.env.MEDIACONVERT_ROLE_ARN;


export const handler = async (event: any) => {
  console.log('--- AI INGEST PIPELINE START: CLIENT READY & EXECUTING ---');

  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing file: ${key} from bucket: ${bucketName}`);

    try {
      // 1. QUERY: Find the Asset record using the unique S3 Key
      const assetResult = await client.models.Asset.list({
        filter: {
          s3Key: { eq: key }
        }
      });

      if (!assetResult.data || assetResult.data.length === 0) {
        console.error(`Asset record not found in DynamoDB for S3 Key: ${key}. The record may not have been created yet.`);
        continue;
      }

      const assetToUpdate = assetResult.data[0];

      // 2. EXTRACT FILE METADATA from S3
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      const headResponse = await s3Client.send(headCommand);

      const fileSize = headResponse.ContentLength || 0;
      const mimeType = headResponse.ContentType || 'application/octet-stream';

      console.log(`File metadata: ${fileSize} bytes, ${mimeType}`);

      // Determine if file is an image, video, or audio
      const isImage = mimeType.startsWith('image/');
      const isVideo = mimeType.startsWith('video/');
      const isAudio = mimeType.startsWith('audio/');

      // 3. UPDATE STATUS: Mark as processing
      await client.models.Asset.update({
        id: assetToUpdate.id,
        type: 'PROCESSING'
      });

      console.log(`Asset [${assetToUpdate.id}] marked as PROCESSING`);

      // 3a. LOG ACTIVITY: AI Processing Started
      await client.models.ActivityLog.create({
        organizationId: assetToUpdate.organizationId,
        projectId: assetToUpdate.projectId,
        userId: 'SYSTEM',
        userEmail: 'ai-processor@syncops.system',
        userRole: 'System',
        action: 'AI_PROCESSING_STARTED',
        targetType: 'Asset',
        targetId: assetToUpdate.id,
        targetName: key.split('/').pop() || key,
        metadata: { fileSize, mimeType },
      });

      // 4. AI ANALYSIS
      let aiTags: string[] = [];
      let aiConfidence = 0;

      if (isImage) {
        // === IMAGE PROCESSING: Synchronous analysis ===
        const results = await processImage(bucketName, key, assetToUpdate);
        aiTags = results.aiTags;
        aiConfidence = results.aiConfidence;
      } else if (isVideo) {
        // === VIDEO PROCESSING: Start async jobs ===
        await processVideoAsync(bucketName, key, assetToUpdate);

        // Start multi-resolution encoding
        await startVideoEncoding(bucketName, key, assetToUpdate);
      } else if (isAudio) {
        // === AUDIO PROCESSING: Start transcription job ===
        await processAudioAsync(bucketName, key, assetToUpdate);
      } else {
        console.log(`Document file detected: ${key}. No AI analysis needed`);
      }

      // 5. UPDATE ASSET: Save AI tags and metadata to database
      await client.models.Asset.update({
        id: assetToUpdate.id,
        type: 'MASTER', // Processing complete, mark as MASTER
        aiTags: aiTags,
        aiConfidence: aiConfidence,
        aiProcessedAt: new Date().toISOString(),
        fileSize: fileSize,
        mimeType: mimeType,
      });

      console.log(`SUCCESS: Asset [${assetToUpdate.id}] updated with AI tags`);

      // 5a. LOG ACTIVITY: AI Processing Completed
      await client.models.ActivityLog.create({
        organizationId: assetToUpdate.organizationId,
        projectId: assetToUpdate.projectId,
        userId: 'SYSTEM',
        userEmail: 'ai-processor@syncops.system',
        userRole: 'System',
        action: 'AI_PROCESSING_COMPLETED',
        targetType: 'Asset',
        targetId: assetToUpdate.id,
        targetName: key.split('/').pop() || key,
        metadata: {
          tagsDetected: aiTags.length,
          confidence: aiConfidence.toFixed(2),
          processingType: isImage ? 'image' : isVideo ? 'video' : isAudio ? 'audio' : 'document'
        },
      });

    } catch (e: any) {
      console.error(`ERROR processing ${key}:`, e);

      // If it's a Rekognition error (e.g., unsupported file type), log but don't fail
      if (e.name === 'InvalidImageFormatException' || e.name === 'InvalidS3ObjectException') {
        console.warn(`Rekognition cannot process this file type: ${key}. Skipping AI tagging.`);
      }
    }
  }

  console.log('--- AI INGEST PIPELINE END ---');
  return { statusCode: 200, body: JSON.stringify({ message: "AI pipeline completed." }) };
};


/**
 * Process image files synchronously with Rekognition
 * - DetectLabels: General object/scene detection
 * - DetectFaces: Face detection with attributes
 */
async function processImage(bucketName: string, key: string, asset: any) {
  const s3Object = { Bucket: bucketName, Name: key };
  let aiTags: string[] = [];
  let aiConfidence = 0;

  // 1. DETECT LABELS (objects, scenes, concepts)
  console.log(`Calling Rekognition DetectLabels for image ${key}...`);
  const labelsCommand = new DetectLabelsCommand({
    Image: { S3Object: s3Object },
    MaxLabels: 20,
    MinConfidence: 70,
  });

  const labelsResponse = await rekognitionClient.send(labelsCommand);
  const labels = labelsResponse.Labels || [];
  aiTags = labels.map((label: any) => label.Name || '').filter(Boolean);
  aiConfidence = labels.length > 0
    ? labels.reduce((sum: number, label: any) => sum + (label.Confidence || 0), 0) / labels.length
    : 0;

  console.log(`DetectLabels: ${aiTags.length} labels with avg confidence ${aiConfidence.toFixed(2)}%`);

  // 2. DETECT FACES
  console.log(`Calling Rekognition DetectFaces for image ${key}...`);
  try {
    const facesCommand = new DetectFacesCommand({
      Image: { S3Object: s3Object },
      Attributes: ['ALL'], // Get all face attributes (emotions, age, gender, etc.)
    });

    const facesResponse = await rekognitionClient.send(facesCommand);
    const faces = facesResponse.FaceDetails || [];

    console.log(`DetectFaces: Found ${faces.length} faces`);

    // Create AIAnalysisJob for tracking
    const jobResult = await client.models.AIAnalysisJob.create({
      organizationId: asset.organizationId,
      projectId: asset.projectId,
      assetId: asset.id,
      assetName: key.split('/').pop() || key,
      analysisType: 'FACE_DETECTION',
      status: 'COMPLETED',
      progress: 100,
      queuedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      resultsCount: faces.length,
      triggeredBy: 'S3_UPLOAD_TRIGGER',
    });

    // Save each detected face to AIFaceDetection model
    for (const face of faces) {
      await client.models.AIFaceDetection.create({
        organizationId: asset.organizationId,
        projectId: asset.projectId,
        assetId: asset.id,
        confidence: face.Confidence || 0,
        boundingBox: face.BoundingBox ? JSON.stringify(face.BoundingBox) : null,
        emotions: face.Emotions ? JSON.stringify(face.Emotions) : null,
        ageRange: face.AgeRange ? JSON.stringify(face.AgeRange) : null,
        gender: face.Gender ? JSON.stringify(face.Gender) : null,
        smile: face.Smile ? JSON.stringify(face.Smile) : null,
        eyeglasses: face.Eyeglasses ? JSON.stringify(face.Eyeglasses) : null,
        sunglasses: face.Sunglasses ? JSON.stringify(face.Sunglasses) : null,
        beard: face.Beard ? JSON.stringify(face.Beard) : null,
        mustache: face.Mustache ? JSON.stringify(face.Mustache) : null,
        eyesOpen: face.EyesOpen ? JSON.stringify(face.EyesOpen) : null,
        mouthOpen: face.MouthOpen ? JSON.stringify(face.MouthOpen) : null,
        landmarks: face.Landmarks ? JSON.stringify(face.Landmarks) : null,
        processingJobId: jobResult.data?.id,
      });
    }

    // Add "Person" or "Face" tag if faces were detected
    if (faces.length > 0 && !aiTags.includes('Person')) {
      aiTags.push('Person');
    }

    console.log(`Saved ${faces.length} face detection records to database`);
  } catch (faceError: any) {
    console.warn(`Face detection failed for ${key}:`, faceError.message);
  }

  return { aiTags, aiConfidence };
}


/**
 * Process video files asynchronously with Rekognition Video
 * Starts async jobs and saves job IDs to track completion
 */
async function processVideoAsync(bucketName: string, key: string, asset: any) {
  console.log(`Starting async video analysis for ${key}...`);

  const video = {
    S3Object: {
      Bucket: bucketName,
      Name: key,
    },
  };

  // Build notification channel if SNS topic is configured
  const notificationChannel = REKOGNITION_SNS_TOPIC && REKOGNITION_ROLE_ARN ? {
    SNSTopicArn: REKOGNITION_SNS_TOPIC,
    RoleArn: REKOGNITION_ROLE_ARN,
  } : undefined;

  try {
    // 1. START LABEL DETECTION (objects, scenes in video)
    const labelJobResult = await client.models.AIAnalysisJob.create({
      organizationId: asset.organizationId,
      projectId: asset.projectId,
      assetId: asset.id,
      assetName: key.split('/').pop() || key,
      analysisType: 'LABEL_DETECTION',
      status: 'QUEUED',
      progress: 0,
      queuedAt: new Date().toISOString(),
      triggeredBy: 'S3_UPLOAD_TRIGGER',
    });

    const startLabelsCommand = new StartLabelDetectionCommand({
      Video: video,
      MinConfidence: 70,
      NotificationChannel: notificationChannel,
      ClientRequestToken: labelJobResult.data?.id,
    });

    const labelsJobResponse = await rekognitionClient.send(startLabelsCommand);

    // Update job with Rekognition job ID
    await client.models.AIAnalysisJob.update({
      id: labelJobResult.data?.id || '',
      status: 'PROCESSING',
      startedAt: new Date().toISOString(),
      rekognitionJobId: labelsJobResponse.JobId,
    });

    console.log(`Started video label detection job: ${labelsJobResponse.JobId}`);

    // 2. START FACE DETECTION (faces in video)
    const faceJobResult = await client.models.AIAnalysisJob.create({
      organizationId: asset.organizationId,
      projectId: asset.projectId,
      assetId: asset.id,
      assetName: key.split('/').pop() || key,
      analysisType: 'FACE_DETECTION',
      status: 'QUEUED',
      progress: 0,
      queuedAt: new Date().toISOString(),
      triggeredBy: 'S3_UPLOAD_TRIGGER',
    });

    const startFacesCommand = new StartFaceDetectionCommand({
      Video: video,
      FaceAttributes: 'ALL',
      NotificationChannel: notificationChannel,
      ClientRequestToken: faceJobResult.data?.id,
    });

    const facesJobResponse = await rekognitionClient.send(startFacesCommand);

    await client.models.AIAnalysisJob.update({
      id: faceJobResult.data?.id || '',
      status: 'PROCESSING',
      startedAt: new Date().toISOString(),
      rekognitionJobId: facesJobResponse.JobId,
    });

    console.log(`Started video face detection job: ${facesJobResponse.JobId}`);

    // 3. START SEGMENT DETECTION (scene/shot boundaries)
    const segmentJobResult = await client.models.AIAnalysisJob.create({
      organizationId: asset.organizationId,
      projectId: asset.projectId,
      assetId: asset.id,
      assetName: key.split('/').pop() || key,
      analysisType: 'SCENE_DETECTION',
      status: 'QUEUED',
      progress: 0,
      queuedAt: new Date().toISOString(),
      triggeredBy: 'S3_UPLOAD_TRIGGER',
    });

    const startSegmentCommand = new StartSegmentDetectionCommand({
      Video: video,
      SegmentTypes: ['SHOT', 'TECHNICAL_CUE'],
      NotificationChannel: notificationChannel,
      ClientRequestToken: segmentJobResult.data?.id,
    });

    const segmentJobResponse = await rekognitionClient.send(startSegmentCommand);

    await client.models.AIAnalysisJob.update({
      id: segmentJobResult.data?.id || '',
      status: 'PROCESSING',
      startedAt: new Date().toISOString(),
      rekognitionJobId: segmentJobResponse.JobId,
    });

    console.log(`Started video segment detection job: ${segmentJobResponse.JobId}`);

    // 4. START TRANSCRIPTION (audio track)
    await startTranscriptionJob(bucketName, key, asset, 'video');

  } catch (videoError: any) {
    console.error(`Video processing failed for ${key}:`, videoError.message);
    throw videoError;
  }
}


/**
 * Process audio files - start transcription job
 */
async function processAudioAsync(bucketName: string, key: string, asset: any) {
  console.log(`Starting audio transcription for ${key}...`);
  await startTranscriptionJob(bucketName, key, asset, 'audio');
}


/**
 * Start AWS Transcribe job for audio/video files
 */
async function startTranscriptionJob(bucketName: string, key: string, asset: any, mediaType: 'audio' | 'video') {
  try {
    // Create job tracking record
    const transcriptJobResult = await client.models.AIAnalysisJob.create({
      organizationId: asset.organizationId,
      projectId: asset.projectId,
      assetId: asset.id,
      assetName: key.split('/').pop() || key,
      analysisType: 'TRANSCRIPTION',
      status: 'QUEUED',
      progress: 0,
      queuedAt: new Date().toISOString(),
      triggeredBy: 'S3_UPLOAD_TRIGGER',
    });

    const jobName = `syncops-${asset.id}-${Date.now()}`;
    const mediaUri = `s3://${bucketName}/${key}`;
    const outputBucket = bucketName;
    const outputKey = `transcripts/${asset.id}/${jobName}.json`;

    const startTranscribeCommand = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: 'en-US', // Default to English, could be made configurable
      MediaFormat: getMediaFormat(key),
      Media: {
        MediaFileUri: mediaUri,
      },
      OutputBucketName: outputBucket,
      OutputKey: outputKey,
      Settings: {
        ShowSpeakerLabels: true,
        MaxSpeakerLabels: 10,
        ShowAlternatives: false,
      },
    });

    const transcribeResponse = await transcribeClient.send(startTranscribeCommand);

    // Update job with Transcribe job name
    await client.models.AIAnalysisJob.update({
      id: transcriptJobResult.data?.id || '',
      status: 'PROCESSING',
      startedAt: new Date().toISOString(),
      transcribeJobName: jobName,
    });

    console.log(`Started transcription job: ${jobName} for ${mediaType} file ${key}`);
    console.log(`Transcribe job status: ${transcribeResponse.TranscriptionJob?.TranscriptionJobStatus}`);

  } catch (transcribeError: any) {
    console.error(`Transcription job failed for ${key}:`, transcribeError.message);
    // Don't throw - transcription failure shouldn't stop other processing
  }
}


/**
 * Get media format from file extension for Transcribe
 */
function getMediaFormat(key: string): 'mp3' | 'mp4' | 'wav' | 'flac' | 'ogg' | 'amr' | 'webm' {
  const ext = key.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp3': return 'mp3';
    case 'mp4':
    case 'm4a':
    case 'mov': return 'mp4';
    case 'wav': return 'wav';
    case 'flac': return 'flac';
    case 'ogg': return 'ogg';
    case 'amr': return 'amr';
    case 'webm': return 'webm';
    default: return 'mp4'; // Default to mp4
  }
}


/**
 * Start multi-resolution video encoding with AWS MediaConvert
 * Creates proxy files at different quality levels for streaming
 */
async function startVideoEncoding(bucketName: string, key: string, asset: any) {
  if (!mediaConvertClient || !MEDIACONVERT_ROLE_ARN) {
    console.log('MediaConvert not configured, skipping video encoding');
    return;
  }

  console.log(`Starting multi-resolution encoding for ${key}...`);

  const inputS3Uri = `s3://${bucketName}/${key}`;
  const outputPrefix = `proxies/${asset.id}/`;

  // Encoding presets configuration
  const encodingPresets = [
    {
      name: 'STREAMING_HD',
      resolution: '1920x1080',
      bitrate: 5000000, // 5 Mbps
      suffix: '_1080p',
    },
    {
      name: 'STREAMING_SD',
      resolution: '1280x720',
      bitrate: 2500000, // 2.5 Mbps
      suffix: '_720p',
    },
  ];

  try {
    // Create ProxyFile records for each encoding preset
    for (const preset of encodingPresets) {
      const outputKey = `${outputPrefix}${asset.id}${preset.suffix}.mp4`;

      // Create ProxyFile record to track encoding status
      const proxyFileResult = await client.models.ProxyFile.create({
        organizationId: asset.organizationId,
        assetId: asset.id,
        proxyType: preset.name as 'STREAMING_HD' | 'STREAMING_SD',
        resolution: preset.resolution,
        bitrate: Math.round(preset.bitrate / 1000), // Store in kbps
        codec: 'H.264',
        audioCodec: 'AAC',
        status: 'PENDING',
        progress: 0,
        processor: 'AWS_MEDIACONVERT',
        s3Key: outputKey,
        s3Bucket: bucketName,
      });

      console.log(`Created ProxyFile record: ${proxyFileResult.data?.id} for ${preset.name}`);
    }

    // Create MediaConvert job with multiple outputs
    const jobSettings: CreateJobCommandInput = {
      Role: MEDIACONVERT_ROLE_ARN,
      Settings: {
        Inputs: [
          {
            FileInput: inputS3Uri,
            AudioSelectors: {
              'Audio Selector 1': {
                DefaultSelection: 'DEFAULT',
              },
            },
            VideoSelector: {},
          },
        ],
        OutputGroups: [
          {
            Name: 'MP4 Group',
            OutputGroupSettings: {
              Type: 'FILE_GROUP_SETTINGS',
              FileGroupSettings: {
                Destination: `s3://${bucketName}/${outputPrefix}`,
              },
            },
            Outputs: encodingPresets.map((preset) => {
              const [width, height] = preset.resolution.split('x').map(Number);
              return {
                NameModifier: preset.suffix,
                ContainerSettings: {
                  Container: 'MP4',
                  Mp4Settings: {
                    CslgAtom: 'INCLUDE',
                    FreeSpaceBox: 'EXCLUDE',
                    MoovPlacement: 'PROGRESSIVE_DOWNLOAD',
                  },
                },
                VideoDescription: {
                  Width: width,
                  Height: height,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      RateControlMode: 'VBR',
                      Bitrate: preset.bitrate,
                      MaxBitrate: Math.round(preset.bitrate * 1.5),
                      QualityTuningLevel: 'SINGLE_PASS_HQ',
                      CodecProfile: 'HIGH',
                      CodecLevel: 'AUTO',
                      GopSize: 2,
                      GopSizeUnits: 'SECONDS',
                    },
                  },
                  ScalingBehavior: 'DEFAULT',
                  AntiAlias: 'ENABLED',
                },
                AudioDescriptions: [
                  {
                    AudioTypeControl: 'FOLLOW_INPUT',
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 128000,
                        CodingMode: 'CODING_MODE_2_0',
                        SampleRate: 48000,
                      },
                    },
                  },
                ],
              };
            }),
          },
        ],
      },
      UserMetadata: {
        assetId: asset.id,
        organizationId: asset.organizationId,
      },
    };

    const createJobCommand = new CreateJobCommand(jobSettings);
    const jobResponse = await mediaConvertClient.send(createJobCommand);

    console.log(`MediaConvert job created: ${jobResponse.Job?.Id}`);

    // Update ProxyFile records with job ID
    const proxyFilesResult = await client.models.ProxyFile.list({
      filter: {
        assetId: { eq: asset.id },
        status: { eq: 'PENDING' },
      },
    });

    for (const proxyFile of proxyFilesResult.data || []) {
      await client.models.ProxyFile.update({
        id: proxyFile.id,
        status: 'PROCESSING',
        jobId: jobResponse.Job?.Id,
        processingStarted: new Date().toISOString(),
      });
    }

    // Log activity
    await client.models.ActivityLog.create({
      organizationId: asset.organizationId,
      projectId: asset.projectId,
      userId: 'SYSTEM',
      userEmail: 'encoder@syncops.system',
      userRole: 'System',
      action: 'VIDEO_ENCODING_STARTED',
      targetType: 'Asset',
      targetId: asset.id,
      targetName: key.split('/').pop() || key,
      metadata: {
        mediaConvertJobId: jobResponse.Job?.Id,
        presets: encodingPresets.map(p => p.name),
      },
    });

  } catch (encodingError: any) {
    console.error(`Video encoding failed for ${key}:`, encodingError.message);

    // Mark proxy files as failed
    const proxyFilesResult = await client.models.ProxyFile.list({
      filter: {
        assetId: { eq: asset.id },
        status: { eq: 'PENDING' },
      },
    });

    for (const proxyFile of proxyFilesResult.data || []) {
      await client.models.ProxyFile.update({
        id: proxyFile.id,
        status: 'FAILED',
        errorMessage: encodingError.message,
      });
    }
  }
}
