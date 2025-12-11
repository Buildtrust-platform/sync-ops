"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * ROI PROJECTIONS COMPONENT
 * Business case and financial forecasting for project viability
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const PercentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19"/>
    <circle cx="6.5" cy="6.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const ScaleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8"/>
    <path d="M12 17v4"/>
    <path d="M7 8H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3"/>
    <path d="M17 8h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3"/>
    <path d="M12 3v14"/>
    <path d="m17 8-5-5-5 5"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// Revenue stream types
const REVENUE_TYPES = {
  theatrical: { label: "Theatrical Release", color: "#3B82F6" },
  streaming: { label: "Streaming/SVOD", color: "#8B5CF6" },
  broadcast: { label: "Broadcast/TV", color: "#10B981" },
  homevideo: { label: "Home Video/EST", color: "#F59E0B" },
  international: { label: "International Sales", color: "#EC4899" },
  merchandise: { label: "Merchandise", color: "#06B6D4" },
  licensing: { label: "Licensing", color: "#84CC16" },
  sponsorship: { label: "Sponsorship", color: "#EF4444" },
  other: { label: "Other", color: "#6B7280" }
};

// Cost categories
const COST_CATEGORIES = {
  development: { label: "Development", color: "#8B5CF6" },
  preproduction: { label: "Pre-Production", color: "#3B82F6" },
  production: { label: "Production", color: "#10B981" },
  postproduction: { label: "Post-Production", color: "#F59E0B" },
  marketing: { label: "Marketing/P&A", color: "#EC4899" },
  distribution: { label: "Distribution", color: "#06B6D4" },
  overhead: { label: "Overhead/G&A", color: "#6B7280" },
  contingency: { label: "Contingency", color: "#EF4444" }
};

interface RevenueProjection {
  id: string;
  type: keyof typeof REVENUE_TYPES;
  description: string;
  lowEstimate: number;
  midEstimate: number;
  highEstimate: number;
  timeframe: string;
  probability: number;
  notes?: string;
}

interface CostItem {
  id: string;
  category: keyof typeof COST_CATEGORIES;
  description: string;
  amount: number;
  isFixed: boolean;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  revenueMultiplier: number;
  costVariance: number;
  isBase?: boolean;
}

interface ROIProjectionsProps {
  project: Schema["Project"]["type"];
  onSave?: (data: { revenues: RevenueProjection[]; costs: CostItem[]; scenarios: Scenario[] }) => Promise<void>;
}

