"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * WORKFLOW AUTOMATION / RULES ENGINE
 *
 * Allows users to create automated workflows triggered by events.
 * Similar to Zapier/n8n but built specifically for media production workflows.
 *
 * Features:
 * - Event-based triggers (asset uploaded, review approved, status changed, etc.)
 * - Conditional logic (if/then/else)
 * - Multiple action types (notifications, status updates, task creation, etc.)
 * - Workflow templates for common scenarios
 */

// SVG Icons (Lucide-style, stroke-width: 1.5)
const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Trigger Types
const TRIGGER_TYPES = {
  ASSET_UPLOADED: { label: 'Asset Uploaded', description: 'When a new asset is uploaded to a project', icon: '📤' },
  ASSET_APPROVED: { label: 'Asset Approved', description: 'When an asset receives approval', icon: '✅' },
  ASSET_REJECTED: { label: 'Asset Rejected', description: 'When an asset is rejected in review', icon: '❌' },
  LEGAL_APPROVED: { label: 'Legal Approval', description: 'When legal team approves an asset', icon: '⚖️' },
  STATUS_CHANGED: { label: 'Status Changed', description: 'When project/asset status changes', icon: '🔄' },
  DEADLINE_APPROACHING: { label: 'Deadline Approaching', description: 'X days before a deadline', icon: '⏰' },
  TASK_COMPLETED: { label: 'Task Completed', description: 'When a task is marked complete', icon: '✔️' },
  COMMENT_ADDED: { label: 'Comment Added', description: 'When a new comment is added', icon: '💬' },
  REVIEW_STARTED: { label: 'Review Started', description: 'When a review session begins', icon: '👁️' },
  COLLECTION_UPDATED: { label: 'Collection Updated', description: 'When assets are added/removed from collection', icon: '📁' },
};

// Action Types
const ACTION_TYPES = {
  SEND_NOTIFICATION: { label: 'Send Notification', description: 'Send an in-app notification', icon: <BellIcon /> },
  SEND_EMAIL: { label: 'Send Email', description: 'Send an email to specified recipients', icon: <MailIcon /> },
  UPDATE_STATUS: { label: 'Update Status', description: 'Change the status of an asset/project', icon: <CheckIcon /> },
  CREATE_TASK: { label: 'Create Task', description: 'Automatically create a new task', icon: <PlusIcon /> },
  ADD_TO_COLLECTION: { label: 'Add to Collection', description: 'Add asset to a specified collection', icon: <CopyIcon /> },
  WEBHOOK: { label: 'Webhook', description: 'Send data to an external URL', icon: <ZapIcon /> },
};

// Condition Operators
const CONDITION_OPERATORS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'does not equal',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'does not contain',
  GREATER_THAN: 'greater than',
  LESS_THAN: 'less than',
};

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  triggerType: keyof typeof TRIGGER_TYPES;
  triggerConfig: Record<string, unknown>;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: keyof typeof CONDITION_OPERATORS;
  value: string;
}

interface WorkflowAction {
  id: string;
  type: keyof typeof ACTION_TYPES;
  config: Record<string, unknown>;
}

interface WorkflowAutomationProps {
  organizationId: string;
  projectId?: string;
  currentUserEmail: string;
}

// Workflow Templates
const WORKFLOW_TEMPLATES: Partial<WorkflowRule>[] = [
  {
    name: 'Legal Approval Notification',
    description: 'Notify team when legal approves an asset',
    triggerType: 'LEGAL_APPROVED',
    triggerConfig: {},
    conditions: [],
    actions: [
      { id: '1', type: 'SEND_NOTIFICATION', config: { message: 'Legal has approved the asset. Ready for distribution.', recipients: ['team'] } },
      { id: '2', type: 'UPDATE_STATUS', config: { newStatus: 'APPROVED' } },
    ],
  },
  {
    name: 'Review Rejection Alert',
    description: 'Create task and notify owner when asset is rejected',
    triggerType: 'ASSET_REJECTED',
    triggerConfig: {},
    conditions: [],
    actions: [
      { id: '1', type: 'CREATE_TASK', config: { title: 'Address review feedback', priority: 'HIGH', assignTo: 'asset_owner' } },
      { id: '2', type: 'SEND_EMAIL', config: { subject: 'Asset requires revisions', template: 'rejection_notice' } },
    ],
  },
  {
    name: 'Deadline Reminder',
    description: 'Send reminder 3 days before deadline',
    triggerType: 'DEADLINE_APPROACHING',
    triggerConfig: { daysBefore: 3 },
    conditions: [],
    actions: [
      { id: '1', type: 'SEND_NOTIFICATION', config: { message: 'Deadline approaching in 3 days', recipients: ['team'] } },
      { id: '2', type: 'SEND_EMAIL', config: { subject: 'Deadline Reminder', template: 'deadline_reminder' } },
    ],
  },
  {
    name: 'Auto-Archive Approved Assets',
    description: 'Add approved assets to the archive collection',
    triggerType: 'ASSET_APPROVED',
    triggerConfig: {},
    conditions: [{ id: '1', field: 'reviewType', operator: 'EQUALS', value: 'FINAL' }],
    actions: [
      { id: '1', type: 'ADD_TO_COLLECTION', config: { collectionName: 'Approved Finals' } },
    ],
  },
];

