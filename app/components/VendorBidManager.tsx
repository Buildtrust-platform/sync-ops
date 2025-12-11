"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * VENDOR BID MANAGER COMPONENT
 * RFP creation, bid collection, and vendor comparison tool
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const BriefcaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
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

const XCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M8 6h.01"/>
    <path d="M16 6h.01"/>
    <path d="M12 6h.01"/>
    <path d="M12 10h.01"/>
    <path d="M12 14h.01"/>
    <path d="M16 10h.01"/>
    <path d="M16 14h.01"/>
    <path d="M8 10h.01"/>
    <path d="M8 14h.01"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const AwardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

// Vendor categories
const VENDOR_CATEGORIES = {
  production: { label: "Production Company", color: "#3B82F6" },
  postProduction: { label: "Post Production", color: "#8B5CF6" },
  vfx: { label: "VFX Studio", color: "#EC4899" },
  camera: { label: "Camera/Equipment", color: "#10B981" },
  lighting: { label: "Lighting", color: "#F59E0B" },
  sound: { label: "Sound/Audio", color: "#06B6D4" },
  talent: { label: "Talent Agency", color: "#EF4444" },
  location: { label: "Location Services", color: "#84CC16" },
  catering: { label: "Catering", color: "#F97316" },
  transport: { label: "Transport/Logistics", color: "#6366F1" },
  other: { label: "Other", color: "#6B7280" }
};

// Bid status
const BID_STATUS = {
  draft: { label: "Draft", color: "var(--text-tertiary)", icon: FileTextIcon },
  sent: { label: "RFP Sent", color: "var(--info)", icon: SendIcon },
  received: { label: "Bid Received", color: "var(--warning)", icon: ClockIcon },
  reviewing: { label: "Under Review", color: "var(--primary)", icon: BarChartIcon },
  shortlisted: { label: "Shortlisted", color: "var(--success)", icon: StarIcon },
  awarded: { label: "Awarded", color: "var(--success)", icon: AwardIcon },
  declined: { label: "Declined", color: "var(--error)", icon: XCircleIcon }
};

interface Vendor {
  id: string;
  name: string;
  category: keyof typeof VENDOR_CATEGORIES;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  rating?: number;
  notes?: string;
  previousWork?: string[];
}

interface BidItem {
  id: string;
  description: string;
  quantity?: number;
  unit?: string;
  estimatedCost?: number;
}

interface Bid {
  id: string;
  vendorId: string;
  rfpId: string;
  status: keyof typeof BID_STATUS;
  totalAmount?: number;
  currency: string;
  submittedAt?: string;
  validUntil?: string;
  lineItems: BidItem[];
  notes?: string;
  attachments?: string[];
  rating?: number;
  strengths?: string[];
  concerns?: string[];
}

interface RFP {
  id: string;
  title: string;
  category: keyof typeof VENDOR_CATEGORIES;
  description: string;
  requirements: string[];
  deadline: string;
  budget?: { min: number; max: number };
  status: "draft" | "open" | "closed" | "awarded";
  createdAt: string;
  vendorIds: string[];
  awardedVendorId?: string;
}

interface VendorBidManagerProps {
  project: Schema["Project"]["type"];
  onSave?: (data: { vendors: Vendor[]; rfps: RFP[]; bids: Bid[] }) => Promise<void>;
}

