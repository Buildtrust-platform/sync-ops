"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

// SVG Icon Components (Lucide-style, stroke-width: 1.5)
const LightbulbIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const ClipboardCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ZapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const FlameIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

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
  assetId?: string;
}

export default function FeedbackSummary({ comments }: FeedbackSummaryProps) {
  const [client] = useState(() => generateClient<Schema>());
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

  if (comments.length === 0) {
    return null;
  }

  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return { bg: 'rgba(34, 197, 94, 0.1)', border: 'var(--status-success)', color: 'var(--status-success)' };
      case 'NEGATIVE': return { bg: 'rgba(239, 68, 68, 0.1)', border: 'var(--status-error)', color: 'var(--status-error)' };
      case 'MIXED': return { bg: 'rgba(234, 179, 8, 0.1)', border: 'var(--status-warning)', color: 'var(--status-warning)' };
      default: return { bg: 'var(--bg-3)', border: 'var(--border-default)', color: 'var(--text-secondary)' };
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { bg: 'var(--status-error)', color: 'var(--text-primary)' };
      case 'HIGH': return { bg: 'var(--status-warning)', color: 'var(--bg-1)' };
      case 'MEDIUM': return { bg: 'var(--status-warning)', color: 'var(--bg-1)' };
      case 'LOW': return { bg: 'var(--accent-secondary)', color: 'var(--text-primary)' };
      default: return { bg: 'var(--bg-3)', color: 'var(--text-primary)' };
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
      borderRadius: '12px',
      border: '2px solid rgba(99, 102, 241, 0.3)',
      padding: '24px',
      marginBottom: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: 'var(--accent-secondary)', borderRadius: '10px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LightbulbIcon />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              AI Feedback Analysis
              {loading && (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTopColor: 'var(--accent-secondary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
              )}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {loading ? 'Analyzing feedback...' : 'Powered by Claude AI'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 80ms ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ChevronDownIcon />
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid var(--status-warning)',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '16px',
          color: 'var(--status-warning)',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {loading && !summary && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '2px solid transparent',
              borderTopColor: 'var(--accent-secondary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px',
            }} />
            <p style={{ color: 'var(--text-muted)' }}>Analyzing {comments.length} comment{comments.length !== 1 ? 's' : ''}...</p>
          </div>
        </div>
      )}

      {expanded && summary && (
        <>
          {/* Overall Sentiment */}
          <div style={{
            borderRadius: '10px',
            border: `2px solid ${getSentimentStyles(summary.overallSentiment).border}`,
            backgroundColor: getSentimentStyles(summary.overallSentiment).bg,
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: getSentimentStyles(summary.overallSentiment).color }}>
                Overall Sentiment: {summary.overallSentiment}
              </span>
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckIcon /> {summary.approvalCount} Approvals
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XIcon /> {summary.rejectionCount} Rejections
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangleIcon /> {summary.unresolvedIssues} Unresolved
                </span>
                {summary.criticalIssues > 0 && (
                  <span style={{ fontWeight: 'bold', color: 'var(--status-error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FlameIcon /> {summary.criticalIssues} Critical
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Summary Text */}
          <div style={{
            backgroundColor: 'var(--bg-2)',
            borderRadius: '10px',
            border: '1px solid var(--border-default)',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileTextIcon />
              Executive Summary
            </h4>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{summary.summaryText}</p>
          </div>

          {/* Key Themes */}
          {summary.keyThemes && summary.keyThemes.length > 0 && (
            <div style={{
              backgroundColor: 'var(--bg-2)',
              borderRadius: '10px',
              border: '1px solid var(--border-default)',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TagIcon />
                Key Themes ({summary.keyThemes.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {summary.keyThemes.map((theme, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-1)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}>
                    <span style={{ color: 'var(--text-primary)' }}>{theme.theme}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{theme.frequency} mentions</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: getSeverityStyles(theme.severity).bg,
                        color: getSeverityStyles(theme.severity).color,
                      }}>
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
            <div style={{
              backgroundColor: 'var(--bg-2)',
              borderRadius: '10px',
              border: '1px solid var(--border-default)',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardCheckIcon />
                Priority Actions
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {summary.priorityActions.map((action, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{idx + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Timecode Ranges */}
          {summary.commonTimecodeRanges && summary.commonTimecodeRanges.length > 0 && (
            <div style={{
              backgroundColor: 'var(--bg-2)',
              borderRadius: '10px',
              border: '1px solid var(--border-default)',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockIcon />
                Problem Areas by Timecode
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {summary.commonTimecodeRanges.map((range, idx) => (
                  <div key={idx} style={{ backgroundColor: 'var(--bg-1)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{range.range}</span>
                      <span style={{
                        fontSize: '12px',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: 'var(--status-error)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}>
                        {range.issueCount} {range.issueCount === 1 ? 'issue' : 'issues'}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{range.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {summary.recommendations && summary.recommendations.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.1), rgba(99, 102, 241, 0.1))',
              borderRadius: '10px',
              border: '1px solid var(--accent-primary)',
              padding: '16px',
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ZapIcon />
                AI Recommendations
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {summary.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--accent-primary)' }}><ArrowRightIcon /></span>
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
