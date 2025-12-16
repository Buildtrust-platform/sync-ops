'use client';

import React, { useState } from 'react';
import {
  StorageLifecyclePolicy,
  StorageTier,
  StoragePolicyType,
  StoragePolicyAction,
  StoragePolicyCondition,
  StoragePolicyActionConfig,
  StorageConditionField,
  StorageConditionOperator,
  PolicyExecutionLog,
  STORAGE_POLICY_TEMPLATES,
  STORAGE_TIER_COSTS,
  RESTORE_COSTS,
  evaluateStoragePolicy,
  calculateStorageCostSavings,
  validateStoragePolicy,
  formatStorageFileSize,
  formatStorageCurrency,
} from '@/lib/lifecycle';

// UI-specific types
interface SimulationResult {
  policy: StorageLifecyclePolicy;
  affectedAssets: number;
  totalBytes: number;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  assetBreakdown: {
    tier: StorageTier;
    count: number;
    bytes: number;
  }[];
}

// Mock data for demonstration
const mockPolicies: StorageLifecyclePolicy[] = [
  {
    id: 'policy-1',
    organizationId: 'org-1',
    name: 'Standard Archive Policy',
    description: 'Move inactive assets to cold storage after 90 days',
    type: 'TIME_BASED',
    isActive: true,
    priority: 100,
    conditions: [
      { field: 'daysSinceLastAccess', operator: 'greaterThan', value: 90 },
      { field: 'currentStorageTier', operator: 'equals', value: 'HOT' },
      { field: 'isLegalHold', operator: 'equals', value: false },
    ],
    actions: [
      { type: 'TRANSITION', targetTier: 'COLD' },
      { type: 'NOTIFY', notifyRoles: ['ADMIN'] },
    ],
    scope: {
      assetTypes: ['video', 'audio'],
    },
    schedule: {
      runFrequency: 'WEEKLY',
      lastRunAt: '2024-06-08T02:00:00Z',
      nextRunAt: '2024-06-15T02:00:00Z',
    },
    createdBy: 'admin',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    version: 1,
  },
  {
    id: 'policy-2',
    organizationId: 'org-1',
    name: 'Deep Archive for Completed Projects',
    description: 'Move completed project assets to glacier after 180 days',
    type: 'PROJECT_STATUS',
    isActive: true,
    priority: 200,
    conditions: [
      { field: 'daysSinceProjectClose', operator: 'greaterThan', value: 180 },
      { field: 'projectStatus', operator: 'equals', value: 'COMPLETED' },
      { field: 'currentStorageTier', operator: 'equals', value: 'COLD' },
    ],
    actions: [
      { type: 'TRANSITION', targetTier: 'DEEP_ARCHIVE' },
      { type: 'NOTIFY', notifyRoles: ['ADMIN', 'PRODUCER'] },
    ],
    scope: {},
    schedule: {
      runFrequency: 'MONTHLY',
      lastRunAt: '2024-06-01T03:00:00Z',
      nextRunAt: '2024-07-01T03:00:00Z',
    },
    createdBy: 'admin',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-05-15T00:00:00Z',
    version: 2,
  },
  {
    id: 'policy-3',
    organizationId: 'org-1',
    name: 'Legal Hold Protection',
    description: 'Lock assets under legal hold',
    type: 'LEGAL_HOLD',
    isActive: true,
    priority: 1,
    conditions: [
      { field: 'isLegalHold', operator: 'equals', value: true },
    ],
    actions: [
      { type: 'LOCK' },
    ],
    scope: {},
    schedule: {
      runFrequency: 'HOURLY',
    },
    createdBy: 'legal-admin',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    version: 1,
  },
];

const mockLogs: PolicyExecutionLog[] = [
  {
    id: 'log-1',
    policyId: 'policy-1',
    policyName: 'Standard Archive Policy',
    organizationId: 'org-1',
    executedAt: '2024-06-08T02:15:00Z',
    status: 'SUCCESS',
    assetsEvaluated: 1250,
    assetsTransitioned: 847,
    errors: [],
    costSavingsAchieved: 45.50,
    executionTimeMs: 12500,
  },
  {
    id: 'log-2',
    policyId: 'policy-2',
    policyName: 'Deep Archive for Completed Projects',
    organizationId: 'org-1',
    executedAt: '2024-06-01T03:00:00Z',
    status: 'SUCCESS',
    assetsEvaluated: 5420,
    assetsTransitioned: 5420,
    errors: [],
    costSavingsAchieved: 312.40,
    executionTimeMs: 45000,
  },
  {
    id: 'log-3',
    policyId: 'policy-1',
    policyName: 'Standard Archive Policy',
    organizationId: 'org-1',
    executedAt: '2024-06-01T02:15:00Z',
    status: 'PARTIAL',
    assetsEvaluated: 980,
    assetsTransitioned: 623,
    errors: ['3 assets locked by active edit sessions', '12 assets have pending uploads'],
    costSavingsAchieved: 32.10,
    executionTimeMs: 8900,
  },
];

