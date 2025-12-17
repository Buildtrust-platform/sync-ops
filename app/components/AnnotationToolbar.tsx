"use client";

import { useState } from "react";

/**
 * ANNOTATION TOOLBAR - Frame.io-style Drawing Tools
 * Provides tools for annotating video frames during review
 */

export type AnnotationTool =
  | 'select'
  | 'freehand'
  | 'arrow'
  | 'circle'
  | 'rectangle'
  | 'text'
  | 'blur'
  | 'spotlight';

export interface AnnotationStyle {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string | null;
  opacity: number;
  fontSize: number;
}

interface AnnotationToolbarProps {
  selectedTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  style: AnnotationStyle;
  onStyleChange: (style: AnnotationStyle) => void;
  isDrawing: boolean;
  onClear: () => void;
  onUndo: () => void;
  onSave: () => void;
  canUndo: boolean;
  canSave: boolean;
}

// Predefined colors for quick selection
const PRESET_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#AF52DE', // Magenta
  '#FFFFFF', // White
];

const STROKE_WIDTHS = [2, 3, 5, 8, 12];

// Icons
const SelectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
    <path d="M13 13l6 6"/>
  </svg>
);

const PencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

const CircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

const RectangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);

const TextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);

const BlurIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <circle cx="12" cy="12" r="6" strokeDasharray="2 2"/>
    <circle cx="12" cy="12" r="9" strokeDasharray="2 4"/>
  </svg>
);

const SpotlightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2"/>
    <path d="M12 21v2"/>
    <path d="M4.22 4.22l1.42 1.42"/>
    <path d="M18.36 18.36l1.42 1.42"/>
    <path d="M1 12h2"/>
    <path d="M21 12h2"/>
    <path d="M4.22 19.78l1.42-1.42"/>
    <path d="M18.36 5.64l1.42-1.42"/>
  </svg>
);

const UndoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/>
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const tools: { id: AnnotationTool; icon: React.ReactNode; label: string; shortcut?: string }[] = [
  { id: 'select', icon: <SelectIcon />, label: 'Select', shortcut: 'V' },
  { id: 'freehand', icon: <PencilIcon />, label: 'Freehand', shortcut: 'P' },
  { id: 'arrow', icon: <ArrowIcon />, label: 'Arrow', shortcut: 'A' },
  { id: 'circle', icon: <CircleIcon />, label: 'Circle', shortcut: 'O' },
  { id: 'rectangle', icon: <RectangleIcon />, label: 'Rectangle', shortcut: 'R' },
  { id: 'text', icon: <TextIcon />, label: 'Text', shortcut: 'T' },
  { id: 'blur', icon: <BlurIcon />, label: 'Blur', shortcut: 'B' },
  { id: 'spotlight', icon: <SpotlightIcon />, label: 'Spotlight', shortcut: 'S' },
];

export default function AnnotationToolbar({
  selectedTool,
  onToolChange,
  style,
  onStyleChange,
  isDrawing,
  onClear,
  onUndo,
  onSave,
  canUndo,
  canSave,
}: AnnotationToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokeWidth, setShowStrokeWidth] = useState(false);

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-xl"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Drawing Tools */}
      <div className="flex items-center gap-1 pr-2 border-r border-white/10">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`p-2 rounded-lg transition-all ${
              selectedTool === tool.id
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Color Picker */}
      <div className="relative">
        <button
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowStrokeWidth(false);
          }}
          className="w-8 h-8 rounded-lg border-2 border-white/30 hover:border-white/50 transition-colors"
          style={{ backgroundColor: style.strokeColor }}
          title="Stroke Color"
        />

        {showColorPicker && (
          <div
            className="absolute bottom-full left-0 mb-2 p-2 rounded-xl grid grid-cols-4 gap-1"
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onStyleChange({ ...style, strokeColor: color });
                  setShowColorPicker(false);
                }}
                className={`w-7 h-7 rounded-md transition-transform hover:scale-110 ${
                  style.strokeColor === color ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            {/* Custom color input */}
            <input
              type="color"
              value={style.strokeColor}
              onChange={(e) => onStyleChange({ ...style, strokeColor: e.target.value })}
              className="w-7 h-7 rounded-md cursor-pointer"
              title="Custom color"
            />
          </div>
        )}
      </div>

      {/* Stroke Width */}
      <div className="relative">
        <button
          onClick={() => {
            setShowStrokeWidth(!showStrokeWidth);
            setShowColorPicker(false);
          }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Stroke Width"
        >
          <div
            className="rounded-full bg-current"
            style={{ width: style.strokeWidth * 2, height: style.strokeWidth * 2, maxWidth: 16, maxHeight: 16 }}
          />
          <span className="text-xs">{style.strokeWidth}px</span>
        </button>

        {showStrokeWidth && (
          <div
            className="absolute bottom-full left-0 mb-2 p-2 rounded-xl flex gap-1"
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {STROKE_WIDTHS.map((width) => (
              <button
                key={width}
                onClick={() => {
                  onStyleChange({ ...style, strokeWidth: width });
                  setShowStrokeWidth(false);
                }}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                  style.strokeWidth === width ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
                title={`${width}px`}
              >
                <div
                  className="rounded-full bg-white"
                  style={{ width: Math.min(width * 2, 20), height: Math.min(width * 2, 20) }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Opacity Slider */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-white/40 text-xs">Opacity</span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={style.opacity}
          onChange={(e) => onStyleChange({ ...style, opacity: parseFloat(e.target.value) })}
          className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
        <span className="text-white/60 text-xs w-8">{Math.round(style.opacity * 100)}%</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded-lg transition-colors ${
            canUndo
              ? 'text-white/60 hover:text-white hover:bg-white/10'
              : 'text-white/20 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <UndoIcon />
        </button>

        <button
          onClick={onClear}
          className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Clear All"
        >
          <TrashIcon />
        </button>

        <button
          onClick={onSave}
          disabled={!canSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            canSave
              ? 'bg-teal-500 text-white hover:bg-teal-600'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
          title="Save Annotation"
        >
          <CheckIcon />
          <span className="text-sm font-medium">Save</span>
        </button>
      </div>

      {/* Drawing indicator */}
      {isDrawing && (
        <div className="ml-2 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-xs font-medium">Drawing</span>
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
export function AnnotationToolbarCompact({
  selectedTool,
  onToolChange,
  style,
  onStyleChange,
}: Pick<AnnotationToolbarProps, 'selectedTool' | 'onToolChange' | 'style' | 'onStyleChange'>) {
  return (
    <div className="flex items-center gap-1">
      {tools.slice(0, 5).map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`p-1.5 rounded transition-all ${
            selectedTool === tool.id
              ? 'bg-teal-500/20 text-teal-400'
              : 'text-white/40 hover:text-white/80'
          }`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
      <button
        className="w-5 h-5 rounded border border-white/20"
        style={{ backgroundColor: style.strokeColor }}
        title="Color"
      />
    </div>
  );
}
