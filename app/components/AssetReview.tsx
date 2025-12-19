"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import FeedbackSummary from "./FeedbackSummary";
import ReviewHeatmap from "./ReviewHeatmap";
import VideoPlayer, { type VideoPlayerRef } from "./VideoPlayer";
import AudioWaveform from "./AudioWaveform";
import {
  FRAME_RATES,
  secondsToSMPTE,
  smpteToSeconds,
  TimecodeToolbar,
  type FrameRateKey,
} from "./SMPTETimecode";
import { useToast } from "./Toast";
import AnnotationToolbar, { type AnnotationTool, type AnnotationStyle } from "./AnnotationToolbar";
import VideoAnnotationCanvas, { type VideoAnnotationCanvasRef, type AnnotationShape } from "./VideoAnnotationCanvas";
import VersionSwitcher from "./VersionSwitcher";
import type { CaptionCue } from "./CaptionOverlay";
import PresentationMode, { PresentationModeButton } from "./PresentationMode";
import ViewAnalytics from "./ViewAnalytics";
// Consolidated components (replacing separate Transcript, Caption, Encoding, Delivery components)
import MediaIntelligence from "./MediaIntelligence";
import DeliveryCenter from "./DeliveryCenter";

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
  const toast = useToast();
  const orgId = organizationId || 'default-org';
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [asset, setAsset] = useState<Schema["Asset"]["type"] | null>(null);

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
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

  // Annotation system state
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const annotationCanvasRef = useRef<VideoAnnotationCanvasRef>(null);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedAnnotationTool, setSelectedAnnotationTool] = useState<AnnotationTool>("freehand");
  const [annotationStyle, setAnnotationStyle] = useState<AnnotationStyle>({
    strokeColor: "#FF3B30",
    strokeWidth: 3,
    fillColor: null,
    opacity: 1,
    fontSize: 16,
  });
  const [pendingAnnotations, setPendingAnnotations] = useState<AnnotationShape[]>([]);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);

  // Version switcher state
  const [showVersionSwitcher, setShowVersionSwitcher] = useState(false);
  const [currentVersionS3Key, setCurrentVersionS3Key] = useState<string | null>(null);

  // Caption state (for video overlay)
  const [captions, setCaptions] = useState<CaptionCue[]>([]);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  // Presentation mode state
  const [showPresentationMode, setShowPresentationMode] = useState(false);

  // View analytics state
  const [showViewAnalytics, setShowViewAnalytics] = useState(false);

  // Consolidated panel states (replacing multiple separate states)
  const [showMediaIntelligence, setShowMediaIntelligence] = useState(false);
  const [showDeliveryCenter, setShowDeliveryCenter] = useState(false);

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
      client.models.Review.list({
        filter: { assetId: { eq: assetId } }
      }).then((data) => {
        if (data.data) setReviews([...data.data]);
      }).catch(console.error);

      // Load all comments for this asset
      client.models.ReviewComment.list({
        filter: { assetId: { eq: assetId } }
      }).then((data) => {
        if (data.data) {
          setComments([...data.data].sort((a, b) =>
            (a.timecode || 0) - (b.timecode || 0)
          ));
        }
      }).catch(console.error);
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

  // Annotation handlers
  const handleToggleAnnotationMode = useCallback(() => {
    if (!annotationMode) {
      // Entering annotation mode - pause video
      videoPlayerRef.current?.pause();
    }
    setAnnotationMode(!annotationMode);
  }, [annotationMode]);

  const handleAnnotationComplete = useCallback((shape: AnnotationShape) => {
    setPendingAnnotations(prev => [...prev, shape]);
  }, []);

  const handleAnnotationUndo = useCallback(() => {
    annotationCanvasRef.current?.undo();
  }, []);

  const handleAnnotationClear = useCallback(() => {
    annotationCanvasRef.current?.clear();
    setPendingAnnotations([]);
  }, []);

  const handleSaveAnnotations = useCallback(async () => {
    if (!client || !currentReviewId || pendingAnnotations.length === 0) {
      toast.warning("No Annotations", "Draw some annotations before saving.");
      return;
    }

    try {
      // Create a comment with the annotations
      const annotationTimecode = pendingAnnotations[0]?.timecode || currentVideoTime;
      const newComment = await client.models.ReviewComment.create({
        organizationId: orgId,
        reviewId: currentReviewId,
        assetId,
        projectId,
        commenterId: userId,
        commenterEmail: userEmail,
        commenterRole: selectedRole,
        timecode: annotationTimecode,
        timecodeFormatted: formatTimecode(annotationTimecode),
        commentText: `[Visual Annotation] ${pendingAnnotations.length} drawing(s) at ${formatTimecode(annotationTimecode)}`,
        commentType: 'NOTE',
        priority: 'MEDIUM',
        isResolved: false,
      });

      if (newComment.data) {
        // Save each annotation linked to the comment
        // Try to use ReviewAnnotation model if available, otherwise store in comment metadata
        const annotationData = pendingAnnotations.map(annotation => ({
          timecode: annotation.timecode,
          type: annotation.type.toUpperCase(),
          pathData: annotation.points,
          strokeColor: annotation.style.strokeColor,
          strokeWidth: annotation.style.strokeWidth,
          fillColor: annotation.style.fillColor,
          opacity: annotation.style.opacity,
          textContent: annotation.textContent,
          fontSize: annotation.style.fontSize,
          canvasWidth: videoWidth,
          canvasHeight: videoHeight,
        }));

        // Try to save to ReviewAnnotation model if it exists
        if (client.models.ReviewAnnotation) {
          try {
            for (const annotation of pendingAnnotations) {
              await client.models.ReviewAnnotation.create({
                organizationId: orgId,
                reviewCommentId: newComment.data.id,
                assetId,
                timecode: annotation.timecode,
                annotationType: annotation.type.toUpperCase() as any,
                pathData: JSON.stringify(annotation.points),
                strokeColor: annotation.style.strokeColor,
                strokeWidth: annotation.style.strokeWidth,
                fillColor: annotation.style.fillColor,
                opacity: annotation.style.opacity,
                textContent: annotation.textContent,
                fontSize: annotation.style.fontSize,
                canvasWidth: videoWidth,
                canvasHeight: videoHeight,
                createdBy: userId,
                createdByEmail: userEmail,
              });
            }
          } catch (annotationError) {
            // Fallback: store annotation data in attachmentKeys (JSON stringified)
            console.log('ReviewAnnotation model not available, storing in attachmentKeys');
            await client.models.ReviewComment.update({
              id: newComment.data.id,
              attachmentKeys: [JSON.stringify({ annotations: annotationData })],
            });
          }
        } else {
          // Fallback: store annotation data in attachmentKeys (JSON stringified)
          await client.models.ReviewComment.update({
            id: newComment.data.id,
            attachmentKeys: [JSON.stringify({ annotations: annotationData })],
          });
        }

        await client.models.ActivityLog.create({
          organizationId: orgId,
          projectId,
          userId,
          userEmail,
          userRole: selectedRole,
          action: 'COMMENT_ADDED',
          targetType: 'Comment',
          targetId: newComment.data.id,
          targetName: `${pendingAnnotations.length} annotation(s)`,
          metadata: JSON.stringify({ assetId, timecode: annotationTimecode, annotationCount: pendingAnnotations.length, type: 'annotation' }),
        });

        // Clear and exit annotation mode
        handleAnnotationClear();
        setAnnotationMode(false);
        toast.success("Annotations Saved", `${pendingAnnotations.length} annotation(s) saved successfully.`);

        // Refresh comments
        const { data: refreshedComments } = await client.models.ReviewComment.list({
          filter: { assetId: { eq: assetId } }
        });
        if (refreshedComments) {
          setComments([...refreshedComments].sort((a, b) => (a.timecode || 0) - (b.timecode || 0)));
        }
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
      toast.error("Save Failed", "Failed to save annotations. Please try again.");
    }
  }, [client, currentReviewId, pendingAnnotations, currentVideoTime, orgId, assetId, projectId, userId, userEmail, selectedRole, videoWidth, videoHeight, formatTimecode, handleAnnotationClear, toast]);

  // Update video dimensions when video loads
  const handleVideoMetadataLoad = useCallback(() => {
    const video = videoPlayerRef.current?.getVideoElement();
    if (video) {
      setVideoWidth(video.videoWidth || video.clientWidth);
      setVideoHeight(video.videoHeight || video.clientHeight);
    }
  }, []);

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

      toast.success("Legal Approval Complete", "Asset legally approved and locked. This asset is now immutable.");
      setShowLegalApproval(false);
      setCurrentReviewId(null);
    } catch (error) {
      console.error('Error approving legal review:', error);
      toast.error("Approval Failed", "Failed to approve asset. Please try again.");
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
              {/* Version Switcher */}
              <div className="mt-3">
                <VersionSwitcher
                  assetId={assetId}
                  organizationId={orgId}
                  compact={true}
                  onVersionChange={async (version) => {
                    // Load the video URL for the selected version
                    try {
                      const { url } = await getUrl({
                        path: version.s3Key,
                        options: { expiresIn: 3600 },
                      });
                      setVideoUrl(url.toString());
                      setCurrentVersionS3Key(version.s3Key);
                    } catch (err) {
                      console.error("Error loading version:", err);
                    }
                  }}
                />
              </div>
              {/* Presentation Mode Button */}
              {videoUrl && (
                <div className="mt-3">
                  <PresentationModeButton
                    onClick={() => setShowPresentationMode(true)}
                    disabled={!videoUrl}
                  />
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-[6px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-2)] transition-all focus-ring"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Video Player with Annotation Support */}
          {videoUrl && (
            <div className="space-y-3">
              {/* Annotation Toolbar - shows when in annotation mode or when review is active */}
              {currentReviewId && (
                <div className="space-y-2">
                  {/* Toggle Annotation Mode Button */}
                  <button
                    onClick={handleToggleAnnotationMode}
                    className={`w-full py-2 px-4 rounded-[8px] font-semibold text-[13px] flex items-center justify-center gap-2 transition-all ${
                      annotationMode
                        ? 'bg-red-500 text-white'
                        : 'bg-[var(--bg-1)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                    }`}
                  >
                    {annotationMode ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                        Exit Annotation Mode
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                        Draw on Frame
                      </>
                    )}
                  </button>

                  {/* Annotation Toolbar - only shows in annotation mode */}
                  {annotationMode && (
                    <AnnotationToolbar
                      selectedTool={selectedAnnotationTool}
                      onToolChange={setSelectedAnnotationTool}
                      style={annotationStyle}
                      onStyleChange={setAnnotationStyle}
                      onUndo={handleAnnotationUndo}
                      onClear={handleAnnotationClear}
                      onSave={handleSaveAnnotations}
                      isDrawing={annotationMode}
                      canUndo={pendingAnnotations.length > 0}
                      canSave={pendingAnnotations.length > 0}
                    />
                  )}
                </div>
              )}

              <div
                className="rounded-[12px] overflow-hidden relative"
                style={{ background: 'var(--bg-0)', border: annotationMode ? '2px solid var(--primary)' : '1px solid var(--border)' }}
              >
                <VideoPlayer
                  ref={videoPlayerRef}
                  src={videoUrl}
                  onTimeUpdate={(time) => setCurrentVideoTime(time)}
                  onDurationChange={(dur) => {
                    setVideoDuration(dur);
                    handleVideoMetadataLoad();
                  }}
                  onPlayingChange={setIsVideoPlaying}
                  seekTo={seekToTime}
                  annotationMode={annotationMode}
                  annotationOverlay={
                    annotationMode && videoWidth > 0 && videoHeight > 0 ? (
                      <VideoAnnotationCanvas
                        ref={annotationCanvasRef}
                        width={videoWidth}
                        height={videoHeight}
                        currentTime={currentVideoTime}
                        isPlaying={isVideoPlaying}
                        selectedTool={selectedAnnotationTool}
                        style={annotationStyle}
                        existingAnnotations={pendingAnnotations}
                        onAnnotationComplete={handleAnnotationComplete}
                        onAnnotationsChange={setPendingAnnotations}
                      />
                    ) : undefined
                  }
                  captions={captions}
                  captionsEnabled={captionsEnabled}
                />

                {/* Annotation Mode Indicator */}
                {annotationMode && (
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-red-500/90 text-white text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ANNOTATION MODE
                  </div>
                )}
              </div>
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
                    className="input-professional select-professional text-[14px]"
                  >
                    <option value="INTERNAL">Internal Review</option>
                    <option value="CLIENT">Client Review</option>
                    <option value="LEGAL">Legal Review</option>
                    <option value="COMPLIANCE">Compliance Review</option>
                  </select>
                </div>
                <button
                  onClick={startReview}
                  className="py-3 px-6 text-[14px] action-primary focus-ring"
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
                      className="py-2 px-4 text-[13px] flex items-center gap-2 action-success focus-ring"
                    >
                      <ShieldCheckIcon />
                      Legal Approve & Lock
                    </button>
                  )}
                  <button
                    onClick={completeReview}
                    className="py-2 px-4 text-[13px] action-primary focus-ring"
                  >
                    Complete Review
                  </button>
                </div>
              </div>

              {/* Add Comment Button */}
              {!showCommentForm && (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="w-full py-4 text-[14px] flex items-center justify-center gap-2 action-dashed focus-ring"
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
                          className="input-professional flex-1 text-[13px] font-mono"
                        />
                        {(videoUrl || audioUrl) && (
                          <button
                            type="button"
                            onClick={() => setTimecode(Math.round((videoUrl ? currentVideoTime : currentAudioTime) * frameRate) / frameRate)}
                            className="px-3 py-1 text-[11px] font-bold action-primary focus-ring"
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
                        className="input-professional select-professional text-[13px]"
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
                        className="input-professional select-professional text-[13px]"
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
                      className="input-professional text-[13px] h-24 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addComment}
                      disabled={!commentText.trim()}
                      className="flex-1 py-2 px-4 text-[13px] action-primary focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Comment
                    </button>
                    <button
                      onClick={() => {
                        setShowCommentForm(false);
                        setCommentText("");
                        setTimecode(0);
                      }}
                      className="flex-1 py-2 px-4 text-[13px] action-ghost focus-ring border border-[var(--border-default)]"
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
              <div className="empty-state py-8">
                <p className="empty-state-title">No comments yet</p>
                <p className="empty-state-description">Start a review to add time-coded feedback</p>
              </div>
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
                            className="text-[11px] font-bold px-3 py-1 action-success focus-ring"
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

          {/* Media Intelligence Section (Transcripts + Captions - CONSOLIDATED) */}
          {(videoUrl || audioUrl) && (
            <div
              className="rounded-[12px] overflow-hidden"
              style={{ background: 'var(--bg-0)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setShowMediaIntelligence(!showMediaIntelligence)}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-1)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>
                    Media Intelligence
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                    Transcripts & Captions
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {captions.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCaptionsEnabled(!captionsEnabled);
                      }}
                      className="text-xs px-3 py-1 rounded-lg transition-all"
                      style={{
                        background: captionsEnabled ? 'var(--primary)' : 'var(--bg-2)',
                        color: captionsEnabled ? 'white' : 'var(--text-secondary)',
                      }}
                    >
                      CC {captionsEnabled ? 'On' : 'Off'}
                    </button>
                  )}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{
                      transform: showMediaIntelligence ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </button>
              {showMediaIntelligence && (
                <div className="border-t border-[var(--border)]">
                  <MediaIntelligence
                    assetId={assetId}
                    organizationId={orgId}
                    currentTime={videoUrl ? currentVideoTime : currentAudioTime}
                    onTimecodeClick={(time) => {
                      if (videoUrl && videoPlayerRef.current) {
                        videoPlayerRef.current.pause();
                        setSeekToTime(time);
                      }
                    }}
                    isEditable={!hasLegalApproval}
                  />
                </div>
              )}
            </div>
          )}

          {/* Delivery Center Section (for video assets) - Consolidated Encoding + Export */}
          {videoUrl && (
            <div
              className="rounded-[12px] overflow-hidden"
              style={{ background: 'var(--bg-0)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setShowDeliveryCenter(!showDeliveryCenter)}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-1)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m10 9 5 3-5 3V9z" />
                  </svg>
                  <span className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>
                    Delivery Center
                  </span>
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--primary)', color: 'white', opacity: 0.9 }}
                  >
                    Quality & Export
                  </span>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{
                    transform: showDeliveryCenter ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {showDeliveryCenter && (
                <div className="border-t border-[var(--border)]">
                  <DeliveryCenter
                    assetId={assetId}
                    organizationId={orgId}
                    assetDuration={videoDuration}
                    onExport={async (preset) => {
                      toast.success("Export Started", `Exporting for ${preset.name}...`);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* View Analytics Section (for video assets) */}
          {videoUrl && (
            <div
              className="rounded-[12px] overflow-hidden"
              style={{ background: 'var(--bg-0)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setShowViewAnalytics(!showViewAnalytics)}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-1)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>
                    View Analytics
                  </span>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{
                    transform: showViewAnalytics ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {showViewAnalytics && (
                <div className="border-t border-[var(--border)]">
                  <ViewAnalytics
                    assetId={assetId}
                    organizationId={orgId}
                    videoDuration={videoDuration}
                  />
                </div>
              )}
            </div>
          )}

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

        {/* Presentation Mode */}
        {showPresentationMode && asset?.s3Key && (
          <PresentationMode
            assetName={asset.s3Key.split('/').pop() || 'Video'}
            assetS3Key={currentVersionS3Key || asset.s3Key}
            projectName={projectId}
            organizationName="Sync Ops"
            brandColor="var(--primary)"
            onExit={() => setShowPresentationMode(false)}
            onComment={(comment, time) => {
              // If review is active, add comment at the timecode
              if (currentReviewId) {
                setTimecode(time);
                setCommentText(comment);
                setShowCommentForm(true);
              }
            }}
            allowComments={!!currentReviewId}
          />
        )}

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
                  className="flex-1 py-3 px-6 rounded-[6px] font-semibold text-[14px] bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-3)] transition-all active:scale-[0.98] focus-ring"
                >
                  Cancel
                </button>
                <button
                  onClick={approveLegalReview}
                  className="flex-1 py-3 px-6 text-[14px] flex items-center justify-center gap-2 action-success focus-ring"
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
