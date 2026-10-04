import axios from 'axios';
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1/chat`;

/** Unread = someone else sent it (you are recipient) and it is not read yet. */
function countIncomingUnread(messages, currentUserId) {
  const uid = Number(currentUserId);
  if (!Number.isFinite(uid)) return 0;
  return messages.filter((m) => {
    const rid = Number(m.recipientId);
    const sid = Number(m.senderId);
    const incoming = rid === uid && sid !== uid;
    const notRead = m.status === 'SENT' || m.status === 'DELIVERED';
    return incoming && notRead;
  }).length;
}

export const sendMessage = async (message, token) => {
  logger.debug('API call: sendMessage', { jobId: message?.jobId, recipientId: message?.recipientId });
  return axios.post(`${API_BASE_URL}`, message, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const getMessagesByJob = async (jobId, token) => {
  logger.debug('API call: getMessagesByJob', { jobId });
  return axios.get(`${API_BASE_URL}/job/${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getMessagesForUser = async (jobId, userId, token) => {
  logger.debug('API call: getMessagesForUser', { jobId, userId });
  return axios.get(`${API_BASE_URL}/job/${jobId}/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const markAsDelivered = async (messageId, token) => {
  logger.debug('API call: markAsDelivered', { messageId });
  return axios.patch(`${API_BASE_URL}/${messageId}/delivered`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const markAsRead = async (messageId, token) => {
  logger.debug('API call: markAsRead', { messageId });
  return axios.patch(`${API_BASE_URL}/${messageId}/read`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const archiveMessage = async (messageId, token) => {
  logger.debug('API call: archiveMessage', { messageId });
  return axios.delete(`${API_BASE_URL}/${messageId}/archive`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const streamMessages = (jobId, token, onMessage) => {
  logger.debug('API call: streamMessages', { jobId });
  const eventSource = new EventSource(`${API_BASE_URL}/job/${jobId}/stream?token=${token}`);
  
  eventSource.onmessage = (event) => {
    const message = JSON.parse(event.data);
    onMessage(message);
  };
  
  eventSource.onerror = (error) => {
    logger.error('SSE error:', error);
    eventSource.close();
  };
  
  return () => eventSource.close();
};

function buildChatWebSocketUrl(jobId, token) {
  let rest = BACKEND_BASE_URL.replace(/\/$/, '');
  let wsScheme = 'ws';
  if (rest.startsWith('https://')) {
    wsScheme = 'wss';
    rest = rest.slice('https://'.length);
  } else if (rest.startsWith('http://')) {
    rest = rest.slice('http://'.length);
  }
  const q = `jobId=${encodeURIComponent(String(jobId))}&token=${encodeURIComponent(token)}`;
  return `${wsScheme}://${rest}/ws/chat?${q}`;
}

/**
 * Live messages for a job after they are persisted (same JSON shape as REST).
 * History is still loaded via HTTP; this only pushes new events. Call the returned function to cleanup.
 */
export function subscribeJobChatMessages(jobId, token, onMessage) {
  if (jobId == null || jobId === '' || !token) {
    return () => {};
  }
  let closed = false;
  const socket = new WebSocket(buildChatWebSocketUrl(jobId, token));

  socket.onopen = () => {};
  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      onMessage(message);
    } catch (err) {
      logger.error('Chat WebSocket JSON parse error', err);
    }
  };
  socket.onerror = () => logger.warn('Chat WebSocket error', { jobId });
  socket.onclose = () => {};

  return () => {
    closed = true;
    try {
      socket.close();
    } catch (e) {
      /* ignore */
    }
  };
}

export const getMessagesForRecipient = async (recipientId, page = 1, size = 10, status = null, token) => {
  logger.debug('API call: getMessagesForRecipient', { recipientId, page, size });
  return axios.get(`${API_BASE_URL}/recipient/${recipientId}`, {
    params: {
      page,
      size,
      status
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getMessagesForSender = async (senderId, page = 1, size = 10, status = null, token) => {
  logger.debug('API call: getMessagesForSender', { senderId, page, size });
  try {
    return axios.get(`${API_BASE_URL}/sender/${senderId}`, {
      params: {
        page,
        size,
        status
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    logger.debug('getMessagesForSender: Endpoint not available:', error.message);
    // If the /sender/{senderId} endpoint doesn't exist, return empty
    return {
      data: {
        body: {
          data: {
            messages: []
          }
        }
      }
    };
  }
};

export const getChatList = async (userId, token) => {
  try {
    // Get messages where user is recipient
    const recipientResponse = await getMessagesForRecipient(userId, 1, 20, null, token);
    const recipientMessages = recipientResponse.data.body.data.messages || [];

    // Get all messages for the user (both sent and received)
    let allMessages = [...recipientMessages];

    try {
      const senderMessagesResponse = await getMessagesForSender(userId, 1, 20, null, token);
      const senderMessages = senderMessagesResponse.data.body.data.messages || [];

      // Merge messages, avoiding duplicates
      const messageIds = new Set(recipientMessages.map(m => m.id));
      senderMessages.forEach(message => {
        if (!messageIds.has(message.id)) {
          allMessages.push(message);
          messageIds.add(message.id);
        }
      });
    } catch (error) {
      logger.debug('getChatList: sender messages unavailable', { message: error.message });
    }

    // Group messages by jobId
    const messagesByJob = {};
    allMessages.forEach(message => {
      if (!messagesByJob[message.jobId]) {
        messagesByJob[message.jobId] = [];
      }
      messagesByJob[message.jobId].push(message);
    });

    // Create chat list items with summary info
    const chatList = Object.keys(messagesByJob).map(jobId => {
      const messages = messagesByJob[jobId];
      const unreadCount = countIncomingUnread(messages, userId);
      
      const lastMessage = messages.reduce((latest, current) => 
        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
      );

      return {
        jobId,
        lastMessage: lastMessage.message,
        lastMessageTime: lastMessage.createdAt,
        unreadCount,
        senderId: lastMessage.senderId,
        recipientId: lastMessage.recipientId
      };
    });

    return chatList;
  } catch (error) {
    logger.error('getChatList: Error fetching chat list:', error);
    return [];
  }
};