export default function WorkflowAutomation({
  organizationId,
  projectId,
  currentUserEmail,
}: WorkflowAutomationProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowRule | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'all'>('active');

  // Form state for creating/editing workflows
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTrigger, setFormTrigger] = useState<keyof typeof TRIGGER_TYPES>('ASSET_UPLOADED');
  const [formTriggerConfig, setFormTriggerConfig] = useState<Record<string, unknown>>({});
  const [formConditions, setFormConditions] = useState<WorkflowCondition[]>([]);
  const [formActions, setFormActions] = useState<WorkflowAction[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Load workflows from Amplify backend
  useEffect(() => {
    if (!client) return;

    async function loadWorkflows() {
      setIsLoading(true);
      try {
        const filter: Record<string, unknown> = { organizationId: { eq: organizationId } };
        if (projectId) {
          filter.projectId = { eq: projectId };
        }

        const { data } = await client.models.WorkflowRule.list({ filter });

        const loadedWorkflows: WorkflowRule[] = (data || []).map((rule) => ({
          id: rule.id,
          name: rule.name,
          description: rule.description || '',
          triggerType: mapTriggerType(rule.triggerType),
          triggerConfig: (rule.triggerConditions as Record<string, unknown>) || {},
          conditions: extractConditions(rule.triggerConditions),
          actions: mapActions(rule.actions),
          isActive: rule.isActive ?? true,
          createdAt: rule.createdAt || new Date().toISOString(),
          lastTriggered: rule.lastExecutionAt || undefined,
          triggerCount: rule.totalExecutions || 0,
        }));
        setWorkflows(loadedWorkflows);
      } catch (error) {
        console.error('Error loading workflows:', error);
        // Start with empty list on error
        setWorkflows([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkflows();
  }, [client, organizationId, projectId]);

  // Helper functions to map between UI types and schema types
  function mapTriggerType(schemaType: string | null | undefined): keyof typeof TRIGGER_TYPES {
    const mapping: Record<string, keyof typeof TRIGGER_TYPES> = {
      'ASSET_UPLOADED': 'ASSET_UPLOADED',
      'ASSET_APPROVED': 'ASSET_APPROVED',
      'ASSET_REJECTED': 'ASSET_REJECTED',
      'PROJECT_PHASE_CHANGED': 'STATUS_CHANGED',
    };
    return mapping[schemaType || ''] || 'ASSET_UPLOADED';
  }

  function mapTriggerToSchema(uiTrigger: keyof typeof TRIGGER_TYPES): string {
    const mapping: Record<string, string> = {
      'ASSET_UPLOADED': 'ASSET_UPLOADED',
      'ASSET_APPROVED': 'ASSET_APPROVED',
      'ASSET_REJECTED': 'ASSET_REJECTED',
      'LEGAL_APPROVED': 'ASSET_APPROVED',
      'STATUS_CHANGED': 'PROJECT_PHASE_CHANGED',
      'DEADLINE_APPROACHING': 'SCHEDULED',
      'TASK_COMPLETED': 'ASSET_UPDATED',
      'COMMENT_ADDED': 'ASSET_UPDATED',
      'REVIEW_STARTED': 'ASSET_UPDATED',
      'COLLECTION_UPDATED': 'COLLECTION_CREATED',
    };
    return mapping[uiTrigger] || 'ASSET_UPLOADED';
  }

  function extractConditions(triggerConditions: unknown): WorkflowCondition[] {
    if (!triggerConditions || typeof triggerConditions !== 'object') return [];
    const conditions = triggerConditions as Record<string, unknown>;
    if (conditions.customConditions && Array.isArray(conditions.customConditions)) {
      return (conditions.customConditions as Array<{field: string; operator: string; value: string}>).map((c, i) => ({
        id: `condition-${i}`,
        field: c.field || '',
        operator: (c.operator?.toUpperCase() || 'EQUALS') as keyof typeof CONDITION_OPERATORS,
        value: c.value || '',
      }));
    }
    return [];
  }

  function mapActions(actions: unknown): WorkflowAction[] {
    if (!actions || !Array.isArray(actions)) return [];
    return actions.map((a: { type?: string; config?: Record<string, unknown> }, i: number) => ({
      id: `action-${i}`,
      type: mapActionType(a.type),
      config: a.config || {},
    }));
  }

  function mapActionType(type: string | undefined): keyof typeof ACTION_TYPES {
    const mapping: Record<string, keyof typeof ACTION_TYPES> = {
      'NOTIFY': 'SEND_NOTIFICATION',
      'SEND_WEBHOOK': 'WEBHOOK',
      'ADD_TO_COLLECTION': 'ADD_TO_COLLECTION',
      'SET_METADATA': 'UPDATE_STATUS',
    };
    return mapping[type || ''] || 'SEND_NOTIFICATION';
  }

  function mapActionToSchema(type: keyof typeof ACTION_TYPES): string {
    const mapping: Record<string, string> = {
      'SEND_NOTIFICATION': 'NOTIFY',
      'SEND_EMAIL': 'NOTIFY',
      'UPDATE_STATUS': 'SET_METADATA',
      'CREATE_TASK': 'NOTIFY',
      'ADD_TO_COLLECTION': 'ADD_TO_COLLECTION',
      'WEBHOOK': 'SEND_WEBHOOK',
    };
    return mapping[type] || 'NOTIFY';
  }

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormTrigger('ASSET_UPLOADED');
    setFormTriggerConfig({});
    setFormConditions([]);
    setFormActions([]);
    setEditingWorkflow(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (workflow: WorkflowRule) => {
    setFormName(workflow.name);
    setFormDescription(workflow.description);
    setFormTrigger(workflow.triggerType);
    setFormTriggerConfig(workflow.triggerConfig);
    setFormConditions([...workflow.conditions]);
    setFormActions([...workflow.actions]);
    setEditingWorkflow(workflow);
    setShowCreateModal(true);
  };

  const useTemplate = (template: Partial<WorkflowRule>) => {
    setFormName(template.name || '');
    setFormDescription(template.description || '');
    setFormTrigger(template.triggerType || 'ASSET_UPLOADED');
    setFormTriggerConfig(template.triggerConfig || {});
    setFormConditions(template.conditions ? [...template.conditions] : []);
    setFormActions(template.actions ? [...template.actions] : []);
    setShowTemplates(false);
    setShowCreateModal(true);
  };

  const addCondition = () => {
    setFormConditions([
      ...formConditions,
      { id: Date.now().toString(), field: '', operator: 'EQUALS', value: '' },
    ]);
  };

  const removeCondition = (id: string) => {
    setFormConditions(formConditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<WorkflowCondition>) => {
    setFormConditions(formConditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addAction = (type: keyof typeof ACTION_TYPES) => {
    setFormActions([
      ...formActions,
      { id: Date.now().toString(), type, config: {} },
    ]);
  };

  const removeAction = (id: string) => {
    setFormActions(formActions.filter(a => a.id !== id));
  };

  const updateAction = (id: string, config: Record<string, unknown>) => {
    setFormActions(formActions.map(a => a.id === id ? { ...a, config: { ...a.config, ...config } } : a));
  };

  const saveWorkflow = async () => {
    if (!client) return;

    setIsSaving(true);

    try {
      // Prepare data for Amplify schema
      const triggerConditions = {
        ...formTriggerConfig,
        customConditions: formConditions.map(c => ({
          field: c.field,
          operator: c.operator.toLowerCase(),
          value: c.value,
        })),
      };

      const actionsForSchema = formActions.map(a => ({
        type: mapActionToSchema(a.type),
        config: a.config,
      }));

      // Create local workflow object for immediate UI update
      const localWorkflow: WorkflowRule = {
        id: editingWorkflow?.id || `temp-${Date.now()}`,
        name: formName,
        description: formDescription,
        triggerType: formTrigger,
        triggerConfig: formTriggerConfig,
        conditions: formConditions,
        actions: formActions,
        isActive: true,
        createdAt: editingWorkflow?.createdAt || new Date().toISOString(),
        triggerCount: editingWorkflow?.triggerCount || 0,
      };

      // Check if this is a demo workflow being edited
      const isDemoWorkflow = editingWorkflow?.id?.startsWith('demo-');

      if (editingWorkflow && !isDemoWorkflow) {
        // Update existing workflow in Amplify
        const { data } = await client.models.WorkflowRule.update({
          id: editingWorkflow.id,
          name: formName,
          description: formDescription,
          triggerType: mapTriggerToSchema(formTrigger) as 'ASSET_UPLOADED' | 'ASSET_UPDATED' | 'ASSET_APPROVED' | 'ASSET_REJECTED' | 'ASSET_MOVED_TO_COLLECTION' | 'COLLECTION_CREATED' | 'PROJECT_PHASE_CHANGED' | 'SCHEDULED' | 'MANUAL',
          triggerConditions: triggerConditions,
          actions: actionsForSchema,
          lastModifiedBy: currentUserEmail,
          lastModifiedAt: new Date().toISOString(),
        });

        if (data) {
          localWorkflow.id = data.id;
        }
        setWorkflows(workflows.map(w => w.id === editingWorkflow.id ? localWorkflow : w));
      } else {
        // Create new workflow in Amplify
        const { data } = await client.models.WorkflowRule.create({
          organizationId,
          name: formName,
          description: formDescription,
          isActive: true,
          priority: 0,
          triggerType: mapTriggerToSchema(formTrigger) as 'ASSET_UPLOADED' | 'ASSET_UPDATED' | 'ASSET_APPROVED' | 'ASSET_REJECTED' | 'ASSET_MOVED_TO_COLLECTION' | 'COLLECTION_CREATED' | 'PROJECT_PHASE_CHANGED' | 'SCHEDULED' | 'MANUAL',
          triggerConditions: triggerConditions,
          actions: actionsForSchema,
          scope: projectId ? 'PROJECT' : 'ORGANIZATION',
          projectId: projectId || undefined,
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          createdBy: currentUserEmail,
          createdAt: new Date().toISOString(),
        });

        if (data) {
          localWorkflow.id = data.id;
        }

        // If editing a demo workflow, replace it; otherwise add new
        if (isDemoWorkflow) {
          setWorkflows(workflows.map(w => w.id === editingWorkflow?.id ? localWorkflow : w));
        } else {
          setWorkflows([...workflows, localWorkflow]);
        }
      }

      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWorkflowActive = async (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return;

    // Update local state immediately
    setWorkflows(workflows.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));

    // Persist to Amplify (skip for demo workflows)
    if (client && !id.startsWith('demo-') && !id.startsWith('temp-')) {
      try {
        await client.models.WorkflowRule.update({
          id,
          isActive: !workflow.isActive,
          lastModifiedBy: currentUserEmail,
          lastModifiedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error toggling workflow:', error);
        // Revert on error
        setWorkflows(workflows.map(w => w.id === id ? { ...w, isActive: workflow.isActive } : w));
      }
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    // Remove from local state immediately
    const previousWorkflows = [...workflows];
    setWorkflows(workflows.filter(w => w.id !== id));

    // Delete from Amplify (skip for demo workflows)
    if (client && !id.startsWith('demo-') && !id.startsWith('temp-')) {
      try {
        await client.models.WorkflowRule.delete({ id });
      } catch (error) {
        console.error('Error deleting workflow:', error);
        // Revert on error
        setWorkflows(previousWorkflows);
        alert('Failed to delete workflow. Please try again.');
      }
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    if (activeTab === 'active') return w.isActive;
    if (activeTab === 'inactive') return !w.isActive;
    return true;
  });

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--primary)' }}><ZapIcon /></span>
            Workflow Automation
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '4px' }}>
            Create automated rules to streamline your production workflow
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowTemplates(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-1)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CopyIcon />
            Templates
          </button>
          <button
            onClick={openCreateModal}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary)',
              color: 'var(--bg-0)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <PlusIcon />
            New Workflow
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {(['active', 'inactive', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'var(--bg-0)' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab} ({workflows.filter(w => {
              if (tab === 'active') return w.isActive;
              if (tab === 'inactive') return !w.isActive;
              return true;
            }).length})
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Workflow List */}
      {!isLoading && filteredWorkflows.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-1)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
            No workflows yet
          </h3>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '20px' }}>
            Create your first automation to streamline your workflow
          </p>
          <button
            onClick={openCreateModal}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary)',
              color: 'var(--bg-0)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Create Workflow
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredWorkflows.map(workflow => (
            <div
              key={workflow.id}
              style={{
                background: 'var(--bg-1)',
                border: `1px solid ${workflow.isActive ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '20px',
                opacity: workflow.isActive ? 1 : 0.7,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{TRIGGER_TYPES[workflow.triggerType].icon}</span>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {workflow.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                        {workflow.description}
                      </p>
                    </div>
                  </div>

                  {/* Workflow Flow Display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: 'var(--primary-muted)',
                        color: 'var(--primary)',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      When: {TRIGGER_TYPES[workflow.triggerType].label}
                    </span>
                    {workflow.conditions.length > 0 && (
                      <>
                        <ArrowRightIcon />
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            background: 'var(--warning-muted)',
                            color: 'var(--warning)',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          If: {workflow.conditions.length} condition{workflow.conditions.length > 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                    <ArrowRightIcon />
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: 'var(--success-muted)',
                        color: 'var(--success)',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      Then: {workflow.actions.length} action{workflow.actions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginRight: '8px' }}>
                    Triggered {workflow.triggerCount} times
                  </span>
                  <button
                    onClick={() => toggleWorkflowActive(workflow.id)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: workflow.isActive ? 'var(--success)' : 'var(--bg-2)',
                      color: workflow.isActive ? 'white' : 'var(--text-tertiary)',
                      cursor: 'pointer',
                    }}
                    title={workflow.isActive ? 'Pause workflow' : 'Activate workflow'}
                  >
                    {workflow.isActive ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <button
                    onClick={() => openEditModal(workflow)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'var(--bg-2)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                    title="Edit workflow"
                  >
                    <SettingsIcon />
                  </button>
                  <button
                    onClick={() => deleteWorkflow(workflow.id)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'var(--error-muted)',
                      color: 'var(--error)',
                      cursor: 'pointer',
                    }}
                    title="Delete workflow"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowTemplates(false)}
        >
          <div
            style={{
              background: 'var(--bg-1)',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Workflow Templates
              </h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '4px' }}>
                Start with a pre-built template and customize it to your needs
              </p>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {WORKFLOW_TEMPLATES.map((template, index) => (
                <button
                  key={index}
                  onClick={() => useTemplate(template)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-0)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 80ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{TRIGGER_TYPES[template.triggerType!].icon}</span>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {template.name}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: '36px' }}>
                    {template.actions?.map((action, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'var(--bg-2)',
                          color: 'var(--text-secondary)',
                          fontSize: '11px',
                        }}
                      >
                        {ACTION_TYPES[action.type].label}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-1)',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
              </h3>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Basic Info */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g., Legal Approval Notification"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-0)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Brief description of what this workflow does"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-0)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Trigger Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  When this happens (Trigger)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {Object.entries(TRIGGER_TYPES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setFormTrigger(key as keyof typeof TRIGGER_TYPES)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: `2px solid ${formTrigger === key ? 'var(--primary)' : 'var(--border)'}`,
                        background: formTrigger === key ? 'var(--primary-muted)' : 'var(--bg-0)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{value.icon}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {value.label}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            {value.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Conditions (Optional)
                  </label>
                  <button
                    onClick={addCondition}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'var(--bg-2)',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <PlusIcon /> Add Condition
                  </button>
                </div>
                {formConditions.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', padding: '12px', background: 'var(--bg-0)', borderRadius: '8px' }}>
                    No conditions added. Workflow will run for all matching triggers.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formConditions.map(condition => (
                      <div
                        key={condition.id}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          padding: '12px',
                          background: 'var(--bg-0)',
                          borderRadius: '8px',
                        }}
                      >
                        <input
                          type="text"
                          value={condition.field}
                          onChange={e => updateCondition(condition.id, { field: e.target.value })}
                          placeholder="Field"
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-1)',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                          }}
                        />
                        <select
                          value={condition.operator}
                          onChange={e => updateCondition(condition.id, { operator: e.target.value as keyof typeof CONDITION_OPERATORS })}
                          style={{
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-1)',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                          }}
                        >
                          {Object.entries(CONDITION_OPERATORS).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={condition.value}
                          onChange={e => updateCondition(condition.id, { value: e.target.value })}
                          placeholder="Value"
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-1)',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                          }}
                        />
                        <button
                          onClick={() => removeCondition(condition.id)}
                          style={{
                            padding: '8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'var(--error-muted)',
                            color: 'var(--error)',
                            cursor: 'pointer',
                          }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Then do this (Actions)
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {Object.entries(ACTION_TYPES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => addAction(key as keyof typeof ACTION_TYPES)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-0)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {value.icon}
                      {value.label}
                    </button>
                  ))}
                </div>
                {formActions.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', padding: '12px', background: 'var(--bg-0)', borderRadius: '8px' }}>
                    No actions added. Select at least one action above.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formActions.map((action, index) => (
                      <div
                        key={action.id}
                        style={{
                          padding: '16px',
                          background: 'var(--bg-0)',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'var(--primary)',
                              color: 'var(--bg-0)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}>
                              {index + 1}
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {ACTION_TYPES[action.type].icon}
                            </span>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              {ACTION_TYPES[action.type].label}
                            </span>
                          </div>
                          <button
                            onClick={() => removeAction(action.id)}
                            style={{
                              padding: '6px',
                              borderRadius: '4px',
                              border: 'none',
                              background: 'var(--error-muted)',
                              color: 'var(--error)',
                              cursor: 'pointer',
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>

                        {/* Action-specific config fields */}
                        {action.type === 'SEND_NOTIFICATION' && (
                          <div>
                            <input
                              type="text"
                              value={(action.config.message as string) || ''}
                              onChange={e => updateAction(action.id, { message: e.target.value })}
                              placeholder="Notification message"
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-1)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                              }}
                            />
                          </div>
                        )}

                        {action.type === 'SEND_EMAIL' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                              type="text"
                              value={(action.config.subject as string) || ''}
                              onChange={e => updateAction(action.id, { subject: e.target.value })}
                              placeholder="Email subject"
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-1)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                              }}
                            />
                            <input
                              type="text"
                              value={(action.config.recipients as string) || ''}
                              onChange={e => updateAction(action.id, { recipients: e.target.value })}
                              placeholder="Recipients (comma-separated emails)"
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-1)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                              }}
                            />
                          </div>
                        )}

                        {action.type === 'UPDATE_STATUS' && (
                          <select
                            value={(action.config.newStatus as string) || ''}
                            onChange={e => updateAction(action.id, { newStatus: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'var(--bg-1)',
                              color: 'var(--text-primary)',
                              fontSize: '13px',
                            }}
                          >
                            <option value="">Select status...</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        )}

                        {action.type === 'CREATE_TASK' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                              type="text"
                              value={(action.config.title as string) || ''}
                              onChange={e => updateAction(action.id, { title: e.target.value })}
                              placeholder="Task title"
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-1)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                              }}
                            />
                            <select
                              value={(action.config.priority as string) || 'MEDIUM'}
                              onChange={e => updateAction(action.id, { priority: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-1)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                              }}
                            >
                              <option value="LOW">Low Priority</option>
                              <option value="MEDIUM">Medium Priority</option>
                              <option value="HIGH">High Priority</option>
                              <option value="CRITICAL">Critical Priority</option>
                            </select>
                          </div>
                        )}

                        {action.type === 'ADD_TO_COLLECTION' && (
                          <input
                            type="text"
                            value={(action.config.collectionName as string) || ''}
                            onChange={e => updateAction(action.id, { collectionName: e.target.value })}
                            placeholder="Collection name"
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'var(--bg-1)',
                              color: 'var(--text-primary)',
                              fontSize: '13px',
                            }}
                          />
                        )}

                        {action.type === 'WEBHOOK' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                              type="url"
                              value={(action.config.url as string) || ''}
                              onChange={e => updateAction(action.id, { url: e.target.value })}
                              placeholder="Webhook URL"
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-1)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                              }}
                            />
                            <select
                              value={(action.config.method as string) || 'POST'}
                              onChange={e => updateAction(action.id, { method: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-1)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                              }}
                            >
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="GET">GET</option>
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-0)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveWorkflow}
                disabled={!formName || formActions.length === 0 || isSaving}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: formName && formActions.length > 0 && !isSaving ? 'var(--primary)' : 'var(--bg-2)',
                  color: formName && formActions.length > 0 && !isSaving ? 'var(--bg-0)' : 'var(--text-tertiary)',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: formName && formActions.length > 0 && !isSaving ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isSaving && (
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                )}
                {isSaving ? 'Saving...' : editingWorkflow ? 'Save Changes' : 'Create Workflow'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
