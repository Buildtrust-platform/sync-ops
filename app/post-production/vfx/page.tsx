'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, StatusBadge, Progress, Button } from '../../components/ui';

/**
 * VFX HUB
 *
 * Visual effects tracking and management for post-production.
 * Features shot tracking, vendor management, and budget oversight.
 */

type VFXStatus = 'PENDING' | 'BIDDING' | 'IN_PROGRESS' | 'INTERNAL_REVIEW' | 'CLIENT_REVIEW' | 'APPROVED' | 'FINAL';
type VFXComplexity = 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'HERO';

interface VFXShot {
  id: string;
  shotCode: string;
  sequence: string;
  description: string;
  complexity: VFXComplexity;
  vendor?: string;
  status: VFXStatus;
  version: number;
  frameCount: number;
  estimatedHours: number;
  actualHours?: number;
  estimatedCost: number;
  actualCost?: number;
  dueDate?: string;
  notes?: string;
}

interface VFXVendor {
  id: string;
  name: string;
  specialty: string[];
  shotsAssigned: number;
  shotsCompleted: number;
  contactName: string;
  email: string;
  rating: number;
}

// Data will be fetched from API
const initialVFXShots: VFXShot[] = [];

// Data will be fetched from API
const initialVendors: VFXVendor[] = [];

const STATUS_CONFIG: Record<VFXStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pending', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  BIDDING: { label: 'Bidding', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
  INTERNAL_REVIEW: { label: 'Internal Review', color: 'var(--info)', bgColor: 'var(--info-muted)' },
  CLIENT_REVIEW: { label: 'Client Review', color: 'var(--accent)', bgColor: 'var(--accent-muted)' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  FINAL: { label: 'Final', color: 'var(--success)', bgColor: 'var(--success)' },
};

