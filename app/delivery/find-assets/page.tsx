'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * FIND ASSETS PAGE
 * Search and discover assets from archived projects.
 */

type AssetType = 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT' | 'PROJECT';

interface SearchResult {
  id: string;
  name: string;
  type: AssetType;
  projectName: string;
  projectId: string;
  createdDate: string;
  size: string;
  duration?: string;
  resolution?: string;
  thumbnail?: string;
  tags: string[];
  storageTier: 'HOT' | 'WARM' | 'COLD' | 'GLACIER';
}

interface RecentSearch {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

// Data will be fetched from API
const initialResults: SearchResult[] = [];
const initialRecentSearches: RecentSearch[] = [];

const TYPE_CONFIG: Record<AssetType, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  VIDEO: { label: 'Video', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Video' },
  AUDIO: { label: 'Audio', color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: 'Mic' },
  IMAGE: { label: 'Image', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Image' },
  DOCUMENT: { label: 'Document', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'FileText' },
  PROJECT: { label: 'Project', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Folder' },
};

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  HOT: { label: 'Hot', color: 'var(--danger)' },
  WARM: { label: 'Warm', color: 'var(--warning)' },
  COLD: { label: 'Cold', color: 'var(--primary)' },
  GLACIER: { label: 'Glacier', color: 'var(--text-tertiary)' },
};

export default function FindAssetsPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches] = useState<RecentSearch[]>(initialRecentSearches);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'ALL'>('ALL');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setResults(initialResults);
      setHasSearched(true);
    }
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
    setResults(initialResults);
    setHasSearched(true);
  };

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const filteredResults = results.filter(r => typeFilter === 'ALL' || r.type === typeFilter);

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
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
                <Icons.Search className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Search Archive</h1>
                <p className="text-sm text-[var(--text-secondary)]">Find assets from past projects</p>
              </div>
            </div>
            {selectedAssets.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-tertiary)]">{selectedAssets.length} selected</span>
                <Button variant="secondary" size="sm">
                  <Icons.Download className="w-4 h-4 mr-2" />
                  Restore Selected
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Search Bar */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by filename, tag, project, or metadata..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <Button variant="primary" onClick={handleSearch}>
              <Icons.Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-[var(--text-tertiary)]">Filter by type:</span>
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All
            </button>
            {(Object.keys(TYPE_CONFIG) as AssetType[]).map(type => {
              const config = TYPE_CONFIG[type];
              const Icon = Icons[config.icon];
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    typeFilter === type
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
        </Card>

        {!hasSearched ? (
          /* Recent Searches */
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Recent Searches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentSearches.map(search => (
                <Card
                  key={search.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleRecentSearch(search.query)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                      <Icons.Clock className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">{search.query}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {search.resultCount} results · {search.timestamp}
                      </p>
                    </div>
                    <Icons.ArrowRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Browse by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(TYPE_CONFIG) as AssetType[]).map(type => {
                  const config = TYPE_CONFIG[type];
                  const Icon = Icons[config.icon];
                  return (
                    <Card
                      key={type}
                      className="p-6 text-center cursor-pointer hover:shadow-md transition-all"
                      onClick={() => {
                        setTypeFilter(type);
                        setResults(mockResults.filter(r => r.type === type));
                        setHasSearched(true);
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        <Icon className="w-6 h-6" style={{ color: config.color }} />
                      </div>
                      <p className="font-medium text-[var(--text-primary)]">{config.label}s</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">
                {filteredResults.length} results for &quot;{searchQuery}&quot;
              </h3>
              <Button variant="ghost" size="sm" onClick={() => { setHasSearched(false); setResults([]); setSearchQuery(''); }}>
                <Icons.X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="space-y-3">
              {filteredResults.map(result => {
                const typeConfig = TYPE_CONFIG[result.type];
                const TypeIcon = Icons[typeConfig.icon];
                const tierConfig = TIER_CONFIG[result.storageTier];
                const isSelected = selectedAssets.includes(result.id);

                return (
                  <Card
                    key={result.id}
                    className={`p-4 transition-all ${isSelected ? 'ring-2 ring-[var(--primary)]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleAssetSelection(result.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                            : 'border-[var(--border-default)] hover:border-[var(--primary)]'
                        }`}
                      >
                        {isSelected && <Icons.Check className="w-3 h-3" />}
                      </button>

                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: typeConfig.bgColor }}
                      >
                        <TypeIcon className="w-6 h-6" style={{ color: typeConfig.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-[var(--text-primary)] truncate">{result.name}</h4>
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                            style={{ color: tierConfig.color }}
                          >
                            {tierConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-tertiary)]">
                          {result.projectName} · {result.createdDate}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-tertiary)]">
                          <span>{result.size}</span>
                          {result.duration && <span>{result.duration}</span>}
                          {result.resolution && <span>{result.resolution}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {result.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-[var(--bg-2)] text-[10px] text-[var(--text-tertiary)]">
                              {tag}
                            </span>
                          ))}
                          {result.tags.length > 2 && (
                            <span className="text-[10px] text-[var(--text-tertiary)]">+{result.tags.length - 2}</span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Icons.Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredResults.length === 0 && (
              <Card className="p-12 text-center">
                <Icons.Search className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No results found</h3>
                <p className="text-[var(--text-tertiary)]">
                  Try adjusting your search or filters
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
