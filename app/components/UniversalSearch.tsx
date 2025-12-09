"use client";

import { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: 'project' | 'asset' | 'comment' | 'message' | 'callsheet' | 'brief';
  id: string;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  relevance: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

export default function UniversalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [client] = useState(() => generateClient<Schema>());

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
        setSelectedIndex(i => Math.min(results.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      await performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  async function performSearch(searchQuery: string) {
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
    setQuery('');

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
      default: return 'Result';
    }
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
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search projects, assets, comments, messages... (Cmd+K)"
          className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          {results.map((result, index) => (
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
                    {Math.round(result.relevance * 100)}% match
                  </span>
                </div>
              </div>
            </button>
          ))}
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
