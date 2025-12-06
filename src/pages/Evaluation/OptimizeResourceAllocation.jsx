import React, { useState } from 'react';
import { sendNotification } from '../../../lib/notificationHelper';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

// --- MOCK DATA ---
const pendingRegistrations = [
  {
    id: 1,
    courseCode: "CO3001 - Software Engineering",
    tags: ["Tutor offer", "Extra class"],
    students: [
      { id: "2352429", name: "L.T.H", average: "10.0", tutor: "P.T", classId: "CC01", scholarship: 1, assignment: 10.0, midterm: 10.0, final: 10.0 }
    ]
  },
  {
    id: 2,
    courseCode: "CO3001 - Software Engineering",
    tags: ["Tutor offer", "Extra class"],
    students: [
      { id: "2352430", name: "Tom H.", average: "5.0", tutor: "P.T", classId: "CC01", scholarship: 0, assignment: 5.0, midterm: 5.0, final: 5.0 }
    ]
  },
  {
    id: 3,
    courseCode: "CO3001 - Software Engineering",
    tags: ["Tutor offer", "Extra class"],
    students: [
      { id: "2352432", name: "Emma W.", average: "8.0", tutor: "P.T", classId: "CC01", scholarship: 2, assignment: 8.0, midterm: 8.0, final: 8.0 }
    ]
  }
];

const automaticMatches = [
  { studentId: "2352429", studentName: "L.T.H", employeeId: "9999", employeeName: "P.T", classId: "CC01" },
  { studentId: "2352430", studentName: "L.T.D", employeeId: "9999", employeeName: "P.T", classId: "CC01" },
  { studentId: "2352431", studentName: "Leonardo", employeeId: "8888", employeeName: "Chau Vo", classId: "CC02" },
  { studentId: "2352432", studentName: "Emma", employeeId: "6666", employeeName: "Lai Nguyen", classId: "CC03" },
  { studentId: "2352433", studentName: "Stone", employeeId: "h6666", employeeName: "Lai Nguyen", classId: "CC03" },
  { studentId: "2352434", studentName: "Robert", employeeId: "8888", employeeName: "Chau Vo", classId: "CC02" },
];

// --- COMPONENTS CON ---
const StatCard = ({ label, value, colorClass }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-gray-100">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
  </div>
);

const NoDataMessage = () => (
  <div className="border-2 border-dashed border-red-300 bg-red-50 p-12 rounded-lg text-center my-10 animate-pulse">
    <h2 className="text-2xl font-semibold text-red-700">⚠️ Required performance data is unavailable.</h2>
    <p className="text-red-600 mt-2">System could not retrieve analysis records. Please run "Analyze Record Data" first.</p>
  </div>
);

