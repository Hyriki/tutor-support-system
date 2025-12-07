/**
 * Mock Database
 * This file acts as a temporary, in-memory database for development purposes.
 * It exports mock data and helper functions to simulate a real backend.
 * NOTE: Any changes made to this data at runtime will be lost on page refresh.
 */

// Tutors are now objects with subjects they can teach.
export const tutorsData = [
  { name: 'tutor1', subjects: ['CC001', 'CC002', 'CC008'] },
  { name: 'tutor2', subjects: ['CC002', 'CC003', 'CC005'] },
  { name: 'tutor3', subjects: ['CC004', 'CC006', 'CC007'] },
  { name: 'tutor4', subjects: ['CC001', 'CC005', 'CC007'] },
  { name: 'tutor5', subjects: ['CC003', 'CC004', 'CC006'] },
  { name: 'testTutor', subjects: ['CC001', 'CC002', 'CC003', 'CC004', 'CC005', 'CC006', 'CC007', 'CC008' ] },
];

// We are deprecating tutorsList in favor of tutorsData.
// This is for backward compatibility in case other files still use it.
// It's better to refactor other files to use tutorsData.
export const tutorsList = tutorsData.map(t => t.name);

export const sampleCourses = [
  { courseId: 'CC001', name: 'Software Engineering I', seats: 12, available: true, status: 'active' },
  { courseId: 'CC002', name: 'Data Structures and Algorithms', seats: 5, available: true, status: 'active' },
  { courseId: 'CC003', name: 'Introduction to AI', seats: 20, available: true, status: 'active' },
  { courseId: 'CC004', name: 'Web Development Fundamentals', seats: 0, available: false, status: 'active' },
  { courseId: 'CC005', name: 'Database Systems', seats: 8, available: true, status: 'active' },
  { courseId: 'CC006', name: 'Operating Systems', seats: 3, available: true, status: 'active' },
  { courseId: 'CC007', name: 'Computer Networks', seats: 15, available: true, status: 'active' },
  { courseId: 'CC008', name: 'Human-Computer Interaction', seats: 0, available: false, status: 'active' },
];

export const defaultRegistrationPeriod = {
  start: '2024-08-01',
  end: '2024-08-15',
  // The overall status of the registration period.
  // Can be 'active' or 'locked'. Change to 'locked' to test the locked state.
  status: 'active',
};

// --- New Mock Data for Tutor Availability ---

// We use localStorage to make the mock data persistent across page reloads.
const AVAILABILITY_STORAGE_KEY = 'tutor_app_availability';
const CLASSES_STORAGE_KEY = 'tutor_app_classes';

// This will store the *currently set* available slots for each tutor.
// It's a map where the key is the tutor's name, and the value is an array of { day, time } objects.
// This data is mutable and will be updated by the TutorAvailability page.
// NOTE: In a real application, this data would be fetched from and persisted to a backend database.
const defaultAvailability = {
  tutor1: [ // Monday, Wednesday, Friday from 7:00 to 12:00
    ...['Monday', 'Wednesday', 'Friday'].flatMap(day =>
      ['07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00'].map(time => ({ day, time }))
    )
  ],
  tutor2: [ // Tuesday, Thursday, Saturday from 7:00 to 12:00
    ...['Tuesday', 'Thursday', 'Saturday'].flatMap(day =>
      ['07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00'].map(time => ({ day, time }))
    )
  ],
  tutor3: [ // Monday, Wednesday, Friday from 12:00 to 18:00
    ...['Monday', 'Wednesday', 'Friday'].flatMap(day =>
      ['12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'].map(time => ({ day, time }))
    )
  ],
  tutor4: [ // Tuesday, Thursday, Saturday from 12:00 to 18:00
    ...['Tuesday', 'Thursday', 'Saturday'].flatMap(day =>
      ['12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'].map(time => ({ day, time }))
    )
  ],
  tutor5: [ // All of Friday and Saturday
    ...['Friday', 'Saturday'].flatMap(day =>
      [
        '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
        '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'
      ].map(time => ({ day, time }))
    )
  ],
  testTutor: [], // Fully unavailable
};

let _tutorAvailability;
try {
  const storedAvailability = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
  let storedData = {};
  if (storedAvailability) {
    try {
      storedData = JSON.parse(storedAvailability);
    } catch (e) {
      console.error('Could not parse stored availability, falling back to defaults.', e);
    }
  }
  // Merge defaults with stored data. Stored data for a tutor will overwrite the default.
  _tutorAvailability = { ...defaultAvailability, ...storedData };
} catch (error) {
  console.error('Could not read tutor availability from localStorage:', error);
  _tutorAvailability = defaultAvailability; // Fallback to default
}

