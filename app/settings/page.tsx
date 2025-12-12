import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Settings | SyncOps',
  description: 'Manage your settings',
};

export default function SettingsPage() {
  // Redirect to organization settings as the default settings page
  redirect('/settings/organization');
}
