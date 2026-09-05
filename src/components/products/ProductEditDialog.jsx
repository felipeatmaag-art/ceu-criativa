import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductEditForm from '@/components/products/ProductEditForm';

export default function ProductEditDialog({ product, open, onOpenChange, onUpdated }) {
  const handleUpdated = (updated) => {
    onUpdated(updated);
    onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
      <DialogHeader>
        <DialogTitle className="text-2xl text-ceu-navy">Editar produto</DialogTitle>
        <DialogDescription>Atualize preço, tipo e todas as informações do catálogo.</DialogDescription>
      </DialogHeader>
      {open && <ProductEditForm product={product} onUpdated={handleUpdated} onCancel={() => onOpenChange(false)} />}
    </DialogContent>
  </Dialog>;
}