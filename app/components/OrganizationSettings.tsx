'use client';

import React, { useState } from 'react';
import WatermarkConfig from './WatermarkConfig';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  currentProjectCount?: number;
  currentUserCount?: number;
  currentStorageUsedGB?: number;
  maxProjects?: number;
  maxUsers?: number;
  maxStorageGB?: number;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  timezone?: string;
  currency?: string;
}

interface OrganizationMember {
  id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
  joinedAt?: string;
  lastActiveAt?: string;
}

// Data will be fetched from API
const initialOrganization: Organization = {
  id: '',
  name: '',
  slug: '',
  email: '',
};

const initialMembers: OrganizationMember[] = [];

const SUBSCRIPTION_TIERS = {
  FREE: { name: 'Free', color: 'bg-gray-100 text-gray-800', projects: 3, users: 2, storage: 5 },
  STARTER: { name: 'Starter', color: 'bg-blue-100 text-blue-800', projects: 10, users: 5, storage: 50 },
  PROFESSIONAL: { name: 'Professional', color: 'bg-purple-100 text-purple-800', projects: 50, users: 25, storage: 500 },
  ENTERPRISE: { name: 'Enterprise', color: 'bg-amber-100 text-amber-800', projects: 200, users: 100, storage: 2000 },
  STUDIO: { name: 'Studio', color: 'bg-emerald-100 text-emerald-800', projects: null, users: null, storage: null },
};

const ROLE_COLORS = {
  OWNER: 'bg-red-100 text-red-800',
  ADMIN: 'bg-purple-100 text-purple-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  MEMBER: 'bg-green-100 text-green-800',
  BILLING: 'bg-amber-100 text-amber-800',
  VIEWER: 'bg-gray-100 text-gray-800',
};

const INDUSTRIES = [
  { value: 'PRODUCTION_STUDIO', label: 'Production Studio' },
  { value: 'ADVERTISING_AGENCY', label: 'Advertising Agency' },
  { value: 'CORPORATE_MEDIA', label: 'Corporate Media' },
  { value: 'BROADCAST', label: 'Broadcast' },
  { value: 'STREAMING', label: 'Streaming' },
  { value: 'INDEPENDENT', label: 'Independent' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'NONPROFIT', label: 'Non-Profit' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'OTHER', label: 'Other' },
];

type SettingsTab = 'general' | 'members' | 'billing' | 'usage' | 'branding' | 'security';

