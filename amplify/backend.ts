import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { mediaProcessor } from './function/mediaProcessor/resource';
import { smartBriefAI } from './function/smartBriefAI/resource';
import { feedbackSummarizer } from './function/feedbackSummarizer/resource';
import { notificationGenerator } from './function/notificationGenerator/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage,
  mediaProcessor,
  smartBriefAI,
  feedbackSummarizer,
  notificationGenerator,
});

// Grant Rekognition permissions to Lambda
backend.mediaProcessor.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'rekognition:DetectLabels',
      'rekognition:DetectText',
      'rekognition:DetectModerationLabels',
    ],
    resources: ['*'],
  })
);

// Grant S3 read permissions for Rekognition
backend.mediaProcessor.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['s3:GetObject'],
    resources: [backend.storage.resources.bucket.arnForObjects('*')],
  })
);

// Grant S3 permission to invoke the Lambda function
backend.storage.resources.bucket.grantRead(backend.mediaProcessor.resources.lambda);

// Grant Bedrock permissions to Smart Brief AI Lambda
backend.smartBriefAI.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'bedrock:InvokeModel',
      'bedrock:InvokeModelWithResponseStream',
    ],
    resources: [
      'arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',
      'arn:aws:bedrock:*::foundation-model/anthropic.claude-*',
    ],
  })
);

// Grant AWS Marketplace permissions for Bedrock model access
backend.smartBriefAI.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'aws-marketplace:ViewSubscriptions',
      'aws-marketplace:Subscribe',
    ],
    resources: ['*'],
  })
);

// Grant Bedrock permissions to Feedback Summarizer Lambda
backend.feedbackSummarizer.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'bedrock:InvokeModel',
      'bedrock:InvokeModelWithResponseStream',
    ],
    resources: [
      'arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',
      'arn:aws:bedrock:*::foundation-model/anthropic.claude-*',
    ],
  })
);

// Grant DynamoDB permissions to Notification Generator Lambda
backend.notificationGenerator.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:PutItem',
      'dynamodb:GetItem',
      'dynamodb:Query',
    ],
    resources: ['*'], // Will be scoped to Notification table via environment variable
  })
);
