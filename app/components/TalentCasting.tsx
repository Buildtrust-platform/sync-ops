"use client";

import { useState, useEffect, useMemo } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useToast } from './Toast';

/**
 * TALENT & CASTING MODULE (Pre-Production)
 *
 * Purpose: Comprehensive talent database and casting management
 *
 * Features:
 * - Talent database with profiles
 * - Role management for projects
 * - Audition tracking
 * - Casting status workflow
 * - Talent availability calendar
 * - Contact and agent information
 * - Notes and rating system
 */

type TalentStatus = "AVAILABLE" | "BOOKED" | "ON_HOLD" | "UNAVAILABLE";
type CastingStatus = "OPEN" | "AUDITIONING" | "CALLBACK" | "OFFERED" | "CAST" | "DECLINED";
type AuditionStatus = "SCHEDULED" | "COMPLETED" | "NO_SHOW" | "CALLBACK" | "PASSED";

interface TalentProfile {
  id: string;
  projectId: string;
  // Personal Info
  firstName: string;
  lastName: string;
  stageName?: string | null;
  email?: string | null;
  phone?: string | null;
  // Agent/Manager
  agentName?: string | null;
  agentEmail?: string | null;
  agentPhone?: string | null;
  managerName?: string | null;
  managerEmail?: string | null;
  // Physical Attributes
  gender?: string | null;
  ageRange?: string | null;
  ethnicity?: string | null;
  height?: string | null;
  hairColor?: string | null;
  eyeColor?: string | null;
  // Professional
  unionStatus?: "SAG-AFTRA" | "NON-UNION" | "FI-CORE" | null;
  specialSkills?: string[] | null;
  languages?: string[] | null;
  imdbLink?: string | null;
  reelLink?: string | null;
  headshotUrl?: string | null;
  resumeUrl?: string | null;
  // Status
  status: TalentStatus;
  rating?: number | null; // 1-5 stars
  notes?: string | null;
  createdAt?: string | null;
}

interface ProjectRole {
  id: string;
  projectId: string;
  roleName: string;
  characterDescription?: string | null;
  ageRange?: string | null;
  gender?: string | null;
  ethnicity?: string | null;
  speakingLines: boolean;
  roleType: "LEAD" | "SUPPORTING" | "FEATURED" | "DAY_PLAYER" | "BACKGROUND";
  payRate?: number | null;
  payType?: "DAILY" | "WEEKLY" | "FLAT" | "SCALE" | null;
  shootDays?: number | null;
  castingStatus: CastingStatus;
  castTalentId?: string | null;
  castTalentName?: string | null;
  notes?: string | null;
  createdAt?: string | null;
}

interface Audition {
  id: string;
  projectId: string;
  roleId: string;
  roleName: string;
  talentId: string;
  talentName: string;
  auditionDate: string;
  auditionTime?: string | null;
  location?: string | null;
  auditionType: "IN_PERSON" | "SELF_TAPE" | "VIDEO_CALL" | "CALLBACK";
  status: AuditionStatus;
  rating?: number | null;
  notes?: string | null;
  videoUrl?: string | null;
  createdAt?: string | null;
}

interface TalentCastingProps {
  projectId: string;
  organizationId?: string;
  currentUserEmail: string;
}

const ROLE_TYPE_CONFIG = {
  LEAD: { label: "Lead", color: "bg-purple-500", icon: "⭐" },
  SUPPORTING: { label: "Supporting", color: "bg-blue-500", icon: "🎭" },
  FEATURED: { label: "Featured", color: "bg-teal-500", icon: "📍" },
  DAY_PLAYER: { label: "Day Player", color: "bg-orange-500", icon: "📅" },
  BACKGROUND: { label: "Background", color: "bg-slate-500", icon: "👥" },
};

const CASTING_STATUS_CONFIG = {
  OPEN: { label: "Open", color: "bg-slate-500" },
  AUDITIONING: { label: "Auditioning", color: "bg-yellow-500" },
  CALLBACK: { label: "Callback", color: "bg-orange-500" },
  OFFERED: { label: "Offered", color: "bg-blue-500" },
  CAST: { label: "Cast", color: "bg-green-500" },
  DECLINED: { label: "Declined", color: "bg-red-500" },
};

