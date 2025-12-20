'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/app/components/ui/Icons';
import { Card, StatCard } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Progress } from '@/app/components/ui/Progress';
import { Badge } from '@/app/components/ui/Badge';
import { Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * MEDIA INGEST PAGE
 * Upload and manage ingested media files from camera cards
 */

type FileType = 'VIDEO' | 'AUDIO' | 'PHOTO';
type IngestStatus = 'UPLOADING' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'VERIFIED';

interface IngestedFile {
  id: string;
  filename: string;
  type: FileType;
  size: string;
  sizeBytes: number;
  duration?: string;
  sourceCard: string;
  ingestTime: string;
  status: IngestStatus;
  thumbnail?: string;
  metadata: {
    codec?: string;
    resolution?: string;
    frameRate?: string;
    bitrate?: string;
    audioChannels?: string;
  };
  progress?: number;
}

// Mock data for 15 ingested files
const MOCK_DATA: IngestedFile[] = [
  {
    id: '1',
    filename: 'A001C002_240520_R2KG.mov',
    type: 'VIDEO',
    size: '47.3 GB',
    sizeBytes: 50786820915,
    duration: '00:12:34',
    sourceCard: 'Card A - CF Express',
    ingestTime: '2024-12-20 08:15:23',
    status: 'VERIFIED',
    metadata: {
      codec: 'ProRes 4444',
      resolution: '4096x2160',
      frameRate: '23.976 fps',
      bitrate: '500 Mbps',
    },
  },
  {
    id: '2',
    filename: 'A001C003_240520_R2KG.mov',
    type: 'VIDEO',
    size: '52.1 GB',
    sizeBytes: 55946011852,
    duration: '00:13:45',
    sourceCard: 'Card A - CF Express',
    ingestTime: '2024-12-20 08:28:11',
    status: 'COMPLETE',
    metadata: {
      codec: 'ProRes 4444',
      resolution: '4096x2160',
      frameRate: '23.976 fps',
      bitrate: '500 Mbps',
    },
  },
  {
    id: '3',
    filename: 'B002C001_240520_R7HT.mov',
    type: 'VIDEO',
    size: '38.7 GB',
    sizeBytes: 41556762419,
    duration: '00:10:15',
    sourceCard: 'Card B - SxS Pro+',
    ingestTime: '2024-12-20 08:42:05',
    status: 'PROCESSING',
    progress: 67,
    metadata: {
      codec: 'ProRes 422 HQ',
      resolution: '3840x2160',
      frameRate: '23.976 fps',
      bitrate: '440 Mbps',
    },
  },
  {
    id: '4',
    filename: 'B002C002_240520_R7HT.mov',
    type: 'VIDEO',
    size: '41.2 GB',
    sizeBytes: 44241710489,
    duration: '00:10:52',
    sourceCard: 'Card B - SxS Pro+',
    ingestTime: '2024-12-20 08:52:33',
    status: 'UPLOADING',
    progress: 34,
    metadata: {
      codec: 'ProRes 422 HQ',
      resolution: '3840x2160',
      frameRate: '23.976 fps',
    },
  },
  {
    id: '5',
    filename: 'C003C001_240520_M9KL.mov',
    type: 'VIDEO',
    size: '28.3 GB',
    sizeBytes: 30383748710,
    duration: '00:07:28',
    sourceCard: 'Card C - SD UHS-II',
    ingestTime: '2024-12-20 09:05:17',
    status: 'VERIFIED',
    metadata: {
      codec: 'H.264',
      resolution: '1920x1080',
      frameRate: '24 fps',
      bitrate: '200 Mbps',
    },
  },
  {
    id: '6',
    filename: 'AUDIO_001_BOOM.wav',
    type: 'AUDIO',
    size: '2.1 GB',
    sizeBytes: 2254857830,
    duration: '01:23:45',
    sourceCard: 'Card D - SD Audio',
    ingestTime: '2024-12-20 09:12:04',
    status: 'COMPLETE',
    metadata: {
      codec: 'PCM',
      bitrate: '2304 kbps',
      audioChannels: '2 (Stereo)',
    },
  },
  {
    id: '7',
    filename: 'AUDIO_002_LAVA.wav',
    type: 'AUDIO',
    size: '1.8 GB',
    sizeBytes: 1932735283,
    duration: '01:11:20',
    sourceCard: 'Card D - SD Audio',
    ingestTime: '2024-12-20 09:15:28',
    status: 'VERIFIED',
    metadata: {
      codec: 'PCM',
      bitrate: '2304 kbps',
      audioChannels: '2 (Stereo)',
    },
  },
  {
    id: '8',
    filename: 'DSC_0034.ARW',
    type: 'PHOTO',
    size: '42.8 MB',
    sizeBytes: 44883558,
    sourceCard: 'Card E - SD Photo',
    ingestTime: '2024-12-20 09:18:55',
    status: 'COMPLETE',
    metadata: {
      resolution: '7680x4320',
      codec: 'RAW',
    },
  },
  {
    id: '9',
    filename: 'DSC_0035.ARW',
    type: 'PHOTO',
    size: '43.2 MB',
    sizeBytes: 45303194,
    sourceCard: 'Card E - SD Photo',
    ingestTime: '2024-12-20 09:19:12',
    status: 'COMPLETE',
    metadata: {
      resolution: '7680x4320',
      codec: 'RAW',
    },
  },
  {
    id: '10',
    filename: 'A004C001_240520_R2KG.mov',
    type: 'VIDEO',
    size: '55.8 GB',
    sizeBytes: 59918852915,
    duration: '00:14:42',
    sourceCard: 'Card A - CF Express',
    ingestTime: '2024-12-20 09:22:47',
    status: 'FAILED',
    metadata: {
      codec: 'ProRes 4444',
      resolution: '4096x2160',
      frameRate: '23.976 fps',
    },
  },
  {
    id: '11',
    filename: 'B003C001_240520_R7HT.mov',
    type: 'VIDEO',
    size: '36.4 GB',
    sizeBytes: 39088364646,
    duration: '00:09:35',
    sourceCard: 'Card B - SxS Pro+',
    ingestTime: '2024-12-20 09:35:22',
    status: 'COMPLETE',
    metadata: {
      codec: 'ProRes 422 HQ',
      resolution: '3840x2160',
      frameRate: '23.976 fps',
      bitrate: '440 Mbps',
    },
  },
  {
    id: '12',
    filename: 'C004C001_240520_M9KL.mov',
    type: 'VIDEO',
    size: '31.7 GB',
    sizeBytes: 34035834060,
    duration: '00:08:22',
    sourceCard: 'Card C - SD UHS-II',
    ingestTime: '2024-12-20 09:47:18',
    status: 'VERIFIED',
    metadata: {
      codec: 'H.264',
      resolution: '1920x1080',
      frameRate: '24 fps',
      bitrate: '200 Mbps',
    },
  },
  {
    id: '13',
    filename: 'DSC_0036.ARW',
    type: 'PHOTO',
    size: '41.9 MB',
    sizeBytes: 43941478,
    sourceCard: 'Card E - SD Photo',
    ingestTime: '2024-12-20 09:51:03',
    status: 'COMPLETE',
    metadata: {
      resolution: '7680x4320',
      codec: 'RAW',
    },
  },
  {
    id: '14',
    filename: 'A005C001_240520_R2KG.mov',
    type: 'VIDEO',
    size: '49.2 GB',
    sizeBytes: 52828503244,
    duration: '00:12:58',
    sourceCard: 'Card A - CF Express',
    ingestTime: '2024-12-20 10:03:47',
    status: 'PROCESSING',
    progress: 89,
    metadata: {
      codec: 'ProRes 4444',
      resolution: '4096x2160',
      frameRate: '23.976 fps',
      bitrate: '500 Mbps',
    },
  },
  {
    id: '15',
    filename: 'AUDIO_003_WIRELESS.wav',
    type: 'AUDIO',
    size: '1.6 GB',
    sizeBytes: 1717986918,
    duration: '01:04:15',
    sourceCard: 'Card D - SD Audio',
    ingestTime: '2024-12-20 10:08:21',
    status: 'COMPLETE',
    metadata: {
      codec: 'PCM',
      bitrate: '2304 kbps',
      audioChannels: '2 (Stereo)',
    },
  },
];

const STATUS_CONFIG: Record<IngestStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'info'; icon: keyof typeof Icons }> = {
  UPLOADING: { label: 'Uploading', variant: 'primary', icon: 'Upload' },
  PROCESSING: { label: 'Processing', variant: 'warning', icon: 'Loader' },
  COMPLETE: { label: 'Complete', variant: 'success', icon: 'CheckCircle' },
  FAILED: { label: 'Failed', variant: 'danger', icon: 'XCircle' },
  VERIFIED: { label: 'Verified', variant: 'success', icon: 'ShieldCheck' },
};

const TYPE_ICONS: Record<FileType, keyof typeof Icons> = {
  VIDEO: 'Video',
  AUDIO: 'Music',
  PHOTO: 'Image',
};

export default function IngestPage() {
  const [files, setFiles] = useState<IngestedFile[]>(MOCK_DATA);
  const [selectedType, setSelectedType] = useState<FileType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isVerifyConfirmOpen, setIsVerifyConfirmOpen] = useState(false);
  const [isReIngestConfirmOpen, setIsReIngestConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Get selected file
  const selectedFile = files.find(f => f.id === selectedFileId);

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesType = selectedType === 'ALL' || file.type === selectedType;
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.sourceCard.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate stats
  const totalSize = files.reduce((sum, file) => sum + file.sizeBytes, 0);
  const stats = {
    totalFiles: files.length,
    totalSize: (totalSize / (1024 ** 3)).toFixed(1) + ' GB',
    processing: files.filter(f => f.status === 'UPLOADING' || f.status === 'PROCESSING').length,
    complete: files.filter(f => f.status === 'COMPLETE' || f.status === 'VERIFIED').length,
    failed: files.filter(f => f.status === 'FAILED').length,
  };

  const handleUploadFiles = () => {
    setIsUploadModalOpen(true);
  };

  const handleVerify = (fileId: string) => {
    setSelectedFileId(fileId);
    setIsVerifyConfirmOpen(true);
  };

  const confirmVerify = () => {
    if (selectedFileId) {
      // Update file status to VERIFIED
      setFiles(files.map(f =>
        f.id === selectedFileId ? { ...f, status: 'VERIFIED' as IngestStatus } : f
      ));
    }
    setIsVerifyConfirmOpen(false);
    setSelectedFileId(null);
  };

  const handleReIngest = (fileId: string) => {
    setSelectedFileId(fileId);
    setIsReIngestConfirmOpen(true);
  };

  const confirmReIngest = () => {
    if (selectedFileId) {
      // Update file status to UPLOADING and reset progress
      setFiles(files.map(f =>
        f.id === selectedFileId ? { ...f, status: 'UPLOADING' as IngestStatus, progress: 0 } : f
      ));
    }
    setIsReIngestConfirmOpen(false);
    setSelectedFileId(null);
  };

  const handleViewDetails = (fileId: string) => {
    setSelectedFileId(fileId);
    setIsViewDetailsModalOpen(true);
  };

  const handleDelete = (fileId: string) => {
    setSelectedFileId(fileId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedFileId) {
      // Remove file from list
      setFiles(files.filter(f => f.id !== selectedFileId));
    }
    setIsDeleteConfirmOpen(false);
    setSelectedFileId(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
                <Icons.Upload className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Media Ingest</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Transfer and verify footage from camera cards
                </p>
              </div>
            </div>
            <Button variant="primary" size="md" onClick={handleUploadFiles}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Files"
            value={stats.totalFiles}
            icon={<Icons.File className="w-5 h-5" />}
          />
          <StatCard
            label="Total Size"
            value={stats.totalSize}
            icon={<Icons.Archive className="w-5 h-5" />}
          />
          <StatCard
            label="Processing"
            value={stats.processing}
            icon={<Icons.Loader className="w-5 h-5" />}
          />
          <StatCard
            label="Complete"
            value={stats.complete}
            icon={<Icons.CheckCircle className="w-5 h-5" />}
          />
        </div>

        {/* Upload Dropzone */}
        <Card className="p-8 mb-6 border-2 border-dashed border-[var(--border-default)] hover:border-[var(--primary)] transition-colors cursor-pointer" onClick={handleUploadFiles}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
              <Icons.Upload className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Supports video, audio, and photo files from camera cards
            </p>
            <Button variant="primary" size="sm">
              <Icons.FolderOpen className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          {/* Type Filter */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedType === 'ALL'
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All Types
            </button>
            {(['VIDEO', 'AUDIO', 'PHOTO'] as FileType[]).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selectedType === type
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Files List */}
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                    File
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                    Type
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                    Size
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                    Metadata
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                    Source
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                    Status
                  </th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredFiles.map(file => {
                  const statusConfig = STATUS_CONFIG[file.status];
                  const StatusIcon = Icons[statusConfig.icon];
                  const TypeIcon = Icons[TYPE_ICONS[file.type]];

                  return (
                    <tr
                      key={file.id}
                      className="hover:bg-[var(--bg-1)] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-medium text-[var(--text-primary)] truncate">
                              {file.filename}
                            </p>
                            {file.duration && (
                              <p className="text-xs text-[var(--text-tertiary)]">
                                {file.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" size="sm">
                          {file.type}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {file.size}
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          {file.metadata.codec && (
                            <p className="text-[var(--text-secondary)]">
                              {file.metadata.codec}
                            </p>
                          )}
                          {file.metadata.resolution && (
                            <p className="text-[var(--text-tertiary)]">
                              {file.metadata.resolution}
                            </p>
                          )}
                          {file.metadata.frameRate && (
                            <p className="text-[var(--text-tertiary)]">
                              {file.metadata.frameRate}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-[var(--text-secondary)]">
                          {file.sourceCard}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {file.ingestTime}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          <Badge
                            variant={statusConfig.variant}
                            size="sm"
                            icon={statusConfig.icon}
                          >
                            {statusConfig.label}
                          </Badge>
                          {(file.status === 'UPLOADING' || file.status === 'PROCESSING') && file.progress !== undefined && (
                            <Progress
                              value={file.progress}
                              size="sm"
                              variant={file.status === 'UPLOADING' ? 'default' : 'warning'}
                            />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(file.id)}
                            className="p-1.5 hover:bg-[var(--bg-2)] rounded-md transition-colors"
                            title="View Details"
                          >
                            <Icons.Eye className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          {file.status === 'COMPLETE' && (
                            <button
                              onClick={() => handleVerify(file.id)}
                              className="p-1.5 hover:bg-[var(--bg-2)] rounded-md transition-colors"
                              title="Verify"
                            >
                              <Icons.ShieldCheck className="w-4 h-4 text-[var(--text-tertiary)]" />
                            </button>
                          )}
                          {file.status === 'FAILED' && (
                            <button
                              onClick={() => handleReIngest(file.id)}
                              className="p-1.5 hover:bg-[var(--bg-2)] rounded-md transition-colors"
                              title="Re-ingest"
                            >
                              <Icons.Refresh className="w-4 h-4 text-[var(--text-tertiary)]" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="p-1.5 hover:bg-[var(--bg-2)] rounded-md transition-colors"
                            title="Delete"
                          >
                            <Icons.Trash className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredFiles.length === 0 && (
            <div className="p-12 text-center">
              <Icons.File className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                No files found
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Upload files to get started'}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Upload Files Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Files"
        size="lg"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-[var(--border-default)] rounded-lg p-12 text-center hover:border-[var(--primary)] transition-colors cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
              <Icons.Upload className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Supports video, audio, and photo files from camera cards
            </p>
            <Button variant="primary" size="sm">
              <Icons.FolderOpen className="w-4 h-4 mr-2" />
              Select Files
            </Button>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">
                Source Card
              </span>
              <select className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                <option>Select source card</option>
                <option>Card A - CF Express</option>
                <option>Card B - SxS Pro+</option>
                <option>Card C - SD UHS-II</option>
                <option>Card D - SD Audio</option>
                <option>Card E - SD Photo</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--text-primary)] mb-1.5 block">
                Notes (Optional)
              </span>
              <Textarea
                placeholder="Add any notes about this upload batch..."
                rows={3}
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                // Handle upload logic here
                setIsUploadModalOpen(false);
              }}
            >
              <Icons.Upload className="w-4 h-4 mr-2" />
              Start Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewDetailsModalOpen}
        onClose={() => {
          setIsViewDetailsModalOpen(false);
          setSelectedFileId(null);
        }}
        title="File Details"
        size="lg"
      >
        {selectedFile && (
          <div className="space-y-6">
            {/* File Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-[var(--border-default)]">
              <div className="w-16 h-16 rounded-lg bg-[var(--bg-2)] flex items-center justify-center flex-shrink-0">
                {(() => {
                  const TypeIcon = Icons[TYPE_ICONS[selectedFile.type]];
                  return <TypeIcon className="w-8 h-8 text-[var(--text-tertiary)]" />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-mono text-lg font-semibold text-[var(--text-primary)] mb-1 break-all">
                  {selectedFile.filename}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm">
                    {selectedFile.type}
                  </Badge>
                  {(() => {
                    const statusConfig = STATUS_CONFIG[selectedFile.status];
                    return (
                      <Badge variant={statusConfig.variant} size="sm" icon={statusConfig.icon}>
                        {statusConfig.label}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* File Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-1 block">
                  File Size
                </label>
                <p className="text-sm text-[var(--text-primary)]">{selectedFile.size}</p>
              </div>
              {selectedFile.duration && (
                <div>
                  <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-1 block">
                    Duration
                  </label>
                  <p className="text-sm text-[var(--text-primary)]">{selectedFile.duration}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-1 block">
                  Source Card
                </label>
                <p className="text-sm text-[var(--text-primary)]">{selectedFile.sourceCard}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-1 block">
                  Ingest Time
                </label>
                <p className="text-sm text-[var(--text-primary)]">{selectedFile.ingestTime}</p>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Metadata</h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedFile.metadata.codec && (
                  <div>
                    <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-1 block">
                      Codec
                    </label>
                    <p className="text-sm text-[var(--text-primary)]">{selectedFile.metadata.codec}</p>
                  </div>
                )}
                {selectedFile.metadata.resolution && (
                  <div>
                    <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-1 block">
                      Resolution
                    </label>
                    <p className="text-sm text-[var(--text-primary)]">{selectedFile.metadata.resolution}</p>
                  </div>
                )}
                {selectedFile.metadata.frameRate && (
                  <div>
                    <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-1 block">
                      Frame Rate
                    </label>
                    <p className="text-sm text-[var(--text-primary)]">{selectedFile.metadata.frameRate}</p>
                  </div>
                )}
                {selectedFile.metadata.bitrate && (
                  <div>
                    <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-1 block">
                      Bitrate
                    </label>
                    <p className="text-sm text-[var(--text-primary)]">{selectedFile.metadata.bitrate}</p>
                  </div>
                )}
                {selectedFile.metadata.audioChannels && (
                  <div>
                    <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-1 block">
                      Audio Channels
                    </label>
                    <p className="text-sm text-[var(--text-primary)]">{selectedFile.metadata.audioChannels}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setIsViewDetailsModalOpen(false);
                  setSelectedFileId(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Confirmation Modal */}
      <ConfirmModal
        isOpen={isVerifyConfirmOpen}
        onClose={() => {
          setIsVerifyConfirmOpen(false);
          setSelectedFileId(null);
        }}
        onConfirm={confirmVerify}
        title="Verify File"
        message={`Are you sure you want to verify "${selectedFile?.filename}"? This will mark the file as verified and confirm its integrity.`}
        confirmText="Verify"
        variant="default"
      />

      {/* Re-ingest Confirmation Modal */}
      <ConfirmModal
        isOpen={isReIngestConfirmOpen}
        onClose={() => {
          setIsReIngestConfirmOpen(false);
          setSelectedFileId(null);
        }}
        onConfirm={confirmReIngest}
        title="Re-ingest File"
        message={`Are you sure you want to re-ingest "${selectedFile?.filename}"? This will restart the upload process for this file.`}
        confirmText="Re-ingest"
        variant="default"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setSelectedFileId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${selectedFile?.filename}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
