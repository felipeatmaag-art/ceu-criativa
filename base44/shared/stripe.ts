export async function stripeRequest(secretKey, path, options = {}) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Stripe-Version': '2025-10-29.clover',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Falha ao processar pagamento');
  return data;
}