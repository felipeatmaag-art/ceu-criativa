import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import TshirtMockup from '@/components/create/TshirtMockup';
import MugMockup from '@/components/create/MugMockup';
import FrameMockup from '@/components/create/FrameMockup';

export default function MockupViewer({ designImage, selectedProduct, selectedColor }) {
  const [viewAngle, setViewAngle] = useState('front');

  const mockupComponents = {
    camiseta: TshirtMockup,
    caneca: MugMockup,
    quadro: FrameMockup,
  };

  const MockupComponent = mockupComponents[selectedProduct] || TshirtMockup;

  const angles = selectedProduct === 'camiseta' 
    ? [
        { value: 'front', label: 'Frontal' },
        { value: 'angled', label: '3/4' },
      ]
    : selectedProduct === 'caneca'
    ? [
        { value: 'front', label: 'Frontal' },
        { value: 'angled', label: '3/4' },
      ]
    : [
        { value: 'front', label: 'Frontal' },
        { value: 'angled', label: '3/4' },
      ];

  return (
    <div className="space-y-4">
      {/* Angle Selector */}
      <div className="flex gap-2">
        {angles.map((angle) => (
          <Button
            key={angle.value}
            variant={viewAngle === angle.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewAngle(angle.value)}
            className={`rounded-xl ${
              viewAngle === angle.value 
                ? 'ceu-gradient text-white' 
                : ''
            }`}
          >
            {angle.label}
          </Button>
        ))}
      </div>

      {/* Mockup Display */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-stone-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedProduct}-${viewAngle}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <MockupComponent 
              designImage={designImage} 
              color={selectedColor}
              angle={viewAngle}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}