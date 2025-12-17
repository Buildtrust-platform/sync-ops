"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getUrl } from "aws-amplify/storage";
import BrandedHeader from "./BrandedHeader";
import VideoPlayer from "./VideoPlayer";

/**
 * CLIENT SCREENING ROOM - Frame.io-style External Review Page
 * Public-facing review interface with organization branding
 */

interface Asset {
  id: string;
  name: string;
  s3Key: string;
  mimeType?: string | null;
  thumbnailKey?: string | null;
}

interface ShareLink {
  id: string;
  token: string;
  name?: string | null;
  description?: string | null;
  type: string;
  allowDownload: boolean;
  allowComments: boolean;
  allowAnnotations: boolean;
  requireApproval: boolean;
  brandingEnabled: boolean;
  customLogo?: string | null;
  customPrimaryColor?: string | null;
  customBackgroundColor?: string | null;
  welcomeMessage?: string | null;
  footerText?: string | null;
  watermarkEnabled: boolean;
  watermarkText?: string | null;
  watermarkPosition?: string | null;
  watermarkOpacity?: number | null;
}

interface Organization {
  name: string;
  logo?: string | null;
  brandPrimaryColor?: string | null;
  brandSecondaryColor?: string | null;
}

interface ClientScreeningRoomProps {
  shareLink: ShareLink;
  organization: Organization;
  assets: Asset[];
  onCommentSubmit?: (comment: string, timecode: number) => Promise<void>;
  onApprovalSubmit?: (status: "APPROVED" | "REJECTED" | "NEEDS_CHANGES", note: string) => Promise<void>;
  viewerEmail?: string;
}

