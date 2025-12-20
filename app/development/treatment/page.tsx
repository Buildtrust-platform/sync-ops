'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Modal, Input, Textarea, Select, ConfirmModal } from '@/app/components/ui';

/**
 * TREATMENT PAGE
 * Create and manage creative treatments with full CRUD functionality.
 */

type TreatmentStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REVISION_NEEDED';

interface Treatment {
  id: string;
  title: string;
  project: string;
  version: number;
  status: TreatmentStatus;
  lastUpdated: string;
  author: string;
  sections: {
    overview: string;
    visualStyle: string;
    narrative: string;
    references: string;
    schedule: string;
  };
  wordCount: number;
}

// Mock data for demonstration
const initialTreatments: Treatment[] = [
  {
    id: 'TRT-001',
    title: 'Urban Dreams - Episode 1',
    project: 'Urban Dreams Series',
    version: 2.3,
    status: 'APPROVED',
    lastUpdated: '2025-12-18',
    author: 'Sarah Chen',
    wordCount: 3450,
    sections: {
      overview: 'A gritty urban drama following three interconnected stories in a modern metropolis. The series explores themes of ambition, identity, and survival in an ever-changing cityscape.',
      visualStyle: 'Cinematic widescreen with desaturated colors. Heavy use of natural lighting and handheld camera work for intimate moments.',
      narrative: 'Non-linear storytelling with three parallel narratives that converge in Episode 3. Each character represents a different socioeconomic perspective.',
      references: 'Inspired by The Wire, City of God, and recent Korean cinema. Color palette references Edward Hopper paintings.',
      schedule: 'Pre-production: 6 weeks. Principal photography: 8 weeks. Post-production: 12 weeks.'
    }
  },
  {
    id: 'TRT-002',
    title: 'Midnight Hour Commercial Spot',
    project: 'Midnight Hour Campaign',
    version: 1.0,
    status: 'IN_REVIEW',
    lastUpdated: '2025-12-19',
    author: 'Marcus Williams',
    wordCount: 1200,
    sections: {
      overview: '30-second commercial for the new Midnight Hour fragrance line. Target demographic: 25-40 professionals.',
      visualStyle: 'High contrast noir aesthetic with deep shadows and golden highlights. Slow-motion sequences.',
      narrative: 'A mysterious figure moves through an upscale nighttime cityscape, leaving an impression wherever they go.',
      references: '',
      schedule: 'Prep: 2 weeks. Shoot: 2 days. Post: 3 weeks.'
    }
  },
  {
    id: 'TRT-003',
    title: 'The Last Garden - Opening Sequence',
    project: 'The Last Garden',
    version: 3.1,
    status: 'REVISION_NEEDED',
    lastUpdated: '2025-12-17',
    author: 'Elena Rodriguez',
    wordCount: 2800,
    sections: {
      overview: 'Opening 5-minute sequence for environmental documentary. Establishes the beauty and fragility of endangered ecosystems.',
      visualStyle: 'Macro photography combined with sweeping aerial shots. Vibrant saturated colors transitioning to muted tones.',
      narrative: 'Time-lapse of a single flower blooming and wilting, intercut with ecosystem shots showing the passage of seasons.',
      references: 'Planet Earth II opening, Baraka, Koyaanisqatsi',
      schedule: ''
    }
  },
  {
    id: 'TRT-004',
    title: 'Tech Launch Event 2026',
    project: 'TechCorp Annual Event',
    version: 1.5,
    status: 'DRAFT',
    lastUpdated: '2025-12-20',
    author: 'James Park',
    wordCount: 980,
    sections: {
      overview: 'Live event coverage and promotional content for TechCorp annual product launch.',
      visualStyle: '',
      narrative: 'Building anticipation through behind-the-scenes content leading up to the main reveal.',
      references: '',
      schedule: ''
    }
  },
  {
    id: 'TRT-005',
    title: 'Brand Story - Heritage Collection',
    project: 'Luxury Fashion Campaign',
    version: 2.0,
    status: 'IN_REVIEW',
    lastUpdated: '2025-12-19',
    author: 'Sophie Martin',
    wordCount: 2100,
    sections: {
      overview: 'Long-form brand film celebrating 50 years of craftsmanship. 3-minute hero piece with 15-second cutdowns.',
      visualStyle: 'Elegant, timeless aesthetic with warm film grain. Mix of archival footage and new 4K material.',
      narrative: 'Journey through five decades of design evolution, culminating in the new Heritage Collection.',
      references: 'Hermès brand films, Chanel Inside series',
      schedule: 'Archive research: 2 weeks. Interviews: 1 week. Hero shoot: 3 days. Edit: 4 weeks.'
    }
  },
  {
    id: 'TRT-006',
    title: 'Documentary Intro - Ocean Tales',
    project: 'Ocean Tales Documentary',
    version: 1.2,
    status: 'DRAFT',
    lastUpdated: '2025-12-16',
    author: 'David Thompson',
    wordCount: 1650,
    sections: {
      overview: 'Feature-length documentary exploring marine conservation efforts across three continents.',
      visualStyle: 'Underwater cinematography with natural lighting. Split-screen comparisons of healthy vs. damaged ecosystems.',
      narrative: '',
      references: '',
      schedule: ''
    }
  }
];

