"use client";

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

/**
 * TASK MANAGER COMPONENT
 *
 * Displays and manages tasks for a project
 * Tasks can be filtered by status, priority, assignee
 * Supports creating tasks manually or from comments/messages
 */

interface TaskManagerProps {
  projectId: string;
  currentUserEmail?: string;
  linkedAssetId?: string; // Optional: filter tasks by asset
  linkedTimecode?: number; // Optional: filter tasks by timecode
  onTaskCreated?: (taskId: string) => void;
}

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
type TaskType = 'GENERAL' | 'FROM_COMMENT' | 'FROM_MESSAGE' | 'APPROVAL' | 'REVIEW' | 'UPLOAD' | 'TECHNICAL' | 'CREATIVE' | 'LEGAL' | 'COMPLIANCE';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  taskType: TaskType;
  assignedToEmail?: string | null;
  assignedToName?: string | null;
  dueDate?: string | null;
  linkedAssetId?: string | null;
  linkedAssetName?: string | null;
  linkedTimecode?: number | null;
  linkedTimecodeFormatted?: string | null;
  createdBy: string;
  createdByEmail?: string | null;
  completedAt?: string | null;
  tags?: string[] | null;
  blockedReason?: string | null;
  progressPercentage?: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function TaskManager({
  projectId,
  currentUserEmail,
  linkedAssetId,
  linkedTimecode,
  onTaskCreated,
}: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<'ALL' | 'MY_TASKS' | 'UNASSIGNED'>('ALL');

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'NORMAL' as TaskPriority,
    assignedToEmail: '',
    dueDate: '',
  });

  // Load tasks
  useEffect(() => {
    loadTasks();

    // Subscribe to real-time updates
    const subscription = client.models.Task.observeQuery({
      filter: { projectId: { eq: projectId } },
    }).subscribe({
      next: (data) => {
        if (data?.items) {
          setTasks(data.items.map(item => item as unknown as Task));
        }
      },
      error: (error) => console.error('Error loading tasks:', error),
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  async function loadTasks() {
    setLoading(true);
    try {
      const { data, errors } = await client.models.Task.list({
        filter: { projectId: { eq: projectId } },
      });

      if (errors) {
        console.error('Error loading tasks:', errors);
      } else if (data) {
        setTasks(data.map(item => item as unknown as Task));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createTask() {
    if (!newTask.title.trim() || !currentUserEmail) return;

    try {
      const { data, errors } = await client.models.Task.create({
        projectId,
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        priority: newTask.priority,
        assignedToEmail: newTask.assignedToEmail || undefined,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        linkedAssetId: linkedAssetId || undefined,
        linkedTimecode: linkedTimecode || undefined,
        status: 'TODO',
        taskType: 'GENERAL',
        createdBy: currentUserEmail,
        createdByEmail: currentUserEmail,
        progressPercentage: 0,
      });

      if (errors) {
        console.error('Error creating task:', errors);
        console.error('Error details:', JSON.stringify(errors, null, 2));
        alert(`Failed to create task: ${errors.map((e: any) => e.message).join(', ')}`);
      } else if (data) {
        setShowCreateModal(false);
        setNewTask({ title: '', description: '', priority: 'NORMAL', assignedToEmail: '', dueDate: '' });
        if (onTaskCreated) onTaskCreated(data.id);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: TaskStatus) {
    try {
      const updates: any = { status: newStatus };

      if (newStatus === 'COMPLETED') {
        updates.completedAt = new Date().toISOString();
        updates.completedBy = currentUserEmail;
        updates.progressPercentage = 100;
      }

      await client.models.Task.update({
        id: taskId,
        ...updates,
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await client.models.Task.delete({ id: taskId });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false;
    if (filterAssignee === 'MY_TASKS' && task.assignedToEmail !== currentUserEmail) return false;
    if (filterAssignee === 'UNASSIGNED' && task.assignedToEmail) return false;
    if (linkedAssetId && task.linkedAssetId !== linkedAssetId) return false;
    return true;
  });

  // Group tasks by status
  const tasksByStatus = {
    TODO: filteredTasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'),
    BLOCKED: filteredTasks.filter(t => t.status === 'BLOCKED'),
    IN_REVIEW: filteredTasks.filter(t => t.status === 'IN_REVIEW'),
    COMPLETED: filteredTasks.filter(t => t.status === 'COMPLETED'),
  };

  function getPriorityIcon(priority: TaskPriority): string {
    switch (priority) {
      case 'URGENT': return '🔴';
      case 'HIGH': return '🟠';
      case 'NORMAL': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  }

  function getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case 'TODO': return '📋';
      case 'IN_PROGRESS': return '⚙️';
      case 'BLOCKED': return '🚫';
      case 'IN_REVIEW': return '👀';
      case 'COMPLETED': return '✅';
      case 'CANCELLED': return '❌';
      default: return '📋';
    }
  }

  function formatDueDate(dueDate: string): string {
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Tasks</h2>
          <p className="text-slate-400 text-sm">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-black font-bold py-2 px-4 rounded-lg transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
            className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-1.5 text-sm"
          >
            <option value="ALL">All</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'ALL')}
            className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-1.5 text-sm"
          >
            <option value="ALL">All</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Assignee</label>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value as 'ALL' | 'MY_TASKS' | 'UNASSIGNED')}
            className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-1.5 text-sm"
          >
            <option value="ALL">All</option>
            <option value="MY_TASKS">My Tasks</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
        </div>
      </div>

      {/* Task Board - Kanban Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{getStatusIcon(status as TaskStatus)}</span>
              <div>
                <h3 className="font-bold text-white text-sm">{status.replace('_', ' ')}</h3>
                <p className="text-xs text-slate-400">{statusTasks.length}</p>
              </div>
            </div>

            <div className="space-y-3">
              {statusTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPriorityIcon(task.priority)}</span>
                      <h4 className="font-bold text-white text-sm line-clamp-2">{task.title}</h4>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete task"
                    >
                      ×
                    </button>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
                  )}

                  {task.linkedAssetName && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs">🎬</span>
                      <span className="text-xs text-teal-400">{task.linkedAssetName}</span>
                      {task.linkedTimecodeFormatted && (
                        <span className="text-xs text-slate-500">@ {task.linkedTimecodeFormatted}</span>
                      )}
                    </div>
                  )}

                  {task.assignedToEmail && (
                    <div className="text-xs text-slate-400 mb-2">
                      👤 {task.assignedToName || task.assignedToEmail}
                    </div>
                  )}

                  {task.dueDate && (
                    <div className={`text-xs mb-2 ${
                      new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      📅 {formatDueDate(task.dueDate)}
                    </div>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {task.blockedReason && (
                    <div className="text-xs text-red-400 mb-2">
                      🚫 {task.blockedReason}
                    </div>
                  )}

                  {/* Status Change Buttons */}
                  <div className="flex gap-2 mt-3">
                    {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    {task.status !== 'BLOCKED' && task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'BLOCKED')}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                      >
                        Block
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Create New Task</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 h-24"
                  placeholder="Task description"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Assign To (Email)</label>
                <input
                  type="email"
                  value={newTask.assignedToEmail}
                  onChange={(e) => setNewTask({ ...newTask, assignedToEmail: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createTask}
                disabled={!newTask.title.trim()}
                className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-black disabled:text-slate-400 font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Create Task
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTask({ title: '', description: '', priority: 'NORMAL', assignedToEmail: '', dueDate: '' });
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
