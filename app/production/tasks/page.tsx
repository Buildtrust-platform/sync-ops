'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * TASKS PAGE
 * Production task management and to-do tracking.
 */

type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  dueDate?: string;
  department: string;
  createdAt: string;
}

// Data will be fetched from API
const initialTasks: Task[] = [];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  LOW: { label: 'Low', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  MEDIUM: { label: 'Medium', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
  HIGH: { label: 'High', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  URGENT: { label: 'Urgent', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: 'To Do', color: 'var(--text-tertiary)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--warning)' },
  DONE: { label: 'Done', color: 'var(--success)' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const newStatus: TaskStatus = t.status === 'TODO' ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
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
                <p className="text-sm text-[var(--text-secondary)]">Track production to-dos</p>
              </div>
            </div>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Tasks</p>
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
              <p className="text-2xl font-bold text-[var(--success)]">{stats.done}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Done</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {status === 'ALL' ? 'All' : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {(['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const).map(priority => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  priorityFilter === priority
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {priority === 'ALL' ? 'Any Priority' : PRIORITY_CONFIG[priority].label}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const priorityConfig = PRIORITY_CONFIG[task.priority];
            const statusConfig = STATUS_CONFIG[task.status];

            return (
              <Card
                key={task.id}
                className={`p-4 ${task.status === 'DONE' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      task.status === 'DONE'
                        ? 'border-[var(--success)] bg-[var(--success)] text-white'
                        : task.status === 'IN_PROGRESS'
                        ? 'border-[var(--warning)] bg-[var(--warning-muted)]'
                        : 'border-[var(--border-default)] hover:border-[var(--primary)]'
                    }`}
                  >
                    {task.status === 'DONE' && <Icons.Check className="w-3.5 h-3.5" />}
                    {task.status === 'IN_PROGRESS' && <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${task.status === 'DONE' ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
                        {task.title}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: priorityConfig.bgColor,
                          color: priorityConfig.color,
                        }}
                      >
                        {priorityConfig.label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-[var(--text-tertiary)] mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <Icons.User className="w-3 h-3" />
                        {task.assignee}
                      </span>
                      <span>{task.department}</span>
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${task.dueDate === 'Today' ? 'text-[var(--warning)]' : ''}`}>
                          <Icons.Clock className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Icons.MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.CheckSquare className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No tasks found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create tasks to track production to-dos.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
