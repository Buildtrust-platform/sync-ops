"use client";

import { useState, useEffect, useMemo } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * INSURANCE TRACKER MODULE (Pre-Production)
 *
 * Purpose: Comprehensive insurance certificate and coverage management
 *
 * Features:
 * - Certificate of Insurance (COI) tracking
 * - Coverage verification
 * - Expiration alerts
 * - Vendor/Vendor insurance tracking
 * - Policy document storage
 * - Auto-notify on expiring coverage
 * - Multiple policy types support
 */

type CoverageStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "PENDING" | "NOT_REQUIRED";
type PolicyType =
  | "GENERAL_LIABILITY"
  | "WORKERS_COMP"
  | "AUTO_LIABILITY"
  | "EQUIPMENT"
  | "ERRORS_OMISSIONS"
  | "PROPERTY"
  | "UMBRELLA"
  | "DRONE"
  | "MARINE"
  | "OTHER";

interface InsurancePolicy {
  id: string;
  projectId: string;
  // Policy Info
  policyType: PolicyType;
  policyNumber: string;
  carrier: string;
  coverageAmount: number;
  deductible?: number | null;
  // Dates
  effectiveDate: string;
  expirationDate: string;
  // Holder Info
  holderName: string;
  holderType: "PRODUCTION" | "VENDOR" | "LOCATION" | "TALENT" | "OTHER";
  holderEmail?: string | null;
  holderPhone?: string | null;
  // Additional
  additionalInsured?: string[] | null;
  specialEndorsements?: string | null;
  certificateUrl?: string | null;
  // Status
  status: CoverageStatus;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface InsuranceRequirement {
  id: string;
  projectId: string;
  requirementType: PolicyType;
  minimumCoverage: number;
  description: string;
  requiredFor: string; // e.g., "All vendors", "Location permits"
  deadline?: string | null;
  isMet: boolean;
}

interface InsuranceTrackerProps {
  projectId: string;
  organizationId?: string;
  currentUserEmail: string;
}

const POLICY_TYPE_CONFIG: Record<PolicyType, { label: string; icon: string; color: string }> = {
  GENERAL_LIABILITY: { label: "General Liability", icon: "🛡️", color: "bg-blue-500" },
  WORKERS_COMP: { label: "Workers' Compensation", icon: "👷", color: "bg-orange-500" },
  AUTO_LIABILITY: { label: "Auto Liability", icon: "🚗", color: "bg-purple-500" },
  EQUIPMENT: { label: "Equipment Coverage", icon: "📹", color: "bg-teal-500" },
  ERRORS_OMISSIONS: { label: "Errors & Omissions", icon: "📋", color: "bg-indigo-500" },
  PROPERTY: { label: "Property Insurance", icon: "🏢", color: "bg-yellow-500" },
  UMBRELLA: { label: "Umbrella Policy", icon: "☂️", color: "bg-slate-500" },
  DRONE: { label: "Drone/UAV Coverage", icon: "🚁", color: "bg-green-500" },
  MARINE: { label: "Marine Insurance", icon: "⛵", color: "bg-cyan-500" },
  OTHER: { label: "Other Coverage", icon: "📄", color: "bg-gray-500" },
};

const STATUS_CONFIG = {
  ACTIVE: { label: "Active", color: "bg-green-500", textColor: "text-green-400" },
  EXPIRING_SOON: { label: "Expiring Soon", color: "bg-yellow-500", textColor: "text-yellow-400" },
  EXPIRED: { label: "Expired", color: "bg-red-500", textColor: "text-red-400" },
  PENDING: { label: "Pending", color: "bg-blue-500", textColor: "text-blue-400" },
  NOT_REQUIRED: { label: "Not Required", color: "bg-slate-500", textColor: "text-slate-400" },
};

const HOLDER_TYPE_CONFIG = {
  PRODUCTION: { label: "Production Company", icon: "🎬" },
  VENDOR: { label: "Vendor", icon: "🏪" },
  LOCATION: { label: "Location", icon: "📍" },
  TALENT: { label: "Talent", icon: "⭐" },
  OTHER: { label: "Other", icon: "📋" },
};

export default function InsuranceTracker({
  projectId,
  organizationId,
  currentUserEmail,
}: InsuranceTrackerProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [requirements, setRequirements] = useState<InsuranceRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<"policies" | "requirements" | "expiring">("policies");
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [showAddRequirementModal, setShowAddRequirementModal] = useState(false);
  const [filterType, setFilterType] = useState<PolicyType | "ALL">("ALL");
  const [filterHolder, setFilterHolder] = useState<string>("ALL");

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Form states
  const [policyForm, setPolicyForm] = useState({
    policyType: "GENERAL_LIABILITY" as PolicyType,
    policyNumber: "",
    carrier: "",
    coverageAmount: "",
    deductible: "",
    effectiveDate: "",
    expirationDate: "",
    holderName: "",
    holderType: "PRODUCTION" as InsurancePolicy["holderType"],
    holderEmail: "",
    holderPhone: "",
    additionalInsured: "",
    specialEndorsements: "",
    notes: "",
  });

  const [requirementForm, setRequirementForm] = useState({
    requirementType: "GENERAL_LIABILITY" as PolicyType,
    minimumCoverage: "",
    description: "",
    requiredFor: "",
    deadline: "",
  });

  // Calculate status based on dates
  const calculateStatus = (expirationDate: string): CoverageStatus => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return "EXPIRED";
    if (daysUntilExpiry <= 30) return "EXPIRING_SOON";
    return "ACTIVE";
  };

