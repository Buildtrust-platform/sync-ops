'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icons, Card, StatusBadge, Progress, Button } from '../../components/ui';

/**
 * COLOR LAB
 *
 * Professional color grading management for post-production.
 * Features LUT library, color session tracking, and grade versioning.
 */

type GradeStatus = 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'REVISION';

interface ColorGrade {
  id: string;
  name: string;
  sequence: string;
  shots: number;
  completedShots: number;
  colorist?: string;
  status: GradeStatus;
  lutApplied?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface LUT {
  id: string;
  name: string;
  type: 'TECHNICAL' | 'CREATIVE' | 'SHOW_LUT' | 'CAMERA_LOG';
  format: '.cube' | '.3dl' | '.csp';
  camera?: string;
  colorSpace?: string;
  thumbnail?: string;
  isDefault: boolean;
}

interface ColorSession {
  id: string;
  name: string;
  date: string;
  colorist: string;
  duration: number; // hours
  sequences: string[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
}

// Data will be fetched from API
const initialColorGrades: ColorGrade[] = [];

// Data will be fetched from API
const initialLUTs: LUT[] = [];

// Data will be fetched from API
const initialSessions: ColorSession[] = [];

const STATUS_COLORS: Record<GradeStatus, string> = {
  PENDING: 'pending',
  IN_PROGRESS: 'processing',
  REVIEW: 'under_review',
  APPROVED: 'approved',
  REVISION: 'changes_requested',
};

const LUT_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  TECHNICAL: { bg: 'var(--info-muted)', text: 'var(--info)' },
  CREATIVE: { bg: 'var(--accent-muted)', text: 'var(--accent)' },
  SHOW_LUT: { bg: 'var(--primary-muted)', text: 'var(--primary)' },
  CAMERA_LOG: { bg: 'var(--warning-muted)', text: 'var(--warning)' },
};

export default function ColorLabPage() {
  const [colorGrades, setColorGrades] = useState<ColorGrade[]>(initialColorGrades);
  const [luts, setLUTs] = useState<LUT[]>(initialLUTs);
  const [sessions, setSessions] = useState<ColorSession[]>(initialSessions);
  const [activeTab, setActiveTab] = useState<'grades' | 'luts' | 'sessions'>('grades');
  const [selectedLUTType, setSelectedLUTType] = useState<string>('ALL');

  // Calculate stats
  const stats = {
    totalShots: colorGrades.reduce((sum, g) => sum + g.shots, 0),
    completedShots: colorGrades.reduce((sum, g) => sum + g.completedShots, 0),
    approvedGrades: colorGrades.filter(g => g.status === 'APPROVED').length,
    inProgressGrades: colorGrades.filter(g => g.status === 'IN_PROGRESS').length,
    lutCount: luts.length,
    scheduledHours: sessions.filter(s => s.status !== 'COMPLETED').reduce((sum, s) => sum + s.duration, 0),
  };

  const overallProgress = Math.round((stats.completedShots / stats.totalShots) * 100);

  const tabs = [
    { id: 'grades', label: 'Color Grades', icon: 'Layers', count: colorGrades.length },
    { id: 'luts', label: 'LUT Library', icon: 'Palette', count: luts.length },
    { id: 'sessions', label: 'Sessions', icon: 'Calendar', count: sessions.length },
  ] as const;

  const filteredLUTs = selectedLUTType === 'ALL' ? luts : luts.filter(l => l.type === selectedLUTType);

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent)]/5 to-transparent pointer-events-none" />
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
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              >
                <Icons.Palette className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Color Lab</h1>
                <p className="text-sm text-[var(--text-secondary)]">Color grading, LUT management, and session tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Upload className="w-4 h-4 mr-2" />
                Upload LUT
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats & Progress Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Overall Progress Card */}
          <Card className="p-5 md:col-span-2 card-cinema">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--text-tertiary)]">Overall Color Progress</h3>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                  {stats.completedShots}/{stats.totalShots} <span className="text-lg font-normal text-[var(--text-tertiary)]">shots</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-[var(--primary)]">{overallProgress}%</p>
              </div>
            </div>
            <Progress value={overallProgress} variant="default" size="md" />
            <div className="flex items-center justify-between mt-3 text-xs text-[var(--text-tertiary)]">
              <span>{stats.approvedGrades} sequences approved</span>
              <span>{stats.inProgressGrades} in progress</span>
            </div>
          </Card>

          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                <Icons.Palette className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.lutCount}</p>
                <p className="text-xs text-[var(--text-tertiary)]">LUTs Available</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--warning-muted)] flex items-center justify-center">
                <Icons.Clock className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.scheduledHours}h</p>
                <p className="text-xs text-[var(--text-tertiary)]">Scheduled</p>
              </div>
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
                <span className={`
                  px-1.5 py-0.5 rounded text-[10px] font-medium
                  ${activeTab === tab.id ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'}
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'grades' && (
          <div className="space-y-4">
            {/* Grade List */}
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Sequence</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Colorist</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Shots</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">LUT</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                    <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {colorGrades.map((grade) => {
                    const progress = Math.round((grade.completedShots / grade.shots) * 100);
                    return (
                      <tr key={grade.id} className="hover:bg-[var(--bg-1)] transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{grade.name}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{grade.sequence}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[var(--text-secondary)]">
                          {grade.colorist || '-'}
                        </td>
                        <td className="p-4">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-[var(--text-tertiary)]">{grade.completedShots}/{grade.shots}</span>
                              <span className="text-[var(--text-secondary)]">{progress}%</span>
                            </div>
                            <Progress value={progress} variant={progress === 100 ? 'success' : 'default'} size="sm" />
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          {grade.lutApplied ? (
                            <span className="px-2 py-1 rounded text-[11px] font-medium bg-[var(--bg-2)] text-[var(--text-secondary)]">
                              {grade.lutApplied}
                            </span>
                          ) : (
                            <span className="text-[var(--text-tertiary)]">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={STATUS_COLORS[grade.status] as any} size="sm" />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                              <Icons.Eye className="w-4 h-4 text-[var(--text-tertiary)]" />
                            </button>
                            <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                              <Icons.Edit className="w-4 h-4 text-[var(--text-tertiary)]" />
                            </button>
                            <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                              <Icons.MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'luts' && (
          <div className="space-y-6">
            {/* LUT Type Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[var(--text-tertiary)]">Type:</span>
              {(['ALL', 'SHOW_LUT', 'CREATIVE', 'TECHNICAL', 'CAMERA_LOG'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedLUTType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedLUTType === type
                      ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-0)]'
                      : 'hover:opacity-80'
                  }`}
                  style={type === 'ALL'
                    ? { background: 'var(--bg-3)', color: 'var(--text-primary)' }
                    : { background: LUT_TYPE_COLORS[type]?.bg || 'var(--bg-3)', color: LUT_TYPE_COLORS[type]?.text || 'var(--text-primary)' }
                  }
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* LUT Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLUTs.map((lut) => (
                <Card key={lut.id} className="p-5 card-cinema spotlight-hover group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Color gradient preview placeholder */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                          background: lut.type === 'CREATIVE'
                            ? 'linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb)'
                            : lut.type === 'TECHNICAL'
                            ? 'linear-gradient(135deg, #667eea, #764ba2)'
                            : lut.type === 'CAMERA_LOG'
                            ? 'linear-gradient(135deg, #11998e, #38ef7d)'
                            : 'linear-gradient(135deg, var(--primary), var(--accent))'
                        }}
                      >
                        <Icons.Palette className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                          {lut.name}
                        </h4>
                        <p className="text-xs text-[var(--text-tertiary)]">{lut.format}</p>
                      </div>
                    </div>
                    {lut.isDefault && (
                      <span className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--primary-muted)] text-[var(--primary)]">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-1 rounded text-[11px] font-medium"
                        style={{ background: LUT_TYPE_COLORS[lut.type]?.bg, color: LUT_TYPE_COLORS[lut.type]?.text }}
                      >
                        {lut.type.replace('_', ' ')}
                      </span>
                    </div>
                    {lut.camera && (
                      <p className="text-xs text-[var(--text-tertiary)]">
                        <span className="text-[var(--text-secondary)]">Camera:</span> {lut.camera}
                      </p>
                    )}
                    {lut.colorSpace && (
                      <p className="text-xs text-[var(--text-tertiary)]">
                        <span className="text-[var(--text-secondary)]">Transform:</span> {lut.colorSpace}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                    <button className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-2)] hover:bg-[var(--bg-3)] transition-colors text-[var(--text-secondary)]">
                      Preview
                    </button>
                    <button className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--primary-muted)] hover:bg-[var(--primary)] hover:text-white transition-colors text-[var(--primary)]">
                      Apply
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--bg-2)] transition-colors">
                      <Icons.Download className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </button>
                  </div>
                </Card>
              ))}

              {/* Upload New LUT Card */}
              <button className="p-5 rounded-xl border-2 border-dashed border-[var(--border-default)] hover:border-[var(--primary)] hover:bg-[var(--bg-1)] transition-all flex flex-col items-center justify-center min-h-[200px] group">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-2)] flex items-center justify-center mb-3 group-hover:bg-[var(--primary-muted)] transition-colors">
                  <Icons.Upload className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-[var(--primary)]" />
                </div>
                <p className="font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">
                  Upload New LUT
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">.cube, .3dl, .csp</p>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {/* Sessions Timeline */}
            <Card className="p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Color Sessions Timeline</h3>
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className={`relative pl-8 pb-6 ${index !== sessions.length - 1 ? 'border-l-2 border-[var(--border-default)]' : ''} ml-3`}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[11px] w-5 h-5 rounded-full flex items-center justify-center ${
                        session.status === 'COMPLETED' ? 'bg-[var(--success)]' :
                        session.status === 'IN_PROGRESS' ? 'bg-[var(--primary)] animate-pulse' :
                        'bg-[var(--bg-3)] border-2 border-[var(--border-default)]'
                      }`}
                    >
                      {session.status === 'COMPLETED' && (
                        <Icons.Check className="w-3 h-3 text-white" />
                      )}
                    </div>

                    <div className="bg-[var(--bg-1)] rounded-lg p-4 hover:bg-[var(--bg-2)] transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-[var(--text-primary)]">{session.name}</h4>
                          <p className="text-xs text-[var(--text-tertiary)]">{session.date} • {session.duration}h</p>
                        </div>
                        <StatusBadge
                          status={
                            session.status === 'COMPLETED' ? 'completed' :
                            session.status === 'IN_PROGRESS' ? 'processing' :
                            'pending'
                          }
                          size="sm"
                        />
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Icons.User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          {session.colorist}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Layers className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          {session.sequences.length} sequences
                        </span>
                      </div>

                      {session.notes && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-2 italic">{session.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Schedule New Session */}
            <button className="w-full p-4 rounded-xl border-2 border-dashed border-[var(--border-default)] hover:border-[var(--primary)] hover:bg-[var(--bg-1)] transition-all flex items-center justify-center gap-2 group">
              <Icons.Plus className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--primary)]" />
              <span className="font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">
                Schedule New Color Session
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
