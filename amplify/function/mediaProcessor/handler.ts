/* eslint-disable @typescript-eslint/no-explicit-any */
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Schema } from '../../data/resource';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(process.env as any);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });


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

      // Determine if file is an image or video
      const isImage = mimeType.startsWith('image/');
      const isVideo = mimeType.startsWith('video/');

      // 3. UPDATE STATUS: Mark as processing
      await client.models.Asset.update({
        id: assetToUpdate.id,
        type: 'PROCESSING'
      });

      console.log(`Asset [${assetToUpdate.id}] marked as PROCESSING`);

      // 3a. LOG ACTIVITY: AI Processing Started
      await client.models.ActivityLog.create({
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

      // 4. AI ANALYSIS (Images only for now)
      let aiTags: string[] = [];
      let aiConfidence = 0;

      if (isImage) {
        // RUN REKOGNITION: Detect labels in images
        const rekognitionParams = {
          Image: {
            S3Object: {
              Bucket: bucketName,
              Name: key,
            },
          },
          MaxLabels: 20,
          MinConfidence: 70,
        };

        console.log(`Calling Rekognition for image ${key}...`);
        const rekognitionCommand = new DetectLabelsCommand(rekognitionParams);
        const rekognitionResponse = await rekognitionClient.send(rekognitionCommand);

        const labels = rekognitionResponse.Labels || [];
        aiTags = labels.map((label: any) => label.Name || '').filter(Boolean);
        aiConfidence = labels.length > 0
          ? labels.reduce((sum: number, label: any) => sum + (label.Confidence || 0), 0) / labels.length
          : 0;

        console.log(`Rekognition detected ${aiTags.length} labels with avg confidence ${aiConfidence.toFixed(2)}%`);
        console.log(`Tags: ${aiTags.join(', ')}`);
      } else if (isVideo) {
        console.log(`Video file detected: ${key}. Skipping AI analysis (videos require async processing)`);
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
          processingType: isImage ? 'image' : isVideo ? 'video' : 'document'
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