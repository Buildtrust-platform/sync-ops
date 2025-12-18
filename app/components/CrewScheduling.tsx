"use client";

import { useState, useEffect, useMemo } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useToast } from './Toast';

/**
 * CREW SCHEDULING MODULE (Pre-Production)
 *
 * Purpose: Cross-day crew scheduling and availability management
 *
 * Features:
 * - Master crew database (independent of call sheets)
 * - Availability calendar
 * - Day-out-of-days tracking
 * - Overtime calculations
 * - Scheduling conflicts detection
 * - Department-based views
 * - Crew booking confirmations
 */

type CrewStatus = "CONFIRMED" | "TENTATIVE" | "UNAVAILABLE" | "ON_HOLD";
type BookingStatus = "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED";

interface CrewMember {
  id: string;
  projectId: string;
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  // Professional
  department: string;
  role: string;
  unionStatus?: "UNION" | "NON_UNION" | "MUST_JOIN" | null;
  dayRate?: number | null;
  weeklyRate?: number | null;
  overtimeRate?: number | null;
  kitFee?: number | null;
  // Emergency Contact
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  // Status
  status: CrewStatus;
  startDate?: string | null;
  endDate?: string | null;
  totalDays?: number | null;
  notes?: string | null;
  createdAt: string;
}

interface ShootDay {
  id: string;
  projectId: string;
  date: string;
  dayNumber: number;
  location?: string | null;
  callTime?: string | null;
  wrapTime?: string | null;
  scenes?: string[] | null;
  notes?: string | null;
  isHold?: boolean | null;
}

interface CrewBooking {
  id: string;
  projectId: string;
  crewMemberId: string;
  crewMemberName: string;
  shootDayId: string;
  date: string;
  callTime?: string | null;
  estimatedWrap?: string | null;
  actualWrap?: string | null;
  hoursWorked?: number | null;
  overtimeHours?: number | null;
  status: BookingStatus;
  notes?: string | null;
  createdAt: string;
}

interface CrewSchedulingProps {
  projectId: string;
  organizationId?: string;
  currentUserEmail: string;
}

const DEPARTMENTS = [
  { id: "PRODUCTION", label: "Production", icon: "🎬" },
  { id: "DIRECTION", label: "Direction", icon: "🎥" },
  { id: "CAMERA", label: "Camera", icon: "📹" },
  { id: "LIGHTING", label: "Lighting", icon: "💡" },
  { id: "GRIP", label: "Grip", icon: "🔧" },
  { id: "SOUND", label: "Sound", icon: "🎤" },
  { id: "ART", label: "Art Department", icon: "🎨" },
  { id: "WARDROBE", label: "Wardrobe", icon: "👔" },
  { id: "MAKEUP", label: "Hair & Makeup", icon: "💄" },
  { id: "TRANSPORT", label: "Transportation", icon: "🚐" },
  { id: "CATERING", label: "Catering", icon: "🍽️" },
  { id: "POST", label: "Post-Production", icon: "🖥️" },
  { id: "OTHER", label: "Other", icon: "📋" },
];

const CREW_STATUS_CONFIG = {
  CONFIRMED: { label: "Confirmed", color: "bg-green-500", textColor: "text-green-400" },
  TENTATIVE: { label: "Tentative", color: "bg-yellow-500", textColor: "text-yellow-400" },
  UNAVAILABLE: { label: "Unavailable", color: "bg-red-500", textColor: "text-red-400" },
  ON_HOLD: { label: "On Hold", color: "bg-blue-500", textColor: "text-blue-400" },
};

const BOOKING_STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "bg-yellow-500" },
  CONFIRMED: { label: "Confirmed", color: "bg-green-500" },
  DECLINED: { label: "Declined", color: "bg-red-500" },
  CANCELLED: { label: "Cancelled", color: "bg-slate-500" },
};

