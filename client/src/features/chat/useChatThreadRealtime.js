import { useEffect, useRef } from 'react';
import { subscribeJobChatMessages } from '../../components/services/chatService';
import logger from '../../utils/logger';

/**
 * Subscribes to server-pushed chat messages for a job thread. Cleanup on unmount or when deps disable the subscription.
 */
export function useChatThreadRealtime(jobId, token, enabled, onIncomingMessage) {
  const handlerRef = useRef(onIncomingMessage);
  handlerRef.current = onIncomingMessage;

  useEffect(() => {
    if (!enabled || jobId == null || jobId === '' || !token) {
      return undefined;
    }
    return subscribeJobChatMessages(jobId, token, (msg) => {
      try {
        handlerRef.current?.(msg);
      } catch (e) {
        logger.error('useChatThreadRealtime handler', e);
      }
    });
  }, [jobId, token, enabled]);
}
