"use client";

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

interface AssetVersion {
  id: string;
  versionNumber: number;
  versionLabel?: string | null;
  changeDescription?: string | null;
  isCurrentVersion?: boolean | null;
  isReviewReady?: boolean | null;
  createdBy: string;
  createdByEmail?: string | null;
  createdAt: string;
  fileSize?: number | null;
  previousVersionId?: string | null;
  s3Key?: string;
}

interface VersionTimelineProps {
  assetId: string;
  onVersionSelect?: (versionId: string) => void;
  onCompare?: (version1Id: string, version2Id: string) => void;
  compact?: boolean;
}

export default function VersionTimeline({ assetId, onVersionSelect, onCompare, compact = false }: VersionTimelineProps) {
  const [versions, setVersions] = useState<AssetVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<[string | null, string | null]>([null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = client.models.AssetVersion.observeQuery({
      filter: { assetId: { eq: assetId } }
    }).subscribe({
      next: ({ items }) => {
        const sortedVersions = [...items].sort((a, b) => b.versionNumber - a.versionNumber);
        setVersions(sortedVersions as AssetVersion[]);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error fetching versions:', error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [assetId]);

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function formatFileSize(bytes?: number | null): string {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  function handleVersionClick(versionId: string) {
    if (compareMode) {
      // In compare mode, select versions for comparison
      if (compareVersions[0] === versionId) {
        setCompareVersions([null, compareVersions[1]]);
      } else if (compareVersions[1] === versionId) {
        setCompareVersions([compareVersions[0], null]);
      } else if (!compareVersions[0]) {
        setCompareVersions([versionId, compareVersions[1]]);
      } else if (!compareVersions[1]) {
        setCompareVersions([compareVersions[0], versionId]);
      } else {
        // Replace the first selection
        setCompareVersions([versionId, compareVersions[1]]);
      }
    } else {
      setSelectedVersionId(versionId);
      if (onVersionSelect) {
        onVersionSelect(versionId);
      }
    }
  }

  function handleCompare() {
    if (compareVersions[0] && compareVersions[1] && onCompare) {
      onCompare(compareVersions[0], compareVersions[1]);
    }
  }

  function toggleCompareMode() {
    setCompareMode(!compareMode);
    setCompareVersions([null, null]);
  }

  // Get previous version for a given version
  function getPreviousVersion(version: AssetVersion): AssetVersion | undefined {
    if (version.previousVersionId) {
      return versions.find(v => v.id === version.previousVersionId);
    }
    // If no previousVersionId, find the version with the next lower version number
    return versions.find(v => v.versionNumber === version.versionNumber - 1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-slate-400 text-sm">No version history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Compare Mode Toggle */}
      {!compact && onCompare && versions.length >= 2 && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCompareMode}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${compareMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
            >
              {compareMode ? 'Exit Compare' : 'Compare Versions'}
            </button>
            {compareMode && (
              <span className="text-xs text-slate-400">
                Select two versions to compare
              </span>
            )}
          </div>
          {compareMode && compareVersions[0] && compareVersions[1] && (
            <button
              onClick={handleCompare}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-all"
            >
              Compare v{versions.find(v => v.id === compareVersions[0])?.versionNumber} vs v{versions.find(v => v.id === compareVersions[1])?.versionNumber}
            </button>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {versions.map((version, index) => {
          const isSelected = selectedVersionId === version.id;
          const isFirst = index === 0;
          const isCompareSelected = compareVersions.includes(version.id);
          const compareIndex = compareVersions.indexOf(version.id);
          const prevVersion = getPreviousVersion(version);

          return (
            <div
              key={version.id}
              onClick={() => handleVersionClick(version.id)}
              className={`
                relative pl-8 pb-3 cursor-pointer transition-all
                ${isSelected || isCompareSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
                ${!isFirst ? 'border-l-2 border-slate-700' : ''}
              `}
            >
              {/* Timeline Dot */}
              <div className={`
                absolute left-0 top-0 w-4 h-4 rounded-full border-2 -ml-2 transition-all
                ${isCompareSelected
                  ? compareIndex === 0
                    ? 'bg-purple-500 border-purple-400 shadow-lg shadow-purple-500/50 scale-125'
                    : 'bg-pink-500 border-pink-400 shadow-lg shadow-pink-500/50 scale-125'
                  : version.isCurrentVersion
                    ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50'
                    : version.isReviewReady
                      ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50'
                      : 'bg-slate-600 border-slate-500'
                }
                ${isSelected && !compareMode ? 'scale-125' : ''}
              `}>
                {/* Compare badge */}
                {isCompareSelected && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full text-[8px] font-bold text-purple-600 flex items-center justify-center">
                    {compareIndex + 1}
                  </span>
                )}
              </div>

              {/* Version Card */}
              <div className={`
                bg-slate-800 rounded-lg p-3 border transition-all
                ${isCompareSelected
                  ? 'border-purple-500 shadow-lg shadow-purple-500/10'
                  : isSelected
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }
              `}>
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-white">
                        v{version.versionNumber}
                      </h4>
                      {version.isCurrentVersion && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                          Current
                        </span>
                      )}
                      {version.isReviewReady && !version.isCurrentVersion && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                          Review Ready
                        </span>
                      )}
                      {prevVersion && !compact && (
                        <span className="text-xs text-slate-500">
                          from v{prevVersion.versionNumber}
                        </span>
                      )}
                    </div>
                    {version.versionLabel && (
                      <p className="text-sm text-slate-300 mt-0.5">{version.versionLabel}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {version.fileSize && (
                      <span className="text-xs text-slate-500 font-mono">
                        {formatFileSize(version.fileSize)}
                      </span>
                    )}
                    {/* Quick compare with previous */}
                    {prevVersion && onCompare && !compareMode && !compact && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompare(prevVersion.id, version.id);
                        }}
                        className="text-xs bg-slate-700 hover:bg-purple-600 text-slate-300 hover:text-white px-2 py-1 rounded transition-all"
                        title={`Compare with v${prevVersion.versionNumber}`}
                      >
                        Diff
                      </button>
                    )}
                  </div>
                </div>

                {/* Change Description */}
                {version.changeDescription && !compact && (
                  <p className="text-sm text-slate-400 mb-2 leading-relaxed">
                    {version.changeDescription}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {version.createdByEmail || version.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(version.createdAt)} {!compact && `at ${formatTime(version.createdAt)}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Timeline End Marker */}
        <div className="relative pl-8">
          <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-slate-700 -ml-1" />
          <p className="text-xs text-slate-600">Asset created</p>
        </div>
      </div>

      {/* Stats Footer */}
      {!compact && versions.length > 0 && (
        <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
          <span>{versions.length} version{versions.length !== 1 ? 's' : ''}</span>
          <span>{versions.filter(v => v.isReviewReady).length} review ready</span>
        </div>
      )}
    </div>
  );
}
