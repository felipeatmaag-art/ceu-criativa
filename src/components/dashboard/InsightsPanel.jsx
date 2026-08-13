import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb, TrendingUp, TrendingDown, Clock, Tag, Star,
  AlertCircle, DollarSign, CalendarDays, Sparkles, Target, Flame, BadgePercent
} from 'lucide-react';
import moment from 'moment';

export default function InsightsPanel({ designs, orders, likes }) {
  const approvedDesigns = designs.filter(d => d.status === 'aprovado');
  const draftDesigns = designs.filter(d => d.status === 'rascunho');
  const pendingDesigns = designs.filter(d => d.status === 'pendente');

  // Likes per design
  const likeMap = {};
  likes.forEach(l => { likeMap[l.design_id] = (likeMap[l.design_id] || 0) + 1; });

  // Sales per design + units
  const salesMap = {};
  const salesQtyMap = {};
  const salesDesignIds = new Set();
  orders.forEach(o => o.items?.forEach(it => {
    if (it.design_id) {
      salesMap[it.design_id] = (salesMap[it.design_id] || 0) + 1;
      salesQtyMap[it.design_id] = (salesQtyMap[it.design_id] || 0) + (it.quantity || 1);
      salesDesignIds.add(it.design_id);
    }
  }));

  const totalUnitsSold = Object.values(salesQtyMap).reduce((a, b) => a + b, 0);
  const totalLikes = likes.length;

  // Conversion rate: likes -> sales (engagement efficiency)
  const conversionRate = totalLikes > 0 ? (totalUnitsSold / totalLikes) * 100 : 0;

  // Average price: sold vs unsold approved designs
  const avgPriceSold = (() => {
    const sold = designs.filter(d => salesDesignIds.has(d.id) && d.price_base);
    if (!sold.length) return null;
    return sold.reduce((s, d) => s + (d.price_base || 0), 0) / sold.length;
  })();
  const avgPriceUnsold = (() => {
    const unsold = approvedDesigns.filter(d => !salesDesignIds.has(d.id) && d.price_base);
    if (!unsold.length) return null;
    return unsold.reduce((s, d) => s + (d.price_base || 0), 0) / unsold.length;
  })();

  // Overpriced unsold: approved, 0 sales, price above sold average
  const overpriced = avgPriceSold
    ? approvedDesigns
        .filter(d => !salesDesignIds.has(d.id) && (d.price_base || 0) > avgPriceSold * 1.3)
        .sort((a, b) => (b.price_base || 0) - (a.price_base || 0))
        .slice(0, 1)
    : [];

  // Best weekday for sales
  const weekdayCount = [0, 0, 0, 0, 0, 0, 0];
  orders.forEach(o => {
    if (o.created_date) weekdayCount[moment(o.created_date).isoWeekday() - 1]++;
  });
  const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const bestWeekdayIdx = weekdayCount.indexOf(Math.max(...weekdayCount));
  const hasWeekdayData = Math.max(...weekdayCount) > 0;

  // Sales trend: last 4 weeks vs previous 4 weeks
  const recent4 = moment().subtract(3, 'weeks').startOf('isoWeek');
  const prev4 = moment().subtract(7, 'weeks').startOf('isoWeek');
  const recentSales = orders.filter(o => moment(o.created_date).isAfter(recent4)).length;
  const prevSales = orders.filter(o =>
    moment(o.created_date).isBetween(prev4, recent4, null, '[)')
  ).length;
  const trendDelta = prevSales > 0 ? ((recentSales - prevSales) / prevSales) * 100 : (recentSales > 0 ? 100 : 0);

  // Category with most sales
  const catSales = {};
  orders.forEach(o => o.items?.forEach(it => {
    const design = designs.find(d => d.id === it.design_id);
    if (design) catSales[design.category] = (catSales[design.category] || 0) + (it.quantity || 1);
  }));
  const topCategory = Object.entries(catSales).sort((a, b) => b[1] - a[1])[0];

  // Hidden gems: most liked, approved, no sales
  const hiddenGems = designs
    .filter(d => likeMap[d.id] > 0 && !salesDesignIds.has(d.id) && d.status === 'aprovado')
    .sort((a, b) => (likeMap[b.id] || 0) - (likeMap[a.id] || 0))
    .slice(0, 1);

  // Top liked not featured
  const topLikedNotFeatured = designs
    .filter(d => likeMap[d.id] > 0 && !d.is_featured && d.status === 'aprovado')
    .sort((a, b) => (likeMap[b.id] || 0) - (likeMap[a.id] || 0))
    .slice(0, 1);

  // Designs with zero likes (low engagement)
  const zeroLikeDesigns = approvedDesigns.filter(d => !likeMap[d.id]);

  // Untagged designs (missing tags)
  const untaggedDesigns = designs.filter(d => !d.tags || d.tags.length === 0);

  // Summary metrics
  const summary = [
    { label: 'Taxa de conversão', value: `${conversionRate.toFixed(1)}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Curtidas', value: totalLikes, icon: Star, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Unidades vendidas', value: totalUnitsSold, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Ticket médio', value: avgPriceSold ? `R$ ${avgPriceSold.toFixed(0)}` : '—', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const insights = [];

  // 1. Sales trend
  if (recentSales > 0 || prevSales > 0) {
    const growing = trendDelta >= 0;
    insights.push({
      icon: growing ? TrendingUp : TrendingDown,
      color: growing ? 'text-emerald-600' : 'text-rose-600',
      bg: growing ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100',
      badge: growing ? 'Crescendo' : 'Atenção',
      badgeColor: growing ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
      title: growing
        ? `Vendas em alta: +${trendDelta.toFixed(0)}% nas últimas 4 semanas`
        : `Vendas caíram ${Math.abs(trendDelta).toFixed(0)}% nas últimas 4 semanas`,
      tip: growing
        ? 'Mantenha o ritmo! Continue publicando designs na categoria que está performando e considere investir em destaque para acelerar ainda mais.'
        : 'Quebre o padrão: publique um novo design, promova suas joias escondidas nas redes sociais ou crie uma coleção temática para reativar o interesse.'
    });
  }

  // 2. Conversion rate
  if (totalLikes > 0) {
    const lowConversion = conversionRate < 5;
    insights.push({
      icon: Target,
      color: lowConversion ? 'text-amber-600' : 'text-emerald-600',
      bg: lowConversion ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100',
      badge: lowConversion ? 'Baixa conversão' : 'Boa conversão',
      badgeColor: lowConversion ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
      title: `Taxa de conversão de curtidas em vendas: ${conversionRate.toFixed(1)}%`,
      tip: lowConversion
        ? `Você tem ${totalLikes} curtidas mas apenas ${totalUnitsSold} venda(s). Para converter, ajuste preços de designs populares, use coleções para aumentar o ticket e divulgue suas joias escondidas.`
        : 'Seu engajamento está se convertendo bem em vendas. Continue investindo nos designs que geram curtidas — eles são seu ativo mais valioso.'
    });
  }

  // 3. Draft designs
  if (draftDesigns.length > 0) {
    insights.push({
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      badge: 'Ação necessária',
      badgeColor: 'bg-amber-100 text-amber-700',
      title: `${draftDesigns.length} design(s) em rascunho`,
      tip: 'Publique seus rascunhos para aumentar sua visibilidade na plataforma e alcançar mais compradores.'
    });
  }

  // 4. Pending designs
  if (pendingDesigns.length > 0) {
    insights.push({
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      badge: 'Em revisão',
      badgeColor: 'bg-blue-100 text-blue-700',
      title: `${pendingDesigns.length} design(s) aguardando aprovação`,
      tip: 'Designs pendentes costumam ser aprovados em até 48h. Enquanto isso, prepare seus próximos trabalhos!'
    });
  }

  // 5. Top category
  if (topCategory) {
    insights.push({
      icon: Flame,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-100',
      badge: 'Categoria quente',
      badgeColor: 'bg-purple-100 text-purple-700',
      title: `"${topCategory[0]}" é sua categoria mais vendida`,
      tip: `Você vendeu ${topCategory[1]} unidades nessa categoria. Crie mais designs ${topCategory[0]} para capitalizar nessa tendência e amplie com uma coleção temática.`
    });
  }

  // 6. Hidden gems
  if (hiddenGems.length > 0) {
    const gem = hiddenGems[0];
    insights.push({
      icon: Sparkles,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      badge: 'Joia escondida',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      title: `"${gem.title}" tem ${likeMap[gem.id]} curtida(s) mas nenhuma venda`,
      tip: 'Esse design tem alto engajamento! Promova-o nas redes sociais, destaque-o no perfil ou ajuste o preço para converter curtidas em vendas.'
    });
  }

  // 7. Overpriced unsold
  if (overpriced.length > 0) {
    const op = overpriced[0];
    insights.push({
      icon: BadgePercent,
      color: 'text-orange-600',
      bg: 'bg-orange-50 border-orange-100',
      badge: 'Revisar preço',
      badgeColor: 'bg-orange-100 text-orange-700',
      title: `"${op.title}" está sem vendas e custa R$ ${(op.price_base || 0).toFixed(2)}`,
      tip: `Seu preço médio de venda é R$ ${avgPriceSold.toFixed(2)}. Considere reduzir o preço deste design ou oferecer um desconto temporário para atrair o primeiro comprador.`
    });
  }

  // 8. Top liked not featured
  if (topLikedNotFeatured.length > 0) {
    const tf = topLikedNotFeatured[0];
    insights.push({
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 border-yellow-100',
      badge: 'Destacar',
      badgeColor: 'bg-yellow-100 text-yellow-700',
      title: `"${tf.title}" é seu design mais curtido sem destaque`,
      tip: `Com ${likeMap[tf.id]} curtida(s), esse design merece ser destacado no seu perfil. Designs em destaque recebem até 2x mais visualizações e conversões.`
    });
  }

  // 9. Best weekday
  if (hasWeekdayData) {
    insights.push({
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      badge: 'Melhor dia',
      badgeColor: 'bg-blue-100 text-blue-700',
      title: `${weekdayNames[bestWeekdayIdx]} é seu melhor dia de vendas`,
      tip: 'Publique novos designs e divulgue suas coleções nesse dia para maximizar o impacto. Considere lançar campanhas e novidades perto desse horário.'
    });
  }

  // 10. Zero likes
  if (zeroLikeDesigns.length > 0 && approvedDesigns.length >= 3) {
    insights.push({
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      badge: 'Baixo engajamento',
      badgeColor: 'bg-rose-100 text-rose-700',
      title: `${zeroLikeDesigns.length} design(s) aprovado(s) sem curtidas`,
      tip: 'Reveja títulos, descrições e tags desses designs. Boas tags e descrições detalhadas melhoram a busca e aumentam as chances de serem curtidos.'
    });
  }

  // 11. Untagged
  if (untaggedDesigns.length > 0) {
    insights.push({
      icon: Tag,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      badge: 'Otimização',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      title: `${untaggedDesigns.length} design(s) sem tags`,
      tip: 'Adicione tags relevantes (estilo, tema, cores) para melhorar a encontrabilidade na busca. Designs com 3+ tags recebem mais visualizações.'
    });
  }

  // 12. Portfolio size
  if (approvedDesigns.length < 5) {
    insights.push({
      icon: Tag,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      badge: 'Dica de portfólio',
      badgeColor: 'bg-rose-100 text-rose-700',
      title: 'Expanda seu portfólio',
      tip: 'Artistas com 10+ designs aprovados vendem, em média, 3x mais. Publique mais designs para crescer seu alcance!'
    });
  }

  // 13. General tip - collections
  insights.push({
    icon: Lightbulb,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-100',
    badge: 'Dica geral',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    title: 'Use coleções para aumentar ticket médio',
    tip: 'Agrupe designs relacionados em coleções temáticas. Compradores que descobrem coleções tendem a comprar múltiplos itens de uma vez.'
  });

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights list */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Dicas para Impulsionar suas Vendas
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Recomendações personalizadas baseadas no seu desempenho histórico, curtidas e padrões de venda.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {insights.map((ins, i) => {
              const Icon = ins.icon;
              return (
                <div key={i} className={`flex gap-4 p-4 rounded-2xl border ${ins.bg}`}>
                  <div className="mt-0.5 shrink-0">
                    <Icon className={`w-5 h-5 ${ins.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{ins.title}</span>
                      <Badge className={`text-xs px-2 py-0.5 rounded-full ${ins.badgeColor} border-0`}>
                        {ins.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{ins.tip}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}