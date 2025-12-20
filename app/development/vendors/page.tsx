'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * VENDORS PAGE
 * Manage service providers and production vendors.
 */

type VendorCategory =
  | 'PRODUCTION_SERVICES'
  | 'EQUIPMENT_RENTAL'
  | 'POST_PRODUCTION'
  | 'CATERING'
  | 'TRANSPORTATION'
  | 'LOCATIONS'
  | 'INSURANCE'
  | 'LEGAL';

type VendorStatus = 'ACTIVE' | 'PREFERRED' | 'NEW' | 'INACTIVE';

interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  services: string[];
  rating: number; // 1-5
  projectsWorked: number;
  status: VendorStatus;
  notes: string;
}

// Mock Data
const MOCK_DATA: Vendor[] = [
  {
    id: 'v1',
    name: 'Skylight Productions',
    category: 'PRODUCTION_SERVICES',
    contactName: 'Sarah Mitchell',
    contactEmail: 'sarah@skylightprod.com',
    contactPhone: '(555) 123-4567',
    website: 'skylightprod.com',
    services: ['Full Production', 'Camera Crew', 'Lighting'],
    rating: 5,
    projectsWorked: 23,
    status: 'PREFERRED',
    notes: 'Excellent track record, always on time and budget'
  },
  {
    id: 'v2',
    name: 'CineGear Rentals',
    category: 'EQUIPMENT_RENTAL',
    contactName: 'Marcus Chen',
    contactEmail: 'rentals@cinegear.com',
    contactPhone: '(555) 234-5678',
    website: 'cinegear.com',
    services: ['Camera Packages', 'Lighting Kits', 'Sound Equipment', 'Grip & Electric'],
    rating: 5,
    projectsWorked: 47,
    status: 'PREFERRED',
    notes: 'Best rates in the city, wide selection of RED and ARRI'
  },
  {
    id: 'v3',
    name: 'Pixel Perfect Post',
    category: 'POST_PRODUCTION',
    contactName: 'David Rodriguez',
    contactEmail: 'david@pixelperfect.com',
    contactPhone: '(555) 345-6789',
    website: 'pixelperfect.com',
    services: ['Color Grading', 'Editing', 'VFX', 'Sound Design'],
    rating: 4,
    projectsWorked: 31,
    status: 'ACTIVE',
    notes: 'Fast turnaround, great color work'
  },
  {
    id: 'v4',
    name: 'Gourmet Film Catering',
    category: 'CATERING',
    contactName: 'Julia Simmons',
    contactEmail: 'julia@gourmetfilmcatering.com',
    contactPhone: '(555) 456-7890',
    website: 'gourmetfilmcatering.com',
    services: ['Breakfast', 'Lunch', 'Craft Services', 'Dietary Accommodations'],
    rating: 5,
    projectsWorked: 56,
    status: 'PREFERRED',
    notes: 'Incredible food, handles dietary restrictions perfectly'
  },
  {
    id: 'v5',
    name: 'Metro Transport Services',
    category: 'TRANSPORTATION',
    contactName: 'Robert Taylor',
    contactEmail: 'dispatch@metrotransport.com',
    contactPhone: '(555) 567-8901',
    website: 'metrotransport.com',
    services: ['Production Vans', 'Equipment Trucks', 'Talent Transport', 'Shuttle Services'],
    rating: 4,
    projectsWorked: 29,
    status: 'ACTIVE',
    notes: 'Reliable fleet, professional drivers'
  },
  {
    id: 'v6',
    name: 'Prime Locations LA',
    category: 'LOCATIONS',
    contactName: 'Amanda Foster',
    contactEmail: 'amanda@primelocationsla.com',
    contactPhone: '(555) 678-9012',
    website: 'primelocationsla.com',
    services: ['Location Scouting', 'Permits', 'Property Management'],
    rating: 5,
    projectsWorked: 38,
    status: 'PREFERRED',
    notes: 'Access to amazing properties, handles all permitting'
  },
  {
    id: 'v7',
    name: 'Production Insurance Group',
    category: 'INSURANCE',
    contactName: 'Michael O\'Brien',
    contactEmail: 'michael@productioninsurance.com',
    contactPhone: '(555) 789-0123',
    website: 'productioninsurance.com',
    services: ['General Liability', 'Equipment Insurance', 'E&O Coverage', 'Workers Comp'],
    rating: 4,
    projectsWorked: 64,
    status: 'ACTIVE',
    notes: 'Competitive rates, fast certificate turnaround'
  },
  {
    id: 'v8',
    name: 'Entertainment Law Partners',
    category: 'LEGAL',
    contactName: 'Jennifer Lee',
    contactEmail: 'jennifer@entertainmentlaw.com',
    contactPhone: '(555) 890-1234',
    website: 'entertainmentlaw.com',
    services: ['Contract Review', 'Talent Agreements', 'Copyright', 'Distribution Deals'],
    rating: 5,
    projectsWorked: 42,
    status: 'PREFERRED',
    notes: 'Expert in production law, very responsive'
  },
  {
    id: 'v9',
    name: 'Studio Sound Post',
    category: 'POST_PRODUCTION',
    contactName: 'Chris Matthews',
    contactEmail: 'chris@studiosoundpost.com',
    contactPhone: '(555) 901-2345',
    website: 'studiosoundpost.com',
    services: ['Sound Mixing', 'ADR', 'Foley', 'Music Composition'],
    rating: 4,
    projectsWorked: 27,
    status: 'ACTIVE',
    notes: 'Excellent audio post facility, Grammy-winning engineers'
  },
  {
    id: 'v10',
    name: 'ProSet Builders',
    category: 'PRODUCTION_SERVICES',
    contactName: 'Tony Dimarco',
    contactEmail: 'tony@prosetbuilders.com',
    contactPhone: '(555) 012-3456',
    website: 'prosetbuilders.com',
    services: ['Set Construction', 'Props', 'Set Dressing', 'Strike & Removal'],
    rating: 4,
    projectsWorked: 19,
    status: 'ACTIVE',
    notes: 'Quality craftsmanship, reasonable pricing'
  },
  {
    id: 'v11',
    name: 'Horizon Equipment Co',
    category: 'EQUIPMENT_RENTAL',
    contactName: 'Lisa Wang',
    contactEmail: 'lisa@horizonequipment.com',
    contactPhone: '(555) 123-7890',
    website: 'horizonequipment.com',
    services: ['Drones', 'Stabilizers', 'Monitors', 'Wireless Systems'],
    rating: 3,
    projectsWorked: 8,
    status: 'NEW',
    notes: 'New vendor, testing them on smaller projects'
  },
  {
    id: 'v12',
    name: 'Vintage Film Transport',
    category: 'TRANSPORTATION',
    contactName: 'George Patterson',
    contactEmail: 'george@vintagefilmtransport.com',
    contactPhone: '(555) 234-8901',
    website: 'vintagefilmtransport.com',
    services: ['Picture Vehicles', 'Period Cars', 'Specialty Transport'],
    rating: 0,
    projectsWorked: 0,
    status: 'INACTIVE',
    notes: 'Used once, service was unreliable'
  }
];

