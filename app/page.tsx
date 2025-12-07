"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import Link from "next/link";
import ComprehensiveIntake from "./components/ComprehensiveIntake";
import GlobalNav from "./components/GlobalNav";

export default function App() {
  const [projects, setProjects] = useState<Array<Schema["Project"]["type"]>>([]);
  const [showIntakeWizard, setShowIntakeWizard] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [client] = useState(() => generateClient<Schema>());

  function listProjects() {
    try {
      client.models.Project.observeQuery().subscribe({
        next: (data) => {
          if (data?.items) {
            setProjects([...data.items]);
          }
        },
        error: (error) => {
          console.error('Error fetching projects:', error);
          setProjects([]);
        },
      });
    } catch (error) {
      console.error('Error setting up project subscription:', error);
      setProjects([]);
    }
  }

  useEffect(() => {
    listProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openIntakeWizard() {
    setShowIntakeWizard(true);
  }

  function closeIntakeWizard() {
    setShowIntakeWizard(false);
  }

  function handleIntakeComplete() {
    setShowIntakeWizard(false);
    listProjects(); // Refresh the project list
  }

  // Helper function to categorize projects
  const categorizeProjects = (userEmail: string | undefined) => {
    const actionRequired: typeof projects = [];
    const inProgress: typeof projects = [];
    const completed: typeof projects = [];

    projects.forEach(project => {
      const approvalRoles = [
        { field: 'producerEmail' as const, approved: 'greenlightProducerApproved' as const },
        { field: 'legalContactEmail' as const, approved: 'greenlightLegalApproved' as const },
        { field: 'financeContactEmail' as const, approved: 'greenlightFinanceApproved' as const },
        { field: 'executiveSponsorEmail' as const, approved: 'greenlightExecutiveApproved' as const },
        { field: 'clientContactEmail' as const, approved: 'greenlightClientApproved' as const },
      ];

      const userHasPending = approvalRoles.some(role =>
        project[role.field] === userEmail && !project[role.approved]
      );

      if (project.status === 'ARCHIVED' || project.status === 'DELIVERED') {
        completed.push(project);
      } else if (userHasPending) {
        actionRequired.push(project);
      } else {
        inProgress.push(project);
      }
    });

    return { actionRequired, inProgress, completed };
  };

  const ProjectCard = ({ project, userEmail }: { project: Schema["Project"]["type"], userEmail?: string }) => {
    const approvalRoles = [
      { field: 'producerEmail' as const, approved: 'greenlightProducerApproved' as const },
      { field: 'legalContactEmail' as const, approved: 'greenlightLegalApproved' as const },
      { field: 'financeContactEmail' as const, approved: 'greenlightFinanceApproved' as const },
      { field: 'executiveSponsorEmail' as const, approved: 'greenlightExecutiveApproved' as const },
      { field: 'clientContactEmail' as const, approved: 'greenlightClientApproved' as const },
    ];

    const requiredApprovals = approvalRoles.filter(role => project[role.field]);
    const completedApprovals = requiredApprovals.filter(role => project[role.approved]);
    const isGreenlit = requiredApprovals.length > 0 && requiredApprovals.length === completedApprovals.length;
    const needsApprovals = project.status === 'DEVELOPMENT' && requiredApprovals.length > 0;
    const userHasPending = approvalRoles.some(role =>
      project[role.field] === userEmail && !project[role.approved]
    );

    // Determine action message
    let actionMessage = null;
    if (userHasPending) {
      const pendingRole = approvalRoles.find(role =>
        project[role.field] === userEmail && !project[role.approved]
      );
      actionMessage = `Your approval required`;
    }

    return (
      <Link href={`/projects/${project.id}`}>
        <div className={`bg-slate-800 p-6 rounded-xl border-2 transition-all shadow-xl cursor-pointer relative hover:transform hover:scale-[1.02] ${
          userHasPending
            ? 'border-yellow-500 ring-2 ring-yellow-500/50 hover:border-yellow-400'
            : isGreenlit && needsApprovals
            ? 'border-green-500 hover:border-green-400'
            : project.status === 'ARCHIVED' || project.status === 'DELIVERED'
            ? 'border-slate-700/50 hover:border-slate-600 opacity-75'
            : 'border-slate-700 hover:border-teal-500/50'
        }`}>
          {/* Status Badge */}
          <div className="absolute -top-3 -right-3">
            {userHasPending ? (
              <div className="bg-yellow-500 text-black font-black px-3 py-1 rounded-full text-xs shadow-lg flex items-center gap-1 animate-pulse">
                ⚠️ ACTION NEEDED
              </div>
            ) : isGreenlit && needsApprovals ? (
              <div className="bg-green-500 text-black font-black px-3 py-1 rounded-full text-xs shadow-lg flex items-center gap-1">
                ✓ GREENLIT
              </div>
            ) : needsApprovals ? (
              <div className="bg-blue-500 text-white font-bold px-3 py-1 rounded-full text-xs shadow-lg">
                {completedApprovals.length}/{requiredApprovals.length}
              </div>
            ) : null}
          </div>

          <div className="flex justify-between items-start mb-3">
            <span className={`text-xs font-mono py-1 px-3 rounded-full border ${
              project.status === 'DEVELOPMENT' ? 'bg-blue-900/50 text-blue-200 border-blue-700' :
              project.status === 'PRE_PRODUCTION' ? 'bg-purple-900/50 text-purple-200 border-purple-700' :
              project.status === 'PRODUCTION' ? 'bg-green-900/50 text-green-200 border-green-700' :
              project.status === 'POST_PRODUCTION' ? 'bg-orange-900/50 text-orange-200 border-orange-700' :
              project.status === 'DELIVERED' ? 'bg-teal-900/50 text-teal-200 border-teal-700' :
              'bg-slate-900 text-slate-400 border-slate-700'
            }`}>
              {project.status.replace('_', ' ')}
            </span>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{project.department}</span>
          </div>

          <h2 className="text-xl font-bold mb-2 text-white">{project.name}</h2>

          {/* Action Message */}
          {actionMessage && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
              <p className="text-yellow-400 font-bold text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {actionMessage}
              </p>
            </div>
          )}

          <div className="text-sm text-slate-400 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {project.deadline || 'No deadline'}
          </div>

          {/* Progress Bar */}
          {needsApprovals ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Approval Progress</span>
                <span className="text-slate-300 font-bold">
                  {Math.round((completedApprovals.length / requiredApprovals.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isGreenlit ? 'bg-green-500' : 'bg-gradient-to-r from-teal-500 to-blue-500'
                  }`}
                  style={{ width: `${(completedApprovals.length / requiredApprovals.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${
                project.status === 'DEVELOPMENT' ? 'bg-blue-500 w-[20%]' :
                project.status === 'PRE_PRODUCTION' ? 'bg-purple-500 w-[40%]' :
                project.status === 'PRODUCTION' ? 'bg-green-500 w-[60%]' :
                project.status === 'POST_PRODUCTION' ? 'bg-orange-500 w-[80%]' :
                project.status === 'DELIVERED' ? 'bg-teal-500 w-[100%]' :
                'bg-slate-500 w-[10%]'
              }`}></div>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    // 2. WRAP THE APP IN AUTHENTICATOR
    <Authenticator>
      {({ signOut, user }) => {
        const { actionRequired, inProgress, completed } = categorizeProjects(user?.signInDetails?.loginId);

        return (
          <div className="min-h-screen bg-slate-900 text-white">
            {/* GLOBAL NAVIGATION */}
            <GlobalNav
              userEmail={user?.signInDetails?.loginId}
              onSignOut={signOut}
            />

            <main className="p-10 font-sans">
              {/* PAGE HEADER */}
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white">Projects</h1>
                  <p className="text-slate-400 mt-1">Manage your media production pipeline</p>
                </div>
                <button
                  onClick={openIntakeWizard}
                  className="bg-teal-500 hover:bg-teal-600 text-black font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-teal-500/20 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Project
                </button>
              </div>

            {/* GROUPED PROJECT SECTIONS */}
            {!projects || projects.length === 0 ? (
              <div className="text-center py-24 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-2xl text-slate-500 font-medium">System Idle.</p>
                <p className="text-slate-400 mt-2">Create a project to initialize the supply chain.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* ACTION REQUIRED SECTION */}
                {actionRequired.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-yellow-500 text-black font-black px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        ⚠️ ACTION REQUIRED
                      </div>
                      <span className="text-yellow-500 font-bold text-lg">
                        {actionRequired.length} {actionRequired.length === 1 ? 'project' : 'projects'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {actionRequired.map(project => (
                        <ProjectCard key={project.id} project={project} userEmail={user?.signInDetails?.loginId} />
                      ))}
                    </div>
                  </div>
                )}

                {/* IN PROGRESS SECTION */}
                {inProgress.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-500 text-white font-black px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        🔄 IN PROGRESS
                      </div>
                      <span className="text-blue-400 font-bold text-lg">
                        {inProgress.length} {inProgress.length === 1 ? 'project' : 'projects'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {inProgress.map(project => (
                        <ProjectCard key={project.id} project={project} userEmail={user?.signInDetails?.loginId} />
                      ))}
                    </div>
                  </div>
                )}

                {/* COMPLETED SECTION (Collapsible) */}
                {completed.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
                    >
                      <div className="bg-slate-700 text-slate-300 font-black px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        ✓ COMPLETED
                      </div>
                      <span className="text-slate-400 font-bold text-lg">
                        {completed.length} {completed.length === 1 ? 'project' : 'projects'}
                      </span>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showCompleted && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completed.map(project => (
                          <ProjectCard key={project.id} project={project} userEmail={user?.signInDetails?.loginId} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

              {/* Comprehensive Intake Wizard */}
              {showIntakeWizard && (
                <ComprehensiveIntake
                  onComplete={handleIntakeComplete}
                  onCancel={closeIntakeWizard}
                />
              )}
            </main>
          </div>
        );
      }}
    </Authenticator>
  );
}