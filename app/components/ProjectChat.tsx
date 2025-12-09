'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

type Message = Schema['Message']['type'];
type Project = Schema['Project']['type'];

interface ProjectChatProps {
  projectId: string;
  project: Project;
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserRole?: string;
}

export default function ProjectChat({
  projectId,
  project,
  currentUserEmail = 'user@example.com',
  currentUserName = 'Current User',
  currentUserRole = 'Team Member',
}: ProjectChatProps) {
  const [client] = useState(() => generateClient<Schema>());
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  // Load messages
  useEffect(() => {
    // Check if Message model is available (schema deployed)
    if (!client.models.Message) {
      console.log('Message model not yet available - waiting for schema deployment');
      return;
    }

    const subscription = client.models.Message.observeQuery({
      filter: {
        projectId: { eq: projectId },
        isDeleted: { ne: true },
      },
    }).subscribe({
      next: (data) => {
        if (data?.items) {
          setMessages([...data.items].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ));
        }
      },
      error: (error) => console.error('Error loading messages:', error),
    });

    return () => subscription.unsubscribe();
  }, [projectId, client]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter and search messages
  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(m => m.messageType === filterType);
    }

    // Search filter
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

  // Organize messages into threads
  const threadedMessages = useMemo(() => {
    const topLevel = filteredMessages.filter(m => !m.parentMessageId);
    return topLevel.map((msg: Message) => ({
      ...msg,
      replies: filteredMessages.filter((m: Message) => m.parentMessageId === msg.id),
    }));
  }, [filteredMessages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessageText.trim() || isSending) return;

    setIsSending(true);
    try {
      // Extract @mentions
      const mentionRegex = /@(\S+)/g;
      const mentions = [...newMessageText.matchAll(mentionRegex)].map(m => m[1]);

      await client.models.Message.create({
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
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Edit message
  const handleEditMessage = async () => {
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
      alert('Failed to edit message. Please try again.');
    }
  };

  // Delete message
  const handleDeleteMessage = async (message: Message) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await client.models.Message.update({
        id: message.id,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  // Convert message to task
  const handleConvertToTask = async (message: Message) => {
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

      alert('Message converted to task successfully!');
    } catch (error) {
      console.error('Error converting to task:', error);
      alert('Failed to convert message to task. Please try again.');
    }
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

  // Get message type badge
  const getMessageTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      GENERAL: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'General' },
      TASK: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Task' },
      ALERT: { bg: 'bg-red-100', text: 'text-red-800', label: 'Alert' },
      APPROVAL_REQUEST: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Approval Request' },
      FILE_SHARE: { bg: 'bg-green-100', text: 'text-green-800', label: 'File Share' },
    };

    const badge = badges[type] || badges.GENERAL;
    return (
      <span className={`px-2 py-0.5 text-xs rounded ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    if (priority === 'NORMAL' || priority === 'LOW') return null;

    const badges: Record<string, { bg: string; text: string; label: string }> = {
      URGENT: { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgent' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High Priority' },
    };

    const badge = badges[priority];
    if (!badge) return null;

    return (
      <span className={`px-2 py-0.5 text-xs rounded ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Render a single message
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
              isOwnMessage ? 'bg-blue-600' : 'bg-gray-600'
            }`}>
              {message.senderName?.charAt(0).toUpperCase() || message.senderEmail.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900">
                {message.senderName || message.senderEmail}
              </div>
              <div className="text-xs text-gray-500">
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
          <div className={`p-3 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}>
            {isEditing ? (
              <div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-gray-900"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleEditMessage}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setEditText('');
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">{message.messageText}</p>
            )}

            {message.convertedToTask && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <div className="text-xs opacity-90">
                  ✅ Converted to task
                  {message.taskAssignedTo && ` • Assigned to: ${message.taskAssignedTo}`}
                  {message.taskDeadline && ` • Due: ${new Date(message.taskDeadline).toLocaleDateString()}`}
                </div>
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div className="flex gap-2 mt-1 text-xs">
            <button
              onClick={() => setReplyingTo(message)}
              className="text-blue-600 hover:underline"
            >
              Reply
            </button>
            {isOwnMessage && !isEditing && (
              <>
                <button
                  onClick={() => {
                    setEditingMessage(message);
                    setEditText(message.messageText);
                  }}
                  className="text-gray-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMessage(message)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </>
            )}
            {!message.convertedToTask && (
              <button
                onClick={() => handleConvertToTask(message)}
                className="text-green-600 hover:underline"
              >
                Convert to Task
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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Discussion</h2>
            <p className="text-sm text-gray-600">{project.name}</p>
          </div>
          <div className="text-sm text-gray-600">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">
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
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
          <div className="text-sm text-blue-900">
            Replying to <span className="font-semibold">{replyingTo.senderName || replyingTo.senderEmail}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessageText.trim() || isSending}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !newMessageText.trim() || isSending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Tip: Use <span className="font-mono bg-gray-100 px-1 rounded">@username</span> to mention someone • Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
