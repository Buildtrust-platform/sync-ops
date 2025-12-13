"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useToast } from "./Toast";

/**
 * BUDGET TRACKER COMPONENT - Enhanced with Granular Expense Tracking
 *
 * Comprehensive budget management with:
 * - Budget allocation by phase and category
 * - Daily cost tracking per shoot day
 * - Crew costs with rates and overtime
 * - Equipment rentals (owned + hired)
 * - Location costs
 * - Individual expense tracking
 * - Real-time variance analysis
 */

interface BudgetTrackerProps {
  project: Schema["Project"]["type"];
}

// Category configuration
const EXPENSE_CATEGORIES = {
  CREW: { label: "Crew", icon: "👥", color: "blue" },
  EQUIPMENT_OWNED: { label: "Equipment (Owned)", icon: "🎬", color: "green" },
  EQUIPMENT_RENTAL: { label: "Equipment (Rental)", icon: "📦", color: "teal" },
  LOCATION: { label: "Location", icon: "📍", color: "purple" },
  TALENT: { label: "Talent", icon: "🎭", color: "pink" },
  CATERING: { label: "Catering", icon: "🍽️", color: "orange" },
  TRANSPORT: { label: "Transport", icon: "🚐", color: "yellow" },
  ACCOMMODATION: { label: "Accommodation", icon: "🏨", color: "indigo" },
  PERMITS: { label: "Permits", icon: "📋", color: "cyan" },
  INSURANCE: { label: "Insurance", icon: "🛡️", color: "slate" },
  POST_PRODUCTION: { label: "Post-Production", icon: "✂️", color: "violet" },
  VFX: { label: "VFX", icon: "✨", color: "fuchsia" },
  MUSIC_LICENSING: { label: "Music Licensing", icon: "🎵", color: "rose" },
  MARKETING: { label: "Marketing", icon: "📢", color: "amber" },
  CONTINGENCY: { label: "Contingency", icon: "🛟", color: "gray" },
  OTHER: { label: "Other", icon: "📎", color: "neutral" },
};

const PHASES = {
  PRE_PRODUCTION: { label: "Pre-Production", icon: "📋" },
  PRODUCTION: { label: "Production", icon: "🎬" },
  POST_PRODUCTION: { label: "Post-Production", icon: "✂️" },
  DISTRIBUTION: { label: "Distribution", icon: "🚀" },
};

