import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send } from 'lucide-react';
import {
  sendMessage,
  getMessagesForUser,
  getMessagesByJob,
  subscribeJobChatMessages,
  markAsRead
} from '../../components/services/chatService';
import { fetchUserProfile } from '../../components/services/authProfile';
import { useAuthStore } from '../../store/useAuthStore';
import logger from '../../utils/logger';
import { formatMessageTime, coerceToDate } from './jobChatHelpers';

const ChatModal = ({
  isOpen,
  receiverId,
  jobId,
  onClose,
  initialMessage = '',
  senderType = 'tutor'
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setError(null);
        const authToken = useAuthStore.getState().token || localStorage.getItem('authToken');
        if (!authToken) throw new Error('No authentication token found');

        setToken(authToken);
        const userProfile = await fetchUserProfile(authToken);
        setUser(userProfile);
      } catch (err) {
        setError('Failed to initialize chat. Please try again.');
        setLoading(false);
      }
    };

    if (isOpen) initializeUser();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !user?.userId || !token || !receiverId) return;

    const fetchMessages = async () => {
      try {
        setError(null);
        setLoading(true);
        let response;
        try {
          response = await getMessagesForUser(jobId, user.userId, token);
        } catch (err) {
          if (err.response && err.response.status === 404) {
            response = await getMessagesByJob(jobId, token);
          } else {
            throw err;
          }
        }
        if (response?.data) {
          const sortedMessages = response.data
            .filter((msg) => msg?.createdAt)
            .sort((a, b) => {
              const ta = coerceToDate(a.createdAt)?.getTime() ?? 0;
              const tb = coerceToDate(b.createdAt)?.getTime() ?? 0;
              return ta - tb;
            });
          setMessages(sortedMessages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        logger.error('Failed to load messages:', err);
        setError('Could not load messages. You can still try sending one.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [isOpen, jobId, receiverId, user, token]);

  useEffect(() => {
    if (!isOpen || !user?.userId || !token || loading || jobId == null) {
      return undefined;
    }
    return subscribeJobChatMessages(jobId, token, (msg) => {
      setMessages((prev) => {
        if (msg?.id != null && prev.some((m) => String(m.id) === String(msg.id))) {
          return prev;
        }
        return [...prev, msg];
      });
      const myId = Number(user.userId);
      const rid = Number(msg.recipientId);
      const sid = Number(msg.senderId);
      if (Number.isFinite(myId) && rid === myId && sid !== myId && msg.id != null) {
        void markAsRead(msg.id, token).catch(() => {});
      }
    });
  }, [isOpen, jobId, user, token, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.userId || !token || !receiverId) return;

    const messageToSend = {
      jobId,
      senderId: user.userId,
      recipientId: receiverId,
      message: newMessage.trim()
    };

    try {
      const tempMessage = {
        ...messageToSend,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'SENDING'
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage('');

      const response = await sendMessage(messageToSend, token);

      if (response?.data) {
        setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? response.data : msg)));
      } else {
        throw new Error('Failed to send message');
      }
    } catch (sendErr) {
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
      setError('Failed to send message. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!isOpen) return null;

  if (!user && loading) {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-600/35 p-4 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex w-full max-w-md flex-col rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex h-28 items-center justify-center">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600"
              aria-hidden
            />
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (error && !loading && !user) {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-600/35 p-4 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
          <p className="mb-4 text-sm text-slate-700">{error}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Close
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const headerLabel =
    senderType === 'tutor' ? 'Message the job poster' : 'Message about your requirement';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-600/35 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id="chat-modal-title" className="text-base font-semibold text-slate-900">
              {headerLabel}
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400">Job #{jobId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-3 sm:px-4">
          {error ? (
            <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {error}
            </p>
          ) : null}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600"
                aria-hidden
              />
              <p className="mt-3 text-sm text-slate-500">Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-800">No messages yet</p>
              <p className="mt-1 text-sm text-slate-500">Send a message to open the thread.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {messages.map((message) => {
                const mine = message.senderId === user.userId;
                return (
                  <li
                    key={message.id}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                        mine
                          ? 'rounded-br-md border border-sky-200 bg-sky-100 text-slate-800'
                          : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
                      <div
                        className={`mt-1.5 flex items-center justify-end gap-2 text-[11px] ${
                          mine ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {mine ? (
                          <span className="opacity-80">
                            {message.status === 'READ'
                              ? 'Read'
                              : message.status === 'DELIVERED'
                                ? 'Delivered'
                                : message.status === 'SENDING'
                                  ? 'Sending'
                                  : 'Sent'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div ref={messagesEndRef} className="h-2" aria-hidden />
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message…"
              rows={1}
              className="min-h-[44px] max-h-32 flex-1 resize-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
          <p className="mt-2 text-[11px] text-slate-400">
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[10px]">Enter</kbd>{' '}
            to send ·{' '}
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[10px]">
              Shift+Enter
            </kbd>{' '}
            new line
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChatModal;
