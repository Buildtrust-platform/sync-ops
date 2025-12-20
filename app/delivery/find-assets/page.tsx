'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icons, Card, Button, Badge, Modal } from '@/app/components/ui';

/**
 * FIND ASSETS PAGE
 * Search and discover assets from archived projects.
 */

type AssetType = 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT' | 'PROJECT_FILE';

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  project: string;
  dateCreated: string;
  size: string;
  duration?: string;
  tags: string[];
  thumbnail?: string;
  location: string;
}

// Mock Data - 20+ searchable assets
const MOCK_DATA: Asset[] = [
  {
    id: '1',
    name: 'Final_Cut_Master_v3.mp4',
    type: 'VIDEO',
    project: 'Summer Campaign 2024',
    dateCreated: '2024-08-15',
    size: '2.4 GB',
    duration: '2:15',
    tags: ['final', 'master', 'approved'],
    location: 's3://archive/summer-campaign/final/',
  },
  {
    id: '2',
    name: 'Interview_B_Roll_01.mp4',
    type: 'VIDEO',
    project: 'Documentary Series',
    dateCreated: '2024-07-22',
    size: '1.8 GB',
    duration: '15:30',
    tags: ['b-roll', 'interview', 'raw'],
    location: 's3://archive/documentary/footage/',
  },
  {
    id: '3',
    name: 'Logo_Reveal_4K.mp4',
    type: 'VIDEO',
    project: 'Brand Refresh',
    dateCreated: '2024-06-10',
    size: '450 MB',
    duration: '0:10',
    tags: ['logo', 'animation', '4k'],
    location: 's3://archive/brand-refresh/assets/',
  },
  {
    id: '4',
    name: 'Main_Theme_Final_Mix.wav',
    type: 'AUDIO',
    project: 'Summer Campaign 2024',
    dateCreated: '2024-08-10',
    size: '125 MB',
    duration: '2:15',
    tags: ['music', 'final', 'mix'],
    location: 's3://archive/summer-campaign/audio/',
  },
  {
    id: '5',
    name: 'Voiceover_Take_7_FINAL.wav',
    type: 'AUDIO',
    project: 'Product Launch',
    dateCreated: '2024-05-18',
    size: '45 MB',
    duration: '1:30',
    tags: ['voiceover', 'final', 'approved'],
    location: 's3://archive/product-launch/audio/',
  },
  {
    id: '6',
    name: 'SFX_Library_Pack_01.zip',
    type: 'AUDIO',
    project: 'Sound Library',
    dateCreated: '2024-04-25',
    size: '890 MB',
    tags: ['sfx', 'library', 'collection'],
    location: 's3://archive/sound-library/',
  },
  {
    id: '7',
    name: 'Hero_Shot_Building_Exterior.jpg',
    type: 'IMAGE',
    project: 'Architecture Portfolio',
    dateCreated: '2024-09-01',
    size: '12 MB',
    tags: ['architecture', 'exterior', 'hero'],
    location: 's3://archive/architecture/photos/',
  },
  {
    id: '8',
    name: 'Product_Lineup_Composite.psd',
    type: 'IMAGE',
    project: 'Product Launch',
    dateCreated: '2024-05-20',
    size: '385 MB',
    tags: ['product', 'composite', 'photoshop'],
    location: 's3://archive/product-launch/images/',
  },
  {
    id: '9',
    name: 'Storyboard_Frames_Full.pdf',
    type: 'DOCUMENT',
    project: 'Summer Campaign 2024',
    dateCreated: '2024-07-01',
    size: '8.5 MB',
    tags: ['storyboard', 'previs', 'planning'],
    location: 's3://archive/summer-campaign/docs/',
  },
  {
    id: '10',
    name: 'Script_Final_Draft_Rev3.pdf',
    type: 'DOCUMENT',
    project: 'Documentary Series',
    dateCreated: '2024-06-15',
    size: '2.2 MB',
    tags: ['script', 'final', 'approved'],
    location: 's3://archive/documentary/scripts/',
  },
  {
    id: '11',
    name: 'Timeline_Edit_Master.fcpxml',
    type: 'PROJECT_FILE',
    project: 'Summer Campaign 2024',
    dateCreated: '2024-08-14',
    size: '45 MB',
    tags: ['fcp', 'timeline', 'master'],
    location: 's3://archive/summer-campaign/projects/',
  },
  {
    id: '12',
    name: 'Color_Grade_Session.drp',
    type: 'PROJECT_FILE',
    project: 'Documentary Series',
    dateCreated: '2024-07-28',
    size: '178 MB',
    tags: ['davinci', 'color', 'grading'],
    location: 's3://archive/documentary/color/',
  },
  {
    id: '13',
    name: 'Motion_Graphics_Comp.aep',
    type: 'PROJECT_FILE',
    project: 'Brand Refresh',
    dateCreated: '2024-06-08',
    size: '520 MB',
    tags: ['after-effects', 'motion', 'graphics'],
    location: 's3://archive/brand-refresh/projects/',
  },
  {
    id: '14',
    name: 'Drone_Footage_4K_Raw.mp4',
    type: 'VIDEO',
    project: 'Real Estate Tour',
    dateCreated: '2024-09-10',
    size: '3.2 GB',
    duration: '8:45',
    tags: ['drone', '4k', 'raw', 'aerial'],
    location: 's3://archive/real-estate/footage/',
  },
  {
    id: '15',
    name: 'Interview_Audio_Sync.wav',
    type: 'AUDIO',
    project: 'Documentary Series',
    dateCreated: '2024-07-22',
    size: '95 MB',
    duration: '15:30',
    tags: ['interview', 'audio', 'synced'],
    location: 's3://archive/documentary/audio/',
  },
  {
    id: '16',
    name: 'Location_Scout_Photos.zip',
    type: 'IMAGE',
    project: 'Summer Campaign 2024',
    dateCreated: '2024-06-28',
    size: '245 MB',
    tags: ['locations', 'scout', 'reference'],
    location: 's3://archive/summer-campaign/reference/',
  },
  {
    id: '17',
    name: 'Talent_Release_Forms.pdf',
    type: 'DOCUMENT',
    project: 'Summer Campaign 2024',
    dateCreated: '2024-08-01',
    size: '1.5 MB',
    tags: ['legal', 'talent', 'release'],
    location: 's3://archive/summer-campaign/legal/',
  },
  {
    id: '18',
    name: 'VFX_Plate_Greenscreen.mp4',
    type: 'VIDEO',
    project: 'Product Launch',
    dateCreated: '2024-05-12',
    size: '1.1 GB',
    duration: '0:30',
    tags: ['vfx', 'greenscreen', 'plate'],
    location: 's3://archive/product-launch/vfx/',
  },
  {
    id: '19',
    name: 'Brand_Guidelines_2024.pdf',
    type: 'DOCUMENT',
    project: 'Brand Refresh',
    dateCreated: '2024-06-05',
    size: '18 MB',
    tags: ['brand', 'guidelines', 'reference'],
    location: 's3://archive/brand-refresh/docs/',
  },
  {
    id: '20',
    name: 'Texture_Pack_4K.zip',
    type: 'IMAGE',
    project: 'VFX Library',
    dateCreated: '2024-08-20',
    size: '1.8 GB',
    tags: ['texture', '4k', 'library', 'vfx'],
    location: 's3://archive/vfx-library/',
  },
  {
    id: '21',
    name: 'Ambient_Room_Tone.wav',
    type: 'AUDIO',
    project: 'Documentary Series',
    dateCreated: '2024-07-22',
    size: '25 MB',
    duration: '5:00',
    tags: ['ambient', 'room-tone', 'audio'],
    location: 's3://archive/documentary/audio/',
  },
  {
    id: '22',
    name: 'Title_Cards_Template.aep',
    type: 'PROJECT_FILE',
    project: 'Documentary Series',
    dateCreated: '2024-07-05',
    size: '85 MB',
    tags: ['titles', 'template', 'graphics'],
    location: 's3://archive/documentary/graphics/',
  },
];

