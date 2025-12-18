'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * GREENLIGHT PAGE
 * Pre-production readiness checklist.
 */

type ChecklistStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ChecklistStatus;
  assignee?: string;
  dueDate?: string;
  notes?: string;
  blockedReason?: string;
}

interface ChecklistCategory {
  name: string;
  icon: keyof typeof Icons;
  items: ChecklistItem[];
}

// Data will be fetched from API
const initialCategories: ChecklistCategory[] = [];

const STATUS_CONFIG: Record<ChecklistStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  NOT_STARTED: { label: 'Not Started', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Circle' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  COMPLETE: { label: 'Complete', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  BLOCKED: { label: 'Blocked', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'AlertCircle' },
};

export default function GreenlightPage() {
  const [categories] = useState<ChecklistCategory[]>(initialCategories);

  const allItems = categories.flatMap(c => c.items);
  const stats = {
    total: allItems.length,
    complete: allItems.filter(i => i.status === 'COMPLETE').length,
    inProgress: allItems.filter(i => i.status === 'IN_PROGRESS').length,
    blocked: allItems.filter(i => i.status === 'BLOCKED').length,
  };

  const overallProgress = Math.round((stats.complete / stats.total) * 100);
  const isReadyForGreenlight = stats.complete === stats.total && stats.blocked === 0;

  const getCategoryProgress = (items: ChecklistItem[]) => {
    const complete = items.filter(i => i.status === 'COMPLETE').length;
    return Math.round((complete / items.length) * 100);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/development"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-development)', color: 'white' }}
              >
                <Icons.CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Greenlight Checklist</h1>
                <p className="text-sm text-[var(--text-secondary)]">Pre-production readiness</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isReadyForGreenlight ? 'primary' : 'secondary'}
                size="sm"
                disabled={!isReadyForGreenlight}
              >
                <Icons.Zap className="w-4 h-4 mr-2" />
                {isReadyForGreenlight ? 'Approve Greenlight' : 'Not Ready'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Overall Progress */}
        <Card className={`p-5 mb-6 ${isReadyForGreenlight ? 'border-[var(--success)] bg-[var(--success-muted)]' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Overall Readiness</h3>
              <p className="text-sm text-[var(--text-tertiary)]">
                {stats.complete} of {stats.total} items complete
                {stats.blocked > 0 && ` · ${stats.blocked} blocked`}
              </p>
            </div>
            <span className={`text-2xl font-bold ${isReadyForGreenlight ? 'text-[var(--success)]' : 'text-[var(--primary)]'}`}>
              {overallProgress}%
            </span>
          </div>
          <div className="w-full h-3 bg-[var(--bg-3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${overallProgress}%`,
                backgroundColor: isReadyForGreenlight ? 'var(--success)' : 'var(--primary)',
              }}
            />
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Items</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.complete}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Complete</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.inProgress}</p>
              <p className="text-xs text-[var(--text-tertiary)]">In Progress</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.blocked}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Blocked</p>
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const CategoryIcon = Icons[category.icon];
            const progress = getCategoryProgress(category.items);
            const isComplete = progress === 100;

            return (
              <Card key={category.name} className="overflow-hidden">
                <div className={`p-4 border-b border-[var(--border-default)] ${isComplete ? 'bg-[var(--success-muted)]' : 'bg-[var(--bg-1)]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isComplete ? 'bg-[var(--success)]' : 'bg-[var(--bg-2)]'}`}>
                        <CategoryIcon className={`w-5 h-5 ${isComplete ? 'text-white' : 'text-[var(--text-tertiary)]'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{category.name}</h3>
                        <p className="text-xs text-[var(--text-tertiary)]">{category.items.length} items</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-[var(--bg-3)] rounded-full">
                        <div
                          className="h-full rounded-full bg-[var(--success)] transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[var(--text-secondary)]">{progress}%</span>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[var(--border-subtle)]">
                  {category.items.map((item) => {
                    const statusConfig = STATUS_CONFIG[item.status];
                    const StatusIcon = Icons[statusConfig.icon];

                    return (
                      <div key={item.id} className="p-4 flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.status === 'COMPLETE' ? 'bg-[var(--success)] text-white' : 'bg-[var(--bg-2)]'
                          }`}
                        >
                          <StatusIcon className={`w-4 h-4 ${item.status === 'COMPLETE' ? '' : 'text-[var(--text-tertiary)]'}`} style={item.status !== 'COMPLETE' ? { color: statusConfig.color } : {}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${item.status === 'COMPLETE' ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">{item.description}</p>
                          {item.blockedReason && (
                            <p className="text-xs text-[var(--danger)] mt-1">
                              <Icons.AlertCircle className="w-3 h-3 inline mr-1" />
                              {item.blockedReason}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--text-secondary)]">{item.assignee}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{item.dueDate}</p>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                          }}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
