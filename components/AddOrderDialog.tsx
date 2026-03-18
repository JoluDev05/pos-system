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
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface AddOrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddOrderDialog({ isOpen, onOpenChange }: AddOrderDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ product_id: '', product_name: '', quantity: 1, price: 0 }],
  });

  // Fetch customers and products on dialog open
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('id, name');
    setCustomers(data || []);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name, price, stock');
    setProducts(data || []);
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData((prev) => ({
      ...prev,
      customerId,
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    if (field === 'product_id') {
      const selectedProduct = products.find(p => p.id === value);
      newItems[index] = {
        ...newItems[index],
        product_id: value,
        product_name: selectedProduct?.name || '',
        price: selectedProduct?.price || 0,
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value,
      };
    }
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', product_name: '', quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) newErrors.customerId = 'Please select a customer';
    if (formData.items.length === 0) newErrors.items = 'Add at least one item';

    formData.items.forEach((item, index) => {
      if (!item.product_id) {
        newErrors[`item_${index}_name`] = 'Product required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_qty`] = 'Quantity must be greater than 0';
      }
      if (item.price < 0) {
        newErrors[`item_${index}_price`] = 'Price must be valid';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const totalAmount = formData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: formData.customerId,
            total: totalAmount,
          },
        ])
        .select();

      if (orderError) throw orderError;

      const orderId = orderData[0].id;

      // Create order items and update product stock
      for (const item of formData.items) {
        // Insert order item with product_id
        const { error: itemError } = await supabase
          .from('order_items')
          .insert([
            {
              order_id: orderId,
              product_id: item.product_id,
              quantity: parseInt(item.quantity.toString()),
              price: parseFloat(item.price.toString()),
            },
          ]);

        if (itemError) throw itemError;

        // Update product stock (decrease by quantity sold)
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id);

          if (stockError) throw stockError;
        }
      }

      // Reset and close
      setFormData({
        customerId: '',
        items: [{ product_id: '', product_name: '', quantity: 1, price: 0 }],
      });
      setErrors({});
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error creating order:', error);
      setErrors((prev) => ({
        ...prev,
        submit: error?.message || 'Failed to create order. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[500px] overflow-y-auto">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Customer *</Label>
            <select
              id="customer"
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a customer...</option>
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
            <Label>Order Items *</Label>
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
                      <option value="">Select a product...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
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
                      placeholder="Qty"
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
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      className={errors[`item_${index}_price`] ? 'border-red-500' : ''}
                    />
                    {errors[`item_${index}_price`] && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors[`item_${index}_price`]}
                      </p>
                    )}
                  </div>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="px-2"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="mt-2"
            >
              + Add Item
            </Button>
          </div>

          {/* Order Total */}
          <div className="bg-slate-100 p-3 rounded-lg">
            <p className="text-sm text-slate-600">Total Amount</p>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
