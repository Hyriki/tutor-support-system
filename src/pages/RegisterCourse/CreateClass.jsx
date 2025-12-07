import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { FaBook, FaChalkboardTeacher, FaPlus, FaTimes, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';
import {
  tutorsData,
  sampleCourses,
  getCreatableSlotsForTutor,
  addClass,
} from '../RegisterCourse/mockDatabase'; // Adjust path if needed

const daysOrder = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 7,
};

/**
 * Merges consecutive 1-hour sessions if they are on the same day, in the same room.
 * @param {Array<object>} sessions - Array of session objects {day, time, room}.
 * @returns {Array<object>} A new array with merged sessions.
 */
const mergeSessions = (sessions) => {
  if (sessions.length < 2) {
    return sessions;
  }

  const parseTime = (timeStr) => {
    const parts = timeStr.split(' - ');
    return {
      start: parseInt(parts[0].split(':')[0], 10),
      end: parseInt(parts[1].split(':')[0], 10)
    };
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    const dayComparison = daysOrder[a.day] - daysOrder[b.day];
    if (dayComparison !== 0) return dayComparison;
    return parseTime(a.time).start - parseTime(b.time).start;
  });

  const merged = [];
  let currentSession = { ...sortedSessions[0] };

  for (let i = 1; i < sortedSessions.length; i++) {
    const nextSession = sortedSessions[i];
    const currentTime = parseTime(currentSession.time);
    const nextTime = parseTime(nextSession.time);

    if (currentSession.day === nextSession.day && currentSession.room === nextSession.room && currentTime.end === nextTime.start) {
      const newEndTime = `${String(nextTime.end).padStart(2, '0')}:00`;
      const startTimeStr = currentSession.time.split(' - ')[0];
      currentSession.time = `${startTimeStr} - ${newEndTime}`;
    } else {
      merged.push(currentSession);
      currentSession = { ...nextSession };
    }
  }
  merged.push(currentSession);
  return merged;
};

