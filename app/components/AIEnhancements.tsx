'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';

// Ensure Amplify is configured before generating client
try {
  Amplify.configure(outputs, { ssr: true });
} catch {
  // Already configured
}

const client = generateClient<Schema>({ authMode: 'userPool' });

// Types
interface DetectedFace {
  id: string;
  assetId: string;
  timestamp?: number; // For video
  boundingBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
  confidence: number;
  personId?: string;
  personName?: string;
  emotions?: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    neutral: number;
  } | null;
  ageRange?: { low: number; high: number } | null;
  gender?: { value: string; confidence: number } | null;
}

interface DetectedScene {
  id: string;
  assetId: string;
  startTime: number;
  endTime: number;
  duration: number;
  labels: string[];
  confidence: number;
  thumbnail?: string;
  shotType?: 'wide' | 'medium' | 'close-up' | 'extreme-close-up' | 'establishing';
  movement?: 'static' | 'pan' | 'tilt' | 'zoom' | 'tracking' | 'handheld';
  lighting?: 'natural' | 'artificial' | 'mixed' | 'low-key' | 'high-key';
}

interface TranscriptSegment {
  id: string;
  assetId: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
  confidence: number;
  words?: {
    word: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }[];
}

interface AIAnalysisJob {
  id: string;
  assetId: string;
  assetName: string;
  type: 'face_detection' | 'scene_detection' | 'transcription' | 'full_analysis';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

interface Person {
  id: string;
  name: string;
  faceCount: number;
  assets: string[];
  thumbnail?: string;
}

interface AIEnhancementsProps {
  organizationId: string;
  projectId: string;
  assetId?: string;
  onNavigateToAsset?: (assetId: string, timestamp?: number) => void;
}

// SVG Icons
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const FilmIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="17" x2="22" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
  </svg>
);

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
    <path d="M19 11l1 2 1-2 2-1-2-1-1-2-1 2-2 1 2 1z" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Helper to determine file type from s3Key extension
const getFileTypeFromKey = (s3Key: string): string => {
  const ext = s3Key.toLowerCase().split('.').pop() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'];
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'm4v'];
  const audioExts = ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'wma'];

  if (imageExts.includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  if (videoExts.includes(ext)) return `video/${ext}`;
  if (audioExts.includes(ext)) return `audio/${ext === 'mp3' ? 'mpeg' : ext}`;
  return 'application/octet-stream';
};

// Format time helper
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 24);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
};

// Helper to parse JSON fields from Amplify
function parseJsonField<T>(field: string | null | undefined): T | null {
  if (!field) return null;
  try {
    return JSON.parse(field) as T;
  } catch {
    return null;
  }
}

