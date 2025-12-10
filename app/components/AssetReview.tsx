"use client";

import { useState, useEffect, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import FeedbackSummary from "./FeedbackSummary";
import ReviewHeatmap from "./ReviewHeatmap";
import VideoPlayer from "./VideoPlayer";
import AudioWaveform from "./AudioWaveform";

interface AssetReviewProps {
  assetId: string;
  projectId: string;
  userEmail: string;
  userId: string;
  onClose: () => void;
}

export default function AssetReview({
  assetId,
  projectId,
  userEmail,
  userId,
  onClose
}: AssetReviewProps) {
  const [client] = useState(() => generateClient<Schema>());
  const [asset, setAsset] = useState<Schema["Asset"]["type"] | null>(null);
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

  // Audio player state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentAudioTime, setCurrentAudioTime] = useState<number>(0);

  // Load asset and reviews
  useEffect(() => {
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
          options: { expiresIn: 3600 } // 1 hour expiration
        }).then(({ url }) => {
          setVideoUrl(url.toString());
        }).catch(err => {
          console.error('Error loading video URL:', err);
        });
      } else if (isAudioFile(asset.s3Key)) {
        getUrl({
          path: asset.s3Key,
          options: { expiresIn: 3600 } // 1 hour expiration
        }).then(({ url }) => {
          setAudioUrl(url.toString());
        }).catch(err => {
          console.error('Error loading audio URL:', err);
        });
      }
    }
  }, [asset]);

  // Check if asset is a video file
  function isVideoFile(filename: string): boolean {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv'];
    const lowerFilename = filename.toLowerCase();
    return videoExtensions.some(ext => lowerFilename.endsWith(ext));
  }

  // Check if asset is an audio file
  function isAudioFile(filename: string): boolean {
    const audioExtensions = ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a', '.wma', '.aiff'];
    const lowerFilename = filename.toLowerCase();
    return audioExtensions.some(ext => lowerFilename.endsWith(ext));
  }

  // Handle seek from comment or heatmap click
  function handleSeekToTimecode(timecode: number) {
    setSeekToTime(timecode);
    // Also update the timecode input for comment form
    setTimecode(timecode);
    // Clear seekToTime after a short delay to allow re-seeking to same position
    setTimeout(() => setSeekToTime(undefined), 100);
  }

  // Create a new review
  async function startReview() {
    try {
      const newReview = await client.models.Review.create({
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

        // Log activity
        await client.models.ActivityLog.create({
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

  // Add a comment
  async function addComment() {
    if (!currentReviewId || !commentText.trim()) return;

    try {
      const newComment = await client.models.ReviewComment.create({
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
        // Log activity
        await client.models.ActivityLog.create({
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

        // Reset form
        setCommentText("");
        setTimecode(0);
        setShowCommentForm(false);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  // Resolve a comment
  async function resolveComment(commentId: string) {
    try {
      await client.models.ReviewComment.update({
        id: commentId,
        isResolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedBy: userId,
      });

      // Log activity
      await client.models.ActivityLog.create({
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

  // Complete review
  async function completeReview() {
    if (!currentReviewId) return;

    try {
      await client.models.Review.update({
        id: currentReviewId,
        status: 'COMPLETED',
      });

      // Log activity
      await client.models.ActivityLog.create({
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

  // Legal Approval (PRD FR-27: Immutable Legal Approval Lock)
  async function approveLegalReview() {
    if (!currentReviewId) return;

    const confirmApproval = confirm(
      "⚠️ LEGAL APPROVAL LOCK\n\n" +
      "Once you approve this asset, it becomes IMMUTABLE and cannot be modified.\n" +
      "This action cannot be undone.\n\n" +
      "Are you absolutely certain you want to approve this asset for legal compliance?"
    );

    if (!confirmApproval) return;

    try {
      // Update review with legal approval
      await client.models.Review.update({
        id: currentReviewId,
        status: 'APPROVED',
        isLegalApproved: true,
        legalApprovedAt: new Date().toISOString(),
        legalApprovedBy: userId,
      });

      // Log activity
      await client.models.ActivityLog.create({
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

      alert("✅ Asset legally approved and locked. This asset is now immutable.");
      setShowLegalApproval(false);
      setCurrentReviewId(null);
    } catch (error) {
      console.error('Error approving legal review:', error);
      alert("Error: Failed to approve asset. Please try again.");
    }
  }

  // Utility: Format timecode
  function formatTimecode(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  }

  // Check if current user has legal role
  const isLegalReviewer = selectedRole === 'LEGAL';
  const hasLegalApproval = reviews.some(r => r.isLegalApproved);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-teal-400">Asset Review & Approval</h2>
              <p className="text-slate-400 mt-1">{asset?.s3Key?.split('/').pop()}</p>
              {hasLegalApproval && (
                <div className="mt-3 bg-green-900/30 border border-green-500 rounded-lg px-4 py-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-400 font-bold">LEGALLY APPROVED & LOCKED (IMMUTABLE)</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" id="review-content">
          {/* Video Player - Show for video assets */}
          {videoUrl && (
            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <VideoPlayer
                src={videoUrl}
                onTimeUpdate={(time) => setCurrentVideoTime(time)}
                onDurationChange={(dur) => setVideoDuration(dur)}
                seekTo={seekToTime}
              />
            </div>
          )}

          {/* Audio Waveform - Show for audio assets */}
          {audioUrl && (
            <AudioWaveform
              src={audioUrl}
              onTimeUpdate={(time) => setCurrentAudioTime(time)}
              onDurationChange={(dur) => setAudioDuration(dur)}
              seekTo={seekToTime}
            />
          )}

          {/* AI Feedback Summary - Show when there are comments */}
          {comments.length > 0 && (
            <FeedbackSummary comments={comments} assetId={assetId} />
          )}

          {/* Review Heatmap - Visual timeline of comment density */}
          {comments.length > 0 && (
            <ReviewHeatmap
              comments={comments}
              duration={videoDuration > 0 ? videoDuration : audioDuration > 0 ? audioDuration : undefined}
              currentTime={videoUrl ? currentVideoTime : audioUrl ? currentAudioTime : undefined}
              onTimecodeClick={(timecode) => {
                // Seek video/audio to this timecode
                handleSeekToTimecode(timecode);
                // Find the comment at or near this timecode
                const targetComment = comments.find(c => Math.abs((c.timecode || 0) - timecode) < 5);
                if (targetComment) {
                  const commentElement = document.getElementById(`comment-${targetComment.id}`);
                  if (commentElement) {
                    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight the comment briefly
                    commentElement.classList.add('ring-4', 'ring-teal-500');
                    setTimeout(() => {
                      commentElement.classList.remove('ring-4', 'ring-teal-500');
                    }, 2000);
                  }
                }
              }}
            />
          )}

          {/* Start Review Section */}
          {!currentReviewId && !hasLegalApproval && (
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Start New Review</h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-2">REVIEWER ROLE</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
                  >
                    <option value="INTERNAL">Internal Review</option>
                    <option value="CLIENT">Client Review</option>
                    <option value="LEGAL">Legal Review</option>
                    <option value="COMPLIANCE">Compliance Review</option>
                  </select>
                </div>
                <button
                  onClick={startReview}
                  className="bg-teal-500 hover:bg-teal-600 text-black font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Start Review
                </button>
              </div>
            </div>
          )}

          {/* Active Review */}
          {currentReviewId && (
            <div className="bg-slate-900 rounded-xl border-2 border-teal-500 p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-teal-400">Active Review: {selectedRole}</h3>
                  <p className="text-slate-400 text-sm">Reviewer: {userEmail}</p>
                </div>
                <div className="flex gap-2">
                  {isLegalReviewer && !hasLegalApproval && (
                    <button
                      onClick={() => setShowLegalApproval(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Legal Approve & Lock
                    </button>
                  )}
                  <button
                    onClick={completeReview}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    Complete Review
                  </button>
                </div>
              </div>

              {/* Add Comment Button */}
              {!showCommentForm && (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-teal-500 text-slate-400 hover:text-teal-400 font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Time-Coded Comment
                </button>
              )}

              {/* Comment Form */}
              {showCommentForm && (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">TIMECODE (seconds)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={timecode}
                          onChange={(e) => setTimecode(parseFloat(e.target.value))}
                          placeholder="0.0"
                          className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                        />
                        {(videoUrl || audioUrl) && (
                          <button
                            type="button"
                            onClick={() => setTimecode(Math.round((videoUrl ? currentVideoTime : currentAudioTime) * 10) / 10)}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-2 py-1 rounded transition-all whitespace-nowrap"
                            title="Use current playback time"
                          >
                            Use Now
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{formatTimecode(timecode)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">TYPE</label>
                      <select
                        value={commentType}
                        onChange={(e) => setCommentType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                      >
                        <option value="NOTE">Note</option>
                        <option value="ISSUE">Issue</option>
                        <option value="APPROVAL">Approval</option>
                        <option value="REJECTION">Rejection</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">PRIORITY</label>
                      <select
                        value={commentPriority}
                        onChange={(e) => setCommentPriority(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">COMMENT</label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Enter your feedback..."
                      className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-24 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addComment}
                      disabled={!commentText.trim()}
                      className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-2 px-4 rounded-lg transition-all"
                    >
                      Add Comment
                    </button>
                    <button
                      onClick={() => {
                        setShowCommentForm(false);
                        setCommentText("");
                        setTimecode(0);
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Timeline */}
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Comments Timeline ({comments.length})
            </h3>
            {comments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    id={`comment-${comment.id}`}
                    className={`bg-slate-800 rounded-lg border p-4 transition-all ${
                      comment.isResolved
                        ? 'border-slate-700 opacity-50'
                        : comment.priority === 'CRITICAL'
                          ? 'border-red-500'
                          : comment.priority === 'HIGH'
                            ? 'border-yellow-500'
                            : 'border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => videoUrl && comment.timecode && handleSeekToTimecode(comment.timecode)}
                          className={`bg-teal-500 text-black font-mono text-xs px-2 py-1 rounded ${
                            videoUrl ? 'hover:bg-teal-400 cursor-pointer' : ''
                          }`}
                          title={videoUrl ? 'Click to jump to this timecode' : comment.timecodeFormatted || ''}
                        >
                          {comment.timecodeFormatted}
                        </button>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          comment.commentType === 'ISSUE' ? 'bg-red-900 text-red-200' :
                          comment.commentType === 'APPROVAL' ? 'bg-green-900 text-green-200' :
                          comment.commentType === 'REJECTION' ? 'bg-red-900 text-red-200' :
                          'bg-blue-900 text-blue-200'
                        }`}>
                          {comment.commentType}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          comment.priority === 'CRITICAL' ? 'bg-red-900 text-red-200' :
                          comment.priority === 'HIGH' ? 'bg-yellow-900 text-yellow-200' :
                          comment.priority === 'MEDIUM' ? 'bg-blue-900 text-blue-200' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {comment.priority}
                        </span>
                        {comment.isResolved && (
                          <span className="bg-green-900 text-green-200 text-xs font-bold px-2 py-1 rounded">
                            ✓ RESOLVED
                          </span>
                        )}
                      </div>
                      {!comment.isResolved && currentReviewId && (
                        <button
                          onClick={() => resolveComment(comment.id)}
                          className="text-xs bg-green-700 hover:bg-green-600 text-white font-bold px-3 py-1 rounded transition-all"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                    <p className="text-white mb-2">{comment.commentText}</p>
                    <p className="text-xs text-slate-500">
                      {comment.commenterEmail} • {comment.commenterRole} • {
                        comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'N/A'
                      }
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review History */}
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Review History ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-2">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-white font-bold">{review.reviewerRole}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          review.status === 'APPROVED' ? 'bg-green-900 text-green-200' :
                          review.status === 'REJECTED' ? 'bg-red-900 text-red-200' :
                          review.status === 'COMPLETED' ? 'bg-blue-900 text-blue-200' :
                          'bg-yellow-900 text-yellow-200'
                        }`}>
                          {review.status}
                        </span>
                        {review.isLegalApproved && (
                          <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            LEGAL LOCK
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {review.reviewerEmail} • {review.createdAt ? new Date(review.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legal Approval Confirmation Modal */}
        {showLegalApproval && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl border-2 border-red-500 p-8 max-w-2xl">
              <div className="flex items-start gap-4 mb-6">
                <svg className="w-16 h-16 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Legal Approval Lock</h3>
                  <p className="text-white mb-4">
                    You are about to LEGALLY APPROVE this asset. This action:
                  </p>
                  <ul className="text-slate-300 space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      Makes the asset <strong>IMMUTABLE</strong> (cannot be modified)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      Locks all review comments permanently
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      Creates an <strong>audit trail</strong> record
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <strong>CANNOT BE UNDONE</strong>
                    </li>
                  </ul>
                  <p className="text-yellow-400 font-bold">
                    Are you absolutely certain this asset meets all legal and compliance requirements?
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLegalApproval(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={approveLegalReview}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
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
