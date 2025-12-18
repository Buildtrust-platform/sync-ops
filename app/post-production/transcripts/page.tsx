'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Icons, Card, StatusBadge, Progress, Button } from '../../components/ui';

/**
 * MEDIA INTELLIGENCE
 *
 * AI-powered transcript search, caption management, and content analysis.
 * Features speech-to-text results, searchable transcripts, and caption editing.
 */

type TranscriptStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
type CaptionStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'EXPORTED';

interface TranscriptItem {
  id: string;
  assetId: string;
  assetName: string;
  projectName: string;
  status: TranscriptStatus;
  language: string;
  duration: string;
  wordCount: number;
  confidence: number;
  speakerCount: number;
  createdAt: string;
  completedAt?: string;
}

interface CaptionFile {
  id: string;
  assetId: string;
  assetName: string;
  language: string;
  format: 'SRT' | 'VTT' | 'TTML' | 'SCC';
  status: CaptionStatus;
  wordCount: number;
  editedBy?: string;
  lastModified: string;
}

interface SearchResult {
  id: string;
  assetId: string;
  assetName: string;
  timecode: string;
  text: string;
  speaker?: string;
  confidence: number;
}

// Data will be fetched from API
const initialTranscripts: TranscriptItem[] = [];
const initialCaptions: CaptionFile[] = [];
const initialSearchResults: SearchResult[] = [];

const STATUS_COLORS: Record<TranscriptStatus, string> = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const CAPTION_STATUS_COLORS: Record<CaptionStatus, { bg: string; text: string }> = {
  DRAFT: { bg: 'var(--bg-3)', text: 'var(--text-tertiary)' },
  REVIEW: { bg: 'var(--warning-muted)', text: 'var(--warning)' },
  APPROVED: { bg: 'var(--success-muted)', text: 'var(--success)' },
  EXPORTED: { bg: 'var(--primary-muted)', text: 'var(--primary)' },
};

