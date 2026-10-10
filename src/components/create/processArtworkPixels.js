// High-precision Chroma Key matting with hollow cavity extraction and green despill.
export default function processArtworkPixels(data, width, height) {
  const count = width * height;
  const distance = (i, color) => Math.max(...color.map((v, c) => Math.abs(data[i * 4 + c] - v)));
  const edges = [];
  for (let x = 0; x < width; x++) { edges.push(x, (height - 1) * width + x); }
  for (let y = 1; y < height - 1; y++) { edges.push(y * width, y * width + width - 1); }
  const transparent = edges.filter(i => data[i * 4 + 3] <= 8).length / edges.length;
  let method = 'native-alpha';
  let isGreenScreen = false;

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
    const [bgR, bgG, bgB] = background;

    // Detect if the dominant background is a technical Green Screen (#00FF00 or dominant green)
    isGreenScreen = bgG >= 110 && (
      (bgG - Math.max(bgR, bgB) >= 28) ||
      (bgG > bgR * 1.3 && bgG > bgB * 1.3)
    );

    // Matching function for background pixels
    const isKeyColor = (idx) => {
      if (data[idx * 4 + 3] <= 8) return true;
      const r = data[idx * 4];
      const g = data[idx * 4 + 1];
      const b = data[idx * 4 + 2];

      if (isGreenScreen) {
        const maxRB = Math.max(r, b);
        const greenDiff = g - maxRB;
        const maxDelta = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
        // Direct proximity to sampled background color
        if (maxDelta <= 65) return true;
        // Strong green dominance characteristic of green-screen background
        if (g >= 95 && greenDiff >= 24) return true;
        // Moderate green dominance if also reasonably close to background
        if (g >= 80 && greenDiff >= 14 && maxDelta <= 90) return true;
        return false;
      } else {
        const isWhiteBg = bgR >= 225 && bgG >= 225 && bgB >= 225;
        const tolerance = isWhiteBg ? 42 : 36;
        return Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB)) <= tolerance;
      }
    };

    const compatible = edges.filter(i => data[i * 4 + 3] <= 8 || isKeyColor(i)).length / edges.length;
    if (compatible < 0.82) {
      // Artistic illustration, photo, poster or complete artwork without solid background
      return {
        quality_version: 3,
        method: 'full-graphic',
        transparent_fraction: transparent,
        bounds: { left: 0, top: 0, width, height },
      };
    }

    const visited = new Uint8Array(count);
    const queue = new Uint32Array(count);
    let head = 0, tail = 0;

    const enqueue = i => {
      if (!visited[i] && isKeyColor(i)) {
        visited[i] = 1;
        queue[tail++] = i;
      }
    };

    // Pass 1: Flood fill from edges to clear outer background
    edges.forEach(enqueue);
    while (head < tail) {
      const i = queue[head++];
      data[i * 4 + 3] = 0;
      const x = i % width;
      const y = (i / width) | 0;
      if (x > 0) enqueue(i - 1);
      if (x < width - 1) enqueue(i + 1);
      if (y > 0) enqueue(i - width);
      if (y < height - 1) enqueue(i + width);
    }

    // Pass 2: Clear enclosed internal hollows ("vãos internos vazados")
    // e.g. openings in letters O, A, B, P, R, spaces between limbs, branches, etc.
    for (let i = 0; i < count; i++) {
      if (!visited[i] && data[i * 4 + 3] > 8 && isKeyColor(i)) {
        visited[i] = 1;
        const innerQueue = [i];
        let iHead = 0;

        while (iHead < innerQueue.length) {
          const curr = innerQueue[iHead++];
          data[curr * 4 + 3] = 0; // Clear inner hollow pixel!

          const cx = curr % width;
          const cy = (curr / width) | 0;

          const neighbors = [];
          if (cx > 0) neighbors.push(curr - 1);
          if (cx < width - 1) neighbors.push(curr + 1);
          if (cy > 0) neighbors.push(curr - width);
          if (cy < height - 1) neighbors.push(curr + width);

          for (const n of neighbors) {
            if (!visited[n] && data[n * 4 + 3] > 8 && isKeyColor(n)) {
              visited[n] = 1;
              innerQueue.push(n);
            }
          }
        }
      }
    }

    method = isGreenScreen ? 'chroma-key-matte' : 'edge-connected-matte';
  }

  // Pass 3: Edge Matting, Defringing and Green De-Spill (eliminate green halo/border)
  // Detect all boundary pixels touching transparency
  const isBoundary = new Uint8Array(count);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (data[idx * 4 + 3] <= 8) continue;

      let touchesTransparent = false;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) { touchesTransparent = true; break; }
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) { touchesTransparent = true; break; }
          if (data[(ny * width + nx) * 4 + 3] <= 8) {
            touchesTransparent = true;
            break;
          }
        }
        if (touchesTransparent) break;
      }
      if (touchesTransparent) {
        isBoundary[idx] = 1;
      }
    }
  }

  // A) Feather alpha on boundary pixels with green contamination
  for (let i = 0; i < count; i++) {
    if (!isBoundary[i]) continue;
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3];
    const maxRB = Math.max(r, b);
    const greenExcess = g - maxRB;

    // Strong green excess on the border = leftover green background fringe
    if (greenExcess >= 32 && g >= 100) {
      data[i * 4 + 3] = 0;
      continue;
    }

    // Moderate green excess = anti-aliased blend with green screen
    // Feather alpha smoothly so edge transitions are clean rather than a green halo
    if (greenExcess >= 12 && g >= 85) {
      const alphaFactor = Math.max(0, Math.min(1, 1 - (greenExcess - 10) / 24));
      const newAlpha = Math.round(a * alphaFactor);
      if (newAlpha <= 10) {
        data[i * 4 + 3] = 0;
        continue;
      }
      data[i * 4 + 3] = newAlpha;
    }
  }

  // B) Green De-Spill (Color Neutralization) pass
  // For pixels in the 2-pixel perimeter of the artwork:
  // Neutralize excess green to completely eliminate the green border/halo
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (data[idx * 4 + 3] <= 8) continue;

      let nearEdge = isBoundary[idx];
      if (!nearEdge) {
        for (let dy = -2; dy <= 2; dy += 2) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) { nearEdge = true; break; }
          for (let dx = -2; dx <= 2; dx += 2) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) { nearEdge = true; break; }
            if (data[(ny * width + nx) * 4 + 3] <= 8) {
              nearEdge = true;
              break;
            }
          }
          if (nearEdge) break;
        }
      }

      if (nearEdge) {
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const maxRB = Math.max(r, b);

        if (g > maxRB) {
          // De-spill green: clamp green channel to prevent green halo on edges
          const despilledG = Math.round(maxRB * 0.85 + ((r + b) / 2) * 0.15);
          data[idx * 4 + 1] = Math.min(g, despilledG);
        }
      }
    }
  }

  // C) Ensure extreme 1px perimeter has no isolated border residue
  for (const i of edges) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    if (data[i * 4 + 3] > 8 && (g >= Math.max(r, b) || data[i * 4 + 3] < 128)) {
      data[i * 4 + 3] = 0;
    }
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

  // Ensure the outer 1px edge boundary is completely transparent
  for (const i of edges) {
    if (data[i * 4 + 3] > 0) {
      data[i * 4] = 0;
      data[i * 4 + 1] = 0;
      data[i * 4 + 2] = 0;
      data[i * 4 + 3] = 0;
    }
  }

  let visible = 0, clear = 0;
  let left = width, top = height, right = 0, bottom = 0;
  for (let i = 0; i < count; i++) {
    if (data[i * 4 + 3] <= 8) {
      data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = data[i * 4 + 3] = 0;
      clear++;
    } else {
      visible++;
      left = Math.min(left, i % width);
      right = Math.max(right, i % width);
      top = Math.min(top, Math.floor(i / width));
      bottom = Math.max(bottom, Math.floor(i / width));
    }
  }
  if (visible === 0) {
    throw new Error('A imagem parece estar completamente vazia.');
  }
  if (clear / count < 0.02) {
    return {
      quality_version: 3,
      method: 'full-bleed',
      transparent_fraction: 0,
      bounds: { left: 0, top: 0, width, height }
    };
  }
  return {
    quality_version: 3,
    method,
    transparent_fraction: clear / count,
    artifact_pixels_removed: artifactPixelsRemoved,
    checkerboard_screen_detected: neutralIsScreen,
    bounds: { left, top, width: right - left + 1, height: bottom - top + 1 }
  };
}