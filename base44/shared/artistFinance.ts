const money = value => Math.round((Number(value) || 0) * 100) / 100;
export async function calculateArtistFinance(db, user) {
  const [orders, designs, views, payouts] = await Promise.all([
    db.Order.list('-created_date', 500), db.Design.filter({ artist_id: user.id }, '-created_date', 500),
    db.DesignView.list('-created_date', 1000), db.PayoutRequest.filter({ artist_id: user.id }, '-created_date', 200)
  ]);
  const designMap = new Map(designs.map(design => [design.id, design]));
  const eligible = new Set(['paid', 'producing', 'shipped', 'delivered']);
  const perDesign = new Map(designs.map(design => [design.id, { designId: design.id, title: design.title, views: 0, sales: 0, commission: 0 }]));
  views.forEach(view => { const item = perDesign.get(view.design_id); if (item) item.views += 1; });
  const transactions = [];
  orders.forEach(order => {
    if (!eligible.has(order.status)) return;
    const items = (order.items || []).filter(item => item.artist_id === user.id);
    if (!items.length) return;
    let gross = 0, commission = 0;
    items.forEach(item => {
      const design = designMap.get(item.design_id);
      const quantity = Number(item.quantity) || 1;
      const itemCommission = Number.isFinite(Number(item.artist_commission)) ? Number(item.artist_commission) : (Number(item.design_price ?? item.price) || 0) * Number(design?.commission_rate ?? user.artist_commission_rate ?? 25) / 100;
      gross += (Number(item.price) || 0) * quantity; commission += itemCommission * quantity;
      const metric = perDesign.get(item.design_id); if (metric) { metric.sales += quantity; metric.commission = money(metric.commission + itemCommission * quantity); }
    });
    transactions.push({ id: order.id, orderNumber: order.order_number || order.id.slice(-8).toUpperCase(), date: order.created_date, status: order.status, gross: money(gross), commission: money(commission) });
  });
  const earnedAvailable = money(transactions.filter(item => item.status === 'delivered').reduce((sum, item) => sum + item.commission, 0));
  const reserved = money(payouts.filter(item => ['pending', 'approved', 'paid'].includes(item.status)).reduce((sum, item) => sum + item.amount, 0));
  const processing = money(transactions.filter(item => item.status !== 'delivered').reduce((sum, item) => sum + item.commission, 0));
  const available = money(Math.max(0, earnedAvailable - reserved));
  const monthlyHistory = Array.from({ length: 12 }, (_, index) => { const date = new Date(); date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() - (11 - index)); const month = date.toISOString().slice(0, 7); const rows = transactions.filter(item => item.date?.slice(0, 7) === month); return { month, earnings: money(rows.reduce((sum, item) => sum + item.commission, 0)), sales: rows.length }; });
  return { available, processing, totalCommissions: money(earnedAvailable + processing), grossSales: money(transactions.reduce((sum, item) => sum + item.gross, 0)), salesCount: transactions.length, viewsCount: views.filter(view => perDesign.has(view.design_id)).length, payoutReserved: reserved, pendingTransactions: transactions.filter(item => item.status !== 'delivered').slice(0, 20), monthlyHistory, perDesign: [...perDesign.values()].sort((a, b) => b.sales - a.sales || b.views - a.views) };
}