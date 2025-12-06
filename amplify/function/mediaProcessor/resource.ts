import { defineFunction } from '@aws-amplify/backend';

export const mediaProcessor = defineFunction({
  name: 'mediaProcessor',
  entry: './handler.ts',
  timeoutSeconds: 60, // Rekognition may take time for large images
  resourceGroupName: 'storage', // Assign to storage stack since it's triggered by S3
});