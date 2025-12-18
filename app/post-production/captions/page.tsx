'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, StatusBadge, Progress, Button } from '../../components/ui';

/**
 * CAPTIONS CENTER
 *
 * Professional caption and subtitle management with multi-language support,
 * format conversion, and AI-assisted translation. Handles SRT, VTT, TTML, SCC formats.
 */

type CaptionStatus = 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'EXPORTED';
type CaptionFormat = 'SRT' | 'VTT' | 'TTML' | 'SCC' | 'DFXP';
type CaptionLanguage = 'en-US' | 'en-GB' | 'es-ES' | 'es-MX' | 'fr-FR' | 'de-DE' | 'ja-JP' | 'zh-CN' | 'pt-BR' | 'ko-KR';

interface CaptionFile {
  id: string;
  assetId: string;
  assetName: string;
  projectName: string;
  language: CaptionLanguage;
  format: CaptionFormat;
  status: CaptionStatus;
  cueCount: number;
  duration: string;
  wordCount: number;
  characterCount: number;
  editedBy?: string;
  lastModified: string;
  createdAt: string;
  isTranslation: boolean;
  sourceLanguage?: CaptionLanguage;
  progress: number;
}

interface CaptionCue {
  id: string;
  index: number;
  startTime: string;
  endTime: string;
  text: string;
  speaker?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  style?: 'italic' | 'bold' | 'normal';
}

interface TranslationJob {
  id: string;
  assetName: string;
  sourceLanguage: CaptionLanguage;
  targetLanguage: CaptionLanguage;
  status: 'QUEUED' | 'TRANSLATING' | 'REVIEW' | 'COMPLETED';
  progress: number;
  wordCount: number;
  startedAt: string;
  estimatedCompletion?: string;
}

// Language display names
const LANGUAGE_NAMES: Record<CaptionLanguage, string> = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'es-ES': 'Spanish (Spain)',
  'es-MX': 'Spanish (Mexico)',
  'fr-FR': 'French',
  'de-DE': 'German',
  'ja-JP': 'Japanese',
  'zh-CN': 'Chinese (Simplified)',
  'pt-BR': 'Portuguese (Brazil)',
  'ko-KR': 'Korean',
};

// Language flags (emoji)
const LANGUAGE_FLAGS: Record<CaptionLanguage, string> = {
  'en-US': '🇺🇸',
  'en-GB': '🇬🇧',
  'es-ES': '🇪🇸',
  'es-MX': '🇲🇽',
  'fr-FR': '🇫🇷',
  'de-DE': '🇩🇪',
  'ja-JP': '🇯🇵',
  'zh-CN': '🇨🇳',
  'pt-BR': '🇧🇷',
  'ko-KR': '🇰🇷',
};

// Data will be fetched from API
const initialCaptions: CaptionFile[] = [];
const initialTranslationJobs: TranslationJob[] = [];
const initialCues: CaptionCue[] = [];

const STATUS_STYLES: Record<CaptionStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'var(--bg-3)', text: 'var(--text-tertiary)', label: 'Draft' },
  IN_PROGRESS: { bg: 'var(--primary-muted)', text: 'var(--primary)', label: 'In Progress' },
  REVIEW: { bg: 'var(--warning-muted)', text: 'var(--warning)', label: 'In Review' },
  APPROVED: { bg: 'var(--success-muted)', text: 'var(--success)', label: 'Approved' },
  EXPORTED: { bg: 'var(--accent-muted)', text: 'var(--accent)', label: 'Exported' },
};

const FORMAT_COLORS: Record<CaptionFormat, string> = {
  SRT: 'var(--primary)',
  VTT: 'var(--success)',
  TTML: 'var(--warning)',
  SCC: 'var(--accent)',
  DFXP: 'var(--danger)',
};

