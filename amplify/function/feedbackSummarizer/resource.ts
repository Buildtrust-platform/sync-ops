import { defineFunction } from '@aws-amplify/backend';

export const feedbackSummarizer = defineFunction({
  name: 'feedbackSummarizer',
  entry: './handler.ts',
  environment: {
    BEDROCK_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
  },
  timeoutSeconds: 60,
});
