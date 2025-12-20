'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * SAFETY PAGE
 * Safety protocols, briefings, and incident tracking.
 */

type SafetyCategory = 'RISK_ASSESSMENT' | 'EQUIPMENT' | 'STUNTS' | 'FIRE_SAFETY' | 'MEDICAL' | 'WEATHER' | 'COVID';
type ChecklistStatus = 'COMPLETE' | 'IN_PROGRESS' | 'NOT_STARTED' | 'N_A';
type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface SafetyChecklistItem {
  id: string;
  category: SafetyCategory;
  item: string;
  status: ChecklistStatus;
  assignee: string;
  dueDate: string;
  notes: string;
}

interface SafetyIncident {
  id: string;
  date: string;
  description: string;
  severity: IncidentSeverity;
  resolution: string;
  reporter: string;
}

// Mock Data - Safety Checklist
const MOCK_CHECKLIST: SafetyChecklistItem[] = [
  {
    id: 'CHK-001',
    category: 'RISK_ASSESSMENT',
    item: 'Complete production risk assessment',
    status: 'COMPLETE',
    assignee: 'Sarah Chen',
    dueDate: '2025-12-01',
    notes: 'All hazards identified and mitigated'
  },
  {
    id: 'CHK-002',
    category: 'RISK_ASSESSMENT',
    item: 'Review location-specific hazards',
    status: 'IN_PROGRESS',
    assignee: 'Mike Rodriguez',
    dueDate: '2025-12-22',
    notes: 'Reviewing Venice Beach location'
  },
  {
    id: 'CHK-003',
    category: 'EQUIPMENT',
    item: 'Inspect all electrical equipment',
    status: 'COMPLETE',
    assignee: 'David Kim',
    dueDate: '2025-12-15',
    notes: 'All equipment certified and tagged'
  },
  {
    id: 'CHK-004',
    category: 'EQUIPMENT',
    item: 'Test emergency power generators',
    status: 'IN_PROGRESS',
    assignee: 'David Kim',
    dueDate: '2025-12-23',
    notes: 'Scheduled for tomorrow'
  },
  {
    id: 'CHK-005',
    category: 'STUNTS',
    item: 'Stunt coordinator safety briefing',
    status: 'COMPLETE',
    assignee: 'Alex Martinez',
    dueDate: '2025-12-10',
    notes: 'All stunt performers briefed'
  },
  {
    id: 'CHK-006',
    category: 'STUNTS',
    item: 'Verify safety rigging and harnesses',
    status: 'NOT_STARTED',
    assignee: 'Alex Martinez',
    dueDate: '2025-12-25',
    notes: 'Pending stunt sequence finalization'
  },
  {
    id: 'CHK-007',
    category: 'FIRE_SAFETY',
    item: 'Fire extinguisher placement verification',
    status: 'COMPLETE',
    assignee: 'Fire Safety Officer',
    dueDate: '2025-12-05',
    notes: 'All areas covered'
  },
  {
    id: 'CHK-008',
    category: 'FIRE_SAFETY',
    item: 'Pyrotechnics safety plan approval',
    status: 'IN_PROGRESS',
    assignee: 'Fire Safety Officer',
    dueDate: '2025-12-20',
    notes: 'Awaiting fire marshal approval'
  },
  {
    id: 'CHK-009',
    category: 'MEDICAL',
    item: 'On-set medic availability confirmed',
    status: 'COMPLETE',
    assignee: 'Production Manager',
    dueDate: '2025-12-01',
    notes: 'EMT on-call for all shoot days'
  },
  {
    id: 'CHK-010',
    category: 'MEDICAL',
    item: 'First aid kits stocked and accessible',
    status: 'COMPLETE',
    assignee: 'Set Supervisor',
    dueDate: '2025-12-10',
    notes: '5 kits placed throughout set'
  },
  {
    id: 'CHK-011',
    category: 'WEATHER',
    item: 'Weather monitoring plan established',
    status: 'IN_PROGRESS',
    assignee: 'AD Department',
    dueDate: '2025-12-21',
    notes: 'Using weather service alerts'
  },
  {
    id: 'CHK-012',
    category: 'WEATHER',
    item: 'Heat safety protocol for outdoor shoots',
    status: 'COMPLETE',
    assignee: 'AD Department',
    dueDate: '2025-12-15',
    notes: 'Shade, water, and cooling stations ready'
  },
  {
    id: 'CHK-013',
    category: 'COVID',
    item: 'COVID-19 safety protocols distributed',
    status: 'COMPLETE',
    assignee: 'COVID Compliance Officer',
    dueDate: '2025-11-20',
    notes: 'All crew received protocols'
  },
  {
    id: 'CHK-014',
    category: 'COVID',
    item: 'Sanitization stations setup',
    status: 'N_A',
    assignee: 'Set Supervisor',
    dueDate: '2025-12-01',
    notes: 'Not required per current guidelines'
  }
];

