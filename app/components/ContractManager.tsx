"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * CONTRACT MANAGER COMPONENT
 * Legal document templates, tracking, and approval workflows
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const FileContractIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const PenToolIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19 7-7 3 3-7 7-3-3z"/>
    <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="m2 2 7.586 7.586"/>
    <circle cx="11" cy="11" r="2"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v5h5"/>
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
    <path d="M12 7v5l4 2"/>
  </svg>
);

// Contract types
const CONTRACT_TYPES = {
  talent: { label: "Talent Agreement", color: "#3B82F6", description: "Actor/performer contracts" },
  crew: { label: "Crew Deal Memo", color: "#10B981", description: "Production crew agreements" },
  location: { label: "Location Agreement", color: "#8B5CF6", description: "Filming location permits" },
  vendor: { label: "Vendor Agreement", color: "#F59E0B", description: "Third-party service contracts" },
  nda: { label: "NDA", color: "#6366F1", description: "Non-disclosure agreements" },
  ip: { label: "IP Assignment", color: "#EC4899", description: "Intellectual property rights" },
  licensing: { label: "Licensing Agreement", color: "#06B6D4", description: "Content licensing rights" },
  release: { label: "Release Form", color: "#84CC16", description: "Talent/location releases" },
  insurance: { label: "Insurance Certificate", color: "#EF4444", description: "Production insurance docs" },
  other: { label: "Other", color: "#6B7280", description: "Miscellaneous contracts" }
};

// Contract status
const CONTRACT_STATUS = {
  draft: { label: "Draft", color: "var(--text-tertiary)", icon: PenToolIcon },
  pending_review: { label: "Pending Review", color: "var(--warning)", icon: ClockIcon },
  sent: { label: "Sent for Signature", color: "var(--info)", icon: SendIcon },
  partially_signed: { label: "Partially Signed", color: "var(--warning)", icon: PenToolIcon },
  executed: { label: "Fully Executed", color: "var(--success)", icon: CheckCircleIcon },
  expired: { label: "Expired", color: "var(--error)", icon: AlertTriangleIcon },
  terminated: { label: "Terminated", color: "var(--error)", icon: XIcon }
};

interface Signatory {
  id: string;
  name: string;
  email: string;
  role: string;
  signedAt?: string;
  signature?: string;
}

interface ContractVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changes: string;
  fileUrl?: string;
}

interface Contract {
  id: string;
  title: string;
  type: keyof typeof CONTRACT_TYPES;
  status: keyof typeof CONTRACT_STATUS;
  description?: string;
  partyA: string;
  partyB: string;
  effectiveDate?: string;
  expirationDate?: string;
  value?: number;
  currency: string;
  signatories: Signatory[];
  versions: ContractVersion[];
  keyTerms?: string[];
  attachments?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  type: keyof typeof CONTRACT_TYPES;
  description: string;
  sections: { title: string; content: string }[];
  variables: string[];
}

// Pre-built templates
const TEMPLATES: ContractTemplate[] = [
  {
    id: "talent-standard",
    name: "Standard Talent Agreement",
    type: "talent",
    description: "Basic performer agreement for film/video production",
    sections: [
      { title: "Parties", content: "This agreement is between {{producer_name}} (\"Producer\") and {{talent_name}} (\"Performer\")..." },
      { title: "Services", content: "Performer agrees to render services as {{role}} for the production titled {{project_name}}..." },
      { title: "Compensation", content: "Producer agrees to pay Performer the sum of {{compensation}} for services rendered..." },
      { title: "Usage Rights", content: "Performer grants Producer the right to use their name, likeness, and performance in perpetuity..." },
      { title: "Term", content: "Services to be rendered between {{start_date}} and {{end_date}}..." }
    ],
    variables: ["producer_name", "talent_name", "role", "project_name", "compensation", "start_date", "end_date"]
  },
  {
    id: "crew-deal-memo",
    name: "Crew Deal Memo",
    type: "crew",
    description: "Standard deal memo for production crew members",
    sections: [
      { title: "Position", content: "{{crew_name}} is engaged as {{position}} for {{project_name}}..." },
      { title: "Rate", content: "Daily rate of {{daily_rate}} for {{guaranteed_days}} guaranteed days..." },
      { title: "Kit Rental", content: "Kit rental fee of {{kit_fee}} per day, if applicable..." },
      { title: "Working Conditions", content: "Standard 10-hour day with meal breaks as per union/industry standards..." }
    ],
    variables: ["crew_name", "position", "project_name", "daily_rate", "guaranteed_days", "kit_fee"]
  },
  {
    id: "location-agreement",
    name: "Location Agreement",
    type: "location",
    description: "Filming location permission and terms",
    sections: [
      { title: "Property", content: "Permission to film at {{location_address}}..." },
      { title: "Dates", content: "Filming permitted from {{start_date}} to {{end_date}}..." },
      { title: "Fee", content: "Location fee of {{location_fee}} covers {{included_areas}}..." },
      { title: "Insurance", content: "Producer shall maintain liability insurance of {{insurance_amount}}..." },
      { title: "Restoration", content: "Producer agrees to restore property to original condition..." }
    ],
    variables: ["location_address", "start_date", "end_date", "location_fee", "included_areas", "insurance_amount"]
  },
  {
    id: "nda-mutual",
    name: "Mutual NDA",
    type: "nda",
    description: "Two-way confidentiality agreement",
    sections: [
      { title: "Purpose", content: "For the purpose of evaluating potential collaboration on {{project_name}}..." },
      { title: "Definition", content: "Confidential Information includes scripts, budgets, strategies, trade secrets..." },
      { title: "Obligations", content: "Each party agrees not to disclose Confidential Information for {{term_years}} years..." },
      { title: "Exceptions", content: "Obligations do not apply to information that is publicly available..." }
    ],
    variables: ["project_name", "term_years"]
  }
];

