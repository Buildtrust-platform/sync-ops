import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { mediaProcessor } from './function/mediaProcessor/resource';
import { smartBriefAI } from './function/smartBriefAI/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage,
  mediaProcessor,
  smartBriefAI,
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