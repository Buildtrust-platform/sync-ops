"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import FeedbackSummary from "./FeedbackSummary";
import ReviewHeatmap from "./ReviewHeatmap";
import VideoPlayer from "./VideoPlayer";
import AudioWaveform from "./AudioWaveform";
import {
  FRAME_RATES,
  secondsToSMPTE,
  smpteToSeconds,
  TimecodeToolbar,
  type FrameRateKey,
} from "./SMPTETimecode";

/**
 * ASSET REVIEW COMPONENT
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

interface AssetReviewProps {
  assetId: string;
  projectId: string;
  organizationId?: string;
  userEmail: string;
  userId: string;
  onClose: () => void;
}

export default function AssetReview({
  assetId,
  projectId,
  organizationId,
  userEmail,
  userId,
  onClose
}: AssetReviewProps) {
  const orgId = organizationId || 'default-org';
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [asset, setAsset] = useState<Schema["Asset"]["type"] | null>(null);

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);
  const [reviews, setReviews] = useState<Array<Schema["Review"]["type"]>>([]);
  const [comments, setComments] = useState<Array<Schema["ReviewComment"]["type"]>>([]);

  // Review creation state
  const [selectedRole, setSelectedRole] = useState<'INTERNAL' | 'CLIENT' | 'LEGAL' | 'COMPLIANCE'>('INTERNAL');
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);

  // Comment creation state
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState<'NOTE' | 'ISSUE' | 'APPROVAL' | 'REJECTION'>('NOTE');
  const [commentPriority, setCommentPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [timecode, setTimecode] = useState<number>(0);

  // Legal approval state
  const [showLegalApproval, setShowLegalApproval] = useState(false);

  // Video player state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [seekToTime, setSeekToTime] = useState<number | undefined>(undefined);
  const [frameRateKey, setFrameRateKey] = useState<FrameRateKey>('24'); // Default to 24fps for film

  // Get numeric frame rate from key
  const frameRate = FRAME_RATES[frameRateKey].fps;

  // Audio player state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentAudioTime, setCurrentAudioTime] = useState<number>(0);

  // Load asset and reviews
  useEffect(() => {
    if (!client) return;
    if (assetId) {
      // Load asset
      client.models.Asset.get({ id: assetId }).then((data) => {
        if (data.data) {
          setAsset(data.data);
        }
      });

      // Load reviews for this asset
      const reviewSub = client.models.Review.observeQuery({
        filter: { assetId: { eq: assetId } }
      }).subscribe({
        next: (data) => setReviews([...data.items]),
      });

      // Load all comments for this asset
      const commentSub = client.models.ReviewComment.observeQuery({
        filter: { assetId: { eq: assetId } }
      }).subscribe({
        next: (data) => setComments([...data.items].sort((a, b) =>
          (a.timecode || 0) - (b.timecode || 0)
        )),
      });

      return () => {
        reviewSub.unsubscribe();
        commentSub.unsubscribe();
      };
    }
  }, [assetId, client]);

  // Load video/audio URL when asset is available
  useEffect(() => {
    if (asset?.s3Key) {
      if (isVideoFile(asset.s3Key)) {
        getUrl({
          path: asset.s3Key,
          options: { expiresIn: 3600 }
        }).then(({ url }) => {
          setVideoUrl(url.toString());
        }).catch(err => {
          console.error('Error loading video URL:', err);
        });
      } else if (isAudioFile(asset.s3Key)) {
        getUrl({
          path: asset.s3Key,
          options: { expiresIn: 3600 }
        }).then(({ url }) => {
          setAudioUrl(url.toString());
        }).catch(err => {
          console.error('Error loading audio URL:', err);
        });
      }
    }
  }, [asset]);

  function isVideoFile(filename: string): boolean {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv'];
    const lowerFilename = filename.toLowerCase();
    return videoExtensions.some(ext => lowerFilename.endsWith(ext));
  }

  function isAudioFile(filename: string): boolean {
    const audioExtensions = ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a', '.wma', '.aiff'];
    const lowerFilename = filename.toLowerCase();
    return audioExtensions.some(ext => lowerFilename.endsWith(ext));
  }

  function handleSeekToTimecode(tc: number) {
    setSeekToTime(tc);
    setTimecode(tc);
    setTimeout(() => setSeekToTime(undefined), 100);
  }

  async function startReview() {
    if (!client) return;
    try {
      const newReview = await client.models.Review.create({
        organizationId: orgId,
        assetId,
        projectId,
        reviewerId: userId,
        reviewerEmail: userEmail,
        reviewerRole: selectedRole,
        status: 'IN_PROGRESS',
        isLegalApproved: false,
      });

      if (newReview.data) {
        setCurrentReviewId(newReview.data.id);

        await client.models.ActivityLog.create({
          organizationId: orgId,
          projectId,
          userId,
          userEmail,
          userRole: selectedRole,
          action: 'REVIEW_CREATED',
          targetType: 'Review',
          targetId: newReview.data.id,
          targetName: `${selectedRole} Review`,
          metadata: { assetId, reviewerRole: selectedRole },
        });
      }
    } catch (error) {
      console.error('Error creating review:', error);
    }
  }

  async function addComment() {
    if (!currentReviewId || !commentText.trim() || !client) return;

    try {
      const newComment = await client.models.ReviewComment.create({
        organizationId: orgId,
        reviewId: currentReviewId,
        assetId,
        projectId,
        commenterId: userId,
        commenterEmail: userEmail,
        commenterRole: selectedRole,
        timecode,
        timecodeFormatted: formatTimecode(timecode),
        commentText,
        commentType,
        priority: commentPriority,
        isResolved: false,
      });

      if (newComment.data) {
        await client.models.ActivityLog.create({
          organizationId: orgId,
          projectId,
          userId,
          userEmail,
          userRole: selectedRole,
          action: 'COMMENT_ADDED',
          targetType: 'Comment',
          targetId: newComment.data.id,
          targetName: commentText.substring(0, 50),
          metadata: { assetId, timecode, commentType, priority: commentPriority },
        });

        setCommentText("");
        setTimecode(0);
        setShowCommentForm(false);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  async function resolveComment(commentId: string) {
    if (!client) return;
    try {
      await client.models.ReviewComment.update({
        id: commentId,
        isResolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedBy: userId,
      });

      await client.models.ActivityLog.create({
        organizationId: orgId,
        projectId,
        userId,
        userEmail,
        userRole: selectedRole,
        action: 'COMMENT_RESOLVED',
        targetType: 'Comment',
        targetId: commentId,
        targetName: 'Comment resolved',
        metadata: { assetId },
      });
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  }

  async function completeReview() {
    if (!currentReviewId || !client) return;

    try {
      await client.models.Review.update({
        id: currentReviewId,
        status: 'COMPLETED',
      });

      await client.models.ActivityLog.create({
        organizationId: orgId,
        projectId,
        userId,
        userEmail,
        userRole: selectedRole,
        action: 'REVIEW_COMPLETED',
        targetType: 'Review',
        targetId: currentReviewId,
        targetName: `${selectedRole} Review Completed`,
        metadata: { assetId, commentCount: comments.length },
      });

      setCurrentReviewId(null);
    } catch (error) {
      console.error('Error completing review:', error);
    }
  }

  async function approveLegalReview() {
    if (!currentReviewId || !client) return;

    const confirmApproval = confirm(
      "LEGAL APPROVAL LOCK\n\n" +
      "Once you approve this asset, it becomes IMMUTABLE and cannot be modified.\n" +
      "This action cannot be undone.\n\n" +
      "Are you absolutely certain you want to approve this asset for legal compliance?"
    );

    if (!confirmApproval) return;

    try {
      await client.models.Review.update({
        id: currentReviewId,
        status: 'APPROVED',
        isLegalApproved: true,
        legalApprovedAt: new Date().toISOString(),
        legalApprovedBy: userId,
      });

      await client.models.ActivityLog.create({
        organizationId: orgId,
        projectId,
        userId,
        userEmail,
        userRole: 'Legal',
        action: 'LEGAL_APPROVED',
        targetType: 'Asset',
        targetId: assetId,
        targetName: asset?.s3Key || 'Asset',
        metadata: {
          reviewId: currentReviewId,
          legalApprovedBy: userEmail,
          timestamp: new Date().toISOString(),
          immutable: true
        },
      });

      alert("Asset legally approved and locked. This asset is now immutable.");
      setShowLegalApproval(false);
      setCurrentReviewId(null);
    } catch (error) {
      console.error('Error approving legal review:', error);
      alert("Error: Failed to approve asset. Please try again.");
    }
  }

  // SMPTE timecode formatting using selected frame rate
  function formatTimecode(seconds: number): string {
    return secondsToSMPTE(seconds, frameRate);
  }

  const isLegalReviewer = selectedRole === 'LEGAL';
  const hasLegalApproval = reviews.some(r => r.isLegalApproved);

  // Style helpers
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return { bg: 'var(--error-muted)', color: 'var(--error)', border: 'var(--error)' };
      case 'HIGH': return { bg: 'var(--warning-muted)', color: 'var(--warning)', border: 'var(--warning)' };
      case 'MEDIUM': return { bg: 'var(--primary-muted)', color: 'var(--primary)', border: 'var(--primary)' };
      default: return { bg: 'var(--bg-2)', color: 'var(--text-secondary)', border: 'var(--border)' };
    }
  };

  const getCommentTypeStyles = (type: string) => {
    switch (type) {
      case 'ISSUE':
      case 'REJECTION': return { bg: 'var(--error-muted)', color: 'var(--error)' };
      case 'APPROVAL': return { bg: 'var(--success-muted)', color: 'var(--success)' };
      default: return { bg: 'var(--primary-muted)', color: 'var(--primary)' };
    }
  };

  const getStatusStyles = (status: string | null | undefined) => {
    switch (status) {
      case 'APPROVED': return { bg: 'var(--success-muted)', color: 'var(--success)' };
      case 'REJECTED': return { bg: 'var(--error-muted)', color: 'var(--error)' };
      case 'COMPLETED': return { bg: 'var(--primary-muted)', color: 'var(--primary)' };
      default: return { bg: 'var(--warning-muted)', color: 'var(--warning)' };
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-[12px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="p-6"
          style={{ background: 'var(--bg-0)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>
                Asset Review & Approval
              </h2>
              <p className="text-[14px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {asset?.s3Key?.split('/').pop()}
              </p>
              {hasLegalApproval && (
                <div
                  className="mt-3 rounded-[8px] px-4 py-2 flex items-center gap-2"
                  style={{ background: 'var(--success-muted)', border: '1px solid var(--success)' }}
                >
                  <span style={{ color: 'var(--success)' }}><CheckCircleIcon /></span>
                  <span className="font-bold text-[13px]" style={{ color: 'var(--success)' }}>
                    LEGALLY APPROVED & LOCKED (IMMUTABLE)
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-[6px] transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Video Player */}
          {videoUrl && (
            <div
              className="rounded-[12px] overflow-hidden"
              style={{ background: 'var(--bg-0)', border: '1px solid var(--border)' }}
            >
              <VideoPlayer
                src={videoUrl}
                onTimeUpdate={(time) => setCurrentVideoTime(time)}
                onDurationChange={(dur) => setVideoDuration(dur)}
                seekTo={seekToTime}
              />
            </div>
          )}

          {/* SMPTE Timecode Toolbar - shows when video or audio is loaded */}
          {(videoUrl || audioUrl) && (
            <TimecodeToolbar
              currentTime={videoUrl ? currentVideoTime : currentAudioTime}
              duration={videoUrl ? videoDuration : audioDuration}
              frameRate={frameRateKey}
              onFrameRateChange={setFrameRateKey}
              onSeek={(time: number) => setSeekToTime(time)}
            />
          )}

          {/* Audio Waveform */}
          {audioUrl && (
            <AudioWaveform
              src={audioUrl}
              onTimeUpdate={(time) => setCurrentAudioTime(time)}
              onDurationChange={(dur) => setAudioDuration(dur)}
              seekTo={seekToTime}
            />
          )}

          {/* AI Feedback Summary */}
          {comments.length > 0 && (
            <FeedbackSummary comments={comments} assetId={assetId} />
          )}

          {/* Review Heatmap */}
          {comments.length > 0 && (
            <ReviewHeatmap
              comments={comments}
              duration={videoDuration > 0 ? videoDuration : audioDuration > 0 ? audioDuration : undefined}
              currentTime={videoUrl ? currentVideoTime : audioUrl ? currentAudioTime : undefined}
              frameRate={frameRate}
              onTimecodeClick={(tc) => {
                handleSeekToTimecode(tc);
                const targetComment = comments.find(c => Math.abs((c.timecode || 0) - tc) < 5);
                if (targetComment) {
                  const commentElement = document.getElementById(`comment-${targetComment.id}`);
                  if (commentElement) {
                    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    commentElement.style.boxShadow = '0 0 0 4px var(--primary)';
                    setTimeout(() => {
                      commentElement.style.boxShadow = 'none';
                    }, 2000);
                  }
                }
              }}
            />
          )}

          {/* Start Review Section */}
          {!currentReviewId && !hasLegalApproval && (
            <div
              className="rounded-[12px] p-6"
              style={{ background: 'var(--bg-0)', border: '1px solid var(--border)' }}
            >
              <h3 className="text-[18px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Start New Review
              </h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label
                    className="block text-[11px] font-bold uppercase mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Reviewer Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as typeof selectedRole)}
                    className="w-full p-3 rounded-[6px] text-[14px]"
                    style={{
                      background: 'var(--bg-1)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="INTERNAL">Internal Review</option>
                    <option value="CLIENT">Client Review</option>
                    <option value="LEGAL">Legal Review</option>
                    <option value="COMPLIANCE">Compliance Review</option>
                  </select>
                </div>
                <button
                  onClick={startReview}
                  className="py-3 px-6 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] active:scale-[0.98]"
                  style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                >
                  Start Review
                </button>
              </div>
            </div>
          )}

          {/* Active Review */}
          {currentReviewId && (
            <div
              className="rounded-[12px] p-6"
              style={{ background: 'var(--bg-0)', border: '2px solid var(--primary)' }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-[18px] font-bold" style={{ color: 'var(--primary)' }}>
                    Active Review: {selectedRole}
                  </h3>
                  <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                    Reviewer: {userEmail}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isLegalReviewer && !hasLegalApproval && (
                    <button
                      onClick={() => setShowLegalApproval(true)}
                      className="py-2 px-4 rounded-[6px] font-semibold text-[13px] flex items-center gap-2 transition-all duration-[80ms] active:scale-[0.98]"
                      style={{ background: 'var(--success)', color: 'white' }}
                      onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                    >
                      <ShieldCheckIcon />
                      Legal Approve & Lock
                    </button>
                  )}
                  <button
                    onClick={completeReview}
                    className="py-2 px-4 rounded-[6px] font-semibold text-[13px] transition-all duration-[80ms] active:scale-[0.98]"
                    style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  >
                    Complete Review
                  </button>
                </div>
              </div>

              {/* Add Comment Button */}
              {!showCommentForm && (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="w-full py-4 rounded-[8px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-[80ms]"
                  style={{
                    background: 'var(--bg-1)',
                    border: '2px dashed var(--border)',
                    color: 'var(--text-tertiary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }}
                >
                  <PlusIcon />
                  Add Time-Coded Comment
                </button>
              )}

              {/* Comment Form */}
              {showCommentForm && (
                <div
                  className="rounded-[10px] p-4 space-y-4"
                  style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        className="block text-[11px] font-bold uppercase mb-2"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Timecode (SMPTE @ {frameRate}fps)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.04166666"
                          min="0"
                          value={timecode}
                          onChange={(e) => setTimecode(parseFloat(e.target.value) || 0)}
                          placeholder="0.0"
                          className="flex-1 p-2 rounded-[6px] text-[13px] font-mono"
                          style={{
                            background: 'var(--bg-2)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        />
                        {(videoUrl || audioUrl) && (
                          <button
                            type="button"
                            onClick={() => setTimecode(Math.round((videoUrl ? currentVideoTime : currentAudioTime) * frameRate) / frameRate)}
                            className="px-2 py-1 rounded-[6px] text-[11px] font-bold transition-all duration-[80ms]"
                            style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
                            title="Use current playback time"
                          >
                            Use Now
                          </button>
                        )}
                      </div>
                      <p className="text-[12px] mt-1 font-mono" style={{ color: 'var(--primary)' }}>
                        {formatTimecode(timecode)}
                      </p>
                    </div>
                    <div>
                      <label
                        className="block text-[11px] font-bold uppercase mb-2"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Type
                      </label>
                      <select
                        value={commentType}
                        onChange={(e) => setCommentType(e.target.value as typeof commentType)}
                        className="w-full p-2 rounded-[6px] text-[13px]"
                        style={{
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <option value="NOTE">Note</option>
                        <option value="ISSUE">Issue</option>
                        <option value="APPROVAL">Approval</option>
                        <option value="REJECTION">Rejection</option>
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-[11px] font-bold uppercase mb-2"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Priority
                      </label>
                      <select
                        value={commentPriority}
                        onChange={(e) => setCommentPriority(e.target.value as typeof commentPriority)}
                        className="w-full p-2 rounded-[6px] text-[13px]"
                        style={{
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-[11px] font-bold uppercase mb-2"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Comment
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Enter your feedback..."
                      className="w-full p-3 rounded-[6px] text-[13px] h-24 resize-none"
                      style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addComment}
                      disabled={!commentText.trim()}
                      className="flex-1 py-2 px-4 rounded-[6px] font-semibold text-[13px] transition-all duration-[80ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
                      onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                    >
                      Add Comment
                    </button>
                    <button
                      onClick={() => {
                        setShowCommentForm(false);
                        setCommentText("");
                        setTimecode(0);
                      }}
                      className="flex-1 py-2 px-4 rounded-[6px] font-semibold text-[13px] transition-all duration-[80ms] active:scale-[0.98]"
                      style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Timeline */}
          <div
            className="rounded-[12px] p-6"
            style={{ background: 'var(--bg-0)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-[18px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Comments Timeline ({comments.length})
            </h3>
            {comments.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                No comments yet
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => {
                  const priorityStyles = getPriorityStyles(comment.priority || 'LOW');
                  const typeStyles = getCommentTypeStyles(comment.commentType || 'NOTE');

                  return (
                    <div
                      key={comment.id}
                      id={`comment-${comment.id}`}
                      className="rounded-[10px] p-4 transition-all"
                      style={{
                        background: comment.isResolved ? 'var(--bg-1)' : 'var(--bg-1)',
                        border: `1px solid ${comment.isResolved ? 'var(--border)' : priorityStyles.border}`,
                        opacity: comment.isResolved ? 0.6 : 1,
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => videoUrl && comment.timecode && handleSeekToTimecode(comment.timecode)}
                            className="font-mono text-[12px] px-2 py-1 rounded-[4px] transition-all"
                            style={{
                              background: 'var(--primary)',
                              color: 'var(--bg-0)',
                              cursor: videoUrl ? 'pointer' : 'default',
                            }}
                            title={videoUrl ? 'Click to jump to this timecode' : comment.timecodeFormatted || ''}
                          >
                            {comment.timecodeFormatted}
                          </button>
                          <span
                            className="text-[11px] font-bold px-2 py-1 rounded-[4px]"
                            style={{ background: typeStyles.bg, color: typeStyles.color }}
                          >
                            {comment.commentType}
                          </span>
                          <span
                            className="text-[11px] font-bold px-2 py-1 rounded-[4px]"
                            style={{ background: priorityStyles.bg, color: priorityStyles.color }}
                          >
                            {comment.priority}
                          </span>
                          {comment.isResolved && (
                            <span
                              className="text-[11px] font-bold px-2 py-1 rounded-[4px] flex items-center gap-1"
                              style={{ background: 'var(--success-muted)', color: 'var(--success)' }}
                            >
                              <CheckCircleIcon /> RESOLVED
                            </span>
                          )}
                        </div>
                        {!comment.isResolved && currentReviewId && (
                          <button
                            onClick={() => resolveComment(comment.id)}
                            className="text-[11px] font-bold px-3 py-1 rounded-[4px] transition-all duration-[80ms]"
                            style={{ background: 'var(--success)', color: 'white' }}
                            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                      <p className="text-[14px] mb-2" style={{ color: 'var(--text-primary)' }}>
                        {comment.commentText}
                      </p>
                      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        {comment.commenterEmail} • {comment.commenterRole} • {
                          comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'N/A'
                        }
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Review History */}
          <div
            className="rounded-[12px] p-6"
            style={{ background: 'var(--bg-0)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-[18px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Review History ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                No reviews yet
              </p>
            ) : (
              <div className="space-y-2">
                {reviews.map((review) => {
                  const statusStyles = getStatusStyles(review.status);

                  return (
                    <div
                      key={review.id}
                      className="rounded-[10px] p-4 flex justify-between items-center"
                      style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                            {review.reviewerRole}
                          </span>
                          <span
                            className="text-[11px] font-bold px-2 py-1 rounded-[4px]"
                            style={{ background: statusStyles.bg, color: statusStyles.color }}
                          >
                            {review.status}
                          </span>
                          {review.isLegalApproved && (
                            <span
                              className="text-[11px] font-bold px-2 py-1 rounded-[4px] flex items-center gap-1"
                              style={{ background: 'var(--success)', color: 'white' }}
                            >
                              <LockIcon />
                              LEGAL LOCK
                            </span>
                          )}
                        </div>
                        <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                          {review.reviewerEmail} • {review.createdAt ? new Date(review.createdAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Legal Approval Confirmation Modal */}
        {showLegalApproval && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }}
          >
            <div
              className="rounded-[12px] p-8 max-w-2xl"
              style={{ background: 'var(--bg-1)', border: '2px solid var(--error)' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <span style={{ color: 'var(--error)' }}>
                  <AlertTriangleIcon />
                </span>
                <div>
                  <h3 className="text-[22px] font-bold mb-2" style={{ color: 'var(--error)' }}>
                    Legal Approval Lock
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                    You are about to LEGALLY APPROVE this asset. This action:
                  </p>
                  <ul className="space-y-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--error)' }}>•</span>
                      Makes the asset <strong>IMMUTABLE</strong> (cannot be modified)
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--error)' }}>•</span>
                      Locks all review comments permanently
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--error)' }}>•</span>
                      Creates an <strong>audit trail</strong> record
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--error)' }}>•</span>
                      <strong>CANNOT BE UNDONE</strong>
                    </li>
                  </ul>
                  <p className="font-bold" style={{ color: 'var(--warning)' }}>
                    Are you absolutely certain this asset meets all legal and compliance requirements?
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLegalApproval(false)}
                  className="flex-1 py-3 px-6 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] active:scale-[0.98]"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={approveLegalReview}
                  className="flex-1 py-3 px-6 rounded-[6px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-[80ms] active:scale-[0.98]"
                  style={{ background: 'var(--success)', color: 'white' }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                >
                  <ShieldCheckIcon />
                  Approve & Lock Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
