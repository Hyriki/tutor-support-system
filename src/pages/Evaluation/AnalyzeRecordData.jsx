import React, { useState } from 'react';
import Header from '../../components/header/Header'; 
import Footer from '../../components/footer/Footer'; 
import { FaFilter, FaFileDownload, FaExclamationTriangle } from 'react-icons/fa'; // Thêm icon cảnh báo
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- MOCK DATA (Giữ nguyên) ---
const detailedGrades = [
  { no: 1, id: '52023001', name: 'Alice Johnson', assignment: 90, midterm: 85, final: 92 },
  { no: 2, id: '52023002', name: 'Bob Williams', assignment: 75, midterm: 80, final: 78 },
  { no: 3, id: '52023003', name: 'Charlie Brown', assignment: 88, midterm: 92, final: 87 },
  { no: 4, id: '52023004', name: 'Diana Prince', assignment: 65, midterm: 70, final: 68 },
  { no: 5, id: '52023005', name: 'Eve Adams', assignment: 95, midterm: 90, final: 96 },
  { no: 6, id: '52023006', name: 'Frank White', assignment: 82, midterm: 78, final: 85 },
];

const assignmentStats = [
  { name: 'Essay 1', due: '2024-03-15', submitted: 48, total: 50, rate: '96%' },
  { name: 'Project Proposal', due: '2024-03-22', submitted: 45, total: 50, rate: '90%' },
  { name: 'Quiz 1', due: '2024-03-29', submitted: 49, total: 50, rate: '98%' },
  { name: 'Midterm Review', due: '2024-04-05', submitted: 47, total: 50, rate: '94%' },
  { name: 'Case Study', due: '2024-04-12', submitted: 40, total: 50, rate: '80%' },
];

const enrollmentTrends = [
  { name: 'Data Analytics 101', enrollment: 120, change: '+10%', grade: 'B+' },
  { name: 'Cloud Computing Basics', enrollment: 85, change: '-5%', grade: 'B' },
  { name: 'Software Engineering Capstone', enrollment: 45, change: '0%', grade: 'A-' },
  { name: 'Cybersecurity Fundamentals', enrollment: 150, change: '+15%', grade: 'B+' },
  { name: 'AI & Machine Learning', enrollment: 110, change: '+8%', grade: 'A' },
];

// --- COMPONENTS CON ---
// Cập nhật ActionButtons để nhận props disabled
const ActionButtons = ({ onExport, disabled }) => (
  <div className="flex gap-2">
    <button 
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 bg-white transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'}`}
    >
      <FaFilter /> Filter
    </button>
    <button 
        onClick={onExport} 
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 text-white rounded text-sm transition-all
        ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0097B2] hover:bg-[#007f96]'}`}
    >
      <FaFileDownload /> Export Report
    </button>
  </div>
);

