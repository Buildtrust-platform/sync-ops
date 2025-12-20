'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Modal, ConfirmModal } from '@/app/components/ui';

/**
 * QC PAGE
 * Quality Control Checklist - Comprehensive deliverable verification.
 */

type QcStatus = 'PASS' | 'FAIL' | 'WARNING' | 'PENDING';
type QcCategory = 'VIDEO' | 'AUDIO' | 'METADATA' | 'COMPLIANCE' | 'TECHNICAL';

interface QcCheckItem {
  id: string;
  checkItem: string;
  category: QcCategory;
  status: QcStatus;
  notes: string;
  checkedBy: string | null;
  checkedAt: string | null;
  severity: 'CRITICAL' | 'STANDARD' | 'MINOR';
}

// Mock Data - Comprehensive QC Checklist
const MOCK_QC_CHECKS: QcCheckItem[] = [
  // VIDEO CHECKS
  {
    id: 'v-001',
    checkItem: 'Video Resolution - 1920x1080',
    category: 'VIDEO',
    status: 'PASS',
    notes: 'Verified resolution meets spec',
    checkedBy: 'Sarah Chen',
    checkedAt: '2024-12-20 10:30',
    severity: 'CRITICAL',
  },
  {
    id: 'v-002',
    checkItem: 'Frame Rate - 23.976 fps',
    category: 'VIDEO',
    status: 'PASS',
    notes: '',
    checkedBy: 'Sarah Chen',
    checkedAt: '2024-12-20 10:31',
    severity: 'CRITICAL',
  },
  {
    id: 'v-003',
    checkItem: 'Aspect Ratio - 16:9',
    category: 'VIDEO',
    status: 'PASS',
    notes: '',
    checkedBy: 'Sarah Chen',
    checkedAt: '2024-12-20 10:31',
    severity: 'CRITICAL',
  },
  {
    id: 'v-004',
    checkItem: 'Color Space - Rec. 709',
    category: 'VIDEO',
    status: 'PASS',
    notes: 'Color grading matches reference',
    checkedBy: 'David Kim',
    checkedAt: '2024-12-20 11:15',
    severity: 'CRITICAL',
  },
  {
    id: 'v-005',
    checkItem: 'Video Codec - ProRes 422 HQ',
    category: 'VIDEO',
    status: 'PASS',
    notes: '',
    checkedBy: 'Sarah Chen',
    checkedAt: '2024-12-20 10:32',
    severity: 'CRITICAL',
  },
  {
    id: 'v-006',
    checkItem: 'Black Levels (16-235)',
    category: 'VIDEO',
    status: 'WARNING',
    notes: 'Minor out of range values in scene 12, within tolerance',
    checkedBy: 'David Kim',
    checkedAt: '2024-12-20 11:20',
    severity: 'STANDARD',
  },
  {
    id: 'v-007',
    checkItem: 'No Interlacing Artifacts',
    category: 'VIDEO',
    status: 'PASS',
    notes: '',
    checkedBy: 'Sarah Chen',
    checkedAt: '2024-12-20 10:33',
    severity: 'STANDARD',
  },
  {
    id: 'v-008',
    checkItem: 'No Dropped Frames',
    category: 'VIDEO',
    status: 'PASS',
    notes: 'Full frame analysis completed',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'CRITICAL',
  },

  // AUDIO CHECKS
  {
    id: 'a-001',
    checkItem: 'Audio Format - 48kHz 24-bit',
    category: 'AUDIO',
    status: 'PASS',
    notes: '',
    checkedBy: 'Michael Torres',
    checkedAt: '2024-12-20 10:45',
    severity: 'CRITICAL',
  },
  {
    id: 'a-002',
    checkItem: 'Channel Configuration - 5.1 Surround',
    category: 'AUDIO',
    status: 'PASS',
    notes: 'All 6 channels verified',
    checkedBy: 'Michael Torres',
    checkedAt: '2024-12-20 10:47',
    severity: 'CRITICAL',
  },
  {
    id: 'a-003',
    checkItem: 'Peak Level (-3dB max)',
    category: 'AUDIO',
    status: 'PASS',
    notes: 'Maximum peak: -4.2dB',
    checkedBy: 'Michael Torres',
    checkedAt: '2024-12-20 10:50',
    severity: 'CRITICAL',
  },
  {
    id: 'a-004',
    checkItem: 'Dialogue Intelligibility',
    category: 'AUDIO',
    status: 'PASS',
    notes: 'All dialogue clearly audible',
    checkedBy: 'Emma Wilson',
    checkedAt: '2024-12-20 14:15',
    severity: 'CRITICAL',
  },
  {
    id: 'a-005',
    checkItem: 'No Audio Clipping',
    category: 'AUDIO',
    status: 'PASS',
    notes: '',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'CRITICAL',
  },
  {
    id: 'a-006',
    checkItem: 'Audio/Video Sync',
    category: 'AUDIO',
    status: 'FAIL',
    notes: 'Audio drift detected at 45:23 - needs correction',
    checkedBy: 'Michael Torres',
    checkedAt: '2024-12-20 11:05',
    severity: 'CRITICAL',
  },
  {
    id: 'a-007',
    checkItem: 'Background Noise Level',
    category: 'AUDIO',
    status: 'WARNING',
    notes: 'Slight hum in scene 8, below threshold but noticeable',
    checkedBy: 'Michael Torres',
    checkedAt: '2024-12-20 11:10',
    severity: 'STANDARD',
  },
  {
    id: 'a-008',
    checkItem: 'Stereo Mix Present',
    category: 'AUDIO',
    status: 'PASS',
    notes: 'Stereo downmix verified',
    checkedBy: 'Michael Torres',
    checkedAt: '2024-12-20 10:55',
    severity: 'STANDARD',
  },

  // METADATA CHECKS
  {
    id: 'm-001',
    checkItem: 'Title Information Complete',
    category: 'METADATA',
    status: 'PASS',
    notes: '',
    checkedBy: 'Emma Wilson',
    checkedAt: '2024-12-20 13:00',
    severity: 'CRITICAL',
  },
  {
    id: 'm-002',
    checkItem: 'Runtime Accurate',
    category: 'METADATA',
    status: 'PASS',
    notes: 'Runtime: 01:32:45',
    checkedBy: 'Emma Wilson',
    checkedAt: '2024-12-20 13:02',
    severity: 'CRITICAL',
  },
  {
    id: 'm-003',
    checkItem: 'Copyright Info Present',
    category: 'METADATA',
    status: 'PASS',
    notes: '',
    checkedBy: 'Emma Wilson',
    checkedAt: '2024-12-20 13:05',
    severity: 'CRITICAL',
  },
  {
    id: 'm-004',
    checkItem: 'Credits Complete',
    category: 'METADATA',
    status: 'FAIL',
    notes: 'Missing 3 crew members in end credits',
    checkedBy: 'Emma Wilson',
    checkedAt: '2024-12-20 13:10',
    severity: 'CRITICAL',
  },
  {
    id: 'm-005',
    checkItem: 'Timecode Format',
    category: 'METADATA',
    status: 'PASS',
    notes: 'Non-drop frame timecode verified',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'STANDARD',
  },
  {
    id: 'm-006',
    checkItem: 'Closed Captions Embedded',
    category: 'METADATA',
    status: 'PASS',
    notes: 'CEA-608 captions present',
    checkedBy: 'Emma Wilson',
    checkedAt: '2024-12-20 13:15',
    severity: 'CRITICAL',
  },
  {
    id: 'm-007',
    checkItem: 'Language Tags Correct',
    category: 'METADATA',
    status: 'PASS',
    notes: 'English (en-US) verified',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'STANDARD',
  },

  // COMPLIANCE CHECKS
  {
    id: 'c-001',
    checkItem: 'Content Rating Applied',
    category: 'COMPLIANCE',
    status: 'PASS',
    notes: 'PG-13 rating applied',
    checkedBy: 'Legal Team',
    checkedAt: '2024-12-19 16:00',
    severity: 'CRITICAL',
  },
  {
    id: 'c-002',
    checkItem: 'Broadcast Safe (NTSC)',
    category: 'COMPLIANCE',
    status: 'PASS',
    notes: 'All values within broadcast range',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'CRITICAL',
  },
  {
    id: 'c-003',
    checkItem: 'No Unauthorized Content',
    category: 'COMPLIANCE',
    status: 'PASS',
    notes: 'Clearance verified',
    checkedBy: 'Legal Team',
    checkedAt: '2024-12-19 16:30',
    severity: 'CRITICAL',
  },
  {
    id: 'c-004',
    checkItem: 'Rights Clearances Complete',
    category: 'COMPLIANCE',
    status: 'WARNING',
    notes: 'One music cue pending final clearance',
    checkedBy: 'Legal Team',
    checkedAt: '2024-12-19 17:00',
    severity: 'CRITICAL',
  },
  {
    id: 'c-005',
    checkItem: 'Accessibility Compliance',
    category: 'COMPLIANCE',
    status: 'PASS',
    notes: 'ADA compliant captions and audio description',
    checkedBy: 'Emma Wilson',
    checkedAt: '2024-12-20 13:30',
    severity: 'CRITICAL',
  },
  {
    id: 'c-006',
    checkItem: 'Age Rating Slate Included',
    category: 'COMPLIANCE',
    status: 'PENDING',
    notes: 'Awaiting final slate design approval',
    checkedBy: null,
    checkedAt: null,
    severity: 'STANDARD',
  },

  // TECHNICAL CHECKS
  {
    id: 't-001',
    checkItem: 'File Naming Convention',
    category: 'TECHNICAL',
    status: 'PASS',
    notes: 'Follows studio naming standard',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'STANDARD',
  },
  {
    id: 't-002',
    checkItem: 'Checksum Verification',
    category: 'TECHNICAL',
    status: 'PASS',
    notes: 'MD5: a3f5b8c2d9e4f1a6b7c8d9e0f1a2b3c4',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'CRITICAL',
  },
  {
    id: 't-003',
    checkItem: 'File Size Within Limits',
    category: 'TECHNICAL',
    status: 'PASS',
    notes: 'Size: 145.8 GB',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'STANDARD',
  },
  {
    id: 't-004',
    checkItem: 'Container Format - QuickTime',
    category: 'TECHNICAL',
    status: 'PASS',
    notes: '',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'CRITICAL',
  },
  {
    id: 't-005',
    checkItem: 'No Corrupted Data',
    category: 'TECHNICAL',
    status: 'PASS',
    notes: 'Full integrity scan completed',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'CRITICAL',
  },
  {
    id: 't-006',
    checkItem: 'Header Data Valid',
    category: 'TECHNICAL',
    status: 'PASS',
    notes: '',
    checkedBy: 'Auto-Check',
    checkedAt: '2024-12-20 10:00',
    severity: 'STANDARD',
  },
  {
    id: 't-007',
    checkItem: 'Backup Copy Created',
    category: 'TECHNICAL',
    status: 'PASS',
    notes: 'Backup stored on Archive-02',
    checkedBy: 'System',
    checkedAt: '2024-12-20 12:00',
    severity: 'CRITICAL',
  },
];

const CATEGORY_CONFIG: Record<QcCategory, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  VIDEO: { label: 'Video Quality', color: '#3b82f6', bgColor: '#3b82f620', icon: 'Video' },
  AUDIO: { label: 'Audio Quality', color: '#8b5cf6', bgColor: '#8b5cf620', icon: 'Volume2' },
  METADATA: { label: 'Metadata', color: '#10b981', bgColor: '#10b98120', icon: 'FileText' },
  COMPLIANCE: { label: 'Compliance', color: '#f59e0b', bgColor: '#f59e0b20', icon: 'ShieldCheck' },
  TECHNICAL: { label: 'Technical', color: '#6366f1', bgColor: '#6366f120', icon: 'Settings' },
};

const STATUS_CONFIG: Record<QcStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  PASS: { label: 'Pass', color: '#10b981', bgColor: '#10b98120', icon: 'CheckCircle' },
  FAIL: { label: 'Fail', color: '#ef4444', bgColor: '#ef444420', icon: 'XCircle' },
  WARNING: { label: 'Warning', color: '#f59e0b', bgColor: '#f59e0b20', icon: 'AlertTriangle' },
  PENDING: { label: 'Pending', color: '#6b7280', bgColor: '#6b728020', icon: 'Clock' },
};

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critical', color: '#ef4444' },
  STANDARD: { label: 'Standard', color: '#f59e0b' },
  MINOR: { label: 'Minor', color: '#6b7280' },
};