const TYPE_CONFIG: Record<AssetType, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  VIDEO: { label: 'Video', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Video' },
  AUDIO: { label: 'Audio', color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: 'Mic' },
  IMAGE: { label: 'Image', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Image' },
  DOCUMENT: { label: 'Document', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'FileText' },
  PROJECT_FILE: { label: 'Project', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Folder' },
};

export default function FindAssetsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<'ALL' | '30' | '90' | '180'>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [collectionName, setCollectionName] = useState('');

  // Search and filter logic
  const filteredAssets = MOCK_DATA.filter(asset => {
    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        asset.name.toLowerCase().includes(query) ||
        asset.project.toLowerCase().includes(query) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Type filter
    if (typeFilter !== 'ALL' && asset.type !== typeFilter) return false;

    // Date range filter
    if (dateRange !== 'ALL') {
      const assetDate = new Date(asset.dateCreated);
      const now = new Date();
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
      if (assetDate < cutoffDate) return false;
    }

    // Tag filter
    if (selectedTag && !asset.tags.includes(selectedTag)) return false;

    return true;
  });

  // Calculate stats
  const totalAssets = MOCK_DATA.length;
  const videoCount = MOCK_DATA.filter(a => a.type === 'VIDEO').length;
  const audioCount = MOCK_DATA.filter(a => a.type === 'AUDIO').length;
  const imageCount = MOCK_DATA.filter(a => a.type === 'IMAGE').length;
  const documentCount = MOCK_DATA.filter(a => a.type === 'DOCUMENT').length;
  const projectCount = MOCK_DATA.filter(a => a.type === 'PROJECT_FILE').length;
  const totalStorage = '15.2 GB'; // Mock value

  // Get all unique tags
  const allTags = Array.from(new Set(MOCK_DATA.flatMap(a => a.tags))).sort();

  const handleSearch = () => {
    setHasSearched(true);
  };

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleDownload = (assetId: string) => {
    const asset = MOCK_DATA.find(a => a.id === assetId);
    if (!asset) return;

    // Simulate download - in real app would trigger actual download
    const blob = new Blob([`Downloading: ${asset.name}\nLocation: ${asset.location}\nSize: ${asset.size}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = asset.name.replace(/\.[^/.]+$/, '') + '_metadata.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkDownload = () => {
    selectedAssets.forEach(assetId => handleDownload(assetId));
  };

  const handleAddToCollection = () => {
    setIsCollectionModalOpen(true);
  };

  const handleConfirmAddToCollection = () => {
    // In real app, would make API call to add assets to collection
    console.log(`Adding ${selectedAssets.length} assets to collection: ${collectionName}`);
    setIsCollectionModalOpen(false);
    setCollectionName('');
    setSelectedAssets([]);
  };

  const handleView = (assetId: string) => {
    const asset = MOCK_DATA.find(a => a.id === assetId);
    if (!asset) return;
    setViewingAsset(asset);
    setIsViewModalOpen(true);
  };

  const handleDownloadFromModal = () => {
    if (viewingAsset) {
      handleDownload(viewingAsset.id);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/delivery"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-delivery)', color: 'white' }}
              >
                <Icons.Search className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Find Assets</h1>
                <p className="text-sm text-[var(--text-secondary)]">Search archived projects and collections</p>
              </div>
            </div>
            {selectedAssets.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-tertiary)]">{selectedAssets.length} selected</span>
                <Button variant="secondary" size="sm" onClick={handleAddToCollection}>
                  <Icons.FolderPlus className="w-4 h-4 mr-2" />
                  Add to Collection
                </Button>
                <Button variant="primary" size="sm" onClick={handleBulkDownload}>
                  <Icons.Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Icons.Database className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">{totalAssets}</p>
            <p className="text-xs text-[var(--text-tertiary)]">Total Assets</p>
          </Card>
          <Card className="p-4 text-center">
            <Icons.Video className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
            <p className="text-2xl font-bold text-[var(--primary)]">{videoCount}</p>
            <p className="text-xs text-[var(--text-tertiary)]">Videos</p>
          </Card>
          <Card className="p-4 text-center">
            <Icons.Mic className="w-6 h-6 mx-auto mb-2 text-[var(--accent)]" />
            <p className="text-2xl font-bold text-[var(--accent)]">{audioCount}</p>
            <p className="text-xs text-[var(--text-tertiary)]">Audio</p>
          </Card>
          <Card className="p-4 text-center">
            <Icons.Image className="w-6 h-6 mx-auto mb-2 text-[var(--success)]" />
            <p className="text-2xl font-bold text-[var(--success)]">{imageCount}</p>
            <p className="text-xs text-[var(--text-tertiary)]">Images</p>
          </Card>
          <Card className="p-4 text-center">
            <Icons.FileText className="w-6 h-6 mx-auto mb-2 text-[var(--warning)]" />
            <p className="text-2xl font-bold text-[var(--warning)]">{documentCount}</p>
            <p className="text-xs text-[var(--text-tertiary)]">Documents</p>
          </Card>
          <Card className="p-4 text-center">
            <Icons.HardDrive className="w-6 h-6 mx-auto mb-2 text-[var(--text-secondary)]" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">{totalStorage}</p>
            <p className="text-xs text-[var(--text-tertiary)]">Storage Used</p>
          </Card>
        </div>

        {/* Search Interface */}
        <Card className="p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by filename, project, tags, or metadata..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <Button variant="primary" onClick={handleSearch}>
              <Icons.Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-[var(--text-tertiary)]">TYPE:</span>
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All
            </button>
            {(Object.keys(TYPE_CONFIG) as AssetType[]).map(type => {
              const config = TYPE_CONFIG[type];
              const Icon = Icons[config.icon];
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    typeFilter === type
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-[var(--text-tertiary)]">DATE:</span>
            {['ALL', '30', '90', '180'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {range === 'ALL' ? 'All Time' : `Last ${range} days`}
              </button>
            ))}
          </div>

          {/* Tag Filter */}
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-[var(--text-tertiary)] mt-2">TAGS:</span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                All Tags
              </button>
              {allTags.slice(0, 15).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-[var(--text-primary)]">
            {filteredAssets.length} {filteredAssets.length === 1 ? 'Asset' : 'Assets'} Found
          </h3>
          {(searchQuery || typeFilter !== 'ALL' || dateRange !== 'ALL' || selectedTag) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
                setDateRange('ALL');
                setSelectedTag(null);
                setHasSearched(false);
              }}
            >
              <Icons.X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 gap-3">
          {filteredAssets.map(asset => {
            const typeConfig = TYPE_CONFIG[asset.type];
            const TypeIcon = Icons[typeConfig.icon];
            const isSelected = selectedAssets.includes(asset.id);

            return (
              <Card
                key={asset.id}
                className={`p-4 transition-all ${isSelected ? 'ring-2 ring-[var(--primary)]' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleAssetSelection(asset.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                        : 'border-[var(--border-default)] hover:border-[var(--primary)]'
                    }`}
                  >
                    {isSelected && <Icons.Check className="w-3 h-3" />}
                  </button>

                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: typeConfig.bgColor }}
                  >
                    <TypeIcon className="w-7 h-7" style={{ color: typeConfig.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-[var(--text-primary)] truncate">{asset.name}</h4>
                      <Badge
                        variant="default"
                        size="sm"
                        className="flex-shrink-0"
                        style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                      >
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-tertiary)] mb-1">
                      {asset.project} · {new Date(asset.dateCreated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <Icons.HardDrive className="w-3 h-3" />
                        {asset.size}
                      </span>
                      {asset.duration && (
                        <span className="flex items-center gap-1">
                          <Icons.Clock className="w-3 h-3" />
                          {asset.duration}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Icons.MapPin className="w-3 h-3" />
                        {asset.location.split('/').slice(2, 4).join('/')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {asset.tags.slice(0, 3).map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="px-2 py-0.5 rounded bg-[var(--bg-2)] text-[10px] text-[var(--text-tertiary)] hover:bg-[var(--bg-3)] transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                      {asset.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-[10px] text-[var(--text-tertiary)]">
                          +{asset.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleView(asset.id)}>
                      <Icons.Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(asset.id)}>
                      <Icons.Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredAssets.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Search className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No assets found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
                setDateRange('ALL');
                setSelectedTag(null);
              }}
            >
              Clear All Filters
            </Button>
          </Card>
        )}
      </div>

      {/* View Asset Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Asset Details"
        size="lg"
      >
        {viewingAsset && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: TYPE_CONFIG[viewingAsset.type].bgColor }}
              >
                {(() => {
                  const Icon = Icons[TYPE_CONFIG[viewingAsset.type].icon];
                  return <Icon className="w-8 h-8" style={{ color: TYPE_CONFIG[viewingAsset.type].color }} />;
                })()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{viewingAsset.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    size="sm"
                    style={{ backgroundColor: TYPE_CONFIG[viewingAsset.type].bgColor, color: TYPE_CONFIG[viewingAsset.type].color }}
                  >
                    {TYPE_CONFIG[viewingAsset.type].label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-default)]">
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Project</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{viewingAsset.project}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Date Created</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {new Date(viewingAsset.dateCreated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Size</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{viewingAsset.size}</p>
              </div>
              {viewingAsset.duration && (
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Duration</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{viewingAsset.duration}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-tertiary)] mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {viewingAsset.tags.map(tag => (
                  <Badge key={tag} variant="default" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Location</p>
              <p className="text-sm font-mono text-[var(--text-secondary)] bg-[var(--bg-2)] px-3 py-2 rounded-lg break-all">
                {viewingAsset.location}
              </p>
            </div>

            <div className="pt-4">
              <Button variant="primary" onClick={handleDownloadFromModal} fullWidth>
                <Icons.Download className="w-4 h-4 mr-2" />
                Download Asset
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add to Collection Modal */}
      <Modal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        title="Add to Collection"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCollectionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmAddToCollection}
              disabled={!collectionName.trim()}
            >
              Add to Collection
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Add {selectedAssets.length} selected {selectedAssets.length === 1 ? 'asset' : 'assets'} to a collection
          </p>

          <div>
            <label htmlFor="collection-name" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Collection Name
            </label>
            <input
              id="collection-name"
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter collection name..."
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="collection-select" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Or select existing collection
            </label>
            <select
              id="collection-select"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">-- Select a collection --</option>
              <option value="Summer 2024 Collection">Summer 2024 Collection</option>
              <option value="Brand Assets">Brand Assets</option>
              <option value="Documentary Footage">Documentary Footage</option>
              <option value="Product Launch Materials">Product Launch Materials</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <p className="text-xs text-[var(--text-tertiary)] mb-2">Selected Assets:</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedAssets.map(assetId => {
                const asset = MOCK_DATA.find(a => a.id === assetId);
                if (!asset) return null;
                return (
                  <div key={assetId} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Icons.File className="w-3 h-3" />
                    <span className="truncate">{asset.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
