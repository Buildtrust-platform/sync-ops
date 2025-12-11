"use client";

import { useState, useEffect, useMemo } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * SAFETY & RISK ASSESSMENT MODULE (Pre-Production)
 *
 * Purpose: Comprehensive safety management for production
 *
 * Features:
 * - Risk assessment forms
 * - Safety checklists by department
 * - Incident reporting and tracking
 * - Safety meeting logs
 * - Emergency contact management
 * - Hazard identification
 * - Safety briefing sign-offs
 */

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type RiskStatus = "IDENTIFIED" | "MITIGATED" | "ACCEPTED" | "RESOLVED";
type IncidentSeverity = "MINOR" | "MODERATE" | "SERIOUS" | "CRITICAL";
type IncidentStatus = "REPORTED" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
type ChecklistStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "REQUIRES_ATTENTION";

interface RiskAssessment {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: string;
  location?: string | null;
  riskLevel: RiskLevel;
  status: RiskStatus;
  likelihood: number; // 1-5
  impact: number; // 1-5
  mitigationPlan?: string | null;
  responsiblePerson?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt?: string | null;
}

interface SafetyIncident {
  id: string;
  projectId: string;
  title: string;
  description: string;
  incidentDate: string;
  incidentTime?: string | null;
  location: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  personsInvolved?: string[] | null;
  witnesses?: string[] | null;
  immediateActions?: string | null;
  rootCause?: string | null;
  correctiveActions?: string | null;
  preventiveMeasures?: string | null;
  reportedBy: string;
  investigatedBy?: string | null;
  injuryReported: boolean;
  propertyDamage: boolean;
  nearMiss: boolean;
  createdAt: string;
}

interface SafetyChecklist {
  id: string;
  projectId: string;
  name: string;
  department: string;
  status: ChecklistStatus;
  items: ChecklistItem[];
  assignedTo?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  createdAt: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes?: string | null;
  completedAt?: string | null;
}

interface EmergencyContact {
  id: string;
  projectId: string;
  name: string;
  role: string;
  phone: string;
  email?: string | null;
  isPrimary: boolean;
  notes?: string | null;
}

interface SafetyRiskProps {
  projectId: string;
  organizationId?: string;
  currentUserEmail: string;
}

const RISK_LEVEL_CONFIG = {
  LOW: { label: "Low", color: "bg-green-500", textColor: "text-green-400" },
  MEDIUM: { label: "Medium", color: "bg-yellow-500", textColor: "text-yellow-400" },
  HIGH: { label: "High", color: "bg-orange-500", textColor: "text-orange-400" },
  CRITICAL: { label: "Critical", color: "bg-red-500", textColor: "text-red-400" },
};

const RISK_STATUS_CONFIG = {
  IDENTIFIED: { label: "Identified", color: "bg-blue-500" },
  MITIGATED: { label: "Mitigated", color: "bg-teal-500" },
  ACCEPTED: { label: "Accepted", color: "bg-yellow-500" },
  RESOLVED: { label: "Resolved", color: "bg-green-500" },
};

const INCIDENT_SEVERITY_CONFIG = {
  MINOR: { label: "Minor", color: "bg-green-500" },
  MODERATE: { label: "Moderate", color: "bg-yellow-500" },
  SERIOUS: { label: "Serious", color: "bg-orange-500" },
  CRITICAL: { label: "Critical", color: "bg-red-500" },
};

const INCIDENT_STATUS_CONFIG = {
  REPORTED: { label: "Reported", color: "bg-blue-500" },
  INVESTIGATING: { label: "Investigating", color: "bg-yellow-500" },
  RESOLVED: { label: "Resolved", color: "bg-green-500" },
  CLOSED: { label: "Closed", color: "bg-slate-500" },
};

const RISK_CATEGORIES = [
  "Physical Hazards",
  "Stunt Work",
  "Pyrotechnics/SFX",
  "Water/Marine",
  "Heights/Rigging",
  "Electrical",
  "Weather/Environmental",
  "Crowd/Extras",
  "Vehicle/Transportation",
  "Animals",
  "Weapons/Props",
  "Location Specific",
  "COVID/Health",
  "Other",
];

const DEPARTMENT_CHECKLISTS = [
  "Production",
  "Camera",
  "Lighting/Electric",
  "Grip",
  "Art Department",
  "Stunts",
  "Special Effects",
  "Locations",
  "Transportation",
  "Catering",
];

