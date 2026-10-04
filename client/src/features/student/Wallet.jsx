import React, { useState } from 'react';
import Footer from '../../features/shared/Footer';  // Assuming you have a Footer component

const Wallet = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6; // Number of items to display per page

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const transactions = [
    { date: 'Sep 5', details: 'For applying to Online HTML assignment help tutor required in Gachibowli', coins: -39 },
    { date: 'Jul 13', details: 'For applying to Online JAVA assignment help teacher needed in Rosario', coins: -37 },
    { date: 'May 30', details: 'Purchased 100 coins @ 309.58 KES', coins: 100 },
    { date: 'May 30', details: 'For applying to Online Excel teacher needed in Siliguri', coins: -34 },
    { date: 'May 30', details: 'For applying to Online Front end developer assignment help teacher needed in Haripad', coins: -44 },
    { date: 'Apr 6', details: 'For applying to Online JAVA, Core JAVA, Design patterns teacher needed in New Delhi', coins: -10 },
    { date: 'Apr 6', details: 'For applying to Online JAVA, Core JAVA, Design patterns teacher needed in New Delhi', coins: -10 },
    { date: 'Apr 6', details: 'For applying to Online JAVA, Core JAVA, Design patterns teacher needed in New Delhi', coins: -10 },
    { date: 'Apr 6', details: 'For applying to Online JAVA, Core JAVA, Design patterns teacher needed in New Delhi', coins: -10 },
    { date: 'Apr 6', details: 'For applying to Online JAVA, Core JAVA, Design patterns teacher needed in New Delhi', coins: -10 },
    { date: 'Apr 6', details: 'For applying to Online JAVA, Core JAVA, Design patterns teacher needed in New Delhi', coins: -10 },
    { date: 'Apr 6', details: 'For applying to Online JAVA, Core JAVA, Design patterns teacher needed in New Delhi', coins: -10 },
  ];

  const filteredTransactions = transactions.filter(transaction =>
    transaction.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredTransactions.slice(startIndex, endIndex);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Menus Component */}
      {/* Remove: <Menus /> */}

      {/* Main Wallet Content */}
      <div className="flex-grow w-full max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Coin Wallet</h1>
          <p className="text-gray-600 mt-2">Current Balance: <span className="font-semibold">27 coins</span></p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Buy coins
          </button>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <label htmlFor="entries" className="text-gray-600">Show Entries</label>
            <select
              id="entries"
              className="ml-2 p-2 border border-gray-300 rounded-md"
            >
              <option value="100">100</option>
              <option value="50">50</option>
              <option value="25">25</option>
            </select>

            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="p-2 border border-gray-300 rounded-md"
              placeholder="Search"
            />
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 border-gray-300 p-3">Date</th>
                <th className="border-b-2 border-gray-300 p-3">Details</th>
                <th className="border-b-2 border-gray-300 p-3">Coins</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((transaction, index) => (
                <tr key={index}>
                  <td className="border-b border-gray-300 p-3">{transaction.date}</td>
                  <td className="border-b border-gray-300 p-3">{transaction.details}</td>
                  <td className={`border-b border-gray-300 p-3 ${transaction.coins < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.coins}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center items-center space-x-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="px-4 py-2 bg-gray-100 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Wallet;
