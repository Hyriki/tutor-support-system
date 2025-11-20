import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { TbMapPin, TbCalendarMonth, TbClock, TbFileDescription, TbUsers } from "react-icons/tb";

export default function CreateEditAction({ sessions, setSessions, selectedSession, setSelectedSession, type, onClose }) {
  if (!type) return null;
  const isEdit = type === "edit";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // default hour options (00, 15, 30, 45)
  const timeOptions = ["00", "15", "30", "45"];

  const getClosestTime = () => {
    const now = new Date();
    const mins = now.getMinutes();
    const rounded = timeOptions.find((m) => mins <= parseInt(m)) || "00";
    const hour = now.getHours();
    return { hour, minute: rounded };
  };

  const closest = getClosestTime();

  const [title, setTitle] = useState(isEdit ? selectedSession?.title || "" : "");
  const [date, setDate] = useState(
    isEdit
      ? selectedSession?.date || tomorrow.toISOString().split("T")[0]
      : tomorrow.toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(
    isEdit ? selectedSession?.startTime || `${closest.hour}:00` : `${closest.hour}:00`
  );
  const [endTime, setEndTime] = useState(
    isEdit
      ? selectedSession?.endTime || `${(closest.hour + 1) % 24}:00`
      : `${(closest.hour + 1) % 24}:00`
  );
  const [repeat, setRepeat] = useState(false);
  const [week, setWeek] = useState(getWeekNumber(tomorrow) + 2);
  const [location, setLocation] = useState(isEdit ? selectedSession?.location || "" : "");
  const [maxStudents, setMaxStudents] = useState(isEdit ? selectedSession?.maxStudent || "" : "");
  const [description, setDescription] = useState(isEdit ? selectedSession?.description || "" : "");

  function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  }

  const handleSave = () => {
    if (!selectedSession) return;

    const updated = {
      ...selectedSession,
      title,
      date,
      startTime,
      endTime,
      location,
      maxStudent: parseInt(maxStudents) || 0,
      description,
    };

    // Update the session list
    setSessions((prev) =>
      prev.map((s) => (s.id === selectedSession.id ? updated : s))
    );

    // Update selected session for UI sync
    setSelectedSession(updated);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/25 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="w-4xl mx-auto bg-white p-6 rounded-2xl shadow-xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close buttons */}
        <div className="flex justify-end">
          <button 
            className="p-1 hover:bg-text-primary/20 rounded-full transition text-text-primary"
            onClick={onClose}
          >
            <RxCross2 size={20} />
          </button>
        </div>

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add title"
          className="w-full border-b-2 border-primary focus:outline-none text-2xl font-semibold mb-2 text-text-primary"
        />

        {/* Date and Time */}
        <div className="flex items-center gap-2 mb-3 text-text-primary">
          <TbClock/>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-md px-2 py-1 mr-5"
          />
          <input
            type="time"
            step="3600" // 60 min
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border rounded-md px-2 py-1"
          />
          <span>–</span>
          <input
            type="time"
            step="3600"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border rounded-md px-2 py-1"
          />
        </div>

        {/* Repeat button */}
        {!isEdit && (
          <div className="flex items-center gap-2 mb-3 text-text-primary">
            <TbCalendarMonth/>
            <input type="checkbox" onClick={() => setRepeat(!repeat)} />
            <span>
              {repeat ? `Repeat until week ` : "Does not repeat"}
              {repeat && (<input
                type="number"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-15 border rounded-md px-2 py-1"
              />)}
            </span>
          </div>
        )}
        

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 text-text-primary">
          <TbMapPin/>
          <input
            type="text"
            placeholder="Add location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border rounded-md px-2 py-1"
          />
        </div>

        {/* Max students */}
        <div className="flex items-center gap-2 mb-3 text-text-primary">
          <TbUsers/>
          <input
            type="number"
            placeholder="Set max students"
            value={maxStudents}
            onChange={(e) => setMaxStudents(e.target.value)}
            className="border rounded-md px-2 py-1"
          />
        </div>

        {/* Description */}
        <div className="flex items-start gap-2 mb-3 text-text-primary">
          <TbFileDescription className="mt-1"/>
          <textarea
            placeholder="Add description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-md p-2 mb-2"
            rows={3}
          ></textarea>
        </div>
        

        {/* Confirm */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              handleSave();
              onClose();
            }}
            className="px-5 py-1.5 border border-primary text-primary rounded-full hover:bg-primary hover:text-white transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
