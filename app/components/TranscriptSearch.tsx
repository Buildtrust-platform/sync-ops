"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * TRANSCRIPT SEARCH - Search across all transcribed footage
 * Allows searching through AI-generated transcripts with timecode navigation
 */

interface TranscriptSegment {
  id: string;
  assetId: string;
  assetName?: string;
  projectId?: string;
  projectName?: string;
  startTime: number;
  endTime: number;
  text: string;
  speakerId?: string;
  speakerName?: string;
  confidence?: number;
  thumbnailKey?: string;
}

interface TranscriptSearchProps {
  organizationId: string;
  projectId?: string; // Optional: filter to specific project
  onResultClick?: (assetId: string, timecode: number) => void;
}

// Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const FileVideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m10 11 5 3-5 3v-6z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function TranscriptSearch({
  organizationId,
  projectId,
  onResultClick,
}: TranscriptSearchProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<TranscriptSegment[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [assetNames, setAssetNames] = useState<Record<string, string>>({});
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: "userPool" }));
  }, []);

  // Format time to MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Highlight search terms in text
  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-500/30 text-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Load asset and project names for results
  const loadMetadata = useCallback(async (transcripts: TranscriptSegment[]) => {
    if (!client) return;

    const uniqueAssetIds = [...new Set(transcripts.map((t) => t.assetId))];
    const uniqueProjectIds = [...new Set(transcripts.map((t) => t.projectId).filter(Boolean))] as string[];

    // Load asset names
    const assetNamesMap: Record<string, string> = {};
    for (const assetId of uniqueAssetIds) {
      try {
        const { data: asset } = await client.models.Asset.get({ id: assetId });
        if (asset) {
          assetNamesMap[assetId] = asset.s3Key.split("/").pop() || "Unknown Asset";
        }
      } catch (err) {
        console.error("Error loading asset:", err);
      }
    }
    setAssetNames(assetNamesMap);

    // Load project names
    const projectNamesMap: Record<string, string> = {};
    for (const pid of uniqueProjectIds) {
      try {
        const { data: project } = await client.models.Project.get({ id: pid });
        if (project) {
          projectNamesMap[pid] = project.name || "Unknown Project";
        }
      } catch (err) {
        console.error("Error loading project:", err);
      }
    }
    setProjectNames(projectNamesMap);
  }, [client]);

  // Perform search
  const handleSearch = useCallback(async () => {
    if (!client || !searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Build filter
      const filter: any = {
        organizationId: { eq: organizationId },
        text: { contains: searchQuery.toLowerCase() },
      };

      if (projectId) {
        filter.projectId = { eq: projectId };
      }

      // Search transcripts
      const { data: transcripts } = await client.models.AITranscript.list({
        filter,
        limit: 100,
      });

      if (transcripts) {
        const mappedResults: TranscriptSegment[] = transcripts.map((t) => ({
          id: t.id,
          assetId: t.assetId,
          projectId: t.projectId || undefined,
          startTime: t.startTime,
          endTime: t.endTime,
          text: t.text,
          speakerId: t.speakerId || undefined,
          speakerName: t.speakerName || undefined,
          confidence: t.confidence || undefined,
        }));

        setResults(mappedResults);
        setTotalResults(mappedResults.length);

        // Load metadata for results
        await loadMetadata(mappedResults);
      } else {
        setResults([]);
        setTotalResults(0);
      }
    } catch (err) {
      console.error("Error searching transcripts:", err);
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  }, [client, searchQuery, organizationId, projectId, loadMetadata]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setTotalResults(0);
    setHasSearched(false);
  };

  // Group results by asset
  const groupedResults = useMemo(() => {
    const groups: Record<string, TranscriptSegment[]> = {};
    results.forEach((result) => {
      if (!groups[result.assetId]) {
        groups[result.assetId] = [];
      }
      groups[result.assetId].push(result);
    });
    return groups;
  }, [results]);

  return (
    <div className="bg-[var(--bg-1)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <h3 className="text-lg font-semibold text-white mb-3">Transcript Search</h3>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search across all transcribed footage..."
            className="w-full pl-10 pr-20 py-3 rounded-lg bg-[var(--bg-0)] border border-[var(--border)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <XIcon />
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium disabled:opacity-50 hover:brightness-110 transition-all"
            >
              {isSearching ? "..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-h-[500px] overflow-y-auto">
        {!hasSearched ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-0)] flex items-center justify-center mx-auto mb-4">
              <SearchIcon />
            </div>
            <p className="text-gray-400">
              Search through transcribed video and audio content
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Results will show matching dialogue with timestamps
            </p>
          </div>
        ) : isSearching ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Searching transcripts...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No results found for "{searchQuery}"</p>
            <p className="text-gray-500 text-sm mt-2">
              Try different keywords or check if your footage has been transcribed
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {/* Results count */}
            <div className="px-4 py-2 bg-[var(--bg-0)] text-sm text-gray-400">
              Found {totalResults} result{totalResults !== 1 ? "s" : ""} in{" "}
              {Object.keys(groupedResults).length} asset{Object.keys(groupedResults).length !== 1 ? "s" : ""}
            </div>

            {/* Grouped Results */}
            {Object.entries(groupedResults).map(([assetId, segments]) => (
              <div key={assetId} className="divide-y divide-[var(--border)]/50">
                {/* Asset Header */}
                <div className="px-4 py-3 bg-[var(--bg-0)]/50 flex items-center gap-3">
                  <div className="text-[var(--primary)]">
                    <FileVideoIcon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">
                      {assetNames[assetId] || "Loading..."}
                    </p>
                    {segments[0].projectId && projectNames[segments[0].projectId] && (
                      <p className="text-gray-500 text-xs truncate">
                        {projectNames[segments[0].projectId]}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 bg-[var(--bg-1)] px-2 py-1 rounded">
                    {segments.length} match{segments.length !== 1 ? "es" : ""}
                  </span>
                </div>

                {/* Segment Results */}
                {segments.map((segment) => (
                  <button
                    key={segment.id}
                    onClick={() => onResultClick?.(segment.assetId, segment.startTime)}
                    className="w-full px-4 py-3 text-left hover:bg-[var(--bg-0)] transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Play button */}
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--primary)] transition-colors">
                        <span className="text-[var(--primary)] group-hover:text-white">
                          <PlayIcon />
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Metadata row */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                          <span className="flex items-center gap-1">
                            <ClockIcon />
                            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                          </span>
                          {segment.speakerName && (
                            <span className="flex items-center gap-1">
                              <UserIcon />
                              {segment.speakerName}
                            </span>
                          )}
                          {segment.confidence && (
                            <span className="text-gray-600">
                              {Math.round(segment.confidence * 100)}% conf
                            </span>
                          )}
                        </div>

                        {/* Transcript text */}
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {highlightText(segment.text, searchQuery)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
