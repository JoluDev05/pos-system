'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { AddProductDialog } from '@/components/products/AddProductDialog';
import { EditProductDialog } from '@/components/products/EditProductDialog';
import { DeleteProductButton } from '@/components/products/DeleteProductButton';
import { useI18n } from '@/lib/i18n';
import { exportProductsToExcel } from '@/lib/exportExcel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  created_at?: string;
}

interface ProductsClientProps {
  products: Product[];
}

export function ProductsClient({ products }: ProductsClientProps) {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const filters = [
    { id: 'all', label: t('products.filters.all') },
    { id: 'electronics', label: t('products.filters.electronics') },
    { id: 'home', label: t('products.filters.home') },
    { id: 'health', label: t('products.filters.health') },
    { id: 'in-stock', label: t('products.filters.inStock') },
    { id: 'out-stock', label: t('products.filters.outOfStock') },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'in-stock') return product.stock > 0;
      if (selectedFilter === 'out-stock') return product.stock === 0;
      if (selectedFilter === product.category?.toLowerCase()) return true;

      return false;
    });
  }, [products, searchTerm, selectedFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const handleExportExcel = () => {
    exportProductsToExcel(filteredProducts);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Navbar />

      <main className="pt-16 p-4 sm:p-6 lg:ml-64">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('products.title')}</h2>
            <p className="text-slate-600 mt-1">{t('products.subtitle')}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 shadow-sm ring-1 ring-slate-900/5">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Busqueda</CardTitle>
                <CardDescription>Encuentra productos rapidamente.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Visibles: {filteredProducts.length}</Badge>
                <Badge variant="outline">Total: {products.length}</Badge>
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={filteredProducts.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Descargar Excel
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  {t('products.addProduct')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={t('products.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 pl-10 border-slate-200 bg-white shadow-sm focus-visible:ring-blue-200"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="overflow-hidden shadow-sm ring-1 ring-slate-900/5">
          {filteredProducts.length > 0 ? (
            <>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[720px]">
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-[200px] text-xs font-semibold uppercase tracking-wide text-slate-500">{t('products.productTable.name')}</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('products.productTable.description')}</TableHead>
                      <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wide text-slate-500">{t('products.productTable.price')}</TableHead>
                      <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wide text-slate-500">{t('products.productTable.stock')}</TableHead>
                      <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wide text-slate-500">{t('products.productTable.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-slate-50/80">
                        <TableCell className="font-medium text-slate-900">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {product.description}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                product.stock > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {product.stock}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsEditDialogOpen(true);
                              }}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-blue-600"
                              title={t('common.edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <DeleteProductButton productId={product.id} productName={product.name} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                <div className="text-sm text-slate-600">
                  Página {currentPage} de {totalPages} • Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-600 mb-2">{t('products.noProducts')}</p>
              <p className="text-sm text-slate-500">
                {t('common.search')}
              </p>
            </div>
          )}
        </Card>

        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-600">
          {t('common.search')}: {filteredProducts.length} {t('common.search')} {products.length} {t('navigation.products')}
        </div>
      </main>

      {/* Add Product Dialog */}
      <AddProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* Edit Product Dialog */}
      <EditProductDialog 
        product={editingProduct} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
    </div>
  );
}
