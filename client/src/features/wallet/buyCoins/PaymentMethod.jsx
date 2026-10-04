import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaMobileAlt, FaLock } from 'react-icons/fa';
import { buyCoinMpesa } from '../../../components/services/coinWallet';
import logger from '../../../utils/logger';

/** Digits only; common local forms → 254… (12 digits). */
export function normalizeToMpesa254(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (digits.length >= 12 && digits.startsWith('254')) {
    return digits.slice(0, 12);
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return `254${digits.slice(1)}`;
  }
  if (digits.length === 9 && !digits.startsWith('0')) {
    return `254${digits}`;
  }
  return digits;
}

/** Kenya mobile in international format: 254 + 9 digits, typically 2547… or 2541…. */
export function isValidMpesa254(msisdn) {
  return /^254[17]\d{8}$/.test(String(msisdn || ''));
}

export const PaymentMethod = ({
  paymentMethod,
  setPaymentMethod,
  numberOfCoins,
  amount,
  billingInfo,
  onBack,
  onPaymentSuccess,
  onPaymentError,
  token,
  user,
  isTokenValid
}) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (typeof window.PaystackPop === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        logger.debug('Paystack script loaded successfully');
      };
      script.onerror = () => {
        logger.error('Failed to load Paystack script');
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleMpesaPayment = async () => {
    if (!phoneNumber.trim()) {
      onPaymentError('Please enter your phone number');
      return;
    }

    const msisdn = normalizeToMpesa254(phoneNumber);
    if (!isValidMpesa254(msisdn)) {
      onPaymentError(
        'M-Pesa requires a Kenya number starting with 254 (12 digits), e.g. 254712345678. ' +
          'You can also enter 07… or 9 digits without the leading 0.'
      );
      return;
    }

    if (!token || !isTokenValid()) {
      onPaymentError('Please log in to continue with payment.');
      return;
    }

    setLoading(true);
    try {
      const userId = user?.id || localStorage.getItem('userId') || '10';
      const response = await buyCoinMpesa(
        userId,
        msisdn,
        amount,
        numberOfCoins,
        token
      );

      const payload = response?.data ?? response;
      const headers = payload?.headers ?? {};
      const body = payload?.body ?? {};
      const code = Number(headers.responseCode);
      const data = body?.data;
      const ok =
        code === 200 &&
        data != null &&
        (Boolean(data.mpesaCheckoutRequestId) ||
          String(data.status || '').toUpperCase() === 'PENDING');
      if (ok) {
        onPaymentSuccess({
          flow: 'mpesa-stk',
          numberOfCoins,
          amount,
        });
      } else {
        onPaymentError(
          headers.customerMessage ||
            headers.responseMessage ||
            'Payment failed'
        );
      }
    } catch (error) {
      logger.error('M-Pesa payment error:', error);
      onPaymentError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = async () => {
    if (paymentMethod === 'mpesa') {
      await handleMpesaPayment();
      return;
    }

    if (!token || !isTokenValid()) {
      onPaymentError('Please log in to continue with payment.');
      return;
    }

    setLoading(true);
    logger.debug('=== PAYSTACK INLINE MODAL ===');

    try {
      const reference = `coin_purchase_${Date.now()}`;

      localStorage.setItem('pending_paystack_reference', reference);
      localStorage.setItem('pending_paystack_amount', amount);
      localStorage.setItem('pending_paystack_coins', numberOfCoins);
      localStorage.setItem('pending_paystack_billing', JSON.stringify(billingInfo));

      if (typeof window.PaystackPop === 'undefined') {
        throw new Error('Paystack script not loaded. Please refresh the page and try again.');
      }

      logger.debug('paystack: creating transaction', {
        userId: user?.id || localStorage.getItem('userId'),
        hasAuth: Boolean(token)
      });
      const userId = user?.id || localStorage.getItem('userId') || '10';

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      if (!isTokenValid()) {
        throw new Error('Authentication token has expired. Please log in again.');
      }

      const transactionResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:8089'}/api/v1/buy-coins/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': reference
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'NGN',
          numberOfCoins: numberOfCoins,
          cardToken: reference,
          paystackReference: reference,
          billingAddress: billingInfo
        })
      });

      if (!transactionResponse.ok) {
        throw new Error('Failed to create transaction record');
      }

      const transactionData = await transactionResponse.json();
      logger.debug('Backend response:', transactionData);

      const transactionUuid = transactionData.body?.data?.transaction?.transactionUuid;
      const authorizationUrl = transactionData.body?.data?.authorizationUrl;
      const paystackReference = transactionData.body?.data?.reference;

      if (!transactionUuid) {
        throw new Error('Transaction created but no UUID returned');
      }

      logger.debug('Transaction record created successfully with UUID:', transactionUuid);
      logger.debug('Authorization URL:', authorizationUrl);
      logger.debug('Paystack Reference:', paystackReference);

      if (authorizationUrl) {
        logger.debug('Redirecting to Paystack authorization URL:', authorizationUrl);
        window.location.href = authorizationUrl;
      } else {
        throw new Error('No authorization URL returned from backend');
      }
    } catch (error) {
      logger.error('Paystack initialization error:', error);
      setLoading(false);
      onPaymentError('Failed to initialize payment. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Payment Method</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <FaCreditCard className="text-2xl" />
              <span className="font-medium">Card Payment</span>
              <span className="text-xs text-gray-500">Visa, Mastercard</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('mpesa')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              paymentMethod === 'mpesa'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <FaMobileAlt className="text-2xl" />
              <span className="font-medium">M-Pesa</span>
              <span className="text-xs text-gray-500">Mobile Money</span>
            </div>
          </button>
        </div>
      </div>

      {paymentMethod === 'mpesa' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaMobileAlt className="inline mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="254712345678"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-800"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be a valid Kenya M-Pesa line in international format starting with{' '}
            <span className="font-mono font-medium text-gray-700">254</span> (12 digits). You may type{' '}
            <span className="font-mono">07…</span> or 9 digits after we normalize.
          </p>
        </div>
      )}

      {paymentMethod === 'card' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaCreditCard className="text-blue-600 mr-3" />
            <div>
              <h4 className="font-medium text-blue-800">Secure Card Payment</h4>
              <p className="text-sm text-blue-600">
                You'll be redirected to Paystack's secure checkout page to enter your card details.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <FaLock className="text-green-600 text-lg" />
          </div>
          <div>
            <h4 className="font-medium text-green-800">Secure Payment</h4>
            <p className="text-sm text-green-600">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handlePayClick}
          disabled={
            loading ||
            (paymentMethod === 'mpesa' && (!phoneNumber.trim() || !isValidMpesa254(normalizeToMpesa254(phoneNumber))))
          }
          className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm shadow-lg"
        >
          {loading ? 'Processing...' : paymentMethod === 'card' ? 'Pay with Card' : 'Pay with M-Pesa'}
        </button>

        <div className="mt-2 text-xs text-gray-500 text-center">
          🔒 Secure payment powered by {paymentMethod === 'card' ? 'Paystack' : 'M-Pesa'}
        </div>
      </div>
    </div>
  );
};
