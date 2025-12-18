'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * LOCATIONS PAGE
 * Scout, manage, and book shooting locations.
 */

type LocationStatus = 'SCOUTING' | 'PENDING_APPROVAL' | 'APPROVED' | 'BOOKED' | 'REJECTED';
type LocationType = 'STUDIO' | 'OFFICE' | 'OUTDOOR' | 'RESIDENTIAL' | 'COMMERCIAL' | 'OTHER';

interface Location {
  id: string;
  name: string;
  type: LocationType;
  address: string;
  city: string;
  status: LocationStatus;
  dailyRate?: number;
  contactName?: string;
  contactPhone?: string;
  photoCount: number;
  permitRequired: boolean;
  parkingAvailable: boolean;
  powerAvailable: boolean;
  notes?: string;
}

// Data will be fetched from API
const initialLocations: Location[] = [];

const STATUS_CONFIG: Record<LocationStatus, { label: string; color: string; bgColor: string }> = {
  SCOUTING: { label: 'Scouting', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  BOOKED: { label: 'Booked', color: 'var(--accent)', bgColor: 'var(--accent-muted)' },
  REJECTED: { label: 'Rejected', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
};

const TYPE_CONFIG: Record<LocationType, { label: string; icon: keyof typeof Icons }> = {
  STUDIO: { label: 'Studio', icon: 'Video' },
  OFFICE: { label: 'Office', icon: 'Briefcase' },
  OUTDOOR: { label: 'Outdoor', icon: 'Sun' },
  RESIDENTIAL: { label: 'Residential', icon: 'Home' },
  COMMERCIAL: { label: 'Commercial', icon: 'Building' },
  OTHER: { label: 'Other', icon: 'MapPin' },
};

export default function LocationsPage() {
  const router = useRouter();
  const [locations] = useState<Location[]>(initialLocations);
  const [activeFilter, setActiveFilter] = useState<LocationStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredLocations = locations.filter(
    loc => activeFilter === 'ALL' || loc.status === activeFilter
  );

  const stats = {
    total: locations.length,
    scouting: locations.filter(l => l.status === 'SCOUTING').length,
    approved: locations.filter(l => l.status === 'APPROVED' || l.status === 'BOOKED').length,
    pending: locations.filter(l => l.status === 'PENDING_APPROVAL').length,
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pre-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-preproduction)', color: 'white' }}
              >
                <Icons.MapPin className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Location Scouting</h1>
                <p className="text-sm text-[var(--text-secondary)]">Find and manage shoot locations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[var(--bg-2)] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[var(--bg-0)] shadow-sm' : ''}`}
                >
                  <Icons.Grid className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-[var(--bg-0)] shadow-sm' : ''}`}
                >
                  <Icons.List className={`w-4 h-4 ${viewMode === 'list' ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`} />
                </button>
              </div>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Location
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
              <p className="text-xs text-[var(--text-tertiary)]">Total Locations</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.scouting}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Scouting</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.pending}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending Approval</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.approved}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Approved/Booked</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'SCOUTING', 'PENDING_APPROVAL', 'APPROVED', 'BOOKED', 'REJECTED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {filter === 'ALL' ? 'All' : STATUS_CONFIG[filter].label}
            </button>
          ))}
        </div>

        {/* Locations Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location) => {
              const typeConfig = TYPE_CONFIG[location.type];
              const TypeIcon = Icons[typeConfig.icon];

              return (
                <Card
                  key={location.id}
                  className="overflow-hidden hover:border-[var(--primary)] transition-colors cursor-pointer"
                  onClick={() => router.push(`/pre-production/locations/${location.id}`)}
                >
                  {/* Photo Placeholder */}
                  <div className="h-32 bg-[var(--bg-2)] flex items-center justify-center relative">
                    <Icons.Image className="w-10 h-10 text-[var(--text-tertiary)]" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 rounded text-xs text-white">
                      {location.photoCount} photos
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{location.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <TypeIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          <span className="text-xs text-[var(--text-tertiary)]">{typeConfig.label}</span>
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          backgroundColor: STATUS_CONFIG[location.status].bgColor,
                          color: STATUS_CONFIG[location.status].color,
                        }}
                      >
                        {STATUS_CONFIG[location.status].label}
                      </span>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                      {location.address}, {location.city}
                    </p>

                    {/* Amenities */}
                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mb-3">
                      <span className={`flex items-center gap-1 ${location.permitRequired ? 'text-[var(--warning)]' : ''}`}>
                        <Icons.FileText className="w-3.5 h-3.5" />
                        {location.permitRequired ? 'Permit Required' : 'No Permit'}
                      </span>
                      <span className={`flex items-center gap-1 ${!location.parkingAvailable ? 'text-[var(--danger)]' : ''}`}>
                        <Icons.Truck className="w-3.5 h-3.5" />
                        {location.parkingAvailable ? 'Parking' : 'No Parking'}
                      </span>
                      <span className={`flex items-center gap-1 ${!location.powerAvailable ? 'text-[var(--danger)]' : ''}`}>
                        <Icons.Zap className="w-3.5 h-3.5" />
                        {location.powerAvailable ? 'Power' : 'No Power'}
                      </span>
                    </div>

                    {/* Rate & Contact */}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                      {location.dailyRate && (
                        <span className="font-semibold text-[var(--text-primary)]">
                          ${location.dailyRate.toLocaleString()}/day
                        </span>
                      )}
                      {location.contactName && (
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {location.contactName}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Location</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Type</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Address</th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Rate</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredLocations.map((location) => {
                  const typeConfig = TYPE_CONFIG[location.type];
                  const TypeIcon = Icons[typeConfig.icon];

                  return (
                    <tr
                      key={location.id}
                      className="hover:bg-[var(--bg-1)] transition-colors cursor-pointer"
                      onClick={() => router.push(`/pre-production/locations/${location.id}`)}
                    >
                      <td className="p-4">
                        <span className="font-medium text-[var(--text-primary)]">{location.name}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                          <span className="text-sm text-[var(--text-secondary)]">{typeConfig.label}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {location.city}
                      </td>
                      <td className="p-4 text-right font-medium text-[var(--text-primary)]">
                        {location.dailyRate ? `$${location.dailyRate.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: STATUS_CONFIG[location.status].bgColor,
                            color: STATUS_CONFIG[location.status].color,
                          }}
                        >
                          {STATUS_CONFIG[location.status].label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Icons.MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {filteredLocations.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.MapPin className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No locations found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Start scouting locations for your production.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
