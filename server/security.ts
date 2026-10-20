import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";

// Encryption secret for data at rest (AES-256-CBC)
const ENCRYPTION_SECRET = process.env.DATA_ENCRYPTION_KEY || process.env.SESSION_SECRET || "ceu-criativa-security-key-32-chars-ok!";
const DERIVED_KEY = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest();

export function encryptAtRest(plainText: string): string {
  if (!plainText || typeof plainText !== "string") return plainText;
  if (plainText.startsWith("enc:")) return plainText; // Already encrypted
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", DERIVED_KEY, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `enc:${iv.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("Falha ao criptografar dado em repouso:", err);
    return plainText;
  }
}

export function decryptAtRest(cipherText: string): string {
  if (!cipherText || typeof cipherText !== "string") return cipherText;
  if (!cipherText.startsWith("enc:")) return cipherText; // Not encrypted
  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) return cipherText;
    const iv = Buffer.from(parts[1], "hex");
    const encryptedHex = parts[2];
    const decipher = crypto.createDecipheriv("aes-256-cbc", DERIVED_KEY, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Falha ao descriptografar dado:", err);
    return "";
  }
}

// Password hashing
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  if (!plainPassword || !hash) return false;
  return bcrypt.compare(plainPassword, hash);
}

// Session Token Generation & Verification (HMAC SHA-256 signed tokens)
const JWT_SECRET = process.env.SESSION_SECRET || "ceu-criativa-session-secret-2026";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  app_role?: string;
  exp: number; // timestamp ms
}

export function generateSessionToken(user: { id: string; email: string; role: string; app_role?: string }, expiresInHours = 24): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role || "customer",
    app_role: user.app_role || user.role || "customer",
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(payloadBase64).digest("base64url");
  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(payloadBase64).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }
  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8"));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Allowed CORS origins
const ALLOWED_ORIGINS = [
  "https://www.seuceu.com.br",
  "https://seuceu.com.br",
  "https://www.seuceu.art.br",
  "https://seuceu.art.br",
];

export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true; // Non-browser / same-origin requests
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Dev & Cloud Run environments
  if (
    process.env.NODE_ENV !== "production" ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.endsWith(".run.app") ||
    origin.endsWith(".aistudio.google")
  ) {
    return true;
  }
  return false;
}

// Rate limiters
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas por IP
  message: { error: "Muitas tentativas de login. Aguarde 15 minutos antes de tentar novamente." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const checkoutRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 tentativas por IP
  message: { error: "Limite de tentativas de checkout atingido. Aguarde alguns minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 uploads por 15 min
  message: { error: "Limite de uploads temporariamente atingido. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const geminiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // 20 requisições por minuto por IP
  message: { error: "Limite de requisições de Inteligência Artificial atingido. Aguarde 1 minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Limite geral de requisições por IP atingido." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sensitive data filtering for LGPD & Privacy
export function sanitizeUserOutput(user: any, requestingUser?: { id: string; role: string } | null): any {
  if (!user || typeof user !== "object") return user;
  const isSelf = requestingUser && requestingUser.id === user.id;
  const isAdmin = requestingUser && requestingUser.role === "admin";

  const clean = { ...user };
  delete clean.password_hash;
  delete clean.password;

  // Se for o próprio usuário ou um admin, descriptografa para uso
  if (isSelf || isAdmin) {
    if (clean.cpf) clean.cpf = decryptAtRest(clean.cpf);
    if (clean.pix_key) clean.pix_key = decryptAtRest(clean.pix_key);
    return clean;
  }

  // Usuários de terceiros ou visitantes: campos sensíveis NUNCA são expostos
  delete clean.cpf;
  delete clean.pix_key;
  delete clean.phone;
  delete clean.email;
  delete clean.address;
  return clean;
}

export function sanitizeOrderOutput(order: any, requestingUser?: { id: string; role: string } | null): any {
  if (!order || typeof order !== "object") return order;
  const isOwner = requestingUser && order.customer_id && requestingUser.id === order.customer_id;
  const isOwnerByEmail = requestingUser && order.customer_email && requestingUser.id && (order.customer_email === requestingUser.id);
  const isAdmin = requestingUser && requestingUser.role === "admin";

  const clean = { ...order };
  if (isOwner || isOwnerByEmail || isAdmin) {
    if (clean.customer_cpf) clean.customer_cpf = decryptAtRest(clean.customer_cpf);
    return clean;
  }

  // Ocultar dados pessoais em ordens vistas por terceiros
  if (clean.customer_cpf) clean.customer_cpf = "***.***.***-**";
  if (clean.customer_phone) clean.customer_phone = "(**) *****-****";
  if (clean.customer_email) clean.customer_email = clean.customer_email.replace(/^(.{2})(.*)(@.*)$/, "$1***$3");
  delete clean.shipping_address;
  return clean;
}
