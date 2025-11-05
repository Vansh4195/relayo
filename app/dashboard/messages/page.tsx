'use client';

import { useEffect, useState } from 'react';
import { Send, Phone, Mail, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Message {
  id: string;
  body: string;
  createdAt: string;
  direction: string;
  channel: string;
}

interface ConversationSummary {
  threadId: string;
  customerName: string;
  customerContact: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  channel: string;
  customer: Customer;
}

interface MessageThread {
  threadId: string;
  customer: Customer;
  messages: Message[];
  channel: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);

      // Auto-select first conversation
      if (data.conversations?.length > 0 && !selectedThread) {
        await handleSelectConversation(data.conversations[0].threadId);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectConversation(threadId: string) {
    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) return;

      // Find the conversation in our list
      const conv = conversations.find(c => c.threadId === threadId);
      if (!conv) return;

      // Fetch all messages for this customer
      const customerId = conv.customer.id;
      const response = await fetch(`/api/customers/${customerId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If endpoint doesn't exist yet, create a thread from the conversation
        const thread: MessageThread = {
          threadId: conv.threadId,
          customer: conv.customer,
          messages: [{
            id: '1',
            body: conv.lastMessage,
            createdAt: conv.lastMessageTime,
            direction: 'inbound',
            channel: conv.channel,
          }],
          channel: conv.channel,
        };
        setSelectedThread(thread);
        return;
      }

      const messages = await response.json();
      const thread: MessageThread = {
        threadId: conv.threadId,
        customer: conv.customer,
        messages: messages.map((m: any) => ({
          id: m.id,
          body: m.body,
          createdAt: m.createdAt,
          direction: m.direction,
          channel: m.channel,
        })),
        channel: conv.channel,
      };

      setSelectedThread(thread);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  }

  async function handleSendMessage() {
    if (!messageText.trim() || !selectedThread || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/messages/sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedThread.customer.phone,
          body: messageText,
          customerId: selectedThread.customer.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      setMessageText('');

      // Reload the conversation
      await handleSelectConversation(selectedThread.threadId);
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5BFF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Chat with your customers</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && conversations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">
              Configure Twilio in Settings to start messaging customers.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-220px)] flex">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.threadId}
                  onClick={() => handleSelectConversation(conv.threadId)}
                  className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                    selectedThread?.threadId === conv.threadId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3B5BFF] flex items-center justify-center text-white font-medium flex-shrink-0">
                      {conv.customerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 truncate">{conv.customerName}</p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-[#3B5BFF] text-white text-xs rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(conv.lastMessageTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                        {conv.channel === 'sms' ? (
                          <Phone className="w-3 h-3 text-gray-400" />
                        ) : (
                          <Mail className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        {/* Chat Panel */}
        {selectedThread ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3B5BFF] flex items-center justify-center text-white font-medium">
                  {selectedThread.customer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedThread.customer.name}</p>
                  <p className="text-sm text-gray-600">{selectedThread.customer.phone}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedThread.messages.map((message, index) => {
                const sentByUs = message.direction === 'outbound';
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${sentByUs ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        sentByUs
                          ? 'bg-[#3B5BFF] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.body}</p>
                      <p
                        className={`text-xs mt-1 ${
                          sentByUs ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  className="px-4 py-2 bg-[#3B5BFF] text-white rounded-lg hover:bg-[#2A4BE0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
        </div>
      )}
    </div>
  );
}