export default function AIEnhancements({
  organizationId,
  projectId,
  onNavigateToAsset,
}: AIEnhancementsProps) {
  const [activeTab, setActiveTab] = useState<'faces' | 'scenes' | 'transcript' | 'jobs'>('faces');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [editingPerson, setEditingPerson] = useState<string | null>(null);
  const [newPersonName, setNewPersonName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Array<{ id: string; name: string; type: string; s3Key: string }>>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  // AI Analysis data from Amplify backend
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [scenes, setScenes] = useState<DetectedScene[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [jobs, setJobs] = useState<AIAnalysisJob[]>([]);

  // Load data from Amplify backend (with demo data fallback)
  useEffect(() => {
    async function loadAIData() {
      setIsLoading(true);
      try {
        // Build filter for organization/project
        const baseFilter: Record<string, unknown> = { organizationId: { eq: organizationId } };
        if (projectId) {
          baseFilter.projectId = { eq: projectId };
        }

        // Check if AI models exist (they may not be deployed yet)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const models = client.models as any;

        // If AI models are not deployed, show demo data to demonstrate the feature
        if (!models.AIFaceDetection) {
          console.log('AI models not yet deployed. Showing demo data.');

          // Demo faces
          setFaces([
            {
              id: 'demo-face-1',
              assetId: 'demo-asset-1',
              timestamp: 12.5,
              boundingBox: { left: 0.3, top: 0.2, width: 0.15, height: 0.2 },
              confidence: 0.98,
              personId: 'person-1',
              personName: 'Sarah Johnson',
              emotions: { happy: 85, sad: 2, angry: 1, surprised: 5, neutral: 7 },
              ageRange: { low: 28, high: 35 },
              gender: { value: 'Female', confidence: 0.99 },
            },
            {
              id: 'demo-face-2',
              assetId: 'demo-asset-1',
              timestamp: 45.2,
              boundingBox: { left: 0.5, top: 0.25, width: 0.12, height: 0.18 },
              confidence: 0.95,
              personId: 'person-2',
              personName: 'Michael Chen',
              emotions: { happy: 20, sad: 5, angry: 2, surprised: 10, neutral: 63 },
              ageRange: { low: 35, high: 42 },
              gender: { value: 'Male', confidence: 0.98 },
            },
            {
              id: 'demo-face-3',
              assetId: 'demo-asset-2',
              timestamp: 5.8,
              boundingBox: { left: 0.4, top: 0.15, width: 0.18, height: 0.22 },
              confidence: 0.92,
              personId: 'person-1',
              personName: 'Sarah Johnson',
              emotions: { happy: 45, sad: 8, angry: 3, surprised: 35, neutral: 9 },
              ageRange: { low: 28, high: 35 },
              gender: { value: 'Female', confidence: 0.99 },
            },
          ]);

          // Demo scenes
          setScenes([
            {
              id: 'demo-scene-1',
              assetId: 'demo-asset-1',
              startTime: 0,
              endTime: 15.5,
              duration: 15.5,
              labels: ['Office', 'Indoor', 'Meeting Room'],
              confidence: 0.94,
              shotType: 'wide',
              movement: 'static',
              lighting: 'artificial',
            },
            {
              id: 'demo-scene-2',
              assetId: 'demo-asset-1',
              startTime: 15.5,
              endTime: 32.0,
              duration: 16.5,
              labels: ['Person', 'Interview', 'Close-up'],
              confidence: 0.91,
              shotType: 'medium',
              movement: 'static',
              lighting: 'artificial',
            },
            {
              id: 'demo-scene-3',
              assetId: 'demo-asset-1',
              startTime: 32.0,
              endTime: 48.5,
              duration: 16.5,
              labels: ['Outdoor', 'City', 'B-roll'],
              confidence: 0.89,
              shotType: 'wide',
              movement: 'pan',
              lighting: 'natural',
            },
          ]);

          // Demo transcripts
          setTranscripts([
            {
              id: 'demo-transcript-1',
              assetId: 'demo-asset-1',
              startTime: 2.0,
              endTime: 8.5,
              text: 'Welcome to our quarterly update video. Today we will be discussing the progress on our major initiatives.',
              speaker: 'Sarah Johnson',
              confidence: 0.96,
            },
            {
              id: 'demo-transcript-2',
              assetId: 'demo-asset-1',
              startTime: 9.0,
              endTime: 15.0,
              text: 'As you can see from the metrics, we have exceeded our targets by fifteen percent this quarter.',
              speaker: 'Sarah Johnson',
              confidence: 0.94,
            },
            {
              id: 'demo-transcript-3',
              assetId: 'demo-asset-1',
              startTime: 16.0,
              endTime: 24.5,
              text: 'Michael, can you tell us about the technical improvements your team has made?',
              speaker: 'Sarah Johnson',
              confidence: 0.92,
            },
            {
              id: 'demo-transcript-4',
              assetId: 'demo-asset-1',
              startTime: 25.0,
              endTime: 35.0,
              text: 'Absolutely. We have optimized our infrastructure to reduce latency by forty percent and improved overall system reliability.',
              speaker: 'Michael Chen',
              confidence: 0.93,
            },
          ]);

          // Demo jobs
          setJobs([
            {
              id: 'demo-job-1',
              assetId: 'demo-asset-1',
              assetName: 'Q4_Update_Final.mp4',
              type: 'full_analysis',
              status: 'completed',
              progress: 100,
              startedAt: new Date(Date.now() - 3600000).toISOString(),
              completedAt: new Date(Date.now() - 3300000).toISOString(),
            },
            {
              id: 'demo-job-2',
              assetId: 'demo-asset-2',
              assetName: 'Product_Demo_v2.mov',
              type: 'transcription',
              status: 'processing',
              progress: 65,
              startedAt: new Date(Date.now() - 300000).toISOString(),
            },
            {
              id: 'demo-job-3',
              assetId: 'demo-asset-3',
              assetName: 'Interview_Raw.mp4',
              type: 'face_detection',
              status: 'queued',
              progress: 0,
            },
          ]);

          setIsLoading(false);
          return;
        }

        // Load face detections from backend
        const facesResult = await models.AIFaceDetection.list({ filter: baseFilter });
        if (facesResult.data) {
          const mappedFaces: DetectedFace[] = facesResult.data.map((f: any) => {
            const boundingBox = parseJsonField<{ Left: number; Top: number; Width: number; Height: number }>(f.boundingBox as string);
            const emotions = parseJsonField<Array<{ Type: string; Confidence: number }>>(f.emotions as string);
            const ageRange = parseJsonField<{ Low: number; High: number }>(f.ageRange as string);
            const gender = parseJsonField<{ Value: string; Confidence: number }>(f.gender as string);

            // Convert emotions array to object format
            let emotionsObj: DetectedFace['emotions'] = null;
            if (emotions && Array.isArray(emotions)) {
              emotionsObj = {
                happy: emotions.find(e => e.Type === 'HAPPY')?.Confidence || 0,
                sad: emotions.find(e => e.Type === 'SAD')?.Confidence || 0,
                angry: emotions.find(e => e.Type === 'ANGRY')?.Confidence || 0,
                surprised: emotions.find(e => e.Type === 'SURPRISED')?.Confidence || 0,
                neutral: emotions.find(e => e.Type === 'CALM')?.Confidence || 0,
              };
            }

            return {
              id: f.id,
              assetId: f.assetId,
              timestamp: f.timestamp || undefined,
              boundingBox: boundingBox ? {
                left: boundingBox.Left,
                top: boundingBox.Top,
                width: boundingBox.Width,
                height: boundingBox.Height,
              } : null,
              confidence: f.confidence / 100, // Rekognition returns 0-100, we use 0-1
              personId: f.personId || undefined,
              personName: f.personName || undefined,
              emotions: emotionsObj,
              ageRange: ageRange ? { low: ageRange.Low, high: ageRange.High } : null,
              gender: gender ? { value: gender.Value, confidence: gender.Confidence / 100 } : null,
            };
          });
          setFaces(mappedFaces);
        }

        // Load scene detections
        const scenesResult = await models.AISceneDetection.list({ filter: baseFilter });
        if (scenesResult.data) {
          const mappedScenes: DetectedScene[] = scenesResult.data.map((s: any) => ({
            id: s.id,
            assetId: s.assetId,
            startTime: s.startTime,
            endTime: s.endTime,
            duration: s.duration || (s.endTime - s.startTime),
            labels: (s.labels || []).filter((l: string | null) => l !== null) as string[],
            confidence: s.confidence / 100,
            thumbnail: s.thumbnailKey || undefined,
            shotType: s.shotType?.toLowerCase() as DetectedScene['shotType'],
            movement: s.movement?.toLowerCase() as DetectedScene['movement'],
            lighting: s.lighting?.toLowerCase().replace('_', '-') as DetectedScene['lighting'],
          }));
          setScenes(mappedScenes);
        }

        // Load transcripts
        const transcriptsResult = await models.AITranscript.list({ filter: baseFilter });
        if (transcriptsResult.data) {
          const mappedTranscripts: TranscriptSegment[] = transcriptsResult.data.map((t: any) => ({
            id: t.id,
            assetId: t.assetId,
            startTime: t.startTime,
            endTime: t.endTime,
            text: t.text,
            speaker: t.speakerName || t.speakerId || undefined,
            confidence: (t.confidence || 100) / 100,
            words: parseJsonField<TranscriptSegment['words']>(t.words as string) || undefined,
          }));
          setTranscripts(mappedTranscripts);
        }

        // Load analysis jobs
        const jobsResult = await models.AIAnalysisJob.list({ filter: baseFilter });
        if (jobsResult.data) {
          const mappedJobs: AIAnalysisJob[] = jobsResult.data.map((j: any) => ({
            id: j.id,
            assetId: j.assetId,
            assetName: j.assetName || 'Unknown Asset',
            type: j.analysisType.toLowerCase().replace('_', '_') as AIAnalysisJob['type'],
            status: j.status.toLowerCase() as AIAnalysisJob['status'],
            progress: j.progress || 0,
            startedAt: j.startedAt || undefined,
            completedAt: j.completedAt || undefined,
            error: j.errorMessage || undefined,
          }));
          // Sort by most recent first
          mappedJobs.sort((a, b) => {
            const aTime = a.startedAt || a.completedAt || '';
            const bTime = b.startedAt || b.completedAt || '';
            return bTime.localeCompare(aTime);
          });
          setJobs(mappedJobs);
        }

      } catch (error) {
        console.error('Error loading AI data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAIData();

    // Set up polling for jobs that are in progress
    const pollInterval = setInterval(async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const models = client.models as any;
        if (!models.AIAnalysisJob) return;

        const baseFilter: Record<string, unknown> = { organizationId: { eq: organizationId } };
        if (projectId) {
          baseFilter.projectId = { eq: projectId };
        }

        const jobsResult = await models.AIAnalysisJob.list({ filter: baseFilter });
        if (jobsResult.data) {
          const mappedJobs: AIAnalysisJob[] = jobsResult.data.map((j: any) => ({
            id: j.id,
            assetId: j.assetId,
            assetName: j.assetName || 'Unknown Asset',
            type: j.analysisType.toLowerCase().replace('_', '_') as AIAnalysisJob['type'],
            status: j.status.toLowerCase() as AIAnalysisJob['status'],
            progress: j.progress || 0,
            startedAt: j.startedAt || undefined,
            completedAt: j.completedAt || undefined,
            error: j.errorMessage || undefined,
          }));
          mappedJobs.sort((a, b) => {
            const aTime = a.startedAt || a.completedAt || '';
            const bTime = b.startedAt || b.completedAt || '';
            return bTime.localeCompare(aTime);
          });
          setJobs(mappedJobs);
        }
      } catch (error) {
        console.error('Error polling jobs:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [organizationId, projectId]);

  // Derive persons from faces
  const persons: Person[] = React.useMemo(() => {
    const personMap = new Map<string, Person>();

    faces.forEach(face => {
      if (face.personId && face.personName) {
        const existing = personMap.get(face.personId);
        if (existing) {
          existing.faceCount++;
          if (!existing.assets.includes(face.assetId)) {
            existing.assets.push(face.assetId);
          }
        } else {
          personMap.set(face.personId, {
            id: face.personId,
            name: face.personName,
            faceCount: 1,
            assets: [face.assetId],
          });
        }
      }
    });

    return Array.from(personMap.values());
  }, [faces]);

  // Filter faces by selected person
  const filteredFaces = React.useMemo(() => {
    let result = faces;

    if (selectedPerson) {
      result = result.filter(f => f.personId === selectedPerson);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.personName?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [faces, selectedPerson, searchQuery]);

  // Filter scenes by search
  const filteredScenes = React.useMemo(() => {
    if (!searchQuery) return scenes;

    const query = searchQuery.toLowerCase();
    return scenes.filter(s =>
      s.labels.some(l => l.toLowerCase().includes(query)) ||
      s.shotType?.toLowerCase().includes(query) ||
      s.movement?.toLowerCase().includes(query)
    );
  }, [scenes, searchQuery]);

  // Filter transcripts by search
  const filteredTranscripts = React.useMemo(() => {
    if (!searchQuery) return transcripts;

    const query = searchQuery.toLowerCase();
    return transcripts.filter(t =>
      t.text.toLowerCase().includes(query) ||
      t.speaker?.toLowerCase().includes(query)
    );
  }, [transcripts, searchQuery]);

  // Handle person rename - update in Amplify
  const handleRenamePerson = useCallback(async (personId: string, newName: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const models = client.models as any;
      if (models.AIFaceDetection) {
        // Update all face detections with this personId
        const facesToUpdate = faces.filter(f => f.personId === personId);
        for (const face of facesToUpdate) {
          await models.AIFaceDetection.update({
            id: face.id,
            personName: newName,
          });
        }
      }

      // Update local state
      setFaces(prev => prev.map(f =>
        f.personId === personId ? { ...f, personName: newName } : f
      ));
    } catch (error) {
      console.error('Error renaming person:', error);
    }
    setEditingPerson(null);
    setNewPersonName('');
  }, [faces]);

  // Handle navigate to timestamp
  const handleNavigate = useCallback((assetId: string, timestamp?: number) => {
    if (onNavigateToAsset) {
      onNavigateToAsset(assetId, timestamp);
    }
  }, [onNavigateToAsset]);

  // Load available assets for analysis
  const loadAvailableAssets = useCallback(async () => {
    setIsLoadingAssets(true);
    try {
      // Build filter - match ArchiveDAM's approach exactly
      const filter: Record<string, unknown> = {};
      if (projectId) {
        filter.projectId = { eq: projectId };
      }

      console.log('[AI Analysis] Loading assets with projectId:', projectId);
      console.log('[AI Analysis] Filter:', JSON.stringify(filter));

      // Use same approach as ArchiveDAM - always pass filter object
      const result = await client.models.Asset.list({ filter });

      console.log('[AI Analysis] Raw result:', result);
      console.log('[AI Analysis] Assets loaded:', result.data?.length || 0, 'assets found');

      const assetsData = result.data || [];

      if (assetsData.length > 0) {
        // Log all assets for debugging
        assetsData.forEach((asset, i) => {
          if (asset) {
            console.log(`[AI Analysis] Asset ${i}:`, asset.id, asset.s3Key, asset.mimeType);
          }
        });

        // Filter for media assets - be more lenient, include all assets with s3Key
        const mediaAssets = assetsData
          .filter((asset): asset is NonNullable<typeof asset> => {
            if (!asset) return false;
            // Include any asset that has an s3Key (was uploaded)
            return !!asset.s3Key;
          })
          .map(asset => {
            // Extract filename from s3Key for display name
            const fileName = asset.s3Key?.split('/').pop() || 'Unknown Asset';
            return {
              id: asset.id,
              name: fileName,
              type: asset.mimeType || getFileTypeFromKey(asset.s3Key || ''),
              s3Key: asset.s3Key || '',
            };
          });

        console.log('[AI Analysis] Media assets after filter:', mediaAssets.length);
        setAvailableAssets(mediaAssets);
      } else {
        console.log('[AI Analysis] No assets returned from query');
        setAvailableAssets([]);
      }
    } catch (error) {
      console.error('[AI Analysis] Error loading assets:', error);
      setAvailableAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  }, [projectId]);

  // Open analysis modal
  const openAnalysisModal = useCallback(() => {
    loadAvailableAssets();
    setSelectedAssetIds([]);
    setShowAnalysisModal(true);
  }, [loadAvailableAssets]);

  // Start AI analysis for selected assets
  const startAnalysis = useCallback(async () => {
    if (selectedAssetIds.length === 0) return;

    setIsStartingAnalysis(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const models = client.models as any;

      for (const assetId of selectedAssetIds) {
        const asset = availableAssets.find(a => a.id === assetId);
        if (!asset) continue;

        // Create an AIAnalysisJob record
        if (models.AIAnalysisJob) {
          await models.AIAnalysisJob.create({
            organizationId,
            projectId,
            assetId,
            assetName: asset.name,
            analysisType: 'FULL_ANALYSIS',
            status: 'QUEUED',
            progress: 0,
          });
        }

        // Create a local job for immediate UI feedback
        const newJob: AIAnalysisJob = {
          id: `local-${Date.now()}-${assetId}`,
          assetId,
          assetName: asset.name,
          type: 'full_analysis',
          status: 'queued',
          progress: 0,
          startedAt: new Date().toISOString(),
        };

        setJobs(prev => [newJob, ...prev]);
      }

      setShowAnalysisModal(false);
      setActiveTab('jobs');
    } catch (error) {
      console.error('Error starting analysis:', error);
    } finally {
      setIsStartingAnalysis(false);
    }
  }, [selectedAssetIds, availableAssets, organizationId, projectId]);

  // Get emotion display
  const getTopEmotion = (emotions?: DetectedFace['emotions']): string => {
    if (!emotions) return 'Unknown';
    const entries = Object.entries(emotions);
    const top = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    return top[0].charAt(0).toUpperCase() + top[0].slice(1);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: 'var(--bg-0)',
        color: 'var(--text-secondary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshIcon />
          <p style={{ marginTop: '12px' }}>Loading AI Analysis data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-0)',
      color: 'var(--text)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SparklesIcon />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>AI Analysis</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-1)',
            borderRadius: '6px',
            border: '1px solid var(--border)',
          }}>
            <SearchIcon />
            <input
              type="text"
              placeholder={activeTab === 'transcript' ? 'Search transcripts...' : `Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                fontSize: '13px',
                width: '200px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-1)',
      }}>
        {[
          { id: 'faces', label: 'Face Detection', icon: <UserIcon /> },
          { id: 'scenes', label: 'Scene Detection', icon: <FilmIcon /> },
          { id: 'transcript', label: 'Transcript Search', icon: <MicIcon /> },
          { id: 'jobs', label: 'Analysis Jobs', icon: <RefreshIcon /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'jobs' && jobs.filter(j => j.status === 'processing' || j.status === 'queued').length > 0 && (
              <span style={{
                backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                color: activeTab === tab.id ? 'white' : 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '11px',
              }}>
                {jobs.filter(j => j.status === 'processing' || j.status === 'queued').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {/* Faces Tab */}
        {activeTab === 'faces' && (
          <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
            {/* People sidebar */}
            <div style={{
              width: '240px',
              flexShrink: 0,
              backgroundColor: 'var(--bg-1)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <UsersIcon />
                <span style={{ fontWeight: 500, fontSize: '14px' }}>People</span>
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: 'var(--bg-2)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>
                  {persons.length}
                </span>
              </div>

              <div style={{ padding: '8px' }}>
                <button
                  onClick={() => setSelectedPerson(null)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: !selectedPerson ? 'var(--primary-muted)' : 'transparent',
                    color: !selectedPerson ? 'var(--primary)' : 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    marginBottom: '4px',
                  }}
                >
                  All People ({faces.length} detections)
                </button>

                {persons.map(person => (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPerson(person.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      backgroundColor: selectedPerson === person.id ? 'var(--primary-muted)' : 'transparent',
                      cursor: 'pointer',
                      marginBottom: '4px',
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                    }}>
                      {person.name.charAt(0)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {editingPerson === person.id ? (
                        <input
                          type="text"
                          value={newPersonName}
                          onChange={(e) => setNewPersonName(e.target.value)}
                          onBlur={() => handleRenamePerson(person.id, newPersonName)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenamePerson(person.id, newPersonName);
                            if (e.key === 'Escape') { setEditingPerson(null); setNewPersonName(''); }
                          }}
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '4px 8px',
                            border: '1px solid var(--primary)',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-0)',
                            color: 'var(--text)',
                            fontSize: '13px',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: selectedPerson === person.id ? 'var(--primary)' : 'var(--text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {person.name}
                        </div>
                      )}
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                      }}>
                        {person.faceCount} detections in {person.assets.length} assets
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPerson(person.id);
                        setNewPersonName(person.name);
                      }}
                      style={{
                        padding: '4px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        opacity: 0.6,
                      }}
                    >
                      <EditIcon />
                    </button>
                  </div>
                ))}

                {/* Unknown faces */}
                {faces.filter(f => !f.personId).length > 0 && (
                  <div
                    onClick={() => setSelectedPerson('unknown')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      backgroundColor: selectedPerson === 'unknown' ? 'var(--primary-muted)' : 'transparent',
                      cursor: 'pointer',
                      marginTop: '8px',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '12px',
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                    }}>
                      ?
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Unknown</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {faces.filter(f => !f.personId).length} detections
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Face results */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}>
                {filteredFaces.map(face => (
                  <div
                    key={face.id}
                    style={{
                      backgroundColor: 'var(--bg-1)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Face thumbnail placeholder */}
                    <div style={{
                      height: '120px',
                      backgroundColor: 'var(--bg-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                      }}>
                        {face.personName?.charAt(0) || '?'}
                      </div>

                      {face.timestamp !== undefined && (
                        <button
                          onClick={() => handleNavigate(face.assetId, face.timestamp)}
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '11px',
                          }}
                        >
                          <PlayIcon />
                          {formatTime(face.timestamp)}
                        </button>
                      )}
                    </div>

                    <div style={{ padding: '12px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}>
                        <span style={{ fontWeight: 500, fontSize: '14px' }}>
                          {face.personName || 'Unknown'}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--bg-2)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}>
                          {Math.round(face.confidence * 100)}% match
                        </span>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}>
                        <div>
                          <span style={{ opacity: 0.7 }}>Emotion:</span>{' '}
                          <span style={{ color: 'var(--text)' }}>{getTopEmotion(face.emotions)}</span>
                        </div>
                        <div>
                          <span style={{ opacity: 0.7 }}>Age:</span>{' '}
                          <span style={{ color: 'var(--text)' }}>
                            {face.ageRange ? `${face.ageRange.low}-${face.ageRange.high}` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span style={{ opacity: 0.7 }}>Gender:</span>{' '}
                          <span style={{ color: 'var(--text)' }}>{face.gender?.value || 'N/A'}</span>
                        </div>
                        <div>
                          <span style={{ opacity: 0.7 }}>Asset:</span>{' '}
                          <span style={{ color: 'var(--primary)' }}>{face.assetId.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFaces.length === 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 20px',
                  color: 'var(--text-secondary)',
                }}>
                  <UserIcon />
                  <p style={{ marginTop: '12px' }}>
                    {faces.length === 0
                      ? 'No faces detected yet. Upload images or videos to start AI analysis.'
                      : 'No faces found matching your criteria'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scenes Tab */}
        {activeTab === 'scenes' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}>
              {filteredScenes.map(scene => (
                <div
                  key={scene.id}
                  style={{
                    backgroundColor: 'var(--bg-1)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Scene thumbnail placeholder */}
                  <div style={{
                    height: '140px',
                    backgroundColor: 'var(--bg-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <FilmIcon />

                    <button
                      onClick={() => handleNavigate(scene.assetId, scene.startTime)}
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      <PlayIcon />
                      {formatTime(scene.startTime)}
                    </button>

                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '11px',
                    }}>
                      <ClockIcon />
                      {scene.duration.toFixed(1)}s
                    </div>
                  </div>

                  <div style={{ padding: '12px' }}>
                    {/* Labels */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '12px',
                    }}>
                      {scene.labels.map((label, i) => (
                        <span
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            backgroundColor: 'var(--primary-muted)',
                            color: 'var(--primary)',
                            borderRadius: '4px',
                            fontSize: '11px',
                          }}
                        >
                          <TagIcon />
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Shot info */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px',
                      fontSize: '12px',
                    }}>
                      <div style={{
                        padding: '8px',
                        backgroundColor: 'var(--bg-0)',
                        borderRadius: '4px',
                        textAlign: 'center',
                      }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '2px' }}>Shot</div>
                        <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{scene.shotType || 'N/A'}</div>
                      </div>
                      <div style={{
                        padding: '8px',
                        backgroundColor: 'var(--bg-0)',
                        borderRadius: '4px',
                        textAlign: 'center',
                      }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '2px' }}>Movement</div>
                        <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{scene.movement || 'N/A'}</div>
                      </div>
                      <div style={{
                        padding: '8px',
                        backgroundColor: 'var(--bg-0)',
                        borderRadius: '4px',
                        textAlign: 'center',
                      }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '2px' }}>Lighting</div>
                        <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{scene.lighting || 'N/A'}</div>
                      </div>
                    </div>

                    <div style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <span>Confidence: {Math.round(scene.confidence * 100)}%</span>
                      <span style={{ color: 'var(--primary)' }}>{scene.assetId.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredScenes.length === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                color: 'var(--text-secondary)',
              }}>
                <FilmIcon />
                <p style={{ marginTop: '12px' }}>
                  {scenes.length === 0
                    ? 'No scenes detected yet. Upload videos to start scene analysis.'
                    : 'No scenes found matching your criteria'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Transcript Tab */}
        {activeTab === 'transcript' && (
          <div>
            {searchQuery && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'var(--primary-muted)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
              }}>
                Found <strong>{filteredTranscripts.length}</strong> segments containing &quot;{searchQuery}&quot;
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {filteredTranscripts.map((segment) => {
                const highlightedText = searchQuery
                  ? segment.text.replace(
                      new RegExp(`(${searchQuery})`, 'gi'),
                      '<mark style="background-color: var(--warning); color: black; padding: 0 2px; border-radius: 2px;">$1</mark>'
                    )
                  : segment.text;

                return (
                  <div
                    key={segment.id}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '16px',
                      backgroundColor: 'var(--bg-1)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* Timestamp */}
                    <button
                      onClick={() => handleNavigate(segment.assetId, segment.startTime)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        backgroundColor: 'var(--bg-0)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        flexShrink: 0,
                        height: 'fit-content',
                      }}
                    >
                      <PlayIcon />
                      {formatTime(segment.startTime)}
                    </button>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      {segment.speaker && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '6px',
                          color: 'var(--primary)',
                          fontSize: '13px',
                          fontWeight: 500,
                        }}>
                          <UserIcon />
                          {segment.speaker}
                        </div>
                      )}
                      <p
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          lineHeight: 1.6,
                          color: 'var(--text)',
                        }}
                        dangerouslySetInnerHTML={{ __html: highlightedText }}
                      />
                      <div style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        gap: '16px',
                      }}>
                        <span>Duration: {(segment.endTime - segment.startTime).toFixed(1)}s</span>
                        <span>Confidence: {Math.round(segment.confidence * 100)}%</span>
                        <span style={{ color: 'var(--primary)' }}>{segment.assetId.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTranscripts.length === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                color: 'var(--text-secondary)',
              }}>
                <MicIcon />
                <p style={{ marginTop: '12px' }}>
                  {transcripts.length === 0
                    ? 'No transcripts available yet. Upload audio or video files to start transcription.'
                    : searchQuery ? `No transcript segments found containing "${searchQuery}"` : 'No transcripts available'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div>
            {/* Jobs Header with Start Analysis Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Analysis Jobs</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {jobs.length} job{jobs.length !== 1 ? 's' : ''} • {jobs.filter(j => j.status === 'processing' || j.status === 'queued').length} active
                </p>
              </div>
              <button
                onClick={openAnalysisModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <SparklesIcon />
                Start Analysis
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {jobs.map(job => (
                <div
                  key={job.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: 'var(--bg-1)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  {/* Status icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: job.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' :
                                     job.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' :
                                     job.status === 'processing' ? 'rgba(59, 130, 246, 0.1)' :
                                     'var(--bg-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: job.status === 'completed' ? '#22c55e' :
                           job.status === 'failed' ? '#ef4444' :
                           job.status === 'processing' ? '#3b82f6' :
                           'var(--text-secondary)',
                  }}>
                    {job.status === 'completed' ? <CheckIcon /> :
                     job.status === 'failed' ? <AlertIcon /> :
                     job.status === 'processing' ? <RefreshIcon /> :
                     <ClockIcon />}
                  </div>

                  {/* Job info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {job.assetName}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}>
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: 'var(--bg-2)',
                        borderRadius: '4px',
                        textTransform: 'capitalize',
                      }}>
                        {job.type.replace('_', ' ')}
                      </span>
                      {job.startedAt && (
                        <span>Started {new Date(job.startedAt).toLocaleTimeString()}</span>
                      )}
                      {job.completedAt && (
                        <span>Completed {new Date(job.completedAt).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  {(job.status === 'processing' || job.status === 'queued') && (
                    <div style={{ width: '120px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        marginBottom: '4px',
                        color: 'var(--text-secondary)',
                      }}>
                        <span>{job.status === 'queued' ? 'Queued' : 'Processing'}</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div style={{
                        height: '4px',
                        backgroundColor: 'var(--bg-2)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${job.progress}%`,
                          backgroundColor: job.status === 'queued' ? 'var(--text-secondary)' : 'var(--primary)',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Status badge */}
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    backgroundColor: job.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' :
                                     job.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' :
                                     job.status === 'processing' ? 'rgba(59, 130, 246, 0.1)' :
                                     'var(--bg-2)',
                    color: job.status === 'completed' ? '#22c55e' :
                           job.status === 'failed' ? '#ef4444' :
                           job.status === 'processing' ? '#3b82f6' :
                           'var(--text-secondary)',
                  }}>
                    {job.status}
                  </div>
                </div>
              ))}
            </div>

            {jobs.length === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                color: 'var(--text-secondary)',
              }}>
                <SparklesIcon />
                <p style={{ marginTop: '12px', fontWeight: 500 }}>No AI analysis jobs yet</p>
                <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '16px' }}>
                  Click &quot;Start Analysis&quot; above to analyze your media files
                </p>
                <button
                  onClick={openAnalysisModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  <SparklesIcon />
                  Start Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-0)',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Start AI Analysis</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Select media files to analyze with AI
                </p>
              </div>
              <button
                onClick={() => setShowAnalysisModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: 'var(--text-secondary)',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {isLoadingAssets ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-secondary)',
                }}>
                  <RefreshIcon />
                  <p style={{ marginTop: '12px' }}>Loading assets...</p>
                </div>
              ) : availableAssets.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-secondary)',
                }}>
                  <p>No media files found in this project.</p>
                  <p style={{ fontSize: '13px', opacity: 0.7 }}>Upload images, videos, or audio files first.</p>
                  <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>Project ID: {projectId || 'none'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {selectedAssetIds.length} of {availableAssets.length} selected
                    </span>
                    <button
                      onClick={() => {
                        if (selectedAssetIds.length === availableAssets.length) {
                          setSelectedAssetIds([]);
                        } else {
                          setSelectedAssetIds(availableAssets.map(a => a.id));
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      {selectedAssetIds.length === availableAssets.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  {availableAssets.map(asset => (
                    <label
                      key={asset.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: selectedAssetIds.includes(asset.id) ? 'var(--primary-muted)' : 'var(--bg-1)',
                        borderRadius: '8px',
                        border: `1px solid ${selectedAssetIds.includes(asset.id) ? 'var(--primary)' : 'var(--border)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssetIds.includes(asset.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAssetIds(prev => [...prev, asset.id]);
                          } else {
                            setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));
                          }
                        }}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {asset.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {asset.type.replace('/', ' • ')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}>
              <button
                onClick={() => setShowAnalysisModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--bg-2)',
                  color: 'var(--text)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={startAnalysis}
                disabled={selectedAssetIds.length === 0 || isStartingAnalysis}
                style={{
                  padding: '10px 20px',
                  backgroundColor: selectedAssetIds.length === 0 ? 'var(--bg-2)' : 'var(--primary)',
                  color: selectedAssetIds.length === 0 ? 'var(--text-secondary)' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: selectedAssetIds.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isStartingAnalysis ? (
                  <>
                    <RefreshIcon />
                    Starting...
                  </>
                ) : (
                  <>
                    <SparklesIcon />
                    Start Analysis ({selectedAssetIds.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
