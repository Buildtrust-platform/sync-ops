"use client";

import { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: 'project' | 'asset' | 'comment' | 'message' | 'callsheet' | 'brief' | 'task';
  id: string;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  relevance: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

type FilterType = 'all' | 'project' | 'asset' | 'comment' | 'message' | 'task';

const FILTER_OPTIONS: { value: FilterType; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '🔍' },
  { value: 'project', label: 'Projects', icon: '📁' },
  { value: 'asset', label: 'Assets', icon: '🎬' },
  { value: 'comment', label: 'Comments', icon: '💬' },
  { value: 'message', label: 'Messages', icon: '✉️' },
  { value: 'task', label: 'Tasks', icon: '✅' },
];

export default function UniversalSearch() {
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

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

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
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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
            }
          }}
          placeholder="Search projects, assets, comments... (⌘K)"
          className="block w-full pl-10 pr-12 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {isSearching && (
            <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {!isSearching && (
            <span className="text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">⌘K</span>
          )}
        </div>
      </div>

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
        <div className="absolute z-50 mt-2 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-400 font-medium">No results found for "{query}"</p>
          <p className="text-slate-500 text-sm mt-2">Try different keywords or check your spelling</p>
        </div>
      )}
    </div>
  );
}