export default function CrewScheduling({
  projectId,
  organizationId,
  currentUserEmail,
}: CrewSchedulingProps) {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [shootDays, setShootDays] = useState<ShootDay[]>([]);
  const [bookings, setBookings] = useState<CrewBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<"crew" | "schedule" | "dood" | "costs">("crew");
  const [showAddCrewModal, setShowAddCrewModal] = useState(false);
  const [showAddShootDayModal, setShowAddShootDayModal] = useState(false);
  const [showBookCrewModal, setShowBookCrewModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedShootDay, setSelectedShootDay] = useState<ShootDay | null>(null);

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);

  // Form states
  const [crewForm, setCrewForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "PRODUCTION",
    role: "",
    unionStatus: "NON_UNION" as CrewMember["unionStatus"],
    dayRate: "",
    weeklyRate: "",
    overtimeRate: "",
    kitFee: "",
    emergencyContact: "",
    emergencyPhone: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const [shootDayForm, setShootDayForm] = useState({
    date: "",
    dayNumber: "",
    location: "",
    callTime: "",
    wrapTime: "",
    scenes: "",
    notes: "",
    isHold: false,
  });

  // Load data - data will be fetched from API
  useEffect(() => {
    setIsLoading(true);

    // Data will be fetched from API
    setCrewMembers([]);
    setShootDays([]);
    setBookings([]);
    setIsLoading(false);
  }, [projectId]);

  // Stats
  const stats = useMemo(() => {
    const confirmedCrew = crewMembers.filter((c) => c.status === "CONFIRMED").length;
    const tentativeCrew = crewMembers.filter((c) => c.status === "TENTATIVE").length;
    const totalDays = shootDays.filter((d) => !d.isHold).length;
    const holdDays = shootDays.filter((d) => d.isHold).length;
    const totalCrewDays = crewMembers.reduce((sum, c) => sum + (c.totalDays || 0), 0);

    // Calculate estimated labor cost
    const laborCost = crewMembers.reduce((sum, c) => {
      const days = c.totalDays || 0;
      const dayRate = c.dayRate || 0;
      const kitFee = c.kitFee || 0;
      return sum + days * dayRate + days * kitFee;
    }, 0);

    return {
      totalCrew: crewMembers.length,
      confirmedCrew,
      tentativeCrew,
      totalDays,
      holdDays,
      totalCrewDays,
      laborCost,
    };
  }, [crewMembers, shootDays]);

  // Filter crew by department
  const filteredCrew = useMemo(() => {
    if (selectedDepartment === "ALL") return crewMembers;
    return crewMembers.filter((c) => c.department === selectedDepartment);
  }, [crewMembers, selectedDepartment]);

  // Group crew by department
  const crewByDepartment = useMemo(() => {
    return crewMembers.reduce((acc, crew) => {
      if (!acc[crew.department]) acc[crew.department] = [];
      acc[crew.department].push(crew);
      return acc;
    }, {} as Record<string, CrewMember[]>);
  }, [crewMembers]);

  // Day out of days matrix
  const doodMatrix = useMemo(() => {
    return crewMembers.map((crew) => {
      const days = shootDays.map((day) => {
        const booking = bookings.find(
          (b) => b.crewMemberId === crew.id && b.shootDayId === day.id
        );
        return {
          dayId: day.id,
          date: day.date,
          dayNumber: day.dayNumber,
          isHold: day.isHold,
          booking,
        };
      });
      return { crew, days };
    });
  }, [crewMembers, shootDays, bookings]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Add crew member handler
  const handleAddCrew = () => {
    if (!crewForm.firstName || !crewForm.lastName || !crewForm.email || !crewForm.role) {
      toast.warning("Missing Information", "Please fill in required fields");
      return;
    }

    const newCrew: CrewMember = {
      id: `crew-${Date.now()}`,
      projectId,
      firstName: crewForm.firstName,
      lastName: crewForm.lastName,
      email: crewForm.email,
      phone: crewForm.phone || null,
      department: crewForm.department,
      role: crewForm.role,
      unionStatus: crewForm.unionStatus,
      dayRate: crewForm.dayRate ? parseFloat(crewForm.dayRate) : null,
      weeklyRate: crewForm.weeklyRate ? parseFloat(crewForm.weeklyRate) : null,
      overtimeRate: crewForm.overtimeRate ? parseFloat(crewForm.overtimeRate) : null,
      kitFee: crewForm.kitFee ? parseFloat(crewForm.kitFee) : null,
      emergencyContact: crewForm.emergencyContact || null,
      emergencyPhone: crewForm.emergencyPhone || null,
      status: "TENTATIVE",
      startDate: crewForm.startDate || null,
      endDate: crewForm.endDate || null,
      notes: crewForm.notes || null,
      createdAt: new Date().toISOString(),
    };

    setCrewMembers((prev) => [...prev, newCrew]);
    setShowAddCrewModal(false);
    setCrewForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "PRODUCTION",
      role: "",
      unionStatus: "NON_UNION",
      dayRate: "",
      weeklyRate: "",
      overtimeRate: "",
      kitFee: "",
      emergencyContact: "",
      emergencyPhone: "",
      startDate: "",
      endDate: "",
      notes: "",
    });
  };

  // Add shoot day handler
  const handleAddShootDay = () => {
    if (!shootDayForm.date || !shootDayForm.dayNumber) {
      toast.warning("Missing Information", "Please fill in required fields");
      return;
    }

    const newDay: ShootDay = {
      id: `day-${Date.now()}`,
      projectId,
      date: shootDayForm.date,
      dayNumber: parseInt(shootDayForm.dayNumber),
      location: shootDayForm.location || null,
      callTime: shootDayForm.callTime || null,
      wrapTime: shootDayForm.wrapTime || null,
      scenes: shootDayForm.scenes ? shootDayForm.scenes.split(",").map((s) => s.trim()) : null,
      notes: shootDayForm.notes || null,
      isHold: shootDayForm.isHold,
    };

    setShootDays((prev) => [...prev, newDay].sort((a, b) => a.dayNumber - b.dayNumber));
    setShowAddShootDayModal(false);
    setShootDayForm({
      date: "",
      dayNumber: "",
      location: "",
      callTime: "",
      wrapTime: "",
      scenes: "",
      notes: "",
      isHold: false,
    });
  };

  // Update crew status
  const updateCrewStatus = (crewId: string, newStatus: CrewStatus) => {
    setCrewMembers((prev) =>
      prev.map((c) => (c.id === crewId ? { ...c, status: newStatus } : c))
    );
  };

  // Book crew for a day
  const bookCrewForDay = (crewId: string, dayId: string) => {
    const crew = crewMembers.find((c) => c.id === crewId);
    const day = shootDays.find((d) => d.id === dayId);

    if (!crew || !day) return;

    // Check if already booked
    const existingBooking = bookings.find(
      (b) => b.crewMemberId === crewId && b.shootDayId === dayId
    );

    if (existingBooking) {
      toast.warning("Booking Conflict", "Crew member already booked for this day");
      return;
    }

    const newBooking: CrewBooking = {
      id: `booking-${Date.now()}`,
      projectId,
      crewMemberId: crewId,
      crewMemberName: `${crew.firstName} ${crew.lastName}`,
      shootDayId: dayId,
      date: day.date,
      callTime: day.callTime || null,
      estimatedWrap: day.wrapTime || null,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [...prev, newBooking]);
  };

  // Confirm booking
  const confirmBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "CONFIRMED" as BookingStatus } : b))
    );
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👷</span>
            <div>
              <h2 className="text-xl font-black text-white">Crew Scheduling</h2>
              <p className="text-cyan-200 text-sm">Master crew database and availability</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddShootDayModal(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-colors"
            >
              + Add Shoot Day
            </button>
            <button
              onClick={() => setShowAddCrewModal(true)}
              className="px-4 py-2 bg-white text-cyan-600 font-bold rounded-lg hover:bg-cyan-50 transition-colors"
            >
              + Add Crew
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 p-4 bg-slate-800 border-b border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-black text-white">{stats.totalCrew}</div>
          <div className="text-xs text-slate-400">Total Crew</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-green-400">{stats.confirmedCrew}</div>
          <div className="text-xs text-slate-400">Confirmed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-yellow-400">{stats.tentativeCrew}</div>
          <div className="text-xs text-slate-400">Tentative</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-blue-400">{stats.totalDays}</div>
          <div className="text-xs text-slate-400">Shoot Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-orange-400">{stats.holdDays}</div>
          <div className="text-xs text-slate-400">Hold Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-purple-400">{stats.totalCrewDays}</div>
          <div className="text-xs text-slate-400">Crew Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-teal-400">{formatCurrency(stats.laborCost)}</div>
          <div className="text-xs text-slate-400">Est. Labor</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        {[
          { id: "crew", label: "Crew List", icon: "👥" },
          { id: "schedule", label: "Schedule", icon: "📅" },
          { id: "dood", label: "Day Out of Days", icon: "📊" },
          { id: "costs", label: "Labor Costs", icon: "💰" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-cyan-600 text-white"
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
            <div className="animate-spin text-4xl mb-4">👷</div>
            <p className="text-slate-400">Loading crew data...</p>
          </div>
        ) : activeTab === "crew" ? (
          /* Crew List Tab */
          <div className="space-y-4">
            {/* Department Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDepartment("ALL")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedDepartment === "ALL"
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                All Departments
              </button>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedDepartment === dept.id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {dept.icon} {dept.label}
                </button>
              ))}
            </div>

            {filteredCrew.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">👷</span>
                <h3 className="text-xl font-bold text-white mt-4">No Crew Members</h3>
                <p className="text-slate-400 mt-2">Add crew members to build your team</p>
                <button
                  onClick={() => setShowAddCrewModal(true)}
                  className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium"
                >
                  + Add Crew Member
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCrew.map((crew) => {
                  const statusConfig = CREW_STATUS_CONFIG[crew.status];
                  const dept = DEPARTMENTS.find((d) => d.id === crew.department);

                  return (
                    <div
                      key={crew.id}
                      className="bg-slate-800 rounded-lg border border-slate-700 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl">
                            {dept?.icon || "👤"}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {crew.firstName} {crew.lastName}
                            </h3>
                            <p className="text-sm text-slate-400">{crew.role}</p>
                            <p className="text-xs text-slate-500">{dept?.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={crew.status}
                            onChange={(e) => updateCrewStatus(crew.id, e.target.value as CrewStatus)}
                            className={`${statusConfig.color} text-white text-xs font-bold px-2 py-1 rounded border-0`}
                          >
                            {Object.entries(CREW_STATUS_CONFIG).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        {crew.dayRate && (
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Day Rate</p>
                            <p className="text-white font-bold">{formatCurrency(crew.dayRate)}</p>
                          </div>
                        )}
                        {crew.kitFee && (
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Kit Fee</p>
                            <p className="text-white font-bold">{formatCurrency(crew.kitFee)}</p>
                          </div>
                        )}
                        {crew.totalDays && (
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Days Booked</p>
                            <p className="text-white font-bold">{crew.totalDays}</p>
                          </div>
                        )}
                        {crew.unionStatus && (
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Union Status</p>
                            <p className="text-white font-bold">{crew.unionStatus.replace("_", "-")}</p>
                          </div>
                        )}
                        {crew.dayRate && crew.totalDays && (
                          <div className="bg-teal-500/20 rounded p-2">
                            <p className="text-xs text-teal-400">Total Est.</p>
                            <p className="text-teal-400 font-bold">
                              {formatCurrency(crew.dayRate * crew.totalDays + (crew.kitFee || 0) * crew.totalDays)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                        {crew.email && <span>✉️ {crew.email}</span>}
                        {crew.phone && <span>📞 {crew.phone}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === "schedule" ? (
          /* Schedule Tab */
          <div className="space-y-4">
            {shootDays.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">📅</span>
                <h3 className="text-xl font-bold text-white mt-4">No Shoot Days</h3>
                <p className="text-slate-400 mt-2">Add shoot days to create the schedule</p>
                <button
                  onClick={() => setShowAddShootDayModal(true)}
                  className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium"
                >
                  + Add Shoot Day
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {shootDays.map((day) => {
                  const dayBookings = bookings.filter((b) => b.shootDayId === day.id);

                  return (
                    <div
                      key={day.id}
                      className={`bg-slate-800 rounded-lg border ${
                        day.isHold ? "border-yellow-500/50" : "border-slate-700"
                      } overflow-hidden`}
                    >
                      <div className={`px-4 py-3 ${day.isHold ? "bg-yellow-500/20" : "bg-slate-700"} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-white">Day {day.dayNumber}</span>
                          <span className="text-slate-400">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {day.isHold && (
                            <span className="bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded text-xs font-bold">
                              HOLD
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">
                          {day.callTime && <span>Call: {day.callTime}</span>}
                          {day.wrapTime && <span className="ml-3">Wrap: {day.wrapTime}</span>}
                        </div>
                      </div>
                      <div className="p-4">
                        {day.location && (
                          <p className="text-sm text-white mb-2">📍 {day.location}</p>
                        )}
                        {day.scenes && day.scenes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {day.scenes.map((scene, i) => (
                              <span key={i} className="bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-300">
                                Scene {scene}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Crew Booked for this day */}
                        <div className="mt-3">
                          <p className="text-xs text-slate-500 mb-2">Crew Booked ({dayBookings.length})</p>
                          {dayBookings.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {dayBookings.map((booking) => {
                                const statusConfig = BOOKING_STATUS_CONFIG[booking.status];
                                return (
                                  <div
                                    key={booking.id}
                                    className="bg-slate-700 px-3 py-1.5 rounded flex items-center gap-2"
                                  >
                                    <span className="text-white text-sm">{booking.crewMemberName}</span>
                                    <span className={`${statusConfig.color} w-2 h-2 rounded-full`} />
                                    {booking.status === "PENDING" && (
                                      <button
                                        onClick={() => confirmBooking(booking.id)}
                                        className="text-xs text-green-400 hover:text-green-300"
                                      >
                                        Confirm
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-slate-500 text-sm">No crew booked yet</p>
                          )}
                        </div>

                        {/* Quick Book */}
                        <button
                          onClick={() => {
                            setSelectedShootDay(day);
                            setShowBookCrewModal(true);
                          }}
                          className="mt-3 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded-lg"
                        >
                          + Book Crew
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === "dood" ? (
          /* Day Out of Days Tab */
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">Day-out-of-days shows each crew member's work days at a glance</p>

            {shootDays.length === 0 || crewMembers.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">📊</span>
                <h3 className="text-xl font-bold text-white mt-4">Not Enough Data</h3>
                <p className="text-slate-400 mt-2">Add shoot days and crew members to see the DOOD</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-slate-800 px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase min-w-[200px]">
                        Crew Member
                      </th>
                      {shootDays.map((day) => (
                        <th
                          key={day.id}
                          className={`px-3 py-2 text-center text-xs font-bold min-w-[60px] ${
                            day.isHold ? "bg-yellow-500/20 text-yellow-400" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          <div>D{day.dayNumber}</div>
                          <div className="text-[10px] font-normal">
                            {new Date(day.date).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase bg-slate-800">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {doodMatrix.map(({ crew, days }) => {
                      const bookedDays = days.filter((d) => d.booking).length;
                      return (
                        <tr key={crew.id} className="hover:bg-slate-800/50">
                          <td className="sticky left-0 bg-slate-900 px-4 py-3">
                            <p className="font-medium text-white">
                              {crew.firstName} {crew.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{crew.role}</p>
                          </td>
                          {days.map((day) => (
                            <td
                              key={day.dayId}
                              className={`px-3 py-3 text-center ${day.isHold ? "bg-yellow-500/10" : ""}`}
                            >
                              {day.booking ? (
                                <span
                                  className={`inline-block w-8 h-8 rounded-full ${
                                    day.booking.status === "CONFIRMED"
                                      ? "bg-green-500"
                                      : day.booking.status === "PENDING"
                                      ? "bg-yellow-500"
                                      : "bg-slate-500"
                                  } text-white text-xs font-bold flex items-center justify-center`}
                                >
                                  W
                                </span>
                              ) : (
                                <button
                                  onClick={() => bookCrewForDay(crew.id, day.dayId)}
                                  className="w-8 h-8 rounded-full border-2 border-dashed border-slate-600 hover:border-cyan-500 transition-colors"
                                />
                              )}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-cyan-400">{bookedDays}</span>
                            <span className="text-slate-500">/{days.length}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">W</span>
                <span className="text-slate-400">Work Day (Confirmed)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-[10px]">W</span>
                <span className="text-slate-400">Pending Confirmation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 border-2 border-dashed border-slate-600 rounded-full"></span>
                <span className="text-slate-400">Available</span>
              </div>
            </div>
          </div>
        ) : (
          /* Labor Costs Tab */
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Labor Cost Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded p-4">
                  <p className="text-sm text-slate-400">Day Rates Total</p>
                  <p className="text-2xl font-black text-white">
                    {formatCurrency(
                      crewMembers.reduce((sum, c) => sum + (c.dayRate || 0) * (c.totalDays || 0), 0)
                    )}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded p-4">
                  <p className="text-sm text-slate-400">Kit Fees Total</p>
                  <p className="text-2xl font-black text-white">
                    {formatCurrency(
                      crewMembers.reduce((sum, c) => sum + (c.kitFee || 0) * (c.totalDays || 0), 0)
                    )}
                  </p>
                </div>
                <div className="bg-teal-500/20 rounded p-4">
                  <p className="text-sm text-teal-400">Total Estimated</p>
                  <p className="text-2xl font-black text-teal-400">{formatCurrency(stats.laborCost)}</p>
                </div>
              </div>
            </div>

            {/* Cost by Department */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Cost by Department</h3>
              <div className="space-y-3">
                {Object.entries(crewByDepartment).map(([deptId, members]) => {
                  const dept = DEPARTMENTS.find((d) => d.id === deptId);
                  const deptCost = members.reduce(
                    (sum, c) => sum + ((c.dayRate || 0) + (c.kitFee || 0)) * (c.totalDays || 0),
                    0
                  );
                  const percentage = (deptCost / stats.laborCost) * 100;

                  return (
                    <div key={deptId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white flex items-center gap-2">
                          {dept?.icon} {dept?.label}
                          <span className="text-slate-500">({members.length} crew)</span>
                        </span>
                        <span className="text-sm font-bold text-white">{formatCurrency(deptCost)}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Crew Modal */}
      {showAddCrewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Crew Member</h3>
                <button onClick={() => setShowAddCrewModal(false)} className="text-slate-400 hover:text-white">
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
                    value={crewForm.firstName}
                    onChange={(e) => setCrewForm({ ...crewForm, firstName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={crewForm.lastName}
                    onChange={(e) => setCrewForm({ ...crewForm, lastName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Email *</label>
                  <input
                    type="email"
                    value={crewForm.email}
                    onChange={(e) => setCrewForm({ ...crewForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={crewForm.phone}
                    onChange={(e) => setCrewForm({ ...crewForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Department *</label>
                  <select
                    value={crewForm.department}
                    onChange={(e) => setCrewForm({ ...crewForm, department: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.icon} {dept.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Role *</label>
                  <input
                    type="text"
                    value={crewForm.role}
                    onChange={(e) => setCrewForm({ ...crewForm, role: e.target.value })}
                    placeholder="e.g., Gaffer, 1st AC"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Union Status</label>
                  <select
                    value={crewForm.unionStatus || "NON_UNION"}
                    onChange={(e) => setCrewForm({ ...crewForm, unionStatus: e.target.value as CrewMember["unionStatus"] })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="NON_UNION">Non-Union</option>
                    <option value="UNION">Union</option>
                    <option value="MUST_JOIN">Must Join</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Rates</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Day Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={crewForm.dayRate}
                        onChange={(e) => setCrewForm({ ...crewForm, dayRate: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Kit Fee</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={crewForm.kitFee}
                        onChange={(e) => setCrewForm({ ...crewForm, kitFee: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">OT Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={crewForm.overtimeRate}
                        onChange={(e) => setCrewForm({ ...crewForm, overtimeRate: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Weekly Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={crewForm.weeklyRate}
                        onChange={(e) => setCrewForm({ ...crewForm, weeklyRate: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={crewForm.startDate}
                    onChange={(e) => setCrewForm({ ...crewForm, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={crewForm.endDate}
                    onChange={(e) => setCrewForm({ ...crewForm, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Notes</label>
                <textarea
                  value={crewForm.notes}
                  onChange={(e) => setCrewForm({ ...crewForm, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddCrewModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCrew}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
              >
                Add Crew Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shoot Day Modal */}
      {showAddShootDayModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Shoot Day</h3>
                <button onClick={() => setShowAddShootDayModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Day Number *</label>
                  <input
                    type="number"
                    value={shootDayForm.dayNumber}
                    onChange={(e) => setShootDayForm({ ...shootDayForm, dayNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Date *</label>
                  <input
                    type="date"
                    value={shootDayForm.date}
                    onChange={(e) => setShootDayForm({ ...shootDayForm, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={shootDayForm.location}
                  onChange={(e) => setShootDayForm({ ...shootDayForm, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Call Time</label>
                  <input
                    type="time"
                    value={shootDayForm.callTime}
                    onChange={(e) => setShootDayForm({ ...shootDayForm, callTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Est. Wrap</label>
                  <input
                    type="time"
                    value={shootDayForm.wrapTime}
                    onChange={(e) => setShootDayForm({ ...shootDayForm, wrapTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Scenes (comma-separated)</label>
                <input
                  type="text"
                  value={shootDayForm.scenes}
                  onChange={(e) => setShootDayForm({ ...shootDayForm, scenes: e.target.value })}
                  placeholder="e.g., 1, 2, 5A"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shootDayForm.isHold}
                  onChange={(e) => setShootDayForm({ ...shootDayForm, isHold: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 text-yellow-500"
                />
                <span className="text-sm text-slate-300">Hold Day (not confirmed)</span>
              </label>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddShootDayModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddShootDay}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
              >
                Add Shoot Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Crew Modal */}
      {showBookCrewModal && selectedShootDay && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Book Crew</h3>
                  <p className="text-sm text-slate-400">Day {selectedShootDay.dayNumber} - {new Date(selectedShootDay.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setShowBookCrewModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-400 mb-4">Select crew members to book for this day:</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {crewMembers.map((crew) => {
                  const isBooked = bookings.some(
                    (b) => b.crewMemberId === crew.id && b.shootDayId === selectedShootDay.id
                  );
                  const dept = DEPARTMENTS.find((d) => d.id === crew.department);

                  return (
                    <div
                      key={crew.id}
                      className={`p-3 rounded-lg border ${
                        isBooked ? "bg-green-500/20 border-green-500/30" : "bg-slate-700 border-slate-600"
                      } flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{dept?.icon}</span>
                        <div>
                          <p className="font-medium text-white">
                            {crew.firstName} {crew.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{crew.role}</p>
                        </div>
                      </div>
                      {isBooked ? (
                        <span className="text-green-400 text-sm font-medium">✓ Booked</span>
                      ) : (
                        <button
                          onClick={() => bookCrewForDay(crew.id, selectedShootDay.id)}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded"
                        >
                          Book
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-slate-700">
              <button
                onClick={() => setShowBookCrewModal(false)}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
