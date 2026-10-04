import React, { useState } from 'react';

const Coins = () => {
  const [selectedCoins, setSelectedCoins] = useState('50 coins');
  const exchangeRate = 129.04; // KES per USD

  const handleCoinsChange = (e) => {
    setSelectedCoins(e.target.value);
  };

  return (
    <div>
      {/* Navigation Menu */}
      {/* Remove: <Menus /> */}

      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-center text-lg font-semibold mb-4">How many coins do you want?</h2>
        
        <select 
          value={selectedCoins}
          onChange={handleCoinsChange}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        >
          <option value="50 coins">50 coins</option>
          <option value="100 coins">100 coins</option>
          <option value="200 coins">200 coins</option>
          <option value="500 coins">500 coins</option>
        </select>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <p className="text-gray-600">1 coin</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">= 50.02680 usd</p>
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
          Get {selectedCoins}
        </button>

        <div className="mt-6 flex justify-center space-x-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal logo" className="h-8" loading="lazy" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa logo" className="h-8" loading="lazy" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="MasterCard logo" className="h-8" loading="lazy" />
        </div>
      </div>
    </div>
  );
};

export default Coins;