// --- MAIN COMPONENT ---
const OptimizeResourceAllocation = () => {
  // Thay vì dùng hằng số, ta dùng State để có thể đổi qua đổi lại
  const [simulateNoData, setSimulateNoData] = useState(false);

  const handleTagClick = (tagName) => {
    sendNotification('student', 'You have a new tutor offer');
    alert(`System Action: ${tagName} notification has been sent successfully.`);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header TabList={2}/>
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
        
        {/* --- [DEMO TOOL] NÚT BẬT TẮT CHẾ ĐỘ LỖI (CHỈ DÙNG KHI DEMO) --- */}
        <div className="flex justify-end mb-4">
            <label className="flex items-center gap-2 cursor-pointer bg-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-300 border border-gray-300 shadow-sm transition-all">
                <input 
                    type="checkbox" 
                    checked={simulateNoData} 
                    onChange={() => setSimulateNoData(!simulateNoData)}
                    className="cursor-pointer"
                />
                🔧 DEMO: Simulate Missing Data (Test Case 004_3)
            </label>
        </div>

        {/* --- LOGIC HIỂN THỊ --- */}
        {simulateNoData ? (
          <NoDataMessage />
        ) : (
          <>
            {/* --- SECTION 0: OPTIMIZATION SUMMARY (TEST CASE 004_1) --- */}
            {/* Phần này bị thiếu trong code cũ của bạn, tôi đã thêm lại */}
            <section className="mb-12">
              <h1 className="text-xl font-bold text-gray-800 mb-6">Optimization Summary</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Students Analyzed" value="120" colorClass="text-blue-600" />
                <StatCard label="Weak Students Identified" value="15" colorClass="text-orange-600" />
                <StatCard label="High-Performing Tutors" value="8" colorClass="text-green-600" />
              </div>
            </section>

            {/* --- SECTION 1: PENDING REGISTRATIONS --- */}
            <section className="mb-12">
              <h1 className="text-xl font-bold text-gray-800 mb-6">Pending registrations</h1>
              {pendingRegistrations.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden border border-gray-100">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col items-center justify-center">
                    <div className="text-green-500 text-lg mb-1">✓</div>
                    <h2 className="text-lg font-bold text-gray-700">Requirement List</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-gray-500 font-medium">{group.id}</span>
                      <span className="text-[#0097B2] font-semibold">{group.courseCode}</span>
                      <div className="flex gap-2">
                        {group.tags.map((tag, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleTagClick(tag)} 
                            className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded font-medium hover:bg-cyan-200 transition-colors cursor-pointer border border-cyan-200"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="text-gray-500 font-semibold border-b border-gray-100">
                            <th className="py-2 pr-4">StudentID<br/><span className="text-xs font-normal">Average</span></th>
                            <th className="py-2 pr-4">Fullname</th>
                            <th className="py-2 pr-4">Tutor</th>
                            <th className="py-2 pr-4">ClassID</th>
                            <th className="py-2 pr-4">Scholarship</th>
                            <th className="py-2 pr-4">Assignment</th>
                            <th className="py-2 pr-4">Midterm</th>
                            <th className="py-2 pr-4">Final</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.students.map((student, sIndex) => (
                            <tr key={sIndex} className="text-gray-700">
                              <td className="py-3 align-top">
                                <div className="font-medium">{student.id}</div>
                                <div className="text-gray-400 text-xs mt-1">{student.average}</div>
                              </td>
                              <td className="py-3 align-top">{student.name}</td>
                              <td className="py-3 align-top">{student.tutor}</td>
                              <td className="py-3 align-top">{student.classId}</td>
                              <td className="py-3 align-top">{student.scholarship}</td>
                              <td className="py-3 align-top">{student.assignment}</td>
                              <td className="py-3 align-top">{student.midterm}</td>
                              <td className="py-3 align-top">{student.final}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* --- SECTION 2: AUTOMATIC MATCHING --- */}
            <section>
              <h1 className="text-xl font-bold text-gray-800 mb-6">Automatic matching</h1>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-900 font-bold uppercase border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="py-4 px-4">Student ID</th>
                        <th className="py-4 px-4">Student Name</th>
                        <th className="py-4 px-4">EmployeeID</th>
                        <th className="py-4 px-4">EmployeeName</th>
                        <th className="py-4 px-4">Class</th>
                        <th className="py-4 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {automaticMatches.map((match, index) => (
                        <tr key={index} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
                          <td className="py-4 px-4 text-gray-600 font-medium">{match.studentId}</td>
                          <td className="py-4 px-4 text-gray-600">{match.studentName}</td>
                          <td className="py-4 px-4 text-gray-600">{match.employeeId}</td>
                          <td className="py-4 px-4 text-gray-600">{match.employeeName}</td>
                          <td className="py-4 px-4 text-gray-600">{match.classId}</td>
                          <td className="py-4 px-4 text-right">
                            <button 
                                onClick={() => {
                                    sendNotification('student', 'You have a new tutor offer');
                                    alert(`Matched ${match.studentName} with ${match.employeeName}`);
                                }}
                                className="bg-[#0097B2] hover:bg-[#007f96] text-white font-medium py-1.5 px-6 rounded text-xs transition-colors shadow-sm"
                            >
                              Accept
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OptimizeResourceAllocation;