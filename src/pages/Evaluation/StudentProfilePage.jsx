import React from 'react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { useParams, Link } from 'react-router-dom';

// Import các component con
import FormRow from '../../components/evaluation/Form/FormRow';
import FormInput from '../../components/evaluation/Form/FormInput';
import FormSelect from '../../components/evaluation/Form/FormSelect';
import ProfileSection from '../../components/evaluation/Profile/ProfileSection';
import AvatarUploader from '../../components/evaluation/Profile/AvatarUploader';

const StudentProfilePage = () => {
  const { studentId } = useParams();

  // Dữ liệu hard-code
  const studentData = {
    id: studentId,
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      <div className="font-sans text-gray-900 bg-white p-8 max-w-7xl mx-auto my-8 rounded-lg shadow">

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

        {/* Section 2: Academic Details - Use contentClassName */}
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

        {/* Section 3: Score - Use contentClassName */}
        <ProfileSection 
          title="Score" 
          contentClassName="grid grid-cols-1 md:grid-cols-3 gap-x-6"
        >
          <FormRow label="Assignment">
            <FormInput type="text" defaultValue={studentData.score_assignment} />
          </FormRow>
          <FormRow label="Midterm">
            <FormInput type="text" defaultValue={studentData.score_midterm} />
          </FormRow>
          <FormRow label="Final">
            <FormInput type="text" defaultValue={studentData.score_final} />
          </FormRow>
        </ProfileSection>

        {/* Section 4: Feedback */}
        <ProfileSection title="Written Feedback">
          <textarea 
            rows="5"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            defaultValue={studentData.feedback}
          />
        </ProfileSection>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Link to="/my-test" className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700">
            Save Changes
          </Link>
          <Link to="/my-test" className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-200 border border-gray-300">
            Cancel
          </Link>
        </div>

      </div>
      
      <Footer />
    </div>
  );
};

export default StudentProfilePage;