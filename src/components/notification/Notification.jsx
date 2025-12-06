import React, { useState, useEffect, useMemo } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { TbCheck } from 'react-icons/tb';

const formatNotificationDate = (isoDate) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = (now - date) / (1000 * 60 * 60 * 24); // difference in days
  
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      // Same day → show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (diff < 7) {
      // Within a week → show day name
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older → show short date
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
};

export default function Notification({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        setCurrentUser(user);

        const fetchNotifications = () => {
            const allNotifications = JSON.parse(localStorage.getItem('system_notifications')) || [];
            if (user) {
                const userNotifications = allNotifications.filter(n => n.toRole === user.role);
                setNotifications(userNotifications);
            }
        };

        fetchNotifications();

        // Listen for changes in localStorage from other tabs
        const handleStorageChange = (event) => {
            if (event.key === 'system_notifications') {
                fetchNotifications();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isOpen]); // Refetch when component is opened

    const handleMarkOneAsRead = (notificationId) => {
        const allNotifications = JSON.parse(localStorage.getItem('system_notifications')) || [];
        const updatedNotifications = allNotifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
        );
        localStorage.setItem('system_notifications', JSON.stringify(updatedNotifications));
        // Refresh local state
        if(currentUser) {
            setNotifications(updatedNotifications.filter(n => n.toRole === currentUser.role));
        }
    };
    
    const handleMarkAllAsRead = () => {
        const allNotifications = JSON.parse(localStorage.getItem('system_notifications')) || [];
        const updatedNotifications = allNotifications.map(n =>
            n.toRole === currentUser.role ? { ...n, isRead: true } : n
        );
        localStorage.setItem('system_notifications', JSON.stringify(updatedNotifications));
         // Refresh local state
         if(currentUser) {
            setNotifications(updatedNotifications.filter(n => n.toRole === currentUser.role));
        }
    };

    const sortedNotifications = useMemo(
        () =>
            [...notifications].sort((a, b) => {
                if (a.isRead === b.isRead) {
                    return new Date(b.time) - new Date(a.time);
                }
                return a.isRead ? 1 : -1;
            }),
        [notifications]
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-r z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="text-lg font-bold text-primary">Notifications</h2>
                <div className="flex flex gap-3 justify-end">
                    <button
                        className="p-1 hover:bg-text-primary/20 rounded-full transition text-text-primary"
                        onClick={handleMarkAllAsRead}
                        title="Mark all as read"
                    >
                        <TbCheck size={20} />
                    </button>
                    <button
                        className="p-1 hover:bg-text-primary/20 rounded-full transition text-text-primary"
                        onClick={onClose}
                    >
                        <RxCross2 size={20} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
                {sortedNotifications.map((n) => (
                    <div
                        key={n.id}
                        className={`flex justify-between items-start border border-gray-200 rounded-xl p-3 mb-3 transition ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}
                        onClick={() => !n.isRead && handleMarkOneAsRead(n.id)}
                        style={{ cursor: n.isRead ? 'default' : 'pointer' }}
                    >
                        <div>
                            <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-800 font-semibold'}`}>
                                {n.message}
                            </p>
                        </div>
                        <p className={`text-xs ${n.isRead ? 'text-gray-400' : 'text-gray-600'} ml-2 whitespace-nowrap`}>
                            {formatNotificationDate(n.time)}
                        </p>
                    </div>
                ))}

                {sortedNotifications.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">No notifications yet.</p>
                )}
            </div>
        </div>
    );
}