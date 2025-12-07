"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";

/**
 * GOVERNED INGEST COMPONENT
 *
 * PRD Reference: FR-16 through FR-19
 * - Mandatory metadata validation
 * - File type validation
 * - Upload progress tracking
 * - Standardized naming
 */

interface GovernedIngestProps {
  projectId: string;
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

export default function GovernedIngest({ projectId, onUploadComplete, onCancel }: GovernedIngestProps) {
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
    // Check file type
    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type: ${file.type}. Allowed types: Video (MP4, MOV, AVI, MKV), Images (JPEG, PNG, TIFF, RAW), Audio (MP3, WAV, AAC, FLAC), Documents (PDF, DOC, DOCX)`;
    }

    // Check file size
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Governed Asset Ingest</h2>
            <p className="text-slate-400 text-sm mt-1">Upload with mandatory metadata validation</p>
          </div>
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Select File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-teal-500 file:text-black hover:file:bg-teal-600 file:cursor-pointer disabled:opacity-50"
            />
            {fileError && (
              <p className="text-red-500 text-sm mt-2 flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {fileError}
              </p>
            )}
            {selectedFile && !fileError && (
              <div className="mt-3 p-3 bg-slate-700 rounded-lg">
                <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                <p className="text-slate-400 text-xs mt-1">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                </p>
              </div>
            )}
          </div>

          {/* Mandatory Metadata */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Mandatory Metadata</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Camera ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cameraId}
                  onChange={(e) => setCameraId(e.target.value)}
                  disabled={isUploading}
                  placeholder="e.g., CAM01, A-CAM, B-CAM"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Shoot Day <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shootDay}
                  onChange={(e) => setShootDay(e.target.value)}
                  disabled={isUploading}
                  placeholder="e.g., 1, 2, 3"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Scene (Optional)
                </label>
                <input
                  type="text"
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                  disabled={isUploading}
                  placeholder="e.g., 1A, 2B"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Take (Optional)
                </label>
                <input
                  type="text"
                  value={take}
                  onChange={(e) => setTake(e.target.value)}
                  disabled={isUploading}
                  placeholder="e.g., 1, 2, 3"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-white mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isUploading}
                placeholder="Additional notes about this asset..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="border-t border-slate-700 pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Upload Progress</span>
                <span className="text-sm font-bold text-teal-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {uploadError && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {uploadError}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !!fileError || isUploading || !cameraId.trim() || !shootDay.trim()}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-black font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Asset
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isUploading}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
