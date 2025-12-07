import { useMemo } from "react";
import { RxCross2 } from "react-icons/rx";
import { TbCheck } from "react-icons/tb";

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
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  } else if (diff < 7) {
    // Within a week → show day name
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    // Older → show short date
    return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
  }
};

export default function Notification({ showNoti, onClose, notifications, setNotifications, user}) {
  if (!showNoti) return null;
  // Sort: unread first, then by date descending
  const sorted = useMemo(
    () =>
      [...notifications[user.id]].sort((a, b) => {
        if (a.isRead === b.isRead) {
          return new Date(b.date) - new Date(a.date);
        }
        return a.isRead ? 1 : -1;
      }),
    [notifications[user.id]]
  );

  const handleMarkAsRead = () => {
    setNotifications((prevData) => ({
      ...prevData,
      [user.id]: prevData[user.id].map((noti) => ({
        ...noti,
        isRead: true
      }))
    }));
  };

 
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-r z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-lg font-bold text-primary">Notifications</h2>
        {/* Close buttons */}
        <div className="flex flex gap-3 justify-end">
          <button 
            className="p-1 hover:bg-text-primary/20 rounded-full transition text-text-primary"
            onClick={handleMarkAsRead}
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
        {sorted.map((n) => (
          <div
            key={n.id}
            className={`flex justify-between items-start border border-text-primary ${n.isRead ? "bg-white" : "bg-text-primary/20"} rounded-xl p-3 mb-3 transition`}
          >
            <div>
              <p className={`text-xs text-black ${n.isRead ? "font-normal" : "font-semibold"}`}>
                {n.courseName} ({n.courseID}) · {n.tutor}
              </p>
              <p className={`text-sm text-black ${n.isRead ? "font-normal" : "font-semibold"}`}>
                {n.title}
              </p>
              <p className={`text-sm ${n.isRead ? "text-text-primary" : "text-black"} whitespace-pre-line`}>
                {n.description}
              </p>
            </div>
            <p className={`text-xs ${n.isRead ? "text-text-primary" : "text-black"} ml-2 whitespace-nowrap`}>
              {formatNotificationDate(n.date)}
            </p>
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}