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
  caneca: makeStandard('caneca', 'Caneca Sublimada (Gabarito 23,2x17,9cm)', 23.2, 17.9, '4:3', 'aspect-[4/3]'),
  logo_uniforme: makeStandard('logo_uniforme', 'Logo / Uniforme (Peito)', 10, 10, '1:1', 'aspect-square'),
};

export function getPrintStandard(productType) {
  return PRINT_STANDARDS[productType] || PRINT_STANDARDS.camiseta;
}

export function getPrintPrompt(productType) {
  if (productType === 'caneca') {
    return `PROJETO PARA CANECA SUBLIMADA: Gere a estampa gráfica nas dimensões padrão de sublimação de caneca: 23,2 cm de largura × 17,9 cm de altura a 300 DPI (proporção retangular de sublimação ~4:3). Arte gráfica vetorial plana contínua sobre fundo verde puro #00FF00.`;
  }
  const standard = getPrintStandard(productType);
  return `Use proporção estrita ${standard.ratio}, arte gráfica vetorial isolada em alta resolução (${standard.dpi} DPI, ${standard.widthCm} cm × ${standard.heightCm} cm), formato decalque/adesivo centralizado sobre fundo verde técnico #00FF00. Margem de respiro de 10% nas extremidades.`;
}

export function isDarkProductColor(colorName = '', hex = '') {
  if (hex && hex.startsWith('#')) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance < 0.45;
  }
  const lower = String(colorName).toLowerCase();
  return /black|preto|preta|navy|marinho|dark|escuro|escura|wine|vinho|bordo|chumbo|militar|verde_escuro|gray|cinza_escuro/i.test(lower);
}

export function getColorContrastPrompt(productType = 'camiseta', colorName = 'white', colorLabel = 'Branco', hex = '#FFFFFF') {
  const isDark = isDarkProductColor(colorName, hex);

  if (isDark) {
    return `PALETA DE ALTO CONTRASTE LUMINOSO:
- Lettering, tipografia, traços e ilustrações em cores claras e luminosas (branco puro, marfim, amarelo claro, cores pastéis brilhantes).
- Arte gráfica vetorial 2D isolada sobre fundo verde sólido #00FF00, estilo adesivo decalque.`;
  }

  return `PALETA DE CONTRASTE NÍTIDO:
- Traços e elementos com cores vibrantes e contrastantes de alta nitidez.
- Arte gráfica vetorial 2D isolada sobre fundo verde sólido #00FF00, estilo adesivo decalque.`;
}