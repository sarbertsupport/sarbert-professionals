import React, { useState, useEffect, useMemo } from 'react';
import { getChatList } from '../../components/services/chatService';
import { getJobById } from '../../components/services/myRequirements';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchUserProfile, fetchUsernameById } from '../../components/services/authProfile';
import { useAuthStore } from '../../store/useAuthStore';
import logger from '../../utils/logger';
import { getJobTitle, formatChatListDate } from './chatsStudentsFormatters';
import { parseLastMessageTimeForSort } from './chatListHelpers';
import {
  ChatInboxShell,
  ChatConversationRow,
  ChatInboxEmptyState
} from './components/ChatInboxShell';

const ChatsStudents = () => {
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastMessage');
  const [sortOrder, setSortOrder] = useState('desc');
  const [usernames, setUsernames] = useState({});
  const [jobDetails, setJobDetails] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const focusJobId = location.state?.focusJobId;
  const { user, token } = useAuthStore();
  const currentUserId = user?.id;

  const handleChatClick = (jobId, recipientId) => {
    navigate(`/client-chat/${jobId}/${recipientId}`);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        if (!token) return;

        const userProfile = await fetchUserProfile(token);
        if (!userProfile?.userId) {
          throw new Error('Failed to fetch user profile');
        }
        const uid = userProfile.userId;

        const chats = await getChatList(uid, token);

        if (!chats || chats.length === 0) {
          if (!cancelled) setChatList([]);
          return;
        }

        const sortedMessages = [...chats].sort((a, b) => {
          const dateA = parseLastMessageTimeForSort(a.lastMessageTime);
          const dateB = parseLastMessageTimeForSort(b.lastMessageTime);
          return dateB - dateA;
        });

        if (cancelled) return;
        setChatList(sortedMessages);
        setLoading(false);

        const uniqueJobIds = [...new Set(sortedMessages.map((c) => c.jobId))];
        const partnerIds = [
          ...new Set(
            sortedMessages.map((chat) =>
              chat.senderId === uid ? chat.recipientId : chat.senderId
            )
          )
        ];

        const [jobResults, nameResults] = await Promise.all([
          Promise.all(
            uniqueJobIds.map(async (jid) => {
              try {
                const job = await getJobById(jid, token);
                return [jid, job];
              } catch (error) {
                logger.error(`Error fetching job details for job ${jid}:`, error);
                return [jid, null];
              }
            })
          ),
          Promise.all(
            partnerIds.map(async (pid) => {
              try {
                const username = await fetchUsernameById(pid, token);
                return [pid, username || `User #${pid}`];
              } catch (error) {
                logger.error(`Error fetching username for user ${pid}:`, error);
                return [pid, `User #${pid}`];
              }
            })
          )
        ]);

        if (cancelled) return;

        const jobsMap = {};
        jobResults.forEach(([jid, job]) => {
          if (job) jobsMap[jid] = job;
        });
        setJobDetails(jobsMap);
        setUsernames(Object.fromEntries(nameResults));
      } catch (error) {
        logger.error('Error fetching chat data:', error);
        if (error.response?.status === 401) {
          useAuthStore.getState().forceLogout();
          navigate('/login');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [navigate, token]);

  const filteredChats = useMemo(() => {
    let filtered = chatList.filter((chat) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return chat.unreadCount > 0;
      return true;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((chat) => {
        const chatPartnerId =
          chat.senderId === currentUserId ? chat.recipientId : chat.senderId;
        const chatPartnerUsername = usernames[chatPartnerId] || `User #${chatPartnerId}`;
        const jobTitle = jobDetails[chat.jobId]?.jobRequirements || '';
        const lastMessage = chat.lastMessage || '';
        return (
          chatPartnerUsername.toLowerCase().includes(q) ||
          jobTitle.toLowerCase().includes(q) ||
          lastMessage.toLowerCase().includes(q)
        );
      });
    }

    filtered.sort((a, b) => {
      if (focusJobId) {
        const aHit = a.jobId === focusJobId ? 1 : 0;
        const bHit = b.jobId === focusJobId ? 1 : 0;
        if (aHit !== bHit) return bHit - aHit;
      }
      if (sortBy === 'lastMessage') {
        const dateA = parseLastMessageTimeForSort(a.lastMessageTime);
        const dateB = parseLastMessageTimeForSort(b.lastMessageTime);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      if (sortBy === 'name') {
        const idA = a.senderId === currentUserId ? a.recipientId : a.senderId;
        const idB = b.senderId === currentUserId ? b.recipientId : b.senderId;
        const nameA = usernames[idA] || `User #${idA}`;
        const nameB = usernames[idB] || `User #${idB}`;
        return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
      }
      return 0;
    });

    return filtered;
  }, [
    chatList,
    activeTab,
    searchQuery,
    sortBy,
    sortOrder,
    usernames,
    jobDetails,
    currentUserId,
    focusJobId
  ]);

  const unreadThreadCount = useMemo(
    () => chatList.filter((c) => c.unreadCount > 0).length,
    [chatList]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600"
            aria-hidden
          />
          <p className="text-sm text-slate-500">Loading your inbox…</p>
        </div>
      </div>
    );
  }

  return (
    <ChatInboxShell
      title="Messages"
      description="Chat with tutors and professionals about your requirements."
      conversationCount={filteredChats.length}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      unreadThreadCount={unreadThreadCount}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      sortBy={sortBy}
      onSortByChange={setSortBy}
      sortOrder={sortOrder}
      onToggleSortOrder={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
    >
      {filteredChats.length === 0 ? (
        <ChatInboxEmptyState hasSearch={Boolean(searchQuery)} />
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredChats.map((chat) => {
            const chatPartnerId =
              chat.senderId === currentUserId ? chat.recipientId : chat.senderId;
            const name = usernames[chatPartnerId] || `User #${chatPartnerId}`;
            const jobDetail = jobDetails[chat.jobId];
            const jobLabel = getJobTitle(jobDetail) || `Job #${chat.jobId}`;
            const deliveryLabel =
              chat.lastMessageStatus === true ? 'Read' : chat.lastMessage ? 'Sent' : null;

            return (
              <ChatConversationRow
                key={`${chat.jobId}-${chatPartnerId}`}
                name={name}
                jobLabel={jobLabel}
                preview={chat.lastMessage || ''}
                timeLabel={formatChatListDate(chat.lastMessageTime)}
                unreadCount={chat.unreadCount || 0}
                deliveryLabel={deliveryLabel}
                onClick={() => handleChatClick(chat.jobId, chatPartnerId)}
              />
            );
          })}
        </div>
      )}
    </ChatInboxShell>
  );
};

export default ChatsStudents;
