"use client";

import { useState, useEffect, useMemo } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * EQUIPMENT OS MODULE (Section 4 - Pre-Production Logistics)
 *
 * Purpose: Track all production equipment with check-in/check-out workflow
 *
 * Features:
 * - Equipment inventory management (owned + rented)
 * - Check-out/check-in tracking
 * - Equipment kits (pre-configured packages)
 * - Condition tracking and maintenance alerts
 * - Rental cost tracking with daily rates
 * - Availability calendar view
 */

type EquipmentCategory =
  | "CAMERA"
  | "LENS"
  | "LIGHTING"
  | "AUDIO"
  | "GRIP"
  | "ELECTRIC"
  | "MONITORS"
  | "STORAGE"
  | "DRONES"
  | "STABILIZERS"
  | "ACCESSORIES"
  | "VEHICLES"
  | "OTHER";

type EquipmentStatus =
  | "AVAILABLE"
  | "CHECKED_OUT"
  | "IN_MAINTENANCE"
  | "DAMAGED"
  | "LOST"
  | "RETIRED";

type EquipmentCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

interface Equipment {
  id: string;
  name: string;
  description?: string | null;
  category?: EquipmentCategory | null;
  subcategory?: string | null;
  serialNumber?: string | null;
  assetTag?: string | null;
  status?: EquipmentStatus | null;
  condition?: EquipmentCondition | null;
  manufacturer?: string | null;
  model?: string | null;
  storageLocation?: string | null;
  replacementValue?: number | null;
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
  imageKey?: string | null;
  createdAt?: string | null;
}

interface EquipmentCheckoutRecord {
  id: string;
  equipmentId: string;
  projectId?: string | null;
  checkedOutBy: string;
  checkedOutByName?: string | null;
  checkoutDate: string;
  expectedReturnDate?: string | null;
  actualReturnDate?: string | null;
  status?: "CHECKED_OUT" | "RETURNED" | "OVERDUE" | "LOST" | null;
  purpose?: string | null;
  conditionAtCheckout?: string | null;
}

interface EquipmentRental {
  id: string;
  projectId: string;
  equipmentName: string;
  equipmentCategory?: string | null;
  quantity?: number | null;
  vendorName: string;
  vendorPhone?: string | null;
  vendorEmail?: string | null;
  rentalStartDate: string;
  rentalEndDate: string;
  rentalDays?: number | null;
  dailyRate: number;
  weeklyRate?: number | null;
  subtotal?: number | null;
  totalCost: number;
  depositAmount?: number | null;
  status?: string | null;
  paymentStatus?: string | null;
  notes?: string | null;
  createdAt?: string | null;
}

interface EquipmentOSProps {
  projectId?: string;
  organizationId?: string;
  currentUserEmail: string;
  currentUserName?: string;
}

const CATEGORY_CONFIG: Record<EquipmentCategory, { icon: string; label: string; color: string }> = {
  CAMERA: { icon: "📹", label: "Cameras", color: "bg-red-500" },
  LENS: { icon: "🔍", label: "Lenses", color: "bg-orange-500" },
  LIGHTING: { icon: "💡", label: "Lighting", color: "bg-yellow-500" },
  AUDIO: { icon: "🎤", label: "Audio", color: "bg-green-500" },
  GRIP: { icon: "🔧", label: "Grip", color: "bg-teal-500" },
  ELECTRIC: { icon: "⚡", label: "Electric", color: "bg-blue-500" },
  MONITORS: { icon: "🖥️", label: "Monitors", color: "bg-indigo-500" },
  STORAGE: { icon: "💾", label: "Storage", color: "bg-purple-500" },
  DRONES: { icon: "🚁", label: "Drones", color: "bg-pink-500" },
  STABILIZERS: { icon: "🎯", label: "Stabilizers", color: "bg-rose-500" },
  ACCESSORIES: { icon: "🎒", label: "Accessories", color: "bg-slate-500" },
  VEHICLES: { icon: "🚐", label: "Vehicles", color: "bg-amber-500" },
  OTHER: { icon: "📦", label: "Other", color: "bg-gray-500" },
};

const STATUS_CONFIG: Record<EquipmentStatus, { label: string; color: string; bgColor: string }> = {
  AVAILABLE: { label: "Available", color: "text-green-400", bgColor: "bg-green-500" },
  CHECKED_OUT: { label: "Checked Out", color: "text-yellow-400", bgColor: "bg-yellow-500" },
  IN_MAINTENANCE: { label: "In Maintenance", color: "text-blue-400", bgColor: "bg-blue-500" },
  DAMAGED: { label: "Damaged", color: "text-red-400", bgColor: "bg-red-500" },
  LOST: { label: "Lost", color: "text-gray-400", bgColor: "bg-gray-500" },
  RETIRED: { label: "Retired", color: "text-slate-400", bgColor: "bg-slate-500" },
};

