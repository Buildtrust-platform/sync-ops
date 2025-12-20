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

const client = generateClient<Schema>({ authMode: 'userPool' });

type CallSheet = Schema['CallSheet']['type'];
type CallSheetScene = Schema['CallSheetScene']['type'];

interface CrewCheckInStatus {
  name: string;
  role: string;
  callTime: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

export default function CallSheetTodayPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [callSheet, setCallSheet] = useState<CallSheet | null>(null);
  const [scenes, setScenes] = useState<CallSheetScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock crew data (would come from a CrewMember model in real implementation)
  const [crewMembers] = useState<CrewCheckInStatus[]>([
    { name: 'Sarah Chen', role: 'Director', callTime: '07:00', checkedIn: true, checkedInAt: '06:55' },
    { name: 'Mike Rodriguez', role: '1st AD', callTime: '06:30', checkedIn: true, checkedInAt: '06:25' },
    { name: 'Emma Davis', role: 'DP', callTime: '07:00', checkedIn: true, checkedInAt: '07:02' },
    { name: 'James Wilson', role: 'Gaffer', callTime: '07:30', checkedIn: false },
    { name: 'Lisa Park', role: 'Production Designer', callTime: '07:00', checkedIn: true, checkedInAt: '06:58' },
    { name: 'Tom Anderson', role: 'Sound Mixer', callTime: '08:00', checkedIn: false },
  ]);

  useEffect(() => {
    if (!organizationId) return;

    async function fetchCallSheet() {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().split('T')[0];

        const { data: callSheets } = await client.models.CallSheet.list({
          filter: {
            organizationId: { eq: organizationId || undefined },
            shootDate: { eq: today },
          },
        });

        if (callSheets && callSheets.length > 0) {
          const todayCallSheet = callSheets[0];
          setCallSheet(todayCallSheet);

          // Fetch scenes for this call sheet
          const { data: callSheetScenes } = await client.models.CallSheetScene.list({
            filter: { callSheetId: { eq: todayCallSheet.id } },
          });

          if (callSheetScenes) {
            setScenes(callSheetScenes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
          }
        } else {
          setCallSheet(null);
          setScenes([]);
        }
      } catch (err) {
        console.error('Error fetching call sheet:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch call sheet');
      } finally {
        setLoading(false);
      }
    }

    fetchCallSheet();
  }, [organizationId]);

