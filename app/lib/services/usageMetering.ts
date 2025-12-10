/**
 * Usage Metering Service
 *
 * Tracks resource consumption for SaaS billing and limit enforcement.
 * Integrates with the UsageRecord model in the database.
 */

export type UsageType =
  | 'STORAGE'        // GB stored
  | 'BANDWIDTH'      // GB transferred
  | 'AI_PROCESSING'  // AI credits used
  | 'TRANSCODING'    // Minutes transcoded
  | 'USERS'          // Active users
  | 'PROJECTS'       // Active projects
  | 'API_CALLS';     // API requests

export interface UsageMetric {
  type: UsageType;
  quantity: number;
  unit: string;
  timestamp: Date;
  projectId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface UsageSummary {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  metrics: {
    [key in UsageType]?: {
      current: number;
      limit: number | null;
      unit: string;
      percentUsed: number;
    };
  };
}

export interface UsageLimits {
  maxProjects: number | null;
  maxUsers: number | null;
  maxStorageGB: number | null;
  maxAICredits: number | null;
  maxBandwidthGB: number | null;
}

// Subscription tier limits
export const TIER_LIMITS: Record<string, UsageLimits> = {
  FREE: {
    maxProjects: 3,
    maxUsers: 2,
    maxStorageGB: 5,
    maxAICredits: 50,
    maxBandwidthGB: 10,
  },
  STARTER: {
    maxProjects: 10,
    maxUsers: 5,
    maxStorageGB: 50,
    maxAICredits: 500,
    maxBandwidthGB: 100,
  },
  PROFESSIONAL: {
    maxProjects: 50,
    maxUsers: 25,
    maxStorageGB: 500,
    maxAICredits: 2000,
    maxBandwidthGB: 500,
  },
  ENTERPRISE: {
    maxProjects: 200,
    maxUsers: 100,
    maxStorageGB: 2000,
    maxAICredits: 10000,
    maxBandwidthGB: 2000,
  },
  STUDIO: {
    maxProjects: null, // Unlimited
    maxUsers: null,
    maxStorageGB: null,
    maxAICredits: null,
    maxBandwidthGB: null,
  },
};

// In-memory cache for usage data (in production, use Redis)
const usageCache: Map<string, { data: UsageSummary; expiry: number }> = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

/**
 * UsageMeteringService - Singleton service for tracking resource usage
 */
class UsageMeteringService {
  private static instance: UsageMeteringService;
  private pendingRecords: UsageMetric[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start background flush every 30 seconds
    this.flushInterval = setInterval(() => this.flush(), 30000);
  }

  static getInstance(): UsageMeteringService {
    if (!UsageMeteringService.instance) {
      UsageMeteringService.instance = new UsageMeteringService();
    }
    return UsageMeteringService.instance;
  }

  /**
   * Record a usage event
   */
  async recordUsage(
    organizationId: string,
    metric: UsageMetric
  ): Promise<void> {
    const record = {
      ...metric,
      timestamp: metric.timestamp || new Date(),
    };

    this.pendingRecords.push(record);

    // Invalidate cache for this organization
    usageCache.delete(organizationId);

    // If we have too many pending records, flush immediately
    if (this.pendingRecords.length >= 100) {
      await this.flush();
    }
  }

  /**
   * Record storage usage
   */
  async recordStorage(
    organizationId: string,
    bytesAdded: number,
    projectId?: string
  ): Promise<void> {
    const gbAdded = bytesAdded / (1024 * 1024 * 1024);
    await this.recordUsage(organizationId, {
      type: 'STORAGE',
      quantity: gbAdded,
      unit: 'GB',
      timestamp: new Date(),
      projectId,
    });
  }

  /**
   * Record bandwidth usage
   */
  async recordBandwidth(
    organizationId: string,
    bytesTransferred: number,
    projectId?: string,
    userId?: string
  ): Promise<void> {
    const gbTransferred = bytesTransferred / (1024 * 1024 * 1024);
    await this.recordUsage(organizationId, {
      type: 'BANDWIDTH',
      quantity: gbTransferred,
      unit: 'GB',
      timestamp: new Date(),
      projectId,
      userId,
    });
  }

