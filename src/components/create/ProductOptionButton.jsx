import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';

export default function ProductOptionButton({ option, productType, onAdd }) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`h-auto py-4 rounded-xl transition-all ${
        added ? 'bg-green-50 border-green-500' : ''
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="font-medium">{option}</span>
        {added ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Plus className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </Button>
  );
}