// Mock Data - Safety Incidents
const MOCK_INCIDENTS: SafetyIncident[] = [
  {
    id: 'INC-001',
    date: '2025-12-15',
    description: 'Minor trip hazard - cable not properly taped down',
    severity: 'LOW',
    resolution: 'Cable immediately secured, area marked. Crew reminded of cable management protocol.',
    reporter: 'Jane Smith'
  },
  {
    id: 'INC-002',
    date: '2025-12-12',
    description: 'Crew member experienced heat exhaustion during outdoor shoot',
    severity: 'MEDIUM',
    resolution: 'On-set medic provided immediate care. Crew member recovered after rest and hydration. Additional shade tents deployed.',
    reporter: 'Mike Rodriguez'
  },
  {
    id: 'INC-003',
    date: '2025-12-08',
    description: 'Unauthorized personnel entered active stunt zone',
    severity: 'HIGH',
    resolution: 'Shoot paused, area cleared. Security perimeter reinforced with additional personnel and signage.',
    reporter: 'Alex Martinez'
  },
  {
    id: 'INC-004',
    date: '2025-12-05',
    description: 'Lighting equipment overheating detected',
    severity: 'MEDIUM',
    resolution: 'Equipment powered down and inspected. Faulty ballast replaced. Equipment recertified before use.',
    reporter: 'David Kim'
  }
];

const CATEGORY_CONFIG: Record<SafetyCategory, { label: string; color: string; icon: keyof typeof Icons }> = {
  RISK_ASSESSMENT: { label: 'Risk Assessment', color: 'var(--primary)', icon: 'Shield' },
  EQUIPMENT: { label: 'Equipment', color: '#8B5CF6', icon: 'Settings' },
  STUNTS: { label: 'Stunts', color: 'var(--danger)', icon: 'Zap' },
  FIRE_SAFETY: { label: 'Fire Safety', color: '#F97316', icon: 'Flame' },
  MEDICAL: { label: 'Medical', color: '#DC2626', icon: 'Heart' },
  WEATHER: { label: 'Weather', color: '#06B6D4', icon: 'Cloud' },
  COVID: { label: 'COVID-19', color: 'var(--success)', icon: 'Activity' },
};

