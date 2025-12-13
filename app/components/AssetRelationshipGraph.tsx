'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * ASSET RELATIONSHIP GRAPH
 * Content lineage and relationship visualization
 *
 * Enterprise features matching Iconik MAM, Frame.io:
 * - Visual relationship mapping between assets
 * - Source/derivative tracking (parent-child)
 * - Project-based asset grouping
 * - Version lineage visualization
 * - Usage tracking across projects
 * - Compliance chain verification
 * - Impact analysis for changes
 */

// Types
interface AssetNode {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document' | 'project' | 'deliverable';
  thumbnail?: string;
  status: 'active' | 'archived' | 'deleted';
  createdAt: string;
  modifiedAt: string;
  size?: number;
  duration?: number;
  version?: number;
}

interface AssetRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  metadata?: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
}

type RelationshipType =
  | 'derived_from' // Target was created from source (e.g., proxy from master)
  | 'version_of' // Target is a newer version of source
  | 'contains' // Source contains target (e.g., project contains assets)
  | 'references' // Source references target (e.g., edit uses footage)
  | 'depends_on' // Source depends on target (e.g., deliverable needs approval)
  | 'exported_to' // Source was exported as target
  | 'transcoded_from' // Target is a transcode of source
  | 'clipped_from'; // Target is a clip/segment from source

interface RelationshipGraphProps {
  organizationId: string;
  projectId?: string;
  assetId?: string;
  currentUserEmail: string;
}

interface GraphNode extends AssetNode {
  x: number;
  y: number;
  level: number;
  group: string;
}

// SVG Icons
const NetworkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="3" />
    <circle cx="19" cy="12" r="3" />
    <circle cx="5" cy="12" r="3" />
    <circle cx="12" cy="19" r="3" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8.5" y1="6.5" x2="5" y2="9.5" />
    <line x1="15.5" y1="6.5" x2="19" y2="9.5" />
  </svg>
);

const VideoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const AudioIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const GitBranchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const MaximizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  derived_from: '#8b5cf6',
  version_of: '#3b82f6',
  contains: '#10b981',
  references: '#f59e0b',
  depends_on: '#ef4444',
  exported_to: '#06b6d4',
  transcoded_from: '#ec4899',
  clipped_from: '#84cc16',
};

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  derived_from: 'Derived From',
  version_of: 'Version Of',
  contains: 'Contains',
  references: 'References',
  depends_on: 'Depends On',
  exported_to: 'Exported To',
  transcoded_from: 'Transcoded From',
  clipped_from: 'Clipped From',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <VideoIcon />,
  image: <ImageIcon />,
  audio: <AudioIcon />,
  document: <FileIcon />,
  project: <FolderIcon />,
  deliverable: <PackageIcon />,
};

