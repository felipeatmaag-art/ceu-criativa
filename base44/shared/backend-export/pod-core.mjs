const money = value => Math.round((Number(value) || 0) * 100) / 100;
export const PRINT_AREA = { x: 320, y: 290, width: 360, height: 450, width_mm: 300, height_mm: 375, coordinate_space: 1000 };
export function quote(product, design, quantity = 1) {
  const baseCost = money(product.base_cost ?? product.base_price), designPrice = money(design.price_base);
  const rate = Math.max(0, Math.min(100, Number(design.commission_rate ?? 25)));
  const commission = money(designPrice * rate / 100);
  const platformFee = money(Math.max(0, designPrice - commission)), unitPrice = money(baseCost + commission + platformFee);
  return { quantity, base_cost: baseCost, design_price: designPrice, unit_price: unitPrice, final_price: unitPrice, artist_commission_rate: rate, artist_commission: commission, platform_margin: platformFee, total: money(unitPrice * quantity) };
}
export function composition({ transform = {}, artworkWidth, artworkHeight, printArea = PRINT_AREA }) {
  const ratio = artworkWidth / artworkHeight, rotation = Number(transform.rotation) || 0, angle = rotation * Math.PI / 180;
  const naturalWidth = Math.min(printArea.width, printArea.height * ratio) / 1.618, naturalHeight = naturalWidth / ratio;
  const rw = Math.abs(naturalWidth * Math.cos(angle)) + Math.abs(naturalHeight * Math.sin(angle));
  const rh = Math.abs(naturalWidth * Math.sin(angle)) + Math.abs(naturalHeight * Math.cos(angle));
  const scale = Math.max(.1, Math.min(Number(transform.scale) || 1, printArea.width / rw, printArea.height / rh));
  const x = Math.max(-(printArea.width-rw*scale)/2, Math.min((printArea.width-rw*scale)/2, Number(transform.x)||0));
  const y = Math.max(-(printArea.height-rh*scale)/2, Math.min((printArea.height-rh*scale)/2, Number(transform.y)||0));
  const width = naturalWidth * scale, height = naturalHeight * scale;
  return { x, y, scale, rotation, width, height, cx: printArea.x+printArea.width/2+x, cy: printArea.y+printArea.height/2+y, effective_dpi: Math.floor(artworkWidth / ((width/printArea.width*printArea.width_mm)/25.4)) };
}