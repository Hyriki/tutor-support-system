import { Route, Routes } from 'react-router-dom'
/**********   ADD PAGE ROUTE HERE   **********/
import HomePage from './pages/Home/HomePage'
import PrivateStorage from './pages/Resource/PrivateStorage'
import Awarding from './pages/Evaluation/Awarding'
import RecordStudentProgress from './pages/Evaluation/RecordStudentProgress'
import AnalyzeRecordData from './pages/Evaluation/AnalyzeRecordData'
import OptimizeResourceAllocation from './pages/Evaluation/OptimizeResourceAllocation'
import WriteEvaluationPage from './pages/Evaluation/WriteEvaluationPage'
import {
  ChangePassword,
  Confirmation,
  Login,
  PasswordReset,
  ResetPassword,
  Register,
} from './pages/Authentication'
import CourseStructure from './pages/Resource/CourseStructure'
import SchedulingPage from './pages/Sessions/SchedulingPage'
import RegisterCourse from './pages/RegisterCourse/RegisterCourse'
import FileDetails from './pages/Resource/FileDetails'
import TutorAvailability from './pages/RegisterCourse/TutorAvailability'
import CreateClass from './pages/RegisterCourse/CreateClass'
import ManageProgram from './pages/RegisterCourse/ProgramManagement'
import CourseStructureStudent from './pages/Resource/CourseStructureStudent'
import FileDetails from './pages/Resource/FileDetails'
import TutorAvailability from './pages/RegisterCourse/TutorAvailability'
import CreateClass from './pages/RegisterCourse/CreateClass'
import ManageProgram from './pages/RegisterCourse/ProgramManagement'

function App() {
  return (
    <Routes>
      {/* GENERAL */}
      <Route path="/" element={<HomePage/>} />
      <Route path="/about" element={<h1>About Page</h1>} />

       {/* EVALUATION MODULE */}
      <Route path="/awarding" element={<Awarding />} />
      <Route path="/student-progress/:studentId" element={<RecordStudentProgress />} />
      <Route path="/analyze" element={<AnalyzeRecordData />} />
      <Route path="/optimize" element={<OptimizeResourceAllocation />} />
      <Route path="/evaluation/:studentId" element={<WriteEvaluationPage />} />

      {/* LOGIN MODULE */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/password-reset-notification" element={<PasswordReset />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/confirmation" element={<Confirmation />} />
      {/* RESOURCE MODULE */}
      <Route path="/user/private" element={<PrivateStorage />} />
      <Route path="/courses" element={<CourseStructure/>} />
      <Route path="/courses/student" element={<CourseStructureStudent />} />
      {/* SCHEDULE MODULE */}
      <Route path="/sessions" element={<SchedulingPage isTutor = {false} />} />
      <Route path="/sessions/register" element={<SchedulingPage isRegister = {true} />} />
      <Route path="/sessions/tutor" element={<SchedulingPage isTutor = {true} />} />
      {/* REGISTER COURSE MODULE */}
      <Route path="/register-course" element={<RegisterCourse />} />
      <Route path="/set-availability" element={<TutorAvailability />} />
      <Route path="/create-program" element={<CreateClass />} />
      <Route path="/manage-program" element={<ManageProgram />} />
    </Routes>
  )
}

export default App
