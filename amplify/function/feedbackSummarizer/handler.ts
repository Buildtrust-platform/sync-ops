/* eslint-disable @typescript-eslint/no-explicit-any */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'eu-central-1' });

// Simple in-memory rate limiter (20 requests per minute per user)
class RateLimiter {
  private requests = new Map<string, { count: number; windowStart: number }>();
  constructor(private maxRequests = 20, private windowSeconds = 60) {}

  check(identifier: string): { allowed: boolean; remaining: number } {
    const now = Math.floor(Date.now() / 1000);
    const record = this.requests.get(identifier);
    if (!record || record.windowStart < now - this.windowSeconds) {
      this.requests.set(identifier, { count: 1, windowStart: now });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }
    if (record.count >= this.maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    record.count++;
    return { allowed: true, remaining: this.maxRequests - record.count };
  }
}

const rateLimiter = new RateLimiter(20, 60);

function getUserId(event: any): string {
  return event.identity?.sub || event.identity?.username || 'anonymous';
}

interface ReviewComment {
  id: string;
  commentText: string;
  commentType: 'NOTE' | 'ISSUE' | 'APPROVAL' | 'REJECTION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timecodeFormatted?: string;
  commenterRole?: string;
  isResolved: boolean;
}

interface FeedbackSummary {
  overallSentiment: 'POSITIVE' | 'MIXED' | 'NEGATIVE';
  totalComments: number;
  unresolvedIssues: number;
  criticalIssues: number;
  approvalCount: number;
  rejectionCount: number;
  keyThemes: Array<{
    theme: string;
    frequency: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  priorityActions: string[];
  commonTimecodeRanges: Array<{
    range: string;
    issueCount: number;
    description: string;
  }>;
  summaryText: string;
  recommendations: string[];
}

export const handler = async (event: any) => {
  console.log('Feedback Summarizer AI processing started');
  console.log('Event:', JSON.stringify(event, null, 2));

  // Rate limiting check
  const userId = getUserId(event);
  const rateCheck = rateLimiter.check(userId);
  if (!rateCheck.allowed) {
    throw new Error('Rate limit exceeded. Please wait before making another request.');
  }

  // Extract arguments from GraphQL event
  const { comments } = event.arguments || {};

  // Input validation
  if (!comments || !Array.isArray(comments)) {
    return {
      overallSentiment: 'POSITIVE',
      totalComments: 0,
      unresolvedIssues: 0,
      criticalIssues: 0,
      approvalCount: 0,
      rejectionCount: 0,
      keyThemes: [],
      priorityActions: [],
      commonTimecodeRanges: [],
      summaryText: 'No feedback comments yet.',
      recommendations: ['Start gathering feedback by creating a review.']
    };
  }
  if (comments.length > 500) {
    throw new Error('Maximum 500 comments allowed per request');
  }

  if (comments.length === 0) {
    return {
      overallSentiment: 'POSITIVE',
      totalComments: 0,
      unresolvedIssues: 0,
      criticalIssues: 0,
      approvalCount: 0,
      rejectionCount: 0,
      keyThemes: [],
      priorityActions: [],
      commonTimecodeRanges: [],
      summaryText: 'No feedback comments yet.',
      recommendations: ['Start gathering feedback by creating a review.']
    };
  }

  // Parse comments if they're strings
  const parsedComments: ReviewComment[] = typeof comments[0] === 'string'
    ? comments.map((c: string) => JSON.parse(c))
    : comments;

  // Calculate basic statistics
  const totalComments = parsedComments.length;
  const unresolvedIssues = parsedComments.filter(c => !c.isResolved && c.commentType === 'ISSUE').length;
  const criticalIssues = parsedComments.filter(c => c.priority === 'CRITICAL').length;
  const approvalCount = parsedComments.filter(c => c.commentType === 'APPROVAL').length;
  const rejectionCount = parsedComments.filter(c => c.commentType === 'REJECTION').length;

  // Construct Bedrock prompt
  const commentsText = parsedComments.map((comment, index) =>
    `Comment ${index + 1}:
- Type: ${comment.commentType}
- Priority: ${comment.priority}
- Timecode: ${comment.timecodeFormatted || 'N/A'}
- Role: ${comment.commenterRole || 'N/A'}
- Status: ${comment.isResolved ? 'RESOLVED' : 'UNRESOLVED'}
- Text: ${comment.commentText}
`).join('\n');

  const prompt = `You are an AI assistant for SyncOps, a media production review system.
Analyze the following review comments for a media asset and provide a comprehensive feedback summary.

Review Comments (${totalComments} total):
${commentsText}

Statistics:
- Total Comments: ${totalComments}
- Unresolved Issues: ${unresolvedIssues}
- Critical Issues: ${criticalIssues}
- Approvals: ${approvalCount}
- Rejections: ${rejectionCount}

Analyze these comments and return a JSON object with this structure:
{
  "overallSentiment": "POSITIVE" | "MIXED" | "NEGATIVE" (based on approval/rejection ratio and issue severity),
  "keyThemes": [
    {
      "theme": "Brief description of recurring feedback theme",
      "frequency": number of comments related to this theme,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    }
  ],
  "priorityActions": [
    "List of 3-5 specific actionable items based on unresolved high-priority issues"
  ],
  "commonTimecodeRanges": [
    {
      "range": "Timecode range like '00:15-00:30'",
      "issueCount": number of issues in this range,
      "description": "What issues occur in this section"
    }
  ],
  "summaryText": "2-3 sentence executive summary of the feedback",
  "recommendations": [
    "3-5 strategic recommendations for addressing feedback"
  ]
}

Focus on:
1. Identifying patterns and recurring themes across comments
2. Highlighting critical/high-priority unresolved issues
3. Grouping feedback by timecode areas if applicable
4. Providing actionable next steps
5. Being concise and production-focused

Return ONLY the JSON object, no additional text.`;

  try {
    // Invoke Bedrock
    const bedrockRequest = {
      modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    };

    console.log('Calling Bedrock with model:', bedrockRequest.modelId);

    const command = new InvokeModelCommand(bedrockRequest);
    const response = await bedrockClient.send(command);

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('Bedrock response:', JSON.stringify(responseBody, null, 2));

    // Extract the AI response
    const aiResponse = responseBody.content[0].text;

    // Parse the JSON from AI response
    const aiSummary = JSON.parse(aiResponse);

    // Merge AI analysis with calculated statistics
    const fullSummary: FeedbackSummary = {
      overallSentiment: aiSummary.overallSentiment,
      totalComments,
      unresolvedIssues,
      criticalIssues,
      approvalCount,
      rejectionCount,
      keyThemes: aiSummary.keyThemes || [],
      priorityActions: aiSummary.priorityActions || [],
      commonTimecodeRanges: aiSummary.commonTimecodeRanges || [],
      summaryText: aiSummary.summaryText,
      recommendations: aiSummary.recommendations || []
    };

    console.log('Feedback summary:', JSON.stringify(fullSummary, null, 2));

    return fullSummary;
  } catch (error: any) {
    console.error('Error processing feedback summary:', error);

    // Return a fallback summary if AI fails
    return {
      overallSentiment: rejectionCount > approvalCount ? 'NEGATIVE' : approvalCount > rejectionCount ? 'POSITIVE' : 'MIXED',
      totalComments,
      unresolvedIssues,
      criticalIssues,
      approvalCount,
      rejectionCount,
      keyThemes: [],
      priorityActions: unresolvedIssues > 0 ? ['Review and address unresolved issues'] : [],
      commonTimecodeRanges: [],
      summaryText: `${totalComments} comments received. ${unresolvedIssues} unresolved issues. ${criticalIssues} critical items.`,
      recommendations: ['AI analysis unavailable - manual review recommended']
    };
  }
};
