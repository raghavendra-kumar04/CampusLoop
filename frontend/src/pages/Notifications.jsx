import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.link && notif.link !== '/' && notif.link !== '/home') {
      navigate(notif.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'chat':
        return 'forum';
      case 'rating':
        return 'star';
      case 'save':
        return 'favorite';
      case 'purchase':
        return 'shopping_bag';
      case 'listing':
        return 'new_releases';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'chat':
        return 'text-blue-500 bg-blue-500/10';
      case 'rating':
        return 'text-amber-500 bg-amber-500/10';
      case 'save':
        return 'text-red-500 bg-red-500/10';
      case 'purchase':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'listing':
        return 'text-purple-500 bg-purple-500/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-on-primary font-label-md text-xs px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          
          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-xl bg-surface-container-lowest border border-outline-variant/30 rounded-2xl text-center gap-4 py-16">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline-variant">
              <span className="material-symbols-outlined text-4xl">notifications_off</span>
            </div>
            <div>
              <p className="font-headline-md text-headline-md text-on-surface">All caught up!</p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">You don't have any notifications right now.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex gap-4 items-start ${
                  notif.isRead
                    ? 'bg-surface-container-lowest border-outline-variant/10 hover:bg-surface-container-low/30'
                    : 'bg-primary-container/5 border-primary/20 shadow-[0_2px_8px_rgba(79,70,229,0.06)] hover:bg-primary-container/10'
                }`}
              >
                {/* Icon Column */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconColor(notif.type)}`}>
                  <span className="material-symbols-outlined text-[20px]">{getIcon(notif.type)}</span>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <p className={`text-label-md font-label-md ${notif.isRead ? 'text-on-surface' : 'text-primary'}`}>
                      {notif.title}
                    </p>
                    <span className="font-caption text-caption text-on-surface-variant whitespace-nowrap pt-0.5">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-snug">
                    {notif.message}
                  </p>
                </div>

                {/* Unread Indicator dot */}
                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 self-center"></span>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
};

export default Notifications;
