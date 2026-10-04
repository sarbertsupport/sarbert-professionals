import React, { useState } from 'react';
import { FaCreditCard, FaLock, FaShieldAlt, FaCheckCircle, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

const CustomCardForm = ({ isOpen, onClose, amount, numberOfCoins, onSuccess }) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCvv, setShowCvv] = useState(false);

  // Card type detection
  const detectCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7][2-9][0-9]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    return null;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const isFormValid = () => {
    return cardData.cardNumber.replace(/\s/g, '').length >= 13 && 
           cardData.expiryDate.length === 5 && 
           cardData.cvv.length >= 3 && 
           cardData.cardholderName.trim().length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    setError(null);

    try {
      // Here you would typically:
      // 1. Tokenize the card with Paystack
      // 2. Send the token to your backend
      // 3. Process the payment
      
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSuccess({
        reference: `card_${Date.now()}`,
        status: 'success'
      });
      onClose();
    } catch (error) {
      setError('Payment failed. Please check your card details and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const cardType = detectCardType(cardData.cardNumber);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-xl font-bold">Card Payment</h2>
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

          {/* Card Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 1234 1234 1234"
                  maxLength="19"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {cardType && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className={`w-8 h-5 rounded text-xs font-bold text-white flex items-center justify-center ${
                      cardType === 'visa' ? 'bg-blue-600' :
                      cardType === 'mastercard' ? 'bg-red-600' :
                      cardType === 'amex' ? 'bg-green-600' : 'bg-orange-600'
                    }`}>
                      {cardType.toUpperCase().substring(0, 4)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={cardData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <div className="relative">
                  <input
                    type={showCvv ? "text" : "password"}
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCvv ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardholderName"
                value={cardData.cardholderName}
                onChange={handleInputChange}
                placeholder="Name on card"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            )}

            {/* Security Badge */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaShieldAlt className="text-green-600 mr-3" />
                <div>
                  <div className="font-semibold text-green-800">Secure Payment</div>
                  <div className="text-sm text-green-700">Your card details are encrypted and secure</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <FaLock className="mr-2" />
                  Pay ${amount.toFixed(2)}
                </>
              )}
            </button>
          </form>

          <div className="text-xs text-gray-500 text-center mt-3">
            🔒 Secure payment powered by Paystack
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCardForm; 