import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [orders, designs] = await Promise.all([
      base44.asServiceRole.entities.Order.list('-created_date', 500),
      base44.asServiceRole.entities.Design.filter({ artist_id: user.id }, '-created_date', 500)
    ]);
    const designRates = new Map(designs.map((design) => [design.id, design.commission_rate]));
    const eligibleStatuses = new Set(['paid', 'producing', 'shipped', 'delivered']);
    const transactions = [];

    for (const order of orders) {
      if (!eligibleStatuses.has(order.status)) continue;
      const artistItems = (order.items || []).filter((item) => item.artist_id === user.id);
      if (!artistItems.length) continue;

      const gross = artistItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
      const commission = artistItems.reduce((sum, item) => {
        const rate = designRates.get(item.design_id) ?? user.artist_commission_rate ?? 25;
        return sum + ((item.price || 0) * (item.quantity || 1) * rate / 100);
      }, 0);
      transactions.push({
        id: order.id,
        orderNumber: order.order_number || order.id.slice(-8).toUpperCase(),
        date: order.created_date,
        status: order.status,
        gross,
        commission
      });
    }

    const available = transactions.filter((item) => item.status === 'delivered').reduce((sum, item) => sum + item.commission, 0);
    const processing = transactions.filter((item) => item.status !== 'delivered').reduce((sum, item) => sum + item.commission, 0);
    const totalCommissions = available + processing;
    const grossSales = transactions.reduce((sum, item) => sum + item.gross, 0);

    const pendingTransactions = transactions.filter((item) => item.status !== 'delivered').slice(0, 20);

    return Response.json({ available, processing, totalCommissions, grossSales, salesCount: transactions.length, pendingTransactions });
  } catch (error) {
    console.error('Financial summary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}