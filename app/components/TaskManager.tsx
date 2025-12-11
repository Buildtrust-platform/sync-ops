"use client";

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

/**
 * TASK MANAGER COMPONENT
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
    <line x1="9" y1="16" x2="15" y2="16"/>
  </svg>
);

const PlayCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const FilmIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/>
    <line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

const BanIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

// Priority indicator component
const PriorityIndicator = ({ priority }: { priority: TaskPriority }) => {
  const colors: Record<TaskPriority, string> = {
    URGENT: 'var(--error)',
    HIGH: 'var(--warning)',
    NORMAL: 'var(--primary)',
    LOW: 'var(--success)',
  };

  return (
    <div
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: colors[priority] }}
      title={priority}
    />
  );
};

// Status icon component
const StatusIcon = ({ status }: { status: TaskStatus }) => {
  const iconMap: Record<TaskStatus, { Icon: React.FC; color: string }> = {
    TODO: { Icon: ClipboardIcon, color: 'var(--text-tertiary)' },
    IN_PROGRESS: { Icon: PlayCircleIcon, color: 'var(--primary)' },
    BLOCKED: { Icon: AlertCircleIcon, color: 'var(--error)' },
    IN_REVIEW: { Icon: EyeIcon, color: 'var(--warning)' },
    COMPLETED: { Icon: CheckCircleIcon, color: 'var(--success)' },
    CANCELLED: { Icon: XCircleIcon, color: 'var(--text-tertiary)' },
  };

  const { Icon, color } = iconMap[status] || iconMap.TODO;

  return (
    <span style={{ color }}>
      <Icon />
    </span>
  );
};

interface TaskManagerProps {
  projectId: string;
  organizationId?: string;
  currentUserEmail?: string;
  linkedAssetId?: string;
  linkedTimecode?: number;
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
  organizationId,
  currentUserEmail,
  linkedAssetId,
  linkedTimecode,
  onTaskCreated,
}: TaskManagerProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const orgId = organizationId || 'default-org';

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);
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
    if (!client) return;
    loadTasks();

    // Subscribe to real-time updates
    const subscription = client.models.Task.observeQuery({
      filter: { projectId: { eq: projectId } },
    }).subscribe({
      next: (data: { items: Task[] }) => {
        if (data?.items) {
          setTasks(data.items.map((item: Task) => item as unknown as Task));
        }
      },
      error: (error: Error) => console.error('Error loading tasks:', error),
    });

    return () => subscription.unsubscribe();
  }, [projectId, client]);

  const loadTasks = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const { data, errors } = await client.models.Task.list({
        filter: { projectId: { eq: projectId } },
      });

      if (errors) {
        console.error('Error loading tasks:', errors);
      } else if (data) {
        setTasks(data.map((item: unknown) => item as Task));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  async function createTask() {
    if (!newTask.title.trim() || !currentUserEmail || !client) return;

    try {
      const { data, errors } = await client.models.Task.create({
        organizationId: orgId,
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
    if (!client) return;
    try {
      const updates: Record<string, unknown> = { status: newStatus };

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
    if (!client) return;

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

  function formatDueDate(dueDate: string): string {
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      BLOCKED: 'Blocked',
      IN_REVIEW: 'In Review',
      COMPLETED: 'Completed',
    };
    return labels[status] || status;
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
          />
          <p className="text-[14px]">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Tasks
          </h2>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="py-2 px-4 rounded-[6px] font-semibold text-[14px] flex items-center gap-2 transition-all duration-[80ms] active:scale-[0.98]"
          style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <PlusIcon />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-4 p-4 rounded-[10px]"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        <div>
          <label
            className="block text-[11px] font-bold uppercase mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
            className="px-3 py-1.5 rounded-[6px] text-[13px]"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
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
          <label
            className="block text-[11px] font-bold uppercase mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Priority
          </label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'ALL')}
            className="px-3 py-1.5 rounded-[6px] text-[13px]"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label
            className="block text-[11px] font-bold uppercase mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Assignee
          </label>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value as 'ALL' | 'MY_TASKS' | 'UNASSIGNED')}
            className="px-3 py-1.5 rounded-[6px] text-[13px]"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
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
          <div
            key={status}
            className="rounded-[12px] p-4"
            style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <StatusIcon status={status as TaskStatus} />
              <div>
                <h3 className="font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                  {getStatusLabel(status)}
                </h3>
                <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  {statusTasks.length}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {statusTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={updateTaskStatus}
                  onDelete={deleteTask}
                  formatDueDate={formatDueDate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.8)' }}
        >
          <div
            className="rounded-[12px] p-6 max-w-md w-full"
            style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
                Create New Task
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTask({ title: '', description: '', priority: 'NORMAL', assignedToEmail: '', dueDate: '' });
                }}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-[6px] text-[14px]"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Task title"
                />
              </div>

              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-[6px] text-[14px] h-24 resize-none"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Task description"
                />
              </div>

              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                  className="w-full px-3 py-2 rounded-[6px] text-[14px]"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Assign To (Email)
                </label>
                <input
                  type="email"
                  value={newTask.assignedToEmail}
                  onChange={(e) => setNewTask({ ...newTask, assignedToEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-[6px] text-[14px]"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-[6px] text-[14px]"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createTask}
                disabled={!newTask.title.trim()}
                className="flex-1 py-2.5 px-4 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                Create Task
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTask({ title: '', description: '', priority: 'NORMAL', assignedToEmail: '', dueDate: '' });
                }}
                className="flex-1 py-2.5 px-4 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] active:scale-[0.98]"
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)';
                }}
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

// Task Card Component
interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  formatDueDate: (date: string) => string;
}

function TaskCard({ task, onStatusChange, onDelete, formatDueDate }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      className="rounded-[10px] p-3 transition-all duration-[80ms]"
      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1">
          <PriorityIndicator priority={task.priority} />
          <h4
            className="font-semibold text-[13px] line-clamp-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {task.title}
          </h4>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 rounded transition-colors flex-shrink-0"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--error)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
          title="Delete task"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p
          className="text-[12px] mb-2 line-clamp-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {task.description}
        </p>
      )}

      {/* Linked Asset */}
      {task.linkedAssetName && (
        <div className="flex items-center gap-1 mb-2" style={{ color: 'var(--primary)' }}>
          <FilmIcon />
          <span className="text-[12px]">{task.linkedAssetName}</span>
          {task.linkedTimecodeFormatted && (
            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              @ {task.linkedTimecodeFormatted}
            </span>
          )}
        </div>
      )}

      {/* Assignee */}
      {task.assignedToEmail && (
        <div className="flex items-center gap-1 mb-2" style={{ color: 'var(--text-secondary)' }}>
          <UserIcon />
          <span className="text-[12px]">{task.assignedToName || task.assignedToEmail}</span>
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div
          className="flex items-center gap-1 mb-2"
          style={{ color: isOverdue ? 'var(--error)' : 'var(--text-tertiary)' }}
        >
          <CalendarIcon />
          <span className="text-[12px]">{formatDueDate(task.dueDate)}</span>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded"
              style={{ background: 'var(--bg-1)', color: 'var(--text-secondary)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Blocked Reason */}
      {task.blockedReason && (
        <div className="flex items-center gap-1 mb-2" style={{ color: 'var(--error)' }}>
          <BanIcon />
          <span className="text-[12px]">{task.blockedReason}</span>
        </div>
      )}

      {/* Status Change Buttons */}
      <div className="flex gap-2 mt-3">
        {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
          <button
            onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
            className="text-[11px] font-semibold px-2 py-1 rounded transition-all duration-[80ms] active:scale-[0.98]"
            style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            Start
          </button>
        )}
        {task.status !== 'COMPLETED' && (
          <button
            onClick={() => onStatusChange(task.id, 'COMPLETED')}
            className="text-[11px] font-semibold px-2 py-1 rounded transition-all duration-[80ms] active:scale-[0.98]"
            style={{ background: 'var(--success)', color: 'white' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            Complete
          </button>
        )}
        {task.status !== 'BLOCKED' && task.status !== 'COMPLETED' && (
          <button
            onClick={() => onStatusChange(task.id, 'BLOCKED')}
            className="text-[11px] font-semibold px-2 py-1 rounded transition-all duration-[80ms] active:scale-[0.98]"
            style={{ background: 'var(--error)', color: 'white' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            Block
          </button>
        )}
      </div>
    </div>
  );
}
