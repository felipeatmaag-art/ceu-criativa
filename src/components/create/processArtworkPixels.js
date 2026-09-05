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
    if (compatible < 0.98) throw new Error('Fundo ambíguo ou quadriculado detectado. Envie um PNG transparente ou gere novamente com fundo uniforme; a imagem não foi aplicada.');
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
  let visible = 0, clear = 0;
  let left = width, top = height, right = 0, bottom = 0;
  for (let i = 0; i < count; i++) {
    if (data[i * 4 + 3] <= 8) { data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = data[i * 4 + 3] = 0; clear++; }
    else { visible++; left = Math.min(left, i % width); right = Math.max(right, i % width); top = Math.min(top, Math.floor(i / width)); bottom = Math.max(bottom, Math.floor(i / width)); }
  }
  if (clear / count < 0.02 || visible / count < 0.001 || edges.some(i => data[i * 4 + 3] > 8)) {
    throw new Error('Não foi possível validar uma arte isolada com transparência. Use PNG com margem transparente ou gere novamente.');
  }
  return { method, transparent_fraction: clear / count, bounds: { left, top, width: right - left + 1, height: bottom - top + 1 } };
}