'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/app/components/ui/Icons';
import { Card, StatCard } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { Badge } from '@/app/components/ui/Badge';

type DeliverableStatus = 'PENDING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'APPROVED';
type DeliverableFormat = 'ProRes 4444' | 'ProRes 422 HQ' | 'H.264' | 'DNxHR' | 'DCP';
type DeliverableResolution = '4K UHD' | '1080p HD' | '720p' | 'DCP 2K';
type DeliverableCodec = 'ProRes 4444' | 'ProRes 422 HQ' | 'H.264 High' | 'DNxHR HQX' | 'JPEG2000';

interface Deliverable {
  id: string;
  name: string;
  format: DeliverableFormat;
  resolution: DeliverableResolution;
  codec: DeliverableCodec;
  duration: string;
  fileSize: string;
  status: DeliverableStatus;
  client: string;
  dueDate: string;
  deliveredDate?: string;
  version: number;
}

const MOCK_DATA: Deliverable[] = [
  {
    id: '1',
    name: 'Main Feature Master',
    format: 'ProRes 4444',
    resolution: '4K UHD',
    codec: 'ProRes 4444',
    duration: '1:42:35',
    fileSize: '425.3 GB',
    status: 'APPROVED',
    client: 'Netflix',
    dueDate: '2025-01-15',
    deliveredDate: '2025-01-12',
    version: 3,
  },
  {
    id: '2',
    name: 'TV Broadcast Version',
    format: 'ProRes 422 HQ',
    resolution: '1080p HD',
    codec: 'ProRes 422 HQ',
    duration: '1:42:35',
    fileSize: '156.8 GB',
    status: 'DELIVERED',
    client: 'ABC Network',
    dueDate: '2025-01-20',
    deliveredDate: '2025-01-18',
    version: 2,
  },
  {
    id: '3',
    name: 'Social Media Promo',
    format: 'H.264',
    resolution: '1080p HD',
    codec: 'H.264 High',
    duration: '0:00:30',
    fileSize: '42.1 MB',
    status: 'READY',
    client: 'Marketing Team',
    dueDate: '2025-01-25',
    version: 1,
  },
  {
    id: '4',
    name: 'DCP Package (Theater)',
    format: 'DCP',
    resolution: 'DCP 2K',
    codec: 'JPEG2000',
    duration: '1:42:35',
    fileSize: '185.2 GB',
    status: 'IN_PROGRESS',
    client: 'AMC Theaters',
    dueDate: '2025-02-01',
    version: 1,
  },
  {
    id: '5',
    name: 'Director\'s Cut',
    format: 'ProRes 422 HQ',
    resolution: '4K UHD',
    codec: 'ProRes 422 HQ',
    duration: '2:08:15',
    fileSize: '287.4 GB',
    status: 'IN_PROGRESS',
    client: 'Director',
    dueDate: '2025-02-10',
    version: 2,
  },
  {
    id: '6',
    name: 'Trailer - 60s',
    format: 'H.264',
    resolution: '1080p HD',
    codec: 'H.264 High',
    duration: '0:01:00',
    fileSize: '85.3 MB',
    status: 'APPROVED',
    client: 'Marketing Team',
    dueDate: '2025-01-08',
    deliveredDate: '2025-01-07',
    version: 1,
  },
  {
    id: '7',
    name: 'International Version',
    format: 'DNxHR',
    resolution: '1080p HD',
    codec: 'DNxHR HQX',
    duration: '1:42:35',
    fileSize: '198.7 GB',
    status: 'READY',
    client: 'International Distributor',
    dueDate: '2025-01-30',
    version: 1,
  },
  {
    id: '8',
    name: 'Festival Screener',
    format: 'ProRes 422 HQ',
    resolution: '1080p HD',
    codec: 'ProRes 422 HQ',
    duration: '1:42:35',
    fileSize: '156.8 GB',
    status: 'DELIVERED',
    client: 'Sundance Film Festival',
    dueDate: '2024-12-15',
    deliveredDate: '2024-12-12',
    version: 1,
  },
  {
    id: '9',
    name: 'Behind the Scenes',
    format: 'H.264',
    resolution: '1080p HD',
    codec: 'H.264 High',
    duration: '0:15:42',
    fileSize: '1.2 GB',
    status: 'PENDING',
    client: 'Marketing Team',
    dueDate: '2025-02-05',
    version: 1,
  },
  {
    id: '10',
    name: 'Color Grading Reference',
    format: 'ProRes 4444',
    resolution: '4K UHD',
    codec: 'ProRes 4444',
    duration: '1:42:35',
    fileSize: '425.3 GB',
    status: 'APPROVED',
    client: 'Color House',
    dueDate: '2024-12-20',
    deliveredDate: '2024-12-18',
    version: 2,
  },
  {
    id: '11',
    name: 'HDR Master',
    format: 'ProRes 4444',
    resolution: '4K UHD',
    codec: 'ProRes 4444',
    duration: '1:42:35',
    fileSize: '425.3 GB',
    status: 'IN_PROGRESS',
    client: 'Apple TV+',
    dueDate: '2025-02-15',
    version: 1,
  },
  {
    id: '12',
    name: 'Audio Description Track',
    format: 'ProRes 422 HQ',
    resolution: '1080p HD',
    codec: 'ProRes 422 HQ',
    duration: '1:42:35',
    fileSize: '156.8 GB',
    status: 'PENDING',
    client: 'Accessibility Services',
    dueDate: '2025-02-20',
    version: 1,
  },
];

