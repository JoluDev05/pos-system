import * as XLSX from 'xlsx';

export function exportToExcel<T>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns based on content
  const colWidths: number[] = [];
  if (data.length > 0) {
    const keys = Object.keys(data[0] as Record<string, unknown>);
    keys.forEach((key) => {
      let maxLength = key.length;
      data.forEach((row) => {
        const cellValue = (row as Record<string, unknown>)[key];
        const cellString = String(cellValue || '');
        maxLength = Math.max(maxLength, cellString.length);
      });
      colWidths.push(maxLength + 2);
    });
  }
  worksheet['!cols'] = colWidths.map((width) => ({ wch: Math.min(width, 50) }));

  // Generate timestamp for filename
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, finalFilename);
}

export function exportCustomersToExcel(
  customers: Array<{
    id: string;
    name: string;
    phone: string;
    created_at?: string;
  }>
) {
  const exportData = customers.map((customer) => ({
    Nombre: customer.name,
    Teléfono: customer.phone,
    'Se unió': customer.created_at
      ? new Date(customer.created_at).toLocaleDateString('es-MX')
      : '-',
    ID: customer.id,
  }));

  exportToExcel(exportData, 'Clientes', 'Clientes');
}

export function exportProductsToExcel(
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category?: string;
    created_at?: string;
  }>
) {
  const exportData = products.map((product) => ({
    Nombre: product.name,
    Descripción: product.description,
    Categoría: product.category || '-',
    Precio: `$${product.price.toFixed(2)}`,
    Stock: product.stock,
    'Fecha de creación': product.created_at
      ? new Date(product.created_at).toLocaleDateString('es-MX')
      : '-',
    ID: product.id,
  }));

  exportToExcel(exportData, 'Productos', 'Productos');
}
