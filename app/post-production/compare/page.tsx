'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '../../components/ui';

/**
 * VERSION COMPARISON PAGE
 *
 * Side-by-side comparison of different video versions.
 * Helps editors and clients see what changed between revisions.
 */

interface AssetVersion {
  id: string;
  versionNumber: number;
  label: string;
  createdAt: string;
  createdBy: string;
  duration: string;
  thumbnail?: string;
  changeDescription?: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
}

interface Asset {
  id: string;
  name: string;
  versions: AssetVersion[];
}

// Data will be fetched from API
const initialAssets: Asset[] = [];

type CompareMode = 'side-by-side' | 'wipe' | 'toggle';

export default function ComparePage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [leftVersion, setLeftVersion] = useState<AssetVersion | null>(null);
  const [rightVersion, setRightVersion] = useState<AssetVersion | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>('side-by-side');
  const [isPlaying, setIsPlaying] = useState(false);
  const [wipePosition, setWipePosition] = useState(50);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: 'var(--success-muted)', color: 'var(--success)' };
      case 'review':
        return { bg: 'var(--warning-muted)', color: 'var(--warning)' };
      case 'rejected':
        return { bg: 'var(--danger-muted)', color: 'var(--danger)' };
      default:
        return { bg: 'var(--bg-3)', color: 'var(--text-tertiary)' };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/post-production" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Compare Versions</h1>
                <p className="text-sm text-[var(--text-tertiary)]">Side-by-side version comparison</p>
              </div>
            </div>

            {/* Compare Mode Toggle */}
            <div className="flex items-center gap-2 bg-[var(--bg-2)] rounded-lg p-1">
              <button
                onClick={() => setCompareMode('side-by-side')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  compareMode === 'side-by-side'
                    ? 'bg-[var(--bg-1)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icons.Columns className="w-4 h-4 inline mr-1.5" />
                Side by Side
              </button>
              <button
                onClick={() => setCompareMode('wipe')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  compareMode === 'wipe'
                    ? 'bg-[var(--bg-1)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icons.ArrowLeftRight className="w-4 h-4 inline mr-1.5" />
                Wipe
              </button>
              <button
                onClick={() => setCompareMode('toggle')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  compareMode === 'toggle'
                    ? 'bg-[var(--bg-1)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icons.ToggleLeft className="w-4 h-4 inline mr-1.5" />
                A/B Toggle
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Asset Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Select Asset to Compare
          </label>
          <select
            value={selectedAsset?.id || ''}
            onChange={(e) => {
              const asset = initialAssets.find(a => a.id === e.target.value);
              setSelectedAsset(asset || null);
              if (asset && asset.versions.length >= 2) {
                setLeftVersion(asset.versions[0]);
                setRightVersion(asset.versions[asset.versions.length - 1]);
              }
            }}
            className="w-full max-w-md px-4 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          >
            {initialAssets.map(asset => (
              <option key={asset.id} value={asset.id}>{asset.name} ({asset.versions.length} versions)</option>
            ))}
          </select>
        </div>

        {selectedAsset ? (
          <>
            {/* Version Selectors */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Left Version */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Version A (Before)
                </label>
                <div className="space-y-2">
                  {selectedAsset.versions.map(version => (
                    <button
                      key={version.id}
                      onClick={() => setLeftVersion(version)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        leftVersion?.id === version.id
                          ? 'bg-[var(--primary)] bg-opacity-10 border-[var(--primary)]'
                          : 'bg-[var(--bg-1)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-sm font-bold text-[var(--text-primary)]">
                            v{version.versionNumber}
                          </span>
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{version.label}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{version.createdBy} · {version.createdAt}</p>
                          </div>
                        </div>
                        <span
                          className="text-[11px] px-2 py-0.5 rounded font-medium capitalize"
                          style={{ backgroundColor: getStatusStyle(version.status).bg, color: getStatusStyle(version.status).color }}
                        >
                          {version.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Version */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Version B (After)
                </label>
                <div className="space-y-2">
                  {selectedAsset.versions.map(version => (
                    <button
                      key={version.id}
                      onClick={() => setRightVersion(version)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        rightVersion?.id === version.id
                          ? 'bg-[var(--accent)] bg-opacity-10 border-[var(--accent)]'
                          : 'bg-[var(--bg-1)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-sm font-bold text-[var(--text-primary)]">
                            v{version.versionNumber}
                          </span>
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{version.label}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{version.createdBy} · {version.createdAt}</p>
                          </div>
                        </div>
                        <span
                          className="text-[11px] px-2 py-0.5 rounded font-medium capitalize"
                          style={{ backgroundColor: getStatusStyle(version.status).bg, color: getStatusStyle(version.status).color }}
                        >
                          {version.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comparison View */}
            {leftVersion && rightVersion && (
              <Card className="overflow-hidden">
                {/* Video Comparison Area */}
                <div className="relative aspect-video bg-black">
                  {compareMode === 'side-by-side' && (
                    <div className="absolute inset-0 flex">
                      {/* Left Video */}
                      <div className="w-1/2 relative border-r border-[var(--border-default)]">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Icons.Film className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-2" />
                            <p className="text-[var(--text-tertiary)]">v{leftVersion.versionNumber}: {leftVersion.label}</p>
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 px-3 py-1 bg-black bg-opacity-60 rounded text-white text-sm font-medium">
                          v{leftVersion.versionNumber} · {leftVersion.duration}
                        </div>
                      </div>
                      {/* Right Video */}
                      <div className="w-1/2 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Icons.Film className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-2" />
                            <p className="text-[var(--text-tertiary)]">v{rightVersion.versionNumber}: {rightVersion.label}</p>
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 px-3 py-1 bg-black bg-opacity-60 rounded text-white text-sm font-medium">
                          v{rightVersion.versionNumber} · {rightVersion.duration}
                        </div>
                      </div>
                    </div>
                  )}

                  {compareMode === 'wipe' && (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Icons.Film className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-2" />
                          <p className="text-[var(--text-tertiary)]">Drag slider to compare versions</p>
                        </div>
                      </div>
                      {/* Wipe Slider */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                        style={{ left: `${wipePosition}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Icons.ArrowLeftRight className="w-4 h-4 text-black" />
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={wipePosition}
                        onChange={(e) => setWipePosition(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-black bg-opacity-60 rounded text-white text-sm font-medium">
                        v{leftVersion.versionNumber}
                      </div>
                      <div className="absolute top-4 right-4 px-3 py-1 bg-black bg-opacity-60 rounded text-white text-sm font-medium">
                        v{rightVersion.versionNumber}
                      </div>
                    </div>
                  )}

                  {compareMode === 'toggle' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Icons.Film className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-2" />
                        <p className="text-[var(--text-tertiary)]">Press Space or T to toggle between versions</p>
                        <p className="text-sm text-[var(--text-tertiary)] mt-2">
                          Currently showing: v{leftVersion.versionNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Playback Controls */}
                <div className="px-6 py-4 bg-[var(--bg-1)] border-t border-[var(--border-default)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:bg-opacity-90 transition-colors"
                      >
                        {isPlaying ? (
                          <Icons.Pause className="w-5 h-5" />
                        ) : (
                          <Icons.Play className="w-5 h-5 ml-0.5" />
                        )}
                      </button>
                      <div className="text-sm text-[var(--text-secondary)]">
                        <span className="font-mono">00:00:00</span>
                        <span className="text-[var(--text-tertiary)] mx-2">/</span>
                        <span className="font-mono text-[var(--text-tertiary)]">{leftVersion.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                      <kbd className="px-2 py-1 bg-[var(--bg-2)] rounded text-xs">Space</kbd>
                      <span>Play/Pause</span>
                      <span className="mx-2">·</span>
                      <kbd className="px-2 py-1 bg-[var(--bg-2)] rounded text-xs">T</kbd>
                      <span>Toggle</span>
                      <span className="mx-2">·</span>
                      <kbd className="px-2 py-1 bg-[var(--bg-2)] rounded text-xs">←→</kbd>
                      <span>Seek</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-4 h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-[var(--primary)] rounded-full" />
                  </div>
                </div>
              </Card>
            )}

            {/* Version Change Summary */}
            {leftVersion && rightVersion && rightVersion.changeDescription && (
              <Card className="mt-6 p-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Changes in v{rightVersion.versionNumber}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {rightVersion.changeDescription}
                </p>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <Icons.GitBranch className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Assets to Compare</h2>
            <p className="text-[var(--text-tertiary)] mb-4">Upload assets with multiple versions to compare them here.</p>
            <Link href="/assets">
              <Button variant="primary">
                <Icons.Upload className="w-4 h-4 mr-2" />
                Go to Assets
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