const CONDITION_CONFIG: Record<EquipmentCondition, { label: string; color: string }> = {
  EXCELLENT: { label: "Excellent", color: "text-green-400" },
  GOOD: { label: "Good", color: "text-teal-400" },
  FAIR: { label: "Fair", color: "text-yellow-400" },
  POOR: { label: "Poor", color: "text-orange-400" },
};

export default function EquipmentOS({
  projectId,
  organizationId,
  currentUserEmail,
  currentUserName,
}: EquipmentOSProps) {
  const orgId = organizationId || 'default-org';
  const [client] = useState(() => generateClient<Schema>());
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [checkouts, setCheckouts] = useState<EquipmentCheckoutRecord[]>([]);
  const [rentals, setRentals] = useState<EquipmentRental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<"inventory" | "checkouts" | "rentals" | "kits">("inventory");
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<EquipmentStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<Equipment | null>(null);
  const [showCheckinModal, setShowCheckinModal] = useState<Equipment | null>(null);
  const [showRentalModal, setShowRentalModal] = useState(false);

  // Form State
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    description: "",
    category: "CAMERA" as EquipmentCategory,
    subcategory: "",
    serialNumber: "",
    assetTag: "",
    manufacturer: "",
    model: "",
    storageLocation: "",
    replacementValue: "",
    condition: "GOOD" as EquipmentCondition,
  });

  const [checkoutForm, setCheckoutForm] = useState({
    expectedReturnDate: "",
    purpose: "",
    conditionAtCheckout: "GOOD" as EquipmentCondition,
  });

  const [checkinForm, setCheckinForm] = useState({
    conditionAtReturn: "GOOD" as EquipmentCondition,
    conditionNotes: "",
    damageReported: false,
    damageDescription: "",
  });

  const [rentalForm, setRentalForm] = useState({
    equipmentName: "",
    equipmentCategory: "CAMERA" as EquipmentCategory,
    quantity: "1",
    vendorName: "",
    vendorPhone: "",
    vendorEmail: "",
    rentalStartDate: "",
    rentalEndDate: "",
    dailyRate: "",
    weeklyRate: "",
    depositAmount: "0",
    notes: "",
  });

  // Load equipment data
  useEffect(() => {
    setIsLoading(true);

    // Check if Equipment model exists
    if (!client.models.Equipment) {
      console.log("Equipment model not yet available - waiting for schema deployment");
      setIsLoading(false);
      return;
    }

    const equipmentSub = client.models.Equipment.observeQuery().subscribe({
      next: (data) => {
        if (data?.items) {
          setEquipment(data.items as unknown as Equipment[]);
        }
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Error loading equipment:", error);
        setIsLoading(false);
      },
    });

    const checkoutSub = client.models.EquipmentCheckout.observeQuery({
      filter: { status: { eq: "CHECKED_OUT" } },
    }).subscribe({
      next: (data) => {
        if (data?.items) {
          setCheckouts(data.items as unknown as EquipmentCheckoutRecord[]);
        }
      },
      error: (error) => console.error("Error loading checkouts:", error),
    });

    // Load equipment rentals for this project
    let rentalSub: { unsubscribe: () => void } | null = null;
    if (projectId && client.models.EquipmentRental) {
      rentalSub = client.models.EquipmentRental.observeQuery({
        filter: { projectId: { eq: projectId } },
      }).subscribe({
        next: (data) => {
          if (data?.items) {
            setRentals(data.items as unknown as EquipmentRental[]);
          }
        },
        error: (error) => console.error("Error loading rentals:", error),
      });
    }

    return () => {
      equipmentSub.unsubscribe();
      checkoutSub.unsubscribe();
      rentalSub?.unsubscribe();
    };
  }, [client, projectId]);

  // Filter equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assetTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [equipment, selectedCategory, selectedStatus, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = equipment.length;
    const available = equipment.filter((e) => e?.status === "AVAILABLE").length;
    const checkedOut = equipment.filter((e) => e?.status === "CHECKED_OUT").length;
    const maintenance = equipment.filter((e) => e?.status === "IN_MAINTENANCE").length;
    const damaged = equipment.filter((e) => e?.status === "DAMAGED" || e?.status === "LOST").length;
    const totalValue = equipment.reduce((sum, e) => sum + (e.replacementValue || 0), 0);

    // Overdue checkouts
    const now = new Date();
    const overdue = checkouts.filter((c) => {
      if (!c.expectedReturnDate) return false;
      return new Date(c.expectedReturnDate) < now && c.status === "CHECKED_OUT";
    }).length;

    // Upcoming maintenance
    const upcomingMaintenance = equipment.filter((e) => {
      if (!e.nextMaintenanceDate) return false;
      const daysUntil = Math.ceil(
        (new Date(e.nextMaintenanceDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil <= 30 && daysUntil > 0;
    }).length;

    // Rental stats
    const activeRentals = rentals.filter((r) => {
      const endDate = new Date(r.rentalEndDate);
      return endDate >= now && r.status !== "CANCELLED" && r.status !== "RETURNED";
    }).length;
    const totalRentalCost = rentals.reduce((sum, r) => sum + (r.totalCost || 0), 0);

    return { total, available, checkedOut, maintenance, damaged, totalValue, overdue, upcomingMaintenance, activeRentals, totalRentalCost };
  }, [equipment, checkouts, rentals]);

  // Get checkout record for equipment
  const getCheckoutRecord = (equipmentId: string) => {
    return checkouts.find((c) => c.equipmentId === equipmentId && c.status === "CHECKED_OUT");
  };

  // Add new equipment
  const handleAddEquipment = async () => {
    if (!newEquipment.name.trim()) return;

    try {
      await client.models.Equipment.create({
        organizationId: orgId,
        name: newEquipment.name,
        description: newEquipment.description || undefined,
        category: newEquipment.category,
        subcategory: newEquipment.subcategory || undefined,
        serialNumber: newEquipment.serialNumber || undefined,
        assetTag: newEquipment.assetTag || undefined,
        manufacturer: newEquipment.manufacturer || undefined,
        model: newEquipment.model || undefined,
        storageLocation: newEquipment.storageLocation || undefined,
        replacementValue: newEquipment.replacementValue ? parseFloat(newEquipment.replacementValue) : undefined,
        condition: newEquipment.condition,
        status: "AVAILABLE",
        ownershipType: "OWNED",
      });

      setShowAddForm(false);
      setNewEquipment({
        name: "",
        description: "",
        category: "CAMERA",
        subcategory: "",
        serialNumber: "",
        assetTag: "",
        manufacturer: "",
        model: "",
        storageLocation: "",
        replacementValue: "",
        condition: "GOOD",
      });
    } catch (error) {
      console.error("Error adding equipment:", error);
      alert("Failed to add equipment. Please try again.");
    }
  };

  // Check out equipment
  const handleCheckout = async () => {
    if (!showCheckoutModal) return;

    try {
      // Create checkout record
      await client.models.EquipmentCheckout.create({
        organizationId: orgId,
        equipmentId: showCheckoutModal.id,
        projectId: projectId || undefined,
        checkedOutBy: currentUserEmail,
        checkedOutByName: currentUserName || currentUserEmail.split("@")[0],
        checkoutDate: new Date().toISOString(),
        expectedReturnDate: checkoutForm.expectedReturnDate
          ? new Date(checkoutForm.expectedReturnDate).toISOString()
          : undefined,
        status: "CHECKED_OUT",
        purpose: checkoutForm.purpose || undefined,
        conditionAtCheckout: checkoutForm.conditionAtCheckout,
      });

      // Update equipment status
      await client.models.Equipment.update({
        id: showCheckoutModal.id,
        status: "CHECKED_OUT",
      });

      setShowCheckoutModal(null);
      setCheckoutForm({
        expectedReturnDate: "",
        purpose: "",
        conditionAtCheckout: "GOOD",
      });
    } catch (error) {
      console.error("Error checking out equipment:", error);
      alert("Failed to check out equipment. Please try again.");
    }
  };

  // Check in equipment
  const handleCheckin = async () => {
    if (!showCheckinModal) return;

    const checkoutRecord = getCheckoutRecord(showCheckinModal.id);
    if (!checkoutRecord) return;

    try {
      // Update checkout record
      await client.models.EquipmentCheckout.update({
        id: checkoutRecord.id,
        status: "RETURNED",
        actualReturnDate: new Date().toISOString(),
        conditionAtReturn: checkinForm.conditionAtReturn,
        conditionNotes: checkinForm.conditionNotes || undefined,
        damageReported: checkinForm.damageReported,
        damageDescription: checkinForm.damageReported ? checkinForm.damageDescription : undefined,
        returnedBy: currentUserEmail,
      });

      // Update equipment status and condition
      await client.models.Equipment.update({
        id: showCheckinModal.id,
        status: checkinForm.damageReported ? "DAMAGED" : "AVAILABLE",
        condition: checkinForm.conditionAtReturn as EquipmentCondition,
      });

      setShowCheckinModal(null);
      setCheckinForm({
        conditionAtReturn: "GOOD",
        conditionNotes: "",
        damageReported: false,
        damageDescription: "",
      });
    } catch (error) {
      console.error("Error checking in equipment:", error);
      alert("Failed to check in equipment. Please try again.");
    }
  };

  // Add equipment rental
  const handleAddRental = async () => {
    if (!rentalForm.equipmentName || !rentalForm.vendorName || !rentalForm.dailyRate || !projectId) {
      alert("Please fill in all required fields");
      return;
    }

    if (!client.models.EquipmentRental) {
      alert("Schema not deployed yet. Run: npx ampx sandbox --once");
      return;
    }

    try {
      const dailyRate = parseFloat(rentalForm.dailyRate) || 0;
      const quantity = parseInt(rentalForm.quantity) || 1;
      const start = new Date(rentalForm.rentalStartDate);
      const end = new Date(rentalForm.rentalEndDate);
      const rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const subtotal = dailyRate * rentalDays * quantity;
      const weeklyRate = rentalForm.weeklyRate ? parseFloat(rentalForm.weeklyRate) : undefined;
      const depositAmount = parseFloat(rentalForm.depositAmount) || 0;

      await client.models.EquipmentRental.create({
        organizationId: orgId,
        projectId,
        equipmentName: rentalForm.equipmentName,
        equipmentCategory: rentalForm.equipmentCategory,
        quantity,
        vendorName: rentalForm.vendorName,
        vendorPhone: rentalForm.vendorPhone || undefined,
        vendorEmail: rentalForm.vendorEmail || undefined,
        rentalStartDate: rentalForm.rentalStartDate,
        rentalEndDate: rentalForm.rentalEndDate,
        rentalDays,
        dailyRate,
        weeklyRate,
        depositAmount,
        subtotal,
        totalCost: subtotal,
        status: "CONFIRMED",
        paymentStatus: "PENDING",
        notes: rentalForm.notes || undefined,
        createdBy: currentUserEmail,
        createdByEmail: currentUserEmail,
      });

      setShowRentalModal(false);
      setRentalForm({
        equipmentName: "",
        equipmentCategory: "CAMERA",
        quantity: "1",
        vendorName: "",
        vendorPhone: "",
        vendorEmail: "",
        rentalStartDate: "",
        rentalEndDate: "",
        dailyRate: "",
        weeklyRate: "",
        depositAmount: "0",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding rental:", error);
      alert("Failed to add rental. Check console for details.");
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎬</span>
            <div>
              <h2 className="text-xl font-black text-white">Equipment OS</h2>
              <p className="text-amber-200 text-sm">Production equipment management</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-white text-amber-600 font-bold rounded-lg hover:bg-amber-50 transition-colors"
          >
            + Add Equipment
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 p-4 bg-slate-800 border-b border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <div className="text-xs text-slate-400">Total Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-green-400">{stats.available}</div>
          <div className="text-xs text-slate-400">Available</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-yellow-400">{stats.checkedOut}</div>
          <div className="text-xs text-slate-400">Checked Out</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-blue-400">{stats.maintenance}</div>
          <div className="text-xs text-slate-400">Maintenance</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-red-400">{stats.damaged}</div>
          <div className="text-xs text-slate-400">Damaged/Lost</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-orange-400">{stats.overdue}</div>
          <div className="text-xs text-slate-400">Overdue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-purple-400">{stats.upcomingMaintenance}</div>
          <div className="text-xs text-slate-400">Maint. Due</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-teal-400">{formatCurrency(stats.totalValue)}</div>
          <div className="text-xs text-slate-400">Total Value</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        {[
          { id: "inventory", label: "Inventory", icon: "📦" },
          { id: "checkouts", label: "Active Checkouts", icon: "📋", badge: stats.checkedOut },
          { id: "rentals", label: "Rentals", icon: "💰", badge: stats.activeRentals },
          { id: "kits", label: "Equipment Kits", icon: "🎒" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters (Inventory Tab) */}
      {activeTab === "inventory" && (
        <div className="p-4 bg-slate-800/50 border-b border-slate-700">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by name, serial, asset tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as EquipmentCategory | "ALL")}
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as EquipmentStatus | "ALL")}
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">🎬</div>
            <p className="text-slate-400">Loading equipment...</p>
          </div>
        ) : activeTab === "inventory" ? (
          /* Inventory Grid */
          filteredEquipment.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.map((item) => {
                const categoryConfig = CATEGORY_CONFIG[item.category || "OTHER"];
                const statusConfig = STATUS_CONFIG[item.status || "AVAILABLE"];
                const conditionConfig = CONDITION_CONFIG[item.condition || "GOOD"];
                const checkoutRecord = getCheckoutRecord(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-amber-500/50 transition-colors"
                  >
                    {/* Header */}
                    <div className={`px-4 py-2 ${categoryConfig.color} flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{categoryConfig.icon}</span>
                        <span className="text-white font-bold text-sm">{categoryConfig.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusConfig.bgColor} text-white`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                      {item.manufacturer && item.model && (
                        <p className="text-sm text-slate-400 mb-2">
                          {item.manufacturer} {item.model}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        {item.serialNumber && (
                          <div>
                            <span className="text-slate-500">S/N:</span>
                            <span className="text-slate-300 ml-1">{item.serialNumber}</span>
                          </div>
                        )}
                        {item.assetTag && (
                          <div>
                            <span className="text-slate-500">Tag:</span>
                            <span className="text-slate-300 ml-1">{item.assetTag}</span>
                          </div>
                        )}
                        {item.storageLocation && (
                          <div className="col-span-2">
                            <span className="text-slate-500">Location:</span>
                            <span className="text-slate-300 ml-1">{item.storageLocation}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm ${conditionConfig.color}`}>
                          Condition: {conditionConfig.label}
                        </span>
                        {item.replacementValue && (
                          <span className="text-sm text-slate-400">
                            {formatCurrency(item.replacementValue)}
                          </span>
                        )}
                      </div>

                      {/* Checkout info */}
                      {checkoutRecord && (
                        <div className="bg-slate-700/50 rounded p-2 mb-3 text-xs">
                          <div className="text-yellow-400 font-bold mb-1">Checked out to:</div>
                          <div className="text-white">{checkoutRecord.checkedOutByName}</div>
                          {checkoutRecord.expectedReturnDate && (
                            <div className="text-slate-400">
                              Due: {formatDate(checkoutRecord.expectedReturnDate)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {item.status === "AVAILABLE" ? (
                          <button
                            onClick={() => setShowCheckoutModal(item)}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                          >
                            Check Out
                          </button>
                        ) : item.status === "CHECKED_OUT" ? (
                          <button
                            onClick={() => setShowCheckinModal(item)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                          >
                            Check In
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-slate-700 text-slate-400 font-bold py-2 px-4 rounded-lg text-sm cursor-not-allowed"
                          >
                            {statusConfig.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📦</span>
              <h3 className="text-xl font-bold text-white mb-2">No Equipment Found</h3>
              <p className="text-slate-400 mb-4">
                {searchQuery || selectedCategory !== "ALL" || selectedStatus !== "ALL"
                  ? "No equipment matches your filters"
                  : "Add your first piece of equipment to get started"}
              </p>
              {!searchQuery && selectedCategory === "ALL" && selectedStatus === "ALL" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
                >
                  + Add Equipment
                </button>
              )}
            </div>
          )
        ) : activeTab === "checkouts" ? (
          /* Active Checkouts */
          checkouts.length > 0 ? (
            <div className="space-y-4">
              {checkouts.map((checkout) => {
                const item = equipment.find((e) => e.id === checkout.equipmentId);
                if (!item) return null;

                const categoryConfig = CATEGORY_CONFIG[item.category || "OTHER"];
                const isOverdue =
                  checkout.expectedReturnDate &&
                  new Date(checkout.expectedReturnDate) < new Date();

                return (
                  <div
                    key={checkout.id}
                    className={`bg-slate-800 rounded-lg border ${
                      isOverdue ? "border-red-500" : "border-slate-700"
                    } p-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{categoryConfig.icon}</span>
                        <div>
                          <h4 className="text-lg font-bold text-white">{item.name}</h4>
                          {item.manufacturer && item.model && (
                            <p className="text-sm text-slate-400">
                              {item.manufacturer} {item.model}
                            </p>
                          )}
                          <div className="mt-2 text-sm">
                            <span className="text-slate-500">Checked out by: </span>
                            <span className="text-white">{checkout.checkedOutByName}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-slate-500">Since: </span>
                            <span className="text-white">{formatDate(checkout.checkoutDate)}</span>
                          </div>
                          {checkout.purpose && (
                            <div className="text-sm">
                              <span className="text-slate-500">Purpose: </span>
                              <span className="text-white">{checkout.purpose}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {checkout.expectedReturnDate && (
                          <div className={`text-sm ${isOverdue ? "text-red-400" : "text-slate-400"}`}>
                            {isOverdue ? "OVERDUE - " : "Due: "}
                            {formatDate(checkout.expectedReturnDate)}
                          </div>
                        )}
                        <button
                          onClick={() => setShowCheckinModal(item)}
                          className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition-colors"
                        >
                          Check In
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">✅</span>
              <h3 className="text-xl font-bold text-white mb-2">All Equipment Available</h3>
              <p className="text-slate-400">No equipment is currently checked out</p>
            </div>
          )
        ) : activeTab === "rentals" ? (
          /* Equipment Rentals Tab */
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Equipment Rentals</h3>
                <p className="text-sm text-slate-400">Track hired/rented equipment with daily rates</p>
              </div>
              <button
                onClick={() => setShowRentalModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
              >
                + Add Rental
              </button>
            </div>

            {/* Rental Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Active Rentals</span>
                  <span className="text-xl">📦</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.activeRentals}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Total Rental Cost</span>
                  <span className="text-xl">💰</span>
                </div>
                <p className="text-2xl font-bold text-teal-400">{formatCurrency(stats.totalRentalCost)}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Total Items</span>
                  <span className="text-xl">📋</span>
                </div>
                <p className="text-2xl font-bold text-white">{rentals.length}</p>
              </div>
            </div>

            {rentals.length > 0 ? (
              <div className="space-y-4">
                {rentals.map((rental) => {
                  const categoryConfig = CATEGORY_CONFIG[(rental.equipmentCategory as EquipmentCategory) || "OTHER"];
                  const isActive = new Date(rental.rentalEndDate) >= new Date() && rental.status !== "CANCELLED" && rental.status !== "RETURNED";
                  const daysRemaining = Math.ceil((new Date(rental.rentalEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={rental.id}
                      className={`bg-slate-800 rounded-lg border ${isActive ? "border-amber-500/50" : "border-slate-700"} overflow-hidden`}
                    >
                      <div className={`px-4 py-2 ${categoryConfig?.color || "bg-slate-600"} flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{categoryConfig?.icon || "📦"}</span>
                          <span className="text-white font-bold text-sm">{categoryConfig?.label || "Equipment"}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          rental.status === "RETURNED" ? "bg-green-500 text-white" :
                          rental.status === "CANCELLED" ? "bg-red-500 text-white" :
                          isActive ? "bg-amber-500 text-black" : "bg-slate-500 text-white"
                        }`}>
                          {rental.status || "CONFIRMED"}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              {rental.equipmentName}
                              {(rental.quantity || 1) > 1 && (
                                <span className="text-amber-400 ml-2">×{rental.quantity}</span>
                              )}
                            </h4>
                            <p className="text-sm text-slate-400 mt-1">
                              From: <span className="text-white">{rental.vendorName}</span>
                            </p>
                            {rental.vendorPhone && (
                              <p className="text-xs text-slate-500">{rental.vendorPhone}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-teal-400">{formatCurrency(rental.totalCost)}</p>
                            <p className="text-xs text-slate-500">
                              {formatCurrency(rental.dailyRate)}/day × {rental.rentalDays} days
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Start Date</p>
                            <p className="text-white font-medium">{formatDate(rental.rentalStartDate)}</p>
                          </div>
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">End Date</p>
                            <p className="text-white font-medium">{formatDate(rental.rentalEndDate)}</p>
                          </div>
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Daily Rate</p>
                            <p className="text-amber-400 font-medium">{formatCurrency(rental.dailyRate)}</p>
                          </div>
                          <div className="bg-slate-700/50 rounded p-2">
                            <p className="text-xs text-slate-500">Status</p>
                            <p className={`font-medium ${
                              isActive && daysRemaining <= 2 ? "text-red-400" :
                              isActive ? "text-green-400" : "text-slate-400"
                            }`}>
                              {isActive ? (daysRemaining > 0 ? `${daysRemaining} days left` : "Due today") : "Completed"}
                            </p>
                          </div>
                        </div>

                        {rental.depositAmount && rental.depositAmount > 0 && (
                          <div className="mt-3 text-xs text-slate-500">
                            Deposit: {formatCurrency(rental.depositAmount)}
                          </div>
                        )}

                        {rental.notes && (
                          <div className="mt-3 text-sm text-slate-400 bg-slate-700/30 rounded p-2">
                            {rental.notes}
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            rental.paymentStatus === "PAID" ? "bg-green-500/20 text-green-400" :
                            rental.paymentStatus === "PARTIALLY_PAID" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-slate-500/20 text-slate-400"
                          }`}>
                            {rental.paymentStatus || "PENDING"}
                          </span>
                          {rental.vendorEmail && (
                            <a
                              href={`mailto:${rental.vendorEmail}`}
                              className="text-xs text-amber-400 hover:text-amber-300"
                            >
                              Contact Vendor
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📦</span>
                <h3 className="text-xl font-bold text-white mb-2">No Equipment Rentals</h3>
                <p className="text-slate-400 mb-4">
                  Track hired equipment with daily rates and rental periods
                </p>
                <button
                  onClick={() => setShowRentalModal(true)}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
                >
                  + Add First Rental
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Equipment Kits */
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🎒</span>
            <h3 className="text-xl font-bold text-white mb-2">Equipment Kits</h3>
            <p className="text-slate-400 mb-4">
              Pre-configured equipment packages for quick checkout
            </p>
            <p className="text-slate-500 text-sm">Coming soon...</p>
          </div>
        )}
      </div>

      {/* Add Equipment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add New Equipment</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-400 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                    placeholder="e.g., Canon C300 Mark III"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={newEquipment.category}
                    onChange={(e) =>
                      setNewEquipment({ ...newEquipment, category: e.target.value as EquipmentCategory })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={newEquipment.subcategory}
                    onChange={(e) => setNewEquipment({ ...newEquipment, subcategory: e.target.value })}
                    placeholder="e.g., Cinema Camera"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={newEquipment.manufacturer}
                    onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
                    placeholder="e.g., Canon"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Model</label>
                  <input
                    type="text"
                    value={newEquipment.model}
                    onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                    placeholder="e.g., C300 Mark III"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={newEquipment.serialNumber}
                    onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                    placeholder="e.g., SN123456789"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Asset Tag</label>
                  <input
                    type="text"
                    value={newEquipment.assetTag}
                    onChange={(e) => setNewEquipment({ ...newEquipment, assetTag: e.target.value })}
                    placeholder="e.g., CAM-001"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={newEquipment.storageLocation}
                    onChange={(e) => setNewEquipment({ ...newEquipment, storageLocation: e.target.value })}
                    placeholder="e.g., Warehouse A, Shelf 3"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Replacement Value ($)</label>
                  <input
                    type="number"
                    value={newEquipment.replacementValue}
                    onChange={(e) => setNewEquipment({ ...newEquipment, replacementValue: e.target.value })}
                    placeholder="e.g., 15000"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Condition</label>
                  <select
                    value={newEquipment.condition}
                    onChange={(e) =>
                      setNewEquipment({ ...newEquipment, condition: e.target.value as EquipmentCondition })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(CONDITION_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-400 mb-1">Description</label>
                  <textarea
                    value={newEquipment.description}
                    onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                    placeholder="Additional notes about this equipment..."
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEquipment}
                disabled={!newEquipment.name.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Equipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Check Out Equipment</h3>
                <button
                  onClick={() => setShowCheckoutModal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-bold text-white">{showCheckoutModal.name}</h4>
                {showCheckoutModal.manufacturer && showCheckoutModal.model && (
                  <p className="text-sm text-slate-400">
                    {showCheckoutModal.manufacturer} {showCheckoutModal.model}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  value={checkoutForm.expectedReturnDate}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, expectedReturnDate: e.target.value })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Purpose</label>
                <input
                  type="text"
                  value={checkoutForm.purpose}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, purpose: e.target.value })}
                  placeholder="e.g., Principal Photography, B-Roll"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">
                  Condition at Checkout
                </label>
                <select
                  value={checkoutForm.conditionAtCheckout}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      conditionAtCheckout: e.target.value as EquipmentCondition,
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  {Object.entries(CONDITION_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3 text-sm">
                <p className="text-slate-400">
                  Checking out as: <span className="text-white font-bold">{currentUserEmail}</span>
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCheckoutModal(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
              >
                Confirm Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Check In Equipment</h3>
                <button
                  onClick={() => setShowCheckinModal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-bold text-white">{showCheckinModal.name}</h4>
                {showCheckinModal.manufacturer && showCheckinModal.model && (
                  <p className="text-sm text-slate-400">
                    {showCheckinModal.manufacturer} {showCheckinModal.model}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">
                  Condition at Return
                </label>
                <select
                  value={checkinForm.conditionAtReturn}
                  onChange={(e) =>
                    setCheckinForm({
                      ...checkinForm,
                      conditionAtReturn: e.target.value as EquipmentCondition,
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  {Object.entries(CONDITION_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                  <option value="DAMAGED">Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">
                  Condition Notes (Optional)
                </label>
                <textarea
                  value={checkinForm.conditionNotes}
                  onChange={(e) => setCheckinForm({ ...checkinForm, conditionNotes: e.target.value })}
                  placeholder="Any notes about the equipment condition..."
                  rows={2}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="damageReported"
                  checked={checkinForm.damageReported}
                  onChange={(e) =>
                    setCheckinForm({ ...checkinForm, damageReported: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-red-500"
                />
                <label htmlFor="damageReported" className="text-white font-medium">
                  Report Damage
                </label>
              </div>

              {checkinForm.damageReported && (
                <div>
                  <label className="block text-sm font-bold text-red-400 mb-1">
                    Damage Description *
                  </label>
                  <textarea
                    value={checkinForm.damageDescription}
                    onChange={(e) =>
                      setCheckinForm({ ...checkinForm, damageDescription: e.target.value })
                    }
                    placeholder="Describe the damage in detail..."
                    rows={3}
                    className="w-full bg-slate-700 border border-red-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCheckinModal(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckin}
                disabled={checkinForm.damageReported && !checkinForm.damageDescription.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Check-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Rental Modal */}
      {showRentalModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Add Equipment Rental</h3>
                  <p className="text-sm text-slate-400 mt-1">Track hired equipment with daily rates</p>
                </div>
                <button
                  onClick={() => setShowRentalModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-400 mb-1">
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    value={rentalForm.equipmentName}
                    onChange={(e) => setRentalForm({ ...rentalForm, equipmentName: e.target.value })}
                    placeholder="e.g., ARRI Alexa Mini LF"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={rentalForm.equipmentCategory}
                    onChange={(e) =>
                      setRentalForm({ ...rentalForm, equipmentCategory: e.target.value as EquipmentCategory })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={rentalForm.quantity}
                    onChange={(e) => setRentalForm({ ...rentalForm, quantity: e.target.value })}
                    min="1"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Vendor Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-400 mb-1">Vendor Name *</label>
                    <input
                      type="text"
                      value={rentalForm.vendorName}
                      onChange={(e) => setRentalForm({ ...rentalForm, vendorName: e.target.value })}
                      placeholder="e.g., Panavision, Keslow Camera"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Vendor Phone</label>
                    <input
                      type="tel"
                      value={rentalForm.vendorPhone}
                      onChange={(e) => setRentalForm({ ...rentalForm, vendorPhone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Vendor Email</label>
                    <input
                      type="email"
                      value={rentalForm.vendorEmail}
                      onChange={(e) => setRentalForm({ ...rentalForm, vendorEmail: e.target.value })}
                      placeholder="rentals@vendor.com"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Rental Period</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={rentalForm.rentalStartDate}
                      onChange={(e) => setRentalForm({ ...rentalForm, rentalStartDate: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">End Date *</label>
                    <input
                      type="date"
                      value={rentalForm.rentalEndDate}
                      onChange={(e) => setRentalForm({ ...rentalForm, rentalEndDate: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Pricing</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Daily Rate *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={rentalForm.dailyRate}
                        onChange={(e) => setRentalForm({ ...rentalForm, dailyRate: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Weekly Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={rentalForm.weeklyRate}
                        onChange={(e) => setRentalForm({ ...rentalForm, weeklyRate: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Deposit</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={rentalForm.depositAmount}
                        onChange={(e) => setRentalForm({ ...rentalForm, depositAmount: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Preview */}
              {rentalForm.rentalStartDate && rentalForm.rentalEndDate && rentalForm.dailyRate && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-sm font-bold text-amber-400 mb-2">Cost Preview</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rental Days:</span>
                      <span className="text-white">
                        {Math.ceil(
                          (new Date(rentalForm.rentalEndDate).getTime() -
                            new Date(rentalForm.rentalStartDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Daily Rate × Qty:</span>
                      <span className="text-white">
                        ${parseFloat(rentalForm.dailyRate || "0").toLocaleString()} × {rentalForm.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-amber-500/30">
                      <span className="text-white font-medium">Total Cost:</span>
                      <span className="text-amber-400 font-bold text-lg">
                        ${(
                          (parseFloat(rentalForm.dailyRate) || 0) *
                          (parseInt(rentalForm.quantity) || 1) *
                          (Math.ceil(
                            (new Date(rentalForm.rentalEndDate).getTime() -
                              new Date(rentalForm.rentalStartDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Notes</label>
                <textarea
                  value={rentalForm.notes}
                  onChange={(e) => setRentalForm({ ...rentalForm, notes: e.target.value })}
                  placeholder="Additional notes about this rental..."
                  rows={2}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowRentalModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRental}
                disabled={
                  !rentalForm.equipmentName ||
                  !rentalForm.vendorName ||
                  !rentalForm.rentalStartDate ||
                  !rentalForm.rentalEndDate ||
                  !rentalForm.dailyRate
                }
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Rental
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
