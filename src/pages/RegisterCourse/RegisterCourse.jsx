import React, { useState, useMemo, useEffect } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { 
    FaSearch, 
    FaCalendarAlt, 
    FaClipboardList, 
    FaTrashAlt, 
    FaCheck,
    FaTimes,
    FaCheckCircle,
    FaTimesCircle,
    FaLock
} from "react-icons/fa";

import {
  sampleCourses,
  makeRegistrationItem,
  getClassesForCourseAndTutor,
  defaultRegistrationPeriod,
  tutorsData,
  getClasses,
} from './mockDatabase.js'; // Adjust the path as needed

const PENDING_REG_STORAGE_KEY = 'tutor_app_pending_registrations';

/**
 * Expands a session object with a multi-hour time range (e.g., "09:00 - 11:00")
 * into an array of 1-hour slot objects.
 * @param {object} session - A session object like { day, time }.
 * @returns {Array<object>} An array of { day, time } objects.
 */
const expandTimeRange = (session) => {
  const slots = [];
  const [startTime, endTime] = session.time.split(' - ');
  if (!startTime || !endTime) return slots;

  let currentHour = parseInt(startTime.split(':')[0], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);

  if (isNaN(currentHour) || isNaN(endHour)) return slots;

  while (currentHour < endHour) {
    const start = currentHour.toString().padStart(2, '0');
    const end = (currentHour + 1).toString().padStart(2, '0');
    slots.push({ day: session.day, time: `${start}:00 - ${end}:00` });
    currentHour++;
  }
  return slots;
};

/**
 * Checks if a set of new sessions conflicts with sessions from a list of pending registrations.
 * @param {Array<object>} newSessions - The sessions of the class to check.
 * @param {Array<object>} pendingList - The list of all current pending registrations.
 * @param {string|null} courseIdToExclude - The courseId to ignore in the pendingList (used when editing).
 * @returns {object|null} A conflict object { conflictingCourseId, conflictingSlot } or null if no conflict.
 */
const checkForConflicts = (newSessions, pendingList, courseIdToExclude = null) => {
    const allExistingSlots = new Set();
    const otherPendingItems = pendingList.filter(p => p.courseId !== courseIdToExclude);

    // Build a set of all currently booked 1-hour slots
    for (const item of otherPendingItems) {
        if (item.sessions && item.sessions.length > 0) {
            const expanded = item.sessions.flatMap(expandTimeRange);
            for (const slot of expanded) {
                allExistingSlots.add(`${slot.day}|${slot.time}`);
            }
        }
    }

    if (allExistingSlots.size === 0) return null; // No sessions to conflict with

    // Check if any of the new sessions' 1-hour slots are in the booked set
    const newExpandedSlots = newSessions.flatMap(expandTimeRange);
    for (const slot of newExpandedSlots) {
        if (allExistingSlots.has(`${slot.day}|${slot.time}`)) {
            const conflictingItem = otherPendingItems.find(item => item.sessions.flatMap(expandTimeRange).some(s => s.day === slot.day && s.time === slot.time));
            return { conflictingCourseId: conflictingItem.courseId, conflictingSlot: slot };
        }
    }
    return null; // No conflict
};

