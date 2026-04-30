'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { AddCustomerDialog } from '@/components/customers/AddCustomerDialog';
import { EditCustomerDialog } from '@/components/customers/EditCustomerDialog';
import { DeleteCustomerButton } from '@/components/customers/DeleteCustomerButton';
import { useI18n } from '@/lib/i18n';
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

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.toLowerCase().includes(searchLower)
      );
    });
  }, [customers, searchTerm]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            {t('customers.addCustomer')}
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder={t('customers.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200"
            />
          </div>
        </div>

        {/* Customers Table */}
        <Card className="overflow-hidden">
          {filteredCustomers.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">{t('customers.customerTable.name')}</TableHead>
                    <TableHead>{t('customers.customerTable.phone')}</TableHead>
                    <TableHead className="w-[120px]">{t('customers.customerTable.joined')}</TableHead>
                    <TableHead className="w-[80px]">{t('customers.customerTable.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
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
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-600 mb-2">{t('customers.noCustomers')}</p>
              <p className="text-sm text-slate-500">
                {t('common.search')}
              </p>
            </div>
          )}
        </Card>

        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-600">
          {t('common.search')}: {filteredCustomers.length} {t('common.search')} {customers.length} {t('navigation.customers')}
        </div>
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
