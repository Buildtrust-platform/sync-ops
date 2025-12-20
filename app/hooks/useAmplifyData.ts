'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';

// Generate the typed client
const client = generateClient<Schema>({ authMode: 'userPool' });

// Type helpers
type ModelName = keyof typeof client.models;

// Generic hook for fetching list data
export function useModelList<T extends ModelName>(
  modelName: T,
  filter?: Record<string, unknown>,
  dependencies: unknown[] = []
) {
  type ModelType = Schema[T]['type'];

  const [data, setData] = useState<ModelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const model = client.models[modelName] as any;
      const result = await model.list({ filter });
      if (result.data) {
        setData(result.data as ModelType[]);
      }
    } catch (err) {
      console.error(`Error fetching ${modelName}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [modelName, JSON.stringify(filter)]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for getting current user's organization
export function useOrganization() {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organization, setOrganization] = useState<Schema['Organization']['type'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        const attributes = await fetchUserAttributes();
        const email = attributes.email || '';

        // Find membership
        const { data: memberships } = await client.models.OrganizationMember.list({
          filter: { email: { eq: email } }
        });

        if (memberships && memberships.length > 0) {
          const orgId = memberships[0].organizationId;
          setOrganizationId(orgId);

          // Fetch org details
          const { data: org } = await client.models.Organization.get({ id: orgId });
          if (org) {
            setOrganization(org);
          }
        } else {
          // Check for any org
          const { data: orgs } = await client.models.Organization.list();
          if (orgs && orgs.length > 0) {
            setOrganizationId(orgs[0].id);
            setOrganization(orgs[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch organization'));
      } finally {
        setLoading(false);
      }
    }

    fetchOrganization();
  }, []);

  return { organizationId, organization, loading, error };
}

// Hook for projects
export function useProjects(organizationId?: string | null) {
  const [projects, setProjects] = useState<Schema['Project']['type'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await client.models.Project.list({
        filter: { organizationId: { eq: organizationId } }
      });
      if (data) {
        setProjects(data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}

// Hook for briefs
export function useBriefs(organizationId?: string | null) {
  const [briefs, setBriefs] = useState<Schema['Brief']['type'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBriefs = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await client.models.Brief.list({
        filter: { organizationId: { eq: organizationId } }
      });
      if (data) {
        setBriefs(data);
      }
    } catch (err) {
      console.error('Error fetching briefs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch briefs'));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchBriefs();
  }, [fetchBriefs]);

  return { briefs, loading, error, refetch: fetchBriefs };
}

// Hook for assets
export function useAssets(organizationId?: string | null, projectId?: string | null) {
  const [assets, setAssets] = useState<Schema['Asset']['type'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const filter: Record<string, unknown> = { organizationId: { eq: organizationId } };
      if (projectId) {
        filter.projectId = { eq: projectId };
      }

      const { data } = await client.models.Asset.list({ filter });
      if (data) {
        setAssets(data);
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch assets'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, projectId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
}

// Hook for call sheets
export function useCallSheets(organizationId?: string | null, projectId?: string | null) {
  const [callSheets, setCallSheets] = useState<Schema['CallSheet']['type'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCallSheets = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const filter: Record<string, unknown> = { organizationId: { eq: organizationId } };
      if (projectId) {
        filter.projectId = { eq: projectId };
      }

      const { data } = await client.models.CallSheet.list({ filter });
      if (data) {
        setCallSheets(data);
      }
    } catch (err) {
      console.error('Error fetching call sheets:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch call sheets'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, projectId]);

  useEffect(() => {
    fetchCallSheets();
  }, [fetchCallSheets]);

  return { callSheets, loading, error, refetch: fetchCallSheets };
}

// Hook for reviews
export function useReviews(organizationId?: string | null, projectId?: string | null) {
  const [reviews, setReviews] = useState<Schema['Review']['type'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const filter: Record<string, unknown> = { organizationId: { eq: organizationId } };
      if (projectId) {
        filter.projectId = { eq: projectId };
      }

      const { data } = await client.models.Review.list({ filter });
      if (data) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, projectId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}

// Hook for review comments
export function useReviewComments(organizationId?: string | null, reviewId?: string | null) {
  const [comments, setComments] = useState<Schema['ReviewComment']['type'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const filter: Record<string, unknown> = { organizationId: { eq: organizationId } };
      if (reviewId) {
        filter.reviewId = { eq: reviewId };
      }

      const { data } = await client.models.ReviewComment.list({ filter });
      if (data) {
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch comments'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, reviewId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, error, refetch: fetchComments };
}

// Hook for notifications
export function useNotifications(userEmail?: string) {
  const [notifications, setNotifications] = useState<Schema['Notification']['type'][]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await client.models.Notification.list({
        filter: { userId: { eq: userEmail } }
      });
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await client.models.Notification.update({
        id: notificationId,
        isRead: true,
        readAt: new Date().toISOString()
      });
      await fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, error, refetch: fetchNotifications, markAsRead };
}

// Export the client for direct usage
export { client };
