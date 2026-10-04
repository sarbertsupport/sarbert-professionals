import React, { useEffect, useState, useRef  } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const EmailVerification = () => {
    const hasRun = useRef(false);
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const navigate = useNavigate();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setMessage('Invalid verification link.');
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/users/account/verify?token=${token}`, {
          method: 'GET',
        });

        const data = await response.json();

        const responseCode = data.headers?.responseCode;
        const customerMessage = data.headers?.customerMessage || 'Verification failed.';
        if (responseCode === 200) {
          setMessage(customerMessage);
          setStatus('success');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setMessage(customerMessage);
          setStatus('error');
        }
      } catch (error) {
        logger.error('Error verifying account:', error);
        setMessage('Server error occurred during verification.');
        setStatus('error');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <h2 className={`text-2xl font-bold mb-4 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status === null ? 'Please wait...' : status === 'success' ? 'Success!' : 'Verification Failed'}
        </h2>
        <p className="text-gray-700">{message}</p>
        {status === 'success' && (
          <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
        )}
        {status === 'error' && (
          <div className="mt-4">
            <a
              href="/resend-verification"
              className="text-blue-500 hover:underline text-sm"
            >
              Resend verification email
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
