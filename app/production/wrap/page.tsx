'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * WRAP PAGE
 * End of day wrap report with comprehensive summary.
 */

interface WrapReport {
  scenesCompleted: number;
  scenesRemaining: number;
  shotsCompleted: number;
  shotsRemaining: number;
  actualWrap: string;
  scheduledWrap: string;
  notes: string[];
  equipment: { item: string; returned: boolean; assignee: string }[];
  catering: { meal: string; time: string; count: number }[];
  tomorrow: { callTime: string; location: string; scenes: string[]; notes: string };
}

// Mock Data
const MOCK_DATA: WrapReport = {
  scenesCompleted: 12,
  scenesRemaining: 8,
  shotsCompleted: 47,
  shotsRemaining: 23,
  actualWrap: '7:45 PM',
  scheduledWrap: '7:00 PM',
  notes: [
    'Scene 14 took longer than expected due to lighting adjustments',
    'Lead actor requested schedule change for tomorrow',
    'Weather forecast shows rain - prepare backup interior scenes',
    'Equipment rental needs to be extended by 2 days',
  ],
  equipment: [
    { item: 'RED Komodo Camera Body', returned: true, assignee: 'Camera Dept' },
    { item: 'Zeiss Supreme Prime Lenses (Set of 5)', returned: true, assignee: 'Camera Dept' },
    { item: 'ARRI SkyPanel S60-C (x4)', returned: false, assignee: 'Lighting Dept' },
    { item: 'Sound Devices 888 Mixer', returned: true, assignee: 'Sound Dept' },
    { item: 'Wireless Lav Mics (x6)', returned: true, assignee: 'Sound Dept' },
    { item: 'DJI Ronin 2 Gimbal', returned: false, assignee: 'Camera Dept' },
    { item: 'Grip Truck Equipment', returned: true, assignee: 'Grip Dept' },
    { item: 'Generator (45kW)', returned: true, assignee: 'Electric Dept' },
  ],
  catering: [
    { meal: 'Breakfast', time: '6:30 AM', count: 45 },
    { meal: 'Lunch', time: '12:30 PM', count: 48 },
    { meal: 'Dinner', time: '6:00 PM', count: 42 },
  ],
  tomorrow: {
    callTime: '7:00 AM',
    location: 'Downtown Office Building - 5th Floor',
    scenes: ['Scene 15: Conference Room', 'Scene 16: Executive Office', 'Scene 17: Hallway Chase'],
    notes: 'Building access opens at 6:30 AM. Parking permits required. Elevator operator on-site.',
  },
};

