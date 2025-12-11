'use client';

import React, { useState } from 'react';
import { type Schema } from '@/amplify/data/resource';

interface ScopeSection {
  id: string;
  title: string;
  type: 'overview' | 'objectives' | 'deliverables' | 'requirements' | 'constraints' | 'assumptions' | 'exclusions' | 'acceptance' | 'stakeholders' | 'timeline' | 'budget' | 'risks';
  content: string;
  status: 'draft' | 'pending_review' | 'approved' | 'locked';
  lastUpdated: string;
  updatedBy: string;
  comments: ScopeComment[];
}

interface ScopeComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  resolved: boolean;
}

interface ScopeVersion {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changeDescription: string;
  sections: ScopeSection[];
}

interface Signoff {
  id: string;
  role: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  signedAt?: string;
  comments?: string;
}

interface ScopeDocumentProps {
  projectId: string;
}

export default function ScopeDocument({ projectId }: ScopeDocumentProps) {
  const [activeTab, setActiveTab] = useState<'document' | 'versions' | 'signoffs'>('document');
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [showNewVersion, setShowNewVersion] = useState(false);

  const [documentStatus, setDocumentStatus] = useState<'draft' | 'in_review' | 'approved' | 'locked'>('draft');
  const [currentVersion, setCurrentVersion] = useState('1.0');

  const [sections, setSections] = useState<ScopeSection[]>([
    {
      id: '1',
      title: 'Project Overview',
      type: 'overview',
      content: 'This document defines the scope, objectives, and boundaries for the production project. It serves as the authoritative reference for all stakeholders regarding what is included and excluded from the project deliverables.',
      status: 'draft',
      lastUpdated: '2024-01-15',
      updatedBy: 'Sarah Chen',
      comments: []
    },
    {
      id: '2',
      title: 'Project Objectives',
      type: 'objectives',
      content: '• Create a compelling 60-second commercial spot\n• Achieve brand awareness goals for Q2 campaign\n• Deliver content suitable for TV, digital, and social media platforms\n• Complete project within approved timeline and budget',
      status: 'pending_review',
      lastUpdated: '2024-01-14',
      updatedBy: 'Michael Torres',
      comments: [
        {
          id: 'c1',
          author: 'Jennifer Wu',
          content: 'Should we add specific KPIs for brand awareness?',
          timestamp: '2024-01-14 14:30',
          resolved: false
        }
      ]
    },
    {
      id: '3',
      title: 'Deliverables',
      type: 'deliverables',
      content: '1. Master 60-second commercial (4K, ProRes)\n2. 30-second cutdown version\n3. 15-second social media edits (3 variations)\n4. Behind-the-scenes content (2-3 minutes)\n5. Still photography package (50 selects)\n6. All raw footage and project files',
      status: 'approved',
      lastUpdated: '2024-01-13',
      updatedBy: 'Sarah Chen',
      comments: []
    },
    {
      id: '4',
      title: 'Technical Requirements',
      type: 'requirements',
      content: '• Resolution: 4K (3840x2160) master, scaled for delivery\n• Frame Rate: 23.976fps for TV, 30fps for digital\n• Color Space: Rec. 709 with HDR deliverable option\n• Audio: 5.1 surround mix + stereo mix\n• Codec: ProRes 422 HQ (master), H.264 (deliverables)\n• Aspect Ratios: 16:9 (TV), 1:1 and 9:16 (social)',
      status: 'draft',
      lastUpdated: '2024-01-15',
      updatedBy: 'Alex Rivera',
      comments: []
    },
    {
      id: '5',
      title: 'Constraints',
      type: 'constraints',
      content: '• Budget: $450,000 total production budget\n• Timeline: 8-week production schedule\n• Talent: Must use pre-approved talent from agency list\n• Location: Filming restricted to Los Angeles metro area\n• Brand Guidelines: All visuals must comply with brand style guide v3.2',
      status: 'draft',
      lastUpdated: '2024-01-12',
      updatedBy: 'Sarah Chen',
      comments: []
    },
    {
      id: '6',
      title: 'Assumptions',
      type: 'assumptions',
      content: '• Client will provide final approved script by Week 1\n• Talent availability confirmed for proposed shoot dates\n• Weather permits outdoor filming as planned\n• All necessary permits obtainable within timeline\n• Post-production facility available for scheduled dates',
      status: 'draft',
      lastUpdated: '2024-01-11',
      updatedBy: 'Michael Torres',
      comments: []
    },
    {
      id: '7',
      title: 'Exclusions (Out of Scope)',
      type: 'exclusions',
      content: '• Media buying and placement\n• Long-form documentary content\n• International versioning and localization\n• Influencer partnerships\n• Paid social media promotion\n• Website development or updates\n• Print advertising materials',
      status: 'pending_review',
      lastUpdated: '2024-01-10',
      updatedBy: 'Jennifer Wu',
      comments: []
    },
    {
      id: '8',
      title: 'Acceptance Criteria',
      type: 'acceptance',
      content: '• All deliverables meet technical specifications\n• Creative aligns with approved treatment and storyboards\n• Client sign-off on final edit within 2 review rounds\n• QC pass on all deliverables\n• All assets delivered to specified destinations\n• Documentation and archival complete',
      status: 'draft',
      lastUpdated: '2024-01-09',
      updatedBy: 'Sarah Chen',
      comments: []
    },
    {
      id: '9',
      title: 'Key Stakeholders',
      type: 'stakeholders',
      content: '• Executive Producer: Sarah Chen (Production Co.)\n• Agency Creative Director: Jennifer Wu\n• Client Brand Manager: David Park\n• Director: Marcus Johnson\n• Line Producer: Michael Torres\n• Post Supervisor: Alex Rivera',
      status: 'approved',
      lastUpdated: '2024-01-08',
      updatedBy: 'Sarah Chen',
      comments: []
    },
    {
      id: '10',
      title: 'Timeline Summary',
      type: 'timeline',
      content: '• Week 1-2: Pre-production and prep\n• Week 3: Principal photography (3 days)\n• Week 4-5: Post-production editorial\n• Week 6: VFX and color grade\n• Week 7: Sound design and mix\n• Week 8: Final QC and delivery',
      status: 'draft',
      lastUpdated: '2024-01-07',
      updatedBy: 'Michael Torres',
      comments: []
    },
    {
      id: '11',
      title: 'Budget Allocation',
      type: 'budget',
      content: '• Pre-production: $45,000 (10%)\n• Production: $225,000 (50%)\n• Post-production: $112,500 (25%)\n• Contingency: $45,000 (10%)\n• Insurance & Legal: $22,500 (5%)\n\nTotal: $450,000',
      status: 'pending_review',
      lastUpdated: '2024-01-06',
      updatedBy: 'Sarah Chen',
      comments: []
    },
    {
      id: '12',
      title: 'Risk Factors',
      type: 'risks',
      content: '• Weather dependency for outdoor scenes\n• Talent schedule changes\n• Location permit delays\n• Post-production facility availability\n• Client revision cycles exceeding allocation\n\nMitigation strategies documented in project risk register.',
      status: 'draft',
      lastUpdated: '2024-01-05',
      updatedBy: 'Michael Torres',
      comments: []
    }
  ]);

  const [versions, setVersions] = useState<ScopeVersion[]>([
    {
      id: 'v1',
      version: '1.0',
      createdAt: '2024-01-05',
      createdBy: 'Sarah Chen',
      changeDescription: 'Initial scope document creation',
      sections: []
    },
    {
      id: 'v2',
      version: '0.9',
      createdAt: '2024-01-03',
      createdBy: 'Sarah Chen',
      changeDescription: 'Draft for internal review',
      sections: []
    }
  ]);

  const [signoffs, setSignoffs] = useState<Signoff[]>([
    {
      id: 's1',
      role: 'Executive Producer',
      name: 'Sarah Chen',
      email: 'sarah@production.com',
      status: 'approved',
      signedAt: '2024-01-10'
    },
    {
      id: 's2',
      role: 'Agency Creative Director',
      name: 'Jennifer Wu',
      email: 'jennifer@agency.com',
      status: 'approved',
      signedAt: '2024-01-11'
    },
    {
      id: 's3',
      role: 'Client Brand Manager',
      name: 'David Park',
      email: 'david@client.com',
      status: 'pending'
    },
    {
      id: 's4',
      role: 'Line Producer',
      name: 'Michael Torres',
      email: 'michael@production.com',
      status: 'pending'
    }
  ]);

  const getSectionIcon = (type: ScopeSection['type']) => {
    switch (type) {
      case 'overview':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'objectives':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      case 'deliverables':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        );
      case 'requirements':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        );
      case 'constraints':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case 'assumptions':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'exclusions':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        );
      case 'acceptance':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'stakeholders':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'timeline':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'budget':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case 'risks':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: ScopeSection['status']) => {
    switch (status) {
      case 'draft':
        return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9CA3AF' };
      case 'pending_review':
        return { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24' };
      case 'approved':
        return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E' };
      case 'locked':
        return { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366F1' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9CA3AF' };
    }
  };

  const getDocumentStatusColor = (status: typeof documentStatus) => {
    switch (status) {
      case 'draft':
        return { bg: 'rgba(156, 163, 175, 0.2)', text: '#9CA3AF' };
      case 'in_review':
        return { bg: 'rgba(251, 191, 36, 0.2)', text: '#FBBF24' };
      case 'approved':
        return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22C55E' };
      case 'locked':
        return { bg: 'rgba(99, 102, 241, 0.2)', text: '#6366F1' };
    }
  };

  const getSignoffStatusColor = (status: Signoff['status']) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24' };
      case 'approved':
        return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' };
    }
  };

  const approvedCount = sections.filter(s => s.status === 'approved').length;
  const pendingCount = sections.filter(s => s.status === 'pending_review').length;
  const draftCount = sections.filter(s => s.status === 'draft').length;
  const completionPercentage = Math.round((approvedCount / sections.length) * 100);

  const signoffApprovedCount = signoffs.filter(s => s.status === 'approved').length;
  const signoffPendingCount = signoffs.filter(s => s.status === 'pending').length;

  const handleSectionUpdate = (sectionId: string, newContent: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, content: newContent, lastUpdated: new Date().toISOString().split('T')[0], status: 'draft' as const }
        : s
    ));
    setEditingSection(null);
  };

  const handleSectionStatusChange = (sectionId: string, newStatus: ScopeSection['status']) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, status: newStatus } : s
    ));
  };

  return (
    <div style={{ padding: '24px', backgroundColor: 'var(--bg-1)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-1)', marginBottom: '4px' }}>
              Scope Document
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-2)' }}>
              Define project boundaries, deliverables, and acceptance criteria
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: getDocumentStatusColor(documentStatus).bg,
              color: getDocumentStatusColor(documentStatus).text,
              fontSize: '13px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: getDocumentStatusColor(documentStatus).text
              }} />
              {documentStatus.replace('_', ' ').toUpperCase()}
            </div>
            <div style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-2)',
              color: 'var(--text-2)',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              v{currentVersion}
            </div>
            <button
              onClick={() => setShowNewVersion(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-1)',
                backgroundColor: 'var(--bg-2)',
                color: 'var(--text-1)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Version
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--bg-2)',
          borderRadius: '12px',
          border: '1px solid var(--border-1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-1)' }}>
              Document Completion
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>
              {completionPercentage}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--bg-3)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completionPercentage}%`,
              height: '100%',
              backgroundColor: 'var(--primary)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>{approvedCount} Approved</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FBBF24' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>{pendingCount} Pending Review</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9CA3AF' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>{draftCount} Draft</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        backgroundColor: 'var(--bg-2)',
        borderRadius: '10px',
        marginBottom: '24px',
        width: 'fit-content'
      }}>
        {[
          { id: 'document', label: 'Document', count: sections.length },
          { id: 'versions', label: 'Versions', count: versions.length },
          { id: 'signoffs', label: 'Sign-offs', count: signoffs.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'var(--bg-1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-1)' : 'var(--text-2)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {tab.label}
            <span style={{
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-3)',
              color: activeTab === tab.id ? 'white' : 'var(--text-2)',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Document Tab */}
      {activeTab === 'document' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sections.map(section => (
            <div
              key={section.id}
              style={{
                backgroundColor: 'var(--bg-2)',
                borderRadius: '12px',
                border: '1px solid var(--border-1)',
                overflow: 'hidden'
              }}
            >
              {/* Section Header */}
              <div
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-2)'
                  }}>
                    {getSectionIcon(section.type)}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-1)' }}>
                      {section.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                      Updated {section.lastUpdated} by {section.updatedBy}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {section.comments.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                      color: '#FBBF24',
                      fontSize: '12px'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {section.comments.filter(c => !c.resolved).length}
                    </div>
                  )}
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: getStatusColor(section.status).bg,
                    color: getStatusColor(section.status).text,
                    fontSize: '12px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {section.status.replace('_', ' ')}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-2)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: expandedSection === section.id ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Section Content */}
              {expandedSection === section.id && (
                <div style={{ borderTop: '1px solid var(--border-1)' }}>
                  <div style={{ padding: '16px' }}>
                    {editingSection === section.id ? (
                      <div>
                        <textarea
                          defaultValue={section.content}
                          style={{
                            width: '100%',
                            minHeight: '150px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-1)',
                            backgroundColor: 'var(--bg-1)',
                            color: 'var(--text-1)',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                          id={`section-editor-${section.id}`}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button
                            onClick={() => {
                              const textarea = document.getElementById(`section-editor-${section.id}`) as HTMLTextAreaElement;
                              handleSectionUpdate(section.id, textarea.value);
                            }}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: 'var(--primary)',
                              color: 'white',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingSection(null)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-1)',
                              backgroundColor: 'transparent',
                              color: 'var(--text-2)',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: '14px',
                          lineHeight: '1.7',
                          color: 'var(--text-1)',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {section.content}
                      </div>
                    )}
                  </div>

                  {/* Section Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-3)',
                    borderTop: '1px solid var(--border-1)'
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setEditingSection(section.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-1)',
                          backgroundColor: 'var(--bg-1)',
                          color: 'var(--text-1)',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setShowComments(showComments === section.id ? null : section.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-1)',
                          backgroundColor: showComments === section.id ? 'var(--primary)' : 'var(--bg-1)',
                          color: showComments === section.id ? 'white' : 'var(--text-1)',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Comments ({section.comments.length})
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {section.status === 'draft' && (
                        <button
                          onClick={() => handleSectionStatusChange(section.id, 'pending_review')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'rgba(251, 191, 36, 0.15)',
                            color: '#FBBF24',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Submit for Review
                        </button>
                      )}
                      {section.status === 'pending_review' && (
                        <button
                          onClick={() => handleSectionStatusChange(section.id, 'approved')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                            color: '#22C55E',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Approve Section
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comments Panel */}
                  {showComments === section.id && (
                    <div style={{
                      padding: '16px',
                      borderTop: '1px solid var(--border-1)',
                      backgroundColor: 'var(--bg-1)'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-1)', marginBottom: '12px' }}>
                        Comments
                      </div>
                      {section.comments.length === 0 ? (
                        <div style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                          No comments yet
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {section.comments.map(comment => (
                            <div
                              key={comment.id}
                              style={{
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: comment.resolved ? 'var(--bg-2)' : 'rgba(251, 191, 36, 0.05)',
                                border: `1px solid ${comment.resolved ? 'var(--border-1)' : 'rgba(251, 191, 36, 0.2)'}`,
                                opacity: comment.resolved ? 0.6 : 1
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-1)' }}>
                                  {comment.author}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                                  {comment.timestamp}
                                </span>
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.5' }}>
                                {comment.content}
                              </div>
                              {!comment.resolved && (
                                <button
                                  style={{
                                    marginTop: '8px',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-1)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-2)',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Resolve
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-1)',
                            backgroundColor: 'var(--bg-2)',
                            color: 'var(--text-1)',
                            fontSize: '13px'
                          }}
                        />
                        <button
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Versions Tab */}
      {activeTab === 'versions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {versions.map((version, index) => (
            <div
              key={version.id}
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-2)',
                borderRadius: '12px',
                border: index === 0 ? '2px solid var(--primary)' : '1px solid var(--border-1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: index === 0 ? 'var(--primary)' : 'var(--bg-3)',
                      color: index === 0 ? 'white' : 'var(--text-2)',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      v{version.version}
                    </span>
                    {index === 0 && (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        color: '#22C55E',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        Current
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-1)', marginBottom: '4px' }}>
                    {version.changeDescription}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                    Created by {version.createdBy} on {version.createdAt}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-1)',
                      backgroundColor: 'var(--bg-1)',
                      color: 'var(--text-1)',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    View
                  </button>
                  {index !== 0 && (
                    <button
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-1)',
                        backgroundColor: 'var(--bg-1)',
                        color: 'var(--text-1)',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Compare
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sign-offs Tab */}
      {activeTab === 'signoffs' && (
        <div>
          {/* Sign-off Status Summary */}
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--bg-2)',
            borderRadius: '12px',
            border: '1px solid var(--border-1)',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-1)' }}>
                Sign-off Progress
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>
                {signoffApprovedCount} of {signoffs.length} approved
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--bg-3)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(signoffApprovedCount / signoffs.length) * 100}%`,
                height: '100%',
                backgroundColor: '#22C55E',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Signoff List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {signoffs.map(signoff => (
              <div
                key={signoff.id}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-2)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-2)',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {signoff.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-1)' }}>
                      {signoff.name}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                      {signoff.role}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                      {signoff.email}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {signoff.signedAt && (
                    <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                      Signed {signoff.signedAt}
                    </span>
                  )}
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: getSignoffStatusColor(signoff.status).bg,
                    color: getSignoffStatusColor(signoff.status).text,
                    fontSize: '13px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {signoff.status}
                  </span>
                  {signoff.status === 'pending' && (
                    <button
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Send Reminder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Request Additional Sign-off */}
          <button
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px dashed var(--border-1)',
              backgroundColor: 'transparent',
              color: 'var(--text-2)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Request Additional Sign-off
          </button>
        </div>
      )}

      {/* New Version Modal */}
      {showNewVersion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'var(--bg-1)',
            borderRadius: '16px',
            padding: '24px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-1)' }}>
                Save New Version
              </h3>
              <button
                onClick={() => setShowNewVersion(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-2)',
                  padding: '4px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-1)', marginBottom: '8px' }}>
                  Version Number
                </label>
                <input
                  type="text"
                  defaultValue="1.1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-1)',
                    backgroundColor: 'var(--bg-2)',
                    color: 'var(--text-1)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-1)', marginBottom: '8px' }}>
                  Change Description
                </label>
                <textarea
                  placeholder="Describe the changes in this version..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-1)',
                    backgroundColor: 'var(--bg-2)',
                    color: 'var(--text-1)',
                    fontSize: '14px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#6366F1' }}>Version Info</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.5' }}>
                  Saving a new version will create a snapshot of the current document. Previous versions will remain accessible for comparison.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowNewVersion(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-1)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-1)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewVersion(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Save Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
