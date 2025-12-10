'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Authenticator } from '@aws-amplify/ui-react';
import GlobalNav from '../components/GlobalNav';

export default function LibraryPage() {
  const [client] = useState(() => generateClient<Schema>());
  const [assets, setAssets] = useState<Schema['Asset']['type'][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    async function fetchAssets() {
      try {
        const { data } = await client.models.Asset.list();
        if (data) {
          setAssets(data);
        }
      } catch (err) {
        console.error('Error fetching assets:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssets();
  }, [client]);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchQuery ||
      asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  const assetTypes = ['ALL', 'VIDEO', 'AUDIO', 'IMAGE', 'DOCUMENT', 'OTHER'];

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen bg-gray-50">
          <GlobalNav
            userEmail={user?.signInDetails?.loginId}
            onSignOut={signOut}
          />

          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Asset Library</h1>
                <p className="text-gray-600 mt-1">Browse and search all media assets across projects</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search assets by name, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div className="flex gap-2">
                  {assetTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterType === type
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Assets Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No assets found</h3>
                <p className="text-gray-600">
                  {searchQuery || filterType !== 'ALL'
                    ? 'Try adjusting your search or filters'
                    : 'Upload assets to your projects to see them here'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAssets.map(asset => (
                  <div
                    key={asset.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {asset.type === 'VIDEO' && <span className="text-4xl">🎬</span>}
                      {asset.type === 'AUDIO' && <span className="text-4xl">🎵</span>}
                      {asset.type === 'IMAGE' && <span className="text-4xl">🖼️</span>}
                      {asset.type === 'DOCUMENT' && <span className="text-4xl">📄</span>}
                      {(!asset.type || asset.type === 'OTHER') && <span className="text-4xl">📁</span>}
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-gray-900 truncate text-sm">
                        {asset.name || 'Untitled'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {asset.type || 'Unknown'} • v{asset.currentVersion || 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
                <p className="text-sm text-gray-600">Total Assets</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {assets.filter(a => a.type === 'VIDEO').length}
                </p>
                <p className="text-sm text-gray-600">Videos</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {assets.filter(a => a.type === 'IMAGE').length}
                </p>
                <p className="text-sm text-gray-600">Images</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {assets.filter(a => a.type === 'DOCUMENT').length}
                </p>
                <p className="text-sm text-gray-600">Documents</p>
              </div>
            </div>
          </main>
        </div>
      )}
    </Authenticator>
  );
}
