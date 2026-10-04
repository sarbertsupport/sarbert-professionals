import {
  Users,
  DollarSign,
  CreditCard,
  Smartphone,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Activity,
  Clock,
  Target,
  Zap,
} from 'lucide-react';

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return new Intl.NumberFormat('en-US').format(num);
};

const formatUsd = (n) =>
  `$${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatCard = ({ title, value, growth, icon: Icon, color, subtitle, valueMode = 'number' }) => {
  const getTrendIcon = (v) => {
    return v >= 0 ? (
      <ArrowUp className="w-3 h-3 mr-1" />
    ) : (
      <ArrowDown className="w-3 h-3 mr-1" />
    );
  };

  const displayMain = valueMode === 'currency' ? formatUsd(value) : formatNumber(value);

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${color} mr-3`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{displayMain}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {growth !== undefined && (
          <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
            growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {getTrendIcon(growth)}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardStats = ({ stats }) => {
  // Calculate additional metrics
  const totalUsers = (stats.totalStudents || 0) + (stats.totalProfessionals || 0);
  const avgRevenuePerUser = totalUsers > 0 ? (stats.totalRevenue || 0) / totalUsers : 0;
  const conversionRate = totalUsers > 0 ? ((stats.totalProfessionals || 0) / totalUsers) * 100 : 0;
  const dailyActiveUsers = Math.floor(totalUsers * 0.15); // Estimate 15% daily active
  const monthlyGrowth = stats.monthlyGrowth || 0;
  const revenuePerDay = (stats.monthlyRevenue || 0) / 30;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Key Performance Metrics</h2>
        <p className="text-sm text-gray-600">Comprehensive business analytics</p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          growth={stats.studentGrowth || 0}
          icon={Users}
          color="bg-blue-600"
          subtitle={`${stats.totalStudents || 0} clients, ${stats.totalProfessionals || 0} professionals`}
        />
        
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue || 0}
          growth={stats.yearlyGrowth || 0}
          icon={DollarSign}
          color="bg-green-600"
          subtitle="Lifetime revenue"
        />
        
        <StatCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue || 0}
          growth={stats.monthlyGrowth || 0}
          icon={CreditCard}
          color="bg-indigo-600"
          subtitle="Current month"
        />
        
        <StatCard
          title="Daily Revenue"
          value={stats.dailyRevenue || 0}
          growth={stats.dailyGrowth || 0}
          icon={TrendingUp}
          color="bg-orange-600"
          subtitle="Today's earnings"
        />
      </div>

      {/* Coin purchases: payment rail (completed purchases) */}
      <div>
        <h3 className="text-base font-semibold text-gray-900">Coin purchases by rail</h3>
        <p className="text-xs text-gray-500 mb-3">
          Lifetime totals for completed card (Paystack) and M-Pesa purchases. Amounts use stored currency units.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Card (Paystack) revenue"
            value={stats.cardTotalRevenue ?? 0}
            icon={CreditCard}
            color="bg-indigo-600"
            valueMode="currency"
            subtitle={`${stats.cardLifetimeTransactions ?? 0} completed purchase${(stats.cardLifetimeTransactions ?? 0) === 1 ? '' : 's'}`}
          />
          <StatCard
            title="M-Pesa revenue"
            value={stats.mpesaTotalRevenue ?? 0}
            icon={Smartphone}
            color="bg-emerald-600"
            valueMode="currency"
            subtitle={`${stats.mpesaLifetimeTransactions ?? 0} completed purchase${(stats.mpesaLifetimeTransactions ?? 0) === 1 ? '' : 's'}`}
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Revenue/User"
          value={avgRevenuePerUser}
          icon={Target}
          color="bg-purple-600"
          subtitle="Lifetime value"
        />
        
        <StatCard
          title="Conversion Rate"
          value={conversionRate}
          icon={Zap}
          color="bg-pink-600"
          subtitle="Clients to professionals"
        />
        
        <StatCard
          title="Daily Active Users"
          value={dailyActiveUsers}
          icon={Activity}
          color="bg-teal-600"
          subtitle="Estimated daily activity"
        />
        
        <StatCard
          title="Revenue/Day"
          value={revenuePerDay}
          icon={Clock}
          color="bg-yellow-600"
          subtitle="Average daily earnings"
        />
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Growth"
          value={monthlyGrowth}
          growth={monthlyGrowth}
          icon={TrendingUp}
          color="bg-emerald-600"
          subtitle="Revenue growth this month"
        />
        
        <StatCard
          title="User Growth"
          value={stats.studentGrowth || 0}
          growth={stats.studentGrowth || 0}
          icon={Users}
          color="bg-cyan-600"
          subtitle="New user acquisition"
        />
        
        <StatCard
          title="Platform Health"
          value={99.9}
          icon={Activity}
          color="bg-green-600"
          subtitle="Uptime percentage"
        />
      </div>
    </div>
  );
};

export default DashboardStats;