export default function QcPage() {
  const [selectedCategory, setSelectedCategory] = useState<QcCategory | 'ALL'>('ALL');
  const [checks, setChecks] = useState(MOCK_QC_CHECKS);
  const [expandedCategories, setExpandedCategories] = useState<Set<QcCategory>>(
    new Set<QcCategory>(['VIDEO', 'AUDIO', 'METADATA', 'COMPLIANCE', 'TECHNICAL'])
  );

  // Modal states
  const [isAutoCheckModalOpen, setIsAutoCheckModalOpen] = useState(false);
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [autoCheckCompleted, setAutoCheckCompleted] = useState(false);

  // Form data states
  const [failNotes, setFailNotes] = useState('');
  const [noteText, setNoteText] = useState('');
  const [currentCheckId, setCurrentCheckId] = useState<string | null>(null);

  // Filter checks by category
  const filteredChecks = selectedCategory === 'ALL'
    ? checks
    : checks.filter(c => c.category === selectedCategory);

  // Group checks by category
  const checksByCategory = (Object.keys(CATEGORY_CONFIG) as QcCategory[]).reduce((acc, category) => {
    acc[category] = checks.filter(c => c.category === category);
    return acc;
  }, {} as Record<QcCategory, QcCheckItem[]>);

  // Calculate stats
  const totalChecks = checks.length;
  const passedChecks = checks.filter(c => c.status === 'PASS').length;
  const failedChecks = checks.filter(c => c.status === 'FAIL').length;
  const warningChecks = checks.filter(c => c.status === 'WARNING').length;
  const pendingChecks = checks.filter(c => c.status === 'PENDING').length;
  const overallScore = Math.round((passedChecks / totalChecks) * 100);

  const toggleCategory = (category: QcCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleMarkPass = (checkId: string) => {
    setChecks(checks.map(c =>
      c.id === checkId
        ? { ...c, status: 'PASS', checkedBy: 'Current User', checkedAt: new Date().toLocaleString(), notes: c.notes || 'Manually passed' }
        : c
    ));
  };

  const handleMarkFail = (checkId: string) => {
    const check = checks.find(c => c.id === checkId);
    if (check) {
      setCurrentCheckId(checkId);
      setFailNotes('');
      setIsFailModalOpen(true);
    }
  };

  const handleConfirmMarkFail = () => {
    if (currentCheckId) {
      setChecks(checks.map(c =>
        c.id === currentCheckId
          ? { ...c, status: 'FAIL', checkedBy: 'Current User', checkedAt: new Date().toLocaleString(), notes: failNotes || 'Failed - no notes provided' }
          : c
      ));
      setIsFailModalOpen(false);
      setCurrentCheckId(null);
      setFailNotes('');
    }
  };

  const handleAddNote = (checkId: string) => {
    const check = checks.find(c => c.id === checkId);
    if (check) {
      setCurrentCheckId(checkId);
      setNoteText(check.notes || '');
      setIsNoteModalOpen(true);
    }
  };

  const handleSaveNote = () => {
    if (currentCheckId) {
      setChecks(checks.map(c =>
        c.id === currentCheckId ? { ...c, notes: noteText } : c
      ));
      setIsNoteModalOpen(false);
      setCurrentCheckId(null);
      setNoteText('');
    }
  };

  const handleRunAutoCheck = () => {
    setAutoCheckCompleted(false);
    setIsAutoCheckModalOpen(true);
    // Simulate automated checks with a delay
    setTimeout(() => {
      setAutoCheckCompleted(true);
    }, 2000);
  };

  const handleExportReport = () => {
    const csv = 'Check ID,Check Item,Category,Status,Severity,Notes,Checked By,Checked At\n' +
      checks.map(c => [
        c.id,
        `"${c.checkItem}"`,
        c.category,
        c.status,
        c.severity,
        `"${c.notes || ''}"`,
        `"${c.checkedBy || ''}"`,
        `"${c.checkedAt || ''}"`
      ].join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qc-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
                <Icons.ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Quality Control</h1>
                <p className="text-sm text-[var(--text-secondary)]">Comprehensive deliverable verification</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" onClick={handleRunAutoCheck}>
                <Icons.Zap className="w-4 h-4 mr-2" />
                Run Auto-Check
              </Button>
              <Button variant="primary" size="md" onClick={handleExportReport}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export QC Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="p-5">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--text-primary)]">{totalChecks}</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Total Checks</p>
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: STATUS_CONFIG.PASS.color }}>{passedChecks}</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Passed</p>
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: STATUS_CONFIG.FAIL.color }}>{failedChecks}</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Failed</p>
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: STATUS_CONFIG.WARNING.color }}>{warningChecks}</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Warnings</p>
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: STATUS_CONFIG.PENDING.color }}>{pendingChecks}</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Pending</p>
            </div>
          </Card>
        </div>

        {/* Overall Score */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Overall QC Score</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {passedChecks} of {totalChecks} checks passed
                {failedChecks > 0 && (
                  <span className="ml-2 text-[var(--danger)] font-medium">
                    • {failedChecks} critical {failedChecks === 1 ? 'failure' : 'failures'}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold" style={{ color: overallScore >= 90 ? '#10b981' : overallScore >= 70 ? '#f59e0b' : '#ef4444' }}>
                {overallScore}%
              </div>
              <div className="mt-2 w-64 h-3 bg-[var(--bg-2)] rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${overallScore}%`,
                    backgroundColor: overallScore >= 90 ? '#10b981' : overallScore >= 70 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-1)] text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
              }`}
            >
              All Categories
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as QcCategory)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? 'text-white'
                    : 'bg-[var(--bg-1)] text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                }`}
                style={selectedCategory === key ? { backgroundColor: config.color } : {}}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* QC Checklist - Category Accordions */}
        <div className="space-y-4">
          {(Object.keys(CATEGORY_CONFIG) as QcCategory[]).map(category => {
            const categoryConfig = CATEGORY_CONFIG[category];
            const CategoryIcon = Icons[categoryConfig.icon];
            const categoryChecks = checksByCategory[category];
            const isExpanded = expandedCategories.has(category);

            if (selectedCategory !== 'ALL' && selectedCategory !== category) {
              return null;
            }

            const categoryPassed = categoryChecks.filter(c => c.status === 'PASS').length;
            const categoryFailed = categoryChecks.filter(c => c.status === 'FAIL').length;
            const categoryWarnings = categoryChecks.filter(c => c.status === 'WARNING').length;

            return (
              <Card key={category} className="overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full p-5 flex items-center justify-between hover:bg-[var(--bg-1)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: categoryConfig.bgColor }}
                    >
                      <CategoryIcon className="w-6 h-6" style={{ color: categoryConfig.color }} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-[var(--text-primary)]">{categoryConfig.label}</h3>
                      <div className="flex items-center gap-3 text-sm mt-1">
                        <span style={{ color: STATUS_CONFIG.PASS.color }}>{categoryPassed} passed</span>
                        {categoryFailed > 0 && <span style={{ color: STATUS_CONFIG.FAIL.color }}>{categoryFailed} failed</span>}
                        {categoryWarnings > 0 && <span style={{ color: STATUS_CONFIG.WARNING.color }}>{categoryWarnings} warnings</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-[var(--text-tertiary)]">
                      {categoryChecks.length} {categoryChecks.length === 1 ? 'check' : 'checks'}
                    </div>
                    {isExpanded ? (
                      <Icons.ChevronUp className="w-5 h-5 text-[var(--text-tertiary)]" />
                    ) : (
                      <Icons.ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[var(--border-subtle)]">
                    {categoryChecks.map((check, index) => {
                      const statusConfig = STATUS_CONFIG[check.status];
                      const StatusIcon = Icons[statusConfig.icon];
                      const severityConfig = SEVERITY_CONFIG[check.severity];

                      return (
                        <div
                          key={check.id}
                          className={`p-4 ${index !== categoryChecks.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''} ${
                            check.status === 'FAIL' ? 'bg-[var(--danger-muted)]' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: statusConfig.bgColor }}
                            >
                              <StatusIcon className="w-5 h-5" style={{ color: statusConfig.color }} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-[var(--text-primary)]">{check.checkItem}</h4>
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-medium"
                                  style={{ color: severityConfig.color, backgroundColor: `${severityConfig.color}20` }}
                                >
                                  {severityConfig.label}
                                </span>
                              </div>

                              {check.notes && (
                                <p className={`text-sm mb-2 ${check.status === 'FAIL' ? 'text-[var(--danger)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                                  {check.notes}
                                </p>
                              )}

                              {check.checkedBy && (
                                <p className="text-xs text-[var(--text-tertiary)]">
                                  Checked by {check.checkedBy} at {check.checkedAt}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                                style={{
                                  color: statusConfig.color,
                                  backgroundColor: statusConfig.bgColor,
                                }}
                              >
                                {statusConfig.label}
                              </span>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkPass(check.id)}
                                disabled={check.status === 'PASS'}
                                aria-label="Mark as pass"
                              >
                                <Icons.CheckCircle className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkFail(check.id)}
                                disabled={check.status === 'FAIL'}
                                aria-label="Mark as fail"
                              >
                                <Icons.XCircle className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddNote(check.id)}
                                aria-label="Add note"
                              >
                                <Icons.Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Auto Check Modal */}
      <Modal
        isOpen={isAutoCheckModalOpen}
        onClose={() => setIsAutoCheckModalOpen(false)}
        title="Running Automated QC Checks"
        size="md"
        footer={
          autoCheckCompleted ? (
            <Button
              variant="primary"
              onClick={() => setIsAutoCheckModalOpen(false)}
              fullWidth
            >
              Close
            </Button>
          ) : null
        }
      >
        {!autoCheckCompleted ? (
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)] mb-4">
              Performing automated quality control checks...
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">Verifying technical specifications</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">Checking file integrity</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">Validating metadata</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">Scanning for common issues</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[var(--success-muted)] flex items-center justify-center">
                <Icons.CheckCircle className="w-8 h-8 text-[var(--success)]" />
              </div>
            </div>
            <p className="text-center text-[var(--text-primary)] font-medium">
              Automated checks completed successfully!
            </p>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Icons.CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>Technical specifications verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>File integrity validated</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>Metadata validated</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>No common issues detected</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Mark as Failed Modal */}
      <Modal
        isOpen={isFailModalOpen}
        onClose={() => {
          setIsFailModalOpen(false);
          setCurrentCheckId(null);
          setFailNotes('');
        }}
        title="Mark Check as Failed"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsFailModalOpen(false);
                setCurrentCheckId(null);
                setFailNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmMarkFail}
              disabled={!failNotes.trim()}
            >
              Mark as Failed
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {currentCheckId && (
            <div className="p-3 bg-[var(--bg-2)] rounded-lg">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {checks.find(c => c.id === currentCheckId)?.checkItem}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Failure Notes <span className="text-[var(--danger)]">*</span>
            </label>
            <textarea
              value={failNotes}
              onChange={(e) => setFailNotes(e.target.value)}
              placeholder="Describe why this check failed..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Add/Edit Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setCurrentCheckId(null);
          setNoteText('');
        }}
        title="Add/Edit Note"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsNoteModalOpen(false);
                setCurrentCheckId(null);
                setNoteText('');
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveNote}>
              Save Note
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {currentCheckId && (
            <div className="p-3 bg-[var(--bg-2)] rounded-lg">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {checks.find(c => c.id === currentCheckId)?.checkItem}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Note
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add notes about this check..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