  /**
   * Record AI processing credits
   */
  async recordAICredits(
    organizationId: string,
    credits: number,
    projectId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.recordUsage(organizationId, {
      type: 'AI_PROCESSING',
      quantity: credits,
      unit: 'credits',
      timestamp: new Date(),
      projectId,
      metadata,
    });
  }

  /**
   * Record transcoding minutes
   */
  async recordTranscoding(
    organizationId: string,
    durationSeconds: number,
    projectId?: string
  ): Promise<void> {
    const minutes = durationSeconds / 60;
    await this.recordUsage(organizationId, {
      type: 'TRANSCODING',
      quantity: minutes,
      unit: 'minutes',
      timestamp: new Date(),
      projectId,
    });
  }

  /**
   * Record API call
   */
  async recordAPICall(
    organizationId: string,
    userId?: string
  ): Promise<void> {
    await this.recordUsage(organizationId, {
      type: 'API_CALLS',
      quantity: 1,
      unit: 'calls',
      timestamp: new Date(),
      userId,
    });
  }

  /**
   * Get current usage summary for an organization
   */
  async getUsageSummary(
    organizationId: string,
    tier: string = 'FREE'
  ): Promise<UsageSummary> {
    // Check cache first
    const cached = usageCache.get(organizationId);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const limits = TIER_LIMITS[tier] || TIER_LIMITS.FREE;
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // In production, this would query the database
    // For now, return mock data
    const summary: UsageSummary = {
      organizationId,
      periodStart,
      periodEnd,
      metrics: {
        STORAGE: {
          current: 245.5,
          limit: limits.maxStorageGB,
          unit: 'GB',
          percentUsed: limits.maxStorageGB ? (245.5 / limits.maxStorageGB) * 100 : 0,
        },
        BANDWIDTH: {
          current: 89,
          limit: limits.maxBandwidthGB,
          unit: 'GB',
          percentUsed: limits.maxBandwidthGB ? (89 / limits.maxBandwidthGB) * 100 : 0,
        },
        AI_PROCESSING: {
          current: 1234,
          limit: limits.maxAICredits,
          unit: 'credits',
          percentUsed: limits.maxAICredits ? (1234 / limits.maxAICredits) * 100 : 0,
        },
        PROJECTS: {
          current: 12,
          limit: limits.maxProjects,
          unit: 'projects',
          percentUsed: limits.maxProjects ? (12 / limits.maxProjects) * 100 : 0,
        },
        USERS: {
          current: 8,
          limit: limits.maxUsers,
          unit: 'users',
          percentUsed: limits.maxUsers ? (8 / limits.maxUsers) * 100 : 0,
        },
      },
    };

    // Cache the result
    usageCache.set(organizationId, {
      data: summary,
      expiry: Date.now() + CACHE_TTL_MS,
    });

    return summary;
  }

  /**
   * Check if an organization can perform an action based on limits
   */
  async checkLimit(
    organizationId: string,
    tier: string,
    usageType: UsageType,
    additionalQuantity: number = 1
  ): Promise<{ allowed: boolean; current: number; limit: number | null; message?: string }> {
    const summary = await this.getUsageSummary(organizationId, tier);
    const metric = summary.metrics[usageType];

    if (!metric) {
      return { allowed: true, current: 0, limit: null };
    }

    // Unlimited (null limit)
    if (metric.limit === null) {
      return { allowed: true, current: metric.current, limit: null };
    }

    const wouldExceed = metric.current + additionalQuantity > metric.limit;

    return {
      allowed: !wouldExceed,
      current: metric.current,
      limit: metric.limit,
      message: wouldExceed
        ? `Would exceed ${usageType.toLowerCase()} limit. Current: ${metric.current} ${metric.unit}, Limit: ${metric.limit} ${metric.unit}`
        : undefined,
    };
  }

  /**
   * Check if organization can create a new project
   */
  async canCreateProject(organizationId: string, tier: string): Promise<boolean> {
    const result = await this.checkLimit(organizationId, tier, 'PROJECTS', 1);
    return result.allowed;
  }

  /**
   * Check if organization can add a new user
   */
  async canAddUser(organizationId: string, tier: string): Promise<boolean> {
    const result = await this.checkLimit(organizationId, tier, 'USERS', 1);
    return result.allowed;
  }

