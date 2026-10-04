import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getTransactions, fetchCoinPurchaseReceiptPdf } from '../../components/services/digitalCoins';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuthStore } from '../../store/useAuthStore';
import logger from '../../utils/logger';

/** Fiat paid on purchases — show next to coins for DEBIT rows only (e.g. +50 (KSh 1,200)). */
function formatDebitFiatSuffix(tx) {
  if (!tx || String(tx.entryType).toUpperCase() !== 'DEBIT') return null;
  const amt = Number(tx.amount);
  if (!Number.isFinite(amt) || amt <= 0) return null;
  const c = String(tx.currency || '').toUpperCase();
  if (c === 'KES') {
    const rounded = Number.isInteger(amt) ? amt : Number(amt.toFixed(2));
    return ` (KSh ${rounded.toLocaleString('en-KE')})`;
  }
  if (c === 'USD' || c === '') {
    return ` ($${amt.toFixed(2)})`;
  }
  return ` (${c} ${amt % 1 === 0 ? amt : amt.toFixed(2)})`;
}

/** Matches server: completed coin purchases are DEBIT with positive fiat amount. */
export function isCoinPurchaseReceiptRow(tx) {
  if (!tx?.status || !tx?.entryType) return false;
  if (String(tx.status).toUpperCase() !== 'COMPLETED') return false;
  if (String(tx.entryType).toUpperCase() !== 'DEBIT') return false;
  const amt = Number(tx.amount);
  return Number.isFinite(amt) && amt > 0;
}

const TransactionRow = React.memo(
  ({
    tx,
    index,
    indexOfFirstTransaction,
    getAmountColorAndSign,
    formatDate,
    getStatusColor,
    onViewReceipt,
    receiptLoadingUuid
  }) => {
    const { color, sign } = getAmountColorAndSign(tx);
    const fiatSuffix = formatDebitFiatSuffix(tx);
    const showReceipt = isCoinPurchaseReceiptRow(tx);
    const loading = receiptLoadingUuid === tx.transactionUuid;
    return (
      <div
        key={tx.transactionUuid}
        className="grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-3 hover:bg-blue-50 transition-colors"
      >
        <div className="md:hidden text-xs text-gray-500">
          <span className="font-medium">{indexOfFirstTransaction + index + 1}.</span>
        </div>
        <div className="hidden md:block col-span-1 text-sm text-gray-600">
          {indexOfFirstTransaction + index + 1}.
        </div>
        <div className="md:hidden text-xs text-gray-500">{formatDate(tx.createdAt)}</div>
        <div className="hidden md:block col-span-2 text-sm text-gray-600">{formatDate(tx.createdAt)}</div>
        <div className="md:col-span-3 text-sm text-gray-800">{tx.description}</div>
        <div className="md:col-span-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}
          >
            {tx.status}
          </span>
        </div>
        <div className="md:col-span-2 text-right">
          <span className={`font-semibold ${color}`}>
            {sign}
            {tx.coins}
            {fiatSuffix ? <span className="font-normal text-gray-600">{fiatSuffix}</span> : null}
          </span>
        </div>
        <div className="md:col-span-2 flex flex-col items-stretch justify-center md:items-end gap-1">
          {showReceipt ? (
            <button
              type="button"
              onClick={() => onViewReceipt(tx)}
              disabled={loading}
              className="text-xs font-medium text-sky-700 hover:text-sky-900 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Loading…' : 'View receipt'}
            </button>
          ) : (
            <span className="text-xs text-gray-400 md:text-right">—</span>
          )}
        </div>
      </div>
    );
  }
);

