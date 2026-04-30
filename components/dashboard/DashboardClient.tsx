'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  createdAt: string;
}

interface OrderItem {
  orderId: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
}

interface DashboardClientProps {
  orders: Order[];
  items: OrderItem[];
}

const COLORS = ['#3b82f6', '#06b6d4', '#34d399', '#fbbf24', '#f97316'];
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function DashboardClient({ orders, items }: DashboardClientProps) {
  const [dateFilter, setDateFilter] = useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [rangeStart, setRangeStart] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return start.toISOString().slice(0, 10);
  });
  const [rangeEnd, setRangeEnd] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const currentMonthDate = useMemo(() => {
    if (dateFilter === 'month') {
      const [year, month] = monthFilter.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [dateFilter, monthFilter]);

  const previousMonthDate = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    return new Date(year, month - 1, 1);
  }, [currentMonthDate]);

  const customRange = useMemo(() => {
    if (dateFilter !== 'custom') return null;
    if (!rangeStart || !rangeEnd) return null;

    const start = new Date(`${rangeStart}T00:00:00`);
    const end = new Date(`${rangeEnd}T23:59:59.999`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    if (start > end) return null;

    return { start, end };
  }, [dateFilter, rangeStart, rangeEnd]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const days = dateFilter === 'week' ? 7 : null;
    const cutoff = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;
    const [selectedYear, selectedMonth] = monthFilter.split('-').map(Number);

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (customRange) {
        if (orderDate < customRange.start || orderDate > customRange.end) return false;
      }
      if (cutoff && orderDate < cutoff) return false;
      if (dateFilter === 'month') {
        const orderMonth = orderDate.getMonth() + 1;
        const orderYear = orderDate.getFullYear();
        if (orderYear !== selectedYear || orderMonth !== selectedMonth) return false;
      }
      if (dateFilter === 'year' && orderDate.getFullYear() !== now.getFullYear()) return false;
      return true;
    });
  }, [orders, dateFilter, monthFilter, customRange]);

  const filteredOrderIds = useMemo(() => {
    return new Set(filteredOrders.map((order) => order.id));
  }, [filteredOrders]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => filteredOrderIds.has(item.orderId));
  }, [items, filteredOrderIds]);

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }, [filteredOrders]);

  const orderCount = filteredOrders.length;
  const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

  const previousSalesTotal = useMemo(() => {
    const now = new Date();
    const [selectedYear, selectedMonth] = monthFilter.split('-').map(Number);

    if (dateFilter === 'custom' && customRange) {
      const rangeDuration = customRange.end.getTime() - customRange.start.getTime();
      const previousStart = new Date(customRange.start.getTime() - rangeDuration - 1);
      const previousEnd = new Date(customRange.end.getTime() - rangeDuration - 1);

      return orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= previousStart && orderDate <= previousEnd;
        })
        .reduce((sum, order) => sum + order.total, 0);
    }

    if (dateFilter === 'week') {
      const start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const end = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= start && orderDate < end;
        })
        .reduce((sum, order) => sum + order.total, 0);
    }

    if (dateFilter === 'month') {
      const previousMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const previousYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      return orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getFullYear() === previousYear &&
            orderDate.getMonth() + 1 === previousMonth
          );
        })
        .reduce((sum, order) => sum + order.total, 0);
    }

    return orders
      .filter((order) => new Date(order.createdAt).getFullYear() === now.getFullYear() - 1)
      .reduce((sum, order) => sum + order.total, 0);
  }, [orders, dateFilter, monthFilter, customRange]);

  const revenueDelta = previousSalesTotal > 0
    ? ((totalRevenue - previousSalesTotal) / previousSalesTotal) * 100
    : 0;
  const isRevenueUp = revenueDelta >= 0;

  const revenueByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredItems.forEach((item) => {
      const key = item.category || 'Sin categoria';
      const value = item.price * item.quantity;
      map.set(key, (map.get(key) || 0) + value);
    });

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredItems]);

  const topProductsData = useMemo(() => {
    const map = new Map<string, number>();
    filteredItems.forEach((item) => {
      const value = item.price * item.quantity;
      map.set(item.productName, (map.get(item.productName) || 0) + value);
    });

    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredItems]);

  const trendSixMonthsData = useMemo(() => {
    const months = [] as { name: string; total: number }[];
    const baseDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const total = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getFullYear() === year && orderDate.getMonth() === month;
        })
        .reduce((sum, order) => sum + order.total, 0);

      months.push({ name: MONTH_LABELS[month], total });
    }

    return months;
  }, [orders, currentMonthDate]);

  const cashFlowData = useMemo(() => {
    const makeBuckets = (target: Date) => {
      const buckets = [0, 0, 0, 0];
      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        if (date.getFullYear() !== target.getFullYear() || date.getMonth() !== target.getMonth()) {
          return;
        }
        const weekIndex = Math.min(3, Math.floor((date.getDate() - 1) / 7));
        buckets[weekIndex] += order.total;
      });
      return buckets;
    };

    const current = makeBuckets(currentMonthDate);
    const previous = makeBuckets(previousMonthDate);

    return [
      { name: 'Sem 1', current: current[0], previous: previous[0] },
      { name: 'Sem 2', current: current[1], previous: previous[1] },
      { name: 'Sem 3', current: current[2], previous: previous[2] },
      { name: 'Sem 4', current: current[3], previous: previous[3] },
    ];
  }, [orders, currentMonthDate, previousMonthDate]);

  const hasRevenueByCategory = revenueByCategory.some((item) => item.value > 0);
  const hasCashFlow = cashFlowData.some(
    (item) => item.current > 0 || item.previous > 0
  );
  const hasTrendData = trendSixMonthsData.some((item) => item.total > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Navbar />

      <main className="pt-16 p-4 sm:p-6 lg:ml-64">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-1">Resumen de tu rendimiento</p>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setDateFilter('week')}
                className={`h-9 px-4 rounded-lg text-sm font-semibold border transition-colors ${
                  dateFilter === 'week'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`h-9 px-4 rounded-lg text-sm font-semibold border transition-colors ${
                  dateFilter === 'month'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setDateFilter('year')}
                className={`h-9 px-4 rounded-lg text-sm font-semibold border transition-colors ${
                  dateFilter === 'year'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Anual
              </button>
              <button
                onClick={() => setDateFilter('custom')}
                className={`h-9 px-4 rounded-lg text-sm font-semibold border transition-colors ${
                  dateFilter === 'custom'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Rango
              </button>
            </div>

            {dateFilter === 'month' && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Mes</label>
                <Input
                  type="month"
                  value={monthFilter}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setMonthFilter(event.target.value)
                  }
                  className="h-9 w-40"
                />
              </div>
            )}

            {dateFilter === 'custom' && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Desde</label>
                  <Input
                    type="date"
                    value={rangeStart}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setRangeStart(event.target.value)
                    }
                    className="h-9 w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Hasta</label>
                  <Input
                    type="date"
                    value={rangeEnd}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setRangeEnd(event.target.value)
                    }
                    className="h-9 w-40"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Resumen de ventas</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(totalRevenue)}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {orderCount} ventas en el periodo
              </p>
            </div>
            <div className="w-full sm:w-60">
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: '100%' }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">Total del periodo</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Ingresos totales</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {formatCurrency(totalRevenue)}
                </h3>
                <p
                  className={`text-sm mt-2 flex items-center gap-1 ${
                    isRevenueUp ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isRevenueUp ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {`${isRevenueUp ? '+' : ''}${revenueDelta.toFixed(1)}% vs periodo anterior`}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total de ventas</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{orderCount}</h3>
                <p className="text-slate-500 text-sm mt-2">Ordenes en el periodo</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Ticket promedio</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {formatCurrency(avgOrder)}
                </h3>
                <p className="text-slate-500 text-sm mt-2">Promedio por venta</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Ingresos por categoria</h3>
            {!hasRevenueByCategory ? (
              <p className="text-sm text-slate-500">Sin datos para el periodo.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {revenueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {revenueByCategory.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Flujo de caja (mes actual vs mes pasado)
            </h3>
            {hasCashFlow ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Mes actual"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    name="Mes pasado"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">Sin datos para el periodo.</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Tendencia de 6 meses</h3>
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trendSixMonthsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">Sin datos para el periodo.</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Top productos del periodo</h3>
            {topProductsData.length === 0 ? (
              <p className="text-sm text-slate-500">Sin datos para el periodo.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topProductsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Bar dataKey="total" fill="#34d399" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
