"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import { uploadData, getUrl } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import { useToast } from "./Toast";

/**
 * DIGITAL RIGHTS LOCKER MODULE (Module 6 - Legal Document Management)
 *
 * Purpose: Centralized management of all production legal documents
 *
 * Features:
 * - Document upload and categorization
 * - Expiration tracking and alerts
 * - Status workflow (Draft → Review → Approved/Rejected)
 * - Linkage to projects, shoot days, locations, people
 * - Compliance dashboard
 */

type DocumentType =
  | "LOCATION_PERMIT"
  | "TALENT_RELEASE"
  | "MODEL_RELEASE"
  | "MINOR_RELEASE"
  | "PROPERTY_RELEASE"
  | "DRONE_PERMIT"
  | "FILMING_PERMIT"
  | "INSURANCE_CERTIFICATE"
  | "LIABILITY_WAIVER"
  | "NDA"
  | "CONTRACT"
  | "WORK_PERMIT"
  | "VISA"
  | "RISK_ASSESSMENT"
  | "SAFETY_PLAN"
  | "MUSIC_LICENSE"
  | "STOCK_LICENSE"
  | "ARCHIVE_LICENSE"
  | "DISTRIBUTION_AGREEMENT"
  | "OTHER";

type DocumentStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PENDING_SIGNATURE"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "REVOKED";

interface RightsDocument {
  id: string;
  name: string;
  description?: string | null;
  documentType?: DocumentType | null;
  status?: DocumentStatus | null;
  issueDate?: string | null;
  effectiveDate?: string | null;
  expirationDate?: string | null;
  projectId: string;
  shootDay?: string | null;
  locationName?: string | null;
  locationAddress?: string | null;
  personName?: string | null;
  personEmail?: string | null;
  personRole?: string | null;
  documentNumber?: string | null;
  issuingAuthority?: string | null;
  jurisdiction?: string | null;
  coverageType?: string | null;
  coverageAmount?: string | null;
  restrictions?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedBy: string;
  uploadedByName?: string | null;
  approvedBy?: string | null;
  approvedByName?: string | null;
  approvalDate?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  isRequired?: boolean | null;
  isCritical?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface DigitalRightsLockerProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
  currentUserName?: string;
}

const DOCUMENT_TYPE_CONFIG: Record<DocumentType, { icon: string; label: string; category: string }> = {
  LOCATION_PERMIT: { icon: "📍", label: "Location Permit", category: "Permits" },
  TALENT_RELEASE: { icon: "🎭", label: "Talent Release", category: "Releases" },
  MODEL_RELEASE: { icon: "📸", label: "Model Release", category: "Releases" },
  MINOR_RELEASE: { icon: "👶", label: "Minor Release", category: "Releases" },
  PROPERTY_RELEASE: { icon: "🏠", label: "Property Release", category: "Releases" },
  DRONE_PERMIT: { icon: "🚁", label: "Drone Permit", category: "Permits" },
  FILMING_PERMIT: { icon: "🎬", label: "Filming Permit", category: "Permits" },
  INSURANCE_CERTIFICATE: { icon: "🛡️", label: "Insurance Certificate", category: "Insurance" },
  LIABILITY_WAIVER: { icon: "⚠️", label: "Liability Waiver", category: "Legal" },
  NDA: { icon: "🤐", label: "NDA", category: "Legal" },
  CONTRACT: { icon: "📝", label: "Contract", category: "Legal" },
  WORK_PERMIT: { icon: "💼", label: "Work Permit", category: "Permits" },
  VISA: { icon: "🛂", label: "Visa", category: "Permits" },
  RISK_ASSESSMENT: { icon: "⚡", label: "Risk Assessment", category: "Safety" },
  SAFETY_PLAN: { icon: "🦺", label: "Safety Plan", category: "Safety" },
  MUSIC_LICENSE: { icon: "🎵", label: "Music License", category: "Licenses" },
  STOCK_LICENSE: { icon: "🖼️", label: "Stock License", category: "Licenses" },
  ARCHIVE_LICENSE: { icon: "📚", label: "Archive License", category: "Licenses" },
  DISTRIBUTION_AGREEMENT: { icon: "📤", label: "Distribution Agreement", category: "Legal" },
  OTHER: { icon: "📄", label: "Other", category: "Other" },
};

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: "Draft", color: "text-gray-400", bgColor: "bg-gray-500" },
  PENDING_REVIEW: { label: "Pending Review", color: "text-yellow-400", bgColor: "bg-yellow-500" },
  PENDING_SIGNATURE: { label: "Pending Signature", color: "text-orange-400", bgColor: "bg-orange-500" },
  APPROVED: { label: "Approved", color: "text-green-400", bgColor: "bg-green-500" },
  REJECTED: { label: "Rejected", color: "text-red-400", bgColor: "bg-red-500" },
  EXPIRED: { label: "Expired", color: "text-red-400", bgColor: "bg-red-600" },
  REVOKED: { label: "Revoked", color: "text-slate-400", bgColor: "bg-slate-500" },
};

