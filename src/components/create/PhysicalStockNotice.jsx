import { useQuery } from '@tanstack/react-query';
import inventoryRepository from '@/services/products/inventoryRepository';
export default function PhysicalStockNotice({ productId, color, size }) {
  const { data = [], isLoading, error } = useQuery({ queryKey: ['inventory', productId], queryFn: () => inventoryRepository.list(productId), enabled: !!productId });
  const variant = data.find(v => v.color === color && v.size === size && v.is_active);
  return <p className="mt-3 text-sm text-muted-foreground">{!productId ? 'Modelo demonstrativo: escolha um produto base cadastrado para comprar.' : !size ? 'Selecione um tamanho para consultar o estoque físico.' : isLoading ? 'Consultando estoque físico...' : error ? 'Não foi possível consultar o estoque.' : variant?.stock_quantity > 0 ? `${variant.stock_quantity} insumos físicos disponíveis nessa cor e tamanho. Arte ilimitada.` : 'Sem estoque físico nessa cor e tamanho. Você ainda pode criar e publicar sua arte.'}</p>;
}