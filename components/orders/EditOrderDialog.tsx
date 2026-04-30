'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  total: number;
  items: OrderItem[];
}

interface EditOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOrderDialog({ order, open, onOpenChange }: EditOrderDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ product_id: '', product_name: '', quantity: 1, price: 0 }],
  });

  // Fetch customers and products
  useEffect(() => {
    if (open) {
      fetchCustomersAndProducts();
    }
  }, [open]);

  // Pre-fill form when order changes
  useEffect(() => {
    if (order) {
      fetchOrderDetails();
    }
  }, [order, open]);

  const fetchCustomersAndProducts = async () => {
    const [customersData, productsData] = await Promise.all([
      supabase.from('customers').select('id, name'),
      supabase.from('products').select('id, name, price, stock'),
    ]);
    setCustomers(customersData.data || []);
    setProducts(productsData.data || []);
  };

  const fetchOrderDetails = async () => {
    if (!order) return;

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity, price, products(name)')
      .eq('order_id', order.id);

    const customer = customers.find((c) => c.name === order.customerName);

    const formattedItems = (orderItems || []).map((item: any) => ({
      product_id: item.product_id,
      product_name: item.products?.name || 'Desconocido',
      quantity: item.quantity,
      price: item.price,
    }));

    setFormData({
      customerId: customer?.id || '',
      items: formattedItems.length > 0 ? formattedItems : [{ product_id: '', product_name: '', quantity: 1, price: 0 }],
    });
    setErrors({});
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    if (field === 'product_id') {
      const selectedProduct = products.find((p) => p.id === value);
      newItems[index] = {
        ...newItems[index],
        product_id: value,
        product_name: selectedProduct?.name || '',
        price: selectedProduct?.price || 0,
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: field === 'quantity' ? parseFloat(value) || 0 : value,
      };
    }
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) newErrors.customerId = 'Selecciona un cliente';
    if (formData.items.length === 0) newErrors.items = 'Agrega al menos un producto';

    formData.items.forEach((item, index) => {
      if (!item.product_id) {
        newErrors[`item_${index}_name`] = 'Producto requerido';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_qty`] = 'Cantidad debe ser mayor a 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !order) return;

    setLoading(true);
    try {
      // Calculate new total
      const totalAmount = formData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Update order
      const { error: orderError } = await supabase
        .from('orders')
        .update({ total: totalAmount })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Delete old items
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', order.id);

      if (deleteError) throw deleteError;

      // Insert new items
      const itemsToInsert = formData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: parseInt(item.quantity.toString()),
        price: parseFloat(item.price.toString()),
      }));

      const { error: insertError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (insertError) throw insertError;

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating order:', error);
      setErrors((prev) => ({
        ...prev,
        submit: 'No se pudo actualizar la orden. Intenta de nuevo.',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar orden</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[500px] overflow-y-auto">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Cliente *</Label>
            <select
              id="customer"
              value={formData.customerId}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un cliente...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && <p className="text-sm text-red-600">{errors.customerId}</p>}
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <Label>Productos *</Label>
            {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`item_${index}_name`] ? 'border-red-500' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Selecciona un producto...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    {errors[`item_${index}_name`] && (
                      <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_name`]}</p>
                    )}
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="Cant."
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className={errors[`item_${index}_qty`] ? 'border-red-500' : ''}
                    />
                    {errors[`item_${index}_qty`] && (
                      <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_qty`]}</p>
                    )}
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Precio"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      disabled
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          items: prev.items.filter((_, i) => i !== index),
                        }))
                      }
                      className="px-2"
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="bg-slate-100 p-3 rounded-lg">
            <p className="text-sm text-slate-600">Total</p>
            <p className="text-2xl font-bold text-slate-900">
              ${formData.items
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toFixed(2)}
            </p>
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar orden'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
