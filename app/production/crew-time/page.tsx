'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * CREW TIME PAGE
 * Track crew hours, overtime, and meal penalties.
 */

type TimeStatus = 'CLOCKED_IN' | 'ON_BREAK' | 'CLOCKED_OUT' | 'NOT_STARTED';

interface CrewTimeEntry {
  id: string;
  name: string;
  role: string;
  department: string;
  callTime: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  status: TimeStatus;
  hoursWorked: number;
  overtime: number;
  mealPenalty: boolean;
}

// Data will be fetched from API
const initialTimeEntries: CrewTimeEntry[] = [];

const STATUS_CONFIG: Record<TimeStatus, { label: string; color: string; bgColor: string }> = {
  CLOCKED_IN: { label: 'Working', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  ON_BREAK: { label: 'On Break', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  CLOCKED_OUT: { label: 'Wrapped', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  NOT_STARTED: { label: 'Not Started', color: 'var(--text-tertiary)', bgColor: 'var(--bg-2)' },
};

export default function CrewTimePage() {
  const [entries] = useState<CrewTimeEntry[]>(initialTimeEntries);
  const [departmentFilter, setDepartmentFilter] = useState<string | 'ALL'>('ALL');

  const departments = [...new Set(entries.map(e => e.department))];
  const filteredEntries = entries.filter(
    e => departmentFilter === 'ALL' || e.department === departmentFilter
  );

  const totalHours = entries.reduce((sum, e) => sum + e.hoursWorked, 0);
  const totalOvertime = entries.reduce((sum, e) => sum + e.overtime, 0);
  const mealPenalties = entries.filter(e => e.mealPenalty).length;
  const clockedInCount = entries.filter(e => e.status === 'CLOCKED_IN' || e.status === 'ON_BREAK').length;

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
                <Icons.Clock className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Crew Time</h1>
                <p className="text-sm text-[var(--text-secondary)]">Track hours and overtime</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Timesheet
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{clockedInCount}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Clocked In</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{totalHours.toFixed(1)}h</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Hours</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{totalOvertime.toFixed(1)}h</p>
              <p className="text-xs text-[var(--text-tertiary)]">Overtime</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{mealPenalties}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Meal Penalties</p>
            </div>
          </Card>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit overflow-x-auto">
          <button
            onClick={() => setDepartmentFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              departmentFilter === 'ALL'
                ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            All Departments
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                departmentFilter === dept
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Time Entries Table */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Crew Member</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Call</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">In</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Out</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Hours</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">OT</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredEntries.map((entry) => {
                const statusConfig = STATUS_CONFIG[entry.status];

                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-[var(--bg-1)] transition-colors ${entry.mealPenalty ? 'bg-[var(--danger-muted)]' : ''}`}
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{entry.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{entry.role} · {entry.department}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">{entry.callTime}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">{entry.clockIn || '-'}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">{entry.clockOut || '-'}</td>
                    <td className="p-4 text-sm font-medium text-[var(--text-primary)]">{entry.hoursWorked.toFixed(1)}h</td>
                    <td className="p-4">
                      {entry.overtime > 0 ? (
                        <span className="text-sm font-medium text-[var(--warning)]">+{entry.overtime.toFixed(1)}h</span>
                      ) : (
                        <span className="text-sm text-[var(--text-tertiary)]">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                          }}
                        >
                          {statusConfig.label}
                        </span>
                        {entry.mealPenalty && (
                          <span className="px-2 py-0.5 rounded bg-[var(--danger-muted)] text-[var(--danger)] text-xs font-medium">
                            MP
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {filteredEntries.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Clock className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No time entries</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Crew time will appear here once they clock in.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
