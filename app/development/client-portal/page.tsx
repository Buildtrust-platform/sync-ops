'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * CLIENT PORTAL PAGE
 * Share materials with clients for review.
 */

type ShareStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
type ItemType = 'VIDEO' | 'DOCUMENT' | 'IMAGE' | 'FOLDER';

interface SharedItem {
  id: string;
  name: string;
  type: ItemType;
  size?: string;
}

interface ShareLink {
  id: string;
  title: string;
  client: string;
  items: SharedItem[];
  status: ShareStatus;
  createdAt: string;
  expiresAt?: string;
  lastViewed?: string;
  viewCount: number;
  password?: boolean;
  allowDownload: boolean;
  allowComments: boolean;
}

// Data will be fetched from API
const initialShareLinks: ShareLink[] = [];

const STATUS_CONFIG: Record<ShareStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Edit' },
  ACTIVE: { label: 'Active', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Check' },
  EXPIRED: { label: 'Expired', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  REVOKED: { label: 'Revoked', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'X' },
};

const TYPE_ICONS: Record<ItemType, keyof typeof Icons> = {
  VIDEO: 'Film',
  DOCUMENT: 'FileText',
  IMAGE: 'Image',
  FOLDER: 'Folder',
};

export default function ClientPortalPage() {
  const [shareLinks] = useState<ShareLink[]>(initialShareLinks);
  const [statusFilter, setStatusFilter] = useState<ShareStatus | 'ALL'>('ALL');

  const filteredLinks = shareLinks.filter(
    s => statusFilter === 'ALL' || s.status === statusFilter
  );

  const stats = {
    total: shareLinks.length,
    active: shareLinks.filter(s => s.status === 'ACTIVE').length,
    totalViews: shareLinks.reduce((sum, s) => sum + s.viewCount, 0),
    itemsShared: shareLinks.reduce((sum, s) => sum + s.items.length, 0),
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/development"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-development)', color: 'white' }}
              >
                <Icons.Link className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Client Portal</h1>
                <p className="text-sm text-[var(--text-secondary)]">Share materials with clients</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Create Share Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Share Links</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.active}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Active</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.totalViews}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Views</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">{stats.itemsShared}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Items Shared</p>
            </div>
          </Card>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'ACTIVE', 'DRAFT', 'EXPIRED', 'REVOKED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {status === 'ALL' ? 'All' : STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>

        {/* Share Links */}
        <div className="space-y-4">
          {filteredLinks.map((link) => {
            const statusConfig = STATUS_CONFIG[link.status];
            const StatusIcon = Icons[statusConfig.icon];

            return (
              <Card key={link.id} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[var(--text-primary)]">{link.title}</h3>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-tertiary)]">{link.client}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {link.status === 'ACTIVE' && (
                      <Button variant="secondary" size="sm">
                        <Icons.Copy className="w-3.5 h-3.5 mr-1" />
                        Copy Link
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Icons.MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {link.items.map((item) => {
                    const ItemIcon = Icons[TYPE_ICONS[item.type]];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-subtle)]"
                      >
                        <ItemIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                        <span className="text-sm text-[var(--text-primary)]">{item.name}</span>
                        {item.size && (
                          <span className="text-xs text-[var(--text-tertiary)]">{item.size}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Settings & Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                      <Icons.Eye className="w-3.5 h-3.5" />
                      <span>{link.viewCount} views</span>
                    </div>
                    {link.password && (
                      <div className="flex items-center gap-1 text-xs text-[var(--success)]">
                        <Icons.Lock className="w-3.5 h-3.5" />
                        <span>Password</span>
                      </div>
                    )}
                    {link.allowDownload && (
                      <div className="flex items-center gap-1 text-xs text-[var(--primary)]">
                        <Icons.Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </div>
                    )}
                    {link.allowComments && (
                      <div className="flex items-center gap-1 text-xs text-[var(--accent)]">
                        <Icons.MessageCircle className="w-3.5 h-3.5" />
                        <span>Comments</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {link.lastViewed ? (
                      <span>Last viewed: {link.lastViewed}</span>
                    ) : (
                      <span>Created: {link.createdAt}</span>
                    )}
                    {link.expiresAt && (
                      <span className="ml-2">· Expires: {link.expiresAt}</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredLinks.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Link className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No share links found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create a share link to send materials to clients.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create Share Link
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