const STATUS_CONFIG: Record<ChecklistStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  COMPLETE: { label: 'Complete', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Clock' },
  NOT_STARTED: { label: 'Not Started', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Circle' },
  N_A: { label: 'N/A', color: 'var(--text-tertiary)', bgColor: 'var(--bg-2)', icon: 'Minus' },
};

const SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  LOW: { label: 'Low', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Info' },
  MEDIUM: { label: 'Medium', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'AlertCircle' },
  HIGH: { label: 'High', color: '#F97316', bgColor: '#FED7AA', icon: 'AlertTriangle' },
  CRITICAL: { label: 'Critical', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'XOctagon' },
};

export default function SafetyPage() {
  const router = useRouter();
  const [checklist, setChecklist] = useState<SafetyChecklistItem[]>(MOCK_CHECKLIST);
  const [incidents, setIncidents] = useState<SafetyIncident[]>(MOCK_INCIDENTS);
  const [categoryFilter, setCategoryFilter] = useState<SafetyCategory | 'ALL'>('ALL');

  // Modal states
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isConfirmCompleteOpen, setIsConfirmCompleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SafetyChecklistItem | null>(null);

  // Form data for new checklist item
  const [itemFormData, setItemFormData] = useState({
    category: 'RISK_ASSESSMENT' as SafetyCategory,
    item: '',
    assignee: '',
    dueDate: '',
    notes: '',
  });

  // Form data for new incident
  const [incidentFormData, setIncidentFormData] = useState({
    description: '',
    severity: 'LOW' as IncidentSeverity,
    resolution: '',
    reporter: '',
  });

  const filteredChecklist = checklist.filter(
    item => categoryFilter === 'ALL' || item.category === categoryFilter
  );

  // Calculate stats
  const totalItems = checklist.length;
  const completedItems = checklist.filter(item => item.status === 'COMPLETE').length;
  const openItems = checklist.filter(item => item.status === 'IN_PROGRESS' || item.status === 'NOT_STARTED').length;
  const checklistProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Group checklist by category
  const checklistByCategory = filteredChecklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<SafetyCategory, SafetyChecklistItem[]>);

  const handleAddItem = () => {
    setItemFormData({
      category: 'RISK_ASSESSMENT',
      item: '',
      assignee: '',
      dueDate: '',
      notes: '',
    });
    setIsAddItemModalOpen(true);
  };

  const handleCreateItem = () => {
    if (!itemFormData.item || !itemFormData.assignee || !itemFormData.dueDate) return;

    const newItem: SafetyChecklistItem = {
      id: `CHK-${String(checklist.length + 1).padStart(3, '0')}`,
      category: itemFormData.category,
      item: itemFormData.item,
      status: 'NOT_STARTED',
      assignee: itemFormData.assignee,
      dueDate: itemFormData.dueDate,
      notes: itemFormData.notes,
    };

    setChecklist([...checklist, newItem]);
    setIsAddItemModalOpen(false);
  };

  const handleMarkComplete = (item: SafetyChecklistItem) => {
    setSelectedItem(item);
    setIsConfirmCompleteOpen(true);
  };

  const confirmMarkComplete = () => {
    if (!selectedItem) return;

    setChecklist(checklist.map(item =>
      item.id === selectedItem.id ? { ...item, status: 'COMPLETE' as ChecklistStatus } : item
    ));
    setIsConfirmCompleteOpen(false);
    setSelectedItem(null);
  };

  const handleReportIncident = () => {
    setIncidentFormData({
      description: '',
      severity: 'LOW',
      resolution: '',
      reporter: '',
    });
    setIsIncidentModalOpen(true);
  };

  const handleCreateIncident = () => {
    if (!incidentFormData.description || !incidentFormData.reporter) return;

    const newIncident: SafetyIncident = {
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      description: incidentFormData.description,
      severity: incidentFormData.severity,
      resolution: incidentFormData.resolution || 'Under investigation',
      reporter: incidentFormData.reporter,
    };

    setIncidents([newIncident, ...incidents]);
    setIsIncidentModalOpen(false);
  };

  const handleGenerateReport = () => {
    const reportContent = `
SAFETY REPORT
=============
Generated: ${new Date().toLocaleString()}

CHECKLIST SUMMARY
-----------------
Total Items: ${totalItems}
Completed: ${completedItems} (${checklistProgress}%)
Open Items: ${openItems}

INCIDENTS
---------
Total Incidents: ${incidents.length}
${incidents.map(i => `- ${i.date}: ${i.description} (${i.severity})`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safety-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pre-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-preproduction)', color: 'white' }}
              >
                <Icons.AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Safety Briefing</h1>
                <p className="text-sm text-[var(--text-secondary)]">Protocols and emergency contacts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleReportIncident}>
                <Icons.AlertTriangle className="w-4 h-4 mr-2" />
                Report Incident
              </Button>
              <Button variant="secondary" size="sm" onClick={handleGenerateReport}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddItem}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{checklistProgress}%</p>
                <p className="text-xs text-[var(--text-tertiary)]">Checklist Progress</p>
              </div>
              <Icons.CheckCircle className="w-8 h-8 text-[var(--success)]" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--danger)]">{incidents.length}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Incidents This Production</p>
              </div>
              <Icons.AlertTriangle className="w-8 h-8 text-[var(--danger)]" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--warning)]">{openItems}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Open Items</p>
              </div>
              <Icons.Clock className="w-8 h-8 text-[var(--warning)]" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--success)]">{completedItems}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Items Complete</p>
              </div>
              <Icons.CheckCircle className="w-8 h-8 text-[var(--success)]" />
            </div>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit overflow-x-auto">
          {(['ALL', 'RISK_ASSESSMENT', 'EQUIPMENT', 'STUNTS', 'FIRE_SAFETY', 'MEDICAL', 'WEATHER', 'COVID'] as const).map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                categoryFilter === category
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {category === 'ALL' ? 'All' : CATEGORY_CONFIG[category].label}
            </button>
          ))}
        </div>

        {/* Safety Checklist by Category */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Safety Checklist</h2>
          <div className="space-y-6">
            {Object.entries(checklistByCategory).map(([category, items]) => {
              const categoryConfig = CATEGORY_CONFIG[category as SafetyCategory];
              const CategoryIcon = Icons[categoryConfig.icon];
              const categoryTotal = items.length;
              const categoryComplete = items.filter(item => item.status === 'COMPLETE').length;
              const categoryProgress = categoryTotal > 0 ? Math.round((categoryComplete / categoryTotal) * 100) : 0;

              return (
                <Card key={category} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${categoryConfig.color}20`, color: categoryConfig.color }}
                      >
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{categoryConfig.label}</h3>
                        <p className="text-xs text-[var(--text-tertiary)]">{categoryComplete} of {categoryTotal} complete</p>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--text-tertiary)]">Progress</span>
                        <span className="text-xs font-medium text-[var(--text-primary)]">{categoryProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--bg-3)] rounded-full">
                        <div
                          className={`h-full rounded-full transition-all ${categoryProgress === 100 ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'}`}
                          style={{ width: `${categoryProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => {
                      const statusConfig = STATUS_CONFIG[item.status];
                      const StatusIcon = Icons[statusConfig.icon];

                      return (
                        <div key={item.id} className="flex items-start gap-3 p-3 bg-[var(--bg-1)] rounded-lg">
                          <button
                            onClick={() => handleMarkComplete(item)}
                            className="mt-0.5"
                            disabled={item.status === 'COMPLETE' || item.status === 'N_A'}
                          >
                            <StatusIcon
                              className="w-5 h-5"
                              style={{ color: statusConfig.color }}
                            />
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-[var(--text-primary)]">{item.item}</h4>
                              <span
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: statusConfig.bgColor,
                                  color: statusConfig.color,
                                }}
                              >
                                {statusConfig.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                              <span>Assignee: {item.assignee}</span>
                              <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                            </div>
                            {item.notes && (
                              <p className="text-sm text-[var(--text-secondary)] mt-2">{item.notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Incident Log */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Incident Log</h2>
            <Button variant="secondary" size="sm" onClick={handleReportIncident}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Report Incident
            </Button>
          </div>
          <div className="space-y-4">
            {incidents.map((incident) => {
              const severityConfig = SEVERITY_CONFIG[incident.severity];
              const SeverityIcon = Icons[severityConfig.icon];

              return (
                <Card key={incident.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: severityConfig.bgColor, color: severityConfig.color }}
                      >
                        <SeverityIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[var(--text-primary)]">{incident.id}</h3>
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: severityConfig.bgColor,
                              color: severityConfig.color,
                            }}
                          >
                            {severityConfig.label} Severity
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {new Date(incident.date).toLocaleDateString()} · Reported by {incident.reporter}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Description</p>
                      <p className="text-sm text-[var(--text-primary)]">{incident.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Resolution</p>
                      <p className="text-sm text-[var(--text-secondary)]">{incident.resolution}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {filteredChecklist.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.AlertTriangle className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No checklist items found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              No items match your current filter
            </p>
            <Button variant="primary" size="sm" onClick={() => setCategoryFilter('ALL')}>
              Clear Filter
            </Button>
          </Card>
        )}
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Safety Checklist Item"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Category *</label>
            <select
              value={itemFormData.category}
              onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value as SafetyCategory })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Item Description *</label>
            <Input
              value={itemFormData.item}
              onChange={(e) => setItemFormData({ ...itemFormData, item: e.target.value })}
              placeholder="e.g., Verify all emergency exits are marked"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Assignee *</label>
              <Input
                value={itemFormData.assignee}
                onChange={(e) => setItemFormData({ ...itemFormData, assignee: e.target.value })}
                placeholder="e.g., Safety Coordinator"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Due Date *</label>
              <Input
                type="date"
                value={itemFormData.dueDate}
                onChange={(e) => setItemFormData({ ...itemFormData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Notes</label>
            <Textarea
              value={itemFormData.notes}
              onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
              placeholder="Additional notes or requirements"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsAddItemModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateItem}>Add Item</Button>
          </div>
        </div>
      </Modal>

      {/* Report Incident Modal */}
      <Modal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        title="Report Safety Incident"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Incident Description *</label>
            <Textarea
              value={incidentFormData.description}
              onChange={(e) => setIncidentFormData({ ...incidentFormData, description: e.target.value })}
              placeholder="Describe what happened..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Severity *</label>
              <select
                value={incidentFormData.severity}
                onChange={(e) => setIncidentFormData({ ...incidentFormData, severity: e.target.value as IncidentSeverity })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Your Name *</label>
              <Input
                value={incidentFormData.reporter}
                onChange={(e) => setIncidentFormData({ ...incidentFormData, reporter: e.target.value })}
                placeholder="e.g., John Smith"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Resolution / Action Taken</label>
            <Textarea
              value={incidentFormData.resolution}
              onChange={(e) => setIncidentFormData({ ...incidentFormData, resolution: e.target.value })}
              placeholder="What was done to address the incident?"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsIncidentModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateIncident}>Report Incident</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Complete Modal */}
      <ConfirmModal
        isOpen={isConfirmCompleteOpen}
        onClose={() => setIsConfirmCompleteOpen(false)}
        onConfirm={confirmMarkComplete}
        title="Mark Item Complete"
        message={`Are you sure you want to mark "${selectedItem?.item}" as complete?`}
        confirmText="Mark Complete"
        variant="default"
      />
    </div>
  );
}
