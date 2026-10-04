import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import jobCategories from '../../data/jobCategories.json';
import { FiFilter, FiCalendar, FiBriefcase, FiCheckCircle, FiGlobe, FiHome, FiRefreshCw, FiX } from 'react-icons/fi';

const SidebarFilters = ({ setFilters }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState(null);
  const [selectedJobStatus, setSelectedJobStatus] = useState(null);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [isAllJobsSelected, setIsAllJobsSelected] = useState(false);
  const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
  
  useEffect(() => {
    const formattedCategories = jobCategories.map((category) => ({
      value: category,
      label: category,
    }));
    setCategoryOptions(formattedCategories);
  }, []);

  useEffect(() => {
    if (isAllJobsSelected) {
      setFilters({
        url: `${BACKEND_BASE_URL}/api/v1/jobs?page=1&size=10`,
      });
    } else {
      setFilters({
        jobCategory: selectedCategory?.value || null,
        meetingOptions: selectedJobTypes.length > 0 ? selectedJobTypes : null,
        dateFilter: selectedTimeFilter?.value || null,
        jobStatus: selectedJobStatus?.value || null,
      });
    }
  }, [
    isAllJobsSelected,
    selectedCategory,
    selectedTimeFilter,
    selectedJobStatus,
    selectedJobTypes,
    setFilters,
  ]);

  const timeFilterOptions = [
    { value: 'anytime', label: 'Anytime', icon: <FiCalendar className="mr-2 text-sky-600/70" /> },
    { value: 'today', label: 'Today', icon: <FiCalendar className="mr-2 text-sky-600/70" /> },
    { value: 'past24Hours', label: 'Past 24 Hours', icon: <FiCalendar className="mr-2 text-sky-600/70" /> },
    { value: 'pastWeek', label: 'Past Week', icon: <FiCalendar className="mr-2 text-sky-600/70" /> },
    { value: 'pastMonth', label: 'Past Month', icon: <FiCalendar className="mr-2 text-sky-600/70" /> },
  ];

  const jobStatusOptions = [
    { value: 'Open', label: 'Open Jobs', icon: <FiCheckCircle className="mr-2 text-teal-600/80" /> },
    { value: 'Closed', label: 'Closed Jobs', icon: <FiCheckCircle className="mr-2 text-slate-400" /> },
  ];

  const meetingOptions = [
    { value: 'Online', label: 'Online Sessions', icon: <FiGlobe className="mr-2 text-sky-600/70" /> },
    { value: 'Physical', label: 'In-Person', icon: <FiHome className="mr-2 text-indigo-500/70" /> },
  ];

  const formatOptionLabel = ({ label, icon }) => (
    <div className="flex items-center">
      {icon}
      {label}
    </div>
  );

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      borderRadius: '8px',
      borderColor: state.isFocused ? '#7dd3fc' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(14, 165, 233, 0.18)' : 'none',
      backgroundColor: '#ffffff',
      fontSize: '14px',
      '&:hover': {
        borderColor: state.isFocused ? '#7dd3fc' : '#bae6fd',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#f0f9ff' : state.isFocused ? '#f8fafc' : 'white',
      color: '#0f172a',
      padding: '10px 12px',
      borderRadius: '6px',
      margin: '2px 6px',
      fontSize: '14px',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#f1f5f9',
      borderRadius: '6px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#334155',
      fontWeight: '500',
      fontSize: '13px',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#64748b',
      ':hover': {
        backgroundColor: '#e2e8f0',
        color: '#0f172a',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(14, 116, 144, 0.08)',
      border: '1px solid #e0f2fe',
      zIndex: 9999,
      position: 'absolute',
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '8px',
      maxHeight: '200px',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedTimeFilter(null);
    setSelectedJobStatus(null);
    setSelectedJobTypes([]);
    setIsAllJobsSelected(false);
  };

  const hasActiveFilters = selectedCategory || selectedTimeFilter || selectedJobStatus || selectedJobTypes.length > 0;

  return (
    <div className="w-full overflow-visible rounded-lg border border-sky-100/80 bg-white shadow-sm">
      <div className="border-b border-sky-100/70 bg-gradient-to-r from-sky-50/40 to-white px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-sky-200/60 bg-sky-50/80 text-sky-700">
              <FiFilter className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">Filters</h2>
              <p className="mt-0.5 text-xs text-slate-500">Refine the job list</p>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="shrink-0 rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
              title="Clear all filters"
              aria-label="Clear all filters"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 p-5">
        <div className="rounded-md border border-sky-100/70 bg-sky-50/25 p-3">
          <label className="flex cursor-pointer items-center">
            <div className="relative">
              <input
                type="checkbox"
                checked={isAllJobsSelected}
                onChange={(e) => setIsAllJobsSelected(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`block h-6 w-11 rounded-full transition-colors ${isAllJobsSelected ? 'bg-sky-700' : 'bg-slate-300'}`}
              />
              <div
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  isAllJobsSelected ? 'translate-x-5' : ''
                }`}
              />
            </div>
            <div className="ml-3">
              <span className="text-sm font-medium text-slate-900">Ignore filters</span>
              <p className="text-xs text-slate-500">Show all listings (unfiltered)</p>
            </div>
          </label>
        </div>

        {/* Meeting Options */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-slate-800">
            <FiGlobe className="mr-2 text-sky-600/60" aria-hidden />
            Meeting type
          </label>
          <Select
            options={meetingOptions}
            value={selectedJobTypes.map((type) => meetingOptions.find(opt => opt.value === type))}
            onChange={(selectedOptions) => {
              setSelectedJobTypes(selectedOptions ? selectedOptions.map((opt) => opt.value) : []);
            }}
            formatOptionLabel={formatOptionLabel}
            isMulti
            placeholder="Select meeting type..."
            styles={customSelectStyles}
            isDisabled={isAllJobsSelected}
            className="text-sm"
          />
        </div>

        {/* Date Posted Filter */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-slate-800">
            <FiCalendar className="mr-2 text-sky-600/60" aria-hidden />
            Date posted
          </label>
          <Select
            options={timeFilterOptions}
            value={selectedTimeFilter}
            onChange={setSelectedTimeFilter}
            formatOptionLabel={formatOptionLabel}
            placeholder="Select time range..."
            styles={customSelectStyles}
            isDisabled={isAllJobsSelected}
            className="text-sm"
          />
        </div>

        {/* Job Category */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 flex items-center">
            <FiBriefcase className="mr-2 text-sky-600/60" aria-hidden />
            Job Category
          </label>
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            isSearchable
            placeholder="Search categories..."
            styles={customSelectStyles}
            isDisabled={isAllJobsSelected}
            className="text-sm"
          />
        </div>

        {/* Job Status */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-slate-800">
            <FiCheckCircle className="mr-2 text-teal-600/60" aria-hidden />
            Status
          </label>
          <Select
            options={jobStatusOptions}
            value={selectedJobStatus}
            onChange={setSelectedJobStatus}
            formatOptionLabel={formatOptionLabel}
            placeholder="Select status..."
            styles={customSelectStyles}
            isDisabled={isAllJobsSelected}
            className="text-sm"
          />
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="rounded-md border border-sky-100/70 bg-sky-50/40 p-3">
            <h4 className="mb-2 flex items-center text-xs font-semibold uppercase tracking-wide text-sky-900/50">
              <FiRefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Applied
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {selectedCategory && (
                <li className="flex justify-between gap-2">
                  <span className="text-slate-500">Category</span>
                  <span className="max-w-[55%] truncate text-right font-medium">{selectedCategory.label}</span>
                </li>
              )}
              {selectedTimeFilter && (
                <li className="flex justify-between gap-2">
                  <span className="text-slate-500">Date</span>
                  <span className="max-w-[55%] truncate text-right font-medium">{selectedTimeFilter.label}</span>
                </li>
              )}
              {selectedJobStatus && (
                <li className="flex justify-between gap-2">
                  <span className="text-slate-500">Status</span>
                  <span className="max-w-[55%] truncate text-right font-medium">{selectedJobStatus.label}</span>
                </li>
              )}
              {selectedJobTypes.length > 0 && (
                <li className="flex justify-between gap-2">
                  <span className="text-slate-500">Meeting</span>
                  <span className="max-w-[55%] truncate text-right font-medium">{selectedJobTypes.join(', ')}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarFilters;