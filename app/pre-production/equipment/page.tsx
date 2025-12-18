'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * EQUIPMENT PAGE
 * Book and manage camera, lighting, and grip equipment.
 */

type EquipmentCategory = 'CAMERA' | 'LENS' | 'LIGHTING' | 'GRIP' | 'AUDIO' | 'ACCESSORIES';
type BookingStatus = 'AVAILABLE' | 'RESERVED' | 'CHECKED_OUT' | 'UNAVAILABLE';

interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  vendor: string;
  dailyRate: number;
  status: BookingStatus;
  bookedDates?: string;
  quantity: number;
  notes?: string;
}

// Data will be fetched from API
const initialEquipment: Equipment[] = [];

const CATEGORY_CONFIG: Record<EquipmentCategory, { label: string; icon: keyof typeof Icons; color: string }> = {
  CAMERA: { label: 'Camera', icon: 'Video', color: 'var(--danger)' },
  LENS: { label: 'Lens', icon: 'Circle', color: 'var(--warning)' },
  LIGHTING: { label: 'Lighting', icon: 'Sun', color: 'var(--success)' },
  GRIP: { label: 'Grip', icon: 'Settings', color: 'var(--primary)' },
  AUDIO: { label: 'Audio', icon: 'Mic', color: 'var(--accent)' },
  ACCESSORIES: { label: 'Accessories', icon: 'Package', color: 'var(--text-tertiary)' },
};

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bgColor: string }> = {
  AVAILABLE: { label: 'Available', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  RESERVED: { label: 'Reserved', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  CHECKED_OUT: { label: 'Checked Out', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
  UNAVAILABLE: { label: 'Unavailable', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
};

export default function EquipmentPage() {
  const [equipment] = useState<Equipment[]>(initialEquipment);
  const [categoryFilter, setCategoryFilter] = useState<EquipmentCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');

  const filteredEquipment = equipment.filter(eq => {
    if (categoryFilter !== 'ALL' && eq.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && eq.status !== statusFilter) return false;
    return true;
  });

  const totalDailyRate = equipment
    .filter(eq => eq.status === 'RESERVED' || eq.status === 'CHECKED_OUT')
    .reduce((sum, eq) => sum + (eq.dailyRate * eq.quantity), 0);

  const stats = {
    total: equipment.length,
    reserved: equipment.filter(eq => eq.status === 'RESERVED').length,
    available: equipment.filter(eq => eq.status === 'AVAILABLE').length,
    dailyTotal: totalDailyRate,
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
                <Icons.Video className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Equipment</h1>
                <p className="text-sm text-[var(--text-secondary)]">Book cameras, lights, and gear</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.FileText className="w-4 h-4 mr-2" />
                Equipment List
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Equipment
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
              <p className="text-xs text-[var(--text-tertiary)]">Total Items</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.reserved}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Reserved</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.available}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Available</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">${stats.dailyTotal.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Daily Total</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            {(['ALL', 'CAMERA', 'LENS', 'LIGHTING', 'GRIP', 'AUDIO'] as const).map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  categoryFilter === category
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {category === 'ALL' ? 'All' : CATEGORY_CONFIG[category].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {(['ALL', 'AVAILABLE', 'RESERVED', 'CHECKED_OUT'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
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

        {/* Equipment Table */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Equipment</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Vendor</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Qty</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Daily Rate</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredEquipment.map((item) => {
                const categoryConfig = CATEGORY_CONFIG[item.category];
                const statusConfig = STATUS_CONFIG[item.status];
                const CategoryIcon = Icons[categoryConfig.icon];

                return (
                  <tr key={item.id} className="hover:bg-[var(--bg-1)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${categoryConfig.color}20`, color: categoryConfig.color }}
                        >
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{categoryConfig.label}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{item.vendor}</td>
                    <td className="p-4 text-sm text-[var(--text-primary)] font-medium">{item.quantity}</td>
                    <td className="p-4 text-sm text-[var(--text-primary)]">${item.dailyRate}/day</td>
                    <td className="p-4">
                      <div>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                          }}
                        >
                          {statusConfig.label}
                        </span>
                        {item.bookedDates && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-1">{item.bookedDates}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {item.status === 'AVAILABLE' && (
                          <Button variant="primary" size="sm">
                            Book
                          </Button>
                        )}
                        {item.status === 'RESERVED' && (
                          <Button variant="secondary" size="sm">
                            Modify
                          </Button>
                        )}
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

        {filteredEquipment.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Video className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No equipment found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Add equipment to start managing your gear.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
