'use client';

import { useRouter, useParams } from 'next/navigation';
import CallSheetForm from '@/components/call-sheets/CallSheetForm';

export default function NewCallSheetPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const handleSuccess = (callSheetId?: string) => {
    if (callSheetId) {
      router.push(`/projects/${projectId}/call-sheets/${callSheetId}`);
    }
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}/call-sheets`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Call Sheet</h1>
        <p className="mt-2 text-sm text-gray-600">
          Fill in the details for your production call sheet. You can save as draft or publish to notify the crew.
        </p>
      </div>

      <CallSheetForm
        organizationId="default-org"
        projectId={projectId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
