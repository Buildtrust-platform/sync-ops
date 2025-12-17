"use client";

import { useState, useEffect, useMemo } from "react";

/**
 * CAPTION OVERLAY - Display captions on video player
 * Shows synchronized captions/subtitles during video playback
 */

export interface CaptionCue {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speakerId?: string;
  speakerName?: string;
}

export interface CaptionStyle {
  fontSize: "small" | "medium" | "large";
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  position: "top" | "bottom";
  fontFamily: "default" | "mono" | "serif";
}

interface CaptionOverlayProps {
  captions: CaptionCue[];
  currentTime: number;
  isEnabled: boolean;
  style?: Partial<CaptionStyle>;
  onCueClick?: (cue: CaptionCue) => void;
}

const defaultStyle: CaptionStyle = {
  fontSize: "medium",
  fontColor: "#FFFFFF",
  backgroundColor: "#000000",
  backgroundOpacity: 0.75,
  position: "bottom",
  fontFamily: "default",
};

const fontSizeMap = {
  small: "14px",
  medium: "18px",
  large: "24px",
};

const fontFamilyMap = {
  default: "system-ui, -apple-system, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  serif: "ui-serif, Georgia, Cambria, serif",
};

export default function CaptionOverlay({
  captions,
  currentTime,
  isEnabled,
  style = {},
  onCueClick,
}: CaptionOverlayProps) {
  const mergedStyle = { ...defaultStyle, ...style };

  // Find current caption(s)
  const currentCaptions = useMemo(() => {
    if (!isEnabled || captions.length === 0) return [];

    return captions.filter(
      (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
    );
  }, [captions, currentTime, isEnabled]);

  if (!isEnabled || currentCaptions.length === 0) {
    return null;
  }

  // Convert hex + opacity to rgba
  const hexToRgba = (hex: string, opacity: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${opacity})`;
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`;
  };

  return (
    <div
      className="absolute left-0 right-0 flex justify-center px-4 pointer-events-none z-30"
      style={{
        [mergedStyle.position === "top" ? "top" : "bottom"]: "60px",
      }}
    >
      <div
        className="max-w-[90%] px-4 py-2 rounded-lg text-center pointer-events-auto"
        style={{
          backgroundColor: hexToRgba(mergedStyle.backgroundColor, mergedStyle.backgroundOpacity),
          color: mergedStyle.fontColor,
          fontSize: fontSizeMap[mergedStyle.fontSize],
          fontFamily: fontFamilyMap[mergedStyle.fontFamily],
          lineHeight: 1.4,
          textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
        }}
        onClick={() => currentCaptions[0] && onCueClick?.(currentCaptions[0])}
      >
        {currentCaptions.map((cue, index) => (
          <div key={cue.id}>
            {cue.speakerName && (
              <span className="font-semibold opacity-80 mr-2">
                [{cue.speakerName}]
              </span>
            )}
            <span>{cue.text}</span>
            {index < currentCaptions.length - 1 && <br />}
          </div>
        ))}
      </div>
    </div>
  );
}

// Caption Settings Panel Component
export function CaptionSettings({
  style,
  onStyleChange,
  isEnabled,
  onToggle,
}: {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
  isEnabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="p-4 rounded-xl space-y-4"
      style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
    >
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          Captions
        </span>
        <button
          onClick={onToggle}
          className="relative w-12 h-6 rounded-full transition-colors"
          style={{
            backgroundColor: isEnabled ? "var(--primary)" : "var(--bg-2)",
          }}
        >
          <div
            className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
            style={{
              left: isEnabled ? "calc(100% - 20px)" : "4px",
            }}
          />
        </button>
      </div>

      {isEnabled && (
        <>
          {/* Font Size */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>
              Font Size
            </label>
            <div className="flex gap-2">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onStyleChange({ ...style, fontSize: size })}
                  className="flex-1 py-1.5 px-3 rounded text-xs font-medium capitalize transition-all"
                  style={{
                    background: style.fontSize === size ? "var(--primary)" : "var(--bg-2)",
                    color: style.fontSize === size ? "white" : "var(--text-secondary)",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>
              Position
            </label>
            <div className="flex gap-2">
              {(["bottom", "top"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => onStyleChange({ ...style, position: pos })}
                  className="flex-1 py-1.5 px-3 rounded text-xs font-medium capitalize transition-all"
                  style={{
                    background: style.position === pos ? "var(--primary)" : "var(--bg-2)",
                    color: style.position === pos ? "white" : "var(--text-secondary)",
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Background Opacity */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>
              Background Opacity: {Math.round(style.backgroundOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={style.backgroundOpacity}
              onChange={(e) =>
                onStyleChange({ ...style, backgroundOpacity: parseFloat(e.target.value) })
              }
              className="w-full"
              style={{ accentColor: "var(--primary)" }}
            />
          </div>

          {/* Font Color */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>
                Text Color
              </label>
              <input
                type="color"
                value={style.fontColor}
                onChange={(e) => onStyleChange({ ...style, fontColor: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>
                Background
              </label>
              <input
                type="color"
                value={style.backgroundColor}
                onChange={(e) => onStyleChange({ ...style, backgroundColor: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
