'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button, ConfirmModal } from '@/app/components/ui';

/**
 * CREW TIME PAGE
 * Track crew hours, overtime, and meal penalties.
 */

type TimeStatus = 'CLOCKED_IN' | 'ON_MEAL' | 'WRAPPED' | 'PENDING_APPROVAL';
type Department = 'CAMERA' | 'LIGHTING' | 'SOUND' | 'ART' | 'PRODUCTION' | 'GRIP' | 'ELECTRIC';

interface CrewTimeEntry {
  id: string;
  name: string;
  department: Department;
  role: string;
  callTime: string;
  wrapTime: string | null;
  mealIn: string | null;
  mealOut: string | null;
  totalHours: number;
  overtime: number;
  status: TimeStatus;
}

// Mock data with crew timesheet entries
const MOCK_TIME_ENTRIES: CrewTimeEntry[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    department: 'CAMERA',
    role: 'Director of Photography',
    callTime: '07:00',
    wrapTime: null,
    mealIn: null,
    mealOut: null,
    totalHours: 8.5,
    overtime: 0,
    status: 'CLOCKED_IN',
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    department: 'CAMERA',
    role: '1st AC',
    callTime: '07:00',
    wrapTime: null,
    mealIn: '12:30',
    mealOut: '13:00',
    totalHours: 8.0,
    overtime: 0,
    status: 'CLOCKED_IN',
  },
  {
    id: '3',
    name: 'Emma Thompson',
    department: 'CAMERA',
    role: '2nd AC',
    callTime: '07:30',
    wrapTime: null,
    mealIn: null,
    mealOut: null,
    totalHours: 7.5,
    overtime: 0,
    status: 'CLOCKED_IN',
  },
  {
    id: '4',
    name: 'James Wilson',
    department: 'LIGHTING',
    role: 'Gaffer',
    callTime: '06:30',
    wrapTime: null,
    mealIn: '12:00',
    mealOut: '12:45',
    totalHours: 9.0,
    overtime: 1.0,
    status: 'CLOCKED_IN',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    department: 'LIGHTING',
    role: 'Best Boy Electric',
    callTime: '06:30',
    wrapTime: null,
    mealIn: null,
    mealOut: null,
    totalHours: 8.5,
    overtime: 0.5,
    status: 'ON_MEAL',
  },
  {
    id: '6',
    name: 'David Park',
    department: 'SOUND',
    role: 'Sound Mixer',
    callTime: '07:00',
    wrapTime: '18:30',
    mealIn: '12:30',
    mealOut: '13:00',
    totalHours: 11.0,
    overtime: 3.0,
    status: 'WRAPPED',
  },
  {
    id: '7',
    name: 'Rachel Green',
    department: 'SOUND',
    role: 'Boom Operator',
    callTime: '07:00',
    wrapTime: '18:30',
    mealIn: '12:30',
    mealOut: '13:00',
    totalHours: 11.0,
    overtime: 3.0,
    status: 'WRAPPED',
  },
  {
    id: '8',
    name: 'Tom Baker',
    department: 'ART',
    role: 'Production Designer',
    callTime: '06:00',
    wrapTime: null,
    mealIn: '11:30',
    mealOut: '12:15',
    totalHours: 10.0,
    overtime: 2.0,
    status: 'CLOCKED_IN',
  },
  {
    id: '9',
    name: 'Nina Patel',
    department: 'ART',
    role: 'Art Director',
    callTime: '06:00',
    wrapTime: null,
    mealIn: null,
    mealOut: null,
    totalHours: 9.5,
    overtime: 1.5,
    status: 'CLOCKED_IN',
  },
  {
    id: '10',
    name: 'Marcus Johnson',
    department: 'PRODUCTION',
    role: '1st AD',
    callTime: '06:00',
    wrapTime: null,
    mealIn: '12:00',
    mealOut: '12:30',
    totalHours: 10.5,
    overtime: 2.5,
    status: 'CLOCKED_IN',
  },
  {
    id: '11',
    name: 'Jessica Martinez',
    department: 'PRODUCTION',
    role: 'Script Supervisor',
    callTime: '07:00',
    wrapTime: null,
    mealIn: null,
    mealOut: null,
    totalHours: 8.0,
    overtime: 0,
    status: 'ON_MEAL',
  },
  {
    id: '12',
    name: 'Chris Lee',
    department: 'PRODUCTION',
    role: '2nd AD',
    callTime: '06:30',
    wrapTime: '19:00',
    mealIn: '12:00',
    mealOut: '12:45',
    totalHours: 11.75,
    overtime: 3.75,
    status: 'PENDING_APPROVAL',
  },
  {
    id: '13',
    name: 'Alex Turner',
    department: 'GRIP',
    role: 'Key Grip',
    callTime: '06:30',
    wrapTime: null,
    mealIn: '12:00',
    mealOut: '12:45',
    totalHours: 9.0,
    overtime: 1.0,
    status: 'CLOCKED_IN',
  },
  {
    id: '14',
    name: 'Sam Mitchell',
    department: 'GRIP',
    role: 'Best Boy Grip',
    callTime: '06:30',
    wrapTime: null,
    mealIn: null,
    mealOut: null,
    totalHours: 8.5,
    overtime: 0.5,
    status: 'CLOCKED_IN',
  },
  {
    id: '15',
    name: 'Jordan Brooks',
    department: 'ELECTRIC',
    role: 'Electrician',
    callTime: '07:00',
    wrapTime: '18:00',
    mealIn: '12:30',
    mealOut: '13:00',
    totalHours: 10.5,
    overtime: 2.5,
    status: 'WRAPPED',
  },
  {
    id: '16',
    name: 'Taylor Morgan',
    department: 'ELECTRIC',
    role: 'Electrician',
    callTime: '07:00',
    wrapTime: null,
    mealIn: '12:30',
    mealOut: '13:00',
    totalHours: 8.0,
    overtime: 0,
    status: 'CLOCKED_IN',
  },
];

