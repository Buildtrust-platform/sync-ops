'use client';

import { useState } from 'react';
import { Icons } from './ui';
import { Tooltip } from './ui/Tooltip';

/**
 * POST-PRODUCTION PIPELINE VISUALIZATION
 *
 * Cinema-inspired visual representation of the post-production workflow.
 * Shows progress through stages with professional styling.
 */

export type PipelineStage =
  | 'ingest'
  | 'dailies'
  | 'rough_cut'
  | 'color'
  | 'vfx'
  | 'audio'
  | 'review'
  | 'delivery';

export type StageStatus = 'pending' | 'active' | 'completed' | 'blocked';

interface PipelineStageConfig {
  id: PipelineStage;
  label: string;
  shortLabel: string;
  icon: keyof typeof Icons;
  description: string;
}

export interface StageData {
  status: StageStatus;
  progress?: number;
  details?: string;
}

export interface PostProductionPipelineProps {
  stages: Partial<Record<PipelineStage, StageData>>;
  currentStage?: PipelineStage;
  compact?: boolean;
  showProgress?: boolean;
  className?: string;
}

const PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: 'ingest', label: 'Ingest', shortLabel: 'IN', icon: 'Upload', description: 'Import raw footage' },
  { id: 'dailies', label: 'Dailies', shortLabel: 'DL', icon: 'Film', description: 'Review daily footage' },
  { id: 'rough_cut', label: 'Rough Cut', shortLabel: 'RC', icon: 'Scissors', description: 'Initial assembly edit' },
  { id: 'color', label: 'Color', shortLabel: 'CL', icon: 'Layers', description: 'Color grading' },
  { id: 'vfx', label: 'VFX', shortLabel: 'VX', icon: 'Sparkles', description: 'Visual effects' },
  { id: 'audio', label: 'Audio', shortLabel: 'AU', icon: 'Music', description: 'Audio post & mix' },
  { id: 'review', label: 'Review', shortLabel: 'RV', icon: 'Eye', description: 'Final review & approval' },
  { id: 'delivery', label: 'Delivery', shortLabel: 'DV', icon: 'Send', description: 'Export & distribute' },
];

const STATUS_COLORS: Record<StageStatus, { bg: string; border: string; text: string; glow: string }> = {
  pending: {
    bg: 'var(--bg-3)',
    border: 'var(--border-default)',
    text: 'var(--text-tertiary)',
    glow: 'none',
  },
  active: {
    bg: 'var(--primary-muted)',
    border: 'var(--primary)',
    text: 'var(--primary)',
    glow: '0 0 16px var(--primary-muted)',
  },
  completed: {
    bg: 'var(--success-muted)',
    border: 'var(--success)',
    text: 'var(--success)',
    glow: 'none',
  },
  blocked: {
    bg: 'var(--danger-muted)',
    border: 'var(--danger)',
    text: 'var(--danger)',
    glow: 'none',
  },
};

