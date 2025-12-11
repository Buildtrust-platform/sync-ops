"use client";

import { useState } from 'react';

interface QCCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  spec?: string;
  status: 'NOT_CHECKED' | 'PASS' | 'FAIL' | 'WARNING' | 'N_A';
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  notes?: string;
  checkedBy?: string;
  checkedAt?: string;
  autoCheck?: boolean;
}

interface QCReport {
  id: string;
  deliverableName: string;
  deliverableId: string;
  createdAt: string;
  status: 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'CONDITIONAL';
  checkedBy: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
}

interface QCChecklistProps {
  projectId: string;
  deliverableId?: string;
  onComplete?: (reportId: string, status: 'PASSED' | 'FAILED' | 'CONDITIONAL') => void;
}

// QC check templates by category
const QC_TEMPLATES: Record<string, Omit<QCCheck, 'id' | 'status' | 'notes' | 'checkedBy' | 'checkedAt'>[]> = {
  'Video Technical': [
    { category: 'Video Technical', name: 'Resolution', description: 'Verify output resolution matches spec', spec: '1920x1080 / 3840x2160', severity: 'CRITICAL' },
    { category: 'Video Technical', name: 'Frame Rate', description: 'Confirm correct frame rate', spec: '23.976 / 24 / 25 / 29.97 fps', severity: 'CRITICAL' },
    { category: 'Video Technical', name: 'Codec', description: 'Verify correct codec and profile', spec: 'ProRes 422 HQ / H.264 / H.265', severity: 'CRITICAL' },
    { category: 'Video Technical', name: 'Bit Depth', description: 'Confirm color bit depth', spec: '8-bit / 10-bit', severity: 'MAJOR' },
    { category: 'Video Technical', name: 'Bitrate', description: 'Check average and peak bitrate', spec: 'Per platform spec', severity: 'MAJOR' },
    { category: 'Video Technical', name: 'Duration', description: 'Verify total runtime', severity: 'CRITICAL' },
    { category: 'Video Technical', name: 'Aspect Ratio', description: 'Confirm display aspect ratio', spec: '16:9 / 2.39:1 / 1:1 / 9:16', severity: 'MAJOR' },
  ],
  'Video Quality': [
    { category: 'Video Quality', name: 'Black Levels', description: 'Check blacks are legal (16-235)', spec: 'No values below 16', severity: 'MAJOR' },
    { category: 'Video Quality', name: 'Peak White', description: 'Check whites are legal', spec: 'No values above 235', severity: 'MAJOR' },
    { category: 'Video Quality', name: 'Gamut', description: 'No illegal color values', severity: 'MAJOR' },
    { category: 'Video Quality', name: 'Compression Artifacts', description: 'No visible macroblocking or banding', severity: 'MAJOR' },
    { category: 'Video Quality', name: 'Motion Blur', description: 'No stuttering or judder issues', severity: 'MINOR' },
    { category: 'Video Quality', name: 'Noise/Grain', description: 'Acceptable noise levels', severity: 'MINOR' },
    { category: 'Video Quality', name: 'Focus', description: 'No unintended soft shots', severity: 'MINOR' },
  ],
  'Audio Technical': [
    { category: 'Audio Technical', name: 'Sample Rate', description: 'Verify audio sample rate', spec: '48kHz', severity: 'CRITICAL' },
    { category: 'Audio Technical', name: 'Bit Depth', description: 'Confirm audio bit depth', spec: '24-bit / 16-bit', severity: 'MAJOR' },
    { category: 'Audio Technical', name: 'Channel Layout', description: 'Verify correct channel configuration', spec: 'Stereo / 5.1 / 7.1', severity: 'CRITICAL' },
    { category: 'Audio Technical', name: 'Loudness (LUFS)', description: 'Integrated loudness per spec', spec: '-24 LUFS (Broadcast) / -14 LUFS (Streaming)', severity: 'CRITICAL' },
    { category: 'Audio Technical', name: 'True Peak', description: 'Maximum true peak level', spec: '-2 dBTP (Broadcast) / -1 dBTP (Streaming)', severity: 'CRITICAL' },
    { category: 'Audio Technical', name: 'LRA', description: 'Loudness Range', spec: 'Per platform spec', severity: 'MAJOR' },
    { category: 'Audio Technical', name: 'Sync', description: 'Audio/video sync verified', severity: 'CRITICAL' },
  ],
  'Audio Quality': [
    { category: 'Audio Quality', name: 'Dialogue Clarity', description: 'Dialogue audible and clear', severity: 'CRITICAL' },
    { category: 'Audio Quality', name: 'Pops/Clicks', description: 'No unwanted pops or clicks', severity: 'MAJOR' },
    { category: 'Audio Quality', name: 'Hum/Buzz', description: 'No electrical hum or buzz', severity: 'MAJOR' },
    { category: 'Audio Quality', name: 'Distortion', description: 'No clipping or distortion', severity: 'CRITICAL' },
    { category: 'Audio Quality', name: 'Dropouts', description: 'No audio dropouts', severity: 'CRITICAL' },
    { category: 'Audio Quality', name: 'Balance', description: 'Proper L/R and surround balance', severity: 'MAJOR' },
    { category: 'Audio Quality', name: 'Phase', description: 'No phase cancellation issues', severity: 'MAJOR' },
  ],
  'Editorial': [
    { category: 'Editorial', name: 'Start/End', description: 'Proper head and tail slate/black', spec: 'Per deliverable spec', severity: 'MAJOR' },
    { category: 'Editorial', name: 'Timecode', description: 'Correct start timecode', spec: '01:00:00:00 or per spec', severity: 'MAJOR' },
    { category: 'Editorial', name: 'Bars/Tone', description: 'Color bars and tone present if required', severity: 'MINOR' },
    { category: 'Editorial', name: 'Slate Info', description: 'Slate information correct', severity: 'MINOR' },
    { category: 'Editorial', name: 'Safe Areas', description: 'Important content within safe areas', severity: 'MAJOR' },
    { category: 'Editorial', name: 'Flash Frames', description: 'No unintended single frames', severity: 'MAJOR' },
    { category: 'Editorial', name: 'Continuity', description: 'No visual jump cuts or errors', severity: 'MAJOR' },
  ],
  'Graphics/Text': [
    { category: 'Graphics/Text', name: 'Spelling', description: 'All text correctly spelled', severity: 'CRITICAL' },
    { category: 'Graphics/Text', name: 'Grammar', description: 'Proper grammar and punctuation', severity: 'MAJOR' },
    { category: 'Graphics/Text', name: 'Legal Lines', description: 'All required legal text present', severity: 'CRITICAL' },
    { category: 'Graphics/Text', name: 'Logo Usage', description: 'Logos per brand guidelines', severity: 'MAJOR' },
    { category: 'Graphics/Text', name: 'Font Rendering', description: 'No aliasing or rendering issues', severity: 'MINOR' },
    { category: 'Graphics/Text', name: 'Animation', description: 'Smooth graphic animations', severity: 'MINOR' },
    { category: 'Graphics/Text', name: 'Lower Thirds', description: 'Names and titles correct', severity: 'CRITICAL' },
  ],
  'Compliance': [
    { category: 'Compliance', name: 'Closed Captions', description: 'CC file present and synced', severity: 'CRITICAL', autoCheck: true },
    { category: 'Compliance', name: 'Audio Description', description: 'AD track present if required', severity: 'MAJOR' },
    { category: 'Compliance', name: 'Content Ratings', description: 'Appropriate rating metadata', severity: 'CRITICAL' },
    { category: 'Compliance', name: 'Territory Restrictions', description: 'Geo-compliance verified', severity: 'MAJOR' },
    { category: 'Compliance', name: 'Music Clearance', description: 'All music properly licensed', severity: 'CRITICAL' },
    { category: 'Compliance', name: 'Talent Releases', description: 'All talent cleared for use', severity: 'CRITICAL' },
    { category: 'Compliance', name: 'Brand Safety', description: 'No inappropriate content', severity: 'CRITICAL' },
  ],
};

