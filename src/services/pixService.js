/**
 * Serviço Oficial de Pagamento Pix e Checkout da Céu Criativa
 * Compatível com o padrão EMV do Banco Central do Brasil (BACEN)
 * Gera QR Code e código Pix Copia e Cola funcional em qualquer ambiente (HostGator ou Nuvem).
 */

const PAYMENT_STORAGE_KEY = 'ceu_payment_settings';
const ORDERS_STORAGE_KEY = 'ceu_orders';

export const DEFAULT_PAYMENT_CONFIG = {
  pixKey: 'felipeatmaag@gmail.com', // Chave Pix do Felipe Silvério / Céu Criativa
  pixKeyType: 'email', // email | cpf | cnpj | phone | random
  merchantName: 'FELIPE SILVERIO CEU',
  merchantCity: 'BALNEARIO CAMBORIU',
  whatsapp: '5547999999999', // Número para atendimento e envio de pedidos
  storeMode: 'production', // production | test
  mercadoPagoPublicKey: '',
  mercadoPagoAccessToken: '',
};

// Cálculo de CRC16 CCITT (Polinômio 0x1021) exigido pelo Banco Central
function getCRC16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function emvFormat(id, value) {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

export const pixService = {
  getConfig() {
    if (typeof window === 'undefined') return DEFAULT_PAYMENT_CONFIG;
    try {
      const stored = localStorage.getItem(PAYMENT_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PAYMENT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Erro ao ler configs de pagamento:', e);
    }
    return DEFAULT_PAYMENT_CONFIG;
  },

  saveConfig(newConfig) {
    if (typeof window === 'undefined') return;
    try {
      const merged = { ...this.getConfig(), ...newConfig };
      localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch (e) {
      console.warn('Erro ao salvar configs de pagamento:', e);
    }
  },

  /**
   * Gera o Pix Copia e Cola no padrão oficial BACEN BRCode
   */
  generatePixCode({ amount, orderNumber, description = 'Pedido Ceu Criativa' }) {
    const config = this.getConfig();
    const cleanKey = (config.pixKey || DEFAULT_PAYMENT_CONFIG.pixKey).trim();
    const cleanName = (config.merchantName || 'CEU CRIATIVA')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .slice(0, 25);
    const cleanCity = (config.merchantCity || 'BALNEARIO CAMBORIU')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .slice(0, 15);

    const formattedAmount = Number(amount || 0).toFixed(2);
    const cleanTxid = (orderNumber || 'PEDIDO')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 25) || 'CEU';

    // Campo 26: Informações da Conta do Comerciante (GUI + Chave Pix + Descrição)
    let merchantAccount = emvFormat('00', 'BR.GOV.BCB.PIX');
    merchantAccount += emvFormat('01', cleanKey);
    if (description) {
      merchantAccount += emvFormat('02', description.slice(0, 40));
    }

    // Montagem do Payload EMV
    let payload = '';
    payload += emvFormat('00', '01'); // Payload Format Indicator
    payload += emvFormat('01', '12'); // Point of Initiation: Dinâmico (12) ou Estático (11)
    payload += emvFormat('26', merchantAccount);
    payload += emvFormat('52', '0000'); // Merchant Category Code
    payload += emvFormat('53', '986');  // Moeda: Real Brasileiro (986)
    payload += emvFormat('54', formattedAmount); // Valor da transação
    payload += emvFormat('58', 'BR');   // País
    payload += emvFormat('59', cleanName); // Nome do Recebedor
    payload += emvFormat('60', cleanCity); // Cidade do Recebedor

    // Campo 62: Dados Adicionais (txid)
    const additionalData = emvFormat('05', cleanTxid);
    payload += emvFormat('62', additionalData);

    // Campo 63: CRC16
    payload += '6304';
    const crc = getCRC16(payload);
    const fullPixCode = `${payload}${crc}`;

    // URL do QR Code gerado em alta definição
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(fullPixCode)}`;

    return {
      pixCode: fullPixCode,
      qrCodeUrl,
      orderNumber: cleanTxid,
      amount: formattedAmount,
      pixKey: cleanKey,
      beneficiary: cleanName
    };
  },

  /**
   * Salva o pedido localmente para que apareça no histórico e nos relatórios de vendas
   */
  saveOrder(order) {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getOrders();
      const updated = [order, ...existing.filter(o => o.order_number !== order.order_number)];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao salvar pedido localmente:', e);
    }
  },

  getOrders() {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Monta o link para o cliente enviar o pedido direto pelo WhatsApp
   */
  getWhatsAppOrderLink(order) {
    const config = this.getConfig();
    const cleanPhone = (config.whatsapp || '').replace(/\D/g, '') || '5547999999999';
    
    const itemsList = (order.items || [])
      .map(it => `• ${it.quantity || 1}x ${it.title || it.name} (${it.size || 'M'}/${it.color || 'Preto'}) - R$ ${Number(it.price).toFixed(2)}`)
      .join('\n');

    const msg = 
      `*NOVO PEDIDO CÉU CRIATIVA #${order.order_number}*\n\n` +
      `*Cliente:* ${order.customer?.name || 'Cliente'}\n` +
      `*E-mail:* ${order.customer?.email || '-'}\n` +
      `*Telefone:* ${order.customer?.phone || '-'}\n\n` +
      `*Itens do Pedido:*\n${itemsList}\n\n` +
      `*Total:* R$ ${Number(order.total_amount || order.totalAmount || 0).toFixed(2)}\n` +
      `*Forma de Pagamento:* ${order.payment_method === 'pix' ? 'Pix (Aguardando comprovante)' : 'Cartão de Crédito'}\n` +
      `*Entrega em:* ${order.shipping_address?.street || ''}, ${order.shipping_address?.number || ''} - ${order.shipping_address?.city || ''}/${order.shipping_address?.state || ''}\n\n` +
      `Olá! Fiz este pedido no site seuceu.art.br e estou enviando para confirmação!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }
};
