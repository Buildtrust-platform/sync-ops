'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Icons, Card, Button, Skeleton, Badge } from '@/app/components/ui';

/**
 * PRODUCTION CHAT PAGE
 * Team communication channels connected to Amplify Message model
 */

const client = generateClient<Schema>({ authMode: 'userPool' });

interface Channel {
  id: string;
  name: string;
  type: 'DEPARTMENT' | 'PROJECT' | 'GENERAL';
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  members: number;
  icon: keyof typeof Icons;
}

interface DisplayMessage {
  id: string;
  sender: string;
  senderRole: string;
  senderEmail: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  messageType?: 'GENERAL' | 'TASK' | 'ALERT' | 'APPROVAL_REQUEST' | 'FILE_SHARE';
}

// Mock channel list (in production, this would come from a Channel model)
const MOCK_CHANNELS: Channel[] = [
  {
    id: 'general',
    name: 'General',
    type: 'GENERAL',
    unreadCount: 3,
    lastMessage: 'Ready for the 2pm shoot',
    lastMessageTime: '2m ago',
    members: 12,
    icon: 'MessageSquare',
  },
  {
    id: 'camera-dept',
    name: 'Camera Dept',
    type: 'DEPARTMENT',
    unreadCount: 0,
    lastMessage: 'Camera 2 battery needs charging',
    lastMessageTime: '15m ago',
    members: 4,
    icon: 'Camera',
  },
  {
    id: 'lighting-dept',
    name: 'Lighting Dept',
    type: 'DEPARTMENT',
    unreadCount: 1,
    lastMessage: 'Moving to Scene 4 setup',
    lastMessageTime: '1h ago',
    members: 3,
    icon: 'Lightbulb',
  },
  {
    id: 'audio-dept',
    name: 'Audio Dept',
    type: 'DEPARTMENT',
    unreadCount: 0,
    lastMessage: 'Lav mics ready',
    lastMessageTime: '2h ago',
    members: 2,
    icon: 'Mic',
  },
  {
    id: 'production-office',
    name: 'Production Office',
    type: 'DEPARTMENT',
    unreadCount: 5,
    lastMessage: 'Updated call sheet sent',
    lastMessageTime: '30m ago',
    members: 8,
    icon: 'Briefcase',
  },
];

