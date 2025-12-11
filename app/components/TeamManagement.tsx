"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * TEAM MANAGEMENT COMPONENT
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CrownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M8 6h.01"/>
    <path d="M16 6h.01"/>
    <path d="M12 6h.01"/>
    <path d="M12 10h.01"/>
    <path d="M12 14h.01"/>
    <path d="M16 10h.01"/>
    <path d="M16 14h.01"/>
    <path d="M8 10h.01"/>
    <path d="M8 14h.01"/>
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

const ClapperboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4Z"/>
    <path d="m4 11-.88-2.87a2 2 0 0 1 1.33-2.5l11.48-3.5a2 2 0 0 1 2.5 1.32l.87 2.87L4 11.01V11Z"/>
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

const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z"/>
    <rect x="2" y="6" width="14" height="12" rx="2" ry="2"/>
  </svg>
);

const ScissorsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/>
    <circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);

const HeadphonesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ChartBarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

interface TeamManagementProps {
  projectId: string;
  project: Schema["Project"]["type"];
  currentUserEmail: string;
  onUpdate?: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleType: 'stakeholder' | 'crew' | 'invited';
  department?: string;
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  permissions: string[];
  joinedAt?: string;
  lastActiveAt?: string;
  phone?: string;
  company?: string;
  title?: string;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string, permissions: string[], phone?: string, company?: string, title?: string) => void;
}

// Role definitions with permissions and icons
const ROLE_DEFINITIONS: Record<string, { Icon: React.FC; color: string; permissions: string[]; description: string }> = {
  'Project Owner': {
    Icon: CrownIcon,
    color: 'var(--warning)',
    permissions: ['admin', 'edit', 'approve', 'view', 'invite'],
    description: 'Full project control'
  },
  'Executive Sponsor': {
    Icon: BuildingIcon,
    color: '#A855F7',
    permissions: ['approve', 'view'],
    description: 'Strategic oversight & final approval'
  },
  'Creative Director': {
    Icon: PaletteIcon,
    color: '#EC4899',
    permissions: ['edit', 'approve', 'view'],
    description: 'Creative vision & direction'
  },
  'Producer': {
    Icon: ClapperboardIcon,
    color: 'var(--primary)',
    permissions: ['admin', 'edit', 'approve', 'view', 'invite'],
    description: 'Production management'
  },
  'Legal Contact': {
    Icon: ScaleIcon,
    color: '#6366F1',
    permissions: ['approve', 'view'],
    description: 'Legal review & compliance'
  },
  'Finance Contact': {
    Icon: WalletIcon,
    color: 'var(--success)',
    permissions: ['approve', 'view'],
    description: 'Budget & financial approval'
  },
  'Client Contact': {
    Icon: HandshakeIcon,
    color: 'var(--secondary)',
    permissions: ['approve', 'view'],
    description: 'Client representative'
  },
  'Director': {
    Icon: VideoIcon,
    color: 'var(--danger)',
    permissions: ['edit', 'view'],
    description: 'Creative & technical direction'
  },
  'Editor': {
    Icon: ScissorsIcon,
    color: '#F97316',
    permissions: ['edit', 'view'],
    description: 'Post-production editing'
  },
  'Cinematographer': {
    Icon: CameraIcon,
    color: '#06B6D4',
    permissions: ['view'],
    description: 'Camera & lighting'
  },
  'Sound Designer': {
    Icon: HeadphonesIcon,
    color: '#8B5CF6',
    permissions: ['edit', 'view'],
    description: 'Audio production'
  },
  'VFX Artist': {
    Icon: SparklesIcon,
    color: '#D946EF',
    permissions: ['edit', 'view'],
    description: 'Visual effects'
  },
  'Production Assistant': {
    Icon: ClipboardIcon,
    color: 'var(--text-tertiary)',
    permissions: ['view'],
    description: 'General production support'
  },
  'Viewer': {
    Icon: EyeIcon,
    color: 'var(--text-tertiary)',
    permissions: ['view'],
    description: 'View-only access'
  },
};