export default function CaptionsPage() {
  const router = useRouter();
  const [captions, setCaptions] = useState<CaptionFile[]>(initialCaptions);
  const [translationJobs, setTranslationJobs] = useState<TranslationJob[]>(initialTranslationJobs);
  const [activeTab, setActiveTab] = useState<'all' | 'translations' | 'editor'>('all');
  const [selectedCaption, setSelectedCaption] = useState<CaptionFile | null>(null);
  const [filterStatus, setFilterStatus] = useState<CaptionStatus | 'ALL'>('ALL');
  const [filterLanguage, setFilterLanguage] = useState<CaptionLanguage | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const stats = {
    totalCaptions: captions.length,
    approvedCaptions: captions.filter(c => c.status === 'APPROVED' || c.status === 'EXPORTED').length,
    inReview: captions.filter(c => c.status === 'REVIEW').length,
    inProgress: captions.filter(c => c.status === 'IN_PROGRESS' || c.status === 'DRAFT').length,
    totalCues: captions.reduce((sum, c) => sum + c.cueCount, 0),
    totalWords: captions.reduce((sum, c) => sum + c.wordCount, 0),
    languages: [...new Set(captions.map(c => c.language))].length,
    translations: captions.filter(c => c.isTranslation).length,
    activeJobs: translationJobs.filter(j => j.status === 'TRANSLATING' || j.status === 'QUEUED').length,
  };

  // Filter captions
  const filteredCaptions = captions.filter(caption => {
    if (filterStatus !== 'ALL' && caption.status !== filterStatus) return false;
    if (filterLanguage !== 'ALL' && caption.language !== filterLanguage) return false;
    if (searchQuery && !caption.assetName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !caption.projectName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group captions by asset for better organization
  const captionsByAsset = filteredCaptions.reduce((acc, caption) => {
    if (!acc[caption.assetId]) {
      acc[caption.assetId] = [];
    }
    acc[caption.assetId].push(caption);
    return acc;
  }, {} as Record<string, CaptionFile[]>);

  const tabs = [
    { id: 'all', label: 'All Captions', icon: 'Subtitles', count: captions.length },
    { id: 'translations', label: 'Translation Queue', icon: 'Globe', count: translationJobs.length },
    { id: 'editor', label: 'Caption Editor', icon: 'Edit', count: selectedCaption ? 1 : 0 },
  ] as const;

  const handleOpenEditor = (caption: CaptionFile) => {
    setSelectedCaption(caption);
    setActiveTab('editor');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)]/5 to-transparent pointer-events-none" />
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
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                <Icons.Subtitles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Captions Center</h1>
                <p className="text-sm text-[var(--text-secondary)]">Multi-language captions, subtitles, and translations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => alert('Exporting all captions...')}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('translations')}>
                <Icons.Globe className="w-4 h-4 mr-2" />
                Translate
              </Button>
              <Button variant="primary" size="sm" onClick={() => alert('Opening caption import dialog...')}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Import Captions
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-4 mb-6">
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalCaptions}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Files</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.approvedCaptions}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Approved</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.inReview}</p>
              <p className="text-xs text-[var(--text-tertiary)]">In Review</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.inProgress}</p>
              <p className="text-xs text-[var(--text-tertiary)]">In Progress</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalCues.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Cues</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{(stats.totalWords / 1000).toFixed(1)}k</p>
              <p className="text-xs text-[var(--text-tertiary)]">Words</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">{stats.languages}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Languages</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.translations}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Translations</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.activeJobs}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Active Jobs</p>
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

        {/* All Captions Tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search captions..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as CaptionStatus | 'ALL')}
                    className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">In Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="EXPORTED">Exported</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">Language:</span>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value as CaptionLanguage | 'ALL')}
                    className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                  >
                    <option value="ALL">All Languages</option>
                    {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Captions Table */}
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Asset</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Language</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Format</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Cues</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Progress</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Modified</th>
                    <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredCaptions.map((caption) => (
                    <tr key={caption.id} className="hover:bg-[var(--bg-1)] transition-colors group">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                            {caption.assetName}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {caption.projectName} • {caption.duration}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{LANGUAGE_FLAGS[caption.language]}</span>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {LANGUAGE_NAMES[caption.language]}
                          </span>
                          {caption.isTranslation && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[var(--primary-muted)] text-[var(--primary)]">
                              TRANSLATED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-[11px] font-mono font-bold"
                          style={{ backgroundColor: `color-mix(in srgb, ${FORMAT_COLORS[caption.format]} 15%, transparent)`, color: FORMAT_COLORS[caption.format] }}
                        >
                          {caption.format}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[var(--text-secondary)]">{caption.cueCount}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${caption.progress}%`,
                                background: caption.progress === 100 ? 'var(--success)' :
                                           caption.progress >= 50 ? 'var(--primary)' : 'var(--warning)'
                              }}
                            />
                          </div>
                          <span className="text-xs text-[var(--text-tertiary)]">{caption.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-[11px] font-medium"
                          style={{ background: STATUS_STYLES[caption.status].bg, color: STATUS_STYLES[caption.status].text }}
                        >
                          {STATUS_STYLES[caption.status].label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-tertiary)]">
                        {caption.lastModified}
                        {caption.editedBy && (
                          <span className="block text-[var(--text-secondary)]">by {caption.editedBy}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                            title="Edit Captions"
                            onClick={() => handleOpenEditor(caption)}
                          >
                            <Icons.Edit className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="Preview">
                            <Icons.Play className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="Translate">
                            <Icons.Globe className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="Download">
                            <Icons.Download className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Translations Tab */}
        {activeTab === 'translations' && (
          <div className="space-y-6">
            {/* Active Translation Jobs */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                <Icons.Loader className="w-4 h-4 animate-spin" />
                Active Translations
              </h3>
              <div className="grid gap-4">
                {translationJobs.filter(j => j.status !== 'COMPLETED').map((job) => (
                  <Card key={job.id} className="p-4 card-cinema">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                        <Icons.Globe className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)]">{job.assetName}</p>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                          <span>{LANGUAGE_FLAGS[job.sourceLanguage]} {LANGUAGE_NAMES[job.sourceLanguage]}</span>
                          <Icons.ArrowRight className="w-3 h-3" />
                          <span>{LANGUAGE_FLAGS[job.targetLanguage]} {LANGUAGE_NAMES[job.targetLanguage]}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[var(--text-secondary)]">{job.wordCount.toLocaleString()} words</p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {job.status === 'QUEUED' ? 'Queued' : `ETA: ${job.estimatedCompletion}`}
                        </p>
                      </div>
                      <div className="w-32">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`
                            px-2 py-0.5 rounded text-[10px] font-medium
                            ${job.status === 'TRANSLATING' ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'}
                          `}>
                            {job.status}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${job.progress}%`, background: 'var(--primary)' }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Completed Translations */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                <Icons.Check className="w-4 h-4 text-[var(--success)]" />
                Recently Completed
              </h3>
              <div className="grid gap-4">
                {translationJobs.filter(j => j.status === 'COMPLETED').map((job) => (
                  <Card key={job.id} className="p-4 card-cinema opacity-75">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                        <Icons.Check className="w-6 h-6 text-[var(--success)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)]">{job.assetName}</p>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                          <span>{LANGUAGE_FLAGS[job.sourceLanguage]} {LANGUAGE_NAMES[job.sourceLanguage]}</span>
                          <Icons.ArrowRight className="w-3 h-3" />
                          <span>{LANGUAGE_FLAGS[job.targetLanguage]} {LANGUAGE_NAMES[job.targetLanguage]}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm">
                          <Icons.Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Icons.Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Start New Translation */}
            <Card className="p-6 border-2 border-dashed border-[var(--border-default)] bg-transparent">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-2)] flex items-center justify-center mx-auto mb-4">
                  <Icons.Plus className="w-8 h-8 text-[var(--text-tertiary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Start New Translation</h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  Translate captions to over 50 languages using AI-powered translation
                </p>
                <Button variant="primary">
                  <Icons.Globe className="w-4 h-4 mr-2" />
                  New Translation Job
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Caption Editor Tab */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {selectedCaption ? (
              <>
                {/* Editor Header */}
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                        <Icons.Film className="w-5 h-5 text-[var(--text-tertiary)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{selectedCaption.assetName}</p>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                          <span>{LANGUAGE_FLAGS[selectedCaption.language]} {LANGUAGE_NAMES[selectedCaption.language]}</span>
                          <span>•</span>
                          <span>{selectedCaption.format}</span>
                          <span>•</span>
                          <span>{selectedCaption.cueCount} cues</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-1 rounded text-[11px] font-medium"
                        style={{ background: STATUS_STYLES[selectedCaption.status].bg, color: STATUS_STYLES[selectedCaption.status].text }}
                      >
                        {STATUS_STYLES[selectedCaption.status].label}
                      </span>
                      <Button variant="secondary" size="sm">
                        <Icons.Play className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="primary" size="sm">
                        <Icons.Check className="w-4 h-4 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Editor Layout */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Video Preview */}
                  <Card className="col-span-2 overflow-hidden">
                    <div className="aspect-video bg-[var(--bg-2)] relative flex items-center justify-center">
                      <Icons.Film className="w-16 h-16 text-[var(--text-tertiary)]" />
                      {/* Caption overlay area */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-center text-lg font-medium">
                          Welcome to our annual corporate profile.
                        </p>
                      </div>
                    </div>
                    {/* Timeline */}
                    <div className="p-4 border-t border-[var(--border-default)]">
                      <div className="h-12 bg-[var(--bg-2)] rounded-lg relative">
                        {/* Timeline markers */}
                        <div className="absolute inset-0 flex items-center">
                          {initialCues.map((cue, i) => (
                            <div
                              key={cue.id}
                              className="absolute h-6 bg-[var(--primary)] rounded cursor-pointer hover:bg-[var(--primary-hover)] transition-colors"
                              style={{
                                left: `${(i / mockCues.length) * 90}%`,
                                width: '8%',
                                opacity: 0.8
                              }}
                              title={cue.text}
                            />
                          ))}
                        </div>
                        {/* Playhead */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-[var(--warning)]" style={{ left: '15%' }} />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-[var(--text-tertiary)]">
                        <span>00:00:00,000</span>
                        <span>00:45:30,000</span>
                      </div>
                    </div>
                  </Card>

                  {/* Cue List */}
                  <Card className="overflow-hidden">
                    <div className="p-3 border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Caption Cues</h3>
                        <button className="p-1.5 hover:bg-[var(--bg-2)] rounded transition-colors">
                          <Icons.Plus className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto divide-y divide-[var(--border-subtle)]">
                      {initialCues.map((cue, index) => (
                        <div
                          key={cue.id}
                          className={`p-3 hover:bg-[var(--bg-1)] cursor-pointer transition-colors ${index === 0 ? 'bg-[var(--primary-muted)]' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                              #{cue.index}
                            </span>
                            {cue.speaker && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-2)] text-[var(--text-secondary)]">
                                {cue.speaker}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--text-primary)] mb-2 line-clamp-2">
                            {cue.text}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-tertiary)]">
                            <span>{cue.startTime}</span>
                            <Icons.ArrowRight className="w-3 h-3" />
                            <span>{cue.endTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Editor Toolbar */}
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm">
                        <Icons.ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Icons.ChevronDown className="w-4 h-4" />
                      </Button>
                      <div className="w-px h-6 bg-[var(--border-default)] mx-2" />
                      <Button variant="secondary" size="sm">Split Cue</Button>
                      <Button variant="secondary" size="sm">Merge Cues</Button>
                      <div className="w-px h-6 bg-[var(--border-default)] mx-2" />
                      <Button variant="secondary" size="sm">
                        <Icons.Clock className="w-4 h-4 mr-1" />
                        Sync Timing
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm">
                        <Icons.Undo className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Icons.Redo className="w-4 h-4" />
                      </Button>
                      <div className="w-px h-6 bg-[var(--border-default)] mx-2" />
                      <select className="px-3 py-1.5 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none">
                        <option value="SRT">Export as SRT</option>
                        <option value="VTT">Export as VTT</option>
                        <option value="TTML">Export as TTML</option>
                        <option value="SCC">Export as SCC</option>
                      </select>
                      <Button variant="primary" size="sm">
                        <Icons.Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center">
                <Icons.Edit className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Caption Selected</h3>
                <p className="text-[var(--text-tertiary)] mb-4">
                  Select a caption file from the list to open the editor
                </p>
                <Button variant="secondary" onClick={() => setActiveTab('all')}>
                  Browse Captions
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
