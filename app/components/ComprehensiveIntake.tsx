"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";

// Ensure Amplify is configured before using services
try {
  Amplify.configure(outputs, { ssr: true });
} catch {
  // Already configured
}

/**
 * COMPREHENSIVE PROJECT INTAKE WIZARD
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 *
 * Steps:
 * 1. Project Basics (Who, What, When)
 * 2. AI-Powered Creative Brief
 * 3. Budget & Resources
 * 4. Distribution & Success Metrics
 * 5. Legal & Compliance
 * 6. Review & Greenlight
 */

// Lucide-style icons
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

interface IntakeData {
  projectName: string;
  projectType: 'COMMERCIAL' | 'CORPORATE' | 'SOCIAL_MEDIA' | 'EVENT' | 'TRAINING' | 'DOCUMENTARY' | 'OTHER';
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  confidentiality: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'HIGHLY_CONFIDENTIAL';
  department: string;
  projectOwnerEmail: string;
  executiveSponsorEmail: string;
  creativeDirectorEmail: string;
  producerEmail: string;
  legalContactEmail: string;
  financeContactEmail: string;
  clientContactEmail: string;
  kickoffDate: string;
  distributionDate: string;
  projectDescription: string;
  scriptOrNotes: string;
  aiResults: any;
  budgetPreProduction: number;
  budgetProduction: number;
  budgetPostProduction: number;
  budgetDistribution: number;
  budgetContingency: number;
  fundingSource: string;
  purchaseOrderNumber: string;
  distributionChannels: string[];
  masterFormat: string;
  socialCropsRequired: string[];
  subtitlesRequired: boolean;
  languageVersions: string[];
  primaryKPI: string;
  targetMetric: string;
  copyrightOwnership: 'COMPANY' | 'CLIENT' | 'SHARED';
  usageRightsDuration: string;
  musicLicensing: 'LICENSED' | 'ROYALTY_FREE' | 'ORIGINAL_SCORE' | 'NONE';
  insuranceRequired: boolean;
  talentReleasesRequired: boolean;
  locationReleasesRequired: boolean;
}

interface ComprehensiveIntakeProps {
  onComplete: () => void;
  onCancel: () => void;
}

// Reusable input styles
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '14px',
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  paddingRight: '36px',
  cursor: 'pointer',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23A1A6AE' stroke-width='1.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: '8px',
};

const smallLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--text-tertiary)',
  marginBottom: '8px',
};

