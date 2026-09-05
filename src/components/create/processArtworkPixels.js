// Conservative edge-connected matting. Ambiguous backgrounds fail closed, never guess six artwork colors.
export default function processArtworkPixels(data, width, height) {
  const count = width * height;
  const distance = (i, color) => Math.max(...color.map((v, c) => Math.abs(data[i * 4 + c] - v)));
  const edges = [];
  for (let x = 0; x < width; x++) { edges.push(x, (height - 1) * width + x); }
  for (let y = 1; y < height - 1; y++) { edges.push(y * width, y * width + width - 1); }
  const transparent = edges.filter(i => data[i * 4 + 3] <= 8).length / edges.length;
  let method = 'native-alpha';
  if (transparent < 0.99) {
    const colors = new Map();
    for (const i of edges) {
      if (data[i * 4 + 3] <= 8) continue;
      const key = [0, 1, 2].map(c => Math.round(data[i * 4 + c] / 8) * 8).join(',');
      colors.set(key, (colors.get(key) || 0) + 1);
    }
    const dominant = [...colors].sort((a, b) => b[1] - a[1])[0];
    if (!dominant) throw new Error('Imagem sem conteúdo visível.');
    const background = dominant[0].split(',').map(Number);
    const compatible = edges.filter(i => data[i * 4 + 3] <= 8 || distance(i, background) <= 20).length / edges.length;
    if (compatible < 0.98) throw new Error('Fundo ambíguo ou quadriculado detectado. A imagem foi bloqueada antes do mockup.');
    const visited = new Uint8Array(count);
    const queue = new Uint32Array(count);
    let head = 0, tail = 0;
    const enqueue = i => {
      if (!visited[i] && (data[i * 4 + 3] <= 8 || distance(i, background) <= 32)) {
        visited[i] = 1; queue[tail++] = i;
      }
    };
    edges.forEach(enqueue);
    while (head < tail) {
      const i = queue[head++];
      data[i * 4 + 3] = 0;
      if (i % width) enqueue(i - 1);
      if (i % width < width - 1) enqueue(i + 1);
      if (i >= width) enqueue(i - width);
      if (i < count - width) enqueue(i + width);
    }
    method = 'edge-connected-matte';
  }

  // Generated files can contain a real alpha channel plus a faint checker/grid baked inside it.
  // Detect a widely spread neutral veil, remove it, then clear neutral islands safely outside
  // the chromatic artwork core (expanded to preserve white outlines and black lettering).
  let artifactPixelsRemoved = 0;
  let neutralLow = 0, neutralLeft = width, neutralTop = height, neutralRight = 0, neutralBottom = 0;
  let colorCount = 0, colorLeft = width, colorTop = height, colorRight = 0, colorBottom = 0;
  for (let i = 0; i < count; i++) {
    const alpha = data[i * 4 + 3];
    if (alpha <= 8) continue;
    const x = i % width, y = Math.floor(i / width);
    const red = data[i * 4], green = data[i * 4 + 1], blue = data[i * 4 + 2];
    const spread = Math.max(red, green, blue) - Math.min(red, green, blue);
    if (spread <= 14 && alpha <= 150) {
      neutralLow++; neutralLeft = Math.min(neutralLeft, x); neutralRight = Math.max(neutralRight, x);
      neutralTop = Math.min(neutralTop, y); neutralBottom = Math.max(neutralBottom, y);
    }
    if (spread >= 28 && alpha >= 160) {
      colorCount++; colorLeft = Math.min(colorLeft, x); colorRight = Math.max(colorRight, x);
      colorTop = Math.min(colorTop, y); colorBottom = Math.max(colorBottom, y);
    }
  }
  const neutralIsScreen = neutralLow > Math.max(64, count * 0.001) &&
    neutralRight - neutralLeft > width * 0.35 && neutralBottom - neutralTop > height * 0.35;
  if (neutralIsScreen) {
    for (let i = 0; i < count; i++) {
      const alpha = data[i * 4 + 3];
      const spread = Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) - Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
      if (alpha > 8 && alpha <= 150 && spread <= 14) { data[i * 4 + 3] = 0; artifactPixelsRemoved++; }
    }
  }
  if (colorCount > count * 0.002) {
    const padX = Math.max(12, (colorRight - colorLeft) * 0.18);
    const padY = Math.max(12, (colorBottom - colorTop) * 0.18);
    const safe = { left: colorLeft - padX, right: colorRight + padX, top: colorTop - padY, bottom: colorBottom + padY };
    for (let i = 0; i < count; i++) {
      if (data[i * 4 + 3] <= 8) continue;
      const x = i % width, y = Math.floor(i / width);
      const spread = Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) - Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
      if (spread <= 14 && (x < safe.left || x > safe.right || y < safe.top || y > safe.bottom)) {
        data[i * 4 + 3] = 0; artifactPixelsRemoved++;
      }
    }
  }

  let visible = 0, clear = 0;
  let left = width, top = height, right = 0, bottom = 0;
  for (let i = 0; i < count; i++) {
    if (data[i * 4 + 3] <= 8) { data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = data[i * 4 + 3] = 0; clear++; }
    else { visible++; left = Math.min(left, i % width); right = Math.max(right, i % width); top = Math.min(top, Math.floor(i / width)); bottom = Math.max(bottom, Math.floor(i / width)); }
  }
  if (clear / count < 0.02 || visible / count < 0.001 || edges.some(i => data[i * 4 + 3] > 8)) {
    throw new Error('Não foi possível validar uma arte isolada com transparência. Use PNG com margem transparente ou gere novamente.');
  }
  return { quality_version: 2, method, transparent_fraction: clear / count, artifact_pixels_removed: artifactPixelsRemoved, checkerboard_screen_detected: neutralIsScreen, bounds: { left, top, width: right - left + 1, height: bottom - top + 1 } };
}