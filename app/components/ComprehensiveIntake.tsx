"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";
import type { Schema } from "@/amplify/data/resource";

/**
 * COMPREHENSIVE PROJECT INTAKE WIZARD
 *
 * Multi-step wizard that captures all project details before entering the production pipeline.
 *
 * Steps:
 * 1. Project Basics (Who, What, When)
 * 2. AI-Powered Creative Brief
 * 3. Budget & Resources
 * 4. Distribution & Success Metrics
 * 5. Legal & Compliance
 * 6. Review & Greenlight
 */

interface IntakeData {
  // Step 1: Project Basics
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

  // Step 2: AI Creative Brief
  projectDescription: string;
  scriptOrNotes: string;
  aiResults: any;

  // Step 3: Budget
  budgetPreProduction: number;
  budgetProduction: number;
  budgetPostProduction: number;
  budgetDistribution: number;
  budgetContingency: number;
  fundingSource: string;
  purchaseOrderNumber: string;

  // Step 4: Distribution
  distributionChannels: string[];
  masterFormat: string;
  socialCropsRequired: string[];
  subtitlesRequired: boolean;
  languageVersions: string[];
  primaryKPI: string;
  targetMetric: string;

  // Step 5: Legal
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

export default function ComprehensiveIntake({ onComplete, onCancel }: ComprehensiveIntakeProps) {
  const router = useRouter();
  const [client] = useState(() => generateClient<Schema>());
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  // Fetch user's organization on mount
  useEffect(() => {
    async function fetchUserOrganization() {
      try {
        // Get user attributes
        const attributes = await fetchUserAttributes();
        const email = attributes.email || '';
        const userId = attributes.sub || '';
        setUserEmail(email);

        // Find user's organization membership
        const { data: memberships } = await client.models.OrganizationMember.list({
          filter: { email: { eq: email } }
        });

        if (memberships && memberships.length > 0) {
          setOrganizationId(memberships[0].organizationId);
        } else {
          // If no membership found, try to get/create a default organization
          const { data: orgs } = await client.models.Organization.list();
          if (orgs && orgs.length > 0) {
            setOrganizationId(orgs[0].id);
          } else {
            // Create a default organization for the user
            const { data: newOrg } = await client.models.Organization.create({
              name: 'My Organization',
              slug: `org-${Date.now()}`,
              email: email,
              subscriptionTier: 'FREE',
              subscriptionStatus: 'TRIALING',
              createdBy: userId,
            });
            if (newOrg) {
              setOrganizationId(newOrg.id);
              // Also create membership
              await client.models.OrganizationMember.create({
                organizationId: newOrg.id,
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

  async function analyzeWithAI() {
    if (!intakeData.projectDescription?.trim()) {
      setError("Please enter a project description");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { data, errors } = await client.queries.analyzeProjectBrief({
        projectDescription: intakeData.projectDescription,
        scriptOrNotes: intakeData.scriptOrNotes || undefined,
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      updateData('aiResults', data);
      setCurrentStep(3); // Move to budget step
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('Failed to analyze project. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function createProject() {
    setIsProcessing(true);
    setError(null);

    if (!organizationId) {
      setError('Organization not found. Please refresh and try again.');
      setIsProcessing(false);
      return;
    }

    try {
      const aiResults = intakeData.aiResults as any;

      // Calculate total budget
      const totalBudget = (intakeData.budgetPreProduction || 0) +
        (intakeData.budgetProduction || 0) +
        (intakeData.budgetPostProduction || 0) +
        (intakeData.budgetDistribution || 0) +
        (intakeData.budgetContingency || 0);

      // Create the project
      const newProject = await client.models.Project.create({
        organizationId: organizationId,
        name: intakeData.projectName || aiResults?.projectName || 'Untitled Project',
        description: intakeData.projectDescription,
        status: 'DEVELOPMENT',
        department: intakeData.department,

        // Project Classification
        projectType: intakeData.projectType,
        priority: intakeData.priority,
        confidentiality: intakeData.confidentiality,

        // Stakeholders
        projectOwnerEmail: intakeData.projectOwnerEmail,
        executiveSponsorEmail: intakeData.executiveSponsorEmail,
        creativeDirectorEmail: intakeData.creativeDirectorEmail,
        producerEmail: intakeData.producerEmail,
        legalContactEmail: intakeData.legalContactEmail,
        financeContactEmail: intakeData.financeContactEmail,
        clientContactEmail: intakeData.clientContactEmail,

        // Timeline
        kickoffDate: intakeData.kickoffDate,
        distributionDate: intakeData.distributionDate,
        deadline: intakeData.distributionDate,

        // Budget
        budgetCap: totalBudget,
        budgetPreProduction: intakeData.budgetPreProduction,
        budgetProduction: intakeData.budgetProduction,
        budgetPostProduction: intakeData.budgetPostProduction,
        budgetDistribution: intakeData.budgetDistribution,
        budgetContingency: intakeData.budgetContingency,
        fundingSource: intakeData.fundingSource,
        purchaseOrderNumber: intakeData.purchaseOrderNumber,

        // Success Metrics
        primaryKPI: intakeData.primaryKPI,
        targetMetric: intakeData.targetMetric,

        // Greenlight - initially false, set in step 6
        greenlightProducerApproved: false,
        greenlightLegalApproved: false,
        greenlightFinanceApproved: false,
        greenlightExecutiveApproved: false,
        greenlightClientApproved: false,
      });

      // Log detailed error info if project creation failed
      if (newProject.errors && newProject.errors.length > 0) {
        console.error('Project creation GraphQL errors:', newProject.errors);
        throw new Error(`Failed to create project: ${newProject.errors.map(e => e.message).join(', ')}`);
      }

      if (!newProject.data) {
        console.error('Project creation returned null data without errors');
        throw new Error('Failed to create project - no data returned');
      }

      // Create the Brief
      await client.models.Brief.create({
        organizationId: organizationId,
        projectId: newProject.data.id,
        projectDescription: intakeData.projectDescription,
        scriptOrNotes: intakeData.scriptOrNotes,

        // AI-extracted fields
        deliverables: aiResults?.deliverables || [],
        estimatedDuration: aiResults?.estimatedDuration || '',
        targetAudience: aiResults?.targetAudience || '',
        tone: aiResults?.tone || '',
        budgetRange: aiResults?.budgetRange || '',
        crewRoles: aiResults?.crewRoles || [],
        distributionChannels: intakeData.distributionChannels || [],

        // Distribution & Format
        masterFormat: intakeData.masterFormat,
        socialCropsRequired: intakeData.socialCropsRequired,
        subtitlesRequired: intakeData.subtitlesRequired,
        languageVersions: intakeData.languageVersions,

        // Legal & Compliance
        copyrightOwnership: intakeData.copyrightOwnership,
        usageRightsDuration: intakeData.usageRightsDuration,
        musicLicensing: intakeData.musicLicensing,
        insuranceRequired: intakeData.insuranceRequired,
        talentReleasesRequired: intakeData.talentReleasesRequired,
        locationReleasesRequired: intakeData.locationReleasesRequired,

        // Risk assessment
        riskLevel: aiResults?.risks ? calculateRiskLevel(aiResults.risks) : 'LOW',
        hasDroneRisk: aiResults?.risks?.drones || false,
        hasMinorRisk: aiResults?.risks?.minors || false,
        hasPublicSpaceRisk: aiResults?.risks?.publicSpaces || false,
        hasStuntRisk: aiResults?.risks?.stunts || false,
        hasHazardousLocationRisk: aiResults?.risks?.hazardousLocations || false,
        requiredPermits: aiResults?.requiredPermits || [],

        // Scene breakdown
        scenes: aiResults?.scenes || [],
        complexity: aiResults?.complexity || 'MEDIUM',

        // Approval tracking
        aiProcessedAt: new Date().toISOString(),
        approvedByProducer: false,
        approvedByLegal: false,
        approvedByFinance: false,
      });

      // Log activity
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

      // Close the wizard
      onComplete();

      // Small delay to allow database propagation before navigating
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to the new project detail page
      router.push(`/projects/${newProject.data.id}`);
    } catch (err) {
      console.error('Project creation error:', err);
      setError('Failed to create project. Please try again.');
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header with Progress */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-teal-400">Project Intake</h2>
              <p className="text-slate-400 mt-1">Comprehensive project planning wizard</p>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? 'Project Basics' :
              currentStep === 2 ? 'Creative Brief' :
              currentStep === 3 ? 'Budget & Resources' :
              currentStep === 4 ? 'Distribution & Metrics' :
              currentStep === 5 ? 'Legal & Compliance' :
              'Review & Greenlight'
            }
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 mb-6">
              {error}
            </div>
          )}

          {/* STEP 1: PROJECT BASICS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-3">Project Basics</h3>

              {/* Project Name */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={intakeData.projectName || ''}
                  onChange={(e) => updateData('projectName', e.target.value)}
                  placeholder="e.g., Q4 Product Launch Video"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Project Type, Priority, Confidentiality */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Project Type</label>
                  <select
                    value={intakeData.projectType}
                    onChange={(e) => updateData('projectType', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
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
                  <label className="block text-sm font-bold text-slate-300 mb-2">Priority</label>
                  <select
                    value={intakeData.priority}
                    onChange={(e) => updateData('priority', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Confidentiality</label>
                  <select
                    value={intakeData.confidentiality}
                    onChange={(e) => updateData('confidentiality', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="INTERNAL">Internal</option>
                    <option value="CONFIDENTIAL">Confidential</option>
                    <option value="HIGHLY_CONFIDENTIAL">Highly Confidential</option>
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Department</label>
                <input
                  type="text"
                  value={intakeData.department || ''}
                  onChange={(e) => updateData('department', e.target.value)}
                  placeholder="e.g., Marketing, HR, Communications"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Stakeholders */}
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Stakeholders</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Project Owner Email <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      value={intakeData.projectOwnerEmail || ''}
                      onChange={(e) => updateData('projectOwnerEmail', e.target.value)}
                      placeholder="owner@company.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Executive Sponsor Email</label>
                    <input
                      type="email"
                      value={intakeData.executiveSponsorEmail || ''}
                      onChange={(e) => updateData('executiveSponsorEmail', e.target.value)}
                      placeholder="sponsor@company.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Creative Director Email</label>
                    <input
                      type="email"
                      value={intakeData.creativeDirectorEmail || ''}
                      onChange={(e) => updateData('creativeDirectorEmail', e.target.value)}
                      placeholder="creative@company.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Producer Email</label>
                    <input
                      type="email"
                      value={intakeData.producerEmail || ''}
                      onChange={(e) => updateData('producerEmail', e.target.value)}
                      placeholder="producer@company.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Legal Contact Email</label>
                    <input
                      type="email"
                      value={intakeData.legalContactEmail || ''}
                      onChange={(e) => updateData('legalContactEmail', e.target.value)}
                      placeholder="legal@company.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Finance Contact Email</label>
                    <input
                      type="email"
                      value={intakeData.financeContactEmail || ''}
                      onChange={(e) => updateData('financeContactEmail', e.target.value)}
                      placeholder="finance@company.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 mb-2">Client Contact Email (if external)</label>
                    <input
                      type="email"
                      value={intakeData.clientContactEmail || ''}
                      onChange={(e) => updateData('clientContactEmail', e.target.value)}
                      placeholder="client@external.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Timeline</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Kickoff Date</label>
                    <input
                      type="date"
                      value={intakeData.kickoffDate || ''}
                      onChange={(e) => updateData('kickoffDate', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Distribution Date <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      value={intakeData.distributionDate || ''}
                      onChange={(e) => updateData('distributionDate', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end pt-4 border-t border-slate-700">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!intakeData.projectName || !intakeData.projectOwnerEmail || !intakeData.distributionDate}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-3 px-8 rounded-lg transition-all"
                >
                  Next: Creative Brief
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CREATIVE BRIEF (AI-POWERED) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-3">AI-Powered Creative Brief</h3>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Project Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={intakeData.projectDescription || ''}
                  onChange={(e) => updateData('projectDescription', e.target.value)}
                  placeholder="Describe your project: What are you making? Who is it for? What's the vision?"
                  className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Script or Additional Notes (Optional)
                </label>
                <textarea
                  value={intakeData.scriptOrNotes || ''}
                  onChange={(e) => updateData('scriptOrNotes', e.target.value)}
                  placeholder="Add script, shot list, or any additional details..."
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  disabled={isProcessing}
                />
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-slate-700">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  onClick={analyzeWithAI}
                  disabled={isProcessing || !intakeData.projectDescription?.trim()}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing with AI...
                    </>
                  ) : (
                    'Analyze with AI & Continue'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET & RESOURCES */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-3">Budget & Resources</h3>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Budget Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Pre-Production ($)</label>
                    <input
                      type="number"
                      value={intakeData.budgetPreProduction || ''}
                      onChange={(e) => updateData('budgetPreProduction', parseFloat(e.target.value) || 0)}
                      placeholder="5000"
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Production ($)</label>
                    <input
                      type="number"
                      value={intakeData.budgetProduction || ''}
                      onChange={(e) => updateData('budgetProduction', parseFloat(e.target.value) || 0)}
                      placeholder="15000"
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Post-Production ($)</label>
                    <input
                      type="number"
                      value={intakeData.budgetPostProduction || ''}
                      onChange={(e) => updateData('budgetPostProduction', parseFloat(e.target.value) || 0)}
                      placeholder="10000"
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Distribution ($)</label>
                    <input
                      type="number"
                      value={intakeData.budgetDistribution || ''}
                      onChange={(e) => updateData('budgetDistribution', parseFloat(e.target.value) || 0)}
                      placeholder="3000"
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-2">Contingency (10-20%) ($)</label>
                    <input
                      type="number"
                      value={intakeData.budgetContingency || ''}
                      onChange={(e) => updateData('budgetContingency', parseFloat(e.target.value) || 0)}
                      placeholder="5000"
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-lg font-bold text-teal-400">
                    Total Budget: ${((intakeData.budgetPreProduction || 0) + (intakeData.budgetProduction || 0) + (intakeData.budgetPostProduction || 0) + (intakeData.budgetDistribution || 0) + (intakeData.budgetContingency || 0)).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Funding Source</label>
                  <input
                    type="text"
                    value={intakeData.fundingSource || ''}
                    onChange={(e) => updateData('fundingSource', e.target.value)}
                    placeholder="e.g., Marketing Budget Q4 2025"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Purchase Order Number (Optional)</label>
                  <input
                    type="text"
                    value={intakeData.purchaseOrderNumber || ''}
                    onChange={(e) => updateData('purchaseOrderNumber', e.target.value)}
                    placeholder="PO-2025-1234"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-slate-700">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="bg-teal-500 hover:bg-teal-600 text-black font-bold py-3 px-8 rounded-lg transition-all"
                >
                  Next: Distribution
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DISTRIBUTION & METRICS */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-3">Distribution & Success Metrics</h3>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Distribution Channels</label>
                <div className="grid grid-cols-3 gap-3">
                  {['YouTube', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'Twitter/X', 'Internal Portal', 'Email Campaign'].map((channel) => (
                    <label key={channel} className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3 cursor-pointer hover:border-teal-500 transition-colors">
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
                      <span className="text-sm text-white">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Master Format</label>
                  <select
                    value={intakeData.masterFormat || ''}
                    onChange={(e) => updateData('masterFormat', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                  >
                    <option value="">Select format...</option>
                    <option value="4K ProRes">4K ProRes</option>
                    <option value="4K H.264">4K H.264</option>
                    <option value="HD ProRes">HD ProRes</option>
                    <option value="HD H.264">HD H.264</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Social Crops Required</label>
                  <div className="flex gap-2">
                    {['16:9', '9:16', '1:1', '4:5'].map((crop) => (
                      <label key={crop} className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 cursor-pointer hover:border-teal-500 transition-colors">
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
                        <span className="text-sm text-white">{crop}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={intakeData.subtitlesRequired}
                    onChange={(e) => updateData('subtitlesRequired', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-white">Subtitles/Captions Required</span>
                </label>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Language Versions</label>
                  <input
                    type="text"
                    value={intakeData.languageVersions?.join(', ') || 'EN'}
                    onChange={(e) => updateData('languageVersions', e.target.value.split(',').map(l => l.trim()))}
                    placeholder="EN, ES, FR"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3">Success Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Primary KPI</label>
                    <select
                      value={intakeData.primaryKPI || ''}
                      onChange={(e) => updateData('primaryKPI', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
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
                    <label className="block text-sm font-bold text-slate-300 mb-2">Target Metric</label>
                    <input
                      type="text"
                      value={intakeData.targetMetric || ''}
                      onChange={(e) => updateData('targetMetric', e.target.value)}
                      placeholder="e.g., 100K views in 30 days"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-slate-700">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="bg-teal-500 hover:bg-teal-600 text-black font-bold py-3 px-8 rounded-lg transition-all"
                >
                  Next: Legal & Compliance
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: LEGAL & COMPLIANCE */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-3">Legal & Compliance</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Copyright Ownership</label>
                  <select
                    value={intakeData.copyrightOwnership}
                    onChange={(e) => updateData('copyrightOwnership', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                  >
                    <option value="COMPANY">Company</option>
                    <option value="CLIENT">Client</option>
                    <option value="SHARED">Shared</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Usage Rights Duration</label>
                  <select
                    value={intakeData.usageRightsDuration}
                    onChange={(e) => updateData('usageRightsDuration', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                  >
                    <option value="Perpetual">Perpetual</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="5 Years">5 Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Music Licensing</label>
                <select
                  value={intakeData.musicLicensing}
                  onChange={(e) => updateData('musicLicensing', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                >
                  <option value="ROYALTY_FREE">Royalty-Free</option>
                  <option value="LICENSED">Licensed</option>
                  <option value="ORIGINAL_SCORE">Original Score</option>
                  <option value="NONE">None</option>
                </select>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-3">Requirements</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={intakeData.insuranceRequired}
                      onChange={(e) => updateData('insuranceRequired', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-white">Insurance Required</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={intakeData.talentReleasesRequired}
                      onChange={(e) => updateData('talentReleasesRequired', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-white">Talent Releases Required</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={intakeData.locationReleasesRequired}
                      onChange={(e) => updateData('locationReleasesRequired', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-white">Location Releases Required</span>
                  </label>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-slate-700">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="bg-teal-500 hover:bg-teal-600 text-black font-bold py-3 px-8 rounded-lg transition-all"
                >
                  Review & Create Project
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & GREENLIGHT */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-3">Review & Create Project</h3>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-1">PROJECT NAME</h4>
                  <p className="text-white font-medium">{intakeData.projectName}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-1">TYPE</h4>
                    <p className="text-white text-sm">{intakeData.projectType}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-1">PRIORITY</h4>
                    <p className="text-white text-sm">{intakeData.priority}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-1">DEPARTMENT</h4>
                    <p className="text-white text-sm">{intakeData.department}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-1">TOTAL BUDGET</h4>
                  <p className="text-teal-400 font-bold text-lg">
                    ${((intakeData.budgetPreProduction || 0) + (intakeData.budgetProduction || 0) + (intakeData.budgetPostProduction || 0) + (intakeData.budgetDistribution || 0) + (intakeData.budgetContingency || 0)).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-1">DISTRIBUTION DATE</h4>
                  <p className="text-white text-sm">{intakeData.distributionDate}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-1">DISTRIBUTION CHANNELS</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {intakeData.distributionChannels?.map((channel) => (
                      <span key={channel} className="bg-teal-500/20 text-teal-300 text-xs px-3 py-1 rounded-full">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-1">SUCCESS METRIC</h4>
                  <p className="text-white text-sm">{intakeData.primaryKPI}: {intakeData.targetMetric}</p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  <strong>Note:</strong> Project will be created in DEVELOPMENT phase. Stakeholders will receive notification for Greenlight approval.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-slate-700">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  onClick={createProject}
                  disabled={isProcessing}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
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
