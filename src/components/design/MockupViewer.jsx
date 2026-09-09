import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import TshirtMockup from '@/components/create/TshirtMockup';
import MugMockup from '@/components/create/MugMockup';
import FrameMockup from '@/components/create/FrameMockup';
import HoodieMockup from '@/components/create/HoodieMockup';
import TravelMugMockup from '@/components/create/TravelMugMockup';
import MousepadMockup from '@/components/create/MousepadMockup';
import TshirtInUseMockup from '@/components/create/TshirtInUseMockup';
import MugInHandMockup from '@/components/create/MugInHandMockup';
import MockupViewer3D from '@/components/design/MockupViewer3D';
import ApprovedMockupGallery from '@/components/design/ApprovedMockupGallery';

export default function MockupViewer({ designImage, selectedProduct, selectedColor, production }) {
  const [viewAngle, setViewAngle] = useState('front');
  const [view3D, setView3D] = useState(false);

  const supports3D = ['camiseta', 'moletom', 'caneca', 'caneca_termica'].includes(selectedProduct);

  const mockupComponents = {
    camiseta: TshirtMockup,
    moletom: HoodieMockup,
    caneca: MugMockup,
    caneca_termica: TravelMugMockup,
    quadro: FrameMockup,
    mousepad: MousepadMockup,
  };

  const MockupComponent = mockupComponents[selectedProduct] || TshirtMockup;

  const getAnglesForProduct = () => {
    switch(selectedProduct) {
      case 'camiseta':
      case 'moletom':
        return [
          { value: 'front', label: 'Frontal' },
          { value: 'angled', label: '3/4' },
          { value: 'inuse', label: 'Em Uso' },
        ];
      case 'caneca':
      case 'caneca_termica':
        return [
          { value: 'front', label: 'Frontal' },
          { value: 'angled', label: '3/4' },
          { value: 'inhand', label: 'Na Mão' },
        ];
      case 'quadro':
        return [
          { value: 'front', label: 'Frontal' },
          { value: 'angled', label: 'Perspectiva' },
        ];
      case 'mousepad':
        return [
          { value: 'front', label: 'Vista Superior' },
          { value: 'angled', label: 'Ângulo 3D' },
        ];
      default:
        return [
          { value: 'front', label: 'Frontal' },
          { value: 'angled', label: '3/4' },
        ];
    }
  };

  const angles = getAnglesForProduct();
  if (production?.mockup_front_url) return <ApprovedMockupGallery production={production} />;

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex gap-2">
        {supports3D && (
          <Button
            variant={view3D ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView3D(true)}
            className={`rounded-xl ${view3D ? 'ceu-gradient text-white' : ''}`}
          >
            3D Interativo
          </Button>
        )}
        {!view3D && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView3D(false)}
            className="rounded-xl"
          >
            2D
          </Button>
        )}
      </div>

      {/* Angle Selector (2D only) */}
      {!view3D && (
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
      )}

      {/* Mockup Display */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-stone-100">
        {view3D && supports3D ? (
          <MockupViewer3D
            productType={selectedProduct}
            designImage={designImage}
            productColor={selectedColor}
          />
        ) : (
          <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedProduct}-${viewAngle}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {/* Renderizar mockup baseado no produto e ângulo */}
            {selectedProduct === 'camiseta' && viewAngle === 'inuse' && (
              <TshirtInUseMockup designImage={designImage} color={selectedColor} />
            )}
            {selectedProduct === 'camiseta' && viewAngle !== 'inuse' && (
              <TshirtMockup designImage={designImage} color={selectedColor} angle={viewAngle} />
            )}
            
            {selectedProduct === 'moletom' && viewAngle === 'inuse' && (
              <TshirtInUseMockup designImage={designImage} color={selectedColor} />
            )}
            {selectedProduct === 'moletom' && viewAngle !== 'inuse' && (
              <HoodieMockup designImage={designImage} color={selectedColor} angle={viewAngle} />
            )}
            
            {selectedProduct === 'caneca' && viewAngle === 'inhand' && (
              <MugInHandMockup designImage={designImage} />
            )}
            {selectedProduct === 'caneca' && viewAngle !== 'inhand' && (
              <MugMockup designImage={designImage} angle={viewAngle} />
            )}
            
            {selectedProduct === 'caneca_termica' && viewAngle === 'inhand' && (
              <MugInHandMockup designImage={designImage} />
            )}
            {selectedProduct === 'caneca_termica' && viewAngle !== 'inhand' && (
              <TravelMugMockup designImage={designImage} angle={viewAngle} />
            )}
            
            {selectedProduct === 'quadro' && (
              <FrameMockup designImage={designImage} angle={viewAngle} />
            )}
            
            {selectedProduct === 'mousepad' && (
              <MousepadMockup designImage={designImage} angle={viewAngle} />
            )}
          </motion.div>
        </AnimatePresence>
        )}
      </div>
    </div>
  );
}