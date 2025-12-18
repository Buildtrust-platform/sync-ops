'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * CONTACTS PAGE
 * Contact directory for all project stakeholders.
 */

type ContactCategory = 'CREW' | 'TALENT' | 'VENDOR' | 'CLIENT' | 'LOCATION' | 'OTHER';

interface Contact {
  id: string;
  name: string;
  role: string;
  category: ContactCategory;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  isPrimary: boolean;
  imageInitial: string;
}

// Data will be fetched from API
const initialContacts: Contact[] = [];

const CATEGORY_CONFIG: Record<ContactCategory, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  CREW: { label: 'Crew', color: 'var(--phase-production)', bgColor: 'var(--phase-production)', icon: 'Users' },
  TALENT: { label: 'Talent', color: 'var(--warning)', bgColor: 'var(--warning)', icon: 'Star' },
  VENDOR: { label: 'Vendor', color: 'var(--accent)', bgColor: 'var(--accent)', icon: 'Package' },
  CLIENT: { label: 'Client', color: 'var(--success)', bgColor: 'var(--success)', icon: 'Briefcase' },
  LOCATION: { label: 'Location', color: 'var(--primary)', bgColor: 'var(--primary)', icon: 'MapPin' },
  OTHER: { label: 'Other', color: 'var(--text-tertiary)', bgColor: 'var(--text-tertiary)', icon: 'User' },
};

export default function ContactsPage() {
  const [contacts] = useState<Contact[]>(initialContacts);
  const [categoryFilter, setCategoryFilter] = useState<ContactCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(c => {
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(query) ||
             c.role.toLowerCase().includes(query) ||
             c.email.toLowerCase().includes(query) ||
             (c.company && c.company.toLowerCase().includes(query));
    }
    return true;
  });

  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const category = contact.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(contact);
    return acc;
  }, {} as Record<ContactCategory, Contact[]>);

  const stats = {
    total: contacts.length,
    crew: contacts.filter(c => c.category === 'CREW').length,
    talent: contacts.filter(c => c.category === 'TALENT').length,
    vendors: contacts.filter(c => c.category === 'VENDOR').length,
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
                <Icons.Book className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Contact Directory</h1>
                <p className="text-sm text-[var(--text-secondary)]">All project contacts in one place</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Contact
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
              <p className="text-xs text-[var(--text-tertiary)]">Total Contacts</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--phase-production)]">{stats.crew}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Crew</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.talent}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Talent</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">{stats.vendors}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Vendors</p>
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
            {(['ALL', 'CREW', 'TALENT', 'VENDOR', 'CLIENT', 'LOCATION'] as const).map(category => (
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
        </div>

        {/* Grouped Contact Lists */}
        {categoryFilter === 'ALL' ? (
          <div className="space-y-8">
            {(Object.entries(groupedContacts) as [ContactCategory, Contact[]][]).map(([category, categoryContacts]) => {
              const config = CATEGORY_CONFIG[category];
              const CategoryIcon = Icons[config.icon];

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <CategoryIcon className="w-5 h-5" style={{ color: config.color }} />
                    <h2 className="font-semibold text-[var(--text-primary)]">{config.label}</h2>
                    <span className="text-sm text-[var(--text-tertiary)]">({categoryContacts.length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryContacts.map((contact) => (
                      <ContactCard key={contact.id} contact={contact} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}

        {filteredContacts.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Book className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No contacts found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Add contacts to build your project directory.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  const config = CATEGORY_CONFIG[contact.category];

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: config.bgColor }}
        >
          {contact.imageInitial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--text-primary)] truncate">{contact.name}</h3>
            {contact.isPrimary && (
              <Icons.Star className="w-3.5 h-3.5 text-[var(--warning)] fill-current flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">{contact.role}</p>
          {contact.company && (
            <p className="text-xs text-[var(--text-tertiary)]">{contact.company}</p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-2">
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
        >
          <Icons.Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
          <span className="truncate">{contact.email}</span>
        </a>
        <a
          href={`tel:${contact.phone}`}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
        >
          <Icons.MessageCircle className="w-4 h-4 text-[var(--text-tertiary)]" />
          <span>{contact.phone}</span>
        </a>
      </div>

      {contact.notes && (
        <p className="mt-3 text-xs text-[var(--text-tertiary)] italic">{contact.notes}</p>
      )}
    </Card>
  );
}