export default function WrapPage() {
  const [wrapData] = useState<WrapReport>(MOCK_DATA);
  const [equipment, setEquipment] = useState(MOCK_DATA.equipment);
  const [outstandingItems, setOutstandingItems] = useState<string[]>([
    'Scene 14 pickups needed',
    'Costume continuity photos missing',
    'Call sheet for Day 6 pending approval',
  ]);
  const [notes, setNotes] = useState<string[]>(MOCK_DATA.notes);
  const [newNote, setNewNote] = useState('');

  // Modal states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  // Calculate stats
  const totalScenes = wrapData.scenesCompleted + wrapData.scenesRemaining;
  const totalShots = wrapData.shotsCompleted + wrapData.shotsRemaining;
  const dayCompletePercentage = Math.round((wrapData.scenesCompleted / totalScenes) * 100);
  const equipmentReturned = equipment.filter(e => e.returned).length;
  const equipmentTotal = equipment.length;
  const isOnSchedule = wrapData.actualWrap <= wrapData.scheduledWrap;
  const issuesCount = outstandingItems.length + equipment.filter(e => !e.returned).length;

  const toggleEquipment = (index: number) => {
    setEquipment(equipment.map((item, i) =>
      i === index ? { ...item, returned: !item.returned } : item
    ));
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote('');
    }
  };

  const handleRemoveNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleSubmitWrap = () => {
    if (equipmentReturned < equipmentTotal) {
      return;
    }
    setIsSubmitModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    // Generate wrap report content
    let content = `WRAP REPORT - Day 5\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `=`.repeat(50) + '\n\n';
    content += `SUMMARY\n`;
    content += `Scenes Completed: ${wrapData.scenesCompleted}/${totalScenes}\n`;
    content += `Shots Completed: ${wrapData.shotsCompleted}/${totalShots}\n`;
    content += `Wrapped at: ${wrapData.actualWrap} (scheduled: ${wrapData.scheduledWrap})\n\n`;
    content += `NOTES\n`;
    notes.forEach(note => { content += `- ${note}\n`; });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wrap_report_day5_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsSubmitModalOpen(false);
  };

  const handleEmailReport = () => {
    setEmailSubject(`Wrap Report - Day 5 - ${new Date().toLocaleDateString()}`);
    setEmailRecipients('');
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = () => {
    // Simulate sending email - in production this would use an API
    console.log('Sending wrap report to:', emailRecipients);
    setIsEmailModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
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
                <Icons.CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">End of Day Wrap Report</h1>
                <p className="text-sm text-[var(--text-secondary)]">Day 5 - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handlePrint}>
                <Icons.Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="secondary" size="sm" onClick={handleEmailReport}>
                <Icons.Mail className="w-4 h-4 mr-2" />
                Email Report
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitWrap}
                disabled={equipmentReturned < equipmentTotal}
              >
                <Icons.Send className="w-4 h-4 mr-2" />
                Submit Wrap Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Day Complete</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{dayCompletePercentage}%</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{wrapData.scenesCompleted} of {totalScenes} scenes</p>
              </div>
              <Icons.TrendingUp className={`w-8 h-8 ${dayCompletePercentage >= 100 ? 'text-[var(--success)]' : 'text-[var(--text-tertiary)]'}`} />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Schedule Status</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{isOnSchedule ? 'On Schedule' : 'Behind'}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Wrapped at {wrapData.actualWrap} (scheduled: {wrapData.scheduledWrap})</p>
              </div>
              <Icons.Clock className={`w-8 h-8 ${isOnSchedule ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`} />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Issues</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{issuesCount}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{outstandingItems.length} outstanding items</p>
              </div>
              <Icons.AlertCircle className={`w-8 h-8 ${issuesCount === 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`} />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Day Summary */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icons.Film className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Day Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                  <span className="text-sm text-[var(--text-tertiary)]">Scenes Completed</span>
                  <span className="text-sm font-bold text-[var(--success)]">{wrapData.scenesCompleted}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                  <span className="text-sm text-[var(--text-tertiary)]">Scenes Remaining</span>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{wrapData.scenesRemaining}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                  <span className="text-sm text-[var(--text-tertiary)]">Shots Completed</span>
                  <span className="text-sm font-bold text-[var(--success)]">{wrapData.shotsCompleted}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[var(--text-tertiary)]">Shots Remaining</span>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{wrapData.shotsRemaining}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-tertiary)]">Daily Progress</span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">{dayCompletePercentage}%</span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--success)] rounded-full transition-all"
                    style={{ width: `${dayCompletePercentage}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Time Summary */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icons.Clock className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Time Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                  <span className="text-sm text-[var(--text-tertiary)]">Scheduled Wrap</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{wrapData.scheduledWrap}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                  <span className="text-sm text-[var(--text-tertiary)]">Actual Wrap</span>
                  <span className={`text-sm font-bold ${isOnSchedule ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                    {wrapData.actualWrap}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[var(--text-tertiary)]">Status</span>
                  <span className={`text-sm font-bold ${isOnSchedule ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                    {isOnSchedule ? 'On Schedule' : `${Math.abs(parseInt(wrapData.actualWrap) - parseInt(wrapData.scheduledWrap))}min Behind`}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-semibold text-[var(--text-tertiary)] mb-2">CATERING SUMMARY</h4>
                <div className="space-y-2">
                  {wrapData.catering.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">{meal.meal}</span>
                      <span className="text-[var(--text-tertiary)]">{meal.time} ({meal.count} served)</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Outstanding Items */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icons.AlertCircle className="w-5 h-5 text-[var(--warning)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Outstanding Items</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[var(--warning-muted)] text-xs font-bold text-[var(--warning)]">
                  {outstandingItems.length}
                </span>
              </div>
              <div className="space-y-2">
                {outstandingItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-1)]">
                    <Icons.Circle className="w-4 h-4 text-[var(--warning)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--text-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Equipment Returns Checklist */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icons.Package className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Equipment Returns</h3>
                </div>
                <span className="text-sm text-[var(--text-tertiary)]">
                  {equipmentReturned}/{equipmentTotal} returned
                </span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {equipment.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      item.returned ? 'bg-[var(--success-muted)] opacity-70' : 'bg-[var(--bg-1)]'
                    }`}
                  >
                    <button
                      onClick={() => toggleEquipment(index)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        item.returned
                          ? 'border-[var(--success)] bg-[var(--success)] text-white'
                          : 'border-[var(--border-default)] hover:border-[var(--primary)]'
                      }`}
                    >
                      {item.returned && <Icons.Check className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${item.returned ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
                        {item.item}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">{item.assignee}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notes for Tomorrow */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icons.Calendar className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Tomorrow&apos;s Schedule</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[var(--bg-1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Call Time: {wrapData.tomorrow.callTime}</span>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <Icons.MapPin className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5" />
                    <span className="text-sm text-[var(--text-secondary)]">{wrapData.tomorrow.location}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-2">SCENES</p>
                  <div className="space-y-1">
                    {wrapData.tomorrow.scenes.map((scene, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Icons.Film className="w-3 h-3 text-[var(--text-tertiary)] mt-1" />
                        <span className="text-sm text-[var(--text-secondary)]">{scene}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--warning-muted)] border border-[var(--warning)]">
                  <div className="flex items-start gap-2">
                    <Icons.AlertCircle className="w-4 h-4 text-[var(--warning)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[var(--text-secondary)]">{wrapData.tomorrow.notes}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Production Notes */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icons.FileText className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Production Notes</h3>
              </div>
              <div className="space-y-2 mb-4">
                {notes.map((note, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-1)] group">
                    <Icons.MessageSquare className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--text-secondary)] flex-1">{note}</span>
                    <button
                      onClick={() => handleRemoveNote(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                    >
                      <Icons.X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <Button variant="primary" size="sm" onClick={handleAddNote}>
                    <Icons.Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Email Report Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Email Wrap Report"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Recipients *</label>
            <Input
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              placeholder="email@example.com, email2@example.com"
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Separate multiple emails with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Subject</label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>

          <div className="bg-[var(--bg-1)] p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Report Summary</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>Scenes: {wrapData.scenesCompleted}/{totalScenes} completed</li>
              <li>Shots: {wrapData.shotsCompleted}/{totalShots} completed</li>
              <li>Wrapped at: {wrapData.actualWrap}</li>
              <li>Equipment: {equipmentReturned}/{equipmentTotal} returned</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsEmailModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSendEmail} disabled={!emailRecipients}>
              <Icons.Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Submit Wrap Confirmation */}
      <ConfirmModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Wrap Report"
        message={`Are you sure you want to submit the wrap report for Day 5? This will finalize the day's records and download the report.`}
        confirmText="Submit & Download"
        variant="default"
      />
    </div>
  );
}
