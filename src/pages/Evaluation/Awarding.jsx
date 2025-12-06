import React, { useState } from 'react';
import { sendNotification } from '../../../lib/notificationHelper';
import Header from '../../components/header/Header'; 
import Footer from '../../components/footer/Footer';
import { FaEdit, FaFileExport, FaAward, FaMedal, FaListAlt, FaCheckCircle, FaSpinner, FaCheckDouble } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- MOCK DATA (Đã sửa lại key 'class' thành 'classId' cho chuẩn) ---
const initialStudents = [
  { id: '2352429', name: 'L.T.H', scholarship: 1, credit: 100, creditChange: 1, classId: 'CC01', gpa: 9.5, participation: 'High' },
  { id: '2352430', name: 'Tran Duc Duy', scholarship: 1, credit: 100, creditChange: 1, classId: 'CC01', gpa: 9.2, participation: 'High' },
  { id: '2352431', name: 'Leonardo Da Vinci', scholarship: 2, credit: 99, creditChange: 2, classId: 'CC02', gpa: 8.8, participation: 'Medium' },
  { id: '2352432', name: 'Emma Watson', scholarship: 2, credit: 99, creditChange: 2, classId: 'CC03', gpa: 8.7, participation: 'Medium' },
  { id: '2352433', name: 'Stone Cold', scholarship: 3, credit: 98, creditChange: -2, classId: 'CC03', gpa: 8.0, participation: 'Low' },
  { id: '2352434', name: 'Robert Downey Jr.', scholarship: 3, credit: 98, creditChange: 3, classId: 'CC02', gpa: 8.1, participation: 'Low' },
  { id: '2352435', name: 'Johnny Depp', scholarship: 0, credit: 95, creditChange: 7, classId: 'CC02', gpa: 7.5, participation: 'Very High' },
  { id: '2352436', name: 'Tom Hardy', scholarship: 0, credit: 94, creditChange: 7, classId: 'CC02', gpa: 6.5, participation: 'High' },
  { id: '2352437', name: 'Sarah Connor', scholarship: 1, credit: 97, creditChange: -2, classId: 'CC01', gpa: 9.0, participation: 'Medium' },
  { id: '2352438', name: 'John Rambo', scholarship: 2, credit: 96, creditChange: 1, classId: 'CC04', gpa: 8.5, participation: 'Medium' },
];

