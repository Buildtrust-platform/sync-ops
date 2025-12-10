import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { mediaProcessor } from './function/mediaProcessor/resource';
import { smartBriefAI } from './function/smartBriefAI/resource';
import { notificationGenerator } from './function/notificationGenerator/resource';
import { universalSearch } from './functions/universal-search/resource';
import { feedbackSummarizer } from './function/feedbackSummarizer/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

const backend = defineBackend({
  auth,
  data,
  storage,
  mediaProcessor,
  smartBriefAI,
  notificationGenerator,
  universalSearch,
  feedbackSummarizer,
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

// Configure DynamoDB Stream trigger for notification generation
const messageTable = backend.data.resources.tables['Message'];
const notificationTable = backend.data.resources.tables['Notification'];

// Grant DynamoDB read permissions to notification generator
backend.notificationGenerator.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:DescribeStream',
      'dynamodb:GetRecords',
      'dynamodb:GetShardIterator',
      'dynamodb:ListStreams',
    ],
    resources: [messageTable.tableStreamArn || ''],
  })
);

// Grant DynamoDB write permissions for creating notifications
backend.notificationGenerator.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:PutItem',
      'dynamodb:UpdateItem',
    ],
    resources: [notificationTable.tableArn],
  })
);

// Add DynamoDB stream event source to trigger the Lambda
backend.notificationGenerator.resources.lambda.addEventSource(
  new DynamoEventSource(messageTable, {
    startingPosition: StartingPosition.LATEST,
    batchSize: 10,
    retryAttempts: 3,
  })
);

// Pass the Notification table name as environment variable
backend.notificationGenerator.addEnvironment(
  'NOTIFICATION_TABLE_NAME',
  notificationTable.tableName
);

// Configure Universal Search Lambda with table access
const projectTable = backend.data.resources.tables['Project'];
const assetTable = backend.data.resources.tables['Asset'];
const reviewCommentTable = backend.data.resources.tables['ReviewComment'];
const messageTable2 = backend.data.resources.tables['Message'];
const taskTable = backend.data.resources.tables['Task'];

// Grant DynamoDB scan permissions to universal search
backend.universalSearch.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:Scan',
      'dynamodb:Query',
    ],
    resources: [
      projectTable.tableArn,
      assetTable.tableArn,
      reviewCommentTable.tableArn,
      messageTable2.tableArn,
      taskTable.tableArn,
    ],
  })
);

// Pass table names as environment variables
backend.universalSearch.addEnvironment('PROJECT_TABLE_NAME', projectTable.tableName);
backend.universalSearch.addEnvironment('ASSET_TABLE_NAME', assetTable.tableName);
backend.universalSearch.addEnvironment('REVIEWCOMMENT_TABLE_NAME', reviewCommentTable.tableName);
backend.universalSearch.addEnvironment('MESSAGE_TABLE_NAME', messageTable2.tableName);
backend.universalSearch.addEnvironment('TASK_TABLE_NAME', taskTable.tableName);

// Configure Feedback Summarizer Lambda with Bedrock permissions
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

// Grant DynamoDB access for reading review comments
backend.feedbackSummarizer.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:Query',
      'dynamodb:Scan',
    ],
    resources: [reviewCommentTable.tableArn],
  })
);

// Pass table name as environment variable
backend.feedbackSummarizer.addEnvironment('REVIEWCOMMENT_TABLE_NAME', reviewCommentTable.tableName);