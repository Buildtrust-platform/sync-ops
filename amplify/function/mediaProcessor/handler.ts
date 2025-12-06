/* eslint-disable @typescript-eslint/no-explicit-any */
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/mediaProcessor';
import type { Schema } from '../../data/resource';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION });


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

      // 2. UPDATE STATUS: Mark as processing
      await client.models.Asset.update({
        id: assetToUpdate.id,
        type: 'PROCESSING'
      });

      console.log(`Asset [${assetToUpdate.id}] marked as PROCESSING`);

      // 3. RUN REKOGNITION: Detect labels in the image/video frame
      const rekognitionParams = {
        Image: {
          S3Object: {
            Bucket: bucketName,
            Name: key,
          },
        },
        MaxLabels: 20,
        MinConfidence: 70, // Only return labels with 70%+ confidence
      };

      console.log(`Calling Rekognition for ${key}...`);
      const rekognitionCommand = new DetectLabelsCommand(rekognitionParams);
      const rekognitionResponse = await rekognitionClient.send(rekognitionCommand);

      // 4. EXTRACT TAGS: Process Rekognition results
      const labels = rekognitionResponse.Labels || [];
      const aiTags = labels.map((label: any) => label.Name || '').filter(Boolean);
      const aiConfidence = labels.length > 0
        ? labels.reduce((sum: number, label: any) => sum + (label.Confidence || 0), 0) / labels.length
        : 0;

      console.log(`Rekognition detected ${aiTags.length} labels with avg confidence ${aiConfidence.toFixed(2)}%`);
      console.log(`Tags: ${aiTags.join(', ')}`);

      // 5. UPDATE ASSET: Save AI tags to database
      await client.models.Asset.update({
        id: assetToUpdate.id,
        type: 'MASTER', // Processing complete, mark as MASTER
        aiTags: aiTags,
        aiConfidence: aiConfidence,
        aiProcessedAt: new Date().toISOString(),
      });

      console.log(`SUCCESS: Asset [${assetToUpdate.id}] updated with AI tags`);

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