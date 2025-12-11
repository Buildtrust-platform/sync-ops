"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import TeamPermissions from "./TeamPermissions";

/**
 * PROJECT SETTINGS & CONFIGURATION
 *
 * Editable form for project metadata including:
 * - Stakeholder email assignments (for Greenlight approvals)
 * - Location data (for Field Intelligence)
 * - Timeline dates (for Timeline visualization)
 * - Lifecycle state (for testing/admin override)
 */

interface ProjectSettingsProps {
  project: Schema["Project"]["type"];
  onUpdate: () => Promise<void>;
}

export default function ProjectSettings({ project, onUpdate }: ProjectSettingsProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Stakeholder emails
    producerEmail: project.producerEmail || '',
    legalContactEmail: project.legalContactEmail || '',
    financeContactEmail: project.financeContactEmail || '',
    executiveSponsorEmail: project.executiveSponsorEmail || '',
    clientContactEmail: project.clientContactEmail || '',

    // Location data
    shootLocationCity: project.shootLocationCity || '',
    shootLocationCountry: project.shootLocationCountry || '',
    shootLocationCoordinates: project.shootLocationCoordinates || '',

    // Timeline dates
    kickoffDate: project.kickoffDate || '',
    preProductionStartDate: project.preProductionStartDate || '',
    preProductionEndDate: project.preProductionEndDate || '',
    productionStartDate: project.productionStartDate || '',
    productionEndDate: project.productionEndDate || '',
    postProductionStartDate: project.postProductionStartDate || '',
    postProductionEndDate: project.postProductionEndDate || '',
    reviewDeadline: project.reviewDeadline || '',
    legalLockDeadline: project.legalLockDeadline || '',
    distributionDate: project.distributionDate || '',
    deadline: project.deadline || '',

    // Lifecycle state (admin override)
    lifecycleState: project.lifecycleState || 'INTAKE',

    // Budget breakdown
    budgetPreProduction: project.budgetPreProduction?.toString() || '',
    budgetProduction: project.budgetProduction?.toString() || '',
    budgetPostProduction: project.budgetPostProduction?.toString() || '',
    budgetDistribution: project.budgetDistribution?.toString() || '',
    budgetContingency: project.budgetContingency?.toString() || '',
    fundingSource: project.fundingSource || '',
    purchaseOrderNumber: project.purchaseOrderNumber || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!project.id || !client) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Convert budget strings to numbers
      const budgetFields = ['budgetPreProduction', 'budgetProduction', 'budgetPostProduction', 'budgetDistribution', 'budgetContingency'];

      const updateData: any = {
        id: project.id,
        ...formData,
      };

      // Convert budget fields to numbers
      budgetFields.forEach(field => {
        if (updateData[field] && updateData[field] !== '') {
          updateData[field] = parseFloat(updateData[field]);
        } else {
          updateData[field] = null;
        }
      });

      // Remove empty strings (convert to null) for other fields
      Object.keys(updateData).forEach(key => {
        if (!budgetFields.includes(key) && updateData[key] === '') {
          updateData[key] = null;
        }
      });

      await client.models.Project.update(updateData);

      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      await onUpdate();

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Check console for details.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Message */}
      {saveMessage && (
        <div className={`rounded-lg p-4 ${
          saveMessage.type === 'success'
            ? 'bg-green-900/30 border border-green-500 text-green-300'
            : 'bg-red-900/30 border border-red-500 text-red-300'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* STAKEHOLDER ASSIGNMENTS */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            👥 Stakeholder Assignments
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Assign stakeholder emails to enable Greenlight Gate approvals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              🎬 Producer Email
            </label>
            <input
              type="email"
              value={formData.producerEmail}
              onChange={(e) => handleInputChange('producerEmail', e.target.value)}
              placeholder="producer@company.com"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              ⚖️ Legal Contact Email
            </label>
            <input
              type="email"
              value={formData.legalContactEmail}
              onChange={(e) => handleInputChange('legalContactEmail', e.target.value)}
              placeholder="legal@company.com"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              💰 Finance Contact Email
            </label>
            <input
              type="email"
              value={formData.financeContactEmail}
              onChange={(e) => handleInputChange('financeContactEmail', e.target.value)}
              placeholder="finance@company.com"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              👔 Executive Sponsor Email
            </label>
            <input
              type="email"
              value={formData.executiveSponsorEmail}
              onChange={(e) => handleInputChange('executiveSponsorEmail', e.target.value)}
              placeholder="executive@company.com"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              🤝 Client Contact Email
            </label>
            <input
              type="email"
              value={formData.clientContactEmail}
              onChange={(e) => handleInputChange('clientContactEmail', e.target.value)}
              placeholder="client@company.com"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* TEAM & PERMISSIONS (RBAC) */}
      <TeamPermissions
        projectId={project.id}
        organizationId={project.organizationId}
      />

      {/* SHOOT LOCATION */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🌍 Shoot Location
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Set location to enable Field Intelligence weather data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.shootLocationCity}
              onChange={(e) => handleInputChange('shootLocationCity', e.target.value)}
              placeholder="Los Angeles"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.shootLocationCountry}
              onChange={(e) => handleInputChange('shootLocationCountry', e.target.value)}
              placeholder="USA"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Coordinates (lat,lng)
            </label>
            <input
              type="text"
              value={formData.shootLocationCoordinates}
              onChange={(e) => handleInputChange('shootLocationCoordinates', e.target.value)}
              placeholder="34.0522,-118.2437"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              Find coordinates at <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">latlong.net</a>
            </p>
          </div>
        </div>
      </div>

      {/* BUDGET BREAKDOWN */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            💰 Budget Breakdown
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Allocate budget across production phases to enable Budget Tracker
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              📋 Pre-Production Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={formData.budgetPreProduction}
                onChange={(e) => handleInputChange('budgetPreProduction', e.target.value)}
                placeholder="0"
                min="0"
                step="100"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              🎬 Production Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={formData.budgetProduction}
                onChange={(e) => handleInputChange('budgetProduction', e.target.value)}
                placeholder="0"
                min="0"
                step="100"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              ✂️ Post-Production Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={formData.budgetPostProduction}
                onChange={(e) => handleInputChange('budgetPostProduction', e.target.value)}
                placeholder="0"
                min="0"
                step="100"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              🚀 Distribution Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={formData.budgetDistribution}
                onChange={(e) => handleInputChange('budgetDistribution', e.target.value)}
                placeholder="0"
                min="0"
                step="100"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              🛡️ Contingency Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={formData.budgetContingency}
                onChange={(e) => handleInputChange('budgetContingency', e.target.value)}
                placeholder="0"
                min="0"
                step="100"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              📊 Total Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="text"
                value={(
                  (parseFloat(formData.budgetPreProduction) || 0) +
                  (parseFloat(formData.budgetProduction) || 0) +
                  (parseFloat(formData.budgetPostProduction) || 0) +
                  (parseFloat(formData.budgetDistribution) || 0) +
                  (parseFloat(formData.budgetContingency) || 0)
                ).toLocaleString()}
                readOnly
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-teal-400 font-bold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              💳 Funding Source
            </label>
            <input
              type="text"
              value={formData.fundingSource}
              onChange={(e) => handleInputChange('fundingSource', e.target.value)}
              placeholder="e.g., Marketing Budget Q4"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              📄 Purchase Order Number
            </label>
            <input
              type="text"
              value={formData.purchaseOrderNumber}
              onChange={(e) => handleInputChange('purchaseOrderNumber', e.target.value)}
              placeholder="e.g., PO-2024-001"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* PROJECT TIMELINE */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            📅 Project Timeline
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Set milestone dates to populate the Timeline visualization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Kickoff Date
            </label>
            <input
              type="date"
              value={formData.kickoffDate}
              onChange={(e) => handleInputChange('kickoffDate', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Pre-Production Start
            </label>
            <input
              type="date"
              value={formData.preProductionStartDate}
              onChange={(e) => handleInputChange('preProductionStartDate', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Pre-Production End
            </label>
            <input
              type="date"
              value={formData.preProductionEndDate}
              onChange={(e) => handleInputChange('preProductionEndDate', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Production Start
            </label>
            <input
              type="date"
              value={formData.productionStartDate}
              onChange={(e) => handleInputChange('productionStartDate', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Production End
            </label>
            <input
              type="date"
              value={formData.productionEndDate}
              onChange={(e) => handleInputChange('productionEndDate', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Post-Production Start
            </label>
            <input
              type="date"
              value={formData.postProductionStartDate}
              onChange={(e) => handleInputChange('postProductionStartDate', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Post-Production End
            </label>
            <input
              type="date"
              value={formData.postProductionEndDate}
              onChange={(e) => handleInputChange('postProductionEndDate', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Review Deadline
            </label>
            <input
              type="date"
              value={formData.reviewDeadline}
              onChange={(e) => handleInputChange('reviewDeadline', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Legal Lock Deadline
            </label>
            <input
              type="date"
              value={formData.legalLockDeadline}
              onChange={(e) => handleInputChange('legalLockDeadline', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Distribution Date
            </label>
            <input
              type="date"
              value={formData.distributionDate}
              onChange={(e) => handleInputChange('distributionDate', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Final Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* LIFECYCLE STATE (ADMIN OVERRIDE) */}
      <div className="bg-orange-900/20 border-2 border-orange-600 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-orange-300 flex items-center gap-2">
            ⚙️ Lifecycle State Override
          </h3>
          <p className="text-sm text-orange-400 mt-1">
            ⚠️ Admin only: Manually override lifecycle state for testing
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-orange-300 mb-2">
            Current Lifecycle State
          </label>
          <select
            value={formData.lifecycleState}
            onChange={(e) => handleInputChange('lifecycleState', e.target.value)}
            className="w-full md:w-1/2 bg-slate-900 border border-orange-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          >
            <option value="INTAKE">INTAKE - Smart Brief creation</option>
            <option value="LEGAL_REVIEW">LEGAL_REVIEW - Legal reviewing brief</option>
            <option value="BUDGET_APPROVAL">BUDGET_APPROVAL - Finance approval</option>
            <option value="GREENLIT">GREENLIT - All approvals granted</option>
            <option value="PRE_PRODUCTION">PRE_PRODUCTION - Logistics & permits</option>
            <option value="PRODUCTION">PRODUCTION - Active filming</option>
            <option value="POST_PRODUCTION">POST_PRODUCTION - Editing</option>
            <option value="INTERNAL_REVIEW">INTERNAL_REVIEW - Stakeholder review</option>
            <option value="LEGAL_APPROVED">LEGAL_APPROVED - Legal has locked master</option>
            <option value="DISTRIBUTION_READY">DISTRIBUTION_READY - Approved for distribution</option>
            <option value="DISTRIBUTED">DISTRIBUTED - Actively distributed</option>
            <option value="ARCHIVED">ARCHIVED - Long-term storage</option>
          </select>
          <p className="text-xs text-orange-400 mt-2">
            Note: Normal workflow advancement should happen through Greenlight Gate and Production Pipeline
          </p>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black py-4 px-8 rounded-xl transition-all flex items-center gap-3 text-lg shadow-xl hover:shadow-teal-500/50"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save All Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