  // Load data
  useEffect(() => {
    setIsLoading(true);

    // Mock policies
    const mockPolicies: InsurancePolicy[] = [
      {
        id: "policy-1",
        projectId,
        policyType: "GENERAL_LIABILITY",
        policyNumber: "GL-2024-001234",
        carrier: "Entertainment Insurance Partners",
        coverageAmount: 2000000,
        deductible: 10000,
        effectiveDate: "2024-01-01",
        expirationDate: "2025-01-01",
        holderName: "MasterOps Productions LLC",
        holderType: "PRODUCTION",
        holderEmail: "insurance@masterops.com",
        additionalInsured: ["Location Owner LLC", "Client Corp"],
        status: "ACTIVE",
        verifiedBy: currentUserEmail,
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: "policy-2",
        projectId,
        policyType: "WORKERS_COMP",
        policyNumber: "WC-2024-005678",
        carrier: "Workers Safety Insurance Co",
        coverageAmount: 1000000,
        effectiveDate: "2024-01-01",
        expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 days from now
        holderName: "MasterOps Productions LLC",
        holderType: "PRODUCTION",
        status: "EXPIRING_SOON",
        createdAt: new Date().toISOString(),
      },
      {
        id: "policy-3",
        projectId,
        policyType: "EQUIPMENT",
        policyNumber: "EQ-2024-009012",
        carrier: "Camera Coverage Inc",
        coverageAmount: 500000,
        deductible: 2500,
        effectiveDate: "2024-06-01",
        expirationDate: "2025-06-01",
        holderName: "Lens Rental House",
        holderType: "VENDOR",
        holderEmail: "certs@lensrental.com",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      },
    ];

    // Update status based on dates
    const updatedPolicies = mockPolicies.map((p) => ({
      ...p,
      status: calculateStatus(p.expirationDate),
    }));

    // Mock requirements
    const mockRequirements: InsuranceRequirement[] = [
      {
        id: "req-1",
        projectId,
        requirementType: "GENERAL_LIABILITY",
        minimumCoverage: 1000000,
        description: "Minimum $1M general liability coverage required for all production activities",
        requiredFor: "Production company",
        isMet: true,
      },
      {
        id: "req-2",
        projectId,
        requirementType: "WORKERS_COMP",
        minimumCoverage: 500000,
        description: "Workers compensation coverage as required by state law",
        requiredFor: "All crew",
        isMet: true,
      },
      {
        id: "req-3",
        projectId,
        requirementType: "AUTO_LIABILITY",
        minimumCoverage: 1000000,
        description: "Auto liability for production vehicles",
        requiredFor: "Transportation department",
        isMet: false,
      },
    ];

    setPolicies(updatedPolicies);
    setRequirements(mockRequirements);
    setIsLoading(false);
  }, [projectId, currentUserEmail]);

