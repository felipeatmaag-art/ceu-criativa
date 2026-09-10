import React from 'react';

const sections = [
  ['1. Uso da plataforma', 'A Céu Criativa conecta artistas e compradores para criação, divulgação e venda de produtos sob demanda. Cada pessoa é responsável pelas informações e conteúdos enviados em sua conta.'],
  ['2. Direitos autorais', 'O artista mantém a autoria de sua obra e declara possuir os direitos necessários para publicá-la e comercializá-la. Não é permitido enviar cópias, marcas ou personagens sem autorização.'],
  ['3. Licença para produção', 'Ao publicar uma estampa, o artista autoriza a Céu Criativa a exibi-la, gerar mockups e reproduzi-la exclusivamente para fabricar e entregar os produtos vendidos.'],
  ['4. Vendas e comissões', 'Preços, custos e comissão aplicável são apresentados no painel. O saldo fica disponível conforme o pedido avança e pode ser ajustado em caso de cancelamento, reembolso ou fraude.'],
  ['5. Impressão sob demanda', 'Cores e proporções podem apresentar pequenas variações próprias do processo produtivo. Arquivos fora dos padrões técnicos podem ser recusados antes da fabricação.'],
  ['6. Diretrizes da comunidade', 'Não aceitamos conteúdo ilegal, discriminatório, abusivo, enganoso ou que viole privacidade e propriedade intelectual. Denúncias serão analisadas e podem resultar na remoção da obra ou suspensão da conta.'],
  ['7. Compras e entregas', 'O comprador deve informar dados corretos para pagamento e entrega. Prazos são estimados e podem variar conforme produção, estoque e transportadora.'],
  ['8. Atualizações', 'Estes termos podem ser atualizados para refletir melhorias da plataforma ou mudanças legais. A versão vigente será sempre publicada nesta página.']
];

export default function TermsContent() {
  return <div className="grid gap-4 md:grid-cols-2">{sections.map(([title, text]) => <section key={title} className="rounded-2xl border bg-card p-6 shadow-sm"><h2 className="font-bold text-foreground">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p></section>)}</div>;
}