'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * WRAP PAGE
 * End of day wrap checklist and procedures.
 */

type ChecklistStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE';

interface ChecklistItem {
  id: string;
  task: string;
  department: string;
  assignee: string;
  status: ChecklistStatus;
  completedAt?: string;
  notes?: string;
  required: boolean;
}

interface WrapSummary {
  shootDay: number;
  date: string;
  callTime: string;
  firstShot: string;
  lunchStart: string;
  lunchEnd: string;
  lastShot: string;
  wrapTime: string;
  totalHours: number;
  scenesCompleted: number;
  pagesCompleted: number;
}

// Data will be fetched from API
const initialWrapSummary: WrapSummary = {
  shootDay: 0,
  date: '',
  callTime: '',
  firstShot: '',
  lunchStart: '',
  lunchEnd: '',
  lastShot: '',
  wrapTime: '',
  totalHours: 0,
  scenesCompleted: 0,
  pagesCompleted: 0,
};

// Data will be fetched from API
const initialChecklist: ChecklistItem[] = [];

const STATUS_CONFIG: Record<ChecklistStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pending', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  COMPLETE: { label: 'Complete', color: 'var(--success)', bgColor: 'var(--success-muted)' },
};

export default function WrapPage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [summary] = useState<WrapSummary>(initialWrapSummary);

  const completedCount = checklist.filter(i => i.status === 'COMPLETE').length;
  const requiredComplete = checklist.filter(i => i.required && i.status === 'COMPLETE').length;
  const requiredTotal = checklist.filter(i => i.required).length;
  const progressPercentage = Math.round((completedCount / checklist.length) * 100);

  const toggleItem = (id: string) => {
    setChecklist(checklist.map(item => {
      if (item.id === id) {
        const newStatus: ChecklistStatus =
          item.status === 'PENDING' ? 'IN_PROGRESS' :
          item.status === 'IN_PROGRESS' ? 'COMPLETE' : 'PENDING';
        return {
          ...item,
          status: newStatus,
          completedAt: newStatus === 'COMPLETE' ? new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : undefined
        };
      }
      return item;
    }));
  };

  const groupedItems = checklist.reduce((acc, item) => {
    if (!acc[item.department]) acc[item.department] = [];
    acc[item.department].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-production)', color: 'white' }}
              >
                <Icons.CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">Wrap Checklist</h1>
                  <span className="px-2 py-0.5 rounded bg-[var(--phase-production)] text-white text-xs font-bold">
                    DAY {summary.shootDay}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{summary.date}</p>
              </div>
            </div>
            <Button variant="primary" size="sm" disabled={requiredComplete < requiredTotal}>
              <Icons.Check className="w-4 h-4 mr-2" />
              Complete Wrap
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Progress Card */}
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Wrap Progress</h3>
              <p className="text-sm text-[var(--text-tertiary)]">
                {completedCount} of {checklist.length} tasks complete · {requiredComplete}/{requiredTotal} required
              </p>
            </div>
            <span className={`text-2xl font-bold ${progressPercentage === 100 ? 'text-[var(--success)]' : 'text-[var(--primary)]'}`}>
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full h-3 bg-[var(--bg-3)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progressPercentage === 100 ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Day Summary */}
          <Card className="lg:col-span-1 p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Day Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">Call Time</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{summary.callTime}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">First Shot</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{summary.firstShot}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">Lunch</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{summary.lunchStart} - {summary.lunchEnd}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">Last Shot</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{summary.lastShot}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">Wrap Time</span>
                <span className="text-sm font-medium text-[var(--warning)]">{summary.wrapTime}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">Total Hours</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{summary.totalHours}h</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">Scenes</span>
                <span className="text-sm font-medium text-[var(--success)]">{summary.scenesCompleted} completed</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--text-tertiary)]">Pages</span>
                <span className="text-sm font-medium text-[var(--success)]">{summary.pagesCompleted} shot</span>
              </div>
            </div>
          </Card>

          {/* Checklist */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedItems).map(([department, items]) => (
              <Card key={department} className="p-4">
                <h4 className="font-semibold text-[var(--text-primary)] mb-3">{department}</h4>
                <div className="space-y-2">
                  {items.map(item => {
                    const statusConfig = STATUS_CONFIG[item.status];

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          item.status === 'COMPLETE' ? 'bg-[var(--success-muted)] opacity-60' : 'bg-[var(--bg-1)]'
                        }`}
                      >
                        <button
                          onClick={() => toggleItem(item.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            item.status === 'COMPLETE'
                              ? 'border-[var(--success)] bg-[var(--success)] text-white'
                              : item.status === 'IN_PROGRESS'
                              ? 'border-[var(--warning)] bg-[var(--warning-muted)]'
                              : 'border-[var(--border-default)] hover:border-[var(--primary)]'
                          }`}
                        >
                          {item.status === 'COMPLETE' && <Icons.Check className="w-3.5 h-3.5" />}
                          {item.status === 'IN_PROGRESS' && <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${item.status === 'COMPLETE' ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
                              {item.task}
                            </span>
                            {item.required && (
                              <span className="text-[10px] text-[var(--danger)]">*</span>
                            )}
                          </div>
                          <span className="text-xs text-[var(--text-tertiary)]">{item.assignee}</span>
                        </div>
                        {item.completedAt && (
                          <span className="text-xs text-[var(--text-tertiary)]">{item.completedAt}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
