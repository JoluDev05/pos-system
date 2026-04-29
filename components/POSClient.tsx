'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { CartItem } from '@/components/CartItem';
import { CartSummary } from '@/components/CartSummary';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { useCart } from '@/hooks/useCart';
import { createOrder } from '@/lib/orders';
import { CustomerSelector } from '@/components/CustomerSelector';
import { CustomerHistory } from '@/components/CustomerHistory';
import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  category?: string;
}

interface POSClientProps {
  products: Product[];
}

export function POSClient({ products }: POSClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('General Sale');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    orderId?: string;
  }>({ type: null, message: '' });

  const cart = useCart();

  // Load customer name when selected
  const handleCustomerSelect = async (customerId: string | null) => {
    setSelectedCustomerId(customerId);
    
    if (customerId === null) {
      setSelectedCustomerName('General Sale');
    } else {
      // Load customer name from Supabase
      try {
        const { data } = await supabase
          .from('customers')
          .select('name')
          .eq('id', customerId)
          .single();
        
        if (data) {
          setSelectedCustomerName(data.name);
        }
      } catch (error) {
        console.error('Error loading customer name:', error);
        setSelectedCustomerName('Customer');
      }
    }
  };

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Auto-hide status message after 3 seconds
  useEffect(() => {
    if (checkoutStatus.type) {
      const timer = setTimeout(() => {
        setCheckoutStatus({ type: null, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [checkoutStatus.type]);

  const handleCheckout = async () => {
    if (cart.isEmpty) return;

    setIsCheckingOut(true);
    try {
      const result = await createOrder({
        items: cart.items,
        total: cart.total,
        customerId: selectedCustomerId || undefined,
      });

      if (result.success) {
        setCheckoutStatus({
          type: 'success',
          message: `Order #${result.orderId?.slice(0, 8).toUpperCase()} completed!`,
          orderId: result.orderId,
        });

        // Clear cart after successful order
        cart.clearCart();

        // Optional: redirect to order details after delay
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        setCheckoutStatus({
          type: 'error',
          message: result.error || 'Failed to create order',
        });
      }
    } catch (error) {
      setCheckoutStatus({
        type: 'error',
        message: 'An unexpected error occurred',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Navbar />

      <main className="pt-16 p-4 sm:p-6 lg:ml-64 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Sales Terminal</h2>
            <p className="text-slate-600 mt-2">Complete the sale by selecting products</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 w-fit">
            <span className="text-sm text-slate-600">Products:</span>
            <span className="font-semibold text-slate-900">{filteredProducts.length}</span>
          </div>
        </div>

        {/* Error Message - Enhanced */}
        {checkoutStatus.type === 'error' && (
          <div className="mb-6 p-4 rounded-lg border-l-4 border-red-500 bg-red-50 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold">Order Failed</p>
                <p className="text-red-700 text-sm mt-1">{checkoutStatus.message}</p>
                <p className="text-red-600 text-xs mt-2">
                  💡 Check browser console (F12) for details. Contact support if problem persists.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message - Enhanced */}
        {checkoutStatus.type === 'success' && (
          <div className="mb-6 p-4 rounded-lg border-l-4 border-green-500 bg-green-50 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-semibold">{checkoutStatus.message}</p>
                <p className="text-green-700 text-sm mt-1">Receipt saved in system</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout: Products + Cart */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Left: Products Section (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search Bar - Enhanced */}
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <Input
                placeholder="🔍 Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Product Grid - Enhanced */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-max">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="animate-in fade-in duration-200">
                    <ProductCard
                      {...product}
                      onAddToCart={cart.addItem}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-lg border-2 border-dashed border-slate-200">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium text-lg">No products found</p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchTerm ? 'Try a different search term' : 'No products available'}
                </p>
              </div>
            )}
          </div>

          {/* Right: Cart Section (1 column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Customer Selector */}
              <CustomerSelector
                selectedCustomerId={selectedCustomerId}
                selectedCustomerName={selectedCustomerName}
                onCustomerSelect={handleCustomerSelect}
              />

              {/* Customer History */}
              {selectedCustomerId && (
                <CustomerHistory
                  customerId={selectedCustomerId}
                />
              )}

              {/* Cart Summary */}
              <CartSummary
                cart={cart}
                isLoading={isCheckingOut}
                onCheckout={handleCheckout}
                onClearCart={cart.clearCart}
              />
            </div>
          </div>
        </div>

        {/* Cart Items List (Below on mobile, in sidebar content area) */}
        {!cart.isEmpty && (
          <div className="mt-6 lg:hidden">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Cart Items ({cart.itemCount})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={cart.updateQuantity}
                  onRemove={cart.removeItem}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cart Items (Desktop view - in CartSummary area, but show full list) */}
        {!cart.isEmpty && (
          <div className="hidden lg:block mt-6 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Items in Cart
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={cart.updateQuantity}
                  onRemove={cart.removeItem}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
