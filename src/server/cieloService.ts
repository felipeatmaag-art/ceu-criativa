/**
 * Céu Criativa - Integração Segura Cielo 3.0 & Split de Pagamento
 * NUNCA armazena número de cartão ou CVV em texto puro ou logs
 * Sem fallback simulado em ambiente de produção
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CieloCheckoutPayload {
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  totalAmount: number;
  installments?: number;
  customer: {
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
  };
  shippingAddress: {
    street: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipcode: string;
  };
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    artist_id?: string;
    commission_rate?: number;
  }>;
  card?: {
    cardNumber: string;
    holder: string;
    expirationDate: string;
    securityCode: string;
    brand?: string;
  };
}

export interface PaymentConfig {
  pixKey: string;
  pixKeyType: string;
  merchantName: string;
  merchantCity: string;
  whatsapp: string;
  cieloMerchantId: string;
  cieloMerchantKey: string;
  cieloEnvironment: 'sandbox' | 'production';
  cieloSoftDescriptor: string;
  cieloMaxInstallments: number;
  splitEnabled: boolean;
  platformFeeType: 'percentage' | 'fixed';
  platformFeeValue: number;
  subordinatedPartners: any[];
  geminiApiKey?: string;
  updatedAt?: string;
}

const DEFAULT_CONFIG: PaymentConfig = {
  pixKey: 'felipeatmaag@gmail.com',
  pixKeyType: 'email',
  merchantName: 'FELIPE SILVERIO CEU',
  merchantCity: 'BALNEARIO CAMBORIU',
  whatsapp: '5547999999999',
  cieloMerchantId: process.env.CIELO_MERCHANT_ID || '',
  cieloMerchantKey: process.env.CIELO_MERCHANT_KEY || '',
  cieloEnvironment: (process.env.CIELO_ENVIRONMENT as any) || 'sandbox',
  cieloSoftDescriptor: 'CEU CRIATIVA',
  cieloMaxInstallments: 12,
  splitEnabled: true,
  platformFeeType: 'percentage',
  platformFeeValue: 15,
  subordinatedPartners: [
    {
      artistId: '69431e0c00397efc6e14e9e0',
      artistName: 'Felipe Silvério',
      subordinatedMerchantId: 'a3d4f5b6-7890-4123-8abc-def012345678',
      status: 'active'
    }
  ]
};

const CONFIG_PATHS = [
  path.resolve(process.cwd(), 'data/payment_config.json'),
  path.resolve(process.cwd(), 'public/api/payment_config.json')
];

export function getPaymentConfig(): PaymentConfig {
  for (const p of CONFIG_PATHS) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_CONFIG, ...parsed };
      } catch (e) {
        console.warn('Erro ao ler', p, e);
      }
    }
  }
  return DEFAULT_CONFIG;
}

export function savePaymentConfig(newConfig: Partial<PaymentConfig>): PaymentConfig {
  const current = getPaymentConfig();
  const merged: PaymentConfig = {
    ...current,
    ...newConfig,
    updatedAt: new Date().toISOString()
  };

  // Se veio chave vazia mas já existia salva, não sobrescreve com vazio
  if (!newConfig.cieloMerchantKey && current.cieloMerchantKey) {
    merged.cieloMerchantKey = current.cieloMerchantKey;
  }

  for (const p of CONFIG_PATHS) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(p, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Erro ao salvar config de pagamento em', p, e);
    }
  }

  return merged;
}

export function detectCardBrand(number: string): string {
  const clean = (number || '').replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Master';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|650|6516|6550)/.test(clean)) return 'Elo';
  if (/^(606282|3841)/.test(clean)) return 'Hipercard';
  return 'Visa';
}

export function formatExpirationDate(exp: string): string {
  const clean = (exp || '').replace(/\D/g, '');
  if (clean.length === 4) {
    const mm = clean.slice(0, 2);
    const yy = clean.slice(2, 4);
    return `${mm}/20${yy}`;
  }
  if (clean.length === 6) {
    return `${clean.slice(0, 2)}/${clean.slice(2, 6)}`;
  }
  return exp;
}

// Consulta de Venda na Cielo para validação idempotente de Webhook
export async function consultCieloSale(paymentId: string): Promise<any | null> {
  if (!paymentId) return null;
  const config = getPaymentConfig();
  const merchantId = (config.cieloMerchantId || process.env.CIELO_MERCHANT_ID || '').trim();
  const merchantKey = (config.cieloMerchantKey || process.env.CIELO_MERCHANT_KEY || '').trim();
  const isProduction = (config.cieloEnvironment || process.env.CIELO_ENVIRONMENT) === 'production';

  if (!merchantId || !merchantKey) {
    return null;
  }

  const queryUrl = isProduction
    ? `https://apiquery.cieloecommerce.cielo.com.br/1/sales/${paymentId}`
    : `https://apiquerysandbox.cieloecommerce.cielo.com.br/1/sales/${paymentId}`;

  try {
    const res = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'MerchantId': merchantId,
        'MerchantKey': merchantKey,
        'RequestId': crypto.randomUUID()
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err: any) {
    console.error('Falha ao consultar venda Cielo:', err.message);
    return null;
  }
}

export async function processCieloPayment(payload: CieloCheckoutPayload, orderNumber: string) {
  const config = getPaymentConfig();

  const merchantId = (config.cieloMerchantId || process.env.CIELO_MERCHANT_ID || '').trim();
  const merchantKey = (config.cieloMerchantKey || process.env.CIELO_MERCHANT_KEY || '').trim();
  const isProduction = (config.cieloEnvironment || process.env.CIELO_ENVIRONMENT) === 'production';
  const isNodeProduction = process.env.NODE_ENV === 'production';

  const baseUrl = isProduction
    ? 'https://api.cieloecommerce.cielo.com.br/1/sales/'
    : 'https://apisandbox.cieloecommerce.cielo.com.br/1/sales/';

  const amountInCents = Math.round(payload.totalAmount * 100);
  const cleanCpf = (payload.customer.cpf || '').replace(/\D/g, '') || '11111111111';
  const cleanZip = (payload.shippingAddress.zipcode || '').replace(/\D/g, '') || '01310100';

  // -------------------------------------------------------------
  // Cálculo de Split de Pagamento Marketplace Cielo 3.0
  // -------------------------------------------------------------
  let splitsArray: any[] = [];
  if (config.splitEnabled && Array.isArray(config.subordinatedPartners) && config.subordinatedPartners.length > 0) {
    const partner = config.subordinatedPartners.find((p: any) => p.status === 'active' && p.subordinatedMerchantId);
    if (partner) {
      let platformFeeCents = 0;
      if (config.platformFeeType === 'percentage') {
        const pct = Number(config.platformFeeValue) || 15;
        platformFeeCents = Math.round(amountInCents * (pct / 100));
      } else {
        const fixedVal = Number(config.platformFeeValue) || 10;
        platformFeeCents = Math.round(fixedVal * 100);
      }

      const subordinateCents = Math.max(0, amountInCents - platformFeeCents);
      if (subordinateCents > 0) {
        splitsArray.push({
          SubordinatedMerchantId: partner.subordinatedMerchantId,
          Amount: subordinateCents,
          Fares: {
            Mdr: 0,
            Fee: 0
          }
        });
      }
    }
  }

  // -------------------------------------------------------------
  // Chamada Real à API Cielo 3.0 (se chaves configuradas)
  // -------------------------------------------------------------
  if (merchantId && merchantKey) {
    try {
      const cieloBody: any = {
        MerchantOrderId: orderNumber,
        Customer: {
          Name: payload.customer.name,
          Email: payload.customer.email,
          Identity: cleanCpf,
          IdentityType: 'CPF',
          DeliveryAddress: {
            Street: payload.shippingAddress.street,
            Number: payload.shippingAddress.number || 'SN',
            Complement: payload.shippingAddress.complement || '',
            ZipCode: cleanZip,
            City: payload.shippingAddress.city,
            State: payload.shippingAddress.state,
            Country: 'BRA'
          }
        }
      };

      if (payload.paymentMethod === 'credit_card' && payload.card) {
        const brand = payload.card.brand || detectCardBrand(payload.card.cardNumber);
        cieloBody.Payment = {
          Type: 'CreditCard',
          Amount: amountInCents,
          Installments: Number(payload.installments) || 1,
          SoftDescriptor: (config.cieloSoftDescriptor || 'CEU CRIATIVA').slice(0, 13),
          Capture: true,
          CreditCard: {
            CardNumber: payload.card.cardNumber.replace(/\D/g, ''),
            Holder: payload.card.holder.trim().toUpperCase(),
            ExpirationDate: formatExpirationDate(payload.card.expirationDate),
            SecurityCode: payload.card.securityCode.trim(),
            Brand: brand
          }
        };

        if (splitsArray.length > 0) {
          cieloBody.Payment.Splits = splitsArray;
        }
      } else if (payload.paymentMethod === 'pix') {
        cieloBody.Payment = {
          Type: 'Pix',
          Amount: amountInCents
        };
      } else if (payload.paymentMethod === 'boleto') {
        cieloBody.Payment = {
          Type: 'Boleto',
          Amount: amountInCents,
          Provider: 'Bradesco2',
          Instructions: 'Não receber após o vencimento'
        };
      }

      const cieloResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'MerchantId': merchantId,
          'MerchantKey': merchantKey,
          'RequestId': crypto.randomUUID()
        },
        body: JSON.stringify(cieloBody)
      });

      const data = await cieloResponse.json();

      if (!cieloResponse.ok) {
        const errMsg = Array.isArray(data)
          ? data.map((d: any) => d.Message).join(', ')
          : (data.Message || 'Erro retornado pela Cielo.');
        
        // Em produção ou caso real, retorna falha imediata SEM criar pedido pago
        return {
          success: false,
          isApproved: false,
          status: 'denied',
          returnCode: data.Payment?.ReturnCode || '99',
          returnMessage: errMsg,
          error: errMsg
        };
      }

      const payment = data.Payment || {};
      const status = payment.Status;
      const isApproved = status === 1 || status === 2;

      return {
        success: isApproved || status === 12,
        isApproved,
        status: isApproved ? 'paid' : status === 12 ? 'pending' : 'denied',
        paymentId: payment.PaymentId,
        tid: payment.Tid,
        authCode: payment.AuthorizationCode,
        proofOfSale: payment.ProofOfSale,
        returnCode: payment.ReturnCode,
        returnMessage: payment.ReturnMessage || (isApproved ? 'Transação autorizada com sucesso pela Cielo' : 'Pagamento não autorizado'),
        qrCodeBase64: payment.QrCodeBase64Image,
        qrCodeString: payment.QrCodeString,
        splitApplied: splitsArray.length > 0,
        cardBrand: payload.card ? (payload.card.brand || detectCardBrand(payload.card.cardNumber)) : undefined,
        cardLast4: payload.card ? payload.card.cardNumber.replace(/\D/g, '').slice(-4) : undefined
      };
    } catch (err: any) {
      console.error('Falha na comunicação direta da Cielo:', err.message);
      // Se estamos em produção, falhar com erro e NUNCA gerar pedido pago simulado
      if (isProduction || isNodeProduction) {
        return {
          success: false,
          isApproved: false,
          status: 'failed',
          returnCode: '99',
          returnMessage: `Falha de conexão com a Cielo: ${err.message}`,
          error: `Falha de conexão com a Cielo: ${err.message}`
        };
      }
    }
  } else if (isProduction || isNodeProduction) {
    // Produção sem credenciais configuradas: ERRO ESTRITO
    return {
      success: false,
      isApproved: false,
      status: 'failed',
      returnCode: '98',
      returnMessage: 'Credenciais de pagamento Cielo não configuradas para o ambiente de produção.',
      error: 'Credenciais de pagamento Cielo não configuradas para o ambiente de produção.'
    };
  }

  // -------------------------------------------------------------
  // MODO SANDBOX LOCAL / TESTE SEGURO
  // Ativo ESTRITAMENTE quando NODE_ENV !== "production" E CIELO_ENVIRONMENT === "sandbox"
  // -------------------------------------------------------------
  if (isProduction || isNodeProduction) {
    return {
      success: false,
      isApproved: false,
      status: 'failed',
      returnMessage: 'Modo simulado desativado em ambiente de produção.'
    };
  }

  const paymentId = crypto.randomUUID();
  const tid = '10' + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000);
  const authCode = Math.floor(100000 + Math.random() * 900000).toString();
  const nsu = Math.floor(100000000 + Math.random() * 900000000).toString();

  if (payload.paymentMethod === 'credit_card') {
    const cardClean = payload.card?.cardNumber?.replace(/\D/g, '') || '';
    const isDeclinedTest = cardClean.endsWith('0000');

    if (isDeclinedTest) {
      return {
        success: false,
        isApproved: false,
        status: 'denied',
        paymentId,
        returnCode: '05',
        returnMessage: 'Não autorizada. Verifique os dados do cartão ou limite disponível.'
      };
    }

    return {
      success: true,
      isApproved: true,
      status: 'paid',
      paymentId,
      tid,
      authCode,
      proofOfSale: nsu,
      returnCode: '00',
      returnMessage: 'Transação autorizada com sucesso (Modo Sandbox de Desenvolvimento)',
      cardBrand: payload.card?.brand || detectCardBrand(payload.card?.cardNumber || ''),
      cardLast4: cardClean.slice(-4) || '1234',
      splitApplied: splitsArray.length > 0
    };
  }

  if (payload.paymentMethod === 'pix') {
    const pixKey = config.pixKey || 'felipeatmaag@gmail.com';
    const qrCodeString = `00020126580014BR.GOV.BCB.PIX0136${pixKey}5204000053039865406${payload.totalAmount.toFixed(2)}5802BR5912CEU CRIATIVA6009SAO PAULO62070503***6304`;
    const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="#ffffff"/><path d="M20 20h50v50h-50zM30 30h30v30h-30zM130 20h50v50h-50zM140 30h30v30h-30zM20 130h50v50h-50zM30 140h30v30h-30zM80 30h20v20h-20zM90 60h20v20h-20zM30 90h20v20h-20zM80 90h40v40h-40zM140 90h20v20h-20zM90 140h20v20h-20zM130 130h20v20h-20zM160 140h20v40h-20zM130 170h20v10h-20z" fill="#002D72"/></svg>`;
    const qrCodeBase64 = 'data:image/svg+xml;base64,' + Buffer.from(qrSvg).toString('base64');

    return {
      success: true,
      isApproved: false,
      status: 'pending',
      paymentId,
      tid,
      qrCodeString,
      qrCodeBase64,
      returnCode: '12',
      returnMessage: 'Pix gerado com sucesso. Aguardando pagamento.'
    };
  }

  // Boleto Bancário
  const boletoBarCode = '23793.38128 60000.000004 01000.644208 1 ' + Math.floor(10000000000000 + Math.random() * 90000000000000);
  return {
    success: true,
    isApproved: false,
    status: 'pending',
    paymentId,
    tid,
    boletoBarCode,
    boletoUrl: `https://cielo.com.br/boleto/${paymentId}`,
    returnCode: '12',
    returnMessage: 'Boleto bancário gerado com sucesso.'
  };
}
