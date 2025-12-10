import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SyncOps - Creative Operations, Handled',
  description: 'The operating system for production, post, and distribution. One place for briefs, assets, approvals, versions, rights, and delivery.',
  openGraph: {
    title: 'SyncOps - Creative Operations, Handled',
    description: 'The operating system for production, post, and distribution.',
    type: 'website',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
