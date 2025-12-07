import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { FaCheckCircle } from 'react-icons/fa';
import {
  tutorsData,
  getAllPossibleTimeSlots,
  getTutorAvailability,
  updateTutorAvailability,
} from '../RegisterCourse/mockDatabase'; // Adjust path if mockDatabase is moved

const TutorAvailability = () => {
  const [selectedTutor, setSelectedTutor] = useState('');
  // availabilityGrid stores the state of each possible slot for the selected tutor.
  // { day: string, time: string, isAvailable: boolean }
  const [availabilityGrid, setAvailabilityGrid] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Memoize to prevent re-calculation on every render, which was causing the state to reset.
  const allPossibleSlots = useMemo(() => getAllPossibleTimeSlots(), []);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = useMemo(() => {
    const times = [];
    for (let i = 7; i < 18; i++) {
      const start = i.toString().padStart(2, '0');
      const end = (i + 1).toString().padStart(2, '0');
      times.push(`${start}:00 - ${end}:00`);
    }
    return times;
  }, []);

  // Effect to load initial availability when selectedTutor changes
  useEffect(() => {
    if (selectedTutor) {
      const currentTutorAvailability = getTutorAvailability(selectedTutor);
      // Map all possible slots to the tutor's actual availability.
      // This now handles cases where stored availability might be in larger blocks (e.g., 2-hour)
      // than the grid's 1-hour slots, ensuring backward compatibility with old data.
      const initialGrid = allPossibleSlots.map(slot => ({
        ...slot,
        isAvailable: currentTutorAvailability.some(tutorSlot => {
          if (slot.day !== tutorSlot.day) {
            return false;
          }
          // Direct match (e.g., 1-hour slot vs 1-hour slot)
          if (slot.time === tutorSlot.time) {
            return true;
          }
          // Check if 1-hour grid slot is inside a larger (e.g., 2-hour) availability block
          const [slotStart] = slot.time.split(' - ').map(t => parseInt(t.split(':')[0], 10));
          const [tutorStart, tutorEnd] = tutorSlot.time.split(' - ').map(t => parseInt(t.split(':')[0], 10));
          return !isNaN(tutorStart) && !isNaN(tutorEnd) && slotStart >= tutorStart && slotStart < tutorEnd;
        }),
      }));
      setAvailabilityGrid(initialGrid);
    } else {
      setAvailabilityGrid([]); // Clear grid if no tutor is selected
    }
  }, [selectedTutor, allPossibleSlots]); // Dependency on selectedTutor

  // Effect for success message timeout
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 3000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  // Toggles the availability status of a specific time slot in the grid
  const handleToggleAvailability = (slotToToggle) => {
    setAvailabilityGrid(prevGrid =>
      prevGrid.map(slot =>
        slot.day === slotToToggle.day && slot.time === slotToToggle.time
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    );
  };

  // Saves the current availability grid to the mock database
  const handleSaveAvailability = () => {
    if (!selectedTutor) {
      alert('Please select a tutor first.');
      return;
    }
    const newAvailability = availabilityGrid.filter(slot => slot.isAvailable);
    updateTutorAvailability(selectedTutor, newAvailability);
    setSuccessMsg('Availability saved successfully!');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto p-8 font-sans">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Set Tutor Availability</h2>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-3">
            <FaCheckCircle className="text-green-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Tutor</h3>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 text-gray-900"
            value={selectedTutor}
            onChange={(e) => setSelectedTutor(e.target.value)}
          >
            <option value="">-- Select a Tutor --</option>
            {tutorsData.map(tutor => (
              <option key={tutor.name} value={tutor.name}>
                {tutor.name}
              </option>
            ))}
          </select>
        </div>

        {selectedTutor && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Availability for {selectedTutor}
            </h3>

            <div className="overflow-x-auto">
              <div className="grid grid-cols-[auto_repeat(6,_minmax(0,_1fr))] gap-1 text-center min-w-[700px]">
                {/* Corner empty cell */}
                <div className="p-2 font-semibold text-gray-600"></div>
                {/* Day headers */}
                {daysOfWeek.map(day => (
                  <div key={day} className="p-2 font-semibold text-gray-600 border-b border-gray-200">
                    {day}
                  </div>
                ))}

                {/* Time slots and availability cells */}
                {timeSlots.map(time => (
                  <React.Fragment key={time}>
                    <div className="p-2 font-semibold text-gray-600 border-r border-gray-200 flex items-center justify-center">
                      <span className="text-xs">{time}</span>
                    </div>
                    {daysOfWeek.map(day => {
                      const slot = availabilityGrid.find(s => s.day === day && s.time === time);
                      const isAvailable = slot ? slot.isAvailable : false;
                      return (
                        <button
                          key={`${day}-${time}`}
                          className={`p-4 border border-gray-200 rounded-md text-sm transition-colors duration-150
                            ${isAvailable ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-50 hover:bg-gray-100'}
                            ${isAvailable ? 'text-green-800' : 'text-gray-500'}
                          `}
                          onClick={() => handleToggleAvailability({ day, time })}
                        >
                          {isAvailable ? 'Available' : 'Not Available'}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition duration-200"
                onClick={handleSaveAvailability}
              >
                Save Availability
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TutorAvailability;