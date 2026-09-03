import { jsPDF } from 'jspdf';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const date = (value) => new Date(value).toLocaleDateString('pt-BR');
const month = (value) => new Date(`${value}-02T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

export default function createFinancialReport(summary) {
  const doc = new jsPDF();
  const left = 16;
  let y = 18;
  const ensureSpace = (height = 12) => {
    if (y + height > 282) { doc.addPage(); y = 18; }
  };
  const section = (title) => {
    ensureSpace(18);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(15, 23, 42);
    doc.text(title, left, y); y += 8;
  };
  const row = (columns, widths) => {
    ensureSpace(9);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
    let x = left;
    columns.forEach((value, index) => { doc.text(String(value), x, y, { maxWidth: widths[index] - 3 }); x += widths[index]; });
    doc.setDrawColor(226, 232, 240); doc.line(left, y + 3, 194, y + 3); y += 9;
  };

  doc.setFillColor(15, 23, 42); doc.roundedRect(12, 10, 186, 32, 3, 3, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  doc.text('Relatório financeiro', left, 25);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(`Céu Criativa • Gerado em ${new Date().toLocaleString('pt-BR')}`, left, 34);
  y = 54;

  section('Resumo');
  const metrics = [
    ['Saldo disponível', money(summary.available)], ['Em processamento', money(summary.processing)],
    ['Ganhos totais', money(summary.totalCommissions)], ['Vendas realizadas', String(summary.salesCount || 0)],
    ['Valor bruto das vendas', money(summary.grossSales)]
  ];
  metrics.forEach(([label, value]) => row([label, value], [112, 66]));
  y += 6;

  section('Evolução mensal — últimos 12 meses');
  row(['Mês', 'Ganhos', 'Vendas'], [88, 55, 35]);
  (summary.monthlyHistory || []).forEach((item) => row([month(item.month), money(item.earnings), item.sales || 0], [88, 55, 35]));
  y += 6;

  section('Repasses pendentes');
  const transactions = summary.pendingTransactions || [];
  if (!transactions.length) row(['Nenhum repasse pendente no momento.'], [178]);
  else {
    row(['Pedido', 'Data', 'Comissão', 'Status'], [52, 40, 48, 38]);
    transactions.forEach((item) => row([item.orderNumber || '—', date(item.date), money(item.commission), item.status || '—'], [52, 40, 48, 38]));
  }

  doc.setFontSize(8); doc.setTextColor(100, 116, 139);
  doc.text('Documento informativo para apoio à organização contábil.', left, 291);
  doc.save(`relatorio-financeiro-${new Date().toISOString().slice(0, 10)}.pdf`);
}