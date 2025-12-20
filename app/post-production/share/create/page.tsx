'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button, Progress } from '../../../components/ui';

/**
 * CREATE SHARE LINK
 *
 * Create branded client screening rooms and share links.
 * Supports password protection, expiration, and download controls.
 */

type ShareType = 'REVIEW' | 'DOWNLOAD' | 'PRESENTATION' | 'APPROVAL';

interface ShareSettings {
  name: string;
  type: ShareType;
  assetIds: string[];
  collectionId?: string;
  password: string;
  expiresAt: string;
  maxViews: number;
  allowDownload: boolean;
  allowComments: boolean;
  requireApproval: boolean;
  brandingEnabled: boolean;
  customMessage: string;
  notifyOnView: boolean;
  watermarkEnabled: boolean;
}

interface Asset {
  id: string;
  name: string;
  duration: string;
  resolution: string;
  thumbnail?: string;
  selected: boolean;
}

// Data will be fetched from API
const initialAssets: Asset[] = [];

const SHARE_TYPE_CONFIG: Record<ShareType, { label: string; description: string; icon: keyof typeof Icons; color: string }> = {
  REVIEW: { label: 'Review', description: 'Allow comments and feedback', icon: 'MessageSquare', color: 'var(--primary)' },
  DOWNLOAD: { label: 'Download', description: 'Direct download access', icon: 'Download', color: 'var(--success)' },
  PRESENTATION: { label: 'Presentation', description: 'Clean playback view', icon: 'Play', color: 'var(--warning)' },
  APPROVAL: { label: 'Approval', description: 'Require sign-off', icon: 'CheckCircle', color: 'var(--accent)' },
};

