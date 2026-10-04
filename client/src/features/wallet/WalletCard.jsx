import React from 'react';
import { RiCoinsFill } from 'react-icons/ri';

const WalletCard = ({ balance, onBuyClick, onHistoryClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Coin Balance</h3>
        <RiCoinsFill className="text-yellow-500 text-2xl" />
      </div>
      
      <div className="text-center mb-6">
        <p className="text-4xl font-bold text-gray-900">{balance}</p>
        <p className="text-gray-500 mt-1">SkillBridge Coins</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onBuyClick}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          Buy Coins
        </button>
        <button
          onClick={onHistoryClick}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors"
        >
          History
        </button>
      </div>
    </div>
  );
};

export default WalletCard;