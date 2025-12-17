"use client";

import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";

// Ensure Amplify is configured before using services
try {
  Amplify.configure(outputs, { ssr: true });
} catch {
  // Already configured
}

/**
 * PROJECT BRIEF - Professional Production Brief Creator
 * Manual form-based brief creation with comprehensive project overview
 */

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const FileTextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// Types
interface Deliverable {
  id: string;
  name: string;
  format: string;
  duration: string;
  aspectRatio: string;
}

interface Scene {
  id: string;
  description: string;
  location: string;
  estimatedDuration: string;
}

interface SmartBriefProps {
  organizationId: string;
  projectId?: string; // If provided, we're editing an existing project's brief
  onComplete: () => void;
  onCancel: () => void;
}

// Success Check Icon
const CheckCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

// Collapsible Section Component
function Section({
  title,
  icon,
  children,
  required = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between transition-colors"
        style={{ background: 'var(--bg-2)' }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--primary)' }}>{icon}</span>
          <span className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
            {title}
            {required && <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>}
          </span>
        </div>
        <span style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          color: 'var(--text-tertiary)'
        }}>
          <ChevronDownIcon />
        </span>
      </button>
      {isOpen && (
        <div className="p-5 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-1)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Form Field Component
function FormField({
  label,
  required = false,
  hint,
  children
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
        {required && <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{hint}</p>
      )}
    </div>
  );
}

export default function SmartBrief({ organizationId, onComplete, onCancel }: SmartBriefProps) {
  // Basic Info
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState<string>("COMMERCIAL");
  const [department, setDepartment] = useState("");

  // Target & Audience
  const [targetAudience, setTargetAudience] = useState("");
  const [keyMessages, setKeyMessages] = useState("");
  const [tone, setTone] = useState("");
  const [distributionChannels, setDistributionChannels] = useState<string[]>([]);

  // Deliverables
  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    { id: '1', name: 'Hero Video', format: '4K ProRes', duration: '60s', aspectRatio: '16:9' }
  ]);

  // Scenes/Locations
  const [scenes, setScenes] = useState<Scene[]>([
    { id: '1', description: '', location: '', estimatedDuration: '' }
  ]);

  // Budget & Timeline
  const [budgetTier, setBudgetTier] = useState<string>("MEDIUM");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [productionDays, setProductionDays] = useState("");

  // Team
  const [crewRoles, setCrewRoles] = useState<string[]>(["Director", "DP", "Editor"]);

  // Risks & Permits
  const [risks, setRisks] = useState({
    drones: false,
    minors: false,
    publicSpaces: false,
    stunts: false,
    hazardousLocations: false,
  });
  const [requiredPermits, setRequiredPermits] = useState<string[]>([]);

  // State
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);

  // Success popup state
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [createdProjectName, setCreatedProjectName] = useState<string>('');

  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);

  // Helpers
  const addDeliverable = () => {
    setDeliverables([...deliverables, {
      id: Date.now().toString(),
      name: '',
      format: '4K ProRes',
      duration: '30s',
      aspectRatio: '16:9'
    }]);
  };

  const removeDeliverable = (id: string) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter(d => d.id !== id));
    }
  };

  const updateDeliverable = (id: string, field: keyof Deliverable, value: string) => {
    setDeliverables(deliverables.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const addScene = () => {
    setScenes([...scenes, {
      id: Date.now().toString(),
      description: '',
      location: '',
      estimatedDuration: ''
    }]);
  };

  const removeScene = (id: string) => {
    if (scenes.length > 1) {
      setScenes(scenes.filter(s => s.id !== id));
    }
  };

  const updateScene = (id: string, field: keyof Scene, value: string) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleDistributionChannel = (channel: string) => {
    if (distributionChannels.includes(channel)) {
      setDistributionChannels(distributionChannels.filter(c => c !== channel));
    } else {
      setDistributionChannels([...distributionChannels, channel]);
    }
  };

  const toggleCrewRole = (role: string) => {
    if (crewRoles.includes(role)) {
      setCrewRoles(crewRoles.filter(r => r !== role));
    } else {
      setCrewRoles([...crewRoles, role]);
    }
  };

  const togglePermit = (permit: string) => {
    if (requiredPermits.includes(permit)) {
      setRequiredPermits(requiredPermits.filter(p => p !== permit));
    } else {
      setRequiredPermits([...requiredPermits, permit]);
    }
  };

  // Create Project
  async function createProject() {
    console.log('=== SmartBrief createProject STARTED ===');
    console.log('SmartBrief: client exists:', !!client);
    console.log('SmartBrief: organizationId:', organizationId);

    if (!client) {
      const errorMsg = 'Client not initialized. Please refresh and try again.';
      console.error('SmartBrief:', errorMsg);
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    // Validation
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }
    if (!projectDescription.trim()) {
      setError("Project description is required");
      return;
    }

    setIsCreating(true);
    setError(null);
    console.log('SmartBrief: Starting project creation...');

    try {
      // Calculate budget based on tier
      const budgetMap: Record<string, number> = {
        'LOW': 15000,
        'MEDIUM': 50000,
        'HIGH': 150000,
        'PREMIUM': 500000,
      };
      const calculatedBudget = budgetAmount ? parseFloat(budgetAmount) : budgetMap[budgetTier] || 50000;

      // Create the project with core fields only
      // Note: Transition fields will use schema defaults (false/0)
      // They can be added after sandbox is redeployed with new schema
      const projectCreateData: Record<string, unknown> = {
        organizationId,
        name: projectName,
        description: projectDescription,
        status: 'DEVELOPMENT',
        lifecycleState: 'INTAKE',
        projectType,
        budgetCap: calculatedBudget,
      };

      // Only add optional fields if provided
      if (department) {
        projectCreateData.department = department;
      }
      if (deadline) {
        projectCreateData.deadline = deadline;
      }

      const newProject = await client.models.Project.create(
        projectCreateData as Parameters<typeof client.models.Project.create>[0]
      );

      if (newProject.errors && newProject.errors.length > 0) {
        console.error('Project creation errors:', newProject.errors);
        throw new Error(`Project creation failed: ${newProject.errors.map(e => e.message).join(', ')}`);
      }

      if (!newProject.data?.id) {
        throw new Error('Failed to create project - no ID returned');
      }

      // Create the Brief with all details
      const briefData = await client.models.Brief.create({
        organizationId,
        projectId: newProject.data.id,
        projectDescription,
        deliverables: deliverables.map(d => `${d.name} (${d.aspectRatio}, ${d.format}, ${d.duration})`),
        targetAudience: targetAudience || undefined,
        tone: tone || undefined,
        budgetRange: `${budgetTier} ($${calculatedBudget.toLocaleString()})`,
        crewRoles: crewRoles.length > 0 ? crewRoles : undefined,
        distributionChannels: distributionChannels.length > 0 ? distributionChannels : undefined,
        keyMessages: keyMessages ? keyMessages.split('\n').filter(m => m.trim()) : undefined,
        scenes: scenes.filter(s => s.description).length > 0
          ? scenes.filter(s => s.description).map(s => ({
              description: s.description,
              location: s.location,
              estimatedDuration: s.estimatedDuration
            }))
          : undefined,
        complexity: budgetTier === 'LOW' ? 'LOW' : budgetTier === 'PREMIUM' ? 'HIGH' : 'MEDIUM',
        riskLevel: Object.values(risks).filter(Boolean).length > 2 ? 'HIGH' : Object.values(risks).some(Boolean) ? 'MEDIUM' : 'LOW',
        hasDroneRisk: risks.drones,
        hasMinorRisk: risks.minors,
        hasPublicSpaceRisk: risks.publicSpaces,
        hasStuntRisk: risks.stunts,
        hasHazardousLocationRisk: risks.hazardousLocations,
        requiredPermits: requiredPermits.length > 0 ? requiredPermits : undefined,
        estimatedDuration: productionDays ? `${productionDays} days` : undefined,
      });

      if (briefData.errors && briefData.errors.length > 0) {
        console.error('Brief creation errors:', briefData.errors);
        throw new Error(`Brief creation failed: ${briefData.errors.map(e => e.message).join(', ')}`);
      }

      if (!briefData.data?.id) {
        throw new Error('Failed to create brief - no ID returned');
      }

      console.log('SmartBrief: Brief created successfully:', briefData.data.id);

      // Log activity
      await client.models.ActivityLog.create({
        organizationId,
        projectId: newProject.data.id,
        userId: 'system',
        userEmail: 'system',
        action: 'PROJECT_CREATED',
        targetId: newProject.data.id,
        metadata: JSON.stringify({
          projectName,
          projectType,
          budgetTier,
          deliverableCount: deliverables.length,
        }),
      });

      console.log('=== SmartBrief PROJECT CREATED SUCCESSFULLY ===');

      // Show success popup instead of alert
      setCreatedProjectId(newProject.data.id);
      setCreatedProjectName(projectName);
      setShowSuccess(true);
      setIsCreating(false);
    } catch (err: unknown) {
      console.error('SmartBrief: Error creating project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to create project: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-2)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical' as const,
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const checkboxStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-2)',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.15s',
  };

  // Handle navigation after success
  function goToProject() {
    if (createdProjectId) {
      onComplete();
      window.location.href = `/projects/${createdProjectId}`;
    }
  }

  function stayOnPage() {
    onComplete();
  }

  // Success Modal
  if (showSuccess) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-1)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid var(--border)',
          }}
        >
          {/* Success Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
            }}
          >
            <CheckCircleIcon />
          </div>

          {/* Success Message */}
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            Project Created!
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}
          >
            Your project brief has been successfully created.
          </p>
          <p
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--primary)',
              background: 'var(--bg-2)',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'inline-block',
              marginBottom: '32px',
            }}
          >
            {createdProjectName}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={goToProject}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary)',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              View Project
            </button>
            <button
              onClick={stayOnPage}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--bg-2)',
                color: 'var(--text-primary)',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>

          {/* Additional Info */}
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              marginTop: '24px',
            }}
          >
            Stakeholders will be notified for Greenlight approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '40px 20px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          background: 'var(--bg-1)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: 'calc(100vh - 80px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <FileTextIcon />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                Create Project Brief
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                Define your project scope, deliverables, and requirements
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
          <div className="space-y-6">

            {/* Project Basics */}
            <Section title="Project Overview" icon={<FileTextIcon />} required>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Project Name" required>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Q4 Brand Campaign"
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Project Type" required>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="EVENT">Event Coverage</option>
                    <option value="TRAINING">Training Video</option>
                    <option value="DOCUMENTARY">Documentary</option>
                    <option value="OTHER">Other</option>
                  </select>
                </FormField>
              </div>

              <div className="mt-4">
                <FormField label="Project Description" required hint="Describe the project goals, context, and what you want to achieve">
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your project in detail. What is the purpose? What story do you want to tell? Who is the target audience?"
                    style={textareaStyle}
                  />
                </FormField>
              </div>

              <div className="mt-4">
                <FormField label="Department / Client">
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., Marketing, HR, External Client"
                    style={inputStyle}
                  />
                </FormField>
              </div>
            </Section>

            {/* Target & Messaging */}
            <Section title="Target Audience & Messaging" icon={<TargetIcon />}>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Target Audience" hint="Who is this content for?">
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Young professionals, 25-35, urban"
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Tone & Style">
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="e.g., Professional, energetic, inspiring"
                    style={inputStyle}
                  />
                </FormField>
              </div>

              <div className="mt-4">
                <FormField label="Key Messages" hint="One message per line">
                  <textarea
                    value={keyMessages}
                    onChange={(e) => setKeyMessages(e.target.value)}
                    placeholder="Enter key messages to communicate (one per line)"
                    style={{ ...textareaStyle, minHeight: '80px' }}
                  />
                </FormField>
              </div>

              <div className="mt-4">
                <FormField label="Distribution Channels">
                  <div className="flex flex-wrap gap-2">
                    {['Website', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'TV/Broadcast', 'Internal', 'Email'].map(channel => (
                      <label
                        key={channel}
                        style={{
                          ...checkboxStyle,
                          background: distributionChannels.includes(channel) ? 'var(--primary)' : 'var(--bg-2)',
                          color: distributionChannels.includes(channel) ? 'white' : 'var(--text-secondary)',
                          borderColor: distributionChannels.includes(channel) ? 'var(--primary)' : 'var(--border)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={distributionChannels.includes(channel)}
                          onChange={() => toggleDistributionChannel(channel)}
                          style={{ display: 'none' }}
                        />
                        {distributionChannels.includes(channel) && <CheckIcon />}
                        {channel}
                      </label>
                    ))}
                  </div>
                </FormField>
              </div>
            </Section>

            {/* Deliverables */}
            <Section title="Deliverables" icon={<VideoIcon />} required>
              <div className="space-y-3">
                {deliverables.map((deliverable, index) => (
                  <div key={deliverable.id} className="flex gap-3 items-start p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                    <span className="text-[12px] font-medium py-2 px-2" style={{ color: 'var(--text-tertiary)' }}>
                      {index + 1}.
                    </span>
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={deliverable.name}
                        onChange={(e) => updateDeliverable(deliverable.id, 'name', e.target.value)}
                        placeholder="Name (e.g., Hero Video)"
                        style={{ ...inputStyle, background: 'var(--bg-1)' }}
                      />
                      <select
                        value={deliverable.aspectRatio}
                        onChange={(e) => updateDeliverable(deliverable.id, 'aspectRatio', e.target.value)}
                        style={{ ...selectStyle, background: 'var(--bg-1)' }}
                      >
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="4:5">4:5 (Social)</option>
                        <option value="21:9">21:9 (Cinematic)</option>
                      </select>
                      <select
                        value={deliverable.format}
                        onChange={(e) => updateDeliverable(deliverable.id, 'format', e.target.value)}
                        style={{ ...selectStyle, background: 'var(--bg-1)' }}
                      >
                        <option value="4K ProRes">4K ProRes</option>
                        <option value="HD H.264">HD H.264</option>
                        <option value="4K H.265">4K H.265</option>
                        <option value="Web Optimized">Web Optimized</option>
                      </select>
                      <input
                        type="text"
                        value={deliverable.duration}
                        onChange={(e) => updateDeliverable(deliverable.id, 'duration', e.target.value)}
                        placeholder="Duration (e.g., 60s)"
                        style={{ ...inputStyle, background: 'var(--bg-1)' }}
                      />
                    </div>
                    <button
                      onClick={() => removeDeliverable(deliverable.id)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-tertiary)',
                        cursor: deliverables.length > 1 ? 'pointer' : 'not-allowed',
                        opacity: deliverables.length > 1 ? 1 : 0.3,
                      }}
                      disabled={deliverables.length <= 1}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addDeliverable}
                  className="flex items-center gap-2 text-[13px] font-medium"
                  style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}
                >
                  <PlusIcon /> Add Deliverable
                </button>
              </div>
            </Section>

            {/* Scenes & Locations */}
            <Section title="Scenes & Locations" icon={<MapPinIcon />}>
              <div className="space-y-3">
                {scenes.map((scene, index) => (
                  <div key={scene.id} className="flex gap-3 items-start p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                    <span className="text-[12px] font-medium py-2 px-2" style={{ color: 'var(--text-tertiary)' }}>
                      {index + 1}.
                    </span>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={scene.description}
                        onChange={(e) => updateScene(scene.id, 'description', e.target.value)}
                        placeholder="Scene description"
                        style={{ ...inputStyle, background: 'var(--bg-1)' }}
                      />
                      <input
                        type="text"
                        value={scene.location}
                        onChange={(e) => updateScene(scene.id, 'location', e.target.value)}
                        placeholder="Location"
                        style={{ ...inputStyle, background: 'var(--bg-1)' }}
                      />
                      <input
                        type="text"
                        value={scene.estimatedDuration}
                        onChange={(e) => updateScene(scene.id, 'estimatedDuration', e.target.value)}
                        placeholder="Est. time (e.g., 2 hours)"
                        style={{ ...inputStyle, background: 'var(--bg-1)' }}
                      />
                    </div>
                    <button
                      onClick={() => removeScene(scene.id)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-tertiary)',
                        cursor: scenes.length > 1 ? 'pointer' : 'not-allowed',
                        opacity: scenes.length > 1 ? 1 : 0.3,
                      }}
                      disabled={scenes.length <= 1}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addScene}
                  className="flex items-center gap-2 text-[13px] font-medium"
                  style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}
                >
                  <PlusIcon /> Add Scene
                </button>
              </div>
            </Section>

            {/* Budget & Timeline */}
            <Section title="Budget & Timeline" icon={<DollarIcon />}>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Budget Tier">
                  <select
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="LOW">Low ($5K - $25K)</option>
                    <option value="MEDIUM">Medium ($25K - $75K)</option>
                    <option value="HIGH">High ($75K - $200K)</option>
                    <option value="PREMIUM">Premium ($200K+)</option>
                  </select>
                </FormField>

                <FormField label="Specific Budget Amount" hint="Leave blank to use tier default">
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="e.g., 50000"
                    style={inputStyle}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField label="Target Deadline">
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Estimated Production Days">
                  <input
                    type="number"
                    value={productionDays}
                    onChange={(e) => setProductionDays(e.target.value)}
                    placeholder="e.g., 3"
                    style={inputStyle}
                  />
                </FormField>
              </div>
            </Section>

            {/* Team */}
            <Section title="Team Requirements" icon={<UsersIcon />}>
              <FormField label="Required Crew Roles" hint="Select all roles needed for this production">
                <div className="flex flex-wrap gap-2">
                  {['Director', 'DP', 'Camera Operator', 'Gaffer', 'Grip', 'Sound Mixer', 'AC', 'DIT', 'PA', 'Editor', 'Colorist', 'Sound Designer', 'Motion Graphics', 'Producer', 'Talent'].map(role => (
                    <label
                      key={role}
                      style={{
                        ...checkboxStyle,
                        background: crewRoles.includes(role) ? 'var(--secondary)' : 'var(--bg-2)',
                        color: crewRoles.includes(role) ? 'white' : 'var(--text-secondary)',
                        borderColor: crewRoles.includes(role) ? 'var(--secondary)' : 'var(--border)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={crewRoles.includes(role)}
                        onChange={() => toggleCrewRole(role)}
                        style={{ display: 'none' }}
                      />
                      {crewRoles.includes(role) && <CheckIcon />}
                      {role}
                    </label>
                  ))}
                </div>
              </FormField>
            </Section>

            {/* Risks & Permits */}
            <Section title="Risks & Permits" icon={<AlertTriangleIcon />}>
              <FormField label="Production Risks" hint="Identify any special considerations">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'drones', label: 'Drone / Aerial Photography' },
                    { key: 'minors', label: 'Minors (Under 18)' },
                    { key: 'publicSpaces', label: 'Public Spaces' },
                    { key: 'stunts', label: 'Stunts / Action' },
                    { key: 'hazardousLocations', label: 'Hazardous Locations' },
                  ].map(risk => (
                    <label
                      key={risk.key}
                      style={{
                        ...checkboxStyle,
                        background: risks[risk.key as keyof typeof risks] ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-2)',
                        color: risks[risk.key as keyof typeof risks] ? 'var(--error)' : 'var(--text-secondary)',
                        borderColor: risks[risk.key as keyof typeof risks] ? 'var(--error)' : 'var(--border)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={risks[risk.key as keyof typeof risks]}
                        onChange={() => setRisks({ ...risks, [risk.key]: !risks[risk.key as keyof typeof risks] })}
                        style={{ display: 'none' }}
                      />
                      {risks[risk.key as keyof typeof risks] && <CheckIcon />}
                      {risk.label}
                    </label>
                  ))}
                </div>
              </FormField>

              <div className="mt-4">
                <FormField label="Required Permits">
                  <div className="flex flex-wrap gap-2">
                    {['Location Permit', 'City Film Permit', 'FAA Drone Authorization', 'Talent Release', 'Music License', 'Insurance Certificate'].map(permit => (
                      <label
                        key={permit}
                        style={{
                          ...checkboxStyle,
                          background: requiredPermits.includes(permit) ? 'var(--warning)' : 'var(--bg-2)',
                          color: requiredPermits.includes(permit) ? 'white' : 'var(--text-secondary)',
                          borderColor: requiredPermits.includes(permit) ? 'var(--warning)' : 'var(--border)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={requiredPermits.includes(permit)}
                          onChange={() => togglePermit(permit)}
                          style={{ display: 'none' }}
                        />
                        {requiredPermits.includes(permit) && <CheckIcon />}
                        {permit}
                      </label>
                    ))}
                  </div>
                </FormField>
              </div>
            </Section>

          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 28px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-2)',
          }}
        >
          {error && (
            <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--error)' }}>
              <AlertTriangleIcon />
              {error}
            </div>
          )}
          {!error && (
            <div className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              Fields marked with <span style={{ color: 'var(--error)' }}>*</span> are required
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={createProject}
              disabled={isCreating}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isCreating ? 'not-allowed' : 'pointer',
                opacity: isCreating ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isCreating ? (
                <>
                  <LoaderIcon />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
