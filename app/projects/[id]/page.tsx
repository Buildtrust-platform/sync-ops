"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { uploadData, list } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useParams } from "next/navigation";
import Link from "next/link"; 

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Schema["Project"]["type"] | null>(null);
  const [assets, setAssets] = useState<Array<Schema["Asset"]["type"]>>([]);
  const [uploadStatus, setUploadStatus] = useState("");

  // 1. INITIAL LOAD (Runs once when projectId changes)
  useEffect(() => {
    if (projectId) {
      // A. Load Project Details
      client.models.Project.get({ id: projectId }).then((data) => {
        setProject(data.data);
      });

      // B. Load Assets with real-time updates
      const subscription = client.models.Asset.observeQuery({
        filter: { projectId: { eq: projectId } }
      }).subscribe({
        next: (data) => setAssets([...data.items]),
      });

      return () => subscription.unsubscribe();
    }
  }, [projectId]);

  // 2. HANDLE UPLOAD
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadStatus("Uploading...");

    try {
      // A. Create DynamoDB record FIRST (before S3 upload triggers Lambda)
      await client.models.Asset.create({
        projectId: projectId,
        s3Key: `media/${projectId}/${file.name}`,
        type: 'RAW',
        storageClass: 'STANDARD',
        usageHeatmap: 0
      });

      // B. Upload to S3 (this will trigger the Lambda)
      await uploadData({
        path: `media/${projectId}/${file.name}`,
        data: file,
      }).result;

      setUploadStatus("Done! AI processing...");

    } catch (error) {
      console.error(error);
      setUploadStatus("Error!");
    }
  }

  if (!project) return <div className="p-10 text-white">Loading Project DNA...</div>;

  return (
    <main className="min-h-screen bg-slate-900 text-white p-10 font-sans">
      {/* HEADER */}
      <div className="mb-8">
        <Link href="/" className="text-slate-500 hover:text-teal-400 mb-4 inline-block">← Back to Dashboard</Link>
        <h1 className="text-4xl font-bold text-white">{project.name}</h1>
        <span className="text-teal-400 font-mono text-sm border border-teal-900 bg-slate-800 px-2 py-1 rounded mt-2 inline-block">
          {project.status}
        </span>
      </div>

      {/* UPLOAD ZONE */}
      <div className="bg-slate-800 p-8 rounded-xl border-2 border-dashed border-slate-600 hover:border-teal-500 transition-all text-center mb-10">
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          onChange={handleUpload}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-4xl mb-2">📂</div>
          <p className="text-xl font-bold text-teal-400">Click to Ingest Media</p>
          <p className="text-slate-500 text-sm">Upload RAW footage, proxies, or documents</p>
          {uploadStatus && <p className="mt-4 text-yellow-400 animate-pulse">{uploadStatus}</p>}
        </label>
      </div>

      {/* ASSET GRID */}
      <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Project Assets ({assets.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-teal-500/50 transition-all">
            {/* File Preview */}
            <div className="bg-black/50 h-32 flex items-center justify-center mb-3 rounded text-slate-600 text-xs">
              {asset.s3Key.split('/').pop()}
            </div>

            {/* File Name */}
            <p className="text-sm text-slate-300 truncate font-medium mb-2">{asset.s3Key.split('/').pop()}</p>

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] px-2 py-1 rounded font-mono ${
                asset.type === 'PROCESSING' ? 'bg-yellow-900 text-yellow-200 animate-pulse' :
                asset.type === 'MASTER' ? 'bg-green-900 text-green-200' :
                'bg-teal-900 text-teal-200'
              }`}>
                {asset.type}
              </span>
              {asset.aiConfidence && (
                <span className="text-[10px] text-slate-500">
                  {asset.aiConfidence.toFixed(0)}% confident
                </span>
              )}
            </div>

            {/* AI Tags */}
            {asset.aiTags && asset.aiTags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">AI Tags</p>
                <div className="flex flex-wrap gap-1">
                  {asset.aiTags.slice(0, 5).map((tag, i) => (
                    <span key={i} className="text-[9px] bg-slate-900 text-teal-300 px-2 py-0.5 rounded-full border border-teal-900">
                      {tag}
                    </span>
                  ))}
                  {asset.aiTags.length > 5 && (
                    <span className="text-[9px] text-slate-500">+{asset.aiTags.length - 5} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {asset.type === 'PROCESSING' && !asset.aiTags && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-yellow-400 animate-pulse">🤖 AI analyzing...</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}