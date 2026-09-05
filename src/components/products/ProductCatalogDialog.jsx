import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProductCatalogForm from '@/components/products/ProductCatalogForm';

export default function ProductCatalogDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const handleCreated = (product) => {
    onCreated(product);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-ceu-navy px-6 text-ceu-cloud hover:bg-ceu-navy/90">
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-ceu-navy">Cadastrar produto</DialogTitle>
          <DialogDescription>Preencha os dados básicos. O produto ficará pendente até receber a foto real no catálogo.</DialogDescription>
        </DialogHeader>
        <ProductCatalogForm onCreated={handleCreated} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}