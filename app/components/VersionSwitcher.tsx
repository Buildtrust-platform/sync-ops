"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * VERSION SWITCHER - Switch between asset versions in review pages
 * Shows version history with change descriptions and allows quick switching
 */

interface AssetVersion {
  id: string;
  versionNumber: number;
  versionLabel?: string | null;
  s3Key: string;
  changeDescription?: string | null;
  isCurrentVersion: boolean;
  isReviewReady: boolean;
  createdBy: string;
  createdByEmail?: string | null;
  createdAt?: string | null;
}

interface VersionSwitcherProps {
  assetId: string;
  organizationId: string;
  currentVersionId?: string;
  onVersionChange: (version: AssetVersion) => void;
  compact?: boolean;
}

// Icons
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 8v4l3 3" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CompareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export default function VersionSwitcher({
  assetId,
  organizationId,
  currentVersionId,
  onVersionChange,
  compact = false,
}: VersionSwitcherProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [versions, setVersions] = useState<AssetVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<AssetVersion | null>(null);

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: "userPool" }));
  }, []);

  // Load versions for the asset
  useEffect(() => {
    if (!client || !assetId) return;
    const currentClient = client; // Capture for closure

    async function loadVersions() {
      setIsLoading(true);
      try {
        const { data } = await currentClient.models.AssetVersion.list({
          filter: {
            assetId: { eq: assetId },
            organizationId: { eq: organizationId },
          },
        });

        if (data) {
          const sortedVersions = [...data]
            .sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0))
            .map((v) => ({
              id: v.id,
              versionNumber: v.versionNumber,
              versionLabel: v.versionLabel,
              s3Key: v.s3Key,
              changeDescription: v.changeDescription,
              isCurrentVersion: v.isCurrentVersion || false,
              isReviewReady: v.isReviewReady || false,
              createdBy: v.createdBy,
              createdByEmail: v.createdByEmail,
              createdAt: v.createdAt,
            }));

          setVersions(sortedVersions);

          // Set initial selected version
          if (currentVersionId) {
            const current = sortedVersions.find((v) => v.id === currentVersionId);
            setSelectedVersion(current || sortedVersions[0] || null);
          } else {
            // Default to current version or latest
            const current = sortedVersions.find((v) => v.isCurrentVersion);
            setSelectedVersion(current || sortedVersions[0] || null);
          }
        }
      } catch (err) {
        console.error("Error loading versions:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadVersions();
  }, [client, assetId, organizationId, currentVersionId]);

  // Handle version selection
  const handleVersionSelect = (version: AssetVersion) => {
    setSelectedVersion(version);
    setIsOpen(false);
    onVersionChange(version);
  };

  // Format relative time
  const formatRelativeTime = (dateString?: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
        style={{ background: "var(--bg-1)", color: "var(--text-tertiary)" }}
      >
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Loading versions...
      </div>
    );
  }

  if (versions.length === 0) {
    return null; // No versions to show
  }

  // Compact mode - just a dropdown
  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <HistoryIcon />
          v{selectedVersion?.versionNumber || 1}
          {selectedVersion?.versionLabel && (
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              ({selectedVersion.versionLabel})
            </span>
          )}
          <ChevronDownIcon />
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-64 rounded-xl shadow-xl z-50 overflow-hidden"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="max-h-72 overflow-y-auto">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => handleVersionSelect(version)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[var(--bg-2)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                        v{version.versionNumber}
                      </span>
                      {version.versionLabel && (
                        <span className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
                          {version.versionLabel}
                        </span>
                      )}
                      {version.isCurrentVersion && (
                        <span
                          className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                          style={{ background: "var(--success-muted)", color: "var(--success)" }}
                        >
                          <StarIcon /> Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {formatRelativeTime(version.createdAt)}
                    </p>
                  </div>
                  {selectedVersion?.id === version.id && (
                    <span style={{ color: "var(--primary)" }}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full mode - tabs with version cards
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-0)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <HistoryIcon />
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Version History
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--bg-2)", color: "var(--text-tertiary)" }}
          >
            {versions.length} version{versions.length !== 1 ? "s" : ""}
          </span>
        </div>
        {versions.length > 1 && (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110"
            style={{ background: "var(--primary)", color: "white" }}
          >
            <CompareIcon />
            Compare
          </button>
        )}
      </div>

      {/* Version List */}
      <div className="max-h-80 overflow-y-auto">
        {versions.map((version, index) => (
          <button
            key={version.id}
            onClick={() => handleVersionSelect(version)}
            className={`w-full px-4 py-3 flex gap-4 text-left transition-all hover:bg-[var(--bg-1)] ${
              selectedVersion?.id === version.id ? "bg-[var(--primary-muted)]" : ""
            }`}
            style={{
              borderBottom: index < versions.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            {/* Version Badge */}
            <div className="flex-shrink-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                style={{
                  background:
                    selectedVersion?.id === version.id
                      ? "var(--primary)"
                      : version.isCurrentVersion
                      ? "var(--success-muted)"
                      : "var(--bg-2)",
                  color:
                    selectedVersion?.id === version.id
                      ? "white"
                      : version.isCurrentVersion
                      ? "var(--success)"
                      : "var(--text-secondary)",
                }}
              >
                v{version.versionNumber}
              </div>
            </div>

            {/* Version Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {version.versionLabel && (
                  <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                    {version.versionLabel}
                  </span>
                )}
                {version.isCurrentVersion && (
                  <span
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--success-muted)", color: "var(--success)" }}
                  >
                    <StarIcon /> Current Version
                  </span>
                )}
                {version.isReviewReady && !version.isCurrentVersion && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--warning-muted)", color: "var(--warning)" }}
                  >
                    Review Ready
                  </span>
                )}
              </div>

              {version.changeDescription && (
                <p className="text-sm mb-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                  {version.changeDescription}
                </p>
              )}

              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {version.createdByEmail || version.createdBy} • {formatRelativeTime(version.createdAt)}
              </p>
            </div>

            {/* Selected Indicator */}
            {selectedVersion?.id === version.id && (
              <div className="flex-shrink-0 self-center" style={{ color: "var(--primary)" }}>
                <CheckIcon />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Export helper component for inline version badge
export function VersionBadge({
  version,
  isCurrent = false,
  size = "default",
}: {
  version: number;
  isCurrent?: boolean;
  size?: "small" | "default";
}) {
  const sizeClasses = size === "small" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded ${sizeClasses}`}
      style={{
        background: isCurrent ? "var(--success-muted)" : "var(--bg-2)",
        color: isCurrent ? "var(--success)" : "var(--text-secondary)",
      }}
    >
      v{version}
      {isCurrent && size === "default" && <StarIcon />}
    </span>
  );
}