  /**
   * Check if organization can upload a file
   */
  async canUploadFile(
    organizationId: string,
    tier: string,
    fileSizeBytes: number
  ): Promise<{ allowed: boolean; message?: string }> {
    const fileSizeGB = fileSizeBytes / (1024 * 1024 * 1024);
    const result = await this.checkLimit(organizationId, tier, 'STORAGE', fileSizeGB);
    return { allowed: result.allowed, message: result.message };
  }

  /**
   * Check if organization can use AI credits
   */
  async canUseAICredits(
    organizationId: string,
    tier: string,
    credits: number
  ): Promise<{ allowed: boolean; message?: string }> {
    const result = await this.checkLimit(organizationId, tier, 'AI_PROCESSING', credits);
    return { allowed: result.allowed, message: result.message };
  }

  /**
   * Flush pending records to database
   */
  private async flush(): Promise<void> {
    if (this.pendingRecords.length === 0) return;

    const records = [...this.pendingRecords];
    this.pendingRecords = [];

    // In production, batch insert to database
    console.log(`[UsageMetering] Flushing ${records.length} records to database`);

    // TODO: Implement actual database writes
    // await Promise.all(records.map(record =>
    //   client.models.UsageRecord.create({
    //     organizationId: record.organizationId,
    //     usageType: record.type,
    //     quantity: record.quantity,
    //     unit: record.unit,
    //     periodStart: record.timestamp,
    //     periodEnd: record.timestamp,
    //     projectId: record.projectId,
    //     userId: record.userId,
    //   })
    // ));
  }

  /**
   * Get usage breakdown by project
   */
  async getUsageByProject(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, { storage: number; bandwidth: number; aiCredits: number }>> {
    // In production, query database
    // For now, return mock data
    return {
      'project-1': { storage: 45.2, bandwidth: 12.5, aiCredits: 250 },
      'project-2': { storage: 120.8, bandwidth: 35.2, aiCredits: 480 },
      'project-3': { storage: 79.5, bandwidth: 41.3, aiCredits: 504 },
    };
  }

  /**
   * Get usage trend over time
   */
  async getUsageTrend(
    organizationId: string,
    usageType: UsageType,
    days: number = 30
  ): Promise<Array<{ date: string; value: number }>> {
    // In production, query database with aggregation
    // For now, return mock data
    const data: Array<{ date: string; value: number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50,
      });
    }

    return data;
  }

  /**
   * Calculate estimated cost for overage
   */
  calculateOverageCost(
    usageType: UsageType,
    overageQuantity: number
  ): number {
    const overageRates: Record<UsageType, number> = {
      STORAGE: 0.10, // $0.10 per GB
      BANDWIDTH: 0.15, // $0.15 per GB
      AI_PROCESSING: 0.05, // $0.05 per credit
      TRANSCODING: 0.02, // $0.02 per minute
      USERS: 10, // $10 per additional user
      PROJECTS: 5, // $5 per additional project
      API_CALLS: 0.001, // $0.001 per call
    };

    return overageQuantity * (overageRates[usageType] || 0);
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
  }
}

// Export singleton instance
export const usageMetering = UsageMeteringService.getInstance();

// Export helper functions
export const recordStorage = (orgId: string, bytes: number, projectId?: string) =>
  usageMetering.recordStorage(orgId, bytes, projectId);

export const recordBandwidth = (orgId: string, bytes: number, projectId?: string, userId?: string) =>
  usageMetering.recordBandwidth(orgId, bytes, projectId, userId);

export const recordAICredits = (orgId: string, credits: number, projectId?: string, metadata?: Record<string, unknown>) =>
  usageMetering.recordAICredits(orgId, credits, projectId, metadata);

export const checkStorageLimit = (orgId: string, tier: string, fileSizeBytes: number) =>
  usageMetering.canUploadFile(orgId, tier, fileSizeBytes);

export const checkAICreditsLimit = (orgId: string, tier: string, credits: number) =>
  usageMetering.canUseAICredits(orgId, tier, credits);

export const getUsageSummary = (orgId: string, tier: string) =>
  usageMetering.getUsageSummary(orgId, tier);
