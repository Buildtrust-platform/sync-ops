'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  usageMetering,
  type UsageSummary,
  type UsageType,
  TIER_LIMITS
} from '@/app/lib/services/usageMetering';

interface UseUsageMeteringOptions {
  organizationId: string;
  tier?: string;
  refreshInterval?: number; // milliseconds
}

interface UseUsageMeteringReturn {
  usage: UsageSummary | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  canCreateProject: () => Promise<boolean>;
  canAddUser: () => Promise<boolean>;
  canUploadFile: (fileSizeBytes: number) => Promise<{ allowed: boolean; message?: string }>;
  canUseAICredits: (credits: number) => Promise<{ allowed: boolean; message?: string }>;
  getUsagePercentage: (type: UsageType) => number;
  isNearLimit: (type: UsageType, threshold?: number) => boolean;
  isAtLimit: (type: UsageType) => boolean;
}

/**
 * React hook for accessing usage metering data and functions
 */
export function useUsageMetering({
  organizationId,
  tier = 'FREE',
  refreshInterval = 60000, // 1 minute default
}: UseUsageMeteringOptions): UseUsageMeteringReturn {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await usageMetering.getUsageSummary(organizationId, tier);
      setUsage(summary);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch usage'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, tier]);

  // Initial fetch
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchUsage, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchUsage, refreshInterval]);

  const canCreateProject = useCallback(async (): Promise<boolean> => {
    return usageMetering.canCreateProject(organizationId, tier);
  }, [organizationId, tier]);

  const canAddUser = useCallback(async (): Promise<boolean> => {
    return usageMetering.canAddUser(organizationId, tier);
  }, [organizationId, tier]);

  const canUploadFile = useCallback(async (fileSizeBytes: number): Promise<{ allowed: boolean; message?: string }> => {
    return usageMetering.canUploadFile(organizationId, tier, fileSizeBytes);
  }, [organizationId, tier]);

  const canUseAICredits = useCallback(async (credits: number): Promise<{ allowed: boolean; message?: string }> => {
    return usageMetering.canUseAICredits(organizationId, tier, credits);
  }, [organizationId, tier]);

  const getUsagePercentage = useCallback((type: UsageType): number => {
    if (!usage || !usage.metrics[type]) return 0;
    return usage.metrics[type]!.percentUsed;
  }, [usage]);

  const isNearLimit = useCallback((type: UsageType, threshold: number = 80): boolean => {
    const percentage = getUsagePercentage(type);
    return percentage >= threshold;
  }, [getUsagePercentage]);

  const isAtLimit = useCallback((type: UsageType): boolean => {
    if (!usage || !usage.metrics[type]) return false;
    const metric = usage.metrics[type]!;
    if (metric.limit === null) return false; // Unlimited
    return metric.current >= metric.limit;
  }, [usage]);

  return {
    usage,
    loading,
    error,
    refresh: fetchUsage,
    canCreateProject,
    canAddUser,
    canUploadFile,
    canUseAICredits,
    getUsagePercentage,
    isNearLimit,
    isAtLimit,
  };
}

/**
 * Hook for displaying usage alerts
 */
export function useUsageAlerts(organizationId: string, tier: string = 'FREE') {
  const { usage, isNearLimit, isAtLimit } = useUsageMetering({ organizationId, tier });
  const [alerts, setAlerts] = useState<Array<{
    type: 'warning' | 'error';
    usageType: UsageType;
    message: string;
  }>>([]);

  useEffect(() => {
    if (!usage) return;

    const newAlerts: typeof alerts = [];
    const usageTypes: UsageType[] = ['STORAGE', 'BANDWIDTH', 'AI_PROCESSING', 'PROJECTS', 'USERS'];

    for (const type of usageTypes) {
      if (isAtLimit(type)) {
        newAlerts.push({
          type: 'error',
          usageType: type,
          message: `You've reached your ${type.toLowerCase().replace('_', ' ')} limit. Upgrade your plan to continue.`,
        });
      } else if (isNearLimit(type, 90)) {
        newAlerts.push({
          type: 'warning',
          usageType: type,
          message: `You're approaching your ${type.toLowerCase().replace('_', ' ')} limit (${Math.round(usage.metrics[type]?.percentUsed || 0)}% used).`,
        });
      }
    }

    setAlerts(newAlerts);
  }, [usage, isNearLimit, isAtLimit]);

  return alerts;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: string): string {
  const names: Record<string, string> = {
    FREE: 'Free',
    STARTER: 'Starter',
    PROFESSIONAL: 'Professional',
    ENTERPRISE: 'Enterprise',
    STUDIO: 'Studio',
  };
  return names[tier] || tier;
}

/**
 * Get tier limits
 */
export function getTierLimits(tier: string) {
  return TIER_LIMITS[tier] || TIER_LIMITS.FREE;
}
