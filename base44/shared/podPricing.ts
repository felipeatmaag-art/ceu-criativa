const money = (value) => Math.round((Number(value) || 0) * 100) / 100;

export function buildPodQuote(product, design, quantity = 1) {
  const units = Number(quantity);
  if (!Number.isInteger(units) || units < 1 || units > 10) throw new Error('A quantidade deve ser um inteiro entre 1 e 10.');
  const baseCost = money(product?.base_price);
  const designPrice = money(design?.price_base);
  if (baseCost <= 0) throw new Error('Custo base inválido.');
  const commissionRate = Math.max(0, Math.min(100, Number(design?.commission_rate ?? 25)));
  const unitPrice = money(baseCost + designPrice);
  const artistCommission = money(designPrice * commissionRate / 100);
  const platformMargin = money(designPrice - artistCommission);
  return {
    quantity: units,
    base_cost: baseCost,
    design_price: designPrice,
    unit_price: unitPrice,
    artist_commission_rate: commissionRate,
    artist_commission: artistCommission,
    platform_margin: platformMargin,
    base_cost_total: money(baseCost * units),
    artist_commission_total: money(artistCommission * units),
    total: money(unitPrice * units),
  };
}