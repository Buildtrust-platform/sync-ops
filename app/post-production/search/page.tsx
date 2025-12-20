'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button, StatusBadge } from '../../components/ui';

/**
 * TRANSCRIPT SEARCH
 *
 * Search across all video transcripts to find specific content.
 * Powered by AWS Transcribe results with timestamp navigation.
 */

interface SearchResult {
  id: string;
  assetId: string;
  assetName: string;
  projectName: string;
  text: string;
  timecode: number;
  duration: string;
  confidence: number;
  speaker?: string;
  thumbnail?: string;
}

interface RecentSearch {
  query: string;
  timestamp: string;
  resultCount: number;
}

// Data will be fetched from API
const initialResults: SearchResult[] = [];
const initialRecentSearches: RecentSearch[] = [];

// Format timecode as HH:MM:SS
function formatTimecode(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterSpeaker, setFilterSpeaker] = useState<string>('ALL');

  // Get unique projects and speakers from results
  const projects = [...new Set(results.map(r => r.projectName))];
  const speakers = [...new Set(results.map(r => r.speaker).filter(Boolean))];

  // Filter results
  const filteredResults = results.filter(result => {
    if (filterProject !== 'ALL' && result.projectName !== filterProject) return false;
    if (filterSpeaker !== 'ALL' && result.speaker !== filterSpeaker) return false;
    return true;
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate search delay
    setTimeout(() => {
      // Filter results based on query (results would come from API)
      const query = searchQuery.toLowerCase();
      const matchedResults = initialResults.filter(r =>
        r.text.toLowerCase().includes(query) ||
        r.assetName.toLowerCase().includes(query) ||
        r.projectName.toLowerCase().includes(query)
      );
      setResults(matchedResults);
      setIsSearching(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-[var(--warning)] text-black px-0.5 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  const handleJumpTo = (assetId: string, timecode: number) => {
    router.push(`/assets/${assetId}/review?t=${timecode}`);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent)]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 py-6 relative">
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
              <Icons.Search className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Transcript Search</h1>
              <p className="text-sm text-[var(--text-secondary)]">Search across all video transcripts and footage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Search Box */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search transcripts, dialogue, spoken content..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--bg-0)] border border-[var(--border-default)] text-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] outline-none transition-all"
                autoFocus
              />
            </div>
            <Button variant="primary" size="lg" onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Icons.Loader className="w-5 h-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Icons.Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
            <span>Search tips:</span>
            <span className="px-2 py-1 bg-[var(--bg-1)] rounded">Use quotes for exact phrases</span>
            <span className="px-2 py-1 bg-[var(--bg-1)] rounded">speaker:name to filter by speaker</span>
            <span className="px-2 py-1 bg-[var(--bg-1)] rounded">project:name to filter by project</span>
          </div>
        </Card>

        {/* Results or Recent Searches */}
        {!hasSearched ? (
          /* Recent Searches */
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Searches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialRecentSearches.map((search, index) => (
                <Card
                  key={index}
                  className="p-4 card-cinema cursor-pointer hover:bg-[var(--bg-1)] transition-colors"
                  onClick={() => {
                    setSearchQuery(search.query);
                    handleSearch();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icons.Clock className="w-5 h-5 text-[var(--text-tertiary)]" />
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{search.query}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{search.timestamp}</p>
                      </div>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">{search.resultCount} results</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Access */}
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-8 mb-4">Browse by Project</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Corporate Profile', 'Documentary Series', 'Product Launch', 'Behind The Scenes'].map((project) => (
                <Card
                  key={project}
                  className="p-4 card-cinema cursor-pointer hover:bg-[var(--bg-1)] transition-colors text-center"
                  onClick={() => {
                    setSearchQuery(`project:${project}`);
                  }}
                >
                  <Icons.Folder className="w-8 h-8 text-[var(--primary)] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[var(--text-primary)]">{project}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Search Results */
          <div>
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </h2>
                {results.length !== filteredResults.length && (
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Showing {filteredResults.length} of {results.length} total
                  </p>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                {projects.length > 1 && (
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]"
                  >
                    <option value="ALL">All Projects</option>
                    {projects.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                )}
                {speakers.length > 1 && (
                  <select
                    value={filterSpeaker}
                    onChange={(e) => setFilterSpeaker(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]"
                  >
                    <option value="ALL">All Speakers</option>
                    {speakers.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Results list */}
            {isSearching ? (
              <Card className="p-12 text-center">
                <Icons.Loader className="w-12 h-12 text-[var(--primary)] mx-auto mb-4 animate-spin" />
                <p className="text-[var(--text-secondary)]">Searching transcripts...</p>
              </Card>
            ) : filteredResults.length === 0 ? (
              <Card className="p-12 text-center">
                <Icons.Search className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No results found</h3>
                <p className="text-[var(--text-tertiary)] mb-4">
                  Try different keywords or check your spelling
                </p>
                <Button variant="secondary" onClick={() => {
                  setSearchQuery('');
                  setHasSearched(false);
                  setResults([]);
                }}>
                  Clear Search
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <Card key={result.id} className="p-4 card-cinema hover:bg-[var(--bg-1)] transition-colors">
                    <div className="flex gap-4">
                      {/* Thumbnail placeholder */}
                      <div className="w-32 h-20 bg-[var(--bg-2)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.Film className="w-8 h-8 text-[var(--text-tertiary)]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/assets/${result.assetId}/review?t=${result.timecode}`}
                            className="font-medium text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
                          >
                            {result.assetName}
                          </Link>
                          <span className="text-xs text-[var(--text-tertiary)]">•</span>
                          <span className="text-xs text-[var(--text-tertiary)]">{result.projectName}</span>
                        </div>

                        <p className="text-[var(--text-secondary)] mb-2">
                          {highlightText(result.text, searchQuery)}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                          <span className="flex items-center gap-1 font-mono px-2 py-0.5 bg-[var(--bg-2)] rounded text-[var(--primary)]">
                            <Icons.Clock className="w-3 h-3" />
                            {formatTimecode(result.timecode)}
                          </span>
                          {result.speaker && (
                            <span className="flex items-center gap-1">
                              <Icons.User className="w-3 h-3" />
                              {result.speaker}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Icons.FileText className="w-3 h-3" />
                            {result.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            {result.confidence >= 0.95 ? (
                              <Icons.CheckCircle className="w-3 h-3 text-[var(--success)]" />
                            ) : result.confidence >= 0.85 ? (
                              <Icons.AlertCircle className="w-3 h-3 text-[var(--warning)]" />
                            ) : (
                              <Icons.AlertTriangle className="w-3 h-3 text-[var(--danger)]" />
                            )}
                            {Math.round(result.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleJumpTo(result.assetId, result.timecode)}
                        >
                          <Icons.Play className="w-4 h-4 mr-1" />
                          Jump to
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          title="Copy text"
                          onClick={() => handleCopyText(result.text)}
                        >
                          <Icons.Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Clear search */}
            {filteredResults.length > 0 && (
              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setHasSearched(false);
                    setResults([]);
                    setFilterProject('ALL');
                    setFilterSpeaker('ALL');
                  }}
                >
                  <Icons.X className="w-4 h-4 mr-2" />
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
