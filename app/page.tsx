"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import Link from "next/link";
import SmartBrief from "./components/SmartBrief";

const client = generateClient<Schema>();

export default function App() {
  const [projects, setProjects] = useState<Array<Schema["Project"]["type"]>>([]);
  const [showSmartBrief, setShowSmartBrief] = useState(false);

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
  }, []);

  function openSmartBrief() {
    setShowSmartBrief(true);
  }

  function closeSmartBrief() {
    setShowSmartBrief(false);
  }

  function handleBriefComplete() {
    setShowSmartBrief(false);
    listProjects(); // Refresh the project list
  }

  return (
    // 2. WRAP THE APP IN AUTHENTICATOR
    <Authenticator>
      {({ signOut, user }) => (
        <main className="min-h-screen bg-slate-900 text-white p-10 font-sans">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-teal-400">SyncOps</h1>
              <p className="text-slate-400 mt-1">Enterprise Media Operating System</p>
              <p className="text-xs text-slate-500 mt-1">User: {user?.signInDetails?.loginId}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={openSmartBrief}
                className="bg-teal-500 hover:bg-teal-600 text-black font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-teal-500/20 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Smart Brief
              </button>
              <button
                onClick={signOut}
                className="bg-slate-700 hover:bg-red-500 hover:text-white text-slate-300 font-bold py-3 px-6 rounded-lg transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* PROJECT GRID */}
          {!projects || projects.length === 0 ? (
            <div className="text-center py-24 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700">
              <p className="text-2xl text-slate-500 font-medium">System Idle.</p>
              <p className="text-slate-400 mt-2">Create a project to initialize the supply chain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-teal-500/50 transition-all shadow-xl cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-slate-900 text-xs font-mono py-1 px-3 rounded-full text-teal-200 border border-teal-900">
                        {project.status}
                      </span>
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{project.department}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-white">{project.name}</h2>
                    <div className="text-sm text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      Deadline: {project.deadline || 'N/A'}
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full w-[10%]"></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Smart Brief Modal */}
          {showSmartBrief && (
            <SmartBrief
              onComplete={handleBriefComplete}
              onCancel={closeSmartBrief}
            />
          )}
        </main>
      )}
    </Authenticator>
  );
}