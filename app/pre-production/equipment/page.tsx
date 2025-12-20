'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { Icons, Card, Button, Skeleton, Modal, Input, ConfirmModal } from '@/app/components/ui';

/**
 * EQUIPMENT PAGE
 * Manage camera, lighting, audio, and grip equipment.
 * Connected to Amplify Data API
 */

type EquipmentCategory = 'CAMERA' | 'LIGHTING' | 'AUDIO' | 'GRIP' | 'OTHER';
type EquipmentStatus = 'AVAILABLE' | 'RESERVED' | 'CHECKED_OUT';

interface EquipmentDisplay {
  id: string;
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  quantity: number;
  assignedProject?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  rentalRate?: number;
  // From API
  equipment: Schema['Equipment']['type'];
}

const CATEGORY_CONFIG: Record<EquipmentCategory, { label: string; icon: keyof typeof Icons; color: string }> = {
  CAMERA: { label: 'Camera', icon: 'Video', color: 'var(--danger)' },
  LIGHTING: { label: 'Lighting', icon: 'Sun', color: 'var(--warning)' },
  AUDIO: { label: 'Audio', icon: 'Mic', color: 'var(--success)' },
  GRIP: { label: 'Grip', icon: 'Settings', color: 'var(--primary)' },
  OTHER: { label: 'Other', icon: 'Package', color: 'var(--text-tertiary)' },
};