  if (orgLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-0)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" width={48} height={48} />
              <div className="flex-1">
                <Skeleton width={200} height={28} />
                <Skeleton width={300} height={16} className="mt-2" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton width="100%" height={60} />
              </Card>
            ))}
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
          <h3 className="text-lg font-semibold text-[var(--text-primary)] text-center mb-2">
            Error Loading Call Sheet
          </h3>
          <p className="text-[var(--text-secondary)] text-center">{error}</p>
        </Card>
      </div>
    );
  }

  if (!callSheet) {
    return (
      <div className="min-h-screen bg-[var(--bg-0)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
          <div className="max-w-6xl mx-auto px-6 py-6">
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
                <Icons.Sun className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Today&apos;s Call Sheet</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Card className="p-12 text-center">
            <Icons.Sun className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              No Shoot Scheduled Today
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              There is no call sheet scheduled for today. Enjoy your day off!
            </p>
            <Link href="/production">
              <Button variant="primary">Back to Production</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const checkedInCount = crewMembers.filter((c) => c.checkedIn).length;
  const completedScenes = scenes.filter((s) => s.status === 'COMPLETED').length;
  const currentScene = scenes.find((s) => s.status === 'SCHEDULED');

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
                <Icons.Sun className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">Today&apos;s Call Sheet</h1>
                  {callSheet.shootDayNumber && (
                    <Badge variant="success" size="sm">
                      DAY {callSheet.shootDayNumber}
                      {callSheet.totalShootDays && ` of ${callSheet.totalShootDays}`}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {callSheet.productionTitle || 'Production'} · {new Date(callSheet.shootDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" icon="Download">
                PDF
              </Button>
              <Button variant="ghost" size="sm" icon="Share">
                Share
              </Button>
              <Button variant="primary" size="sm" icon="Edit">
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--phase-production)]/20 text-[var(--phase-production)] flex items-center justify-center">
                <Icons.Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">General Call</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {callSheet.generalCrewCall || 'TBD'}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--success)]/20 flex items-center justify-center">
                <Icons.Users className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Crew Checked In</p>
                <p className="text-lg font-bold text-[var(--success)]">
                  {checkedInCount} / {crewMembers.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                <Icons.Film className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Scenes Completed</p>
                <p className="text-lg font-bold text-[var(--primary)]">
                  {completedScenes} / {scenes.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/20 flex items-center justify-center">
                <Icons.Sun className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Weather</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {callSheet.temperature || 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Scene */}
            {currentScene && (
              <Card className="p-5 border-[var(--success)] bg-[var(--success)]/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                  <span className="text-sm font-semibold text-[var(--success)]">NOW SHOOTING</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-[var(--bg-0)] flex items-center justify-center font-bold text-xl text-[var(--text-primary)]">
                    {currentScene.sceneNumber}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {currentScene.sceneHeading || currentScene.description}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {currentScene.location} · {currentScene.pageCount || 0} pages
                    </p>
                    {currentScene.scheduledTime && (
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        Scheduled: {currentScene.scheduledTime}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Schedule */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-[var(--border-default)]">
                <h3 className="font-semibold text-[var(--text-primary)]">Today&apos;s Schedule</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {scenes.length} scene{scenes.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {scenes.length === 0 ? (
                  <div className="p-8 text-center">
                    <Icons.Film className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
                    <p className="text-[var(--text-secondary)]">No scenes scheduled</p>
                  </div>
                ) : (
                  scenes.map((scene) => (
                    <div key={scene.id} className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--bg-2)] flex items-center justify-center font-bold text-[var(--text-primary)]">
                        {scene.sceneNumber}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--text-primary)]">
                          {scene.sceneHeading || scene.description}
                        </p>
                        <p className="text-sm text-[var(--text-tertiary)]">
                          {scene.location} · {scene.pageCount || 0} pgs
                          {scene.estimatedDuration && ` · ${scene.estimatedDuration} min`}
                        </p>
                      </div>
                      <div className="text-right">
                        {scene.scheduledTime && (
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {scene.scheduledTime}
                          </p>
                        )}
                        <Badge
                          variant={
                            scene.status === 'COMPLETED'
                              ? 'success'
                              : scene.status === 'CANCELLED'
                              ? 'danger'
                              : scene.status === 'MOVED'
                              ? 'warning'
                              : 'default'
                          }
                          size="sm"
                        >
                          {scene.status || 'SCHEDULED'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            {callSheet.primaryLocation && (
              <Card className="p-5">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Icons.MapPin className="w-4 h-4 text-[var(--phase-production)]" />
                  Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{callSheet.primaryLocation}</p>
                    {callSheet.primaryLocationAddress && (
                      <p className="text-sm text-[var(--text-tertiary)]">{callSheet.primaryLocationAddress}</p>
                    )}
                  </div>
                  {(callSheet.parkingInstructions || callSheet.nearestHospital) && (
                    <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                      {callSheet.parkingInstructions && (
                        <p className="text-sm">
                          <span className="text-[var(--text-tertiary)]">Parking:</span>{' '}
                          <span className="text-[var(--text-secondary)]">{callSheet.parkingInstructions}</span>
                        </p>
                      )}
                      {callSheet.nearestHospital && (
                        <p className="text-sm">
                          <span className="text-[var(--text-tertiary)]">Hospital:</span>{' '}
                          <span className="text-[var(--text-secondary)]">{callSheet.nearestHospital}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Weather */}
            {callSheet.weatherForecast && (
              <Card className="p-5">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Icons.Sun className="w-4 h-4 text-[var(--warning)]" />
                  Weather
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[var(--text-tertiary)] text-sm">Forecast</p>
                    <p className="font-medium text-[var(--text-primary)]">{callSheet.weatherForecast}</p>
                  </div>
                  {callSheet.temperature && (
                    <div>
                      <p className="text-[var(--text-tertiary)] text-sm">Temperature</p>
                      <p className="font-medium text-[var(--text-primary)]">{callSheet.temperature}</p>
                    </div>
                  )}
                  {callSheet.sunset && (
                    <div>
                      <p className="text-[var(--text-tertiary)] text-sm">Sunset</p>
                      <p className="font-medium text-[var(--text-primary)]">{callSheet.sunset}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Crew Status */}
            <Card className="p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Icons.Users className="w-4 h-4 text-[var(--success)]" />
                Crew Status
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {crewMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          member.checkedIn ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{member.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-tertiary)]">Call: {member.callTime}</p>
                      {member.checkedIn && member.checkedInAt && (
                        <p className="text-xs text-[var(--success)]">In: {member.checkedInAt}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" className="w-full mt-4" icon="UserPlus">
                Check In Crew
              </Button>
            </Card>

            {/* Key Contacts */}
            {(callSheet.directorName || callSheet.producerName || callSheet.firstADName) && (
              <Card className="p-5">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Icons.User className="w-4 h-4 text-[var(--primary)]" />
                  Key Contacts
                </h3>
                <div className="space-y-3 text-sm">
                  {callSheet.directorName && (
                    <div>
                      <p className="text-[var(--text-tertiary)]">Director</p>
                      <p className="font-medium text-[var(--text-primary)]">{callSheet.directorName}</p>
                      {callSheet.directorPhone && (
                        <p className="text-[var(--text-secondary)]">{callSheet.directorPhone}</p>
                      )}
                    </div>
                  )}
                  {callSheet.firstADName && (
                    <div>
                      <p className="text-[var(--text-tertiary)]">1st AD</p>
                      <p className="font-medium text-[var(--text-primary)]">{callSheet.firstADName}</p>
                      {callSheet.firstADPhone && (
                        <p className="text-[var(--text-secondary)]">{callSheet.firstADPhone}</p>
                      )}
                    </div>
                  )}
                  {callSheet.producerName && (
                    <div>
                      <p className="text-[var(--text-tertiary)]">Producer</p>
                      <p className="font-medium text-[var(--text-primary)]">{callSheet.producerName}</p>
                      {callSheet.producerPhone && (
                        <p className="text-[var(--text-secondary)]">{callSheet.producerPhone}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