interface Props {
  organizationId: string;
  projectId: string;
  currentUserEmail: string;
}

export default function LifecyclePolicyManager({ organizationId, projectId, currentUserEmail }: Props) {
  const [policies, setPolicies] = useState<StorageLifecyclePolicy[]>(mockPolicies);
  const [logs] = useState<PolicyExecutionLog[]>(mockLogs);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<Partial<StorageLifecyclePolicy> | null>(null);

  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  const getScheduleDescription = (schedule: StorageLifecyclePolicy['schedule']): string => {
    if (!schedule) return 'Manual';
    switch (schedule.runFrequency) {
      case 'HOURLY':
        return 'Hourly';
      case 'DAILY':
        return 'Daily';
      case 'WEEKLY':
        return 'Weekly';
      case 'MONTHLY':
        return 'Monthly';
      default:
        return 'Custom';
    }
  };

  const handleTogglePolicy = (policyId: string) => {
    setPolicies(policies.map(p =>
      p.id === policyId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const handleDeletePolicy = (policyId: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter(p => p.id !== policyId));
    }
  };

  const handleSimulate = (policy: StorageLifecyclePolicy) => {
    // Mock simulation
    const result: SimulationResult = {
      policy,
      affectedAssets: Math.floor(Math.random() * 1000) + 100,
      totalBytes: Math.random() * 5 * 1024 * 1024 * 1024 * 1024,
      estimatedMonthlySavings: Math.random() * 100 + 20,
      estimatedAnnualSavings: 0,
      assetBreakdown: [
        { tier: 'HOT', count: Math.floor(Math.random() * 500), bytes: Math.random() * 1024 * 1024 * 1024 * 1024 },
        { tier: 'WARM', count: Math.floor(Math.random() * 300), bytes: Math.random() * 500 * 1024 * 1024 * 1024 },
        { tier: 'COLD', count: Math.floor(Math.random() * 200), bytes: Math.random() * 200 * 1024 * 1024 * 1024 },
      ],
    };
    result.estimatedAnnualSavings = result.estimatedMonthlySavings * 12;
    setSimulationResult(result);
    setShowSimulation(true);
  };

  const handleRunNow = (policy: StorageLifecyclePolicy) => {
    if (confirm(`Run "${policy.name}" immediately? This will process all matching assets.`)) {
      alert('Policy execution started. Check execution logs for progress.');
    }
  };

  const handleCreateFromTemplate = (template: Partial<StorageLifecyclePolicy>) => {
    setEditingPolicy({
      ...template,
      id: `policy-${Date.now()}`,
      organizationId: 'org-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      version: 1,
      isActive: false,
    });
    setShowTemplates(false);
    setShowEditor(true);
  };

  const handleSavePolicy = () => {
    if (!editingPolicy) return;

    const validation = validateStoragePolicy(editingPolicy as StorageLifecyclePolicy);
    if (!validation.valid) {
      alert(`Validation errors:\n${validation.errors.join('\n')}`);
      return;
    }

    const existingIndex = policies.findIndex(p => p.id === editingPolicy.id);
    if (existingIndex >= 0) {
      setPolicies(policies.map((p, i) =>
        i === existingIndex ? { ...editingPolicy, updatedAt: new Date().toISOString() } as StorageLifecyclePolicy : p
      ));
    } else {
      setPolicies([...policies, editingPolicy as StorageLifecyclePolicy]);
    }

    setEditingPolicy(null);
    setShowEditor(false);
  };

  const policyTypeColors: Record<StoragePolicyType, string> = {
    TIME_BASED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ACCESS_BASED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    PROJECT_STATUS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    COST_OPTIMIZATION: 'bg-green-500/20 text-green-400 border-green-500/30',
    LEGAL_HOLD: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CUSTOM: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const getConditionDisplay = (condition: StoragePolicyCondition): string => {
    const fieldLabels: Record<StorageConditionField, string> = {
      daysSinceLastAccess: 'Days since access',
      daysSinceUpload: 'Days since upload',
      daysSinceProjectClose: 'Days since project close',
      accessCount: 'Access count',
      downloadCount: 'Download count',
      projectStatus: 'Project status',
      currentStorageTier: 'Current tier',
      fileSize: 'File size',
      mimeType: 'MIME type',
      hasActiveRights: 'Has active rights',
      isLegalHold: 'Legal hold',
      approvalStatus: 'Approval status',
    };

    const operatorLabels: Record<StorageConditionOperator, string> = {
      equals: '=',
      notEquals: '≠',
      greaterThan: '>',
      lessThan: '<',
      greaterThanOrEqual: '≥',
      lessThanOrEqual: '≤',
      contains: 'contains',
      in: 'in',
      notIn: 'not in',
    };

    const field = fieldLabels[condition.field] || condition.field;
    const op = operatorLabels[condition.operator] || condition.operator;
    const value = typeof condition.value === 'boolean'
      ? condition.value ? 'Yes' : 'No'
      : String(condition.value);

    return `${field} ${op} ${value}`;
  };

  const getActionDisplay = (action: StoragePolicyActionConfig): string => {
    switch (action.type) {
      case 'TRANSITION':
        return `→ ${action.targetTier}`;
      case 'DELETE':
        return '🗑️ Delete';
      case 'ARCHIVE':
        return '📦 Archive';
      case 'RESTORE':
        return '♻️ Restore';
      case 'NOTIFY':
        return `📧 Notify ${action.notifyRoles?.join(', ') || ''}`;
      case 'LOCK':
        return '🔒 Lock';
      default:
        return action.type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Storage Lifecycle Policies</h2>
          <p className="text-gray-400 mt-1">
            Automate asset transitions across storage tiers based on rules and conditions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLogs(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Execution Logs
          </button>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Policy
          </button>
        </div>
      </div>

      {/* Storage Tier Costs Reference */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Storage Tier Costs (per GB/month)</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(STORAGE_TIER_COSTS).map(([tier, cost]) => (
            <div key={tier} className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                tier === 'HOT' ? 'bg-red-500/20 text-red-400' :
                tier === 'WARM' ? 'bg-orange-500/20 text-orange-400' :
                tier === 'COLD' ? 'bg-blue-500/20 text-blue-400' :
                tier === 'GLACIER' ? 'bg-purple-500/20 text-purple-400' :
                'bg-indigo-500/20 text-indigo-400'
              }`}>
                {tier}
              </span>
              <span className="text-white">${cost.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {policies.map(policy => (
          <div
            key={policy.id}
            className={`bg-gray-800/50 border rounded-xl p-5 transition-all ${
              policy.isActive ? 'border-gray-700' : 'border-gray-700/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{policy.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${policyTypeColors[policy.type]}`}>
                    {policy.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    policy.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {policy.isActive ? 'Active' : 'Paused'}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-400">
                    Priority: {policy.priority}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{policy.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{getScheduleDescription(policy.schedule)}</span>
                  </div>
                  {policy.schedule?.lastRunAt && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Last: {formatDate(policy.schedule.lastRunAt)}</span>
                    </div>
                  )}
                  {policy.schedule?.nextRunAt && policy.isActive && (
                    <div className="flex items-center gap-2 text-cyan-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>Next: {formatDate(policy.schedule.nextRunAt)}</span>
                    </div>
                  )}
                </div>

                {/* Conditions Summary */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {policy.conditions.map((condition, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                      {getConditionDisplay(condition)}
                    </span>
                  ))}
                </div>

                {/* Actions Summary */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {policy.actions.map((action, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-500/10 rounded text-xs text-cyan-400">
                      {getActionDisplay(action)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleTogglePolicy(policy.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    policy.isActive
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                  title={policy.isActive ? 'Pause policy' : 'Enable policy'}
                >
                  {policy.isActive ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleSimulate(policy)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg"
                  title="Simulate policy"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleRunNow(policy)}
                  className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
                  title="Run now"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setEditingPolicy(policy);
                    setShowEditor(true);
                  }}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg"
                  title="Edit policy"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeletePolicy(policy.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                  title="Delete policy"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Choose a Policy Template</h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {STORAGE_POLICY_TEMPLATES.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleCreateFromTemplate(template)}
                  className="text-left p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${policyTypeColors[template.type || 'CUSTOM']}`}>
                      {template.type?.replace('_', ' ') || 'Custom'}
                    </span>
                  </div>
                  <h4 className="text-white font-medium mb-1">{template.name}</h4>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </button>
              ))}
              <button
                onClick={() => {
                  setEditingPolicy({
                    id: `policy-${Date.now()}`,
                    organizationId: 'org-1',
                    name: 'New Custom Policy',
                    description: '',
                    type: 'CUSTOM',
                    isActive: false,
                    priority: 100,
                    conditions: [],
                    actions: [],
                    scope: {},
                    schedule: { runFrequency: 'DAILY' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'current-user',
                    version: 1,
                  });
                  setShowTemplates(false);
                  setShowEditor(true);
                }}
                className="text-left p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-dashed border-gray-600 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium border border-gray-600 text-gray-400">
                    custom
                  </span>
                </div>
                <h4 className="text-white font-medium mb-1">Start from Scratch</h4>
                <p className="text-gray-400 text-sm">Create a completely custom policy with your own rules</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Editor Modal */}
      {showEditor && editingPolicy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {policies.find(p => p.id === editingPolicy.id) ? 'Edit Policy' : 'Create Policy'}
                </h3>
                <button
                  onClick={() => {
                    setEditingPolicy(null);
                    setShowEditor(false);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Policy Name</label>
                  <input
                    type="text"
                    value={editingPolicy.name || ''}
                    onChange={e => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Policy Type</label>
                  <select
                    value={editingPolicy.type || 'CUSTOM'}
                    onChange={e => setEditingPolicy({ ...editingPolicy, type: e.target.value as StoragePolicyType })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="TIME_BASED">Time Based</option>
                    <option value="ACCESS_BASED">Access Based</option>
                    <option value="PROJECT_STATUS">Project Status</option>
                    <option value="COST_OPTIMIZATION">Cost Optimization</option>
                    <option value="LEGAL_HOLD">Legal Hold</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    value={editingPolicy.description || ''}
                    onChange={e => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Priority (lower = higher priority)</label>
                  <input
                    type="number"
                    value={editingPolicy.priority || 100}
                    onChange={e => setEditingPolicy({ ...editingPolicy, priority: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Conditions */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Conditions</h4>
                <div className="space-y-3">
                  {editingPolicy.conditions?.map((condition, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                      <select
                        value={condition.field}
                        onChange={e => {
                          const newConditions = [...(editingPolicy.conditions || [])];
                          newConditions[index] = { ...condition, field: e.target.value as StorageConditionField };
                          setEditingPolicy({ ...editingPolicy, conditions: newConditions });
                        }}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="daysSinceLastAccess">Days since last access</option>
                        <option value="daysSinceUpload">Days since upload</option>
                        <option value="daysSinceProjectClose">Days since project close</option>
                        <option value="accessCount">Access count</option>
                        <option value="projectStatus">Project status</option>
                        <option value="currentStorageTier">Current storage tier</option>
                        <option value="fileSize">File size</option>
                        <option value="isLegalHold">Is legal hold</option>
                        <option value="hasActiveRights">Has active rights</option>
                      </select>
                      <select
                        value={condition.operator}
                        onChange={e => {
                          const newConditions = [...(editingPolicy.conditions || [])];
                          newConditions[index] = { ...condition, operator: e.target.value as StorageConditionOperator };
                          setEditingPolicy({ ...editingPolicy, conditions: newConditions });
                        }}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="equals">=</option>
                        <option value="notEquals">≠</option>
                        <option value="greaterThan">&gt;</option>
                        <option value="lessThan">&lt;</option>
                        <option value="greaterThanOrEqual">≥</option>
                        <option value="lessThanOrEqual">≤</option>
                        <option value="in">in</option>
                        <option value="notIn">not in</option>
                      </select>
                      <input
                        type="text"
                        value={String(condition.value)}
                        onChange={e => {
                          const newConditions = [...(editingPolicy.conditions || [])];
                          let value: string | number | boolean = e.target.value;
                          if (value === 'true') value = true;
                          else if (value === 'false') value = false;
                          else if (!isNaN(Number(value)) && value !== '') value = Number(value);
                          newConditions[index] = { ...condition, value };
                          setEditingPolicy({ ...editingPolicy, conditions: newConditions });
                        }}
                        placeholder="Value"
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                      <button
                        onClick={() => {
                          const newConditions = editingPolicy.conditions?.filter((_, i) => i !== index);
                          setEditingPolicy({ ...editingPolicy, conditions: newConditions });
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditingPolicy({
                      ...editingPolicy,
                      conditions: [...(editingPolicy.conditions || []), { field: 'daysSinceLastAccess', operator: 'greaterThan', value: 30 }]
                    })}
                    className="px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg border border-dashed border-gray-600"
                  >
                    + Add Condition
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Actions</h4>
                <div className="space-y-3">
                  {editingPolicy.actions?.map((action, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                      <select
                        value={action.type}
                        onChange={e => {
                          const newActions = [...(editingPolicy.actions || [])];
                          newActions[index] = { ...action, type: e.target.value as StoragePolicyAction };
                          setEditingPolicy({ ...editingPolicy, actions: newActions });
                        }}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="TRANSITION">Transition Tier</option>
                        <option value="DELETE">Delete</option>
                        <option value="ARCHIVE">Archive</option>
                        <option value="RESTORE">Restore</option>
                        <option value="NOTIFY">Notify</option>
                        <option value="LOCK">Lock</option>
                      </select>
                      {action.type === 'TRANSITION' && (
                        <select
                          value={action.targetTier || 'COLD'}
                          onChange={e => {
                            const newActions = [...(editingPolicy.actions || [])];
                            newActions[index] = { ...action, targetTier: e.target.value as StorageTier };
                            setEditingPolicy({ ...editingPolicy, actions: newActions });
                          }}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        >
                          <option value="WARM">WARM</option>
                          <option value="COLD">COLD</option>
                          <option value="GLACIER">GLACIER</option>
                          <option value="DEEP_ARCHIVE">DEEP_ARCHIVE</option>
                        </select>
                      )}
                      {action.type === 'NOTIFY' && (
                        <input
                          type="text"
                          value={action.notifyRoles?.join(', ') || ''}
                          onChange={e => {
                            const newActions = [...(editingPolicy.actions || [])];
                            newActions[index] = { ...action, notifyRoles: e.target.value.split(',').map(r => r.trim()).filter(Boolean) };
                            setEditingPolicy({ ...editingPolicy, actions: newActions });
                          }}
                          placeholder="Roles (comma-separated)"
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        />
                      )}
                      <button
                        onClick={() => {
                          const newActions = editingPolicy.actions?.filter((_, i) => i !== index);
                          setEditingPolicy({ ...editingPolicy, actions: newActions });
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditingPolicy({
                      ...editingPolicy,
                      actions: [...(editingPolicy.actions || []), { type: 'TRANSITION', targetTier: 'COLD' }]
                    })}
                    className="px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg border border-dashed border-gray-600"
                  >
                    + Add Action
                  </button>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Schedule</h4>
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Frequency</label>
                    <select
                      value={editingPolicy.schedule?.runFrequency || 'DAILY'}
                      onChange={e => setEditingPolicy({
                        ...editingPolicy,
                        schedule: { ...editingPolicy.schedule, runFrequency: e.target.value as 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' }
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="HOURLY">Hourly</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingPolicy(null);
                  setShowEditor(false);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePolicy}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
              >
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Results Modal */}
      {showSimulation && simulationResult && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Simulation Results</h3>
                <button
                  onClick={() => {
                    setShowSimulation(false);
                    setSimulationResult(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-gray-400 mb-2">Policy: {simulationResult.policy.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-white">{simulationResult.affectedAssets.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">Assets Affected</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-white">{formatStorageFileSize(simulationResult.totalBytes)}</p>
                  <p className="text-gray-400 text-sm">Total Data</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">${simulationResult.estimatedMonthlySavings.toFixed(2)}</p>
                  <p className="text-gray-400 text-sm">Monthly Savings</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">${simulationResult.estimatedAnnualSavings.toFixed(2)}</p>
                  <p className="text-gray-400 text-sm">Annual Savings</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Assets by Current Tier</h4>
                <div className="space-y-2">
                  {simulationResult.assetBreakdown.map(item => (
                    <div key={item.tier} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-white">{item.tier}</span>
                      <span className="text-gray-400">{item.count} assets ({formatStorageFileSize(item.bytes)})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSimulation(false);
                  setSimulationResult(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleRunNow(simulationResult.policy);
                  setShowSimulation(false);
                  setSimulationResult(null);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
              >
                Run Policy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Execution Logs</h3>
                <button
                  onClick={() => setShowLogs(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {logs.map(log => (
                <div key={log.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${
                        log.status === 'SUCCESS' ? 'bg-green-500' :
                        log.status === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium text-white">{log.policyName}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{formatDate(log.executedAt)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Evaluated</p>
                      <p className="text-white font-medium">{log.assetsEvaluated.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Transitioned</p>
                      <p className="text-white font-medium">{log.assetsTransitioned.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white font-medium">{(log.executionTimeMs / 1000).toFixed(1)}s</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Savings</p>
                      <p className="text-green-400 font-medium">${log.costSavingsAchieved.toFixed(2)}/mo</p>
                    </div>
                  </div>
                  {log.errors && log.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-400 text-sm font-medium mb-1">Warnings:</p>
                      <ul className="text-yellow-400/80 text-sm list-disc list-inside">
                        {log.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
