import { Route, Routes } from 'react-router-dom'
/**********   ADD PAGE ROUTE HERE   **********/
import PrivateStorage from './pages/Resource/PrivateStorage'
import {
  ChangePassword,
  Confirmation,
  Login,
  PasswordReset,
  ResetPassword,
} from './pages/Authentication'
import CourseStructure from './pages/Resource/CourseStructure'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PrivateStorage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/password-reset-notification" element={<PasswordReset />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/" element={<PrivateStorage/>} />
      <Route path="/courses" element={<CourseStructure/>} />
      <Route path="/about" element={<h1>About Page</h1>} />
    </Routes>
  )
}

export default App
