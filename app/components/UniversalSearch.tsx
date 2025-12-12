"use client";

import { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useRouter } from 'next/navigation';
import { Icons, Button, Modal, Input } from './ui';

interface SearchResult {
  type: 'project' | 'asset' | 'comment' | 'message' | 'callsheet' | 'brief' | 'task';
  id: string;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  relevance: number;
  highlights?: string[];
  metadata?: Record<string, unknown>;
}

type FilterType = 'all' | 'project' | 'asset' | 'comment' | 'message' | 'task';

// Faceted search filters
interface FacetedFilters {
  assetTypes: string[];
  dateRange: { start: string; end: string } | null;
  projects: string[];
  tags: string[];
  status: string[];
  uploadedBy: string[];
  duration: { min: number; max: number } | null;
  fileSize: { min: number; max: number } | null;
  hasTranscript: boolean | null;
  codec: string[];
  resolution: string[];
  frameRate: string[];
}

const FILTER_OPTIONS: { value: FilterType; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '🔍' },
  { value: 'project', label: 'Projects', icon: '📁' },
  { value: 'asset', label: 'Assets', icon: '🎬' },
  { value: 'comment', label: 'Comments', icon: '💬' },
  { value: 'message', label: 'Messages', icon: '✉️' },
  { value: 'task', label: 'Tasks', icon: '✅' },
];

const ASSET_TYPES = ['VIDEO', 'AUDIO', 'IMAGE', 'DOCUMENT', 'PROJECT_FILE'];
const RESOLUTIONS = ['4K (3840x2160)', '2K (2560x1440)', '1080p', '720p', '480p'];
const FRAME_RATES = ['23.976', '24', '25', '29.97', '30', '50', '59.94', '60'];
const CODECS = ['H.264', 'H.265/HEVC', 'ProRes', 'DNxHD', 'VP9', 'AV1'];

const DEFAULT_FILTERS: FacetedFilters = {
  assetTypes: [],
  dateRange: null,
  projects: [],
  tags: [],
  status: [],
  uploadedBy: [],
  duration: null,
  fileSize: null,
  hasTranscript: null,
  codec: [],
  resolution: [],
  frameRate: [],
};

interface UniversalSearchProps {
  organizationId?: string;
  userEmail?: string;
  userId?: string;
}

