'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * CONTACTS PAGE
 * Production contact directory with comprehensive information.
 */

type Department = 'CAST' | 'CREW' | 'VENDORS' | 'LOCATIONS' | 'PRODUCTION' | 'STUDIO' | 'AGENCY';

interface Contact {
  id: string;
  name: string;
  role: string;
  department: Department;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  tags: string[];
  isPrimary: boolean;
}

// Mock Data - 20 realistic production contacts
const MOCK_DATA: Contact[] = [
  {
    id: 'c1',
    name: 'Emily Chen',
    role: 'Lead Actor (Sarah Mitchell)',
    department: 'CAST',
    company: 'Talent Works Agency',
    email: 'emily.chen@talentworks.com',
    phone: '(323) 555-0123',
    address: '1234 Sunset Blvd, Los Angeles, CA 90028',
    notes: 'Available weekdays after 2pm. Prefers morning call times.',
    tags: ['Lead', 'Available'],
    isPrimary: true
  },
  {
    id: 'c2',
    name: 'David Rodriguez',
    role: 'Talent Agent',
    department: 'AGENCY',
    company: 'Talent Works Agency',
    email: 'david@talentworks.com',
    phone: '(323) 555-0124',
    address: '9601 Wilshire Blvd, Beverly Hills, CA 90210',
    notes: 'Primary contact for Emily Chen. Very responsive.',
    tags: ['Agent', 'Primary Contact'],
    isPrimary: true
  },
  {
    id: 'c3',
    name: 'Ryan Thompson',
    role: 'Supporting Actor (Marcus Kane)',
    department: 'CAST',
    company: 'Paradigm Talent',
    email: 'ryan.thompson@paradigm.com',
    phone: '(310) 555-0167',
    address: '8942 Wilshire Blvd, Beverly Hills, CA 90211',
    notes: 'Callback scheduled for 1/15. Strong technical knowledge.',
    tags: ['Supporting', 'Callback'],
    isPrimary: false
  },
  {
    id: 'c4',
    name: 'Sarah Martinez',
    role: 'Director of Photography',
    department: 'CREW',
    company: 'Freelance',
    email: 'sarah.dp@gmail.com',
    phone: '(818) 555-0198',
    address: '5678 Ventura Blvd, Sherman Oaks, CA 91403',
    notes: 'Award-winning DP. Equipment package included in rate.',
    tags: ['Key Crew', 'Camera Department'],
    isPrimary: true
  },
  {
    id: 'c5',
    name: 'Michael Chang',
    role: 'Production Designer',
    department: 'CREW',
    company: 'Design Guild Productions',
    email: 'mchang@designguild.com',
    phone: '(310) 555-0145',
    address: '3421 La Cienega Blvd, Los Angeles, CA 90016',
    notes: 'Specializes in contemporary/urban designs. References available.',
    tags: ['Art Department', 'Key Crew'],
    isPrimary: true
  },
  {
    id: 'c6',
    name: 'Jennifer Wu',
    role: 'Sound Mixer',
    department: 'CREW',
    company: 'Sound Solutions LA',
    email: 'jwu@soundsolutionsla.com',
    phone: '(323) 555-0187',
    address: '1122 Vine St, Hollywood, CA 90038',
    notes: 'Full sound cart. Additional boom op available.',
    tags: ['Sound Department', 'Equipment Included'],
    isPrimary: false
  },
  {
    id: 'c7',
    name: 'Robert Kim',
    role: 'Gaffer',
    department: 'CREW',
    company: 'Bright Lights Productions',
    email: 'rkim@brightlights.com',
    phone: '(818) 555-0234',
    address: '9876 Cahuenga Blvd, North Hollywood, CA 91601',
    notes: 'Works regularly with Sarah Martinez. Excellent G&E package.',
    tags: ['Lighting', 'G&E'],
    isPrimary: false
  },
  {
    id: 'c8',
    name: 'Amanda Foster',
    role: 'Camera & Lighting Rental',
    department: 'VENDORS',
    company: 'Panavision Hollywood',
    email: 'afoster@panavision.com',
    phone: '(323) 555-0299',
    address: '6101 Melrose Ave, Hollywood, CA 90038',
    notes: 'Quote provided for ARRI Alexa package. 10% discount available.',
    tags: ['Camera Rental', 'Preferred Vendor'],
    isPrimary: true
  },
  {
    id: 'c9',
    name: 'James Wilson',
    role: 'Grip & Electric Rentals',
    department: 'VENDORS',
    company: 'Cinelease Studios',
    email: 'jwilson@cinelease.com',
    phone: '(818) 555-0321',
    address: '1200 W. Magnolia Blvd, Burbank, CA 91506',
    notes: 'Full G&E package quote attached. Delivery included.',
    tags: ['G&E Rental', 'Delivery Available'],
    isPrimary: false
  },
  {
    id: 'c10',
    name: 'Lisa Park',
    role: 'Catering Services',
    department: 'VENDORS',
    company: 'On Set Catering Co.',
    email: 'lisa@onsetcatering.com',
    phone: '(310) 555-0456',
    address: '5432 Wilshire Blvd, Los Angeles, CA 90036',
    notes: 'Handles dietary restrictions. Requires 48hr notice for menu changes.',
    tags: ['Catering', 'Dietary Options'],
    isPrimary: true
  },
  {
    id: 'c11',
    name: 'Tom Anderson',
    role: 'Transportation Captain',
    department: 'VENDORS',
    company: 'Star Waggons',
    email: 'tanderson@starwaggons.com',
    phone: '(818) 555-0567',
    address: '7845 San Fernando Rd, Sun Valley, CA 91352',
    notes: 'Fleet of production vehicles and talent trailers available.',
    tags: ['Transportation', 'Honey Wagons'],
    isPrimary: false
  },
  {
    id: 'c12',
    name: 'Rachel Green',
    role: 'Location Owner',
    department: 'LOCATIONS',
    company: 'Downtown Loft Rentals',
    email: 'rachel@dtlofts.com',
    phone: '(213) 555-0678',
    address: '456 S. Main St, Los Angeles, CA 90013',
    notes: 'Industrial loft space. $3500/day. Parking for 20 vehicles.',
    tags: ['Interior', 'Loft Space'],
    isPrimary: false
  },
  {
    id: 'c13',
    name: 'Chris Martinez',
    role: 'Location Manager',
    department: 'LOCATIONS',
    company: 'FilmLA',
    email: 'cmartinez@filmla.com',
    phone: '(213) 555-0789',
    address: '6255 W Sunset Blvd, Los Angeles, CA 90028',
    notes: 'Primary permit contact. Responds within 24 hours.',
    tags: ['Permits', 'City Liaison'],
    isPrimary: true
  },
  {
    id: 'c14',
    name: 'Patricia Brown',
    role: 'Line Producer',
    department: 'PRODUCTION',
    company: 'Independent Production',
    email: 'pbrown@production.com',
    phone: '(310) 555-0890',
    address: '8765 Washington Blvd, Culver City, CA 90232',
    notes: 'Budget oversight and scheduling. Final approval on expenditures.',
    tags: ['Key Production', 'Budget Authority'],
    isPrimary: true
  },
  {
    id: 'c15',
    name: 'Daniel Brooks',
    role: 'Unit Production Manager',
    department: 'PRODUCTION',
    company: 'Independent Production',
    email: 'dbrooks@production.com',
    phone: '(310) 555-0901',
    address: '8765 Washington Blvd, Culver City, CA 90232',
    notes: 'Day-to-day operations. Primary contact for crew issues.',
    tags: ['UPM', 'Operations'],
    isPrimary: true
  },
  {
    id: 'c16',
    name: 'Sofia Rodriguez',
    role: 'Production Coordinator',
    department: 'PRODUCTION',
    company: 'Independent Production',
    email: 'srodriguez@production.com',
    phone: '(310) 555-1012',
    address: '8765 Washington Blvd, Culver City, CA 90232',
    notes: 'Call sheets, crew coordination. Available 24/7 during production.',
    tags: ['Coordinator', 'Call Sheets'],
    isPrimary: false
  },
  {
    id: 'c17',
    name: 'Mark Johnson',
    role: 'Executive Producer',
    department: 'STUDIO',
    company: 'Stellar Entertainment',
    email: 'mjohnson@stellar.com',
    phone: '(310) 555-1123',
    address: '10000 W. Washington Blvd, Culver City, CA 90232',
    notes: 'Final creative approval. Weekly progress meetings required.',
    tags: ['Executive', 'Creative Approval'],
    isPrimary: true
  },
  {
    id: 'c18',
    name: 'Jessica Lee',
    role: 'Studio Representative',
    department: 'STUDIO',
    company: 'Stellar Entertainment',
    email: 'jlee@stellar.com',
    phone: '(310) 555-1234',
    address: '10000 W. Washington Blvd, Culver City, CA 90232',
    notes: 'Business affairs and legal. Contract review and approvals.',
    tags: ['Business Affairs', 'Legal'],
    isPrimary: false
  },
  {
    id: 'c19',
    name: 'Alex Thompson',
    role: 'Wardrobe Supervisor',
    department: 'CREW',
    company: 'Costume House LA',
    email: 'athompson@costumehouse.com',
    phone: '(323) 555-1345',
    address: '2345 Pico Blvd, Los Angeles, CA 90006',
    notes: 'Fittings scheduled for lead actors. Budget approved for purchases.',
    tags: ['Wardrobe', 'Costume Department'],
    isPrimary: false
  },
  {
    id: 'c20',
    name: 'Nicole Davis',
    role: 'Makeup Department Head',
    department: 'CREW',
    company: 'Freelance',
    email: 'nicole.makeup@gmail.com',
    phone: '(818) 555-1456',
    address: '12345 Riverside Dr, Valley Village, CA 91607',
    notes: 'Special effects makeup certified. Kit fee $200/day.',
    tags: ['Makeup', 'SFX Certified'],
    isPrimary: false
  }
];

