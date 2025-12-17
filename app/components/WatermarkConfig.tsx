"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * WATERMARK CONFIGURATION - Forensic watermarking settings
 * Configures watermark templates for different viewing contexts
 */

interface WatermarkSettings {
  enabled: boolean;
  text: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "diagonal";
  opacity: number;
  fontSize: number;
  includeViewerEmail: boolean;
  includeTimestamp: boolean;
  includeIpAddress: boolean;
  includeAssetId: boolean;
  fontColor: string;
  backgroundColor: string;
}

interface WatermarkConfigProps {
  organizationId: string;
  projectId?: string;
  assetId?: string;
  initialSettings?: Partial<WatermarkSettings>;
  onChange?: (settings: WatermarkSettings) => void;
  previewMode?: boolean;
  viewerEmail?: string;
}

// Icons
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const defaultSettings: WatermarkSettings = {
  enabled: true,
  text: "",
  position: "bottom-right",
  opacity: 0.5,
  fontSize: 14,
  includeViewerEmail: true,
  includeTimestamp: true,
  includeIpAddress: false,
  includeAssetId: false,
  fontColor: "#FFFFFF",
  backgroundColor: "transparent",
};

const positionOptions = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "center", label: "Center" },
  { value: "diagonal", label: "Diagonal (Full)" },
];

