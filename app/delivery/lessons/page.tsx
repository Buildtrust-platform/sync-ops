'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icons, Card, Button, Badge, Modal, ConfirmModal } from '@/app/components/ui';

/**
 * LESSONS PAGE
 * Capture learnings and retrospective notes from the project.
 */

type LessonCategory = 'PROCESS' | 'TECHNICAL' | 'COMMUNICATION' | 'BUDGET' | 'SCHEDULE' | 'CREATIVE';
type LessonImpact = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
type LessonStatus = 'SUBMITTED' | 'REVIEWED' | 'IMPLEMENTED' | 'ARCHIVED';

interface Lesson {
  id: string;
  title: string;
  category: LessonCategory;
  description: string;
  impact: LessonImpact;
  recommendation: string;
  submittedBy: string;
  submittedAt: string;
  status: LessonStatus;
  votes: number;
}

// Mock Data - 10 lessons learned entries
const MOCK_DATA: Lesson[] = [
  {
    id: '1',
    title: 'Pre-production storyboarding saved 3 days of shooting',
    category: 'PROCESS',
    description: 'Detailed storyboards created during pre-production helped the entire crew understand shot composition and camera movement before arriving on set. This eliminated confusion and reduced setup time significantly.',
    impact: 'POSITIVE',
    recommendation: 'Mandate storyboarding for all projects with 10+ shoot days. Invest in a dedicated storyboard artist during pre-production.',
    submittedBy: 'Sarah Chen',
    submittedAt: '2024-09-15',
    status: 'IMPLEMENTED',
    votes: 24,
  },
  {
    id: '2',
    title: 'Camera rental equipment arrived with missing accessories',
    category: 'TECHNICAL',
    description: 'The camera package was missing essential lens adapters and ND filters, causing a 2-hour delay on Day 1. We had to send a PA to the rental house to pick up the missing items.',
    impact: 'NEGATIVE',
    recommendation: 'Implement a mandatory equipment check protocol 24 hours before pickup. Create detailed packing lists for all rental packages.',
    submittedBy: 'Mike Torres',
    submittedAt: '2024-09-18',
    status: 'REVIEWED',
    votes: 18,
  },
  {
    id: '3',
    title: 'Daily production meetings kept everyone aligned',
    category: 'COMMUNICATION',
    description: 'Starting each day with a 15-minute production meeting where department heads shared updates and concerns prevented miscommunication and scheduling conflicts.',
    impact: 'POSITIVE',
    recommendation: 'Make daily production meetings a standard practice. Keep them focused and time-boxed to 15 minutes maximum.',
    submittedBy: 'Jennifer Park',
    submittedAt: '2024-09-20',
    status: 'IMPLEMENTED',
    votes: 32,
  },
  {
    id: '4',
    title: 'Weather contingency budget was insufficient',
    category: 'BUDGET',
    description: 'Rain delays on 3 separate days pushed us over budget. We only allocated 5% contingency for weather, but needed closer to 12% for outdoor shoots in this season.',
    impact: 'NEGATIVE',
    recommendation: 'For outdoor shoots during shoulder seasons, allocate 12-15% weather contingency. Consider weather insurance for high-budget productions.',
    submittedBy: 'David Kim',
    submittedAt: '2024-09-22',
    status: 'SUBMITTED',
    votes: 15,
  },
  {
    id: '5',
    title: 'Compressed post-production schedule led to rushed color grade',
    category: 'SCHEDULE',
    description: 'The delivery deadline only allowed 2 days for color grading when the colorist recommended 5 days. The final grade was acceptable but not exceptional.',
    impact: 'NEGATIVE',
    recommendation: 'Allocate realistic time for color grading based on colorist estimates, not just client deadlines. Build in buffer time for revisions.',
    submittedBy: 'Alex Rivera',
    submittedAt: '2024-09-25',
    status: 'REVIEWED',
    votes: 21,
  },
  {
    id: '6',
    title: 'On-set improv led to best scenes in the final cut',
    category: 'CREATIVE',
    description: 'Allowing 30 minutes at the end of each day for the talent to improvise with minimal direction resulted in some of the most authentic and engaging moments that made it into the final edit.',
    impact: 'POSITIVE',
    recommendation: 'Schedule dedicated improv/exploration time at the end of each shoot day when working with experienced talent. Communicate this to the editor.',
    submittedBy: 'Rachel Lee',
    submittedAt: '2024-09-27',
    status: 'SUBMITTED',
    votes: 28,
  },
  {
    id: '7',
    title: 'Frame.io integration streamlined client feedback',
    category: 'TECHNICAL',
    description: 'Using Frame.io for all client reviews eliminated the back-and-forth email chains and consolidated all feedback in one place with timecoded comments.',
    impact: 'POSITIVE',
    recommendation: 'Make Frame.io (or similar platform) mandatory for all client-facing projects. Include training for clients unfamiliar with the platform.',
    submittedBy: 'Tom Anderson',
    submittedAt: '2024-09-28',
    status: 'IMPLEMENTED',
    votes: 19,
  },
  {
    id: '8',
    title: 'Lack of backup audio recorder caused stress',
    category: 'TECHNICAL',
    description: 'Sound mixer\'s primary recorder developed an issue on Day 3. We had no backup and had to rely on scratch audio from camera for one critical interview. Fortunately the camera audio was usable but it was a close call.',
    impact: 'NEGATIVE',
    recommendation: 'Always have a backup audio recorder on-set, especially for interview-based content. Include redundancy in equipment rental budget.',
    submittedBy: 'Lisa Wong',
    submittedAt: '2024-09-30',
    status: 'REVIEWED',
    votes: 16,
  },
  {
    id: '9',
    title: 'Location scout photos were not detailed enough',
    category: 'PROCESS',
    description: 'Scout photos didn\'t capture ceiling height or window positions, leading to lighting challenges on shoot day. Camera team had to make significant adjustments to the planned shot list.',
    impact: 'NEUTRAL',
    recommendation: 'Create a location scout checklist that includes: ceiling height, window positions, electrical outlets, ambient sound, and wide-angle photos from multiple angles.',
    submittedBy: 'Chris Johnson',
    submittedAt: '2024-10-02',
    status: 'SUBMITTED',
    votes: 12,
  },
  {
    id: '10',
    title: 'Client attended all shoot days creating workflow disruptions',
    category: 'COMMUNICATION',
    description: 'Client presence on-set every day led to frequent creative changes and disrupted the director\'s workflow. Some changes were valuable, but many could have been addressed in post.',
    impact: 'NEGATIVE',
    recommendation: 'Set clear expectations in pre-production about client presence on-set. Designate specific times for client feedback rather than continuous presence.',
    submittedBy: 'Maria Santos',
    submittedAt: '2024-10-05',
    status: 'SUBMITTED',
    votes: 14,
  },
];