export default function ROIProjections({ project, onSave }: ROIProjectionsProps) {
  const [revenues, setRevenues] = useState<RevenueProjection[]>([]);
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: "base", name: "Base Case", description: "Expected outcome", revenueMultiplier: 1, costVariance: 0, isBase: true },
    { id: "optimistic", name: "Optimistic", description: "Best case scenario", revenueMultiplier: 1.3, costVariance: -0.1 },
    { id: "pessimistic", name: "Pessimistic", description: "Worst case scenario", revenueMultiplier: 0.7, costVariance: 0.15 }
  ]);
  const [activeTab, setActiveTab] = useState<"overview" | "revenue" | "costs" | "scenarios">("overview");
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [newRevenue, setNewRevenue] = useState<Partial<RevenueProjection>>({
    type: "streaming",
    probability: 80
  });
  const [newCost, setNewCost] = useState<Partial<CostItem>>({
    category: "production",
    isFixed: true
  });

  // Calculate totals
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
  const totalRevenueLow = revenues.reduce((sum, r) => sum + r.lowEstimate, 0);
  const totalRevenueMid = revenues.reduce((sum, r) => sum + r.midEstimate, 0);
  const totalRevenueHigh = revenues.reduce((sum, r) => sum + r.highEstimate, 0);
  const weightedRevenue = revenues.reduce((sum, r) => sum + (r.midEstimate * r.probability / 100), 0);

  // ROI calculations
  const roiLow = totalCosts > 0 ? ((totalRevenueLow - totalCosts) / totalCosts * 100) : 0;
  const roiMid = totalCosts > 0 ? ((totalRevenueMid - totalCosts) / totalCosts * 100) : 0;
  const roiHigh = totalCosts > 0 ? ((totalRevenueHigh - totalCosts) / totalCosts * 100) : 0;

  // Payback period (simplified)
  const monthlyReturn = totalRevenueMid / 24; // Assuming 2-year revenue window
  const paybackMonths = monthlyReturn > 0 ? Math.ceil(totalCosts / monthlyReturn) : 0;

  // Break-even analysis
  const breakEvenRevenue = totalCosts;
  const breakEvenPercentage = totalRevenueMid > 0 ? (breakEvenRevenue / totalRevenueMid * 100) : 0;

  // Scenario calculations
  const calculateScenario = (scenario: Scenario) => {
    const adjustedRevenue = totalRevenueMid * scenario.revenueMultiplier;
    const adjustedCosts = totalCosts * (1 + scenario.costVariance);
    const profit = adjustedRevenue - adjustedCosts;
    const roi = adjustedCosts > 0 ? ((profit / adjustedCosts) * 100) : 0;
    return { revenue: adjustedRevenue, costs: adjustedCosts, profit, roi };
  };

  const addRevenue = () => {
    if (!newRevenue.description || !newRevenue.midEstimate) return;

    const revenue: RevenueProjection = {
      id: `${Date.now()}`,
      type: newRevenue.type || "streaming",
      description: newRevenue.description,
      lowEstimate: newRevenue.lowEstimate || 0,
      midEstimate: newRevenue.midEstimate,
      highEstimate: newRevenue.highEstimate || newRevenue.midEstimate,
      timeframe: newRevenue.timeframe || "Year 1",
      probability: newRevenue.probability || 80,
      notes: newRevenue.notes
    };

    setRevenues([...revenues, revenue]);
    setNewRevenue({ type: "streaming", probability: 80 });
    setShowRevenueModal(false);
  };

  const addCost = () => {
    if (!newCost.description || !newCost.amount) return;

    const cost: CostItem = {
      id: `${Date.now()}`,
      category: newCost.category || "production",
      description: newCost.description,
      amount: newCost.amount,
      isFixed: newCost.isFixed ?? true
    };

    setCosts([...costs, cost]);
    setNewCost({ category: "production", isFixed: true });
    setShowCostModal(false);
  };

  const removeRevenue = (id: string) => {
    setRevenues(revenues.filter(r => r.id !== id));
  };

  const removeCost = (id: string) => {
    setCosts(costs.filter(c => c.id !== id));
  };

  // Export functionality
  const exportReport = () => {
    let content = `ROI PROJECTION REPORT\n`;
    content += `${"=".repeat(50)}\n\n`;
    content += `Project: ${project.name}\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;

    content += `EXECUTIVE SUMMARY\n`;
    content += `${"-".repeat(30)}\n`;
    content += `Total Investment: $${totalCosts.toLocaleString()}\n`;
    content += `Projected Revenue (Mid): $${totalRevenueMid.toLocaleString()}\n`;
    content += `Expected ROI: ${roiMid.toFixed(1)}%\n`;
    content += `Payback Period: ${paybackMonths} months\n\n`;

    content += `REVENUE BREAKDOWN\n`;
    content += `${"-".repeat(30)}\n`;
    revenues.forEach(r => {
      content += `${REVENUE_TYPES[r.type].label}: $${r.midEstimate.toLocaleString()} (${r.probability}% probability)\n`;
    });

    content += `\nCOST BREAKDOWN\n`;
    content += `${"-".repeat(30)}\n`;
    costs.forEach(c => {
      content += `${COST_CATEGORIES[c.category].label}: $${c.amount.toLocaleString()}\n`;
    });

    content += `\nSCENARIO ANALYSIS\n`;
    content += `${"-".repeat(30)}\n`;
    scenarios.forEach(s => {
      const calc = calculateScenario(s);
      content += `${s.name}: ROI ${calc.roi.toFixed(1)}%, Profit $${calc.profit.toLocaleString()}\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name?.replace(/\s+/g, "_")}_ROI_Report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Cost breakdown by category
  const costsByCategory = costs.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.amount;
    return acc;
  }, {} as Record<string, number>);

  // Revenue breakdown by type
  const revenuesByType = revenues.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + r.midEstimate;
    return acc;
  }, {} as Record<string, number>);

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
              <span style={{ color: "var(--primary)" }}><TrendingUpIcon /></span>
              ROI Projections
            </h3>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Business case analysis and financial projections
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={exportReport}
              className="px-4 py-2 rounded-[6px] font-medium text-[13px] flex items-center gap-2"
              style={{ background: "var(--bg-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              <DownloadIcon />
              Export Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: "overview", label: "Overview" },
            { id: "revenue", label: "Revenue Streams" },
            { id: "costs", label: "Cost Structure" },
            { id: "scenarios", label: "Scenarios" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="px-4 py-2 rounded-[6px] font-medium text-[13px] transition-all"
              style={{
                background: activeTab === tab.id ? "var(--primary)" : "var(--bg-2)",
                color: activeTab === tab.id ? "white" : "var(--text-secondary)"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className="rounded-[10px] p-4"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              <p className="text-[11px] uppercase font-bold mb-1" style={{ color: "var(--text-tertiary)" }}>
                Total Investment
              </p>
              <p className="text-[28px] font-bold" style={{ color: "var(--text-primary)" }}>
                ${totalCosts.toLocaleString()}
              </p>
            </div>
            <div
              className="rounded-[10px] p-4"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              <p className="text-[11px] uppercase font-bold mb-1" style={{ color: "var(--text-tertiary)" }}>
                Projected Revenue
              </p>
              <p className="text-[28px] font-bold" style={{ color: "var(--success)" }}>
                ${totalRevenueMid.toLocaleString()}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Range: ${totalRevenueLow.toLocaleString()} - ${totalRevenueHigh.toLocaleString()}
              </p>
            </div>
            <div
              className="rounded-[10px] p-4"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              <p className="text-[11px] uppercase font-bold mb-1" style={{ color: "var(--text-tertiary)" }}>
                Expected ROI
              </p>
              <p
                className="text-[28px] font-bold"
                style={{ color: roiMid >= 0 ? "var(--success)" : "var(--error)" }}
              >
                {roiMid.toFixed(1)}%
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Range: {roiLow.toFixed(1)}% - {roiHigh.toFixed(1)}%
              </p>
            </div>
            <div
              className="rounded-[10px] p-4"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              <p className="text-[11px] uppercase font-bold mb-1" style={{ color: "var(--text-tertiary)" }}>
                Payback Period
              </p>
              <p className="text-[28px] font-bold" style={{ color: "var(--primary)" }}>
                {paybackMonths > 0 ? `${paybackMonths}mo` : "N/A"}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Break-even: {breakEvenPercentage.toFixed(0)}% of revenue
              </p>
            </div>
          </div>

          {/* Viability Assessment */}
          <div
            className="rounded-[12px] p-6"
            style={{
              background: roiMid >= 20 ? "var(--success-muted)" : roiMid >= 0 ? "var(--warning-muted)" : "var(--error-muted)",
              border: `1px solid ${roiMid >= 20 ? "var(--success)" : roiMid >= 0 ? "var(--warning)" : "var(--error)"}`
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              {roiMid >= 20 ? (
                <CheckCircleIcon />
              ) : (
                <AlertTriangleIcon />
              )}
              <h4
                className="font-semibold text-[16px]"
                style={{ color: roiMid >= 20 ? "var(--success)" : roiMid >= 0 ? "var(--warning)" : "var(--error)" }}
              >
                {roiMid >= 20 ? "Strong Business Case" :
                 roiMid >= 0 ? "Marginal Business Case" :
                 "High Risk Investment"}
              </h4>
            </div>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              {roiMid >= 20
                ? "This project shows strong financial viability with expected returns exceeding industry benchmarks."
                : roiMid >= 0
                  ? "This project may be viable but requires careful risk management. Consider ways to increase revenue or reduce costs."
                  : "This project is projected to lose money. Significant changes to the business model are recommended before proceeding."}
            </p>
          </div>

          {/* Charts - Cost & Revenue breakdown side by side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Cost Breakdown */}
            <div
              className="rounded-[12px] p-6"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              <h4 className="font-semibold text-[14px] mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <BarChartIcon />
                Cost Breakdown
              </h4>
              {Object.keys(costsByCategory).length === 0 ? (
                <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>No costs added yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(costsByCategory).map(([cat, amount]) => {
                    const catConfig = COST_CATEGORIES[cat as keyof typeof COST_CATEGORIES];
                    const percentage = totalCosts > 0 ? (amount / totalCosts * 100) : 0;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
                            {catConfig.label}
                          </span>
                          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                            ${amount.toLocaleString()} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: "var(--bg-2)" }}
                        >
                          <div
                            className="h-full transition-all"
                            style={{ width: `${percentage}%`, background: catConfig.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Revenue Breakdown */}
            <div
              className="rounded-[12px] p-6"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              <h4 className="font-semibold text-[14px] mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <BarChartIcon />
                Revenue Breakdown
              </h4>
              {Object.keys(revenuesByType).length === 0 ? (
                <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>No revenue streams added yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(revenuesByType).map(([type, amount]) => {
                    const typeConfig = REVENUE_TYPES[type as keyof typeof REVENUE_TYPES];
                    const percentage = totalRevenueMid > 0 ? (amount / totalRevenueMid * 100) : 0;
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
                            {typeConfig.label}
                          </span>
                          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                            ${amount.toLocaleString()} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: "var(--bg-2)" }}
                        >
                          <div
                            className="h-full transition-all"
                            style={{ width: `${percentage}%`, background: typeConfig.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Scenario Comparison */}
          <div
            className="rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <h4 className="font-semibold text-[14px] mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <ScaleIcon />
              Scenario Comparison
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {scenarios.map(scenario => {
                const calc = calculateScenario(scenario);
                return (
                  <div
                    key={scenario.id}
                    className="rounded-[10px] p-4"
                    style={{
                      background: scenario.isBase ? "var(--primary-muted)" : "var(--bg-2)",
                      border: scenario.isBase ? "1px solid var(--primary)" : "1px solid var(--border)"
                    }}
                  >
                    <p className="text-[12px] font-bold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                      {scenario.name}
                    </p>
                    <p
                      className="text-[24px] font-bold mb-1"
                      style={{ color: calc.roi >= 0 ? "var(--success)" : "var(--error)" }}
                    >
                      {calc.roi.toFixed(1)}% ROI
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      Profit: ${calc.profit.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                Total: <strong style={{ color: "var(--text-primary)" }}>${totalRevenueMid.toLocaleString()}</strong>
              </span>
              <span className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                Weighted: <strong style={{ color: "var(--success)" }}>${weightedRevenue.toLocaleString()}</strong>
              </span>
            </div>
            <button
              onClick={() => setShowRevenueModal(true)}
              className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <PlusIcon />
              Add Revenue Stream
            </button>
          </div>

          {revenues.length === 0 ? (
            <div
              className="rounded-[12px] p-12 text-center"
              style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
            >
              <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                No revenue streams added
              </p>
              <p className="text-[13px] mb-4" style={{ color: "var(--text-tertiary)" }}>
                Add projected revenue sources to calculate ROI
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {revenues.map(revenue => {
                const typeConfig = REVENUE_TYPES[revenue.type];
                return (
                  <div
                    key={revenue.id}
                    className="rounded-[10px] p-4"
                    style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                          style={{ background: typeConfig.color, color: "white" }}
                        >
                          <DollarIcon />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                              {revenue.description}
                            </h4>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold"
                              style={{ background: typeConfig.color, color: "white" }}
                            >
                              {typeConfig.label}
                            </span>
                          </div>
                          <p className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                            {revenue.timeframe} • {revenue.probability}% probability
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                            ${revenue.midEstimate.toLocaleString()}
                          </p>
                          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            ${revenue.lowEstimate.toLocaleString()} - ${revenue.highEstimate.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeRevenue(revenue.id)}
                          className="p-2 rounded-[6px]"
                          style={{ color: "var(--error)" }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Costs Tab */}
      {activeTab === "costs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              Total: <strong style={{ color: "var(--text-primary)" }}>${totalCosts.toLocaleString()}</strong>
            </span>
            <button
              onClick={() => setShowCostModal(true)}
              className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <PlusIcon />
              Add Cost
            </button>
          </div>

          {costs.length === 0 ? (
            <div
              className="rounded-[12px] p-12 text-center"
              style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
            >
              <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                No costs added
              </p>
              <p className="text-[13px] mb-4" style={{ color: "var(--text-tertiary)" }}>
                Add project costs to calculate ROI
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {costs.map(cost => {
                const catConfig = COST_CATEGORIES[cost.category];
                return (
                  <div
                    key={cost.id}
                    className="flex items-center justify-between p-4 rounded-[10px]"
                    style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: catConfig.color }}
                      />
                      <div>
                        <p className="font-medium text-[14px]" style={{ color: "var(--text-primary)" }}>
                          {cost.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px]" style={{ color: catConfig.color }}>
                            {catConfig.label}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                            style={{
                              background: cost.isFixed ? "var(--bg-2)" : "var(--warning-muted)",
                              color: cost.isFixed ? "var(--text-tertiary)" : "var(--warning)"
                            }}
                          >
                            {cost.isFixed ? "FIXED" : "VARIABLE"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>
                        ${cost.amount.toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeCost(cost.id)}
                        className="p-2 rounded-[6px]"
                        style={{ color: "var(--error)" }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Scenarios Tab */}
      {activeTab === "scenarios" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {scenarios.map(scenario => {
              const calc = calculateScenario(scenario);
              return (
                <div
                  key={scenario.id}
                  className="rounded-[12px] p-6"
                  style={{
                    background: "var(--bg-1)",
                    border: scenario.isBase ? "2px solid var(--primary)" : "1px solid var(--border)"
                  }}
                >
                  {scenario.isBase && (
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-3"
                      style={{ background: "var(--primary)", color: "white" }}
                    >
                      BASE CASE
                    </span>
                  )}
                  <h4 className="font-bold text-[16px] mb-1" style={{ color: "var(--text-primary)" }}>
                    {scenario.name}
                  </h4>
                  <p className="text-[12px] mb-4" style={{ color: "var(--text-tertiary)" }}>
                    {scenario.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Revenue</span>
                      <span className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>
                        ${calc.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Costs</span>
                      <span className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>
                        ${calc.costs.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <div className="flex justify-between mb-2">
                        <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Net Profit</span>
                        <span
                          className="font-bold text-[14px]"
                          style={{ color: calc.profit >= 0 ? "var(--success)" : "var(--error)" }}
                        >
                          ${calc.profit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>ROI</span>
                        <span
                          className="font-bold text-[18px]"
                          style={{ color: calc.roi >= 0 ? "var(--success)" : "var(--error)" }}
                        >
                          {calc.roi.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-[11px]" style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}>
                    <p>Revenue multiplier: {scenario.revenueMultiplier}x</p>
                    <p>Cost variance: {scenario.costVariance >= 0 ? "+" : ""}{(scenario.costVariance * 100).toFixed(0)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Revenue Modal */}
      {showRevenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-lg rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                Add Revenue Stream
              </h3>
              <button onClick={() => setShowRevenueModal(false)} style={{ color: "var(--text-tertiary)" }}>
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Type
                </label>
                <select
                  value={newRevenue.type || "streaming"}
                  onChange={(e) => setNewRevenue({ ...newRevenue, type: e.target.value as keyof typeof REVENUE_TYPES })}
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  {Object.entries(REVENUE_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Description *
                </label>
                <input
                  type="text"
                  value={newRevenue.description || ""}
                  onChange={(e) => setNewRevenue({ ...newRevenue, description: e.target.value })}
                  placeholder="e.g., Netflix license deal"
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Low Estimate
                  </label>
                  <input
                    type="number"
                    value={newRevenue.lowEstimate || ""}
                    onChange={(e) => setNewRevenue({ ...newRevenue, lowEstimate: parseFloat(e.target.value) || 0 })}
                    placeholder="$0"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Mid Estimate *
                  </label>
                  <input
                    type="number"
                    value={newRevenue.midEstimate || ""}
                    onChange={(e) => setNewRevenue({ ...newRevenue, midEstimate: parseFloat(e.target.value) || 0 })}
                    placeholder="$0"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    High Estimate
                  </label>
                  <input
                    type="number"
                    value={newRevenue.highEstimate || ""}
                    onChange={(e) => setNewRevenue({ ...newRevenue, highEstimate: parseFloat(e.target.value) || 0 })}
                    placeholder="$0"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Timeframe
                  </label>
                  <input
                    type="text"
                    value={newRevenue.timeframe || ""}
                    onChange={(e) => setNewRevenue({ ...newRevenue, timeframe: e.target.value })}
                    placeholder="e.g., Year 1"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newRevenue.probability || 80}
                    onChange={(e) => setNewRevenue({ ...newRevenue, probability: parseInt(e.target.value) || 80 })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRevenueModal(false)}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={addRevenue}
                disabled={!newRevenue.description || !newRevenue.midEstimate}
                className="px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                style={{
                  background: newRevenue.description && newRevenue.midEstimate ? "var(--primary)" : "var(--bg-2)",
                  color: newRevenue.description && newRevenue.midEstimate ? "white" : "var(--text-tertiary)"
                }}
              >
                Add Revenue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Cost Modal */}
      {showCostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-lg rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                Add Cost
              </h3>
              <button onClick={() => setShowCostModal(false)} style={{ color: "var(--text-tertiary)" }}>
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Category
                </label>
                <select
                  value={newCost.category || "production"}
                  onChange={(e) => setNewCost({ ...newCost, category: e.target.value as keyof typeof COST_CATEGORIES })}
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  {Object.entries(COST_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Description *
                </label>
                <input
                  type="text"
                  value={newCost.description || ""}
                  onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                  placeholder="e.g., Principal photography"
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Amount ($) *
                </label>
                <input
                  type="number"
                  value={newCost.amount || ""}
                  onChange={(e) => setNewCost({ ...newCost, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCost.isFixed ?? true}
                    onChange={(e) => setNewCost({ ...newCost, isFixed: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    Fixed cost (does not vary with production scale)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCostModal(false)}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={addCost}
                disabled={!newCost.description || !newCost.amount}
                className="px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                style={{
                  background: newCost.description && newCost.amount ? "var(--primary)" : "var(--bg-2)",
                  color: newCost.description && newCost.amount ? "white" : "var(--text-tertiary)"
                }}
              >
                Add Cost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
