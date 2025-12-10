import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$amplify/env/universal-search';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface SearchResult {
  type: 'project' | 'asset' | 'comment' | 'message' | 'task' | 'brief';
  id: string;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  relevance: number;
  highlights?: string[];
}

interface SearchEvent {
  arguments: {
    query: string;
    limit?: number;
  };
}

export const handler = async (event: SearchEvent): Promise<SearchResult[]> => {
  const { query, limit = 10 } = event.arguments;

  console.log('🔍 Universal Search Lambda invoked:', { query, limit });
  console.log('📋 Environment variables:', {
    PROJECT_TABLE_NAME: env.PROJECT_TABLE_NAME,
    ASSET_TABLE_NAME: env.ASSET_TABLE_NAME,
    REVIEWCOMMENT_TABLE_NAME: env.REVIEWCOMMENT_TABLE_NAME,
    MESSAGE_TABLE_NAME: env.MESSAGE_TABLE_NAME,
    TASK_TABLE_NAME: env.TASK_TABLE_NAME,
  });

  if (!query || query.length < 2) {
    console.log('⚠️ Query too short, returning empty results');
    return [];
  }

  const searchTerm = query.toLowerCase();
  console.log('🔎 Search term:', searchTerm);
  const results: SearchResult[] = [];

  try {
    // Search Projects
    console.log('📊 Scanning projects table...');
    const projectsResponse = await docClient.send(
      new ScanCommand({
        TableName: env.PROJECT_TABLE_NAME,
        Limit: 50,
      })
    );

    console.log('✅ Projects scanned:', projectsResponse.Items?.length || 0, 'items');

    if (projectsResponse.Items) {
      for (const item of projectsResponse.Items) {
        console.log('🔍 Checking project:', item.title);
        const titleMatch = item.title?.toLowerCase().includes(searchTerm);
        const descMatch = item.description?.toLowerCase().includes(searchTerm);

        if (titleMatch || descMatch) {
          console.log('✨ Match found:', item.title);
          results.push({
            type: 'project',
            id: item.id,
            title: item.title || 'Untitled Project',
            description: item.description || '',
            relevance: titleMatch ? 1.0 : 0.7,
            highlights: titleMatch ? [item.title] : descMatch ? [item.description.substring(0, 100)] : [],
          });
        }
      }
    }

    // Search Assets
    const assetsResponse = await docClient.send(
      new ScanCommand({
        TableName: env.ASSET_TABLE_NAME,
        Limit: 50,
      })
    );

    if (assetsResponse.Items) {
      for (const item of assetsResponse.Items) {
        const nameMatch = item.assetName?.toLowerCase().includes(searchTerm);
        const descMatch = item.description?.toLowerCase().includes(searchTerm);

        if (nameMatch || descMatch) {
          results.push({
            type: 'asset',
            id: item.id,
            title: item.assetName || 'Untitled Asset',
            description: item.description || '',
            projectId: item.projectId,
            relevance: nameMatch ? 1.0 : 0.7,
            highlights: nameMatch ? [item.assetName] : descMatch ? [item.description?.substring(0, 100)] : [],
          });
        }
      }
    }

    // Search Review Comments
    const commentsResponse = await docClient.send(
      new ScanCommand({
        TableName: env.REVIEWCOMMENT_TABLE_NAME,
        Limit: 50,
      })
    );

    if (commentsResponse.Items) {
      for (const item of commentsResponse.Items) {
        const textMatch = item.commentText?.toLowerCase().includes(searchTerm);

        if (textMatch) {
          results.push({
            type: 'comment',
            id: item.id,
            title: item.commentText?.substring(0, 50) + '...' || 'Comment',
            description: item.commentText || '',
            projectId: item.projectId,
            relevance: 0.8,
            highlights: [item.commentText?.substring(0, 100)],
          });
        }
      }
    }

    // Search Messages
    const messagesResponse = await docClient.send(
      new ScanCommand({
        TableName: env.MESSAGE_TABLE_NAME,
        Limit: 50,
      })
    );

    if (messagesResponse.Items) {
      for (const item of messagesResponse.Items) {
        const contentMatch = item.content?.toLowerCase().includes(searchTerm);

        if (contentMatch) {
          results.push({
            type: 'message',
            id: item.id,
            title: item.content?.substring(0, 50) + '...' || 'Message',
            description: item.content || '',
            projectId: item.projectId,
            relevance: 0.8,
            highlights: [item.content?.substring(0, 100)],
          });
        }
      }
    }

    // Search Tasks
    const tasksResponse = await docClient.send(
      new ScanCommand({
        TableName: env.TASK_TABLE_NAME,
        Limit: 50,
      })
    );

    if (tasksResponse.Items) {
      for (const item of tasksResponse.Items) {
        const titleMatch = item.title?.toLowerCase().includes(searchTerm);
        const descMatch = item.description?.toLowerCase().includes(searchTerm);

        if (titleMatch || descMatch) {
          results.push({
            type: 'task',
            id: item.id,
            title: item.title || 'Untitled Task',
            description: item.description || '',
            projectId: item.projectId,
            relevance: titleMatch ? 1.0 : 0.7,
            highlights: titleMatch ? [item.title] : descMatch ? [item.description?.substring(0, 100)] : [],
          });
        }
      }
    }

    // Sort by relevance and limit
    results.sort((a, b) => b.relevance - a.relevance);
    const finalResults = results.slice(0, limit || 10);
    console.log('🎯 Final results:', finalResults.length, 'items');
    console.log('📤 Returning:', JSON.stringify(finalResults, null, 2));
    return finalResults;

  } catch (error) {
    console.error('❌ Search error:', error);
    return [];
  }
};
