'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface DeleteOrderButtonProps {
  orderId: string;
  customerName?: string;
}

export function DeleteOrderButton({ orderId, customerName }: DeleteOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) {
        if (orderError.code === '23503') {
          const { error: itemsError } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', orderId);

          if (itemsError) throw itemsError;

          const { error: retryOrderError } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

          if (retryOrderError) throw retryOrderError;
        } else {
          throw orderError;
        }
      }

      setShowConfirm(false);
      router.refresh();
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('No se pudo eliminar la orden. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
        title="Eliminar orden"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar orden</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-slate-600">
              ¿Seguro que quieres eliminar la orden de{' '}
              <span className="font-semibold">{customerName || 'este cliente'}</span>?
            </p>
            <p className="text-sm text-slate-500">Esta accion no se puede deshacer.</p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
