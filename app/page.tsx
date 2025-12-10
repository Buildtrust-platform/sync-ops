"use client";

import { useState, useEffect, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";
import type { Schema } from "@/amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import ComprehensiveIntake from "./components/ComprehensiveIntake";
import GlobalNav from "./components/GlobalNav";
import GlobalDashboard from "./components/GlobalDashboard";

export default function App() {
  const [projects, setProjects] = useState<Array<Schema["Project"]["type"]>>([]);
  const [showIntakeWizard, setShowIntakeWizard] = useState(false);
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Initialize Amplify client after mount to avoid SSR issues
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Fetch user's organization when authenticated
  useEffect(() => {
    async function fetchOrganization() {
      if (!isAuthenticated || !client) return;

      try {
        const attributes = await fetchUserAttributes();
        const email = attributes.email || '';
        const userId = attributes.sub || '';

        // Find user's organization membership
        const { data: memberships } = await client.models.OrganizationMember.list({
          filter: { email: { eq: email } }
        });

        if (memberships && memberships.length > 0) {
          setOrganizationId(memberships[0].organizationId);
        } else {
          // Try to get existing organization
          const { data: orgs } = await client.models.Organization.list();
          if (orgs && orgs.length > 0) {
            setOrganizationId(orgs[0].id);
          } else {
            // Create a default organization
            const { data: newOrg } = await client.models.Organization.create({
              name: 'My Organization',
              slug: `org-${Date.now()}`,
              email: email,
              subscriptionTier: 'FREE',
              subscriptionStatus: 'TRIALING',
              createdBy: userId,
            });
            if (newOrg) {
              setOrganizationId(newOrg.id);
              await client.models.OrganizationMember.create({
                organizationId: newOrg.id,
                userId: userId,
                email: email,
                role: 'OWNER',
                status: 'ACTIVE',
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching organization:', err);
      }
    }

    fetchOrganization();
  }, [client, isAuthenticated]);

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
    // 2. WRAP THE APP IN AUTHENTICATOR
    <Authenticator>
      {({ signOut, user }) => {
        // Set authenticated state when user is available
        if (user && !isAuthenticated) {
          setIsAuthenticated(true);
        }

        return (
          <div className="min-h-screen bg-gray-50">
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
      }}
    </Authenticator>
  );
}