const RegisterCourse = () => {
    const [search, setSearch] = useState("");

    const [period] = useState(defaultRegistrationPeriod);

    const isRegistrationPeriodLocked = useMemo(() => {
        // Check the status property from the registration period data.
        // This simplifies testing the 'locked' state without changing dates.
        return period.status === 'locked';
    }, [period.status]);
    // Load pending registrations from localStorage on initial render
    const [pending, setPending] = useState(() => {
        try {
            const storedPending = localStorage.getItem(PENDING_REG_STORAGE_KEY);
            const rawPending = storedPending ? JSON.parse(storedPending) : [];

            // Create maps for quick lookups of master data
            const masterClasses = getClasses();
            const masterClassMap = new Map(masterClasses.map(c => [c.classId, c]));
            const masterCourseMap = new Map(sampleCourses.map(c => [c.courseId, c]));

            return rawPending
                .map(p => {
                    // First, check if the base course itself still exists and is not 'removed'.
                    const masterCourse = masterCourseMap.get(p.courseId);
                    if (!masterCourse || masterCourse.status === 'removed') {
                        return null; // This course is gone, remove the registration.
                    }

                    // If no class is assigned yet, the registration is valid (as the course is valid).
                    if (!p.classId) {
                        return { ...p, name: masterCourse.name };
                    }
                    
                    // If a class is assigned, check its validity.
                    const masterClass = masterClassMap.get(p.classId);
                    // If the class was deleted or its status is 'removed', invalidate the registration.
                    if (!masterClass || masterClass.status === 'removed') {
                        return null;
                    }

                    // If everything is valid, return the synced registration object.
                    return { ...p, ...masterClass, courseId: p.courseId, name: p.name };
                })
                .filter(p => p !== null); // Filter out all invalidated registrations.
        } catch (error) {
            console.error("Could not parse or sync pending registrations from localStorage", error);
            return [];
        }
    });

    // Sync course list 'selected' state with the loaded pending list
    const [courses, setCourses] = useState(() => {
        const pendingCourseIds = new Set(pending.map(p => p.courseId));
        return sampleCourses
            .filter(c => c.status !== 'removed')
            .map(c => ({
                ...c,
                selected: pendingCourseIds.has(c.courseId)
            }));
    });
    
    // edit modal state
    const [editingReg, setEditingReg] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [tutorClasses, setTutorClasses] = useState([]);
    const [notification, setNotification] = useState({ msg: "", type: "success" });

    useEffect(() => {
        if (!notification.msg) return;
        const t = setTimeout(() => setNotification({ msg: "", type: "success" }), 4000);
        return () => clearTimeout(t);
    }, [notification]);

    // Persist pending registrations to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(PENDING_REG_STORAGE_KEY, JSON.stringify(pending));
        } catch (error) {
            console.error("Could not save pending registrations to localStorage", error);
        }
    }, [pending]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return courses.filter(c => c.courseId.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    }, [search, courses]);

    const handleSelect = (course, idx) => {
        if (!course.available || course.selected || isRegistrationPeriodLocked) return;
        const item = makeRegistrationItem(course);

        // --- CONFLICT DETECTION ---
        if (item.sessions && item.sessions.length > 0) {
            const conflict = checkForConflicts(item.sessions, pending);
            if (conflict) {
                setNotification({ msg: `Schedule conflict! This course's default class overlaps with ${conflict.conflictingCourseId}.`, type: 'error' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        }

        setPending(prev => [item, ...prev]);
        setCourses(prev => prev.map(c => c.courseId === course.courseId ? { ...c, selected: true } : c));
    };

    const handleRemove = (courseId) => {
        const regToRemove = pending.find(p => p.courseId === courseId);

        // Prevent removal if the global period is locked or the individual item is locked.
        if (isRegistrationPeriodLocked || (regToRemove && regToRemove.status === 'locked')) {
            return;
        }

        setCourses(prev => prev.map(c => c.courseId === courseId ? { ...c, selected: false } : c));
        setPending(prev => prev.filter(p => p.courseId !== courseId));
    };

    const openEditModal = (reg) => {
        // Prevent editing if the global period is locked or the individual item is locked.
        if (isRegistrationPeriodLocked || reg.status === 'locked') return;
        setEditingReg(reg);
        setModalOpen(true);
        // Pre-select the current tutor in the modal
        const currentTutor = reg.tutorName || null;
        setSelectedTutor(currentTutor);
        // Also load their classes
        if (currentTutor) {
            const classes = getClassesForCourseAndTutor(reg.courseId, currentTutor);
            setTutorClasses(classes);
        } else {
            setTutorClasses([]);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingReg(null);
        setSelectedTutor(null);
        setTutorClasses([]);
    };

    const handleSelectTutor = (tutor) => {
        if (!editingReg) return;
        setSelectedTutor(tutor);
        const classes = getClassesForCourseAndTutor(editingReg.courseId, tutor);
        setTutorClasses(classes);
    };

    const handleChangeClass = (newClass) => {
        if (!editingReg) return;

        // --- CONFLICT DETECTION ---
        const conflict = checkForConflicts(newClass.sessions, pending, editingReg.courseId);
        if (conflict) {
            // We don't close the modal, just show an alert/notification inside it or at the top.
            // For simplicity, we'll use the main page notification and not close the modal.
            setNotification({ msg: `Schedule conflict! This class overlaps with ${conflict.conflictingCourseId}.`, type: 'error' });
            return;
        }

        setPending(prev =>
            prev.map(p => p.courseId === editingReg.courseId
                ? {
                    // Keep core course info and overwrite with new class details
                    ...p,
                    ...newClass,
                    courseId: p.courseId, // Re-assert original courseId
                    name: p.name, // Re-assert original course name
                    // Update registration object for any legacy dependencies
                    registration: {
                        tutor: newClass.tutorName,
                        sessions: newClass.sessions,
                    }
                }
                : p
            )
        );
        setNotification({ msg: `Class for ${editingReg.courseId} changed successfully.`, type: 'success' });
        closeModal();
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <div className="max-w-7xl mx-auto p-8 font-sans">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">Course Registration</h2>
                
                {notification.msg && (
                    <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
                        notification.type === 'success' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {notification.type === 'success' ? <FaCheckCircle className="text-green-600" /> : <FaTimesCircle className="text-red-600" />}
                        <span className="font-medium">{notification.msg}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Left: Registration period */}
                    <div className="col-span-1 bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Registration Period</h3>
                            {isRegistrationPeriodLocked && (
                                <span className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                    <FaLock />
                                    Locked
                                </span>
                            )}
                        </div>
                        <div className="grid gap-4">
                            <div className="flex justify-between items-center p-4 rounded-lg border border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-500">From</p>
                                    <p className="text-base font-semibold text-gray-800">{period.start}</p>
                                </div>
                                <FaCalendarAlt className="text-primary" size={20} />
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-lg border border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-500">To</p>
                                    <p className="text-base font-semibold text-gray-800">{period.end}</p>
                                </div>
                                <FaCalendarAlt className="text-primary" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Course search and list */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="flex gap-4 mb-5">
                                <div className="flex-1 relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FaSearch />
                                    </span>
                                    <input
                                        className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                                        placeholder="Search by course ID or name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <button className="px-5 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition duration-200">
                                    Search
                                </button>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-200">
                            <div className="grid grid-cols-12 text-xs bg-gray-50/70 p-4 font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-3">CourseID</div>
                                <div className="col-span-6">Course Name</div>
                                <div className="col-span-3 text-right">Action</div>
                            </div>
                            <div className="max-h-60 overflow-auto">
                                {filtered.map((c, idx) => (
                                    <div key={c.courseId} className="grid grid-cols-12 items-center p-4 border-t border-gray-100 hover:bg-gray-50/50 transition-colors duration-150">
                                        <div className="col-span-3 text-sm font-medium text-primary">{c.courseId}</div>
                                        <div className="col-span-6 text-sm text-gray-700">{c.name}</div>
                                        <div className="col-span-3 flex justify-end gap-2">
                                            {isRegistrationPeriodLocked ? (
                                                <span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full cursor-not-allowed">
                                                    Locked
                                                </span>
                                            ) : !c.available ? (
                                                <span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full cursor-not-allowed">
                                                    Not available
                                                </span>
                                            ) : c.selected ? (
                                                <span className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-full flex items-center gap-1.5 border border-green-200">
                                                    <FaCheck /> Selected
                                                </span>
                                            ) : (
                                                <button
                                                    className="px-4 py-1.5 text-xs font-semibold bg-primary text-white rounded-full hover:opacity-90 transition"
                                                    onClick={() => handleSelect(c, idx)}
                                                >
                                                    Select
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {filtered.length === 0 && (
                                    <div className="p-6 text-center text-gray-500">No courses matched "{search}"</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending registrations */}
                <section className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-light text-primary rounded-lg bg-blue-100 text-blue-600">
                                <FaClipboardList size={20} />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">Registration List</h4>
                                <p className="text-sm text-gray-500">Pending registrations</p>
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-600">Total: {pending.length}</div>
                    </div>

                    <div className="space-y-4">
                        {pending.map((reg, i) => (
                            <div key={reg.courseId} className="border border-gray-200 rounded-lg p-5">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4 flex-grow">
                                        <div className="text-lg font-bold text-primary w-8 pt-1">{i + 1}.</div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-1">
                                                <a className="text-lg font-semibold text-gray-800 hover:text-primary transition">{reg.courseId} - {reg.name}</a>
                                            </div>

                                            {/* Enhanced details grid */}
                                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-4 gap-x-6 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500">Class ID</span>
                                                    <span className="font-medium text-gray-700">{reg.classId ?? 'N/A'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500">Tutor</span>
                                                    <span className="font-medium text-gray-700">{reg.tutorName ?? 'Not Selected'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500">Language</span>
                                                    <span className="font-medium text-gray-700">{reg.language ?? '-'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500">Campus</span>
                                                    <span className="font-medium text-gray-700">{reg.campus ? `Campus ${reg.campus}` : '-'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500">Capacity</span>
                                                    <span className="font-medium text-gray-700">{reg.maxStudents != null ? `${reg.enrolledStudents}/${reg.maxStudents}` : '-'}</span>
                                                </div>

                                                {/* Sessions display */}
                                                <div className="col-span-full mt-2">
                                                    <span className="text-xs text-gray-500">Schedule</span>
                                                    {reg.sessions?.length > 0 ? (
                                                        <div className="mt-2 grid grid-cols-[1fr_1.5fr_1fr] gap-x-4 text-left text-gray-700 border-t border-gray-200 pt-2">
                                                            {/* Header */}
                                                            <div className="font-semibold text-xs text-gray-500 pb-1">Day</div>
                                                            <div className="font-semibold text-xs text-gray-500 pb-1">Time</div>
                                                            <div className="font-semibold text-xs text-gray-500 pb-1">Room</div>
                                                            
                                                            {/* Rows */}
                                                            {reg.sessions.map((session, s_idx) => (
                                                                <React.Fragment key={s_idx}>
                                                                    <div className="font-medium pt-1.5 border-t border-gray-100">{session.day}</div>
                                                                    <div className="font-medium pt-1.5 border-t border-gray-100">{session.time}</div>
                                                                    <div className="font-medium pt-1.5 border-t border-gray-100">{session.room}</div>
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    ) : <div className="mt-1"><span className="font-medium text-gray-700">-</span></div>}
                                                </div>
                                            </div>
                                            {/* --- END MODIFICATION 1 --- */}
                                            {!reg.registration && (
                                                <div className="mt-3 p-2.5 text-xs bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md">
                                                    No default class found. Please click 'Edit' to select a tutor and class.
                                                </div>
                                            )}
                                            
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                                        <button
                                            className="px-4 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200"
                                            onClick={() => openEditModal(reg)}
                                            disabled={isRegistrationPeriodLocked || reg.status === 'locked'}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="px-4 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-full flex items-center gap-2 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200"
                                            onClick={() => handleRemove(reg.courseId)}
                                            disabled={isRegistrationPeriodLocked || reg.status === 'locked'}
                                        >
                                            <FaTrashAlt /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {pending.length === 0 && (
                            <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-200 rounded-lg">
                                No pending registrations. Select a course to add it to the list.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Edit modal */}
            {modalOpen && editingReg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 rounded-xl shadow-xl overflow-hidden border border-gray-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50/70">
                            <div>
                                <div className="text-sm text-gray-600">Edit class for</div>
                                <div className="text-lg font-semibold text-gray-900">{editingReg.courseId} - {editingReg.name}</div>
                            </div>
                            <button
                                className="text-gray-400 hover:text-gray-600 transition"
                                onClick={closeModal}
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Tutors list */}
                            <div className="md:col-span-1 bg-gray-50/70 rounded-lg p-4 border border-gray-200">
                                <div className="text-sm font-semibold text-gray-600 mb-3">Available Tutors</div>
                                <div className="space-y-2">
                                    {tutorsData.map(t => (
                                        <button
                                            key={t.name}
                                            className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                                selectedTutor === t.name
                                                    ? "bg-primary text-white border-primary shadow-sm"
                                                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100"
                                            }`}
                                            onClick={() => handleSelectTutor(t.name)}
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Classes for selected tutor */}
                            <div className="md:col-span-2 rounded-lg border border-gray-200 p-4">
                                <div className="text-sm font-semibold text-gray-600 mb-3">Classes for {selectedTutor || "..."}</div>

                                {selectedTutor ? (
                                    tutorClasses.length ? (
                                        <div className="space-y-3 max-h-72 overflow-auto pr-2">
                                            {tutorClasses.map((cls) => (
                                                <div key={cls.classId} className="p-3.5 border border-gray-200 rounded-lg">
                                                    <div className="text-gray-800">
                                                        <div className="font-semibold">{cls.classId}</div>
                                                        <div className="mt-2 space-y-1">
                                                            {cls.sessions.map((s, si) => (
                                                                <div key={si} className="text-sm text-gray-600">{s.day} at {s.time} (Room: {s.room})</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="text-right mt-3">
                                                        <button
                                                            className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-full hover:opacity-90 transition"
                                                            onClick={() => handleChangeClass(cls)} // Pass the whole class object
                                                        >
                                                            Select
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 p-4 text-center">No classes found for this tutor.</div>
                                    )
                                ) : (
                                    <div className="text-sm text-gray-500 p-4 text-center">Select a tutor to see available classes.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default RegisterCourse;