import AdminDashboard from '@/app/components/AdminDashboard';

export const metadata = {
  title: 'Admin Dashboard | SyncOps',
  description: 'Organization admin dashboard for managing projects, team, and resources.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
