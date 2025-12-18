'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * SAFETY PAGE
 * Safety protocols, briefings, and incident tracking.
 */

type SafetyCategory = 'GENERAL' | 'STUNTS' | 'PYRO' | 'HEIGHTS' | 'WATER' | 'VEHICLES' | 'COVID';
type ProtocolStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

interface SafetyProtocol {
  id: string;
  title: string;
  category: SafetyCategory;
  status: ProtocolStatus;
  lastUpdated: string;
  requiredFor: string[];
  briefingRequired: boolean;
  signoffRequired: boolean;
  signedCount: number;
  totalRequired: number;
}

interface SafetyContact {
  name: string;
  role: string;
  phone: string;
  available: boolean;
}

// Data will be fetched from API
const initialProtocols: SafetyProtocol[] = [];

// Emergency contacts - these are static configuration, not mock data
const safetyContacts: SafetyContact[] = [];

const CATEGORY_CONFIG: Record<SafetyCategory, { label: string; color: string; icon: keyof typeof Icons }> = {
  GENERAL: { label: 'General', color: 'var(--primary)', icon: 'Shield' },
  STUNTS: { label: 'Stunts', color: 'var(--danger)', icon: 'Zap' },
  PYRO: { label: 'Pyrotechnics', color: 'var(--warning)', icon: 'AlertTriangle' },
  HEIGHTS: { label: 'Heights', color: 'var(--accent)', icon: 'TrendingUp' },
  WATER: { label: 'Water', color: '#06B6D4', icon: 'Layers' },
  VEHICLES: { label: 'Vehicles', color: '#8B5CF6', icon: 'Truck' },
  COVID: { label: 'COVID-19', color: 'var(--success)', icon: 'Activity' },
};

const STATUS_CONFIG: Record<ProtocolStatus, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  ACTIVE: { label: 'Active', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  ARCHIVED: { label: 'Archived', color: 'var(--text-tertiary)', bgColor: 'var(--bg-2)' },
};

export default function SafetyPage() {
  const [protocols] = useState<SafetyProtocol[]>(initialProtocols);
  const [categoryFilter, setCategoryFilter] = useState<SafetyCategory | 'ALL'>('ALL');

  const filteredProtocols = protocols.filter(
    p => categoryFilter === 'ALL' || p.category === categoryFilter
  );

  const activeProtocols = protocols.filter(p => p.status === 'ACTIVE');
  const totalSignoffs = activeProtocols.reduce((sum, p) => sum + p.signedCount, 0);
  const totalRequired = activeProtocols.reduce((sum, p) => sum + p.totalRequired, 0);
  const signoffPercentage = totalRequired > 0 ? Math.round((totalSignoffs / totalRequired) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pre-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-preproduction)', color: 'white' }}
              >
                <Icons.AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Safety Briefing</h1>
                <p className="text-sm text-[var(--text-secondary)]">Protocols and emergency contacts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Protocol
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Emergency Contacts Banner */}
        <Card className="p-4 mb-6 border-[var(--danger)] bg-[var(--danger-muted)]">
          <div className="flex items-center gap-3 mb-3">
            <Icons.Bell className="w-5 h-5 text-[var(--danger)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Emergency Contacts</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {safetyContacts.map((contact, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${contact.available ? 'bg-[var(--success)]' : 'bg-[var(--text-tertiary)]'}`} />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{contact.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{contact.role}</p>
                  <a href={`tel:${contact.phone}`} className="text-xs text-[var(--primary)] hover:underline">
                    {contact.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{protocols.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Protocols</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{activeProtocols.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Active</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{signoffPercentage}%</p>
              <p className="text-xs text-[var(--text-tertiary)]">Sign-off Rate</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{totalRequired - totalSignoffs}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending Sign-offs</p>
            </div>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit overflow-x-auto">
          {(['ALL', 'GENERAL', 'STUNTS', 'PYRO', 'HEIGHTS', 'VEHICLES'] as const).map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                categoryFilter === category
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {category === 'ALL' ? 'All' : CATEGORY_CONFIG[category].label}
            </button>
          ))}
        </div>

        {/* Protocols List */}
        <div className="space-y-4">
          {filteredProtocols.map((protocol) => {
            const categoryConfig = CATEGORY_CONFIG[protocol.category];
            const statusConfig = STATUS_CONFIG[protocol.status];
            const CategoryIcon = Icons[categoryConfig.icon];
            const signoffProgress = protocol.totalRequired > 0
              ? Math.round((protocol.signedCount / protocol.totalRequired) * 100)
              : 0;

            return (
              <Card key={protocol.id} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${categoryConfig.color}20`, color: categoryConfig.color }}
                    >
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{protocol.title}</h3>
                      <p className="text-sm text-[var(--text-tertiary)]">{categoryConfig.label} · Updated {protocol.lastUpdated}</p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                    }}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                {/* Required For */}
                <div className="mb-4">
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">Required For</p>
                  <div className="flex flex-wrap gap-2">
                    {protocol.requiredFor.map((group, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-[var(--bg-2)] text-xs text-[var(--text-secondary)]"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sign-off Progress */}
                {protocol.signoffRequired && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--text-tertiary)]">Sign-off Progress</span>
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {protocol.signedCount} / {protocol.totalRequired}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-3)] rounded-full">
                      <div
                        className={`h-full rounded-full transition-all ${signoffProgress === 100 ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'}`}
                        style={{ width: `${signoffProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    {protocol.briefingRequired ? (
                      <Icons.CheckCircle className="w-4 h-4 text-[var(--success)]" />
                    ) : (
                      <Icons.Circle className="w-4 h-4 text-[var(--text-tertiary)]" />
                    )}
                    <span className="text-xs text-[var(--text-secondary)]">Briefing Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {protocol.signoffRequired ? (
                      <Icons.CheckCircle className="w-4 h-4 text-[var(--success)]" />
                    ) : (
                      <Icons.Circle className="w-4 h-4 text-[var(--text-tertiary)]" />
                    )}
                    <span className="text-xs text-[var(--text-secondary)]">Sign-off Required</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="secondary" size="sm">
                      <Icons.Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icons.MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredProtocols.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.AlertTriangle className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No protocols found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create safety protocols to ensure a safe production.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              New Protocol
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
