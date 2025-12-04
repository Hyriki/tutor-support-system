import React from 'react';
import Header from '../../components/header/Header'; // Điều chỉnh đường dẫn nếu cần
import Footer from '../../components/footer/Footer'; // Điều chỉnh đường dẫn nếu cần

// --- MOCK DATA (Dữ liệu giả lập theo hình ảnh) ---

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

// --- COMPONENT CHÍNH ---

const OptimizeResourceAllocation = () => {

  // Hàm xử lý khi nhấn vào Tag button
  const handleTagClick = (tagName) => {
    alert(`${tagName} notification has been sent`);
    // Sau này có thể thêm logic điều hướng hoặc mở modal ở đây
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
        
        {/* --- SECTION 1: PENDING REGISTRATIONS --- */}
        <section className="mb-12">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Pending registrations</h1>

          {pendingRegistrations.map((group, index) => (
            <div key={group.id} className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
              
              {/* Header của từng Card */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col items-center justify-center">
                 {/* Dấu tích V (Optional icon decoration) */}
                 <div className="text-gray-400 text-sm mb-1">✓</div>
                 <h2 className="text-lg font-bold text-gray-700">Requirement List</h2>
              </div>

              <div className="p-6">
                {/* Course Title Row */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-gray-500 font-medium">{group.id}</span>
                  <span className="text-[#0097B2] font-semibold">{group.courseCode}</span>
                  
                  {/* --- PHẦN TAGS ĐÃ ĐƯỢC SỬA THÀNH BUTTON --- */}
                  <div className="flex gap-2">
                    {group.tags.map((tag, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleTagClick(tag)}
                        className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded font-medium hover:bg-cyan-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-300"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {/* ------------------------------------------ */}

                </div>

                {/* Table for this specific requirement */}
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
                            <div>{student.id}</div>
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
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-800">Automatic matching</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-6 bg-gray-50 p-2 pl-4 border-l-4 border-[#0097B2]">
              Automatic matching
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-900 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="py-4">Student ID</th>
                    <th className="py-4">Student Name</th>
                    <th className="py-4">EmployeeID</th>
                    <th className="py-4">EmployeeName</th>
                    <th className="py-4">Class</th>
                    <th className="py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {automaticMatches.map((match, index) => (
                    <tr key={index} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <td className="py-4 text-gray-600">{match.studentId}</td>
                      <td className="py-4 text-gray-600">{match.studentName}</td>
                      <td className="py-4 text-gray-600">{match.employeeId}</td>
                      <td className="py-4 text-gray-600">{match.employeeName}</td>
                      <td className="py-4 text-gray-600">{match.classId}</td>
                      <td className="py-4 text-right">
                        <button className="bg-[#0097B2] hover:bg-[#007f96] text-white font-medium py-1.5 px-6 rounded text-xs transition-colors">
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

      </main>

      <Footer />
    </div>
  );
};

export default OptimizeResourceAllocation;