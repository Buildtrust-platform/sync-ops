"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";
import type { Schema } from "@/amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import ComprehensiveIntake from "./components/ComprehensiveIntake";
import GlobalNav from "./components/GlobalNav";
import GlobalDashboard from "./components/GlobalDashboard";

// Hydration-safe wrapper that only renders on client
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same structure to minimize layout shift
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

export default function App() {
  const router = useRouter();
  const [projects, setProjects] = useState<Array<Schema["Project"]["type"]>>([]);
  const [showIntakeWizard, setShowIntakeWizard] = useState(false);
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isCheckingOrg, setIsCheckingOrg] = useState(true);

  // Initialize Amplify client after mount to avoid SSR issues
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Fetch user's organization when authenticated
  useEffect(() => {
    async function fetchOrganization() {
      if (!isAuthenticated || !client) return;

      setIsCheckingOrg(true);
      try {
        const attributes = await fetchUserAttributes();
        const email = attributes.email || '';

        // Find user's organization membership
        const { data: memberships } = await client.models.OrganizationMember.list({
          filter: { email: { eq: email } }
        });

        if (memberships && memberships.length > 0) {
          setOrganizationId(memberships[0].organizationId);
          setIsCheckingOrg(false);
        } else {
          // Try to get existing organization (for legacy data)
          const { data: orgs } = await client.models.Organization.list();
          if (orgs && orgs.length > 0) {
            setOrganizationId(orgs[0].id);
            setIsCheckingOrg(false);
          } else {
            // No organization exists - redirect to onboarding flow
            // This replaces the auto-creation with proper onboarding
            router.push('/onboarding');
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching organization:', err);
        setIsCheckingOrg(false);
      }
    }

    fetchOrganization();
  }, [client, isAuthenticated, router]);

  // Fetch projects for the organization with real-time updates
  const listProjects = useCallback(() => {
    if (!isAuthenticated || !organizationId || !client) return;

    try {
      const subscription = client.models.Project.observeQuery({
        filter: { organizationId: { eq: organizationId } }
      }).subscribe({
        next: (data) => {
          if (data?.items) {
            setProjects([...data.items]);
          }
        },
        error: (error) => {
          console.error('Error fetching projects:', error);
          setProjects([]);
        },
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error setting up project subscription:', error);
      setProjects([]);
    }
  }, [client, isAuthenticated, organizationId]);

  useEffect(() => {
    const cleanup = listProjects();
    return () => {
      if (cleanup) cleanup();
    };
  }, [listProjects]);

  function openIntakeWizard() {
    setShowIntakeWizard(true);
  }

  function closeIntakeWizard() {
    setShowIntakeWizard(false);
  }

  function handleIntakeComplete() {
    setShowIntakeWizard(false);
    listProjects(); // Refresh the project list
  }

  return (
    // Wrap in ClientOnly to prevent hydration mismatch from Authenticator
    <ClientOnly>
      <Authenticator>
        {({ signOut, user }) => (
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
          />
        )}
      </Authenticator>
    </ClientOnly>
  );
}

// Separate component to handle auth state updates via useEffect
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
}) {
  // Set authenticated state when user is available (in useEffect, not during render)
  useEffect(() => {
    if (user && !isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, [user, isAuthenticated, setIsAuthenticated]);

  // Show loading while checking for organization
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
      {/* GLOBAL NAVIGATION */}
      <GlobalNav
        userEmail={user?.signInDetails?.loginId}
        onSignOut={signOut}
      />

      {/* GLOBAL DASHBOARD */}
      <GlobalDashboard
        projects={projects}
        onCreateProject={openIntakeWizard}
      />

      {/* Comprehensive Intake Wizard */}
      {showIntakeWizard && (
        <ComprehensiveIntake
          onComplete={handleIntakeComplete}
          onCancel={closeIntakeWizard}
        />
      )}
    </div>
  );
}