export default function UniversalSearch({
  organizationId,
  userEmail,
  userId,
}: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);

  // Faceted search state
  const [facetedFilters, setFacetedFilters] = useState<FacetedFilters>(DEFAULT_FILTERS);
  const [showFacetedPanel, setShowFacetedPanel] = useState(false);

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState<Schema["SavedSearch"]["type"][]>([]);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [saveSearchDescription, setSaveSearchDescription] = useState('');
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);

  // Plain-language search examples for non-technical users
  const SMART_SUGGESTIONS = [
    {
      category: 'Find People',
      icon: '👤',
      examples: [
        { query: 'videos with Sarah', description: 'Find all clips featuring Sarah' },
        { query: 'interviews from last month', description: 'Recent interview footage' },
        { query: 'team photos Q4', description: 'Team photos from Q4' },
      ]
    },
    {
      category: 'By Content',
      icon: '🎬',
      examples: [
        { query: 'product shots approved', description: 'Approved product footage' },
        { query: 'outdoor b-roll', description: 'Outdoor B-roll footage' },
        { query: 'logo animations final', description: 'Final logo animations' },
      ]
    },
    {
      category: 'By Status',
      icon: '✅',
      examples: [
        { query: 'needs review', description: 'Assets pending approval' },
        { query: 'approved for social', description: 'Ready for social media' },
        { query: 'recently uploaded', description: 'Latest uploads' },
      ]
    },
    {
      category: 'By Type',
      icon: '📁',
      examples: [
        { query: '4K footage', description: 'High-resolution video' },
        { query: 'audio interviews', description: 'Audio-only content' },
        { query: 'brand guidelines', description: 'Brand documentation' },
      ]
    },
  ];

  // Count active filters
  const activeFilterCount = Object.entries(facetedFilters).reduce((count, [key, value]) => {
    if (key === 'hasTranscript' && value !== null) return count + 1;
    if (Array.isArray(value) && value.length > 0) return count + 1;
    if (value !== null && typeof value === 'object' && 'start' in value) return count + 1;
    if (value !== null && typeof value === 'object' && 'min' in value) return count + 1;
    return count;
  }, 0);

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Load saved searches
  useEffect(() => {
    if (client && organizationId) {
      loadSavedSearches();
    }
  }, [client, organizationId]);

  async function loadSavedSearches() {
    if (!client || !organizationId) return;
    try {
      const { data } = await client.models.SavedSearch.list({
        filter: {
          organizationId: { eq: organizationId },
          or: [
            { visibility: { eq: 'ORGANIZATION' } },
            { createdBy: { eq: userId } },
          ],
        },
      });
      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  }

  async function handleSaveSearch() {
    if (!client || !saveSearchName.trim() || !organizationId || !userId) return;

    try {
      await client.models.SavedSearch.create({
        organizationId,
        name: saveSearchName,
        description: saveSearchDescription || undefined,
        searchQuery: query,
        filters: JSON.stringify(facetedFilters),
        scope: 'ORGANIZATION',
        visibility: 'PRIVATE',
        usageCount: 0,
        isPinned: false,
        createdBy: userId,
        createdByEmail: userEmail,
        createdAt: new Date().toISOString(),
      });

      setShowSaveSearchModal(false);
      setSaveSearchName('');
      setSaveSearchDescription('');
      loadSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }

  async function handleLoadSavedSearch(savedSearch: Schema["SavedSearch"]["type"]) {
    setQuery(savedSearch.searchQuery || '');
    if (savedSearch.filters) {
      try {
        const parsedFilters = typeof savedSearch.filters === 'string'
          ? JSON.parse(savedSearch.filters)
          : savedSearch.filters;
        setFacetedFilters(parsedFilters as FacetedFilters);
      } catch {
        console.error('Error parsing saved search filters');
      }
    }
    setShowSavedSearches(false);

    // Update usage count
    if (client) {
      await client.models.SavedSearch.update({
        id: savedSearch.id,
        usageCount: (savedSearch.usageCount || 0) + 1,
        lastUsedAt: new Date().toISOString(),
      });
    }
  }

  async function handleDeleteSavedSearch(searchId: string) {
    if (!client || !confirm('Delete this saved search?')) return;
    try {
      await client.models.SavedSearch.delete({ id: searchId });
      loadSavedSearches();
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  }

  function toggleFacetFilter(filterKey: keyof FacetedFilters, value: string) {
    setFacetedFilters(prev => {
      const current = prev[filterKey] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterKey]: updated };
    });
  }

  function clearAllFilters() {
    setFacetedFilters(DEFAULT_FILTERS);
  }

  // Apply filter to results
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredResults(results);
    } else {
      setFilteredResults(results.filter(r => r.type === activeFilter));
    }
    setSelectedIndex(0);
  }, [results, activeFilter]);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(filteredResults.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleResultClick(filteredResults[selectedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setShowFilters(false);
      } else if (e.key === 'Tab' && !e.shiftKey && showFilters) {
        // Cycle through filters with Tab
        e.preventDefault();
        const currentIndex = FILTER_OPTIONS.findIndex(f => f.value === activeFilter);
        const nextIndex = (currentIndex + 1) % FILTER_OPTIONS.length;
        setActiveFilter(FILTER_OPTIONS[nextIndex].value);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults, showFilters, activeFilter]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setFilteredResults([]);
      setIsOpen(false);
      setShowFilters(false);
      return;
    }

    const timer = setTimeout(async () => {
      await performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  async function performSearch(searchQuery: string) {
    if (!client) return;

    setIsSearching(true);
    try {
      console.log('🔍 Searching for:', searchQuery);
      const { data, errors } = await client.queries.universalSearch({
        query: searchQuery,
        limit: 10,
      });

      console.log('📊 Search response:', { data, errors });

      if (errors) {
        console.error('❌ Search errors:', errors);
        setResults([]);
      } else if (data) {
        // Ensure data is an array - the Lambda returns JSON
        console.log('📦 Raw data type:', typeof data, data);
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        console.log('📦 Parsed data:', parsedData);
        const resultsArray = Array.isArray(parsedData) ? parsedData : [];
        console.log('✅ Results array:', resultsArray.length, 'results');
        setResults(resultsArray as SearchResult[]);
        setIsOpen(resultsArray.length > 0);
        setShowFilters(resultsArray.length > 0);
        setSelectedIndex(0);
      } else {
        console.log('⚠️ No data returned');
        setResults([]);
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handleResultClick(result: SearchResult) {
    setIsOpen(false);
    setShowFilters(false);
    setQuery('');
    setActiveFilter('all');

    // Navigate based on result type
    switch (result.type) {
      case 'project':
        router.push(`/projects/${result.id}`);
        break;
      case 'asset':
        if (result.projectId) {
          router.push(`/projects/${result.projectId}?tab=assets&asset=${result.id}`);
        }
        break;
      case 'comment':
        if (result.projectId) {
          router.push(`/projects/${result.projectId}?tab=assets&comment=${result.id}`);
        }
        break;
      case 'message':
        if (result.projectId) {
          router.push(`/projects/${result.projectId}?tab=communication&message=${result.id}`);
        }
        break;
      case 'callsheet':
        if (result.projectId) {
          router.push(`/projects/${result.projectId}/call-sheets/${result.id}`);
        }
        break;
      case 'task':
        if (result.projectId) {
          router.push(`/projects/${result.projectId}?tab=tasks&task=${result.id}`);
        }
        break;
    }
  }

  function getResultIcon(type: string): string {
    switch (type) {
      case 'project': return '📁';
      case 'asset': return '🎬';
      case 'comment': return '💬';
      case 'message': return '✉️';
      case 'callsheet': return '📋';
      case 'brief': return '📝';
      case 'task': return '✅';
      default: return '📄';
    }
  }

  function getResultTypeName(type: string): string {
    switch (type) {
      case 'project': return 'Project';
      case 'asset': return 'Asset';
      case 'comment': return 'Comment';
      case 'message': return 'Message';
      case 'callsheet': return 'Call Sheet';
      case 'brief': return 'Brief';
      case 'task': return 'Task';
      default: return 'Result';
    }
  }

  // Count results by type for filter badges
  function getResultCountByType(type: FilterType): number {
    if (type === 'all') return results.length;
    return results.filter(r => r.type === type).length;
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icons.Search className="h-5 w-5 text-[var(--text-tertiary)]" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
              setShowFilters(true);
            } else if (query.length < 2) {
              // Show smart suggestions when input is empty
              setShowSmartSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay to allow click on suggestions
            setTimeout(() => setShowSmartSuggestions(false), 200);
          }}
          placeholder="Try: 'videos with Sarah from Q4' or 'product shots approved last week' (⌘K)"
          className="block w-full pl-10 pr-32 py-2 border border-[var(--border-default)] rounded-lg bg-[var(--bg-2)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {/* Faceted Filters Button */}
          <button
            onClick={() => setShowFacetedPanel(!showFacetedPanel)}
            className={`p-1.5 rounded transition-colors ${
              activeFilterCount > 0
                ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-3)]'
            }`}
            title="Advanced Filters"
          >
            <Icons.Filter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] text-white text-[10px] rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Saved Searches Button */}
          <button
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            className="p-1.5 rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-3)] transition-colors"
            title="Saved Searches"
          >
            <Icons.Bookmark className="w-4 h-4" />
          </button>

          {isSearching && (
            <div className="animate-spin h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
          )}
          {!isSearching && (
            <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-3)] px-1.5 py-0.5 rounded">⌘K</span>
          )}
        </div>
      </div>

      {/* Saved Searches Dropdown */}
      {showSavedSearches && (
        <div className="absolute z-50 mt-2 w-full bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg shadow-xl overflow-hidden">
          <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Saved Searches</h3>
            <button
              onClick={() => setShowSavedSearches(false)}
              className="p-1 rounded hover:bg-[var(--bg-2)] text-[var(--text-tertiary)]"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
          {savedSearches.length === 0 ? (
            <div className="p-6 text-center">
              <Icons.Bookmark className="w-8 h-8 mx-auto text-[var(--text-tertiary)] mb-2" />
              <p className="text-[var(--text-tertiary)]">No saved searches yet</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Save your search to quickly access it later
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {savedSearches.map(search => (
                <div
                  key={search.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-2)] border-b border-[var(--border-subtle)] last:border-0 cursor-pointer"
                  onClick={() => handleLoadSavedSearch(search)}
                >
                  <Icons.Search className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{search.name}</p>
                    {search.searchQuery && (
                      <p className="text-xs text-[var(--text-tertiary)] truncate">"{search.searchQuery}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {search.isPinned && (
                      <Icons.Star className="w-3 h-3 text-[var(--warning)]" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSavedSearch(search.id);
                      }}
                      className="p-1 rounded hover:bg-[var(--bg-3)] text-[var(--text-tertiary)] hover:text-red-500"
                    >
                      <Icons.Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Smart Suggestions Panel - Shows plain-language search examples */}
      {showSmartSuggestions && !isOpen && !showFacetedPanel && !showSavedSearches && (
        <div className="absolute z-50 mt-2 w-full bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg shadow-xl overflow-hidden">
          <div className="p-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h3 className="font-semibold text-[var(--text-primary)]">Try searching in plain language</h3>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Search naturally - describe what you're looking for
            </p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 max-h-80 overflow-y-auto">
            {SMART_SUGGESTIONS.map((category, catIdx) => (
              <div key={catIdx}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{category.icon}</span>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{category.category}</span>
                </div>
                <div className="space-y-1">
                  {category.examples.map((example, exIdx) => (
                    <button
                      key={exIdx}
                      onClick={() => {
                        setQuery(example.query);
                        setShowSmartSuggestions(false);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors group"
                    >
                      <p className="text-sm text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                        "{example.query}"
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">{example.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-2)]">
            <p className="text-xs text-[var(--text-tertiary)] text-center">
              💡 AI-powered search understands people, scenes, and spoken words in your videos
            </p>
          </div>
        </div>
      )}

      {/* Faceted Filters Panel */}
      {showFacetedPanel && (
        <div className="absolute z-50 mt-2 w-full bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg shadow-xl overflow-hidden">
          <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Advanced Filters</h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowFacetedPanel(false)}
                className="p-1 rounded hover:bg-[var(--bg-2)] text-[var(--text-tertiary)]"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {/* Asset Types */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Asset Type</label>
              <div className="flex flex-wrap gap-1.5">
                {ASSET_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFacetFilter('assetTypes', type)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      facetedFilters.assetTypes.includes(type)
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Resolution</label>
              <div className="flex flex-wrap gap-1.5">
                {RESOLUTIONS.map(res => (
                  <button
                    key={res}
                    onClick={() => toggleFacetFilter('resolution', res)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      facetedFilters.resolution.includes(res)
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Frame Rate</label>
              <div className="flex flex-wrap gap-1.5">
                {FRAME_RATES.map(fps => (
                  <button
                    key={fps}
                    onClick={() => toggleFacetFilter('frameRate', fps)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      facetedFilters.frameRate.includes(fps)
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                    }`}
                  >
                    {fps}fps
                  </button>
                ))}
              </div>
            </div>

            {/* Codec */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Codec</label>
              <div className="flex flex-wrap gap-1.5">
                {CODECS.map(codec => (
                  <button
                    key={codec}
                    onClick={() => toggleFacetFilter('codec', codec)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      facetedFilters.codec.includes(codec)
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                    }`}
                  >
                    {codec}
                  </button>
                ))}
              </div>
            </div>

            {/* Has Transcript */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Transcript</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFacetedFilters(prev => ({
                    ...prev,
                    hasTranscript: prev.hasTranscript === true ? null : true
                  }))}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    facetedFilters.hasTranscript === true
                      ? 'bg-[var(--success)] text-white'
                      : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                  }`}
                >
                  Has Transcript
                </button>
                <button
                  onClick={() => setFacetedFilters(prev => ({
                    ...prev,
                    hasTranscript: prev.hasTranscript === false ? null : false
                  }))}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    facetedFilters.hasTranscript === false
                      ? 'bg-[var(--warning)] text-white'
                      : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                  }`}
                >
                  No Transcript
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={facetedFilters.dateRange?.start || ''}
                  onChange={(e) => setFacetedFilters(prev => ({
                    ...prev,
                    dateRange: e.target.value
                      ? { start: e.target.value, end: prev.dateRange?.end || '' }
                      : null
                  }))}
                  className="flex-1 px-2 py-1.5 bg-[var(--bg-2)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)]"
                />
                <span className="text-[var(--text-tertiary)] self-center">to</span>
                <input
                  type="date"
                  value={facetedFilters.dateRange?.end || ''}
                  onChange={(e) => setFacetedFilters(prev => ({
                    ...prev,
                    dateRange: e.target.value
                      ? { start: prev.dateRange?.start || '', end: e.target.value }
                      : null
                  }))}
                  className="flex-1 px-2 py-1.5 bg-[var(--bg-2)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Save Search Button */}
          <div className="p-3 border-t border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-2)]">
            <span className="text-xs text-[var(--text-tertiary)]">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowFacetedPanel(false);
                setShowSaveSearchModal(true);
              }}
              disabled={!query && activeFilterCount === 0}
            >
              <Icons.Bookmark className="w-3.5 h-3.5 mr-1.5" />
              Save Search
            </Button>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden">
          {/* Filter Tabs */}
          {showFilters && (
            <div className="flex items-center gap-1 px-3 py-2 bg-slate-900 border-b border-slate-700 overflow-x-auto">
              {FILTER_OPTIONS.map((filter) => {
                const count = getResultCountByType(filter.value);
                if (filter.value !== 'all' && count === 0) return null;

                return (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeFilter === filter.value
                        ? 'bg-teal-500 text-black'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      activeFilter === filter.value
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-600 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredResults.length > 0 ? (
              filteredResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                    index === selectedIndex ? 'bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{getResultIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {getResultTypeName(result.type)}
                        </span>
                        {result.projectName && (
                          <span className="text-xs text-slate-500">
                            in {result.projectName}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white truncate">{result.title}</h4>
                      {result.description && (
                        <p className="text-sm text-slate-400 truncate mt-1">
                          {result.description}
                        </p>
                      )}
                      {result.highlights && result.highlights.length > 0 && (
                        <p className="text-xs text-teal-400 mt-2 italic truncate">
                          {result.highlights[0]}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs text-slate-500">
                        {Math.round(result.relevance * 100)}%
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-slate-400 text-sm">No {activeFilter !== 'all' ? getResultTypeName(activeFilter).toLowerCase() + 's' : 'results'} found</p>
                {activeFilter !== 'all' && (
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="text-teal-400 text-sm mt-2 hover:underline"
                  >
                    Show all results ({results.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer with keyboard hints */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-t border-slate-700 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span><kbd className="bg-slate-700 px-1.5 py-0.5 rounded">↑↓</kbd> Navigate</span>
              <span><kbd className="bg-slate-700 px-1.5 py-0.5 rounded">↵</kbd> Select</span>
              <span><kbd className="bg-slate-700 px-1.5 py-0.5 rounded">esc</kbd> Close</span>
            </div>
            <span>{filteredResults.length} of {results.length} results</span>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && results.length === 0 && !isSearching && (
        <div className="absolute z-50 mt-2 w-full bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg shadow-xl p-8 text-center">
          <Icons.Search className="mx-auto h-12 w-12 text-[var(--text-tertiary)] mb-4" />
          <p className="text-[var(--text-secondary)] font-medium">No results found for "{query}"</p>
          <p className="text-[var(--text-tertiary)] text-sm mt-2">Try different keywords or check your spelling</p>
        </div>
      )}

      {/* Save Search Modal */}
      <Modal
        isOpen={showSaveSearchModal}
        onClose={() => {
          setShowSaveSearchModal(false);
          setSaveSearchName('');
          setSaveSearchDescription('');
        }}
        title="Save Search"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Search Name *
            </label>
            <Input
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="e.g., All approved 4K videos"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Description
            </label>
            <textarea
              value={saveSearchDescription}
              onChange={(e) => setSaveSearchDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full p-3 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 resize-none"
              rows={2}
            />
          </div>

          {/* Current search preview */}
          <div className="p-3 bg-[var(--bg-2)] rounded-lg">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Search query:</p>
            <p className="text-sm text-[var(--text-primary)] font-mono">
              {query || '(no query)'}
            </p>
            {activeFilterCount > 0 && (
              <p className="text-xs text-[var(--text-tertiary)] mt-2">
                + {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSaveSearchModal(false);
                setSaveSearchName('');
                setSaveSearchDescription('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveSearch}
              disabled={!saveSearchName.trim()}
            >
              <Icons.Bookmark className="w-4 h-4 mr-2" />
              Save Search
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
