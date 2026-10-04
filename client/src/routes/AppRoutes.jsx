import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../features/shared/Layout';
import { AppPageShell } from '../features/shared/AppPageShell';
import { RouteTransitionFallback } from '../features/shared/RouteTransitionFallback';
import RouteGuard from '../utils/routeProtection';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { HomeRoute } from './HomeRoute';
import * as Pages from './lazyPages';

/**
 * Application route tree. Heavy pages are loaded from `lazyPages.js`.
 */
export function AppRoutes({ formData, setFormData }) {
  return (
    <Routes>
      <Route
        path={ROUTES.ADMIN}
        element={
          <Suspense fallback={<RouteTransitionFallback />}>
            <RouteGuard allowedRoles={[ROLES.ADMIN]}>
              <AppPageShell>
                <Pages.AdminDashboard />
              </AppPageShell>
            </RouteGuard>
          </Suspense>
        }
      />

      <Route
        path="*"
        element={
          <Layout>
            <Suspense fallback={<RouteTransitionFallback />}>
            <Routes>
              <Route path={ROUTES.HOME} element={<HomeRoute />} />
              <Route path={ROUTES.REGISTER} element={<Pages.RegistrationForm />} />
              <Route path={ROUTES.LOGIN} element={<Pages.LoginForm />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<Pages.ResetPasswordEmail />} />
              <Route path={ROUTES.RESET_PASSWORD} element={<Pages.ResetPassword />} />
              <Route path={ROUTES.VERIFY_EMAIL} element={<Pages.EmailVerification />} />
              <Route path={ROUTES.FAQ} element={<Pages.FaqPage />} />

              <Route
                path={ROUTES.TEACHERS}
                element={
                  <RouteGuard deniedRoles={[ROLES.TUTOR, ROLES.ADMIN]}>
                    <Pages.TeachersResults />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.TUTOR_PROFILE}
                element={
                  <RouteGuard deniedRoles={[ROLES.TUTOR, ROLES.ADMIN]}>
                    <Pages.TutorProfile />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.PROFESSIONALS}
                element={
                  <RouteGuard deniedRoles={[ROLES.TUTOR, ROLES.ADMIN]}>
                    <Pages.AllTeachersProfile />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.TEACHERS_ID}
                element={
                  <RouteGuard deniedRoles={[ROLES.TUTOR, ROLES.ADMIN]}>
                    <Pages.ViewTeacherProfile />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.STUDENT_DASHBOARD}
                element={
                  <RouteGuard allowedRoles={[ROLES.STUDENT]}>
                    <Pages.StudentDashboard />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.POST_JOB}
                element={
                  <RouteGuard allowedRoles={[ROLES.STUDENT]}>
                    <Pages.TutorRequestForm />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.STUDENT_PROFILE}
                element={
                  <RouteGuard allowedRoles={['ROLE_STUDENT']}>
                    <Pages.StudentProfile />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.PROFILE_INFO}
                element={
                  <RouteGuard>
                    <Pages.ProfileInfoForm />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.STUDENT_BIO_DATA}
                element={
                  <RouteGuard allowedRoles={['ROLE_STUDENT']}>
                    <Pages.StudentBioData />
                  </RouteGuard>
                }
              />

              <Route
                path={ROUTES.JOBS}
                element={
                  <RouteGuard deniedRoles={[ROLES.STUDENT, ROLES.ADMIN]}>
                    <Pages.JobDisplay />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.JOB_INFO}
                element={
                  <RouteGuard deniedRoles={[ROLES.STUDENT, ROLES.ADMIN]}>
                    <Pages.JobInformation />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.PROFILE_FORM}
                element={
                  <RouteGuard deniedRoles={[ROLES.STUDENT, ROLES.ADMIN]}>
                    <Pages.ProfileInfoForm setFormData={setFormData} />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.EDUCATION}
                element={
                  <RouteGuard deniedRoles={[ROLES.STUDENT, ROLES.ADMIN]}>
                    <Pages.EducationForm setFormData={setFormData} />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.EXPERIENCE}
                element={
                  <RouteGuard deniedRoles={[ROLES.STUDENT, ROLES.ADMIN]}>
                    <Pages.TeacherExpereinceForm setFormData={setFormData} />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.SUBJECTS}
                element={
                  <RouteGuard deniedRoles={[ROLES.STUDENT, ROLES.ADMIN]}>
                    <Pages.TeachersSubject setFormData={setFormData} />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.DETAILS}
                element={
                  <RouteGuard deniedRoles={[ROLES.STUDENT, ROLES.ADMIN]}>
                    <Pages.TeachingDetailsForm formData={formData} />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.TEACHER_PROFILE}
                element={
                  <RouteGuard allowedRoles={[ROLES.TUTOR]}>
                    <Pages.TeacherProfile />
                  </RouteGuard>
                }
              />

              <Route
                path={ROUTES.SEARCH}
                element={
                  <RouteGuard>
                    <Pages.Search />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.MESSAGES}
                element={
                  <RouteGuard deniedRoles={[ROLES.STUDENT]} redirectPath={ROUTES.CLIENT_MESSAGES}>
                    <Pages.Chats />
                  </RouteGuard>
                }
              />
              <Route
                path="/job-chat/:jobId/:recipientId"
                element={
                  <RouteGuard>
                    <Pages.JobChat />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.CLIENT_MESSAGES}
                element={
                  <RouteGuard allowedRoles={['ROLE_STUDENT']}>
                    <Pages.ChatsStudents />
                  </RouteGuard>
                }
              />
              <Route
                path="/client-chat/:jobId/:recipientId"
                element={
                  <RouteGuard>
                    <Pages.JobChatStudents />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.COINS}
                element={
                  <RouteGuard>
                    <Pages.Coins />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.WALLET}
                element={
                  <RouteGuard>
                    <Pages.Wallet />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.SUPPORT}
                element={
                  <RouteGuard deniedRoles={[ROLES.ADMIN]} redirectPath={ROUTES.ADMIN}>
                    <Pages.SupportCenter />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.TUTORS}
                element={
                  <RouteGuard>
                    <Pages.Tutors />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.MESSAGES2}
                element={
                  <RouteGuard>
                    <Pages.Messages />
                  </RouteGuard>
                }
              />
              <Route
                path={ROUTES.COMPLETE}
                element={
                  <RouteGuard>
                    <Pages.SuccessPage />
                  </RouteGuard>
                }
              />

              <Route path="/profile" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
            </Suspense>
          </Layout>
        }
      />
    </Routes>
  );
}