export default function WatermarkConfig({
  organizationId,
  projectId,
  assetId,
  initialSettings,
  onChange,
  previewMode = false,
  viewerEmail = "viewer@example.com",
}: WatermarkConfigProps) {
  const [settings, setSettings] = useState<WatermarkSettings>({
    ...defaultSettings,
    ...initialSettings,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Update parent when settings change
  useEffect(() => {
    onChange?.(settings);
  }, [settings, onChange]);

  // Generate preview text
  const generateWatermarkText = (): string => {
    const parts: string[] = [];

    if (settings.text) {
      parts.push(settings.text);
    }

    if (settings.includeViewerEmail) {
      parts.push(viewerEmail);
    }

    if (settings.includeTimestamp) {
      parts.push(new Date().toISOString().slice(0, 19).replace("T", " "));
    }

    if (settings.includeIpAddress) {
      parts.push("IP: xxx.xxx.xxx.xxx"); // Placeholder for preview
    }

    if (settings.includeAssetId && assetId) {
      parts.push(`Asset: ${assetId.slice(0, 8)}...`);
    }

    return parts.join(" | ") || "Confidential";
  };

  // Get CSS position styles
  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      padding: "8px 12px",
      fontSize: `${settings.fontSize}px`,
      color: settings.fontColor,
      opacity: settings.opacity,
      backgroundColor: settings.backgroundColor === "transparent" ? undefined : settings.backgroundColor,
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      userSelect: "none",
      pointerEvents: "none",
    };

    switch (settings.position) {
      case "top-left":
        return { ...base, top: 20, left: 20 };
      case "top-right":
        return { ...base, top: 20, right: 20 };
      case "bottom-left":
        return { ...base, bottom: 20, left: 20 };
      case "bottom-right":
        return { ...base, bottom: 20, right: 20 };
      case "center":
        return {
          ...base,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: `${settings.fontSize * 1.5}px`,
        };
      case "diagonal":
        return {
          ...base,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          fontSize: `${settings.fontSize * 2}px`,
          whiteSpace: "nowrap",
          textAlign: "center",
          width: "150%",
        };
      default:
        return { ...base, bottom: 20, right: 20 };
    }
  };

  // Handle settings change
  const updateSetting = <K extends keyof WatermarkSettings>(
    key: K,
    value: WatermarkSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Save settings (would typically save to database)
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // In a real implementation, save to WatermarkPolicy model
      // const client = generateClient<Schema>({ authMode: "userPool" });
      // await client.models.WatermarkPolicy.create({ ... });

      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSaveMessage("Watermark settings saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error("Error saving watermark settings:", err);
      setSaveMessage("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
          >
            <ShieldIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Forensic Watermarking
            </h3>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Protect your content with unique viewer watermarks
            </p>
          </div>
        </div>
        <button
          onClick={() => updateSetting("enabled", !settings.enabled)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
          style={{
            background: settings.enabled ? "var(--success)" : "var(--bg-2)",
            color: settings.enabled ? "white" : "var(--text-secondary)",
          }}
        >
          {settings.enabled ? <EyeIcon /> : <EyeOffIcon />}
          {settings.enabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Preview */}
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              height: "200px",
              border: "1px solid var(--border)",
            }}
          >
            {/* Simulated video content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-600 text-sm">Video Preview Area</p>
            </div>

            {/* Watermark overlay */}
            <div style={getPositionStyles()}>
              {generateWatermarkText()}
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Custom Text */}
            <div>
              <label
                className="block text-xs font-bold uppercase mb-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                Custom Text (Optional)
              </label>
              <input
                type="text"
                value={settings.text}
                onChange={(e) => updateSetting("text", e.target.value)}
                placeholder="e.g., CONFIDENTIAL"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Position */}
            <div>
              <label
                className="block text-xs font-bold uppercase mb-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                Position
              </label>
              <select
                value={settings.position}
                onChange={(e) => updateSetting("position", e.target.value as WatermarkSettings["position"])}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                {positionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Opacity */}
            <div>
              <label
                className="block text-xs font-bold uppercase mb-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                Opacity: {Math.round(settings.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.opacity}
                onChange={(e) => updateSetting("opacity", parseFloat(e.target.value))}
                className="w-full"
                style={{ accentColor: "var(--primary)" }}
              />
            </div>

            {/* Font Size */}
            <div>
              <label
                className="block text-xs font-bold uppercase mb-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="32"
                step="2"
                value={settings.fontSize}
                onChange={(e) => updateSetting("fontSize", parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor: "var(--primary)" }}
              />
            </div>

            {/* Font Color */}
            <div>
              <label
                className="block text-xs font-bold uppercase mb-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                Font Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.fontColor}
                  onChange={(e) => updateSetting("fontColor", e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.fontColor}
                  onChange={(e) => updateSetting("fontColor", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label
                className="block text-xs font-bold uppercase mb-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                Background
              </label>
              <div className="flex gap-2">
                <select
                  value={settings.backgroundColor === "transparent" ? "transparent" : "custom"}
                  onChange={(e) =>
                    updateSetting(
                      "backgroundColor",
                      e.target.value === "transparent" ? "transparent" : "#000000"
                    )
                  }
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="transparent">Transparent</option>
                  <option value="custom">Custom Color</option>
                </select>
                {settings.backgroundColor !== "transparent" && (
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Include Options */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <h4
              className="text-sm font-bold uppercase mb-4"
              style={{ color: "var(--text-tertiary)" }}
            >
              Dynamic Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "includeViewerEmail" as const, label: "Viewer Email", desc: "Unique to each viewer" },
                { key: "includeTimestamp" as const, label: "Timestamp", desc: "Date and time viewed" },
                { key: "includeIpAddress" as const, label: "IP Address", desc: "Viewer's network location" },
                { key: "includeAssetId" as const, label: "Asset ID", desc: "Reference identifier" },
              ].map((option) => (
                <label
                  key={option.key}
                  className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-[var(--bg-2)]"
                >
                  <input
                    type="checkbox"
                    checked={settings[option.key]}
                    onChange={(e) => updateSetting(option.key, e.target.checked)}
                    className="mt-0.5"
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                      {option.label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {option.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          {!previewMode && (
            <div className="flex items-center justify-between">
              {saveMessage && (
                <p
                  className="text-sm"
                  style={{
                    color: saveMessage.includes("success")
                      ? "var(--success)"
                      : "var(--error)",
                  }}
                >
                  {saveMessage}
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="ml-auto px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: "var(--primary)", color: "white" }}
              >
                {isSaving ? "Saving..." : "Save Watermark Settings"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Watermark overlay component for use in video players
export function WatermarkOverlay({
  settings,
  viewerEmail = "",
  ipAddress = "",
  assetId = "",
}: {
  settings: WatermarkSettings;
  viewerEmail?: string;
  ipAddress?: string;
  assetId?: string;
}) {
  if (!settings.enabled) return null;

  // Generate watermark text
  const generateText = (): string => {
    const parts: string[] = [];

    if (settings.text) {
      parts.push(settings.text);
    }

    if (settings.includeViewerEmail && viewerEmail) {
      parts.push(viewerEmail);
    }

    if (settings.includeTimestamp) {
      parts.push(new Date().toISOString().slice(0, 19).replace("T", " "));
    }

    if (settings.includeIpAddress && ipAddress) {
      parts.push(`IP: ${ipAddress}`);
    }

    if (settings.includeAssetId && assetId) {
      parts.push(`ID: ${assetId.slice(0, 8)}`);
    }

    return parts.join(" | ") || "Confidential";
  };

  // Get CSS position styles
  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      padding: "4px 8px",
      fontSize: `${settings.fontSize}px`,
      color: settings.fontColor,
      opacity: settings.opacity,
      backgroundColor: settings.backgroundColor === "transparent" ? undefined : settings.backgroundColor,
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      userSelect: "none",
      pointerEvents: "none",
      zIndex: 100,
    };

    switch (settings.position) {
      case "top-left":
        return { ...base, top: 12, left: 12 };
      case "top-right":
        return { ...base, top: 12, right: 12 };
      case "bottom-left":
        return { ...base, bottom: 12, left: 12 };
      case "bottom-right":
        return { ...base, bottom: 12, right: 12 };
      case "center":
        return {
          ...base,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: `${settings.fontSize * 1.5}px`,
        };
      case "diagonal":
        return {
          ...base,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          fontSize: `${settings.fontSize * 2}px`,
          whiteSpace: "nowrap",
          textAlign: "center",
          width: "150%",
        };
      default:
        return { ...base, bottom: 12, right: 12 };
    }
  };

  return <div style={getPositionStyles()}>{generateText()}</div>;
}

// Export types
export type { WatermarkSettings };