// Icons
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const MessageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function ClientScreeningRoom({
  shareLink,
  organization,
  assets,
  onCommentSubmit,
  onApprovalSubmit,
  viewerEmail,
}: ClientScreeningRoomProps) {
  // Get branding (share link overrides org defaults)
  const primaryColor = shareLink.customPrimaryColor || organization.brandPrimaryColor || "#14B8A6";
  const backgroundColor = shareLink.customBackgroundColor || "#0A0A0A";
  const logo = shareLink.customLogo || organization.logo;

  // State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(assets[0] || null);
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Comment state
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Approval state
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"APPROVED" | "REJECTED" | "NEEDS_CHANGES" | null>(null);
  const [approvalNote, setApprovalNote] = useState("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [hasApproved, setHasApproved] = useState(false);

  // Load asset URL
  useEffect(() => {
    async function loadAssetUrl() {
      if (!selectedAsset?.s3Key) {
        setAssetUrl(null);
        return;
      }
      try {
        const { url } = await getUrl({
          path: selectedAsset.s3Key,
          options: { expiresIn: 3600 },
        });
        setAssetUrl(url.toString());
      } catch (err) {
        console.error("Error loading asset URL:", err);
        setAssetUrl(null);
      }
    }
    loadAssetUrl();
  }, [selectedAsset]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle comment submit
  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !onCommentSubmit) return;

    setIsSubmittingComment(true);
    try {
      await onCommentSubmit(commentText, currentTime);
      setCommentText("");
      setShowCommentForm(false);
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle approval submit
  const handleApprovalSubmit = async () => {
    if (!approvalStatus || !onApprovalSubmit) return;

    setIsSubmittingApproval(true);
    try {
      await onApprovalSubmit(approvalStatus, approvalNote);
      setHasApproved(true);
      setShowApprovalForm(false);
    } catch (err) {
      console.error("Error submitting approval:", err);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Determine if asset is video
  const isVideo = selectedAsset?.mimeType?.startsWith("video/") ||
    selectedAsset?.s3Key?.match(/\.(mp4|mov|avi|mkv|webm|m4v|wmv)$/i);

  // Determine if asset is image
  const isImage = selectedAsset?.mimeType?.startsWith("image/") ||
    selectedAsset?.s3Key?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor }}
    >
      {/* Branded Header */}
      {shareLink.brandingEnabled && (
        <BrandedHeader
          organizationName={organization.name}
          logoKey={logo}
          primaryColor={primaryColor}
          backgroundColor={backgroundColor}
          welcomeMessage={shareLink.welcomeMessage}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Title Section */}
        {shareLink.name && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              {shareLink.name}
            </h1>
            {shareLink.description && (
              <p className="text-gray-400 mt-2">
                {shareLink.description}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video/Asset Player */}
          <div className="lg:col-span-3">
            <div
              className="rounded-xl overflow-hidden relative"
              style={{ border: `1px solid ${primaryColor}33` }}
            >
              {/* Watermark Overlay */}
              {shareLink.watermarkEnabled && shareLink.watermarkText && (
                <div
                  className="absolute z-20 pointer-events-none p-4 text-sm font-mono"
                  style={{
                    opacity: shareLink.watermarkOpacity || 0.5,
                    color: "#FFFFFF",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                    ...(shareLink.watermarkPosition === "TOP_LEFT" && { top: 0, left: 0 }),
                    ...(shareLink.watermarkPosition === "TOP_RIGHT" && { top: 0, right: 0 }),
                    ...(shareLink.watermarkPosition === "BOTTOM_LEFT" && { bottom: "60px", left: 0 }),
                    ...(shareLink.watermarkPosition === "BOTTOM_RIGHT" && { bottom: "60px", right: 0 }),
                    ...(shareLink.watermarkPosition === "CENTER" && {
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }),
                  }}
                >
                  {shareLink.watermarkText
                    .replace("{viewer_email}", viewerEmail || "viewer")
                    .replace("{date}", new Date().toLocaleDateString())}
                </div>
              )}

              {/* Asset Display */}
              {assetUrl ? (
                isVideo ? (
                  <VideoPlayer
                    src={assetUrl}
                    onTimeUpdate={setCurrentTime}
                    onDurationChange={setDuration}
                    onPlayingChange={setIsPlaying}
                  />
                ) : isImage ? (
                  <div className="aspect-video flex items-center justify-center bg-black">
                    <img
                      src={assetUrl}
                      alt={selectedAsset?.name || "Asset"}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <p className="text-gray-400 mb-4">Preview not available</p>
                      {shareLink.allowDownload && (
                        <a
                          href={assetUrl}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <DownloadIcon />
                          Download File
                        </a>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-900">
                  <div className="animate-pulse text-gray-500">Loading...</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              {/* Comment Button */}
              {shareLink.allowComments && (
                <button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  <MessageIcon />
                  Add Comment
                  {isVideo && <span className="text-gray-400 text-sm ml-1">@ {formatTime(currentTime)}</span>}
                </button>
              )}

              {/* Download Button */}
              {shareLink.allowDownload && assetUrl && (
                <a
                  href={assetUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  <DownloadIcon />
                  Download
                </a>
              )}

              {/* Approval Button */}
              {shareLink.requireApproval && !hasApproved && (
                <button
                  onClick={() => setShowApprovalForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white ml-auto transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  <CheckIcon />
                  Submit Review
                </button>
              )}

              {/* Approved Badge */}
              {hasApproved && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 ml-auto">
                  <CheckIcon />
                  Review Submitted
                </div>
              )}
            </div>

            {/* Comment Form */}
            {showCommentForm && (
              <div className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <MessageIcon />
                  {isVideo ? (
                    <span>Comment at <strong className="text-white">{formatTime(currentTime)}</strong></span>
                  ) : (
                    <span>Add a comment</span>
                  )}
                </div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your feedback..."
                  className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-teal-500 focus:outline-none resize-none"
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setShowCommentForm(false)}
                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="px-4 py-2 rounded-lg text-white disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isSubmittingComment ? "Submitting..." : "Submit Comment"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Asset List (if multiple assets) */}
          {assets.length > 1 && (
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Assets ({assets.length})
              </h3>
              <div className="space-y-2">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedAsset?.id === asset.id
                        ? "ring-2"
                        : "bg-gray-800/50 hover:bg-gray-800"
                    }`}
                    style={{
                      ...(selectedAsset?.id === asset.id && {
                        backgroundColor: `${primaryColor}20`,
                        ringColor: primaryColor,
                      }),
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbnail placeholder */}
                      <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <PlayIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {asset.name || "Untitled"}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {asset.mimeType || "Unknown type"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Approval Modal */}
      {showApprovalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-xl max-w-lg w-full p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Submit Your Review</h2>

            {/* Approval Options */}
            <div className="space-y-3 mb-4">
              <button
                onClick={() => setApprovalStatus("APPROVED")}
                className={`w-full p-4 rounded-lg flex items-center gap-3 transition-all ${
                  approvalStatus === "APPROVED"
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                } border`}
              >
                <CheckIcon />
                <div className="text-left">
                  <p className="font-semibold">Approved</p>
                  <p className="text-sm opacity-70">This looks good, proceed as planned</p>
                </div>
              </button>

              <button
                onClick={() => setApprovalStatus("NEEDS_CHANGES")}
                className={`w-full p-4 rounded-lg flex items-center gap-3 transition-all ${
                  approvalStatus === "NEEDS_CHANGES"
                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                } border`}
              >
                <AlertIcon />
                <div className="text-left">
                  <p className="font-semibold">Needs Changes</p>
                  <p className="text-sm opacity-70">Please make revisions based on my notes</p>
                </div>
              </button>

              <button
                onClick={() => setApprovalStatus("REJECTED")}
                className={`w-full p-4 rounded-lg flex items-center gap-3 transition-all ${
                  approvalStatus === "REJECTED"
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                } border`}
              >
                <XIcon />
                <div className="text-left">
                  <p className="font-semibold">Rejected</p>
                  <p className="text-sm opacity-70">This direction needs to be reconsidered</p>
                </div>
              </button>
            </div>

            {/* Notes */}
            <textarea
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="Add any additional notes (optional)..."
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-teal-500 focus:outline-none resize-none mb-4"
              rows={3}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApprovalForm(false)}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalSubmit}
                disabled={!approvalStatus || isSubmittingApproval}
                className="px-4 py-2 rounded-lg text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmittingApproval ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {shareLink.footerText && (
        <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-800">
          {shareLink.footerText}
        </footer>
      )}
    </div>
  );
}
