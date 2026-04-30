import { supabase } from "@/lib/supabase"
import { CustomersClient } from "@/components/customers/CustomersClient"

export default async function CustomersPage() {
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching customers:", error)
    return (
      <div className="ml-64 pt-16 p-6">
        <div className="text-center">
          <p className="text-red-600">Error al cargar clientes</p>
        </div>
      </div>
    )
  }

  const customersData = (customers || []).map((customer: any) => ({
    id: customer.id,
    name: customer.name || "Cliente sin nombre",
    phone: customer.phone || "Sin telefono",
    created_at: customer.created_at,
  }))

  return <CustomersClient customers={customersData} />
}