const TYPE_COLORS: Record<string, string> = {
  video: '#ef4444',
  image: '#10b981',
  audio: '#f59e0b',
  document: '#6366f1',
  project: '#3b82f6',
  deliverable: '#8b5cf6',
};

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDuration = (seconds: number): string => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function AssetRelationshipGraph({
  organizationId,
  projectId,
  assetId,
  currentUserEmail,
}: RelationshipGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(assetId || null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'graph' | 'tree' | 'list'>('graph');
  const [filterType, setFilterType] = useState<RelationshipType | 'all'>('all');
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Amplify client
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Real data from Amplify and localStorage
  const [nodes, setNodes] = useState<AssetNode[]>([]);
  const [relationships, setRelationships] = useState<AssetRelationship[]>([]);

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Load nodes from Asset model and relationships from localStorage
  useEffect(() => {
    if (!client) return;

    async function loadData() {
      setIsLoading(true);
      try {
        // Load assets from Amplify
        const filter: Record<string, unknown> = {};
        if (projectId) {
          filter.projectId = { eq: projectId };
        }

        const result = await client?.models.Asset.list({ filter });
        const assetList = result?.data || [];

        // Convert assets to graph nodes
        const assetNodes: AssetNode[] = assetList.map(asset => {
          const mimeType = (asset.mimeType || asset.type || '').toLowerCase();
          let nodeType: AssetNode['type'] = 'document';
          if (mimeType.includes('video') || mimeType.includes('mp4') || mimeType.includes('mov')) {
            nodeType = 'video';
          } else if (mimeType.includes('image') || mimeType.includes('jpg') || mimeType.includes('png')) {
            nodeType = 'image';
          } else if (mimeType.includes('audio') || mimeType.includes('mp3') || mimeType.includes('wav')) {
            nodeType = 'audio';
          }

          return {
            id: asset.id,
            name: asset.s3Key?.split('/').pop() || 'Unknown',
            type: nodeType,
            status: 'active' as const,
            createdAt: asset.createdAt || new Date().toISOString(),
            modifiedAt: asset.updatedAt || asset.createdAt || new Date().toISOString(),
            size: asset.fileSize || undefined,
            version: asset.version || undefined,
          };
        });

        setNodes(assetNodes);

        // Load relationships from localStorage
        const savedRelationships = localStorage.getItem(`asset-relationships-${organizationId}-${projectId || 'all'}`);
        if (savedRelationships) {
          try {
            setRelationships(JSON.parse(savedRelationships));
          } catch {
            setRelationships([]);
          }
        }
      } catch (error) {
        console.error('Error loading graph data:', error);
        setNodes([]);
        setRelationships([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [client, projectId, organizationId]);

  // Save relationships to localStorage
  useEffect(() => {
    if (relationships.length > 0 || localStorage.getItem(`asset-relationships-${organizationId}-${projectId || 'all'}`)) {
      localStorage.setItem(`asset-relationships-${organizationId}-${projectId || 'all'}`, JSON.stringify(relationships));
    }
  }, [relationships, organizationId, projectId]);

  // Filter relationships based on selected type
  const filteredRelationships = useMemo(() => {
    if (filterType === 'all') return relationships;
    return relationships.filter(r => r.type === filterType);
  }, [relationships, filterType]);

  // Get nodes connected to selected node
  const getConnectedNodes = useCallback((nodeId: string): Set<string> => {
    const connected = new Set<string>();
    connected.add(nodeId);

    const queue = [nodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      filteredRelationships.forEach(rel => {
        if (rel.sourceId === current && !visited.has(rel.targetId)) {
          connected.add(rel.targetId);
          queue.push(rel.targetId);
        }
        if (rel.targetId === current && !visited.has(rel.sourceId)) {
          connected.add(rel.sourceId);
          queue.push(rel.sourceId);
        }
      });
    }

    return connected;
  }, [filteredRelationships]);

  // Calculate impact analysis
  const impactAnalysis = useMemo(() => {
    if (!selectedNode) return null;

    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return null;

    const dependents: AssetNode[] = [];
    const dependencies: AssetNode[] = [];

    relationships.forEach(rel => {
      if (rel.sourceId === selectedNode) {
        const targetNode = nodes.find(n => n.id === rel.targetId);
        if (targetNode) dependents.push(targetNode);
      }
      if (rel.targetId === selectedNode) {
        const sourceNode = nodes.find(n => n.id === rel.sourceId);
        if (sourceNode) dependencies.push(sourceNode);
      }
    });

    return {
      node,
      dependents: dependents.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i),
      dependencies: dependencies.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i),
    };
  }, [selectedNode, nodes, relationships]);

  // Simple graph layout
  const graphNodes = useMemo((): GraphNode[] => {
    const result: GraphNode[] = [];
    const levels: Record<string, number> = {};
    const groups: Record<string, string> = {};

    // Assign levels based on relationships
    nodes.forEach(node => {
      if (node.type === 'project') {
        levels[node.id] = 0;
        groups[node.id] = 'project';
      } else if (node.type === 'deliverable') {
        levels[node.id] = 3;
        groups[node.id] = 'deliverable';
      } else if (node.id.includes('master')) {
        levels[node.id] = 1;
        groups[node.id] = 'master';
      } else {
        levels[node.id] = 2;
        groups[node.id] = node.type;
      }
    });

    // Position nodes
    const levelCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    const levelWidths: Record<number, number> = {};

    Object.entries(levels).forEach(([id, level]) => {
      levelWidths[level] = (levelWidths[level] || 0) + 1;
    });

    nodes.forEach(node => {
      const level = levels[node.id] || 2;
      const posInLevel = levelCounts[level]++;
      const totalInLevel = levelWidths[level] || 1;
      const spacing = 800 / (totalInLevel + 1);

      result.push({
        ...node,
        x: spacing * (posInLevel + 1),
        y: 100 + level * 150,
        level,
        group: groups[node.id],
      });
    });

    return result;
  }, [nodes]);

  const selectedNodeData = selectedNode ? graphNodes.find(n => n.id === selectedNode) : null;

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
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NetworkIcon />
            Asset Relationships
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Content lineage, dependencies & impact analysis
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '13px',
            }}
          >
            <option value="all">All Relationships</option>
            {Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-1)', borderRadius: '6px', padding: '4px' }}>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
            >
              <ZoomOutIcon />
            </button>
            <span style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
            >
              <ZoomInIcon />
            </button>
            <button
              onClick={() => setZoom(1)}
              style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
            >
              <MaximizeIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Graph Canvas */}
        <div
          ref={canvasRef}
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: 'var(--bg-1)',
            position: 'relative',
          }}
        >
          <svg
            width={800 * zoom}
            height={700 * zoom}
            style={{ display: 'block' }}
          >
            <defs>
              {/* Arrow markers for each relationship type */}
              {Object.entries(RELATIONSHIP_COLORS).map(([type, color]) => (
                <marker
                  key={type}
                  id={`arrow-${type}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                </marker>
              ))}
            </defs>

            <g transform={`scale(${zoom})`}>
              {/* Relationship lines */}
              {filteredRelationships.map(rel => {
                const source = graphNodes.find(n => n.id === rel.sourceId);
                const target = graphNodes.find(n => n.id === rel.targetId);
                if (!source || !target) return null;

                const isHighlighted = selectedNode && (rel.sourceId === selectedNode || rel.targetId === selectedNode);
                const color = RELATIONSHIP_COLORS[rel.type];

                return (
                  <g key={rel.id}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={color}
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeOpacity={selectedNode && !isHighlighted ? 0.2 : 0.6}
                      markerEnd={`url(#arrow-${rel.type})`}
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {graphNodes.map(node => {
                const isSelected = selectedNode === node.id;
                const isConnected = selectedNode ? getConnectedNodes(selectedNode).has(node.id) : true;
                const color = TYPE_COLORS[node.type];

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                    style={{ cursor: 'pointer' }}
                    opacity={selectedNode && !isConnected ? 0.3 : 1}
                  >
                    {/* Node circle */}
                    <circle
                      r={isSelected ? 32 : 28}
                      fill={isSelected ? color : 'var(--bg-0)'}
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 2}
                    />

                    {/* Status indicator */}
                    {node.status === 'archived' && (
                      <circle
                        cx={18}
                        cy={-18}
                        r={8}
                        fill="#f59e0b"
                      />
                    )}

                    {/* Version badge */}
                    {node.version && (
                      <g transform="translate(20, 15)">
                        <rect x={-12} y={-8} width={24} height={16} rx={8} fill={color} />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize={10}
                          fontWeight={600}
                        >
                          v{node.version}
                        </text>
                      </g>
                    )}

                    {/* Icon placeholder */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isSelected ? 'white' : color}
                      fontSize={12}
                    >
                      {node.type.charAt(0).toUpperCase()}
                    </text>

                    {/* Label */}
                    <text
                      y={45}
                      textAnchor="middle"
                      fill="var(--text)"
                      fontSize={11}
                      fontWeight={500}
                    >
                      {node.name.length > 20 ? node.name.slice(0, 20) + '...' : node.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Details Panel */}
        <div style={{
          width: '320px',
          borderLeft: '1px solid var(--border)',
          backgroundColor: 'var(--bg-0)',
          overflow: 'auto',
        }}>
          {selectedNodeData ? (
            <div style={{ padding: '20px' }}>
              {/* Node Header */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: `${TYPE_COLORS[selectedNodeData.type]}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: TYPE_COLORS[selectedNodeData.type],
                  }}>
                    {TYPE_ICONS[selectedNodeData.type]}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>{selectedNodeData.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {selectedNodeData.type}
                      {selectedNodeData.version && ` • v${selectedNodeData.version}`}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  backgroundColor: selectedNodeData.status === 'active' ? 'rgba(34, 197, 94, 0.1)' :
                                  selectedNodeData.status === 'archived' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: selectedNodeData.status === 'active' ? '#22c55e' :
                         selectedNodeData.status === 'archived' ? '#f59e0b' : '#ef4444',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                }}>
                  {selectedNodeData.status}
                </span>
              </div>

              {/* Properties */}
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--bg-1)',
                borderRadius: '10px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  PROPERTIES
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {selectedNodeData.size && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Size</span>
                      <span style={{ fontWeight: 500 }}>{formatBytes(selectedNodeData.size)}</span>
                    </div>
                  )}
                  {selectedNodeData.duration && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Duration</span>
                      <span style={{ fontWeight: 500 }}>{formatDuration(selectedNodeData.duration)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Created</span>
                    <span style={{ fontWeight: 500 }}>{new Date(selectedNodeData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Modified</span>
                    <span style={{ fontWeight: 500 }}>{new Date(selectedNodeData.modifiedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Impact Analysis */}
              {impactAnalysis && (
                <>
                  {/* Dependencies */}
                  {impactAnalysis.dependencies.length > 0 && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-1)',
                      borderRadius: '10px',
                      marginBottom: '16px',
                    }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <ArrowRightIcon />
                        DEPENDS ON ({impactAnalysis.dependencies.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {impactAnalysis.dependencies.map(dep => (
                          <button
                            key={dep.id}
                            onClick={() => setSelectedNode(dep.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 10px',
                              backgroundColor: 'var(--bg-0)',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <span style={{ color: TYPE_COLORS[dep.type] }}>{TYPE_ICONS[dep.type]}</span>
                            <span style={{ flex: 1, fontSize: '12px', color: 'var(--text)' }}>
                              {dep.name.length > 25 ? dep.name.slice(0, 25) + '...' : dep.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dependents (Impact) */}
                  {impactAnalysis.dependents.length > 0 && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      borderRadius: '10px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#ef4444',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <AlertIcon />
                        IMPACTS ({impactAnalysis.dependents.length} assets)
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        Changes to this asset may affect:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {impactAnalysis.dependents.map(dep => (
                          <button
                            key={dep.id}
                            onClick={() => setSelectedNode(dep.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 10px',
                              backgroundColor: 'var(--bg-0)',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <span style={{ color: TYPE_COLORS[dep.type] }}>{TYPE_ICONS[dep.type]}</span>
                            <span style={{ flex: 1, fontSize: '12px', color: 'var(--text)' }}>
                              {dep.name.length > 25 ? dep.name.slice(0, 25) + '...' : dep.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '40px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'var(--text-secondary)',
              }}>
                <InfoIcon />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Select an Asset</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Click on any node in the graph to view its relationships and impact analysis
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        padding: '12px 24px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        backgroundColor: 'var(--bg-1)',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>LEGEND:</span>
        {Object.entries(RELATIONSHIP_LABELS).map(([type, label]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '20px',
              height: '3px',
              backgroundColor: RELATIONSHIP_COLORS[type as RelationshipType],
              borderRadius: '2px',
            }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '14px 20px',
          backgroundColor: toast.type === 'success' ? '#22c55e' : '#3b82f6',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: 500,
          animation: 'slideIn 0.3s ease',
        }}>
          <NetworkIcon />
          {toast.message}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
