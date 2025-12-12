import { defineFunction } from '@aws-amplify/backend';

export const smartBriefAI = defineFunction({
  name: 'smartBriefAI',
  entry: './handler.ts',
  timeoutSeconds: 120, // Increased to 2 minutes for complex AI generation
  memoryMB: 512, // Increased memory for faster processing
  environment: {
    // Bedrock model ID for Claude
    BEDROCK_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
  },
});
