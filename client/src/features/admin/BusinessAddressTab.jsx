import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star, 
  StarOff, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Building2,
  FileText,
  Calendar,
  Filter,
  MoreVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import logger from '../../utils/logger';
import { businessAddressService } from '../../components/services/businessAddressService';
import { toast } from 'react-toastify';
import BusinessAddressModal from './BusinessAddressModal';
import BusinessAddressDetailModal from './BusinessAddressDetailModal';

const BusinessAddressTab = () => {
  const [businessAddresses, setBusinessAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadBusinessAddresses();
  }, [currentPage, filterStatus]);

  const loadBusinessAddresses = async () => {
    try {
      setLoading(true);
      const response = await businessAddressService.getBusinessAddressesPaginated(currentPage - 1, pageSize);
      if (response.code === 200) {
        setBusinessAddresses(response.data || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } else {
        toast.error('Failed to load business addresses');
      }
    } catch (error) {
      logger.error('Error loading business addresses:', error);
      toast.error('Error loading business addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleView = async (address) => {
    try {
      const response = await businessAddressService.getBusinessAddressById(address.id);
      if (response.code === 200) {
        setSelectedAddress(response.data);
        setIsDetailModalOpen(true);
      } else {
        toast.error('Failed to load address details');
      }
    } catch (error) {
      logger.error('Error loading address details:', error);
      toast.error('Error loading address details');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this business address?')) {
      try {
        const response = await businessAddressService.deleteBusinessAddress(id);
        if (response.code === 200) {
          toast.success('Business address deleted successfully');
          loadBusinessAddresses();
          setIsDetailModalOpen(false);
        } else {
          toast.error('Failed to delete business address');
        }
      } catch (error) {
        logger.error('Error deleting business address:', error);
        toast.error('Error deleting business address');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await businessAddressService.setAsDefault(id);
      if (response.code === 200) {
        toast.success('Business address set as default successfully');
        loadBusinessAddresses();
        if (selectedAddress && selectedAddress.id === id) {
          setSelectedAddress({ ...selectedAddress, isDefault: true });
        }
      } else {
        toast.error('Failed to set business address as default');
      }
    } catch (error) {
      logger.error('Error setting business address as default:', error);
      toast.error('Error setting business address as default');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedAddress(null);
  };

  const handleModalSuccess = () => {
    loadBusinessAddresses();
    handleModalClose();
  };

  const filteredAddresses = businessAddresses.filter(address => {
    const matchesSearch = address.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         address.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         address.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && address.isActive) ||
                         (filterStatus === 'inactive' && !address.isActive) ||
                         (filterStatus === 'default' && address.isDefault);
    
    return matchesSearch && matchesFilter;
  });

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 3) return 'N/A';
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading business addresses...</p>
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
            <div className="p-3 bg-blue-50 rounded-lg mr-4">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Business Addresses</h2>
              <p className="text-gray-600 mt-1">Manage company information for invoices and documents</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Business Address
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500"
              placeholder="Search by business name, contact person, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="default">Default</option>
            </select>
          </div>
        </div>
      </div>

      {/* Business Addresses Table */}
      {filteredAddresses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Business Addresses Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'No addresses match your search criteria.' 
                : 'Get started by adding your first business address for invoices and documents.'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center mx-auto shadow-sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Business Address
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">BUSINESS NAME</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CONTACT PERSON</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">EMAIL</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PHONE</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CREATED</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAddresses.length > 0 ? (
                  filteredAddresses.map((address) => (
                    <tr key={address.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                  <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-white" />
                            </div>
                    </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{address.businessName}</div>
                      {address.isDefault && (
                        <div className="flex items-center mt-1">
                                <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                <span className="text-xs text-yellow-600 font-medium">Default</span>
                        </div>
                      )}
                    </div>
                  </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{address.contactPerson || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{address.email || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{address.phone || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {formatDate(address.createdAt)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button 
                            onClick={() => handleView(address)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                    <button
                      onClick={() => handleEdit(address)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Edit Address"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No business addresses found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
                  </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
                </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalElements)}
                  </span>{' '}
                  of <span className="font-medium">{totalElements}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronsLeft className="h-5 w-5" />
                  </button>
                    <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                    <ChevronLeft className="h-5 w-5" />
                    </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage} of {totalPages}
                  </span>
                    <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                    <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                    <ChevronsRight className="h-5 w-5" />
                    </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <BusinessAddressModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          editingAddress={editingAddress}
        />
      )}

      {isDetailModalOpen && selectedAddress && (
        <BusinessAddressDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          address={selectedAddress}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      )}
    </div>
  );
};

export default BusinessAddressTab;
