import { supabase } from "@/lib/supabase"
import { POSClient } from "@/components/POSClient"

export const metadata = {
  title: "Sales Terminal - POS System",
  description: "Point of Sale terminal for processing transactions",
}

export default async function SalesPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching products:", error)
    return (
      <div className="ml-64 pt-16 p-6">
        <div className="text-center py-12">
          <p className="text-red-600 font-medium">Error loading products</p>
          <p className="text-slate-600 text-sm mt-2">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  const productsData = (products || []).map((product: any) => ({
    id: product.id,
    name: product.name || "Unnamed Product",
    description: product.description || "",
    price: product.price || 0,
    stock: product.stock || 0,
    category: product.category,
  }))

  return <POSClient products={productsData} />
}
