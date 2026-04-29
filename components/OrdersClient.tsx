'use client';

import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Navbar />

      <main className="ml-64 pt-16 p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{t('orders.title')}</h2>
            <p className="text-slate-600 mt-1">{t('orders.subtitle')}</p>
          </div>
          <Button
            onClick={() => setIsAddOrderDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('orders.addOrder')}
          </Button>
        </div>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          {orders.length > 0 ? (
            <div>
              <Table>
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
                  {orders.map((order) => [
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
                                      className="flex items-center justify-between p-2 bg-white rounded border border-slate-200"
                                    >
                                      <div className="flex-1">
                                        <p className="font-medium text-slate-900">
                                          {item.product_name}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-6">
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
        {orders.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-slate-600 text-sm">{t('orders.orderTable.id')}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-slate-600 text-sm">{t('orders.total')}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(
                  orders.reduce((sum, order) => sum + order.total, 0)
                )}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-slate-600 text-sm">{t('orders.average')}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(
                  orders.reduce((sum, order) => sum + order.total, 0) / orders.length
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