export default function CreateSharePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [settings, setSettings] = useState<ShareSettings>({
    name: '',
    type: 'REVIEW',
    assetIds: [],
    password: '',
    expiresAt: '',
    maxViews: 0,
    allowDownload: false,
    allowComments: true,
    requireApproval: false,
    brandingEnabled: true,
    customMessage: '',
    notifyOnView: true,
    watermarkEnabled: false,
  });
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const selectedAssets = assets.filter(a => a.selected);

  const toggleAsset = (assetId: string) => {
    setAssets(assets.map(a =>
      a.id === assetId ? { ...a, selected: !a.selected } : a
    ));
    setSettings({
      ...settings,
      assetIds: assets.filter(a => a.id === assetId ? !a.selected : a.selected).map(a => a.id),
    });
  };

  const selectAll = () => {
    const allSelected = assets.every(a => a.selected);
    setAssets(assets.map(a => ({ ...a, selected: !allSelected })));
  };

  const handleCreateLink = () => {
    // Simulate link creation
    const token = Math.random().toString(36).substring(2, 15);
    setCreatedLink(`https://app.syncops.io/share/${token}`);
    setCurrentStep(4);
  };

  const copyToClipboard = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
    }
  };

  const steps = [
    { number: 1, label: 'Select Assets' },
    { number: 2, label: 'Link Type' },
    { number: 3, label: 'Settings' },
    { number: 4, label: 'Share' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--success)]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1000px] mx-auto px-6 py-6 relative">
          <div className="flex items-center gap-4">
            <Link
              href="/post-production"
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
            </Link>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--success)', color: 'white' }}
            >
              <Icons.Link className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Create Share Link</h1>
              <p className="text-sm text-[var(--text-secondary)]">Share assets with clients and stakeholders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step.number
                      ? 'bg-[var(--success)] text-white'
                      : 'bg-[var(--bg-2)] text-[var(--text-tertiary)]'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Icons.Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-24 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-[var(--success)]' : 'bg-[var(--border-default)]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Assets */}
        {currentStep === 1 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Select Assets to Share</h2>
              <Button variant="secondary" size="sm" onClick={selectAll}>
                {assets.every(a => a.selected) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="space-y-2 mb-6">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => toggleAsset(asset.id)}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    asset.selected
                      ? 'border-[var(--success)] bg-[var(--success-muted)]'
                      : 'border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-1)]'
                  }`}
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    asset.selected
                      ? 'bg-[var(--success)] border-[var(--success)]'
                      : 'border-[var(--border-strong)]'
                  }`}>
                    {asset.selected && <Icons.Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="w-16 h-10 bg-[var(--bg-2)] rounded flex items-center justify-center">
                    <Icons.Film className="w-5 h-5 text-[var(--text-tertiary)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{asset.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{asset.duration} • {asset.resolution}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-tertiary)]">
                {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
              </p>
              <Button
                variant="primary"
                onClick={() => setCurrentStep(2)}
                disabled={selectedAssets.length === 0}
              >
                Continue
                <Icons.ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Link Type */}
        {currentStep === 2 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Choose Share Type</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {(Object.entries(SHARE_TYPE_CONFIG) as [ShareType, typeof SHARE_TYPE_CONFIG[ShareType]][]).map(([type, config]) => {
                const TypeIcon = Icons[config.icon];
                return (
                  <div
                    key={type}
                    onClick={() => setSettings({ ...settings, type })}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      settings.type === type
                        ? 'border-[var(--success)] bg-[var(--success-muted)]'
                        : 'border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-1)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${config.color}20`, color: config.color }}
                      >
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{config.label}</h3>
                        <p className="text-xs text-[var(--text-tertiary)]">{config.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
              <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button variant="primary" onClick={() => setCurrentStep(3)}>
                Continue
                <Icons.ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Settings */}
        {currentStep === 3 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Link Settings</h2>

            <div className="space-y-6">
              {/* Link Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Link Name (optional)
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="e.g., Q1 Campaign Review"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none"
                />
              </div>

              {/* Password Protection */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Password Protection (optional)
                </label>
                <div className="relative">
                  <Icons.Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="password"
                    value={settings.password}
                    onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                    placeholder="Set a password"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none"
                  />
                </div>
              </div>

              {/* Expiration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={settings.expiresAt}
                    onChange={(e) => setSettings({ ...settings, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Max Views (0 = unlimited)
                  </label>
                  <input
                    type="number"
                    value={settings.maxViews}
                    onChange={(e) => setSettings({ ...settings, maxViews: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                  />
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Custom Welcome Message (optional)
                </label>
                <textarea
                  value={settings.customMessage}
                  onChange={(e) => setSettings({ ...settings, customMessage: e.target.value })}
                  placeholder="Add a message for viewers..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {[
                  { key: 'allowDownload', label: 'Allow downloads', icon: 'Download' },
                  { key: 'allowComments', label: 'Allow comments', icon: 'MessageSquare' },
                  { key: 'requireApproval', label: 'Require approval sign-off', icon: 'CheckCircle' },
                  { key: 'brandingEnabled', label: 'Show organization branding', icon: 'Image' },
                  { key: 'notifyOnView', label: 'Notify me when viewed', icon: 'Bell' },
                  { key: 'watermarkEnabled', label: 'Apply viewer watermark', icon: 'Shield' },
                ].map((toggle) => {
                  const ToggleIcon = Icons[toggle.icon as keyof typeof Icons];
                  return (
                    <label key={toggle.key} className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setSettings({ ...settings, [toggle.key]: !settings[toggle.key as keyof ShareSettings] })}
                        className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${
                          settings[toggle.key as keyof ShareSettings]
                            ? 'bg-[var(--success)]'
                            : 'bg-[var(--bg-3)]'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            settings[toggle.key as keyof ShareSettings] ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                      <ToggleIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">{toggle.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-[var(--border-default)]">
              <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button variant="primary" onClick={handleCreateLink}>
                Create Link
                <Icons.Link className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Share */}
        {currentStep === 4 && createdLink && (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--success-muted)] flex items-center justify-center mx-auto mb-4">
              <Icons.CheckCircle className="w-8 h-8 text-[var(--success)]" />
            </div>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Link Created!</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Your share link is ready. Copy it below to share with your team.
            </p>

            {/* Link Display */}
            <div className="flex items-center gap-2 mb-6 p-4 bg-[var(--bg-1)] rounded-lg">
              <input
                type="text"
                value={createdLink}
                readOnly
                className="flex-1 bg-transparent text-[var(--text-primary)] font-mono text-sm outline-none"
              />
              <Button variant="primary" size="sm" onClick={copyToClipboard}>
                <Icons.Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-left">
              <div className="p-4 bg-[var(--bg-1)] rounded-lg">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Assets</p>
                <p className="font-medium text-[var(--text-primary)]">{selectedAssets.length} file(s)</p>
              </div>
              <div className="p-4 bg-[var(--bg-1)] rounded-lg">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Type</p>
                <p className="font-medium text-[var(--text-primary)]">{SHARE_TYPE_CONFIG[settings.type].label}</p>
              </div>
              <div className="p-4 bg-[var(--bg-1)] rounded-lg">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Password</p>
                <p className="font-medium text-[var(--text-primary)]">{settings.password ? 'Protected' : 'None'}</p>
              </div>
              <div className="p-4 bg-[var(--bg-1)] rounded-lg">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Expires</p>
                <p className="font-medium text-[var(--text-primary)]">{settings.expiresAt || 'Never'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="secondary" onClick={() => {
                setCurrentStep(1);
                setCreatedLink(null);
                setAssets(initialAssets);
              }}>
                Create Another
              </Button>
              <Link href="/post-production">
                <Button variant="primary">
                  Done
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
