import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ApprovedMockupGallery from './ApprovedMockupGallery';
import MockupViewer3D from './MockupViewer3D';
import TshirtMockup from '@/components/create/TshirtMockup';
import MugMockup from '@/components/create/MugMockup';
import FrameMockup from '@/components/create/FrameMockup';
import HoodieMockup from '@/components/create/HoodieMockup';
import TravelMugMockup from '@/components/create/TravelMugMockup';
import MousepadMockup from '@/components/create/MousepadMockup';
import EcobagMockup from '@/components/create/EcobagMockup';

export default function MockupViewer({
  designImage,
  selectedProduct = 'camiseta',
  selectedColor = 'white',
  production,
  design
}) {
  const [viewMode, setViewMode] = useState('2d');
  const [viewAngle, setViewAngle] = useState('front');

  // Se o design já possui mockups reais de produção/estúdio aprovados, usa a galeria oficial aprovada
  if (production?.mockup_front_url || production?.mockup_human_url) {
    return <ApprovedMockupGallery production={production} design={design} />;
  }

  const angles = [
    { value: 'front', label: 'Frontal' },
    { value: 'angled', label: '3/4' },
    { value: 'flat', label: 'Plana' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === '2d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('2d')}
            className={viewMode === '2d' ? 'bg-slate-900 text-white' : ''}
          >
            2D
          </Button>
          <Button
            variant={viewMode === '3d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('3d')}
            className={viewMode === '3d' ? 'bg-slate-900 text-white' : ''}
          >
            3D Interativo
          </Button>
        </div>

        {viewMode === '2d' && (
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {angles.map((angle) => (
              <button
                key={angle.value}
                onClick={() => setViewAngle(angle.value)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  viewAngle === angle.value
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {angle.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
        <AnimatePresence mode="wait">
          {viewMode === '3d' ? (
            <MockupViewer3D
              productType={selectedProduct}
              designImage={designImage}
              productColor={selectedColor}
            />
          ) : (
            <motion.div
              key={`${selectedProduct}-${viewAngle}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              {selectedProduct === 'camiseta' && (
                <TshirtMockup designImage={designImage} color={selectedColor} angle={viewAngle} />
              )}
              {selectedProduct === 'caneca' && (
                <MugMockup designImage={designImage} angle={viewAngle} />
              )}
              {selectedProduct === 'quadro' && (
                <FrameMockup designImage={designImage} angle={viewAngle} />
              )}
              {selectedProduct === 'moletom' && (
                <HoodieMockup designImage={designImage} color={selectedColor} angle={viewAngle} />
              )}
              {selectedProduct === 'caneca_termica' && (
                <TravelMugMockup designImage={designImage} angle={viewAngle} />
              )}
              {selectedProduct === 'mousepad' && (
                <MousepadMockup designImage={designImage} angle={viewAngle} />
              )}
              {selectedProduct === 'ecobag' && (
                <EcobagMockup designImage={designImage} angle={viewAngle} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