const STATUS_CONFIG: Record<TimeStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  CLOCKED_IN: { label: 'On Set', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  ON_MEAL: { label: 'On Meal', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Coffee' },
  WRAPPED: { label: 'Wrapped', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Clock' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'AlertCircle' },
};

const DEPARTMENT_COLORS: Record<Department, string> = {
  CAMERA: '#3B82F6',
  LIGHTING: '#F59E0B',
  SOUND: '#10B981',
  ART: '#8B5CF6',
  PRODUCTION: '#EC4899',
  GRIP: '#6366F1',
  ELECTRIC: '#F97316',
};

export default function CrewTimePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<CrewTimeEntry[]>(MOCK_TIME_ENTRIES);
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'ALL'>('ALL');
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const departments = Object.keys(DEPARTMENT_COLORS) as Department[];
  const filteredEntries = entries.filter(
    e => departmentFilter === 'ALL' || e.department === departmentFilter
  );

  const stats = {
    crewOnSet: entries.filter(e => e.status === 'CLOCKED_IN').length,
    onMeal: entries.filter(e => e.status === 'ON_MEAL').length,
    wrapped: entries.filter(e => e.status === 'WRAPPED').length,
    totalCrewHours: entries.reduce((sum, e) => sum + e.totalHours, 0),
  };

  const handleClockIn = (id: string) => {
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, status: 'CLOCKED_IN' as TimeStatus } : e
    ));
  };

  const handleClockOut = (id: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, status: 'WRAPPED' as TimeStatus, wrapTime: time } : e
    ));
  };

  const handleStartMeal = (id: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, status: 'ON_MEAL' as TimeStatus, mealIn: time } : e
    ));
  };

  const handleEndMeal = (id: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, status: 'CLOCKED_IN' as TimeStatus, mealOut: time } : e
    ));
  };

  const handleApproveClick = (id: string) => {
    setSelectedEntryId(id);
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = () => {
    if (selectedEntryId) {
      setEntries(prev => prev.map(e =>
        e.id === selectedEntryId ? { ...e, status: 'WRAPPED' as TimeStatus } : e
      ));
      setApproveModalOpen(false);
      setSelectedEntryId(null);
    }
  };

  const handleExport = () => {
    // Generate CSV content
    const headers = ['Name', 'Department', 'Role', 'Call Time', 'Wrap Time', 'Meal In', 'Meal Out', 'Total Hours', 'Overtime', 'Status'];
    const rows = entries.map(entry => [
      entry.name,
      entry.department,
      entry.role,
      entry.callTime,
      entry.wrapTime || '',
      entry.mealIn || '',
      entry.mealOut || '',
      entry.totalHours.toString(),
      entry.overtime.toString(),
      STATUS_CONFIG[entry.status].label,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crew-timesheet-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedEntry = selectedEntryId ? entries.find(e => e.id === selectedEntryId) : null;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
                <p className="text-sm text-[var(--text-secondary)]">Track hours, overtime, and meal breaks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleExport}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Timesheet
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.crewOnSet}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Crew On Set</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.onMeal}</p>
              <p className="text-xs text-[var(--text-tertiary)]">On Meal</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.wrapped}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Wrapped</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalCrewHours.toFixed(1)}h</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Crew Hours</p>
            </div>
          </Card>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
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
              {dept.charAt(0) + dept.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Time Entries Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Crew Member</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Department</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Call</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Wrap</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Meal Break</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Hours</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">OT</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredEntries.map((entry) => {
                  const statusConfig = STATUS_CONFIG[entry.status];
                  const StatusIcon = Icons[statusConfig.icon];
                  const deptColor = DEPARTMENT_COLORS[entry.department];

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-[var(--bg-1)] transition-colors ${entry.overtime > 2 ? 'bg-[var(--warning-muted)] bg-opacity-20' : ''}`}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{entry.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{entry.role}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: `${deptColor}20`, color: deptColor }}
                        >
                          {entry.department}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">{entry.callTime}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">{entry.wrapTime || '-'}</td>
                      <td className="p-4">
                        {entry.mealIn && entry.mealOut ? (
                          <div className="text-xs">
                            <p className="text-[var(--text-secondary)] font-mono">{entry.mealIn} - {entry.mealOut}</p>
                          </div>
                        ) : entry.mealIn ? (
                          <div className="text-xs">
                            <p className="text-[var(--warning)] font-mono">Started {entry.mealIn}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-[var(--text-tertiary)]">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{entry.totalHours.toFixed(1)}h</span>
                      </td>
                      <td className="p-4">
                        {entry.overtime > 0 ? (
                          <span className={`text-sm font-medium ${entry.overtime > 2 ? 'text-[var(--danger)]' : 'text-[var(--warning)]'}`}>
                            +{entry.overtime.toFixed(1)}h
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--text-tertiary)]">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                          }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {entry.status === 'CLOCKED_IN' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleStartMeal(entry.id)}>
                                <Icons.Coffee className="w-3.5 h-3.5 mr-1" />
                                Meal
                              </Button>
                              <Button variant="secondary" size="sm" onClick={() => handleClockOut(entry.id)}>
                                <Icons.Clock className="w-3.5 h-3.5 mr-1" />
                                Wrap
                              </Button>
                            </>
                          )}
                          {entry.status === 'ON_MEAL' && (
                            <Button variant="primary" size="sm" onClick={() => handleEndMeal(entry.id)}>
                              <Icons.Play className="w-3.5 h-3.5 mr-1" />
                              End Meal
                            </Button>
                          )}
                          {entry.status === 'PENDING_APPROVAL' && (
                            <Button variant="primary" size="sm" onClick={() => handleApproveClick(entry.id)}>
                              <Icons.Check className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                          )}
                          {entry.status === 'WRAPPED' && (
                            <span className="text-xs text-[var(--success)]">Complete</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredEntries.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Clock className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No time entries</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              No crew members in the selected department.
            </p>
          </Card>
        )}

        {/* Overtime Alert */}
        {entries.some(e => e.overtime > 2) && (
          <Card className="p-4 mt-6 bg-[var(--warning-muted)] border-[var(--warning)]">
            <div className="flex items-start gap-3">
              <Icons.AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[var(--text-primary)] mb-1">High Overtime Alert</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {entries.filter(e => e.overtime > 2).length} crew member(s) have exceeded 2 hours of overtime.
                  Please review and ensure proper meal penalties and turnaround times are being tracked.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Approve Timesheet Modal */}
      <ConfirmModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedEntryId(null);
        }}
        onConfirm={handleApproveConfirm}
        title="Approve Timesheet"
        message={selectedEntry ? `Are you sure you want to approve the timesheet for ${selectedEntry.name}? This will mark their hours as complete and finalized.` : ''}
        confirmText="Approve"
        variant="default"
      />
    </div>
  );
}
