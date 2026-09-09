export async function tokenHash(token) {
  if (typeof token !== 'string' || token.length < 32 || token.length > 160) throw new Error('Identificação do checkout inválida.');
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))).map(v => v.toString(16).padStart(2, '0')).join('');
}