'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, User, Users } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface CustomerSelectorProps {
  onCustomerSelect: (customerId: string | null) => void;
  selectedCustomerId: string | null;
  selectedCustomerName?: string;
}

export function CustomerSelector({ onCustomerSelect, selectedCustomerId, selectedCustomerName }: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      setCurrentPage(1);
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error loading customers:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return;
      }

      console.log('✅ Customers loaded:', data);
      setCustomers(data || []);
    } catch (error) {
      console.error('❌ Unexpected error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGeneral = () => {
    onCustomerSelect(null);
    setIsOpen(false);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSelectCustomer = (customerId: string) => {
    onCustomerSelect(customerId);
    setIsOpen(false);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-grow">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-900 opacity-75">Customer</p>
                <p className="text-sm font-bold text-blue-900">
                  {selectedCustomerName || 'General Sale'}
                </p>
              </div>
            </div>
            <Search className="w-5 h-5 text-blue-600" />
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 border-b border-slate-200">
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Select Customer
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* General Sale Button */}
          <Button
            onClick={handleSelectGeneral}
            className={`w-full h-12 justify-start gap-3 text-base font-semibold transition-all ${
              !selectedCustomerId
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Users className="w-5 h-5" />
            General Sale (No customer)
          </Button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <Input
              placeholder="🔍 Search by name or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-11 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Customers List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-slate-600 py-4">Loading customers...</p>
            ) : customers.length === 0 ? (
              <p className="text-center text-slate-600 py-4">
                No customers available
              </p>
            ) : filteredCustomers.length === 0 ? (
              <p className="text-center text-slate-600 py-4">
                No customers found for "{searchTerm}"
              </p>
            ) : (
              pagedCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                    selectedCustomerId === customer.id
                      ? 'bg-blue-50 border-blue-400 border-2'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <p className="font-semibold text-slate-900">{customer.name}</p>
                      {customer.phone && (
                        <p className="text-xs text-slate-600">📱 {customer.phone}</p>
                      )}
                    </div>
                    {selectedCustomerId === customer.id && (
                      <div className="ml-2 p-1 bg-blue-600 text-white rounded-full">
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {!isLoading && filteredCustomers.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                className="h-9"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1}
              >
                Previous
              </Button>
              <p className="text-xs text-slate-600">
                Page {safePage} of {totalPages}
              </p>
              <Button
                variant="outline"
                className="h-9"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Close Button */}
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="w-full h-10 border-2"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