const CreateClass = () => {
  // Form State
  const [classId, setClassId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [language, setLanguage] = useState('English');
  const [campus, setCampus] = useState('1');
  const [maxStudents, setMaxStudents] = useState(25);
  const [sessions, setSessions] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  // UI State
  const [sessionRoom, setSessionRoom] = useState('');
  const [sessionToAdd, setSessionToAdd] = useState(null); // {day, time}

  const handleTutorChange = (newTutorName) => {
    setTutorName(newTutorName);
    setCourseId(''); // Reset course when tutor changes
    setSessions([]); // Reset sessions when tutor changes, as availability is different.
  };

  const selectedTutor = useMemo(() => tutorsData.find(t => t.name === tutorName), [tutorName]);

  const teachableCourses = useMemo(() => {
    if (!selectedTutor) {
      return [];
    }
    return sampleCourses.filter(course => selectedTutor.subjects.includes(course.courseId));
  }, [selectedTutor]);
  // Gets slots from tutor's base availability minus any slots already booked in other classes.
  const tutorAvailability = useMemo(() => (tutorName ? getCreatableSlotsForTutor(tutorName) : []), [tutorName]);

  // Filters the above list further, removing slots that have been added to the *current* new class form.
  const availableSlotsForDisplay = useMemo(() => {
    return tutorAvailability.filter(availableSlot =>
      !sessions.some(session =>
        session.day === availableSlot.day && session.time === availableSlot.time
      ));
  }, [tutorAvailability, sessions]);

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleAddSession = () => {
    if (!sessionToAdd || !sessionRoom.trim()) {
      alert('Please provide a room for the session.');
      return;
    }
    setSessions(prev => [...prev, { ...sessionToAdd, room: sessionRoom.trim() }]);
    setSessionToAdd(null);
    setSessionRoom('');
  };

  const handleRemoveSession = (index) => {
    setSessions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveClass = () => {
    // Basic validation
    if (!classId.trim() || !courseId || !tutorName || sessions.length === 0) {
      alert('Please fill all required fields and add at least one session.');
      return;
    }

    const course = sampleCourses.find(c => c.courseId === courseId);

    const finalSessions = mergeSessions(sessions);

    const newClass = {
      classId: classId.trim(),
      courseId,
      courseName: course.name,
      tutorName,
      language,
      campus,
      maxStudents,
      sessions: finalSessions,
      enrolledStudents: 0,
      status: 'active',
    };

    addClass(newClass);
    setSuccessMsg(`Class ${newClass.classId} has been created successfully!`);

    // Reset form
    setClassId('');
    setCourseId('');
    setTutorName('');
    setSessions([]);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto p-8 font-sans">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Create New Program</h2>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-3">
            <FaCheckCircle className="text-green-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side: Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-8 space-y-6">
            <div>
              <label className="font-semibold text-gray-600">Class ID</label>
              <input type="text" value={classId} onChange={e => setClassId(e.target.value)} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900" placeholder="e.g., SE101-FALL24-A" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-gray-600">Subject</label>
                <select value={courseId} onChange={e => setCourseId(e.target.value)} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900 disabled:bg-gray-100" disabled={!tutorName}>
                  <option value="">{tutorName ? '-- Select a Subject --' : '-- Select a Tutor First --'}</option>
                  {teachableCourses.map(c => (
                    <option key={c.courseId} value={c.courseId}>{c.courseId} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-600">Tutor</label>
                <select value={tutorName} onChange={e => handleTutorChange(e.target.value)} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900">
                  <option value="">-- Select a Tutor --</option>
                  {tutorsData.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="font-semibold text-gray-600">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900">
                  <option value="English">English</option>
                  <option value="Vietnamese">Vietnamese</option>
                  <option value="French">French</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-600">Campus</label>
                <select value={campus} onChange={e => setCampus(e.target.value)} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900">
                  <option value="1">Campus 1</option>
                  <option value="2">Campus 2</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-600">Max Students</label>
                <input type="number" value={maxStudents} onChange={e => setMaxStudents(parseInt(e.target.value, 10))} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900" />
              </div>
            </div>

            {/* Sessions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-t pt-6">Class Sessions</h3>
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <p className="text-gray-800">
                        <span className="font-semibold">{s.day}, {s.time}</span>
                        <span className="text-gray-500"> in Room: {s.room}</span>
                      </p>
                      <button onClick={() => handleRemoveSession(i)} className="text-red-500 hover:text-red-700"><FaTrashAlt /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No sessions added. Select a tutor to see their availability.</p>
              )}
            </div>

            <div className="text-right border-t pt-6">
              <button onClick={handleSaveClass} className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">
                Save Program
              </button>
            </div>
          </div>

          {/* Right side: Tutor Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-3"><FaChalkboardTeacher /> Tutor Information</h3>
              {selectedTutor ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-600">Teachable Subjects</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTutor.subjects.map(sId => (
                        <span key={sId} className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{sId}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-600">Availability</h4>
                    <div className="mt-2 space-y-2 max-h-60 overflow-auto pr-2">
                      {availableSlotsForDisplay.length > 0 ? availableSlotsForDisplay.map(slot => (
                        <button key={`${slot.day}-${slot.time}`} onClick={() => setSessionToAdd(slot)} className="w-full text-left flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition">
                          <span className="text-sm text-green-800">{slot.day}, {slot.time}</span>
                          <FaPlus className="text-green-600" />
                        </button>
                      )) : <p className="text-sm text-gray-500">No available slots found.</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Select a tutor to see their details.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding a session room */}
      {sessionToAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-11/12 md:w-1/3 rounded-xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-800">Add Session Details</h3>
            <p className="text-gray-600 mt-2">
              Adding session for <span className="font-semibold">{sessionToAdd.day} at {sessionToAdd.time}</span>.
            </p>
            <div className="mt-6">
              <label className="font-semibold text-gray-600">Room Number</label>
              <input
                type="text"
                value={sessionRoom}
                onChange={e => setSessionRoom(e.target.value)}
                className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900"
                placeholder="e.g., A-101"
                autoFocus
              />
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => setSessionToAdd(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSession}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                Add Session
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CreateClass;