import React, { useState } from 'react';
import { FaCreditCard, FaLock, FaShieldAlt, FaCheckCircle, FaTimes, FaSpinner } from 'react-icons/fa';

const MockPaymentModal = ({ isOpen, onClose, amount, numberOfCoins, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: payment, 2: success

  const handleMockPayment = async () => {
    setLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful payment
    setStep(2);
    setLoading(false);
    
    // Call success callback after a delay
    setTimeout(() => {
      onSuccess({
        reference: `mock_${Date.now()}`,
        status: 'success',
        message: 'Mock payment successful!'
      });
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your coins have been added to your wallet</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span>Coins:</span>
                  <span className="font-medium">{numberOfCoins} coins</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold text-green-600">${amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              🧪 This was a mock payment for development
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-xl font-bold">🧪 Mock Payment (Dev)</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Coins:</span>
                <span className="font-medium">{numberOfCoins} coins</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold text-blue-600">${amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Development Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-full mr-3">
                <FaShieldAlt className="text-yellow-600 text-lg" />
              </div>
              <div>
                <div className="font-semibold text-yellow-800">Development Mode</div>
                <div className="text-sm text-yellow-700">This is a mock payment for testing. No real money will be charged.</div>
              </div>
            </div>
          </div>

          {/* Mock Card Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Mock Card Details</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Card: 4242 4242 4242 4242</div>
              <div>Expiry: 12/25</div>
              <div>CVV: 123</div>
              <div>Name: Test User</div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handleMockPayment}
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing Mock Payment...
              </>
            ) : (
              <>
                <FaLock className="mr-2" />
                Complete Mock Payment
              </>
            )}
          </button>

          <div className="text-xs text-gray-500 text-center mt-3">
            🧪 Mock payment for development only
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPaymentModal; 