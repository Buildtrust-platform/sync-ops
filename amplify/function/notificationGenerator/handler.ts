/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamoDBStreamEvent, DynamoDBRecord } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

// Initialize DynamoDB client
const dynamodbClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamodbClient);

interface Message {
  id: string;
  projectId: string;
  projectName?: string;
  senderId: string;
  senderEmail: string;
  senderName?: string;
  messageText: string;
  messageType?: string;
  priority?: string;
  mentionedUsers?: string[];
  assetId?: string;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  projectId?: string;
  projectName?: string;
  messageId?: string;
  senderId?: string;
  senderEmail?: string;
  senderName?: string;
  isRead: boolean;
  deliveryChannels: string[];
  priority: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * NOTIFICATION GENERATOR LAMBDA
 *
 * Triggered by DynamoDB Stream on Message table
 * Auto-generates notifications for:
 * - @mentions in messages
 * - New messages in projects (future)
 * - Task assignments (future)
 * - Approval requests (future)
 */
export const handler = async (event: DynamoDBStreamEvent) => {
  console.log('Notification Generator started');
  console.log('Processing', event.Records.length, 'stream records');

  try {
    for (const record of event.Records) {
      await processRecord(record);
    }

    console.log('All records processed successfully');
    return { statusCode: 200, body: 'Notifications generated' };
  } catch (error: any) {
    console.error('Error processing stream records:', error);
    throw error;
  }
};

async function processRecord(record: DynamoDBRecord) {
  console.log('Processing record:', record.eventID, record.eventName);

  // Only process INSERT events (new messages)
  if (record.eventName !== 'INSERT') {
    console.log('Skipping non-INSERT event:', record.eventName);
    return;
  }

  if (!record.dynamodb?.NewImage) {
    console.log('No NewImage in record, skipping');
    return;
  }

  // Unmarshall the DynamoDB record
  const message = unmarshall(record.dynamodb.NewImage as any) as Message;
  console.log('Unmarshalled message:', JSON.stringify(message, null, 2));

  // Check if message has mentioned users
  if (message.mentionedUsers && message.mentionedUsers.length > 0) {
    console.log('Found', message.mentionedUsers.length, 'mentioned users');

    for (const mentionedUser of message.mentionedUsers) {
      await createMentionNotification(message, mentionedUser);
    }
  } else {
    console.log('No mentioned users in this message');
  }

  // Future: Add other notification triggers here
  // - New message in project (notify all team members)
  // - Task assignment
  // - Approval request
  // etc.
}

async function createMentionNotification(message: Message, mentionedUser: string) {
  console.log('Creating MENTION notification for user:', mentionedUser);

  try {
    // Check if this is a username (@john) or email
    // For now, we'll treat it as a username and derive email
    // In production, you'd query the User table to get actual email
    const userId = mentionedUser.includes('@') ? mentionedUser : `${mentionedUser}@example.com`;

    const notification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId,
      type: 'MENTION',
      title: `${message.senderName || message.senderEmail} mentioned you`,
      message: truncateText(message.messageText, 200),
      actionUrl: message.assetId
        ? `/projects/${message.projectId}?tab=assets&asset=${message.assetId}`
        : `/projects/${message.projectId}?tab=communication&message=${message.id}`,
      actionLabel: 'View message',
      projectId: message.projectId,
      projectName: message.projectName,
      messageId: message.id,
      senderId: message.senderId,
      senderEmail: message.senderEmail,
      senderName: message.senderName,
      isRead: false,
      deliveryChannels: ['IN_APP'],
      priority: message.priority || 'NORMAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Get the Notification table name from environment
    const notificationTableName = process.env.NOTIFICATION_TABLE_NAME;
    if (!notificationTableName) {
      throw new Error('NOTIFICATION_TABLE_NAME environment variable not set');
    }

    console.log('Writing notification to table:', notificationTableName);
    console.log('Notification:', JSON.stringify(notification, null, 2));

    // Write to DynamoDB
    const command = new PutCommand({
      TableName: notificationTableName,
      Item: notification,
    });

    await docClient.send(command);

    console.log('Notification created successfully:', notification.id);
  } catch (error: any) {
    console.error('Error creating mention notification:', error);
    // Don't throw - we don't want to fail the entire batch if one notification fails
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}
