/**
 * Módulo de Precificação Técnica e Dinâmica de DTF (Direct to Film)
 *
 * Parâmetro fornecido:
 * Metro linear do rolo de DTF: 58 cm de largura x 100 cm de comprimento (0,58 m²) = R$ 80,00.
 *
 * Taxa por cm²:
 * Área total do metro linear = 58 * 100 = 5800 cm² (0.58 m²)
 * Custo por cm² = R$ 80,00 / 5800 cm² ≈ R$ 0,0137931 por cm²
 * Custo por m² = R$ 80,00 / 0.58 m² ≈ R$ 137,93 por m²
 */

import { PRINT_AREA } from './printGeometry';

export const DTF_ROLL_WIDTH_CM = 58;
export const DTF_ROLL_LENGTH_CM = 100;
export const DTF_LINEAR_METER_PRICE = 80.00; // R$ 80 por 58cm x 100cm

export const DTF_TOTAL_AREA_CM2 = DTF_ROLL_WIDTH_CM * DTF_ROLL_LENGTH_CM; // 5800 cm²
export const DTF_PRICE_PER_CM2 = DTF_LINEAR_METER_PRICE / DTF_TOTAL_AREA_CM2; // ~0.013793 R$/cm²
export const DTF_PRICE_PER_M2 = (DTF_LINEAR_METER_PRICE / (DTF_TOTAL_AREA_CM2 / 10000)); // ~R$ 137,93/m²

/**
 * Calcula a dimensão física real impressa (em centímetros) com base na área padrão de estamparia (A3 30x37.5cm)
 * e no transform (escala, aspecto) da arte.
 */
export function calculatePrintDimensions(transform = {}, ratio = 1, productType = 'camiseta') {
  // Canecas são sublimadas ou DTF UV (não usam rolo DTF têxtil e não cobram por área de estampa)
  if (productType === 'caneca') {
    return {
      widthCm: 23.2,
      heightCm: 17.9,
      areaCm2: 415.3,
      areaM2: 0.0415,
      dtfCost: 0, // Sem cobrança de estampa (incluso na caneca)
      isSublimation: true,
      technique: 'Sublimação Térmica / DTF UV'
    };
  }

  const scale = Number(transform.scale) || 1;
  // Área física máxima de estamparia de vestuário em cm:
  const maxPrintWidthCm = PRINT_AREA.width_mm / 10; // 30 cm
  const maxPrintHeightCm = PRINT_AREA.height_mm / 10; // 37.5 cm

  // Base padrão inicial de estampa: ~61.8% da área máxima (proporção áurea de design)
  const baseWidthCm = Math.min(maxPrintWidthCm, maxPrintHeightCm * ratio) / 1.618;
  const baseHeightCm = baseWidthCm / ratio;

  // Dimensão resultante da arte com a escala aplicada pelo usuário:
  const widthCm = Math.max(2, baseWidthCm * scale);
  const heightCm = Math.max(2, baseHeightCm * scale);

  const areaCm2 = widthCm * heightCm;
  const areaM2 = areaCm2 / 10000;
  const dtfCost = Math.max(1.50, areaCm2 * DTF_PRICE_PER_CM2); // Custo proporcional real (mínimo de R$ 1,50)

  return {
    widthCm: Math.round(widthCm * 10) / 10,
    heightCm: Math.round(heightCm * 10) / 10,
    areaCm2: Math.round(areaCm2 * 10) / 10,
    areaM2: Math.round(areaM2 * 10000) / 10000,
    dtfCost: Math.round(dtfCost * 100) / 100,
    isSublimation: false,
    technique: 'DTF Têxtil HD'
  };
}

/**
 * Calcula o custo total de DTF de todas as estampas ativas (Frente e Costas).
 */
export function calculateTotalDtfCost(options = {}) {
  const { frontImage, backImage, transforms = {}, productType = 'camiseta' } = options;

  if (productType === 'caneca') {
    return {
      totalCost: 0,
      totalAreaCm2: 415.3,
      totalAreaM2: 0.0415,
      isSublimation: true,
      technique: 'Sublimação Térmica / DTF UV',
      breakdown: {
        front: { widthCm: 23.2, heightCm: 17.9, dtfCost: 0, isSublimation: true },
        back: null
      },
    };
  }

  let totalCost = 0;
  let totalAreaCm2 = 0;
  let breakdown = { front: null, back: null };

  if (frontImage) {
    const frontMetrics = calculatePrintDimensions(transforms.front || { scale: 1 }, 1, productType);
    totalCost += frontMetrics.dtfCost;
    totalAreaCm2 += frontMetrics.areaCm2;
    breakdown.front = frontMetrics;
  }

  if (backImage) {
    const backMetrics = calculatePrintDimensions(transforms.back || { scale: 1 }, 1, productType);
    totalCost += backMetrics.dtfCost;
    totalAreaCm2 += backMetrics.areaCm2;
    breakdown.back = backMetrics;
  }

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalAreaCm2: Math.round(totalAreaCm2 * 10) / 10,
    totalAreaM2: Math.round((totalAreaCm2 / 10000) * 10000) / 10000,
    isSublimation: false,
    technique: 'DTF Têxtil HD',
    breakdown,
  };
}