const AUDITION_STATUS_CONFIG = {
  SCHEDULED: { label: "Scheduled", color: "bg-blue-500" },
  COMPLETED: { label: "Completed", color: "bg-green-500" },
  NO_SHOW: { label: "No Show", color: "bg-red-500" },
  CALLBACK: { label: "Callback", color: "bg-orange-500" },
  PASSED: { label: "Passed", color: "bg-slate-500" },
};

const TALENT_STATUS_CONFIG = {
  AVAILABLE: { label: "Available", color: "text-green-400" },
  BOOKED: { label: "Booked", color: "text-blue-400" },
  ON_HOLD: { label: "On Hold", color: "text-yellow-400" },
  UNAVAILABLE: { label: "Unavailable", color: "text-red-400" },
};

export default function TalentCasting({
  projectId,
  organizationId,
  currentUserEmail,
}: TalentCastingProps) {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [auditions, setAuditions] = useState<Audition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<"roles" | "talent" | "auditions" | "cast">("roles");
  const [showAddTalentModal, setShowAddTalentModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showScheduleAuditionModal, setShowScheduleAuditionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ProjectRole | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);

  // Form states
  const [talentForm, setTalentForm] = useState({
    firstName: "",
    lastName: "",
    stageName: "",
    email: "",
    phone: "",
    agentName: "",
    agentEmail: "",
    agentPhone: "",
    gender: "",
    ageRange: "",
    ethnicity: "",
    height: "",
    unionStatus: "NON-UNION" as TalentProfile["unionStatus"],
    specialSkills: "",
    imdbLink: "",
    reelLink: "",
    notes: "",
  });

  const [roleForm, setRoleForm] = useState({
    roleName: "",
    characterDescription: "",
    ageRange: "",
    gender: "",
    ethnicity: "",
    speakingLines: true,
    roleType: "SUPPORTING" as ProjectRole["roleType"],
    payRate: "",
    payType: "DAILY" as ProjectRole["payType"],
    shootDays: "",
    notes: "",
  });

  const [auditionForm, setAuditionForm] = useState({
    roleId: "",
    talentId: "",
    auditionDate: "",
    auditionTime: "",
    location: "",
    auditionType: "IN_PERSON" as Audition["auditionType"],
    notes: "",
  });

  // Load data - data will be fetched from API
  useEffect(() => {
    setIsLoading(true);

    // Data will be fetched from API
    setRoles([]);
    setTalents([]);
    setAuditions([]);
    setIsLoading(false);
  }, [projectId]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalRoles: roles.length,
      castRoles: roles.filter((r) => r.castingStatus === "CAST").length,
      openRoles: roles.filter((r) => r.castingStatus === "OPEN").length,
      totalTalent: talents.length,
      upcomingAuditions: auditions.filter((a) => a.status === "SCHEDULED").length,
      leadRoles: roles.filter((r) => r.roleType === "LEAD").length,
    };
  }, [roles, talents, auditions]);

  // Filter talents
  const filteredTalents = useMemo(() => {
    if (!searchQuery) return talents;
    const query = searchQuery.toLowerCase();
    return talents.filter(
      (t) =>
        t.firstName.toLowerCase().includes(query) ||
        t.lastName.toLowerCase().includes(query) ||
        t.stageName?.toLowerCase().includes(query) ||
        t.email?.toLowerCase().includes(query)
    );
  }, [talents, searchQuery]);

  // Add talent handler
  const handleAddTalent = () => {
    if (!talentForm.firstName || !talentForm.lastName) {
      toast.warning("Missing Information", "Please fill in required fields");
      return;
    }

    const newTalent: TalentProfile = {
      id: `talent-${Date.now()}`,
      projectId,
      firstName: talentForm.firstName,
      lastName: talentForm.lastName,
      stageName: talentForm.stageName || null,
      email: talentForm.email || null,
      phone: talentForm.phone || null,
      agentName: talentForm.agentName || null,
      agentEmail: talentForm.agentEmail || null,
      agentPhone: talentForm.agentPhone || null,
      gender: talentForm.gender || null,
      ageRange: talentForm.ageRange || null,
      ethnicity: talentForm.ethnicity || null,
      height: talentForm.height || null,
      unionStatus: talentForm.unionStatus,
      specialSkills: talentForm.specialSkills ? talentForm.specialSkills.split(",").map((s) => s.trim()) : null,
      imdbLink: talentForm.imdbLink || null,
      reelLink: talentForm.reelLink || null,
      notes: talentForm.notes || null,
      status: "AVAILABLE",
      rating: null,
      createdAt: new Date().toISOString(),
    };

    setTalents((prev) => [...prev, newTalent]);
    setShowAddTalentModal(false);
    setTalentForm({
      firstName: "",
      lastName: "",
      stageName: "",
      email: "",
      phone: "",
      agentName: "",
      agentEmail: "",
      agentPhone: "",
      gender: "",
      ageRange: "",
      ethnicity: "",
      height: "",
      unionStatus: "NON-UNION",
      specialSkills: "",
      imdbLink: "",
      reelLink: "",
      notes: "",
    });
  };

  // Add role handler
  const handleAddRole = () => {
    if (!roleForm.roleName) {
      toast.warning("Missing Role Name", "Please enter a role name");
      return;
    }

    const newRole: ProjectRole = {
      id: `role-${Date.now()}`,
      projectId,
      roleName: roleForm.roleName,
      characterDescription: roleForm.characterDescription || null,
      ageRange: roleForm.ageRange || null,
      gender: roleForm.gender || null,
      ethnicity: roleForm.ethnicity || null,
      speakingLines: roleForm.speakingLines,
      roleType: roleForm.roleType,
      payRate: roleForm.payRate ? parseFloat(roleForm.payRate) : null,
      payType: roleForm.payType,
      shootDays: roleForm.shootDays ? parseInt(roleForm.shootDays) : null,
      castingStatus: "OPEN",
      notes: roleForm.notes || null,
      createdAt: new Date().toISOString(),
    };

    setRoles((prev) => [...prev, newRole]);
    setShowAddRoleModal(false);
    setRoleForm({
      roleName: "",
      characterDescription: "",
      ageRange: "",
      gender: "",
      ethnicity: "",
      speakingLines: true,
      roleType: "SUPPORTING",
      payRate: "",
      payType: "DAILY",
      shootDays: "",
      notes: "",
    });
  };

  // Schedule audition handler
  const handleScheduleAudition = () => {
    if (!auditionForm.roleId || !auditionForm.talentId || !auditionForm.auditionDate) {
      toast.warning("Missing Information", "Please fill in required fields");
      return;
    }

    const role = roles.find((r) => r.id === auditionForm.roleId);
    const talent = talents.find((t) => t.id === auditionForm.talentId);

    if (!role || !talent) return;

    const newAudition: Audition = {
      id: `audition-${Date.now()}`,
      projectId,
      roleId: auditionForm.roleId,
      roleName: role.roleName,
      talentId: auditionForm.talentId,
      talentName: `${talent.firstName} ${talent.lastName}`,
      auditionDate: auditionForm.auditionDate,
      auditionTime: auditionForm.auditionTime || null,
      location: auditionForm.location || null,
      auditionType: auditionForm.auditionType,
      status: "SCHEDULED",
      notes: auditionForm.notes || null,
      createdAt: new Date().toISOString(),
    };

    setAuditions((prev) => [...prev, newAudition]);

    // Update role status if still open
    if (role.castingStatus === "OPEN") {
      setRoles((prev) =>
        prev.map((r) => (r.id === role.id ? { ...r, castingStatus: "AUDITIONING" as CastingStatus } : r))
      );
    }

    setShowScheduleAuditionModal(false);
    setAuditionForm({
      roleId: "",
      talentId: "",
      auditionDate: "",
      auditionTime: "",
      location: "",
      auditionType: "IN_PERSON",
      notes: "",
    });
  };

  // Cast talent in role
  const handleCastTalent = (roleId: string, talentId: string) => {
    const talent = talents.find((t) => t.id === talentId);
    if (!talent) return;

    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? {
              ...r,
              castingStatus: "CAST" as CastingStatus,
              castTalentId: talentId,
              castTalentName: `${talent.firstName} ${talent.lastName}`,
            }
          : r
      )
    );

    setTalents((prev) =>
      prev.map((t) => (t.id === talentId ? { ...t, status: "BOOKED" as TalentStatus } : t))
    );
  };

  // Render star rating
  const renderRating = (rating: number | null | undefined) => {
    if (!rating) return <span className="text-slate-500">No rating</span>;
    return (
      <span className="text-yellow-400">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </span>
    );
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎭</span>
            <div>
              <h2 className="text-xl font-black text-white">Talent & Casting</h2>
              <p className="text-purple-200 text-sm">Manage roles, auditions, and cast</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddRoleModal(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-colors"
            >
              + Add Role
            </button>
            <button
              onClick={() => setShowAddTalentModal(true)}
              className="px-4 py-2 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-colors"
            >
              + Add Talent
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-slate-800 border-b border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-black text-white">{stats.totalRoles}</div>
          <div className="text-xs text-slate-400">Total Roles</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-purple-400">{stats.leadRoles}</div>
          <div className="text-xs text-slate-400">Lead Roles</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-green-400">{stats.castRoles}</div>
          <div className="text-xs text-slate-400">Cast</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-yellow-400">{stats.openRoles}</div>
          <div className="text-xs text-slate-400">Open</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-blue-400">{stats.totalTalent}</div>
          <div className="text-xs text-slate-400">Talent Pool</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-orange-400">{stats.upcomingAuditions}</div>
          <div className="text-xs text-slate-400">Auditions</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        {[
          { id: "roles", label: "Roles", icon: "📋" },
          { id: "talent", label: "Talent Pool", icon: "👤" },
          { id: "auditions", label: "Auditions", icon: "🎬" },
          { id: "cast", label: "Final Cast", icon: "⭐" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-purple-600 text-white"
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
            <div className="animate-spin text-4xl mb-4">🎭</div>
            <p className="text-slate-400">Loading casting data...</p>
          </div>
        ) : activeTab === "roles" ? (
          /* Roles Tab */
          <div className="space-y-4">
            {roles.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">📋</span>
                <h3 className="text-xl font-bold text-white mt-4">No Roles Yet</h3>
                <p className="text-slate-400 mt-2">Add roles to start the casting process</p>
                <button
                  onClick={() => setShowAddRoleModal(true)}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                >
                  + Add First Role
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {roles.map((role) => {
                  const typeConfig = ROLE_TYPE_CONFIG[role.roleType];
                  const statusConfig = CASTING_STATUS_CONFIG[role.castingStatus];

                  return (
                    <div
                      key={role.id}
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
                            <h3 className="text-lg font-bold text-white">{role.roleName}</h3>
                            {role.characterDescription && (
                              <p className="text-sm text-slate-400 mt-1">{role.characterDescription}</p>
                            )}
                          </div>
                          {role.castTalentName && (
                            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm font-medium">
                              Cast: {role.castTalentName}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {role.ageRange && (
                            <span className="bg-slate-700 px-2 py-1 rounded text-slate-300">
                              Age: {role.ageRange}
                            </span>
                          )}
                          {role.gender && (
                            <span className="bg-slate-700 px-2 py-1 rounded text-slate-300">
                              {role.gender}
                            </span>
                          )}
                          {role.speakingLines && (
                            <span className="bg-blue-500/20 px-2 py-1 rounded text-blue-400">
                              Speaking Role
                            </span>
                          )}
                          {role.shootDays && (
                            <span className="bg-slate-700 px-2 py-1 rounded text-slate-300">
                              {role.shootDays} days
                            </span>
                          )}
                          {role.payRate && role.payType && (
                            <span className="bg-teal-500/20 px-2 py-1 rounded text-teal-400">
                              ${role.payRate.toLocaleString()}/{role.payType.toLowerCase()}
                            </span>
                          )}
                        </div>

                        {role.castingStatus !== "CAST" && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedRole(role);
                                setAuditionForm((prev) => ({ ...prev, roleId: role.id }));
                                setShowScheduleAuditionModal(true);
                              }}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg"
                            >
                              Schedule Audition
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
        ) : activeTab === "talent" ? (
          /* Talent Pool Tab */
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search talent by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
              />
            </div>

            {filteredTalents.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">👤</span>
                <h3 className="text-xl font-bold text-white mt-4">No Talent Found</h3>
                <p className="text-slate-400 mt-2">
                  {searchQuery ? "No results match your search" : "Add talent to your pool"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTalents.map((talent) => {
                  const statusConfig = TALENT_STATUS_CONFIG[talent.status];

                  return (
                    <div
                      key={talent.id}
                      className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                          {talent.headshotUrl ? (
                            <img
                              src={talent.headshotUrl}
                              alt={talent.firstName}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            "👤"
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                              {talent.firstName} {talent.lastName}
                              {talent.stageName && (
                                <span className="text-slate-400 font-normal ml-2">
                                  ({talent.stageName})
                                </span>
                              )}
                            </h3>
                            <span className={`text-sm font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2 text-xs">
                            {talent.gender && (
                              <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                                {talent.gender}
                              </span>
                            )}
                            {talent.ageRange && (
                              <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                                {talent.ageRange}
                              </span>
                            )}
                            {talent.unionStatus && (
                              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-400">
                                {talent.unionStatus}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 text-sm">
                            {renderRating(talent.rating)}
                          </div>

                          {talent.agentName && (
                            <p className="text-xs text-slate-500 mt-2">
                              Agent: {talent.agentName}
                            </p>
                          )}

                          <div className="mt-3 flex gap-2">
                            {talent.email && (
                              <a
                                href={`mailto:${talent.email}`}
                                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded"
                              >
                                Email
                              </a>
                            )}
                            {talent.imdbLink && (
                              <a
                                href={talent.imdbLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded"
                              >
                                IMDb
                              </a>
                            )}
                            {talent.reelLink && (
                              <a
                                href={talent.reelLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded"
                              >
                                Reel
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === "auditions" ? (
          /* Auditions Tab */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-slate-400">Track and manage audition sessions</p>
              <button
                onClick={() => setShowScheduleAuditionModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
              >
                + Schedule Audition
              </button>
            </div>

            {auditions.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">🎬</span>
                <h3 className="text-xl font-bold text-white mt-4">No Auditions Scheduled</h3>
                <p className="text-slate-400 mt-2">Schedule auditions to find the perfect cast</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditions.map((audition) => {
                  const statusConfig = AUDITION_STATUS_CONFIG[audition.status];

                  return (
                    <div
                      key={audition.id}
                      className="bg-slate-800 rounded-lg border border-slate-700 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white">{audition.talentName}</h4>
                          <p className="text-sm text-slate-400">for {audition.roleName}</p>
                        </div>
                        <span className={`${statusConfig.color} px-2 py-1 rounded text-xs font-bold text-white`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-400">
                        <span>📅 {new Date(audition.auditionDate).toLocaleDateString()}</span>
                        {audition.auditionTime && <span>🕐 {audition.auditionTime}</span>}
                        <span className="capitalize">📹 {audition.auditionType.replace("_", " ").toLowerCase()}</span>
                        {audition.location && <span>📍 {audition.location}</span>}
                      </div>
                      {audition.status === "SCHEDULED" && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              setAuditions((prev) =>
                                prev.map((a) =>
                                  a.id === audition.id ? { ...a, status: "COMPLETED" as AuditionStatus } : a
                                )
                              );
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => {
                              setAuditions((prev) =>
                                prev.map((a) =>
                                  a.id === audition.id ? { ...a, status: "CALLBACK" as AuditionStatus } : a
                                )
                              );
                            }}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded"
                          >
                            Request Callback
                          </button>
                          <button
                            onClick={() => handleCastTalent(audition.roleId, audition.talentId)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
                          >
                            Cast This Talent
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Final Cast Tab */
          <div className="space-y-4">
            {roles.filter((r) => r.castingStatus === "CAST").length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">⭐</span>
                <h3 className="text-xl font-bold text-white mt-4">No Cast Members Yet</h3>
                <p className="text-slate-400 mt-2">Cast talent from auditions to see them here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {roles
                  .filter((r) => r.castingStatus === "CAST")
                  .map((role) => {
                    const talent = talents.find((t) => t.id === role.castTalentId);
                    const typeConfig = ROLE_TYPE_CONFIG[role.roleType];

                    return (
                      <div
                        key={role.id}
                        className="bg-slate-800 rounded-lg border border-green-500/30 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                            👤
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">{role.castTalentName}</h3>
                            <p className="text-purple-400">as {role.roleName}</p>
                            <div className="flex gap-2 mt-2">
                              <span className={`${typeConfig.color} px-2 py-0.5 rounded text-xs text-white`}>
                                {typeConfig.label}
                              </span>
                              {talent?.unionStatus && (
                                <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-300">
                                  {talent.unionStatus}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {role.shootDays && (
                              <p className="text-sm text-slate-400">{role.shootDays} shoot days</p>
                            )}
                            {role.payRate && (
                              <p className="text-lg font-bold text-teal-400">
                                ${(role.payRate * (role.shootDays || 1)).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Talent Modal */}
      {showAddTalentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Talent to Pool</h3>
                <button onClick={() => setShowAddTalentModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={talentForm.firstName}
                    onChange={(e) => setTalentForm({ ...talentForm, firstName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={talentForm.lastName}
                    onChange={(e) => setTalentForm({ ...talentForm, lastName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Stage Name</label>
                  <input
                    type="text"
                    value={talentForm.stageName}
                    onChange={(e) => setTalentForm({ ...talentForm, stageName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Union Status</label>
                  <select
                    value={talentForm.unionStatus || "NON-UNION"}
                    onChange={(e) => setTalentForm({ ...talentForm, unionStatus: e.target.value as TalentProfile["unionStatus"] })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="NON-UNION">Non-Union</option>
                    <option value="SAG-AFTRA">SAG-AFTRA</option>
                    <option value="FI-CORE">Fi-Core</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={talentForm.email}
                    onChange={(e) => setTalentForm({ ...talentForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={talentForm.phone}
                    onChange={(e) => setTalentForm({ ...talentForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Gender</label>
                  <select
                    value={talentForm.gender}
                    onChange={(e) => setTalentForm({ ...talentForm, gender: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Age Range</label>
                  <input
                    type="text"
                    value={talentForm.ageRange}
                    onChange={(e) => setTalentForm({ ...talentForm, ageRange: e.target.value })}
                    placeholder="e.g., 25-35"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Agent Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={talentForm.agentName}
                    onChange={(e) => setTalentForm({ ...talentForm, agentName: e.target.value })}
                    placeholder="Agent Name"
                    className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
                  />
                  <input
                    type="email"
                    value={talentForm.agentEmail}
                    onChange={(e) => setTalentForm({ ...talentForm, agentEmail: e.target.value })}
                    placeholder="Agent Email"
                    className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
                  />
                  <input
                    type="tel"
                    value={talentForm.agentPhone}
                    onChange={(e) => setTalentForm({ ...talentForm, agentPhone: e.target.value })}
                    placeholder="Agent Phone"
                    className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Special Skills (comma-separated)</label>
                <input
                  type="text"
                  value={talentForm.specialSkills}
                  onChange={(e) => setTalentForm({ ...talentForm, specialSkills: e.target.value })}
                  placeholder="e.g., Dance, Martial Arts, Guitar"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">IMDb Link</label>
                  <input
                    type="url"
                    value={talentForm.imdbLink}
                    onChange={(e) => setTalentForm({ ...talentForm, imdbLink: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Demo Reel Link</label>
                  <input
                    type="url"
                    value={talentForm.reelLink}
                    onChange={(e) => setTalentForm({ ...talentForm, reelLink: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Notes</label>
                <textarea
                  value={talentForm.notes}
                  onChange={(e) => setTalentForm({ ...talentForm, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddTalentModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTalent}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Add Talent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add New Role</h3>
                <button onClick={() => setShowAddRoleModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Role/Character Name *</label>
                <input
                  type="text"
                  value={roleForm.roleName}
                  onChange={(e) => setRoleForm({ ...roleForm, roleName: e.target.value })}
                  placeholder="e.g., Sarah Mitchell"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Character Description</label>
                <textarea
                  value={roleForm.characterDescription}
                  onChange={(e) => setRoleForm({ ...roleForm, characterDescription: e.target.value })}
                  rows={2}
                  placeholder="Brief description of the character..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Role Type</label>
                  <select
                    value={roleForm.roleType}
                    onChange={(e) => setRoleForm({ ...roleForm, roleType: e.target.value as ProjectRole["roleType"] })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(ROLE_TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.icon} {config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Age Range</label>
                  <input
                    type="text"
                    value={roleForm.ageRange}
                    onChange={(e) => setRoleForm({ ...roleForm, ageRange: e.target.value })}
                    placeholder="e.g., 30-40"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Gender</label>
                  <select
                    value={roleForm.gender}
                    onChange={(e) => setRoleForm({ ...roleForm, gender: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Shoot Days</label>
                  <input
                    type="number"
                    value={roleForm.shootDays}
                    onChange={(e) => setRoleForm({ ...roleForm, shootDays: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Pay Rate</label>
                  <input
                    type="number"
                    value={roleForm.payRate}
                    onChange={(e) => setRoleForm({ ...roleForm, payRate: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Pay Type</label>
                  <select
                    value={roleForm.payType || "DAILY"}
                    onChange={(e) => setRoleForm({ ...roleForm, payType: e.target.value as ProjectRole["payType"] })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="FLAT">Flat Fee</option>
                    <option value="SCALE">Scale</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={roleForm.speakingLines}
                  onChange={(e) => setRoleForm({ ...roleForm, speakingLines: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 text-purple-500"
                />
                <span className="text-sm text-slate-300">Speaking Role</span>
              </label>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRole}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Add Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Audition Modal */}
      {showScheduleAuditionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Schedule Audition</h3>
                <button onClick={() => setShowScheduleAuditionModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Role *</label>
                <select
                  value={auditionForm.roleId}
                  onChange={(e) => setAuditionForm({ ...auditionForm, roleId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select role...</option>
                  {roles
                    .filter((r) => r.castingStatus !== "CAST")
                    .map((role) => (
                      <option key={role.id} value={role.id}>{role.roleName}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Talent *</label>
                <select
                  value={auditionForm.talentId}
                  onChange={(e) => setAuditionForm({ ...auditionForm, talentId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select talent...</option>
                  {talents
                    .filter((t) => t.status === "AVAILABLE")
                    .map((talent) => (
                      <option key={talent.id} value={talent.id}>{talent.firstName} {talent.lastName}</option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Date *</label>
                  <input
                    type="date"
                    value={auditionForm.auditionDate}
                    onChange={(e) => setAuditionForm({ ...auditionForm, auditionDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={auditionForm.auditionTime}
                    onChange={(e) => setAuditionForm({ ...auditionForm, auditionTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Type</label>
                <select
                  value={auditionForm.auditionType}
                  onChange={(e) => setAuditionForm({ ...auditionForm, auditionType: e.target.value as Audition["auditionType"] })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="IN_PERSON">In Person</option>
                  <option value="SELF_TAPE">Self Tape</option>
                  <option value="VIDEO_CALL">Video Call</option>
                  <option value="CALLBACK">Callback</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={auditionForm.location}
                  onChange={(e) => setAuditionForm({ ...auditionForm, location: e.target.value })}
                  placeholder="Address or video call link"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleAuditionModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleAudition}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Schedule Audition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
