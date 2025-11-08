import { Route, Routes } from 'react-router-dom'
/**********   ADD PAGE ROUTE HERE   **********/
import PrivateStorage from './pages/Resource/PrivateStorage'
import MyTestPage from './pages/Evaluation/MyTestPage'
import StudentProfilePage from './pages/Evaluation/StudentProfilePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PrivateStorage/>} />
      <Route path="/about" element={<h1>About Page</h1>} />

      //! T.Hung below
      <Route path="/my-test" element={<MyTestPage />} />
      <Route 
        path="/student-profile/:studentId" 
        element={<StudentProfilePage />} 
      />
      //! T.Hung over
    </Routes>
  )
}

export default App
