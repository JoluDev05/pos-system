'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, ChevronDown } from 'lucide-react';
import { CartState } from '@/hooks/useCart';
import { useState } from 'react';

interface CartSummaryProps {
  cart: CartState;
  isLoading?: boolean;
  onCheckout: () => void;
  onClearCart: () => void;
}

export function CartSummary({
  cart,
  isLoading = false,
  onCheckout,
  onClearCart,
}: CartSummaryProps) {
  const [showDetails, setShowDetails] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const isCartEmpty = cart.items.length === 0;

  return (
    <Card className="p-6 flex flex-col h-full bg-white shadow-lg border-2 border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Carrito</h3>
        </div>
        <span className="ml-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {cart.itemCount} {cart.itemCount === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <Separator className="mb-4" />

      {/* Cart Items Summary */}
      <div className="flex-grow mb-6 min-h-[120px]">
        {isCartEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-slate-100 rounded-full mb-3">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium text-sm">No hay productos en el carrito</p>
            <p className="text-slate-500 text-xs mt-2">Agrega productos para empezar</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(cart.total)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Impuestos (0%)</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(0)}
              </span>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
              📦 {cart.itemCount} {cart.itemCount === 1 ? 'producto' : 'productos'}
            </div>
          </div>
        )}
      </div>

      {!isCartEmpty && <Separator className="mb-4" />}

      {/* Total - Enhanced */}
      <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-5 rounded-xl mb-4 border-2 border-blue-200 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">TOTAL</span>
          <span className="text-3xl font-black text-blue-600">
            {formatCurrency(cart.total)}
          </span>
        </div>
      </div>

      {/* Action Buttons - Enhanced */}
      <div className="space-y-3">
        <Button
          onClick={onCheckout}
          disabled={isCartEmpty || isLoading}
          size="lg"
          className={`w-full text-white font-bold text-base h-12 rounded-lg transition-all shadow-md ${
            isCartEmpty || isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin mr-2 inline-block">⏳</div>
              Procesando...
            </>
          ) : (
            '✓ Completar venta'
          )}
        </Button>

        <Button
          onClick={onClearCart}
          disabled={isCartEmpty || isLoading}
          variant="outline"
          size="lg"
          className="w-full font-semibold border-2 border-red-200 hover:bg-red-50 h-11"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Vaciar carrito
        </Button>
      </div>

      {/* Info Text */}
      <p className="text-xs text-slate-500 text-center mt-4">
        👉 Revisa los productos antes de completar la venta
      </p>
    </Card>
  );
}