const STATUS_CONFIG: Record<TreatmentStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Edit' },
  IN_REVIEW: { label: 'In Review', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Eye' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  REVISION_NEEDED: { label: 'Revision Needed', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'AlertCircle' },
};

const SECTION_LABELS = {
  overview: 'Overview',
  visualStyle: 'Visual Style',
  narrative: 'Narrative',
  references: 'References',
  schedule: 'Schedule',
};

const TEMPLATE_OPTIONS = [
  { label: 'Blank Treatment', value: 'blank' },
  { label: 'Commercial Spot', value: 'commercial' },
  { label: 'Documentary', value: 'documentary' },
  { label: 'Feature Film', value: 'feature' },
  { label: 'Music Video', value: 'musicvideo' },
  { label: 'Brand Film', value: 'brand' },
];

const getTemplateContent = (template: string): Partial<Treatment['sections']> => {
  switch (template) {
    case 'commercial':
      return {
        overview: 'Brief description of the commercial concept, target audience, and key message.',
        visualStyle: 'Describe the visual approach, color palette, and cinematography style.',
        narrative: 'Outline the story arc or sequence of events in the spot.',
        references: 'List visual and tonal references that inspire this project.',
        schedule: 'Prep: X weeks. Shoot: X days. Post: X weeks.',
      };
    case 'documentary':
      return {
        overview: 'Subject matter, theme, and purpose of the documentary.',
        visualStyle: 'Interview style, B-roll approach, archival usage.',
        narrative: 'Story structure and key narrative beats.',
        references: 'Similar documentaries for tone and style reference.',
        schedule: 'Research: X weeks. Interviews: X weeks. Edit: X weeks.',
      };
    case 'feature':
      return {
        overview: 'Logline and synopsis of the feature film.',
        visualStyle: 'Director\'s vision for look and feel.',
        narrative: 'Three-act structure outline.',
        references: 'Films that inform the visual and tonal approach.',
        schedule: 'Development: X months. Pre-pro: X weeks. Shoot: X weeks. Post: X weeks.',
      };
    default:
      return { overview: '', visualStyle: '', narrative: '', references: '', schedule: '' };
  }
};

