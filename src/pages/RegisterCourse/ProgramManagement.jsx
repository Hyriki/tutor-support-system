import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Assuming you use React Router for navigation
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { FaEdit, FaTrashAlt, FaPlus, FaTimes, FaCheckCircle, FaChalkboardTeacher } from 'react-icons/fa';
import {
  getClasses,
  updateClass,
  deleteClass,
  tutorsData,
  sampleCourses,
  getCreatableSlotsForTutor,
} from './mockDatabase';

const daysOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };

const mergeSessions = (sessions) => {
  if (sessions.length < 2) return sessions;
  const parseTime = (timeStr) => ({ start: parseInt(timeStr.split(' - ')[0].split(':')[0], 10), end: parseInt(timeStr.split(' - ')[1].split(':')[0], 10) });
  const sortedSessions = [...sessions].sort((a, b) => (daysOrder[a.day] - daysOrder[b.day]) || (parseTime(a.time).start - parseTime(b.time).start));
  const merged = [];
  let currentSession = { ...sortedSessions[0] };
  for (let i = 1; i < sortedSessions.length; i++) {
    const nextSession = sortedSessions[i];
    const currentTime = parseTime(currentSession.time);
    const nextTime = parseTime(nextSession.time);
    if (currentSession.day === nextSession.day && currentSession.room === nextSession.room && currentTime.end === nextTime.start) {
      currentSession.time = `${currentSession.time.split(' - ')[0]} - ${String(nextTime.end).padStart(2, '0')}:00`;
    } else {
      merged.push(currentSession);
      currentSession = { ...nextSession };
    }
  }
  merged.push(currentSession);
  return merged;
};

