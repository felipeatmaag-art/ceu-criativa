const colorDistance = (data, offset, color) => Math.hypot(
  data[offset] - color[0],
  data[offset + 1] - color[1],
  data[offset + 2] - color[2]
);

export default function clearImageBackground(context, width, height) {
  const image = context.getImageData(0, 0, width, height);
  const { data } = image;
  const frequencies = new Map();
  let transparentEdges = 0;
  let edgeCount = 0;

  const sample = (x, y) => {
    const offset = (y * width + x) * 4;
    edgeCount += 1;
    if (data[offset + 3] < 32) {
      transparentEdges += 1;
      return;
    }
    const color = [data[offset], data[offset + 1], data[offset + 2]].map((value) => Math.round(value / 16) * 16);
    const key = color.join(',');
    frequencies.set(key, (frequencies.get(key) || 0) + 1);
  };

  for (let x = 0; x < width; x += 2) { sample(x, 0); sample(x, height - 1); }
  for (let y = 1; y < height - 1; y += 2) { sample(0, y); sample(width - 1, y); }
  if (transparentEdges / edgeCount > 0.6) return;

  const palette = [...frequencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key]) => key.split(',').map(Number));
  const matchesBackground = (pixel) => palette.some((color) => colorDistance(data, pixel * 4, color) < 48);
  const visited = new Uint8Array(width * height);
  const stack = [];
  const enqueue = (pixel) => {
    if (!visited[pixel] && matchesBackground(pixel)) {
      visited[pixel] = 1;
      stack.push(pixel);
    }
  };

  for (let x = 0; x < width; x++) { enqueue(x); enqueue((height - 1) * width + x); }
  for (let y = 1; y < height - 1; y++) { enqueue(y * width); enqueue(y * width + width - 1); }
  while (stack.length) {
    const pixel = stack.pop();
    data[pixel * 4 + 3] = 0;
    const x = pixel % width;
    if (x > 0) enqueue(pixel - 1);
    if (x < width - 1) enqueue(pixel + 1);
    if (pixel >= width) enqueue(pixel - width);
    if (pixel < width * (height - 1)) enqueue(pixel + width);
  }

  context.putImageData(image, 0, 0);
}