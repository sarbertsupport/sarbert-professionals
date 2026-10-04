import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import logger from '../../utils/logger';
import { fetchRevenueChartData } from '../../components/services/dashboardTotals';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const RevenueOverview = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [viewMode, setViewMode] = useState('yoy'); // yoy, year, quarter, month
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate year options (last 5 years + current year)
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Quarter options
  const quarterOptions = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' }
  ];

  // Month options
  const monthOptions = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  useEffect(() => {
    loadChartData();
  }, [viewMode, selectedYear, selectedQuarter, selectedMonth]);

  const loadChartData = async () => {
      setLoading(true);
      try {
      let year = null, quarter = null, month = null;
      
      if (viewMode === 'year') {
        year = selectedYear;
      } else if (viewMode === 'quarter') {
        year = selectedYear;
        quarter = selectedQuarter;
      } else if (viewMode === 'month') {
        year = selectedYear;
        month = selectedMonth;
      }

      const response = await fetchRevenueChartData(viewMode, year, quarter, month);
      
        if (response.success) {
          const transformedData = response.labels.map((label, index) => ({
            name: label,
          revenue: response.data[index] || 0
        }));
        setChartData(transformedData);
      } else {
        logger.error("Failed to load chart data:", response.error);
        setChartData([]);
        }
      } catch (error) {
        logger.error("Error loading chart data:", error);
      setChartData([]);
      } finally {
        setLoading(false);
      }
    };

  const generateFallbackData = () => {
    if (viewMode === 'yoy') {
      return [
        { name: '2020', revenue: 45000 },
        { name: '2021', revenue: 52000 },
        { name: '2022', revenue: 48000 },
        { name: '2023', revenue: 61000 },
        { name: '2024', revenue: 75000 }
      ];
    } else if (viewMode === 'year') {
      return [
        { name: 'Q1', revenue: 18000 },
        { name: 'Q2', revenue: 22000 },
        { name: 'Q3', revenue: 19000 },
        { name: 'Q4', revenue: 16000 }
      ];
    } else if (viewMode === 'quarter') {
      return [
        { name: 'Jan', revenue: 6000 },
        { name: 'Feb', revenue: 5500 },
        { name: 'Mar', revenue: 6500 }
      ];
    } else {
      return [
        { name: 'Week 1', revenue: 1500 },
        { name: 'Week 2', revenue: 1800 },
        { name: 'Week 3', revenue: 1200 },
        { name: 'Week 4', revenue: 2000 }
      ];
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedQuarter(null);
    setSelectedMonth(null);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    if (viewMode === 'yoy') {
      setViewMode('year');
    }
  };

  const handleQuarterSelect = (quarter) => {
    setSelectedQuarter(quarter);
    setViewMode('quarter');
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setViewMode('month');
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading chart...</p>
          </div>
        </div>
      );
    }

    if (chartType === 'pie' && chartData.length > 0) {
      return (
        <PieChart width={400} height={300}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="revenue"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
        </PieChart>
      );
    }

    return (
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip 
          formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Bar dataKey="revenue" fill="#4f46e5" radius={[2, 2, 0, 0]} />
      </BarChart>
    );
  };

  const getChartTitle = () => {
    if (viewMode === 'yoy') return 'Year-over-Year Revenue Comparison';
    if (viewMode === 'year') return `Revenue by Quarter - ${selectedYear}`;
    if (viewMode === 'quarter') return `Revenue by Month - Q${selectedQuarter} ${selectedYear}`;
    if (viewMode === 'month') return `Revenue by Week - ${monthOptions.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;
    return 'Revenue Overview';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{getChartTitle()}</h2>
          <p className="text-sm text-gray-600">Revenue performance analysis</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* View Mode Selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('yoy')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'yoy' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              YoY
            </button>
            <button
              onClick={() => handleViewModeChange('year')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'year' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => handleViewModeChange('quarter')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'quarter' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => handleViewModeChange('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'month' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm rounded-md ${
                chartType === 'bar' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bar
            </button>
              <button
                onClick={() => setChartType('pie')}
              className={`px-3 py-1 text-sm rounded-md ${
                chartType === 'pie' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              >
                Pie
              </button>
          </div>
        </div>
      </div>

      {/* Year Selector */}
      {viewMode !== 'yoy' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => handleYearSelect(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      {/* Quarter Selector */}
      {viewMode === 'year' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Quarter:</label>
          <div className="flex space-x-2">
            {quarterOptions.map(quarter => (
              <button
                key={quarter.value}
                onClick={() => handleQuarterSelect(quarter.value)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  selectedQuarter === quarter.value
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {quarter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Month Selector */}
      {viewMode === 'quarter' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Month:</label>
          <select
            value={selectedMonth || ''}
            onChange={(e) => handleMonthSelect(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a month</option>
            {monthOptions.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      {!loading && chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-600">Total Revenue</p>
            <p className="font-semibold text-gray-900">
              ${chartData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-600">Average</p>
            <p className="font-semibold text-gray-900">
              ${(chartData.reduce((sum, item) => sum + item.revenue, 0) / chartData.length).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-600">Highest</p>
            <p className="font-semibold text-gray-900">
              ${Math.max(...chartData.map(item => item.revenue)).toLocaleString()}
            </p>
          </div>
      </div>
      )}
    </div>
  );
};

export default RevenueOverview;