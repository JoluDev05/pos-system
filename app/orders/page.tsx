import { supabase } from "@/lib/supabase"
import { OrdersClient } from "@/components/orders/OrdersClient"

export default async function OrdersPage() {
  // Fetch orders first
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, created_at, total, customer_id")
    .order("created_at", { ascending: false })

  if (ordersError) {
    console.error("Error fetching orders:", JSON.stringify(ordersError, null, 2))
    return (
      <div className="ml-64 pt-16 p-6">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading orders</p>
          <p className="text-sm text-slate-600">{ordersError?.message || "Unknown error"}</p>
        </div>
      </div>
    )
  }

  // Fetch customers
  const { data: customers } = await supabase.from("customers").select("id, name")

  const customersMap = new Map(customers?.map((c: any) => [c.id, c.name]) || [])

  // Fetch order items for each order
  const orderIds = (orders || []).map((o: any) => o.id)
  const { data: orderItems } = orderIds.length > 0
    ? await supabase
      .from("order_items")
      .select("order_id, product_id, products(name, category), quantity, price")
      .in("order_id", orderIds)
    : { data: [] }

  const itemsByOrderId = new Map()
    ; (orderItems || []).forEach((item: any) => {
      const orderId = item.order_id
      if (!itemsByOrderId.has(orderId)) {
        itemsByOrderId.set(orderId, [])
      }
      itemsByOrderId.get(orderId).push({
        id: `${item.product_id}`,
        product_name: item.products?.name || "Unknown Product",
        category: item.products?.category || "Uncategorized",
        quantity: item.quantity,
        price: item.price,
      })
    })

  const ordersData = (orders || []).map((order: any) => ({
    id: order.id,
    createdAt: order.created_at,
    customerId: order.customer_id,
    customerName: customersMap.get(order.customer_id) || "Cliente general",
    total: order.total || 0,
    items: itemsByOrderId.get(order.id) || [],
  }))

  return <OrdersClient orders={ordersData} />
}