function InviteModal({ isOpen, onClose, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [customPermissions, setCustomPermissions] = useState<string[]>(['view']);
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    const rolePerms = ROLE_DEFINITIONS[newRole]?.permissions || ['view'];
    setCustomPermissions(rolePerms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && role) {
      onInvite(
        email,
        role,
        useCustomPermissions ? customPermissions : ROLE_DEFINITIONS[role]?.permissions || ['view'],
        phone || undefined,
        company || undefined,
        title || undefined
      );
      setEmail('');
      setRole('Viewer');
      setPhone('');
      setCompany('');
      setTitle('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const RoleIcon = ROLE_DEFINITIONS[role]?.Icon || UserIcon;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-[12px] w-full max-w-md p-6"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Invite Team Member
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-[6px] transition-all duration-[80ms]"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-2)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full rounded-[10px] px-4 py-3 text-[14px] transition-all duration-[80ms]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full rounded-[10px] px-4 py-3 text-[14px] transition-all duration-[80ms]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {Object.keys(ROLE_DEFINITIONS).map((roleName) => (
                <option key={roleName} value={roleName}>{roleName}</option>
              ))}
            </select>
            <p className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {ROLE_DEFINITIONS[role]?.description}
            </p>
          </div>

          {/* Contact Information */}
          <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[13px] font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Contact Information (Optional)
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] mb-1" style={{ color: 'var(--text-tertiary)' }}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full rounded-[10px] px-4 py-2 text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] mb-1" style={{ color: 'var(--text-tertiary)' }}>Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="w-full rounded-[10px] px-4 py-2 text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] mb-1" style={{ color: 'var(--text-tertiary)' }}>Job Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Job title"
                    className="w-full rounded-[10px] px-4 py-2 text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[13px] mb-2" style={{ color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={useCustomPermissions}
                onChange={(e) => setUseCustomPermissions(e.target.checked)}
                className="rounded"
              />
              Customize permissions
            </label>

            {useCustomPermissions && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['admin', 'edit', 'approve', 'view', 'invite'].map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={customPermissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCustomPermissions([...customPermissions, perm]);
                        } else {
                          setCustomPermissions(customPermissions.filter(p => p !== perm));
                        }
                      }}
                      className="rounded"
                    />
                    {perm.charAt(0).toUpperCase() + perm.slice(1)}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] active:scale-[0.98]"
              style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] active:scale-[0.98]"
              style={{ background: 'var(--secondary)', color: 'white' }}
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamManagement({
  projectId,
  project,
  currentUserEmail,
}: TeamManagementProps) {
  const [client] = useState(() => generateClient<Schema>());
  const [activeView, setActiveView] = useState<'directory' | 'permissions' | 'activity'>('directory');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitedMembers, setInvitedMembers] = useState<TeamMember[]>([]);
  const [customPermissions, setCustomPermissions] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Build team members from project stakeholders
  useEffect(() => {
    const buildTeamFromProject = () => {
      const members: TeamMember[] = [];

      const stakeholderMap = [
        { field: 'projectOwnerEmail', role: 'Project Owner' },
        { field: 'executiveSponsorEmail', role: 'Executive Sponsor' },
        { field: 'creativeDirectorEmail', role: 'Creative Director' },
        { field: 'producerEmail', role: 'Producer' },
        { field: 'legalContactEmail', role: 'Legal Contact' },
        { field: 'financeContactEmail', role: 'Finance Contact' },
        { field: 'clientContactEmail', role: 'Client Contact' },
      ] as const;

      stakeholderMap.forEach(({ field, role }, index) => {
        const email = project[field];
        if (email) {
          const roleDef = ROLE_DEFINITIONS[role];
          members.push({
            id: `stakeholder-${index}`,
            name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            email: email,
            role: role,
            roleType: 'stakeholder',
            status: 'active',
            permissions: roleDef?.permissions || ['view'],
            joinedAt: project.createdAt || undefined,
          });
        }
      });

      setTeamMembers(members);
      setIsLoading(false);
    };

    buildTeamFromProject();
    loadInvitedMembers();
  }, [project, projectId]);

  const loadInvitedMembers = async () => {
    try {
      if (client.models.TeamMember) {
        const result = await client.models.TeamMember.list({
          filter: { projectId: { eq: projectId } },
        });

        const invited = (result.data || []).map((member: Schema['TeamMember']['type']) => ({
          id: member.id,
          name: member.name || member.email.split('@')[0],
          email: member.email,
          role: member.role,
          roleType: 'invited' as const,
          status: (member.status || 'pending') as 'active' | 'pending' | 'inactive',
          permissions: member.permissions ? JSON.parse(member.permissions) : ['view'],
          joinedAt: member.invitedAt || undefined,
          phone: member.phone || undefined,
          company: member.company || undefined,
          title: member.title || undefined,
        }));

        setInvitedMembers(invited);
      }
    } catch (error) {
      console.warn('TeamMember model not available yet - using stakeholders only');
    }
  };

  const roleDisplayToEnum: Record<string, string> = {
    'Project Owner': 'PROJECT_OWNER',
    'Executive Sponsor': 'EXECUTIVE_SPONSOR',
    'Creative Director': 'CREATIVE_DIRECTOR',
    'Producer': 'PRODUCER',
    'Legal Contact': 'LEGAL_CONTACT',
    'Finance Contact': 'FINANCE_CONTACT',
    'Client Contact': 'CLIENT_CONTACT',
    'Director': 'DIRECTOR',
    'Editor': 'EDITOR',
    'Cinematographer': 'CINEMATOGRAPHER',
    'Sound Designer': 'SOUND_DESIGNER',
    'VFX Artist': 'VFX_ARTIST',
    'Production Assistant': 'PRODUCTION_ASSISTANT',
    'Viewer': 'VIEWER',
  };

  const handleInvite = async (email: string, role: string, permissions: string[], phone?: string, company?: string, title?: string) => {
    try {
      if (client.models.TeamMember) {
        const roleEnum = roleDisplayToEnum[role] || 'VIEWER';
        const organizationId = project.organizationId || 'default-org';
        await client.models.TeamMember.create({
          organizationId,
          projectId,
          email,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          role: roleEnum as Parameters<typeof client.models.TeamMember.create>[0]['role'],
          permissions: JSON.stringify(permissions),
          status: 'PENDING' as Parameters<typeof client.models.TeamMember.create>[0]['status'],
          invitedBy: currentUserEmail,
          invitedAt: new Date().toISOString(),
          phone: phone || undefined,
          company: company || undefined,
          title: title || undefined,
        });

        await loadInvitedMembers();

        if (client.models.ActivityLog) {
          await client.models.ActivityLog.create({
            organizationId,
            projectId,
            userId: currentUserEmail,
            userEmail: currentUserEmail,
            userRole: 'User',
            action: 'USER_ADDED' as Parameters<typeof client.models.ActivityLog.create>[0]['action'],
            targetType: 'TeamMember',
            targetId: email,
            targetName: email,
            metadata: { role, permissions, phone, company, title },
          });
        }
      } else {
        alert(`Invitation sent to ${email} as ${role}!\n\nNote: For full team management, deploy the schema with: npx ampx sandbox --once`);
      }
    } catch (error) {
      console.error('Error inviting team member:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const member = [...teamMembers, ...invitedMembers].find(m => m.id === memberId);
    if (!member) return;

    if (member.roleType === 'stakeholder') {
      alert('Core stakeholders cannot be removed here. Use Project Settings to clear stakeholder assignments.');
      return;
    }

    if (!confirm(`Remove ${member.name} from the project?`)) return;

    if (client.models.TeamMember) {
      try {
        await client.models.TeamMember.delete({ id: memberId });
        await loadInvitedMembers();
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  const getEffectivePermissions = (member: TeamMember): string[] => {
    return customPermissions[member.id] || member.permissions;
  };

  const handleTogglePermission = async (memberId: string, permission: string) => {
    const member = [...teamMembers, ...invitedMembers].find(m => m.id === memberId);
    if (!member) return;

    const currentPermissions = getEffectivePermissions(member);
    let newPermissions: string[];

    if (currentPermissions.includes(permission)) {
      if (permission === 'view') {
        alert('View permission cannot be removed - it is required for all team members.');
        return;
      }
      newPermissions = currentPermissions.filter(p => p !== permission);
    } else {
      newPermissions = [...currentPermissions, permission];
    }

    if (member.roleType === 'stakeholder') {
      setCustomPermissions(prev => ({ ...prev, [memberId]: newPermissions }));
      setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions: newPermissions } : m));
      return;
    }

    if (client.models.TeamMember) {
      try {
        await client.models.TeamMember.update({ id: memberId, permissions: JSON.stringify(newPermissions) });
        setInvitedMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions: newPermissions } : m));
      } catch (error) {
        console.error('Error toggling permission:', error);
        setInvitedMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions: newPermissions } : m));
      }
    } else {
      setInvitedMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions: newPermissions } : m));
    }
  };

  const allMembers = [...teamMembers, ...invitedMembers];
  const filteredMembers = allMembers.filter(member => {
    const matchesSearch = searchQuery === '' ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const uniqueRoles = [...new Set(allMembers.map(m => m.role))];

  const permissionColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: 'var(--danger-muted)', text: 'var(--danger)' },
    edit: { bg: 'var(--primary-muted)', text: 'var(--primary)' },
    approve: { bg: 'var(--success-muted)', text: 'var(--success)' },
    view: { bg: 'var(--bg-2)', text: 'var(--text-tertiary)' },
    invite: { bg: 'rgba(168, 85, 247, 0.1)', text: '#A855F7' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--secondary)' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>Team Management</h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            {allMembers.length} team member{allMembers.length !== 1 ? 's' : ''} •
            {allMembers.filter(m => m.status === 'active').length} active
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] flex items-center gap-2 active:scale-[0.98]"
          style={{ background: 'var(--secondary)', color: 'white' }}
        >
          <UserPlusIcon />
          Invite Member
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'directory', label: 'Directory', Icon: UsersIcon },
          { id: 'permissions', label: 'Permissions', Icon: LockIcon },
          { id: 'activity', label: 'Activity', Icon: ChartBarIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as 'directory' | 'permissions' | 'activity')}
            className="px-4 py-2 rounded-[6px] font-medium text-[14px] flex items-center gap-2 transition-all duration-[80ms]"
            style={{
              background: activeView === tab.id ? 'var(--secondary)' : 'var(--bg-2)',
              color: activeView === tab.id ? 'white' : 'var(--text-secondary)',
            }}
          >
            <tab.Icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-[12px] p-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-[10px] text-[14px]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-[10px] px-4 py-2 text-[14px] min-w-[200px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory View */}
      {activeView === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const roleDef = ROLE_DEFINITIONS[member.role];
            const RoleIcon = roleDef?.Icon || UserIcon;

            return (
              <div
                key={member.id}
                className="rounded-[12px] p-5 transition-all duration-[80ms]"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-[6px] flex items-center justify-center"
                      style={{ background: `${roleDef?.color || 'var(--text-tertiary)'}20`, color: roleDef?.color || 'var(--text-tertiary)' }}
                    >
                      <RoleIcon />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>{member.name}</h4>
                      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: member.status === 'active' ? 'var(--success)' :
                          member.status === 'pending' ? 'var(--warning)' : 'var(--text-tertiary)'
                      }}
                    ></span>
                    <span className="text-[11px] capitalize" style={{ color: 'var(--text-tertiary)' }}>{member.status}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium"
                      style={{ background: `${roleDef?.color || 'var(--text-tertiary)'}20`, color: roleDef?.color || 'var(--text-tertiary)' }}
                    >
                      <RoleIcon /> {member.role}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {['admin', 'edit', 'approve', 'view', 'invite'].map((perm) => {
                      const effectivePerms = getEffectivePermissions(member);
                      const hasPerm = effectivePerms.includes(perm);
                      const colors = permissionColors[perm];
                      return (
                        <button
                          key={perm}
                          onClick={() => handleTogglePermission(member.id, perm)}
                          className="px-2 py-0.5 rounded text-[11px] transition-all duration-[80ms] cursor-pointer"
                          style={{
                            background: hasPerm ? colors.bg : 'var(--bg-2)',
                            color: hasPerm ? colors.text : 'var(--text-tertiary)',
                            opacity: hasPerm ? 1 : 0.5
                          }}
                          title={hasPerm ? `Click to remove ${perm}` : `Click to grant ${perm}`}
                        >
                          {perm}
                        </button>
                      );
                    })}
                  </div>

                  {(member.phone || member.company || member.title) && (
                    <div className="text-[12px] space-y-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {member.title && member.company && <p>{member.title} at {member.company}</p>}
                      {member.title && !member.company && <p>{member.title}</p>}
                      {!member.title && member.company && <p>{member.company}</p>}
                      {member.phone && <p className="flex items-center gap-1"><PhoneIcon /> {member.phone}</p>}
                    </div>
                  )}

                  {member.roleType === 'stakeholder' && (
                    <p className="text-[12px] flex items-center gap-1" style={{ color: 'var(--warning)' }}>
                      <StarIcon /> Core Stakeholder
                    </p>
                  )}

                  {member.email !== currentUserEmail && (
                    <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.location.href = `mailto:${member.email}`}
                          className="flex-1 px-3 py-1.5 rounded-[6px] text-[12px] flex items-center justify-center gap-1 transition-all duration-[80ms]"
                          style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }}
                        >
                          <MailIcon /> Email
                        </button>
                        {member.phone && (
                          <button
                            onClick={() => window.location.href = `tel:${member.phone}`}
                            className="flex-1 px-3 py-1.5 rounded-[6px] text-[12px] flex items-center justify-center gap-1 transition-all duration-[80ms]"
                            style={{ background: 'var(--success-muted)', color: 'var(--success)' }}
                          >
                            <PhoneIcon /> Call
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.location.href = `mailto:${member.email}?subject=Meeting%20Request`}
                          className="flex-1 px-3 py-1.5 rounded-[6px] text-[12px] flex items-center justify-center gap-1 transition-all duration-[80ms]"
                          style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                        >
                          <CalendarIcon /> Meeting
                        </button>
                        {member.phone && (
                          <button
                            onClick={() => window.location.href = `sms:${member.phone}`}
                            className="flex-1 px-3 py-1.5 rounded-[6px] text-[12px] flex items-center justify-center gap-1 transition-all duration-[80ms]"
                            style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}
                          >
                            <MessageIcon /> Text
                          </button>
                        )}
                        {member.roleType === 'invited' && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="px-3 py-1.5 rounded-[6px] text-[12px] transition-all duration-[80ms]"
                            style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
                          >
                            <XIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="mb-4" style={{ color: 'var(--text-tertiary)' }}><UsersIcon /></div>
              <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No team members found</h3>
              <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
                {searchQuery || filterRole !== 'all' ? 'Try adjusting your search or filter' : 'Invite team members to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Permissions View */}
      {activeView === 'permissions' && (
        <div className="rounded-[12px] overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead style={{ background: 'var(--bg-2)' }}>
              <tr>
                <th className="text-left px-6 py-4 text-[13px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Member</th>
                <th className="text-left px-6 py-4 text-[13px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Role</th>
                {['Admin', 'Edit', 'Approve', 'View', 'Invite'].map(perm => (
                  <th key={perm} className="text-center px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{perm}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const roleDef = ROLE_DEFINITIONS[member.role];
                const RoleIcon = roleDef?.Icon || UserIcon;

                return (
                  <tr key={member.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-[6px] flex items-center justify-center"
                          style={{ background: `${roleDef?.color || 'var(--text-tertiary)'}20`, color: roleDef?.color || 'var(--text-tertiary)' }}
                        >
                          <RoleIcon />
                        </div>
                        <div>
                          <p className="font-medium text-[14px]" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                          <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{member.role}</span>
                    </td>
                    {['admin', 'edit', 'approve', 'view', 'invite'].map((perm) => {
                      const effectivePerms = getEffectivePermissions(member);
                      const hasPerm = effectivePerms.includes(perm);
                      return (
                        <td key={perm} className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleTogglePermission(member.id, perm)}
                            className="w-8 h-8 rounded-[6px] transition-all duration-[80ms] flex items-center justify-center cursor-pointer"
                            style={{
                              background: hasPerm ? 'var(--success-muted)' : 'var(--bg-2)',
                              color: hasPerm ? 'var(--success)' : 'var(--text-tertiary)'
                            }}
                            title={hasPerm ? `Remove ${perm} permission` : `Grant ${perm} permission`}
                          >
                            {hasPerm ? <CheckIcon /> : '-'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity View */}
      {activeView === 'activity' && (
        <div className="rounded-[12px] p-6" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <div className="text-center py-8">
            <div className="mb-4" style={{ color: 'var(--text-secondary)' }}><ChartBarIcon /></div>
            <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Team Activity</h3>
            <p className="text-[14px] mb-6" style={{ color: 'var(--text-tertiary)' }}>
              Track team member contributions and engagement
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="rounded-[10px] p-4" style={{ background: 'var(--bg-2)' }}>
                <div className="text-[28px] font-bold" style={{ color: 'var(--secondary)' }}>{allMembers.length}</div>
                <div className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Total Members</div>
              </div>
              <div className="rounded-[10px] p-4" style={{ background: 'var(--bg-2)' }}>
                <div className="text-[28px] font-bold" style={{ color: 'var(--success)' }}>
                  {allMembers.filter(m => m.status === 'active').length}
                </div>
                <div className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Active</div>
              </div>
              <div className="rounded-[10px] p-4" style={{ background: 'var(--bg-2)' }}>
                <div className="text-[28px] font-bold" style={{ color: 'var(--warning)' }}>
                  {allMembers.filter(m => m.status === 'pending').length}
                </div>
                <div className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Pending Invites</div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-[16px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Role Distribution</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {uniqueRoles.map((role) => {
                  const count = allMembers.filter(m => m.role === role).length;
                  const roleDef = ROLE_DEFINITIONS[role];
                  const RoleIcon = roleDef?.Icon || UserIcon;
                  return (
                    <div
                      key={role}
                      className="px-4 py-2 rounded-[6px] flex items-center gap-2"
                      style={{ background: `${roleDef?.color || 'var(--text-tertiary)'}20`, color: roleDef?.color || 'var(--text-tertiary)' }}
                    >
                      <RoleIcon />
                      <span className="font-medium text-[13px]">{role}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: 'rgba(255,255,255,0.2)' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}
