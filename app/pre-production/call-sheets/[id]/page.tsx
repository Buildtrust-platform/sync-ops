'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { Icons, Card, Button, Skeleton, Modal, Input, Badge } from '@/app/components/ui';

/**
 * CALL SHEET DETAIL PAGE
 * View and manage individual call sheet details
 */

const client = generateClient<Schema>({ authMode: 'userPool' });

interface CallSheetDisplay {
  id: string;
  productionTitle: string;
  shootDate: string;
  shootDayNumber: number;
  generalCrewCall: string;
  primaryLocation: string;
  weatherForecast: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  publishedAt?: string;
  notes?: string;
  projectId: string;
  projectName?: string;
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  PUBLISHED: { label: 'Published', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  CANCELLED: { label: 'Cancelled', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
};

// Mock schedule data - in production this would come from the API
const MOCK_SCHEDULE = [
  { time: '06:00', activity: 'Crew Call - Grip & Electric', location: 'Base Camp' },
  { time: '06:30', activity: 'Breakfast Available', location: 'Catering Tent' },
  { time: '07:00', activity: 'General Crew Call', location: 'Set' },
  { time: '07:30', activity: 'First Team to Hair & Makeup', location: 'Makeup Trailer' },
  { time: '08:00', activity: 'Camera Ready / Block Scene 1', location: 'Main Set' },
  { time: '08:30', activity: 'First Shot - Scene 1', location: 'Main Set' },
  { time: '12:00', activity: 'Lunch (1 Hour)', location: 'Catering Tent' },
  { time: '13:00', activity: 'Return from Lunch', location: 'Set' },
  { time: '13:30', activity: 'Scene 2 - Exterior', location: 'Location B' },
  { time: '17:00', activity: 'Company Move', location: 'Location C' },
  { time: '18:00', activity: 'Scene 3 - Night Exterior', location: 'Location C' },
  { time: '21:00', activity: 'Wrap', location: 'All Locations' },
];

// Mock crew data
const MOCK_CREW = [
  { name: 'John Smith', role: 'Director', callTime: '07:00', phone: '555-0101' },
  { name: 'Jane Doe', role: '1st AD', callTime: '06:30', phone: '555-0102' },
  { name: 'Mike Johnson', role: 'DP', callTime: '06:00', phone: '555-0103' },
  { name: 'Sarah Williams', role: 'Gaffer', callTime: '06:00', phone: '555-0104' },
  { name: 'Tom Brown', role: 'Key Grip', callTime: '06:00', phone: '555-0105' },
  { name: 'Emily Davis', role: 'Sound Mixer', callTime: '07:00', phone: '555-0106' },
  { name: 'Chris Wilson', role: 'Script Supervisor', callTime: '07:00', phone: '555-0107' },
  { name: 'Lisa Anderson', role: 'Hair & Makeup', callTime: '06:30', phone: '555-0108' },
];

// Mock cast data
const MOCK_CAST = [
  { name: 'Alex Turner', character: 'Lead Character', callTime: '07:30', pickupTime: '07:00', status: 'CONFIRMED' },
  { name: 'Emma Stone', character: 'Supporting Role', callTime: '08:00', pickupTime: '07:30', status: 'CONFIRMED' },
  { name: 'Ryan Cooper', character: 'Guest Star', callTime: '13:00', pickupTime: '12:30', status: 'PENDING' },
];

export default function CallSheetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const callSheetId = params?.id as string;

  const { organizationId, loading: orgLoading } = useOrganization();
  const [callSheet, setCallSheet] = useState<CallSheetDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'crew' | 'cast'>('overview');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchCallSheet = useCallback(async () => {
    if (!callSheetId) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await client.models.CallSheet.get({ id: callSheetId });

      if (!data) {
        setError('Call sheet not found');
        return;
      }

      // Fetch project name
      let projectName = 'Unknown Project';
      if (data.projectId) {
        try {
          const { data: projectData } = await client.models.Project.get({ id: data.projectId });
          if (projectData) {
            projectName = projectData.name || 'Untitled Project';
          }
        } catch {
          console.warn('Could not fetch project');
        }
      }

      setCallSheet({
        id: data.id,
        productionTitle: data.productionTitle || projectName,
        shootDate: data.shootDate || new Date().toISOString().split('T')[0],
        shootDayNumber: data.shootDayNumber || 1,
        generalCrewCall: data.generalCrewCall || '08:00',
        primaryLocation: data.primaryLocation || 'TBD',
        weatherForecast: data.weatherForecast || '',
        status: (data.status as 'DRAFT' | 'PUBLISHED' | 'CANCELLED') || 'DRAFT',
        publishedAt: data.publishedAt || undefined,
        notes: (data as { additionalNotes?: string }).additionalNotes || undefined,
        projectId: data.projectId,
        projectName,
      });
    } catch (err) {
      console.error('Error fetching call sheet:', err);
      setError('Failed to load call sheet');
    } finally {
      setLoading(false);
    }
  }, [callSheetId]);

  useEffect(() => {
    fetchCallSheet();
  }, [fetchCallSheet]);