export default function TreatmentPage() {
  const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments);
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | 'ALL'>('ALL');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    author: '',
    sections: {
      overview: '',
      visualStyle: '',
      narrative: '',
      references: '',
      schedule: '',
    }
  });
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [activeSection, setActiveSection] = useState<keyof Treatment['sections']>('overview');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'md'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const generateId = () => `TRT-${String(treatments.length + 1).padStart(3, '0')}`;
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const calculateWordCount = (sections: Treatment['sections']) => {
    return Object.values(sections).join(' ').split(/\s+/).filter(Boolean).length;
  };

  const handleNewTreatment = () => {
    setFormData({
      title: '',
      project: '',
      author: '',
      sections: { overview: '', visualStyle: '', narrative: '', references: '', schedule: '' }
    });
    setSelectedTemplate('blank');
    setActiveSection('overview');
    setIsCreateModalOpen(true);
  };

  const handleOpenTemplates = () => {
    setIsTemplateModalOpen(true);
  };

  const handleSelectTemplate = (template: string) => {
    const templateContent = getTemplateContent(template);
    setFormData(prev => ({
      ...prev,
      sections: { ...prev.sections, ...templateContent }
    }));
    setSelectedTemplate(template);
    setIsTemplateModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleCreateTreatment = () => {
    const newTreatment: Treatment = {
      id: generateId(),
      title: formData.title || 'Untitled Treatment',
      project: formData.project || 'Untitled Project',
      version: 1.0,
      status: 'DRAFT',
      lastUpdated: getTodayDate(),
      author: formData.author || 'Anonymous',
      wordCount: calculateWordCount(formData.sections),
      sections: formData.sections,
    };
    setTreatments(prev => [newTreatment, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleViewTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setActiveSection('overview');
    setIsViewModalOpen(true);
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setFormData({
      title: treatment.title,
      project: treatment.project,
      author: treatment.author,
      sections: { ...treatment.sections },
    });
    setActiveSection('overview');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedTreatment) return;

    setTreatments(prev => prev.map(t =>
      t.id === selectedTreatment.id
        ? {
            ...t,
            title: formData.title,
            project: formData.project,
            author: formData.author,
            sections: formData.sections,
            wordCount: calculateWordCount(formData.sections),
            version: Math.round((t.version + 0.1) * 10) / 10,
            lastUpdated: getTodayDate(),
          }
        : t
    ));
    setIsEditModalOpen(false);
    setSelectedTreatment(null);
  };

  const handleSubmitReview = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setIsSubmitModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!selectedTreatment) return;

    setTreatments(prev => prev.map(t =>
      t.id === selectedTreatment.id
        ? { ...t, status: 'IN_REVIEW' as TreatmentStatus, lastUpdated: getTodayDate() }
        : t
    ));
    setIsSubmitModalOpen(false);
    setSelectedTreatment(null);
  };

  const handleDuplicate = (treatment: Treatment) => {
    const duplicatedTreatment: Treatment = {
      ...treatment,
      id: generateId(),
      title: `${treatment.title} (Copy)`,
      version: 1.0,
      status: 'DRAFT',
      lastUpdated: getTodayDate(),
    };
    setTreatments(prev => [duplicatedTreatment, ...prev]);
  };

  const handleExportPDF = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setExportFormat('pdf');
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = async () => {
    if (!selectedTreatment) return;

    setIsExporting(true);

    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create downloadable content
    const content = `
# ${selectedTreatment.title}

**Project:** ${selectedTreatment.project}
**Author:** ${selectedTreatment.author}
**Version:** ${selectedTreatment.version}
**Status:** ${STATUS_CONFIG[selectedTreatment.status].label}
**Last Updated:** ${selectedTreatment.lastUpdated}

---

## Overview
${selectedTreatment.sections.overview || 'Not yet completed.'}

## Visual Style
${selectedTreatment.sections.visualStyle || 'Not yet completed.'}

## Narrative
${selectedTreatment.sections.narrative || 'Not yet completed.'}

## References
${selectedTreatment.sections.references || 'Not yet completed.'}

## Schedule
${selectedTreatment.sections.schedule || 'Not yet completed.'}
    `.trim();

    // Download as text file (simulating PDF/DOCX)
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTreatment.title.replace(/\s+/g, '_')}.${exportFormat === 'md' ? 'md' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setIsExportModalOpen(false);
    setSelectedTreatment(null);
  };

  const handleDeleteTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedTreatment) return;
    setTreatments(prev => prev.filter(t => t.id !== selectedTreatment.id));
    setIsDeleteModalOpen(false);
    setSelectedTreatment(null);
  };

  const handleStatusChange = (treatment: Treatment, newStatus: TreatmentStatus) => {
    setTreatments(prev => prev.map(t =>
      t.id === treatment.id
        ? { ...t, status: newStatus, lastUpdated: getTodayDate() }
        : t
    ));
  };

  const filteredTreatments = treatments.filter(
    t => statusFilter === 'ALL' || t.status === statusFilter
  );

  const stats = {
    total: treatments.length,
    draft: treatments.filter(t => t.status === 'DRAFT').length,
    inReview: treatments.filter(t => t.status === 'IN_REVIEW').length,
    approved: treatments.filter(t => t.status === 'APPROVED').length,
  };

  const getSectionCompletion = (sections: Treatment['sections']) => {
    const completed = Object.values(sections).filter(s => s && s.trim().length > 0).length;
    return Math.round((completed / 5) * 100);
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
                <Icons.Film className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Treatments</h1>
                <p className="text-sm text-[var(--text-secondary)]">Creative treatment documents</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleOpenTemplates}>
                <Icons.FileText className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button variant="primary" size="sm" onClick={handleNewTreatment}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Treatment
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
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Treatments</p>
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
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.inReview}</p>
              <p className="text-xs text-[var(--text-tertiary)]">In Review</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.approved}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Approved</p>
            </div>
          </Card>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'DRAFT', 'IN_REVIEW', 'APPROVED', 'REVISION_NEEDED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {status === 'ALL' ? 'All' : STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>

        {/* Treatments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTreatments.map((treatment) => {
            const statusConfig = STATUS_CONFIG[treatment.status];
            const StatusIcon = Icons[statusConfig.icon];
            const completion = getSectionCompletion(treatment.sections);

            return (
              <Card key={treatment.id} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">{treatment.title}</h3>
                    <p className="text-sm text-[var(--text-tertiary)]">{treatment.project}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer"
                      style={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                      }}
                      onClick={() => {
                        const statuses: TreatmentStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REVISION_NEEDED'];
                        const currentIndex = statuses.indexOf(treatment.status);
                        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                        handleStatusChange(treatment, nextStatus);
                      }}
                      title="Click to change status"
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                    <button
                      onClick={() => handleDeleteTreatment(treatment)}
                      className="p-1 text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
                      title="Delete treatment"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Completion Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[var(--text-tertiary)]">Completion</span>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">{completion}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-3)] rounded-full">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>

                {/* Section Indicators */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Object.entries(treatment.sections) as [keyof typeof SECTION_LABELS, string][]).map(([key, content]) => (
                    <span
                      key={key}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        content && content.trim().length > 0
                          ? 'bg-[var(--success-muted)] text-[var(--success)]'
                          : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'
                      }`}
                    >
                      {SECTION_LABELS[key]}
                    </span>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <span>v{treatment.version}</span>
                    <span>·</span>
                    <span>{treatment.wordCount.toLocaleString()} words</span>
                    <span>·</span>
                    <span>{treatment.author}</span>
                  </div>
                  <span>{treatment.lastUpdated}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleViewTreatment(treatment)}>
                      <Icons.Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    <Button variant="primary" size="sm" className="flex-1" onClick={() => handleEditTreatment(treatment)}>
                      <Icons.Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSubmitReview(treatment)}
                      disabled={treatment.status === 'IN_REVIEW' || treatment.status === 'APPROVED'}
                    >
                      <Icons.Send className="w-3.5 h-3.5 mr-1" />
                      Submit
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleDuplicate(treatment)}>
                      <Icons.Copy className="w-3.5 h-3.5 mr-1" />
                      Duplicate
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleExportPDF(treatment)}>
                      <Icons.Download className="w-3.5 h-3.5 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTreatments.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Film className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No treatments found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create a treatment to outline your creative vision.
            </p>
            <Button variant="primary" size="sm" onClick={handleNewTreatment}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              New Treatment
            </Button>
          </Card>
        )}
      </div>

      {/* Template Selection Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Choose a Template"
        description="Start with a pre-built structure or create from scratch"
        size="md"
      >
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATE_OPTIONS.map(template => (
            <button
              key={template.value}
              onClick={() => handleSelectTemplate(template.value)}
              className="p-4 border border-[var(--border-default)] rounded-lg text-left hover:border-[var(--primary)] hover:bg-[var(--bg-2)] transition-colors"
            >
              <Icons.FileText className="w-6 h-6 text-[var(--text-tertiary)] mb-2" />
              <p className="font-medium text-[var(--text-primary)]">{template.label}</p>
            </button>
          ))}
        </div>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Treatment' : 'New Treatment'}
        size="full"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={isEditModalOpen ? handleSaveEdit : handleCreateTreatment}>
              {isEditModalOpen ? 'Save Changes' : 'Create Treatment'}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Treatment Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter treatment title"
            />
            <Input
              label="Project Name"
              value={formData.project}
              onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
              placeholder="Enter project name"
            />
            <Input
              label="Author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Enter author name"
            />
          </div>

          {/* Section Tabs */}
          <div className="border-b border-[var(--border-default)]">
            <div className="flex gap-1">
              {(Object.keys(SECTION_LABELS) as Array<keyof typeof SECTION_LABELS>).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeSection === key
                      ? 'border-[var(--primary)] text-[var(--primary)]'
                      : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {SECTION_LABELS[key]}
                  {formData.sections[key] && formData.sections[key].trim().length > 0 && (
                    <Icons.Check className="w-3 h-3 inline ml-1 text-[var(--success)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section Content */}
          <Textarea
            label={SECTION_LABELS[activeSection]}
            value={formData.sections[activeSection]}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              sections: { ...prev.sections, [activeSection]: e.target.value }
            }))}
            placeholder={`Enter ${SECTION_LABELS[activeSection].toLowerCase()} content...`}
            rows={10}
          />

          {/* Word Count */}
          <div className="text-sm text-[var(--text-tertiary)]">
            Total word count: {calculateWordCount(formData.sections).toLocaleString()}
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTreatment(null);
        }}
        title={selectedTreatment?.title || 'Treatment'}
        description={selectedTreatment?.project}
        size="full"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsViewModalOpen(false);
              if (selectedTreatment) handleEditTreatment(selectedTreatment);
            }}>
              <Icons.Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="primary" onClick={() => {
              setIsViewModalOpen(false);
              setSelectedTreatment(null);
            }}>
              Close
            </Button>
          </>
        }
      >
        {selectedTreatment && (
          <div className="space-y-6">
            {/* Meta info */}
            <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
              <span>v{selectedTreatment.version}</span>
              <span>·</span>
              <span>{selectedTreatment.author}</span>
              <span>·</span>
              <span>{selectedTreatment.wordCount.toLocaleString()} words</span>
              <span>·</span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: STATUS_CONFIG[selectedTreatment.status].bgColor,
                  color: STATUS_CONFIG[selectedTreatment.status].color,
                }}
              >
                {STATUS_CONFIG[selectedTreatment.status].label}
              </span>
            </div>

            {/* Section Tabs */}
            <div className="border-b border-[var(--border-default)]">
              <div className="flex gap-1">
                {(Object.keys(SECTION_LABELS) as Array<keyof typeof SECTION_LABELS>).map(key => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeSection === key
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {SECTION_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Content */}
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                {SECTION_LABELS[activeSection]}
              </h3>
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
                {selectedTreatment.sections[activeSection] ||
                  <span className="italic text-[var(--text-tertiary)]">This section has not been completed yet.</span>
                }
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Submit for Review Modal */}
      <ConfirmModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setSelectedTreatment(null);
        }}
        onConfirm={handleConfirmSubmit}
        title="Submit for Review"
        message={`Are you sure you want to submit "${selectedTreatment?.title}" for review? The treatment will be marked as "In Review" and stakeholders will be notified.`}
        confirmText="Submit for Review"
      />

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setSelectedTreatment(null);
        }}
        title="Export Treatment"
        description={`Export "${selectedTreatment?.title}"`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmExport} loading={isExporting}>
              {isExporting ? 'Exporting...' : 'Download'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Choose the export format for your treatment document.
          </p>
          <div className="space-y-2">
            {[
              { value: 'pdf', label: 'PDF Document', icon: 'FileText' },
              { value: 'docx', label: 'Word Document', icon: 'File' },
              { value: 'md', label: 'Markdown', icon: 'Code' },
            ].map(format => (
              <button
                key={format.value}
                onClick={() => setExportFormat(format.value as 'pdf' | 'docx' | 'md')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  exportFormat === format.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border-default)] hover:border-[var(--border-hover)]'
                }`}
              >
                <Icons.FileText className="w-5 h-5 text-[var(--text-tertiary)]" />
                <span className="text-[var(--text-primary)]">{format.label}</span>
                {exportFormat === format.value && (
                  <Icons.Check className="w-4 h-4 text-[var(--primary)] ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTreatment(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Treatment"
        message={`Are you sure you want to delete "${selectedTreatment?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
