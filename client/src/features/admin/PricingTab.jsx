import { useEffect, useState } from 'react';
import PricingService from '../../components/services/pricing';
import { CheckCircle2, AlertCircle, Info, DollarSign, Calendar, Clock } from 'lucide-react';
import logger from '../../utils/logger';

const PricingTab = () => {
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Modal states
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await PricingService.getCurrentPricing();
        if (response.success) {
          setPricingData(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to fetch pricing data');
        logger.error('Error fetching pricing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 3) return 'N/A';
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openPriceModal = () => {
    setNewPrice(pricingData.basePricePerCoin.toFixed(4));
    setPriceError('');
    setShowPriceModal(true);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setNewPrice(value);
    
    // Validate input
    if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      setPriceError('Please enter a valid positive number');
    } else {
      setPriceError('');
    }
  };

  const proceedToConfirmation = () => {
    if (!priceError && newPrice) {
      setShowPriceModal(false);
      setShowConfirmModal(true);
    }
  };

  const handleUpdatePrice = async () => {
    setShowConfirmModal(false);
    setIsUpdating(true);
    
    try {
      const response = await PricingService.updatePricing(parseFloat(newPrice));
      
      if (response.success) {
        setPricingData(response.data);
        setSuccessMessage({
          title: 'Price Update Successful',
          message: `Coin price has been updated to $${parseFloat(newPrice).toFixed(4)} USD.`
        });
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(response.error || 'Failed to update price');
      }
    } catch (err) {
      setError('Error updating price. Please try again.');
      logger.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading pricing data...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          <div>
              <h2 className="text-2xl font-bold text-gray-900">Pricing Management</h2>
              <p className="text-gray-600 mt-1">Manage coin pricing and pricing history</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{successMessage.title}</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{successMessage.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Pricing */}
      {pricingData && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Current Pricing</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Base Price per Coin</div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${pricingData.basePricePerCoin.toFixed(4)} USD
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Last Updated</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(pricingData.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Created</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(pricingData.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={openPriceModal}
                disabled={isUpdating}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm disabled:opacity-50"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                {isUpdating ? 'Updating...' : 'Update Price'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Update Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Coin Price</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Price per Coin (USD)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={newPrice}
                  onChange={handlePriceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new price"
                />
                {priceError && (
                  <p className="mt-1 text-sm text-red-600">{priceError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPriceModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={proceedToConfirmation}
                  disabled={!!priceError || !newPrice}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Confirm Price Update</h3>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Are you sure you want to update the coin price to <strong>${parseFloat(newPrice).toFixed(4)} USD</strong>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This action will affect all future coin purchases.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePrice}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingTab;