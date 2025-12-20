'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Skeleton, Input } from '@/app/components/ui';

/**
 * LOCATIONS PAGE - Pre-Production
 * Scout and manage shooting locations with mock data
 */

type LocationType = 'STUDIO' | 'OUTDOOR' | 'INTERIOR' | 'EXTERIOR';
type LocationStatus = 'CONFIRMED' | 'PENDING' | 'SCOUTING';

interface Location {
  id: string;
  name: string;
  address: string;
  type: LocationType;
  status: LocationStatus;
  contactName: string;
  contactPhone: string;
  permitRequired: boolean;
  notes: string;
  photos: string[];
  dailyRate?: number;
  parkingAvailable: boolean;
  powerAvailable: boolean;
}

// Mock Data
const MOCK_DATA: Location[] = [
  {
    id: '1',
    name: 'Downtown Studio A',
    address: '123 Main St, Los Angeles, CA 90012',
    type: 'STUDIO',
    status: 'CONFIRMED',
    contactName: 'Sarah Johnson',
    contactPhone: '(555) 123-4567',
    permitRequired: false,
    notes: 'Fully equipped soundstage with green screen. Available weekdays.',
    photos: ['/placeholder1.jpg', '/placeholder2.jpg'],
    dailyRate: 2500,
    parkingAvailable: true,
    powerAvailable: true,
  },
  {
    id: '2',
    name: 'Griffith Park Overlook',
    address: 'Griffith Park, Los Angeles, CA 90027',
    type: 'OUTDOOR',
    status: 'PENDING',
    contactName: 'Parks Department',
    contactPhone: '(555) 234-5678',
    permitRequired: true,
    notes: 'Stunning city views. Permit required, applied for June 15-17.',
    photos: ['/placeholder3.jpg'],
    dailyRate: 500,
    parkingAvailable: true,
    powerAvailable: false,
  },
  {
    id: '3',
    name: 'The Grand Hotel Lobby',
    address: '456 Luxury Ave, Beverly Hills, CA 90210',
    type: 'INTERIOR',
    status: 'CONFIRMED',
    contactName: 'Michael Chen',
    contactPhone: '(555) 345-6789',
    permitRequired: false,
    notes: 'Art deco lobby with marble floors. Available after 10 PM only.',
    photos: ['/placeholder4.jpg', '/placeholder5.jpg', '/placeholder6.jpg'],
    dailyRate: 3500,
    parkingAvailable: true,
    powerAvailable: true,
  },
  {
    id: '4',
    name: 'Venice Beach Boardwalk',
    address: 'Ocean Front Walk, Venice, CA 90291',
    type: 'EXTERIOR',
    status: 'SCOUTING',
    contactName: 'City Film Office',
    contactPhone: '(555) 456-7890',
    permitRequired: true,
    notes: 'Popular tourist spot. Early morning shoot recommended to avoid crowds.',
    photos: ['/placeholder7.jpg'],
    parkingAvailable: false,
    powerAvailable: false,
  },
  {
    id: '5',
    name: 'Warehouse District - Building 7',
    address: '789 Industrial Rd, Los Angeles, CA 90021',
    type: 'INTERIOR',
    status: 'PENDING',
    contactName: 'Robert Martinez',
    contactPhone: '(555) 567-8901',
    permitRequired: true,
    notes: 'Raw industrial space with high ceilings. Needs cleanup before shoot.',
    photos: ['/placeholder8.jpg', '/placeholder9.jpg'],
    dailyRate: 1200,
    parkingAvailable: true,
    powerAvailable: true,
  },
  {
    id: '6',
    name: 'Malibu Cliff View',
    address: 'Pacific Coast Highway, Malibu, CA 90265',
    type: 'OUTDOOR',
    status: 'SCOUTING',
    contactName: 'Private Owner',
    contactPhone: '(555) 678-9012',
    permitRequired: true,
    notes: 'Private property with ocean views. Owner requesting insurance coverage.',
    photos: ['/placeholder10.jpg'],
    dailyRate: 2000,
    parkingAvailable: true,
    powerAvailable: false,
  },
  {
    id: '7',
    name: 'Sunset Sound Studios',
    address: '6650 Sunset Blvd, Hollywood, CA 90028',
    type: 'STUDIO',
    status: 'CONFIRMED',
    contactName: 'Jennifer Lee',
    contactPhone: '(555) 789-0123',
    permitRequired: false,
    notes: 'Professional recording studio with filming capabilities. Fully soundproofed.',
    photos: ['/placeholder11.jpg', '/placeholder12.jpg'],
    dailyRate: 1800,
    parkingAvailable: true,
    powerAvailable: true,
  },
  {
    id: '8',
    name: 'Historic Theater - Main Stage',
    address: '321 Broadway, Downtown LA, CA 90013',
    type: 'INTERIOR',
    status: 'PENDING',
    contactName: 'Theater Manager',
    contactPhone: '(555) 890-1234',
    permitRequired: true,
    notes: 'Beautiful 1920s architecture. Limited availability due to ongoing performances.',
    photos: ['/placeholder13.jpg'],
    dailyRate: 4000,
    parkingAvailable: false,
    powerAvailable: true,
  },
];

