"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import VersionComparison from '@/app/components/VersionComparison';
import VersionTimeline from '@/app/components/VersionTimeline';

interface Asset {
  id: string;
  filename: string;
  projectId: string;
}

export default function AssetVersionsPage({ params }: { params: Promise<{ id: string; assetId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const assetId = resolvedParams.assetId;
  const router = useRouter();

  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [activeView, setActiveView] = useState<'timeline' | 'comparison'>('comparison');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Fetch asset details
  useEffect(() => {
    if (!client) return;
    async function fetchAsset() {
      try {
        const { data } = await client.models.Asset.get({ id: assetId });
        if (data) {
          setAsset(data as Asset);
        }
      } catch (error) {
        console.error('Error fetching asset:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAsset();
  }, [assetId, client]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading asset versions...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-400 font-medium">Asset not found</p>
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/projects/${projectId}`)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Version History</h1>
                <p className="text-slate-400 text-sm mt-1">{asset.filename}</p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setActiveView('comparison')}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeView === 'comparison'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  Comparison
                </div>
              </button>
              <button
                onClick={() => setActiveView('timeline')}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeView === 'timeline'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timeline
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'comparison' ? (
          <VersionComparison assetId={assetId} projectId={projectId} />
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Version History
              </h2>
              <VersionTimeline assetId={assetId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
