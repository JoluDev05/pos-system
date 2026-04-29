# POS Sales Terminal - Quick Start Guide

## 🚀 Getting Started

### Accessing the Sales Terminal
1. Navigate to: `http://localhost:3000/sales`
2. Or click "Sales Terminal" in the sidebar (new menu item added)

### First Sale - Step by Step

```
1. Browse products or search by name
2. Click "Add to Cart" on a product
   → Product appears in right sidebar
   → Quantity can be adjusted
3. Add more products as needed
4. Review total in Cart panel
5. Click "Complete Sale" (green button)
   ✓ Order saved to database
   ✓ Success message appears
   ✓ Cart clears automatically
6. Ready for next customer!
```

---

## 📁 Files You Need to Know About

### Core Files Created
```
hooks/
  └── useCart.ts                 # Cart state management (React hook)

components/
  ├── ProductCard.tsx            # Product display in grid
  ├── CartItem.tsx               # Item in cart with qty controls
  ├── CartSummary.tsx            # Cart sidebar & checkout
  ├── POSClient.tsx              # Main sales screen
  └── Sidebar.tsx                # Updated navigation

app/
  └── sales/
      └── page.tsx               # Server-side page (fetches products)

lib/
  └── orders.ts                  # Server order creation & validation
```

### Updated Files
```
components/Sidebar.tsx           # Added /sales link
public/locales/en/common.json    # Added sales translations
public/locales/es/common.json    # Added sales translations (Spanish)
```

---

## 🎯 Key Concepts

### Cart Management
```typescript
// The cart hook handles all cart logic
const cart = useCart();

// Add a product
cart.addItem({ id: '123', name: 'Widget', price: 100, stock: 50 });
// Result: { id: '123', name: 'Widget', price: 100, quantity: 1, stock: 50 }

// Try adding the same product again
cart.addItem({ id: '123', name: 'Widget', price: 100, stock: 50 });
// Result: quantity becomes 2 (no duplicate)

// Update quantity
cart.updateQuantity('123', 3);

// Remove item
cart.removeItem('123');

// Clear all
cart.clearCart();

// Access current state
console.log(cart.items);      // Array of cart items
console.log(cart.total);      // Sum of all subtotals
console.log(cart.itemCount);  // Total number of items
```

### Order Creation
```typescript
// Server-side validation and creation
const result = await createOrder({
  items: [
    { id: '123', name: 'Widget', price: 100, quantity: 2, stock: 50 },
  ],
  total: 200,
  customerId: 'optional-uuid', // Can be undefined for now
});

if (result.success) {
  console.log('Order created:', result.orderId);
} else {
  console.error('Error:', result.error);
}
```

---

## 🔍 Common Tasks

### Task: Verify a Product Shows in Cart
1. Product must have `stock > 0`
2. Click "Add to Cart"
3. Should appear in right sidebar
4. Quantity controls visible below

**Troubleshooting**: 
- Check browser console for errors
- Verify product exists in Supabase products table

### Task: Check Order Was Created
1. Go to Supabase dashboard
2. Navigate to "orders" table
3. You should see new order with:
   - `id`: Unique UUID
   - `total`: The sale amount
   - `status`: "completed"
   - `created_at`: Timestamp

### Task: View Order Items
1. In Supabase, go to "order_items" table
2. Look for rows with matching `order_id`
3. Each item has:
   - `order_id`: Links to order
   - `product_id`: Which product
   - `quantity`: How many
   - `price_snapshot`: Price at time of sale

### Task: Modify Cart Behavior
Edit `/hooks/useCart.ts`:
```typescript
// Example: Set minimum order quantity
const addItem = useCallback((product) => {
  // Only add if quantity >= 3
  if (product.stock < 3) return;
  // ... rest of logic
}, []);
```

### Task: Change Product Grid Columns
Edit `/components/POSClient.tsx`, line ~100:
```typescript
// Current: 2 cols mobile, 3 cols desktop
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

// Change to 4 columns on large screens:
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
```

### Task: Customize Currency/Locale
Edit `/lib/orders.ts` and component files - search for:
```javascript
new Intl.NumberFormat('es-MX', { // Change 'es-MX' to your locale
  style: 'currency',
  currency: 'MXN', // Change to your currency
}).format(value);
```

---

## ✅ TODO Checklist Before Production

### Database Setup
- [ ] Create `orders` table in Supabase
- [ ] Create `order_items` table in Supabase
- [ ] Set up RLS policies for inserts
- [ ] Add foreign keys (order_items → orders, products)

### Testing
- [ ] Test adding 1 product
- [ ] Test adding multiple products
- [ ] Test quantity adjustment (increase/decrease)
- [ ] Test removing item
- [ ] Test clearing cart
- [ ] Test complete sale (check Supabase)
- [ ] Test with out-of-stock products
- [ ] Test search functionality
- [ ] Test on mobile device
- [ ] Test with slow network (DevTools throttle)

### User Training
- [ ] Show cashiers the sales terminal
- [ ] Practice several test transactions
- [ ] Show how to search for products
- [ ] Demonstrate cart quantity adjustments
- [ ] Explain the "Complete Sale" process
- [ ] Show where orders appear in system

### Security
- [ ] Enable RLS on all tables
- [ ] Test that non-authenticated users can't access
- [ ] Verify total validation works
- [ ] Check database for unauthorized access
- [ ] Set up access logs

### Monitoring
- [ ] Set up error logging
- [ ] Monitor order creation success rate
- [ ] Track slow transactions
- [ ] Alert on database errors

---

## 🐛 Troubleshooting Guide

### Problem: Products not showing
**Possible causes**:
1. No products in database
2. Supabase connection error
3. RLS policy blocking queries

