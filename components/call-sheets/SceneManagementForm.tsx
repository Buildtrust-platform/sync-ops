'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

type CallSheetScene = Schema['CallSheetScene']['type'];

interface SceneManagementFormProps {
  callSheetId: string;
  onScenesUpdated?: () => void;
}

export default function SceneManagementForm({
  callSheetId,
  onScenesUpdated,
}: SceneManagementFormProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [scenes, setScenes] = useState<CallSheetScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sceneNumber: '',
    sceneHeading: '',
    sceneDescription: '',
    sceneLocation: '',
    scheduledTime: '',
    estimatedDuration: '',
    status: 'SCHEDULED' as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED',
    sortOrder: 0,
  });

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  useEffect(() => {
    if (client) loadScenes();
  }, [callSheetId, client]);

  const loadScenes = async () => {
    if (!client) return;
    try {
      setLoading(true);
      const { data } = await client.models.CallSheetScene.list({
        filter: { callSheetId: { eq: callSheetId } },
      });

      if (data) {
        const sorted = [...data].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setScenes(sorted);
      }
    } catch (error) {
      console.error('Error loading scenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sceneNumber: '',
      sceneHeading: '',
      sceneDescription: '',
      sceneLocation: '',
      scheduledTime: '',
      estimatedDuration: '',
      status: 'SCHEDULED',
      sortOrder: scenes.length,
    });
    setEditingSceneId(null);
    setShowAddForm(false);
  };

  const handleEdit = (scene: CallSheetScene) => {
    setFormData({
      sceneNumber: scene.sceneNumber || '',
      sceneHeading: scene.sceneHeading || '',
      sceneDescription: scene.sceneDescription || '',
      sceneLocation: scene.sceneLocation || '',
      scheduledTime: scene.scheduledTime || '',
      estimatedDuration: scene.estimatedDuration || '',
      status: scene.status || 'SCHEDULED',
      sortOrder: scene.sortOrder || 0,
    });
    setEditingSceneId(scene.id);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      if (editingSceneId) {
        // Update existing scene
        await client.models.CallSheetScene.update({
          id: editingSceneId,
          ...formData,
        });
      } else {
        // Create new scene
        await client.models.CallSheetScene.create({
          callSheetId,
          ...formData,
        });
      }

      await loadScenes();
      resetForm();

      if (onScenesUpdated) {
        onScenesUpdated();
      }
    } catch (error) {
      console.error('Error saving scene:', error);
      alert('Failed to save scene. Please try again.');
    }
  };

  const handleDelete = async (sceneId: string) => {
    if (!client) return;
    if (!confirm('Are you sure you want to delete this scene?')) {
      return;
    }

    try {
      await client.models.CallSheetScene.delete({ id: sceneId });
      await loadScenes();

      if (onScenesUpdated) {
        onScenesUpdated();
      }
    } catch (error) {
      console.error('Error deleting scene:', error);
      alert('Failed to delete scene. Please try again.');
    }
  };

  const moveScene = async (sceneId: string, direction: 'up' | 'down') => {
    const currentIndex = scenes.findIndex((s) => s.id === sceneId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= scenes.length) return;

    const newScenes = [...scenes];
    [newScenes[currentIndex], newScenes[newIndex]] = [newScenes[newIndex], newScenes[currentIndex]];

    try {
      // Update sort order for both scenes
      await Promise.all([
        client.models.CallSheetScene.update({
          id: newScenes[currentIndex].id,
          sortOrder: currentIndex,
        }),
        client.models.CallSheetScene.update({
          id: newScenes[newIndex].id,
          sortOrder: newIndex,
        }),
      ]);

      await loadScenes();

      if (onScenesUpdated) {
        onScenesUpdated();
      }
    } catch (error) {
      console.error('Error reordering scenes:', error);
      alert('Failed to reorder scenes. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'DELAYED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading scenes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Scene Schedule</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Scene
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
          <h4 className="font-semibold text-gray-900">
            {editingSceneId ? 'Edit Scene' : 'Add New Scene'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scene Number *
              </label>
              <input
                type="text"
                value={formData.sceneNumber}
                onChange={(e) => setFormData({ ...formData, sceneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 1, 2A, 15B"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Time
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scene Heading *
              </label>
              <input
                type="text"
                value={formData.sceneHeading}
                onChange={(e) => setFormData({ ...formData, sceneHeading: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., INT. OFFICE - DAY"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.sceneDescription}
                onChange={(e) => setFormData({ ...formData, sceneDescription: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description of what happens in this scene"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.sceneLocation}
                onChange={(e) => setFormData({ ...formData, sceneLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Specific location within primary location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (minutes)
              </label>
              <input
                type="text"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 30, 45, 60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELAYED">Delayed</option>
              </select>
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
              {editingSceneId ? 'Update Scene' : 'Add Scene'}
            </button>
          </div>
        </form>
      )}

      {scenes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No scenes added yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Scene" to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scene
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heading
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scenes.map((scene, index) => (
                <tr key={scene.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {scene.sceneNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-medium">{scene.sceneHeading}</div>
                    {scene.sceneDescription && (
                      <div className="text-gray-500 text-xs mt-1">{scene.sceneDescription}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {scene.sceneLocation || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {scene.scheduledTime || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {scene.estimatedDuration ? `${scene.estimatedDuration} min` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                        scene.status || 'SCHEDULED'
                      )}`}
                    >
                      {scene.status || 'SCHEDULED'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button
                      onClick={() => moveScene(scene.id, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveScene(scene.id, 'down')}
                      disabled={index === scenes.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleEdit(scene)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(scene.id)}
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