const CATEGORY_CONFIG: Record<VendorCategory, { label: string; color: string; icon: keyof typeof Icons }> = {
  PRODUCTION_SERVICES: { label: 'Production Services', color: 'var(--phase-production)', icon: 'Film' },
  EQUIPMENT_RENTAL: { label: 'Equipment Rental', color: 'var(--warning)', icon: 'Camera' },
  POST_PRODUCTION: { label: 'Post-Production', color: 'var(--phase-postproduction)', icon: 'Scissors' },
  CATERING: { label: 'Catering', color: 'var(--success)', icon: 'Package' },
  TRANSPORTATION: { label: 'Transportation', color: 'var(--primary)', icon: 'Truck' },
  LOCATIONS: { label: 'Locations', color: 'var(--danger)', icon: 'MapPin' },
  INSURANCE: { label: 'Insurance', color: 'var(--accent)', icon: 'Shield' },
  LEGAL: { label: 'Legal', color: 'var(--text-primary)', icon: 'FileText' },
};

const STATUS_CONFIG: Record<VendorStatus, { label: string; color: string; bgColor: string }> = {
  PREFERRED: { label: 'Preferred', color: 'var(--success)', bgColor: 'rgba(16, 185, 129, 0.1)' },
  ACTIVE: { label: 'Active', color: 'var(--primary)', bgColor: 'rgba(59, 130, 246, 0.1)' },
  NEW: { label: 'New', color: 'var(--warning)', bgColor: 'rgba(245, 158, 11, 0.1)' },
  INACTIVE: { label: 'Inactive', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_DATA);
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showAddToProjectModal, setShowAddToProjectModal] = useState(false);

  // Selected vendor and form data
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'PRODUCTION_SERVICES' as VendorCategory,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    services: '',
    notes: '',
  });
  const [selectedRating, setSelectedRating] = useState(0);

  // Handler functions
  const handleExport = () => {
    const csv = 'Name,Category,Contact,Email,Phone,Rating,Projects,Status\n' +
      vendors.map(v => [v.name, v.category, v.contactName, v.contactEmail, v.contactPhone, v.rating, v.projectsWorked, v.status].join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleContact = (vendor: Vendor) => {
    window.location.href = `mailto:${vendor.contactEmail}?subject=Production Inquiry`;
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      category: 'PRODUCTION_SERVICES',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      services: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleAddVendor = () => {
    const newVendor: Vendor = {
      id: `v${vendors.length + 1}`,
      name: formData.name,
      category: formData.category,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      website: formData.website,
      services: formData.services.split(',').map(s => s.trim()).filter(s => s),
      rating: 0,
      projectsWorked: 0,
      status: 'NEW',
      notes: formData.notes,
    };
    setVendors([...vendors, newVendor]);
    setShowAddModal(false);
  };

  const handleOpenEditModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contactName: vendor.contactName,
      contactEmail: vendor.contactEmail,
      contactPhone: vendor.contactPhone,
      website: vendor.website,
      services: vendor.services.join(', '),
      notes: vendor.notes,
    });
    setShowEditModal(true);
  };

  const handleEditVendor = () => {
    if (!selectedVendor) return;
    setVendors(vendors.map(v =>
      v.id === selectedVendor.id
        ? {
            ...v,
            name: formData.name,
            category: formData.category,
            contactName: formData.contactName,
            contactEmail: formData.contactEmail,
            contactPhone: formData.contactPhone,
            website: formData.website,
            services: formData.services.split(',').map(s => s.trim()).filter(s => s),
            notes: formData.notes,
          }
        : v
    ));
    setShowEditModal(false);
    setSelectedVendor(null);
  };

  const handleOpenDetailsModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  const handleOpenRateModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setSelectedRating(vendor.rating);
    setShowRateModal(true);
  };

  const handleRateVendor = () => {
    if (!selectedVendor) return;
    setVendors(vendors.map(v =>
      v.id === selectedVendor.id
        ? { ...v, rating: selectedRating }
        : v
    ));
    setShowRateModal(false);
    setSelectedVendor(null);
  };

  const handleOpenAddToProjectModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowAddToProjectModal(true);
  };

  const handleAddToProject = () => {
    setShowAddToProjectModal(false);
    setSelectedVendor(null);
  };

  const filteredVendors = vendors.filter(v => {
    const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
    const matchesSearch = searchQuery === '' ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: vendors.length,
    preferred: vendors.filter(v => v.status === 'PREFERRED').length,
    active: vendors.filter(v => v.status === 'ACTIVE').length,
    new: vendors.filter(v => v.status === 'NEW').length,
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Icons.Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? 'text-[var(--warning)] fill-current' : 'text-[var(--bg-3)] fill-current'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/development"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-development)', color: 'white' }}
              >
                <Icons.Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Vendors</h1>
                <p className="text-sm text-[var(--text-secondary)]">Manage service providers and production partners</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleExport}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Vendors</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.preferred}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Preferred</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.active}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Active</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.new}</p>
              <p className="text-xs text-[var(--text-tertiary)]">New</p>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search vendors, contacts, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                categoryFilter === 'ALL'
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All Categories
            </button>
            {(Object.keys(CATEGORY_CONFIG) as VendorCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {CATEGORY_CONFIG[cat].label}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Grid */}
        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => {
              const categoryConfig = CATEGORY_CONFIG[vendor.category];
              const statusConfig = STATUS_CONFIG[vendor.status];
              const CategoryIcon = Icons[categoryConfig.icon];

              return (
                <Card key={vendor.id} className="p-5 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${categoryConfig.color}20` }}
                      >
                        <CategoryIcon className="w-5 h-5" style={{ color: categoryConfig.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">{vendor.name}</h3>
                        <p className="text-xs text-[var(--text-tertiary)]">{categoryConfig.label}</p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap flex-shrink-0"
                      style={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Icons.User className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                      <span className="text-[var(--text-secondary)] truncate">{vendor.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icons.Mail className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                      <span className="text-[var(--text-secondary)] truncate">{vendor.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icons.Globe className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                      <span className="text-[var(--text-secondary)] truncate">{vendor.website}</span>
                    </div>
                  </div>

                  {/* Rating and Projects */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-subtle)]">
                    <div>
                      {vendor.rating > 0 ? (
                        <div className="space-y-1">
                          {renderStars(vendor.rating)}
                          <p className="text-xs text-[var(--text-tertiary)]">{vendor.rating}.0 rating</p>
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--text-tertiary)]">No rating yet</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--text-primary)]">{vendor.projectsWorked}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Projects</p>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-[var(--text-tertiary)] mb-2">Services:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {vendor.services.slice(0, 3).map((service, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[var(--bg-2)] text-[var(--text-secondary)] rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                      {vendor.services.length > 3 && (
                        <span className="px-2 py-0.5 bg-[var(--bg-2)] text-[var(--text-tertiary)] rounded text-xs">
                          +{vendor.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => handleContact(vendor)}
                    >
                      <Icons.Mail className="w-3.5 h-3.5 mr-1.5" />
                      Contact
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetailsModal(vendor)}
                    >
                      <Icons.Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAddToProjectModal(vendor)}
                    >
                      <Icons.Plus className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenRateModal(vendor)}
                    >
                      <Icons.Star className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(vendor)}
                    >
                      <Icons.Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Icons.Briefcase className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No vendors found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {searchQuery
                ? `No vendors match "${searchQuery}"`
                : 'Add vendors to manage your service providers.'
              }
            </p>
            {searchQuery && (
              <Button variant="secondary" size="sm" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Vendor"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Vendor Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter vendor name"
            required
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as VendorCategory })}
              className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            >
              {(Object.keys(CATEGORY_CONFIG) as VendorCategory[]).map(cat => (
                <option key={cat} value={cat}>
                  {CATEGORY_CONFIG[cat].label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Contact Name"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            placeholder="Enter contact name"
          />

          <Input
            label="Contact Email"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            placeholder="contact@vendor.com"
          />

          <Input
            label="Contact Phone"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            placeholder="(555) 123-4567"
          />

          <Input
            label="Website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="vendor.com"
          />

          <Input
            label="Services (comma separated)"
            value={formData.services}
            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
            placeholder="Service 1, Service 2, Service 3"
          />

          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this vendor..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddVendor}
              disabled={!formData.name}
            >
              Add Vendor
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Vendor Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Vendor"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Vendor Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter vendor name"
            required
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as VendorCategory })}
              className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            >
              {(Object.keys(CATEGORY_CONFIG) as VendorCategory[]).map(cat => (
                <option key={cat} value={cat}>
                  {CATEGORY_CONFIG[cat].label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Contact Name"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            placeholder="Enter contact name"
          />

          <Input
            label="Contact Email"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            placeholder="contact@vendor.com"
          />

          <Input
            label="Contact Phone"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            placeholder="(555) 123-4567"
          />

          <Input
            label="Website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="vendor.com"
          />

          <Input
            label="Services (comma separated)"
            value={formData.services}
            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
            placeholder="Service 1, Service 2, Service 3"
          />

          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this vendor..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEditVendor}
              disabled={!formData.name}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      {selectedVendor && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Vendor Details"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{selectedVendor.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{CATEGORY_CONFIG[selectedVendor.category].label}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Status</p>
                <span
                  className="px-2 py-1 rounded text-xs font-medium inline-block"
                  style={{
                    backgroundColor: STATUS_CONFIG[selectedVendor.status].bgColor,
                    color: STATUS_CONFIG[selectedVendor.status].color,
                  }}
                >
                  {STATUS_CONFIG[selectedVendor.status].label}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  {selectedVendor.rating > 0 ? (
                    <>
                      {renderStars(selectedVendor.rating)}
                      <span className="text-sm text-[var(--text-secondary)] ml-1">{selectedVendor.rating}.0</span>
                    </>
                  ) : (
                    <span className="text-sm text-[var(--text-tertiary)]">No rating</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Contact Information</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Icons.User className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-secondary)]">{selectedVendor.contactName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icons.Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-secondary)]">{selectedVendor.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icons.MessageSquare className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-secondary)]">{selectedVendor.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icons.Globe className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-secondary)]">{selectedVendor.website}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mb-2">Services Offered</p>
              <div className="flex flex-wrap gap-2">
                {selectedVendor.services.map((service, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[var(--bg-2)] text-[var(--text-secondary)] rounded-md text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Projects Worked</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{selectedVendor.projectsWorked}</p>
            </div>

            {selectedVendor.notes && (
              <div>
                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Notes</p>
                <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-1)] p-3 rounded-lg">
                  {selectedVendor.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rate Vendor Modal */}
      {selectedVendor && (
        <Modal
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
          title={`Rate ${selectedVendor.name}`}
          size="sm"
        >
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Select a rating for this vendor
              </p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Icons.Star
                      className={`w-10 h-10 cursor-pointer ${
                        star <= selectedRating
                          ? 'text-[var(--warning)] fill-current'
                          : 'text-[var(--bg-3)] fill-current hover:text-[var(--warning)]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {selectedRating > 0 && (
                <p className="text-lg font-bold text-[var(--text-primary)] mt-4">
                  {selectedRating}.0 Stars
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowRateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRateVendor}
                disabled={selectedRating === 0}
              >
                Save Rating
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add to Project Confirm Modal */}
      {selectedVendor && (
        <ConfirmModal
          isOpen={showAddToProjectModal}
          onClose={() => setShowAddToProjectModal(false)}
          onConfirm={handleAddToProject}
          title="Add Vendor to Project"
          message={`Are you sure you want to add ${selectedVendor.name} to the current project?`}
          confirmText="Add to Project"
          variant="default"
        />
      )}
    </div>
  );
}
