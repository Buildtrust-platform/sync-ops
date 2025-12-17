'use client';

import { useRouter } from 'next/navigation';
import { Icons } from '../components/ui';

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="bg-[var(--bg-1)] border-b border-[var(--border-default)]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Help & Support</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Find answers, learn best practices, and get support for SyncOps.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full pl-12 pr-4 py-3 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Help Sections */}
        <div className="space-y-6 mb-12">
          {/* Getting Started */}
          <div className="bg-[var(--bg-1)] border border-[var(--border-default)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                <Icons.Zap className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Getting Started</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors group">
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Create your first project
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Learn how to set up a new production project</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors group">
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Invite team members
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Add collaborators to your organization</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors group">
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Upload assets
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Import media files and documents</p>
              </button>
            </div>
          </div>

          {/* Project Management */}
          <div className="bg-[var(--bg-1)] border border-[var(--border-default)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                <Icons.Folder className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Project Management</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors group">
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Track production stages
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Monitor progress through the production lifecycle</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors group">
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Manage tasks
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Create and assign tasks to team members</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors group">
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Budget tracking
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Monitor spending across budget categories</p>
              </button>
            </div>
          </div>

          {/* Asset Management */}
          <div className="bg-[var(--bg-1)] border border-[var(--border-default)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                <Icons.Video className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Asset Management</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors group">
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Version control
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Track changes and revisions to assets</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors group">
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Review & approval
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Streamline feedback and approval workflows</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors group">
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  Archive & delivery
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Prepare assets for distribution</p>
              </button>
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Need more help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="mailto:support@syncops.app"
              className="bg-[var(--bg-1)] border border-[var(--border-default)] rounded-xl p-5 hover:border-[var(--primary)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center mb-3 group-hover:bg-[var(--primary)]/10">
                <Icons.Mail className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--primary)]" />
              </div>
              <h3 className="font-medium text-[var(--text-primary)]">Email Support</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">Get help via email</p>
              <span className="text-sm text-[var(--primary)]">support@syncops.app</span>
            </a>

            <a
              href="#"
              className="bg-[var(--bg-1)] border border-[var(--border-default)] rounded-xl p-5 hover:border-[var(--primary)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center mb-3 group-hover:bg-[var(--primary)]/10">
                <Icons.MessageCircle className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--primary)]" />
              </div>
              <h3 className="font-medium text-[var(--text-primary)]">Community</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">Join discussions</p>
              <span className="text-sm text-[var(--primary)]">Visit Forum</span>
            </a>

            <a
              href="#"
              className="bg-[var(--bg-1)] border border-[var(--border-default)] rounded-xl p-5 hover:border-[var(--primary)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center mb-3 group-hover:bg-[var(--primary)]/10">
                <Icons.FileText className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--primary)]" />
              </div>
              <h3 className="font-medium text-[var(--text-primary)]">Documentation</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">Read the docs</p>
              <span className="text-sm text-[var(--primary)]">View Docs</span>
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Frequently Asked Questions
          </h2>
          <div className="bg-[var(--bg-1)] border border-[var(--border-default)] rounded-xl divide-y divide-[var(--border-subtle)]">
            <div className="p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-1">How do I invite team members?</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Go to Settings → Organization → Team Members and click &quot;Invite Member&quot; to send an invitation.
              </p>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-1">Can I export my project data?</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Yes, navigate to Reports and use the Export feature to download your data in various formats.
              </p>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-1">How do I change my organization settings?</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Visit Settings → Organization to update your organization name, logo, and other details.
              </p>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-1">What file types are supported?</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                SyncOps supports most common media formats including MP4, MOV, JPG, PNG, PDF, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
