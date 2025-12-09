"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import ComprehensiveIntake from "./components/ComprehensiveIntake";
import GlobalNav from "./components/GlobalNav";
import GlobalDashboard from "./components/GlobalDashboard";

export default function App() {
  const [projects, setProjects] = useState<Array<Schema["Project"]["type"]>>([]);
  const [showIntakeWizard, setShowIntakeWizard] = useState(false);
  const [client] = useState(() => generateClient<Schema>());

  function listProjects() {
    try {
      client.models.Project.observeQuery().subscribe({
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
    } catch (error) {
      console.error('Error setting up project subscription:', error);
      setProjects([]);
    }
  }

  useEffect(() => {
    listProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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