const DEPARTMENT_CONFIG: Record<Department, { label: string; color: string; icon: keyof typeof Icons }> = {
  CAST: { label: 'Cast', color: 'rgb(168, 85, 247)', icon: 'Star' },
  CREW: { label: 'Crew', color: 'rgb(59, 130, 246)', icon: 'Users' },
  VENDORS: { label: 'Vendors', color: 'rgb(251, 146, 60)', icon: 'Package' },
  LOCATIONS: { label: 'Locations', color: 'rgb(34, 197, 94)', icon: 'MapPin' },
  PRODUCTION: { label: 'Production', color: 'rgb(239, 68, 68)', icon: 'Briefcase' },
  STUDIO: { label: 'Studio', color: 'rgb(139, 92, 246)', icon: 'Building' },
  AGENCY: { label: 'Agency', color: 'rgb(236, 72, 153)', icon: 'User' }
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_DATA);
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isAddToCallSheetModalOpen, setIsAddToCallSheetModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // New contact form state
  const [newContactForm, setNewContactForm] = useState({
    name: '',
    role: '',
    department: 'CAST' as Department,
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    tags: '',
    isPrimary: false
  });

  const filteredContacts = contacts.filter(c => {
    if (departmentFilter !== 'ALL' && c.department !== departmentFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(query) ||
             c.role.toLowerCase().includes(query) ||
             c.company.toLowerCase().includes(query) ||
             c.email.toLowerCase().includes(query);
    }
    return true;
  });

  // Group contacts by department for better organization
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const dept = contact.department;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(contact);
    return acc;
  }, {} as Record<Department, Contact[]>);

  const stats = {
    total: contacts.length,
    cast: contacts.filter(c => c.department === 'CAST').length,
    crew: contacts.filter(c => c.department === 'CREW').length,
    vendors: contacts.filter(c => c.department === 'VENDORS').length,
    locations: contacts.filter(c => c.department === 'LOCATIONS').length,
    production: contacts.filter(c => c.department === 'PRODUCTION').length,
    studio: contacts.filter(c => c.department === 'STUDIO').length,
    agency: contacts.filter(c => c.department === 'AGENCY').length
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string, name: string) => {
    window.location.href = `mailto:${email}?subject=Production Contact - ${name}`;
  };

  const handleAddToCallSheet = (contact: Contact) => {
    setSelectedContact(contact);
    setIsAddToCallSheetModalOpen(true);
  };

  const confirmAddToCallSheet = () => {
    // In production, this would integrate with the call sheet system
    setIsAddToCallSheetModalOpen(false);
    setSelectedContact(null);
  };

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewDetailsModalOpen(true);
  };

  const handleAddContact = () => {
    setIsAddContactModalOpen(true);
  };

  const handleSaveNewContact = () => {
    const newContact: Contact = {
      id: `c${contacts.length + 1}`,
      name: newContactForm.name,
      role: newContactForm.role,
      department: newContactForm.department,
      company: newContactForm.company,
      email: newContactForm.email,
      phone: newContactForm.phone,
      address: newContactForm.address,
      notes: newContactForm.notes,
      tags: newContactForm.tags.split(',').map(t => t.trim()).filter(t => t),
      isPrimary: newContactForm.isPrimary
    };

    setContacts([...contacts, newContact]);
    setIsAddContactModalOpen(false);

    // Reset form
    setNewContactForm({
      name: '',
      role: '',
      department: 'CAST',
      company: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      tags: '',
      isPrimary: false
    });
  };

  const handleExportContacts = () => {
    // Convert contacts to CSV
    const headers = ['Name', 'Role', 'Department', 'Company', 'Email', 'Phone', 'Address', 'Notes', 'Tags', 'Primary'];
    const csvContent = [
      headers.join(','),
      ...contacts.map(contact => [
        `"${contact.name}"`,
        `"${contact.role}"`,
        contact.department,
        `"${contact.company}"`,
        contact.email,
        contact.phone,
        `"${contact.address}"`,
        `"${contact.notes}"`,
        `"${contact.tags.join('; ')}"`,
        contact.isPrimary ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
                style={{ backgroundColor: 'rgb(59, 130, 246)', color: 'white' }}
              >
                <Icons.Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Contact Directory</h1>
                <p className="text-sm text-[var(--text-secondary)]">Production contacts and information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-[var(--bg-2)] rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[var(--bg-1)] text-[var(--text-primary)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icons.Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[var(--bg-1)] text-[var(--text-primary)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icons.List className="w-4 h-4" />
                </button>
              </div>
              <Button variant="secondary" size="sm" onClick={handleExportContacts}>
                <Icons.Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddContact}>
                <Icons.Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Total</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: DEPARTMENT_CONFIG.CAST.color }}>{stats.cast}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Cast</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: DEPARTMENT_CONFIG.CREW.color }}>{stats.crew}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Crew</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: DEPARTMENT_CONFIG.VENDORS.color }}>{stats.vendors}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Vendors</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: DEPARTMENT_CONFIG.LOCATIONS.color }}>{stats.locations}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Locations</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: DEPARTMENT_CONFIG.PRODUCTION.color }}>{stats.production}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Production</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: DEPARTMENT_CONFIG.STUDIO.color }}>{stats.studio}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Studio</p>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            {(['ALL', 'CAST', 'CREW', 'VENDORS', 'LOCATIONS', 'PRODUCTION', 'STUDIO', 'AGENCY'] as const).map(dept => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  departmentFilter === dept
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {dept === 'ALL' ? 'All' : DEPARTMENT_CONFIG[dept].label}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Display */}
        {departmentFilter === 'ALL' ? (
          <div className="space-y-8">
            {(Object.entries(groupedContacts) as [Department, Contact[]][]).map(([dept, deptContacts]) => {
              const config = DEPARTMENT_CONFIG[dept];
              const DeptIcon = Icons[config.icon];

              return (
                <div key={dept}>
                  <div className="flex items-center gap-2 mb-4">
                    <DeptIcon className="w-5 h-5" style={{ color: config.color }} />
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">{config.label}</h2>
                    <span className="text-sm text-[var(--text-tertiary)]">({deptContacts.length})</span>
                  </div>
                  <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-3'
                  }>
                    {deptContacts.map((contact) => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        config={config}
                        viewMode={viewMode}
                        onCall={handleCall}
                        onEmail={handleEmail}
                        onAddToCallSheet={handleAddToCallSheet}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
          }>
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                config={DEPARTMENT_CONFIG[contact.department]}
                viewMode={viewMode}
                onCall={handleCall}
                onEmail={handleEmail}
                onAddToCallSheet={handleAddToCallSheet}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {filteredContacts.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No contacts found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Add contacts to build your production directory.
            </p>
            <Button variant="primary" size="sm" onClick={handleAddContact}>
              <Icons.Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </Card>
        )}
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        title="Add New Contact"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Name</label>
            <Input
              value={newContactForm.name}
              onChange={(e) => setNewContactForm({ ...newContactForm, name: e.target.value })}
              placeholder="Enter contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Role</label>
            <Input
              value={newContactForm.role}
              onChange={(e) => setNewContactForm({ ...newContactForm, role: e.target.value })}
              placeholder="Enter role"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Department</label>
            <select
              value={newContactForm.department}
              onChange={(e) => setNewContactForm({ ...newContactForm, department: e.target.value as Department })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="CAST">Cast</option>
              <option value="CREW">Crew</option>
              <option value="VENDORS">Vendors</option>
              <option value="LOCATIONS">Locations</option>
              <option value="PRODUCTION">Production</option>
              <option value="STUDIO">Studio</option>
              <option value="AGENCY">Agency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Company</label>
            <Input
              value={newContactForm.company}
              onChange={(e) => setNewContactForm({ ...newContactForm, company: e.target.value })}
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email</label>
            <Input
              type="email"
              value={newContactForm.email}
              onChange={(e) => setNewContactForm({ ...newContactForm, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Phone</label>
            <Input
              type="tel"
              value={newContactForm.phone}
              onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Address</label>
            <Input
              value={newContactForm.address}
              onChange={(e) => setNewContactForm({ ...newContactForm, address: e.target.value })}
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Notes</label>
            <Textarea
              value={newContactForm.notes}
              onChange={(e) => setNewContactForm({ ...newContactForm, notes: e.target.value })}
              placeholder="Enter notes"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Tags (comma-separated)</label>
            <Input
              value={newContactForm.tags}
              onChange={(e) => setNewContactForm({ ...newContactForm, tags: e.target.value })}
              placeholder="e.g. Lead, Available, Key Crew"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={newContactForm.isPrimary}
              onChange={(e) => setNewContactForm({ ...newContactForm, isPrimary: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
            />
            <label htmlFor="isPrimary" className="text-sm text-[var(--text-primary)]">
              Mark as primary contact
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddContactModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNewContact}
              className="flex-1"
              disabled={!newContactForm.name || !newContactForm.email}
            >
              Add Contact
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      {selectedContact && (
        <Modal
          isOpen={isViewDetailsModalOpen}
          onClose={() => {
            setIsViewDetailsModalOpen(false);
            setSelectedContact(null);
          }}
          title="Contact Details"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--border-default)]">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                style={{ backgroundColor: DEPARTMENT_CONFIG[selectedContact.department].color }}
              >
                {selectedContact.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedContact.name}</h3>
                  {selectedContact.isPrimary && (
                    <Icons.Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-[var(--text-secondary)]">{selectedContact.role}</p>
                <p className="text-sm text-[var(--text-tertiary)]">{selectedContact.company}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">Department</label>
                <p className="text-sm text-[var(--text-primary)]">
                  {DEPARTMENT_CONFIG[selectedContact.department].label}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">Email</label>
                <button
                  onClick={() => handleEmail(selectedContact.email, selectedContact.name)}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  {selectedContact.email}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">Phone</label>
                <button
                  onClick={() => handleCall(selectedContact.phone)}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  {selectedContact.phone}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">Address</label>
                <p className="text-sm text-[var(--text-primary)]">{selectedContact.address}</p>
              </div>

              {selectedContact.notes && (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">Notes</label>
                  <p className="text-sm text-[var(--text-primary)]">{selectedContact.notes}</p>
                </div>
              )}

              {selectedContact.tags && selectedContact.tags.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedContact.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-full text-xs bg-[var(--bg-2)] text-[var(--text-tertiary)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button
                variant="secondary"
                onClick={() => handleEmail(selectedContact.email, selectedContact.name)}
                className="flex-1"
              >
                <Icons.Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleCall(selectedContact.phone)}
                className="flex-1"
              >
                <Icons.MessageCircle className="w-4 h-4" />
                Call
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewDetailsModalOpen(false);
                  setIsAddToCallSheetModalOpen(true);
                }}
                className="flex-1"
              >
                <Icons.Plus className="w-4 h-4" />
                Add to Call Sheet
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add to Call Sheet Confirmation Modal */}
      {selectedContact && (
        <ConfirmModal
          isOpen={isAddToCallSheetModalOpen}
          onClose={() => {
            setIsAddToCallSheetModalOpen(false);
            setSelectedContact(null);
          }}
          onConfirm={confirmAddToCallSheet}
          title="Add to Call Sheet"
          message={`Add ${selectedContact.name} to the call sheet? This will integrate with the call sheet system.`}
          variant="default"
        />
      )}
    </div>
  );
}

interface ContactCardProps {
  contact: Contact;
  config: { label: string; color: string; icon: keyof typeof Icons };
  viewMode: 'grid' | 'list';
  onCall: (phone: string) => void;
  onEmail: (email: string, name: string) => void;
  onAddToCallSheet: (contact: Contact) => void;
  onViewDetails: (contact: Contact) => void;
}

function ContactCard({ contact, config, viewMode, onCall, onEmail, onAddToCallSheet, onViewDetails }: ContactCardProps) {
  const initials = contact.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (viewMode === 'list') {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ backgroundColor: config.color }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[var(--text-primary)] truncate">{contact.name}</h3>
                {contact.isPrimary && (
                  <Icons.Star className="w-3.5 h-3.5 text-yellow-500 fill-current flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{contact.role}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{contact.company}</p>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onEmail(contact.email, contact.name)}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
              >
                <Icons.Mail className="w-4 h-4" />
                <span className="truncate">{contact.email}</span>
              </button>
              <button
                onClick={() => onCall(contact.phone)}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
              >
                <Icons.MessageCircle className="w-4 h-4" />
                <span>{contact.phone}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => onViewDetails(contact)}>
                <Icons.Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onAddToCallSheet(contact)}>
                <Icons.Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: config.color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[var(--text-primary)] truncate">{contact.name}</h3>
            {contact.isPrimary && (
              <Icons.Star className="w-3.5 h-3.5 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-1">{contact.role}</p>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">{contact.company}</p>

          <div className="space-y-2 mb-3">
            <button
              onClick={() => onEmail(contact.email, contact.name)}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors w-full"
            >
              <Icons.Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{contact.email}</span>
            </button>
            <button
              onClick={() => onCall(contact.phone)}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              <Icons.MessageCircle className="w-4 h-4" />
              <span>{contact.phone}</span>
            </button>
          </div>

          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {contact.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-xs bg-[var(--bg-2)] text-[var(--text-tertiary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {contact.notes && (
            <p className="text-xs text-[var(--text-tertiary)] italic mb-3 line-clamp-2">
              {contact.notes}
            </p>
          )}

          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(contact)} className="flex-1">
              <Icons.Eye className="w-4 h-4" />
              View
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onAddToCallSheet(contact)} className="flex-1">
              <Icons.Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