  const handlePublish = async () => {
    if (!callSheet) return;

    setIsSending(true);
    try {
      await client.models.CallSheet.update({
        id: callSheet.id,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
      });
      await fetchCallSheet();
    } catch (err) {
      console.error('Error publishing call sheet:', err);
      alert('Failed to publish call sheet');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDF = () => {
    // Generate text content for download
    if (!callSheet) return;

    const content = `
CALL SHEET
==========

Production: ${callSheet.productionTitle}
Date: ${formatDate(callSheet.shootDate)}
Day: ${callSheet.shootDayNumber}
General Crew Call: ${callSheet.generalCrewCall}
Location: ${callSheet.primaryLocation}
Weather: ${callSheet.weatherForecast || 'N/A'}

SCHEDULE
--------
${MOCK_SCHEDULE.map(s => `${s.time} - ${s.activity} @ ${s.location}`).join('\n')}

CREW
----
${MOCK_CREW.map(c => `${c.name} (${c.role}) - Call: ${c.callTime}`).join('\n')}

CAST
----
${MOCK_CAST.map(c => `${c.name} as ${c.character} - Call: ${c.callTime}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-sheet-day-${callSheet.shootDayNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isLoading = orgLoading || loading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-0)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="w-14 h-14 rounded-lg" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !callSheet) {
    return (
      <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Icons.AlertCircle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            {error || 'Call sheet not found'}
          </h2>
          <p className="text-[var(--text-tertiary)] mb-4">
            The call sheet you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Button variant="primary" onClick={() => router.push('/pre-production/call-sheets')}>
            <Icons.ArrowLeft className="w-4 h-4 mr-2" />
            Back to Call Sheets
          </Button>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[callSheet.status];

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pre-production/call-sheets"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                style={{ backgroundColor: 'var(--phase-preproduction)', color: 'white' }}
              >
                <span className="text-[10px] uppercase">Day</span>
                <span className="text-xl font-bold">{callSheet.shootDayNumber}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">
                    {callSheet.productionTitle}
                  </h1>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {formatDate(callSheet.shootDate)} • Call Time: {callSheet.generalCrewCall}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {callSheet.status === 'DRAFT' && (
                <Button variant="primary" size="sm" onClick={handlePublish} disabled={isSending}>
                  <Icons.Send className="w-4 h-4 mr-2" />
                  {isSending ? 'Publishing...' : 'Publish & Send'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {(['overview', 'schedule', 'crew', 'cast'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Key Info */}
              <Card className="p-5">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Production Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Location</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Icons.MapPin className="w-4 h-4" />
                      {callSheet.primaryLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Weather</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Icons.Cloud className="w-4 h-4" />
                      {callSheet.weatherForecast || 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">General Crew Call</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                      <Icons.Clock className="w-4 h-4" />
                      {callSheet.generalCrewCall}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Shoot Day</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Day {callSheet.shootDayNumber}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Quick Schedule Preview */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">Today&apos;s Schedule</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('schedule')}>
                    View All
                    <Icons.ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {MOCK_SCHEDULE.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="text-sm font-mono text-[var(--primary)] w-12">{item.time}</span>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--text-primary)]">{item.activity}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{item.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Crew Summary */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">Crew</h3>
                  <Badge variant="primary" size="sm">{MOCK_CREW.length}</Badge>
                </div>
                <div className="space-y-2">
                  {MOCK_CREW.slice(0, 4).map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-primary)]">{member.name}</span>
                      <span className="text-[var(--text-tertiary)]">{member.role}</span>
                    </div>
                  ))}
                  {MOCK_CREW.length > 4 && (
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setActiveTab('crew')}>
                      +{MOCK_CREW.length - 4} more
                    </Button>
                  )}
                </div>
              </Card>

              {/* Cast Summary */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">Cast</h3>
                  <Badge variant="primary" size="sm">{MOCK_CAST.length}</Badge>
                </div>
                <div className="space-y-2">
                  {MOCK_CAST.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-[var(--text-primary)]">{member.name}</span>
                        <span className="text-[var(--text-tertiary)] ml-2">as {member.character}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        member.status === 'CONFIRMED'
                          ? 'bg-[var(--success-muted)] text-[var(--success)]'
                          : 'bg-[var(--warning-muted)] text-[var(--warning)]'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Notes */}
              {callSheet.notes && (
                <Card className="p-5">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">Notes</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{callSheet.notes}</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <Card className="p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Full Schedule</h3>
            <div className="space-y-4">
              {MOCK_SCHEDULE.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-4 pb-4 ${
                    idx < MOCK_SCHEDULE.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''
                  }`}
                >
                  <span className="text-lg font-mono font-semibold text-[var(--primary)] w-16 flex-shrink-0">
                    {item.time}
                  </span>
                  <div className="flex-1">
                    <p className="text-[var(--text-primary)] font-medium">{item.activity}</p>
                    <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-1 mt-1">
                      <Icons.MapPin className="w-3 h-3" />
                      {item.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Crew Tab */}
        {activeTab === 'crew' && (
          <Card className="p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Crew Call Times</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase">Call Time</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CREW.map((member, idx) => (
                    <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-1)]">
                      <td className="py-3 px-4 text-sm font-medium text-[var(--text-primary)]">{member.name}</td>
                      <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{member.role}</td>
                      <td className="py-3 px-4 text-sm font-mono text-[var(--primary)]">{member.callTime}</td>
                      <td className="py-3 px-4 text-sm text-[var(--text-tertiary)]">{member.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Cast Tab */}
        {activeTab === 'cast' && (
          <Card className="p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Cast Call Times</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase">Character</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase">Pickup</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase">Call Time</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CAST.map((member, idx) => (
                    <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-1)]">
                      <td className="py-3 px-4 text-sm font-medium text-[var(--text-primary)]">{member.name}</td>
                      <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{member.character}</td>
                      <td className="py-3 px-4 text-sm text-[var(--text-tertiary)]">{member.pickupTime}</td>
                      <td className="py-3 px-4 text-sm font-mono text-[var(--primary)]">{member.callTime}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          member.status === 'CONFIRMED'
                            ? 'bg-[var(--success-muted)] text-[var(--success)]'
                            : 'bg-[var(--warning-muted)] text-[var(--warning)]'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
