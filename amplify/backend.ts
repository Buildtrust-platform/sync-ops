import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { mediaProcessor } from './function/mediaProcessor/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage,
  mediaProcessor,
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