export default function ComprehensiveIntake({ onComplete, onCancel }: ComprehensiveIntakeProps) {
  const router = useRouter();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Use userPool auth for authenticated operations
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [createdProjectName, setCreatedProjectName] = useState<string>('');

  useEffect(() => {
    if (!client) return;
    async function fetchUserOrganization() {
      try {
        const attributes = await fetchUserAttributes();
        const email = attributes.email || '';
        const userId = attributes.sub || '';
        setUserEmail(email);

        const membershipResult = await client?.models.OrganizationMember.list({
          filter: { email: { eq: email } }
        });

        if (membershipResult?.data && membershipResult.data.length > 0) {
          setOrganizationId(membershipResult.data[0].organizationId);
        } else {
          const orgResult = await client?.models.Organization.list();
          if (orgResult?.data && orgResult.data.length > 0) {
            setOrganizationId(orgResult.data[0].id);
          } else {
            const newOrgResult = await client?.models.Organization.create({
              name: 'My Organization',
              slug: `org-${Date.now()}`,
              email: email,
              subscriptionTier: 'FREE',
              subscriptionStatus: 'TRIALING',
              createdBy: userId,
            });
            if (newOrgResult?.data) {
              setOrganizationId(newOrgResult.data.id);
              await client?.models.OrganizationMember.create({
                organizationId: newOrgResult.data.id,
                userId: userId,
                email: email,
                role: 'OWNER',
                status: 'ACTIVE',
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError('Unable to load organization. Please try again.');
      }
    }

    fetchUserOrganization();
  }, [client]);

  const [intakeData, setIntakeData] = useState<Partial<IntakeData>>({
    projectType: 'CORPORATE',
    priority: 'NORMAL',
    confidentiality: 'INTERNAL',
    distributionChannels: [],
    socialCropsRequired: [],
    languageVersions: ['EN'],
    subtitlesRequired: false,
    copyrightOwnership: 'COMPANY',
    usageRightsDuration: 'Perpetual',
    musicLicensing: 'ROYALTY_FREE',
    insuranceRequired: false,
    talentReleasesRequired: false,
    locationReleasesRequired: false,
  });

  const updateData = (field: keyof IntakeData, value: any) => {
    setIntakeData({ ...intakeData, [field]: value });
  };

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const stepLabels = [
    'Project Basics',
    'Creative Brief',
    'Budget & Resources',
    'Distribution & Metrics',
    'Legal & Compliance',
    'Review & Greenlight'
  ];

  async function analyzeWithAI() {
    if (!intakeData.projectDescription?.trim()) {
      setError("Please enter a project description");
      return;
    }
    if (!client) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { data, errors } = await client?.queries.analyzeProjectBrief({
        projectDescription: intakeData.projectDescription,
        scriptOrNotes: intakeData.scriptOrNotes || undefined,
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      updateData('aiResults', data);
      setCurrentStep(3);
    } catch (err) {
      console.error('AI analysis error:', err);
      // Continue without AI analysis - allow manual project creation
      updateData('aiResults', null);
      setCurrentStep(3);
    } finally {
      setIsProcessing(false);
    }
  }

  function skipAIAnalysis() {
    if (!intakeData.projectDescription?.trim()) {
      setError("Please enter a project description");
      return;
    }
    updateData('aiResults', null);
    setCurrentStep(3);
  }

  async function createProject() {
    // Immediate feedback that button was clicked
    console.log('=== createProject STARTED ===');
    console.log('createProject: client exists:', !!client);
    console.log('createProject: organizationId:', organizationId);
    console.log('createProject: intakeData:', JSON.stringify(intakeData, null, 2));

    if (!client) {
      console.error('createProject: Client not initialized');
      setError('Client not initialized. Please refresh and try again.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    console.log('createProject: isProcessing set to true, starting API call...');

    if (!organizationId) {
      console.error('createProject: Organization ID not found');
      setError('Organization not found. Please refresh and try again.');
      setIsProcessing(false);
      return;
    }

    try {
      const aiResults = intakeData.aiResults as any;
      const totalBudget = (intakeData.budgetPreProduction || 0) +
        (intakeData.budgetProduction || 0) +
        (intakeData.budgetPostProduction || 0) +
        (intakeData.budgetDistribution || 0) +
        (intakeData.budgetContingency || 0);

      const projectData = {
        organizationId: organizationId,
        name: intakeData.projectName || aiResults?.projectName || 'Untitled Project',
        description: intakeData.projectDescription,
        status: 'DEVELOPMENT' as const,
        lifecycleState: 'INTAKE' as const,
        department: intakeData.department,
        projectType: intakeData.projectType,
        priority: intakeData.priority,
        confidentiality: intakeData.confidentiality,
        projectOwnerEmail: intakeData.projectOwnerEmail,
        executiveSponsorEmail: intakeData.executiveSponsorEmail,
        creativeDirectorEmail: intakeData.creativeDirectorEmail,
        producerEmail: intakeData.producerEmail,
        legalContactEmail: intakeData.legalContactEmail,
        financeContactEmail: intakeData.financeContactEmail,
        clientContactEmail: intakeData.clientContactEmail,
        kickoffDate: intakeData.kickoffDate,
        distributionDate: intakeData.distributionDate,
        deadline: intakeData.distributionDate,
        budgetCap: totalBudget,
        budgetPreProduction: intakeData.budgetPreProduction,
        budgetProduction: intakeData.budgetProduction,
        budgetPostProduction: intakeData.budgetPostProduction,
        budgetDistribution: intakeData.budgetDistribution,
        budgetContingency: intakeData.budgetContingency,
        fundingSource: intakeData.fundingSource,
        purchaseOrderNumber: intakeData.purchaseOrderNumber,
        primaryKPI: intakeData.primaryKPI,
        targetMetric: intakeData.targetMetric,
        greenlightProducerApproved: false,
        greenlightLegalApproved: false,
        greenlightFinanceApproved: false,
        greenlightExecutiveApproved: false,
        greenlightClientApproved: false,
      };

      console.log('createProject: Creating project with data:', JSON.stringify(projectData, null, 2));

      const newProject = await client.models.Project.create(projectData);

      console.log('createProject: Project creation response:', JSON.stringify(newProject, null, 2));

      if (newProject.errors && newProject.errors.length > 0) {
        console.error('createProject: Project creation errors:', newProject.errors);
        throw new Error(`Failed to create project: ${newProject.errors.map(e => e.message).join(', ')}`);
      }

      if (!newProject.data) {
        console.error('createProject: No data returned from project creation');
        throw new Error('Failed to create project - no data returned');
      }

      console.log('createProject: Creating Brief for project:', newProject.data.id);

      const briefResult = await client.models.Brief.create({
        organizationId: organizationId,
        projectId: newProject.data.id,
        projectDescription: intakeData.projectDescription,
        scriptOrNotes: intakeData.scriptOrNotes,
        deliverables: aiResults?.deliverables || [],
        estimatedDuration: aiResults?.estimatedDuration || '',
        targetAudience: aiResults?.targetAudience || '',
        tone: aiResults?.tone || '',
        budgetRange: aiResults?.budgetRange || '',
        crewRoles: aiResults?.crewRoles || [],
        distributionChannels: intakeData.distributionChannels || [],
        masterFormat: intakeData.masterFormat,
        socialCropsRequired: intakeData.socialCropsRequired,
        subtitlesRequired: intakeData.subtitlesRequired,
        languageVersions: intakeData.languageVersions,
        copyrightOwnership: intakeData.copyrightOwnership,
        usageRightsDuration: intakeData.usageRightsDuration,
        musicLicensing: intakeData.musicLicensing,
        insuranceRequired: intakeData.insuranceRequired,
        talentReleasesRequired: intakeData.talentReleasesRequired,
        locationReleasesRequired: intakeData.locationReleasesRequired,
        riskLevel: aiResults?.risks ? calculateRiskLevel(aiResults.risks) : 'LOW',
        hasDroneRisk: aiResults?.risks?.drones || false,
        hasMinorRisk: aiResults?.risks?.minors || false,
        hasPublicSpaceRisk: aiResults?.risks?.publicSpaces || false,
        hasStuntRisk: aiResults?.risks?.stunts || false,
        hasHazardousLocationRisk: aiResults?.risks?.hazardousLocations || false,
        requiredPermits: aiResults?.requiredPermits || [],
        scenes: aiResults?.scenes || [],
        complexity: aiResults?.complexity || 'MEDIUM',
        aiProcessedAt: new Date().toISOString(),
        approvedByProducer: false,
        approvedByLegal: false,
        approvedByFinance: false,
      });

      console.log('createProject: Brief creation response:', JSON.stringify(briefResult, null, 2));

      console.log('createProject: Creating ActivityLog');

      await client.models.ActivityLog.create({
        organizationId: organizationId,
        projectId: newProject.data.id,
        userId: 'USER',
        userEmail: userEmail || intakeData.projectOwnerEmail || 'user@syncops.app',
        userRole: 'Producer',
        action: 'PROJECT_CREATED',
        targetType: 'Project',
        targetId: newProject.data.id,
        targetName: intakeData.projectName || aiResults?.projectName || 'Untitled Project',
        metadata: {
          comprehensiveIntake: true,
          priority: intakeData.priority,
          projectType: intakeData.projectType,
          totalBudget,
        },
      });

      // Show success popup
      const projectName = intakeData.projectName || aiResults?.projectName || 'Untitled Project';
      console.log('=== PROJECT CREATED SUCCESSFULLY ===');
      console.log('createProject: Project ID:', newProject.data.id);
      console.log('createProject: Project Name:', projectName);
      setCreatedProjectId(newProject.data.id);
      setCreatedProjectName(projectName);
      setShowSuccess(true);
      setIsProcessing(false);
      console.log('createProject: showSuccess set to true');
    } catch (err: any) {
      console.error('createProject: Error during project creation:', err);
      console.error('createProject: Error details:', JSON.stringify(err, null, 2));

      // Extract meaningful error message
      let errorMessage = 'Failed to create project. ';
      if (err?.message) {
        errorMessage += err.message;
      } else if (err?.errors) {
        errorMessage += err.errors.map((e: any) => e.message).join(', ');
      } else {
        errorMessage += 'Please check the console for details.';
      }

      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  function calculateRiskLevel(risks: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (!risks) return 'LOW';
    const riskCount = Object.values(risks).filter(Boolean).length;
    if (riskCount >= 3) return 'HIGH';
    if (riskCount >= 1) return 'MEDIUM';
    return 'LOW';
  }

  const totalBudget = (intakeData.budgetPreProduction || 0) +
    (intakeData.budgetProduction || 0) +
    (intakeData.budgetPostProduction || 0) +
    (intakeData.budgetDistribution || 0) +
    (intakeData.budgetContingency || 0);

  // Handle navigation to project after success
  function goToProject() {
    if (createdProjectId) {
      onComplete();
      router.push(`/projects/${createdProjectId}`);
    }
  }

  function goToDashboard() {
    onComplete();
    router.push('/dashboard');
  }

  // Success Modal
  if (showSuccess) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
      >
        <div
          className="w-full max-w-md rounded-[16px] p-8 text-center"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
        >
          {/* Success Icon */}
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--success-muted, rgba(16, 185, 129, 0.1))' }}
          >
            <div style={{ color: 'var(--success, #10B981)' }}>
              <CheckCircleIcon />
            </div>
          </div>

          {/* Success Message */}
          <h2
            className="text-[24px] font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Project Created!
          </h2>
          <p
            className="text-[15px] mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Your project brief has been successfully created.
          </p>
          <p
            className="text-[16px] font-semibold mb-6 px-4 py-2 rounded-lg inline-block"
            style={{ background: 'var(--bg-2)', color: 'var(--primary)' }}
          >
            {createdProjectName}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={goToProject}
              className="w-full px-6 py-3 rounded-[8px] text-[15px] font-semibold transition-all duration-[80ms] active:scale-[0.98]"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              View Project
            </button>
            <button
              onClick={goToDashboard}
              className="w-full px-6 py-3 rounded-[8px] text-[15px] font-medium transition-all duration-[80ms]"
              style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }}
            >
              Go to Dashboard
            </button>
          </div>

          {/* Additional Info */}
          <p
            className="text-[12px] mt-6"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Stakeholders will be notified for Greenlight approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[12px]"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 p-6"
          style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2
                className="text-[24px] font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Project Intake
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                Comprehensive project planning wizard
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-[6px] transition-all duration-[80ms]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <XIcon />
            </button>
          </div>

          {/* Progress Bar */}
          <div
            className="w-full h-2 rounded-full"
            style={{ background: 'var(--bg-2)' }}
          >
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%`, background: 'var(--primary)' }}
            />
          </div>
          <p
            className="text-[12px] mt-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Step {currentStep} of {totalSteps}: {stepLabels[currentStep - 1]}
          </p>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div
              className="rounded-[10px] p-4 mb-6"
              style={{ background: 'var(--danger-muted)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
            >
              {error}
            </div>
          )}

          {/* STEP 1: PROJECT BASICS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3
                className="text-[18px] font-semibold pb-3"
                style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
              >
                Project Basics
              </h3>

              <div>
                <label style={labelStyle}>
                  Project Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={intakeData.projectName || ''}
                  onChange={(e) => updateData('projectName', e.target.value)}
                  placeholder="e.g., Q4 Product Launch Video"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label style={labelStyle}>Project Type</label>
                  <select
                    value={intakeData.projectType}
                    onChange={(e) => updateData('projectType', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="EVENT">Event</option>
                    <option value="TRAINING">Training</option>
                    <option value="DOCUMENTARY">Documentary</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Priority</label>
                  <select
                    value={intakeData.priority}
                    onChange={(e) => updateData('priority', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Confidentiality</label>
                  <select
                    value={intakeData.confidentiality}
                    onChange={(e) => updateData('confidentiality', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="INTERNAL">Internal</option>
                    <option value="CONFIDENTIAL">Confidential</option>
                    <option value="HIGHLY_CONFIDENTIAL">Highly Confidential</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Department</label>
                <input
                  type="text"
                  value={intakeData.department || ''}
                  onChange={(e) => updateData('department', e.target.value)}
                  placeholder="e.g., Marketing, HR, Communications"
                  style={inputStyle}
                />
              </div>

              {/* Stakeholders */}
              <div>
                <h4
                  className="text-[16px] font-semibold mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Stakeholders
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { field: 'projectOwnerEmail', label: 'Project Owner Email', required: true },
                    { field: 'executiveSponsorEmail', label: 'Executive Sponsor Email' },
                    { field: 'creativeDirectorEmail', label: 'Creative Director Email' },
                    { field: 'producerEmail', label: 'Producer Email' },
                    { field: 'legalContactEmail', label: 'Legal Contact Email' },
                    { field: 'financeContactEmail', label: 'Finance Contact Email' },
                  ].map(({ field, label, required }) => (
                    <div key={field}>
                      <label style={smallLabelStyle}>
                        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
                      </label>
                      <input
                        type="email"
                        value={(intakeData as any)[field] || ''}
                        onChange={(e) => updateData(field as keyof IntakeData, e.target.value)}
                        placeholder={`${label.toLowerCase().replace(' email', '')}@company.com`}
                        style={{ ...inputStyle, padding: '10px 14px' }}
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label style={smallLabelStyle}>Client Contact Email (if external)</label>
                    <input
                      type="email"
                      value={intakeData.clientContactEmail || ''}
                      onChange={(e) => updateData('clientContactEmail', e.target.value)}
                      placeholder="client@external.com"
                      style={{ ...inputStyle, padding: '10px 14px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4
                  className="text-[16px] font-semibold mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Timeline
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={smallLabelStyle}>Kickoff Date</label>
                    <input
                      type="date"
                      value={intakeData.kickoffDate || ''}
                      onChange={(e) => updateData('kickoffDate', e.target.value)}
                      style={{ ...inputStyle, padding: '10px 14px' }}
                    />
                  </div>
                  <div>
                    <label style={smallLabelStyle}>
                      Distribution Date <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={intakeData.distributionDate || ''}
                      onChange={(e) => updateData('distributionDate', e.target.value)}
                      style={{ ...inputStyle, padding: '10px 14px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!intakeData.projectName || !intakeData.projectOwnerEmail || !intakeData.distributionDate}
                  className="px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms] active:scale-[0.98]"
                  style={{
                    background: (!intakeData.projectName || !intakeData.projectOwnerEmail || !intakeData.distributionDate)
                      ? 'var(--bg-2)' : 'var(--primary)',
                    color: (!intakeData.projectName || !intakeData.projectOwnerEmail || !intakeData.distributionDate)
                      ? 'var(--text-tertiary)' : 'white',
                    cursor: (!intakeData.projectName || !intakeData.projectOwnerEmail || !intakeData.distributionDate)
                      ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next: Creative Brief
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CREATIVE BRIEF */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3
                className="text-[18px] font-semibold pb-3"
                style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
              >
                AI-Powered Creative Brief
              </h3>

              <div>
                <label style={labelStyle}>
                  Project Description <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  value={intakeData.projectDescription || ''}
                  onChange={(e) => updateData('projectDescription', e.target.value)}
                  placeholder="Describe your project: What are you making? Who is it for? What's the vision?"
                  className="w-full h-40 resize-none"
                  style={inputStyle}
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label style={labelStyle}>Script or Additional Notes (Optional)</label>
                <textarea
                  value={intakeData.scriptOrNotes || ''}
                  onChange={(e) => updateData('scriptOrNotes', e.target.value)}
                  placeholder="Add script, shot list, or any additional details..."
                  className="w-full h-32 resize-none"
                  style={inputStyle}
                  disabled={isProcessing}
                />
              </div>

              <div className="flex justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms]"
                  style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }}
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={skipAIAnalysis}
                    disabled={isProcessing || !intakeData.projectDescription?.trim()}
                    className="px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms]"
                    style={{
                      background: 'var(--bg-2)',
                      color: (!intakeData.projectDescription?.trim())
                        ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    }}
                  >
                    Skip AI & Continue
                  </button>
                  <button
                    onClick={analyzeWithAI}
                    disabled={isProcessing || !intakeData.projectDescription?.trim()}
                    className="flex items-center gap-3 px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms] active:scale-[0.98]"
                    style={{
                      background: (isProcessing || !intakeData.projectDescription?.trim())
                        ? 'var(--bg-2)' : 'var(--primary)',
                      color: (isProcessing || !intakeData.projectDescription?.trim())
                        ? 'var(--text-tertiary)' : 'white',
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <SpinnerIcon />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze with AI & Continue'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3
                className="text-[18px] font-semibold pb-3"
                style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
              >
                Budget & Resources
              </h3>

              <div
                className="rounded-[12px] p-4"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              >
                <h4
                  className="text-[14px] font-medium mb-4"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Budget Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { field: 'budgetPreProduction', label: 'Pre-Production ($)' },
                    { field: 'budgetProduction', label: 'Production ($)' },
                    { field: 'budgetPostProduction', label: 'Post-Production ($)' },
                    { field: 'budgetDistribution', label: 'Distribution ($)' },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label style={smallLabelStyle}>{label}</label>
                      <input
                        type="number"
                        value={(intakeData as any)[field] || ''}
                        onChange={(e) => updateData(field as keyof IntakeData, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        style={{ ...inputStyle, background: 'var(--bg-1)', padding: '10px 14px' }}
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label style={smallLabelStyle}>Contingency (10-20%) ($)</label>
                    <input
                      type="number"
                      value={intakeData.budgetContingency || ''}
                      onChange={(e) => updateData('budgetContingency', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      style={{ ...inputStyle, background: 'var(--bg-1)', padding: '10px 14px' }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-[18px] font-bold" style={{ color: 'var(--secondary)' }}>
                    Total Budget: ${totalBudget.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Funding Source</label>
                  <input
                    type="text"
                    value={intakeData.fundingSource || ''}
                    onChange={(e) => updateData('fundingSource', e.target.value)}
                    placeholder="e.g., Marketing Budget Q4 2025"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Purchase Order Number (Optional)</label>
                  <input
                    type="text"
                    value={intakeData.purchaseOrderNumber || ''}
                    onChange={(e) => updateData('purchaseOrderNumber', e.target.value)}
                    placeholder="PO-2025-1234"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms]"
                  style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms] active:scale-[0.98]"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  Next: Distribution
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DISTRIBUTION */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3
                className="text-[18px] font-semibold pb-3"
                style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
              >
                Distribution & Success Metrics
              </h3>

              <div>
                <label style={labelStyle}>Distribution Channels</label>
                <div className="grid grid-cols-4 gap-3">
                  {['YouTube', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'Twitter/X', 'Internal Portal', 'Email Campaign'].map((channel) => (
                    <label
                      key={channel}
                      className="flex items-center gap-2 p-3 rounded-[10px] cursor-pointer transition-all duration-[80ms]"
                      style={{
                        background: 'var(--bg-2)',
                        border: intakeData.distributionChannels?.includes(channel)
                          ? '1px solid var(--primary)'
                          : '1px solid var(--border)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={intakeData.distributionChannels?.includes(channel)}
                        onChange={(e) => {
                          const current = intakeData.distributionChannels || [];
                          if (e.target.checked) {
                            updateData('distributionChannels', [...current, channel]);
                          } else {
                            updateData('distributionChannels', current.filter(c => c !== channel));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Master Format</label>
                  <select
                    value={intakeData.masterFormat || ''}
                    onChange={(e) => updateData('masterFormat', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select format...</option>
                    <option value="4K ProRes">4K ProRes</option>
                    <option value="4K H.264">4K H.264</option>
                    <option value="HD ProRes">HD ProRes</option>
                    <option value="HD H.264">HD H.264</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Social Crops Required</label>
                  <div className="flex gap-2">
                    {['16:9', '9:16', '1:1', '4:5'].map((crop) => (
                      <label
                        key={crop}
                        className="flex items-center gap-1 px-3 py-2 rounded-[6px] cursor-pointer transition-all duration-[80ms]"
                        style={{
                          background: 'var(--bg-2)',
                          border: intakeData.socialCropsRequired?.includes(crop)
                            ? '1px solid var(--primary)'
                            : '1px solid var(--border)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={intakeData.socialCropsRequired?.includes(crop)}
                          onChange={(e) => {
                            const current = intakeData.socialCropsRequired || [];
                            if (e.target.checked) {
                              updateData('socialCropsRequired', [...current, crop]);
                            } else {
                              updateData('socialCropsRequired', current.filter(c => c !== crop));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{crop}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label
                  className="flex items-center gap-2 p-3 rounded-[10px] cursor-pointer"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                >
                  <input
                    type="checkbox"
                    checked={intakeData.subtitlesRequired}
                    onChange={(e) => updateData('subtitlesRequired', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>Subtitles/Captions Required</span>
                </label>

                <div>
                  <label style={labelStyle}>Language Versions</label>
                  <input
                    type="text"
                    value={intakeData.languageVersions?.join(', ') || 'EN'}
                    onChange={(e) => updateData('languageVersions', e.target.value.split(',').map(l => l.trim()))}
                    placeholder="EN, ES, FR"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <h4
                  className="text-[16px] font-semibold mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Success Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Primary KPI</label>
                    <select
                      value={intakeData.primaryKPI || ''}
                      onChange={(e) => updateData('primaryKPI', e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Select KPI...</option>
                      <option value="Views">Views</option>
                      <option value="Engagement">Engagement Rate</option>
                      <option value="Conversions">Conversions</option>
                      <option value="Brand Lift">Brand Lift</option>
                      <option value="Completion Rate">Completion Rate</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Target Metric</label>
                    <input
                      type="text"
                      value={intakeData.targetMetric || ''}
                      onChange={(e) => updateData('targetMetric', e.target.value)}
                      placeholder="e.g., 100K views in 30 days"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms]"
                  style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms] active:scale-[0.98]"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  Next: Legal & Compliance
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: LEGAL */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3
                className="text-[18px] font-semibold pb-3"
                style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
              >
                Legal & Compliance
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Copyright Ownership</label>
                  <select
                    value={intakeData.copyrightOwnership}
                    onChange={(e) => updateData('copyrightOwnership', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="COMPANY">Company</option>
                    <option value="CLIENT">Client</option>
                    <option value="SHARED">Shared</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Usage Rights Duration</label>
                  <select
                    value={intakeData.usageRightsDuration}
                    onChange={(e) => updateData('usageRightsDuration', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="Perpetual">Perpetual</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="5 Years">5 Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Music Licensing</label>
                <select
                  value={intakeData.musicLicensing}
                  onChange={(e) => updateData('musicLicensing', e.target.value)}
                  style={selectStyle}
                >
                  <option value="ROYALTY_FREE">Royalty-Free</option>
                  <option value="LICENSED">Licensed</option>
                  <option value="ORIGINAL_SCORE">Original Score</option>
                  <option value="NONE">None</option>
                </select>
              </div>

              <div>
                <h4
                  className="text-[14px] font-medium mb-3"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Requirements
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { field: 'insuranceRequired', label: 'Insurance Required' },
                    { field: 'talentReleasesRequired', label: 'Talent Releases Required' },
                    { field: 'locationReleasesRequired', label: 'Location Releases Required' },
                  ].map(({ field, label }) => (
                    <label
                      key={field}
                      className="flex items-center gap-2 p-3 rounded-[10px] cursor-pointer"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                    >
                      <input
                        type="checkbox"
                        checked={(intakeData as any)[field]}
                        onChange={(e) => updateData(field as keyof IntakeData, e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms]"
                  style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms] active:scale-[0.98]"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  Review & Create Project
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h3
                className="text-[18px] font-semibold pb-3"
                style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
              >
                Review & Create Project
              </h3>

              <div
                className="rounded-[12px] p-6 space-y-4"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              >
                <div>
                  <h4 className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                    Project Name
                  </h4>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{intakeData.projectName}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Type</h4>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{intakeData.projectType}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Priority</h4>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{intakeData.priority}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Department</h4>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{intakeData.department}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Budget</h4>
                  <p className="text-[18px] font-bold" style={{ color: 'var(--secondary)' }}>
                    ${totalBudget.toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Distribution Date</h4>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{intakeData.distributionDate}</p>
                </div>

                <div>
                  <h4 className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Distribution Channels</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {intakeData.distributionChannels?.map((channel) => (
                      <span
                        key={channel}
                        className="px-3 py-1 rounded-full text-[12px] font-medium"
                        style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Success Metric</h4>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{intakeData.primaryKPI}: {intakeData.targetMetric}</p>
                </div>
              </div>

              <div
                className="rounded-[10px] p-4"
                style={{ background: 'var(--warning-muted)', border: '1px solid var(--warning)' }}
              >
                <p className="text-sm" style={{ color: 'var(--warning)' }}>
                  <strong>Note:</strong> Project will be created in DEVELOPMENT phase. Stakeholders will receive notification for Greenlight approval.
                </p>
              </div>

              <div className="flex justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms]"
                  style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }}
                >
                  Back
                </button>
                <button
                  onClick={createProject}
                  disabled={isProcessing}
                  className="flex items-center gap-3 px-6 py-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms] active:scale-[0.98]"
                  style={{
                    background: isProcessing ? 'var(--bg-2)' : 'var(--primary)',
                    color: isProcessing ? 'var(--text-tertiary)' : 'white',
                  }}
                >
                  {isProcessing ? (
                    <>
                      <SpinnerIcon />
                      Creating Project...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
