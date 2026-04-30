import { supabase } from "@/lib/supabase"
import { ProductsClient } from "@/components/products/ProductsClient"

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return (
      <div className="ml-64 pt-16 p-6">
        <div className="text-center">
          <p className="text-red-600">Error al cargar productos</p>
        </div>
      </div>
    )
  }

  const productsData = (products || []).map((product: any) => ({
    id: product.id,
    name: product.name || "Producto sin nombre",
    description: product.description || "Sin descripcion",
    price: product.price || 0,
    stock: product.stock || 0,
    category: product.category,
    created_at: product.created_at,
  }))

  return <ProductsClient products={productsData} />
}