const STATUS_CONFIG: Record<EquipmentStatus, { label: string; color: string; bgColor: string }> = {
  AVAILABLE: { label: 'Available', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  RESERVED: { label: 'Reserved', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  CHECKED_OUT: { label: 'Checked Out', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
};

// API Category enum values (matches Schema['Equipment']['type']['category'])
type APICategory = 'CAMERA' | 'LENS' | 'LIGHTING' | 'AUDIO' | 'GRIP' | 'ELECTRIC' | 'MONITORS' | 'DRONES' | 'STABILIZERS' | 'ACCESSORIES' | 'VEHICLES' | 'STORAGE' | 'OTHER';

interface EquipmentFormData {
  name: string;
  category: APICategory;
  manufacturer: string;
  model: string;
  serialNumber: string;
  rentalRate: string;
}

const emptyFormData: EquipmentFormData = {
  name: '',
  category: 'OTHER',
  manufacturer: '',
  model: '',
  serialNumber: '',
  rentalRate: '',
};

// Map API data to display format
function mapEquipmentToDisplay(equipment: Schema['Equipment']['type']): EquipmentDisplay {
  // Map API category to our display category
  let displayCategory: EquipmentCategory = 'OTHER';
  if (equipment.category === 'CAMERA' || equipment.category === 'LENS') {
    displayCategory = 'CAMERA';
  } else if (equipment.category === 'LIGHTING') {
    displayCategory = 'LIGHTING';
  } else if (equipment.category === 'AUDIO') {
    displayCategory = 'AUDIO';
  } else if (equipment.category === 'GRIP' || equipment.category === 'ELECTRIC') {
    displayCategory = 'GRIP';
  }

  // Map API status to our display status
  let displayStatus: EquipmentStatus = 'AVAILABLE';
  if (equipment.status === 'CHECKED_OUT') {
    displayStatus = 'CHECKED_OUT';
  } else if (equipment.status === 'IN_MAINTENANCE' || equipment.status === 'DAMAGED') {
    displayStatus = 'RESERVED'; // Show as reserved if in maintenance
  }

  // For quantity, we'll use 1 as default since the Equipment model doesn't have a quantity field
  const quantity = 1;

  return {
    id: equipment.id,
    name: equipment.name,
    category: displayCategory,
    status: displayStatus,
    quantity,
    assignedProject: undefined, // TODO: Get from EquipmentCheckout relationship
    manufacturer: equipment.manufacturer || undefined,
    model: equipment.model || undefined,
    serialNumber: equipment.serialNumber || undefined,
    rentalRate: equipment.rentalRate || undefined,
    equipment,
  };
}

export default function EquipmentPage() {
  const router = useRouter();
  const { organizationId, loading: orgLoading } = useOrganization();
  const [equipment, setEquipment] = useState<EquipmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<EquipmentCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'ALL'>('ALL');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentDisplay | null>(null);
  const [formData, setFormData] = useState<EquipmentFormData>(emptyFormData);
  const [isCreating, setIsCreating] = useState(false);

  const fetchEquipment = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });

      // Fetch equipment for this organization
      const { data: equipmentData } = await client.models.Equipment.list({
        filter: { organizationId: { eq: organizationId } }
      });

      if (!equipmentData) {
        setEquipment([]);
        return;
      }

      // Map to display format
      const equipmentDisplay = equipmentData.map(mapEquipmentToDisplay);

      // Sort by name
      equipmentDisplay.sort((a, b) => a.name.localeCompare(b.name));

      setEquipment(equipmentDisplay);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError('Failed to load equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchEquipment();
    }
  }, [organizationId, fetchEquipment]);

  const filteredEquipment = equipment.filter(eq => {
    if (categoryFilter !== 'ALL' && eq.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && eq.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: equipment.length,
    available: equipment.filter(eq => eq.status === 'AVAILABLE').length,
    reserved: equipment.filter(eq => eq.status === 'RESERVED').length,
    checkedOut: equipment.filter(eq => eq.status === 'CHECKED_OUT').length,
  };

  const handleReserve = async (e: React.MouseEvent, equipmentId: string) => {
    e.stopPropagation();
    if (!organizationId) return;

    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });
      await client.models.Equipment.update({
        id: equipmentId,
        status: 'IN_MAINTENANCE', // Using IN_MAINTENANCE to represent reserved
      });
      await fetchEquipment();
    } catch (err) {
      console.error('Error reserving equipment:', err);
      alert('Failed to reserve equipment. Please try again.');
    }
  };

  const handleCheckOut = async (e: React.MouseEvent, equipmentId: string) => {
    e.stopPropagation();
    if (!organizationId) return;

    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });
      await client.models.Equipment.update({
        id: equipmentId,
        status: 'CHECKED_OUT',
      });
      await fetchEquipment();
    } catch (err) {
      console.error('Error checking out equipment:', err);
      alert('Failed to check out equipment. Please try again.');
    }
  };

  const handleCheckIn = async (e: React.MouseEvent, equipmentId: string) => {
    e.stopPropagation();
    if (!organizationId) return;

    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });
      await client.models.Equipment.update({
        id: equipmentId,
        status: 'AVAILABLE',
      });
      await fetchEquipment();
    } catch (err) {
      console.error('Error checking in equipment:', err);
      alert('Failed to check in equipment. Please try again.');
    }
  };

  const handleViewDetails = (equipmentId: string) => {
    router.push(`/pre-production/equipment/${equipmentId}`);
  };

  const handleAddEquipment = () => {
    setFormData(emptyFormData);
    setIsCreateModalOpen(true);
  };

  const handleCreateEquipment = async () => {
    if (!organizationId || !formData.name) return;

    setIsCreating(true);
    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });
      await client.models.Equipment.create({
        organizationId,
        name: formData.name,
        category: formData.category,
        status: 'AVAILABLE',
        manufacturer: formData.manufacturer || undefined,
        model: formData.model || undefined,
        serialNumber: formData.serialNumber || undefined,
        rentalRate: formData.rentalRate ? parseFloat(formData.rentalRate) : undefined,
      });
      await fetchEquipment();
      setFormData(emptyFormData);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating equipment:', err);
      alert('Failed to create equipment. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenDeleteModal = (e: React.MouseEvent, item: EquipmentDisplay) => {
    e.stopPropagation();
    setSelectedEquipment(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEquipment = async () => {
    if (!selectedEquipment) return;

    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });
      await client.models.Equipment.delete({ id: selectedEquipment.id });
      await fetchEquipment();
      setSelectedEquipment(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting equipment:', err);
      alert('Failed to delete equipment. Please try again.');
    }
  };

  const isLoading = orgLoading || loading;

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
                <p className="text-sm text-[var(--text-secondary)]">Manage cameras, lights, and gear</p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={handleAddEquipment}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Total Items</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--success)]">{stats.available}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Available</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--warning)]">{stats.reserved}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Reserved</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--primary)]">{stats.checkedOut}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Checked Out</p>
            </div>
          </Card>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
          {(['ALL', 'CAMERA', 'LIGHTING', 'AUDIO', 'GRIP', 'OTHER'] as const).map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                categoryFilter === category
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {category === 'ALL' ? 'All Categories' : CATEGORY_CONFIG[category].label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
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

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6 border-[var(--danger)]">
            <div className="flex items-center gap-3 text-[var(--danger)]">
              <Icons.AlertCircle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchEquipment} className="ml-auto">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Equipment Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map((item) => {
              const categoryConfig = CATEGORY_CONFIG[item.category];
              const statusConfig = STATUS_CONFIG[item.status];
              const CategoryIcon = Icons[categoryConfig.icon];

              return (
                <Card
                  key={item.id}
                  className="p-5 hover:border-[var(--primary)] transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(item.id)}
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${categoryConfig.color}20`, color: categoryConfig.color }}
                    >
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] truncate">{item.name}</h3>
                      <p className="text-xs text-[var(--text-tertiary)]">{categoryConfig.label}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-tertiary)]">Status</span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    {item.manufacturer && item.model && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-tertiary)]">Model</span>
                        <span className="text-[var(--text-primary)] truncate ml-2">
                          {item.manufacturer} {item.model}
                        </span>
                      </div>
                    )}
                    {item.serialNumber && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-tertiary)]">Serial</span>
                        <span className="text-[var(--text-secondary)] font-mono text-xs">{item.serialNumber}</span>
                      </div>
                    )}
                    {item.rentalRate !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-tertiary)]">Rate</span>
                        <span className="text-[var(--text-primary)] font-medium">${item.rentalRate}/day</span>
                      </div>
                    )}
                    {item.assignedProject && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-tertiary)]">Assigned</span>
                        <span className="text-[var(--text-primary)] truncate ml-2">{item.assignedProject}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {item.status === 'AVAILABLE' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => handleReserve(e, item.id)}
                          className="flex-1"
                        >
                          Reserve
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => handleCheckOut(e, item.id)}
                          className="flex-1"
                        >
                          Check Out
                        </Button>
                      </>
                    )}
                    {item.status === 'RESERVED' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => handleCheckOut(e, item.id)}
                          className="flex-1"
                        >
                          Check Out
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleCheckIn(e, item.id)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {item.status === 'CHECKED_OUT' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => handleCheckIn(e, item.id)}
                        className="flex-1"
                      >
                        <Icons.Check className="w-4 h-4 mr-1" />
                        Check In
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleOpenDeleteModal(e, item)}
                      title="Delete"
                    >
                      <Icons.Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredEquipment.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Video className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No equipment found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'No equipment matches your filters. Try adjusting your selection.'
                : 'Add equipment to start managing your gear inventory.'
              }
            </p>
            <Button variant="primary" size="sm" onClick={handleAddEquipment}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </Card>
        )}
      </div>

      {/* Create Equipment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Equipment"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Equipment Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., RED Komodo 6K"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as APICategory })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="CAMERA">Camera</option>
                <option value="LENS">Lens</option>
                <option value="LIGHTING">Lighting</option>
                <option value="AUDIO">Audio</option>
                <option value="GRIP">Grip</option>
                <option value="ELECTRIC">Electric</option>
                <option value="MONITORS">Monitors</option>
                <option value="DRONES">Drones</option>
                <option value="STABILIZERS">Stabilizers</option>
                <option value="ACCESSORIES">Accessories</option>
                <option value="VEHICLES">Vehicles</option>
                <option value="STORAGE">Storage</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Rental Rate ($/day)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.rentalRate}
                onChange={(e) => setFormData({ ...formData, rentalRate: e.target.value })}
                placeholder="e.g., 250"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Manufacturer</label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="e.g., RED"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Model</label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g., Komodo 6K"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Serial Number</label>
            <Input
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="e.g., RED-123456"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateEquipment} disabled={isCreating || !formData.name}>
              {isCreating ? 'Creating...' : 'Add Equipment'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEquipment}
        title="Delete Equipment"
        message={`Are you sure you want to delete "${selectedEquipment?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