export default function TranscriptsPage() {
  const router = useRouter();
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>(initialTranscripts);
  const [captions, setCaptions] = useState<CaptionFile[]>(initialCaptions);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcripts' | 'captions' | 'search'>('transcripts');

  // Calculate stats
  const stats = {
    totalTranscripts: transcripts.length,
    completedTranscripts: transcripts.filter(t => t.status === 'COMPLETED').length,
    processingTranscripts: transcripts.filter(t => t.status === 'PROCESSING').length,
    totalWords: transcripts.reduce((sum, t) => sum + t.wordCount, 0),
    totalCaptions: captions.length,
    approvedCaptions: captions.filter(c => c.status === 'APPROVED' || c.status === 'EXPORTED').length,
    avgConfidence: transcripts.filter(t => t.confidence > 0).length > 0
      ? Math.round(transcripts.filter(t => t.confidence > 0).reduce((sum, t) => sum + t.confidence, 0) / transcripts.filter(t => t.confidence > 0).length)
      : 0,
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setSearchResults(initialSearchResults.filter(r =>
        r.text.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      setIsSearching(false);
      setActiveTab('search');
    }, 500);
  };

  const tabs = [
    { id: 'transcripts', label: 'Transcripts', icon: 'FileText', count: transcripts.length },
    { id: 'captions', label: 'Captions', icon: 'Subtitles', count: captions.length },
    { id: 'search', label: 'Search Results', icon: 'Search', count: searchResults.length },
  ] as const;

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
                <Icons.Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Media Intelligence</h1>
                <p className="text-sm text-[var(--text-secondary)]">AI transcription, captions, and content search</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => alert('Exporting all transcripts...')}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push('/assets')}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Transcript
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Search Bar */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search across all transcripts... (e.g., 'innovation', 'product launch')"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] outline-none transition-all"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? (
                <Icons.Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Icons.Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Search through {stats.totalWords.toLocaleString()} words across {stats.completedTranscripts} transcripts
          </p>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalTranscripts}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Transcripts</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.completedTranscripts}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Completed</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.processingTranscripts}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Processing</p>
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
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.totalCaptions}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Captions</p>
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
              <p className="text-2xl font-bold text-[var(--accent)]">{stats.avgConfidence}%</p>
              <p className="text-xs text-[var(--text-tertiary)]">Avg Confidence</p>
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
        {activeTab === 'transcripts' && (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Asset</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Duration</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Words</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Speakers</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Confidence</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {transcripts.map((transcript) => (
                  <tr key={transcript.id} className="hover:bg-[var(--bg-1)] transition-colors group">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                          {transcript.assetName}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">{transcript.projectName}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {transcript.duration}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {transcript.wordCount > 0 ? transcript.wordCount.toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {transcript.speakerCount > 0 ? transcript.speakerCount : '-'}
                    </td>
                    <td className="p-4">
                      {transcript.confidence > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${transcript.confidence}%`,
                                background: transcript.confidence >= 90 ? 'var(--success)' :
                                           transcript.confidence >= 80 ? 'var(--warning)' : 'var(--danger)'
                              }}
                            />
                          </div>
                          <span className="text-xs text-[var(--text-secondary)]">{transcript.confidence}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-tertiary)]">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={STATUS_COLORS[transcript.status] as any} size="sm" />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="View Transcript">
                          <Icons.FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </button>
                        <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="Edit">
                          <Icons.Edit className="w-4 h-4 text-[var(--text-tertiary)]" />
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
        )}

        {activeTab === 'captions' && (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Asset</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Language</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Format</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Words</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Last Modified</th>
                    <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {captions.map((caption) => (
                    <tr key={caption.id} className="hover:bg-[var(--bg-1)] transition-colors group">
                      <td className="p-4">
                        <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                          {caption.assetName}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-[11px] font-medium bg-[var(--bg-2)] text-[var(--text-secondary)]">
                          {caption.language}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-[11px] font-mono font-medium bg-[var(--bg-2)] text-[var(--text-secondary)]">
                          {caption.format}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {caption.wordCount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-[11px] font-medium"
                          style={{ background: CAPTION_STATUS_COLORS[caption.status].bg, color: CAPTION_STATUS_COLORS[caption.status].text }}
                        >
                          {caption.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-tertiary)]">
                        {caption.lastModified}
                        {caption.editedBy && (
                          <span className="text-[var(--text-secondary)]"> by {caption.editedBy}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="Edit Captions">
                            <Icons.Edit className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="Download">
                            <Icons.Download className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="More">
                            <Icons.MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
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

        {activeTab === 'search' && (
          <div className="space-y-4">
            {searchResults.length === 0 ? (
              <Card className="p-12 text-center">
                <Icons.Search className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No search results</h3>
                <p className="text-[var(--text-tertiary)]">
                  Enter a search term and press Enter or click Search to find content across all transcripts.
                </p>
              </Card>
            ) : (
              <>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Found {searchResults.length} results for "{searchQuery}"
                </p>
                {searchResults.map((result) => (
                  <Card key={result.id} className="p-4 card-cinema hover:bg-[var(--bg-1)] transition-colors group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-12 rounded bg-[var(--bg-2)] flex items-center justify-center flex-shrink-0">
                        <Icons.Film className="w-5 h-5 text-[var(--text-tertiary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm px-2 py-0.5 rounded bg-[var(--primary-muted)] text-[var(--primary)]">
                            {result.timecode}
                          </span>
                          {result.speaker && (
                            <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-2)] text-[var(--text-secondary)]">
                              {result.speaker}
                            </span>
                          )}
                          <span className="text-xs text-[var(--text-tertiary)]">{result.confidence}% confidence</span>
                        </div>
                        <p className="text-[var(--text-primary)] mb-1">
                          {result.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                            part.toLowerCase() === searchQuery.toLowerCase() ? (
                              <mark key={i} className="bg-[var(--warning-muted)] text-[var(--warning)] px-0.5 rounded">
                                {part}
                              </mark>
                            ) : (
                              part
                            )
                          )}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">{result.assetName}</p>
                      </div>
                      <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Icons.Play className="w-5 h-5 text-[var(--primary)]" />
                      </button>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
