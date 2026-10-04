import { FaCheckCircle } from 'react-icons/fa';

export function TutorRequestFormSubmitBar({ isSubmitting, progress }) {
  return (
    <div className="mt-12 flex flex-col items-center space-y-6">
      {isSubmitting && (
        <div className="w-full max-w-md">
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">Submitting your request... {progress}%</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-label="Submit Tutor Request"
        className={`w-full max-w-md flex justify-center items-center px-12 py-6 border border-transparent text-xl font-bold rounded-2xl shadow-2xl text-white transition-all duration-300 transform hover:scale-105 ${
          isSubmitting
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700'
        } focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting... ({progress}%)
          </>
        ) : (
          <>
            Submit Request
            <FaCheckCircle className="ml-4 h-6 w-6" />
          </>
        )}
      </button>
    </div>
  );
}
