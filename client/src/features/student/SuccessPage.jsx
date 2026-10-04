import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiMail, FiDollarSign, FiArrowRight } from "react-icons/fi";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pageType, setPageType] = useState('profile'); // 'profile' or 'payment'
  const [loading, setLoading] = useState(true);
  
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  
  useEffect(() => {
    // Determine if this is a payment success or profile completion
    if (reference) {
      setPageType('payment');
    } else {
      setPageType('profile');
    }
    
    // Simulate loading for payment verification
    if (reference) {
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } else {
      setLoading(false);
    }
  }, [reference]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }
  
  if (pageType === 'payment') {
    // Show payment success content
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
            <div className="inline-flex items-center justify-center bg-white rounded-full p-3 mb-4 shadow-md">
              <FiCheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Payment Successful!
            </h1>
          </div>

          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <FiDollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Your payment has been processed successfully! Your coins have been added to your wallet and are ready to use.
            </p>

            {reference && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Transaction Reference:</span> {reference}
                </p>
              </div>
            )}

            <div className="bg-green-50 border-l-4 border-green-400 p-4 text-left rounded mb-6">
              <p className="text-green-700 font-medium">
                <span className="font-semibold">What's Next?</span> You can now use your coins to apply for jobs and connect with clients. Start your journey today!
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/wallet')}
                className="flex-1 flex items-center justify-center py-3 px-6 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <FiDollarSign className="mr-2" />
                View Wallet
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="flex-1 flex items-center justify-center py-3 px-6 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Browse Jobs
                <FiArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show profile completion content (existing)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
          <div className="inline-flex items-center justify-center bg-white rounded-full p-3 mb-4 shadow-md">
            <FiCheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Congratulations and Welcome to SkillBridge!
          </h1>
        </div>

        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <FiMail className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            We're excited to have you on board. Your profile has been successfully completed and you're now officially part of the SkillBridge professional network.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left rounded mb-6">
            <p className="text-blue-700 font-medium">
              <span className="font-semibold">Next Steps:</span> You can now connect with clients and start earning. Just buy coins to begin your journey and unlock opportunities!
            </p>
          </div>

          <p className="text-gray-600">
            If you have any questions or need assistance, feel free to reach out to us at
            <a href="mailto:support@skillbridge.com" className="text-blue-600 hover:underline ml-1">
              support@skillbridge.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
