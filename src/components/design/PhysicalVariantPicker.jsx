import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import productRepository from '@/services/products/productRepository';
import inventoryRepository from '@/services/products/inventoryRepository';

export default function PhysicalVariantPicker({ onChange }) {
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: productRepository.listCatalog,
  });

  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  const currentProduct = useMemo(() => {
    if (selectedProductId) {
      const found = products.find(p => p.id === selectedProductId);
      if (found) return found;
    }
    return products[0] || null;
  }, [products, selectedProductId]);

  const { data: variants = [], isLoading: loadingVariants } = useQuery({
    queryKey: ['inventory', currentProduct?.id],
    queryFn: () => (currentProduct?.id ? inventoryRepository.list(currentProduct.id) : []),
    enabled: Boolean(currentProduct?.id),
  });

  const activeVariants = useMemo(() => {
    return variants.filter(v => v.is_active && v.stock_quantity > 0);
  }, [variants]);

  const availableColors = useMemo(() => {
    const list = [...new Set(activeVariants.map(v => v.color).filter(Boolean))];
    if (list.length === 0 && currentProduct?.colors_available?.length) {
      return currentProduct.colors_available;
    }
    return list;
  }, [activeVariants, currentProduct]);

  const availableSizes = useMemo(() => {
    const filtered = activeVariants.filter(v => !selectedColor || v.color === selectedColor);
    const list = [...new Set(filtered.map(v => v.size).filter(Boolean))];
    if (list.length === 0 && currentProduct?.sizes_available?.length) {
      return currentProduct.sizes_available;
    }
    return list;
  }, [activeVariants, selectedColor, currentProduct]);

  useEffect(() => {
    if (availableColors.length > 0 && (!selectedColor || !availableColors.includes(selectedColor))) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  useEffect(() => {
    if (availableSizes.length > 0 && (!selectedSize || !availableSizes.includes(selectedSize))) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    if (!currentProduct) {
      onChange?.(null);
      return;
    }
    const matchingVariant = activeVariants.find(
      v => (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize)
    );
    if (matchingVariant) {
      onChange?.({ product: currentProduct, variant: matchingVariant });
    } else if (activeVariants.length > 0) {
      onChange?.({ product: currentProduct, variant: activeVariants[0] });
    } else {
      onChange?.({
        product: currentProduct,
        variant: {
          id: `virtual-${currentProduct.id}`,
          color: selectedColor || currentProduct.colors_available?.[0] || 'BRANCA',
          size: selectedSize || currentProduct.sizes_available?.[0] || 'Único',
          stock_quantity: 99,
        },
      });
    }
  }, [currentProduct, selectedColor, selectedSize, activeVariants, onChange]);

  if (loadingProducts) {
    return <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">Produto Base</label>
        <div className="flex flex-wrap gap-2">
          {products.map(p => {
            const isSelected = currentProduct?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedProductId(p.id);
                  setSelectedColor('');
                  setSelectedSize('');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {availableColors.length > 0 && (
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-2">Cor: {selectedColor}</label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(color => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {availableSizes.length > 0 && (
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-2">Tamanho</label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(size => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
