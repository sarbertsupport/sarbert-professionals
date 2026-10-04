import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import logger from '../../utils/logger';
import Footer from '../../features/shared/Footer';
import ChatModal from '../chat/ChatModal';
import { getJobApplicantCount, getCurrentUserAppliedToJob } from '../../components/services/jobApplicantCount';
import { deductCoins } from '../../components/services/digitalCoins';
import { fetchUserProfile } from '../../components/services/authProfile';
import { getJobPosterContacts } from '../../components/services/jobPosterContact';
import { getJobById } from '../../components/services/myRequirements';
import { useAuthStore } from '../../store/useAuthStore';
import { getJobListingTitle } from './jobInformation/jobInfoHelpers';
import { JobInformationModals } from './jobInformation/JobInformationModals';
import { JobInformationHero } from './jobInformation/JobInformationHero';
import { JobInformationDetailGrid } from './jobInformation/JobInformationDetailGrid';
/** Normalize API envelope from /deduct-coins (axios body = ApiResponse JSON). */
function getDeductResponseCode(apiBody) {
  if (!apiBody || typeof apiBody !== 'object') return null;
  const raw = apiBody.headers?.responseCode;
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

const JobInformation = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [applicantCount, setApplicantCount] = useState(0);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConnectConfirm, setShowConnectConfirm] = useState(false);
  const [hasAppliedToJob, setHasAppliedToJob] = useState(false);

  useEffect(() => {
    const fetchJobAndCount = async () => {
      try {
        setLoading(true);
        
        const token = useAuthStore.getState().token || localStorage.getItem('authToken');
        const jobData = await getJobById(jobId, token);
        if (jobData) {
          setJob(jobData);
        }

        const count = await getJobApplicantCount(jobId, token);
        setApplicantCount(count);
      } catch (fetchErr) {
        logger.error('Error fetching job:', fetchErr);
        setApplicantCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobAndCount();
  }, [jobId]);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) return;
        
        const userProfile = await fetchUserProfile(authToken);
        setUser(userProfile);
      } catch (err) {
        logger.error('Failed to fetch user profile:', err);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    if (!jobId || !user) {
      setHasAppliedToJob(false);
      return;
    }
    const token = useAuthStore.getState().token || localStorage.getItem('authToken');
    if (!token) {
      setHasAppliedToJob(false);
      return;
    }
    let cancelled = false;
    getCurrentUserAppliedToJob(jobId, token)
      .then((applied) => {
        if (!cancelled) setHasAppliedToJob(applied);
      })
      .catch(() => {
        if (!cancelled) setHasAppliedToJob(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, user]);

  useEffect(() => {
    logger.debug('showChat state changed:', showChat);
  }, [showChat]);

  const handleConnectClick = async () => {
    if (!user) {
      setError('Please login to connect with the job poster.');
      return;
    }

    const token = useAuthStore.getState().token || localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication token not found. Please login again.');
      return;
    }

    try {
      if (hasAppliedToJob) {
        setShowChat(true);
        return;
      }

      setIsProcessing(true);
      const applied = await getCurrentUserAppliedToJob(jobId, token);
      setHasAppliedToJob(applied);

      if (applied) {
        setShowChat(true);
        return;
      }

      const coins = Number(job?.coins);
      if (!Number.isFinite(coins) || coins <= 0) {
        setError('This listing does not have a valid application cost. You cannot connect yet.');
        return;
      }

      setShowConnectConfirm(true);
    } catch (checkErr) {
      logger.error('Error checking application status:', checkErr);
      setError('Could not verify if you already applied. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelConnectConfirm = () => {
    setShowConnectConfirm(false);
  };

  const performConnectDeduction = async () => {
    if (!user || !job) return;

    try {
      setIsProcessing(true);
      const token = useAuthStore.getState().token || localStorage.getItem('authToken');

      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const userId = user.id || user.userId;
      const jobTitle = getJobListingTitle(job);
      const reason = `For applying to job# ${jobId}-${jobTitle}`;

      let response;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount < maxRetries) {
        try {
          if (retryCount > 0) {
            setError(`Retrying connection... (${retryCount}/${maxRetries - 1})`);
          }

          response = await deductCoins(userId, {
            coins: job.coins,
            reason,
            jobId
          }, token);
          break;
        } catch (attemptErr) {
          retryCount++;
          logger.error(`Attempt ${retryCount} failed:`, attemptErr);

          if (retryCount >= maxRetries) {
            throw attemptErr;
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const rc = getDeductResponseCode(response);
      logger.debug('JobInformation deduct-coins envelope:', { rc, response });

      if (rc === 200 || rc === 409) {
        setHasAppliedToJob(true);
        setShowConnectConfirm(false);
        setShowChat(true);
      } else {
        logger.error('Deduct coins failed:', response);
        setError(
          response?.headers?.customerMessage ||
            'Failed to connect. Please check your coin balance and try again.'
        );
      }
    } catch (connectErr) {
      logger.error('Error connecting:', connectErr);
      logger.error('Error response:', connectErr.response?.data);
      setError(connectErr.response?.data?.headers?.customerMessage || 'An error occurred while connecting. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGetContactNumber = async () => {
    if (!user) {
      setError('Please login to get the contact number.');
      return;
    }

    try {
      setPhoneLoading(true);
      const token = useAuthStore.getState().token || localStorage.getItem('authToken');
      
      const response = await getJobPosterContacts(jobId, token);
      
      if (response.success) {
        setPhoneNumber(response.phoneNumber);
        setShowPhoneModal(true);
      } else {
        setError(response.error || 'Failed to get contact number. Please try again.');
      }
    } catch (contactErr) {
      logger.error('Error getting contact number:', contactErr);
      setError('An error occurred while getting the contact number. Please try again.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-sky-200 border-t-sky-700" />
            <p className="text-slate-600">Loading job details…</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <div className="px-4 py-16 text-center">
          <div className="mx-auto max-w-md rounded-lg border border-slate-200/90 bg-white p-8 shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 ring-1 ring-sky-100">
              <Star className="h-6 w-6 text-sky-700" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Job not found</h2>
            <p className="mt-2 text-sm text-slate-600">
              This listing may have been removed or the link is incorrect.
            </p>
            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to jobs
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <JobInformationModals
        error={error}
        onDismissError={() => setError(null)}
        showPhoneModal={showPhoneModal}
        phoneNumber={phoneNumber}
        copied={copied}
        onCopyPhone={copyToClipboard}
        onClosePhone={() => setShowPhoneModal(false)}
        showConnectConfirm={showConnectConfirm}
        connectCoins={job?.coins}
        connectJobTitle={getJobListingTitle(job)}
        onCancelConnectConfirm={handleCancelConnectConfirm}
        onConfirmConnect={performConnectDeduction}
        isConnectProcessing={isProcessing}
      />

      <main className="flex-grow">
        <JobInformationHero
          job={job}
          applicantCount={applicantCount}
          isProcessing={isProcessing}
          connectDisabled={!user}
          onConnectClick={handleConnectClick}
        />
        <JobInformationDetailGrid
          job={job}
          applicantCount={applicantCount}
          isProcessing={isProcessing}
          connectDisabled={!user}
          phoneLoading={phoneLoading}
          onGetContactNumber={handleGetContactNumber}
          onConnectClick={handleConnectClick}
        />
      </main>

      {showChat && job && user && (
        <ChatModal
          isOpen={showChat}
          receiverId={job.userId}
          jobId={jobId}
          onClose={() => setShowChat(false)}
          initialMessage={`Hi, I'm interested in your ${job.subjects} professional position`}
          senderType="tutor"
        />
      )}

      <Footer />
    </>
  );
};

export default JobInformation;