export default function VendorBidManager({ project, onSave }: VendorBidManagerProps) {
  const [activeTab, setActiveTab] = useState<"vendors" | "rfps" | "comparison">("vendors");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showRfpModal, setShowRfpModal] = useState(false);
  const [selectedRfp, setSelectedRfp] = useState<RFP | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({ category: "production" });
  const [newRfp, setNewRfp] = useState<Partial<RFP>>({
    category: "production",
    requirements: [],
    vendorIds: [],
    status: "draft"
  });
  const [requirementInput, setRequirementInput] = useState("");

  // Derived data
  const vendorsByCategory = vendors.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const openRfpCount = rfps.filter(r => r.status === "open").length;
  const pendingBidsCount = bids.filter(b => b.status === "received" || b.status === "reviewing").length;

  const addVendor = () => {
    if (!newVendor.name || !newVendor.email) return;

    const vendor: Vendor = {
      id: `${Date.now()}`,
      name: newVendor.name,
      category: newVendor.category || "other",
      contactName: newVendor.contactName || "",
      email: newVendor.email,
      phone: newVendor.phone,
      website: newVendor.website,
      notes: newVendor.notes
    };

    setVendors([...vendors, vendor]);
    setNewVendor({ category: "production" });
    setShowVendorModal(false);
  };

  const removeVendor = (id: string) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

  const addRequirement = () => {
    if (!requirementInput.trim()) return;
    setNewRfp({
      ...newRfp,
      requirements: [...(newRfp.requirements || []), requirementInput.trim()]
    });
    setRequirementInput("");
  };

  const removeRequirement = (index: number) => {
    setNewRfp({
      ...newRfp,
      requirements: newRfp.requirements?.filter((_, i) => i !== index)
    });
  };

  const createRfp = () => {
    if (!newRfp.title || !newRfp.deadline) return;

    const rfp: RFP = {
      id: `${Date.now()}`,
      title: newRfp.title,
      category: newRfp.category || "production",
      description: newRfp.description || "",
      requirements: newRfp.requirements || [],
      deadline: newRfp.deadline,
      budget: newRfp.budget,
      status: "draft",
      createdAt: new Date().toISOString(),
      vendorIds: newRfp.vendorIds || []
    };

    setRfps([...rfps, rfp]);
    setNewRfp({ category: "production", requirements: [], vendorIds: [], status: "draft" });
    setShowRfpModal(false);
  };

  const sendRfp = (rfpId: string) => {
    setRfps(rfps.map(r =>
      r.id === rfpId ? { ...r, status: "open" as const } : r
    ));

    // Create placeholder bids for selected vendors
    const rfp = rfps.find(r => r.id === rfpId);
    if (rfp) {
      const newBids: Bid[] = rfp.vendorIds.map(vendorId => ({
        id: `${Date.now()}-${vendorId}`,
        vendorId,
        rfpId,
        status: "sent" as const,
        currency: "USD",
        lineItems: []
      }));
      setBids([...bids, ...newBids]);
    }
  };

  const toggleVendorForRfp = (vendorId: string) => {
    const currentIds = newRfp.vendorIds || [];
    if (currentIds.includes(vendorId)) {
      setNewRfp({ ...newRfp, vendorIds: currentIds.filter(id => id !== vendorId) });
    } else {
      setNewRfp({ ...newRfp, vendorIds: [...currentIds, vendorId] });
    }
  };

  const updateBidStatus = (bidId: string, status: keyof typeof BID_STATUS) => {
    setBids(bids.map(b => b.id === bidId ? { ...b, status } : b));
  };

  const awardBid = (rfpId: string, vendorId: string) => {
    setRfps(rfps.map(r =>
      r.id === rfpId ? { ...r, status: "awarded" as const, awardedVendorId: vendorId } : r
    ));
    setBids(bids.map(b =>
      b.rfpId === rfpId
        ? { ...b, status: b.vendorId === vendorId ? "awarded" as const : "declined" as const }
        : b
    ));
  };

  // Get bids for comparison view
  const getBidsForRfp = (rfpId: string) => {
    return bids.filter(b => b.rfpId === rfpId);
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
              <span style={{ color: "var(--primary)" }}><BriefcaseIcon /></span>
              Vendor & Bid Management
            </h3>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Create RFPs, collect bids, and compare vendors for informed decisions
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--text-primary)" }}>
                {vendors.length}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Vendors
              </div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--warning)" }}>
                {openRfpCount}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Open RFPs
              </div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--info)" }}>
                {pendingBidsCount}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Pending Bids
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: "vendors", label: "Vendor Database" },
            { id: "rfps", label: "RFPs & Bids" },
            { id: "comparison", label: "Bid Comparison" }
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

      {/* Vendors Tab */}
      {activeTab === "vendors" && (
        <div className="space-y-4">
          {/* Add vendor button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 overflow-x-auto">
              {Object.entries(vendorsByCategory).map(([cat, count]) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap"
                  style={{
                    background: VENDOR_CATEGORIES[cat as keyof typeof VENDOR_CATEGORIES]?.color || "#6B7280",
                    color: "white"
                  }}
                >
                  {VENDOR_CATEGORIES[cat as keyof typeof VENDOR_CATEGORIES]?.label}: {count}
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowVendorModal(true)}
              className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <PlusIcon />
              Add Vendor
            </button>
          </div>

          {/* Vendors list */}
          {vendors.length === 0 ? (
            <div
              className="rounded-[12px] p-12 text-center"
              style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
            >
              <div className="mb-4" style={{ color: "var(--text-tertiary)" }}>
                <BuildingIcon />
              </div>
              <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                No vendors added yet
              </p>
              <p className="text-[13px] mb-4" style={{ color: "var(--text-tertiary)" }}>
                Build your vendor database to streamline bid collection
              </p>
              <button
                onClick={() => setShowVendorModal(true)}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ background: "var(--primary)", color: "white" }}
              >
                Add First Vendor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map(vendor => {
                const categoryConfig = VENDOR_CATEGORIES[vendor.category];
                return (
                  <div
                    key={vendor.id}
                    className="rounded-[10px] p-4"
                    style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-[8px] flex items-center justify-center text-[16px] font-bold"
                          style={{ background: categoryConfig.color, color: "white" }}
                        >
                          {vendor.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                            {vendor.name}
                          </h4>
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: categoryConfig.color }}
                          >
                            {categoryConfig.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingVendor(vendor)}
                          className="p-1.5 rounded transition-all"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => removeVendor(vendor.id)}
                          className="p-1.5 rounded transition-all"
                          style={{ color: "var(--error)" }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-[12px]">
                      {vendor.contactName && (
                        <p style={{ color: "var(--text-secondary)" }}>
                          Contact: {vendor.contactName}
                        </p>
                      )}
                      <div className="flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                        <MailIcon />
                        <span>{vendor.email}</span>
                      </div>
                      {vendor.phone && (
                        <div className="flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                          <PhoneIcon />
                          <span>{vendor.phone}</span>
                        </div>
                      )}
                    </div>

                    {vendor.rating && (
                      <div className="flex items-center gap-1 mt-3">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} style={{ color: star <= vendor.rating! ? "var(--warning)" : "var(--border)" }}>
                            <StarIcon filled={star <= vendor.rating!} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RFPs Tab */}
      {activeTab === "rfps" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowRfpModal(true)}
              className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <PlusIcon />
              Create RFP
            </button>
          </div>

          {rfps.length === 0 ? (
            <div
              className="rounded-[12px] p-12 text-center"
              style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
            >
              <div className="mb-4" style={{ color: "var(--text-tertiary)" }}>
                <FileTextIcon />
              </div>
              <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                No RFPs created yet
              </p>
              <p className="text-[13px] mb-4" style={{ color: "var(--text-tertiary)" }}>
                Create a Request for Proposal to collect vendor bids
              </p>
              <button
                onClick={() => setShowRfpModal(true)}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ background: "var(--primary)", color: "white" }}
              >
                Create First RFP
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rfps.map(rfp => {
                const rfpBids = getBidsForRfp(rfp.id);
                const categoryConfig = VENDOR_CATEGORIES[rfp.category];
                return (
                  <div
                    key={rfp.id}
                    className="rounded-[10px] overflow-hidden"
                    style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                  >
                    {/* RFP Header */}
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer"
                      style={{ background: "var(--bg-2)" }}
                      onClick={() => setSelectedRfp(selectedRfp?.id === rfp.id ? null : rfp)}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="px-2 py-1 rounded text-[11px] font-bold"
                          style={{ background: categoryConfig.color, color: "white" }}
                        >
                          {categoryConfig.label}
                        </span>
                        <div>
                          <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                            {rfp.title}
                          </h4>
                          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                            Deadline: {new Date(rfp.deadline).toLocaleDateString()} • {rfpBids.length} vendors
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="px-3 py-1 rounded-full text-[11px] font-bold"
                          style={{
                            background: rfp.status === "awarded" ? "var(--success-muted)" :
                              rfp.status === "open" ? "var(--warning-muted)" :
                              rfp.status === "closed" ? "var(--error-muted)" : "var(--bg-1)",
                            color: rfp.status === "awarded" ? "var(--success)" :
                              rfp.status === "open" ? "var(--warning)" :
                              rfp.status === "closed" ? "var(--error)" : "var(--text-tertiary)"
                          }}
                        >
                          {rfp.status.toUpperCase()}
                        </span>
                        {rfp.status === "draft" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); sendRfp(rfp.id); }}
                            className="px-3 py-1.5 rounded-[6px] font-medium text-[12px] flex items-center gap-1"
                            style={{ background: "var(--primary)", color: "white" }}
                          >
                            <SendIcon />
                            Send RFP
                          </button>
                        )}
                      </div>
                    </div>

                    {/* RFP Details */}
                    {selectedRfp?.id === rfp.id && (
                      <div className="p-4 space-y-4">
                        {rfp.description && (
                          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                            {rfp.description}
                          </p>
                        )}

                        {rfp.requirements.length > 0 && (
                          <div>
                            <h5 className="text-[12px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                              Requirements
                            </h5>
                            <ul className="space-y-1">
                              {rfp.requirements.map((req, i) => (
                                <li key={i} className="text-[13px] flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                                  <span style={{ color: "var(--success)" }}>•</span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {rfp.budget && (
                          <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
                            <DollarIcon />
                            Budget Range: ${rfp.budget.min.toLocaleString()} - ${rfp.budget.max.toLocaleString()}
                          </div>
                        )}

                        {/* Bids for this RFP */}
                        <div>
                          <h5 className="text-[12px] font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                            Vendor Bids
                          </h5>
                          <div className="space-y-2">
                            {rfpBids.map(bid => {
                              const vendor = vendors.find(v => v.id === bid.vendorId);
                              const statusConfig = BID_STATUS[bid.status];
                              const StatusIcon = statusConfig.icon;
                              return (
                                <div
                                  key={bid.id}
                                  className="flex items-center justify-between p-3 rounded-[8px]"
                                  style={{ background: "var(--bg-2)" }}
                                >
                                  <div className="flex items-center gap-3">
                                    <span style={{ color: statusConfig.color }}><StatusIcon /></span>
                                    <div>
                                      <p className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>
                                        {vendor?.name || "Unknown Vendor"}
                                      </p>
                                      <span className="text-[11px]" style={{ color: statusConfig.color }}>
                                        {statusConfig.label}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {bid.totalAmount && (
                                      <span className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                                        ${bid.totalAmount.toLocaleString()}
                                      </span>
                                    )}
                                    {rfp.status === "open" && bid.status !== "awarded" && (
                                      <select
                                        value={bid.status}
                                        onChange={(e) => updateBidStatus(bid.id, e.target.value as keyof typeof BID_STATUS)}
                                        className="px-2 py-1 rounded text-[11px]"
                                        style={{ background: "var(--bg-1)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                                      >
                                        {Object.entries(BID_STATUS).map(([key, status]) => (
                                          <option key={key} value={key}>{status.label}</option>
                                        ))}
                                      </select>
                                    )}
                                    {bid.status === "shortlisted" && rfp.status !== "awarded" && (
                                      <button
                                        onClick={() => awardBid(rfp.id, bid.vendorId)}
                                        className="px-3 py-1 rounded-[6px] text-[11px] font-bold flex items-center gap-1"
                                        style={{ background: "var(--success)", color: "white" }}
                                      >
                                        <AwardIcon />
                                        Award
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === "comparison" && (
        <div className="space-y-4">
          {rfps.filter(r => r.status === "open" || r.status === "awarded").length === 0 ? (
            <div
              className="rounded-[12px] p-12 text-center"
              style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
            >
              <div className="mb-4" style={{ color: "var(--text-tertiary)" }}>
                <BarChartIcon />
              </div>
              <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                No bids to compare
              </p>
              <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                Send RFPs and collect bids to use the comparison tool
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {rfps.filter(r => r.status === "open" || r.status === "awarded").map(rfp => {
                const rfpBids = getBidsForRfp(rfp.id).filter(b => b.totalAmount);
                if (rfpBids.length === 0) return null;

                const lowestBid = Math.min(...rfpBids.map(b => b.totalAmount || 0));
                const highestBid = Math.max(...rfpBids.map(b => b.totalAmount || 0));

                return (
                  <div
                    key={rfp.id}
                    className="rounded-[12px] p-6"
                    style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                  >
                    <h4 className="font-semibold text-[16px] mb-4" style={{ color: "var(--text-primary)" }}>
                      {rfp.title}
                    </h4>

                    <div className="space-y-3">
                      {rfpBids.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0)).map((bid, index) => {
                        const vendor = vendors.find(v => v.id === bid.vendorId);
                        const percentage = highestBid > lowestBid
                          ? ((bid.totalAmount || 0) - lowestBid) / (highestBid - lowestBid)
                          : 0;
                        const isLowest = bid.totalAmount === lowestBid;
                        const isAwarded = bid.status === "awarded";

                        return (
                          <div
                            key={bid.id}
                            className="p-4 rounded-[10px]"
                            style={{
                              background: isAwarded ? "var(--success-muted)" : "var(--bg-2)",
                              border: isAwarded ? "1px solid var(--success)" : "1px solid var(--border)"
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                                  style={{
                                    background: index === 0 ? "var(--success)" : "var(--bg-1)",
                                    color: index === 0 ? "white" : "var(--text-secondary)"
                                  }}
                                >
                                  {index + 1}
                                </span>
                                <span className="font-medium text-[14px]" style={{ color: "var(--text-primary)" }}>
                                  {vendor?.name}
                                </span>
                                {isAwarded && (
                                  <span
                                    className="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
                                    style={{ background: "var(--success)", color: "white" }}
                                  >
                                    <AwardIcon />
                                    AWARDED
                                  </span>
                                )}
                                {isLowest && !isAwarded && (
                                  <span
                                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                                    style={{ background: "var(--info)", color: "white" }}
                                  >
                                    LOWEST
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-[16px]" style={{ color: "var(--text-primary)" }}>
                                ${bid.totalAmount?.toLocaleString()}
                              </span>
                            </div>

                            {/* Bar visualization */}
                            <div
                              className="h-2 rounded-full overflow-hidden"
                              style={{ background: "var(--bg-1)" }}
                            >
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${Math.max(20, (1 - percentage) * 100)}%`,
                                  background: isAwarded ? "var(--success)" :
                                    isLowest ? "var(--info)" : "var(--primary)"
                                }}
                              />
                            </div>

                            {/* Strengths & Concerns */}
                            {(bid.strengths?.length || bid.concerns?.length) && (
                              <div className="mt-3 grid grid-cols-2 gap-4">
                                {bid.strengths && bid.strengths.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--success)" }}>
                                      Strengths
                                    </p>
                                    {bid.strengths.map((s, i) => (
                                      <p key={i} className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                                        • {s}
                                      </p>
                                    ))}
                                  </div>
                                )}
                                {bid.concerns && bid.concerns.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--warning)" }}>
                                      Concerns
                                    </p>
                                    {bid.concerns.map((c, i) => (
                                      <p key={i} className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                                        • {c}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 flex items-center justify-between text-[12px]" style={{ borderTop: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>
                        {rfpBids.length} bids received
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        Range: ${lowestBid.toLocaleString()} - ${highestBid.toLocaleString()}
                        {highestBid > lowestBid && (
                          <span style={{ color: "var(--info)" }}>
                            {" "}(${(highestBid - lowestBid).toLocaleString()} spread)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Vendor Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-lg rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                Add Vendor
              </h3>
              <button onClick={() => setShowVendorModal(false)} style={{ color: "var(--text-tertiary)" }}>
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={newVendor.name || ""}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Category
                  </label>
                  <select
                    value={newVendor.category || "production"}
                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value as keyof typeof VENDOR_CATEGORIES })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    {Object.entries(VENDOR_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Contact Name
                </label>
                <input
                  type="text"
                  value={newVendor.contactName || ""}
                  onChange={(e) => setNewVendor({ ...newVendor, contactName: e.target.value })}
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newVendor.email || ""}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newVendor.phone || ""}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Website
                </label>
                <input
                  type="url"
                  value={newVendor.website || ""}
                  onChange={(e) => setNewVendor({ ...newVendor, website: e.target.value })}
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Notes
                </label>
                <textarea
                  value={newVendor.notes || ""}
                  onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-[6px] text-[14px] resize-none"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowVendorModal(false)}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={addVendor}
                disabled={!newVendor.name || !newVendor.email}
                className="px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                style={{
                  background: newVendor.name && newVendor.email ? "var(--primary)" : "var(--bg-2)",
                  color: newVendor.name && newVendor.email ? "white" : "var(--text-tertiary)"
                }}
              >
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create RFP Modal */}
      {showRfpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                Create RFP
              </h3>
              <button onClick={() => setShowRfpModal(false)} style={{ color: "var(--text-tertiary)" }}>
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newRfp.title || ""}
                    onChange={(e) => setNewRfp({ ...newRfp, title: e.target.value })}
                    placeholder="e.g., Post Production Services"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Category
                  </label>
                  <select
                    value={newRfp.category || "production"}
                    onChange={(e) => setNewRfp({ ...newRfp, category: e.target.value as keyof typeof VENDOR_CATEGORIES })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    {Object.entries(VENDOR_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Description
                </label>
                <textarea
                  value={newRfp.description || ""}
                  onChange={(e) => setNewRfp({ ...newRfp, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the scope of work..."
                  className="w-full px-4 py-2 rounded-[6px] text-[14px] resize-none"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={newRfp.deadline || ""}
                    onChange={(e) => setNewRfp({ ...newRfp, deadline: e.target.value })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Budget Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={newRfp.budget?.min || ""}
                      onChange={(e) => setNewRfp({
                        ...newRfp,
                        budget: { min: parseInt(e.target.value) || 0, max: newRfp.budget?.max || 0 }
                      })}
                      className="w-full px-3 py-2 rounded-[6px] text-[14px]"
                      style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    />
                    <span style={{ color: "var(--text-tertiary)" }}>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={newRfp.budget?.max || ""}
                      onChange={(e) => setNewRfp({
                        ...newRfp,
                        budget: { min: newRfp.budget?.min || 0, max: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 rounded-[6px] text-[14px]"
                      style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    />
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Requirements
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                    placeholder="Add a requirement..."
                    className="flex-1 px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={addRequirement}
                    className="px-3 py-2 rounded-[6px]"
                    style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                  >
                    <PlusIcon />
                  </button>
                </div>
                {newRfp.requirements && newRfp.requirements.length > 0 && (
                  <div className="space-y-1">
                    {newRfp.requirements.map((req, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2 rounded-[6px]"
                        style={{ background: "var(--bg-2)" }}
                      >
                        <span className="text-[13px]" style={{ color: "var(--text-primary)" }}>{req}</span>
                        <button onClick={() => removeRequirement(i)} style={{ color: "var(--error)" }}>
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Select Vendors */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Select Vendors to Invite
                </label>
                {vendors.filter(v => v.category === newRfp.category || newRfp.category === "other").length === 0 ? (
                  <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                    No vendors in this category. Add vendors first.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {vendors.filter(v => v.category === newRfp.category || newRfp.category === "other").map(vendor => (
                      <label
                        key={vendor.id}
                        className="flex items-center gap-3 p-2 rounded-[6px] cursor-pointer transition-all"
                        style={{
                          background: newRfp.vendorIds?.includes(vendor.id) ? "var(--primary-muted)" : "var(--bg-2)",
                          border: newRfp.vendorIds?.includes(vendor.id) ? "1px solid var(--primary)" : "1px solid transparent"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={newRfp.vendorIds?.includes(vendor.id) || false}
                          onChange={() => toggleVendorForRfp(vendor.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                          {vendor.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRfpModal(false)}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={createRfp}
                disabled={!newRfp.title || !newRfp.deadline}
                className="px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                style={{
                  background: newRfp.title && newRfp.deadline ? "var(--primary)" : "var(--bg-2)",
                  color: newRfp.title && newRfp.deadline ? "white" : "var(--text-tertiary)"
                }}
              >
                Create RFP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