export default function SafetyRisk({
  projectId,
  organizationId,
  currentUserEmail,
}: SafetyRiskProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [checklists, setChecklists] = useState<SafetyChecklist[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<"risks" | "incidents" | "checklists" | "contacts">("risks");
  const [showAddRiskModal, setShowAddRiskModal] = useState(false);
  const [showAddIncidentModal, setShowAddIncidentModal] = useState(false);
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<SafetyChecklist | null>(null);

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Form states
  const [riskForm, setRiskForm] = useState({
    title: "",
    description: "",
    category: "Physical Hazards",
    location: "",
    riskLevel: "MEDIUM" as RiskLevel,
    likelihood: 3,
    impact: 3,
    mitigationPlan: "",
    responsiblePerson: "",
    dueDate: "",
    notes: "",
  });

  const [incidentForm, setIncidentForm] = useState({
    title: "",
    description: "",
    incidentDate: "",
    incidentTime: "",
    location: "",
    severity: "MINOR" as IncidentSeverity,
    personsInvolved: "",
    immediateActions: "",
    injuryReported: false,
    propertyDamage: false,
    nearMiss: false,
  });

  const [checklistForm, setChecklistForm] = useState({
    name: "",
    department: "Production",
    assignedTo: "",
    dueDate: "",
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    isPrimary: false,
    notes: "",
  });

  // Load data
  useEffect(() => {
    setIsLoading(true);

    // Mock data
    const mockRisks: RiskAssessment[] = [
      {
        id: "risk-1",
        projectId,
        title: "Rooftop Scene - Fall Hazard",
        description: "Actors and crew working near unprotected edges on 5-story building rooftop",
        category: "Heights/Rigging",
        location: "123 Main St Rooftop",
        riskLevel: "HIGH",
        status: "MITIGATED",
        likelihood: 2,
        impact: 5,
        mitigationPlan: "Install temporary guardrails, safety harnesses required, stunt coordinator on set",
        responsiblePerson: "John Smith (Safety Coordinator)",
        dueDate: new Date().toISOString(),
        createdBy: currentUserEmail,
        createdAt: new Date().toISOString(),
      },
      {
        id: "risk-2",
        projectId,
        title: "Night Exterior - Low Visibility",
        description: "Night shoot in industrial area with uneven terrain and limited lighting",
        category: "Physical Hazards",
        location: "Industrial District",
        riskLevel: "MEDIUM",
        status: "IDENTIFIED",
        likelihood: 3,
        impact: 3,
        mitigationPlan: "Additional safety lighting, marked pathways, buddy system",
        createdBy: currentUserEmail,
        createdAt: new Date().toISOString(),
      },
    ];

    const mockIncidents: SafetyIncident[] = [];

    const mockChecklists: SafetyChecklist[] = [
      {
        id: "checklist-1",
        projectId,
        name: "Daily Safety Walkthrough",
        department: "Production",
        status: "IN_PROGRESS",
        items: [
          { id: "item-1", text: "Check all fire extinguishers are accessible", completed: true },
          { id: "item-2", text: "Verify emergency exits are clear", completed: true },
          { id: "item-3", text: "Confirm first aid kit is stocked", completed: false },
          { id: "item-4", text: "Review weather conditions", completed: false },
          { id: "item-5", text: "Check equipment for damage", completed: false },
        ],
        assignedTo: "Safety Coordinator",
        createdAt: new Date().toISOString(),
      },
    ];

    const mockContacts: EmergencyContact[] = [
      {
        id: "contact-1",
        projectId,
        name: "John Smith",
        role: "Safety Coordinator",
        phone: "(555) 123-4567",
        email: "jsmith@production.com",
        isPrimary: true,
      },
      {
        id: "contact-2",
        projectId,
        name: "Local Hospital ER",
        role: "Medical Emergency",
        phone: "(555) 911-0000",
        isPrimary: true,
      },
    ];

    setRisks(mockRisks);
    setIncidents(mockIncidents);
    setChecklists(mockChecklists);
    setEmergencyContacts(mockContacts);
    setIsLoading(false);
  }, [projectId, currentUserEmail]);

  // Stats
  const stats = useMemo(() => {
    const criticalRisks = risks.filter((r) => r.riskLevel === "CRITICAL" && r.status !== "RESOLVED").length;
    const highRisks = risks.filter((r) => r.riskLevel === "HIGH" && r.status !== "RESOLVED").length;
    const openIncidents = incidents.filter((i) => i.status !== "CLOSED").length;
    const checklistsComplete = checklists.filter((c) => c.status === "COMPLETED").length;

    return {
      totalRisks: risks.length,
      criticalRisks,
      highRisks,
      openIncidents,
      checklistsComplete,
      checklistsTotal: checklists.length,
      emergencyContacts: emergencyContacts.filter((c) => c.isPrimary).length,
    };
  }, [risks, incidents, checklists, emergencyContacts]);

  // Calculate risk score
  const calculateRiskScore = (likelihood: number, impact: number) => {
    return likelihood * impact;
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 20) return "text-red-400";
    if (score >= 12) return "text-orange-400";
    if (score >= 6) return "text-yellow-400";
    return "text-green-400";
  };

  // Add risk handler
  const handleAddRisk = () => {
    if (!riskForm.title || !riskForm.description) {
      alert("Please fill in required fields");
      return;
    }

    const newRisk: RiskAssessment = {
      id: `risk-${Date.now()}`,
      projectId,
      title: riskForm.title,
      description: riskForm.description,
      category: riskForm.category,
      location: riskForm.location || null,
      riskLevel: riskForm.riskLevel,
      status: "IDENTIFIED",
      likelihood: riskForm.likelihood,
      impact: riskForm.impact,
      mitigationPlan: riskForm.mitigationPlan || null,
      responsiblePerson: riskForm.responsiblePerson || null,
      dueDate: riskForm.dueDate || null,
      notes: riskForm.notes || null,
      createdBy: currentUserEmail,
      createdAt: new Date().toISOString(),
    };

    setRisks((prev) => [...prev, newRisk]);
    setShowAddRiskModal(false);
    setRiskForm({
      title: "",
      description: "",
      category: "Physical Hazards",
      location: "",
      riskLevel: "MEDIUM",
      likelihood: 3,
      impact: 3,
      mitigationPlan: "",
      responsiblePerson: "",
      dueDate: "",
      notes: "",
    });
  };

  // Add incident handler
  const handleAddIncident = () => {
    if (!incidentForm.title || !incidentForm.description || !incidentForm.incidentDate) {
      alert("Please fill in required fields");
      return;
    }

    const newIncident: SafetyIncident = {
      id: `incident-${Date.now()}`,
      projectId,
      title: incidentForm.title,
      description: incidentForm.description,
      incidentDate: incidentForm.incidentDate,
      incidentTime: incidentForm.incidentTime || null,
      location: incidentForm.location,
      severity: incidentForm.severity,
      status: "REPORTED",
      personsInvolved: incidentForm.personsInvolved ? incidentForm.personsInvolved.split(",").map((s) => s.trim()) : null,
      immediateActions: incidentForm.immediateActions || null,
      injuryReported: incidentForm.injuryReported,
      propertyDamage: incidentForm.propertyDamage,
      nearMiss: incidentForm.nearMiss,
      reportedBy: currentUserEmail,
      createdAt: new Date().toISOString(),
    };

    setIncidents((prev) => [...prev, newIncident]);
    setShowAddIncidentModal(false);
    setIncidentForm({
      title: "",
      description: "",
      incidentDate: "",
      incidentTime: "",
      location: "",
      severity: "MINOR",
      personsInvolved: "",
      immediateActions: "",
      injuryReported: false,
      propertyDamage: false,
      nearMiss: false,
    });
  };

  // Add checklist handler
  const handleAddChecklist = () => {
    if (!checklistForm.name) {
      alert("Please enter a checklist name");
      return;
    }

    const defaultItems: ChecklistItem[] = [
      { id: `item-${Date.now()}-1`, text: "Review daily safety briefing", completed: false },
      { id: `item-${Date.now()}-2`, text: "Check equipment condition", completed: false },
      { id: `item-${Date.now()}-3`, text: "Verify emergency equipment accessible", completed: false },
      { id: `item-${Date.now()}-4`, text: "Confirm communication systems working", completed: false },
      { id: `item-${Date.now()}-5`, text: "Document any hazards observed", completed: false },
    ];

    const newChecklist: SafetyChecklist = {
      id: `checklist-${Date.now()}`,
      projectId,
      name: checklistForm.name,
      department: checklistForm.department,
      status: "NOT_STARTED",
      items: defaultItems,
      assignedTo: checklistForm.assignedTo || null,
      dueDate: checklistForm.dueDate || null,
      createdAt: new Date().toISOString(),
    };

    setChecklists((prev) => [...prev, newChecklist]);
    setShowAddChecklistModal(false);
    setChecklistForm({
      name: "",
      department: "Production",
      assignedTo: "",
      dueDate: "",
    });
  };

  // Add contact handler
  const handleAddContact = () => {
    if (!contactForm.name || !contactForm.phone || !contactForm.role) {
      alert("Please fill in required fields");
      return;
    }

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      projectId,
      name: contactForm.name,
      role: contactForm.role,
      phone: contactForm.phone,
      email: contactForm.email || null,
      isPrimary: contactForm.isPrimary,
      notes: contactForm.notes || null,
    };

    setEmergencyContacts((prev) => [...prev, newContact]);
    setShowAddContactModal(false);
    setContactForm({
      name: "",
      role: "",
      phone: "",
      email: "",
      isPrimary: false,
      notes: "",
    });
  };

  // Toggle checklist item
  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id !== checklistId) return c;

        const updatedItems = c.items.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : undefined } : item
        );

        const completedCount = updatedItems.filter((i) => i.completed).length;
        let status: ChecklistStatus = "NOT_STARTED";
        if (completedCount === updatedItems.length) {
          status = "COMPLETED";
        } else if (completedCount > 0) {
          status = "IN_PROGRESS";
        }

        return { ...c, items: updatedItems, status };
      })
    );
  };

  // Update risk status
  const updateRiskStatus = (riskId: string, newStatus: RiskStatus) => {
    setRisks((prev) =>
      prev.map((r) => (r.id === riskId ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r))
    );
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h2 className="text-xl font-black text-white">Safety & Risk Management</h2>
              <p className="text-red-200 text-sm">Hazard identification, incidents, and safety compliance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddRiskModal(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-colors"
            >
              + Add Risk
            </button>
            <button
              onClick={() => setShowAddIncidentModal(true)}
              className="px-4 py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
            >
              Report Incident
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {(stats.criticalRisks > 0 || stats.openIncidents > 0) && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-red-400 text-xl">🚨</span>
            <div className="flex-1">
              {stats.criticalRisks > 0 && (
                <span className="text-red-400 font-bold mr-4">{stats.criticalRisks} Critical Risk(s)</span>
              )}
              {stats.openIncidents > 0 && (
                <span className="text-orange-400 font-bold">{stats.openIncidents} Open Incident(s)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-slate-800 border-b border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-black text-white">{stats.totalRisks}</div>
          <div className="text-xs text-slate-400">Total Risks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-red-400">{stats.criticalRisks}</div>
          <div className="text-xs text-slate-400">Critical</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-orange-400">{stats.highRisks}</div>
          <div className="text-xs text-slate-400">High Risk</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-yellow-400">{stats.openIncidents}</div>
          <div className="text-xs text-slate-400">Open Incidents</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-green-400">
            {stats.checklistsComplete}/{stats.checklistsTotal}
          </div>
          <div className="text-xs text-slate-400">Checklists Done</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-blue-400">{stats.emergencyContacts}</div>
          <div className="text-xs text-slate-400">Emergency Contacts</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        {[
          { id: "risks", label: "Risk Assessment", icon: "⚠️" },
          { id: "incidents", label: "Incidents", icon: "🚨" },
          { id: "checklists", label: "Safety Checklists", icon: "✅" },
          { id: "contacts", label: "Emergency Contacts", icon: "📞" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-red-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⚠️</div>
            <p className="text-slate-400">Loading safety data...</p>
          </div>
        ) : activeTab === "risks" ? (
          /* Risk Assessment Tab */
          <div className="space-y-4">
            {risks.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">⚠️</span>
                <h3 className="text-xl font-bold text-white mt-4">No Risks Identified</h3>
                <p className="text-slate-400 mt-2">Add risks to track and mitigate production hazards</p>
                <button
                  onClick={() => setShowAddRiskModal(true)}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  + Add First Risk
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {risks.map((risk) => {
                  const levelConfig = RISK_LEVEL_CONFIG[risk.riskLevel];
                  const statusConfig = RISK_STATUS_CONFIG[risk.status];
                  const riskScore = calculateRiskScore(risk.likelihood, risk.impact);

                  return (
                    <div
                      key={risk.id}
                      className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
                    >
                      <div className={`${levelConfig.color} px-4 py-2 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{levelConfig.label} Risk</span>
                          <span className="text-white/80 text-sm">- {risk.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${statusConfig.color} px-2 py-0.5 rounded text-xs font-bold text-white`}>
                            {statusConfig.label}
                          </span>
                          <span className={`font-bold text-lg ${getRiskScoreColor(riskScore)}`}>
                            Score: {riskScore}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white">{risk.title}</h3>
                        <p className="text-slate-400 text-sm mt-1">{risk.description}</p>

                        {risk.location && (
                          <p className="text-sm text-slate-500 mt-2">
                            <span className="text-slate-400">📍 Location:</span> {risk.location}
                          </p>
                        )}

                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Likelihood</p>
                            <p className="text-white font-bold">{risk.likelihood}/5</p>
                          </div>
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Impact</p>
                            <p className="text-white font-bold">{risk.impact}/5</p>
                          </div>
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Risk Score</p>
                            <p className={`font-bold ${getRiskScoreColor(riskScore)}`}>{riskScore}</p>
                          </div>
                          {risk.responsiblePerson && (
                            <div className="bg-slate-700/50 rounded p-2">
                              <p className="text-xs text-slate-500">Responsible</p>
                              <p className="text-white text-xs">{risk.responsiblePerson}</p>
                            </div>
                          )}
                        </div>

                        {risk.mitigationPlan && (
                          <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded p-3">
                            <p className="text-xs text-green-400 font-bold mb-1">Mitigation Plan:</p>
                            <p className="text-sm text-slate-300">{risk.mitigationPlan}</p>
                          </div>
                        )}

                        {risk.status !== "RESOLVED" && (
                          <div className="mt-4 flex gap-2">
                            {risk.status === "IDENTIFIED" && (
                              <button
                                onClick={() => updateRiskStatus(risk.id, "MITIGATED")}
                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg"
                              >
                                Mark as Mitigated
                              </button>
                            )}
                            {risk.status === "MITIGATED" && (
                              <button
                                onClick={() => updateRiskStatus(risk.id, "RESOLVED")}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg"
                              >
                                Mark as Resolved
                              </button>
                            )}
                            <button
                              onClick={() => updateRiskStatus(risk.id, "ACCEPTED")}
                              className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded-lg"
                            >
                              Accept Risk
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === "incidents" ? (
          /* Incidents Tab */
          <div className="space-y-4">
            {incidents.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">✅</span>
                <h3 className="text-xl font-bold text-white mt-4">No Incidents Reported</h3>
                <p className="text-slate-400 mt-2">Safety first! Report any incidents that occur</p>
                <button
                  onClick={() => setShowAddIncidentModal(true)}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Report Incident
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => {
                  const severityConfig = INCIDENT_SEVERITY_CONFIG[incident.severity];
                  const statusConfig = INCIDENT_STATUS_CONFIG[incident.status];

                  return (
                    <div
                      key={incident.id}
                      className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
                    >
                      <div className={`${severityConfig.color} px-4 py-2 flex items-center justify-between`}>
                        <span className="text-white font-bold">{severityConfig.label} Incident</span>
                        <span className={`${statusConfig.color} px-2 py-0.5 rounded text-xs font-bold text-white`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white">{incident.title}</h3>
                        <p className="text-slate-400 text-sm mt-1">{incident.description}</p>

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                          <span>📅 {new Date(incident.incidentDate).toLocaleDateString()}</span>
                          {incident.incidentTime && <span>🕐 {incident.incidentTime}</span>}
                          <span>📍 {incident.location}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {incident.injuryReported && (
                            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">
                              Injury Reported
                            </span>
                          )}
                          {incident.propertyDamage && (
                            <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold">
                              Property Damage
                            </span>
                          )}
                          {incident.nearMiss && (
                            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                              Near Miss
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-3">
                          Reported by: {incident.reportedBy}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === "checklists" ? (
          /* Checklists Tab */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-slate-400">Department safety checklists</p>
              <button
                onClick={() => setShowAddChecklistModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                + Add Checklist
              </button>
            </div>

            {checklists.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">✅</span>
                <h3 className="text-xl font-bold text-white mt-4">No Checklists Created</h3>
                <p className="text-slate-400 mt-2">Create safety checklists for each department</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {checklists.map((checklist) => {
                  const completedCount = checklist.items.filter((i) => i.completed).length;
                  const progress = (completedCount / checklist.items.length) * 100;

                  return (
                    <div
                      key={checklist.id}
                      className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white">{checklist.name}</h3>
                          <p className="text-sm text-slate-400">{checklist.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">
                            {completedCount}/{checklist.items.length}
                          </p>
                          <p className="text-xs text-slate-500">completed</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 bg-slate-700">
                        <div
                          className={`h-full transition-all ${
                            progress === 100 ? "bg-green-500" : progress > 0 ? "bg-yellow-500" : "bg-slate-600"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="p-4">
                        <div className="space-y-2">
                          {checklist.items.map((item) => (
                            <label
                              key={item.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => toggleChecklistItem(checklist.id, item.id)}
                                className="w-5 h-5 rounded border-slate-600 text-green-500 focus:ring-green-500"
                              />
                              <span className={`text-sm ${item.completed ? "text-slate-500 line-through" : "text-white"}`}>
                                {item.text}
                              </span>
                            </label>
                          ))}
                        </div>

                        {checklist.assignedTo && (
                          <p className="text-xs text-slate-500 mt-3">
                            Assigned to: {checklist.assignedTo}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Emergency Contacts Tab */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-slate-400">Emergency contact directory</p>
              <button
                onClick={() => setShowAddContactModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                + Add Contact
              </button>
            </div>

            {/* Primary Contacts */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="font-bold text-red-400 mb-3">🚨 Primary Emergency Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {emergencyContacts
                  .filter((c) => c.isPrimary)
                  .map((contact) => (
                    <div key={contact.id} className="bg-slate-800 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{contact.name}</p>
                        <p className="text-sm text-slate-400">{contact.role}</p>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                      >
                        📞 {contact.phone}
                      </a>
                    </div>
                  ))}
              </div>
            </div>

            {/* Other Contacts */}
            {emergencyContacts.filter((c) => !c.isPrimary).length > 0 && (
              <div>
                <h3 className="font-bold text-white mb-3">Additional Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {emergencyContacts
                    .filter((c) => !c.isPrimary)
                    .map((contact) => (
                      <div key={contact.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">{contact.name}</p>
                            <p className="text-sm text-slate-400">{contact.role}</p>
                          </div>
                          <a href={`tel:${contact.phone}`} className="text-blue-400 hover:text-blue-300">
                            {contact.phone}
                          </a>
                        </div>
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="text-sm text-slate-500 hover:text-slate-400">
                            {contact.email}
                          </a>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Risk Modal */}
      {showAddRiskModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Risk Assessment</h3>
                <button onClick={() => setShowAddRiskModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Risk Title *</label>
                <input
                  type="text"
                  value={riskForm.title}
                  onChange={(e) => setRiskForm({ ...riskForm, title: e.target.value })}
                  placeholder="e.g., Rooftop Scene - Fall Hazard"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Description *</label>
                <textarea
                  value={riskForm.description}
                  onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })}
                  rows={2}
                  placeholder="Describe the hazard and potential consequences..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={riskForm.category}
                    onChange={(e) => setRiskForm({ ...riskForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    {RISK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Risk Level</label>
                  <select
                    value={riskForm.riskLevel}
                    onChange={(e) => setRiskForm({ ...riskForm, riskLevel: e.target.value as RiskLevel })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(RISK_LEVEL_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Likelihood (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={riskForm.likelihood}
                    onChange={(e) => setRiskForm({ ...riskForm, likelihood: parseInt(e.target.value) })}
                    className="w-full accent-red-500"
                  />
                  <p className="text-center text-white font-bold">{riskForm.likelihood}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Impact (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={riskForm.impact}
                    onChange={(e) => setRiskForm({ ...riskForm, impact: parseInt(e.target.value) })}
                    className="w-full accent-red-500"
                  />
                  <p className="text-center text-white font-bold">{riskForm.impact}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={riskForm.location}
                  onChange={(e) => setRiskForm({ ...riskForm, location: e.target.value })}
                  placeholder="Where does this risk exist?"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Mitigation Plan</label>
                <textarea
                  value={riskForm.mitigationPlan}
                  onChange={(e) => setRiskForm({ ...riskForm, mitigationPlan: e.target.value })}
                  rows={2}
                  placeholder="How will this risk be mitigated?"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Responsible Person</label>
                  <input
                    type="text"
                    value={riskForm.responsiblePerson}
                    onChange={(e) => setRiskForm({ ...riskForm, responsiblePerson: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={riskForm.dueDate}
                    onChange={(e) => setRiskForm({ ...riskForm, dueDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              {/* Risk Score Preview */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-2">Risk Score Preview</p>
                <p className={`text-3xl font-black ${getRiskScoreColor(riskForm.likelihood * riskForm.impact)}`}>
                  {riskForm.likelihood * riskForm.impact}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  (Likelihood × Impact: {riskForm.likelihood} × {riskForm.impact})
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddRiskModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRisk}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Add Risk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Incident Modal */}
      {showAddIncidentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Report Incident</h3>
                <button onClick={() => setShowAddIncidentModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Incident Title *</label>
                <input
                  type="text"
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                  placeholder="Brief title of the incident"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Description *</label>
                <textarea
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  rows={3}
                  placeholder="Describe what happened in detail..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Date *</label>
                  <input
                    type="date"
                    value={incidentForm.incidentDate}
                    onChange={(e) => setIncidentForm({ ...incidentForm, incidentDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={incidentForm.incidentTime}
                    onChange={(e) => setIncidentForm({ ...incidentForm, incidentTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Location *</label>
                  <input
                    type="text"
                    value={incidentForm.location}
                    onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Severity</label>
                  <select
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value as IncidentSeverity })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(INCIDENT_SEVERITY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Persons Involved (comma-separated)</label>
                <input
                  type="text"
                  value={incidentForm.personsInvolved}
                  onChange={(e) => setIncidentForm({ ...incidentForm, personsInvolved: e.target.value })}
                  placeholder="Names of people involved"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Immediate Actions Taken</label>
                <textarea
                  value={incidentForm.immediateActions}
                  onChange={(e) => setIncidentForm({ ...incidentForm, immediateActions: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={incidentForm.injuryReported}
                    onChange={(e) => setIncidentForm({ ...incidentForm, injuryReported: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 text-red-500"
                  />
                  <span className="text-sm text-slate-300">Injury Reported</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={incidentForm.propertyDamage}
                    onChange={(e) => setIncidentForm({ ...incidentForm, propertyDamage: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 text-orange-500"
                  />
                  <span className="text-sm text-slate-300">Property Damage</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={incidentForm.nearMiss}
                    onChange={(e) => setIncidentForm({ ...incidentForm, nearMiss: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 text-yellow-500"
                  />
                  <span className="text-sm text-slate-300">Near Miss</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddIncidentModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIncident}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Report Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Checklist Modal */}
      {showAddChecklistModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Safety Checklist</h3>
                <button onClick={() => setShowAddChecklistModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Checklist Name *</label>
                <input
                  type="text"
                  value={checklistForm.name}
                  onChange={(e) => setChecklistForm({ ...checklistForm, name: e.target.value })}
                  placeholder="e.g., Daily Safety Walkthrough"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Department</label>
                <select
                  value={checklistForm.department}
                  onChange={(e) => setChecklistForm({ ...checklistForm, department: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  {DEPARTMENT_CHECKLISTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={checklistForm.assignedTo}
                  onChange={(e) => setChecklistForm({ ...checklistForm, assignedTo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={checklistForm.dueDate}
                  onChange={(e) => setChecklistForm({ ...checklistForm, dueDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddChecklistModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChecklist}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Create Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Emergency Contact</h3>
                <button onClick={() => setShowAddContactModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Role *</label>
                <input
                  type="text"
                  value={contactForm.role}
                  onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                  placeholder="e.g., Safety Coordinator, Fire Department"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={contactForm.isPrimary}
                  onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 text-red-500"
                />
                <span className="text-sm text-slate-300">Primary Emergency Contact</span>
              </label>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddContactModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