const EditClassModal = ({ classData, onClose, onSave }) => {
  // Form State
  const [formData, setFormData] = useState({ ...classData });
  const [sessions, setSessions] = useState(classData.sessions || []);

  // UI State for session management
  const [sessionRoom, setSessionRoom] = useState('');
  const [sessionToAdd, setSessionToAdd] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTutorChange = (newTutorName) => {
    setFormData(prev => ({ ...prev, tutorName: newTutorName }));
    // When tutor changes, existing sessions might be invalid. Clear them.
    setSessions([]);
  };

  const selectedTutor = useMemo(() => tutorsData.find(t => t.name === formData.tutorName), [formData.tutorName]);
  const teachableCourses = useMemo(() => selectedTutor ? sampleCourses.filter(c => selectedTutor.subjects.includes(c.courseId)) : [], [selectedTutor]);
  const tutorAvailability = useMemo(() => formData.tutorName ? getCreatableSlotsForTutor(formData.tutorName) : [], [formData.tutorName]);
  const availableSlotsForDisplay = useMemo(() => tutorAvailability.filter(slot => !sessions.some(s => s.day === slot.day && s.time === slot.time)), [tutorAvailability, sessions]);

  const handleAddSessionClick = (slot) => {
    setSessionToAdd(slot);
  };

  const handleConfirmAddSession = () => {
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

  const handleSaveChanges = () => {
    if (sessions.length === 0) {
      alert('A class must have at least one session.');
      return;
    }
    const finalSessions = mergeSessions(sessions);
    onSave({ ...formData, sessions: finalSessions });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl border border-gray-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">Edit Class: {classData.classId}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-semibold text-gray-600">Tutor</label>
                  <select value={formData.tutorName} onChange={e => handleTutorChange(e.target.value)} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900">
                    {tutorsData.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-600">Subject</label>
                  <select name="courseId" value={formData.courseId} onChange={handleInputChange} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900 disabled:bg-gray-100" disabled={!formData.tutorName}>
                    {teachableCourses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseId} - {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="font-semibold text-gray-600">Language</label>
                  <select name="language" value={formData.language} onChange={handleInputChange} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900">
                    <option value="English">English</option>
                    <option value="Vietnamese">Vietnamese</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-600">Campus</label>
                  <select name="campus" value={formData.campus} onChange={handleInputChange} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900">
                    <option value="1">Campus 1</option>
                    <option value="2">Campus 2</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-600">Max Students</label>
                  <input type="number" name="maxStudents" value={formData.maxStudents} onChange={handleInputChange} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="font-semibold text-gray-600">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900">
                    <option value="active">Active</option>
                    <option value="locked">Locked</option>
                    <option value="removed">Removed</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-t pt-6">Class Sessions</h3>
                {sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-800"><span className="font-semibold">{s.day}, {s.time}</span> in Room: {s.room}</p>
                        <button onClick={() => handleRemoveSession(i)} className="text-red-500 hover:text-red-700"><FaTrashAlt /></button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-center py-4">No sessions added. Select from availability.</p>}
              </div>
            </div>

            {/* Right side: Tutor Availability */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-4 border">
                <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-3"><FaChalkboardTeacher /> Tutor Availability</h3>
                {selectedTutor ? (
                  <div className="space-y-2 max-h-80 overflow-auto pr-2">
                    {availableSlotsForDisplay.length > 0 ? availableSlotsForDisplay.map(slot => (
                      <button key={`${slot.day}-${slot.time}`} onClick={() => handleAddSessionClick(slot)} className="w-full text-left flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition">
                        <span className="text-sm text-green-800">{slot.day}, {slot.time}</span>
                        <FaPlus className="text-green-600" />
                      </button>
                    )) : <p className="text-sm text-gray-500">No available slots found.</p>}
                  </div>
                ) : <p className="text-gray-500">Select a tutor to see their details.</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 p-5 border-t bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
          <button onClick={handleSaveChanges} className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">Save Changes</button>
        </div>
      </div>

      {/* Modal for adding a session room */}
      {sessionToAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white w-11/12 md:w-1/3 rounded-xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-800">Add Session Details</h3>
            <p className="text-gray-600 mt-2">Adding session for <span className="font-semibold">{sessionToAdd.day} at {sessionToAdd.time}</span>.</p>
            <div className="mt-6">
              <label className="font-semibold text-gray-600">Room Number</label>
              <input type="text" value={sessionRoom} onChange={e => setSessionRoom(e.target.value)} className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-gray-900" placeholder="e.g., A-101" autoFocus />
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button onClick={() => setSessionToAdd(null)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleConfirmAddSession} className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">Add Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProgramManagement = () => {
  const [classes, setClasses] = useState([]);
  const [editingClass, setEditingClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchClasses = () => {
    setClasses(getClasses());
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleOpenEditModal = (classToEdit) => {
    setEditingClass(classToEdit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const handleSaveChanges = (updatedClass) => {
    updateClass(updatedClass.classId, updatedClass);
    fetchClasses();
    handleCloseModal();
    setNotification(`Class ${updatedClass.classId} updated successfully!`);
  };

  const handleDeleteClass = (classId) => {
    if (window.confirm(`Are you sure you want to delete class ${classId}? This action cannot be undone.`)) {
      deleteClass(classId);
      fetchClasses();
      setNotification(`Class ${classId} has been deleted.`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
      case 'locked':
        return <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Locked</span>;
      case 'removed':
        return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Removed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto p-8 font-sans">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Program Management</h2>
          <Link
            to="/create-program"
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            <FaPlus /> Create New Program
          </Link>
        </div>

        {notification && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-3">
            <FaCheckCircle className="text-green-600" />
            <span className="font-medium">{notification}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Class ID</th>
                  <th scope="col" className="px-6 py-3">Course Name</th>
                  <th scope="col" className="px-6 py-3">Tutor</th>
                  <th scope="col" className="px-6 py-3">Schedule</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.classId} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{cls.classId}</td>
                    <td className="px-6 py-4">{cls.courseName}</td>
                    <td className="px-6 py-4">{cls.tutorName}</td>
                    <td className="px-6 py-4">
                      {cls.sessions.map((s, i) => (
                        <div key={i}>{s.day}, {s.time} (Room: {s.room})</div>
                      ))}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(cls.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() => handleOpenEditModal(cls)}
                          className="font-medium text-primary hover:underline flex items-center gap-1.5"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.classId)}
                          className="font-medium text-red-600 hover:underline flex items-center gap-1.5"
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {classes.length === 0 && (
            <div className="text-center p-8 text-gray-500">No classes found.</div>
          )}
        </div>
      </div>

      {isModalOpen && editingClass && (
        <EditClassModal
          classData={editingClass}
          onClose={handleCloseModal}
          onSave={handleSaveChanges}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProgramManagement;