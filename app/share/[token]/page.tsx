"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import ClientScreeningRoom from "@/app/components/ClientScreeningRoom";

/**
 * PUBLIC SHARE PAGE - /share/[token]
 * External review page accessible without authentication
 * Uses API key auth mode for public access
 */

// Types
interface ShareLinkData {
  id: string;
  token: string;
  organizationId: string;
  projectId?: string | null;
  assetId?: string | null;
  collectionId?: string | null;
  name?: string | null;
  description?: string | null;
  type: string;
  password?: string | null;
  expiresAt?: string | null;
  maxViews?: number | null;
  currentViews: number;
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
  status: string;
}

interface OrganizationData {
  id: string;
  name: string;
  logo?: string | null;
  brandPrimaryColor?: string | null;
  brandSecondaryColor?: string | null;
}

interface AssetData {
  id: string;
  name?: string | null;
  s3Key: string;
  mimeType?: string | null;
  thumbnailKey?: string | null;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<ShareLinkData | null>(null);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewerEmail, setViewerEmail] = useState("");
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Load share link data
  useEffect(() => {
    async function loadShareLink() {
      if (!token) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      try {
        // Use API key auth for public access
        const client = generateClient<Schema>({ authMode: "apiKey" });

        // Find share link by token
        const { data: shareLinks } = await client.models.ShareLink.list({
          filter: { token: { eq: token } },
        });

        if (!shareLinks || shareLinks.length === 0) {
          setError("This link does not exist or has been removed");
          setIsLoading(false);
          return;
        }

        const link = shareLinks[0] as unknown as ShareLinkData;

        // Check if link is active
        if (link.status !== "ACTIVE") {
          if (link.status === "EXPIRED") {
            setError("This link has expired");
          } else if (link.status === "REVOKED") {
            setError("This link has been revoked");
          } else {
            setError("This link is not available");
          }
          setIsLoading(false);
          return;
        }

        // Check expiration
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
          setError("This link has expired");
          setIsLoading(false);
          return;
        }

        // Check max views
        if (link.maxViews && link.currentViews >= link.maxViews) {
          setError("This link has reached its maximum view limit");
          setIsLoading(false);
          return;
        }

        setShareLink(link);

        // Check if password is required
        if (link.password) {
          setRequiresPassword(true);
          setIsLoading(false);
          return;
        }

        // No password required, proceed to load data
        await loadFullData(client, link);
      } catch (err) {
        console.error("Error loading share link:", err);
        setError("Failed to load this page. Please try again.");
        setIsLoading(false);
      }
    }

    loadShareLink();
  }, [token]);

  // Load organization and assets
  const loadFullData = useCallback(async (
    client: ReturnType<typeof generateClient<Schema>>,
    link: ShareLinkData
  ) => {
    try {
      // Load organization
      const { data: org } = await client.models.Organization.get({
        id: link.organizationId,
      });

      if (org) {
        setOrganization(org as unknown as OrganizationData);
      }

      // Load assets based on link scope
      const loadedAssets: AssetData[] = [];

      // Helper to get filename from s3Key
      const getFilename = (s3Key: string) => s3Key.split('/').pop() || 'Untitled';

      if (link.assetId) {
        // Single asset link
        const { data: asset } = await client.models.Asset.get({
          id: link.assetId,
        });
        if (asset) {
          loadedAssets.push({
            id: asset.id,
            name: getFilename(asset.s3Key),
            s3Key: asset.s3Key,
            mimeType: asset.mimeType || null,
            thumbnailKey: asset.thumbnailKey || null,
          });
        }
      } else if (link.projectId) {
        // Project link - load all project assets
        const { data: projectAssets } = await client.models.Asset.list({
          filter: { projectId: { eq: link.projectId } },
        });
        if (projectAssets) {
          projectAssets.forEach((asset) => {
            loadedAssets.push({
              id: asset.id,
              name: getFilename(asset.s3Key),
              s3Key: asset.s3Key,
              mimeType: asset.mimeType || null,
              thumbnailKey: asset.thumbnailKey || null,
            });
          });
        }
      }

      setAssets(loadedAssets);

      // Track view (silently fail if there are issues)
      try {
        // Increment view count on ShareLink
        // Note: This may need adjustment based on actual schema fields available
        console.log('Recording view for share link:', link.id);
      } catch (viewErr) {
        console.warn('Could not record view:', viewErr);
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading full data:", err);
      setError("Failed to load content. Please try again.");
      setIsLoading(false);
    }
  }, [sessionId, viewerEmail]);

  // Handle password verification
  const handlePasswordSubmit = async () => {
    if (!shareLink || !passwordInput) return;

    setIsVerifyingPassword(true);
    setPasswordError(false);

    try {
      // Simple password check (in production, use bcrypt comparison on server)
      // For now, we'll do a simple comparison
      // Note: In production, this should be handled by an API route
      if (passwordInput === shareLink.password) {
        const client = generateClient<Schema>({ authMode: "apiKey" });
        await loadFullData(client, shareLink);
      } else {
        setPasswordError(true);
      }
    } catch (err) {
      console.error("Error verifying password:", err);
      setPasswordError(true);
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (comment: string, timecode: number) => {
    if (!shareLink) return;

    try {
      const client = generateClient<Schema>({ authMode: "apiKey" });

      // Create a public comment (in production, this would go through an API)
      // For now, we'll log it
      console.log("Comment submitted:", { comment, timecode, viewerEmail, shareLinkId: shareLink.id });

      // You would typically create a ReviewComment or a separate PublicComment model
      // await client.models.PublicComment.create({
      //   shareLinkId: shareLink.id,
      //   assetId: shareLink.assetId,
      //   timecode,
      //   comment,
      //   viewerEmail,
      // });
    } catch (err) {
      console.error("Error submitting comment:", err);
      throw err;
    }
  };

  // Handle approval submission
  const handleApprovalSubmit = async (
    status: "APPROVED" | "REJECTED" | "NEEDS_CHANGES",
    note: string
  ) => {
    if (!shareLink) return;

    try {
      // Log the approval (in production, this would create a proper record)
      console.log("Approval submitted:", {
        status,
        note,
        viewerEmail,
        shareLinkId: shareLink.id,
        sessionId
      });

      // TODO: Create a proper ShareLinkApproval record or use an API route
      // For now, we'll just acknowledge the submission
    } catch (err) {
      console.error("Error submitting approval:", err);
      throw err;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Link Unavailable</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Password required state
  if (requiresPassword && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white text-center mb-2">
              Password Protected
            </h1>
            <p className="text-gray-400 text-center mb-6">
              Enter the password to view this content
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Your Email (optional)
                </label>
                <input
                  type="email"
                  value={viewerEmail}
                  onChange={(e) => setViewerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Enter password"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border focus:outline-none ${
                    passwordError
                      ? "border-red-500"
                      : "border-gray-700 focus:border-teal-500"
                  }`}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                />
                {passwordError && (
                  <p className="text-red-400 text-sm mt-2">
                    Incorrect password. Please try again.
                  </p>
                )}
              </div>

              <button
                onClick={handlePasswordSubmit}
                disabled={!passwordInput || isVerifyingPassword}
                className="w-full py-3 rounded-lg bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {isVerifyingPassword ? "Verifying..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main screening room view
  if (shareLink && organization && isAuthenticated) {
    return (
      <ClientScreeningRoom
        shareLink={{
          id: shareLink.id,
          token: shareLink.token,
          name: shareLink.name,
          description: shareLink.description,
          type: shareLink.type,
          allowDownload: shareLink.allowDownload,
          allowComments: shareLink.allowComments,
          allowAnnotations: shareLink.allowAnnotations,
          requireApproval: shareLink.requireApproval,
          brandingEnabled: shareLink.brandingEnabled,
          customLogo: shareLink.customLogo,
          customPrimaryColor: shareLink.customPrimaryColor,
          customBackgroundColor: shareLink.customBackgroundColor,
          welcomeMessage: shareLink.welcomeMessage,
          footerText: shareLink.footerText,
          watermarkEnabled: shareLink.watermarkEnabled,
          watermarkText: shareLink.watermarkText,
          watermarkPosition: shareLink.watermarkPosition,
          watermarkOpacity: shareLink.watermarkOpacity,
        }}
        organization={{
          name: organization.name,
          logo: organization.logo,
          brandPrimaryColor: organization.brandPrimaryColor,
          brandSecondaryColor: organization.brandSecondaryColor,
        }}
        assets={assets.map((a) => ({
          id: a.id,
          name: a.name || "Untitled",
          s3Key: a.s3Key,
          mimeType: a.mimeType,
          thumbnailKey: a.thumbnailKey,
        }))}
        onCommentSubmit={shareLink.allowComments ? handleCommentSubmit : undefined}
        onApprovalSubmit={shareLink.requireApproval ? handleApprovalSubmit : undefined}
        viewerEmail={viewerEmail}
      />
    );
  }

  // Fallback
  return null;
}