// Default classes to ensure the app has data on first load.
const defaultClasses = [
    {
        classId: 'SE101-FALL24', courseId: 'CC001', courseName: 'Software Engineering I',
        tutorName: 'tutor1', language: 'English', campus: '1', maxStudents: 25, enrolledStudents: 0,
        sessions: [{ day: 'Monday', time: '09:00 - 11:00', room: 'A-101' }],
        status: 'active',
    },
    {
        classId: 'DSA201-FALL24', courseId: 'CC002', courseName: 'Data Structures and Algorithms',
        tutorName: 'tutor1', language: 'English', campus: '1', maxStudents: 25, enrolledStudents: 0,
        sessions: [{ day: 'Wednesday', time: '09:00 - 11:00', room: 'B-202' }],
        status: 'active',
    },
    {
        classId: 'AI101-FALL24', courseId: 'CC003', courseName: 'Introduction to AI',
        tutorName: 'tutor5', language: 'English', campus: '2', maxStudents: 30, enrolledStudents: 0,
        sessions: [{ day: 'Friday', time: '13:00 - 15:00', room: 'C-303' }],
        status: 'active',
    },
    {
        classId: 'DB201-FALL24', courseId: 'CC005', courseName: 'Database Systems',
        tutorName: 'tutor2', language: 'English', campus: '1', maxStudents: 20, enrolledStudents: 0,
        sessions: [{ day: 'Tuesday', time: '09:00 - 11:00', room: 'D-404' }],
        status: 'active',
    },
    {
        classId: 'OS301-FALL24', courseId: 'CC006', courseName: 'Operating Systems',
        tutorName: 'tutor3', language: 'English', campus: '2', maxStudents: 15, enrolledStudents: 0,
        sessions: [{ day: 'Monday', time: '15:00 - 17:00', room: 'E-505' }],
        status: 'active',
    },
    {
        classId: 'CN301-FALL24', courseId: 'CC007', courseName: 'Computer Networks',
        tutorName: 'tutor4', language: 'English', campus: '1', maxStudents: 25, enrolledStudents: 0,
        sessions: [{ day: 'Thursday', time: '13:00 - 15:00', room: 'F-101' }],
        status: 'active',
    },
];

// This will store the actual classes created by the coordinator.
let _createdClasses;
try {
  const storedClasses = localStorage.getItem(CLASSES_STORAGE_KEY);
  // If localStorage has data, use it. Otherwise, use our default classes.
  const rawClasses = storedClasses ? JSON.parse(storedClasses) : defaultClasses;
  // Data migration: ensure all classes have a status property for backward compatibility.
  _createdClasses = rawClasses.map(c => ({ ...c, status: c.status || 'active' }));
} catch (error) {
  console.error('Could not parse created classes from localStorage:', error);
  _createdClasses = defaultClasses; // Fallback to default
}

/**
 * Persists the current state of _createdClasses to localStorage.
 */
const persistClasses = () => {
  try {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(_createdClasses));
  } catch (error) {
    console.error('Could not save classes to localStorage:', error);
  }
};

/**
 * Adds a new class to the database and persists it to localStorage.
 * @param {object} newClass - The class object to add.
 */
export const addClass = (newClass) => {
  _createdClasses.push(newClass);
  persistClasses();
  console.log('Class added and saved:', newClass);
};

/**
 * Retrieves all created classes.
 * @returns {Array<object>} A copy of the classes array.
 */
export const getClasses = () => {
  // Return a copy to prevent direct mutation of the in-memory store.
  return JSON.parse(JSON.stringify(_createdClasses));
};

/**
 * Updates an existing class and persists the changes.
 * @param {string} classId - The ID of the class to update.
 * @param {object} updates - An object containing the fields to update.
 * @returns {object|null} The updated class object or null if not found.
 */
export const updateClass = (classId, updates) => {
  const classIndex = _createdClasses.findIndex(c => c.classId === classId);
  if (classIndex === -1) {
    console.error(`Class with ID ${classId} not found for update.`);
    return null;
  }
  // Merge existing class with updates
  _createdClasses[classIndex] = { ..._createdClasses[classIndex], ...updates };
  persistClasses();
  return _createdClasses[classIndex];
};

/**
 * Deletes a class from the database.
 * @param {string} classId - The ID of the class to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export const deleteClass = (classId) => {
  const initialLength = _createdClasses.length;
  _createdClasses = _createdClasses.filter(c => c.classId !== classId);
  if (_createdClasses.length < initialLength) {
    persistClasses();
    return true;
  }
  return false;
};

/**
 * Returns a comprehensive list of all possible standard time slots for a week.
 * This is used to build the availability grid UI for tutors.
 * @returns {Array<object>} An array of { day: string, time: string } objects.
 */
export const getAllPossibleTimeSlots = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const times = [];
  // Generate hourly slots from 7 AM (07:00) to 6 PM (18:00)
  for (let i = 7; i < 18; i++) {
    const start = i.toString().padStart(2, '0');
    const end = (i + 1).toString().padStart(2, '0');
    times.push(`${start}:00 - ${end}:00`);
  }
  const slots = [];
  days.forEach(day => {
    times.forEach(time => {
      slots.push({ day, time });
    });
  });
  return slots;
};

