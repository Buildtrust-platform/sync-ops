'use client';

import { useState, useEffect } from 'react';

/**
 * MEDIA VERIFICATION COMPONENT
 * Critical for ensuring footage is safely backed up
 *
 * Features:
 * - Card/Roll tracking
 * - Ingest status pipeline
 * - Checksum verification
 * - Backup count tracking (3-2-1 rule)
 * - Format-ready status
 */

// Types
interface MediaCard {
  id: string;
  cardId: string;
  camera: string;
  rollNumber: number;
  capacity: string;
  usedGB: number;
  clipCount: number;
  status: 'ON_SET' | 'INGESTING' | 'VERIFYING' | 'VERIFIED' | 'ARCHIVED' | 'FORMATTED';
  backups: {
    onSet: boolean;
    shuttle: boolean;
    cloud: boolean;
  };
  checksumVerified: boolean;
  ingestStartTime: string | null;
  ingestEndTime: string | null;
  verifiedBy: string | null;
  notes: string;
  shootDay: number;
  timestamp: string;
}

interface MediaVerificationProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
}

export default function MediaVerification({
  projectId,
  organizationId,
  currentUserEmail,
}: MediaVerificationProps) {
  const [cards, setCards] = useState<MediaCard[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCamera, setFilterCamera] = useState<string>('ALL');
  const [selectedCard, setSelectedCard] = useState<MediaCard | null>(null);

  const [newCard, setNewCard] = useState({
    cardId: '',
    camera: 'A',
    capacity: '512GB',
    notes: '',
  });

  // Mock data
  useEffect(() => {
    setCards([
      {
        id: '1',
        cardId: 'A001',
        camera: 'A',
        rollNumber: 1,
        capacity: '512GB',
        usedGB: 487,
        clipCount: 45,
        status: 'VERIFIED',
        backups: { onSet: true, shuttle: true, cloud: true },
        checksumVerified: true,
        ingestStartTime: '2024-01-15T09:30:00',
        ingestEndTime: '2024-01-15T10:15:00',
        verifiedBy: 'DIT - John',
        notes: '',
        shootDay: 5,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: '2',
        cardId: 'A002',
        camera: 'A',
        rollNumber: 2,
        capacity: '512GB',
        usedGB: 412,
        clipCount: 38,
        status: 'VERIFIED',
        backups: { onSet: true, shuttle: true, cloud: false },
        checksumVerified: true,
        ingestStartTime: '2024-01-15T11:00:00',
        ingestEndTime: '2024-01-15T11:40:00',
        verifiedBy: 'DIT - John',
        notes: '',
        shootDay: 5,
        timestamp: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: '3',
        cardId: 'A003',
        camera: 'A',
        rollNumber: 3,
        capacity: '512GB',
        usedGB: 356,
        clipCount: 32,
        status: 'VERIFYING',
        backups: { onSet: true, shuttle: false, cloud: false },
        checksumVerified: false,
        ingestStartTime: '2024-01-15T13:30:00',
        ingestEndTime: null,
        verifiedBy: null,
        notes: 'Checksum in progress',
        shootDay: 5,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '4',
        cardId: 'B001',
        camera: 'B',
        rollNumber: 1,
        capacity: '256GB',
        usedGB: 234,
        clipCount: 28,
        status: 'INGESTING',
        backups: { onSet: false, shuttle: false, cloud: false },
        checksumVerified: false,
        ingestStartTime: '2024-01-15T14:00:00',
        ingestEndTime: null,
        verifiedBy: null,
        notes: '',
        shootDay: 5,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: '5',
        cardId: 'B002',
        camera: 'B',
        rollNumber: 2,
        capacity: '256GB',
        usedGB: 0,
        clipCount: 0,
        status: 'ON_SET',
        backups: { onSet: false, shuttle: false, cloud: false },
        checksumVerified: false,
        ingestStartTime: null,
        ingestEndTime: null,
        verifiedBy: null,
        notes: 'Currently in camera',
        shootDay: 5,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'var(--success)';
      case 'ARCHIVED': return 'var(--primary)';
      case 'VERIFYING': return 'var(--warning)';
      case 'INGESTING': return 'var(--warning)';
      case 'ON_SET': return 'var(--text-secondary)';
      case 'FORMATTED': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  };

  const getBackupCount = (backups: MediaCard['backups']) => {
    return [backups.onSet, backups.shuttle, backups.cloud].filter(Boolean).length;
  };

  const uniqueCameras = [...new Set(cards.map(c => c.camera))];

  const filteredCards = cards.filter(card => {
    if (filterStatus !== 'ALL' && card.status !== filterStatus) return false;
    if (filterCamera !== 'ALL' && card.camera !== filterCamera) return false;
    return true;
  });

  const stats = {
    total: cards.length,
    onSet: cards.filter(c => c.status === 'ON_SET').length,
    ingesting: cards.filter(c => c.status === 'INGESTING' || c.status === 'VERIFYING').length,
    verified: cards.filter(c => c.status === 'VERIFIED' || c.status === 'ARCHIVED').length,
    totalGB: cards.reduce((sum, c) => sum + c.usedGB, 0),
    fullyBacked: cards.filter(c => getBackupCount(c.backups) >= 3).length,
  };

  const updateCardStatus = (cardId: string, newStatus: MediaCard['status']) => {
    setCards(cards.map(card =>
      card.id === cardId
        ? {
            ...card,
            status: newStatus,
            ingestStartTime: newStatus === 'INGESTING' && !card.ingestStartTime ? new Date().toISOString() : card.ingestStartTime,
            ingestEndTime: newStatus === 'VERIFIED' ? new Date().toISOString() : card.ingestEndTime,
            verifiedBy: newStatus === 'VERIFIED' ? currentUserEmail : card.verifiedBy,
          }
        : card
    ));
  };

  const updateBackup = (cardId: string, backupType: 'onSet' | 'shuttle' | 'cloud', value: boolean) => {
    setCards(cards.map(card =>
      card.id === cardId
        ? { ...card, backups: { ...card.backups, [backupType]: value } }
        : card
    ));
  };

  const handleAddCard = () => {
    if (!newCard.cardId) return;

    const maxRoll = Math.max(0, ...cards.filter(c => c.camera === newCard.camera).map(c => c.rollNumber));

    const card: MediaCard = {
      id: `card-${Date.now()}`,
      cardId: newCard.cardId,
      camera: newCard.camera,
      rollNumber: maxRoll + 1,
      capacity: newCard.capacity,
      usedGB: 0,
      clipCount: 0,
      status: 'ON_SET',
      backups: { onSet: false, shuttle: false, cloud: false },
      checksumVerified: false,
      ingestStartTime: null,
      ingestEndTime: null,
      verifiedBy: null,
      notes: newCard.notes,
      shootDay: 5,
      timestamp: new Date().toISOString(),
    };

    setCards([card, ...cards]);
    setShowAddModal(false);
    setNewCard({ cardId: '', camera: 'A', capacity: '512GB', notes: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Media Verification
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Track cards, backups, and verification status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all flex items-center gap-2"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Card
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Total Cards', value: stats.total, color: 'var(--text-primary)' },
          { label: 'On Set', value: stats.onSet, color: 'var(--text-secondary)' },
          { label: 'Processing', value: stats.ingesting, color: 'var(--warning)' },
          { label: 'Verified', value: stats.verified, color: 'var(--success)' },
          { label: 'Total Data', value: `${stats.totalGB} GB`, color: 'var(--primary)' },
          { label: '3-2-1 Complete', value: stats.fullyBacked, color: stats.fullyBacked === stats.verified ? 'var(--success)' : 'var(--warning)' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <p className="text-[24px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 3-2-1 Backup Rule Info */}
      <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-muted)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>3-2-1 Backup Rule</p>
            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>3 copies, 2 different media types, 1 offsite</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>ON-SET RAID</p>
            <p className="text-[18px] font-bold" style={{ color: 'var(--success)' }}>{cards.filter(c => c.backups.onSet).length}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>SHUTTLE DRIVE</p>
            <p className="text-[18px] font-bold" style={{ color: cards.filter(c => c.backups.shuttle).length > 0 ? 'var(--success)' : 'var(--warning)' }}>
              {cards.filter(c => c.backups.shuttle).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>CLOUD</p>
            <p className="text-[18px] font-bold" style={{ color: cards.filter(c => c.backups.cloud).length > 0 ? 'var(--success)' : 'var(--warning)' }}>
              {cards.filter(c => c.backups.cloud).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg text-[14px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Status</option>
            <option value="ON_SET">On Set</option>
            <option value="INGESTING">Ingesting</option>
            <option value="VERIFYING">Verifying</option>
            <option value="VERIFIED">Verified</option>
            <option value="ARCHIVED">Archived</option>
            <option value="FORMATTED">Formatted</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Camera</label>
          <select
            value={filterCamera}
            onChange={(e) => setFilterCamera(e.target.value)}
            className="px-3 py-2 rounded-lg text-[14px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Cameras</option>
            {uniqueCameras.map(cam => (
              <option key={cam} value={cam}>{cam} Camera</option>
            ))}
          </select>
        </div>
      </div>

      {/* Card Pipeline */}
      <div className="space-y-4">
        {/* Pipeline Header */}
        <div className="grid grid-cols-6 gap-2 px-4">
          {['ON_SET', 'INGESTING', 'VERIFYING', 'VERIFIED', 'ARCHIVED', 'FORMATTED'].map((status) => (
            <div key={status} className="text-center">
              <span
                className="text-[11px] font-semibold"
                style={{ color: getStatusColor(status) }}
              >
                {status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>

        {/* Cards List */}
        <div className="space-y-3">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="rounded-xl p-4"
              style={{
                background: 'var(--bg-1)',
                border: card.status === 'VERIFIED' && getBackupCount(card.backups) >= 3
                  ? '2px solid var(--success)'
                  : '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-[18px]"
                    style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }}
                  >
                    {card.camera}
                  </div>
                  <div>
                    <p className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>{card.cardId}</p>
                    <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                      Roll {card.rollNumber} • {card.camera} Camera • {card.clipCount} clips
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Status */}
                  <span
                    className="px-3 py-1 rounded-full text-[12px] font-semibold"
                    style={{ background: `${getStatusColor(card.status)}20`, color: getStatusColor(card.status) }}
                  >
                    {card.status.replace('_', ' ')}
                  </span>

                  {/* Backup Indicators */}
                  <div className="flex items-center gap-2">
                    {(['onSet', 'shuttle', 'cloud'] as const).map((backup) => (
                      <button
                        key={backup}
                        onClick={() => updateBackup(card.id, backup, !card.backups[backup])}
                        className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold transition-all"
                        style={{
                          background: card.backups[backup] ? 'var(--success)' : 'var(--bg-2)',
                          color: card.backups[backup] ? 'white' : 'var(--text-tertiary)',
                          border: `1px solid ${card.backups[backup] ? 'var(--success)' : 'var(--border)'}`,
                        }}
                        title={backup === 'onSet' ? 'On-Set RAID' : backup === 'shuttle' ? 'Shuttle Drive' : 'Cloud'}
                      >
                        {backup === 'onSet' ? '1' : backup === 'shuttle' ? '2' : '3'}
                      </button>
                    ))}
                  </div>

                  {/* Checksum */}
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded"
                    style={{ background: card.checksumVerified ? 'var(--success-muted)' : 'var(--bg-2)' }}
                  >
                    {card.checksumVerified ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    <span className="text-[11px] font-semibold" style={{ color: card.checksumVerified ? 'var(--success)' : 'var(--text-tertiary)' }}>
                      MD5
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar / Data Info */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[12px] mb-1">
                    <span style={{ color: 'var(--text-tertiary)' }}>Storage Used</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{card.usedGB} / {card.capacity}</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-2)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(card.usedGB / parseInt(card.capacity)) * 100}%`,
                        background: 'var(--primary)',
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {card.status === 'ON_SET' && (
                    <button
                      onClick={() => updateCardStatus(card.id, 'INGESTING')}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                      style={{ background: 'var(--primary)', color: 'white' }}
                    >
                      Start Ingest
                    </button>
                  )}
                  {card.status === 'INGESTING' && (
                    <button
                      onClick={() => updateCardStatus(card.id, 'VERIFYING')}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                      style={{ background: 'var(--warning)', color: 'white' }}
                    >
                      Run Checksum
                    </button>
                  )}
                  {card.status === 'VERIFYING' && (
                    <button
                      onClick={() => {
                        setCards(cards.map(c => c.id === card.id ? { ...c, checksumVerified: true } : c));
                        updateCardStatus(card.id, 'VERIFIED');
                      }}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                      style={{ background: 'var(--success)', color: 'white' }}
                    >
                      Mark Verified
                    </button>
                  )}
                  {card.status === 'VERIFIED' && getBackupCount(card.backups) >= 3 && (
                    <button
                      onClick={() => updateCardStatus(card.id, 'ARCHIVED')}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                      style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    >
                      Archive
                    </button>
                  )}
                  {card.status === 'ARCHIVED' && (
                    <button
                      onClick={() => updateCardStatus(card.id, 'FORMATTED')}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                      style={{ background: 'var(--error-muted)', color: 'var(--error)' }}
                    >
                      Mark Formatted
                    </button>
                  )}
                </div>
              </div>

              {/* Notes & Times */}
              {(card.notes || card.verifiedBy) && (
                <div className="mt-3 pt-3 flex justify-between text-[12px]" style={{ borderTop: '1px solid var(--border)' }}>
                  {card.notes && <span style={{ color: 'var(--text-tertiary)' }}>{card.notes}</span>}
                  {card.verifiedBy && <span style={{ color: 'var(--text-tertiary)' }}>Verified by: {card.verifiedBy}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl max-w-md w-full" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Add New Card</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-tertiary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Card ID *</label>
                <input
                  type="text"
                  value={newCard.cardId}
                  onChange={(e) => setNewCard({ ...newCard, cardId: e.target.value })}
                  placeholder="A003"
                  className="w-full px-3 py-2 rounded-lg text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Camera</label>
                  <select
                    value={newCard.camera}
                    onChange={(e) => setNewCard({ ...newCard, camera: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="A">A Camera</option>
                    <option value="B">B Camera</option>
                    <option value="C">C Camera</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Capacity</label>
                  <select
                    value={newCard.capacity}
                    onChange={(e) => setNewCard({ ...newCard, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                    <option value="2TB">2TB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Notes</label>
                <textarea
                  value={newCard.notes}
                  onChange={(e) => setNewCard({ ...newCard, notes: e.target.value })}
                  placeholder="Optional notes..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-[14px] resize-none"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddCard}
                  disabled={!newCard.cardId}
                  className="flex-1 py-3 rounded-lg font-semibold text-[14px] transition-all disabled:opacity-50"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  Add Card
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-lg font-semibold text-[14px] transition-all"
                  style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
