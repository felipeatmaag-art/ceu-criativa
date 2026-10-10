import { base44 } from '@/api/base44Client';
import { rememberArtwork, getArtworkMetadata } from '@/components/create/artworkMetadata';

/**
 * Determines whether a given color name or hex code corresponds to a dark garment/fabric.
 */
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

/**
 * Returns a technical prompt snippet that guides Gemini to generate designs
 * that contrast perfectly with the chosen product fabric color.
 */
export function getColorContrastPrompt(productType = 'camiseta', colorName = 'white', colorLabel = 'Branco', hex = '#FFFFFF') {
  const isDark = isDarkProductColor(colorName, hex);

  if (isDark) {
    return `
DIRETRIZ CRÍTICA DE CONTRASTE E VISIBILIDADE (CAMISETA ESCURA):
- PRODUTO SELECIONADO: ${productType} na cor ESCURA (${colorLabel || colorName}, código ${hex}).
- REGRA OBRIGATÓRIA DE ALTO CONTRASTE:
  Como a estampa será estampada diretamente sobre um tecido ESCURO (${colorLabel || colorName}), é TERMINANTEMENTE PROIBIDO usar letras pretas, textos escuros, traços pretos ou elementos escuros que fiquem invisíveis ou camuflados na camiseta preta.
  TODO O LETTERING, TIPOGRAFIA, FRASES, PALAVRAS, CONTORNOS PRINCIPAIS E ELEMENTOS CHAVE DA ILUSTRAÇÃO DEVEM SER DESENHADOS OBRIGATORIAMENTE EM TONS CLAROS E LUMINOSOS (por exemplo: branco puro, off-white, creme, marfim, amarelo claro, tons pastéis claros, dourado claro ou cores vivas com alto valor de luminosidade).
  O texto e a estampa devem saltar aos olhos com altíssimo contraste e perfeita legibilidade quando vistos sobre a camiseta preta.`;
  }

  return `
DIRETRIZ DE CONTRASTE (CAMISETA CLARA):
- PRODUTO SELECIONADO: ${productType} na cor CLARA (${colorLabel || colorName}, código ${hex}).
- REGRA DE CONTRASTE:
  Como a estampa será estampada sobre um tecido CLARO (${colorLabel || colorName}), utilize letras e ilustrações com contraste nítido (tons escuros, médios ou cores saturadas vibrantes) para que o texto e os traços fiquem perfeitamente legíveis. Não faça letras brancas que sumam no tecido claro.`;
}

/**
 * Adapts an existing transparent PNG artwork specifically for dark apparel (like black t-shirts).
 * It detects dark lettering, dark outlines, and low-contrast elements and transforms them into
 * crisp, luminous off-white/cream tones while preserving colored floral/decorative elements and transparency.
 */
export async function adaptArtworkForDarkBackground(imageUrl) {
  if (!imageUrl) throw new Error('Imagem inválida para adaptação.');

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Não foi possível carregar a arte para ajustar as cores.');
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const width = bitmap.width;
  const height = bitmap.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  let transformedPixels = 0;

  for (let i = 0; i < len; i += 4) {
    const a = data[i + 3];
    if (a < 20) continue; // Skip transparent or near-transparent pixels

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Standard perceived luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max > 0 ? (max - min) / max : 0;

    // Case 1: Pure dark/black or neutral dark (lettering, borders, dark shadows)
    // Dark pixels with low saturation (black, dark gray, charcoal)
    if (lum < 75 && sat < 0.6) {
      // Transform into bright off-white (#FAF8F5) with soft shading preservation
      const shade = (lum / 75) * 15;
      data[i] = Math.min(255, Math.round(250 - shade));
      data[i + 1] = Math.min(255, Math.round(248 - shade));
      data[i + 2] = Math.min(255, Math.round(242 - shade));
      transformedPixels++;
    }
    // Case 2: Very dark tinted colors (e.g. very dark green or dark navy lettering/stems)
    else if (lum < 60) {
      // Lift the brightness significantly so it doesn't vanish on black fabric
      const boost = 210 / Math.max(lum, 10);
      data[i] = Math.min(255, Math.round(r * boost * 0.85 + 40));
      data[i + 1] = Math.min(255, Math.round(g * boost * 0.85 + 40));
      data[i + 2] = Math.min(255, Math.round(b * boost * 0.85 + 40));
      transformedPixels++;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const newBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  canvas.width = canvas.height = 0;

  if (!newBlob) throw new Error('Não foi possível exportar a estampa adaptada.');

  const hashBuffer = await crypto.subtle.digest('SHA-256', await newBlob.arrayBuffer());
  const sha = [...new Uint8Array(hashBuffer)].map((v) => v.toString(16).padStart(2, '0')).join('').slice(0, 16);

  const uploadResult = await base44.integrations.Core.UploadFile({
    file: new File([newBlob], `estampa-fundo-escuro-${sha}.png`, { type: 'image/png' }),
  });

  const newUrl = uploadResult?.file_url;
  if (!newUrl) throw new Error('Erro ao salvar estampa com alto contraste.');

  // Preserve existing metadata bounds and dimensions
  const prevMeta = getArtworkMetadata(imageUrl);
  rememberArtwork(newUrl, {
    ...prevMeta,
    file_url: newUrl,
    original_url: imageUrl,
    contrast_adapted_for: 'dark',
    adapted_pixels: transformedPixels,
    quality_version: 3,
  });

  return newUrl;
}
