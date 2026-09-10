# Céu Criativa — backend portátil

Pacote de referência para migração do backend gerenciado. Copie esta pasta para `/backend-export` no repositório externo.

## Conteúdo
- `schema.sql`: modelo relacional PostgreSQL.
- `routes.md`: contrato das rotas REST.
- `pod-core.mjs`: composição e precificação POD sem dependências.
- `stripe-webhook.mjs`: handler Stripe em Node.js com dependências injetadas.

## Variáveis
`DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_POD_WEBHOOK_SECRET`, `BASE44_APP_ID`.

As funções puras usam ESM e Node.js 20+. O adaptador HTTP e a persistência devem ser conectados pelo projeto de destino.