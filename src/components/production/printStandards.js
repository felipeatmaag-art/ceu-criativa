const CM_TO_INCH = 1 / 2.54;

const makeStandard = (key, label, widthCm, heightCm, ratio, previewClass) => ({
  key, label, widthCm, heightCm, ratio, previewClass, dpi: 300,
  widthPx: Math.round(widthCm * CM_TO_INCH * 300),
  heightPx: Math.round(heightCm * CM_TO_INCH * 300),
});

export const PRINT_STANDARDS = {
  camiseta: makeStandard('camiseta', 'Camiseta Full Front', 30, 40, '3:4', 'aspect-[3/4]'),
  baby_look: makeStandard('camiseta', 'Camiseta Full Front', 30, 40, '3:4', 'aspect-[3/4]'),
  quadro: makeStandard('camiseta', 'Formato vertical', 30, 40, '3:4', 'aspect-[3/4]'),
  ecobag: makeStandard('ecobag', 'Ecobag', 28, 35, '4:5', 'aspect-[4/5]'),
  caneca: makeStandard('caneca', 'Caneca 11oz', 20, 9, '20:9', 'aspect-[20/9]'),
  logo_uniforme: makeStandard('logo_uniforme', 'Logo / Uniforme (Peito)', 10, 10, '1:1', 'aspect-square'),
};

export function getPrintStandard(productType) {
  return PRINT_STANDARDS[productType] || PRINT_STANDARDS.camiseta;
}

export function getPrintPrompt(productType) {
  const standard = getPrintStandard(productType);
  return `Use proporção estrita ${standard.ratio}, composição adequada a ${standard.label}, área final de ${standard.widthCm} cm × ${standard.heightCm} cm a ${standard.dpi} DPI. Preserve todos os elementos dentro das margens e não corte as extremidades.`;
}