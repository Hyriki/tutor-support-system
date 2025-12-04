import React, { useState } from 'react';
import Header from '../../components/header/Header'; // Điều chỉnh đường dẫn theo project của bạn
import Footer from '../../components/footer/Footer'; // Điều chỉnh đường dẫn theo project của bạn
import { FaTimes, FaEnvelope } from 'react-icons/fa'; // Icon X và Phong bì

// --- DỮ LIỆU CÂU HỎI TRẮC NGHIỆM ---
const questions = [
  {
    id: 1,
    text: "Overall, how satisfied are you with this course?",
  },
  {
    id: 2,
    text: "How satisfied are you with the lecturer in charge of this course?",
  },
  {
    id: 3,
    text: "The study materials and references provided by the lecturer are very useful and up-to-date.",
  },
  {
    id: 4,
    text: "So, how does the total time you spent completing this course compare to the total designed time for the course?",
  },
  {
    id: 5,
    text: "How satisfied are you with the English presentation style of the lecturer for this course?",
  },
];

// Các mức độ đánh giá (Scale)
const ratingOptions = [
  "Very dissatisfied",
  "Dissatisfied",
  "Uncertain",
  "Satisfied",
  "Very satisfied"
];

const WriteEvaluationPage = () => {
  // State lưu trữ câu trả lời
  const [ratings, setRatings] = useState({}); // Lưu dạng { questionId: index }
  const [feedback, setFeedback] = useState("");

  // Hàm xử lý chọn rating
  const handleRate = (questionId, optionIndex) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Hàm xử lý submit
  const handleSubmit = () => {
    console.log("Ratings:", ratings);
    console.log("Feedback:", feedback);
    alert("Evaluation submitted successfully!");
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">
        
        {/* --- KHUNG 1: MULTIPLE CHOICE QUESTIONS --- */}
        <div className="border border-cyan-200 rounded-lg overflow-hidden mb-8 shadow-sm">
          
          {/* Header Xanh Nhạt */}
          <div className="bg-[#D1F4FA] px-6 py-4 flex justify-between items-center border-b border-cyan-200">
            <h2 className="text-xl font-extrabold text-[#008DA6] tracking-wide">
              Multiple Choice Questions
            </h2>
            <div className="flex gap-3 text-[#008DA6] text-xl cursor-pointer">
              <FaTimes className="hover:text-cyan-700" />
              <FaEnvelope className="hover:text-cyan-700" />
            </div>
          </div>

          {/* Danh sách câu hỏi */}
          <div className="bg-white">
            {questions.map((q, index) => (
              <div 
                key={q.id} 
                className={`px-8 py-6 ${index % 2 !== 0 ? 'bg-white' : 'bg-[#EAFBFE]'}`} // Xen kẽ màu nền giống Figma
              >
                {/* Câu hỏi */}
                <p className="text-[#008DA6] font-semibold mb-6 text-sm md:text-base">
                  {q.id}. {q.text}
                </p>

                {/* Các nút tròn lựa chọn */}
                <div className="flex flex-wrap justify-between items-start gap-4 md:px-10">
                  {ratingOptions.map((option, optIndex) => (
                    <div 
                      key={optIndex} 
                      className="flex flex-col items-center cursor-pointer group w-24"
                      onClick={() => handleRate(q.id, optIndex)}
                    >
                      {/* Vòng tròn (Radio Button Custom) */}
                      <div 
                        className={`w-8 h-8 rounded-full mb-3 transition-colors duration-200 
                          ${ratings[q.id] === optIndex ? 'bg-gray-600' : 'bg-gray-300 group-hover:bg-gray-400'}`}
                      ></div>
                      
                      {/* Label bên dưới */}
                      <span className="text-xs text-gray-700 text-center font-medium">
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- KHUNG 2: WRITTEN FEEDBACK --- */}
        <div className="border border-cyan-200 rounded-lg overflow-hidden mb-12 shadow-sm bg-[#D1F4FA]">
          
          {/* Header Xanh Nhạt */}
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-[#008DA6] uppercase tracking-wide">
              OTHER COMMENTS/SUGGESTIONS
            </h2>
            <div className="flex gap-3 text-[#008DA6] text-xl cursor-pointer">
              <FaTimes className="hover:text-cyan-700" />
              <FaEnvelope className="hover:text-cyan-700" />
            </div>
          </div>

          {/* Nội dung Form */}
          <div className="px-8 pb-8">
            <p className="text-[#008DA6] font-medium mb-4 text-lg">
              6. Do you have any other ideas or feedback you'd like to share with the university? Please let us know in the box below.
            </p>

            {/* Text Area */}
            <div className="bg-white p-4 rounded-md shadow-sm mb-8">
              <textarea
                className="w-full h-48 outline-none text-gray-600 resize-none text-base"
                placeholder="Type your feedback here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                defaultValue="Software engineering is a wonderful,fantastic,amazing subject. I like this subsect and also the professor"
              />
            </div>

            {/* Nút Submit */}
            <div className="flex justify-center">
              <button 
                onClick={handleSubmit}
                className="bg-[#0097B2] hover:bg-[#007f96] text-white font-bold py-3 px-12 rounded shadow-md transition-colors text-lg"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default WriteEvaluationPage;