const getStatusBadgeStatus = (status: DeliverableStatus) => {
  const mapping: Record<DeliverableStatus, 'pending' | 'in_progress' | 'ready' | 'delivered' | 'approved'> = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    READY: 'ready',
    DELIVERED: 'delivered',
    APPROVED: 'approved',
  };
  return mapping[status];
};

export default function DeliverablesPage() {
  const [deliverables] = useState<Deliverable[]>(MOCK_DATA);
  const [formatFilter, setFormatFilter] = useState<DeliverableFormat | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<DeliverableStatus | 'ALL'>('ALL');

  // Filter deliverables
  const filteredDeliverables = useMemo(() => {
    return deliverables.filter(del => {
      const formatMatch = formatFilter === 'ALL' || del.format === formatFilter;
      const statusMatch = statusFilter === 'ALL' || del.status === statusFilter;

      return formatMatch && statusMatch;
    });
  }, [deliverables, formatFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = deliverables.length;
    const ready = deliverables.filter(d => d.status === 'READY').length;
    const delivered = deliverables.filter(d => d.status === 'DELIVERED').length;
    const pending = deliverables.filter(d => d.status === 'PENDING').length;

    return { total, ready, delivered, pending };
  }, [deliverables]);

  const handleDownload = (deliverable: Deliverable) => {
    console.log('Download:', deliverable.id);
    // Implement download logic
  };

  const handleSendToClient = (deliverable: Deliverable) => {
    console.log('Send to client:', deliverable.id);
    // Implement send to client logic
  };

  const handleRequestApproval = (deliverable: Deliverable) => {
    console.log('Request approval:', deliverable.id);
    // Implement request approval logic
  };

  const handleReRender = (deliverable: Deliverable) => {
    console.log('Re-render:', deliverable.id);
    // Implement re-render logic
  };

  const formatOptions: Array<{ value: DeliverableFormat | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Formats' },
    { value: 'ProRes 4444', label: 'ProRes 4444' },
    { value: 'ProRes 422 HQ', label: 'ProRes 422 HQ' },
    { value: 'H.264', label: 'H.264' },
    { value: 'DNxHR', label: 'DNxHR' },
    { value: 'DCP', label: 'DCP' },
  ];

  const statusOptions: Array<{ value: DeliverableStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'READY', label: 'Ready' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'APPROVED', label: 'Approved' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Deliverables</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Track final output files and delivery specifications
          </p>
        </div>
        <Button icon="Plus" onClick={() => console.log('Create new deliverable')}>
          New Deliverable
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Deliverables"
          value={stats.total}
          icon={<Icons.Package className="w-5 h-5" />}
        />
        <StatCard
          label="Ready"
          value={stats.ready}
          icon={<Icons.CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          icon={<Icons.Send className="w-5 h-5" />}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Icons.Clock className="w-5 h-5" />}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Icons.Filter className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">Filters:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-[var(--text-tertiary)]">Format:</span>
            {formatOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFormatFilter(option.value)}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${formatFilter === option.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-[var(--text-tertiary)]">Status:</span>
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${statusFilter === option.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Deliverables Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                  Deliverable
                </th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                  Format
                </th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                  Resolution
                </th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                  Codec
                </th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                  Duration
                </th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                  Size
                </th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                  Client
                </th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                  Due Date
                </th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                  Status
                </th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredDeliverables.map(deliverable => (
                <tr
                  key={deliverable.id}
                  className="hover:bg-[var(--bg-1)] transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {deliverable.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">v{deliverable.version}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="info" size="sm" icon="File">
                      {deliverable.format}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {deliverable.resolution}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {deliverable.codec}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {deliverable.duration}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {deliverable.fileSize}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {deliverable.client}
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-[var(--text-secondary)]">
                        {new Date(deliverable.dueDate).toLocaleDateString()}
                      </p>
                      {deliverable.deliveredDate && (
                        <p className="text-xs text-[var(--success)]">
                          Delivered: {new Date(deliverable.deliveredDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={getStatusBadgeStatus(deliverable.status)} size="sm" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {deliverable.status === 'READY' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            icon="Download"
                            onClick={() => handleDownload(deliverable)}
                            title="Download"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            icon="Send"
                            onClick={() => handleSendToClient(deliverable)}
                            title="Send to Client"
                          />
                        </>
                      )}
                      {deliverable.status === 'DELIVERED' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            icon="Download"
                            onClick={() => handleDownload(deliverable)}
                            title="Download"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            icon="CheckCircle"
                            onClick={() => handleRequestApproval(deliverable)}
                            title="Request Approval"
                          />
                        </>
                      )}
                      {deliverable.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon="RefreshCw"
                          onClick={() => handleReRender(deliverable)}
                          title="Re-render"
                        />
                      )}
                      {deliverable.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          icon="Download"
                          onClick={() => handleDownload(deliverable)}
                          title="Download"
                        />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        icon="MoreVertical"
                        title="More options"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDeliverables.length === 0 && (
          <div className="py-12 text-center">
            <Icons.Package className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No deliverables found
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {formatFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Create your first deliverable to get started'
              }
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
