import React from 'react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
// Import hook to navigate the page
import { useNavigate } from 'react-router-dom';
// Import icon
import { FaEdit, FaFileExport, FaCog, FaTimes } from 'react-icons/fa';

// Temporary data
const mockStudentList = [
  { id: '2352429', name: 'Lu Thuan Hung', scholarship: 1, credit: 100, creditChange: 1, class: 'CC01' },
  { id: '2352430', name: 'L.T.D', scholarship: 1, credit: 99, creditChange: 1, class: 'CC01' },
  { id: '2352431', name: 'Tom Hanks', scholarship: 2, credit: 99, creditChange: 2, class: 'CC02' },
  { id: '2352432', name: 'Emma Watson', scholarship: 2, credit: 98, creditChange: 2, class: 'CC03' },
  { id: '2352433', name: 'Emma Stone', scholarship: 3, credit: 98, creditChange: 3, class: 'CC03' },
  { id: '2352434', name: 'Robert Downey Jr.', scholarship: 3, credit: 97, creditChange: 3, class: 'CC02' },
  { id: '2352435', name: 'Johnny Depp', scholarship: 0, credit: 95, creditChange: 7, class: 'CC02' },
];

const MyTestPage = () => {
  // Create hook navigate
  const navigate = useNavigate();

  // Handle "Edit" click
  // It will navigate to the studentID page
  const handleEditClick = (studentId) => {
    navigate(`/student-profile/${studentId}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      {/* Main content of Layout Card */}
      <div className="font-sans text-gray-900 bg-white p-8 max-w-7xl mx-auto my-8 rounded-lg shadow">
        
        {/* Page title */}
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Awarding report
        </h1>

        {/* Table title bar (List of students) */}
        <div className="flex justify-between items-center bg-primary p-4 rounded-t-lg border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black-800">List of students</h2>
          <div className="flex gap-2">
            <button className="text-gray-500 hover:text-blue-700"><FaCog /></button>
            <button className="text-gray-500 hover:text-red-700"><FaTimes /></button>
          </div>
        </div>

        {/* Data table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            {/* Table title */}
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr className="text-sm font-semibold text-gray-600">
                <th className="p-4">Student ID</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Scholarship</th>
                <th className="p-4">Credit</th>
                <th className="p-4">Class</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            
            {/* Table content */}
            <tbody>
              {mockStudentList.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-700">{student.id}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="p-4 text-sm text-gray-700">{student.scholarship}</td>
                  <td className="p-4 text-sm text-gray-700">
                    <div>{student.credit}</div>
                    <div className="text-green-600 text-xs">(+{student.creditChange})</div>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{student.class}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleEditClick(student.id)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      <FaEdit />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer*/}
        <div className="flex justify-between items-center p-4">
          <span className="text-sm text-gray-600">10 results have been found</span>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
            <FaFileExport />
            Export
          </button>
        </div>

      </div>
      
      <Footer />
    </div>
  );
};

export default MyTestPage;