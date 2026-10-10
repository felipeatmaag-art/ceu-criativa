import { loadPrintImage } from '@/components/create/renderPrintMockup';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
import { base44 } from '@/api/base44Client';

export const HUMAN_MOCKUP_STYLES = {
  human_street: {
    id: 'human_street',
    name: 'Streetwear Urbano',
    label: '👤 Streetwear Urbano (Estilo Felipe Silvério)',
    badge: 'Streetwear SP',
    bgColors: ['#2b323c', '#181c22'],
    skinTone: '#e8b298',
    skinShadow: '#c48970',
    pantsColor: '#1e293b',
    promptScene: 'modelo jovem estilo streetwear em rua urbana contemporânea com luz natural suave e prédios ao fundo',
  },
  human_wall: {
    id: 'human_wall',
    name: 'Muro de Tijolos / Arte',
    label: '🧱 Muro de Tijolos / Casual',
    badge: 'Muro Rústico',
    bgColors: ['#d7c4b7', '#a88f7d'],
    skinTone: '#f4c6a8',
    skinShadow: '#d69d7c',
    pantsColor: '#172554',
    promptScene: 'modelo encostado em muro rústico com luz fotográfica natural e atmosfera urbana descolada',
  },
  human_cafe: {
    id: 'human_cafe',
    name: 'Cafeteria & Lifestyle',
    label: '☕ Cafeteria & Lifestyle',
    badge: 'Cafeteria',
    bgColors: ['#f5e6d3', '#dbc1ac'],
    skinTone: '#eed2bd',
    skinShadow: '#cca387',
    pantsColor: '#334155',
    promptScene: 'modelo jovem sentado em cafeteria moderna com iluminação quente de bistrô e plantas desfocadas',
  },
  human_balcony: {
    id: 'human_balcony',
    name: 'Sacada & Luz Dourada',
    label: '🏙️ Sacada & Luz Dourada',
    badge: 'Golden Hour',
    bgColors: ['#fed7aa', '#f97316'],
    skinTone: '#f6c9af',
    skinShadow: '#d89b7b',
    pantsColor: '#0f172a',
    promptScene: 'modelo jovem em sacada com luz de pôr do sol e horizonte da cidade ao fundo',
  },
  human_studio: {
    id: 'human_studio',
    name: 'Estúdio Lookbook Clean',
    label: '📸 Estúdio Lookbook Clean',
    badge: 'Editorial',
    bgColors: ['#f1f5f9', '#cbd5e1'],
    skinTone: '#eec7b0',
    skinShadow: '#cb9a7d',
    pantsColor: '#1e293b',
    promptScene: 'fotografia editorial de lookbook de moda com modelo em estúdio minimalista clean',
  },
};

/**
 * Normaliza cor da peça
 */
function normalizeColor(color = 'white') {
  const c = String(color).toLowerCase().trim();
  if (c.includes('black') || c.includes('pret') || c.includes('escuro')) {
    return { name: 'preto', hex: '#18181b', isDark: true, label: 'preta' };
  }
  if (c.includes('navy') || c.includes('marinho') || c.includes('azul')) {
    return { name: 'marinho', hex: '#1e3a8a', isDark: true, label: 'azul-marinho' };
  }
  if (c.includes('gray') || c.includes('cinza') || c.includes('chumbo')) {
    return { name: 'cinza', hex: '#64748b', isDark: false, label: 'cinza mescla' };
  }
  return { name: 'branco', hex: '#f8fafc', isDark: false, label: 'branca' };
}

/**
 * Desenha o modelo humano anatômico com camiseta e sombras realistas
 */
