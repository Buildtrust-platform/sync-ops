"use client";

import type { Schema } from "@/amplify/data/resource";

/**
 * PROJECT OVERVIEW DASHBOARD
 *
 * Displays comprehensive project information captured during intake:
 * - Project classification (type, priority, confidentiality)
 * - Key stakeholders with contact information
 * - Timeline milestones
 * - Budget breakdown
 * - Success metrics
 * - Smart Brief AI results
 */

interface ProjectOverviewProps {
  project: Schema["Project"]["type"];
  brief?: Schema["Brief"]["type"] | null;
}

export default function ProjectOverview({ project, brief }: ProjectOverviewProps) {
  // Calculate total budget
  const totalBudget = (project.budgetPreProduction || 0) +
    (project.budgetProduction || 0) +
    (project.budgetPostProduction || 0) +
    (project.budgetDistribution || 0) +
    (project.budgetContingency || 0);

  return (
    <div className="space-y-6">
      {/* PROJECT CLASSIFICATION */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          📊 Project Classification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project Type */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Type</p>
            <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
              <p className="text-white font-bold">{project.projectType || 'Not specified'}</p>
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Priority</p>
            <div className={`border rounded-lg px-4 py-2 ${
              project.priority === 'URGENT' ? 'bg-red-900/20 border-red-500' :
              project.priority === 'HIGH' ? 'bg-orange-900/20 border-orange-500' :
              project.priority === 'NORMAL' ? 'bg-blue-900/20 border-blue-500' :
              'bg-slate-900 border-slate-700'
            }`}>
              <p className={`font-bold ${
                project.priority === 'URGENT' ? 'text-red-400' :
                project.priority === 'HIGH' ? 'text-orange-400' :
                project.priority === 'NORMAL' ? 'text-blue-400' :
                'text-slate-400'
              }`}>
                {project.priority || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Confidentiality */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Confidentiality</p>
            <div className={`border rounded-lg px-4 py-2 ${
              project.confidentiality === 'HIGHLY_CONFIDENTIAL' ? 'bg-purple-900/20 border-purple-500' :
              project.confidentiality === 'CONFIDENTIAL' ? 'bg-yellow-900/20 border-yellow-500' :
              'bg-slate-900 border-slate-700'
            }`}>
              <p className={`font-bold ${
                project.confidentiality === 'HIGHLY_CONFIDENTIAL' ? 'text-purple-400' :
                project.confidentiality === 'CONFIDENTIAL' ? 'text-yellow-400' :
                'text-slate-400'
              }`}>
                {project.confidentiality?.replace('_', ' ') || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Department & Funding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Department</p>
            <p className="text-white">{project.department || 'Not specified'}</p>
          </div>
          {project.fundingSource && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Funding Source</p>
              <p className="text-white">{project.fundingSource}</p>
              {project.purchaseOrderNumber && (
                <p className="text-xs text-slate-400 mt-1">PO: {project.purchaseOrderNumber}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STAKEHOLDER DIRECTORY */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          👥 Stakeholder Directory
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.projectOwnerEmail && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Project Owner</p>
                  <p className="text-white text-sm font-bold">Owner</p>
                </div>
              </div>
              <p className="text-teal-400 text-sm">{project.projectOwnerEmail}</p>
            </div>
          )}

          {project.executiveSponsorEmail && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👔</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Executive Sponsor</p>
                  <p className="text-white text-sm font-bold">Executive</p>
                </div>
              </div>
              <p className="text-teal-400 text-sm">{project.executiveSponsorEmail}</p>
            </div>
          )}

          {project.producerEmail && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎬</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Producer</p>
                  <p className="text-white text-sm font-bold">Production</p>
                </div>
              </div>
              <p className="text-teal-400 text-sm">{project.producerEmail}</p>
            </div>
          )}

          {project.creativeDirectorEmail && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎨</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Creative Director</p>
                  <p className="text-white text-sm font-bold">Creative</p>
                </div>
              </div>
              <p className="text-teal-400 text-sm">{project.creativeDirectorEmail}</p>
            </div>
          )}

          {project.legalContactEmail && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⚖️</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Legal Contact</p>
                  <p className="text-white text-sm font-bold">Legal</p>
                </div>
              </div>
              <p className="text-teal-400 text-sm">{project.legalContactEmail}</p>
            </div>
          )}

          {project.financeContactEmail && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Finance Contact</p>
                  <p className="text-white text-sm font-bold">Finance</p>
                </div>
              </div>
              <p className="text-teal-400 text-sm">{project.financeContactEmail}</p>
            </div>
          )}

          {project.clientContactEmail && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🤝</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Client Contact</p>
                  <p className="text-white text-sm font-bold">Client</p>
                </div>
              </div>
              <p className="text-teal-400 text-sm">{project.clientContactEmail}</p>
            </div>
          )}
        </div>
      </div>

      {/* BUDGET OVERVIEW */}
      {totalBudget > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            💵 Budget Overview
          </h3>

          {/* Total Budget */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
            <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Total Budget</p>
            <p className="text-3xl font-black text-green-400">
              ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Budget Breakdown */}
          <div className="space-y-3">
            {project.budgetPreProduction > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-slate-300">Pre-Production</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    ${project.budgetPreProduction.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {Math.round((project.budgetPreProduction / totalBudget) * 100)}%
                  </p>
                </div>
              </div>
            )}

            {project.budgetProduction > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-slate-300">Production</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    ${project.budgetProduction.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {Math.round((project.budgetProduction / totalBudget) * 100)}%
                  </p>
                </div>
              </div>
            )}

            {project.budgetPostProduction > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-slate-300">Post-Production</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    ${project.budgetPostProduction.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {Math.round((project.budgetPostProduction / totalBudget) * 100)}%
                  </p>
                </div>
              </div>
            )}

            {project.budgetDistribution > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-500 rounded"></div>
                  <span className="text-slate-300">Distribution</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    ${project.budgetDistribution.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {Math.round((project.budgetDistribution / totalBudget) * 100)}%
                  </p>
                </div>
              </div>
            )}

            {project.budgetContingency > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-slate-300">Contingency</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    ${project.budgetContingency.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {Math.round((project.budgetContingency / totalBudget) * 100)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Visual Budget Bar */}
          <div className="mt-4 h-4 bg-slate-700 rounded-full overflow-hidden flex">
            {project.budgetPreProduction > 0 && (
              <div
                className="bg-purple-500 h-full"
                style={{ width: `${(project.budgetPreProduction / totalBudget) * 100}%` }}
                title="Pre-Production"
              />
            )}
            {project.budgetProduction > 0 && (
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(project.budgetProduction / totalBudget) * 100}%` }}
                title="Production"
              />
            )}
            {project.budgetPostProduction > 0 && (
              <div
                className="bg-yellow-500 h-full"
                style={{ width: `${(project.budgetPostProduction / totalBudget) * 100}%` }}
                title="Post-Production"
              />
            )}
            {project.budgetDistribution > 0 && (
              <div
                className="bg-teal-500 h-full"
                style={{ width: `${(project.budgetDistribution / totalBudget) * 100}%` }}
                title="Distribution"
              />
            )}
            {project.budgetContingency > 0 && (
              <div
                className="bg-orange-500 h-full"
                style={{ width: `${(project.budgetContingency / totalBudget) * 100}%` }}
                title="Contingency"
              />
            )}
          </div>
        </div>
      )}

      {/* SUCCESS METRICS */}
      {(project.primaryKPI || project.targetMetric) && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            🎯 Success Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.primaryKPI && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Primary KPI</p>
                <p className="text-white font-bold text-lg">{project.primaryKPI}</p>
              </div>
            )}
            {project.targetMetric && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Target</p>
                <p className="text-teal-400 font-bold text-lg">{project.targetMetric}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SMART BRIEF AI RESULTS */}
      {brief && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            🤖 AI Creative Brief Analysis
          </h3>

          <div className="space-y-4">
            {/* Deliverables */}
            {brief.deliverables && brief.deliverables.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Deliverables</p>
                <div className="flex flex-wrap gap-2">
                  {brief.deliverables.map((item, idx) => (
                    <span key={idx} className="bg-teal-900/30 border border-teal-500 text-teal-300 px-3 py-1 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Target Audience */}
            {brief.targetAudience && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Target Audience</p>
                <p className="text-white">{brief.targetAudience}</p>
              </div>
            )}

            {/* Tone */}
            {brief.tone && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Tone</p>
                <p className="text-white">{brief.tone}</p>
              </div>
            )}

            {/* Distribution Channels */}
            {brief.distributionChannels && brief.distributionChannels.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Distribution Channels</p>
                <div className="flex flex-wrap gap-2">
                  {brief.distributionChannels.map((channel, idx) => (
                    <span key={idx} className="bg-blue-900/30 border border-blue-500 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Level */}
            {brief.riskLevel && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Risk Level</p>
                <div className={`inline-block px-4 py-2 rounded-lg font-bold ${
                  brief.riskLevel === 'HIGH' ? 'bg-red-900/30 border border-red-500 text-red-400' :
                  brief.riskLevel === 'MEDIUM' ? 'bg-yellow-900/30 border border-yellow-500 text-yellow-400' :
                  'bg-green-900/30 border border-green-500 text-green-400'
                }`}>
                  {brief.riskLevel}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
