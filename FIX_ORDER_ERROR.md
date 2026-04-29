# 🔧 ARREGLAR ERROR: "Failed to create order"

## Problema
El botón "Complete Sale" muestra error porque las tablas `orders` y `order_items` no existen en Supabase o tienen problemas de permisos (RLS).

## Solución - 3 Pasos Simples

### ✅ Paso 1: Abre Supabase Console

1. Ve a https://supabase.com
2. Entra a tu proyecto
3. Click en **"SQL Editor"** (icono < > en la izquierda)
4. Click en **"New Query"**

### ✅ Paso 2: Ejecuta el SQL

Abre el archivo `SUPABASE_SETUP.sql` en este proyecto y copia TODO el contenido.

Luego en Supabase:
1. Pega el contenido en el editor SQL
2. Click en **"Run"** (botón verde arriba a la derecha)
3. Espera a que termine (debe tomar < 5 segundos)

**Output esperado**:
```
✓ CREATE TABLE orders
✓ CREATE TABLE order_items
✓ CREATE INDEX
✓ ALTER TABLE
✓ CREATE POLICY
```

### ✅ Paso 3: Verifica en tu App

1. Ve a `localhost:3000/sales`
2. Haz click en "Add to Cart" en un producto
3. Haz click en "Complete Sale" (botón verde)
4. Deberías ver: ✅ "Order #xyz123 completed!"

---

## 🧪 Si aún no funciona...

### Opción A: Verificar tablas existen
En Supabase, ve a **"Table Editor"** (icono de tabla a la izquierda):

- [ ] ¿Ves tabla `orders`?
- [ ] ¿Ves tabla `order_items`?

Si no existen, vuelve a Paso 2 y ejecuta el SQL.

### Opción B: Revisar el error exacto
1. Abre tu navegador: **F12** (DevTools)
2. Ve a tab **"Console"**
3. Haz click en "Complete Sale" nuevamente
4. Busca mensajes rojos
5. Copia el error exacto

**Errores comunes y soluciones**:

| Error | Causa | Solución |
|-------|-------|----------|
| `relation "orders" does not exist` | Tabla no creada | Ejecuta SQL de Setup |
| `permission denied` | RLS bloqueando | Ejecuta políticas del SQL |
| `foreign key violation` | product_id no existe | Verifica que existan productos |
| `Invalid total amount` | Precios no coinciden | Recarga la página |

### Opción C: Ejecutar SQL mini (2 tablas básicas)

Si el SQL completo da error, intenta esto línea por línea:

```sql
-- Tabla 1: Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla 2: Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas
CREATE POLICY "allow_all_orders" ON orders FOR ALL USING (true);
CREATE POLICY "allow_all_items" ON order_items FOR ALL USING (true);
```

---

## ✅ Checklist Final

Una vez que funcione "Complete Sale":

- [ ] ¿Ves el mensaje verde "Order completed"?
- [ ] ¿El carrito se limpia automáticamente?
- [ ] ¿Puedo hacer otra venta?
- [ ] ¿Aparecen órdenes en Supabase table editor?

Si todo está ✅, **¡la terminal de ventas funciona perfectamente!**

---

## 🚀 Próximo Paso: Optimizaciones

Ahora que funciona, podemos agregar:
- [ ] Keyboard shortcuts (ESC = limpiar, Enter = vender)
- [ ] Descuentos/promociones
- [ ] Generar recibos
- [ ] Historial de ventas
- [ ] Integrar pagos con tarjeta

¿Cuál te interesa primero?

---

## 💡 Notas Técnicas

**¿Por qué falló?**
- Las tablas `orders` y `order_items` necesitan existir
- Los permisos RLS deben permitir inserts
- Los datos deben validarse en server-side

**¿Qué hicimos?**
- Creamos estructura SQL correcta
- Configuramos Row Level Security
- Creamos índices para performance
- Agregamos constraints para integridad

**¿Es seguro para producción?**
- Parcialmente. Las políticas RLS están muy permisivas
- Para producción, restringe a usuarios autenticados
- Implementa auditoría de transacciones
- Valida montos en backend

---

**¿Todavía no funciona? Abre DevTools (F12) → Console y cópiame el error exacto. 🔍**
