import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMessagesForUser,
  sendMessage,
  markAsRead
} from '../../components/services/chatService';
import logger from '../../utils/logger';
import { fetchUserProfile, fetchUsernameById } from '../../components/services/authProfile';
import { getJobById } from '../../components/services/myRequirements';
import { useAuthStore } from '../../store/useAuthStore';
import { ROUTES } from '../../constants/routes';
import { getFirstWords } from './chatListHelpers';
import {
  ChatThreadShell,
  ChatMessageTimeline,
  ChatMessageComposer,
  ChatThreadLoading
} from './components/ChatThreadShell';
import { useChatThreadRealtime } from './useChatThreadRealtime';

const JobChatStudents = () => {
  const { jobId, recipientId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [posterUserId, setPosterUserId] = useState(null);
  const [jobRequirements, setJobRequirements] = useState('');
  const [usernames, setUsernames] = useState({});
  const [partnerLabel, setPartnerLabel] = useState('');
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const token = useAuthStore.getState().token || localStorage.getItem('authToken');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [newMessage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          setLoading(false);
          navigate('/login');
          return;
        }

        if (!useAuthStore.getState().isTokenValid()) {
          setLoading(false);
          useAuthStore.getState().forceLogout();
          navigate('/login');
          return;
        }

        const rid = recipientId ? parseInt(recipientId, 10) : null;

        const [profile, jobDetails, partnerName] = await Promise.all([
          fetchUserProfile(token),
          getJobById(jobId, token),
          rid ? fetchUsernameById(rid, token).catch(() => null) : Promise.resolve(null)
        ]);

        const posterId = jobDetails.userId;
        setUserProfile(profile);
        setPosterUserId(posterId);
        setJobRequirements(jobDetails.jobRequirements || '');
        if (rid) {
          setPartnerLabel(partnerName || `User ${rid}`);
        }

        const response = await getMessagesForUser(jobId, profile.userId, token);
        const data = response.data || [];
        setMessages(data);

        const uniqueUserIds = [...new Set(data.map((m) => m.senderId))];
        const namePairs = await Promise.all(
          uniqueUserIds.map(async (id) => {
            try {
              const u = await fetchUsernameById(id, token);
              return [id, u || `User ${id}`];
            } catch (error) {
              logger.error('Error fetching username:', error);
              return [id, `User ${id}`];
            }
          })
        );
        setUsernames(Object.fromEntries(namePairs));

        const myId = Number(profile.userId);
        const unreadMessages = data.filter((msg) => {
          const sid = Number(msg.senderId);
          const rid = Number(msg.recipientId);
          return (
            rid === myId &&
            sid !== myId &&
            (msg.status === 'SENT' || msg.status === 'DELIVERED')
          );
        });
        setLoading(false);
        if (unreadMessages.length > 0) {
          void Promise.all(unreadMessages.map((msg) => markAsRead(msg.id, token))).catch(() => {});
        }
      } catch (error) {
        logger.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          useAuthStore.getState().forceLogout();
          navigate('/login');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, token, navigate, recipientId]);

  const handleIncomingMessage = useCallback(
    (msg) => {
      if (!msg || !userProfile) return;
      setMessages((prev) => {
        const mid = msg.id;
        if (mid != null && prev.some((m) => String(m.id) === String(mid))) {
          return prev;
        }
        return [...prev, msg];
      });
      const myId = Number(userProfile.userId);
      const rid = Number(msg.recipientId);
      const sid = Number(msg.senderId);
      if (Number.isFinite(myId) && rid === myId && sid !== myId && msg.id != null) {
        void markAsRead(msg.id, token).catch(() => {});
      }
      const senderId = msg.senderId;
      if (senderId != null) {
        setUsernames((prev) => {
          if (prev[senderId]) return prev;
          void fetchUsernameById(senderId, token)
            .then((u) =>
              setUsernames((p) => ({ ...p, [senderId]: u || `User ${senderId}` }))
            )
            .catch(() => {});
          return prev;
        });
      }
    },
    [userProfile, token]
  );

  useChatThreadRealtime(jobId, token, Boolean(userProfile && !loading), handleIncomingMessage);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile) return;

    try {
      const fromRoute = recipientId ? parseInt(recipientId, 10) : null;
      let finalRecipientId = messages.find((m) => m.senderId !== userProfile.userId)?.senderId;

      if (!finalRecipientId && fromRoute) {
        finalRecipientId = fromRoute;
      }
      if (!finalRecipientId && posterUserId) {
        finalRecipientId = posterUserId;
      }

      if (!finalRecipientId) {
        logger.error('Recipient ID not found');
        return;
      }

      const messageData = {
        jobId: parseInt(jobId, 10),
        senderId: userProfile.userId,
        message: newMessage.trim(),
        recipientId: finalRecipientId
      };

      const response = await sendMessage(messageData, token);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      logger.error('Error sending message:', error);
    }
  };

  if (loading || !userProfile) {
    return <ChatThreadLoading />;
  }

  const chatTitle = jobRequirements ? getFirstWords(jobRequirements, 12) : `Job #${jobId}`;

  return (
    <ChatThreadShell
      title={chatTitle}
      subtitle={partnerLabel ? `Conversation with ${partnerLabel}` : undefined}
      jobId={jobId}
      onBack={() => navigate(ROUTES.CLIENT_MESSAGES)}
      backLabel="Messages"
      composer={
        <ChatMessageComposer
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSendMessage}
          onKeyDown={handleKeyDown}
          textareaRef={textareaRef}
          maxLen={4000}
        />
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatMessageTimeline
          messages={messages}
          currentUserId={userProfile.userId}
          usernames={usernames}
          emptyTitle="No messages yet"
          emptySubtitle="Send a message to follow up on this job."
        />
        <div ref={messagesEndRef} className="h-2 shrink-0" aria-hidden />
      </div>
    </ChatThreadShell>
  );
};

export default JobChatStudents;
