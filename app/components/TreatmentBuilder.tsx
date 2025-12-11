"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * TREATMENT BUILDER COMPONENT
 * Professional creative treatment document generator for pitches and production
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const FileTextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const FilmIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/>
    <line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

const MusicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);

const PaletteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5"/>
    <circle cx="17.5" cy="10.5" r=".5"/>
    <circle cx="8.5" cy="7.5" r=".5"/>
    <circle cx="6.5" cy="12.5" r=".5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

// Treatment section templates
const TREATMENT_SECTIONS = {
  logline: {
    label: "Logline",
    placeholder: "A one-sentence summary of the project that captures the essence...",
    description: "The elevator pitch - one compelling sentence",
    aiPrompt: "Generate a compelling logline"
  },
  synopsis: {
    label: "Synopsis",
    placeholder: "A brief overview of the story, concept, or campaign...",
    description: "2-3 paragraph summary of the creative vision",
    aiPrompt: "Expand into a detailed synopsis"
  },
  visualStyle: {
    label: "Visual Style & Tone",
    placeholder: "Describe the visual aesthetic, mood, and atmosphere...",
    description: "Color palette, lighting, camera style, visual references",
    aiPrompt: "Describe visual treatment"
  },
  narrative: {
    label: "Narrative Approach",
    placeholder: "How will the story be told? Structure, pacing, perspective...",
    description: "Story structure, pacing, point of view",
    aiPrompt: "Develop narrative structure"
  },
  characters: {
    label: "Characters / Talent",
    placeholder: "Key characters, casting ideas, talent requirements...",
    description: "Character descriptions and casting direction",
    aiPrompt: "Develop character profiles"
  },
  locations: {
    label: "Locations & Settings",
    placeholder: "Primary locations, atmosphere, practical considerations...",
    description: "Where the project takes place",
    aiPrompt: "Suggest location treatments"
  },
  soundtrack: {
    label: "Sound & Music",
    placeholder: "Audio approach, music style, sound design direction...",
    description: "Soundtrack vision and audio atmosphere",
    aiPrompt: "Develop audio treatment"
  },
  technical: {
    label: "Technical Approach",
    placeholder: "Camera, lighting, special equipment, post-production techniques...",
    description: "Equipment and technical methodology",
    aiPrompt: "Outline technical requirements"
  },
  references: {
    label: "Visual References",
    placeholder: "Films, commercials, art pieces that inspire this project...",
    description: "Reference materials and inspirations",
    aiPrompt: "Suggest visual references"
  }
};

// Project type templates
const PROJECT_TEMPLATES = {
  commercial: {
    label: "Commercial / Advertisement",
    sections: ["logline", "synopsis", "visualStyle", "narrative", "locations", "soundtrack", "technical"],
    icon: FilmIcon
  },
  musicVideo: {
    label: "Music Video",
    sections: ["logline", "synopsis", "visualStyle", "narrative", "locations", "soundtrack", "technical", "references"],
    icon: MusicIcon
  },
  narrative: {
    label: "Narrative Film / Short",
    sections: ["logline", "synopsis", "characters", "visualStyle", "narrative", "locations", "soundtrack", "technical"],
    icon: FilmIcon
  },
  documentary: {
    label: "Documentary",
    sections: ["logline", "synopsis", "narrative", "visualStyle", "locations", "soundtrack", "technical"],
    icon: FilmIcon
  },
  brandContent: {
    label: "Brand Content / Social",
    sections: ["logline", "synopsis", "visualStyle", "locations", "technical"],
    icon: ImageIcon
  },
  motionGraphics: {
    label: "Motion Graphics / Animation",
    sections: ["logline", "synopsis", "visualStyle", "technical", "references"],
    icon: PaletteIcon
  }
};

interface TreatmentSection {
  id: string;
  type: keyof typeof TREATMENT_SECTIONS;
  content: string;
  isExpanded: boolean;
}

interface TreatmentVersion {
  id: string;
  name: string;
  createdAt: string;
  sections: TreatmentSection[];
}

interface TreatmentBuilderProps {
  project: Schema["Project"]["type"];
  onSave?: (treatment: { sections: TreatmentSection[]; versions: TreatmentVersion[] }) => Promise<void>;
}

