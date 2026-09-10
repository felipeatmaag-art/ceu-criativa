export const PRINT_AREA = Object.freeze({ x: 320, y: 290, width: 360, height: 450, width_mm: 300, height_mm: 375, coordinate_space: 1000 });

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function buildCompositionMetadata({ transform = {}, artworkWidth, artworkHeight, printArea = PRINT_AREA }) {
  const sourceWidth = finite(artworkWidth);
  const sourceHeight = finite(artworkHeight);
  if (sourceWidth <= 0 || sourceHeight <= 0) throw new Error('Dimensões da estampa inválidas.');
  const ratio = sourceWidth / sourceHeight;
  const rotation = finite(transform.rotation);
  const angle = rotation * Math.PI / 180;
  const naturalWidth = Math.min(printArea.width, printArea.height * ratio) / 1.618;
  const naturalHeight = naturalWidth / ratio;
  const rotatedWidth = Math.abs(naturalWidth * Math.cos(angle)) + Math.abs(naturalHeight * Math.sin(angle));
  const rotatedHeight = Math.abs(naturalWidth * Math.sin(angle)) + Math.abs(naturalHeight * Math.cos(angle));
  const scale = Math.max(0.1, Math.min(finite(transform.scale, 1), printArea.width / rotatedWidth, printArea.height / rotatedHeight));
  const maxX = (printArea.width - rotatedWidth * scale) / 2;
  const maxY = (printArea.height - rotatedHeight * scale) / 2;
  const x = Math.max(-maxX, Math.min(maxX, finite(transform.x)));
  const y = Math.max(-maxY, Math.min(maxY, finite(transform.y)));
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const widthMm = width / printArea.width * printArea.width_mm;
  return {
    coordinate_space: printArea.coordinate_space,
    print_area: { ...printArea },
    artwork: { width: sourceWidth, height: sourceHeight, aspect_ratio: ratio },
    placement: { x, y, scale, rotation, width, height, cx: printArea.x + printArea.width / 2 + x, cy: printArea.y + printArea.height / 2 + y },
    effective_dpi: Math.floor(sourceWidth / (widthMm / 25.4)),
  };
}