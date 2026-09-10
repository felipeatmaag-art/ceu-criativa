import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Palette, Shirt } from 'lucide-react';

const sections = [
  { title: 'Perguntas frequentes', icon: HelpCircle, items: [
    ['Como começo a vender?', 'Crie sua estampa, aplique em um produto base, revise o mockup e publique. A arte passa a aparecer na sua vitrine após aprovação.'],
    ['Como recebo minhas comissões?', 'As comissões de pedidos entregues aparecem no Painel do Artista. Quando houver saldo disponível, use o botão Solicitar pagamento.'],
    ['Posso editar uma estampa publicada?', 'Sim. Acesse Minhas Estampas para atualizar dados ou ocultar a arte da vitrine.'] ] },
  { title: 'Guias de criação de arte', icon: Palette, items: [
    ['Prepare um arquivo de qualidade', 'Prefira PNG com fundo transparente, boa resolução e elementos dentro da área segura de impressão.'],
    ['Posicione a estampa', 'Use o estúdio para mover, ampliar e girar a arte. Revise frente e costas antes de salvar.'],
    ['Revise o resultado', 'Confira legibilidade, contraste, margens e o arquivo de produção antes de publicar.'] ] },
  { title: 'Impressão sob demanda', icon: Shirt, items: [
    ['Como funciona a produção?', 'O produto físico só entra em produção após a confirmação do pagamento e a reserva automática do estoque.'],
    ['O que acontece depois da compra?', 'O pedido passa por pagamento, produção, envio e entrega. Cada mudança aparece em Meus Pedidos e Notificações.'],
    ['Quem cuida do estoque?', 'A equipe administra quantidades por produto, cor e tamanho. Estampas digitais não possuem limite de estoque.'] ] }
];

export default function SupportContent() {
  return <div className="grid gap-5 lg:grid-cols-3">{sections.map(({ title, icon: Icon, items }) => <section key={title} className="rounded-3xl border bg-card p-6 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ceu-aqua/15 text-ceu-navy"><Icon className="h-5 w-5"/></div><h2 className="text-lg font-bold text-foreground">{title}</h2></div><Accordion type="single" collapsible>{items.map(([question, answer]) => <AccordionItem key={question} value={question}><AccordionTrigger className="text-left text-sm">{question}</AccordionTrigger><AccordionContent className="leading-6 text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}</Accordion></section>)}</div>;
}