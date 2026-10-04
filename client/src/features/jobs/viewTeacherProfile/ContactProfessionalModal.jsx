import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FiMessageSquare, FiArrowLeft } from 'react-icons/fi';

export const ContactProfessionalModal = ({
  isOpen,
  onClose,
  loadingJobs,
  jobsError,
  userJobs,
  selectedJob,
  onSelectJob,
  isProcessing,
  onContact,
  professionalName
}) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) setStep(0);
  }, [isOpen]);

  useEffect(() => {
    setStep(0);
  }, [selectedJob?.jobId]);

  if (!isOpen) return null;

  const coins = selectedJob?.coins != null ? Number(selectedJob.coins) : null;
  const coinsOk = Number.isFinite(coins) && coins > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75" />
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {step === 0 ? 'Contact Professional' : 'Confirm coin deduction'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {loadingJobs ? (
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                  <p className="text-gray-600">Loading your job postings...</p>
                </div>
              </div>
            ) : jobsError ? (
              <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-xl">{jobsError}</div>
            ) : step === 1 && selectedJob && coinsOk ? (
              <>
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-gray-800 font-medium mb-2">You are about to open messaging with {professionalName || 'this professional'}.</p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <span className="font-bold text-amber-800">{coins} coins</span> are required for this job and will be
                    deducted from your wallet only when you tap <strong>Confirm and deduct</strong>. Cancel returns you
                    to the previous step with no charge.
                  </p>
                  <p className="text-gray-600 text-xs mt-3">
                    If you already connected for this job before, you will not be charged again.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    disabled={isProcessing}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all inline-flex items-center justify-center disabled:opacity-50"
                  >
                    <FiArrowLeft className="mr-2" />
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={onContact}
                    className={`px-6 py-3 rounded-xl text-white transition-all inline-flex items-center justify-center ${
                      isProcessing ? 'opacity-75' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <FiMessageSquare className="mr-2" />
                        Confirm — deduct {coins} coins
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-3">
                    Select Job/Assignment
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={selectedJob?.jobId || ''}
                    onChange={(e) => onSelectJob(e.target.value)}
                  >
                    <option value="">Select a job...</option>
                    {userJobs.map((job) => (
                      <option key={job.jobId} value={job.jobId}>
                        {job.jobRequirements.length > 50
                          ? `${job.jobRequirements.substring(0, 50)}...`
                          : job.jobRequirements}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedJob && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Job Details</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Subject:</span> {selectedJob.subjects}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Level:</span> {selectedJob.level}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Budget:</span> ${selectedJob.budget} ({selectedJob.frequency})
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Coins required to apply:</span>{' '}
                        <span className="font-bold text-amber-800">{selectedJob.coins}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-8">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedJob || !coinsOk || isProcessing}
                    className={`px-6 py-3 rounded-xl text-white transition-all ${
                      selectedJob && coinsOk
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105'
                        : 'bg-gray-400 cursor-not-allowed'
                    } ${isProcessing ? 'opacity-75' : ''}`}
                    onClick={() => setStep(1)}
                  >
                    <div className="flex items-center">
                      <FiMessageSquare className="mr-2" />
                      Continue — review {coinsOk ? `${coins} coins` : 'cost'}
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
