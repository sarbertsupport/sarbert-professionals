import { FaFileAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { TutorRequestFormFieldsGrid } from './TutorRequestFormFieldsGrid';
import { TutorRequestFormSubmitBar } from './TutorRequestFormSubmitBar';

export function TutorRequestFormMainPanel({
  message,
  formData,
  errors,
  handleSubmit,
  handleChange,
  handleSelectChange,
  isSubmitting,
  progress
}) {
  return (
    <div className="lg:col-span-3">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <FaFileAlt className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Tutoring Request Details</h2>
              <p className="text-blue-100 mt-1 text-lg">Provide comprehensive information to help tutors understand your needs</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {message.text && (
            <div className={`mb-8 p-6 rounded-2xl flex items-center ${
              message.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200'
                : message.type === 'warning'
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-800 border border-yellow-200'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <FaCheckCircle className="mr-4 text-2xl text-green-600" />
              ) : (
                <FaExclamationCircle className="mr-4 text-2xl text-red-600" />
              )}
              <span className="font-semibold">{message.text}</span>
            </div>
          )}

          <TutorRequestFormFieldsGrid
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
          />

          <TutorRequestFormSubmitBar isSubmitting={isSubmitting} progress={progress} />
        </form>
      </div>
    </div>
  );
}
