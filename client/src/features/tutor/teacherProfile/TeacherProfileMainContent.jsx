import { TeacherProfileHeroBanner } from './TeacherProfileHeroBanner';
import { TeacherProfileDetailSections } from './TeacherProfileDetailSections';

export function TeacherProfileMainContent({
  userProfile,
  educationList,
  experienceList,
  subjects,
  teachingDetails,
  openProfileModal,
  openEducationModal,
  openExperienceModal,
  openTeachingModal
}) {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-2xl rounded-3xl mt-10 mb-10 relative">
      <TeacherProfileHeroBanner
        userProfile={userProfile}
        openProfileModal={openProfileModal}
      />
      <TeacherProfileDetailSections
        userProfile={userProfile}
        educationList={educationList}
        experienceList={experienceList}
        subjects={subjects}
        teachingDetails={teachingDetails}
        openProfileModal={openProfileModal}
        openEducationModal={openEducationModal}
        openExperienceModal={openExperienceModal}
        openTeachingModal={openTeachingModal}
      />
    </div>
  );
}
