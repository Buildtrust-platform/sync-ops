'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

type CallSheet = Schema['CallSheet']['type'];

export default function CallSheetsListPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [callSheets, setCallSheets] = useState<CallSheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCallSheets();
  }, [projectId]);

  const loadCallSheets = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.CallSheet.list({
        filter: { projectId: { eq: projectId } },
      });

      if (data) {
        // Sort by shoot date, most recent first
        const sorted = [...data].sort((a, b) => {
          if (!a.shootDate) return 1;
          if (!b.shootDate) return -1;
          return new Date(b.shootDate).getTime() - new Date(a.shootDate).getTime();
        });
        setCallSheets(sorted);
      }
    } catch (error) {
      console.error('Error loading call sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'UPDATED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateNew = () => {
    router.push(`/projects/${projectId}/call-sheets/new`);
  };

  const handleViewCallSheet = (callSheetId: string) => {
    router.push(`/projects/${projectId}/call-sheets/${callSheetId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading call sheets...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
              Call Sheets
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage production call sheets for this project
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Call Sheet
            </button>
          </div>
        </div>

        {/* Call Sheets List */}
        {callSheets.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-sm p-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No call sheets</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new call sheet.</p>
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Call Sheet
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {callSheets.map((callSheet) => (
              <div
                key={callSheet.id}
                onClick={() => handleViewCallSheet(callSheet.id)}
                className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
              >
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(callSheet.status)}`}>
                    {callSheet.status}
                  </span>
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-20">
                    {callSheet.productionTitle || 'Untitled Call Sheet'}
                  </h3>

                  {/* Shoot Date */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(callSheet.shootDate)}
                  </div>

                  {/* Shoot Day */}
                  {callSheet.shootDayNumber && (
                    <div className="text-sm text-gray-600 mb-3">
                      Day {callSheet.shootDayNumber} of {callSheet.totalShootDays || 'N/A'}
                    </div>
                  )}

                  {/* Call Time */}
                  {callSheet.generalCrewCall && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Crew Call: {formatTime(callSheet.generalCrewCall)}
                    </div>
                  )}

                  {/* Location */}
                  {callSheet.primaryLocation && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{callSheet.primaryLocation}</span>
                    </div>
                  )}

                  {/* Version */}
                  {callSheet.version && callSheet.version > 1 && (
                    <div className="mt-3 text-xs text-gray-500">
                      Version {callSheet.version}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {callSheet.publishedAt && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Published {new Date(callSheet.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
