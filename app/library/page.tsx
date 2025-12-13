'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Authenticator } from '@aws-amplify/ui-react';
import GlobalNav from '../components/GlobalNav';

/**
 * LIBRARY PAGE
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23,7 16,12 23,17 23,7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const MusicIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21,15 16,10 5,21"/>
  </svg>
);

const FileTextIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

export default function LibraryPage() {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [assets, setAssets] = useState<Schema['Asset']['type'][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  useEffect(() => {
    if (!client) return;
    async function fetchAssets() {
      try {
        const result = await client?.models.Asset.list();
        if (result?.data) {
          setAssets(result.data);
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
    const assetName = asset.s3Key?.split('/').pop() || '';
    const matchesSearch = !searchQuery ||
      assetName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  const assetTypes = ['ALL', 'VIDEO', 'AUDIO', 'IMAGE', 'DOCUMENT', 'OTHER'];

  const getAssetIcon = (type: string | null | undefined) => {
    switch (type) {
      case 'VIDEO': return <VideoIcon />;
      case 'AUDIO': return <MusicIcon />;
      case 'IMAGE': return <ImageIcon />;
      case 'DOCUMENT': return <FileTextIcon />;
      default: return <FolderIcon />;
    }
  };

  const getAssetIconColor = (type: string | null | undefined) => {
    switch (type) {
      case 'VIDEO': return 'var(--danger)';
      case 'AUDIO': return 'var(--accent)';
      case 'IMAGE': return 'var(--secondary)';
      case 'DOCUMENT': return 'var(--primary)';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen" style={{ background: 'var(--bg-0)' }}>
          <GlobalNav
            userEmail={user?.signInDetails?.loginId}
            onSignOut={signOut}
          />

          <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1
                  className="text-[28px] font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Asset Library
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Browse and search all media assets across projects
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div
              className="rounded-[12px] p-4 mb-6"
              style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Search assets by name, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[10px] transition-all duration-[80ms]"
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div
                  className="flex gap-1 p-1 rounded-[10px]"
                  style={{ background: 'var(--bg-2)' }}
                >
                  {assetTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className="px-4 py-2 rounded-[6px] text-sm font-medium transition-all duration-[80ms]"
                      style={{
                        background: filterType === type ? 'var(--primary)' : 'transparent',
                        color: filterType === type ? 'white' : 'var(--text-secondary)',
                      }}
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
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: 'var(--primary)' }}
                />
              </div>
            ) : filteredAssets.length === 0 ? (
              <div
                className="rounded-[12px] p-12 text-center"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
              >
                <div
                  className="mb-4 inline-block"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <PackageIcon />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No assets found
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
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
                    className="rounded-[12px] overflow-hidden transition-all duration-[80ms] cursor-pointer hover:translate-y-[-2px]"
                    style={{
                      background: 'var(--bg-1)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <div
                      className="aspect-video flex items-center justify-center"
                      style={{ background: 'var(--bg-2)', color: getAssetIconColor(asset.type) }}
                    >
                      {getAssetIcon(asset.type)}
                    </div>
                    <div className="p-3">
                      <h4
                        className="font-medium truncate text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {asset.s3Key?.split('/').pop() || 'Untitled'}
                      </h4>
                      <p
                        className="text-[12px] mt-1"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {asset.type || 'Unknown'} • v{asset.version || 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 grid grid-cols-4 gap-4">
              {[
                { label: 'Total Assets', value: assets.length },
                { label: 'Videos', value: assets.filter(a => a.mimeType?.includes('video')).length },
                { label: 'Images', value: assets.filter(a => a.mimeType?.includes('image')).length },
                { label: 'Documents', value: assets.filter(a => a.type === 'DOCUMENT').length },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="rounded-[12px] p-4 text-center"
                  style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
                >
                  <p
                    className="text-2xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}
    </Authenticator>
  );
}