export default function QCChecklist({ projectId, deliverableId, onComplete }: QCChecklistProps) {
  const [activeTab, setActiveTab] = useState<'checklist' | 'reports' | 'templates'>('checklist');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.keys(QC_TEMPLATES));
  const [expandedCategories, setExpandedCategories] = useState<string[]>(Object.keys(QC_TEMPLATES));

  // Mock QC checks state
  const [checks, setChecks] = useState<QCCheck[]>(() => {
    let id = 1;
    return selectedCategories.flatMap(category =>
      QC_TEMPLATES[category].map(template => ({
        ...template,
        id: `qc-${id++}`,
        status: 'NOT_CHECKED' as const,
      }))
    );
  });

  // Mock reports
  const [reports] = useState<QCReport[]>([
    {
      id: 'qcr-1',
      deliverableName: 'ProRes 422 HQ Master',
      deliverableId: 'del-1',
      createdAt: '2024-01-15T14:30:00Z',
      status: 'PASSED',
      checkedBy: 'QC Tech',
      totalChecks: 45,
      passedChecks: 45,
      failedChecks: 0,
      warningChecks: 0,
    },
    {
      id: 'qcr-2',
      deliverableName: 'Broadcast HD (ABC)',
      deliverableId: 'del-2',
      createdAt: '2024-01-14T10:15:00Z',
      status: 'CONDITIONAL',
      checkedBy: 'QC Tech',
      totalChecks: 45,
      passedChecks: 42,
      failedChecks: 0,
      warningChecks: 3,
    },
    {
      id: 'qcr-3',
      deliverableName: 'YouTube 4K',
      deliverableId: 'del-3',
      createdAt: '2024-01-13T16:45:00Z',
      status: 'FAILED',
      checkedBy: 'QC Tech',
      totalChecks: 45,
      passedChecks: 40,
      failedChecks: 5,
      warningChecks: 0,
    },
  ]);

  function toggleCategory(category: string) {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }

  function updateCheckStatus(checkId: string, status: QCCheck['status']) {
    setChecks(prev => prev.map(check =>
      check.id === checkId
        ? { ...check, status, checkedBy: 'Current User', checkedAt: new Date().toISOString() }
        : check
    ));
  }

  function updateCheckNotes(checkId: string, notes: string) {
    setChecks(prev => prev.map(check =>
      check.id === checkId ? { ...check, notes } : check
    ));
  }

  function getStatusColor(status: QCCheck['status']) {
    switch (status) {
      case 'PASS': return 'bg-green-500';
      case 'FAIL': return 'bg-red-500';
      case 'WARNING': return 'bg-yellow-500';
      case 'N_A': return 'bg-slate-500';
      default: return 'bg-slate-700';
    }
  }

  function getSeverityColor(severity: QCCheck['severity']) {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400';
      case 'MAJOR': return 'text-yellow-400';
      case 'MINOR': return 'text-slate-400';
    }
  }

  function getReportStatusColor(status: QCReport['status']) {
    switch (status) {
      case 'PASSED': return 'bg-green-500/20 text-green-400';
      case 'FAILED': return 'bg-red-500/20 text-red-400';
      case 'CONDITIONAL': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  }

  // Calculate stats
  const stats = {
    total: checks.length,
    passed: checks.filter(c => c.status === 'PASS').length,
    failed: checks.filter(c => c.status === 'FAIL').length,
    warnings: checks.filter(c => c.status === 'WARNING').length,
    notChecked: checks.filter(c => c.status === 'NOT_CHECKED').length,
    critical: checks.filter(c => c.severity === 'CRITICAL').length,
    criticalPassed: checks.filter(c => c.severity === 'CRITICAL' && c.status === 'PASS').length,
  };

  const progress = stats.total > 0 ? Math.round(((stats.total - stats.notChecked) / stats.total) * 100) : 0;
  const passRate = stats.total - stats.notChecked > 0
    ? Math.round((stats.passed / (stats.total - stats.notChecked)) * 100)
    : 0;

  // Group checks by category
  const checksByCategory = checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, QCCheck[]>);

  function markAllInCategory(category: string, status: QCCheck['status']) {
    setChecks(prev => prev.map(check =>
      check.category === category
        ? { ...check, status, checkedBy: 'Current User', checkedAt: new Date().toISOString() }
        : check
    ));
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">QC Checklist</h2>
          <p className="text-slate-400 text-sm">Technical quality control verification</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export Report
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Submit QC Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{progress}%</div>
          <div className="text-xs text-slate-400">Progress</div>
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-green-400">{stats.passed}</div>
          <div className="text-xs text-slate-400">Passed</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
          <div className="text-xs text-slate-400">Failed</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-yellow-400">{stats.warnings}</div>
          <div className="text-xs text-slate-400">Warnings</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-slate-400">{stats.notChecked}</div>
          <div className="text-xs text-slate-400">Remaining</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-purple-400">{stats.criticalPassed}/{stats.critical}</div>
          <div className="text-xs text-slate-400">Critical Checks</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex gap-1">
          {[
            { id: 'checklist', label: 'Checklist', icon: '📋' },
            { id: 'reports', label: 'QC Reports', icon: '📄' },
            { id: 'templates', label: 'Templates', icon: '📝' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all
                ${activeTab === tab.id
                  ? 'bg-slate-800 text-white border-t border-x border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          {/* Pass Rate Banner */}
          {progress > 0 && (
            <div className={`
              p-4 rounded-lg border
              ${passRate >= 90
                ? 'bg-green-500/10 border-green-500/30'
                : passRate >= 70
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${passRate >= 90 ? 'bg-green-500' : passRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}
                  `}>
                    {passRate >= 90 ? '✓' : passRate >= 70 ? '!' : '✗'}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {passRate >= 90 ? 'Excellent' : passRate >= 70 ? 'Needs Attention' : 'Critical Issues'}
                    </div>
                    <div className="text-sm text-slate-400">
                      {passRate}% pass rate ({stats.passed} of {stats.total - stats.notChecked} checked)
                    </div>
                  </div>
                </div>
                {stats.failed > 0 && (
                  <span className="text-red-400 text-sm font-medium">
                    {stats.failed} failed check{stats.failed !== 1 ? 's' : ''} must be resolved
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Category Sections */}
          {Object.entries(checksByCategory).map(([category, categoryChecks]) => {
            const isExpanded = expandedCategories.includes(category);
            const categoryStats = {
              total: categoryChecks.length,
              passed: categoryChecks.filter(c => c.status === 'PASS').length,
              failed: categoryChecks.filter(c => c.status === 'FAIL').length,
              warnings: categoryChecks.filter(c => c.status === 'WARNING').length,
            };

            return (
              <div key={category} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-semibold text-white">{category}</span>
                    <span className="text-xs text-slate-500">({categoryChecks.length} checks)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      {categoryStats.passed > 0 && (
                        <span className="text-green-400">{categoryStats.passed} ✓</span>
                      )}
                      {categoryStats.failed > 0 && (
                        <span className="text-red-400">{categoryStats.failed} ✗</span>
                      )}
                      {categoryStats.warnings > 0 && (
                        <span className="text-yellow-400">{categoryStats.warnings} !</span>
                      )}
                    </div>
                    <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(categoryStats.passed / categoryStats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Category Checks */}
                {isExpanded && (
                  <div className="border-t border-slate-700">
                    {/* Quick Actions */}
                    <div className="px-4 py-2 bg-slate-750 border-b border-slate-700 flex items-center gap-2">
                      <span className="text-xs text-slate-400 mr-2">Quick:</span>
                      <button
                        onClick={() => markAllInCategory(category, 'PASS')}
                        className="text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 px-2 py-1 rounded transition-colors"
                      >
                        Pass All
                      </button>
                      <button
                        onClick={() => markAllInCategory(category, 'N_A')}
                        className="text-xs bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 px-2 py-1 rounded transition-colors"
                      >
                        N/A All
                      </button>
                      <button
                        onClick={() => markAllInCategory(category, 'NOT_CHECKED')}
                        className="text-xs bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 px-2 py-1 rounded transition-colors"
                      >
                        Reset All
                      </button>
                    </div>

                    {/* Individual Checks */}
                    <div className="divide-y divide-slate-700">
                      {categoryChecks.map(check => (
                        <div key={check.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                          <div className="flex items-start gap-4">
                            {/* Status Buttons */}
                            <div className="flex gap-1.5 pt-0.5">
                              {(['PASS', 'FAIL', 'WARNING', 'N_A'] as const).map(status => (
                                <button
                                  key={status}
                                  onClick={() => updateCheckStatus(check.id, status)}
                                  className={`
                                    w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all
                                    ${check.status === status
                                      ? `${getStatusColor(status)} text-white scale-110`
                                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    }
                                  `}
                                  title={status === 'N_A' ? 'Not Applicable' : status}
                                >
                                  {status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : status === 'WARNING' ? '!' : '—'}
                                </button>
                              ))}
                            </div>

                            {/* Check Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-white">{check.name}</h4>
                                <span className={`text-xs font-medium ${getSeverityColor(check.severity)}`}>
                                  {check.severity}
                                </span>
                                {check.autoCheck && (
                                  <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                    Auto
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-400">{check.description}</p>
                              {check.spec && (
                                <p className="text-xs text-slate-500 mt-1 font-mono">
                                  Spec: {check.spec}
                                </p>
                              )}

                              {/* Notes Input (shown when failed or warning) */}
                              {(check.status === 'FAIL' || check.status === 'WARNING') && (
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    placeholder="Add notes about this issue..."
                                    value={check.notes || ''}
                                    onChange={(e) => updateCheckNotes(check.id, e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                              )}

                              {/* Checked Info */}
                              {check.checkedAt && (
                                <p className="text-xs text-slate-500 mt-2">
                                  Checked by {check.checkedBy} • {formatDate(check.checkedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No QC reports yet</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white">{report.deliverableName}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getReportStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      QC by {report.checkedBy} • {formatDate(report.createdAt)}
                    </p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    View Full Report →
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{report.totalChecks}</div>
                    <div className="text-xs text-slate-400">Total Checks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{report.passedChecks}</div>
                    <div className="text-xs text-slate-400">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">{report.failedChecks}</div>
                    <div className="text-xs text-slate-400">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">{report.warningChecks}</div>
                    <div className="text-xs text-slate-400">Warnings</div>
                  </div>
                </div>
                {report.failedChecks > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-sm text-red-400">
                      ⚠️ {report.failedChecks} critical issue{report.failedChecks !== 1 ? 's' : ''} must be resolved before delivery
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm mb-4">
            Select which check categories to include in your QC session.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(QC_TEMPLATES).map(([category, templates]) => (
              <label
                key={category}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all
                  ${selectedCategories.includes(category)
                    ? 'bg-blue-600/10 border-blue-500'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories(prev => [...prev, category]);
                    } else {
                      setSelectedCategories(prev => prev.filter(c => c !== category));
                    }
                  }}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{category}</span>
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    ${selectedCategories.includes(category)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-slate-600'
                    }
                  `}>
                    {selectedCategories.includes(category) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">{templates.length} checks</p>
              </label>
            ))}
          </div>

          {/* Preset Templates */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="font-semibold text-white mb-3">Quick Presets</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategories(Object.keys(QC_TEMPLATES))}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
              >
                Full QC
              </button>
              <button
                onClick={() => setSelectedCategories(['Video Technical', 'Audio Technical'])}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
              >
                Technical Only
              </button>
              <button
                onClick={() => setSelectedCategories(['Video Quality', 'Audio Quality'])}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
              >
                Quality Review
              </button>
              <button
                onClick={() => setSelectedCategories(['Editorial', 'Graphics/Text'])}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
              >
                Editorial Review
              </button>
              <button
                onClick={() => setSelectedCategories(['Compliance'])}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
              >
                Compliance Only
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