const CATEGORIES = ["All", "Permits", "Releases", "Insurance", "Legal", "Safety", "Licenses", "Other"];

// Dropdown options for form fields
const PERSON_ROLES = [
  { value: "", label: "Select a role..." },
  { value: "Lead Actor", label: "Lead Actor" },
  { value: "Supporting Actor", label: "Supporting Actor" },
  { value: "Extra", label: "Extra" },
  { value: "Stunt Performer", label: "Stunt Performer" },
  { value: "Voice Actor", label: "Voice Actor" },
  { value: "Director", label: "Director" },
  { value: "Producer", label: "Producer" },
  { value: "Cinematographer", label: "Cinematographer" },
  { value: "Camera Operator", label: "Camera Operator" },
  { value: "Sound Mixer", label: "Sound Mixer" },
  { value: "Gaffer", label: "Gaffer" },
  { value: "Grip", label: "Grip" },
  { value: "Production Designer", label: "Production Designer" },
  { value: "Art Director", label: "Art Director" },
  { value: "Costume Designer", label: "Costume Designer" },
  { value: "Makeup Artist", label: "Makeup Artist" },
  { value: "Hair Stylist", label: "Hair Stylist" },
  { value: "Editor", label: "Editor" },
  { value: "VFX Artist", label: "VFX Artist" },
  { value: "Composer", label: "Composer" },
  { value: "Location Owner", label: "Location Owner" },
  { value: "Property Owner", label: "Property Owner" },
  { value: "Vendor", label: "Vendor" },
  { value: "Contractor", label: "Contractor" },
  { value: "Other", label: "Other" },
];

const ISSUING_AUTHORITIES = [
  { value: "", label: "Select authority..." },
  // US Film Offices
  { value: "FilmLA", label: "FilmLA (Los Angeles)" },
  { value: "NYC Mayor's Office of Media", label: "NYC Mayor's Office of Media" },
  { value: "Georgia Film Office", label: "Georgia Film Office" },
  { value: "New Mexico Film Office", label: "New Mexico Film Office" },
  { value: "Texas Film Commission", label: "Texas Film Commission" },
  { value: "Illinois Film Office", label: "Illinois Film Office" },
  // International
  { value: "Film London", label: "Film London (UK)" },
  { value: "British Film Commission", label: "British Film Commission (UK)" },
  { value: "CNC", label: "CNC (France)" },
  { value: "Paris Film Office", label: "Paris Film Office" },
  { value: "FFA", label: "FFA (Germany)" },
  { value: "Screen Australia", label: "Screen Australia" },
  { value: "Screen NSW", label: "Screen NSW" },
  { value: "Ontario Creates", label: "Ontario Creates (Canada)" },
  { value: "BC Film Commission", label: "BC Film Commission (Canada)" },
  { value: "Dubai Film Commission", label: "Dubai Film Commission (UAE)" },
  // Government
  { value: "FAA", label: "FAA (Drone - USA)" },
  { value: "CAA", label: "CAA (Drone - UK)" },
  { value: "City Council", label: "City Council" },
  { value: "Borough Council", label: "Borough Council" },
  { value: "County Clerk", label: "County Clerk" },
  { value: "State Department", label: "State Department" },
  { value: "Immigration Office", label: "Immigration Office" },
  // Insurance
  { value: "Insurance Company", label: "Insurance Company" },
  { value: "Lloyd's of London", label: "Lloyd's of London" },
  // Other
  { value: "Music Publisher", label: "Music Publisher" },
  { value: "Stock Agency", label: "Stock Agency" },
  { value: "Archive", label: "Archive" },
  { value: "Union/Guild", label: "Union/Guild" },
  { value: "Other", label: "Other" },
];