const COMPLEXITY_CONFIG: Record<VFXComplexity, { label: string; color: string; bgColor: string; multiplier: number }> = {
  SIMPLE: { label: 'Simple', color: 'var(--success)', bgColor: 'var(--success-muted)', multiplier: 1 },
  MODERATE: { label: 'Moderate', color: 'var(--info)', bgColor: 'var(--info-muted)', multiplier: 1.5 },
  COMPLEX: { label: 'Complex', color: 'var(--warning)', bgColor: 'var(--warning-muted)', multiplier: 2 },
  HERO: { label: 'Hero', color: 'var(--danger)', bgColor: 'var(--danger-muted)', multiplier: 3 },
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

export default function VFXHubPage() {
  const [vfxShots, setVFXShots] = useState<VFXShot[]>(initialVFXShots);
  const [vendors, setVendors] = useState<VFXVendor[]>(initialVendors);
  const [activeTab, setActiveTab] = useState<'shots' | 'vendors' | 'budget'>('shots');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('ALL');
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');

  // Calculate stats
  const stats = {
    totalShots: vfxShots.length,
    completedShots: vfxShots.filter(s => s.status === 'APPROVED' || s.status === 'FINAL').length,
    inProgressShots: vfxShots.filter(s => s.status === 'IN_PROGRESS').length,
    inReviewShots: vfxShots.filter(s => s.status === 'INTERNAL_REVIEW' || s.status === 'CLIENT_REVIEW').length,
    totalFrames: vfxShots.reduce((sum, s) => sum + s.frameCount, 0),
    estimatedBudget: vfxShots.reduce((sum, s) => sum + s.estimatedCost, 0),
    actualSpend: vfxShots.reduce((sum, s) => sum + (s.actualCost || 0), 0),
  };

  const overallProgress = Math.round((stats.completedShots / stats.totalShots) * 100);

  const tabs = [
    { id: 'shots', label: 'Shot Tracker', icon: 'Film', count: vfxShots.length },
    { id: 'vendors', label: 'Vendors', icon: 'Users', count: vendors.length },
    { id: 'budget', label: 'Budget', icon: 'DollarSign' },
  ] as const;

  const filteredShots = vfxShots.filter(shot => {
    if (selectedComplexity !== 'ALL' && shot.complexity !== selectedComplexity) return false;
    if (selectedVendor !== 'ALL' && shot.vendor !== selectedVendor) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--danger)]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/post-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--danger)', color: 'white' }}
              >
                <Icons.Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">VFX Hub</h1>
                <p className="text-sm text-[var(--text-secondary)]">Shot tracking, vendor management, and budget oversight</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Shot
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                <Icons.Film className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalShots}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Total Shots</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                <Icons.CheckCircle className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.completedShots}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--warning-muted)] flex items-center justify-center">
                <Icons.Loader className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.inProgressShots}</p>
                <p className="text-xs text-[var(--text-tertiary)]">In Progress</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--info-muted)] flex items-center justify-center">
                <Icons.Eye className="w-5 h-5 text-[var(--info)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.inReviewShots}</p>
                <p className="text-xs text-[var(--text-tertiary)]">In Review</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress & Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-5 card-cinema">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--text-tertiary)]">Shot Completion</h3>
              <span className="text-2xl font-bold text-[var(--primary)]">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} variant="default" size="md" />
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              {stats.totalFrames.toLocaleString()} total frames across all shots
            </p>
          </Card>

          <Card className="p-5 card-cinema">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--text-tertiary)]">Budget Overview</h3>
              <span className={`text-2xl font-bold ${stats.actualSpend > stats.estimatedBudget ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                {formatCurrency(stats.actualSpend)}
              </span>
            </div>
            <div className="relative h-3 bg-[var(--bg-3)] rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-[var(--success)] rounded-full"
                style={{ width: `${Math.min((stats.actualSpend / stats.estimatedBudget) * 100, 100)}%` }}
              />
              {stats.actualSpend > stats.estimatedBudget && (
                <div
                  className="absolute h-full bg-[var(--danger)]"
                  style={{
                    left: `${(stats.estimatedBudget / stats.actualSpend) * 100}%`,
                    width: `${((stats.actualSpend - stats.estimatedBudget) / stats.actualSpend) * 100}%`
                  }}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mt-2">
              <span>Spent: {formatCurrency(stats.actualSpend)}</span>
              <span>Budget: {formatCurrency(stats.estimatedBudget)}</span>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-[var(--bg-1)] rounded-lg w-fit border border-[var(--border-default)]">
          {tabs.map((tab) => {
            const TabIcon = Icons[tab.icon as keyof typeof Icons];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }
                `}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
                {'count' in tab && (
                  <span className={`
                    px-1.5 py-0.5 rounded text-[10px] font-medium
                    ${activeTab === tab.id ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'shots' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-tertiary)]">Complexity:</span>
                {(['ALL', 'SIMPLE', 'MODERATE', 'COMPLEX', 'HERO'] as const).map((complexity) => (
                  <button
                    key={complexity}
                    onClick={() => setSelectedComplexity(complexity)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedComplexity === complexity ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-0)]' : 'hover:opacity-80'
                    }`}
                    style={complexity === 'ALL'
                      ? { background: 'var(--bg-3)', color: 'var(--text-primary)' }
                      : { background: COMPLEXITY_CONFIG[complexity]?.bgColor, color: COMPLEXITY_CONFIG[complexity]?.color }
                    }
                  >
                    {complexity}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-tertiary)]">Vendor:</span>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-1)] border border-[var(--border-default)] text-[var(--text-primary)]"
                >
                  <option value="ALL">All Vendors</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shot List */}
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Shot</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Description</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Complexity</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Vendor</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Version</th>
                    <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredShots.map((shot) => (
                    <tr key={shot.id} className="hover:bg-[var(--bg-1)] transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-mono font-medium text-[var(--text-primary)]">{shot.shotCode}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{shot.sequence} • {shot.frameCount} frames</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)] max-w-[250px]">
                        <p className="truncate">{shot.description}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-[11px] font-bold"
                          style={{ background: COMPLEXITY_CONFIG[shot.complexity].bgColor, color: COMPLEXITY_CONFIG[shot.complexity].color }}
                        >
                          {shot.complexity}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {shot.vendor || '-'}
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-[11px] font-medium"
                          style={{ background: STATUS_CONFIG[shot.status].bgColor, color: STATUS_CONFIG[shot.status].color }}
                        >
                          {STATUS_CONFIG[shot.status].label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        v{shot.version}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                            <Icons.Play className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                            <Icons.MessageSquare className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                            <Icons.MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => {
              const progress = Math.round((vendor.shotsCompleted / vendor.shotsAssigned) * 100);
              return (
                <Card key={vendor.id} className="p-5 card-cinema spotlight-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center">
                        <Icons.Building className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">{vendor.name}</h4>
                        <p className="text-xs text-[var(--text-tertiary)]">{vendor.contactName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--warning)]">
                      <Icons.Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{vendor.rating}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[var(--text-tertiary)]">Shot Progress</span>
                      <span className="text-[var(--text-secondary)]">{vendor.shotsCompleted}/{vendor.shotsAssigned}</span>
                    </div>
                    <Progress value={progress} variant="default" size="sm" />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {vendor.specialty.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--bg-2)] text-[var(--text-secondary)]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <a
                      href={`mailto:${vendor.email}`}
                      className="text-xs text-[var(--primary)] hover:underline"
                    >
                      {vendor.email}
                    </a>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--bg-2)] transition-colors">
                      <Icons.MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </button>
                  </div>
                </Card>
              );
            })}

            {/* Add Vendor Card */}
            <button className="p-5 rounded-xl border-2 border-dashed border-[var(--border-default)] hover:border-[var(--primary)] hover:bg-[var(--bg-1)] transition-all flex flex-col items-center justify-center min-h-[240px] group">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-2)] flex items-center justify-center mb-3 group-hover:bg-[var(--primary-muted)] transition-colors">
                <Icons.Plus className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-[var(--primary)]" />
              </div>
              <p className="font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">
                Add Vendor
              </p>
            </button>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            {/* Budget Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 card-cinema">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--info-muted)] flex items-center justify-center">
                    <Icons.Target className="w-5 h-5 text-[var(--info)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Estimated Budget</p>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(stats.estimatedBudget)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 card-cinema">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                    <Icons.DollarSign className="w-5 h-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Actual Spend</p>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(stats.actualSpend)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 card-cinema">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    stats.estimatedBudget - stats.actualSpend >= 0 ? 'bg-[var(--success-muted)]' : 'bg-[var(--danger-muted)]'
                  }`}>
                    <Icons.TrendingUp className={`w-5 h-5 ${
                      stats.estimatedBudget - stats.actualSpend >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Remaining</p>
                    <p className={`text-xl font-bold ${
                      stats.estimatedBudget - stats.actualSpend >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'
                    }`}>
                      {formatCurrency(stats.estimatedBudget - stats.actualSpend)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Budget by Complexity */}
            <Card className="p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Budget by Complexity</h3>
              <div className="space-y-4">
                {(['HERO', 'COMPLEX', 'MODERATE', 'SIMPLE'] as VFXComplexity[]).map((complexity) => {
                  const shots = vfxShots.filter(s => s.complexity === complexity);
                  const estimated = shots.reduce((sum, s) => sum + s.estimatedCost, 0);
                  const actual = shots.reduce((sum, s) => sum + (s.actualCost || 0), 0);
                  const progress = estimated > 0 ? Math.min((actual / estimated) * 100, 100) : 0;

                  return (
                    <div key={complexity} className="flex items-center gap-4">
                      <span
                        className="w-20 px-2 py-1 rounded text-[11px] font-bold text-center"
                        style={{ background: COMPLEXITY_CONFIG[complexity].bgColor, color: COMPLEXITY_CONFIG[complexity].color }}
                      >
                        {complexity}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[var(--text-tertiary)]">{shots.length} shots</span>
                          <span className="text-[var(--text-secondary)]">{formatCurrency(actual)} / {formatCurrency(estimated)}</span>
                        </div>
                        <Progress value={progress} variant={progress > 90 ? 'warning' : 'default'} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Budget by Vendor */}
            <Card className="p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Budget by Vendor</h3>
              <div className="space-y-4">
                {vendors.map((vendor) => {
                  const shots = vfxShots.filter(s => s.vendor === vendor.name);
                  const estimated = shots.reduce((sum, s) => sum + s.estimatedCost, 0);
                  const actual = shots.reduce((sum, s) => sum + (s.actualCost || 0), 0);
                  const progress = estimated > 0 ? Math.min((actual / estimated) * 100, 100) : 0;

                  return (
                    <div key={vendor.id} className="flex items-center gap-4">
                      <div className="w-32 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                          <Icons.Building className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{vendor.name}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[var(--text-tertiary)]">{shots.length} shots</span>
                          <span className="text-[var(--text-secondary)]">{formatCurrency(actual)} / {formatCurrency(estimated)}</span>
                        </div>
                        <Progress value={progress} variant={progress > 90 ? 'warning' : 'default'} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