**Solution**:
```bash
# In Supabase:
# 1. Go to Data Editor
# 2. Click "products" table
# 3. Add a test product
# 4. Refresh sales page
```

### Problem: "Add to Cart" button disabled
**Possible causes**:
1. Product is out of stock (`stock = 0`)
2. Product has no stock value

**Solution**:
```bash
# In Supabase:
# Update the product:
UPDATE products SET stock = 10 WHERE id = '...';
```

### Problem: Cart total doesn't update
**Possible causes**:
1. Browser cache issue
2. JavaScript error in console

**Solution**:
```bash
# 1. Open DevTools (F12)
# 2. Check Console tab for errors
# 3. Try hard refresh (Ctrl+Shift+R)
# 4. Clear localStorage: 
#    localStorage.clear()
```

### Problem: Order not created
**Possible causes**:
1. `orders` table doesn't exist
2. RLS policy blocks inserts
3. Total mismatch (security check failed)
4. Network error

**Solution**:
```bash
# 1. Check Supabase tables exist
# 2. Check RLS policies allow authenticated requests
# 3. Open DevTools Console
# 4. Check error message
# 5. Verify product prices are correct
```

### Problem: UI looks broken on mobile
**Solution**:
```bash
# 1. Check DevTools responsive mode (Ctrl+Shift+M)
# 2. Test at different breakpoints
# 3. Verify grid classes (grid-cols-2, sm:grid-cols-3)
```

---

## 🔐 Security Considerations

### What's Already Protected
✅ Server-side total validation  
✅ Price snapshot storage  
✅ Type-safe inputs (TypeScript)  

### What You Should Add
- [ ] User authentication on /sales route
- [ ] Permission checks (only staff can access POS)
- [ ] Audit logging of all transactions
- [ ] Row-level security (RLS) on database
- [ ] Rate limiting on order creation

### RLS Policy Example
```sql
-- Allow authenticated users to create orders
CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to see their own orders
CREATE POLICY "Users can view their orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true); -- Adjust as needed
```

---

## 📊 Database Schema Reference

### Products Table
```sql
id          UUID        PRIMARY KEY
name        TEXT        NOT NULL
description TEXT
price       DECIMAL     NOT NULL
stock       INTEGER     NOT NULL
category    TEXT
created_at  TIMESTAMP   DEFAULT now()
```

### Orders Table
```sql
id          UUID        PRIMARY KEY
customer_id UUID        NULLABLE (for future)
total       DECIMAL     NOT NULL
status      TEXT        DEFAULT 'completed'
created_at  TIMESTAMP   DEFAULT now()
```

### Order Items Table
```sql
id              UUID        PRIMARY KEY
order_id        UUID        NOT NULL (FK → orders)
product_id      UUID        NOT NULL (FK → products)
quantity        INTEGER     NOT NULL
price_snapshot  DECIMAL     NOT NULL
```

---

## 🚀 Performance Tips

### For Cashiers
- Search is faster than scrolling (use search!)
- Use +/- buttons for qty instead of backspace
- Complete sale will be instant for small orders

### For Developers
- If > 1000 products, implement virtual scrolling
- Monitor database query times
- Use indexes on frequently searched columns
- Cache product list if static

---

## 📱 Responsive Design

### Mobile View
```
┌─────────────┐
│   Search    │
├─────────────┤
│             │
│   Product   │
│   Grid      │
│  (2 cols)   │
│             │
├─────────────┤
│             │
│ Cart Items  │
│  (if any)   │
│             │
├─────────────┤
│  Complete   │
│   Sale      │
└─────────────┘
```

### Desktop View
```
┌──────────────────────┬──────────┐
│                      │  CART    │
│   PRODUCTS GRID      │ SIDEBAR  │
│     (3 columns)      │ (sticky) │
│                      │          │
│                      │  Total   │
│                      │ Buttons  │
└──────────────────────┴──────────┘
```

---

## 💡 Tips for Power Users

### Keyboard Shortcuts (Future Enhancement)
```
Number keys (1-9): Quick add to cart
ESC:               Clear cart
Enter:             Complete sale
/  :               Focus search
```

### Search Tips
- Search by product name: "apple"
- For category filtering: "electronics"
- Partial match works: "wid" → finds "Widget"

---

## 🆘 Getting Help

### What to Check First
1. Browser console (F12 → Console tab)
2. Network tab (F12 → Network for failed requests)
3. Supabase dashboard (check data exists)
4. Environment variables (.env.local)

### Common Error Messages

| Error | Solution |
|-------|----------|
| "Failed to create order" | Check Supabase RLS policies |
| "Products not loading" | Check Supabase connection |
| "Invalid total amount" | Product prices don't match cart |
| "Network error" | Check internet connection |

---

## 📞 Support Checklist

When asking for help, provide:
- [ ] Error message (exact text)
- [ ] Steps to reproduce
- [ ] Browser & version
- [ ] Whether it's mobile or desktop
- [ ] Supabase table data exists
- [ ] Recent changes to code

---

## Next Steps

1. ✅ **Deploy to Production**
   - Test thoroughly first
   - Set up proper database
   - Configure environment variables

2. 🎯 **Add Features**
   - Customer selection
   - Payment processing
   - Receipt printing
   - Discounts/promotions

3. 📊 **Analytics**
   - Daily sales reports
   - Product popularity
   - Revenue tracking
   - Inventory trending

4. 🔐 **Advanced Security**
   - Multi-user session management
   - Cash drawer tracking
   - Refund/exchange workflow
   - Manager approval for discounts

---

**Your POS system is ready to process real transactions! 🎉**
