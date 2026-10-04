import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import BulkDiscountService from '../../components/services/bulkDiscount';
import logger from '../../utils/logger';
import { DiscountFormModal } from './bulkDiscount/DiscountFormModal';
import {
  BulkDiscountDeleteModal,
  BulkDiscountActivateModal,
  BulkDiscountUpdateConfirmModal
} from './bulkDiscount/BulkDiscountConfirmModals';
import { BulkDiscountTableSection } from './bulkDiscount/BulkDiscountTableSection';
import { BulkDiscountFilters } from './bulkDiscount/BulkDiscountFilters';

const BulkDiscountTab = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState(null);

  const [formData, setFormData] = useState({
    minCoins: '',
    discountPercentage: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDiscounts();
  }, [currentPage, pageSize]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await BulkDiscountService.getAllActiveDiscounts();
      if (response.success) {
        setDiscounts(response.data);
        setTotalElements(response.data.length);
        setTotalPages(Math.ceil(response.data.length / pageSize));
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to fetch bulk discounts');
      logger.error('Error fetching bulk discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch =
      discount.minCoins.toString().includes(searchTerm) ||
      discount.discountPercentage.toString().includes(searchTerm) ||
      (discount.createdBy && discount.createdBy.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && discount.active) ||
      (statusFilter === 'inactive' && !discount.active);

    return matchesSearch && matchesStatus;
  });

  const validateForm = () => {
    const errors = {};

    if (!formData.minCoins || isNaN(formData.minCoins)) {
      errors.minCoins = 'Please enter a valid minimum coins number';
    }

    if (!formData.discountPercentage || isNaN(formData.discountPercentage)) {
      errors.discountPercentage = 'Please enter a valid discount percentage';
    } else if (formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      errors.discountPercentage = 'Discount must be between 0 and 100';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openAddModal = () => {
    setFormData({
      minCoins: '',
      discountPercentage: '',
      active: true
    });
    setFormErrors({});
    setCurrentDiscount(null);
    setShowAddModal(true);
  };

  const openEditModal = (discount) => {
    setFormData({
      minCoins: discount.minCoins,
      discountPercentage: discount.discountPercentage,
      active: discount.active
    });
    setFormErrors({});
    setCurrentDiscount(discount);
    setShowEditModal(true);
  };

  const openDeleteModal = (discount) => {
    setCurrentDiscount(discount);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowUpdateConfirmModal(true);
    }
  };

  const confirmUpdate = async () => {
    setShowUpdateConfirmModal(false);
    setIsProcessing(true);
    try {
      let response;
      if (currentDiscount) {
        response = await BulkDiscountService.updateDiscount(currentDiscount.id, formData);
      } else {
        response = await BulkDiscountService.createDiscount(formData);
      }

      if (response.success) {
        setSuccessMessage({
          title: currentDiscount ? 'Discount Updated' : 'Discount Created',
          message: currentDiscount ? 'Bulk discount has been updated successfully.' : 'New bulk discount has been created successfully.'
        });
        setShowAddModal(false);
        setShowEditModal(false);
        fetchDiscounts();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to save discount');
      logger.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    setIsProcessing(true);
    try {
      const response = await BulkDiscountService.deleteDiscount(currentDiscount.id);
      if (response.success) {
        setSuccessMessage({
          title: 'Discount Deactivated',
          message: 'Bulk discount has been deactivated successfully.'
        });
        fetchDiscounts();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to deactivate discount');
      logger.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivate = async () => {
    setShowActivateModal(false);
    setIsProcessing(true);
    try {
      const response = await BulkDiscountService.activateDiscount(currentDiscount.id);
      if (response.success) {
        setSuccessMessage({
          title: 'Discount Activated',
          message: 'Bulk discount has been activated successfully.'
        });
        fetchDiscounts();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to activate discount');
      logger.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading bulk discounts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Bulk Discount Management</h2>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-start">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Discounts</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto">
      <DiscountFormModal
        open={showAddModal}
        variant="add"
        title="Add New Bulk Discount"
        formData={formData}
        formErrors={formErrors}
        isProcessing={isProcessing}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleFormSubmit}
        onInputChange={handleInputChange}
        onActiveChange={(e) => setFormData({ ...formData, active: e.target.checked })}
      />

      <DiscountFormModal
        open={showEditModal}
        variant="edit"
        title="Edit Bulk Discount"
        formData={formData}
        formErrors={formErrors}
        isProcessing={isProcessing}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleFormSubmit}
        onInputChange={handleInputChange}
        onActiveChange={(e) => setFormData({ ...formData, active: e.target.checked })}
      />

      <BulkDiscountDeleteModal
        open={showDeleteModal}
        currentDiscount={currentDiscount}
        isProcessing={isProcessing}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <BulkDiscountActivateModal
        open={showActivateModal}
        currentDiscount={currentDiscount}
        isProcessing={isProcessing}
        onConfirm={handleActivate}
        onCancel={() => setShowActivateModal(false)}
      />

      <BulkDiscountUpdateConfirmModal
        open={showUpdateConfirmModal}
        currentDiscount={currentDiscount}
        formData={formData}
        onConfirm={confirmUpdate}
        onCancel={() => setShowUpdateConfirmModal(false)}
      />

      <BulkDiscountFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <BulkDiscountTableSection
        filteredDiscounts={filteredDiscounts}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        successMessage={successMessage}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        onOpenAdd={openAddModal}
        onOpenEdit={openEditModal}
        onOpenDelete={openDeleteModal}
        onOpenActivate={(discount) => {
          setCurrentDiscount(discount);
          setShowActivateModal(true);
        }}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default BulkDiscountTab;
