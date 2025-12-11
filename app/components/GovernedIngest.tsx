"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";

/**
 * GOVERNED INGEST COMPONENT
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UploadCloudIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

interface GovernedIngestProps {
  projectId: string;
  organizationId?: string;
  onUploadComplete: () => void;
  onCancel: () => void;
}

// Allowed file types based on media production needs
const ALLOWED_FILE_TYPES = {
  video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
  image: ['image/jpeg', 'image/png', 'image/tiff', 'image/raw', 'image/x-adobe-dng'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/flac'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.video,
  ...ALLOWED_FILE_TYPES.image,
  ...ALLOWED_FILE_TYPES.audio,
  ...ALLOWED_FILE_TYPES.document
];

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

export default function GovernedIngest({ projectId, organizationId, onUploadComplete, onCancel }: GovernedIngestProps) {
  const orgId = organizationId || 'default-org';
  const [client] = useState(() => generateClient<Schema>());

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  // Metadata state
  const [cameraId, setCameraId] = useState("");
  const [shootDay, setShootDay] = useState("");
  const [scene, setScene] = useState("");
  const [take, setTake] = useState("");
  const [notes, setNotes] = useState("");

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const validateFile = (file: File): string | null => {
    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type: ${file.type}. Allowed types: Video (MP4, MOV, AVI, MKV), Images (JPEG, PNG, TIFF, RAW), Audio (MP3, WAV, AAC, FLAC), Documents (PDF, DOC, DOCX)`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds maximum allowed size of 10GB. File size: ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB`;
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    setUploadError("");

    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Validate mandatory metadata
    if (!cameraId.trim()) {
      setUploadError("Camera ID is required");
      return;
    }
    if (!shootDay.trim()) {
      setUploadError("Shoot Day is required");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadProgress(0);

    try {
      // Generate standardized filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = selectedFile.name.split('.').pop();
      const standardizedName = `${cameraId}_Day${shootDay}_${scene || 'NS'}_Take${take || '1'}_${timestamp}.${extension}`;

      // Create asset record first
      const newAsset = await client.models.Asset.create({
        organizationId: orgId,
        projectId: projectId,
        s3Key: `media/${projectId}/${standardizedName}`,
        type: 'RAW',
        storageClass: 'STANDARD',
        usageHeatmap: 0,
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      // Upload to S3 with progress tracking
      const upload = uploadData({
        path: `media/${projectId}/${standardizedName}`,
        data: selectedFile,
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const progress = Math.round((transferredBytes / totalBytes) * 100);
              setUploadProgress(progress);
            }
          }
        }
      });

      await upload.result;

      // Log activity
      if (newAsset.data) {
        await client.models.ActivityLog.create({
          organizationId: orgId,
          projectId: projectId,
          userId: 'USER',
          userEmail: 'user@syncops.app',
          userRole: 'Editor',
          action: 'ASSET_UPLOADED',
          targetType: 'Asset',
          targetId: newAsset.data.id,
          targetName: standardizedName,
          metadata: {
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            cameraId,
            shootDay,
            scene,
            take,
            notes,
            originalFilename: selectedFile.name
          },
        });
      }

      setUploadProgress(100);
      setTimeout(() => {
        onUploadComplete();
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div
        className="rounded-[12px] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 p-6 flex items-center justify-between z-10"
          style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>
              Governed Asset Ingest
            </h2>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Upload with mandatory metadata validation
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="p-2 rounded-[6px] transition-colors disabled:opacity-50"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Selection */}
          <div>
            <label
              className="block text-[13px] font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Select File <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="block w-full text-[13px] cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-[6px] file:border-0 file:font-semibold file:text-[13px] file:cursor-pointer disabled:opacity-50"
              style={{ color: 'var(--text-tertiary)' }}
            />
            {fileError && (
              <div
                className="flex items-start gap-2 mt-3 p-3 rounded-[8px]"
                style={{ background: 'var(--error-muted)', border: '1px solid var(--error)' }}
              >
                <span style={{ color: 'var(--error)' }}><AlertCircleIcon /></span>
                <p className="text-[13px]" style={{ color: 'var(--error)' }}>{fileError}</p>
              </div>
            )}
            {selectedFile && !fileError && (
              <div
                className="mt-3 p-3 rounded-[8px] flex items-center gap-3"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--primary)' }}><FileIcon /></span>
                <div>
                  <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedFile.name}
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mandatory Metadata */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Mandatory Metadata
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Camera ID <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={cameraId}
                  onChange={(e) => setCameraId(e.target.value)}
                  disabled={isUploading}
                  placeholder="e.g., CAM01, A-CAM, B-CAM"
                  className="w-full px-4 py-2.5 rounded-[6px] text-[14px] disabled:opacity-50"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Shoot Day <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={shootDay}
                  onChange={(e) => setShootDay(e.target.value)}
                  disabled={isUploading}
                  placeholder="e.g., 1, 2, 3"
                  className="w-full px-4 py-2.5 rounded-[6px] text-[14px] disabled:opacity-50"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Scene (Optional)
                </label>
                <input
                  type="text"
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                  disabled={isUploading}
                  placeholder="e.g., 1A, 2B"
                  className="w-full px-4 py-2.5 rounded-[6px] text-[14px] disabled:opacity-50"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Take (Optional)
                </label>
                <input
                  type="text"
                  value={take}
                  onChange={(e) => setTake(e.target.value)}
                  disabled={isUploading}
                  placeholder="e.g., 1, 2, 3"
                  className="w-full px-4 py-2.5 rounded-[6px] text-[14px] disabled:opacity-50"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                className="block text-[13px] font-semibold mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isUploading}
                placeholder="Additional notes about this asset..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-[6px] text-[14px] resize-none disabled:opacity-50"
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Upload Progress
                </span>
                <span className="text-[13px] font-bold" style={{ color: 'var(--primary)' }}>
                  {uploadProgress}%
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-2)' }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--primary-light, var(--primary)))',
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {uploadError && (
            <div
              className="rounded-[8px] p-4 flex items-start gap-2"
              style={{ background: 'var(--error-muted)', border: '1px solid var(--error)' }}
            >
              <span style={{ color: 'var(--error)' }}><AlertCircleIcon /></span>
              <p className="text-[13px]" style={{ color: 'var(--error)' }}>{uploadError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !!fileError || isUploading || !cameraId.trim() || !shootDay.trim()}
              className="flex-1 py-3 px-6 rounded-[6px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-[80ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              {isUploading ? (
                <>
                  <LoaderIcon />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloudIcon />
                  Upload Asset
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isUploading}
              className="px-6 py-3 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.background = 'var(--bg-3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