const AnalyzeRecordData = () => {
  // --- 1. STATE CHO DEMO TESTCASE 002_3 ---
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  const handleExportPDF = () => {
    // Chặn chức năng nếu đã quá hạn (đề phòng trường hợp hack nút)
    if (isDeadlinePassed) {
        alert("Action failed: The publication window for this reporting session has closed.");
        return;
    }

    const doc = new jsPDF();

    // Main Title
    doc.setFontSize(18);
    doc.text("Record Data Overview Report", 14, 22);

    // Table 1: Detailed Student Grade Report
    doc.setFontSize(14);
    doc.text("Detailed Student Grade Report", 14, 32);
    autoTable(doc, {
        startY: 36,
        head: [['NO.', 'STUDENT ID', 'FULL NAME', 'ASSIGNMENT SCORE', 'MIDTERM SCORE', 'FINAL SCORE']],
        body: detailedGrades.map(s => [s.no, s.id, s.name, s.assignment, s.midterm, s.final]),
    });

    // Table 2: Assignment Submissions Overview
    doc.setFontSize(14);
    const lastTable = doc.lastAutoTable;
    if (lastTable && lastTable.finalY) {
        doc.text("Assignment Submissions Overview", 14, lastTable.finalY + 15);
        autoTable(doc, {
            startY: lastTable.finalY + 19,
            head: [['ASSIGNMENT NAME', 'DUE DATE', 'SUBMITTED', 'TOTAL STUDENTS', 'COMPLETION RATE']],
            body: assignmentStats.map(s => [s.name, s.due, s.submitted, s.total, s.rate]),
        });
    }

    // Table 3: Enrollment Trends by Course
    doc.setFontSize(14);
    const secondLastTable = doc.lastAutoTable;
    if (secondLastTable && secondLastTable.finalY) {
        doc.text("Enrollment Trends by Course", 14, secondLastTable.finalY + 15);
        autoTable(doc, {
            startY: secondLastTable.finalY + 19,
            head: [['COURSE NAME', 'ENROLLMENT', 'CHANGE (LAST TERM)', 'AVG. GRADE']],
            body: enrollmentTrends.map(s => [s.name, s.enrollment, s.change, s.grade]),
        });
    }

    doc.save('Record_Data_Report.pdf');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header TabList={2}/>

      <main className="max-w-7xl mx-auto px-8 py-8 text-gray-800">
        
        {/* --- [DEMO TOOL] Nút bật tắt Testcase 002_3 --- */}
        <div className="flex justify-end mb-4">
            <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-200 border border-gray-300 shadow-sm transition-all select-none">
                <input 
                    type="checkbox" 
                    checked={isDeadlinePassed} 
                    onChange={() => setIsDeadlinePassed(!isDeadlinePassed)}
                    className="cursor-pointer"
                />
                🕒 DEMO: Simulate "Past Deadline" (Test Case 002_3)
            </label>
        </div>

        {/* --- ERROR MESSAGE (Hiện khi quá hạn) --- */}
        {isDeadlinePassed && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm flex items-start animate-fade-in-down">
                <FaExclamationTriangle className="mt-1 mr-3 text-xl" />
                <div>
                    <p className="font-bold">Error: The publication window for this reporting session has closed.</p>
                    <p className="text-sm">You cannot filter data or export reports after the deadline (Current Date {'>'} Deadline).</p>
                </div>
            </div>
        )}

        {/* --- Page Title --- */}
        <h1 className="text-xl font-bold mb-8">Record Data Overview</h1>

        {/* --- SECTION 1: GRADE DISTRIBUTION (PIE CHART) --- */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Student Grade Distribution</h2>
            {/* Truyền trạng thái disabled vào nút */}
            <ActionButtons onExport={handleExportPDF} disabled={isDeadlinePassed} />
          </div>

          <div className="flex justify-center items-center">
            <div className="relative w-64 h-64 rounded-full" 
                 style={{
                   background: `conic-gradient(
                     #2dd4bf 0% 20%,    
                     #e5e7eb 20% 55%,   
                     #374151 55% 85%,   
                     #ef4444 85% 90%,   
                     #ffffff 90% 100%   
                   )`
                 }}>
                 <div className="absolute top-10 right-2 text-xs text-teal-600 font-bold">Excellent: 20%</div>
                 <div className="absolute top-1/2 right-0 transform translate-x-4 text-xs text-red-500 font-bold">Needs Improvement: 5%</div>
                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-700 font-bold">Good: 30%</div>
                 <div className="absolute top-10 left-4 text-xs text-gray-300">Very Good: 35%</div>
            </div>
          </div>
          
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600">
             <div className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-400 rounded-full"></span> Excellent</div>
             <div className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-200 rounded-full"></span> Very Good</div>
             <div className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-700 rounded-full"></span> Good</div>
             <div className="flex items-center gap-1"><span className="w-2 h-2 bg-white border border-gray-300 rounded-full"></span> Satisfactory</div>
             <div className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Needs Improvement</div>
          </div>
        </section>

        {/* --- SECTION 2: DETAILED GRADE REPORT --- */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Detailed Student Grade Report</h2>
            {/* Truyền trạng thái disabled vào nút */}
            <ActionButtons onExport={handleExportPDF} disabled={isDeadlinePassed} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase border-b">
                <tr>
                  <th className="py-3 pr-4">NO.</th>
                  <th className="py-3 pr-4">STUDENT ID</th>
                  <th className="py-3 pr-4">FULL NAME</th>
                  <th className="py-3 pr-4">ASSIGNMENT SCORE</th>
                  <th className="py-3 pr-4">MIDTERM SCORE</th>
                  <th className="py-3 pr-4">FINAL SCORE</th>
                </tr>
              </thead>
              <tbody>
                {detailedGrades.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{row.no}</td>
                    <td className="py-3">{row.id}</td>
                    <td className="py-3 text-gray-900 font-medium">{row.name}</td>
                    <td className="py-3">{row.assignment}</td>
                    <td className="py-3">{row.midterm}</td>
                    <td className="py-3">{row.final}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- SECTION 3: ADDITIONAL ANALYTICS (GRID) --- */}
        <h2 className="text-lg font-semibold mb-4">Additional Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">Assignment Submissions Overview</h3>
              {/* Truyền trạng thái disabled vào nút */}
              <ActionButtons onExport={handleExportPDF} disabled={isDeadlinePassed} />
            </div>
            <table className="w-full text-xs text-left">
              <thead className="text-gray-500 uppercase border-b">
                <tr>
                  <th className="py-2">ASSIGNMENT NAME</th>
                  <th className="py-2">DUE DATE</th>
                  <th className="py-2">SUBMITTED</th>
                  <th className="py-2">TOTAL STUDENTS</th>
                  <th className="py-2">COMPLETION RATE</th>
                </tr>
              </thead>
              <tbody>
                {assignmentStats.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3 text-gray-500">{item.due}</td>
                    <td className="py-3">{item.submitted}</td>
                    <td className="py-3">{item.total}</td>
                    <td className="py-3">{item.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">Enrollment Trends by Course</h3>
              {/* Truyền trạng thái disabled vào nút */}
              <ActionButtons onExport={handleExportPDF} disabled={isDeadlinePassed} />
            </div>
            <table className="w-full text-xs text-left">
              <thead className="text-gray-500 uppercase border-b">
                <tr>
                  <th className="py-2">COURSE NAME</th>
                  <th className="py-2">ENROLLMENT</th>
                  <th className="py-2">CHANGE (LAST TERM)</th>
                  <th className="py-2">AVG. GRADE</th>
                </tr>
              </thead>
              <tbody>
                {enrollmentTrends.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3">{item.enrollment}</td>
                    <td className={`py-3 ${item.change.includes('+') ? 'text-green-600' : (item.change.includes('-') ? 'text-red-500' : 'text-gray-500')}`}>
                      {item.change}
                    </td>
                    <td className="py-3">{item.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalyzeRecordData;