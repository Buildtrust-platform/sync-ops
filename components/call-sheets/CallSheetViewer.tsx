'use client';

import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { generateCallSheetPDF } from '@/lib/callSheetPDF';

const client = generateClient<Schema>();

type CallSheet = Schema['CallSheet']['type'];
type CallSheetScene = Schema['CallSheetScene']['type'];
type CallSheetCast = Schema['CallSheetCast']['type'];
type CallSheetCrew = Schema['CallSheetCrew']['type'];

interface CallSheetViewerProps {
  callSheetId: string;
  onEdit?: () => void;
}

export default function CallSheetViewer({ callSheetId, onEdit }: CallSheetViewerProps) {
  const [callSheet, setCallSheet] = useState<CallSheet | null>(null);
  const [scenes, setScenes] = useState<CallSheetScene[]>([]);
  const [cast, setCast] = useState<CallSheetCast[]>([]);
  const [crew, setCrew] = useState<CallSheetCrew[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscriptions for auto-updating call sheet
  useEffect(() => {
    setLoading(true);

    // Subscribe to call sheet updates
    const callSheetSub = client.models.CallSheet.observeQuery({
      filter: { id: { eq: callSheetId } },
    }).subscribe({
      next: ({ items }) => {
        if (items.length > 0) {
          setCallSheet(items[0]);
        }
        setLoading(false);
      },
      error: (error) => {
        console.error('Error subscribing to call sheet:', error);
        setLoading(false);
      },
    });

    // Subscribe to scenes updates
    const scenesSub = client.models.CallSheetScene.observeQuery({
      filter: { callSheetId: { eq: callSheetId } },
    }).subscribe({
      next: ({ items }) => {
        setScenes([...items].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      },
      error: (error) => console.error('Error subscribing to scenes:', error),
    });

    // Subscribe to cast updates
    const castSub = client.models.CallSheetCast.observeQuery({
      filter: { callSheetId: { eq: callSheetId } },
    }).subscribe({
      next: ({ items }) => {
        setCast([...items].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      },
      error: (error) => console.error('Error subscribing to cast:', error),
    });

    // Subscribe to crew updates
    const crewSub = client.models.CallSheetCrew.observeQuery({
      filter: { callSheetId: { eq: callSheetId } },
    }).subscribe({
      next: ({ items }) => {
        setCrew([...items].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      },
      error: (error) => console.error('Error subscribing to crew:', error),
    });

    // Cleanup subscriptions on unmount
    return () => {
      callSheetSub.unsubscribe();
      scenesSub.unsubscribe();
      castSub.unsubscribe();
      crewSub.unsubscribe();
    };
  }, [callSheetId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading call sheet...</p>
        </div>
      </div>
    );
  }

  if (!callSheet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Call sheet not found</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '';
    // Assuming HH:mm format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'UPDATED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportPDF = () => {
    if (!callSheet) return;

    generateCallSheetPDF({
      callSheet,
      scenes,
      cast,
      crew,
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{callSheet.productionTitle || 'Call Sheet'}</h1>
            {callSheet.productionCompany && (
              <p className="text-indigo-100 mt-1">{callSheet.productionCompany}</p>
            )}
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(callSheet.status)}`}>
              {callSheet.status}
            </span>
            {callSheet.version && callSheet.version > 1 && (
              <p className="text-indigo-100 mt-2 text-sm">Version {callSheet.version}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-indigo-200">Shoot Date</p>
            <p className="text-white font-semibold">{formatDate(callSheet.shootDate)}</p>
          </div>
          <div>
            <p className="text-indigo-200">Shoot Day</p>
            <p className="text-white font-semibold">
              Day {callSheet.shootDayNumber || 'N/A'} of {callSheet.totalShootDays || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-indigo-200">General Crew Call</p>
            <p className="text-white font-semibold">{formatTime(callSheet.generalCrewCall)}</p>
          </div>
          <div>
            <p className="text-indigo-200">Estimated Wrap</p>
            <p className="text-white font-semibold">{formatTime(callSheet.estimatedWrap)}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Edit Call Sheet
            </button>
          )}
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6 space-y-8">
        {/* Location Information */}
        {(callSheet.primaryLocation || callSheet.primaryLocationAddress) && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {callSheet.primaryLocation && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Primary Location</p>
                  <p className="mt-1 text-gray-900">{callSheet.primaryLocation}</p>
                </div>
              )}
              {callSheet.primaryLocationAddress && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="mt-1 text-gray-900">{callSheet.primaryLocationAddress}</p>
                </div>
              )}
              {callSheet.parkingInstructions && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Parking Instructions</p>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{callSheet.parkingInstructions}</p>
                </div>
              )}
              {callSheet.nearestHospital && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Nearest Hospital</p>
                  <p className="mt-1 text-gray-900">{callSheet.nearestHospital}</p>
                  {callSheet.hospitalAddress && (
                    <p className="text-sm text-gray-600">{callSheet.hospitalAddress}</p>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Weather & Conditions */}
        {(callSheet.weatherForecast || callSheet.temperature || callSheet.sunset) && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
              Weather & Conditions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {callSheet.weatherForecast && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Forecast</p>
                  <p className="mt-1 text-gray-900">{callSheet.weatherForecast}</p>
                </div>
              )}
              {callSheet.temperature && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Temperature</p>
                  <p className="mt-1 text-gray-900">{callSheet.temperature}</p>
                </div>
              )}
              {callSheet.sunset && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Sunset</p>
                  <p className="mt-1 text-gray-900">{formatTime(callSheet.sunset)}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Scene Schedule */}
        {scenes.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
              Scene Schedule
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scene</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scenes.map((scene) => (
                    <tr key={scene.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {scene.sceneNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {scene.sceneHeading && <div className="font-medium">{scene.sceneHeading}</div>}
                        {scene.description && <div className="text-gray-600">{scene.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{scene.location || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(scene.scheduledTime) || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scene.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          scene.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {scene.status || 'SCHEDULED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
              Cast
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Character</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Makeup Call</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wardrobe Call</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Call to Set</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cast.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.actorName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.characterName || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(member.makeupCall) || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(member.wardrobeCall) || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(member.callToSet) || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.phone && <div>{member.phone}</div>}
                        {member.email && <div className="text-xs">{member.email}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Crew */}
        {crew.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
              Crew
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Call Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Walkie</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {crew.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.role}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.department || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(member.callTime) || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.walkieChannel || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.phone && <div>{member.phone}</div>}
                        {member.email && <div className="text-xs">{member.email}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Production Contacts */}
        {(callSheet.directorName || callSheet.producerName || callSheet.firstADName || callSheet.productionManagerName) && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
              Production Contacts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {callSheet.directorName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Director</p>
                  <p className="mt-1 text-gray-900">{callSheet.directorName}</p>
                  {callSheet.directorPhone && <p className="text-sm text-gray-600">{callSheet.directorPhone}</p>}
                </div>
              )}
              {callSheet.producerName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Producer</p>
                  <p className="mt-1 text-gray-900">{callSheet.producerName}</p>
                  {callSheet.producerPhone && <p className="text-sm text-gray-600">{callSheet.producerPhone}</p>}
                </div>
              )}
              {callSheet.firstADName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">1st AD</p>
                  <p className="mt-1 text-gray-900">{callSheet.firstADName}</p>
                  {callSheet.firstADPhone && <p className="text-sm text-gray-600">{callSheet.firstADPhone}</p>}
                </div>
              )}
              {callSheet.productionManagerName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Production Manager</p>
                  <p className="mt-1 text-gray-900">{callSheet.productionManagerName}</p>
                  {callSheet.productionManagerPhone && <p className="text-sm text-gray-600">{callSheet.productionManagerPhone}</p>}
                </div>
              )}
              {callSheet.productionOfficePhone && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Production Office</p>
                  <p className="mt-1 text-gray-900">{callSheet.productionOfficePhone}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Additional Information */}
        {(callSheet.mealTimes || callSheet.transportationNotes || callSheet.safetyNotes || callSheet.specialInstructions) && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
              Additional Information
            </h2>
            <div className="space-y-4">
              {callSheet.mealTimes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Meal Times</p>
                  <p className="mt-1 text-gray-900">{callSheet.mealTimes}</p>
                  {callSheet.cateringLocation && (
                    <p className="text-sm text-gray-600">Location: {callSheet.cateringLocation}</p>
                  )}
                </div>
              )}
              {callSheet.transportationNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Transportation</p>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{callSheet.transportationNotes}</p>
                </div>
              )}
              {callSheet.safetyNotes && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm font-medium text-yellow-800">Safety Notes</p>
                  <p className="mt-1 text-yellow-700 whitespace-pre-wrap">{callSheet.safetyNotes}</p>
                </div>
              )}
              {callSheet.specialInstructions && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-sm font-medium text-blue-800">Special Instructions</p>
                  <p className="mt-1 text-blue-700 whitespace-pre-wrap">{callSheet.specialInstructions}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Next Day Preview */}
        {callSheet.nextDaySchedule && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
              Tomorrow's Schedule
            </h2>
            <p className="text-gray-900 whitespace-pre-wrap">{callSheet.nextDaySchedule}</p>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-8 py-4 text-sm text-gray-600 border-t">
        <div className="flex justify-between items-center">
          <div>
            {callSheet.publishedAt && (
              <p>Published: {new Date(callSheet.publishedAt).toLocaleString()}</p>
            )}
            {callSheet.timezone && (
              <p>All times shown in {callSheet.timezone}</p>
            )}
          </div>
          {callSheet.lastUpdatedBy && (
            <p>Last updated by: {callSheet.lastUpdatedBy}</p>
          )}
        </div>
      </div>
    </div>
  );
}
