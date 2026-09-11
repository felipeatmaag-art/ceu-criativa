# Céu Criativa — backend portátil

Pacote de referência para migração do backend gerenciado. Copie esta pasta para `/backend-export` no repositório externo.

## Conteúdo
- `schema.sql`: modelo relacional PostgreSQL.
- `routes.md`: contrato das rotas REST.
- `pod-core.mjs`: composição e precificação POD sem dependências.
- `stripe-webhook.mjs`: handler Stripe em Node.js com dependências injetadas.
- `Ceu-Criativa.postman_collection.json`: coleção Postman com autenticação, rotas e payloads de teste.

## Variáveis
Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `APP_ORIGIN`, `ALLOWED_ORIGINS`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_POD_WEBHOOK_SECRET` e `BASE44_APP_ID`.

`ALLOWED_ORIGINS` aceita uma lista separada por vírgulas, permitindo trocar ou adicionar domínios personalizados sem alterar código.

As funções puras usam ESM e Node.js 20+. O adaptador HTTP e a persistência devem ser conectados pelo projeto de destino.

## Catálogo e margens
Categorias são globais e ordenadas por `position_order`. Coleções pertencem ao artista e mantêm `design_ids` na ordem visual. A precificação usa `preço final = custo base + margem do artista + taxa da plataforma`; a taxa é derivada da comissão central do artista e recalculada no servidor em cada venda.