const TYPE_CONFIG: Record<LocationType, { label: string; icon: keyof typeof Icons; color: string }> = {
  STUDIO: { label: 'Studio', icon: 'Video', color: 'var(--primary)' },
  OUTDOOR: { label: 'Outdoor', icon: 'Sun', color: 'var(--success)' },
  INTERIOR: { label: 'Interior', icon: 'Home', color: 'var(--accent)' },
  EXTERIOR: { label: 'Exterior', icon: 'Building', color: 'var(--warning)' },
};

const STATUS_CONFIG: Record<LocationStatus, { label: string; color: string; bgColor: string }> = {
  CONFIRMED: { label: 'Confirmed', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  PENDING: { label: 'Pending', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  SCOUTING: { label: 'Scouting', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
};

export default function LocationsPage() {
  const [locations] = useState<Location[]>(MOCK_DATA);
  const [activeType, setActiveType] = useState<LocationType | 'ALL'>('ALL');
  const [activeStatus, setActiveStatus] = useState<LocationStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter locations by type, status, and search
  const filteredLocations = locations.filter(location => {
    const matchesType = activeType === 'ALL' || location.type === activeType;
    const matchesStatus = activeStatus === 'ALL' || location.status === activeStatus;
    const matchesSearch = searchQuery === '' ||
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: locations.length,
    confirmed: locations.filter(l => l.status === 'CONFIRMED').length,
    pending: locations.filter(l => l.status === 'PENDING').length,
    scouting: locations.filter(l => l.status === 'SCOUTING').length,
  };

  // Handler functions
  const handleViewDetails = (locationId: string) => {
    console.log('View details:', locationId);
    // TODO: Navigate to location details page
  };

  const handleScheduleScout = (locationId: string) => {
    console.log('Schedule scout:', locationId);
    // TODO: Open scheduling modal
  };

  const handleGetDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Locations</h1>
                <p className="text-sm text-[var(--text-secondary)]">Scout and manage shooting locations</p>
              </div>
            </div>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Locations</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.confirmed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Confirmed</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.pending}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.scouting}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Scouting</p>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            icon="Search"
            placeholder="Search locations, addresses, or contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-[var(--text-tertiary)] whitespace-nowrap">Type:</span>
            <button
              onClick={() => setActiveType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeType === 'ALL'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-1)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-2)]'
              }`}
            >
              All
            </button>
            {(Object.keys(TYPE_CONFIG) as LocationType[]).map((type) => {
              const TypeIcon = Icons[TYPE_CONFIG[type].icon];
              const isActive = activeType === type;
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-1)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-2)]'
                  }`}
                >
                  <TypeIcon className="w-4 h-4" />
                  {TYPE_CONFIG[type].label}
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-[var(--text-tertiary)] whitespace-nowrap">Status:</span>
            <button
              onClick={() => setActiveStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeStatus === 'ALL'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-1)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-2)]'
              }`}
            >
              All
            </button>
            {(Object.keys(STATUS_CONFIG) as LocationStatus[]).map((status) => {
              const isActive = activeStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-1)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-2)]'
                  }`}
                >
                  {STATUS_CONFIG[status].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((location) => {
            const typeConfig = TYPE_CONFIG[location.type];
            const TypeIcon = Icons[typeConfig.icon];

            return (
              <Card key={location.id} className="overflow-hidden hover:border-[var(--primary)] transition-colors">
                {/* Location Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-[var(--bg-2)] to-[var(--bg-3)] flex items-center justify-center relative">
                  <Icons.Image className="w-12 h-12 text-[var(--text-tertiary)]" />
                  <div className="absolute top-3 left-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: STATUS_CONFIG[location.status].bgColor,
                        color: STATUS_CONFIG[location.status].color,
                      }}
                    >
                      {STATUS_CONFIG[location.status].label}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 bg-black/50 rounded text-xs text-white backdrop-blur-sm">
                      {location.photos.length} photos
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Location Header */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">{location.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <TypeIcon className="w-4 h-4" style={{ color: typeConfig.color }} />
                      <span className="text-sm font-medium" style={{ color: typeConfig.color }}>
                        {typeConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] flex items-start gap-1">
                      <Icons.MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{location.address}</span>
                    </p>
                  </div>

                  {/* Location Details */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-tertiary)]">Contact:</span>
                      <span className="text-[var(--text-primary)] font-medium">{location.contactName}</span>
                    </div>
                    {location.dailyRate && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-tertiary)]">Daily Rate:</span>
                        <span className="text-[var(--text-primary)] font-semibold">
                          ${location.dailyRate.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  <div className="flex items-center gap-3 text-xs mb-4 pb-4 border-b border-[var(--border-subtle)]">
                    <div
                      className={`flex items-center gap-1 ${
                        location.permitRequired ? 'text-[var(--warning)]' : 'text-[var(--text-tertiary)]'
                      }`}
                    >
                      <Icons.FileText className="w-3.5 h-3.5" />
                      <span>{location.permitRequired ? 'Permit Req.' : 'No Permit'}</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        location.parkingAvailable ? 'text-[var(--success)]' : 'text-[var(--text-tertiary)]'
                      }`}
                    >
                      <Icons.Truck className="w-3.5 h-3.5" />
                      <span>{location.parkingAvailable ? 'Parking' : 'No Parking'}</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        location.powerAvailable ? 'text-[var(--success)]' : 'text-[var(--text-tertiary)]'
                      }`}
                    >
                      <Icons.Zap className="w-3.5 h-3.5" />
                      <span>{location.powerAvailable ? 'Power' : 'No Power'}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {location.notes && (
                    <p className="text-xs text-[var(--text-tertiary)] mb-4 line-clamp-2">
                      {location.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(location.id)}
                      className="text-xs"
                    >
                      <Icons.Eye className="w-3.5 h-3.5 mr-1" />
                      Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleScheduleScout(location.id)}
                      className="text-xs"
                    >
                      <Icons.Calendar className="w-3.5 h-3.5 mr-1" />
                      Scout
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGetDirections(location.address)}
                      className="text-xs"
                    >
                      <Icons.MapPin className="w-3.5 h-3.5 mr-1" />
                      Map
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredLocations.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.MapPin className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No locations found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {searchQuery || activeType !== 'ALL' || activeStatus !== 'ALL'
                ? 'Try adjusting your filters or search query.'
                : 'Start adding locations for your production.'}
            </p>
            {!searchQuery && activeType === 'ALL' && activeStatus === 'ALL' && (
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add First Location
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
