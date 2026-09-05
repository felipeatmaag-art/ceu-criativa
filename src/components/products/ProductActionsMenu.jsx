import React, { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import productRepository from '@/services/products/productRepository';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ProductEditDialog from '@/components/products/ProductEditDialog';

export default function ProductActionsMenu({ product, onUpdated, onDeleted }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    await productRepository.delete(product.id);
    onDeleted(product.id);
    setDeleting(false);
    setConfirmOpen(false);
  };

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon" aria-label={`Ações de ${product.name}`} className="h-8 w-8 shrink-0 rounded-full"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer"><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setConfirmOpen(true)} className="cursor-pointer text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <ProductEditDialog product={product} open={editOpen} onOpenChange={setEditOpen} onUpdated={onUpdated} />
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Excluir {product.name}?</AlertDialogTitle><AlertDialogDescription>O produto será removido do catálogo e esta ação não poderá ser desfeita.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel><AlertDialogAction disabled={deleting} onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleting ? 'Excluindo...' : 'Excluir produto'}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}