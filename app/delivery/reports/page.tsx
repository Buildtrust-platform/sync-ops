'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * REPORTS PAGE
 * Project and budget summary reports.
 */

type ReportType = 'BUDGET' | 'SCHEDULE' | 'RESOURCES' | 'DELIVERY' | 'CUSTOM';
type ReportFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME';

interface Report {
  id: string;
  name: string;
  type: ReportType;
  frequency: ReportFrequency;
  lastGenerated: string;
  status: 'READY' | 'GENERATING' | 'SCHEDULED';
  recipients: number;
  description: string;
}

interface QuickStat {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: keyof typeof Icons;
}

// Data will be fetched from API
const initialReports: Report[] = [];
const initialStats: QuickStat[] = [];

const TYPE_CONFIG: Record<ReportType, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  BUDGET: { label: 'Budget', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'DollarSign' },
  SCHEDULE: { label: 'Schedule', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Calendar' },
  RESOURCES: { label: 'Resources', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Users' },
  DELIVERY: { label: 'Delivery', color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: 'Send' },
  CUSTOM: { label: 'Custom', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Settings' },
};

const FREQUENCY_CONFIG: Record<ReportFrequency, { label: string }> = {
  DAILY: { label: 'Daily' },
  WEEKLY: { label: 'Weekly' },
  MONTHLY: { label: 'Monthly' },
  ONE_TIME: { label: 'One-time' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  READY: { label: 'Ready', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  GENERATING: { label: 'Generating', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  SCHEDULED: { label: 'Scheduled', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
};

export default function ReportsPage() {
  const [reports] = useState<Report[]>(initialReports);
  const [stats] = useState<QuickStat[]>(initialStats);
  const [typeFilter, setTypeFilter] = useState<ReportType | 'ALL'>('ALL');

  const filteredReports = reports.filter(r => typeFilter === 'ALL' || r.type === typeFilter);

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/delivery"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-delivery)', color: 'white' }}
              >
                <Icons.BarChart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Reports</h1>
                <p className="text-sm text-[var(--text-secondary)]">Project and budget summaries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Settings className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(stat => {
            const StatIcon = Icons[stat.icon];
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                    <StatIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[var(--text-tertiary)]">{stat.label}</p>
                      {stat.change && (
                        <span className={`text-xs font-medium ${
                          stat.changeType === 'positive' ? 'text-[var(--success)]' :
                          stat.changeType === 'negative' ? 'text-[var(--danger)]' :
                          'text-[var(--text-tertiary)]'
                        }`}>
                          {stat.change}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit mb-6 overflow-x-auto">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              typeFilter === 'ALL'
                ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            All Reports
          </button>
          {(Object.keys(TYPE_CONFIG) as ReportType[]).map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                typeFilter === type
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {TYPE_CONFIG[type].label}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map(report => {
            const typeConfig = TYPE_CONFIG[report.type];
            const statusConfig = STATUS_CONFIG[report.status];
            const TypeIcon = Icons[typeConfig.icon];

            return (
              <Card key={report.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: typeConfig.bgColor }}
                  >
                    <TypeIcon className="w-6 h-6" style={{ color: typeConfig.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[var(--text-primary)] truncate">{report.name}</h3>
                    </div>
                    <p className="text-sm text-[var(--text-tertiary)] mb-3">{report.description}</p>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                      >
                        {statusConfig.label}
                      </span>
                      <span>{FREQUENCY_CONFIG[report.frequency].label}</span>
                      <span className="flex items-center gap-1">
                        <Icons.Users className="w-3 h-3" />
                        {report.recipients}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    Last generated: {report.lastGenerated}
                  </span>
                  <div className="flex items-center gap-2">
                    {report.status === 'READY' && (
                      <Button variant="secondary" size="sm">
                        <Icons.Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Icons.RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredReports.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.BarChart className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No reports found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create reports to track project metrics.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </Card>
        )}

        {/* Report Templates */}
        <div className="mt-8">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Templates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Cost Report', icon: 'DollarSign', description: 'Budget breakdown' },
              { name: 'Progress Report', icon: 'TrendingUp', description: 'Schedule status' },
              { name: 'Crew Report', icon: 'Users', description: 'Hours & overtime' },
              { name: 'Asset Report', icon: 'Film', description: 'Media inventory' },
            ].map(template => {
              const TemplateIcon = Icons[template.icon as keyof typeof Icons];
              return (
                <Card key={template.name} className="p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                      <TemplateIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{template.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{template.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
