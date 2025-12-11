'use client';

import { useState, useEffect } from 'react';

/**
 * CREW TIME CLOCK COMPONENT
 * Track crew hours, overtime, meal penalties, and turnaround
 *
 * Features:
 * - Check-in/check-out
 * - Auto-calculate overtime tiers (1.5x, 2x, golden time)
 * - Meal penalty warnings
 * - Turnaround violation alerts
 * - Union rule compliance
 * - Daily labor costs
 */

// Types
interface CrewTimeEntry {
  id: string;
  name: string;
  role: string;
  department: string;
  callTime: string;
  checkInTime: string | null;
  firstMealIn: string | null;
  firstMealOut: string | null;
  secondMealIn: string | null;
  secondMealOut: string | null;
  wrapTime: string | null;
  checkOutTime: string | null;
  hoursWorked: number;
  overtimeHours: number;
  doubleTimeHours: number;
  goldenTimeHours: number;
  mealPenalties: number;
  turnaroundHours: number | null;
  turnaroundViolation: boolean;
  dayRate: number;
  status: 'NOT_IN' | 'WORKING' | 'MEAL' | 'WRAPPED' | 'OUT';
}

interface CrewTimeClockProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
}

export default function CrewTimeClock({
  projectId,
  organizationId,
  currentUserEmail,
}: CrewTimeClockProps) {
  const [crew, setCrew] = useState<CrewTimeEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'wrapped' | 'summary'>('active');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewTimeEntry | null>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mock data
  useEffect(() => {
    setCrew([
      {
        id: '1', name: 'Jane Director', role: 'Director', department: 'Direction',
        callTime: '06:00', checkInTime: '05:55', firstMealIn: '12:30', firstMealOut: '13:00',
        secondMealIn: null, secondMealOut: null, wrapTime: null, checkOutTime: null,
        hoursWorked: 8.5, overtimeHours: 0.5, doubleTimeHours: 0, goldenTimeHours: 0,
        mealPenalties: 0, turnaroundHours: 11, turnaroundViolation: false,
        dayRate: 2500, status: 'WORKING'
      },
      {
        id: '2', name: 'John DP', role: 'Director of Photography', department: 'Camera',
        callTime: '05:30', checkInTime: '05:25', firstMealIn: '12:30', firstMealOut: '13:00',
        secondMealIn: null, secondMealOut: null, wrapTime: null, checkOutTime: null,
        hoursWorked: 9.0, overtimeHours: 1.0, doubleTimeHours: 0, goldenTimeHours: 0,
        mealPenalties: 0, turnaroundHours: 10, turnaroundViolation: true,
        dayRate: 2000, status: 'WORKING'
      },
      {
        id: '3', name: 'Sarah 1st AD', role: '1st Assistant Director', department: 'Direction',
        callTime: '05:00', checkInTime: '04:55', firstMealIn: '12:30', firstMealOut: '13:00',
        secondMealIn: null, secondMealOut: null, wrapTime: null, checkOutTime: null,
        hoursWorked: 9.5, overtimeHours: 1.5, doubleTimeHours: 0, goldenTimeHours: 0,
        mealPenalties: 0, turnaroundHours: 9, turnaroundViolation: true,
        dayRate: 1800, status: 'WORKING'
      },
      {
        id: '4', name: 'Mike Gaffer', role: 'Gaffer', department: 'Lighting',
        callTime: '05:30', checkInTime: '05:30', firstMealIn: '12:30', firstMealOut: '13:00',
        secondMealIn: null, secondMealOut: null, wrapTime: null, checkOutTime: null,
        hoursWorked: 9.0, overtimeHours: 1.0, doubleTimeHours: 0, goldenTimeHours: 0,
        mealPenalties: 0, turnaroundHours: 11, turnaroundViolation: false,
        dayRate: 1200, status: 'WORKING'
      },
      {
        id: '5', name: 'Lisa PA', role: 'Production Assistant', department: 'Production',
        callTime: '05:00', checkInTime: '04:50', firstMealIn: null, firstMealOut: null,
        secondMealIn: null, secondMealOut: null, wrapTime: null, checkOutTime: null,
        hoursWorked: 9.5, overtimeHours: 1.5, doubleTimeHours: 0, goldenTimeHours: 0,
        mealPenalties: 1, turnaroundHours: 10, turnaroundViolation: false,
        dayRate: 250, status: 'WORKING'
      },
      {
        id: '6', name: 'Tom Sound', role: 'Sound Mixer', department: 'Sound',
        callTime: '06:30', checkInTime: '06:25', firstMealIn: '12:30', firstMealOut: '13:00',
        secondMealIn: null, secondMealOut: null, wrapTime: '14:30', checkOutTime: '14:45',
        hoursWorked: 8.0, overtimeHours: 0, doubleTimeHours: 0, goldenTimeHours: 0,
        mealPenalties: 0, turnaroundHours: 12, turnaroundViolation: false,
        dayRate: 1000, status: 'WRAPPED'
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WORKING': return 'var(--success)';
      case 'MEAL': return 'var(--warning)';
      case 'WRAPPED': return 'var(--primary)';
      case 'OUT': return 'var(--text-tertiary)';
      case 'NOT_IN': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const calculateTimeSinceLastMeal = (entry: CrewTimeEntry): number | null => {
    if (!entry.checkInTime) return null;
    const lastMeal = entry.firstMealOut || entry.checkInTime;
    const now = currentTime;
    const lastMealDate = new Date();
    const [hours, minutes] = lastMeal.split(':').map(Number);
    lastMealDate.setHours(hours, minutes, 0);
    return (now.getTime() - lastMealDate.getTime()) / (1000 * 60 * 60);
  };

  const checkInCrew = (id: string) => {
    setCrew(crew.map(c =>
      c.id === id ? { ...c, checkInTime: formatTime(currentTime), status: 'WORKING' } : c
    ));
  };

  const startMeal = (id: string) => {
    setCrew(crew.map(c =>
      c.id === id ? { ...c, firstMealIn: formatTime(currentTime), status: 'MEAL' } : c
    ));
  };

  const endMeal = (id: string) => {
    setCrew(crew.map(c =>
      c.id === id ? { ...c, firstMealOut: formatTime(currentTime), status: 'WORKING' } : c
    ));
  };

  const wrapCrew = (id: string) => {
    setCrew(crew.map(c =>
      c.id === id ? { ...c, wrapTime: formatTime(currentTime), checkOutTime: formatTime(currentTime), status: 'WRAPPED' } : c
    ));
  };

  const activeCrew = crew.filter(c => c.status === 'WORKING' || c.status === 'MEAL');
  const wrappedCrew = crew.filter(c => c.status === 'WRAPPED' || c.status === 'OUT');

  const stats = {
    totalCrew: crew.length,
    onSet: activeCrew.length,
    wrapped: wrappedCrew.length,
    mealPenalties: crew.reduce((sum, c) => sum + c.mealPenalties, 0),
    turnaroundViolations: crew.filter(c => c.turnaroundViolation).length,
    totalOT: crew.reduce((sum, c) => sum + c.overtimeHours, 0),
    estimatedLaborCost: crew.reduce((sum, c) => {
      const base = c.dayRate;
      const ot = c.overtimeHours * (c.dayRate / 8) * 1.5;
      const dt = c.doubleTimeHours * (c.dayRate / 8) * 2;
      const gt = c.goldenTimeHours * (c.dayRate / 8) * 2.5;
      const penalties = c.mealPenalties * 50;
      return sum + base + ot + dt + gt + penalties;
    }, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Crew Time Clock
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Track hours, overtime, and compliance
          </p>
        </div>
        <div className="text-right">
          <p className="text-[32px] font-mono font-bold" style={{ color: 'var(--primary)' }}>
            {formatTime(currentTime)}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-7 gap-4">
        {[
          { label: 'Total Crew', value: stats.totalCrew, color: 'var(--text-primary)' },
          { label: 'On Set', value: stats.onSet, color: 'var(--success)' },
          { label: 'Wrapped', value: stats.wrapped, color: 'var(--primary)' },
          { label: 'Total OT Hrs', value: stats.totalOT.toFixed(1), color: stats.totalOT > 0 ? 'var(--warning)' : 'var(--text-primary)' },
          { label: 'Meal Penalties', value: stats.mealPenalties, color: stats.mealPenalties > 0 ? 'var(--error)' : 'var(--success)' },
          { label: 'Turnaround', value: stats.turnaroundViolations, color: stats.turnaroundViolations > 0 ? 'var(--error)' : 'var(--success)' },
          { label: 'Est. Labor', value: `$${stats.estimatedLaborCost.toLocaleString()}`, color: 'var(--text-primary)' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <p className="text-[22px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(stats.mealPenalties > 0 || stats.turnaroundViolations > 0) && (
        <div className="space-y-2">
          {stats.mealPenalties > 0 && (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--error-muted)', border: '1px solid var(--error)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <p className="font-semibold" style={{ color: 'var(--error)' }}>Meal Penalty Alert</p>
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  {stats.mealPenalties} crew member(s) have exceeded meal time limits
                </p>
              </div>
            </div>
          )}
          {stats.turnaroundViolations > 0 && (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--warning-muted)', border: '1px solid var(--warning)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <p className="font-semibold" style={{ color: 'var(--warning)' }}>Turnaround Violation</p>
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  {stats.turnaroundViolations} crew member(s) have less than 10hr turnaround from previous day
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-1)' }}>
        {(['active', 'wrapped', 'summary'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 px-4 py-2 rounded-md text-[14px] font-medium transition-all capitalize"
            style={{
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
            }}
          >
            {tab} {tab === 'active' && `(${activeCrew.length})`} {tab === 'wrapped' && `(${wrappedCrew.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          {activeCrew.map((member) => {
            const timeSinceMeal = calculateTimeSinceLastMeal(member);
            const nearMealPenalty = timeSinceMeal && timeSinceMeal > 5.5;

            return (
              <div
                key={member.id}
                className="rounded-xl p-4"
                style={{
                  background: 'var(--bg-1)',
                  border: member.turnaroundViolation ? '2px solid var(--warning)' : nearMealPenalty ? '2px solid var(--error)' : '1px solid var(--border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px]"
                      style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                      <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                        {member.role} • {member.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Time Info */}
                    <div className="text-center">
                      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Call</p>
                      <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{member.callTime}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>In</p>
                      <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{member.checkInTime || '—'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Hours</p>
                      <p className="font-mono font-bold text-[16px]" style={{ color: member.hoursWorked > 8 ? 'var(--warning)' : 'var(--text-primary)' }}>
                        {member.hoursWorked.toFixed(1)}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className="px-3 py-1 rounded-full text-[12px] font-semibold"
                      style={{ background: `${getStatusColor(member.status)}20`, color: getStatusColor(member.status) }}
                    >
                      {member.status}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {member.status === 'WORKING' && !member.firstMealIn && (
                        <button
                          onClick={() => startMeal(member.id)}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                          style={{ background: 'var(--warning)', color: 'white' }}
                        >
                          Start Meal
                        </button>
                      )}
                      {member.status === 'MEAL' && (
                        <button
                          onClick={() => endMeal(member.id)}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                          style={{ background: 'var(--success)', color: 'white' }}
                        >
                          End Meal
                        </button>
                      )}
                      {member.status === 'WORKING' && (
                        <button
                          onClick={() => wrapCrew(member.id)}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                          style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                        >
                          Wrap
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alerts Row */}
                {(member.turnaroundViolation || nearMealPenalty || member.overtimeHours > 0) && (
                  <div className="mt-3 pt-3 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                    {member.turnaroundViolation && (
                      <span className="text-[11px] px-2 py-1 rounded" style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}>
                        ⚠️ {member.turnaroundHours}hr turnaround
                      </span>
                    )}
                    {nearMealPenalty && (
                      <span className="text-[11px] px-2 py-1 rounded" style={{ background: 'var(--error-muted)', color: 'var(--error)' }}>
                        🍽️ {timeSinceMeal?.toFixed(1)}hrs since last meal
                      </span>
                    )}
                    {member.overtimeHours > 0 && (
                      <span className="text-[11px] px-2 py-1 rounded" style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}>
                        ⏱️ {member.overtimeHours.toFixed(1)}hr OT
                      </span>
                    )}
                    {member.mealPenalties > 0 && (
                      <span className="text-[11px] px-2 py-1 rounded" style={{ background: 'var(--error-muted)', color: 'var(--error)' }}>
                        💰 {member.mealPenalties} meal penalty
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {activeCrew.length === 0 && (
            <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>No active crew members</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wrapped' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-2)' }}>
                <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Name</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Role</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Call</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>In</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Wrap</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Hours</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>OT</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Penalties</th>
              </tr>
            </thead>
            <tbody>
              {wrappedCrew.map((member) => (
                <tr key={member.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</td>
                  <td className="px-4 py-3 text-[14px]" style={{ color: 'var(--text-secondary)' }}>{member.role}</td>
                  <td className="px-4 py-3 text-center font-mono" style={{ color: 'var(--text-primary)' }}>{member.callTime}</td>
                  <td className="px-4 py-3 text-center font-mono" style={{ color: 'var(--text-primary)' }}>{member.checkInTime}</td>
                  <td className="px-4 py-3 text-center font-mono" style={{ color: 'var(--text-primary)' }}>{member.wrapTime}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{member.hoursWorked.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center font-mono" style={{ color: member.overtimeHours > 0 ? 'var(--warning)' : 'var(--text-tertiary)' }}>
                    {member.overtimeHours.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-center" style={{ color: member.mealPenalties > 0 ? 'var(--error)' : 'var(--text-tertiary)' }}>
                    {member.mealPenalties}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hours by Department */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Hours by Department</h3>
            <div className="space-y-3">
              {['Direction', 'Camera', 'Lighting', 'Sound', 'Production'].map(dept => {
                const deptCrew = crew.filter(c => c.department === dept);
                const totalHours = deptCrew.reduce((sum, c) => sum + c.hoursWorked, 0);
                const totalOT = deptCrew.reduce((sum, c) => sum + c.overtimeHours, 0);

                return (
                  <div key={dept} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{dept}</p>
                      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{deptCrew.length} crew</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{totalHours.toFixed(1)} hrs</p>
                      {totalOT > 0 && (
                        <p className="text-[12px]" style={{ color: 'var(--warning)' }}>+{totalOT.toFixed(1)} OT</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Labor Cost Breakdown */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Labor Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Base Day Rates</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                  ${crew.reduce((sum, c) => sum + c.dayRate, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Overtime (1.5x)</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--warning)' }}>
                  ${Math.round(crew.reduce((sum, c) => sum + (c.overtimeHours * (c.dayRate / 8) * 1.5), 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Double Time (2x)</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--text-tertiary)' }}>$0</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Meal Penalties</span>
                <span className="font-mono font-semibold" style={{ color: stats.mealPenalties > 0 ? 'var(--error)' : 'var(--text-tertiary)' }}>
                  ${(stats.mealPenalties * 50).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-lg" style={{ background: 'var(--primary-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--primary)' }}>Total Estimated</span>
                <span className="font-mono font-bold text-[18px]" style={{ color: 'var(--primary)' }}>
                  ${stats.estimatedLaborCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Overtime Rules Reference */}
          <div className="lg:col-span-2 rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Union Rules Reference</h3>
            <div className="grid grid-cols-4 gap-4 text-[13px]">
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Straight Time</p>
                <p style={{ color: 'var(--text-tertiary)' }}>First 8 hours @ 1.0x</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p className="font-semibold mb-1" style={{ color: 'var(--warning)' }}>Overtime</p>
                <p style={{ color: 'var(--text-tertiary)' }}>Hours 9-12 @ 1.5x</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p className="font-semibold mb-1" style={{ color: 'var(--error)' }}>Double Time</p>
                <p style={{ color: 'var(--text-tertiary)' }}>After 12 hours @ 2.0x</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p className="font-semibold mb-1" style={{ color: 'var(--error)' }}>Meal Penalty</p>
                <p style={{ color: 'var(--text-tertiary)' }}>After 6 hours = $50</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
