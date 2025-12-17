"use client";

import { useState, useEffect } from "react";
import { getUrl } from "aws-amplify/storage";

/**
 * BRANDED HEADER - Client Screening Room Header
 * Displays organization branding for external review pages
 */

interface BrandedHeaderProps {
  organizationName: string;
  logoKey?: string | null;
  primaryColor?: string | null;
  backgroundColor?: string | null;
  welcomeMessage?: string | null;
  showPoweredBy?: boolean;
}

export default function BrandedHeader({
  organizationName,
  logoKey,
  primaryColor = "#14B8A6", // Default teal
  backgroundColor = "#0A0A0A", // Default dark
  welcomeMessage,
  showPoweredBy = true,
}: BrandedHeaderProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Load logo URL if provided
  useEffect(() => {
    async function loadLogo() {
      if (!logoKey) {
        setLogoUrl(null);
        return;
      }
      try {
        const { url } = await getUrl({
          path: logoKey,
          options: { expiresIn: 3600 },
        });
        setLogoUrl(url.toString());
      } catch (err) {
        console.error("Error loading logo:", err);
        setLogoUrl(null);
      }
    }
    loadLogo();
  }, [logoKey]);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: backgroundColor || "#0A0A0A",
        borderBottom: `1px solid ${primaryColor}33`, // Primary color with 20% opacity
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Organization Name */}
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={organizationName}
                className="h-10 w-auto object-contain"
                style={{ maxWidth: "180px" }}
              />
            ) : (
              <div
                className="flex items-center justify-center h-10 px-4 rounded-lg font-bold text-lg"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor || "#14B8A6",
                }}
              >
                {organizationName?.charAt(0) || "S"}
              </div>
            )}
            <div>
              <h1
                className="font-bold text-lg"
                style={{ color: "#FFFFFF" }}
              >
                {organizationName}
              </h1>
              {welcomeMessage && (
                <p className="text-sm text-gray-400 mt-0.5 max-w-md truncate">
                  {welcomeMessage}
                </p>
              )}
            </div>
          </div>

          {/* Powered By Badge (optional) */}
          {showPoweredBy && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Powered by</span>
              <span
                className="font-semibold"
                style={{ color: primaryColor || "#14B8A6" }}
              >
                SyncOps
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
