import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaLock, FaShieldAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { initializePaystackTransaction } from '../components/services/coinWallet';
import logger from '../../utils/logger';

const CustomPaymentModal = ({ isOpen, onClose, amount, numberOfCoins, billingInfo, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const email = localStorage.getItem('userEmail') || 'albertnjanek@gmail.com';
      const reference = `coin_purchase_${Date.now()}`;
      const callbackUrl = `${window.location.origin}/payment-callback`;
      
      const metadata = {
        number_of_coins: numberOfCoins.toString(),
        amount: amount.toString(),
        user_id: "10"
      };
      
      const response = await initializePaystackTransaction(
        amount,
        email,
        reference,
        metadata,
        callbackUrl,
        'USD'
      );

      if (response.body?.data?.status && response.body.data.data?.authorization_url) {
        // Use Paystack's inline modal instead of redirect
        const handler = PaystackPop.setup({
          key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
          email: email,
          amount: amount * 100,
          currency: 'USD',
          ref: reference,
          callback: function(response) {
            // Payment successful
            onSuccess(response);
            onClose();
          },
          onClose: function() {
            // Payment modal closed
            setLoading(false);
          }
        });
        handler.openIframe();
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      logger.error('Payment error:', error);
      setError('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-xl font-bold">Complete Payment</h2>
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

          {/* Security Badge */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FaShieldAlt className="text-green-600 mr-3" />
              <div>
                <div className="font-semibold text-green-800">Secure Payment</div>
                <div className="text-sm text-green-700">Your payment is protected by Paystack's secure infrastructure</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FaLock className="mr-2" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </button>

          <div className="text-xs text-gray-500 text-center mt-3">
            🔒 Secure payment powered by Paystack
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPaymentModal; 