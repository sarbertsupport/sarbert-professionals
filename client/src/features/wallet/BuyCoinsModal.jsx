import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { calculateCoinPrice, getBillingInfo, saveBillingInfo } from '../../components/services/coinWallet';
import { useAuthStore } from '../../store/useAuthStore';
import { ROUTES } from '../../constants/routes';
import logger from '../../utils/logger';
import { useDebounce } from './buyCoins/useDebounce';
import { CheckoutSteps } from './buyCoins/CheckoutSteps';
import { OrderSummary } from './buyCoins/OrderSummary';
import { BillingInformation } from './buyCoins/BillingInformation';
import { PaymentMethod } from './buyCoins/PaymentMethod';
import { PaymentSuccess } from './buyCoins/PaymentSuccess';
import { MpesaStkSuccessModal } from './buyCoins/MpesaStkSuccessModal';

const BuyCoinsModal = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [numberOfCoins, setNumberOfCoins] = useState(50);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);
  const [mpesaStkInfo, setMpesaStkInfo] = useState(null);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isTokenValid = useAuthStore((state) => state.isTokenValid);

  const debouncedCoins = useDebounce(numberOfCoins, 500);

  useEffect(() => {
    const loadBillingInfo = async () => {
      const userId = user?.id || localStorage.getItem('userId');
      if (token && userId) {
        try {
            const response = await getBillingInfo(userId, token);
          
            if (response?.body?.data) {
              setBillingInfo(response.body.data);
          }
        } catch {
          /* keep billing empty */
        }
      }
    };
    
    if (isOpen) {
      loadBillingInfo();
    }
  }, [isOpen, token, user]);

  const handleNext = () => {
    setStep(step + 1);
  };

  useEffect(() => {
    if (step === 2) {
      const loadBillingInfo = async () => {
        const userId = user?.userId;
        if (token && userId) {
          try {
            const response = await getBillingInfo(userId, token);
            if (response?.body?.data) {
              setBillingInfo(response.body.data);
            }
          } catch (err) {
            logger.error('Error loading billing info:', err);
          }
        }
      };
      loadBillingInfo();
    }
  }, [step, token, user?.userId]);

  const handleBack = () => {
    setStep(step - 1);
  };

  useEffect(() => {
    if (debouncedCoins > 0 && token) {
      calculateCoinPrice(debouncedCoins, token)
        .then(response => {
          if (response) {
            const calculatedAmount = response.finalPrice || response.amount || response.price || response.total || 0;
            setAmount(calculatedAmount);
          }
        })
        .catch(err => {
          logger.error('Error calculating amount:', err);
          setAmount(0);
        });
    }
  }, [debouncedCoins, token]);

  useEffect(() => {
    if (token) {
      calculateCoinPrice(50, token)
        .then(response => {
          if (response) {
            const calculatedAmount = response.finalPrice || response.amount || response.price || response.total || 0;
            setAmount(calculatedAmount);
          }
        })
        .catch(err => {
          logger.error('Error calculating initial amount:', err);
          setAmount(0);
        });
    }
  }, [token]);

  const handleBillingInfoChange = async (newBillingInfo) => {
    const userId = user?.id || localStorage.getItem('userId');
    if (token && userId) {
      try {
          await saveBillingInfo(userId, newBillingInfo, token);
        setBillingInfo(newBillingInfo);
      } catch {
        setError('Failed to save billing information. Please try again.');
        return false;
      }
    }
    return true;
  };

  const handlePaymentSuccess = (meta) => {
    if (meta?.flow === 'mpesa-stk') {
      setError(null);
      setMpesaStkInfo({
        numberOfCoins: meta.numberOfCoins,
        amount: meta.amount,
      });
      // No onSuccess here — payment is not settled yet; avoid unmounting parent patterns and
      // useless balance fetches. Refresh when user continues (handleMpesaStkContinue).
      return;
    }
    const message = typeof meta === 'string' ? meta : null;
    setSuccess(
      message || 'Payment successful! Your coins have been added to your wallet.'
    );
    setStep(4);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage || 'Payment failed. Please try again.');
  };

  const resetForm = () => {
    setStep(1);
    setPaymentMethod('card');
    setAmount(0);
    setNumberOfCoins(50);
    setError(null);
    setSuccess(null);
    setMpesaStkInfo(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleMpesaStkContinue = () => {
    setMpesaStkInfo(null);
    if (onSuccess) {
      onSuccess();
    }
    navigate(ROUTES.WALLET);
    handleClose();
  };

  if (!token || !isTokenValid()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="text-red-600 mb-4">
            <FaExclamationTriangle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to purchase coins.</p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const mpesaInstructionLayer =
    typeof document !== 'undefined'
      ? createPortal(
          <MpesaStkSuccessModal
            isOpen={Boolean(mpesaStkInfo)}
            numberOfCoins={mpesaStkInfo?.numberOfCoins}
            amount={mpesaStkInfo?.amount}
            onContinue={handleMpesaStkContinue}
          />,
          document.body
        )
      : null;

  return (
    <>
      {mpesaInstructionLayer}
      {isOpen ? (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${mpesaStkInfo ? 'pointer-events-none opacity-30' : ''}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] min-h-[550px] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Checkout</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>
        
        <div className="px-6 pt-6 flex-shrink-0">
          <CheckoutSteps currentStep={step} />
        </div>

        <div className="px-6 pb-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span className="text-green-800">{success}</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <OrderSummary
              numberOfCoins={numberOfCoins}
              setNumberOfCoins={setNumberOfCoins}
              amount={amount}
              onNext={handleNext}
            />
          )}

          {step === 2 && (
            <BillingInformation
              key={`billing-${step}-${billingInfo ? 'with-data' : 'no-data'}`}
              billingInfo={billingInfo}
              onBillingInfoChange={handleBillingInfoChange}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

                      {step === 3 && (
            <PaymentMethod
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              numberOfCoins={numberOfCoins}
              amount={amount}
              billingInfo={billingInfo}
              onBack={handleBack}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              token={token}
              user={user}
              isTokenValid={isTokenValid}
            />
            )}

          {step === 4 && (
            <PaymentSuccess
              numberOfCoins={numberOfCoins}
              amount={amount}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
      ) : null}
    </>
  );
};

BuyCoinsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default BuyCoinsModal;
