'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Users, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { AddCustomerDialog } from '@/components/customers/AddCustomerDialog';
import { EditCustomerDialog } from '@/components/customers/EditCustomerDialog';
import { DeleteCustomerButton } from '@/components/customers/DeleteCustomerButton';
import { useI18n } from '@/lib/i18n';
import { exportCustomersToExcel } from '@/lib/exportExcel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Customer {
  id: string;
  name: string;
  phone: string;
  created_at?: string;
}

interface CustomersClientProps {
  customers: Customer[];
}

export function CustomersClient({ customers }: CustomersClientProps) {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.toLowerCase().includes(searchLower)
      );
    });
  }, [customers, searchTerm]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleExportExcel = () => {
    exportCustomersToExcel(filteredCustomers);
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
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('customers.title')}</h2>
            <p className="text-slate-600 mt-1">{t('customers.subtitle')}</p>
          </div>
        </div>

        {/* Search + Summary */}
        <Card className="mb-6 shadow-sm ring-1 ring-slate-900/5">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Busqueda</CardTitle>
                <CardDescription>Encuentra clientes rapidamente.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Visibles: {filteredCustomers.length}</Badge>
                <Badge variant="outline">Total: {customers.length}</Badge>
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={filteredCustomers.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Descargar Excel
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  {t('customers.addCustomer')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={t('customers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 pl-10 border-slate-200 bg-white shadow-sm focus-visible:ring-blue-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="overflow-hidden shadow-sm ring-1 ring-slate-900/5">
          {filteredCustomers.length > 0 ? (
            <>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-[200px] text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t('customers.customerTable.name')}
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t('customers.customerTable.phone')}
                      </TableHead>
                      <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t('customers.customerTable.joined')}
                      </TableHead>
                      <TableHead className="w-[90px] text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t('customers.customerTable.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-slate-50/80">
                        <TableCell className="font-medium text-slate-900">
                          {customer.name}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {customer.phone}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {formatDate(customer.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingCustomer(customer);
                                setIsEditDialogOpen(true);
                              }}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-blue-600"
                              title={t('common.edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <DeleteCustomerButton
                              customerId={customer.id}
                              customerName={customer.name}
                            />
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
                  Página {currentPage} de {totalPages} • Mostrando {paginatedCustomers.length} de {filteredCustomers.length} clientes
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
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium">{t('customers.noCustomers')}</p>
              <p className="text-sm text-slate-500 mt-1">
                Ajusta la busqueda o agrega un nuevo cliente.
              </p>
            </div>
          )}
          <CardFooter className="justify-between text-sm text-slate-600">
            <span>
              Mostrando {filteredCustomers.length} de {customers.length} clientes
            </span>
            <span className="text-slate-400">Actualizado al momento</span>
          </CardFooter>
        </Card>
      </main>

      {/* Add Customer Dialog */}
      <AddCustomerDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        customer={editingCustomer}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
