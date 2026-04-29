'use server';

import { supabase } from '@/lib/supabase';
import { CartItem } from '@/hooks/useCart';

export interface CreateOrderParams {
  items: CartItem[];
  total: number;
  customerId?: string;
}

export interface OrderCreationResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Creates an order in Supabase with order items
 * - Validates total server-side (prevents frontend manipulation)
 * - Creates order record
 * - Creates order_items with price snapshot
 * - Returns order ID on success
 */
export async function createOrder({
  items,
  total,
  customerId,
}: CreateOrderParams): Promise<OrderCreationResult> {
  try {
    // Validate cart is not empty
    if (!items || items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Server-side validation: recalculate total to prevent frontend manipulation
    const calculatedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Allow small floating point differences (e.g., 0.01)
    if (Math.abs(calculatedTotal - total) > 0.01) {
      console.error(`Total mismatch: received ${total}, calculated ${calculatedTotal}`);
      return { success: false, error: 'Invalid total amount' };
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_id: customerId || null,
          total: calculatedTotal,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', {
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
        code: orderError.code,
      });
      return { 
        success: false, 
        error: `Failed to create order: ${orderError.message || 'Unknown error'}` 
      };
    }

    // Create order items with price
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price, // Store current price for historical record
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', {
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint,
        code: itemsError.code,
      });
      return { 
        success: false, 
        error: `Failed to add items to order: ${itemsError.message || 'Unknown error'}` 
      };
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Unexpected error creating order:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Fetches a specific order with its items
 */
export async function getOrder(orderId: string) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return { success: false, error: 'Order not found' };
    }

    return { success: true, order };
  } catch (error) {
    console.error('Unexpected error fetching order:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
