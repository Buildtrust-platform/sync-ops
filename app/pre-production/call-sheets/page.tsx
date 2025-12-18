'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * CALL SHEETS PAGE
 * Create, manage, and send call sheets to crew.
 */

type CallSheetStatus = 'DRAFT' | 'SENT' | 'CONFIRMED' | 'ARCHIVED';

interface CallSheet {
  id: string;
  shootDay: number;
  date: string;
  projectName: string;
  location: string;
  callTime: string;
  status: CallSheetStatus;
  crewCount: number;
  confirmedCount: number;
  sentAt?: string;
  weather?: string;
}

// Data will be fetched from API
const initialCallSheets: CallSheet[] = [];

const STATUS_CONFIG: Record<CallSheetStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'FileEdit' },
  SENT: { label: 'Sent', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Send' },
  CONFIRMED: { label: 'Confirmed', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  ARCHIVED: { label: 'Archived', color: 'var(--text-tertiary)', bgColor: 'var(--bg-2)', icon: 'Archive' },
};

export default function CallSheetsPage() {
  const router = useRouter();
  const [callSheets] = useState<CallSheet[]>(initialCallSheets);
  const [activeFilter, setActiveFilter] = useState<CallSheetStatus | 'ALL'>('ALL');

  const filteredCallSheets = callSheets.filter(
    sheet => activeFilter === 'ALL' || sheet.status === activeFilter
  );

  const stats = {
    total: callSheets.length,
    draft: callSheets.filter(s => s.status === 'DRAFT').length,
    sent: callSheets.filter(s => s.status === 'SENT').length,
    confirmed: callSheets.filter(s => s.status === 'CONFIRMED').length,
  };

  const getConfirmationPercent = (sheet: CallSheet): number => {
    return sheet.crewCount > 0 ? (sheet.confirmedCount / sheet.crewCount) * 100 : 0;
  };

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
                <Icons.ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Call Sheets</h1>
                <p className="text-sm text-[var(--text-secondary)]">Generate and send call sheets</p>
              </div>
            </div>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create Call Sheet
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Call Sheets</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.draft}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Drafts</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.sent}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Awaiting Confirmation</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.confirmed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Confirmed</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'DRAFT', 'SENT', 'CONFIRMED', 'ARCHIVED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {filter === 'ALL' ? 'All' : STATUS_CONFIG[filter].label}
            </button>
          ))}
        </div>

        {/* Call Sheets List */}
        <div className="space-y-3">
          {filteredCallSheets.map((sheet) => {
            const statusConfig = STATUS_CONFIG[sheet.status];
            const StatusIcon = Icons[statusConfig.icon];
            const confirmPercent = getConfirmationPercent(sheet);

            return (
              <Card
                key={sheet.id}
                className="p-5 hover:border-[var(--primary)] transition-colors cursor-pointer"
                onClick={() => router.push(`/pre-production/call-sheets/${sheet.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Day Badge */}
                    <div className="w-14 h-14 rounded-lg bg-[var(--phase-preproduction)] text-white flex flex-col items-center justify-center">
                      <span className="text-[10px] uppercase">Day</span>
                      <span className="text-xl font-bold">{sheet.shootDay}</span>
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--text-primary)]">{sheet.projectName}</h3>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
                          style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-tertiary)]">
                        <span className="flex items-center gap-1">
                          <Icons.Calendar className="w-3.5 h-3.5" />
                          {sheet.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Clock className="w-3.5 h-3.5" />
                          Call: {sheet.callTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.MapPin className="w-3.5 h-3.5" />
                          {sheet.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Weather */}
                    {sheet.weather && (
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-tertiary)]">Weather</p>
                        <p className="text-sm text-[var(--text-secondary)]">{sheet.weather}</p>
                      </div>
                    )}

                    {/* Crew Confirmation */}
                    <div className="text-right w-32">
                      <p className="text-xs text-[var(--text-tertiary)]">Crew Confirmed</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {sheet.confirmedCount} / {sheet.crewCount}
                      </p>
                      <div className="w-full h-1.5 bg-[var(--bg-3)] rounded-full mt-1">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${confirmPercent}%`,
                            backgroundColor: confirmPercent === 100 ? 'var(--success)' : 'var(--warning)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {sheet.status === 'DRAFT' && (
                        <Button variant="primary" size="sm">
                          <Icons.Send className="w-4 h-4 mr-1" />
                          Send
                        </Button>
                      )}
                      {sheet.status === 'SENT' && (
                        <Button variant="secondary" size="sm">
                          <Icons.Bell className="w-4 h-4 mr-1" />
                          Remind
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Icons.Download className="w-4 h-4" />
                      </Button>
                    </div>

                    <Icons.ChevronRight className="w-5 h-5 text-[var(--text-tertiary)]" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredCallSheets.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.ClipboardList className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No call sheets found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create your first call sheet to coordinate your shoot.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create Call Sheet
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
