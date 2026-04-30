import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { supabase } from '@/lib/supabase';
import { DashboardClient } from '../../components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, total, created_at')
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <Navbar />
        <main className="pt-16 p-4 sm:p-6 lg:ml-64">
          <Card className="p-6">
            <p className="text-red-600">Error al cargar ventas</p>
          </Card>
        </main>
      </div>
    );
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('order_id, quantity, price, products(name, category)');

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <Navbar />
        <main className="pt-16 p-4 sm:p-6 lg:ml-64">
          <Card className="p-6">
            <p className="text-red-600">Error al cargar detalle de ventas</p>
          </Card>
        </main>
      </div>
    );
  }

  const ordersData = (orders || []).map((order: any) => ({
    id: order.id,
    total: order.total || 0,
    createdAt: order.created_at,
  }));

  const itemsData = (orderItems || []).map((item: any) => ({
    orderId: item.order_id,
    productName: item.products?.name || 'Producto',
    category: item.products?.category || 'Sin categoria',
    quantity: item.quantity || 0,
    price: item.price || 0,
  }));

  return <DashboardClient orders={ordersData} items={itemsData} />;
}
