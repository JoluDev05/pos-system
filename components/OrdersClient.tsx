'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AddOrderDialog } from '@/components/AddOrderDialog';
import { DeleteOrderButton } from '@/components/DeleteOrderButton';
import { EditOrderDialog } from '@/components/EditOrderDialog';
import { useI18n } from '@/lib/i18n';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  total: number;
  items: OrderItem[];
}

interface OrdersClientProps {
  orders: Order[];
}

export function OrdersClient({ orders }: OrdersClientProps) {
  const { t } = useI18n();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<'week' | 'month' | 'all'>('month');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  const toggleRow = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const customerOptions = useMemo(() => {
    const unique = new Set<string>();
    orders.forEach((order) => unique.add(order.customerName));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const productOptions = useMemo(() => {
    const unique = new Set<string>();
    orders.forEach((order) => {
      order.items.forEach((item) => unique.add(item.product_name));
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const days = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : null;
    const cutoff = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (cutoff && orderDate < cutoff) return false;
      if (customerFilter !== 'all' && order.customerName !== customerFilter) return false;
      if (productFilter !== 'all') {
        const hasProduct = order.items.some((item) => item.product_name === productFilter);
        if (!hasProduct) return false;
      }
      return true;
    });
  }, [orders, dateFilter, customerFilter, productFilter]);

  const dailySales = useMemo(() => {
    const dailyMap = new Map<string, number>();
    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`;
      dailyMap.set(key, (dailyMap.get(key) || 0) + order.total);
    });

    return Array.from(dailyMap.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([date, total]) => ({ date, total }));
  }, [filteredOrders]);

  const maxDailyTotal = dailySales.reduce((max, item) => Math.max(max, item.total), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Navbar />

      <main className="pt-16 p-4 sm:p-6 lg:ml-64">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Ventas</h2>
            <p className="text-slate-600 mt-1">Resumen de ventas y actividad</p>
          </div>
          <Button
            onClick={() => setIsAddOrderDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            {t('orders.addOrder')}
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={dateFilter === 'week' ? 'default' : 'outline'}
                className="h-9"
                onClick={() => setDateFilter('week')}
              >
                Semana
              </Button>
              <Button
                variant={dateFilter === 'month' ? 'default' : 'outline'}
                className="h-9"
                onClick={() => setDateFilter('month')}
              >
                Mes
              </Button>
              <Button
                variant={dateFilter === 'all' ? 'default' : 'outline'}
                className="h-9"
                onClick={() => setDateFilter('all')}
              >
                Todo
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Cliente</label>
              <select
                value={customerFilter}
                onChange={(event) => setCustomerFilter(event.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                <option value="all">Todos</option>
                {customerOptions.map((customer) => (
                  <option key={customer} value={customer}>
                    {customer}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Producto</label>
              <select
                value={productFilter}
                onChange={(event) => setProductFilter(event.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                <option value="all">Todos</option>
                {productOptions.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Ventas por dia</h3>
            <span className="text-xs text-slate-500">
              {filteredOrders.length} ventas
            </span>
          </div>
          {dailySales.length === 0 ? (
            <p className="text-sm text-slate-600">No hay ventas para este filtro.</p>
          ) : (
            <div className="space-y-2">
              {dailySales.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-slate-600">{day.date}</div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${maxDailyTotal ? (day.total / maxDailyTotal) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-24 text-right text-xs font-semibold text-slate-800">
                    {formatCurrency(day.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          {filteredOrders.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[180px]">{t('orders.orderTable.date')}</TableHead>
                    <TableHead>{t('orders.orderTable.customer')}</TableHead>
                    <TableHead>{t('orders.orderTable.id')}</TableHead>
                    <TableHead className="w-[150px] text-right">{t('orders.orderTable.total')}</TableHead>
                    <TableHead className="w-[100px]">{t('orders.orderTable.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => [
                    <TableRow key={order.id} className="hover:bg-slate-50">
                      <TableCell>
                        <button
                          onClick={() => toggleRow(order.id)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <ChevronDown
                            className={`w-5 h-5 text-slate-600 transition-transform ${
                              expandedRows.has(order.id) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {order.id}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingOrder(order);
                              setIsEditDialogOpen(true);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-blue-600"
                            title={t('common.edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <DeleteOrderButton orderId={order.id} customerName={order.customerName} />
                        </div>
                      </TableCell>
                    </TableRow>,
                    expandedRows.has(order.id) && (
                      <TableRow key={`${order.id}-details`} className="bg-slate-100">
                          <TableCell colSpan={6}>
                            <div className="py-4">
                              <h4 className="font-semibold text-slate-900 mb-3">
                                {t('orders.products')} ({order.items.length})
                              </h4>
                              {order.items.length > 0 ? (
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-2 bg-white rounded border border-slate-200"
                                    >
                                      <div className="flex-1">
                                        <p className="font-medium text-slate-900">
                                          {item.product_name}
                                        </p>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-6">
                                        <div className="text-center">
                                          <p className="text-sm text-slate-600">{t('orders.quantity')}</p>
                                          <p className="font-semibold text-slate-900">
                                            {item.quantity}
                                          </p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-sm text-slate-600">{t('orders.unitPrice')}</p>
                                          <p className="font-semibold text-slate-900">
                                            {formatCurrency(item.price)}
                                          </p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-sm text-slate-600">{t('orders.itemTotal')}</p>
                                          <p className="font-semibold text-slate-900">
                                            {formatCurrency(item.price * item.quantity)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-600">{t('orders.products')}</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ),
                  ])}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-600 mb-2">{t('orders.noOrders')}</p>
              <p className="text-sm text-slate-500">
                {t('orders.addOrder')}
              </p>
            </div>
          )}
        </Card>

        {/* Summary Stats */}
          {filteredOrders.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-slate-600 text-sm">{t('orders.orderTable.id')}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{filteredOrders.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-slate-600 text-sm">{t('orders.total')}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(
                  filteredOrders.reduce((sum, order) => sum + order.total, 0)
                )}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-slate-600 text-sm">{t('orders.average')}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(
                  filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length
                )}
              </p>
            </Card>
          </div>
        )}

        <AddOrderDialog
          isOpen={isAddOrderDialogOpen}
          onOpenChange={setIsAddOrderDialogOpen}
        />

        <EditOrderDialog
          order={editingOrder}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      </main>
    </div>
  );
}
