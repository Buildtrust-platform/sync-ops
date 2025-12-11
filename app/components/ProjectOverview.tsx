"use client";

import type { Schema } from "@/amplify/data/resource";

/**
 * PROJECT OVERVIEW DASHBOARD
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const ChartBarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const ClapperboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4Z"/>
    <path d="m4 11-.88-2.87a2 2 0 0 1 1.33-2.5l11.48-3.5a2 2 0 0 1 2.5 1.32l.87 2.87L4 11.01V11Z"/>
    <path d="m6.6 4.99 3.38 4.2"/>
    <path d="m11.86 3.38 3.38 4.2"/>
  </svg>
);

const PaletteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2Z"/>
  </svg>
);

const ScaleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/>
    <path d="M12 3v18"/>
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
  </svg>
);

const HandshakeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
    <path d="m21 3 1 11h-2"/>
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
    <path d="M3 4h8"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

interface ProjectOverviewProps {
  project: Schema["Project"]["type"];
  brief?: Schema["Brief"]["type"] | null;
}

export default function ProjectOverview({ project, brief }: ProjectOverviewProps) {
  // Calculate total budget
  const totalBudget = (project.budgetPreProduction || 0) +
    (project.budgetProduction || 0) +
    ((project.budgetPostProduction ?? 0) || 0) +
    ((project.budgetDistribution ?? 0) || 0) +
    ((project.budgetContingency ?? 0) || 0);

  // Priority styling
  const getPriorityStyle = (priority: string | null | undefined) => {
    switch (priority) {
      case 'URGENT': return { bg: 'var(--danger-muted)', text: 'var(--danger)', border: 'var(--danger)' };
      case 'HIGH': return { bg: 'var(--warning-muted)', text: 'var(--warning)', border: 'var(--warning)' };
      case 'NORMAL': return { bg: 'var(--primary-muted)', text: 'var(--primary)', border: 'var(--primary)' };
      default: return { bg: 'var(--bg-2)', text: 'var(--text-secondary)', border: 'var(--border)' };
    }
  };

  // Confidentiality styling
  const getConfidentialityStyle = (level: string | null | undefined) => {
    switch (level) {
      case 'HIGHLY_CONFIDENTIAL': return { bg: 'rgba(168, 85, 247, 0.1)', text: '#A855F7', border: '#A855F7' };
      case 'CONFIDENTIAL': return { bg: 'var(--warning-muted)', text: 'var(--warning)', border: 'var(--warning)' };
      default: return { bg: 'var(--bg-2)', text: 'var(--text-secondary)', border: 'var(--border)' };
    }
  };

  // Risk level styling
  const getRiskStyle = (level: string | null | undefined) => {
    switch (level) {
      case 'HIGH': return { bg: 'var(--danger-muted)', text: 'var(--danger)', border: 'var(--danger)' };
      case 'MEDIUM': return { bg: 'var(--warning-muted)', text: 'var(--warning)', border: 'var(--warning)' };
      default: return { bg: 'var(--success-muted)', text: 'var(--success)', border: 'var(--success)' };
    }
  };

  // Budget category colors
  const budgetColors = {
    preProduction: '#A855F7',
    production: '#22C55E',
    postProduction: '#EAB308',
    distribution: 'var(--secondary)',
    contingency: '#F97316'
  };

  return (
    <div className="space-y-6">
      {/* PROJECT CLASSIFICATION */}
      <div
        className="rounded-[12px] p-6"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        <h3
          className="text-[18px] font-semibold mb-4 flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <span style={{ color: 'var(--text-secondary)' }}><ChartBarIcon /></span>
          Project Classification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project Type */}
          <div>
            <p
              className="text-[11px] font-medium uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Type
            </p>
            <div
              className="rounded-[10px] px-4 py-2"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <p className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                {project.projectType || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Priority */}
          <div>
            <p
              className="text-[11px] font-medium uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Priority
            </p>
            {(() => {
              const style = getPriorityStyle(project.priority);
              return (
                <div
                  className="rounded-[10px] px-4 py-2"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}
                >
                  <p className="font-semibold text-[14px]" style={{ color: style.text }}>
                    {project.priority || 'Not specified'}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Confidentiality */}
          <div>
            <p
              className="text-[11px] font-medium uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Confidentiality
            </p>
            {(() => {
              const style = getConfidentialityStyle(project.confidentiality);
              return (
                <div
                  className="rounded-[10px] px-4 py-2"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}
                >
                  <p className="font-semibold text-[14px]" style={{ color: style.text }}>
                    {project.confidentiality?.replace('_', ' ') || 'Not specified'}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Department & Funding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p
              className="text-[11px] font-medium uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Department
            </p>
            <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
              {project.department || 'Not specified'}
            </p>
          </div>
          {project.fundingSource && (
            <div>
              <p
                className="text-[11px] font-medium uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Funding Source
              </p>
              <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
                {project.fundingSource}
              </p>
              {project.purchaseOrderNumber && (
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  PO: {project.purchaseOrderNumber}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STAKEHOLDER DIRECTORY */}
      <div
        className="rounded-[12px] p-6"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        <h3
          className="text-[18px] font-semibold mb-4 flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <span style={{ color: 'var(--text-secondary)' }}><UsersIcon /></span>
          Stakeholder Directory
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.projectOwnerEmail && (
            <div
              className="rounded-[10px] p-4 transition-all duration-[80ms]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center"
                  style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                >
                  <UserIcon />
                </div>
                <div>
                  <p className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                    Project Owner
                  </p>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Owner
                  </p>
                </div>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--secondary)' }}>
                {project.projectOwnerEmail}
              </p>
            </div>
          )}

          {project.executiveSponsorEmail && (
            <div
              className="rounded-[10px] p-4 transition-all duration-[80ms]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center"
                  style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                >
                  <BriefcaseIcon />
                </div>
                <div>
                  <p className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                    Executive Sponsor
                  </p>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Executive
                  </p>
                </div>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--secondary)' }}>
                {project.executiveSponsorEmail}
              </p>
            </div>
          )}

          {project.producerEmail && (
            <div
              className="rounded-[10px] p-4 transition-all duration-[80ms]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center"
                  style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                >
                  <ClapperboardIcon />
                </div>
                <div>
                  <p className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                    Producer
                  </p>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Production
                  </p>
                </div>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--secondary)' }}>
                {project.producerEmail}
              </p>
            </div>
          )}

          {project.creativeDirectorEmail && (
            <div
              className="rounded-[10px] p-4 transition-all duration-[80ms]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center"
                  style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                >
                  <PaletteIcon />
                </div>
                <div>
                  <p className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                    Creative Director
                  </p>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Creative
                  </p>
                </div>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--secondary)' }}>
                {project.creativeDirectorEmail}
              </p>
            </div>
          )}

          {project.legalContactEmail && (
            <div
              className="rounded-[10px] p-4 transition-all duration-[80ms]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center"
                  style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                >
                  <ScaleIcon />
                </div>
                <div>
                  <p className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                    Legal Contact
                  </p>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Legal
                  </p>
                </div>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--secondary)' }}>
                {project.legalContactEmail}
              </p>
            </div>
          )}

          {project.financeContactEmail && (
            <div
              className="rounded-[10px] p-4 transition-all duration-[80ms]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center"
                  style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                >
                  <WalletIcon />
                </div>
                <div>
                  <p className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                    Finance Contact
                  </p>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Finance
                  </p>
                </div>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--secondary)' }}>
                {project.financeContactEmail}
              </p>
            </div>
          )}

          {project.clientContactEmail && (
            <div
              className="rounded-[10px] p-4 transition-all duration-[80ms]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center"
                  style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                >
                  <HandshakeIcon />
                </div>
                <div>
                  <p className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                    Client Contact
                  </p>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Client
                  </p>
                </div>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--secondary)' }}>
                {project.clientContactEmail}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BUDGET OVERVIEW */}
      {totalBudget > 0 && (
        <div
          className="rounded-[12px] p-6"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
        >
          <h3
            className="text-[18px] font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <span style={{ color: 'var(--text-secondary)' }}><DollarIcon /></span>
            Budget Overview
          </h3>

          {/* Total Budget */}
          <div
            className="rounded-[10px] p-4 mb-4"
            style={{ background: 'var(--success-muted)', border: '1px solid var(--success)' }}
          >
            <p
              className="text-[11px] font-medium uppercase tracking-wider mb-1"
              style={{ color: 'var(--success)' }}
            >
              Total Budget
            </p>
            <p className="text-[28px] font-bold" style={{ color: 'var(--success)' }}>
              ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Budget Breakdown */}
          <div className="space-y-3">
            {(project.budgetPreProduction ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: budgetColors.preProduction }}
                  />
                  <span className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                    Pre-Production
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                    ${project.budgetPreProduction?.toLocaleString()}
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {Math.round(((project.budgetPreProduction ?? 0) / totalBudget) * 100)}%
                  </p>
                </div>
              </div>
            )}

            {(project.budgetProduction ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: budgetColors.production }}
                  />
                  <span className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                    Production
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                    ${project.budgetProduction?.toLocaleString()}
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {Math.round(((project.budgetProduction ?? 0) / totalBudget) * 100)}%
                  </p>
                </div>
              </div>
            )}

            {((project.budgetPostProduction ?? 0) ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: budgetColors.postProduction }}
                  />
                  <span className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                    Post-Production
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                    ${project.budgetPostProduction?.toLocaleString()}
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {Math.round(((project.budgetPostProduction ?? 0) / totalBudget) * 100)}%
                  </p>
                </div>
              </div>
            )}

            {(project.budgetDistribution ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: budgetColors.distribution }}
                  />
                  <span className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                    Distribution
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                    ${project.budgetDistribution?.toLocaleString()}
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {Math.round(((project.budgetDistribution ?? 0) / totalBudget) * 100)}%
                  </p>
                </div>
              </div>
            )}

            {(project.budgetContingency ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: budgetColors.contingency }}
                  />
                  <span className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                    Contingency
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                    ${project.budgetContingency?.toLocaleString()}
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {Math.round(((project.budgetContingency ?? 0) / totalBudget) * 100)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Visual Budget Bar */}
          <div
            className="mt-4 h-2 rounded-full overflow-hidden flex"
            style={{ background: 'var(--bg-2)' }}
          >
            {(project.budgetPreProduction ?? 0) > 0 && (
              <div
                className="h-full"
                style={{
                  background: budgetColors.preProduction,
                  width: `${((project.budgetPreProduction ?? 0) / totalBudget) * 100}%`
                }}
              />
            )}
            {(project.budgetProduction ?? 0) > 0 && (
              <div
                className="h-full"
                style={{
                  background: budgetColors.production,
                  width: `${((project.budgetProduction ?? 0) / totalBudget) * 100}%`
                }}
              />
            )}
            {(project.budgetPostProduction ?? 0) > 0 && (
              <div
                className="h-full"
                style={{
                  background: budgetColors.postProduction,
                  width: `${((project.budgetPostProduction ?? 0) / totalBudget) * 100}%`
                }}
              />
            )}
            {(project.budgetDistribution ?? 0) > 0 && (
              <div
                className="h-full"
                style={{
                  background: budgetColors.distribution,
                  width: `${((project.budgetDistribution ?? 0) / totalBudget) * 100}%`
                }}
              />
            )}
            {(project.budgetContingency ?? 0) > 0 && (
              <div
                className="h-full"
                style={{
                  background: budgetColors.contingency,
                  width: `${((project.budgetContingency ?? 0) / totalBudget) * 100}%`
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* SUCCESS METRICS */}
      {(project.primaryKPI || project.targetMetric) && (
        <div
          className="rounded-[12px] p-6"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
        >
          <h3
            className="text-[18px] font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <span style={{ color: 'var(--text-secondary)' }}><TargetIcon /></span>
            Success Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.primaryKPI && (
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Primary KPI
                </p>
                <p className="font-semibold text-[16px]" style={{ color: 'var(--text-primary)' }}>
                  {project.primaryKPI}
                </p>
              </div>
            )}
            {project.targetMetric && (
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Target
                </p>
                <p className="font-semibold text-[16px]" style={{ color: 'var(--secondary)' }}>
                  {project.targetMetric}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SMART BRIEF AI RESULTS */}
      {brief && (
        <div
          className="rounded-[12px] p-6"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
        >
          <h3
            className="text-[18px] font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <span style={{ color: 'var(--text-secondary)' }}><SparklesIcon /></span>
            AI Creative Brief Analysis
          </h3>

          <div className="space-y-4">
            {/* Deliverables */}
            {brief.deliverables && brief.deliverables.length > 0 && (
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Deliverables
                </p>
                <div className="flex flex-wrap gap-2">
                  {brief.deliverables.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-[13px] font-medium"
                      style={{
                        background: 'var(--secondary-muted)',
                        color: 'var(--secondary)',
                        border: '1px solid var(--secondary)'
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Target Audience */}
            {brief.targetAudience && (
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Target Audience
                </p>
                <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
                  {brief.targetAudience}
                </p>
              </div>
            )}

            {/* Tone */}
            {brief.tone && (
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Tone
                </p>
                <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
                  {brief.tone}
                </p>
              </div>
            )}

            {/* Distribution Channels */}
            {brief.distributionChannels && brief.distributionChannels.length > 0 && (
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Distribution Channels
                </p>
                <div className="flex flex-wrap gap-2">
                  {brief.distributionChannels.map((channel, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-[13px] font-medium"
                      style={{
                        background: 'var(--primary-muted)',
                        color: 'var(--primary)',
                        border: '1px solid var(--primary)'
                      }}
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Level */}
            {brief.riskLevel && (
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Risk Level
                </p>
                {(() => {
                  const style = getRiskStyle(brief.riskLevel);
                  return (
                    <span
                      className="inline-block px-4 py-2 rounded-[6px] font-semibold text-[14px]"
                      style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                    >
                      {brief.riskLevel}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
