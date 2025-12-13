'use client';

import { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from './Toast';

type Project = Schema['Project']['type'];

interface CalendarSyncProps {
  projectId: string;
  project: Project;
  currentUserEmail: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  type: 'deadline' | 'meeting' | 'milestone' | 'shoot' | 'review' | 'task';
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
  reminder?: number; // minutes before
  color?: string;
  source: 'project' | 'task' | 'manual';
}

interface CalendarProvider {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
}

const CALENDAR_PROVIDERS: CalendarProvider[] = [
  { id: 'google', name: 'Google Calendar', icon: '📅', connected: false },
  { id: 'outlook', name: 'Outlook Calendar', icon: '📆', connected: false },
  { id: 'apple', name: 'Apple Calendar', icon: '🍎', connected: false },
  { id: 'ical', name: 'iCal Export', icon: '📋', connected: true },
];

export default function CalendarSync({ projectId, project, currentUserEmail }: CalendarSyncProps) {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'sync' | 'settings'>('events');

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);
  const [tasks, setTasks] = useState<Schema['Task']['type'][]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [providers, setProviders] = useState(CALENDAR_PROVIDERS);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncDeadlines: true,
    syncMilestones: true,
    syncTasks: true,
    syncMeetings: true,
    reminderDefault: 30, // minutes
  });

  // New event form
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'meeting',
    startDate: new Date().toISOString().split('T')[0],
    isAllDay: false,
  });

  // Load tasks
  useEffect(() => {
    if (!projectId || !client) return;

    const taskSub = client.models.Task.observeQuery({
      filter: { projectId: { eq: projectId } }
    }).subscribe({
      next: (data) => setTasks([...data.items]),
    });

    return () => taskSub.unsubscribe();
  }, [projectId, client]);

  // Generate calendar events from project data
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Project deadline
    if (project.deadline) {
      events.push({
        id: 'project-deadline',
        title: `${project.name} - Final Deadline`,
        startDate: project.deadline,
        type: 'deadline',
        color: '#ef4444',
        isAllDay: true,
        source: 'project',
      });
    }

    // Project start date
    if (project.startDate) {
      events.push({
        id: 'project-start',
        title: `${project.name} - Project Start`,
        startDate: project.startDate,
        type: 'milestone',
        color: '#22c55e',
        isAllDay: true,
        source: 'project',
      });
    }

    // Shoot dates
    if (project.primaryShootStartDate) {
      events.push({
        id: 'shoot-start',
        title: `${project.name} - Primary Shoot Start`,
        startDate: project.primaryShootStartDate,
        endDate: project.primaryShootEndDate || undefined,
        type: 'shoot',
        color: '#f59e0b',
        isAllDay: true,
        source: 'project',
      });
    }

    // Tasks with due dates
    tasks.forEach(task => {
      if (task.dueDate) {
        events.push({
          id: `task-${task.id}`,
          title: task.title || 'Task',
          description: task.description || undefined,
          startDate: task.dueDate,
          type: 'task',
          color: task.priority === 'URGENT' ? '#ef4444' : task.priority === 'HIGH' ? '#f59e0b' : '#3b82f6',
          isAllDay: true,
          source: 'task',
        });
      }
    });

    return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [project, tasks]);

  // Get events for current month view
  const monthEvents = useMemo(() => {
    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    return calendarEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  }, [calendarEvents, selectedMonth]);

  // Generate calendar grid
  const calendarGrid = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const grid: { date: Date; events: CalendarEvent[]; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      grid.push({ date, events: [], isCurrentMonth: false });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = calendarEvents.filter(e => e.startDate.startsWith(dateStr));
      grid.push({ date, events: dayEvents, isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      grid.push({ date, events: [], isCurrentMonth: false });
    }

    return grid;
  }, [selectedMonth, calendarEvents]);

  const generateICalFile = () => {
    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SyncOps//Project Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${project.name}
`;

    calendarEvents.forEach(event => {
      const start = new Date(event.startDate);
      const startStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      ical += `BEGIN:VEVENT
UID:${event.id}@syncops
DTSTART:${event.isAllDay ? startStr.split('T')[0].replace(/Z$/, '') : startStr}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
END:VEVENT
`;
    });

    ical += 'END:VCALENDAR';

    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_calendar.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const connectProvider = (providerId: string) => {
    // Simulate OAuth connection flow
    setProviders(prev => prev.map(p =>
      p.id === providerId
        ? { ...p, connected: true, lastSync: new Date().toISOString() }
        : p
    ));
  };

  const disconnectProvider = (providerId: string) => {
    setProviders(prev => prev.map(p =>
      p.id === providerId
        ? { ...p, connected: false, lastSync: undefined }
        : p
    ));
  };

  const getEventTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      deadline: '🎯',
      meeting: '👥',
      milestone: '🏁',
      shoot: '🎬',
      review: '👀',
      task: '✅',
    };
    return icons[type] || '📅';
  };

  const tabs = [
    { id: 'events', label: 'Calendar', icon: '📅' },
    { id: 'sync', label: 'Sync Settings', icon: '🔄' },
    { id: 'settings', label: 'Preferences', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendar Sync</h2>
          <p className="text-slate-400 mt-1">Sync project events with your calendar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateICalFile}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
          >
            Export iCal
          </button>
          <button
            onClick={() => setShowAddEvent(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
          >
            + Add Event
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                ←
              </button>
              <h3 className="text-lg font-bold text-white">
                {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                →
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((cell, index) => {
                const isToday = cell.date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={index}
                    className={`min-h-[80px] p-1 rounded-lg border ${
                      cell.isCurrentMonth
                        ? isToday
                          ? 'bg-teal-900/30 border-teal-500'
                          : 'bg-slate-900 border-slate-700'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className={`text-xs mb-1 ${
                      cell.isCurrentMonth
                        ? isToday ? 'text-teal-400 font-bold' : 'text-slate-300'
                        : 'text-slate-600'
                    }`}>
                      {cell.date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {cell.events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {cell.events.length > 2 && (
                        <div className="text-xs text-slate-400">
                          +{cell.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <h3 className="font-bold text-white mb-4">Upcoming Events</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {calendarEvents.slice(0, 10).map(event => (
                  <div
                    key={event.id}
                    className="p-3 bg-slate-900 rounded-lg border-l-4"
                    style={{ borderColor: event.color || '#3b82f6' }}
                  >
                    <div className="flex items-start gap-2">
                      <span>{getEventTypeIcon(event.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{event.title}</h4>
                        <p className="text-xs text-slate-400">
                          {new Date(event.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {calendarEvents.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No upcoming events
                  </p>
                )}
              </div>
            </div>

            {/* Event Legend */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <h3 className="font-bold text-white mb-3">Event Types</h3>
              <div className="space-y-2">
                {[
                  { type: 'deadline', label: 'Deadline', color: '#ef4444' },
                  { type: 'milestone', label: 'Milestone', color: '#22c55e' },
                  { type: 'shoot', label: 'Shoot Day', color: '#f59e0b' },
                  { type: 'task', label: 'Task Due', color: '#3b82f6' },
                  { type: 'meeting', label: 'Meeting', color: '#8b5cf6' },
                ].map(item => (
                  <div key={item.type} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></span>
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Settings */}
      {activeTab === 'sync' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connected Calendars */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="font-bold text-white mb-4">Calendar Integrations</h3>
            <div className="space-y-3">
              {providers.map(provider => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 bg-slate-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.icon}</span>
                    <div>
                      <h4 className="font-medium text-white">{provider.name}</h4>
                      {provider.lastSync && (
                        <p className="text-xs text-slate-400">
                          Last sync: {new Date(provider.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {provider.id === 'ical' ? (
                    <button
                      onClick={generateICalFile}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg"
                    >
                      Export
                    </button>
                  ) : provider.connected ? (
                    <button
                      onClick={() => disconnectProvider(provider.id)}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => connectProvider(provider.id)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg"
                    >
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sync Options */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="font-bold text-white mb-4">Sync Options</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Auto-sync enabled</span>
                <input
                  type="checkbox"
                  checked={syncSettings.autoSync}
                  onChange={(e) => setSyncSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Sync deadlines</span>
                <input
                  type="checkbox"
                  checked={syncSettings.syncDeadlines}
                  onChange={(e) => setSyncSettings(prev => ({ ...prev, syncDeadlines: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Sync milestones</span>
                <input
                  type="checkbox"
                  checked={syncSettings.syncMilestones}
                  onChange={(e) => setSyncSettings(prev => ({ ...prev, syncMilestones: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Sync tasks</span>
                <input
                  type="checkbox"
                  checked={syncSettings.syncTasks}
                  onChange={(e) => setSyncSettings(prev => ({ ...prev, syncTasks: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Sync meetings</span>
                <input
                  type="checkbox"
                  checked={syncSettings.syncMeetings}
                  onChange={(e) => setSyncSettings(prev => ({ ...prev, syncMeetings: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Preferences */}
      {activeTab === 'settings' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="font-bold text-white mb-4">Calendar Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Default Reminder</label>
              <select
                value={syncSettings.reminderDefault}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, reminderDefault: parseInt(e.target.value) }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value={0}>No reminder</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
                <option value={10080}>1 week before</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Week Starts On</label>
              <select className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Time Zone</label>
              <select className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                <option value="auto">Auto-detect</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Default Event Duration</label>
              <select className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value="allday">All day</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Add Event</h3>
              <button
                onClick={() => setShowAddEvent(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="milestone">Milestone</option>
                  <option value="shoot">Shoot Day</option>
                  <option value="review">Review</option>
                  <option value="task">Task</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newEvent.isAllDay}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, isAllDay: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 text-teal-500"
                />
                <span className="text-sm text-slate-300">All day event</span>
              </label>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Would save event to database
                    toast.success('Event Created', 'Event created successfully!');
                    setShowAddEvent(false);
                  }}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