export default function TreatmentBuilder({ project, onSave }: TreatmentBuilderProps) {
  const [sections, setSections] = useState<TreatmentSection[]>([
    { id: "1", type: "logline", content: "", isExpanded: true },
    { id: "2", type: "synopsis", content: "", isExpanded: true },
    { id: "3", type: "visualStyle", content: "", isExpanded: true }
  ]);
  const [versions, setVersions] = useState<TreatmentVersion[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof PROJECT_TEMPLATES | "">("");
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const applyTemplate = (templateKey: keyof typeof PROJECT_TEMPLATES) => {
    const template = PROJECT_TEMPLATES[templateKey];
    const newSections: TreatmentSection[] = template.sections.map((sectionType, index) => ({
      id: `${Date.now()}-${index}`,
      type: sectionType as keyof typeof TREATMENT_SECTIONS,
      content: "",
      isExpanded: index < 3
    }));
    setSections(newSections);
    setSelectedTemplate(templateKey);
    setShowTemplateMenu(false);
  };

  const addSection = (type: keyof typeof TREATMENT_SECTIONS) => {
    const newSection: TreatmentSection = {
      id: `${Date.now()}`,
      type,
      content: "",
      isExpanded: true
    };
    setSections([...sections, newSection]);
    setShowAddSection(false);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSectionContent = (id: string, content: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, content } : s));
  };

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, isExpanded: !s.isExpanded } : s));
  };

  const generateAIContent = async (sectionId: string) => {
    setIsGenerating(sectionId);
    // Simulate AI generation - in production, this would call an AI API
    await new Promise(resolve => setTimeout(resolve, 2000));

    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const sectionConfig = TREATMENT_SECTIONS[section.type];
      // Placeholder AI-generated content based on project info
      const generatedContent = `[AI Generated ${sectionConfig.label} for "${project.name}"]\n\n` +
        `Based on the project brief and objectives, this ${sectionConfig.label.toLowerCase()} captures the creative vision...`;
      updateSectionContent(sectionId, generatedContent);
    }
    setIsGenerating(null);
  };

  const saveVersion = () => {
    const newVersion: TreatmentVersion = {
      id: `${Date.now()}`,
      name: `Version ${versions.length + 1}`,
      createdAt: new Date().toISOString(),
      sections: [...sections]
    };
    setVersions([newVersion, ...versions]);
  };

  const loadVersion = (version: TreatmentVersion) => {
    setSections(version.sections.map(s => ({ ...s, isExpanded: true })));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({ sections, versions });
    } finally {
      setIsSaving(false);
    }
  };

  const exportToPDF = () => {
    // Generate treatment document content
    let content = `CREATIVE TREATMENT\n`;
    content += `${"=".repeat(50)}\n\n`;
    content += `Project: ${project.name}\n`;
    content += `Client: ${project.client || "N/A"}\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;
    content += `${"=".repeat(50)}\n\n`;

    sections.forEach(section => {
      const sectionConfig = TREATMENT_SECTIONS[section.type];
      content += `${sectionConfig.label.toUpperCase()}\n`;
      content += `${"-".repeat(30)}\n`;
      content += `${section.content || "(No content yet)"}\n\n`;
    });

    // Create downloadable file
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name?.replace(/\s+/g, "_")}_Treatment.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    let content = `CREATIVE TREATMENT: ${project.name}\n\n`;
    sections.forEach(section => {
      const sectionConfig = TREATMENT_SECTIONS[section.type];
      content += `## ${sectionConfig.label}\n${section.content || "(No content)"}\n\n`;
    });
    await navigator.clipboard.writeText(content);
  };

  // Calculate completion percentage
  const filledSections = sections.filter(s => s.content.trim().length > 0).length;
  const completionPercentage = sections.length > 0 ? Math.round((filledSections / sections.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-[12px] p-6"
        style={{
          background: "linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)",
          border: "1px solid var(--border)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className="text-[20px] font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <span style={{ color: "var(--primary)" }}><FileTextIcon /></span>
              Treatment Builder
            </h3>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Create professional creative treatments for pitches and production
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Completion indicator */}
            <div className="text-right mr-4">
              <div className="text-[24px] font-bold" style={{ color: "var(--text-primary)" }}>
                {completionPercentage}%
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Complete
              </div>
            </div>

            {/* Action buttons */}
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-[6px] transition-all"
              style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
              title="Copy to clipboard"
            >
              <CopyIcon />
            </button>
            <button
              onClick={exportToPDF}
              className="p-2 rounded-[6px] transition-all"
              style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
              title="Export treatment"
            >
              <DownloadIcon />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2 transition-all"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <SaveIcon />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Template selector */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              className="px-4 py-2 rounded-[6px] font-medium text-[13px] flex items-center gap-2 transition-all"
              style={{ background: "var(--bg-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            >
              {selectedTemplate ? PROJECT_TEMPLATES[selectedTemplate].label : "Choose Template"}
              <ChevronDownIcon />
            </button>

            {showTemplateMenu && (
              <div
                className="absolute top-full left-0 mt-2 w-64 rounded-[8px] overflow-hidden z-20 shadow-lg"
                style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
              >
                {Object.entries(PROJECT_TEMPLATES).map(([key, template]) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key as keyof typeof PROJECT_TEMPLATES)}
                      className="w-full px-4 py-3 text-left text-[13px] flex items-center gap-3 transition-all hover:bg-[var(--bg-2)]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <span style={{ color: "var(--primary)" }}><Icon /></span>
                      {template.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={saveVersion}
            className="px-3 py-2 rounded-[6px] text-[12px] font-medium transition-all"
            style={{ background: "var(--bg-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            Save as Version
          </button>

          {versions.length > 0 && (
            <select
              onChange={(e) => {
                const version = versions.find(v => v.id === e.target.value);
                if (version) loadVersion(version);
              }}
              className="px-3 py-2 rounded-[6px] text-[12px] font-medium"
              style={{ background: "var(--bg-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              <option value="">Load Version...</option>
              {versions.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} - {new Date(v.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Treatment Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => {
          const sectionConfig = TREATMENT_SECTIONS[section.type];
          return (
            <div
              key={section.id}
              className="rounded-[10px] overflow-hidden"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              {/* Section Header */}
              <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer"
                style={{ background: "var(--bg-2)" }}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold"
                    style={{ background: "var(--primary)", color: "white" }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                      {sectionConfig.label}
                    </h4>
                    <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      {sectionConfig.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.content.trim() && (
                    <span
                      className="px-2 py-1 rounded text-[10px] font-bold uppercase"
                      style={{ background: "var(--success-muted)", color: "var(--success)" }}
                    >
                      Complete
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                    className="p-1.5 rounded transition-all hover:bg-[var(--bg-1)]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <TrashIcon />
                  </button>
                  <span
                    className="transition-transform"
                    style={{
                      color: "var(--text-tertiary)",
                      transform: section.isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                    }}
                  >
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              {/* Section Content */}
              {section.isExpanded && (
                <div className="p-5">
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSectionContent(section.id, e.target.value)}
                    placeholder={sectionConfig.placeholder}
                    rows={6}
                    className="w-full px-4 py-3 rounded-[8px] text-[14px] resize-none transition-all"
                    style={{
                      background: "var(--bg-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)"
                    }}
                  />

                  {/* AI Generate button */}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => generateAIContent(section.id)}
                      disabled={isGenerating === section.id}
                      className="px-3 py-2 rounded-[6px] font-medium text-[12px] flex items-center gap-2 transition-all"
                      style={{
                        background: "var(--primary-muted)",
                        color: "var(--primary)",
                        opacity: isGenerating === section.id ? 0.7 : 1
                      }}
                    >
                      <SparklesIcon />
                      {isGenerating === section.id ? "Generating..." : sectionConfig.aiPrompt}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Section Button */}
      <div className="relative">
        <button
          onClick={() => setShowAddSection(!showAddSection)}
          className="w-full py-4 rounded-[10px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all"
          style={{
            background: "var(--bg-1)",
            border: "2px dashed var(--border)",
            color: "var(--text-secondary)"
          }}
        >
          <PlusIcon />
          Add Section
        </button>

        {showAddSection && (
          <div
            className="absolute bottom-full left-0 right-0 mb-2 rounded-[10px] overflow-hidden shadow-lg z-10"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="p-2 grid grid-cols-2 gap-2">
              {Object.entries(TREATMENT_SECTIONS).map(([key, config]) => {
                const isUsed = sections.some(s => s.type === key);
                return (
                  <button
                    key={key}
                    onClick={() => addSection(key as keyof typeof TREATMENT_SECTIONS)}
                    disabled={isUsed}
                    className="px-4 py-3 rounded-[6px] text-left text-[13px] transition-all"
                    style={{
                      background: isUsed ? "var(--bg-2)" : "transparent",
                      color: isUsed ? "var(--text-tertiary)" : "var(--text-primary)",
                      opacity: isUsed ? 0.5 : 1
                    }}
                  >
                    <div className="font-medium">{config.label}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {config.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div
        className="rounded-[12px] p-6"
        style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
      >
        <h4 className="font-semibold text-[14px] mb-4" style={{ color: "var(--text-primary)" }}>
          Treatment Preview
        </h4>
        <div
          className="prose prose-invert max-w-none"
          style={{ color: "var(--text-secondary)" }}
        >
          <div className="text-center mb-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-[18px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {project.name || "Untitled Project"}
            </h2>
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Creative Treatment • {project.client || "Client TBD"}
            </p>
          </div>

          {sections.map(section => {
            const sectionConfig = TREATMENT_SECTIONS[section.type];
            if (!section.content.trim()) return null;
            return (
              <div key={section.id} className="mb-6">
                <h3 className="text-[15px] font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--primary)" }}>
                  {sectionConfig.label}
                </h3>
                <p className="text-[14px] whitespace-pre-wrap leading-relaxed">
                  {section.content}
                </p>
              </div>
            );
          })}

          {filledSections === 0 && (
            <p className="text-center py-8" style={{ color: "var(--text-tertiary)" }}>
              Start filling out sections above to see your treatment preview
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