export function PostProductionPipeline({
  stages,
  currentStage,
  compact = false,
  showProgress = true,
  className = '',
}: PostProductionPipelineProps) {
  const [hoveredStage, setHoveredStage] = useState<PipelineStage | null>(null);

  const getStageStatus = (stageId: PipelineStage): StageStatus => {
    return stages[stageId]?.status || 'pending';
  };

  const getStageProgress = (stageId: PipelineStage): number => {
    return stages[stageId]?.progress || 0;
  };

  // Calculate overall progress
  const completedStages = PIPELINE_STAGES.filter(s => getStageStatus(s.id) === 'completed').length;
  const activeStages = PIPELINE_STAGES.filter(s => getStageStatus(s.id) === 'active').length;
  const overallProgress = Math.round(
    ((completedStages + activeStages * 0.5) / PIPELINE_STAGES.length) * 100
  );

  return (
    <div className={`${className}`}>
      {/* Pipeline Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--phase-postproduction)', color: 'white' }}
          >
            <Icons.GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Post-Production Pipeline</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {completedStages}/{PIPELINE_STAGES.length} stages complete
            </p>
          </div>
        </div>
        {showProgress && (
          <div className="text-right">
            <span className="text-lg font-bold text-[var(--text-primary)]">{overallProgress}%</span>
            <p className="text-xs text-[var(--text-tertiary)]">Overall</p>
          </div>
        )}
      </div>

      {/* Pipeline Visualization */}
      <div className="relative">
        {/* Connection Line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
          style={{ backgroundColor: 'var(--border-default)' }}
        />

        {/* Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 transition-all duration-500"
          style={{
            width: `${overallProgress}%`,
            background: 'linear-gradient(90deg, var(--success), var(--primary))',
          }}
        />

        {/* Stage Nodes */}
        <div className="relative flex items-center justify-between">
          {PIPELINE_STAGES.map((stage, index) => {
            const status = getStageStatus(stage.id);
            const progress = getStageProgress(stage.id);
            const colors = STATUS_COLORS[status];
            const isCurrent = currentStage === stage.id;
            const isHovered = hoveredStage === stage.id;
            const IconComponent = Icons[stage.icon];

            return (
              <Tooltip
                key={stage.id}
                content={
                  <div className="text-center">
                    <div className="font-medium">{stage.label}</div>
                    <div className="text-xs opacity-80">{stage.description}</div>
                    {status === 'active' && progress > 0 && (
                      <div className="text-xs mt-1">{progress}% complete</div>
                    )}
                  </div>
                }
                position="top"
              >
                <button
                  className="relative flex flex-col items-center group focus:outline-none"
                  onMouseEnter={() => setHoveredStage(stage.id)}
                  onMouseLeave={() => setHoveredStage(null)}
                  style={{ flex: 1 }}
                >
                  {/* Stage Node */}
                  <div
                    className={`
                      relative z-10 flex items-center justify-center
                      transition-all duration-200
                      ${compact ? 'w-8 h-8' : 'w-10 h-10'}
                      ${isCurrent || isHovered ? 'scale-110' : ''}
                      ${status === 'active' ? 'animate-pulse' : ''}
                    `}
                    style={{
                      backgroundColor: colors.bg,
                      border: `2px solid ${colors.border}`,
                      borderRadius: '50%',
                      boxShadow: isCurrent ? colors.glow : 'none',
                    }}
                  >
                    <span style={{ color: colors.text, display: 'flex' }}>
                      {status === 'completed' ? (
                        <Icons.Check className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      ) : (
                        <IconComponent className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      )}
                    </span>

                    {/* Active Indicator Ring */}
                    {status === 'active' && (
                      <div
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          backgroundColor: 'var(--primary)',
                          opacity: 0.3,
                        }}
                      />
                    )}
                  </div>

                  {/* Stage Label */}
                  {!compact && (
                    <span
                      className={`
                        mt-2 text-[10px] font-medium uppercase tracking-wide
                        transition-colors duration-150
                        ${isCurrent || isHovered ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}
                      `}
                    >
                      {stage.shortLabel}
                    </span>
                  )}

                  {/* Progress Indicator for Active Stage */}
                  {status === 'active' && progress > 0 && !compact && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12">
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-3)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: 'var(--primary)',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Legend (compact mode only) */}
      {!compact && (
        <div className="flex items-center justify-center gap-6 mt-8 pt-4 border-t border-[var(--border-subtle)]">
          {[
            { status: 'completed' as const, label: 'Completed' },
            { status: 'active' as const, label: 'In Progress' },
            { status: 'pending' as const, label: 'Pending' },
            { status: 'blocked' as const, label: 'Blocked' },
          ].map(({ status, label }) => {
            const colors = STATUS_COLORS[status];
            return (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: colors.bg,
                    border: `1.5px solid ${colors.border}`,
                  }}
                />
                <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Mini Pipeline - Compact inline version for cards/lists
 */
export function MiniPipeline({
  stages,
  className = '',
}: {
  stages: Partial<Record<PipelineStage, StageData>>;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {PIPELINE_STAGES.map((stage) => {
        const status = stages[stage.id]?.status || 'pending';
        const colors = STATUS_COLORS[status];

        return (
          <Tooltip key={stage.id} content={stage.label} position="top" size="sm">
            <div
              className={`
                w-4 h-4 rounded-full flex items-center justify-center
                transition-all duration-150
                ${status === 'active' ? 'animate-pulse' : ''}
              `}
              style={{
                backgroundColor: colors.bg,
                border: `1.5px solid ${colors.border}`,
              }}
            >
              {status === 'completed' && (
                <span style={{ color: colors.text, display: 'flex' }}>
                  <Icons.Check className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}

export default PostProductionPipeline;