export default function ChatPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const attributes = await fetchUserAttributes();
        setCurrentUserEmail(attributes.email || '');
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    }
    fetchUser();
  }, []);

  // Fetch messages for selected channel
  const fetchMessages = useCallback(async () => {
    if (!organizationId || !selectedChannel) return;

    setLoading(true);
    setError(null);

    try {
      const { data: messagesData } = await client.models.Message.list({
        filter: {
          organizationId: { eq: organizationId },
          // In a real implementation, we'd filter by channel/project ID
          // For now, we'll show all messages
        }
      });

      if (!messagesData) {
        setMessages([]);
        return;
      }

      // Map to display format
      const displayMessages: DisplayMessage[] = messagesData.map(msg => ({
        id: msg.id,
        sender: msg.senderName || msg.senderEmail,
        senderRole: msg.senderRole || 'Team Member',
        senderEmail: msg.senderEmail,
        content: msg.messageText,
        timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        isOwn: msg.senderEmail === currentUserEmail,
        priority: msg.priority || 'NORMAL',
        messageType: msg.messageType || 'GENERAL',
      }));

      // Sort by creation time (oldest first for chat)
      displayMessages.sort((a, b) => {
        const dateA = messagesData.find(m => m.id === a.id)?.createdAt || '';
        const dateB = messagesData.find(m => m.id === b.id)?.createdAt || '';
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

      setMessages(displayMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, selectedChannel, currentUserEmail]);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages();
    }
  }, [selectedChannel, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !organizationId || !selectedChannel || !currentUserEmail) return;

    try {
      const attributes = await fetchUserAttributes();

      await client.models.Message.create({
        organizationId,
        projectId: 'production-chat', // In real app, this would be the actual project ID
        senderId: attributes.sub || '',
        senderEmail: currentUserEmail,
        senderName: attributes.name || attributes.email || 'Anonymous',
        senderRole: 'Production',
        messageText: newMessage,
        messageType: 'GENERAL',
        priority: 'NORMAL',
        threadDepth: 0,
      });

      setNewMessage('');

      // Refresh messages
      await fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const filteredMessages = messages.filter(msg =>
    searchQuery ? msg.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const totalUnread = channels.reduce((sum, ch) => sum + ch.unreadCount, 0);

  const isLoading = orgLoading;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-production)', color: 'white' }}
              >
                <Icons.MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Team Chat</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  {totalUnread > 0 ? `${totalUnread} unread messages` : 'Real-time team communication'}
                </p>
              </div>
            </div>
            {selectedChannel && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 pl-10 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
          {/* Channels Sidebar */}
          <Card className="lg:col-span-1 p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">Channels</h3>
              {totalUnread > 0 && (
                <Badge variant="danger" size="sm">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton variant="circular" className="w-8 h-8" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                channels.map(channel => {
                  const ChannelIcon = Icons[channel.icon];
                  const isSelected = selectedChannel?.id === channel.id;

                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${
                        isSelected ? 'bg-[var(--primary-muted)]' : 'hover:bg-[var(--bg-1)]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          channel.type === 'GENERAL' ? 'bg-[var(--primary-muted)]' : 'bg-[var(--bg-2)]'
                        }`}
                      >
                        <ChannelIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium truncate ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                            {channel.name}
                          </span>
                          {channel.unreadCount > 0 && (
                            <Badge variant="danger" size="sm" className="ml-2">
                              {channel.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {channel.lastMessage && (
                          <p className="text-xs text-[var(--text-tertiary)] truncate">{channel.lastMessage}</p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 p-0 overflow-hidden flex flex-col">
            {selectedChannel ? (
              <>
                {/* Channel Header */}
                <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                      {(() => {
                        const Icon = Icons[selectedChannel.icon];
                        return <Icon className="w-5 h-5 text-[var(--text-tertiary)]" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{selectedChannel.name}</h3>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {selectedChannel.members} members • {selectedChannel.type.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Icons.MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                {/* Error State */}
                {error && (
                  <div className="p-4 bg-[var(--danger)]/10 border-b border-[var(--danger)]">
                    <div className="flex items-center gap-2 text-[var(--danger)] text-sm">
                      <Icons.AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                      <Button variant="ghost" size="sm" onClick={fetchMessages} className="ml-auto">
                        Retry
                      </Button>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[70%] space-y-2">
                            {i % 2 !== 0 && (
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                            )}
                            <Skeleton className="h-16 w-64" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Icons.MessageSquare className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
                      <p className="text-[var(--text-secondary)] font-medium">No messages yet</p>
                      <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        Start the conversation in #{selectedChannel.name}
                      </p>
                    </div>
                  ) : (
                    filteredMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${message.isOwn ? 'order-1' : ''}`}>
                          {!message.isOwn && (
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold">
                                {message.sender.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-[var(--text-primary)]">{message.sender}</span>
                              <span className="text-xs text-[var(--text-tertiary)]">{message.senderRole}</span>
                            </div>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              message.isOwn
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--bg-1)] border border-[var(--border-default)]'
                            }`}
                          >
                            {message.priority === 'HIGH' || message.priority === 'URGENT' ? (
                              <div className="flex items-center gap-2 mb-1">
                                <Icons.AlertCircle className="w-3 h-3" />
                                <span className="text-xs font-bold uppercase">
                                  {message.priority}
                                </span>
                              </div>
                            ) : null}
                            <p className={`text-sm ${message.isOwn ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                              {message.content}
                            </p>
                          </div>
                          <div className={`flex items-center gap-2 mt-1 ${message.isOwn ? 'justify-end' : ''}`}>
                            <span className="text-xs text-[var(--text-tertiary)]">
                              {message.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Icons.Plus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message #${selectedChannel.name.toLowerCase()}...`}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Icons.Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Icons.MessageSquare className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-lg font-medium text-[var(--text-primary)] mb-2">Select a channel</p>
                  <p className="text-[var(--text-tertiary)]">Choose a channel from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