const Awarding = () => {
  const [activeTab, setActiveTab] = useState('report'); 
  const [students, setStudents] = useState(initialStudents);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // --- HÀM XUẤT PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = activeTab === 'report' ? 'General Awarding Report' 
                : activeTab === 'scholarship' ? 'Scholarship Candidates List' 
                : 'Training Credits Report';
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    let tableHead = [];
    let tableBody = [];

    if (activeTab === 'report') {
        tableHead = [['Student ID', 'Name', 'Scholarship', 'Credit', 'Class']];
        tableBody = students.map(s => [s.id, s.name, s.scholarship || '0', `${s.credit} (${s.creditChange > 0 ? '+' : ''}${s.creditChange})`, s.classId]);
    } else if (activeTab === 'scholarship') {
        tableHead = [['Student ID', 'Name', 'Class', 'GPA']];
        tableBody = students.map(s => [s.id, s.name, s.classId, s.gpa]);
    } else { // credits
        tableHead = [['Student ID', 'Name', 'Class', 'Total Credit']];
        tableBody = students.map(s => [s.id, s.name, s.classId, `${s.credit} (${s.creditChange > 0 ? '+' : ''}${s.creditChange})`]);
    }

    autoTable(doc, {
        startY: 40,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [0, 151, 178] },
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  // --- LOGIC GIẢ LẬP XỬ LÝ ---
  const handleProcessing = (type) => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        const msg = type === 'scholarship' 
            ? "✅ Scholarship Criteria Checked! List generated based on GPA." 
            : "✅ Participation Proofs Verified! Merit points calculated.";
        alert(msg);
    }, 1500);
  };
  
  // --- LOGIC GIẢ LẬP PUBLISH ---
  const handlePublish = () => {
    const confirmed = window.confirm("Are you sure you want to finalize and publish this list? This action cannot be undone.");
    
    if (confirmed) {
        setIsPublished(true);
        sendNotification('student', 'Scholarship results have been published');
        alert("✅ Success! Results published and locked.");
    }
  };

  // Helper function to format credit change
  const formatCreditChange = (change) => {
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? 'text-green-600' : 'text-red-600';
    return <span className={`text-xs ml-1 ${color}`}>({sign}{change})</span>;
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header TabList={2}/>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Awarding Management</h1>

        {/* --- TABS --- */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm">
            <button 
                className={`py-4 px-6 font-semibold flex items-center gap-2 transition-colors border-b-4 ${activeTab === 'report' ? 'border-[#0097B2] text-[#0097B2] bg-cyan-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('report')}
            >
                <FaListAlt /> Awarding Report
            </button>
            <button 
                className={`py-4 px-6 font-semibold flex items-center gap-2 transition-colors border-b-4 ${activeTab === 'scholarship' ? 'border-[#0097B2] text-[#0097B2] bg-cyan-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('scholarship')}
            >
                <FaAward /> Scholarship
            </button>
            <button 
                className={`py-4 px-6 font-semibold flex items-center gap-2 transition-colors border-b-4 ${activeTab === 'credits' ? 'border-[#0097B2] text-[#0097B2] bg-cyan-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('credits')}
            >
                <FaMedal /> Training Credits
            </button>
        </div>

        {/* --- ACTION BUTTONS (Tab 2 & 3) --- */}
        {activeTab !== 'report' && (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100 flex justify-between items-center animate-fade-in-down">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">
                        {activeTab === 'scholarship' ? 'Evaluate Scholarship Eligibility' : 'Calculate Training Credits'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {activeTab === 'scholarship' 
                            ? 'Run algorithm to filter students with GPA > 8.0.' 
                            : 'Verify activity proofs and update merit scores.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => handleProcessing(activeTab)}
                        disabled={isProcessing || isPublished}
                        className="bg-[#0097B2] hover:bg-[#007f96] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                        {isProcessing ? "Processing..." : (activeTab === 'scholarship' ? "Check Criteria" : "Verify & Calculate")}
                    </button>
                </div>
            </div>
        )}

        {/* --- MAIN TABLE --- */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#0097B2] text-white">
                <h3 className="font-bold text-lg">
                    {activeTab === 'report' ? 'List of students' : (activeTab === 'scholarship' ? 'Scholarship Candidates' : 'Credit Scores')}
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                        <tr>
                            {/* --- DYNAMIC HEADER --- */}
                            <th className="px-6 py-4">Student ID</th>
                            <th className="px-6 py-4">Student Name</th>

                            {activeTab === 'report' && (
                                <>
                                    <th className="px-6 py-4">Scholarship</th>
                                    <th className="px-6 py-4">Credit</th>
                                    <th className="px-6 py-4">Class</th>
                                </>
                            )}
                            {activeTab === 'scholarship' && (
                                <>
                                    <th className="px-6 py-4">Class</th>
                                    <th className="px-6 py-4">GPA</th>
                                </>
                            )}
                            {activeTab === 'credits' && (
                                <>
                                    <th className="px-6 py-4">Class</th>
                                    <th className="px-6 py-4">Total Credit</th>
                                </>
                            )}
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                
                                {/* Common Columns */}
                                <td className="px-6 py-4 font-medium text-gray-900">{student.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>

                                {/* --- DYNAMIC BODY --- */}
                                {activeTab === 'report' && (
                                    <>
                                        <td className="px-6 py-4 text-gray-900">{student.scholarship || '0'}</td>
                                        <td className="px-6 py-4 text-gray-900">
                                            <span className="font-semibold">{student.credit}</span>
                                            {formatCreditChange(student.creditChange)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">{student.classId}</td>
                                    </>
                                )}

                                {activeTab === 'scholarship' && (
                                    <>
                                        <td className="px-6 py-4 text-gray-900">{student.classId}</td>
                                        <td className="px-6 py-4 font-bold text-blue-600">{student.gpa}</td>
                                    </>
                                )}

                                {activeTab === 'credits' && (
                                    <>
                                        <td className="px-6 py-4 text-gray-900">{student.classId}</td>
                                        <td className="px-6 py-4 text-gray-900">
                                            <span className="font-bold">{student.credit}</span>
                                            {formatCreditChange(student.creditChange)}
                                        </td>
                                    </>
                                )}

                                <td className="px-6 py-4 text-right">
                                    <button 
                                        disabled={isPublished}
                                        className="bg-[#0097B2] text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-[#007f96] inline-flex items-center gap-2 shadow-sm transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-500">Showing {students.length} students</span>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleExportPDF}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all"
                    >
                        <FaFileExport /> Export {activeTab === 'report' ? 'Report' : 'Result'}
                    </button>
                    {activeTab === 'report' && (
                        <button 
                            onClick={handlePublish}
                            disabled={isPublished}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <FaCheckDouble /> {isPublished ? 'Published' : 'Approve & Publish'}
                        </button>
                    )}
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Awarding;