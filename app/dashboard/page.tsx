'use client';

import { Card } from '@/components/ui/card';
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

// Mock Data
const revenueData = [
  { name: 'Electronics', value: 35 },
  { name: 'Clothing', value: 25 },
  { name: 'Food', value: 20 },
  { name: 'Other', value: 20 },
];

const expensesData = [
  { name: 'Salaries', value: 40 },
  { name: 'Inventory', value: 30 },
  { name: 'Operations', value: 20 },
  { name: 'Other', value: 10 },
];

const profitMarginData = [
  { name: 'Jan', margin: 65 },
  { name: 'Feb', margin: 72 },
  { name: 'Mar', margin: 68 },
  { name: 'Apr', margin: 75 },
  { name: 'May', margin: 78 },
  { name: 'Jun', margin: 82 },
  { name: 'Jul', margin: 80 },
];

const cashFlowData = [
  { name: 'Week 1', inflow: 4000, outflow: 2400 },
  { name: 'Week 2', inflow: 3000, outflow: 1398 },
  { name: 'Week 3', inflow: 2000, outflow: 9800 },
  { name: 'Week 4', inflow: 2780, outflow: 3908 },
  { name: 'Week 5', inflow: 1890, outflow: 4800 },
  { name: 'Week 6', inflow: 2390, outflow: 3800 },
  { name: 'Week 7', inflow: 3490, outflow: 4300 },
];

const COLORS = ['#3b82f6', '#06b6d4', '#34d399', '#fbbf24'];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Navbar />

      {/* Main Content */}
      <main className="pt-16 p-4 sm:p-6 lg:ml-64">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back!</h2>
          <p className="text-slate-600 mt-1">Here's your business performance overview</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">$45,231</h3>
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12.5% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Total Expenses */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Expenses</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">$18,540</h3>
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  +3.2% from last month
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          {/* Net Profit */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Net Profit</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">$26,691</h3>
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +18.7% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {revenueData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Expenses by Category */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expensesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {expensesData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Profit Margin */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Profit Margin Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={profitMarginData}>
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
                <Bar dataKey="margin" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Cash Flow */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Cash Flow</h3>
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
                  dataKey="inflow"
                  stroke="#34d399"
                  strokeWidth={2}
                  name="Inflow"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="outflow"
                  stroke="#f87171"
                  strokeWidth={2}
                  name="Outflow"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>
    </div>
  );
}
