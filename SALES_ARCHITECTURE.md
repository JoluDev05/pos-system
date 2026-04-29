# POS Sales Screen - Component Structure & Data Flow

## Component Hierarchy

```
POSClient (Main Container)
│
├── Navbar (existing)
├── Sidebar (updated with /sales link)
│
└── Main Content Area
    │
    ├── Header
    ├── Status Messages
    │
    └── Grid Layout (lg:grid-cols-4)
        │
        ├── Left Section (lg:col-span-3)
        │   ├── Search Input
        │   └── Product Grid
        │       └── ProductCard (×N)
        │           └── Add to Cart Button
        │
        └── Right Section (lg:col-span-1)
            └── Sticky Container
                ├── CartSummary
                │   ├── Item Count Badge
                │   ├── Cart Items List
                │   │   └── CartItem (×N)
                │   │       ├── Quantity Controls
                │   │       └── Remove Button
                │   ├── Subtotal
                │   ├── Large Total Display
                │   └── Buttons
                │       ├── Complete Sale (Primary)
                │       └── Clear Cart (Secondary)
                │
                └── Cart Items Display (Desktop)
                    └── CartItem (×N)
```

## Data Flow Diagram

```
User Action → Component → Hook/Service → Supabase → UI Update
                ↓           ↓               ↓         ↓
          ProductCard   useCart         orders.ts   CartSummary
          "Add to Cart" addItem()       createOrder  (shows total)
                          │
                    Updates state
                          │
                    All components
                    listening to
                    cart state
                    re-render
```

## State Management Pattern

```typescript
// Global State (useCart Hook)
const cart = {
  items: [ { id, name, price, quantity, stock }, ... ],
  total: 12350.00,
  itemCount: 5,
  
  // Methods
  addItem(),
  removeItem(),
  updateQuantity(),
  clearCart(),
};

// Usage in Components:
// 1. ProductCard: calls cart.addItem()
// 2. CartItem: calls cart.updateQuantity() or cart.removeItem()
// 3. CartSummary: reads cart.total and cart.itemCount
// 4. POSClient: coordinates all above
```

## User Interaction Flow