/**
 * Updates the in-memory availability for a specific tutor.
 * @param {string} tutorName - The name of the tutor whose availability is being updated.
 * @param {Array<object>} newAvailability - An array of { day, time } objects representing the tutor's newly set available slots.
 */
export const updateTutorAvailability = (tutorName, newAvailability) => {
  // To prevent race conditions and ensure data integrity (especially with multiple tabs),
  // we read the latest from storage, update it, and then write it back.
  let currentFullAvailability = {};
  try {
    const storedData = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
    if (storedData) {
      currentFullAvailability = JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Could not read availability from localStorage before update:', error);
  }

  // Merge with defaults to ensure no tutors are lost, then apply the new change.
  const updatedAvailability = { ...defaultAvailability, ...currentFullAvailability, [tutorName]: newAvailability };

  try {
    localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(updatedAvailability));
    _tutorAvailability = updatedAvailability; // Keep the in-memory object in sync.
  } catch (error) {
    console.error('Could not save tutor availability to localStorage:', error);
  }
};

/**
 * Retrieves the current in-memory availability for a specific tutor.
 * @param {string} tutorName - The name of the tutor.
 * @returns {Array<object>} An array of { day, time } objects, or an empty array if no availability is set.
 */
export const getTutorAvailability = (tutorName) => {
  return _tutorAvailability[tutorName] || [];
};

/**
 * Expands a session object with a multi-hour time range (e.g., "09:00 - 11:00")
 * into an array of 1-hour slot objects.
 * @param {object} session - A session object like { day, time, room }.
 * @returns {Array<object>} An array of { day, time } objects.
 */
const expandTimeRange = (session) => {
  const slots = [];
  const [startTime, endTime] = session.time.split(' - ');
  if (!startTime || !endTime) return slots; // Malformed time

  let currentHour = parseInt(startTime.split(':')[0], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);

  if (isNaN(currentHour) || isNaN(endHour)) return slots; // Malformed time

  while (currentHour < endHour) {
    const start = currentHour.toString().padStart(2, '0');
    const end = (currentHour + 1).toString().padStart(2, '0');
    slots.push({ day: session.day, time: `${start}:00 - ${end}:00` });
    currentHour++;
  }
  return slots;
};

/**
 * Gets all time slots that are already booked by a tutor in existing classes.
 * @param {string} tutorName - The name of the tutor.
 * @returns {Set<string>} A Set of strings representing booked slots (e.g., "Monday|09:00 - 10:00").
 */
const getBookedSlotsForTutor = (tutorName) => {
  const tutorClasses = _createdClasses.filter(c => c.tutorName === tutorName);
  const bookedSlots = tutorClasses.flatMap(c => c.sessions).flatMap(expandTimeRange);
  
  const bookedSet = new Set(bookedSlots.map(s => `${s.day}|${s.time}`));
  return bookedSet;
};

/**
 * Retrieves the slots a tutor is available for, excluding slots already booked for other classes.
 * This is used for creating new classes.
 * @param {string} tutorName - The name of the tutor.
 * @returns {Array<object>} An array of { day, time } objects.
 */
export const getCreatableSlotsForTutor = (tutorName) => {
  const baseAvailability = getTutorAvailability(tutorName);
  const bookedSlots = getBookedSlotsForTutor(tutorName);

  if (!baseAvailability) return [];

  return baseAvailability.filter(slot => !bookedSlots.has(`${slot.day}|${slot.time}`));
};
// --- End New Mock Data ---

/**
 * Generates a default registration item for a course.
 * @param {object} course - The course to generate a registration for.
 * @returns {object} A registration item with a default tutor and class.
 */
export const makeRegistrationItem = (course) => {
  // Find the first available class for the given courseId from the created classes.
  const firstAvailableClass = _createdClasses.find(
    c => c.courseId === course.courseId && c.enrolledStudents < c.maxStudents && c.status !== 'removed'
  );

  if (firstAvailableClass) {
    return {
      // Core course info
      courseId: course.courseId,
      name: course.name,
      // Attached class info
      ...firstAvailableClass,
      // Keep `registration` object for compatibility with edit modal logic, but make it richer
      registration: {
        tutor: firstAvailableClass.tutorName,
        sessions: firstAvailableClass.sessions,
      },
    };
  }
  // If no class is found, return a version that requires the user to pick a class.
  return { 
    ...course, 
    classId: null,
    tutorName: null,
    sessions: [],
    registration: null 
  };
};

/**
 * Generates a list of available classes for a given course and tutor.
 * This is a mock function to simulate fetching class schedules.
 * @param {string} courseId - The ID of the course.
 * @param {string} tutorName - The name of the tutor.
 * @returns {Array<object>} A list of class schedule objects.
 */
export const getClassesForCourseAndTutor = (courseId, tutorName) => {
  // This function now returns REAL class data created by the coordinator.
  const matchingClasses = _createdClasses.filter(
    c => c.courseId === courseId && c.tutorName === tutorName && c.status !== 'removed'
  );

  // Return the full class objects.
  return matchingClasses;
};