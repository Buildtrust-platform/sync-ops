'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from './Toast';

type Project = Schema['Project']['type'];

interface ReportsExportsProps {
  project: Project;
}

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'financial' | 'production' | 'compliance' | 'team';
  fields: string[];
}

const REPORT_TYPES: ReportConfig[] = [
  {
    id: 'budget-summary',
    name: 'Budget Summary Report',
    description: 'Complete budget overview with all expenses, crew costs, and equipment rentals',
    icon: '💰',
    category: 'financial',
    fields: ['budgetCap', 'budgetPreProduction', 'budgetProduction', 'budgetPostProduction', 'budgetDistribution', 'budgetContingency'],
  },
  {
    id: 'expense-detail',
    name: 'Expense Detail Report',
    description: 'Line-by-line breakdown of all project expenses',
    icon: '📊',
    category: 'financial',
    fields: ['expenses'],
  },
  {
    id: 'crew-costs',
    name: 'Crew Cost Report',
    description: 'Detailed crew member costs including overtime, kit fees, and per diem',
    icon: '👥',
    category: 'financial',
    fields: ['crewCosts'],
  },
  {
    id: 'equipment-rental',
    name: 'Equipment Rental Report',
    description: 'All equipment rentals with vendor details and costs',
    icon: '🎬',
    category: 'financial',
    fields: ['equipmentRentals'],
  },
  {
    id: 'location-costs',
    name: 'Location Cost Report',
    description: 'Location fees, permits, parking, and associated costs',
    icon: '📍',
    category: 'financial',
    fields: ['locationCosts'],
  },
  {
    id: 'daily-summary',
    name: 'Daily Cost Summary',
    description: 'Day-by-day cost breakdown for each shoot day',
    icon: '📅',
    category: 'financial',
    fields: ['dailyCosts'],
  },
  {
    id: 'production-status',
    name: 'Production Status Report',
    description: 'Current production status, timeline, and milestones',
    icon: '🎯',
    category: 'production',
    fields: ['status', 'lifecycleState', 'deadline', 'startDate'],
  },
  {
    id: 'asset-inventory',
    name: 'Asset Inventory Report',
    description: 'Complete list of all project assets with metadata',
    icon: '📦',
    category: 'production',
    fields: ['assets'],
  },
  {
    id: 'rights-clearance',
    name: 'Rights Clearance Report',
    description: 'Status of all rights, licenses, and clearances',
    icon: '🔐',
    category: 'compliance',
    fields: ['rights'],
  },
  {
    id: 'compliance-checklist',
    name: 'Compliance Checklist',
    description: 'Full compliance status including permits and legal requirements',
    icon: '✅',
    category: 'compliance',
    fields: ['compliance'],
  },
  {
    id: 'team-roster',
    name: 'Team Roster Report',
    description: 'Complete team list with roles and contact information',
    icon: '👤',
    category: 'team',
    fields: ['team'],
  },
  {
    id: 'activity-log',
    name: 'Activity Log Report',
    description: 'Complete audit trail of all project activities',
    icon: '📋',
    category: 'production',
    fields: ['activityLogs'],
  },
];