export default function BudgetTracker({ project }: BudgetTrackerProps) {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "crew" | "equipment" | "locations" | "daily">("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Data state
  const [budgetLineItems, setBudgetLineItems] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [crewCosts, setCrewCosts] = useState<any[]>([]);
  const [equipmentRentals, setEquipmentRentals] = useState<any[]>([]);
  const [locationCosts, setLocationCosts] = useState<any[]>([]);
  const [dailySummaries, setDailySummaries] = useState<any[]>([]);

  // Modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCrewCostModal, setShowCrewCostModal] = useState(false);
  const [showEquipmentRentalModal, setShowEquipmentRentalModal] = useState(false);
  const [showLocationCostModal, setShowLocationCostModal] = useState(false);

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    category: "OTHER" as string,
    subcategory: "",
    phase: "PRODUCTION" as string,
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    shootDay: "",
    vendorName: "",
    invoiceNumber: "",
    paymentMethod: "INVOICE" as string,
    notes: "",
  });

  const [crewCostForm, setCrewCostForm] = useState({
    crewMemberEmail: "",
    crewMemberName: "",
    role: "",
    department: "PRODUCTION" as string,
    workDate: new Date().toISOString().split("T")[0],
    shootDay: "",
    rateType: "DAY_RATE" as string,
    baseRate: "",
    regularHours: "10",
    overtimeHours: "0",
    kitFee: "0",
    perDiem: "0",
    notes: "",
  });

  const [equipmentRentalForm, setEquipmentRentalForm] = useState({
    equipmentName: "",
    equipmentCategory: "CAMERA" as string,
    quantity: "1",
    vendorName: "",
    vendorPhone: "",
    vendorEmail: "",
    rentalStartDate: "",
    rentalEndDate: "",
    dailyRate: "",
    depositAmount: "0",
    notes: "",
  });

  const [locationCostForm, setLocationCostForm] = useState({
    locationName: "",
    locationAddress: "",
    locationType: "PRACTICAL" as string,
    useStartDate: "",
    useEndDate: "",
    locationFee: "",
    feeType: "DAILY" as string,
    permitFee: "0",
    parkingFee: "0",
    securityFee: "0",
    notes: "",
  });

  // Calculate total budget from project
  const totalBudget =
    (project.budgetPreProduction || 0) +
    (project.budgetProduction || 0) +
    (project.budgetPostProduction || 0) +
    (project.budgetDistribution || 0) +
    (project.budgetContingency || 0);

  // Load data
  useEffect(() => {
    if (client) {
      loadData();
    }
  }, [project.id, client]);

  async function loadData() {
    if (!client) return;
    setIsLoading(true);
    try {
      // Load budget line items
      if (client.models.BudgetLineItem) {
        try {
          const result = await client.models.BudgetLineItem.list({
            filter: { projectId: { eq: project.id } },
          });
          setBudgetLineItems(result.data || []);
        } catch (e) {
          console.warn("BudgetLineItem model not available");
        }
      }

      // Load expenses
      if (client.models.Expense) {
        try {
          const result = await client.models.Expense.list({
            filter: { projectId: { eq: project.id } },
          });
          setExpenses(result.data || []);
        } catch (e) {
          console.warn("Expense model not available");
        }
      }

      // Load crew costs
      if (client.models.CrewCost) {
        try {
          const result = await client.models.CrewCost.list({
            filter: { projectId: { eq: project.id } },
          });
          setCrewCosts(result.data || []);
        } catch (e) {
          console.warn("CrewCost model not available");
        }
      }

      // Load equipment rentals
      if (client.models.EquipmentRental) {
        try {
          const result = await client.models.EquipmentRental.list({
            filter: { projectId: { eq: project.id } },
          });
          setEquipmentRentals(result.data || []);
        } catch (e) {
          console.warn("EquipmentRental model not available");
        }
      }

      // Load location costs
      if (client.models.LocationCost) {
        try {
          const result = await client.models.LocationCost.list({
            filter: { projectId: { eq: project.id } },
          });
          setLocationCosts(result.data || []);
        } catch (e) {
          console.warn("LocationCost model not available");
        }
      }

      // Load daily summaries
      if (client.models.DailyCostSummary) {
        try {
          const result = await client.models.DailyCostSummary.list({
            filter: { projectId: { eq: project.id } },
          });
          setDailySummaries(result.data || []);
        } catch (e) {
          console.warn("DailyCostSummary model not available");
        }
      }
    } catch (error) {
      console.error("Error loading budget data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalCrewCosts = crewCosts.reduce((sum, c) => sum + (c.totalCost || 0), 0);
  const totalEquipmentRentals = equipmentRentals.reduce((sum, e) => sum + (e.totalCost || 0), 0);
  const totalLocationCosts = locationCosts.reduce((sum, l) => sum + (l.totalCost || 0), 0);
  const totalSpent = totalExpenses + totalCrewCosts + totalEquipmentRentals + totalLocationCosts;
  const budgetRemaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, e) => {
    const cat = e.category || "OTHER";
    acc[cat] = (acc[cat] || 0) + (e.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  // Handle form submissions
  async function handleAddExpense() {
    if (!client) return;
    if (!client.models.Expense) {
      toast.warning("Schema not deployed", "Run: npx ampx sandbox --once");
      return;
    }
    try {
      await client.models.Expense.create({
        organizationId: project.organizationId,
        projectId: project.id,
        category: expenseForm.category as any,
        subcategory: expenseForm.subcategory || undefined,
        phase: expenseForm.phase as any,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount) || 0,
        expenseDate: expenseForm.expenseDate,
        shootDay: expenseForm.shootDay ? parseInt(expenseForm.shootDay) : undefined,
        vendorName: expenseForm.vendorName || undefined,
        invoiceNumber: expenseForm.invoiceNumber || undefined,
        paymentMethod: expenseForm.paymentMethod as any,
        paymentStatus: "PENDING" as any,
        status: "SUBMITTED" as any,
        notes: expenseForm.notes || undefined,
        createdBy: "user@syncops.app",
        createdByEmail: "user@syncops.app",
      });
      setShowExpenseModal(false);
      setExpenseForm({
        category: "OTHER",
        subcategory: "",
        phase: "PRODUCTION",
        description: "",
        amount: "",
        expenseDate: new Date().toISOString().split("T")[0],
        shootDay: "",
        vendorName: "",
        invoiceNumber: "",
        paymentMethod: "INVOICE",
        notes: "",
      });
      loadData();
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense", "Check console for details.");
    }
  }

  async function handleAddCrewCost() {
    if (!client) return;
    if (!client.models.CrewCost) {
      toast.warning("Schema not deployed", "Run: npx ampx sandbox --once");
      return;
    }
    try {
      const baseRate = parseFloat(crewCostForm.baseRate) || 0;
      const regularHours = parseFloat(crewCostForm.regularHours) || 0;
      const overtimeHours = parseFloat(crewCostForm.overtimeHours) || 0;
      const kitFee = parseFloat(crewCostForm.kitFee) || 0;
      const perDiem = parseFloat(crewCostForm.perDiem) || 0;

      // Calculate costs
      const baseCost = crewCostForm.rateType === "DAY_RATE" ? baseRate : regularHours * baseRate;
      const overtimeRate = baseRate * 1.5;
      const overtimeCost = overtimeHours * overtimeRate;
      const totalCost = baseCost + overtimeCost + kitFee + perDiem;

      await client.models.CrewCost.create({
        organizationId: project.organizationId,
        projectId: project.id,
        crewMemberEmail: crewCostForm.crewMemberEmail,
        crewMemberName: crewCostForm.crewMemberName,
        role: crewCostForm.role,
        department: crewCostForm.department as any,
        workDate: crewCostForm.workDate,
        shootDay: crewCostForm.shootDay ? parseInt(crewCostForm.shootDay) : undefined,
        rateType: crewCostForm.rateType as any,
        baseRate,
        overtimeRate,
        regularHours,
        overtimeHours,
        kitFee,
        perDiem,
        baseCost,
        overtimeCost,
        kitFeeCost: kitFee,
        perDiemCost: perDiem,
        totalCost,
        paymentStatus: "PENDING" as any,
        notes: crewCostForm.notes || undefined,
        createdBy: "user@syncops.app",
      });
      setShowCrewCostModal(false);
      setCrewCostForm({
        crewMemberEmail: "",
        crewMemberName: "",
        role: "",
        department: "PRODUCTION",
        workDate: new Date().toISOString().split("T")[0],
        shootDay: "",
        rateType: "DAY_RATE",
        baseRate: "",
        regularHours: "10",
        overtimeHours: "0",
        kitFee: "0",
        perDiem: "0",
        notes: "",
      });
      loadData();
    } catch (error) {
      console.error("Error adding crew cost:", error);
      toast.error("Failed to add crew cost", "Check console for details.");
    }
  }

  async function handleAddEquipmentRental() {
    if (!client) return;
    if (!client.models.EquipmentRental) {
      toast.warning("Schema not deployed", "Run: npx ampx sandbox --once");
      return;
    }
    try {
      const dailyRate = parseFloat(equipmentRentalForm.dailyRate) || 0;
      const quantity = parseInt(equipmentRentalForm.quantity) || 1;
      const start = new Date(equipmentRentalForm.rentalStartDate);
      const end = new Date(equipmentRentalForm.rentalEndDate);
      const rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const subtotal = dailyRate * rentalDays * quantity;
      const depositAmount = parseFloat(equipmentRentalForm.depositAmount) || 0;

      await client.models.EquipmentRental.create({
        organizationId: project.organizationId,
        projectId: project.id,
        equipmentName: equipmentRentalForm.equipmentName,
        equipmentCategory: equipmentRentalForm.equipmentCategory as any,
        quantity,
        vendorName: equipmentRentalForm.vendorName,
        vendorPhone: equipmentRentalForm.vendorPhone || undefined,
        vendorEmail: equipmentRentalForm.vendorEmail || undefined,
        rentalStartDate: equipmentRentalForm.rentalStartDate,
        rentalEndDate: equipmentRentalForm.rentalEndDate,
        rentalDays,
        dailyRate,
        depositAmount,
        subtotal,
        totalCost: subtotal,
        status: "CONFIRMED" as any,
        paymentStatus: "PENDING" as any,
        notes: equipmentRentalForm.notes || undefined,
        createdBy: "user@syncops.app",
        createdByEmail: "user@syncops.app",
      });
      setShowEquipmentRentalModal(false);
      setEquipmentRentalForm({
        equipmentName: "",
        equipmentCategory: "CAMERA",
        quantity: "1",
        vendorName: "",
        vendorPhone: "",
        vendorEmail: "",
        rentalStartDate: "",
        rentalEndDate: "",
        dailyRate: "",
        depositAmount: "0",
        notes: "",
      });
      loadData();
    } catch (error) {
      console.error("Error adding equipment rental:", error);
      toast.error("Failed to add equipment rental", "Check console for details.");
    }
  }

  async function handleAddLocationCost() {
    if (!client) return;
    if (!client.models.LocationCost) {
      toast.warning("Schema not deployed", "Run: npx ampx sandbox --once");
      return;
    }
    try {
      const locationFee = parseFloat(locationCostForm.locationFee) || 0;
      const permitFee = parseFloat(locationCostForm.permitFee) || 0;
      const parkingFee = parseFloat(locationCostForm.parkingFee) || 0;
      const securityFee = parseFloat(locationCostForm.securityFee) || 0;
      const start = new Date(locationCostForm.useStartDate);
      const end = new Date(locationCostForm.useEndDate);
      const useDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const subtotal = locationCostForm.feeType === "DAILY" ? locationFee * useDays : locationFee;
      const totalCost = subtotal + permitFee + parkingFee + securityFee;

      await client.models.LocationCost.create({
        organizationId: project.organizationId,
        projectId: project.id,
        locationName: locationCostForm.locationName,
        locationAddress: locationCostForm.locationAddress || undefined,
        locationType: locationCostForm.locationType as any,
        useStartDate: locationCostForm.useStartDate,
        useEndDate: locationCostForm.useEndDate,
        useDays,
        locationFee,
        feeType: locationCostForm.feeType as any,
        dailyRate: locationCostForm.feeType === "DAILY" ? locationFee : undefined,
        permitFee,
        parkingFee,
        securityFee,
        subtotal,
        totalCost,
        status: "CONFIRMED" as any,
        paymentStatus: "PENDING" as any,
        notes: locationCostForm.notes || undefined,
        createdBy: "user@syncops.app",
        createdByEmail: "user@syncops.app",
      });
      setShowLocationCostModal(false);
      setLocationCostForm({
        locationName: "",
        locationAddress: "",
        locationType: "PRACTICAL",
        useStartDate: "",
        useEndDate: "",
        locationFee: "",
        feeType: "DAILY",
        permitFee: "0",
        parkingFee: "0",
        securityFee: "0",
        notes: "",
      });
      loadData();
    } catch (error) {
      console.error("Error adding location cost:", error);
      toast.error("Failed to add location cost", "Check console for details.");
    }
  }

  // Show empty state if no budget
  if (totalBudget === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">💰</div>
        <h3 className="text-xl font-bold text-slate-400 mb-2">No Budget Assigned</h3>
        <p className="text-sm text-slate-500 mb-4">
          Budget allocation will appear here once configured.
        </p>
        <p className="text-sm text-teal-400">
          Go to the <span className="font-bold">Settings</span> tab to configure budget breakdown for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
              💵 Budget Tracker
            </h3>
            <p className="text-sm text-slate-400">
              Track every cent across crew, equipment, locations, and all production stages
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* Budget Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Total Budget</span>
              <span className="text-xl">💰</span>
            </div>
            <p className="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Total Spent</span>
              <span className="text-xl">📊</span>
            </div>
            <p className="text-2xl font-bold text-white">${totalSpent.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{spentPercentage.toFixed(1)}% of budget</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Remaining</span>
              <span className="text-xl">🛡️</span>
            </div>
            <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? "text-green-400" : "text-red-400"}`}>
              ${Math.abs(budgetRemaining).toLocaleString()}
              {budgetRemaining < 0 && " OVER"}
            </p>
            <p className="text-xs text-slate-500 mt-1">{(100 - spentPercentage).toFixed(1)}% available</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Transactions</span>
              <span className="text-xl">📋</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {expenses.length + crewCosts.length + equipmentRentals.length + locationCosts.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total entries</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-300">Budget Utilization</span>
            <span className={`text-sm ${spentPercentage > 100 ? "text-red-400" : spentPercentage > 80 ? "text-yellow-400" : "text-slate-400"}`}>
              {spentPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 shadow-inner">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                spentPercentage > 100
                  ? "bg-red-500"
                  : spentPercentage > 80
                  ? "bg-yellow-500"
                  : "bg-gradient-to-r from-teal-500 to-blue-500"
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "expenses", label: "Expenses", icon: "💳", count: expenses.length },
          { id: "crew", label: "Crew Costs", icon: "👥", count: crewCosts.length },
          { id: "equipment", label: "Equipment Rentals", icon: "📦", count: equipmentRentals.length },
          { id: "locations", label: "Locations", icon: "📍", count: locationCosts.length },
          { id: "daily", label: "Daily Summary", icon: "📅" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-teal-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Spending by Category */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Spending by Category</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Crew */}
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <span>👥</span> Crew Costs
                    </span>
                    <span className="text-xs text-slate-500">{crewCosts.length} entries</span>
                  </div>
                  <p className="text-xl font-bold text-blue-400">${totalCrewCosts.toLocaleString()}</p>
                </div>

                {/* Equipment Rentals */}
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <span>📦</span> Equipment Rentals
                    </span>
                    <span className="text-xs text-slate-500">{equipmentRentals.length} items</span>
                  </div>
                  <p className="text-xl font-bold text-teal-400">${totalEquipmentRentals.toLocaleString()}</p>
                </div>

                {/* Locations */}
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <span>📍</span> Locations
                    </span>
                    <span className="text-xs text-slate-500">{locationCosts.length} locations</span>
                  </div>
                  <p className="text-xl font-bold text-purple-400">${totalLocationCosts.toLocaleString()}</p>
                </div>

                {/* Other Expenses */}
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <span>💳</span> Other Expenses
                    </span>
                    <span className="text-xs text-slate-500">{expenses.length} items</span>
                  </div>
                  <p className="text-xl font-bold text-orange-400">${totalExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Phase Breakdown */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Budget by Phase</h4>
              <div className="space-y-3">
                {[
                  { phase: "Pre-Production", budgeted: project.budgetPreProduction || 0, icon: "📋", color: "purple" },
                  { phase: "Production", budgeted: project.budgetProduction || 0, icon: "🎬", color: "green" },
                  { phase: "Post-Production", budgeted: project.budgetPostProduction || 0, icon: "✂️", color: "yellow" },
                  { phase: "Distribution", budgeted: project.budgetDistribution || 0, icon: "🚀", color: "teal" },
                  { phase: "Contingency", budgeted: project.budgetContingency || 0, icon: "🛡️", color: "slate" },
                ]
                  .filter((p) => p.budgeted > 0)
                  .map((phase) => {
                    const percentage = totalBudget > 0 ? (phase.budgeted / totalBudget) * 100 : 0;
                    return (
                      <div key={phase.phase} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{phase.icon}</span>
                            <div>
                              <p className="text-sm font-bold text-white">{phase.phase}</p>
                              <p className="text-xs text-slate-500">
                                ${phase.budgeted.toLocaleString()} ({percentage.toFixed(1)}% of total)
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-${phase.color}-500`}
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

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white">Expenses</h4>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
              >
                + Add Expense
              </button>
            </div>
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">💳</div>
                <p>No expenses recorded yet</p>
                <p className="text-sm mt-1">Click "Add Expense" to start tracking costs</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map((expense) => {
                  const catConfig = EXPENSE_CATEGORIES[expense.category as keyof typeof EXPENSE_CATEGORIES];
                  return (
                    <div key={expense.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{catConfig?.icon || "📎"}</span>
                        <div>
                          <p className="font-medium text-white">{expense.description}</p>
                          <p className="text-xs text-slate-500">
                            {catConfig?.label || expense.category} • {expense.expenseDate}
                            {expense.vendorName && ` • ${expense.vendorName}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">${expense.amount?.toLocaleString()}</p>
                        <p className={`text-xs ${expense.paymentStatus === "PAID" ? "text-green-400" : "text-yellow-400"}`}>
                          {expense.paymentStatus}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Crew Costs Tab */}
        {activeTab === "crew" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white">Crew Costs</h4>
              <button
                onClick={() => setShowCrewCostModal(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
              >
                + Add Crew Cost
              </button>
            </div>
            {crewCosts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">👥</div>
                <p>No crew costs recorded yet</p>
                <p className="text-sm mt-1">Track daily rates, overtime, kit fees, and per diem for each crew member</p>
              </div>
            ) : (
              <div className="space-y-2">
                {crewCosts.map((cost) => (
                  <div key={cost.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{cost.crewMemberName}</p>
                        <p className="text-sm text-slate-400">{cost.role} • {cost.department}</p>
                        <p className="text-xs text-slate-500">
                          {cost.workDate} {cost.shootDay && `• Day ${cost.shootDay}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">${cost.totalCost?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">
                          Base: ${cost.baseCost?.toLocaleString()}
                          {cost.overtimeCost > 0 && ` + OT: $${cost.overtimeCost?.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                        Rate: ${cost.baseRate}/{cost.rateType?.toLowerCase().replace("_", " ")}
                      </span>
                      {cost.regularHours > 0 && (
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                          {cost.regularHours}h regular
                        </span>
                      )}
                      {cost.overtimeHours > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          {cost.overtimeHours}h OT
                        </span>
                      )}
                      {cost.kitFee > 0 && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                          Kit: ${cost.kitFee}
                        </span>
                      )}
                      {cost.perDiem > 0 && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                          Per diem: ${cost.perDiem}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Equipment Rentals Tab */}
        {activeTab === "equipment" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white">Equipment Rentals</h4>
              <button
                onClick={() => setShowEquipmentRentalModal(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
              >
                + Add Rental
              </button>
            </div>
            {equipmentRentals.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">📦</div>
                <p>No equipment rentals recorded yet</p>
                <p className="text-sm mt-1">Track rented/hired equipment with daily rates and rental periods</p>
              </div>
            ) : (
              <div className="space-y-2">
                {equipmentRentals.map((rental) => (
                  <div key={rental.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">
                          {rental.equipmentName}
                          {rental.quantity > 1 && ` (x${rental.quantity})`}
                        </p>
                        <p className="text-sm text-slate-400">{rental.vendorName}</p>
                        <p className="text-xs text-slate-500">
                          {rental.rentalStartDate} to {rental.rentalEndDate} ({rental.rentalDays} days)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">${rental.totalCost?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">${rental.dailyRate}/day</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded text-xs">
                        {rental.equipmentCategory}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        rental.status === "PAID"
                          ? "bg-green-500/20 text-green-400"
                          : rental.status === "RETURNED"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {rental.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === "locations" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white">Location Costs</h4>
              <button
                onClick={() => setShowLocationCostModal(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
              >
                + Add Location
              </button>
            </div>
            {locationCosts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">📍</div>
                <p>No location costs recorded yet</p>
                <p className="text-sm mt-1">Track location fees, permits, parking, and security costs</p>
              </div>
            ) : (
              <div className="space-y-2">
                {locationCosts.map((location) => (
                  <div key={location.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{location.locationName}</p>
                        {location.locationAddress && (
                          <p className="text-sm text-slate-400">{location.locationAddress}</p>
                        )}
                        <p className="text-xs text-slate-500">
                          {location.useStartDate} to {location.useEndDate} ({location.useDays} days)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">${location.totalCost?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">
                          Fee: ${location.locationFee?.toLocaleString()}
                          {location.feeType === "DAILY" && "/day"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {location.locationType}
                      </span>
                      {location.permitFee > 0 && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                          Permits: ${location.permitFee}
                        </span>
                      )}
                      {location.parkingFee > 0 && (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">
                          Parking: ${location.parkingFee}
                        </span>
                      )}
                      {location.securityFee > 0 && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                          Security: ${location.securityFee}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Daily Summary Tab */}
        {activeTab === "daily" && (
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Daily Cost Summary</h4>
            {dailySummaries.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">📅</div>
                <p>Daily summaries will appear here as you add costs per shoot day</p>
                <p className="text-sm mt-1">Track total costs per day including crew, equipment, and locations</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dailySummaries.map((summary) => (
                  <div key={summary.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-white">
                          Day {summary.shootDay} - {summary.date}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-white">${summary.totalActualCost?.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-slate-500">Crew</p>
                        <p className="text-blue-400 font-medium">${summary.crewTotalCost?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-slate-500">Equipment</p>
                        <p className="text-teal-400 font-medium">${summary.equipmentTotalCost?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-slate-500">Location</p>
                        <p className="text-purple-400 font-medium">${summary.locationTotalCost?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-slate-500">Other</p>
                        <p className="text-orange-400 font-medium">${summary.otherTotalCost?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Add Expense</h3>
              <p className="text-sm text-slate-400 mt-1">Record a new expense for this project</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.icon} {val.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phase *</label>
                  <select
                    value={expenseForm.phase}
                    onChange={(e) => setExpenseForm({ ...expenseForm, phase: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    {Object.entries(PHASES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.icon} {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="What is this expense for?"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={expenseForm.vendorName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                    placeholder="Vendor name"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Shoot Day</label>
                  <input
                    type="number"
                    value={expenseForm.shootDay}
                    onChange={(e) => setExpenseForm({ ...expenseForm, shootDay: e.target.value })}
                    placeholder="e.g., 1, 2, 3"
                    min="1"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                <textarea
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!expenseForm.description || !expenseForm.amount}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Crew Cost Modal */}
      {showCrewCostModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Add Crew Cost</h3>
              <p className="text-sm text-slate-400 mt-1">Record daily crew costs with rates and overtime</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Crew Member Name *</label>
                  <input
                    type="text"
                    value={crewCostForm.crewMemberName}
                    onChange={(e) => setCrewCostForm({ ...crewCostForm, crewMemberName: e.target.value })}
                    placeholder="Full name"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={crewCostForm.crewMemberEmail}
                    onChange={(e) => setCrewCostForm({ ...crewCostForm, crewMemberEmail: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role *</label>
                  <input
                    type="text"
                    value={crewCostForm.role}
                    onChange={(e) => setCrewCostForm({ ...crewCostForm, role: e.target.value })}
                    placeholder="e.g., Gaffer, DP, AC"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={crewCostForm.department}
                    onChange={(e) => setCrewCostForm({ ...crewCostForm, department: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="CAMERA">Camera</option>
                    <option value="SOUND">Sound</option>
                    <option value="LIGHTING">Lighting</option>
                    <option value="GRIP">Grip</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="PRODUCTION">Production</option>
                    <option value="ART">Art</option>
                    <option value="MAKEUP">Makeup</option>
                    <option value="WARDROBE">Wardrobe</option>
                    <option value="VFX">VFX</option>
                    <option value="POST">Post</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Work Date *</label>
                  <input
                    type="date"
                    value={crewCostForm.workDate}
                    onChange={(e) => setCrewCostForm({ ...crewCostForm, workDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Shoot Day</label>
                  <input
                    type="number"
                    value={crewCostForm.shootDay}
                    onChange={(e) => setCrewCostForm({ ...crewCostForm, shootDay: e.target.value })}
                    placeholder="e.g., 1, 2, 3"
                    min="1"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Rate Type *</label>
                  <select
                    value={crewCostForm.rateType}
                    onChange={(e) => setCrewCostForm({ ...crewCostForm, rateType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="DAY_RATE">Day Rate</option>
                    <option value="HOURLY">Hourly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="FLAT">Flat Fee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Base Rate *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={crewCostForm.baseRate}
                      onChange={(e) => setCrewCostForm({ ...crewCostForm, baseRate: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Regular Hours</label>
                  <input
                    type="number"
                    value={crewCostForm.regularHours}
                    onChange={(e) => setCrewCostForm({ ...crewCostForm, regularHours: e.target.value })}
                    placeholder="10"
                    min="0"
                    step="0.5"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Overtime Hours</label>
                  <input
                    type="number"
                    value={crewCostForm.overtimeHours}
                    onChange={(e) => setCrewCostForm({ ...crewCostForm, overtimeHours: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.5"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Kit Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={crewCostForm.kitFee}
                      onChange={(e) => setCrewCostForm({ ...crewCostForm, kitFee: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Per Diem</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={crewCostForm.perDiem}
                      onChange={(e) => setCrewCostForm({ ...crewCostForm, perDiem: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Cost Preview */}
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-sm font-medium text-slate-400 mb-2">Cost Preview</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Cost:</span>
                    <span className="text-white">
                      ${(crewCostForm.rateType === "DAY_RATE"
                        ? parseFloat(crewCostForm.baseRate) || 0
                        : (parseFloat(crewCostForm.regularHours) || 0) * (parseFloat(crewCostForm.baseRate) || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  {parseFloat(crewCostForm.overtimeHours) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Overtime (1.5x):</span>
                      <span className="text-yellow-400">
                        ${((parseFloat(crewCostForm.overtimeHours) || 0) * (parseFloat(crewCostForm.baseRate) || 0) * 1.5).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {parseFloat(crewCostForm.kitFee) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kit Fee:</span>
                      <span className="text-green-400">${parseFloat(crewCostForm.kitFee).toLocaleString()}</span>
                    </div>
                  )}
                  {parseFloat(crewCostForm.perDiem) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Per Diem:</span>
                      <span className="text-purple-400">${parseFloat(crewCostForm.perDiem).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-700">
                    <span className="text-white font-medium">Total:</span>
                    <span className="text-teal-400 font-bold">
                      ${(
                        (crewCostForm.rateType === "DAY_RATE"
                          ? parseFloat(crewCostForm.baseRate) || 0
                          : (parseFloat(crewCostForm.regularHours) || 0) * (parseFloat(crewCostForm.baseRate) || 0)) +
                        (parseFloat(crewCostForm.overtimeHours) || 0) * (parseFloat(crewCostForm.baseRate) || 0) * 1.5 +
                        (parseFloat(crewCostForm.kitFee) || 0) +
                        (parseFloat(crewCostForm.perDiem) || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowCrewCostModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCrewCost}
                disabled={!crewCostForm.crewMemberName || !crewCostForm.role || !crewCostForm.baseRate}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg"
              >
                Add Crew Cost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Equipment Rental Modal */}
      {showEquipmentRentalModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Add Equipment Rental</h3>
              <p className="text-sm text-slate-400 mt-1">Track hired/rented equipment costs</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={equipmentRentalForm.equipmentName}
                    onChange={(e) => setEquipmentRentalForm({ ...equipmentRentalForm, equipmentName: e.target.value })}
                    placeholder="e.g., ARRI Alexa Mini"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={equipmentRentalForm.equipmentCategory}
                    onChange={(e) => setEquipmentRentalForm({ ...equipmentRentalForm, equipmentCategory: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="CAMERA">Camera</option>
                    <option value="LENS">Lens</option>
                    <option value="LIGHTING">Lighting</option>
                    <option value="AUDIO">Audio</option>
                    <option value="GRIP">Grip</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="MONITORS">Monitors</option>
                    <option value="STORAGE">Storage</option>
                    <option value="DRONES">Drones</option>
                    <option value="STABILIZERS">Stabilizers</option>
                    <option value="VEHICLES">Vehicles</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Vendor *</label>
                  <input
                    type="text"
                    value={equipmentRentalForm.vendorName}
                    onChange={(e) => setEquipmentRentalForm({ ...equipmentRentalForm, vendorName: e.target.value })}
                    placeholder="Rental house name"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={equipmentRentalForm.quantity}
                    onChange={(e) => setEquipmentRentalForm({ ...equipmentRentalForm, quantity: e.target.value })}
                    min="1"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={equipmentRentalForm.rentalStartDate}
                    onChange={(e) => setEquipmentRentalForm({ ...equipmentRentalForm, rentalStartDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={equipmentRentalForm.rentalEndDate}
                    onChange={(e) => setEquipmentRentalForm({ ...equipmentRentalForm, rentalEndDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Daily Rate *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={equipmentRentalForm.dailyRate}
                      onChange={(e) => setEquipmentRentalForm({ ...equipmentRentalForm, dailyRate: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Deposit</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={equipmentRentalForm.depositAmount}
                      onChange={(e) => setEquipmentRentalForm({ ...equipmentRentalForm, depositAmount: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Cost Preview */}
              {equipmentRentalForm.rentalStartDate && equipmentRentalForm.rentalEndDate && equipmentRentalForm.dailyRate && (
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm font-medium text-slate-400 mb-2">Cost Preview</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rental Days:</span>
                      <span className="text-white">
                        {Math.ceil(
                          (new Date(equipmentRentalForm.rentalEndDate).getTime() -
                            new Date(equipmentRentalForm.rentalStartDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Daily Rate × Qty:</span>
                      <span className="text-white">
                        ${parseFloat(equipmentRentalForm.dailyRate).toLocaleString()} × {equipmentRentalForm.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-700">
                      <span className="text-white font-medium">Total:</span>
                      <span className="text-teal-400 font-bold">
                        ${(
                          (parseFloat(equipmentRentalForm.dailyRate) || 0) *
                          (parseInt(equipmentRentalForm.quantity) || 1) *
                          (Math.ceil(
                            (new Date(equipmentRentalForm.rentalEndDate).getTime() -
                              new Date(equipmentRentalForm.rentalStartDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowEquipmentRentalModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEquipmentRental}
                disabled={
                  !equipmentRentalForm.equipmentName ||
                  !equipmentRentalForm.vendorName ||
                  !equipmentRentalForm.rentalStartDate ||
                  !equipmentRentalForm.rentalEndDate ||
                  !equipmentRentalForm.dailyRate
                }
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg"
              >
                Add Rental
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Cost Modal */}
      {showLocationCostModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Add Location Cost</h3>
              <p className="text-sm text-slate-400 mt-1">Track location fees and associated costs</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Location Name *</label>
                <input
                  type="text"
                  value={locationCostForm.locationName}
                  onChange={(e) => setLocationCostForm({ ...locationCostForm, locationName: e.target.value })}
                  placeholder="e.g., Downtown Studio"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  value={locationCostForm.locationAddress}
                  onChange={(e) => setLocationCostForm({ ...locationCostForm, locationAddress: e.target.value })}
                  placeholder="Full address"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={locationCostForm.locationType}
                    onChange={(e) => setLocationCostForm({ ...locationCostForm, locationType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="STUDIO">Studio</option>
                    <option value="PRACTICAL">Practical Location</option>
                    <option value="EXTERIOR">Exterior</option>
                    <option value="PUBLIC">Public Space</option>
                    <option value="PRIVATE">Private Property</option>
                    <option value="GOVERNMENT">Government</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Fee Type</label>
                  <select
                    value={locationCostForm.feeType}
                    onChange={(e) => setLocationCostForm({ ...locationCostForm, feeType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="FLAT">Flat Fee</option>
                    <option value="DAILY">Daily</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="HOURLY">Hourly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={locationCostForm.useStartDate}
                    onChange={(e) => setLocationCostForm({ ...locationCostForm, useStartDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={locationCostForm.useEndDate}
                    onChange={(e) => setLocationCostForm({ ...locationCostForm, useEndDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Location Fee *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={locationCostForm.locationFee}
                    onChange={(e) => setLocationCostForm({ ...locationCostForm, locationFee: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Permit Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={locationCostForm.permitFee}
                      onChange={(e) => setLocationCostForm({ ...locationCostForm, permitFee: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Parking Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={locationCostForm.parkingFee}
                      onChange={(e) => setLocationCostForm({ ...locationCostForm, parkingFee: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Security Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={locationCostForm.securityFee}
                      onChange={(e) => setLocationCostForm({ ...locationCostForm, securityFee: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Cost Preview */}
              {locationCostForm.useStartDate && locationCostForm.useEndDate && locationCostForm.locationFee && (
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm font-medium text-slate-400 mb-2">Cost Preview</p>
                  <div className="space-y-1 text-sm">
                    {locationCostForm.feeType === "DAILY" && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Days:</span>
                        <span className="text-white">
                          {Math.ceil(
                            (new Date(locationCostForm.useEndDate).getTime() -
                              new Date(locationCostForm.useStartDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location Fee:</span>
                      <span className="text-white">
                        ${(
                          locationCostForm.feeType === "DAILY"
                            ? (parseFloat(locationCostForm.locationFee) || 0) *
                              (Math.ceil(
                                (new Date(locationCostForm.useEndDate).getTime() -
                                  new Date(locationCostForm.useStartDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              ) + 1)
                            : parseFloat(locationCostForm.locationFee) || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    {parseFloat(locationCostForm.permitFee) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Permits:</span>
                        <span className="text-cyan-400">${parseFloat(locationCostForm.permitFee).toLocaleString()}</span>
                      </div>
                    )}
                    {parseFloat(locationCostForm.parkingFee) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Parking:</span>
                        <span className="text-orange-400">${parseFloat(locationCostForm.parkingFee).toLocaleString()}</span>
                      </div>
                    )}
                    {parseFloat(locationCostForm.securityFee) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Security:</span>
                        <span className="text-red-400">${parseFloat(locationCostForm.securityFee).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-700">
                      <span className="text-white font-medium">Total:</span>
                      <span className="text-teal-400 font-bold">
                        ${(
                          (locationCostForm.feeType === "DAILY"
                            ? (parseFloat(locationCostForm.locationFee) || 0) *
                              (Math.ceil(
                                (new Date(locationCostForm.useEndDate).getTime() -
                                  new Date(locationCostForm.useStartDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              ) + 1)
                            : parseFloat(locationCostForm.locationFee) || 0) +
                          (parseFloat(locationCostForm.permitFee) || 0) +
                          (parseFloat(locationCostForm.parkingFee) || 0) +
                          (parseFloat(locationCostForm.securityFee) || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowLocationCostModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLocationCost}
                disabled={
                  !locationCostForm.locationName ||
                  !locationCostForm.useStartDate ||
                  !locationCostForm.useEndDate ||
                  !locationCostForm.locationFee
                }
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg"
              >
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
