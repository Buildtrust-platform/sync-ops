'use client';

import { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useRouter } from 'next/navigation';

type Notification = Schema['Notification']['type'];

interface NotificationCenterProps {
  currentUserEmail?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({
  currentUserEmail = 'user@example.com',
  isOpen,
  onClose,
}: NotificationCenterProps) {
  const [client] = useState(() => generateClient<Schema>());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const router = useRouter();

  // Load notifications
  useEffect(() => {
    if (!currentUserEmail) return;

    // Check if Notification model is available (schema deployed)
    if (!client.models.Notification) {
      console.log('Notification model not yet available - waiting for schema deployment');
      return;
    }

    const subscription = client.models.Notification.observeQuery({
      filter: {
        userId: { eq: currentUserEmail },
      },
    }).subscribe({
      next: (data) => {
        if (data?.items) {
          // Sort by created date (newest first)
          const sorted = [...data.items].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setNotifications(sorted);
        }
      },
      error: (error) => console.error('Error loading notifications:', error),
    });

    return () => subscription.unsubscribe();
  }, [currentUserEmail, client]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by type
    if (filter !== 'ALL') {
      filtered = filtered.filter(n => n.type === filter);
    }

    // Filter by read status
    if (showUnreadOnly) {
      filtered = filtered.filter(n => !n.isRead);
    }

    return filtered;
  }, [notifications, filter, showUnreadOnly]);

  // Count unread
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Mark as read
  const markAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      await client.models.Notification.update({
        id: notification.id,
        isRead: true,
        readAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);

    try {
      await Promise.all(
        unread.map(notification =>
          client.models.Notification.update({
            id: notification.id,
            isRead: true,
            readAt: new Date().toISOString(),
          })
        )
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notification: Notification) => {
    try {
      await client.models.Notification.delete({ id: notification.id });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification);

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      MESSAGE: '💬',
      MENTION: '@',
      TASK_ASSIGNED: '📋',
      TASK_DUE_SOON: '⏰',
      APPROVAL_REQUESTED: '✋',
      APPROVAL_GRANTED: '✅',
      APPROVAL_DENIED: '❌',
      COMMENT_ADDED: '💭',
      COMMENT_REPLY: '↩️',
      ASSET_UPLOADED: '📁',
      LIFECYCLE_CHANGED: '🔄',
      GREENLIGHT_APPROVED: '🚀',
      LEGAL_LOCK: '🔒',
      REVIEW_ASSIGNED: '👀',
      DEADLINE_APPROACHING: '⚠️',
      FIELD_ALERT: '🌩️',
    };
    return icons[type] || '📢';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      URGENT: 'border-l-4 border-red-500 bg-red-50',
      HIGH: 'border-l-4 border-orange-500 bg-orange-50',
      NORMAL: '',
      LOW: '',
    };
    return colors[priority] || '';
  };

  // Format timestamp
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                unreadCount === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Mark all read
            </button>
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showUnreadOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showUnreadOnly ? 'Show all' : 'Unread only'}
            </button>
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All notifications</option>
            <option value="MESSAGE">Messages</option>
            <option value="MENTION">Mentions</option>
            <option value="TASK_ASSIGNED">Tasks</option>
            <option value="APPROVAL_REQUESTED">Approvals</option>
            <option value="COMMENT_ADDED">Comments</option>
            <option value="LIFECYCLE_CHANGED">Project Updates</option>
            <option value="DEADLINE_APPROACHING">Deadlines</option>
            <option value="FIELD_ALERT">Field Alerts</option>
          </select>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-600 text-sm">
                {showUnreadOnly
                  ? "You're all caught up!"
                  : filter !== 'ALL'
                  ? 'No notifications match your filter'
                  : "You'll see notifications here when there's activity"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  } ${getPriorityColor(notification.priority || 'NORMAL')}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type || 'MESSAGE')}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-semibold ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification);
                          }}
                          className="text-gray-400 hover:text-red-600 text-sm"
                        >
                          ×
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>

                      {notification.projectName && (
                        <div className="text-xs text-gray-500 mb-1">
                          📁 {notification.projectName}
                        </div>
                      )}

                      {notification.senderName && (
                        <div className="text-xs text-gray-500 mb-1">
                          👤 {notification.senderName}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.createdAt)}
                        </span>

                        {notification.actionLabel && notification.actionUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {notification.actionLabel} →
                          </button>
                        )}
                      </div>

                      {!notification.isRead && (
                        <div className="mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification);
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Mark as read
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="border-t border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </>
  );
}
