import React, { useState, useEffect, useMemo } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { TbCheck } from 'react-icons/tb';
import { FaEnvelope } from 'react-icons/fa';

// Hàm format ngày giờ
const formatNotificationDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const now = new Date();
    const diff = (now - date) / (1000 * 60 * 60 * 24); // difference in days
  
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (diff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
};

export default function Notification({ isOpen, onClose }) {
    // State nội bộ
    const [notifications, setNotifications] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // 1. Lấy User hiện tại từ sessionStorage (để biết Role)
    useEffect(() => {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    // 2. Hàm lấy thông báo từ localStorage
    const fetchNotifications = () => {
        // Lấy user mới nhất để đảm bảo không bị null khi mới login
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!user) {
            setNotifications([]);
            return;
        }

        const allNotifications = JSON.parse(localStorage.getItem('system_notifications')) || [];
        
        // Lọc thông báo cho Role hiện tại
        const userNotifications = allNotifications.filter(n => n.toRole === user.role);
        setNotifications(userNotifications);
    };

    // 3. Tự động cập nhật (Polling) mỗi 2 giây
    useEffect(() => {
        fetchNotifications(); // Gọi ngay lần đầu
        const intervalId = setInterval(fetchNotifications, 2000);
        
        // Lắng nghe sự kiện storage (hỗ trợ đa tab)
        const handleStorageChange = (e) => {
            if (e.key === 'system_notifications') fetchNotifications();
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isOpen]); // Reset khi mở/đóng

    // 4. Logic Sắp xếp: Chưa đọc lên đầu, Mới nhất lên đầu
    const sorted = useMemo(() => 
        [...notifications].sort((a, b) => {
            if (a.isRead === b.isRead) {
                return new Date(b.time) - new Date(a.time);
            }
            return a.isRead ? 1 : -1;
        }), 
    [notifications]);

    // 5. Hàm đánh dấu Đã đọc (Tất cả)
    const handleMarkAllAsRead = () => {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!user) return;

        const allNotifications = JSON.parse(localStorage.getItem('system_notifications')) || [];
        const updatedNotifications = allNotifications.map(n => 
            n.toRole === user.role ? { ...n, isRead: true } : n
        );
        
        localStorage.setItem('system_notifications', JSON.stringify(updatedNotifications));
        fetchNotifications(); // Refresh UI
    };

    // 6. Hàm đánh dấu Đã đọc (Một cái) - Gọi khi click vào thông báo
    const handleMarkOneAsRead = (notifId) => {
        const allNotifications = JSON.parse(localStorage.getItem('system_notifications')) || [];
        const updatedNotifications = allNotifications.map(n => 
            n.id === notifId ? { ...n, isRead: true } : n
        );
        localStorage.setItem('system_notifications', JSON.stringify(updatedNotifications));
        fetchNotifications(); // Refresh UI
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-[60] flex flex-col transition-transform duration-300 transform translate-x-0">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
                
                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <button 
                        className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600"
                        onClick={handleMarkAllAsRead}
                        title="Mark all as read"
                    >
                        <TbCheck size={20} />
                    </button>
                    <button 
                        className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600"
                        onClick={onClose}
                        title="Close"
                    >
                        <RxCross2 size={20} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50/50">
                {sorted.length > 0 ? (
                    sorted.map((n) => (
                        <div
                            key={n.id}
                            className={`flex justify-between items-start border rounded-xl p-3 mb-3 transition-all cursor-pointer hover:shadow-md
                                ${n.isRead ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200"}`}
                            onClick={() => !n.isRead && handleMarkOneAsRead(n.id)}
                        >
                            <div className="flex-1 pr-2">
                                {/* Dòng 1: Tiêu đề giả lập (Vì data gốc chỉ có message) */}
                                <p className={`text-xs uppercase tracking-wide mb-1 ${n.isRead ? "text-gray-500" : "text-blue-600 font-bold"}`}>
                                    System Notification
                                </p>
                                
                                {/* Dòng 2: Nội dung chính */}
                                <p className={`text-sm leading-snug whitespace-pre-line ${n.isRead ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                                    {n.message}
                                </p>
                            </div>
                            
                            {/* Thời gian */}
                            <p className={`text-[10px] ml-2 whitespace-nowrap ${n.isRead ? "text-gray-400" : "text-blue-500 font-semibold"}`}>
                                {formatNotificationDate(n.time)}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <FaEnvelope className="text-5xl mb-3 opacity-20" />
                        <p className="text-sm">No notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}