export default function OrganizationSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [organization, setOrganization] = useState<Organization>(initialOrganization);
  const [members] = useState<OrganizationMember[]>(initialMembers);
  const [isEditing, setIsEditing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'general',
      label: 'General',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'members',
      label: 'Team Members',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 'usage',
      label: 'Usage',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'branding',
      label: 'Branding',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  const tier = SUBSCRIPTION_TIERS[organization.subscriptionTier as keyof typeof SUBSCRIPTION_TIERS] || SUBSCRIPTION_TIERS.FREE;

  const handleSaveGeneral = () => {
    // In real app, save to backend
    setIsEditing(false);
  };

  const handleInviteMember = () => {
    // In real app, send invitation
    console.log('Inviting:', inviteEmail, 'as', inviteRole);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('MEMBER');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Organization Details</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveGeneral}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organization Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
          {isEditing ? (
            <input
              type="text"
              value={organization.name}
              onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <p className="text-slate-900">{organization.name}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
          {isEditing ? (
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                syncops.com/
              </span>
              <input
                type="text"
                value={organization.slug}
                onChange={(e) => setOrganization({ ...organization, slug: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ) : (
            <p className="text-slate-900">syncops.com/{organization.slug}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
          {isEditing ? (
            <select
              value={organization.industry}
              onChange={(e) => setOrganization({ ...organization, industry: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>
          ) : (
            <p className="text-slate-900">
              {INDUSTRIES.find((i) => i.value === organization.industry)?.label || 'Not specified'}
            </p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
          {isEditing ? (
            <input
              type="url"
              value={organization.website || ''}
              onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
          ) : (
            <p className="text-slate-900">{organization.website || 'Not specified'}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
          {isEditing ? (
            <input
              type="email"
              value={organization.email}
              onChange={(e) => setOrganization({ ...organization, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <p className="text-slate-900">{organization.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              value={organization.phone || ''}
              onChange={(e) => setOrganization({ ...organization, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <p className="text-slate-900">{organization.phone || 'Not specified'}</p>
          )}
        </div>

        {/* Description - Full width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          {isEditing ? (
            <textarea
              value={organization.description || ''}
              onChange={(e) => setOrganization({ ...organization, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <p className="text-slate-900">{organization.description || 'No description'}</p>
          )}
        </div>
      </div>

      {/* Address Section */}
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-md font-medium text-slate-900 mb-4">Business Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
            {isEditing ? (
              <input
                type="text"
                value={organization.address || ''}
                onChange={(e) => setOrganization({ ...organization, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-900">{organization.address || 'Not specified'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
            {isEditing ? (
              <input
                type="text"
                value={organization.city || ''}
                onChange={(e) => setOrganization({ ...organization, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-900">{organization.city || 'Not specified'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State/Province</label>
            {isEditing ? (
              <input
                type="text"
                value={organization.state || ''}
                onChange={(e) => setOrganization({ ...organization, state: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-900">{organization.state || 'Not specified'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            {isEditing ? (
              <input
                type="text"
                value={organization.country || ''}
                onChange={(e) => setOrganization({ ...organization, country: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-900">{organization.country || 'Not specified'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
            {isEditing ? (
              <input
                type="text"
                value={organization.postalCode || ''}
                onChange={(e) => setOrganization({ ...organization, postalCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-900">{organization.postalCode || 'Not specified'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembersSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
          <p className="text-sm text-slate-500">{members.length} of {organization.maxUsers || 'unlimited'} members</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite Member
        </button>
      </div>

      <div className="overflow-hidden border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">
                        {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{member.name || 'Pending User'}</div>
                      <div className="text-sm text-slate-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${ROLE_COLORS[member.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.VIEWER}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {member.joinedAt || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {member.lastActiveAt || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="colleague@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="MEMBER">Member</option>
                  <option value="BILLING">Billing</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">Current Plan</p>
            <h3 className="text-2xl font-bold">{tier.name}</h3>
            <p className="text-slate-400 mt-2">
              {organization.subscriptionStatus === 'ACTIVE' ? 'Your subscription is active' : 'Subscription status: ' + organization.subscriptionStatus}
            </p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${tier.color}`}>
            {organization.subscriptionStatus}
          </span>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors">
            Upgrade Plan
          </button>
          <button className="px-4 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors">
            Manage Billing
          </button>
        </div>
      </div>

      {/* Plan Limits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Projects</span>
            <span className="text-sm font-medium">{organization.currentProjectCount} / {tier.projects || 'Unlimited'}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: tier.projects ? `${(organization.currentProjectCount || 0) / tier.projects * 100}%` : '50%' }}
            />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Users</span>
            <span className="text-sm font-medium">{organization.currentUserCount} / {tier.users || 'Unlimited'}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{ width: tier.users ? `${(organization.currentUserCount || 0) / tier.users * 100}%` : '50%' }}
            />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Storage</span>
            <span className="text-sm font-medium">{organization.currentStorageUsedGB?.toFixed(1)} GB / {tier.storage || 'Unlimited'} GB</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: tier.storage ? `${(organization.currentStorageUsedGB || 0) / tier.storage * 100}%` : '50%' }}
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Payment Method</h4>
        <div className="flex items-center gap-4">
          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">VISA</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Visa ending in 4242</p>
            <p className="text-xs text-slate-500">Expires 12/2025</p>
          </div>
          <button className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium">
            Update
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Billing History</h4>
        <div className="space-y-3">
          {[
            { date: 'Dec 1, 2024', amount: '$299.00', status: 'Paid', invoice: 'INV-2024-012' },
            { date: 'Nov 1, 2024', amount: '$299.00', status: 'Paid', invoice: 'INV-2024-011' },
            { date: 'Oct 1, 2024', amount: '$299.00', status: 'Paid', invoice: 'INV-2024-010' },
          ].map((inv, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-900">{inv.invoice}</p>
                <p className="text-xs text-slate-500">{inv.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-900">{inv.amount}</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">{inv.status}</span>
                <button className="text-sm text-blue-600 hover:text-blue-700">Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsageSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Resource Usage</h3>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">Projects</p>
              <p className="text-lg font-bold text-slate-900">{organization.currentProjectCount}</p>
            </div>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '24%' }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">24% of limit</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">Team Members</p>
              <p className="text-lg font-bold text-slate-900">{organization.currentUserCount}</p>
            </div>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: '32%' }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">32% of limit</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">Storage Used</p>
              <p className="text-lg font-bold text-slate-900">{organization.currentStorageUsedGB?.toFixed(1)} GB</p>
            </div>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: '49%' }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">49% of limit</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">AI Credits</p>
              <p className="text-lg font-bold text-slate-900">1,234</p>
            </div>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-600 rounded-full" style={{ width: '62%' }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">62% of limit</p>
        </div>
      </div>

      {/* Usage Charts Placeholder */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Usage Over Time</h4>
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
          <p className="text-slate-400">Usage chart will be displayed here</p>
        </div>
      </div>
    </div>
  );

  const renderBrandingSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Branding & Customization</h3>

      {/* Logo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Organization Logo</h4>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-slate-200 rounded-xl flex items-center justify-center">
            {organization.logo ? (
              <img src={organization.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div>
            <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
              Upload Logo
            </button>
            <p className="text-xs text-slate-500 mt-2">PNG, JPG up to 2MB. Recommended: 200x200px</p>
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Brand Colors</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border border-slate-300"
                style={{ backgroundColor: organization.brandPrimaryColor || '#2563eb' }}
              />
              <input
                type="text"
                value={organization.brandPrimaryColor || '#2563eb'}
                onChange={(e) => setOrganization({ ...organization, brandPrimaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Color</label>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border border-slate-300"
                style={{ backgroundColor: organization.brandSecondaryColor || '#1e40af' }}
              />
              <input
                type="text"
                value={organization.brandSecondaryColor || '#1e40af'}
                onChange={(e) => setOrganization({ ...organization, brandSecondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Preview</h4>
        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: organization.brandPrimaryColor || '#2563eb' }}
            >
              <span className="text-white font-bold">{organization.name.charAt(0)}</span>
            </div>
            <span className="font-semibold text-slate-900">{organization.name}</span>
          </div>
          <button
            className="px-4 py-2 text-white font-medium rounded-lg transition-colors"
            style={{ backgroundColor: organization.brandPrimaryColor || '#2563eb' }}
          >
            Sample Button
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Security Settings</h3>

      {/* SSO Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-slate-900">Single Sign-On (SSO)</h4>
            <p className="text-sm text-slate-500">Enable enterprise SSO for your organization</p>
          </div>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800">Enterprise Only</span>
        </div>
        <button
          disabled
          className="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
        >
          Configure SSO
        </button>
      </div>

      {/* MFA */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-semibold text-slate-900">Two-Factor Authentication</h4>
            <p className="text-sm text-slate-500">Require 2FA for all team members</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>
      </div>

      {/* Session Timeout */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Session Settings</h4>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout</label>
          <select className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="60">1 hour</option>
            <option value="240">4 hours</option>
            <option value="480">8 hours (Default)</option>
            <option value="1440">24 hours</option>
          </select>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-slate-900">Audit Log</h4>
            <p className="text-sm text-slate-500">View security events and user activity</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
            View Logs
          </button>
        </div>
        <div className="text-sm text-slate-500">
          Last activity: John Smith logged in from Los Angeles, CA - 2 hours ago
        </div>
      </div>

      {/* Forensic Watermarking */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <WatermarkConfig
          organizationId={organization.id}
          previewMode={false}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: organization.brandPrimaryColor || '#2563eb' }}
            >
              <span className="text-2xl font-bold text-white">{organization.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{organization.name}</h1>
              <p className="text-sm text-slate-500">Organization Settings</p>
            </div>
            <span className={`ml-4 px-3 py-1 text-sm font-medium rounded-full ${tier.color}`}>
              {tier.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'members' && renderMembersSettings()}
            {activeTab === 'billing' && renderBillingSettings()}
            {activeTab === 'usage' && renderUsageSettings()}
            {activeTab === 'branding' && renderBrandingSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
          </div>
        </div>
      </div>
    </div>
  );
}