const CATEGORY_CONFIG: Record<LessonCategory, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  PROCESS: { label: 'Process', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Sliders' },
  TECHNICAL: { label: 'Technical', color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: 'Settings' },
  COMMUNICATION: { label: 'Communication', color: 'var(--info)', bgColor: 'var(--info-muted)', icon: 'MessageSquare' },
  BUDGET: { label: 'Budget', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'DollarSign' },
  SCHEDULE: { label: 'Schedule', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'Clock' },
  CREATIVE: { label: 'Creative', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Lightbulb' },
};

const IMPACT_CONFIG: Record<LessonImpact, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  POSITIVE: { label: 'Positive', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'TrendingUp' },
  NEGATIVE: { label: 'Negative', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'TrendingDown' },
  NEUTRAL: { label: 'Neutral', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Minus' },
};

const STATUS_CONFIG: Record<LessonStatus, { label: string; color: string; bgColor: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  REVIEWED: { label: 'Reviewed', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
  IMPLEMENTED: { label: 'Implemented', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  ARCHIVED: { label: 'Archived', color: 'var(--text-tertiary)', bgColor: 'var(--bg-2)' },
};

export default function LessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_DATA);
  const [categoryFilter, setCategoryFilter] = useState<LessonCategory | 'ALL'>('ALL');
  const [impactFilter, setImpactFilter] = useState<LessonImpact | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<LessonStatus | 'ALL'>('ALL');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMarkImplementedModalOpen, setIsMarkImplementedModalOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    category: 'PROCESS' as LessonCategory,
    description: '',
    impact: 'NEUTRAL' as LessonImpact,
    recommendation: '',
    submittedBy: ''
  });

  // Selected lesson for actions
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    if (categoryFilter !== 'ALL' && lesson.category !== categoryFilter) return false;
    if (impactFilter !== 'ALL' && lesson.impact !== impactFilter) return false;
    if (statusFilter !== 'ALL' && lesson.status !== statusFilter) return false;
    return true;
  });

  // Sort lessons
  const sortedLessons = [...filteredLessons].sort((a, b) => {
    if (sortBy === 'votes') {
      return b.votes - a.votes;
    } else {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    }
  });

  // Calculate stats
  const totalLessons = lessons.length;
  const positiveLessons = lessons.filter(l => l.impact === 'POSITIVE').length;
  const implementedLessons = lessons.filter(l => l.status === 'IMPLEMENTED').length;
  const topVotedLesson = lessons.reduce((max, lesson) => lesson.votes > max.votes ? lesson : max, lessons[0]);

  const handleUpvote = (id: string) => {
    setLessons(lessons.map(lesson =>
      lesson.id === id ? { ...lesson, votes: lesson.votes + 1 } : lesson
    ));
  };

  const handleMarkImplemented = (id: string) => {
    setSelectedLessonId(id);
    setIsMarkImplementedModalOpen(true);
  };

  const confirmMarkImplemented = () => {
    if (selectedLessonId) {
      setLessons(lessons.map(lesson =>
        lesson.id === selectedLessonId ? { ...lesson, status: 'IMPLEMENTED' as LessonStatus } : lesson
      ));
      setIsMarkImplementedModalOpen(false);
      setSelectedLessonId(null);
    }
  };

  const handleAddLesson = () => {
    setFormData({
      title: '',
      category: 'PROCESS',
      description: '',
      impact: 'NEUTRAL',
      recommendation: '',
      submittedBy: ''
    });
    setIsAddModalOpen(true);
  };

  const submitAddLesson = () => {
    const newLesson: Lesson = {
      id: String(lessons.length + 1),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      impact: formData.impact,
      recommendation: formData.recommendation,
      submittedBy: formData.submittedBy,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'SUBMITTED',
      votes: 0
    };
    setLessons([...lessons, newLesson]);
    setIsAddModalOpen(false);
  };

  const handleExportReport = () => {
    const csv = 'Title,Category,Impact,Status,Votes,Submitted By,Description,Recommendation\n' +
      filteredLessons.map(l => [
        `"${l.title}"`,
        l.category,
        l.impact,
        l.status,
        l.votes,
        `"${l.submittedBy}"`,
        `"${l.description}"`,
        `"${l.recommendation}"`
      ].join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lessons-learned-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOptionsClick = (id: string) => {
    setSelectedLessonId(id);
    setIsOptionsModalOpen(true);
  };

  const handleDeleteLesson = () => {
    if (selectedLessonId) {
      setLessons(lessons.filter(lesson => lesson.id !== selectedLessonId));
      setIsDeleteModalOpen(false);
      setIsOptionsModalOpen(false);
      setSelectedLessonId(null);
    }
  };

  const handleArchiveLesson = () => {
    if (selectedLessonId) {
      setLessons(lessons.map(lesson =>
        lesson.id === selectedLessonId ? { ...lesson, status: 'ARCHIVED' as LessonStatus } : lesson
      ));
      setIsOptionsModalOpen(false);
      setSelectedLessonId(null);
    }
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
                <Icons.BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Lessons Learned</h1>
                <p className="text-sm text-[var(--text-secondary)]">Project retrospective and learnings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleExportReport}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddLesson}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-5 text-center">
            <Icons.BookOpen className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]" />
            <p className="text-3xl font-bold text-[var(--text-primary)]">{totalLessons}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Total Lessons</p>
          </Card>
          <Card className="p-5 text-center">
            <Icons.TrendingUp className="w-8 h-8 mx-auto mb-2 text-[var(--success)]" />
            <p className="text-3xl font-bold text-[var(--success)]">{positiveLessons}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Positive Impact</p>
          </Card>
          <Card className="p-5 text-center">
            <Icons.CheckCircle className="w-8 h-8 mx-auto mb-2 text-[var(--success)]" />
            <p className="text-3xl font-bold text-[var(--success)]">{implementedLessons}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Implemented</p>
          </Card>
          <Card className="p-5 text-center">
            <Icons.ThumbsUp className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]" />
            <p className="text-3xl font-bold text-[var(--primary)]">{topVotedLesson?.votes || 0}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Top Voted</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-5 mb-6">
          <div className="flex flex-col gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-tertiary)] w-24">CATEGORY:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    categoryFilter === 'ALL'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  All
                </button>
                {(Object.keys(CATEGORY_CONFIG) as LessonCategory[]).map(cat => {
                  const config = CATEGORY_CONFIG[cat];
                  const Icon = Icons[config.icon];
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        categoryFilter === cat
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Impact & Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-tertiary)] w-24">IMPACT:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setImpactFilter('ALL')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    impactFilter === 'ALL'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  All
                </button>
                {(Object.keys(IMPACT_CONFIG) as LessonImpact[]).map(impact => (
                  <button
                    key={impact}
                    onClick={() => setImpactFilter(impact)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      impactFilter === impact
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {IMPACT_CONFIG[impact].label}
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-[var(--text-tertiary)] ml-6 w-24">STATUS:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    statusFilter === 'ALL'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  All
                </button>
                {(Object.keys(STATUS_CONFIG) as LessonStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {STATUS_CONFIG[status].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-tertiary)] w-24">SORT BY:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('votes')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    sortBy === 'votes'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  Most Voted
                </button>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    sortBy === 'recent'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  Most Recent
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-[var(--text-primary)]">
            {sortedLessons.length} {sortedLessons.length === 1 ? 'Lesson' : 'Lessons'}
          </h3>
          {(categoryFilter !== 'ALL' || impactFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoryFilter('ALL');
                setImpactFilter('ALL');
                setStatusFilter('ALL');
              }}
            >
              <Icons.X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          {sortedLessons.map(lesson => {
            const categoryConfig = CATEGORY_CONFIG[lesson.category];
            const impactConfig = IMPACT_CONFIG[lesson.impact];
            const statusConfig = STATUS_CONFIG[lesson.status];
            const CategoryIcon = Icons[categoryConfig.icon];
            const ImpactIcon = Icons[impactConfig.icon];
            const isExpanded = expandedLesson === lesson.id;

            return (
              <Card key={lesson.id} className="overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Voting */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleUpvote(lesson.id)}
                        className="w-10 h-10 rounded-lg bg-[var(--bg-2)] hover:bg-[var(--primary-muted)] flex items-center justify-center transition-colors group"
                      >
                        <Icons.ChevronUp className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--primary)]" />
                      </button>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{lesson.votes}</span>
                      <span className="text-[9px] text-[var(--text-tertiary)]">votes</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header with badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge
                          variant="default"
                          size="sm"
                          style={{ backgroundColor: categoryConfig.bgColor, color: categoryConfig.color }}
                        >
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {categoryConfig.label}
                        </Badge>
                        <Badge
                          variant="default"
                          size="sm"
                          style={{ backgroundColor: impactConfig.bgColor, color: impactConfig.color }}
                        >
                          <ImpactIcon className="w-3 h-3 mr-1" />
                          {impactConfig.label}
                        </Badge>
                        <Badge
                          variant="default"
                          size="sm"
                          style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{lesson.title}</h3>

                      {/* Description */}
                      <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">{lesson.description}</p>

                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)] mb-3">
                        <span className="flex items-center gap-1">
                          <Icons.User className="w-3 h-3" />
                          {lesson.submittedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Calendar className="w-3 h-3" />
                          {new Date(lesson.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Expand/Collapse button */}
                      <button
                        onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                        className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
                      >
                        <Icons.Lightbulb className="w-4 h-4" />
                        {isExpanded ? 'Hide' : 'View'} Recommendation
                        <Icons.ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {lesson.status !== 'IMPLEMENTED' && (
                        <Button variant="secondary" size="sm" onClick={() => handleMarkImplemented(lesson.id)}>
                          <Icons.Check className="w-4 h-4 mr-2" />
                          Mark Implemented
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleOptionsClick(lesson.id)}>
                        <Icons.MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Recommendation */}
                  {isExpanded && (
                    <div className="mt-4 ml-14 p-4 bg-[var(--bg-1)] rounded-lg border border-[var(--border-subtle)]">
                      <div className="flex items-start gap-2 mb-2">
                        <Icons.Lightbulb className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-semibold text-[var(--text-tertiary)]">RECOMMENDATION</p>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{lesson.recommendation}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {sortedLessons.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.BookOpen className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No lessons found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {categoryFilter !== 'ALL' || impactFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Start documenting learnings from this project'}
            </p>
            <Button variant="primary" size="sm" onClick={handleAddLesson}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Lesson
            </Button>
          </Card>
        )}
      </div>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Lesson"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter lesson title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as LessonCategory })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="PROCESS">Process</option>
              <option value="TECHNICAL">Technical</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="BUDGET">Budget</option>
              <option value="SCHEDULE">Schedule</option>
              <option value="CREATIVE">Creative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[100px]"
              placeholder="Describe what happened"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Impact
            </label>
            <select
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value as LessonImpact })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="POSITIVE">Positive</option>
              <option value="NEGATIVE">Negative</option>
              <option value="NEUTRAL">Neutral</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Recommendation
            </label>
            <textarea
              value={formData.recommendation}
              onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[100px]"
              placeholder="What should we do differently next time?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Submitter Name
            </label>
            <input
              type="text"
              value={formData.submittedBy}
              onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Your name"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submitAddLesson}
              className="flex-1"
              disabled={!formData.title || !formData.description || !formData.recommendation || !formData.submittedBy}
            >
              Add Lesson
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mark Implemented Confirmation Modal */}
      <ConfirmModal
        isOpen={isMarkImplementedModalOpen}
        onClose={() => setIsMarkImplementedModalOpen(false)}
        onConfirm={confirmMarkImplemented}
        title="Mark as Implemented"
        message="Are you sure you want to mark this lesson as implemented?"
        variant="default"
      />

      {/* Options Modal */}
      <Modal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        title="Lesson Options"
      >
        <div className="space-y-2">
          <button
            onClick={handleArchiveLesson}
            className="w-full px-4 py-3 text-left rounded-lg hover:bg-[var(--bg-2)] transition-colors flex items-center gap-3"
          >
            <Icons.Archive className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm text-[var(--text-primary)]">Archive Lesson</span>
          </button>
          <button
            onClick={() => {
              setIsOptionsModalOpen(false);
              setIsDeleteModalOpen(true);
            }}
            className="w-full px-4 py-3 text-left rounded-lg hover:bg-[var(--danger-muted)] transition-colors flex items-center gap-3"
          >
            <Icons.Trash className="w-4 h-4 text-[var(--danger)]" />
            <span className="text-sm text-[var(--danger)]">Delete Lesson</span>
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteLesson}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
