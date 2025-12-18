'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * CHAT PAGE
 * Team communication channels.
 */

interface Channel {
  id: string;
  name: string;
  type: 'DEPARTMENT' | 'PROJECT' | 'DIRECT';
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  members: number;
  icon: keyof typeof Icons;
}

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

// Data will be fetched from API
const initialChannels: Channel[] = [];

// Data will be fetched from API
const initialMessages: Message[] = [];

export default function ChatPage() {
  const [channels] = useState<Channel[]>(initialChannels);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  const totalUnread = channels.reduce((sum, ch) => sum + ch.unreadCount, 0);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
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
                  {totalUnread > 0 ? `${totalUnread} unread messages` : 'Quick team communication'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
          {/* Channels Sidebar */}
          <Card className="lg:col-span-1 p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <h3 className="font-semibold text-[var(--text-primary)]">Channels</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {channels.map(channel => {
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
                        channel.type === 'DIRECT' ? 'bg-[var(--accent-muted)]' : 'bg-[var(--bg-2)]'
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
                          <span className="px-1.5 py-0.5 rounded-full bg-[var(--primary)] text-white text-xs font-bold">
                            {channel.unreadCount}
                          </span>
                        )}
                      </div>
                      {channel.lastMessage && (
                        <p className="text-xs text-[var(--text-tertiary)] truncate">{channel.lastMessage}</p>
                      )}
                    </div>
                  </button>
                );
              })}
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
                      <p className="text-xs text-[var(--text-tertiary)]">{selectedChannel.members} members</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Icons.MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.isOwn ? 'order-1' : ''}`}>
                        {!message.isOwn && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-[var(--text-primary)]">{message.sender}</span>
                            <span className="text-xs text-[var(--text-tertiary)]">{message.senderRole}</span>
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-lg ${
                            message.isOwn
                              ? 'bg-[var(--primary)] text-white'
                              : 'bg-[var(--bg-1)]'
                          }`}
                        >
                          <p className={`text-sm ${message.isOwn ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                            {message.content}
                          </p>
                        </div>
                        <span className={`text-xs text-[var(--text-tertiary)] ${message.isOwn ? 'text-right block' : ''}`}>
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Icons.Plus className="w-4 h-4" />
                    </Button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button variant="primary" size="sm" onClick={handleSendMessage}>
                      <Icons.Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Icons.MessageSquare className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">Select a channel to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
