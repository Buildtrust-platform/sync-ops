"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface FeedbackSummaryData {
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

interface FeedbackSummaryProps {
  comments: Array<Schema["ReviewComment"]["type"]>;
  assetId?: string; // Optional, reserved for future use
}

export default function FeedbackSummary({ comments }: FeedbackSummaryProps) {
  const [summary, setSummary] = useState<FeedbackSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  // Generate AI summary when comments change
  useEffect(() => {
    if (comments.length === 0) {
      setSummary(null);
      return;
    }

    async function generateSummary() {
      setLoading(true);
      setError(null);

      try {
        // Call the AI summarization function
        const result = await client.queries.summarizeFeedback({
          comments: comments.map(c => ({
            id: c.id,
            commentText: c.commentText,
            commentType: c.commentType,
            priority: c.priority,
            timecodeFormatted: c.timecodeFormatted,
            commenterRole: c.commenterRole,
            isResolved: c.isResolved || false,
          })),
        });

        if (result.data) {
          setSummary(result.data as FeedbackSummaryData);
        }
      } catch (err) {
        console.error('Error generating feedback summary:', err);
        setError('Failed to generate AI summary. Showing basic statistics.');

        // Fallback to basic stats
        setSummary({
          overallSentiment: 'MIXED',
          totalComments: comments.length,
          unresolvedIssues: comments.filter(c => !c.isResolved && c.commentType === 'ISSUE').length,
          criticalIssues: comments.filter(c => c.priority === 'CRITICAL').length,
          approvalCount: comments.filter(c => c.commentType === 'APPROVAL').length,
          rejectionCount: comments.filter(c => c.commentType === 'REJECTION').length,
          keyThemes: [],
          priorityActions: [],
          commonTimecodeRanges: [],
          summaryText: `${comments.length} total comments with ${comments.filter(c => !c.isResolved).length} unresolved.`,
          recommendations: ['AI analysis unavailable - manual review recommended']
        });
      } finally {
        setLoading(false);
      }
    }

    generateSummary();
  }, [comments]);

  // Show loading state or summary, but hide if no comments
  if (comments.length === 0) {
    return null;
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'bg-green-900/30 border-green-500 text-green-400';
      case 'NEGATIVE': return 'bg-red-900/30 border-red-500 text-red-400';
      case 'MIXED': return 'bg-yellow-900/30 border-yellow-500 text-yellow-400';
      default: return 'bg-slate-700 border-slate-600 text-slate-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-600 text-white';
      case 'MEDIUM': return 'bg-yellow-600 text-white';
      case 'LOW': return 'bg-blue-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border-2 border-blue-500/30 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-lg p-2">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              AI Feedback Analysis
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              )}
            </h3>
            <p className="text-sm text-slate-400">
              {loading ? 'Analyzing feedback...' : 'Powered by Claude AI'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg
            className={`w-6 h-6 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-3 mb-4 text-yellow-200 text-sm">
          {error}
        </div>
      )}

      {loading && !summary && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-slate-400">Analyzing {comments.length} comment{comments.length !== 1 ? 's' : ''}...</p>
          </div>
        </div>
      )}

      {expanded && summary && (
        <>
          {/* Overall Sentiment */}
          <div className={`rounded-lg border-2 p-4 mb-4 ${getSentimentColor(summary.overallSentiment)}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">Overall Sentiment: {summary.overallSentiment}</span>
              <div className="flex gap-4 text-sm">
                <span>✅ {summary.approvalCount} Approvals</span>
                <span>❌ {summary.rejectionCount} Rejections</span>
                <span>⚠️ {summary.unresolvedIssues} Unresolved</span>
                {summary.criticalIssues > 0 && (
                  <span className="font-bold text-red-300">🔥 {summary.criticalIssues} Critical</span>
                )}
              </div>
            </div>
          </div>

          {/* Summary Text */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-4">
            <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Executive Summary
            </h4>
            <p className="text-white leading-relaxed">{summary.summaryText}</p>
          </div>

          {/* Key Themes */}
          {summary.keyThemes && summary.keyThemes.length > 0 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-4">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Key Themes ({summary.keyThemes.length})
              </h4>
              <div className="space-y-2">
                {summary.keyThemes.map((theme, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900 rounded p-3">
                    <span className="text-white">{theme.theme}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{theme.frequency} mentions</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${getSeverityColor(theme.severity)}`}>
                        {theme.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Actions */}
          {summary.priorityActions && summary.priorityActions.length > 0 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-4">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Priority Actions
              </h4>
              <ul className="space-y-2">
                {summary.priorityActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-white">
                    <span className="text-teal-400 font-bold">{idx + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Timecode Ranges */}
          {summary.commonTimecodeRanges && summary.commonTimecodeRanges.length > 0 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-4">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Problem Areas by Timecode
              </h4>
              <div className="space-y-2">
                {summary.commonTimecodeRanges.map((range, idx) => (
                  <div key={idx} className="bg-slate-900 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-teal-400 font-bold">{range.range}</span>
                      <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">
                        {range.issueCount} {range.issueCount === 1 ? 'issue' : 'issues'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{range.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {summary.recommendations && summary.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 rounded-lg border border-teal-500 p-4">
              <h4 className="text-sm font-bold text-teal-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Recommendations
              </h4>
              <ul className="space-y-2">
                {summary.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-white">
                    <span className="text-teal-400">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
