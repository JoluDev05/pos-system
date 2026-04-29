import { useState, useCallback, useMemo } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  // Add product to cart or increase quantity if already exists
  const addItem = useCallback(
    (product: { id: string; name: string; price: number; stock: number }) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);

        if (existingItem) {
          // Only increase if we have stock
          if (existingItem.quantity < product.stock) {
            return prevItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          return prevItems;
        }

        // Add new item
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            stock: product.stock,
          },
        ];
      });
    },
    []
  );

  // Remove item from cart
  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, Math.min(quantity, item.stock)) }
            : item
        )
        .filter((item) => item.quantity > 0) // Remove items with 0 quantity
    );
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calculate totals
  const cartState = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return {
      items,
      total,
      itemCount,
    };
  }, [items]);

  return {
    ...cartState,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isEmpty: items.length === 0,
  };
}
