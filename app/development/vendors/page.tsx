'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * VENDORS PAGE
 * Evaluate and select service providers.
 */

type VendorCategory = 'PRODUCTION' | 'EQUIPMENT' | 'POST_PRODUCTION' | 'TALENT' | 'LOCATIONS' | 'CATERING';
type VendorStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'PREFERRED';

interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  status: VendorStatus;
  contactName: string;
  email: string;
  phone: string;
  rating: number;
  projectsCompleted: number;
  lastUsed?: string;
  notes?: string;
}

// Data will be fetched from API
const initialVendors: Vendor[] = [];

const CATEGORY_CONFIG: Record<VendorCategory, { label: string; color: string; icon: keyof typeof Icons }> = {
  PRODUCTION: { label: 'Production', color: 'var(--primary)', icon: 'Film' },
  EQUIPMENT: { label: 'Equipment', color: 'var(--warning)', icon: 'Camera' },
  POST_PRODUCTION: { label: 'Post-Production', color: 'var(--accent)', icon: 'Scissors' },
  TALENT: { label: 'Talent', color: 'var(--success)', icon: 'Users' },
  LOCATIONS: { label: 'Locations', color: 'var(--danger)', icon: 'MapPin' },
  CATERING: { label: 'Catering', color: 'var(--text-tertiary)', icon: 'Package' },
};

const STATUS_CONFIG: Record<VendorStatus, { label: string; color: string; bgColor: string }> = {
  PREFERRED: { label: 'Preferred', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  ACTIVE: { label: 'Active', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
  PENDING: { label: 'Pending', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  INACTIVE: { label: 'Inactive', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
};

export default function VendorsPage() {
  const [vendors] = useState<Vendor[]>(initialVendors);
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'ALL'>('ALL');

  const filteredVendors = vendors.filter(v => {
    if (categoryFilter !== 'ALL' && v.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: vendors.length,
    preferred: vendors.filter(v => v.status === 'PREFERRED').length,
    active: vendors.filter(v => v.status === 'ACTIVE').length,
    pending: vendors.filter(v => v.status === 'PENDING').length,
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Icons.Star
          key={star}
          className={`w-3 h-3 ${star <= rating ? 'text-[var(--warning)] fill-current' : 'text-[var(--bg-3)]'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
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
                <p className="text-sm text-[var(--text-secondary)]">Service providers and partners</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
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
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.pending}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
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
              All
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

          {/* Status Filter */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {(['ALL', 'PREFERRED', 'ACTIVE', 'PENDING', 'INACTIVE'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {status === 'ALL' ? 'All Status' : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Table */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Vendor</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Category</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Contact</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Rating</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Projects</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredVendors.map((vendor) => {
                const categoryConfig = CATEGORY_CONFIG[vendor.category];
                const statusConfig = STATUS_CONFIG[vendor.status];
                const CategoryIcon = Icons[categoryConfig.icon];

                return (
                  <tr key={vendor.id} className="hover:bg-[var(--bg-1)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${categoryConfig.color}20` }}
                        >
                          <CategoryIcon className="w-5 h-5" style={{ color: categoryConfig.color }} />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{vendor.name}</p>
                          {vendor.notes && (
                            <p className="text-xs text-[var(--text-tertiary)]">{vendor.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-[var(--text-secondary)]">{categoryConfig.label}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-[var(--text-primary)]">{vendor.contactName}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{vendor.email}</p>
                    </td>
                    <td className="p-4">
                      {vendor.rating > 0 ? renderStars(vendor.rating) : (
                        <span className="text-xs text-[var(--text-tertiary)]">No rating</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-[var(--text-primary)]">{vendor.projectsCompleted}</p>
                      {vendor.lastUsed && (
                        <p className="text-xs text-[var(--text-tertiary)]">Last: {vendor.lastUsed}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm">
                          <Icons.Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icons.MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {filteredVendors.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Briefcase className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No vendors found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Add vendors to manage your service providers.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
