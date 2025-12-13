'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from '@/app/components/Toast';

type CallSheetCrew = Schema['CallSheetCrew']['type'];

interface CrewManagementFormProps {
  callSheetId: string;
  onCrewUpdated?: () => void;
}

const DEPARTMENTS = [
  'CAMERA',
  'SOUND',
  'LIGHTING',
  'GRIP',
  'ELECTRIC',
  'PRODUCTION',
  'ART',
  'MAKEUP',
  'WARDROBE',
  'VFX',
  'OTHER',
] as const;

export default function CrewManagementForm({
  callSheetId,
  onCrewUpdated,
}: CrewManagementFormProps) {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [crew, setCrew] = useState<CallSheetCrew[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'PRODUCTION' as 'CAMERA' | 'SOUND' | 'LIGHTING' | 'GRIP' | 'ELECTRIC' | 'PRODUCTION' | 'ART' | 'MAKEUP' | 'WARDROBE' | 'VFX' | 'OTHER',
    callTime: '',
    walkieChannel: '',
    phone: '',
    email: '',
    notes: '',
    sortOrder: 0,
  });

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  useEffect(() => {
    if (client) loadCrew();
  }, [callSheetId, client]);

  const loadCrew = async () => {
    if (!client) return;
    try {
      setLoading(true);
      const { data } = await client.models.CallSheetCrew.list({
        filter: { callSheetId: { eq: callSheetId } },
      });

      if (data) {
        const sorted = [...data].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCrew(sorted);
      }
    } catch (error) {
      console.error('Error loading crew:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      department: 'PRODUCTION' as 'CAMERA' | 'SOUND' | 'LIGHTING' | 'GRIP' | 'ELECTRIC' | 'PRODUCTION' | 'ART' | 'MAKEUP' | 'WARDROBE' | 'VFX' | 'OTHER',
      callTime: '',
      walkieChannel: '',
      phone: '',
      email: '',
      notes: '',
      sortOrder: crew.length,
    });
    setEditingCrewId(null);
    setShowAddForm(false);
  };

  const handleEdit = (member: CallSheetCrew) => {
    setFormData({
      name: member.name || '',
      role: member.role || '',
      department: member.department || 'PRODUCTION',
      callTime: member.callTime || '',
      walkieChannel: member.walkieChannel || '',
      phone: member.phone || '',
      email: member.email || '',
      notes: member.notes || '',
      sortOrder: member.sortOrder || 0,
    });
    setEditingCrewId(member.id);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      if (editingCrewId) {
        // Update existing crew member
        await client.models.CallSheetCrew.update({
          id: editingCrewId,
          name: formData.name,
          role: formData.role,
          department: formData.department as 'CAMERA' | 'SOUND' | 'LIGHTING' | 'GRIP' | 'ELECTRIC' | 'PRODUCTION' | 'ART' | 'MAKEUP' | 'WARDROBE' | 'VFX' | 'OTHER',
          callTime: formData.callTime,
          walkieChannel: formData.walkieChannel,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
          sortOrder: formData.sortOrder,
        });
      } else {
        // Create new crew member
        await client.models.CallSheetCrew.create({
          callSheetId,
          name: formData.name,
          role: formData.role,
          department: formData.department as 'CAMERA' | 'SOUND' | 'LIGHTING' | 'GRIP' | 'ELECTRIC' | 'PRODUCTION' | 'ART' | 'MAKEUP' | 'WARDROBE' | 'VFX' | 'OTHER',
          callTime: formData.callTime,
          walkieChannel: formData.walkieChannel,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
          sortOrder: formData.sortOrder,
        });
      }

      await loadCrew();
      resetForm();

      if (onCrewUpdated) {
        onCrewUpdated();
      }
    } catch (error) {
      console.error('Error saving crew member:', error);
      toast.error('Save Failed', 'Failed to save crew member. Please try again.');
    }
  };

  const handleDelete = async (crewId: string) => {
    if (!client) return;
    if (!confirm('Are you sure you want to delete this crew member?')) {
      return;
    }

    try {
      await client.models.CallSheetCrew.delete({ id: crewId });
      await loadCrew();

      if (onCrewUpdated) {
        onCrewUpdated();
      }
    } catch (error) {
      console.error('Error deleting crew member:', error);
      toast.error('Delete Failed', 'Failed to delete crew member. Please try again.');
    }
  };

  const moveCrew = async (crewId: string, direction: 'up' | 'down') => {
    if (!client) return;
    const currentIndex = crew.findIndex((c) => c.id === crewId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= crew.length) return;

    const newCrew = [...crew];
    [newCrew[currentIndex], newCrew[newIndex]] = [newCrew[newIndex], newCrew[currentIndex]];

    try {
      // Update sort order for both crew members
      await Promise.all([
        client.models.CallSheetCrew.update({
          id: newCrew[currentIndex].id,
          sortOrder: currentIndex,
        }),
        client.models.CallSheetCrew.update({
          id: newCrew[newIndex].id,
          sortOrder: newIndex,
        }),
      ]);

      await loadCrew();

      if (onCrewUpdated) {
        onCrewUpdated();
      }
    } catch (error) {
      console.error('Error reordering crew:', error);
      toast.error('Reorder Failed', 'Failed to reorder crew. Please try again.');
    }
  };

  const groupByDepartment = () => {
    return crew.reduce((acc, member) => {
      const dept = member.department || 'Other';
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(member);
      return acc;
    }, {} as Record<string, CallSheetCrew[]>);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading crew...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Crew Roster</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Crew Member
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
          <h4 className="font-semibold text-gray-900">
            {editingCrewId ? 'Edit Crew Member' : 'Add New Crew Member'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 1st AC, Gaffer, Key Grip"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as "PRODUCTION" | "CAMERA" | "SOUND" | "LIGHTING" | "GRIP" | "ELECTRIC" | "ART" | "MAKEUP" | "WARDROBE" | "VFX" | "OTHER" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Time
              </label>
              <input
                type="time"
                value={formData.callTime}
                onChange={(e) => setFormData({ ...formData, callTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Walkie Channel
              </label>
              <input
                type="text"
                value={formData.walkieChannel}
                onChange={(e) => setFormData({ ...formData, walkieChannel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 1, 2, 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="crew@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Any special requirements or notes"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {editingCrewId ? 'Update Crew Member' : 'Add Crew Member'}
            </button>
          </div>
        </form>
      )}

      {crew.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No crew members added yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Crew Member" to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupByDepartment()).map(([department, members]) => (
            <div key={department} className="space-y-2">
              <h4 className="font-semibold text-gray-900 border-b border-gray-300 pb-1">
                {department} ({members.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name / Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Call Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Walkie
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member, index) => {
                      const globalIndex = crew.findIndex((c) => c.id === member.id);
                      return (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-gray-500 text-xs">{member.role}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {member.callTime || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {member.walkieChannel || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {member.phone && <div>{member.phone}</div>}
                            {member.email && (
                              <div className="text-xs">{member.email}</div>
                            )}
                            {!member.phone && !member.email && '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right space-x-2">
                            <button
                              onClick={() => moveCrew(member.id, 'up')}
                              disabled={globalIndex === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveCrew(member.id, 'down')}
                              disabled={globalIndex === crew.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => handleEdit(member)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