const JURISDICTIONS = [
  { value: "", label: "Select jurisdiction..." },
  // US States
  { value: "California, USA", label: "California, USA" },
  { value: "New York, USA", label: "New York, USA" },
  { value: "Georgia, USA", label: "Georgia, USA" },
  { value: "Texas, USA", label: "Texas, USA" },
  { value: "Louisiana, USA", label: "Louisiana, USA" },
  { value: "New Mexico, USA", label: "New Mexico, USA" },
  { value: "Illinois, USA", label: "Illinois, USA" },
  { value: "Florida, USA", label: "Florida, USA" },
  // Countries
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "France", label: "France" },
  { value: "Germany", label: "Germany" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Japan", label: "Japan" },
  { value: "UAE", label: "United Arab Emirates" },
  { value: "Spain", label: "Spain" },
  { value: "Italy", label: "Italy" },
  { value: "Mexico", label: "Mexico" },
  { value: "South Korea", label: "South Korea" },
  { value: "India", label: "India" },
  { value: "Brazil", label: "Brazil" },
  // Cities
  { value: "Los Angeles, CA", label: "Los Angeles, CA" },
  { value: "New York City, NY", label: "New York City, NY" },
  { value: "Atlanta, GA", label: "Atlanta, GA" },
  { value: "Chicago, IL", label: "Chicago, IL" },
  { value: "London, UK", label: "London, UK" },
  { value: "Paris, France", label: "Paris, France" },
  { value: "Toronto, Canada", label: "Toronto, Canada" },
  { value: "Vancouver, Canada", label: "Vancouver, Canada" },
  { value: "Sydney, Australia", label: "Sydney, Australia" },
  { value: "Dubai, UAE", label: "Dubai, UAE" },
  { value: "Other", label: "Other" },
];

const COVERAGE_TYPES = [
  { value: "", label: "Select coverage type..." },
  // Location Coverage
  { value: "All project locations", label: "All project locations" },
  { value: "Single location only", label: "Single location only" },
  { value: "Interior only", label: "Interior only" },
  { value: "Exterior only", label: "Exterior only" },
  { value: "Interior and exterior", label: "Interior and exterior" },
  { value: "Public areas only", label: "Public areas only" },
  { value: "Private property only", label: "Private property only" },
  // Time Coverage
  { value: "Full production period", label: "Full production period" },
  { value: "Single day", label: "Single day" },
  { value: "Specific dates", label: "Specific dates" },
  { value: "Pre-production only", label: "Pre-production only" },
  { value: "Principal photography", label: "Principal photography" },
  { value: "Post-production only", label: "Post-production only" },
  // Person Coverage
  { value: "All appearances", label: "All appearances" },
  { value: "Specific scenes only", label: "Specific scenes only" },
  { value: "Background only", label: "Background only" },
  { value: "Voice/audio only", label: "Voice/audio only" },
  { value: "Likeness only", label: "Likeness only" },
  // Usage Rights
  { value: "All media worldwide", label: "All media worldwide" },
  { value: "Theatrical release", label: "Theatrical release" },
  { value: "Streaming platforms", label: "Streaming platforms" },
  { value: "Television broadcast", label: "Television broadcast" },
  { value: "Online/digital only", label: "Online/digital only" },
  { value: "Festival use only", label: "Festival use only" },
  { value: "Promotional use only", label: "Promotional use only" },
  { value: "Limited territory", label: "Limited territory" },
  { value: "Perpetual/unlimited", label: "Perpetual/unlimited" },
  // Insurance
  { value: "General liability", label: "General liability" },
  { value: "Equipment coverage", label: "Equipment coverage" },
  { value: "Workers compensation", label: "Workers compensation" },
  { value: "Errors & omissions", label: "Errors & omissions" },
  { value: "Drone/aerial coverage", label: "Drone/aerial coverage" },
  { value: "Vehicle coverage", label: "Vehicle coverage" },
  { value: "Other", label: "Other" },
];

const COVERAGE_AMOUNTS = [
  { value: "", label: "Select coverage amount..." },
  { value: "$500,000", label: "$500,000" },
  { value: "$1,000,000", label: "$1,000,000" },
  { value: "$2,000,000", label: "$2,000,000" },
  { value: "$5,000,000", label: "$5,000,000" },
  { value: "$10,000,000", label: "$10,000,000" },
  { value: "£500,000", label: "£500,000" },
  { value: "£1,000,000", label: "£1,000,000" },
  { value: "£2,000,000", label: "£2,000,000" },
  { value: "€500,000", label: "€500,000" },
  { value: "€1,000,000", label: "€1,000,000" },
  { value: "€2,000,000", label: "€2,000,000" },
  { value: "N/A", label: "N/A (Not applicable)" },
  { value: "Custom", label: "Custom amount" },
];

