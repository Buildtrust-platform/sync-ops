import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

/**
 * TASK CONVERSION UTILITIES
 *
 * Functions to convert comments and messages into actionable tasks
 * Per SyncOps requirement FR-29: Automatic task creation from comments
 */

interface ConvertCommentToTaskParams {
  commentId: string;
  commentText: string;
  projectId: string;
  assetId: string;
  assetName: string;
  timecode?: number;
  timecodeFormatted?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdBy: string;
  createdByEmail: string;
  assignedToEmail?: string;
}

interface ConvertMessageToTaskParams {
  messageId: string;
  messageContent: string;
  projectId: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdBy: string;
  createdByEmail: string;
  assignedToEmail?: string;
}

/**
 * Convert a review comment into a task
 *
 * @param params Comment details including text, asset, timecode
 * @returns Created task ID or null if failed
 */
export async function convertCommentToTask(
  params: ConvertCommentToTaskParams
): Promise<string | null> {
  try {
    // Generate task title from comment text (first 100 chars)
    const title = params.commentText.length > 100
      ? params.commentText.substring(0, 100) + '...'
      : params.commentText;

    const { data, errors } = await client.models.Task.create({
      projectId: params.projectId,
      title: `Comment: ${title}`,
      description: params.commentText,
      taskType: 'FROM_COMMENT',
      sourceCommentId: params.commentId,
      sourceAssetId: params.assetId,
      linkedAssetId: params.assetId,
      linkedAssetName: params.assetName,
      linkedTimecode: params.timecode || undefined,
      linkedTimecodeFormatted: params.timecodeFormatted || undefined,
      priority: params.priority || 'NORMAL',
      status: 'TODO',
      assignedToEmail: params.assignedToEmail || undefined,
      createdBy: params.createdBy,
      createdByEmail: params.createdByEmail,
      progressPercentage: 0,
    });

    if (errors) {
      console.error('Error converting comment to task:', errors);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Failed to convert comment to task:', error);
    return null;
  }
}

/**
 * Convert a message into a task
 *
 * @param params Message details including content and project
 * @returns Created task ID or null if failed
 */
export async function convertMessageToTask(
  params: ConvertMessageToTaskParams
): Promise<string | null> {
  try {
    // Generate task title from message content (first 100 chars)
    const title = params.messageContent.length > 100
      ? params.messageContent.substring(0, 100) + '...'
      : params.messageContent;

    const { data, errors } = await client.models.Task.create({
      projectId: params.projectId,
      title: `Message: ${title}`,
      description: params.messageContent,
      taskType: 'FROM_MESSAGE',
      sourceMessageId: params.messageId,
      priority: params.priority || 'NORMAL',
      status: 'TODO',
      assignedToEmail: params.assignedToEmail || undefined,
      createdBy: params.createdBy,
      createdByEmail: params.createdByEmail,
      progressPercentage: 0,
    });

    if (errors) {
      console.error('Error converting message to task:', errors);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Failed to convert message to task:', error);
    return null;
  }
}

/**
 * Check if a comment has already been converted to a task
 *
 * @param commentId The comment ID to check
 * @returns True if task exists, false otherwise
 */
export async function isCommentConvertedToTask(commentId: string): Promise<boolean> {
  try {
    const { data } = await client.models.Task.list({
      filter: { sourceCommentId: { eq: commentId } },
    });

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking if comment converted to task:', error);
    return false;
  }
}

/**
 * Check if a message has already been converted to a task
 *
 * @param messageId The message ID to check
 * @returns True if task exists, false otherwise
 */
export async function isMessageConvertedToTask(messageId: string): Promise<boolean> {
  try {
    const { data } = await client.models.Task.list({
      filter: { sourceMessageId: { eq: messageId } },
    });

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking if message converted to task:', error);
    return false;
  }
}