const TransactionHistory = ({ userId, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);
  const [receiptLoadingUuid, setReceiptLoadingUuid] = useState(null);
  const [receiptError, setReceiptError] = useState(null);
  const componentRef = useRef();

  const closeReceiptModal = useCallback(() => {
    setReceiptModal((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
    setReceiptError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (receiptModal?.url) URL.revokeObjectURL(receiptModal.url);
    };
  }, [receiptModal?.url]);

  const handleViewReceipt = useCallback(
    async (tx) => {
      if (!userId || !tx?.transactionUuid) return;
      setReceiptError(null);
      setReceiptLoadingUuid(tx.transactionUuid);
      try {
        const blob = await fetchCoinPurchaseReceiptPdf(userId, tx.transactionUuid);
        const url = URL.createObjectURL(blob);
        setReceiptModal({ url, transactionUuid: tx.transactionUuid });
      } catch (e) {
        logger.error('Receipt load failed:', e);
        const msg = e?.message || 'Could not load receipt.';
        setReceiptError(msg);
        setReceiptModal({ failed: true });
      } finally {
        setReceiptLoadingUuid(null);
      }
    },
    [userId]
  );

  const handleDownloadReceipt = useCallback(() => {
    if (!receiptModal?.url || !receiptModal?.transactionUuid || receiptModal.failed) return;
    const a = document.createElement('a');
    a.href = receiptModal.url;
    a.download = `SkillBridge_Receipt_${receiptModal.transactionUuid}.pdf`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [receiptModal]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        logger.debug('TransactionHistory: Fetching transactions for userId:', userId);
        
        if (!userId) {
          logger.error('TransactionHistory: No userId provided');
          setError('User ID not available');
          setLoading(false);
          return;
        }
        
        const token = useAuthStore.getState().token || localStorage.getItem('authToken');
        logger.debug('TransactionHistory: loading');
        
        if (!token) {
          logger.error('TransactionHistory: No token available');
          setError('Authentication token not available');
          setLoading(false);
          return;
        }
        
        const data = await getTransactions(userId, token);
        logger.debug('TransactionHistory: API response:', data);
        
        setTransactions(data || []);
        setFilteredTransactions(data || []);
      } catch (err) {
        logger.error('Transaction history error:', err);
        logger.error('Transaction error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [userId]);

  useEffect(() => {
    let results = transactions;
    
    if (searchTerm) {
      results = results.filter(tx => 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (startDate || endDate) {
      results = results.filter(tx => {
        const txDate = new Date(
          tx.createdAt[0], 
          tx.createdAt[1] - 1, 
          tx.createdAt[2]
        );
        
        const afterStart = startDate ? txDate >= startDate : true;
        const beforeEnd = endDate ? txDate <= endDate : true;
        
        return afterStart && beforeEnd;
      });
    }
    
    setFilteredTransactions(results);
    setCurrentPage(1);
  }, [transactions, searchTerm, startDate, endDate]);

  const handleRefresh = () => {
    setSearchTerm('');
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  const currentBalance = transactions
    .filter(tx => tx.status.toUpperCase() === 'COMPLETED')
    .reduce((acc, tx) => {
      return tx.entryType === 'DEBIT' ? acc + tx.coins : acc - tx.coins;
    }, 0);

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const formatDate = (dateArray) => {
    const [year, month, day, hours, minutes, seconds, milliseconds] = dateArray;
    const date = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds / 1000000);
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return date.toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch(status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmountColorAndSign = (tx) => {
    if (tx.status.toUpperCase() !== 'COMPLETED') {
      return { color: 'text-red-600', sign: '-' };
    }
    return tx.entryType === 'DEBIT' 
      ? { color: 'text-green-600', sign: '+' } 
      : { color: 'text-red-600', sign: '-' };
  };

  const handleDownloadPDF = async () => {
    const completedBalance = transactions
      .filter(tx => tx.status.toUpperCase() === 'COMPLETED')
      .reduce((acc, tx) => {
        return tx.entryType === 'DEBIT' ? acc + tx.coins : acc - tx.coins;
      }, 0);

    const tempElement = document.createElement('div');
    tempElement.className = 'bg-white p-4';
    tempElement.innerHTML = `
      <h2 class="text-xl font-bold mb-4">Transaction History</h2>
      <p class="mb-4">Current Balance: ${completedBalance} coins</p>
      <table class="w-full">
        <thead>
          <tr class="bg-gray-100">
            <th class="text-left p-2">No.</th>
            <th class="text-left p-2">Date & Time</th>
            <th class="text-left p-2">Description</th>
            <th class="text-left p-2">Status</th>
            <th class="text-right p-2">Coins</th>
          </tr>
        </thead>
        <tbody>
          ${filteredTransactions.map((tx, index) => {
            const { color, sign } = getAmountColorAndSign(tx);
            const coinsCell = `${sign}${tx.coins}${formatDebitFiatSuffix(tx) || ''}`;
            return `
              <tr class="border-b">
                <td class="p-2">${index + 1}</td>
                <td class="p-2">${formatDate(tx.createdAt)}</td>
                <td class="p-2">${tx.description}</td>
                <td class="p-2">
                  <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(tx.status)}">
                    ${tx.status}
                  </span>
                </td>
                <td class="p-2 text-right ${color}">
                  ${coinsCell}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    document.body.appendChild(tempElement);
    
    const canvas = await html2canvas(tempElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });
    
    document.body.removeChild(tempElement);
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`transaction_history_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div ref={componentRef} className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-blue-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
              <p className="text-sm text-gray-600 mt-1">
                Current Balance: <span className="font-medium">{currentBalance} coins</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleRefresh}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                title="Reset Filters"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-full hover:bg-blue-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Description/Status</label>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRefresh}
                className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">{error}</h3>
              <p className="text-sm text-gray-500">Please try again later</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center p-8">
              <div className="text-gray-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No transactions found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-blue-50 text-xs font-medium text-gray-600 uppercase tracking-wider">
                <div className="col-span-1">No.</div>
                <div className="col-span-2">Date & Time</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Coins</div>
                <div className="col-span-2 text-right">Receipt</div>
              </div>

              {/* Transactions List */}
              {currentTransactions.map((tx, index) => (
                <TransactionRow
                  key={tx.transactionUuid}
                  tx={tx}
                  index={index}
                  indexOfFirstTransaction={indexOfFirstTransaction}
                  getAmountColorAndSign={getAmountColorAndSign}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                  onViewReceipt={handleViewReceipt}
                  receiptLoadingUuid={receiptLoadingUuid}
                />
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Pagination Footer */}
        {filteredTransactions.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-blue-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{indexOfFirstTransaction + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastTransaction, filteredTransactions.length)}</span> of{' '}
                <span className="font-medium">{filteredTransactions.length}</span> transactions
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-blue-100 border border-blue-200 rounded text-sm disabled:opacity-50 hover:bg-blue-200 text-blue-800"
                    title="First Page"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-blue-100 border border-blue-200 rounded text-sm disabled:opacity-50 hover:bg-blue-200 text-blue-800"
                    title="Previous Page"
                  >
                    ‹
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-blue-100 border border-blue-200 rounded text-sm disabled:opacity-50 hover:bg-blue-200 text-blue-800"
                    title="Next Page"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-blue-100 border border-blue-200 rounded text-sm disabled:opacity-50 hover:bg-blue-200 text-blue-800"
                    title="Last Page"
                  >
                    »
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {receiptModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Receipt preview"
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Purchase receipt</h3>
              <div className="flex items-center gap-2">
                {!receiptModal.failed && (
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    className="rounded-md bg-sky-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-800"
                  >
                    Download PDF
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeReceiptModal}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
            {receiptModal.failed ? (
              <p className="p-6 text-sm text-red-600">{receiptError}</p>
            ) : (
              <iframe
                title="Receipt PDF"
                src={receiptModal.url}
                className="min-h-[70vh] w-full flex-1 border-0 bg-gray-100"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;