function drawHumanModel(ctx, width, height, garmentColor, styleConfig) {
  const skin = styleConfig.skinTone || '#e8b298';
  const skinDark = styleConfig.skinShadow || '#c48970';
  const tColor = garmentColor.hex;

  // 1. Fundo de ambiente fotográfico com luz e profundidade
  const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.35, 100, width * 0.5, height * 0.5, width * 0.8);
  bgGrad.addColorStop(0, styleConfig.bgColors[0]);
  bgGrad.addColorStop(1, styleConfig.bgColors[1]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Luz suave superior
  const lightGlow = ctx.createRadialGradient(width * 0.35, height * 0.15, 20, width * 0.35, height * 0.15, 450);
  lightGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  lightGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = lightGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. Sombra projetada do modelo
  ctx.save();
  ctx.filter = 'blur(40px)';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.95, 260, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Braço Esquerdo (pele)
  ctx.save();
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.moveTo(width * 0.18, height * 0.35);
  ctx.bezierCurveTo(width * 0.14, height * 0.48, width * 0.13, height * 0.65, width * 0.16, height * 0.78);
  ctx.lineTo(width * 0.25, height * 0.78);
  ctx.bezierCurveTo(width * 0.24, height * 0.65, width * 0.26, height * 0.48, width * 0.28, height * 0.38);
  ctx.closePath();
  ctx.fill();

  // Mão esquerda casual
  ctx.beginPath();
  ctx.ellipse(width * 0.20, height * 0.82, 32, 45, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Braço Direito (pele)
  ctx.save();
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.moveTo(width * 0.82, height * 0.35);
  ctx.bezierCurveTo(width * 0.86, height * 0.48, width * 0.87, height * 0.65, width * 0.84, height * 0.78);
  ctx.lineTo(width * 0.75, height * 0.78);
  ctx.bezierCurveTo(width * 0.76, height * 0.65, width * 0.74, height * 0.48, width * 0.72, height * 0.38);
  ctx.closePath();
  ctx.fill();

  // Mão direita casual
  ctx.beginPath();
  ctx.ellipse(width * 0.80, height * 0.82, 32, 45, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Pescoço & Queixo
  ctx.save();
  const neckGrad = ctx.createLinearGradient(width * 0.5, height * 0.14, width * 0.5, height * 0.28);
  neckGrad.addColorStop(0, skin);
  neckGrad.addColorStop(1, skinDark);
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.22, 60, 75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Queixo & mandíbula esculpida
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.moveTo(width * 0.42, height * 0.15);
  ctx.bezierCurveTo(width * 0.44, height * 0.21, width * 0.47, height * 0.23, width * 0.5, height * 0.23);
  ctx.bezierCurveTo(width * 0.53, height * 0.23, width * 0.56, height * 0.21, width * 0.58, height * 0.15);
  ctx.closePath();
  ctx.fill();

  // Sombra suave sob o queixo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.235, 42, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Calça jeans/streetwear (cintura)
  ctx.save();
  ctx.fillStyle = styleConfig.pantsColor || '#1e293b';
  ctx.beginPath();
  ctx.moveTo(width * 0.28, height * 0.88);
  ctx.lineTo(width * 0.72, height * 0.88);
  ctx.lineTo(width * 0.75, height);
  ctx.lineTo(width * 0.25, height);
  ctx.closePath();
  ctx.fill();
  // Costuras jeans
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // 7. Camiseta de Alta Qualidade (Corpo e Mangas)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 15;

  ctx.fillStyle = tColor;
  ctx.beginPath();
  // Gola / Ombros
  ctx.moveTo(width * 0.38, height * 0.25);
  ctx.bezierCurveTo(width * 0.43, height * 0.29, width * 0.57, height * 0.29, width * 0.62, height * 0.25);
  // Ombro direito até manga
  ctx.lineTo(width * 0.81, height * 0.33);
  ctx.lineTo(width * 0.76, height * 0.47);
  ctx.lineTo(width * 0.69, height * 0.43);
  // Tronco direito
  ctx.bezierCurveTo(width * 0.71, height * 0.60, width * 0.72, height * 0.76, width * 0.71, height * 0.89);
  // Barra inferior
  ctx.bezierCurveTo(width * 0.60, height * 0.90, width * 0.40, height * 0.90, width * 0.29, height * 0.89);
  // Tronco esquerdo
  ctx.bezierCurveTo(width * 0.28, height * 0.76, width * 0.29, height * 0.60, width * 0.31, height * 0.43);
  // Manga esquerda
  ctx.lineTo(width * 0.24, height * 0.47);
  ctx.lineTo(width * 0.19, height * 0.33);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 8. Dobras de Tecido e Volume (Realismo de Algodão)
  ctx.save();
  // Sombra nas laterais do tronco
  const foldGradL = ctx.createLinearGradient(width * 0.25, height * 0.5, width * 0.40, height * 0.5);
  foldGradL.addColorStop(0, 'rgba(0,0,0,0.22)');
  foldGradL.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = foldGradL;
  ctx.fillRect(width * 0.25, height * 0.35, width * 0.2, height * 0.55);

  const foldGradR = ctx.createLinearGradient(width * 0.75, height * 0.5, width * 0.60, height * 0.5);
  foldGradR.addColorStop(0, 'rgba(0,0,0,0.22)');
  foldGradR.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = foldGradR;
  ctx.fillRect(width * 0.55, height * 0.35, width * 0.2, height * 0.55);

  // Iluminação nos peitorais e ombro
  const chestLight = ctx.createRadialGradient(width * 0.46, height * 0.38, 30, width * 0.5, height * 0.45, 240);
  chestLight.addColorStop(0, garmentColor.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.45)');
  chestLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = chestLight;
  ctx.fillRect(width * 0.30, height * 0.26, width * 0.40, height * 0.60);

  // Dobras sutis de caimento do tecido
  ctx.strokeStyle = garmentColor.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Dobra peitoral
  ctx.moveTo(width * 0.34, height * 0.42);
  ctx.bezierCurveTo(width * 0.42, height * 0.46, width * 0.48, height * 0.47, width * 0.54, height * 0.45);
  // Dobra cintura
  ctx.moveTo(width * 0.33, height * 0.76);
  ctx.bezierCurveTo(width * 0.44, height * 0.79, width * 0.56, height * 0.79, width * 0.67, height * 0.76);
  ctx.stroke();

  // Gola canelada de ribana
  ctx.strokeStyle = garmentColor.isDark ? '#27272a' : '#e2e8f0';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.265, 95, 25, 0, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.restore();
}

/**
 * Renderiza o mockup humanizado no Canvas de forma fotorrealista e precisa
 */
export async function renderHumanMockupCanvas(options, styleKey = 'human_street') {
  const { frontImage, backImage, transforms, color, productType } = options;
  const artworkUrl = frontImage || backImage;
  if (!artworkUrl) throw new Error('Arte não encontrada para gerar mockup humanizado.');

  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');

  const styleConfig = HUMAN_MOCKUP_STYLES[styleKey] || HUMAN_MOCKUP_STYLES.human_street;
  const garmentColor = normalizeColor(color);

  // 1. Desenha o modelo humano anatômico
  drawHumanModel(ctx, 1000, 1000, garmentColor, styleConfig);

  // 2. Carrega a arte do artista
  const artwork = await loadPrintImage(artworkUrl);
  if (artwork) {
    const meta = getArtworkMetadata(artworkUrl);
    const bounds = meta?.bounds || { left: 0, top: 0, width: artwork.naturalWidth || 500, height: artwork.naturalHeight || 500 };
    const ratio = bounds.width / bounds.height;

    // Posicionamento no peito do modelo
    const userTransform = transforms?.front || transforms?.back || { x: 0, y: 0, scale: 1, rotation: 0 };
    
    // Centro do peito no modelo (500, 480)
    const baseW = 280;
    const baseH = baseW / ratio;
    const currentScale = userTransform.scale || 1;
    const drawW = baseW * currentScale;
    const drawH = baseH * currentScale;
    const posX = 500 + (userTransform.x || 0) * 0.7;
    const posY = 475 + (userTransform.y || 0) * 0.7;
    const rot = (userTransform.rotation || 0) * Math.PI / 180;

    // Canvas temporário para renderizar a estampa isolada
    const printLayer = document.createElement('canvas');
    printLayer.width = 1000;
    printLayer.height = 1000;
    const pCtx = printLayer.getContext('2d');

    pCtx.save();
    pCtx.translate(posX, posY);
    pCtx.rotate(rot);

    // Leve sombra de profundidade na tinta do DTF
    pCtx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    pCtx.shadowBlur = 8;
    pCtx.shadowOffsetY = 4;

    pCtx.drawImage(
      artwork,
      bounds.left,
      bounds.top,
      bounds.width,
      bounds.height,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    );
    pCtx.restore();

    // Integração da tinta com a malha do tecido
    if (garmentColor.isDark) {
      // Tecido escuro: estampa vibrante com sutil blend de sombra
      ctx.drawImage(printLayer, 0, 0);
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(printLayer, 0, 0);
      ctx.restore();
    } else {
      // Tecido claro: multiply natural imitando absorção da fibra de algodão
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.92;
      ctx.drawImage(printLayer, 0, 0);
      ctx.restore();
    }
  }

  // 3. Selo de Lookbook Autoral
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 10;
  
  // Badge pill no canto superior
  const badgeText = `${styleConfig.badge} · VISTA EM USO`;
  ctx.font = '700 12px sans-serif';
  const textWidth = ctx.measureText(badgeText).width;
  
  ctx.beginPath();
  ctx.roundRect(40, 40, textWidth + 32, 34, 17);
  ctx.fill();
  
  ctx.fillStyle = '#0f172a';
  ctx.fillText(badgeText, 56, 62);
  ctx.restore();

  return canvas;
}

/**
 * Tenta gerar mockup humanizado com Gemini AI ou recorre ao Canvas composto de alta fidelidade
 */
export async function renderHumanMockup(options, styleKey = 'human_street') {
  const styleConfig = HUMAN_MOCKUP_STYLES[styleKey] || HUMAN_MOCKUP_STYLES.human_street;
  const garmentColor = normalizeColor(options.color);
  const artworkUrl = options.frontImage || options.backImage;

  // 1. Tenta geração AI quando possível
  if (artworkUrl && base44?.integrations?.Core?.GenerateImage) {
    try {
      const prompt = `Fotografia editorial de lookbook de alta moda streetwear. Foto realista de um ${styleConfig.promptScene}. O modelo veste uma camiseta de algodão ${garmentColor.label} de gola redonda com a estampa artística mostrada na imagem de referência perfeitamente impressa e nítida no peito. Enquadramento médio (peito e tronco visíveis), iluminação natural fotográfica suave, pose autêntica e confiante. Foco ultra-nítido na camiseta e na arte, sem distorções, sem outros textos além da arte original. Estilo contemporâneo lookbook urbano.`;

      const aiResult = await Promise.race([
        base44.integrations.Core.GenerateImage({
          prompt,
          existing_image_urls: [artworkUrl],
          productColor: options.color,
          productType: options.productType || 'camiseta',
          aspectRatio: '1:1',
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
      ]);

      if (aiResult?.url) {
        // Carrega a imagem gerada e retorna como canvas
        const img = await loadPrintImage(aiResult.url);
        if (img) {
          const canvas = document.createElement('canvas');
          canvas.width = 1000;
          canvas.height = 1000;
          canvas.getContext('2d').drawImage(img, 0, 0, 1000, 1000);
          return canvas;
        }
      }
    } catch (e) {
      console.warn('Geração Gemini AI de mockup humanizado indisponível, usando renderizador fotográfico Canvas:', e?.message || e);
    }
  }

  // 2. Renderizador fotorrealista local Canvas (imediato, confiável e 100% fiel à posição)
  return renderHumanMockupCanvas(options, styleKey);
}
