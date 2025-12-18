'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CallSheetViewer from '@/components/call-sheets/CallSheetViewer';
import SceneManagementForm from '@/components/call-sheets/SceneManagementForm';
import CastManagementForm from '@/components/call-sheets/CastManagementForm';
import CrewManagementForm from '@/components/call-sheets/CrewManagementForm';

type TabType = 'view' | 'scenes' | 'cast' | 'crew';

export default function CallSheetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const callSheetId = params?.callSheetId as string;
  const [activeTab, setActiveTab] = useState<TabType>('view');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = () => {
    router.push(`/projects/${projectId}/call-sheets/${callSheetId}/edit`);
  };

  const handleDataUpdated = () => {
    // Trigger refresh of the viewer
    setRefreshKey((prev) => prev + 1);
  };

  const tabs = [
    { id: 'view' as TabType, label: 'View Call Sheet' },
    { id: 'scenes' as TabType, label: 'Manage Scenes' },
    { id: 'cast' as TabType, label: 'Manage Cast' },
    { id: 'crew' as TabType, label: 'Manage Crew' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/projects/${projectId}/call-sheets`)}
            className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Call Sheets
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'view' && (
            <div className="p-6">
              <CallSheetViewer key={refreshKey} callSheetId={callSheetId} onEdit={handleEdit} />
            </div>
          )}

          {activeTab === 'scenes' && (
            <div className="p-6">
              <SceneManagementForm callSheetId={callSheetId} onScenesUpdated={handleDataUpdated} />
            </div>
          )}

          {activeTab === 'cast' && (
            <div className="p-6">
              <CastManagementForm callSheetId={callSheetId} onCastUpdated={handleDataUpdated} />
            </div>
          )}

          {activeTab === 'crew' && (
            <div className="p-6">
              <CrewManagementForm callSheetId={callSheetId} onCrewUpdated={handleDataUpdated} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
