import { lazy } from 'react';

/** Lazy route targets — split into separate chunks for faster initial load. */
export const Search = lazy(() => import('../features/jobs/Search'));
export const TeachersResults = lazy(() => import('../features/jobs/TeachersResults'));
export const TutorProfile = lazy(() => import('../features/jobs/TutorProfile'));
export const EducationForm = lazy(() => import('../features/tutor/EducationForm'));
export const TeacherExpereinceForm = lazy(
  () => import('../features/tutor/TeacherExpereinceForm')
);
export const TeachingDetailsForm = lazy(
  () => import('../features/tutor/TeachingDetailsForm')
);
export const TeachersSubject = lazy(() => import('../features/tutor/TeachersSubject'));
export const Coins = lazy(() => import('../features/student/Coins'));
export const Wallet = lazy(() => import('../features/student/Wallet'));
export const Tutors = lazy(() => import('../features/student/Tutors'));
export const Messages = lazy(() => import('../features/student/Messages'));
export const StudentProfile = lazy(() => import('../features/student/StudentProfile'));
export const StudentBioData = lazy(() => import('../features/student/StudentBioData'));
export const StudentDashboard = lazy(
  () => import('../features/student/StudentDashboard')
);
export const ProfileInfoForm = lazy(
  () => import('../features/student/ProfileInfoForm')
);
export const TutorRequestForm = lazy(
  () => import('../features/student/TutorRequestForm')
);
export const SuccessPage = lazy(() => import('../features/student/SuccessPage'));
export const RegistrationForm = lazy(
  () => import('../features/auth/RegistrationForm')
);
export const LoginForm = lazy(() => import('../features/auth/LoginForm'));
export const ResetPasswordEmail = lazy(
  () => import('../features/auth/ResetPasswordEmail')
);
export const ResetPassword = lazy(() => import('../features/auth/ResetPassword'));
export const EmailVerification = lazy(
  () => import('../features/auth/EmailVerification')
);
export const TeacherProfile = lazy(() => import('../features/tutor/TeacherProfile'));
export const AllTeachersProfile = lazy(
  () => import('../features/jobs/AllTeachersProfile')
);
export const ViewTeacherProfile = lazy(
  () => import('../features/jobs/ViewTeacherProfile')
);
export const Chats = lazy(() => import('../features/chat/Chats'));
export const JobChat = lazy(() => import('../features/chat/JobChat'));
export const ChatsStudents = lazy(() => import('../features/chat/ChatsStudents'));
export const JobChatStudents = lazy(
  () => import('../features/chat/JobChatStudents')
);
export const AdminDashboard = lazy(
  () => import('../features/admin/AdminDashboard')
);
export const SupportCenter = lazy(() => import('../features/support/SupportCenter'));
export const FaqPage = lazy(() => import('../features/support/FaqPage'));
export const JobDisplay = lazy(() => import('../features/jobs/JobDisplay'));
export const JobInformation = lazy(() => import('../features/jobs/JobInformation'));
