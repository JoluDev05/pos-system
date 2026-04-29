'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { History, ChevronDown, ChevronUp } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  created_at: string;
  order_items?: any[];
}

interface CustomerHistoryProps {
  customerId: string | null;
}

export function CustomerHistory({ customerId }: CustomerHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState<string>('Customer');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (customerId) {
      loadOrderHistory();
      loadCustomerName();
    } else {
      setOrders([]);
      setTotalSpent(0);
    }
  }, [customerId]);

  const loadOrderHistory = async () => {
    if (!customerId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, total, created_at, order_items(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading order history:', error);
        return;
      }

      const orderData = data || [];
      setOrders(orderData as Order[]);
      
      const total = orderData.reduce((sum, order) => sum + (order.total || 0), 0);
      setTotalSpent(total);
    } catch (error) {
      console.error('Unexpected error loading order history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerName = async () => {
    if (!customerId) return;

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('name')
        .eq('id', customerId)
        .single();

      if (error) {
        console.error('Error loading customer name:', error);
        return;
      }

      if (data) {
        setCustomerName(data.name);
      }
    } catch (error) {
      console.error('Unexpected error loading customer name:', error);
    }
  };

  if (!customerId) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
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

  return (
    <Card className="bg-blue-50 border-2 border-blue-200 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:bg-blue-100 p-2 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          <div className="text-left">
            <p className="text-sm font-semibold text-blue-900">📊 {customerName}</p>
            <p className="text-xs text-blue-700">
              {orders.length} purchase{orders.length !== 1 ? 's' : ''} • Total: {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-blue-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-blue-600" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 border-t border-blue-200 pt-3">
          {isLoading ? (
            <p className="text-sm text-blue-700">Loading history...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-blue-600">No purchase history</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="text-sm bg-white p-2 rounded border border-blue-100 hover:border-blue-300"
              >
                <div className="flex justify-between items-center">
                  <span className="text-blue-900 font-medium">{formatCurrency(order.total)}</span>
                  <span className="text-xs text-blue-600">{formatDate(order.created_at)}</span>
                </div>
                {order.order_items && (
                  <p className="text-xs text-blue-600 mt-1">
                    {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}
