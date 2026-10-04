import React from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';

const ErrorBanner = ({ message: propMessage, onRetry }) => {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  // Use the latest error notification if no prop is provided
  const errorNotification = propMessage
    ? { id: null, message: propMessage }
    : notifications.filter((n) => n.type === 'error').slice(-1)[0];

  if (!errorNotification) return null;

  return (
    <div
      className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="bg-red-50 text-red-700 rounded-lg text-sm flex items-center justify-between shadow-lg border border-red-200 px-4 py-3"
        style={{ pointerEvents: 'auto' }}
      >
        <span className="flex-1 pr-4">{errorNotification.message}</span>
        <div className="flex items-center ml-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-blue-600 hover:underline mr-2"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => errorNotification.id && removeNotification(errorNotification.id)}
            className="text-xs text-gray-500 hover:text-gray-700 ml-2"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner; 