```
┌───────────────────────────────────────────┐
│  CASHIER OPENS SALES TERMINAL (/sales)   │
└────────────┬────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────┐
│  PRODUCTS LOAD FROM SUPABASE              │
│  - Mobile-responsive grid                 │
│  - Search functionality                   │
└────────────┬────────────────────────────┘
             │
             ▼
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
SEARCH    BROWSE PRODUCTS
PRODUCT   Click ADD TO CART
    │                 │
    └────────┬────────┘
             │
             ▼
┌───────────────────────────────────────────┐
│  PRODUCT ADDED TO CART                    │
│  - If new: qty = 1                        │
│  - If exists: qty += 1                    │
│  - Total auto-calculated                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────┐
│  CARTITEM SHOWS IN SIDEBAR                │
│  - Quantity controls visible              │
│  - Subtotal calculated                    │
└────────────┬────────────────────────────┘
             │
        ┌────┴────┐
        │          │
        ▼          ▼
ADJUST QTY   REMOVE ITEM   MORE PRODUCTS?
    │            │              │
    └────┬───────┴──────────────┘
         │
         ▼
┌───────────────────────────────────────────┐
│  REVIEW CART                              │
│  - Total clearly visible                  │
│  - All items listed                       │
└────────────┬────────────────────────────┘
             │
             ▼
╔═══════════════════════════════════════════╗
║  CLICK "COMPLETE SALE"                    ║
╚═════════════┬═════════════════════════════╝
              │
              ▼
┌───────────────────────────────────────────┐
│  FRONTEND: Collects                       │
│  - items[] (id, qty, price)               │
│  - total                                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────┐
│  SERVER: Validates (orders.ts)            │
│  ✓ Cart not empty                         │
│  ✓ Recalculates total from items          │
│  ✓ Totals match (prevent fraud)           │
└────────────┬────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────┐
│  SUPABASE: Creates                        │
│  ✓ orders record (id, total, created_at) │
│  ✓ order_items (id, qty, price_snapshot) │
└────────────┬────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────┐
│  FRONTEND: Shows Success                  │
│  ✓ "Order #XYZ123 completed!"             │
│  ✓ Cart clears automatically              │
│  ✓ Ready for next customer               │
└───────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | State It Manages |
|-----------|---|---|
| **POSClient** | Orchestrator, layout, search, status messages | searchTerm, checkoutStatus |
| **ProductCard** | Display product, trigger add-to-cart | none (stateless) |
| **CartItem** | Show item with qty controls, remove option | none (uses cart hook) |
| **CartSummary** | Display totals, checkout button, clear cart | none (reads cart hook) |
| **useCart** | Cart business logic, state, calculations | items, total, itemCount |
| **orders.ts** | Server-side order creation & validation | none (server function) |

## Key Features by Component

### ProductCard
- ✅ Responsive grid (2 cols mobile, 3 cols desktop)
- ✅ Stock indicator (color-coded)
- ✅ Out-of-stock state (disabled button)
- ✅ Price display (large, visible)
- ✅ Description truncated
- ✅ Hover effects

### CartItem
- ✅ Compact layout (tight spacing)
- ✅ Inline quantity controls
- ✅ Delete button
- ✅ Subtotal calculation
- ✅ Hover effects

### CartSummary
- ✅ Sticky positioning (desktop)
- ✅ Clear total display (large, bold)
- ✅ Item count badge
- ✅ Empty cart state
- ✅ Disabled Complete Sale when empty
- ✅ Color-coded buttons

### useCart Hook
- ✅ Add with duplicate prevention
- ✅ Remove item
- ✅ Update quantity with stock boundaries
- ✅ Auto-remove 0-quantity items
- ✅ Memoized total calculation
- ✅ TypeScript types

### orders.ts Service
- ✅ Server-side total validation
- ✅ Prevents frontend manipulation
- ✅ Price snapshot storage
- ✅ Atomic order + items creation
- ✅ Error handling with messages

## Performance Considerations

### Optimizations Implemented
- ✅ `useMemo` for product filtering
- ✅ `useMemo` for total calculation
- ✅ Sticky cart only re-renders on cart changes
- ✅ Proper React keys on grid items
- ✅ Minimal re-renders with custom hooks

### Potential Future Optimizations
- Virtualization for very large product lists (1000+)
- Image lazy-loading for products
- Service worker for offline capability
- IndexedDB for in-browser cart persistence

## Security Measures

### Implemented
- ✅ Server-side total validation (prevent price tampering)
- ✅ Price snapshot (immutable record)
- ✅ Supabase RLS policies (row-level security)
- ✅ TypeScript type safety

### Recommended for Production
- User authentication on /sales route
- Audit logging of all orders
- Transaction logging
- Receipt printing verification
- Cash drawer reconciliation

## Accessibility Features

### Implemented
- ✅ Semantic HTML buttons
- ✅ Large targets (buttons, touch areas)
- ✅ Color + icon indicators (not color alone)
- ✅ Keyboard navigation (native buttons)
- ✅ ARIA labels on icon buttons

### Recommended
- Keyboard shortcuts for fast cashiers (ESC, Enter, etc.)
- Screen reader testing
- High contrast mode support
- Voice command integration (future)

## Mobile Responsiveness

### Breakpoints
- **Mobile** (< 1024px): Full-width, products stack, cart below
- **Tablet** (1024-1280px): 2-column layout, smaller sidebar
- **Desktop** (1280px+): Full 3-column layout, sticky sidebar

### Touch Optimization
- ✅ Large buttons (lg size)
- ✅ Adequate padding/spacing
- ✅ Thumb-friendly controls
- ✅ No hover-dependent features

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Error Scenarios Handled

```typescript
// 1. Empty cart checkout attempt
if (cart.isEmpty) return; // Button disabled

// 2. Server total mismatch
if (Math.abs(calculated - received) > 0.01) {
  return { error: 'Invalid total amount' };
}

// 3. Database error
if (orderError) {
  return { error: 'Failed to create order' };
}

// 4. Network timeout
// Caught in try-catch, shows error message
```

---

## Quick Reference: Adding a New Feature

### Example: Add Customer Selection

```typescript
// 1. Update POSClient props
interface POSClientProps {
  products: Product[];
  customers: Customer[]; // NEW
}

// 2. Add state
const [selectedCustomer, setSelectedCustomer] = useState<string>('');

// 3. Add component
<CustomerSelect 
  customers={customers} 
  value={selectedCustomer}
  onChange={setSelectedCustomer}
/>

// 4. Pass to createOrder
createOrder({
  items: cart.items,
  total: cart.total,
  customerId: selectedCustomer, // NEW
})
```

This architecture makes it easy to add features without refactoring core components!
