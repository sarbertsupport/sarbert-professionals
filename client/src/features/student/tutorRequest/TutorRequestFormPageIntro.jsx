import { FaPlus, FaStar } from 'react-icons/fa';

export function TutorRequestFormPageIntro({ currentStep }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
            <FaPlus className="text-white text-3xl" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Post Tutoring Request
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Create a professional request to find the perfect tutor</p>
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-2xl">
            <FaStar className="text-yellow-500 text-xl" />
            <div>
              <span className="text-sm font-medium text-gray-600">Step {currentStep} of 3</span>
              <div className="text-xs text-gray-500">Form Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
