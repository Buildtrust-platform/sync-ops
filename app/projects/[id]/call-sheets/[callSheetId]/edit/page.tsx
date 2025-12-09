'use client';

import { useRouter, useParams } from 'next/navigation';
import CallSheetForm from '@/components/call-sheets/CallSheetForm';

export default function EditCallSheetPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const callSheetId = params.callSheetId as string;

  const handleSuccess = () => {
    router.push(`/projects/${projectId}/call-sheets/${callSheetId}`);
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}/call-sheets/${callSheetId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Call Sheet
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Call Sheet</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update call sheet information. Changes will be saved as DRAFT unless you publish.
          </p>
        </div>

        <CallSheetForm
          projectId={projectId}
          callSheetId={callSheetId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
