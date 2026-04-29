'use client';

import { Button } from '@/components/ui/button';
import { X, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/hooks/useCart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const subtotal = item.price * item.quantity;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-4 bg-white border-2 border-slate-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all">
      {/* Product Info */}
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-slate-900 truncate text-sm leading-tight">{item.name}</p>
        <p className="text-xs text-slate-600 mt-1">
          {formatCurrency(item.price)} × {item.quantity}
        </p>
      </div>

      {/* Quantity Controls - Enhanced */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
        <button
          onClick={() => handleQuantityChange(-1)}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
          title="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-bold text-slate-900">
          {item.quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(1)}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
          title="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[90px]">
        <p className="font-bold text-slate-900 text-sm">
          {formatCurrency(subtotal)}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110 active:scale-95"
        title="Remove item"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
