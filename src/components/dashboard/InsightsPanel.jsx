import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Clock, Tag, Star, AlertCircle } from 'lucide-react';

export default function InsightsPanel({ designs, orders, likes }) {
  const approvedDesigns = designs.filter(d => d.status === 'aprovado');
  const draftDesigns = designs.filter(d => d.status === 'rascunho');
  const pendingDesigns = designs.filter(d => d.status === 'pendente');

  // Category with most sales
  const catSales = {};
  orders.forEach(o => o.items?.forEach(it => {
    const design = designs.find(d => d.id === it.design_id);
    if (design) {
      catSales[design.category] = (catSales[design.category] || 0) + (it.quantity || 1);
    }
  }));
  const topCategory = Object.entries(catSales).sort((a, b) => b[1] - a[1])[0];

  // Design with most likes but 0 sales - potential
  const likeMap = {};
  likes.forEach(l => { likeMap[l.design_id] = (likeMap[l.design_id] || 0) + 1; });

  const salesDesignIds = new Set();
  orders.forEach(o => o.items?.forEach(it => { if (it.design_id) salesDesignIds.add(it.design_id); }));

  const hiddenGems = designs
    .filter(d => likeMap[d.id] > 0 && !salesDesignIds.has(d.id) && d.status === 'aprovado')
    .sort((a, b) => (likeMap[b.id] || 0) - (likeMap[a.id] || 0))
    .slice(0, 1);

  const insights = [];

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

  if (topCategory) {
    insights.push({
      icon: Star,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-100',
      badge: 'Categoria quente',
      badgeColor: 'bg-purple-100 text-purple-700',
      title: `"${topCategory[0]}" é sua categoria mais vendida`,
      tip: `Você vendeu ${topCategory[1]} unidades nessa categoria. Crie mais designs ${topCategory[0]} para capitalizar nessa tendência.`
    });
  }

  if (hiddenGems.length > 0) {
    const gem = hiddenGems[0];
    insights.push({
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      badge: 'Joia escondida',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      title: `"${gem.title}" tem ${likeMap[gem.id]} curtidas mas nenhuma venda`,
      tip: 'Esse design tem alto engajamento! Considere promovê-lo nas redes sociais ou ajustar o preço para converter curtidas em vendas.'
    });
  }

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
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Insights para Impulsionar suas Vendas
        </CardTitle>
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
  );
}