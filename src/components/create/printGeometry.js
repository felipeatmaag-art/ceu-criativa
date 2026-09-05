export const PRINT_AREA = { x: 320, y: 290, width: 360, height: 450, width_mm: 300, height_mm: 375 };
export function printGeometry(transform = {}, ratio = 1) {
  const area = PRINT_AREA;
  const rotation = Number(transform.rotation) || 0;
  const angle = rotation * Math.PI / 180;
  const width = Math.min(area.width, area.height * ratio) / 1.618;
  const height = width / ratio;
  const rw = Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
  const rh = Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle));
  const scale = Math.max(0.1, Math.min(Number(transform.scale) || 1, area.width / rw, area.height / rh));
  const maxX = (area.width - rw * scale) / 2, maxY = (area.height - rh * scale) / 2;
  const x = Math.max(-maxX, Math.min(maxX, Number(transform.x) || 0));
  const y = Math.max(-maxY, Math.min(maxY, Number(transform.y) || 0));
  return { x, y, scale, rotation, width: width * scale, height: height * scale, cx: area.x + area.width / 2 + x, cy: area.y + area.height / 2 + y };
}