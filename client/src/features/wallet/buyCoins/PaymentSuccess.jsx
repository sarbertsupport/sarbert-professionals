import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

export const PaymentSuccess = ({ numberOfCoins, amount, onClose }) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <FaCheckCircle className="w-10 h-10 text-green-600" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Your coins have been added to your wallet</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Coins Purchased:</span>
            <span className="font-semibold">{numberOfCoins} coins</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-bold text-green-600">${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Done
      </button>
    </div>
  );
};
