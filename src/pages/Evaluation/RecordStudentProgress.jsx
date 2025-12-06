import React, { useState, useEffect } from 'react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { useParams, Link, useNavigate } from 'react-router-dom';

// Import các component con
import FormRow from '../../components/evaluation/Form/FormRow';
import FormInput from '../../components/evaluation/Form/FormInput';
import { sendNotification } from '../../../lib/notificationHelper';
import FormSelect from '../../components/evaluation/Form/FormSelect';
import ProfileSection from '../../components/evaluation/Profile/ProfileSection';
import AvatarUploader from '../../components/evaluation/Profile/AvatarUploader';

const RecordStudentProgress = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const storageKey = `draft_progress_${studentId}`;

  // Dữ liệu hard-code
  const studentData = {
    id: 2352429,
    firstName: "Hung",
    lastName: "Lu Thuan",
    imageUrl: "https://i.postimg.cc/Y26Hyycd/My-Avatar2.png",
    nationality: "Vietnam",
    dob: "22/08/2005",
    ssn: "05120500xxx",
    gender: "Male",
    department: "A3",
    faculty: "CSE",
    classId: "CC23KHM1",
    program: "English-taught program",
    Mentor: "N.D.T",
    gradYear: "2027",
    gpa: "4.0",
    admissionDate: "28/10/2023",
    score_assignment: "10.0",
    score_midterm: "10.0",
    score_final: "10.0",
    feedback: "This is a very good student. He always try him best to complete my tasks."
  };

  const [formData, setFormData] = useState({
    score_assignment: studentData.score_assignment,
    score_midterm: studentData.score_midterm,
    score_final: studentData.score_final,
    feedback: studentData.feedback
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
      console.log("Draft loaded.");
    }
  }, [storageKey]);

  const validate = () => {
    const newErrors = {};
    if (!formData.score_assignment) newErrors.score_assignment = "Assignment score is required";
    if (!formData.score_midterm) newErrors.score_midterm = "Midterm score is required";
    if (!formData.score_final) newErrors.score_final = "Final score is required";
    if (!formData.feedback) newErrors.feedback = "Written feedback is compulsory for tutor";
    return newErrors;
  };

  const handleSaveDraft = () => {
    localStorage.setItem(storageKey, JSON.stringify(formData));
    alert("Draft saved successfully! You can resume later.");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Please fill in all required fields");
      return;
    }
    setErrors({});
    alert("Success: Student progress has been recorded.");
    console.log("Submitting:", formData);
    localStorage.removeItem(storageKey);
    sendNotification('admin', 'Tutor has submitted a progress report');
    // Đây là nơi xử lý logic submit, ví dụ:
    // navigate('/path-to-success-page');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      <form onSubmit={handleSubmit} className="font-sans text-gray-900 bg-white p-8 max-w-7xl mx-auto my-8 rounded-lg shadow">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Student Profile
          </h1>
          <span className="text-sm text-gray-500">Last update: 29/10/2023 12:52:42</span>
        </div>

        {/* Section 1: Personal Info */}
        <ProfileSection title="Personal Information">
          <div className="flex flex-col md:flex-row gap-8">
            <AvatarUploader defaultImageUrl={studentData.imageUrl} />
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-x-6">
              <FormRow label="ID">
                <FormInput type="text" defaultValue={studentData.id} readOnly />
              </FormRow>
              <FormRow label="First Name">
                <FormInput type="text" defaultValue={studentData.firstName} />
              </FormRow>
              <FormRow label="Last Name">
                <FormInput type="text" defaultValue={studentData.lastName} />
              </FormRow>
              <FormRow label="Nationality">
                <FormSelect defaultValue={studentData.nationality}>
                  <option>Vietnam</option>
                  <option>USA</option>
                  <option>China</option>
                  <option>Other</option>
                </FormSelect>
              </FormRow>
              <FormRow label="Date of Birth">
                <FormInput type="text" defaultValue={studentData.dob} />
              </FormRow>
              <FormRow label="SSN">
                <FormInput type="text" defaultValue={studentData.ssn} />
              </FormRow>
              <FormRow label="Gender">
                <FormSelect defaultValue={studentData.gender}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </FormSelect>
              </FormRow>
            </div>
          </div>
        </ProfileSection>

        {/* Section 2: Academic Details */}
        <ProfileSection 
          title="Academic details" 
          contentClassName="grid grid-cols-1 md:grid-cols-4 gap-x-6"
        >
          <FormRow label="Department">
            <FormInput type="text" defaultValue={studentData.department} />
          </FormRow>
          <FormRow label="Faculty">
            <FormInput type="text" defaultValue={studentData.faculty} />
          </FormRow>
          <FormRow label="Class ID">
            <FormInput type="text" defaultValue={studentData.classId} />
          </FormRow>
          <FormRow label="Program">
            <FormInput type="text" defaultValue={studentData.program} />
          </FormRow>
          <FormRow label="Mentor">
            <FormInput type="text" defaultValue={studentData.Mentor} />
          </FormRow>
          <FormRow label="Graduation year (expected)">
            <FormInput type="text" defaultValue={studentData.gradYear} />
          </FormRow>
          <FormRow label="Cumulative GPA">
            <FormInput type="text" defaultValue={studentData.gpa} />
          </FormRow>
          <FormRow label="Admission Date">
            <FormInput type="text" defaultValue={studentData.admissionDate} />
          </FormRow>
        </ProfileSection>

        {/* Section 3: Score */}
        <ProfileSection 
          title="Score" 
          contentClassName="grid grid-cols-1 md:grid-cols-3 gap-x-6"
        >
          <FormRow label="Assignment">
            <FormInput 
              type="text" 
              name="score_assignment"
              value={formData.score_assignment} 
              onChange={handleChange}
              className={errors.score_assignment ? 'border-red-500' : ''}
            />
            {errors.score_assignment && <p className="text-red-500 text-xs mt-1">{errors.score_assignment}</p>}
          </FormRow>
          <FormRow label="Midterm">
            <FormInput 
              type="text" 
              name="score_midterm"
              value={formData.score_midterm}
              onChange={handleChange}
              className={errors.score_midterm ? 'border-red-500' : ''}
            />
            {errors.score_midterm && <p className="text-red-500 text-xs mt-1">{errors.score_midterm}</p>}
          </FormRow>
          <FormRow label="Final">
            <FormInput 
              type="text" 
              name="score_final"
              value={formData.score_final}
              onChange={handleChange}
              className={errors.score_final ? 'border-red-500' : ''}
            />
            {errors.score_final && <p className="text-red-500 text-xs mt-1">{errors.score_final}</p>}
          </FormRow>
        </ProfileSection>

        {/* Section 4: Feedback */}
        <ProfileSection title="Written Feedback">
          <textarea 
            rows="5"
            name="feedback"
            className={`w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.feedback ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.feedback}
            onChange={handleChange}
          />
          {errors.feedback && <p className="text-red-500 text-xs mt-1">{errors.feedback}</p>}
        </ProfileSection>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={handleSaveDraft} className="bg-yellow-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-yellow-600">
            Save Draft
          </button>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700">
            Submit
          </button>
          <button type="button" onClick={() => navigate(-1)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-200 border border-gray-300">
            Cancel
          </button>
        </div>

      </form>
      
      <Footer />
    </div>
  );
};

export default RecordStudentProgress;