  // Stats
  const stats = useMemo(() => {
    const activePolicies = policies.filter((p) => p.status === "ACTIVE").length;
    const expiringSoon = policies.filter((p) => p.status === "EXPIRING_SOON").length;
    const expired = policies.filter((p) => p.status === "EXPIRED").length;
    const totalCoverage = policies.reduce((sum, p) => sum + p.coverageAmount, 0);
    const requirementsMet = requirements.filter((r) => r.isMet).length;

    return {
      totalPolicies: policies.length,
      activePolicies,
      expiringSoon,
      expired,
      totalCoverage,
      requirementsMet,
      requirementsTotal: requirements.length,
    };
  }, [policies, requirements]);

  // Filtered policies
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      if (filterType !== "ALL" && p.policyType !== filterType) return false;
      if (filterHolder !== "ALL" && p.holderType !== filterHolder) return false;
      return true;
    });
  }, [policies, filterType, filterHolder]);

  // Expiring policies
  const expiringPolicies = useMemo(() => {
    return policies
      .filter((p) => p.status === "EXPIRING_SOON" || p.status === "EXPIRED")
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
  }, [policies]);

  // Days until expiry
  const getDaysUntilExpiry = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    return Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Add policy handler
  const handleAddPolicy = () => {
    if (!policyForm.policyNumber || !policyForm.carrier || !policyForm.coverageAmount || !policyForm.expirationDate) {
      alert("Please fill in required fields");
      return;
    }

    const newPolicy: InsurancePolicy = {
      id: `policy-${Date.now()}`,
      projectId,
      policyType: policyForm.policyType,
      policyNumber: policyForm.policyNumber,
      carrier: policyForm.carrier,
      coverageAmount: parseFloat(policyForm.coverageAmount),
      deductible: policyForm.deductible ? parseFloat(policyForm.deductible) : null,
      effectiveDate: policyForm.effectiveDate,
      expirationDate: policyForm.expirationDate,
      holderName: policyForm.holderName,
      holderType: policyForm.holderType,
      holderEmail: policyForm.holderEmail || null,
      holderPhone: policyForm.holderPhone || null,
      additionalInsured: policyForm.additionalInsured
        ? policyForm.additionalInsured.split(",").map((s) => s.trim())
        : null,
      specialEndorsements: policyForm.specialEndorsements || null,
      status: calculateStatus(policyForm.expirationDate),
      notes: policyForm.notes || null,
      createdAt: new Date().toISOString(),
    };

    setPolicies((prev) => [...prev, newPolicy]);

    // Check if this satisfies any requirements
    setRequirements((prev) =>
      prev.map((req) => {
        if (
          req.requirementType === newPolicy.policyType &&
          newPolicy.coverageAmount >= req.minimumCoverage &&
          newPolicy.status === "ACTIVE"
        ) {
          return { ...req, isMet: true };
        }
        return req;
      })
    );

    setShowAddPolicyModal(false);
    setPolicyForm({
      policyType: "GENERAL_LIABILITY",
      policyNumber: "",
      carrier: "",
      coverageAmount: "",
      deductible: "",
      effectiveDate: "",
      expirationDate: "",
      holderName: "",
      holderType: "PRODUCTION",
      holderEmail: "",
      holderPhone: "",
      additionalInsured: "",
      specialEndorsements: "",
      notes: "",
    });
  };

  // Add requirement handler
  const handleAddRequirement = () => {
    if (!requirementForm.minimumCoverage || !requirementForm.description) {
      alert("Please fill in required fields");
      return;
    }

    const newRequirement: InsuranceRequirement = {
      id: `req-${Date.now()}`,
      projectId,
      requirementType: requirementForm.requirementType,
      minimumCoverage: parseFloat(requirementForm.minimumCoverage),
      description: requirementForm.description,
      requiredFor: requirementForm.requiredFor,
      deadline: requirementForm.deadline || null,
      isMet: false,
    };

    // Check if already met by existing policies
    const matchingPolicy = policies.find(
      (p) =>
        p.policyType === newRequirement.requirementType &&
        p.coverageAmount >= newRequirement.minimumCoverage &&
        p.status === "ACTIVE"
    );

    if (matchingPolicy) {
      newRequirement.isMet = true;
    }

    setRequirements((prev) => [...prev, newRequirement]);
    setShowAddRequirementModal(false);
    setRequirementForm({
      requirementType: "GENERAL_LIABILITY",
      minimumCoverage: "",
      description: "",
      requiredFor: "",
      deadline: "",
    });
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <h2 className="text-xl font-black text-white">Insurance Tracker</h2>
              <p className="text-indigo-200 text-sm">COI management and coverage verification</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddRequirementModal(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-colors"
            >
              + Add Requirement
            </button>
            <button
              onClick={() => setShowAddPolicyModal(true)}
              className="px-4 py-2 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-colors"
            >
              + Add Policy
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {(stats.expiringSoon > 0 || stats.expired > 0) && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-yellow-400 text-xl">⚠️</span>
            <div className="flex-1">
              {stats.expired > 0 && (
                <span className="text-red-400 font-bold mr-4">{stats.expired} Expired Policy(ies)</span>
              )}
              {stats.expiringSoon > 0 && (
                <span className="text-yellow-400 font-bold">{stats.expiringSoon} Expiring Within 30 Days</span>
              )}
            </div>
            <button
              onClick={() => setActiveTab("expiring")}
              className="px-3 py-1 bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-400 rounded text-sm font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-slate-800 border-b border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-black text-white">{stats.totalPolicies}</div>
          <div className="text-xs text-slate-400">Total Policies</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-green-400">{stats.activePolicies}</div>
          <div className="text-xs text-slate-400">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-yellow-400">{stats.expiringSoon}</div>
          <div className="text-xs text-slate-400">Expiring Soon</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-red-400">{stats.expired}</div>
          <div className="text-xs text-slate-400">Expired</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-teal-400">{formatCurrency(stats.totalCoverage)}</div>
          <div className="text-xs text-slate-400">Total Coverage</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-purple-400">
            {stats.requirementsMet}/{stats.requirementsTotal}
          </div>
          <div className="text-xs text-slate-400">Requirements Met</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        {[
          { id: "policies", label: "All Policies", icon: "📄" },
          { id: "requirements", label: "Requirements", icon: "✅" },
          { id: "expiring", label: "Expiring/Expired", icon: "⚠️", count: stats.expiringSoon + stats.expired },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">📋</div>
            <p className="text-slate-400">Loading insurance data...</p>
          </div>
        ) : activeTab === "policies" ? (
          /* Policies Tab */
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-slate-500 mb-1">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as PolicyType | "ALL")}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="ALL">All Types</option>
                  {Object.entries(POLICY_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-slate-500 mb-1">Filter by Holder</label>
                <select
                  value={filterHolder}
                  onChange={(e) => setFilterHolder(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="ALL">All Holders</option>
                  {Object.entries(HOLDER_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredPolicies.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">📋</span>
                <h3 className="text-xl font-bold text-white mt-4">No Policies Found</h3>
                <p className="text-slate-400 mt-2">
                  {policies.length === 0
                    ? "Add insurance policies to track coverage"
                    : "No policies match your filters"}
                </p>
                <button
                  onClick={() => setShowAddPolicyModal(true)}
                  className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  + Add Policy
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPolicies.map((policy) => {
                  const typeConfig = POLICY_TYPE_CONFIG[policy.policyType];
                  const statusConfig = STATUS_CONFIG[policy.status];
                  const holderConfig = HOLDER_TYPE_CONFIG[policy.holderType];
                  const daysLeft = getDaysUntilExpiry(policy.expirationDate);

                  return (
                    <div
                      key={policy.id}
                      className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
                    >
                      <div className={`${typeConfig.color} px-4 py-2 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{typeConfig.icon}</span>
                          <span className="text-white font-bold">{typeConfig.label}</span>
                        </div>
                        <span className={`${statusConfig.color} px-2 py-0.5 rounded text-xs font-bold text-white`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white">{policy.holderName}</h3>
                            <p className="text-sm text-slate-400">
                              <span className="mr-1">{holderConfig.icon}</span>
                              {holderConfig.label} • {policy.carrier}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-teal-400">{formatCurrency(policy.coverageAmount)}</p>
                            <p className="text-xs text-slate-500">Coverage Limit</p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Policy #</p>
                            <p className="text-white font-medium">{policy.policyNumber}</p>
                          </div>
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Effective</p>
                            <p className="text-white font-medium">
                              {new Date(policy.effectiveDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Expires</p>
                            <p className={`font-medium ${statusConfig.textColor}`}>
                              {new Date(policy.expirationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Days Left</p>
                            <p className={`font-bold ${daysLeft < 0 ? "text-red-400" : daysLeft <= 30 ? "text-yellow-400" : "text-green-400"}`}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days`}
                            </p>
                          </div>
                        </div>

                        {policy.deductible && (
                          <p className="mt-2 text-sm text-slate-400">
                            Deductible: {formatCurrency(policy.deductible)}
                          </p>
                        )}

                        {policy.additionalInsured && policy.additionalInsured.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-500 mb-1">Additional Insured:</p>
                            <div className="flex flex-wrap gap-1">
                              {policy.additionalInsured.map((name, i) => (
                                <span key={i} className="bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-300">
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {policy.verifiedBy && (
                          <p className="mt-3 text-xs text-green-400">
                            ✓ Verified by {policy.verifiedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === "requirements" ? (
          /* Requirements Tab */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-slate-400">Insurance requirements for this production</p>
            </div>

            {requirements.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">✅</span>
                <h3 className="text-xl font-bold text-white mt-4">No Requirements Set</h3>
                <p className="text-slate-400 mt-2">Define insurance requirements for your production</p>
                <button
                  onClick={() => setShowAddRequirementModal(true)}
                  className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  + Add Requirement
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {requirements.map((req) => {
                  const typeConfig = POLICY_TYPE_CONFIG[req.requirementType];

                  return (
                    <div
                      key={req.id}
                      className={`bg-slate-800 rounded-lg border ${
                        req.isMet ? "border-green-500/30" : "border-red-500/30"
                      } overflow-hidden`}
                    >
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                              req.isMet ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {req.isMet ? "✓" : "!"}
                          </span>
                          <div>
                            <h3 className="font-bold text-white flex items-center gap-2">
                              <span>{typeConfig.icon}</span>
                              {typeConfig.label}
                            </h3>
                            <p className="text-sm text-slate-400">{req.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{formatCurrency(req.minimumCoverage)}</p>
                          <p className="text-xs text-slate-500">Minimum Required</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-slate-700/30 flex items-center justify-between">
                        <span className="text-sm text-slate-400">Required for: {req.requiredFor}</span>
                        <span
                          className={`text-sm font-bold ${
                            req.isMet ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {req.isMet ? "✓ Requirement Met" : "✗ Not Met"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Expiring Tab */
          <div className="space-y-4">
            {expiringPolicies.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">✅</span>
                <h3 className="text-xl font-bold text-white mt-4">All Policies Current</h3>
                <p className="text-slate-400 mt-2">No policies are expiring soon or expired</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Expired Section */}
                {policies.filter((p) => p.status === "EXPIRED").length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-red-400 mb-3">🚨 Expired Policies</h3>
                    <div className="space-y-3">
                      {policies
                        .filter((p) => p.status === "EXPIRED")
                        .map((policy) => {
                          const typeConfig = POLICY_TYPE_CONFIG[policy.policyType];
                          const daysExpired = Math.abs(getDaysUntilExpiry(policy.expirationDate));

                          return (
                            <div
                              key={policy.id}
                              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{typeConfig.icon}</span>
                                <div>
                                  <h4 className="font-bold text-white">{typeConfig.label}</h4>
                                  <p className="text-sm text-slate-400">{policy.holderName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-red-400 font-bold">{daysExpired} days overdue</p>
                                <p className="text-xs text-slate-500">
                                  Expired {new Date(policy.expirationDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Expiring Soon Section */}
                {policies.filter((p) => p.status === "EXPIRING_SOON").length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-yellow-400 mb-3">⚠️ Expiring Within 30 Days</h3>
                    <div className="space-y-3">
                      {policies
                        .filter((p) => p.status === "EXPIRING_SOON")
                        .map((policy) => {
                          const typeConfig = POLICY_TYPE_CONFIG[policy.policyType];
                          const daysLeft = getDaysUntilExpiry(policy.expirationDate);

                          return (
                            <div
                              key={policy.id}
                              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{typeConfig.icon}</span>
                                <div>
                                  <h4 className="font-bold text-white">{typeConfig.label}</h4>
                                  <p className="text-sm text-slate-400">{policy.holderName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-yellow-400 font-bold">{daysLeft} days remaining</p>
                                <p className="text-xs text-slate-500">
                                  Expires {new Date(policy.expirationDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Policy Modal */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Insurance Policy</h3>
                <button onClick={() => setShowAddPolicyModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Policy Type *</label>
                  <select
                    value={policyForm.policyType}
                    onChange={(e) => setPolicyForm({ ...policyForm, policyType: e.target.value as PolicyType })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(POLICY_TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Policy Number *</label>
                  <input
                    type="text"
                    value={policyForm.policyNumber}
                    onChange={(e) => setPolicyForm({ ...policyForm, policyNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Insurance Carrier *</label>
                <input
                  type="text"
                  value={policyForm.carrier}
                  onChange={(e) => setPolicyForm({ ...policyForm, carrier: e.target.value })}
                  placeholder="e.g., Entertainment Insurance Partners"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Coverage Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={policyForm.coverageAmount}
                      onChange={(e) => setPolicyForm({ ...policyForm, coverageAmount: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Deductible</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={policyForm.deductible}
                      onChange={(e) => setPolicyForm({ ...policyForm, deductible: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={policyForm.effectiveDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, effectiveDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Expiration Date *</label>
                  <input
                    type="date"
                    value={policyForm.expirationDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, expirationDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Policy Holder</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Holder Name *</label>
                    <input
                      type="text"
                      value={policyForm.holderName}
                      onChange={(e) => setPolicyForm({ ...policyForm, holderName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Holder Type</label>
                    <select
                      value={policyForm.holderType}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, holderType: e.target.value as InsurancePolicy["holderType"] })
                      }
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      {Object.entries(HOLDER_TYPE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.icon} {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={policyForm.holderEmail}
                      onChange={(e) => setPolicyForm({ ...policyForm, holderEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={policyForm.holderPhone}
                      onChange={(e) => setPolicyForm({ ...policyForm, holderPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Additional Insured (comma-separated)</label>
                <input
                  type="text"
                  value={policyForm.additionalInsured}
                  onChange={(e) => setPolicyForm({ ...policyForm, additionalInsured: e.target.value })}
                  placeholder="e.g., Location Owner LLC, Client Corp"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Notes</label>
                <textarea
                  value={policyForm.notes}
                  onChange={(e) => setPolicyForm({ ...policyForm, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddPolicyModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPolicy}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Add Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Requirement Modal */}
      {showAddRequirementModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Insurance Requirement</h3>
                <button onClick={() => setShowAddRequirementModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Coverage Type *</label>
                <select
                  value={requirementForm.requirementType}
                  onChange={(e) =>
                    setRequirementForm({ ...requirementForm, requirementType: e.target.value as PolicyType })
                  }
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  {Object.entries(POLICY_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Minimum Coverage *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={requirementForm.minimumCoverage}
                    onChange={(e) => setRequirementForm({ ...requirementForm, minimumCoverage: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Description *</label>
                <textarea
                  value={requirementForm.description}
                  onChange={(e) => setRequirementForm({ ...requirementForm, description: e.target.value })}
                  rows={2}
                  placeholder="Why is this coverage required?"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Required For</label>
                <input
                  type="text"
                  value={requirementForm.requiredFor}
                  onChange={(e) => setRequirementForm({ ...requirementForm, requiredFor: e.target.value })}
                  placeholder="e.g., All vendors, Production company"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Deadline</label>
                <input
                  type="date"
                  value={requirementForm.deadline}
                  onChange={(e) => setRequirementForm({ ...requirementForm, deadline: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddRequirementModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRequirement}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Add Requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
