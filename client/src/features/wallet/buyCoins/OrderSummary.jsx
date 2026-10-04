import React from 'react';
import { FaCoins, FaPlus, FaMinus, FaReceipt, FaShieldAlt } from 'react-icons/fa';

export const OrderSummary = ({ numberOfCoins, setNumberOfCoins, amount, onNext }) => {
  const pricePerCoin = amount / numberOfCoins;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-3 shadow-lg">
          <FaCoins className="text-white text-xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Purchase Coins</h2>
        <p className="text-sm text-gray-600">Select the number of coins you'd like to purchase</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center">
            <FaCoins className="text-blue-600 mr-2" />
            Select Amount
          </h3>
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            ${pricePerCoin.toFixed(2)} each
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3 mb-3">
          <button
            type="button"
            onClick={() => setNumberOfCoins(Math.max(50, numberOfCoins - 50))}
            className="w-10 h-10 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
          >
            <FaMinus className="text-sm" />
          </button>

          <div className="relative">
            <input
              type="number"
              value={numberOfCoins}
              onChange={(e) => setNumberOfCoins(Math.max(50, parseInt(e.target.value, 10) || 50))}
              className="w-20 h-10 text-center text-lg font-bold text-gray-800 bg-white border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="50"
              step="50"
            />
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
              coins
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNumberOfCoins(numberOfCoins + 50)}
            className="w-10 h-10 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
          >
            <FaPlus className="text-sm" />
          </button>
        </div>

        <div className="text-center text-xs text-gray-600">
          Minimum 50 coins • Increments of 50
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
          <FaReceipt className="text-gray-600 mr-2" />
          Order Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 text-sm">Coins:</span>
            <span className="font-medium text-gray-800 text-sm">{numberOfCoins} coins</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 text-sm">Price per coin:</span>
            <span className="font-medium text-gray-800 text-sm">${pricePerCoin.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
            <span className="text-base font-semibold text-gray-800">Total:</span>
            <span className="text-lg font-bold text-blue-600">${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
        <div className="flex items-center">
          <div className="bg-green-100 p-1.5 rounded-full mr-2">
            <FaShieldAlt className="text-green-600 text-sm" />
          </div>
          <div>
            <div className="font-semibold text-green-800 text-sm">Secure Payment</div>
            <div className="text-xs text-green-700">Your payment information is encrypted and secure. We use industry-standard SSL encryption and never store your card details.</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full py-2.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Continue to Billing
      </button>
    </div>
  );
};
