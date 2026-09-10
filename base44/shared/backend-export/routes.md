# Rotas REST

## POST /pod/compositions
Autenticada. Corpo: `designId`, `productId`, `side`, `transform`, `artworkWidth`, `artworkHeight`, `artworkUrl`, `persist`. Retorna posição normalizada, escala, rotação, dimensões e DPI efetivo.

## POST /pod/quotes
Autenticada. Corpo: `productId`, `designId`, `quantity`. Retorna custo base, preço da arte, comissão, margem e total.

## POST /checkout/payment-intents
Pública com token efêmero do checkout. Valida produto, variação e estoque; cria pedido e PaymentIntent Stripe em BRL com captura manual.

## POST /checkout/complete
Pública com `orderId` e token efêmero. Confirma o PaymentIntent, debita estoque de forma idempotente e captura o pagamento.

## POST /artist/summary
Autenticada. Retorna visualizações, vendas, comissões, saldo disponível, histórico mensal e desempenho por estampa.

## POST /artist/payouts
Autenticada. Cria uma solicitação para todo o saldo disponível do artista.

## POST /competitions/submissions
Autenticada. Corpo: `competitionId`, `title`, `imageUrl`. Valida concurso ativo e limite de três artes por artista.

## POST /pod/export-300-dpi
Autenticada. Corpo: `designId`, `side`, `transform`, `artworkWidth`, `artworkHeight`. Retorna manifesto de produção, dimensões finais, DPI efetivo e link do PNG quando disponível.

## POST /webhooks/stripe
Pública, autenticada pela assinatura `Stripe-Signature`. Trata `payment_intent.amount_capturable_updated`, `payment_intent.succeeded`, `payment_intent.canceled` e `payment_intent.payment_failed`.