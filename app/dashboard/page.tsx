"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";
import type { Schema } from "@/amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import ComprehensiveIntake from "../components/ComprehensiveIntake";
import GlobalNav from "../components/GlobalNav";
import GlobalDashboard from "../components/GlobalDashboard";
import AuthWrapper from "../components/AuthWrapper";

// Hydration-safe wrapper that only renders on client
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--bg-0)]">
        <div className="sticky top-0 z-50 h-14 bg-[var(--bg-1)] border-b border-[var(--border-default)]" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-[var(--text-tertiary)]">Loading...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Array<Schema["Project"]["type"]>>([]);
  const [showIntakeWizard, setShowIntakeWizard] = useState(false);
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isCheckingOrg, setIsCheckingOrg] = useState(true);

  useEffect(() => {
    // Use userPool auth for authenticated operations
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);

  useEffect(() => {
    async function fetchOrganization() {
      if (!isAuthenticated || !client) return;

      setIsCheckingOrg(true);
      try {
        const attributes = await fetchUserAttributes();
        const email = attributes.email || '';

        const { data: memberships } = await client.models.OrganizationMember.list({
          filter: { email: { eq: email } }
        });

        if (memberships && memberships.length > 0) {
          setOrganizationId(memberships[0].organizationId);
          setIsCheckingOrg(false);
        } else {
          // Check if any organization exists
          const { data: orgs } = await client.models.Organization.list();
          if (orgs && orgs.length > 0) {
            setOrganizationId(orgs[0].id);
            setIsCheckingOrg(false);
          } else {
            // No organization found - redirect to onboarding
            console.log('No organization found, redirecting to onboarding...');
            router.replace('/onboarding');
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching organization:', err);
        // On error, still allow dashboard to load (might be a temporary issue)
        setIsCheckingOrg(false);
      }
    }

    fetchOrganization();
  }, [client, isAuthenticated, router]);

  const listProjects = useCallback(async () => {
    if (!isAuthenticated || !organizationId || !client) return;

    try {
      const { data, errors } = await client.models.Project.list({
        filter: { organizationId: { eq: organizationId } }
      });

      if (errors) {
        console.error('Error fetching projects:', errors);
        setProjects([]);
      } else if (data) {
        setProjects([...data]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  }, [client, isAuthenticated, organizationId]);

  useEffect(() => {
    listProjects();
  }, [listProjects]);

  function openIntakeWizard() {
    setShowIntakeWizard(true);
  }

  function closeIntakeWizard() {
    setShowIntakeWizard(false);
  }

  function handleIntakeComplete() {
    setShowIntakeWizard(false);
    listProjects();
  }

  return (
    <ClientOnly>
      <AuthWrapper>
        {({ signOut, user }: { signOut: (() => void) | undefined; user: any }) => (
          <AuthenticatedApp
            user={user}
            signOut={signOut}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
            isCheckingOrg={isCheckingOrg}
            projects={projects}
            showIntakeWizard={showIntakeWizard}
            openIntakeWizard={openIntakeWizard}
            handleIntakeComplete={handleIntakeComplete}
            closeIntakeWizard={closeIntakeWizard}
            onRefreshProjects={listProjects}
            organizationId={organizationId}
          />
        )}
      </AuthWrapper>
    </ClientOnly>
  );
}

function AuthenticatedApp({
  user,
  signOut,
  isAuthenticated,
  setIsAuthenticated,
  isCheckingOrg,
  projects,
  showIntakeWizard,
  openIntakeWizard,
  handleIntakeComplete,
  closeIntakeWizard,
  onRefreshProjects,
  organizationId,
}: {
  user: any;
  signOut: (() => void) | undefined;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isCheckingOrg: boolean;
  projects: any[];
  showIntakeWizard: boolean;
  openIntakeWizard: () => void;
  handleIntakeComplete: () => void;
  closeIntakeWizard: () => void;
  onRefreshProjects: () => void;
  organizationId: string | null;
}) {
  useEffect(() => {
    if (user && !isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, [user, isAuthenticated, setIsAuthenticated]);

  if (isCheckingOrg) {
    return (
      <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      <GlobalNav
        userEmail={user?.signInDetails?.loginId}
        onSignOut={signOut}
      />
      <GlobalDashboard
        projects={projects}
        onCreateProject={openIntakeWizard}
        onRefreshProjects={onRefreshProjects}
        organizationId={organizationId || undefined}
        userEmail={user?.signInDetails?.loginId}
      />
      {showIntakeWizard && (
        <ComprehensiveIntake
          onComplete={handleIntakeComplete}
          onCancel={closeIntakeWizard}
        />
      )}
    </div>
  );
}