export default function ReportsExports({ project }: ReportsExportsProps) {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'exports' | 'scheduled'>('reports');

  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'xlsx' | 'json'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  // Scheduled reports state
  const [scheduledReports, setScheduledReports] = useState<Array<{
    id: string;
    reportType: string;
    frequency: string;
    recipients: string[];
    lastGenerated?: string;
    nextGeneration: string;
  }>>([]);

  // Load any existing scheduled reports
  useEffect(() => {
    // Mock scheduled reports for now
    setScheduledReports([
      {
        id: '1',
        reportType: 'budget-summary',
        frequency: 'weekly',
        recipients: ['producer@example.com', 'finance@example.com'],
        lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextGeneration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  }, []);

  const filteredReports = categoryFilter === 'all'
    ? REPORT_TYPES
    : REPORT_TYPES.filter(r => r.category === categoryFilter);

  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const selectAllInCategory = (category: string) => {
    const categoryReports = REPORT_TYPES.filter(r => r.category === category);
    const allSelected = categoryReports.every(r => selectedReports.includes(r.id));

    if (allSelected) {
      setSelectedReports(prev => prev.filter(id => !categoryReports.find(r => r.id === id)));
    } else {
      setSelectedReports(prev => [...new Set([...prev, ...categoryReports.map(r => r.id)])]);
    }
  };

  const generateReport = async () => {
    if (selectedReports.length === 0) {
      toast.warning('No Reports Selected', 'Please select at least one report to generate');
      return;
    }

    setIsGenerating(true);
    setGeneratedReport(null);

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate report content based on selections
    const selectedConfigs = REPORT_TYPES.filter(r => selectedReports.includes(r.id));

    let reportContent = `# ${project.name} - Project Report\n\n`;
    reportContent += `Generated: ${new Date().toLocaleString()}\n`;
    reportContent += `Format: ${exportFormat.toUpperCase()}\n\n`;

    if (dateRange.start && dateRange.end) {
      reportContent += `Date Range: ${dateRange.start} to ${dateRange.end}\n\n`;
    }

    reportContent += `## Project Overview\n`;
    reportContent += `- **Name:** ${project.name}\n`;
    reportContent += `- **Status:** ${project.status}\n`;
    reportContent += `- **Lifecycle:** ${project.lifecycleState}\n`;
    reportContent += `- **Department:** ${project.department}\n`;
    reportContent += `- **Project Type:** ${project.projectType}\n\n`;

    for (const config of selectedConfigs) {
      reportContent += `## ${config.name}\n`;
      reportContent += `${config.description}\n\n`;

      switch (config.id) {
        case 'budget-summary':
          reportContent += `| Category | Allocated | Spent | Remaining |\n`;
          reportContent += `|----------|-----------|-------|----------|\n`;
          reportContent += `| Pre-Production | $${(project.budgetPreProduction || 0).toLocaleString()} | - | - |\n`;
          reportContent += `| Production | $${(project.budgetProduction || 0).toLocaleString()} | - | - |\n`;
          reportContent += `| Post-Production | $${(project.budgetPostProduction || 0).toLocaleString()} | - | - |\n`;
          reportContent += `| Distribution | $${(project.budgetDistribution || 0).toLocaleString()} | - | - |\n`;
          reportContent += `| Contingency | $${(project.budgetContingency || 0).toLocaleString()} | - | - |\n`;
          reportContent += `| **Total** | **$${(project.budgetCap || 0).toLocaleString()}** | - | - |\n\n`;
          break;

        case 'production-status':
          reportContent += `- **Current Status:** ${project.status}\n`;
          reportContent += `- **Lifecycle State:** ${project.lifecycleState}\n`;
          reportContent += `- **Start Date:** ${project.preProductionStartDate || 'Not set'}\n`;
          reportContent += `- **Deadline:** ${project.deadline || 'Not set'}\n`;
          reportContent += `- **Priority:** ${project.priority || 'Normal'}\n\n`;
          break;

        default:
          reportContent += `[Report data would be populated from database]\n\n`;
      }
    }

    setGeneratedReport(reportContent);
    setIsGenerating(false);
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    let content = generatedReport;
    let filename = `${project.name.replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}`;
    let mimeType = 'text/plain';

    switch (exportFormat) {
      case 'csv':
        // Convert to CSV format
        content = generatedReport.replace(/\|/g, ',').replace(/-{2,}/g, '');
        filename += '.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify({
          projectName: project.name,
          generatedAt: new Date().toISOString(),
          reports: selectedReports,
          data: generatedReport,
        }, null, 2);
        filename += '.json';
        mimeType = 'application/json';
        break;
      case 'pdf':
        // For PDF, we'd integrate with a PDF library - for now download as markdown
        filename += '.md';
        mimeType = 'text/markdown';
        break;
      case 'xlsx':
        // For XLSX, we'd integrate with an Excel library - for now download as CSV
        content = generatedReport.replace(/\|/g, ',').replace(/-{2,}/g, '');
        filename += '.csv';
        mimeType = 'text/csv';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      financial: '💰',
      production: '🎬',
      compliance: '⚖️',
      team: '👥',
    };
    return icons[category] || '📄';
  };

  const tabs = [
    { id: 'reports', label: 'Generate Reports', icon: '📊' },
    { id: 'exports', label: 'Quick Export', icon: '📤' },
    { id: 'scheduled', label: 'Scheduled Reports', icon: '📅' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Exports</h2>
          <p className="text-slate-400 mt-1">Generate comprehensive reports and export project data</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Generate Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All Reports
              </button>
              {['financial', 'production', 'compliance', 'team'].map(category => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === category
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Report List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
              {filteredReports.map(report => (
                <div
                  key={report.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedReports.includes(report.id)
                      ? 'bg-teal-900/30'
                      : 'hover:bg-slate-700/50'
                  }`}
                  onClick={() => toggleReportSelection(report.id)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => toggleReportSelection(report.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-800"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{report.icon}</span>
                        <h3 className="font-medium text-white">{report.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          report.category === 'financial' ? 'bg-green-900/50 text-green-400' :
                          report.category === 'production' ? 'bg-blue-900/50 text-blue-400' :
                          report.category === 'compliance' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-purple-900/50 text-purple-400'
                        }`}>
                          {report.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{report.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Configuration */}
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <h3 className="font-medium text-white mb-4">Report Configuration</h3>

              {/* Date Range */}
              <div className="space-y-3 mb-4">
                <label className="block text-sm text-slate-400">Date Range (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              {/* Export Format */}
              <div className="space-y-3 mb-4">
                <label className="block text-sm text-slate-400">Export Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['pdf', 'csv', 'xlsx', 'json'] as const).map(format => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        exportFormat === format
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Count */}
              <div className="bg-slate-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-slate-400">
                  <span className="text-teal-400 font-bold">{selectedReports.length}</span> report(s) selected
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateReport}
                disabled={selectedReports.length === 0 || isGenerating}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  selectedReports.length === 0 || isGenerating
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Report'
                )}
              </button>
            </div>

            {/* Generated Report Preview */}
            {generatedReport && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">Report Preview</h3>
                  <button
                    onClick={downloadReport}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium"
                  >
                    Download
                  </button>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                    {generatedReport.substring(0, 1000)}
                    {generatedReport.length > 1000 && '...'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Export Tab */}
      {activeTab === 'exports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Full Project Data', icon: '📁', format: 'JSON', description: 'Complete project export including all related data' },
            { name: 'Budget Spreadsheet', icon: '💰', format: 'XLSX', description: 'Budget breakdown in spreadsheet format' },
            { name: 'Team Directory', icon: '👥', format: 'CSV', description: 'Team members with contact information' },
            { name: 'Asset Manifest', icon: '📦', format: 'CSV', description: 'List of all project assets with metadata' },
            { name: 'Activity Audit Log', icon: '📋', format: 'JSON', description: 'Complete audit trail of all activities' },
            { name: 'Compliance Report', icon: '⚖️', format: 'PDF', description: 'Legal and compliance documentation' },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-teal-500/50 transition-colors cursor-pointer"
              onClick={() => {
                toast.info('Exporting', `Exporting ${item.name} as ${item.format}...`);
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {item.format}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          {/* Add New Schedule */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="font-medium text-white mb-4">Schedule New Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">Select Report Type</option>
                {REPORT_TYPES.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <select className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input
                type="email"
                placeholder="Recipients (comma separated)"
                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm">
                Schedule Report
              </button>
            </div>
          </div>

          {/* Scheduled Reports List */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
            {scheduledReports.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-4xl">📅</span>
                <p className="text-slate-400 mt-2">No scheduled reports yet</p>
              </div>
            ) : (
              scheduledReports.map(schedule => {
                const reportConfig = REPORT_TYPES.find(r => r.id === schedule.reportType);
                return (
                  <div key={schedule.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{reportConfig?.icon || '📊'}</span>
                        <div>
                          <h4 className="font-medium text-white">{reportConfig?.name || schedule.reportType}</h4>
                          <p className="text-sm text-slate-400">
                            {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} • {schedule.recipients.length} recipient(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Last Generated</p>
                          <p className="text-sm text-white">
                            {schedule.lastGenerated
                              ? new Date(schedule.lastGenerated).toLocaleDateString()
                              : 'Never'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Next Generation</p>
                          <p className="text-sm text-teal-400">
                            {new Date(schedule.nextGeneration).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="text-red-400 hover:text-red-300 text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
