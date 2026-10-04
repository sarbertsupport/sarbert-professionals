import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchPaymentMethodTrend } from '../../components/services/dashboardTotals';
import logger from '../../utils/logger';

const DAY_OPTIONS = [
  { value: 14, label: '14d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
];

const PaymentMethodTrendChart = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPaymentMethodTrend(days);
        if (cancelled) return;
        if (!res.success) {
          setError(res.error || 'Failed to load trend');
          setData([]);
          return;
        }
        const rows = (res.labels || []).map((label, i) => ({
          label,
          cardPct: res.cardPercent[i] ?? 0,
          mpesaPct: res.mpesaPercent[i] ?? 0,
          cardRev: res.cardRevenue[i] ?? 0,
          mpesaRev: res.mpesaRevenue[i] ?? 0,
        }));
        setData(rows);
      } catch (e) {
        if (!cancelled) {
          logger.error(e);
          setError(e.message);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Card vs M-Pesa revenue mix (trend)</h2>
          <p className="text-sm text-gray-600">
            Share of settled coin-purchase revenue by payment rail (completed purchases only). Percentages are per
            day.
          </p>
        </div>
        <div className="flex rounded-lg bg-gray-100 p-1">
          {DAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDays(opt.value)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                days === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <div className="text-center text-sm text-gray-600">Loading trend…</div>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : data.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-gray-500">No data in this range.</div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                width={48}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                content={({ active, label, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg">
                      <p className="mb-2 font-medium text-gray-900">{label}</p>
                      <p className="text-indigo-700">
                        Card: {row.cardPct.toFixed(1)}% — $
                        {Number(row.cardRev).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-emerald-700">
                        M-Pesa: {row.mpesaPct.toFixed(1)}% — $
                        {Number(row.mpesaRev).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  );
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cardPct"
                name="Card %"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="mpesaPct"
                name="M-Pesa %"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodTrendChart;