export default function DigitalRightsLocker({
  projectId,
  organizationId,
  currentUserEmail,
  currentUserName,
}: DigitalRightsLockerProps) {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [documents, setDocuments] = useState<RightsDocument[]>([]);

  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<"all" | "expiring" | "missing" | "by-person">("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<RightsDocument | null>(null);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [newDocument, setNewDocument] = useState({
    name: "",
    description: "",
    documentType: "FILMING_PERMIT" as DocumentType,
    status: "DRAFT" as DocumentStatus,
    issueDate: "",
    effectiveDate: "",
    expirationDate: "",
    shootDay: "",
    locationName: "",
    locationAddress: "",
    personName: "",
    personEmail: "",
    personRole: "",
    documentNumber: "",
    issuingAuthority: "",
    jurisdiction: "",
    coverageType: "",
    coverageAmount: "",
    restrictions: "",
    notes: "",
    isRequired: false,
    isCritical: false,
  });

  // Load documents
  useEffect(() => {
    if (!client) return;
    setIsLoading(true);

    // Check if RightsDocument model exists
    if (!client.models.RightsDocument) {
      console.log("RightsDocument model not yet available - waiting for schema deployment");
      setIsLoading(false);
      return;
    }

    client.models.RightsDocument.list({
      filter: { projectId: { eq: projectId } },
    }).then((data) => {
      if (data.data) {
        setDocuments(data.data as unknown as RightsDocument[]);
      }
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error loading documents:", error);
      setIsLoading(false);
    });
  }, [client, projectId]);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const total = documents.length;
    const approved = documents.filter((d) => d.status === "APPROVED").length;
    const pending = documents.filter((d) => d.status === "PENDING_REVIEW" || d.status === "PENDING_SIGNATURE").length;
    const expired = documents.filter((d) => d.status === "EXPIRED").length;
    const expiringSoon = documents.filter((d) => {
      if (!d.expirationDate || d.status === "EXPIRED") return false;
      const expDate = new Date(d.expirationDate);
      return expDate <= thirtyDaysFromNow && expDate > now;
    }).length;
    const critical = documents.filter((d) => d.isCritical).length;
    const required = documents.filter((d) => d.isRequired).length;

    return { total, approved, pending, expired, expiringSoon, critical, required };
  }, [documents]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Tab filter
    if (activeTab === "expiring") {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((d) => {
        if (!d.expirationDate) return false;
        const expDate = new Date(d.expirationDate);
        return expDate <= thirtyDaysFromNow && d.status !== "EXPIRED";
      });
    } else if (activeTab === "missing") {
      filtered = filtered.filter((d) => d.isRequired && d.status !== "APPROVED");
    } else if (activeTab === "by-person") {
      filtered = filtered.filter((d) => d.personName);
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((d) => {
        const config = d.documentType ? DOCUMENT_TYPE_CONFIG[d.documentType] : null;
        return config?.category === selectedCategory;
      });
    }

    // Status filter
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((d) => d.status === selectedStatus);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.personName?.toLowerCase().includes(query) ||
          d.locationName?.toLowerCase().includes(query) ||
          d.documentNumber?.toLowerCase().includes(query)
      );
    }

    // Sort by expiration date (soonest first), then by name
    filtered.sort((a, b) => {
      if (a.expirationDate && b.expirationDate) {
        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      }
      if (a.expirationDate) return -1;
      if (b.expirationDate) return 1;
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [documents, activeTab, selectedCategory, selectedStatus, searchQuery]);

  // Group by person for by-person tab
  const documentsByPerson = useMemo(() => {
    const groups: Record<string, RightsDocument[]> = {};
    filteredDocuments.forEach((doc) => {
      const person = doc.personName || "Unassigned";
      if (!groups[person]) groups[person] = [];
      groups[person].push(doc);
    });
    return groups;
  }, [filteredDocuments]);

  // Days until expiration
  const getDaysUntilExpiration = (expirationDate: string | null | undefined): number | null => {
    if (!expirationDate) return null;
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name if empty
      if (!newDocument.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setNewDocument({ ...newDocument, name: nameWithoutExt });
      }
    }
  };

  // Upload file to S3
  const uploadFile = async (file: File): Promise<{ key: string; fileName: string; fileSize: number; mimeType: string } | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const key = `rights-documents/${projectId}/${timestamp}-${sanitizedName}`;

      await uploadData({
        path: key,
        data: file,
        options: {
          contentType: file.type,
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              setUploadProgress(Math.round((transferredBytes / totalBytes) * 100));
            }
          },
        },
      }).result;

      setIsUploading(false);
      setUploadProgress(100);

      return {
        key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      return null;
    }
  };

  // Get download URL for a document
  const getDocumentUrl = async (fileKey: string): Promise<string | null> => {
    try {
      const result = await getUrl({
        path: fileKey,
        options: { expiresIn: 3600 }, // 1 hour
      });
      return result.url.toString();
    } catch (error) {
      console.error("Error getting document URL:", error);
      return null;
    }
  };

  // Add new document
  const handleAddDocument = async () => {
    if (!newDocument.name.trim() || !client) return;

    try {
      let fileData: { key: string; fileName: string; fileSize: number; mimeType: string } | null = null;

      // Upload file if selected
      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
        if (!fileData) {
          toast.error("Upload failed", "Failed to upload file. Please try again.");
          return;
        }
      }

      await client.models.RightsDocument.create({
        organizationId,
        name: newDocument.name,
        description: newDocument.description || undefined,
        documentType: newDocument.documentType,
        status: newDocument.status,
        issueDate: newDocument.issueDate || undefined,
        effectiveDate: newDocument.effectiveDate || undefined,
        expirationDate: newDocument.expirationDate || undefined,
        projectId,
        shootDay: newDocument.shootDay || undefined,
        locationName: newDocument.locationName || undefined,
        locationAddress: newDocument.locationAddress || undefined,
        personName: newDocument.personName || undefined,
        personEmail: newDocument.personEmail || undefined,
        personRole: newDocument.personRole || undefined,
        documentNumber: newDocument.documentNumber || undefined,
        issuingAuthority: newDocument.issuingAuthority || undefined,
        jurisdiction: newDocument.jurisdiction || undefined,
        coverageType: newDocument.coverageType || undefined,
        coverageAmount: newDocument.coverageAmount || undefined,
        restrictions: newDocument.restrictions || undefined,
        notes: newDocument.notes || undefined,
        isRequired: newDocument.isRequired,
        isCritical: newDocument.isCritical,
        uploadedBy: currentUserEmail,
        uploadedByName: currentUserName || currentUserEmail.split("@")[0],
        // File data
        fileKey: fileData?.key || undefined,
        fileName: fileData?.fileName || undefined,
        fileSize: fileData?.fileSize || undefined,
        mimeType: fileData?.mimeType || undefined,
      });

      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Failed to add document", "Please try again.");
    }
  };

  // Update document status
  const handleUpdateStatus = async (doc: RightsDocument, newStatus: DocumentStatus) => {
    if (!client) return;
    try {
      if (newStatus === "APPROVED") {
        await client.models.RightsDocument.update({
          id: doc.id,
          status: newStatus,
          approvedBy: currentUserEmail,
          approvedByName: currentUserName || currentUserEmail.split("@")[0],
          approvalDate: new Date().toISOString(),
        });
      } else {
        await client.models.RightsDocument.update({
          id: doc.id,
          status: newStatus,
        });
      }
      setShowDetailModal(null);
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Update failed", "Failed to update document status.");
    }
  };

  // Download document
  const handleDownload = async (doc: RightsDocument) => {
    if (!doc.fileKey) return;

    const url = await getDocumentUrl(doc.fileKey);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Download failed", "Failed to get download link.");
    }
  };

  // Reset form
  const resetForm = () => {
    setNewDocument({
      name: "",
      description: "",
      documentType: "FILMING_PERMIT",
      status: "DRAFT",
      issueDate: "",
      effectiveDate: "",
      expirationDate: "",
      shootDay: "",
      locationName: "",
      locationAddress: "",
      personName: "",
      personEmail: "",
      personRole: "",
      documentNumber: "",
      issuingAuthority: "",
      jurisdiction: "",
      coverageType: "",
      coverageAmount: "",
      restrictions: "",
      notes: "",
      isRequired: false,
      isCritical: false,
    });
    setSelectedFile(null);
    setUploadProgress(0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Digital Rights Locker</h2>
          <p className="text-slate-400 text-sm">Manage permits, releases, contracts, and legal documents</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          + Add Document
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-slate-400 text-sm">Total Documents</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
          <div className="text-slate-400 text-sm">Approved</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-yellow-500/30">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-slate-400 text-sm">Pending</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-orange-500/30">
          <div className="text-2xl font-bold text-orange-400">{stats.expiringSoon}</div>
          <div className="text-slate-400 text-sm">Expiring Soon</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-red-500/30">
          <div className="text-2xl font-bold text-red-400">{stats.expired}</div>
          <div className="text-slate-400 text-sm">Expired</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-400">{stats.required}</div>
          <div className="text-slate-400 text-sm">Required</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-red-600/30">
          <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
          <div className="text-slate-400 text-sm">Critical</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {[
          { id: "all", label: "All Documents", count: documents.length },
          { id: "expiring", label: "Expiring Soon", count: stats.expiringSoon },
          { id: "missing", label: "Missing/Pending", count: stats.required - documents.filter((d) => d.isRequired && d.status === "APPROVED").length },
          { id: "by-person", label: "By Person", count: Object.keys(documentsByPerson).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-slate-600 rounded-full text-xs">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search by name, person, location, or document number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as DocumentStatus | "ALL")}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <option key={status} value={status}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Document List */}
      {activeTab === "by-person" ? (
        // Group by person view
        <div className="space-y-6">
          {Object.entries(documentsByPerson).map(([person, docs]) => (
            <div key={person} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-slate-700/50 border-b border-slate-600">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  {person}
                  <span className="text-slate-400 font-normal text-sm">({docs.length} documents)</span>
                </h3>
              </div>
              <div className="divide-y divide-slate-700">
                {docs.map((doc) => (
                  <DocumentRow key={doc.id} doc={doc} onClick={() => setShowDetailModal(doc)} />
                ))}
              </div>
            </div>
          ))}
          {Object.keys(documentsByPerson).length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No documents assigned to specific people
            </div>
          )}
        </div>
      ) : (
        // Standard list view
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="divide-y divide-slate-700">
            {filteredDocuments.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} onClick={() => setShowDetailModal(doc)} />
            ))}
          </div>
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              {searchQuery || selectedCategory !== "All" || selectedStatus !== "ALL"
                ? "No documents match your filters"
                : "No documents yet. Click 'Add Document' to get started."}
            </div>
          )}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white">Add New Document</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Document Name *</label>
                  <input
                    type="text"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                    placeholder="e.g., Location Permit - Central Park"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Document Type</label>
                  <select
                    value={newDocument.documentType}
                    onChange={(e) => setNewDocument({ ...newDocument, documentType: e.target.value as DocumentType })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(DOCUMENT_TYPE_CONFIG).map(([type, config]) => (
                      <option key={type} value={type}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={newDocument.status}
                    onChange={(e) => setNewDocument({ ...newDocument, status: e.target.value as DocumentStatus })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <option key={status} value={status}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={newDocument.issueDate}
                    onChange={(e) => setNewDocument({ ...newDocument, issueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={newDocument.effectiveDate}
                    onChange={(e) => setNewDocument({ ...newDocument, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={newDocument.expirationDate}
                    onChange={(e) => setNewDocument({ ...newDocument, expirationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Location Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Location Name</label>
                  <input
                    type="text"
                    value={newDocument.locationName}
                    onChange={(e) => setNewDocument({ ...newDocument, locationName: e.target.value })}
                    placeholder="e.g., Central Park"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Shoot Day</label>
                  <input
                    type="text"
                    value={newDocument.shootDay}
                    onChange={(e) => setNewDocument({ ...newDocument, shootDay: e.target.value })}
                    placeholder="e.g., Day 1, Day 2"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Person Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Person Name</label>
                  <input
                    type="text"
                    value={newDocument.personName}
                    onChange={(e) => setNewDocument({ ...newDocument, personName: e.target.value })}
                    placeholder="e.g., John Smith"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Person Email</label>
                  <input
                    type="email"
                    value={newDocument.personEmail}
                    onChange={(e) => setNewDocument({ ...newDocument, personEmail: e.target.value })}
                    placeholder="e.g., john@example.com"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Person Role</label>
                  <select
                    value={newDocument.personRole}
                    onChange={(e) => setNewDocument({ ...newDocument, personRole: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PERSON_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Document Number</label>
                  <input
                    type="text"
                    value={newDocument.documentNumber}
                    onChange={(e) => setNewDocument({ ...newDocument, documentNumber: e.target.value })}
                    placeholder="e.g., PERMIT-2025-12345"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Issuing Authority</label>
                  <select
                    value={newDocument.issuingAuthority}
                    onChange={(e) => setNewDocument({ ...newDocument, issuingAuthority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ISSUING_AUTHORITIES.map((auth) => (
                      <option key={auth.value} value={auth.value}>
                        {auth.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Jurisdiction</label>
                  <select
                    value={newDocument.jurisdiction}
                    onChange={(e) => setNewDocument({ ...newDocument, jurisdiction: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {JURISDICTIONS.map((jur) => (
                      <option key={jur.value} value={jur.value}>
                        {jur.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Coverage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Coverage Type</label>
                  <select
                    value={newDocument.coverageType}
                    onChange={(e) => setNewDocument({ ...newDocument, coverageType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COVERAGE_TYPES.map((cov) => (
                      <option key={cov.value} value={cov.value}>
                        {cov.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Coverage Amount</label>
                  <select
                    value={newDocument.coverageAmount}
                    onChange={(e) => setNewDocument({ ...newDocument, coverageAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COVERAGE_AMOUNTS.map((amt) => (
                      <option key={amt.value} value={amt.value}>
                        {amt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                <textarea
                  value={newDocument.notes}
                  onChange={(e) => setNewDocument({ ...newDocument, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Attach Document File</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    selectedFile
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-slate-600 hover:border-blue-500/50 hover:bg-slate-700/50"
                  }`}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="text-3xl">📎</div>
                      <div className="text-white font-medium">{selectedFile.name}</div>
                      <div className="text-slate-400 text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-red-400 hover:text-red-300 text-sm underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-3xl">📤</div>
                      <div className="text-slate-300">Click to upload a document</div>
                      <div className="text-slate-500 text-sm">PDF, DOC, DOCX, Images up to 50MB</div>
                    </div>
                  )}
                </div>
                {isUploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-400">Uploading...</span>
                      <span className="text-blue-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Flags */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDocument.isRequired}
                    onChange={(e) => setNewDocument({ ...newDocument, isRequired: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-slate-300">Required for Greenlight</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDocument.isCritical}
                    onChange={(e) => setNewDocument({ ...newDocument, isCritical: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-slate-300">Critical (Production Blocker)</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDocument}
                disabled={!newDocument.name.trim() || isUploading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  "Add Document"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">
                    {showDetailModal.documentType
                      ? DOCUMENT_TYPE_CONFIG[showDetailModal.documentType].icon
                      : "📄"}
                  </span>
                  <h3 className="text-xl font-semibold text-white">{showDetailModal.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {showDetailModal.documentType && (
                    <span className="text-slate-400 text-sm">
                      {DOCUMENT_TYPE_CONFIG[showDetailModal.documentType].label}
                    </span>
                  )}
                  {showDetailModal.status && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[showDetailModal.status].bgColor}`}
                    >
                      {STATUS_CONFIG[showDetailModal.status].label}
                    </span>
                  )}
                  {showDetailModal.isRequired && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                      Required
                    </span>
                  )}
                  {showDetailModal.isCritical && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                      Critical
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Expiration Warning */}
              {showDetailModal.expirationDate && (
                <div
                  className={`p-4 rounded-lg ${
                    getDaysUntilExpiration(showDetailModal.expirationDate)! <= 0
                      ? "bg-red-500/20 border border-red-500/30"
                      : getDaysUntilExpiration(showDetailModal.expirationDate)! <= 30
                      ? "bg-orange-500/20 border border-orange-500/30"
                      : "bg-green-500/20 border border-green-500/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getDaysUntilExpiration(showDetailModal.expirationDate)! <= 0
                        ? "⚠️"
                        : getDaysUntilExpiration(showDetailModal.expirationDate)! <= 30
                        ? "⏰"
                        : "✅"}
                    </span>
                    <span
                      className={
                        getDaysUntilExpiration(showDetailModal.expirationDate)! <= 0
                          ? "text-red-400"
                          : getDaysUntilExpiration(showDetailModal.expirationDate)! <= 30
                          ? "text-orange-400"
                          : "text-green-400"
                      }
                    >
                      {getDaysUntilExpiration(showDetailModal.expirationDate)! <= 0
                        ? `Expired ${Math.abs(getDaysUntilExpiration(showDetailModal.expirationDate)!)} days ago`
                        : `Expires in ${getDaysUntilExpiration(showDetailModal.expirationDate)} days`}
                    </span>
                    <span className="text-slate-400 text-sm ml-auto">
                      {new Date(showDetailModal.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {showDetailModal.documentNumber && (
                  <div>
                    <div className="text-slate-500 text-sm">Document Number</div>
                    <div className="text-white">{showDetailModal.documentNumber}</div>
                  </div>
                )}
                {showDetailModal.issuingAuthority && (
                  <div>
                    <div className="text-slate-500 text-sm">Issuing Authority</div>
                    <div className="text-white">{showDetailModal.issuingAuthority}</div>
                  </div>
                )}
                {showDetailModal.locationName && (
                  <div>
                    <div className="text-slate-500 text-sm">Location</div>
                    <div className="text-white">{showDetailModal.locationName}</div>
                  </div>
                )}
                {showDetailModal.shootDay && (
                  <div>
                    <div className="text-slate-500 text-sm">Shoot Day</div>
                    <div className="text-white">{showDetailModal.shootDay}</div>
                  </div>
                )}
                {showDetailModal.personName && (
                  <div>
                    <div className="text-slate-500 text-sm">Person</div>
                    <div className="text-white">
                      {showDetailModal.personName}
                      {showDetailModal.personRole && (
                        <span className="text-slate-400 text-sm ml-2">({showDetailModal.personRole})</span>
                      )}
                    </div>
                  </div>
                )}
                {showDetailModal.coverageAmount && (
                  <div>
                    <div className="text-slate-500 text-sm">Coverage Amount</div>
                    <div className="text-white">{showDetailModal.coverageAmount}</div>
                  </div>
                )}
                {showDetailModal.issueDate && (
                  <div>
                    <div className="text-slate-500 text-sm">Issue Date</div>
                    <div className="text-white">{new Date(showDetailModal.issueDate).toLocaleDateString()}</div>
                  </div>
                )}
                {showDetailModal.effectiveDate && (
                  <div>
                    <div className="text-slate-500 text-sm">Effective Date</div>
                    <div className="text-white">{new Date(showDetailModal.effectiveDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {showDetailModal.notes && (
                <div>
                  <div className="text-slate-500 text-sm mb-1">Notes</div>
                  <div className="text-white bg-slate-700/50 p-3 rounded-lg">{showDetailModal.notes}</div>
                </div>
              )}

              {/* Approval Info */}
              {showDetailModal.approvedBy && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="text-green-400 font-medium mb-1">Approved</div>
                  <div className="text-slate-300 text-sm">
                    by {showDetailModal.approvedByName || showDetailModal.approvedBy}
                    {showDetailModal.approvalDate && (
                      <span className="ml-2">on {new Date(showDetailModal.approvalDate).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Info */}
              <div className="text-slate-500 text-sm">
                Uploaded by {showDetailModal.uploadedByName || showDetailModal.uploadedBy}
                {showDetailModal.createdAt && (
                  <span className="ml-2">on {new Date(showDetailModal.createdAt).toLocaleString()}</span>
                )}
              </div>

              {/* Attached File */}
              {showDetailModal.fileKey && showDetailModal.fileName && (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📎</div>
                      <div>
                        <div className="text-white font-medium">{showDetailModal.fileName}</div>
                        <div className="text-slate-400 text-sm flex items-center gap-2">
                          {showDetailModal.fileSize && (
                            <span>{(showDetailModal.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          )}
                          {showDetailModal.mimeType && (
                            <span className="text-slate-500">• {showDetailModal.mimeType}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(showDetailModal)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-700 flex justify-between">
              <div className="flex gap-2">
                {showDetailModal.status !== "APPROVED" && (
                  <button
                    onClick={() => handleUpdateStatus(showDetailModal, "APPROVED")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                )}
                {showDetailModal.status !== "REJECTED" && showDetailModal.status !== "APPROVED" && (
                  <button
                    onClick={() => handleUpdateStatus(showDetailModal, "REJECTED")}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                )}
                {showDetailModal.status === "APPROVED" && (
                  <button
                    onClick={() => handleUpdateStatus(showDetailModal, "REVOKED")}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowDetailModal(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Document Row Component
function DocumentRow({ doc, onClick }: { doc: RightsDocument; onClick: () => void }) {
  const daysUntilExp = doc.expirationDate
    ? Math.ceil((new Date(doc.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const typeConfig = doc.documentType ? DOCUMENT_TYPE_CONFIG[doc.documentType] : null;
  const statusConfig = doc.status ? STATUS_CONFIG[doc.status] : null;

  return (
    <div
      onClick={onClick}
      className="px-4 py-3 hover:bg-slate-700/50 cursor-pointer transition-colors flex items-center gap-4"
    >
      <div className="text-2xl">{typeConfig?.icon || "📄"}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate">{doc.name}</span>
          {doc.fileKey && (
            <span className="text-slate-400" title={doc.fileName || "File attached"}>📎</span>
          )}
          {doc.isRequired && (
            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">Required</span>
          )}
          {doc.isCritical && (
            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Critical</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>{typeConfig?.label || "Document"}</span>
          {doc.personName && <span>• {doc.personName}</span>}
          {doc.locationName && <span>• {doc.locationName}</span>}
        </div>
      </div>
      {daysUntilExp !== null && (
        <div
          className={`text-sm font-medium ${
            daysUntilExp <= 0
              ? "text-red-400"
              : daysUntilExp <= 7
              ? "text-red-400"
              : daysUntilExp <= 30
              ? "text-orange-400"
              : "text-green-400"
          }`}
        >
          {daysUntilExp <= 0 ? `Expired ${Math.abs(daysUntilExp)}d ago` : `${daysUntilExp}d left`}
        </div>
      )}
      {statusConfig && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor}`}>
          {statusConfig.label}
        </span>
      )}
      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