interface ContractManagerProps {
  project: Schema["Project"]["type"];
  onSave?: (contracts: Contract[]) => Promise<void>;
}

export default function ContractManager({ project, onSave }: ContractManagerProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [filterStatus, setFilterStatus] = useState<keyof typeof CONTRACT_STATUS | "all">("all");
  const [filterType, setFilterType] = useState<keyof typeof CONTRACT_TYPES | "all">("all");
  const [newContract, setNewContract] = useState<Partial<Contract>>({
    type: "talent",
    status: "draft",
    currency: "USD",
    signatories: [],
    versions: [],
    keyTerms: []
  });
  const [newSignatory, setNewSignatory] = useState<Partial<Signatory>>({});

  // Derived data
  const filteredContracts = contracts.filter(c =>
    (filterStatus === "all" || c.status === filterStatus) &&
    (filterType === "all" || c.type === filterType)
  );

  const statusCounts = Object.keys(CONTRACT_STATUS).reduce((acc, status) => {
    acc[status] = contracts.filter(c => c.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  const pendingSignatures = contracts.filter(c =>
    c.status === "sent" || c.status === "partially_signed"
  ).length;

  const expiringContracts = contracts.filter(c => {
    if (!c.expirationDate) return false;
    const expDate = new Date(c.expirationDate);
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return expDate <= thirtyDays && c.status === "executed";
  }).length;

  const applyTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setNewContract({
      ...newContract,
      type: template.type,
      templateId: template.id,
      title: `${template.name} - ${project.name}`
    });
    setShowTemplates(false);
    setShowCreateModal(true);
  };

  const addSignatory = () => {
    if (!newSignatory.name || !newSignatory.email) return;

    const signatory: Signatory = {
      id: `${Date.now()}`,
      name: newSignatory.name,
      email: newSignatory.email,
      role: newSignatory.role || "Signatory"
    };

    setNewContract({
      ...newContract,
      signatories: [...(newContract.signatories || []), signatory]
    });
    setNewSignatory({});
  };

  const removeSignatory = (id: string) => {
    setNewContract({
      ...newContract,
      signatories: newContract.signatories?.filter(s => s.id !== id)
    });
  };

  const createContract = () => {
    if (!newContract.title || !newContract.partyA || !newContract.partyB) return;

    const contract: Contract = {
      id: `${Date.now()}`,
      title: newContract.title,
      type: newContract.type || "other",
      status: "draft",
      description: newContract.description,
      partyA: newContract.partyA,
      partyB: newContract.partyB,
      effectiveDate: newContract.effectiveDate,
      expirationDate: newContract.expirationDate,
      value: newContract.value,
      currency: newContract.currency || "USD",
      signatories: newContract.signatories || [],
      versions: [{
        id: `${Date.now()}-v1`,
        version: 1,
        createdAt: new Date().toISOString(),
        createdBy: "Current User",
        changes: "Initial draft"
      }],
      keyTerms: newContract.keyTerms,
      notes: newContract.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: newContract.templateId
    };

    setContracts([...contracts, contract]);
    setNewContract({
      type: "talent",
      status: "draft",
      currency: "USD",
      signatories: [],
      versions: [],
      keyTerms: []
    });
    setSelectedTemplate(null);
    setShowCreateModal(false);
  };

  const updateContractStatus = (contractId: string, status: keyof typeof CONTRACT_STATUS) => {
    setContracts(contracts.map(c =>
      c.id === contractId ? { ...c, status, updatedAt: new Date().toISOString() } : c
    ));
  };

  const deleteContract = (id: string) => {
    setContracts(contracts.filter(c => c.id !== id));
    if (selectedContract?.id === id) setSelectedContract(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-[12px] p-6"
        style={{
          background: "linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)",
          border: "1px solid var(--border)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className="text-[20px] font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <span style={{ color: "var(--primary)" }}><FileContractIcon /></span>
              Contract Manager
            </h3>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Manage legal documents, agreements, and signature workflows
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--text-primary)" }}>
                {contracts.length}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Total
              </div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--warning)" }}>
                {pendingSignatures}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Pending
              </div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--error)" }}>
                {expiringContracts}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Expiring Soon
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <PlusIcon />
              From Template
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-[6px] font-medium text-[13px] flex items-center gap-2"
              style={{ background: "var(--bg-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              <PlusIcon />
              Blank Contract
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="px-3 py-2 rounded-[6px] text-[12px]"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              <option value="all">All Types</option>
              {Object.entries(CONTRACT_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 rounded-[6px] text-[12px]"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              <option value="all">All Status</option>
              {Object.entries(CONTRACT_STATUS).map(([key, status]) => (
                <option key={key} value={key}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {Object.entries(CONTRACT_STATUS).map(([key, status]) => {
          const count = statusCounts[key] || 0;
          if (count === 0) return null;
          const StatusIcon = status.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key as keyof typeof CONTRACT_STATUS)}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap flex items-center gap-1.5 transition-all"
              style={{
                background: filterStatus === key ? status.color : "var(--bg-2)",
                color: filterStatus === key ? "white" : "var(--text-secondary)"
              }}
            >
              <StatusIcon />
              {status.label}: {count}
            </button>
          );
        })}
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div
          className="rounded-[12px] p-12 text-center"
          style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
        >
          <div className="mb-4" style={{ color: "var(--text-tertiary)" }}>
            <FileContractIcon />
          </div>
          <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            No contracts yet
          </p>
          <p className="text-[13px] mb-4" style={{ color: "var(--text-tertiary)" }}>
            Create contracts from templates or start from scratch
          </p>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
            style={{ background: "var(--primary)", color: "white" }}
          >
            Browse Templates
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContracts.map(contract => {
            const typeConfig = CONTRACT_TYPES[contract.type];
            const statusConfig = CONTRACT_STATUS[contract.status];
            const StatusIcon = statusConfig.icon;
            const isExpiringSoon = contract.expirationDate &&
              new Date(contract.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            return (
              <div
                key={contract.id}
                className="rounded-[10px] p-4 cursor-pointer transition-all hover:bg-[var(--bg-2)]"
                style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                onClick={() => setSelectedContract(contract)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-[8px] flex items-center justify-center"
                      style={{ background: typeConfig.color, color: "white" }}
                    >
                      <FileContractIcon />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                          {contract.title}
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{ background: typeConfig.color, color: "white" }}
                        >
                          {typeConfig.label}
                        </span>
                      </div>
                      <p className="text-[12px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                        {contract.partyA} ↔ {contract.partyB}
                      </p>
                      <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        <span className="flex items-center gap-1">
                          <StatusIcon />
                          <span style={{ color: statusConfig.color }}>{statusConfig.label}</span>
                        </span>
                        {contract.effectiveDate && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon />
                            {new Date(contract.effectiveDate).toLocaleDateString()}
                          </span>
                        )}
                        {contract.value && (
                          <span className="flex items-center gap-1">
                            ${contract.value.toLocaleString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <UserIcon />
                          {contract.signatories.length} signatories
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExpiringSoon && (
                      <span
                        className="px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                        style={{ background: "var(--error-muted)", color: "var(--error)" }}
                      >
                        <AlertTriangleIcon />
                        Expiring Soon
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 rounded-[6px] transition-all"
                      style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                    >
                      <EyeIcon />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteContract(contract.id); }}
                      className="p-2 rounded-[6px] transition-all"
                      style={{ background: "var(--bg-2)", color: "var(--error)" }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                {/* Signature progress */}
                {contract.signatories.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                        Signature Progress
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {contract.signatories.filter(s => s.signedAt).length}/{contract.signatories.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract.signatories.map(sig => (
                        <div
                          key={sig.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px]"
                          style={{
                            background: sig.signedAt ? "var(--success-muted)" : "var(--bg-2)",
                            color: sig.signedAt ? "var(--success)" : "var(--text-tertiary)"
                          }}
                        >
                          {sig.signedAt ? <CheckCircleIcon /> : <ClockIcon />}
                          {sig.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                Contract Templates
              </h3>
              <button onClick={() => setShowTemplates(false)} style={{ color: "var(--text-tertiary)" }}>
                <XIcon />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {TEMPLATES.map(template => {
                const typeConfig = CONTRACT_TYPES[template.type];
                return (
                  <div
                    key={template.id}
                    className="rounded-[10px] p-4 cursor-pointer transition-all hover:border-[var(--primary)]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                        style={{ background: typeConfig.color, color: "white" }}
                      >
                        <FileContractIcon />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                          {template.name}
                        </h4>
                        <span className="text-[11px]" style={{ color: typeConfig.color }}>
                          {typeConfig.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-[12px] mb-3" style={{ color: "var(--text-secondary)" }}>
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.slice(0, 3).map((section, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px]"
                          style={{ background: "var(--bg-1)", color: "var(--text-tertiary)" }}
                        >
                          {section.title}
                        </span>
                      ))}
                      {template.sections.length > 3 && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px]"
                          style={{ background: "var(--bg-1)", color: "var(--text-tertiary)" }}
                        >
                          +{template.sections.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                  {selectedTemplate ? `Create from: ${selectedTemplate.name}` : "New Contract"}
                </h3>
                {selectedTemplate && (
                  <p className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                    Template will be used as base
                  </p>
                )}
              </div>
              <button onClick={() => { setShowCreateModal(false); setSelectedTemplate(null); }} style={{ color: "var(--text-tertiary)" }}>
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Contract Title *
                  </label>
                  <input
                    type="text"
                    value={newContract.title || ""}
                    onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                    placeholder="e.g., Lead Actor Agreement"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Type
                  </label>
                  <select
                    value={newContract.type || "talent"}
                    onChange={(e) => setNewContract({ ...newContract, type: e.target.value as keyof typeof CONTRACT_TYPES })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    {Object.entries(CONTRACT_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Party A (You) *
                  </label>
                  <input
                    type="text"
                    value={newContract.partyA || project.name || ""}
                    onChange={(e) => setNewContract({ ...newContract, partyA: e.target.value })}
                    placeholder="Your company/production"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Party B (Counterparty) *
                  </label>
                  <input
                    type="text"
                    value={newContract.partyB || ""}
                    onChange={(e) => setNewContract({ ...newContract, partyB: e.target.value })}
                    placeholder="Other party name"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={newContract.effectiveDate || ""}
                    onChange={(e) => setNewContract({ ...newContract, effectiveDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={newContract.expirationDate || ""}
                    onChange={(e) => setNewContract({ ...newContract, expirationDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              {/* Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Contract Value
                  </label>
                  <input
                    type="number"
                    value={newContract.value || ""}
                    onChange={(e) => setNewContract({ ...newContract, value: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Currency
                  </label>
                  <select
                    value={newContract.currency || "USD"}
                    onChange={(e) => setNewContract({ ...newContract, currency: e.target.value })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Description / Notes
                </label>
                <textarea
                  value={newContract.description || ""}
                  onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                  rows={3}
                  placeholder="Additional notes about this contract..."
                  className="w-full px-4 py-2 rounded-[6px] text-[14px] resize-none"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Signatories */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Signatories
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSignatory.name || ""}
                    onChange={(e) => setNewSignatory({ ...newSignatory, name: e.target.value })}
                    placeholder="Name"
                    className="flex-1 px-3 py-2 rounded-[6px] text-[13px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <input
                    type="email"
                    value={newSignatory.email || ""}
                    onChange={(e) => setNewSignatory({ ...newSignatory, email: e.target.value })}
                    placeholder="Email"
                    className="flex-1 px-3 py-2 rounded-[6px] text-[13px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <input
                    type="text"
                    value={newSignatory.role || ""}
                    onChange={(e) => setNewSignatory({ ...newSignatory, role: e.target.value })}
                    placeholder="Role"
                    className="w-32 px-3 py-2 rounded-[6px] text-[13px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={addSignatory}
                    className="px-3 py-2 rounded-[6px]"
                    style={{ background: "var(--primary)", color: "white" }}
                  >
                    <PlusIcon />
                  </button>
                </div>
                {newContract.signatories && newContract.signatories.length > 0 && (
                  <div className="space-y-2">
                    {newContract.signatories.map(sig => (
                      <div
                        key={sig.id}
                        className="flex items-center justify-between px-3 py-2 rounded-[6px]"
                        style={{ background: "var(--bg-2)" }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>
                            {sig.name}
                          </span>
                          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                            {sig.email}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px]"
                            style={{ background: "var(--bg-1)", color: "var(--text-secondary)" }}
                          >
                            {sig.role}
                          </span>
                        </div>
                        <button onClick={() => removeSignatory(sig.id)} style={{ color: "var(--error)" }}>
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setSelectedTemplate(null); }}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={createContract}
                disabled={!newContract.title || !newContract.partyA || !newContract.partyB}
                className="px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                style={{
                  background: newContract.title && newContract.partyA && newContract.partyB ? "var(--primary)" : "var(--bg-2)",
                  color: newContract.title && newContract.partyA && newContract.partyB ? "white" : "var(--text-tertiary)"
                }}
              >
                Create Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-[8px] flex items-center justify-center"
                  style={{ background: CONTRACT_TYPES[selectedContract.type].color, color: "white" }}
                >
                  <FileContractIcon />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                    {selectedContract.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: CONTRACT_TYPES[selectedContract.type].color, color: "white" }}
                    >
                      {CONTRACT_TYPES[selectedContract.type].label}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: CONTRACT_STATUS[selectedContract.status].color, color: "white" }}
                    >
                      {CONTRACT_STATUS[selectedContract.status].label}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedContract(null)} style={{ color: "var(--text-tertiary)" }}>
                <XIcon />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[12px] font-semibold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                    Parties
                  </h4>
                  <div className="p-3 rounded-[8px]" style={{ background: "var(--bg-2)" }}>
                    <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                      <strong>Party A:</strong> {selectedContract.partyA}
                    </p>
                    <p className="text-[13px] mt-1" style={{ color: "var(--text-primary)" }}>
                      <strong>Party B:</strong> {selectedContract.partyB}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                    Term
                  </h4>
                  <div className="p-3 rounded-[8px]" style={{ background: "var(--bg-2)" }}>
                    <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text-primary)" }}>
                      <CalendarIcon />
                      <span>
                        {selectedContract.effectiveDate
                          ? new Date(selectedContract.effectiveDate).toLocaleDateString()
                          : "Not set"}
                        {" → "}
                        {selectedContract.expirationDate
                          ? new Date(selectedContract.expirationDate).toLocaleDateString()
                          : "Ongoing"}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedContract.value && (
                  <div>
                    <h4 className="text-[12px] font-semibold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                      Value
                    </h4>
                    <div className="p-3 rounded-[8px]" style={{ background: "var(--bg-2)" }}>
                      <p className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                        {selectedContract.currency} ${selectedContract.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {selectedContract.description && (
                  <div>
                    <h4 className="text-[12px] font-semibold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                      Description
                    </h4>
                    <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {selectedContract.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[12px] font-semibold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                    Signatories
                  </h4>
                  <div className="space-y-2">
                    {selectedContract.signatories.map(sig => (
                      <div
                        key={sig.id}
                        className="flex items-center justify-between p-3 rounded-[8px]"
                        style={{ background: "var(--bg-2)" }}
                      >
                        <div>
                          <p className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>
                            {sig.name}
                          </p>
                          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {sig.email} • {sig.role}
                          </p>
                        </div>
                        {sig.signedAt ? (
                          <div className="text-right">
                            <span
                              className="px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                              style={{ background: "var(--success-muted)", color: "var(--success)" }}
                            >
                              <CheckCircleIcon />
                              Signed
                            </span>
                            <p className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                              {new Date(sig.signedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span
                            className="px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                            style={{ background: "var(--warning-muted)", color: "var(--warning)" }}
                          >
                            <ClockIcon />
                            Pending
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold uppercase mb-2 flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                    <HistoryIcon />
                    Version History
                  </h4>
                  <div className="space-y-2">
                    {selectedContract.versions.map(version => (
                      <div
                        key={version.id}
                        className="flex items-center justify-between p-3 rounded-[8px]"
                        style={{ background: "var(--bg-2)" }}
                      >
                        <div>
                          <p className="font-medium text-[12px]" style={{ color: "var(--text-primary)" }}>
                            Version {version.version}
                          </p>
                          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {version.changes}
                          </p>
                        </div>
                        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          {new Date(version.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-[6px] text-[12px] font-medium flex items-center gap-1"
                  style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                >
                  <DownloadIcon />
                  Download
                </button>
                <button
                  className="px-3 py-2 rounded-[6px] text-[12px] font-medium flex items-center gap-1"
                  style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                >
                  <CopyIcon />
                  Duplicate
                </button>
              </div>

              {selectedContract.status === "draft" && (
                <button
                  onClick={() => updateContractStatus(selectedContract.id, "sent")}
                  className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2"
                  style={{ background: "var(--primary)", color: "white" }}
                >
                  <SendIcon />
                  Send for Signature
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
