'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from '@/app/components/Toast';

type CallSheetCast = Schema['CallSheetCast']['type'];

interface CastManagementFormProps {
  callSheetId: string;
  onCastUpdated?: () => void;
}

export default function CastManagementForm({
  callSheetId,
  onCastUpdated,
}: CastManagementFormProps) {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [cast, setCast] = useState<CallSheetCast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCastId, setEditingCastId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    actorName: '',
    characterName: '',
    makeupCall: '',
    wardrobeCall: '',
    callToSet: '',
    phone: '',
    email: '',
    pickupLocation: '',
    pickupTime: '',
    notes: '',
    sortOrder: 0,
  });

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  useEffect(() => {
    if (client) loadCast();
  }, [callSheetId, client]);

  const loadCast = async () => {
    if (!client) return;
    try {
      setLoading(true);
      const { data } = await client.models.CallSheetCast.list({
        filter: { callSheetId: { eq: callSheetId } },
      });

      if (data) {
        const sorted = [...data].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCast(sorted);
      }
    } catch (error) {
      console.error('Error loading cast:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      actorName: '',
      characterName: '',
      makeupCall: '',
      wardrobeCall: '',
      callToSet: '',
      phone: '',
      email: '',
      pickupLocation: '',
      pickupTime: '',
      notes: '',
      sortOrder: cast.length,
    });
    setEditingCastId(null);
    setShowAddForm(false);
  };

  const handleEdit = (member: CallSheetCast) => {
    setFormData({
      actorName: member.actorName || '',
      characterName: member.characterName || '',
      makeupCall: member.makeupCall || '',
      wardrobeCall: member.wardrobeCall || '',
      callToSet: member.callToSet || '',
      phone: member.phone || '',
      email: member.email || '',
      pickupLocation: member.pickupLocation || '',
      pickupTime: member.pickupTime || '',
      notes: member.notes || '',
      sortOrder: member.sortOrder || 0,
    });
    setEditingCastId(member.id);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      if (editingCastId) {
        // Update existing cast member
        await client.models.CallSheetCast.update({
          id: editingCastId,
          ...formData,
        });
      } else {
        // Create new cast member
        await client.models.CallSheetCast.create({
          callSheetId,
          ...formData,
        });
      }

      await loadCast();
      resetForm();

      if (onCastUpdated) {
        onCastUpdated();
      }
    } catch (error) {
      console.error('Error saving cast member:', error);
      toast.error('Save Failed', 'Failed to save cast member. Please try again.');
    }
  };

  const handleDelete = async (castId: string) => {
    if (!client) return;
    if (!confirm('Are you sure you want to delete this cast member?')) {
      return;
    }

    try {
      await client.models.CallSheetCast.delete({ id: castId });
      await loadCast();

      if (onCastUpdated) {
        onCastUpdated();
      }
    } catch (error) {
      console.error('Error deleting cast member:', error);
      toast.error('Delete Failed', 'Failed to delete cast member. Please try again.');
    }
  };

  const moveCast = async (castId: string, direction: 'up' | 'down') => {
    if (!client) return;
    const currentIndex = cast.findIndex((c) => c.id === castId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= cast.length) return;

    const newCast = [...cast];
    [newCast[currentIndex], newCast[newIndex]] = [newCast[newIndex], newCast[currentIndex]];

    try {
      // Update sort order for both cast members
      await Promise.all([
        client.models.CallSheetCast.update({
          id: newCast[currentIndex].id,
          sortOrder: currentIndex,
        }),
        client.models.CallSheetCast.update({
          id: newCast[newIndex].id,
          sortOrder: newIndex,
        }),
      ]);

      await loadCast();

      if (onCastUpdated) {
        onCastUpdated();
      }
    } catch (error) {
      console.error('Error reordering cast:', error);
      toast.error('Reorder Failed', 'Failed to reorder cast. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading cast...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Cast List</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Cast Member
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
          <h4 className="font-semibold text-gray-900">
            {editingCastId ? 'Edit Cast Member' : 'Add New Cast Member'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actor Name *
              </label>
              <input
                type="text"
                value={formData.actorName}
                onChange={(e) => setFormData({ ...formData, actorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Full name of actor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Character Name *
              </label>
              <input
                type="text"
                value={formData.characterName}
                onChange={(e) => setFormData({ ...formData, characterName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Character they're playing"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Makeup Call
              </label>
              <input
                type="time"
                value={formData.makeupCall}
                onChange={(e) => setFormData({ ...formData, makeupCall: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wardrobe Call
              </label>
              <input
                type="time"
                value={formData.wardrobeCall}
                onChange={(e) => setFormData({ ...formData, wardrobeCall: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call to Set *
              </label>
              <input
                type="time"
                value={formData.callToSet}
                onChange={(e) => setFormData({ ...formData, callToSet: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="actor@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Time
              </label>
              <input
                type="time"
                value={formData.pickupTime}
                onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Address for pickup"
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
              {editingCastId ? 'Update Cast Member' : 'Add Cast Member'}
            </button>
          </div>
        </form>
      )}

      {cast.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No cast members added yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Cast Member" to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor / Character
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Makeup Call
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wardrobe Call
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Call to Set
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
              {cast.map((member, index) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900">{member.actorName}</div>
                    <div className="text-gray-500 text-xs">as {member.characterName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {member.makeupCall || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {member.wardrobeCall || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {member.callToSet || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {member.phone && <div>{member.phone}</div>}
                    {member.email && <div className="text-xs">{member.email}</div>}
                    {!member.phone && !member.email && '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button
                      onClick={() => moveCast(member.id, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveCast(member.id, 'down')}
                      disabled={index === cast.length - 1}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
