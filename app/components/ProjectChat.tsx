'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from './Toast';

/**
 * PROJECT CHAT COMPONENT
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const MessageCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7"/>
    <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const ListTodoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="6" height="6" rx="1"/>
    <path d="m3 17 2 2 4-4"/>
    <path d="M13 6h8"/>
    <path d="M13 12h8"/>
    <path d="M13 18h8"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

type Message = Schema['Message']['type'];
type Project = Schema['Project']['type'];

interface ProjectChatProps {
  projectId: string;
  project: Project;
  organizationId?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserRole?: string;
}

export default function ProjectChat({
  projectId,
  project,
  organizationId,
  currentUserEmail = 'user@example.com',
  currentUserName = 'Current User',
  currentUserRole = 'Team Member',
}: ProjectChatProps) {
  const toast = useToast();
  const orgId = organizationId || 'default-org';
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);
  const [newMessageText, setNewMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!client) return;
    if (!client.models.Message) {
      console.log('Message model not yet available - waiting for schema deployment');
      return;
    }

    client.models.Message.list({
      filter: {
        projectId: { eq: projectId },
        isDeleted: { ne: true },
      },
    }).then((data) => {
      if (data.data) {
        setMessages([...data.data].sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ));
      }
    }).catch(console.error);
  }, [projectId, client]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredMessages = useMemo(() => {
    let filtered = messages;

    if (filterType !== 'ALL') {
      filtered = filtered.filter(m => m.messageType === filterType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.messageText.toLowerCase().includes(query) ||
        m.senderName?.toLowerCase().includes(query) ||
        m.senderEmail.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [messages, filterType, searchQuery]);

  const threadedMessages = useMemo(() => {
    const topLevel = filteredMessages.filter(m => !m.parentMessageId);
    return topLevel.map((msg: Message) => ({
      ...msg,
      replies: filteredMessages.filter((m: Message) => m.parentMessageId === msg.id),
    }));
  }, [filteredMessages]);

  const handleSendMessage = async () => {
    if (!client) return;
    if (!newMessageText.trim() || isSending) return;

    setIsSending(true);
    try {
      const mentionRegex = /@(\S+)/g;
      const mentions = [...newMessageText.matchAll(mentionRegex)].map(m => m[1]);

      await client.models.Message.create({
        organizationId: orgId,
        projectId,
        senderId: currentUserEmail,
        senderEmail: currentUserEmail,
        senderName: currentUserName,
        senderRole: currentUserRole,
        messageText: newMessageText.trim(),
        messageType: 'GENERAL',
        priority: 'NORMAL',
        parentMessageId: replyingTo?.id || undefined,
        threadDepth: replyingTo ? (replyingTo.threadDepth || 0) + 1 : 0,
        mentionedUsers: mentions.length > 0 ? mentions : undefined,
        readBy: [currentUserEmail],
      });

      setNewMessageText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', 'Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async () => {
    if (!client) return;
    if (!editingMessage || !editText.trim()) return;

    try {
      await client.models.Message.update({
        id: editingMessage.id,
        messageText: editText.trim(),
        isEdited: true,
        editedAt: new Date().toISOString(),
      });

      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message', 'Please try again.');
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    if (!client) return;
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await client.models.Message.update({
        id: message.id,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message', 'Please try again.');
    }
  };

  const handleConvertToTask = async (message: Message) => {
    if (!client) return;
    const assignTo = prompt('Assign task to (email):');
    if (!assignTo) return;

    const deadlineStr = prompt('Task deadline (YYYY-MM-DD):');
    if (!deadlineStr) return;

    try {
      await client.models.Message.update({
        id: message.id,
        convertedToTask: true,
        taskAssignedTo: assignTo,
        taskDeadline: new Date(deadlineStr).toISOString(),
      });

      toast.success('Task created', 'Message converted to task successfully!');
    } catch (error) {
      console.error('Error converting to task:', error);
      toast.error('Failed to convert to task', 'Please try again.');
    }
  };

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

  const getMessageTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; color: string; label: string }> = {
      GENERAL: { bg: 'var(--bg-2)', color: 'var(--text-secondary)', label: 'General' },
      TASK: { bg: 'var(--primary-muted)', color: 'var(--primary)', label: 'Task' },
      ALERT: { bg: 'var(--error-muted)', color: 'var(--error)', label: 'Alert' },
      APPROVAL_REQUEST: { bg: 'var(--warning-muted)', color: 'var(--warning)', label: 'Approval' },
      FILE_SHARE: { bg: 'var(--success-muted)', color: 'var(--success)', label: 'File' },
    };

    const badge = badges[type] || badges.GENERAL;
    return (
      <span
        className="px-2 py-0.5 text-[11px] font-bold rounded"
        style={{ background: badge.bg, color: badge.color }}
      >
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'NORMAL' || priority === 'LOW') return null;

    const badges: Record<string, { bg: string; color: string; label: string }> = {
      URGENT: { bg: 'var(--error-muted)', color: 'var(--error)', label: 'Urgent' },
      HIGH: { bg: 'var(--warning-muted)', color: 'var(--warning)', label: 'High' },
    };

    const badge = badges[priority];
    if (!badge) return null;

    return (
      <span
        className="px-2 py-0.5 text-[11px] font-bold rounded"
        style={{ background: badge.bg, color: badge.color }}
      >
        {badge.label}
      </span>
    );
  };

  const renderMessage = (message: Message & { replies?: Message[] }, isReply = false) => {
    const isOwnMessage = message.senderEmail === currentUserEmail;
    const isEditing = editingMessage?.id === message.id;

    return (
      <div
        key={message.id}
        className={`${isReply ? 'ml-8 mt-2' : 'mt-4'} ${isOwnMessage ? 'text-right' : ''}`}
      >
        <div className={`inline-block max-w-2xl ${isOwnMessage ? 'text-left' : ''}`}>
          {/* Message Header */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px]"
              style={{
                background: isOwnMessage ? 'var(--primary)' : 'var(--bg-3)',
                color: isOwnMessage ? 'var(--bg-0)' : 'var(--text-primary)',
              }}
            >
              {message.senderName?.charAt(0).toUpperCase() || message.senderEmail.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                {message.senderName || message.senderEmail}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                {message.senderRole} • {formatTimestamp(message.createdAt)}
                {message.isEdited && <span className="ml-1">(edited)</span>}
              </div>
            </div>
            <div className="flex gap-1">
              {getMessageTypeBadge(message.messageType || 'GENERAL')}
              {getPriorityBadge(message.priority || 'NORMAL')}
            </div>
          </div>

          {/* Message Body */}
          <div
            className="p-3 rounded-[10px]"
            style={{
              background: isOwnMessage ? 'var(--primary)' : 'var(--bg-2)',
              color: isOwnMessage ? 'white' : 'var(--text-primary)',
            }}
          >
            {isEditing ? (
              <div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 rounded-[6px] text-[14px]"
                  style={{
                    background: 'var(--bg-1)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleEditMessage}
                    className="px-3 py-1 rounded-[6px] text-[12px] font-semibold transition-all duration-[80ms]"
                    style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setEditText('');
                    }}
                    className="px-3 py-1 rounded-[6px] text-[12px] font-semibold transition-all duration-[80ms]"
                    style={{ background: 'var(--bg-3)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words text-[14px]">{message.messageText}</p>
            )}

            {message.convertedToTask && (
              <div
                className="mt-2 pt-2 flex items-center gap-2 text-[12px]"
                style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}
              >
                <CheckCircleIcon />
                <span>
                  Converted to task
                  {message.taskAssignedTo && ` • Assigned to: ${message.taskAssignedTo}`}
                  {message.taskDeadline && ` • Due: ${new Date(message.taskDeadline).toLocaleDateString()}`}
                </span>
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div className="flex gap-3 mt-1 text-[12px]">
            <button
              onClick={() => setReplyingTo(message)}
              className="flex items-center gap-1 transition-colors"
              style={{ color: 'var(--primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <ReplyIcon /> Reply
            </button>
            {isOwnMessage && !isEditing && (
              <>
                <button
                  onClick={() => {
                    setEditingMessage(message);
                    setEditText(message.messageText);
                  }}
                  className="flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                >
                  <EditIcon /> Edit
                </button>
                <button
                  onClick={() => handleDeleteMessage(message)}
                  className="flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--error)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <TrashIcon /> Delete
                </button>
              </>
            )}
            {!message.convertedToTask && (
              <button
                onClick={() => handleConvertToTask(message)}
                className="flex items-center gap-1 transition-colors"
                style={{ color: 'var(--success)' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <ListTodoIcon /> To Task
              </button>
            )}
          </div>

          {/* Replies */}
          {message.replies && message.replies.length > 0 && (
            <div className="mt-2">
              {message.replies.map(reply => renderMessage(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-0)' }}>
      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--primary)' }}><MessageCircleIcon /></span>
            <div>
              <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
                Project Discussion
              </h2>
              <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                {project.name}
              </p>
            </div>
          </div>
          <div className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-[13px] rounded-[6px]"
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-[13px] rounded-[6px]"
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Types</option>
            <option value="GENERAL">General</option>
            <option value="TASK">Tasks</option>
            <option value="ALERT">Alerts</option>
            <option value="APPROVAL_REQUEST">Approval Requests</option>
            <option value="FILE_SHARE">File Shares</option>
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4" style={{ color: 'var(--text-tertiary)' }}>
              <MessageCircleIcon />
            </div>
            <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No messages yet
            </h3>
            <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
              {searchQuery || filterType !== 'ALL'
                ? 'No messages match your filters'
                : 'Start the conversation by sending a message below'}
            </p>
          </div>
        ) : (
          <div>
            {threadedMessages.map(message => renderMessage(message))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div
          className="px-4 py-2 flex items-center justify-between"
          style={{ background: 'var(--primary-muted)', borderTop: '1px solid var(--primary)' }}
        >
          <div className="text-[13px]" style={{ color: 'var(--primary)' }}>
            Replying to <span className="font-semibold">{replyingTo.senderName || replyingTo.senderEmail}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="flex items-center gap-1 text-[13px]"
            style={{ color: 'var(--primary)' }}
          >
            <XIcon /> Cancel
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-2">
          <textarea
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message... (Use @ to mention someone, Shift+Enter for new line)"
            className="flex-1 px-3 py-2 rounded-[6px] text-[14px] resize-none"
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            rows={3}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessageText.trim() || isSending}
            className="px-4 py-2 rounded-[6px] font-semibold text-[14px] flex items-center gap-2 transition-all duration-[80ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            <SendIcon />
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="mt-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          Tip: Use <span
            className="font-mono px-1 rounded"
            style={{ background: 'var(--bg-2)' }}
          >@username</span> to mention someone • Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
