'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  onAddToCart: (product: { id: string; name: string; price: number; stock: number }) => void;
}

export function ProductCard({
  id,
  name,
  price,
  stock,
  description,
  onAddToCart,
}: ProductCardProps) {
  const isOutOfStock = stock === 0;

  const handleClick = () => {
    if (!isOutOfStock) {
      onAddToCart({ id, name, price, stock });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  return (
    <Card
      className={`h-full flex flex-col p-4 transition-all duration-200 hover:shadow-xl border-2 ${
        isOutOfStock 
          ? 'opacity-60 bg-gray-50 border-gray-200' 
          : 'border-slate-200 hover:border-blue-400 hover:shadow-blue-200/50 cursor-pointer'
      }`}
    >
      {/* Stock Badge */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          {isOutOfStock ? (
            <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
              <AlertCircle className="w-3 h-3" />
              Out of Stock
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
              ✓ {stock} in stock
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-grow mb-4">
        <h3 className="font-bold text-base text-slate-900 line-clamp-2 mb-1 leading-tight">
          {name}
        </h3>
        {description && (
          <p className="text-xs text-slate-600 line-clamp-2 opacity-75">{description}</p>
        )}
      </div>

      {/* Price and Button */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="text-3xl font-black text-blue-600">
          {formatCurrency(price)}
        </div>
        <Button
          onClick={handleClick}
          disabled={isOutOfStock}
          className={`w-full font-bold text-sm h-10 rounded-lg transition-all ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-md hover:shadow-lg'
          }`}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
