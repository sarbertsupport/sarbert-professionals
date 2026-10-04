import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/shared/Header';
import Home from './components/pages/Home';
import Search from './components/pages/Search';
import TeachersResults from './components/pages/TeachersResults';
import TutorProfile from './components/pages/TutorProfile';
import JobDisplay from './components/pages/JobDisplay';
import JobInformation from './components/JobInformation';
import ProfileInfoForm from './components/pages/ProfileInfoForm';
import EducationForm from './components/pages/EducationForm';
import TeacherExpereinceForm from './components/pages/TeacherExpereinceForm';
import TeachingDetailsForm from './components/pages/TeachingDetailsForm';
import TeachersSubject from './components/pages/TeachersSubject';
import StudentDashboard from './components/student/StudentDashboard';
import TutorRequestForm from './components/student/TutorRequestForm';
import Coins from './components/student/Coins';
import Wallet from './components/student/Wallet';
import Tutors from './components/student/Tutors';
import Messages from './components/student/Messages';
import Chat from './components/student/Chat';
import FormContainer from './components/pages/FormContainer ';
function App() {
  const [formData, setFormData] = useState({});
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="teachers" element={<TeachersResults />} />
        <Route path="tutor-profile/:id" element={<TutorProfile />} />
        <Route path="jobs" element={<JobDisplay />} />
        <Route path="jobinfo/:jobId" element={<JobInformation />} />

        {/* Nested routes for form submission */}
        <Route path="profileform" element={<ProfileInfoForm setFormData={setFormData} />} />
        <Route path="education" element={<EducationForm setFormData={setFormData} />} />
        <Route path="experience" element={<TeacherExpereinceForm setFormData={setFormData} />} />
        <Route path="subjects" element={<TeachersSubject setFormData={setFormData} />} />
        <Route path="details" element={<TeachingDetailsForm formData={formData} />} />
        <Route path="studentdashboard" element={<StudentDashboard />} />
        <Route path="gettutors" element={<TutorRequestForm />} />
        <Route path="coins" element={<Coins />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="tutors" element={<Tutors />} />
        <Route path="messages" element={<Messages />} />
        <Route path="chat" element={<Chat />} /> 
        <Route path="forms" element={<FormContainer />} /> 
         
        
        {/* Redirect to the first step if accessing later steps directly */}
        <Route path="*" element={<Navigate to="/profileform" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
