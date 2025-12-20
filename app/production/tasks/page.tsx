'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { Icons } from '@/app/components/ui/Icons';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';

const client = generateClient<Schema>({ authMode: 'userPool' });

type Task = Schema['Task']['type'];
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  LOW: { label: 'Low', color: 'var(--success)', bgColor: 'var(--success)/15' },
  NORMAL: { label: 'Medium', color: 'var(--primary)', bgColor: 'var(--primary)/15' },
  HIGH: { label: 'High', color: 'var(--warning)', bgColor: 'var(--warning)/15' },
  URGENT: { label: 'Urgent', color: 'var(--danger)', bgColor: 'var(--danger)/15' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: 'To Do', color: 'var(--text-tertiary)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--warning)' },
  BLOCKED: { label: 'Blocked', color: 'var(--danger)' },
  IN_REVIEW: { label: 'In Review', color: 'var(--primary)' },
  COMPLETED: { label: 'Completed', color: 'var(--success)' },
  CANCELLED: { label: 'Cancelled', color: 'var(--text-tertiary)' },
};

export default function TasksPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'NORMAL' as TaskPriority,
    assignedToEmail: '',
    assignedToName: '',
    dueDate: '',
  });

  useEffect(() => {
    if (!organizationId) return;

    async function fetchTasks() {
      setLoading(true);
      setError(null);
      try {
        const { data: taskList } = await client.models.Task.list({
          filter: { organizationId: { eq: organizationId || undefined } },
        });

        if (taskList) {
          setTasks(taskList as Task[]);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [organizationId]);

  const handleCreateTask = async () => {
    if (!organizationId || !newTask.title.trim()) return;

    setCreatingTask(true);
    try {
      await client.models.Task.create({
        organizationId,
        projectId: 'default-project', // You would get this from context/props
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
        status: 'TODO',
        taskType: 'GENERAL',
        assignedToEmail: newTask.assignedToEmail || undefined,
        assignedToName: newTask.assignedToName || undefined,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        createdBy: 'current-user', // TODO: Get from auth context
      });

      // Refetch tasks
      const { data: taskList } = await client.models.Task.list({
        filter: { organizationId: { eq: organizationId || undefined } },
      });
      if (taskList) {
        setTasks(taskList as Task[]);
      }

      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'NORMAL',
        assignedToEmail: '',
        assignedToName: '',
        dueDate: '',
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task. Please try again.');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await client.models.Task.update({
        id: taskId,
        status: newStatus,
        completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
      });

      // Update local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : t.completedAt }
            : t
        )
      );
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await client.models.Task.delete({ id: taskId });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'ALL' && t.assignedToEmail !== assigneeFilter) return false;
    return true;
  });

  // Get unique assignees for filter
  const uniqueAssignees = Array.from(new Set(tasks.map((t) => t.assignedToEmail).filter(Boolean)));

  // Stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    blocked: tasks.filter((t) => t.status === 'BLOCKED').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  if (orgLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-0)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" width={48} height={48} />
              <div className="flex-1">
                <Skeleton width={200} height={28} />
                <Skeleton width={250} height={16} className="mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <Icons.AlertCircle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] text-center mb-2">Error Loading Tasks</h3>
          <p className="text-[var(--text-secondary)] text-center">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-production)', color: 'white' }}
              >
                <Icons.CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Production Tasks</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  {stats.total} task{stats.total !== 1 ? 's' : ''} · {stats.completed} completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-[var(--bg-2)] rounded-lg border border-[var(--border-default)]">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                  aria-label="List view"
                >
                  <Icons.List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                  aria-label="Kanban view"
                >
                  <Icons.Grid className="w-4 h-4" />
                </button>
              </div>
              <Button variant="primary" size="sm" icon="Plus" onClick={() => setShowCreateModal(true)}>
                Create Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.todo}</p>
              <p className="text-xs text-[var(--text-tertiary)]">To Do</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.inProgress}</p>
              <p className="text-xs text-[var(--text-tertiary)]">In Progress</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.blocked}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Blocked</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.completed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Completed</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Status Filter */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {(['ALL', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {status === 'ALL' ? 'All Status' : STATUS_CONFIG[status as TaskStatus].label}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {(['ALL', 'URGENT', 'HIGH', 'NORMAL', 'LOW'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  priorityFilter === priority
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {priority === 'ALL' ? 'All Priority' : PRIORITY_CONFIG[priority as TaskPriority].label}
              </button>
            ))}
          </div>

          {/* Assignee Filter */}
          {uniqueAssignees.length > 0 && (
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)]"
            >
              <option value="ALL">All Assignees</option>
              {uniqueAssignees.map((email) => (
                <option key={email} value={email || ''}>
                  {tasks.find((t) => t.assignedToEmail === email)?.assignedToName || email}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Task List or Kanban View */}
        {viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <Icons.CheckSquare className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No tasks found</h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  {statusFilter !== 'ALL' || priorityFilter !== 'ALL' || assigneeFilter !== 'ALL'
                    ? 'Try adjusting your filters'
                    : 'Create your first task to get started'}
                </p>
                <Button variant="primary" size="sm" icon="Plus" onClick={() => setShowCreateModal(true)}>
                  Create Task
                </Button>
              </Card>
            ) : (
              filteredTasks.map((task) => {
                const priorityConfig = PRIORITY_CONFIG[task.priority as TaskPriority];
                const statusConfig = STATUS_CONFIG[task.status as TaskStatus];

                return (
                  <Card key={task.id} className={`p-4 ${task.status === 'COMPLETED' ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() =>
                          handleUpdateTaskStatus(
                            task.id,
                            task.status === 'TODO'
                              ? 'IN_PROGRESS'
                              : task.status === 'IN_PROGRESS'
                              ? 'COMPLETED'
                              : 'TODO'
                          )
                        }
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          task.status === 'COMPLETED'
                            ? 'border-[var(--success)] bg-[var(--success)] text-white'
                            : task.status === 'IN_PROGRESS'
                            ? 'border-[var(--warning)] bg-[var(--warning)]/20'
                            : 'border-[var(--border-default)] hover:border-[var(--primary)]'
                        }`}
                      >
                        {task.status === 'COMPLETED' && <Icons.Check className="w-3.5 h-3.5" />}
                        {task.status === 'IN_PROGRESS' && (
                          <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3
                            className={`font-medium ${
                              task.status === 'COMPLETED'
                                ? 'line-through text-[var(--text-tertiary)]'
                                : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {task.title}
                          </h3>
                          <Badge
                            variant={
                              task.priority === 'URGENT'
                                ? 'danger'
                                : task.priority === 'HIGH'
                                ? 'warning'
                                : task.priority === 'NORMAL'
                                ? 'primary'
                                : 'success'
                            }
                            size="sm"
                          >
                            {priorityConfig.label}
                          </Badge>
                          <Badge
                            variant={
                              task.status === 'COMPLETED'
                                ? 'success'
                                : task.status === 'BLOCKED'
                                ? 'danger'
                                : task.status === 'IN_PROGRESS'
                                ? 'warning'
                                : 'default'
                            }
                            size="sm"
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-[var(--text-tertiary)] mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                          {task.assignedToName && (
                            <span className="flex items-center gap-1">
                              <Icons.User className="w-3 h-3" />
                              {task.assignedToName}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Icons.Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.taskType && task.taskType !== 'GENERAL' && (
                            <span className="flex items-center gap-1">
                              <Icons.Tag className="w-3 h-3" />
                              {task.taskType}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Trash"
                          onClick={() => handleDeleteTask(task.id)}
                          aria-label="Delete task"
                        />
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          // Kanban View
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'] as TaskStatus[]).map((status) => {
              const statusTasks = filteredTasks.filter((t) => t.status === status);
              return (
                <div key={status} className="flex flex-col">
                  <div className="mb-4 p-3 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[var(--text-primary)]">{STATUS_CONFIG[status].label}</h3>
                      <Badge variant="default" size="sm">
                        {statusTasks.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    {statusTasks.map((task) => {
                      const priorityConfig = PRIORITY_CONFIG[task.priority as TaskPriority];
                      return (
                        <Card key={task.id} className="p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-sm text-[var(--text-primary)]">{task.title}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="Trash"
                              onClick={() => handleDeleteTask(task.id)}
                              aria-label="Delete"
                            />
                          </div>
                          {task.description && (
                            <p className="text-xs text-[var(--text-tertiary)] mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                task.priority === 'URGENT'
                                  ? 'danger'
                                  : task.priority === 'HIGH'
                                  ? 'warning'
                                  : task.priority === 'NORMAL'
                                  ? 'primary'
                                  : 'success'
                              }
                              size="sm"
                            >
                              {priorityConfig.label}
                            </Badge>
                            {task.assignedToName && (
                              <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                                <Icons.User className="w-3 h-3" />
                                {task.assignedToName.split(' ')[0]}
                              </span>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={creatingTask}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateTask} loading={creatingTask}>
              Create Task
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Title *</label>
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Enter task description"
              className="w-full px-3 py-2 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)]"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Due Date</label>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Assignee Name</label>
              <Input
                value={newTask.assignedToName}
                onChange={(e) => setNewTask({ ...newTask, assignedToName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Assignee Email</label>
              <Input
                type="email"
                value={newTask.assignedToEmail}
                onChange={(e) => setNewTask({ ...newTask, assignedToEmail: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
