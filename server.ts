import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { entitiesStore } from "./server/entitiesStore";
import multer from "multer";
let sharp: any = null;
try {
  sharp = require("sharp");
} catch (_e) {
  console.warn("Aviso: Módulo 'sharp' não encontrado ou incompatível com este SO. Funções de recorte avançado de estampa rodarão em modo direto.");
}
import { processCieloPayment } from "./src/server/cieloService";

const PORT = Number(process.env.PORT) || 3000;
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Lazy initialization of GoogleGenAI
let genAIClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não foi configurada no ambiente.");
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Resilient generation with model fallback and timeout safeguard
async function generateWithFallback(
  ai: GoogleGenAI,
  models: string[],
  contents: any,
  config?: any,
  timeoutMs = 25000
) {
  let lastError: any = null;
  for (const model of models) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents,
        config: config && Object.keys(config).length > 0 ? config : undefined,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout na chamada do modelo ${model}`)), timeoutMs)
      );
      const res: any = await Promise.race([generatePromise, timeoutPromise]);
      return res;
    } catch (err: any) {
      lastError = err;
      console.warn(`Modelo ${model} falhou (${err?.message}), tentando fallback...`);
    }
  }
  throw lastError;
}

// Convert image URL or data URL to inlineData part
async function resolveImagePart(imageUrl: string): Promise<{ mimeType: string; data: string } | null> {
  if (!imageUrl) return null;

  if (imageUrl.startsWith("data:")) {
    const matches = imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches) {
      return {
        mimeType: matches[1],
        data: matches[2],
      };
    }
  }

  // Handle local /uploads/ URLs directly from filesystem
  if (imageUrl.startsWith("/uploads/")) {
    try {
      const cleanName = path.basename(imageUrl.split("?")[0]);
      const filePath = path.join(UPLOADS_DIR, cleanName);
      if (fs.existsSync(filePath)) {
        const fileBuffer = await fs.promises.readFile(filePath);
        const ext = path.extname(cleanName).toLowerCase();
        const mimeType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".webp" ? "image/webp" : "image/png";
        return {
          mimeType,
          data: fileBuffer.toString("base64"),
        };
      }
    } catch (err) {
      console.error("Erro ao ler upload local:", err);
    }
  }

  try {
    const urlToFetch = imageUrl.startsWith("http://") || imageUrl.startsWith("https://")
      ? imageUrl
      : `http://127.0.0.1:${PORT}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    const res = await fetch(urlToFetch);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/png";
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return {
      mimeType: contentType.split(";")[0],
      data: base64,
    };
  } catch (err) {
    console.error("Erro ao converter imagem de referência:", err);
    return null;
  }
}

async function startServer() {
  const app = express();

  // Universal CORS headers for canvas export and cross-origin iframe security
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Support large JSON payloads for base64 images / artwork
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Serve static mockups and uploads with explicit CORS and aliases
  const MOCKUPS_DIR = path.join(process.cwd(), "public", "mockups");
  const distMockups = path.join(process.cwd(), "dist", "mockups");
  const distUploads = path.join(process.cwd(), "dist", "uploads");

  if (fs.existsSync(distMockups)) {
    app.use(["/mockups", "/api/mockups"], express.static(distMockups, {
      setHeaders: (res) => { res.setHeader("Access-Control-Allow-Origin", "*"); }
    }));
  }
  app.use(["/mockups", "/api/mockups"], express.static(MOCKUPS_DIR, {
    setHeaders: (res) => { res.setHeader("Access-Control-Allow-Origin", "*"); }
  }));

  if (fs.existsSync(distUploads)) {
    app.use(["/uploads", "/api/uploads"], express.static(distUploads, {
      setHeaders: (res) => { res.setHeader("Access-Control-Allow-Origin", "*"); }
    }));
  }
  app.use(["/uploads", "/api/uploads"], express.static(UPLOADS_DIR, {
    setHeaders: (res) => { res.setHeader("Access-Control-Allow-Origin", "*"); }
  }));

  // Multer storage for multipart file uploads
  const multerStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const cleanFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${cleanFilename}`);
    },
  });
  const uploadMiddleware = multer({
    storage: multerStorage,
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "ceu-criativa-gemini" });
  });

  // Upload file endpoints (replaces base44 UploadFile & UploadPrivateFile)
  const uploadRoutes = [
    "/api/upload",
    "/api/apps/:appId/integration-endpoints/Core/UploadFile",
    "/api/apps/:appId/integration-endpoints/Core/UploadPrivateFile",
    "/apps/:appId/integration-endpoints/Core/UploadFile",
    "/apps/:appId/integration-endpoints/Core/UploadPrivateFile",
    "/integration-endpoints/Core/UploadFile",
    "/integration-endpoints/Core/UploadPrivateFile",
  ];

  app.post(uploadRoutes, uploadMiddleware.single("file"), async (req: any, res) => {
    try {
      // 1. Handled via Multer (multipart/form-data)
      if (req.file) {
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.json({
          file_url: fileUrl,
          url: fileUrl,
          file_uri: fileUrl,
          filename: req.file.originalname,
          size: req.file.size,
          mime_type: req.file.mimetype,
        });
      }

      // 2. Handled via JSON body (base64)
      const { data, filename, mimeType } = req.body || {};
      if (!data) {
        return res.status(400).json({ error: "Nenhum dado enviado." });
      }

      const cleanFilename = (filename || `upload-${Date.now()}.png`).replace(/[^a-zA-Z0-9._-]/g, "_");
      const safeFilename = `${Date.now()}-${cleanFilename}`;
      const filePath = path.join(UPLOADS_DIR, safeFilename);

      let buffer: Buffer;
      if (typeof data === "string" && data.startsWith("data:")) {
        const base64Data = data.replace(/^data:[^;]+;base64,/, "");
        buffer = Buffer.from(base64Data, "base64");
      } else if (typeof data === "string") {
        buffer = Buffer.from(data, "base64");
      } else {
        return res.status(400).json({ error: "Formato de arquivo inválido." });
      }

      await fs.promises.writeFile(filePath, buffer);
      const fileUrl = `/uploads/${safeFilename}`;

      res.json({
        file_url: fileUrl,
        url: fileUrl,
        file_uri: fileUrl,
        filename: safeFilename,
        size: buffer.length,
        mime_type: mimeType || "image/png",
      });
    } catch (err: any) {
      console.error("Erro no upload:", err);
      res.status(500).json({ error: err.message || "Falha no upload do arquivo." });
    }
  });

  // Signed URL helper endpoint
  const signedUrlRoutes = [
    "/api/apps/:appId/integration-endpoints/Core/CreateFileSignedUrl",
    "/apps/:appId/integration-endpoints/Core/CreateFileSignedUrl",
    "/integration-endpoints/Core/CreateFileSignedUrl",
  ];
  app.post(signedUrlRoutes, (req, res) => {
    const fileUri = req.body?.file_uri || req.body?.file_url || "";
    res.json({ signed_url: fileUri });
  });

  // Gemini Image Generation endpoints (replaces base44 GenerateImage)
  const imageRoutes = [
    "/api/gemini/generate-image",
    "/api/apps/:appId/integration-endpoints/Core/GenerateImage",
    "/apps/:appId/integration-endpoints/Core/GenerateImage",
    "/integration-endpoints/Core/GenerateImage",
  ];

  // Helper to sanitize prompts and eliminate garment/clothing diffusion triggers
  function sanitizePrintPrompt(rawPrompt: string): string {
    if (!rawPrompt) return "";
    let clean = rawPrompt;
    // Replace compound expressions where users ask for t-shirt/clothing
    clean = clean.replace(/\b(camiseta|camisa|blusa|baby\s*look|moletom|t-?shirt|regata|polo|jaqueta|vestu[aá]rio)\s+preta\s+(de|com|do|da)?\b/gi, 'arte gráfica vetorial em alto contraste com ');
    clean = clean.replace(/\b(camiseta|camisa|blusa|baby\s*look|moletom|t-?shirt|regata|polo|jaqueta|vestu[aá]rio)\s+branca\s+(de|com|do|da)?\b/gi, 'arte gráfica vetorial com ');
    clean = clean.replace(/\b(camiseta|camisa|blusa|baby\s*look|moletom|t-?shirt|regata|polo|jaqueta|vestu[aá]rio)\s+(de|com|do|da)?\b/gi, 'ilustração vetorial de ');
    clean = clean.replace(/\b(estampa|desenho|arte)\s+(para|de|em|pra)\s+(camiseta|camisa|blusa|roupa|moletom|t-?shirt)\b/gi, 'ilustração gráfica vetorial isolada');
    clean = clean.replace(/\b(em\s+uma|numa|na|no)\s+(camiseta|camisa|blusa|roupa|moletom|t-?shirt)\b/gi, 'em formato decalque adesivo');
    clean = clean.replace(/\b(mockup|gola|manga|mangas|tecido|cabide|manequim|pessoa vestindo)\b/gi, '');
    // Replace standalone words
    clean = clean.replace(/\b(camisetas|camiseta|camisas|camisa|t-?shirts?|roupas|roupa|moletom)\b/gi, 'arte gráfica');
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean;
  }

  // Fast detector: verifies if an image contains a clothing garment / t-shirt mockup
  async function detectGarmentInImage(ai: any, imageBuffer: Buffer): Promise<{
    has_garment: boolean;
    explanation?: string;
    print_bbox_normalized_1000?: [number, number, number, number] | null;
  }> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            parts: [
              { text: `Analyze this image created for a print platform. Determine if the image displays a garment/clothing/t-shirt mockup (such as a shirt body, collar, sleeves, fabric) instead of being ONLY an isolated graphic illustration sticker on green background.
If it has a garment, find the bounding box of ONLY the graphic illustration / print on the chest of that garment.
Return strictly JSON:
{
  "has_garment": boolean,
  "explanation": "brief reason",
  "print_bbox_normalized_1000": [ymin, xmin, ymax, xmax] | null
}` },
              { inlineData: { mimeType: "image/jpeg", data: imageBuffer.toString("base64") } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      return {
        has_garment: Boolean(parsed.has_garment),
        explanation: parsed.explanation || "",
        print_bbox_normalized_1000: Array.isArray(parsed.print_bbox_normalized_1000) && parsed.print_bbox_normalized_1000.length === 4
          ? parsed.print_bbox_normalized_1000
          : null
      };
    } catch (e: any) {
      console.warn("Falha na detecção de vestuário na imagem:", e?.message);
      return { has_garment: false, print_bbox_normalized_1000: null };
    }
  }

  // Auto-healing isolation: extracts strictly the 2D graphic illustration from a garment
  async function isolatePrintGraphicFromGarment(
    ai: any,
    imageBuffer: Buffer,
    preDetectedBbox?: [number, number, number, number] | null
  ): Promise<{ buffer: Buffer, mimeType: string } | null> {
    try {
      let bbox = preDetectedBbox;
      if (!bbox) {
        const detection = await detectGarmentInImage(ai, imageBuffer);
        bbox = detection.print_bbox_normalized_1000;
      }

      if (sharp && bbox && bbox.length === 4) {
        const meta = await sharp(imageBuffer).metadata();
        const width = meta.width || 1024;
        const height = meta.height || 1024;

        const ymin = Math.max(0, Math.round((bbox[0] / 1000) * height));
        const xmin = Math.max(0, Math.round((bbox[1] / 1000) * width));
        const ymax = Math.min(height, Math.round((bbox[2] / 1000) * height));
        const xmax = Math.min(width, Math.round((bbox[3] / 1000) * width));

        const cropWidth = Math.max(10, xmax - xmin);
        const cropHeight = Math.max(10, ymax - ymin);

        // Crop chest print (completely eliminating collar, sleeves, hems)
        const croppedChest = await sharp(imageBuffer)
          .extract({ left: xmin, top: ymin, width: cropWidth, height: cropHeight })
          .toBuffer();

        // Place on uniform chroma-key green screen #00FF00 with breathing margins
        const padX = Math.round(cropWidth * 0.15);
        const padY = Math.round(cropHeight * 0.15);
        const canvasW = cropWidth + padX * 2;
        const canvasH = cropHeight + padY * 2;

        const compositeBuffer = await sharp({
          create: {
            width: canvasW,
            height: canvasH,
            channels: 4,
            background: { r: 0, g: 255, b: 0, alpha: 1 }
          }
        })
        .composite([
          {
            input: croppedChest,
            left: padX,
            top: padY
          }
        ])
        .png()
        .toBuffer();

        return {
          buffer: compositeBuffer,
          mimeType: "image/png"
        };
      }

      // Fallback to generative isolation
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: [
          {
            parts: [
              { text: "Extract ONLY the graphic illustration artwork printed on the chest of this t-shirt/clothing. Render strictly the 2D flat graphic design artwork, isolated and centered on a pure solid green background #00FF00. Do not include any t-shirt, collar, sleeves, fabric, or clothing." },
              { inlineData: { mimeType: "image/jpeg", data: imageBuffer.toString("base64") } }
            ]
          }
        ],
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      const candidates = response.candidates;
      const parts = candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          return {
            buffer: Buffer.from(part.inlineData.data, "base64"),
            mimeType: part.inlineData.mimeType || "image/png"
          };
        }
      }
      return null;
    } catch (err: any) {
      console.error("Falha ao isolar estampa de peça de vestuário:", err);
      return null;
    }
  }

  // Dedicated endpoint for isolating graphic print from any garment/mockup
  app.post(["/api/gemini/isolate-print-art", "/api/gemini/crop-print-artwork"], async (req, res) => {
    try {
      const { image_url, data } = req.body || {};
      let buffer: Buffer | null = null;
      if (data) {
        const base64Data = data.replace(/^data:[^;]+;base64,/, "");
        buffer = Buffer.from(base64Data, "base64");
      } else if (image_url) {
        const part = await resolveImagePart(image_url);
        if (part) {
          buffer = Buffer.from(part.data, "base64");
        }
      }
      if (!buffer) {
        return res.status(400).json({ error: "Imagem de entrada não fornecida ou inválida." });
      }

      const ai = getGenAIClient();
      const isolated = await isolatePrintGraphicFromGarment(ai, buffer);
      if (!isolated) {
        return res.status(500).json({ error: "Não foi possível isolar a arte gráfica da camiseta." });
      }

      const filename = `gemini-isolated-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.png`;
      const filePath = path.join(UPLOADS_DIR, filename);
      await fs.promises.writeFile(filePath, isolated.buffer);
      const url = `/uploads/${filename}`;

      res.json({
        url,
        file_url: url,
        mime_type: "image/png"
      });
    } catch (err: any) {
      console.error("Erro no isolate-print-art:", err);
      res.status(500).json({ error: err.message || "Erro ao isolar a estampa." });
    }
  });

  app.post(imageRoutes, async (req, res) => {
    try {
      const { prompt, existing_image_urls, aspectRatio, productColor, colorName, colorHex, productType } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "O prompt é obrigatório." });
      }

      const ai = getGenAIClient();
      const parts: any[] = [];

      // Add reference images if provided
      if (Array.isArray(existing_image_urls) && existing_image_urls.length > 0) {
        for (const imgUrl of existing_image_urls) {
          const imgPart = await resolveImagePart(imgUrl);
          if (imgPart) {
            parts.push({
              inlineData: {
                data: imgPart.data,
                mimeType: imgPart.mimeType,
              },
            });
          }
        }
      }

      // 1. Sanitize the incoming prompt to remove garment / t-shirt trigger words
      const sanitizedSubject = sanitizePrintPrompt(prompt);

      const isDark = (colorName && /black|preto|preta|navy|marinho|dark|escuro|escura|wine|vinho|bordo|chumbo|militar|verde_escuro/i.test(colorName)) ||
                     (productColor && /black|preto|preta|navy|marinho|dark|escuro|escura|wine|vinho|bordo|chumbo|militar|verde_escuro/i.test(productColor)) ||
                     (colorHex && colorHex === '#000000') ||
                     (prompt.toLowerCase().includes("tecido escuro") || prompt.toLowerCase().includes("fundo escuro"));

      let finalPrompt = `Pure standalone 2D vector graphic design decal sticker, isolated screenprint graphic illustration, sharp clean crisp contour edges, centered on solid flat vibrant green background #00FF00.
Subject: ${sanitizedSubject}
Style: High quality vector art, clean sharp lines, screenprint decal badge aesthetic, pure flat 2D graphic asset file only.`;

      if (isDark) {
        finalPrompt += `\nColor Contrast: High-contrast bright vivid palette (pure white, cream, vibrant light tones, bold highlights) designed to pop with brilliant contrast on dark surfaces.`;
      }

      finalPrompt += `\nChroma Background: Pure solid flat uniform green #00FF00 background with sharp cutout edges, internal letter holes cut out showing continuous #00FF00 green.`;

      parts.push({ text: finalPrompt });

      const config: any = {};
      if (aspectRatio && ["1:1", "3:4", "4:3", "9:16", "16:9"].includes(aspectRatio)) {
        config.imageConfig = { aspectRatio };
      }

      const response = await generateWithFallback(
        ai,
        ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image"],
        { parts },
        Object.keys(config).length > 0 ? config : undefined
      );

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        return res.status(500).json({ error: "Nenhum resultado gerado pela IA." });
      }

      const responseParts = candidates[0].content?.parts || [];
      let initialBuffer: Buffer | null = null;
      let initialMime = "image/png";
      let responseText = "";

      for (const part of responseParts) {
        if (part.inlineData) {
          initialMime = part.inlineData.mimeType || "image/png";
          initialBuffer = Buffer.from(part.inlineData.data, "base64");
          break;
        } else if (part.text) {
          responseText += part.text;
        }
      }

      if (!initialBuffer) {
        return res.status(500).json({
          error: responseText || "O Gemini não retornou uma imagem para esta solicitação.",
        });
      }

      // 2. Real-time safety check: did the model generate a garment/t-shirt mockup despite positive prompt?
      let finalBuffer = initialBuffer;
      let finalMime = initialMime;
      const garmentDetection = await detectGarmentInImage(ai, initialBuffer);
      if (garmentDetection.has_garment) {
        console.log("⚠️ Detectada silhueta de camiseta/roupa na imagem gerada. Executando auto-cura para isolar estampa:", garmentDetection.explanation);
        const healed = await isolatePrintGraphicFromGarment(ai, initialBuffer, garmentDetection.print_bbox_normalized_1000);
        if (healed) {
          console.log("✅ Auto-cura bem sucedida: estampa isolada com perfeição sem camiseta!");
          finalBuffer = healed.buffer;
          finalMime = healed.mimeType;
        }
      }

      const ext = finalMime.includes("jpeg") || finalMime.includes("jpg") ? "jpg" : "png";
      const filename = `gemini-gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);
      await fs.promises.writeFile(filePath, finalBuffer);
      const generatedUrl = `/uploads/${filename}`;

      res.json({
        url: generatedUrl,
        mime_type: "image/png",
        garment_corrected: garmentDetection.has_garment
      });
    } catch (err: any) {
      console.error("Erro na geração de imagem com Gemini:", err);
      const errorMessage = err.message || "";
      if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("Quota exceeded") || errorMessage.includes("429")) {
        return res.status(429).json({
          error: "Limite de cota atingido para geração de imagens. Verifique se o seu projeto possui acesso aos modelos de imagem do Gemini.",
        });
      }
      res.status(500).json({ error: errorMessage || "Erro ao gerar imagem com Gemini." });
    }
  });

  // ---------------------------------------------------------------------------
  // Gemini AI Artwork Reconstructor & Super-Resolution (Upscale for Print)
  // ---------------------------------------------------------------------------
  const reconstructRoutes = [
    "/api/gemini/reconstruct-artwork",
    "/api/apps/:appId/integration-endpoints/Core/ReconstructArtwork",
    "/apps/:appId/integration-endpoints/Core/ReconstructArtwork",
    "/integration-endpoints/Core/ReconstructArtwork",
  ];

  app.post(reconstructRoutes, async (req, res) => {
    try {
      const { image_url, base64_image, instructions, style, productColor, colorName } = req.body;
      const targetSource = image_url || base64_image;
      if (!targetSource) {
        return res.status(400).json({ error: "É necessário fornecer a imagem para reconstrução (image_url ou base64_image)." });
      }

      const imgPart = await resolveImagePart(targetSource);
      if (!imgPart) {
        return res.status(400).json({ error: "Não foi possível carregar a imagem de origem para reconstrução." });
      }

      const ai = getGenAIClient();
      const parts: any[] = [
        {
          inlineData: {
            data: imgPart.data,
            mimeType: imgPart.mimeType,
          },
        },
      ];

      const isDarkFabric = (colorName && /black|preto|preta|navy|marinho|dark|escuro|wine|vinho/i.test(colorName)) ||
                           (productColor && /black|preto|preta|navy|marinho|dark|escuro|wine|vinho/i.test(productColor));

      let prompt = `You are a master digital illustrator, typography artisan, and professional DTG/DTF textile print production expert.

TASK: Reconstruct, upscale, and remaster the attached reference artwork into a crystal-clear, ultra-sharp, high-resolution master graphic for large apparel printing (300 DPI equivalent).

CRITICAL REQUIREMENTS:
1. SUBJECT & FIDELITY: Faithfully preserve the exact character, subject, typography, illustration details, and aesthetic essence of the user's reference image.
2. RESOLUTION & CLARITY: Eliminate all blurriness, pixelation, low-resolution artifacts, compression noise, and muddy lines. Rebuild with crisp vector-like outlines, clean curves, and vibrant, rich colors.
3. CHROMA KEY ISOLATION: Place the entire artwork cleanly isolated on a flat, solid, vivid green background (#00FF00 green screen). The background MUST be completely plain green so it can be flawlessly cut out for transparent DTG printing.
4. NO MOCKUPS: Do NOT place the artwork on a t-shirt, model, mannequin, or hanger. Render ONLY the flat, isolated graphic on the solid green #00FF00 background.
5. NO BORDERS: Do NOT add white borders, sticker outlines, or frames unless they are an intrinsic part of the original design.`;

      if (isDarkFabric) {
        prompt += `\n6. DARK FABRIC CONTRAST: Ensure texts and line art have strong luminosity and contrast suitable for dark/black apparel fabric.`;
      }
      if (instructions) {
        prompt += `\nUSER SPECIFIC INSTRUCTIONS: ${instructions}`;
      }
      if (style) {
        prompt += `\nSTYLE EMPHASIS: ${style}`;
      }

      parts.push({ text: prompt });

      const response = await generateWithFallback(
        ai,
        ["gemini-3.1-flash-image", "gemini-3.1-flash-lite-image"],
        { parts }
      );

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        return res.status(500).json({ error: "A IA não conseguiu gerar a reconstrução desta imagem." });
      }

      const responseParts = candidates[0].content?.parts || [];
      let generatedUrl = "";
      let responseText = "";

      for (const part of responseParts) {
        if (part.inlineData) {
          const mime = part.inlineData.mimeType || "image/png";
          const ext = mime.includes("jpeg") ? "jpg" : "png";
          const filename = `gemini-reconstructed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
          const filePath = path.join(UPLOADS_DIR, filename);
          await fs.promises.writeFile(filePath, Buffer.from(part.inlineData.data, "base64"));
          generatedUrl = `/uploads/${filename}`;
        } else if (part.text) {
          responseText += part.text;
        }
      }

      if (!generatedUrl) {
        return res.status(500).json({
          error: responseText || "O modelo de IA não retornou uma imagem para a reconstrução.",
        });
      }

      res.json({
        success: true,
        url: generatedUrl,
        reconstructed_url: generatedUrl,
        mime_type: "image/png",
        message: "Arte reconstruída com sucesso em alta definição!",
      });
    } catch (err: any) {
      console.error("Erro na reconstrução de arte com Gemini:", err);
      const errorMessage = err.message || "";
      if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("Quota exceeded") || errorMessage.includes("429")) {
        return res.status(429).json({
          error: "Limite de cota de IA temporariamente atingido. Você pode usar a Ampliação Rápida HD instantânea!",
        });
      }
      res.status(500).json({ error: errorMessage || "Erro ao reconstruir arte com IA." });
    }
  });

  // Gemini Text / LLM endpoints (replaces base44 InvokeLLM)
  const llmRoutes = [
    "/api/gemini/invoke-llm",
    "/api/apps/:appId/integration-endpoints/Core/InvokeLLM",
    "/apps/:appId/integration-endpoints/Core/InvokeLLM",
    "/integration-endpoints/Core/InvokeLLM",
  ];
  app.post(llmRoutes, async (req, res) => {
    try {
      const { prompt, add_context_from_internet, response_json_schema, file_urls } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt é obrigatório." });
      }

      const ai = getGenAIClient();
      const parts: any[] = [];

      if (Array.isArray(file_urls) && file_urls.length > 0) {
        for (const fileUrl of file_urls) {
          const imgPart = await resolveImagePart(fileUrl);
          if (imgPart) {
            parts.push({
              inlineData: {
                data: imgPart.data,
                mimeType: imgPart.mimeType,
              },
            });
          }
        }
      }

      parts.push({ text: prompt });

      const config: any = {};
      if (response_json_schema) {
        config.responseMimeType = "application/json";
      }
      if (add_context_from_internet) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await generateWithFallback(
        ai,
        ["gemini-3.6-flash", "gemini-3.8-flash"],
        parts.length === 1 ? prompt : { parts },
        Object.keys(config).length > 0 ? config : undefined
      );

      const text = response.text || "";
      if (response_json_schema) {
        try {
          return res.json({ result: JSON.parse(text) });
        } catch {
          return res.json({ result: text });
        }
      }

      res.json({ result: text });
    } catch (err: any) {
      console.error("Erro no InvokeLLM:", err);
      res.status(500).json({ error: err.message || "Erro ao consultar Gemini." });
    }
  });

  // Gemini Prompt Enhancer (Creative prompt assistant for artists)
  app.post("/api/gemini/enhance-prompt", async (req, res) => {
    try {
      const { prompt, productType, style, productColor, colorName } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt é obrigatório." });
      }

      const isDark = (colorName && /black|preto|preta|navy|marinho|dark|escuro|escura|wine|vinho|bordo|chumbo|militar|verde_escuro/i.test(colorName)) ||
                     (productColor && /black|preto|preta|navy|marinho|dark|escuro|escura|wine|vinho|bordo|chumbo|militar|verde_escuro/i.test(productColor));

      const ai = getGenAIClient();
      const systemInstruction = `Você é um diretor de arte e designer gráfico especializado em estampas autorais da plataforma Céu Criativa.
Sua missão é transformar a ideia do usuário em uma descrição rica, artística e detalhada, pronta para gerar uma estampa visualmente impactante.
${isDark ? 'ATENÇÃO DE CONTRASTE: Como a estampa será impressa sobre tecido escuro/preto, especifique que lettering, tipografia, traços e ilustrações usem cores claras e luminosas (branco, marfim, amarelo claro, cores pastéis brilhantes) para alto contraste.' : ''}
REGRA MANDATÓRIA: Descreva ESTRITAMENTE a arte gráfica, ilustração ou tipografia em si. NUNCA mencione roupas, camisetas, camisas, mangas, golas, modelos ou mockups, pois a IA deve desenhar apenas a estampa/desenho isolado e NUNCA uma camiseta.
Mantenha a resposta concisa (2 a 4 frases), em português, com estilo visual claro, paleta de cores e elementos principais da arte gráfica.`;

      const userMessage = `Ideia da estampa: "${prompt}". Estilo desejado: "${style || 'autoral e criativo'}".
Retorne apenas a versão aprimorada da descrição da arte gráfica (sem citar camisetas ou roupas).`;

      const response = await generateWithFallback(
        ai,
        ["gemini-3.6-flash", "gemini-3.8-flash"],
        userMessage,
        {
          systemInstruction,
          temperature: 0.7,
        }
      );

      res.json({ enhancedPrompt: response.text?.trim() || prompt });
    } catch (err: any) {
      console.error("Erro no enhance-prompt:", err);
      res.status(500).json({ error: err.message || "Erro ao aprimorar o prompt." });
    }
  });

  // ----------------------------------------------------
  // Gemini AI Narration Generator (Storytelling / Narração da estampa)
  // ----------------------------------------------------
  app.post("/api/gemini/generate-narration", async (req, res) => {
    try {
      const { title, description, prompt, category, artist_name } = req.body || {};
      const ai = getGenAIClient();

      const systemInstruction = `Você é um curador de arte e contador de histórias poético da plataforma Céu Criativa.
Sua missão é criar uma narração autoral cativante, poética e emotiva (de 2 a 3 frases) para ser ouvida em áudio pelas pessoas sobre a estampa do artista.
A narração deve transmitir a essência visual, a emoção e o significado da estampa, conectando o público à arte.
Responda em português brasileiro de forma fluida, inspiradora e pronta para leitura em voz alta.`;

      const userMessage = `Crie a narração em áudio para esta estampa:
Título: "${title || 'Sem título'}"
Conceito/Ideia: "${prompt || description || title || 'Arte autoral'}"
Categoria: "${category || 'Arte Visual'}"
Artista: "${artist_name || 'Artista Céu Criativa'}"

Retorne apenas o texto da narração para ser lido em voz alta (sem introduções como "Aqui está").`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.8,
        },
      });

      const narration = response.text?.trim() || "";
      res.json({ narration });
    } catch (err: any) {
      console.error("Erro ao gerar narração da estampa:", err);
      res.status(500).json({ error: err.message || "Erro ao gerar narração." });
    }
  });

  // ----------------------------------------------------
  // Gemini AI Audio Transcription (Transcrever voz e narração da estampa)
  // ----------------------------------------------------
  app.post("/api/gemini/transcribe-audio", async (req, res) => {
    try {
      const { audioData, mimeType } = req.body || {};
      if (!audioData) {
        return res.status(400).json({ error: "Nenhum dado de áudio fornecido." });
      }

      const ai = getGenAIClient();
      const rawBase64 = audioData.includes(",") ? audioData.split(",")[1] : audioData;
      const detectedMime = mimeType || (audioData.includes(";") ? audioData.split(";")[0].replace("data:", "") : "audio/webm");

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            inlineData: {
              mimeType: detectedMime.split(";")[0] || "audio/webm",
              data: rawBase64,
            },
          },
          "Transcreva fielmente este áudio falado em português do Brasil. O usuário está narrando ou descrevendo uma estampa de camiseta ou arte autoral. Retorne APENAS o texto falado transcrito, sem aspas e sem nenhum comentário.",
        ],
      });

      const transcript = response.text?.trim() || "";
      res.json({ transcript });
    } catch (err: any) {
      console.error("Erro ao transcrever áudio com Gemini:", err);
      res.status(500).json({ error: err.message || "Erro na transcrição de áudio." });
    }
  });

  // ----------------------------------------------------
  // Cielo E-commerce Gateway API 3.0
  // ----------------------------------------------------
  app.post("/api/cielo/checkout", async (req, res) => {
    try {
      const payload = req.body;
      if (!payload || !payload.paymentMethod || !payload.customer || !payload.shippingAddress) {
        return res.status(400).json({ error: "Dados incompletos para processamento com a Cielo." });
      }

      const orderNumber = `CEU-${Math.floor(100000 + Math.random() * 900000)}`;
      const cieloResult = await processCieloPayment(payload, orderNumber);

      if (!cieloResult.success && cieloResult.status === 'denied') {
        return res.status(402).json({
          error: cieloResult.returnMessage || "Transação não autorizada pela Cielo.",
          cieloResult
        });
      }

      // Salva o pedido no banco de dados com todos os detalhes da transação Cielo
      const createdOrder = entitiesStore.create("Order", {
        order_number: orderNumber,
        customer_name: payload.customer.name,
        customer_email: payload.customer.email,
        customer_cpf: payload.customer.cpf || "",
        customer_phone: payload.customer.phone || "",
        status: cieloResult.isApproved ? "paid" : "pending",
        payment_status: cieloResult.status,
        payment_method: payload.paymentMethod,
        payment_gateway: "cielo_3.0",
        cielo_payment_id: cieloResult.paymentId,
        cielo_tid: cieloResult.tid || "",
        cielo_auth_code: cieloResult.authCode || "",
        cielo_proof_of_sale: cieloResult.proofOfSale || "",
        cielo_return_code: cieloResult.returnCode || "",
        cielo_return_message: cieloResult.returnMessage || "",
        card_brand: cieloResult.cardBrand || payload.card?.brand || "",
        card_last4: cieloResult.cardLast4 || (payload.card?.cardNumber ? payload.card.cardNumber.slice(-4) : ""),
        installments: payload.installments || 1,
        total_amount: payload.totalAmount,
        items: payload.items || [],
        shipping_address: payload.shippingAddress,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      });

      // Ao comprar sua primeira estampa, ativa a Loja do Artista e libera suas artes na galeria pública!
      entitiesStore.updateMe({
        has_purchased_first_print: true,
        store_active: true,
        cpf: payload.customer?.cpf || entitiesStore.currentUser.cpf,
        phone: payload.customer?.phone || entitiesStore.currentUser.phone,
      });

      // Aprova as estampas pendentes deste artista na galeria pública
      const userDesigns = entitiesStore.list("Design").filter((d: any) => d.artist_id === entitiesStore.currentUser.id);
      userDesigns.forEach((d: any) => {
        entitiesStore.update("Design", d.id, { status: "aprovado" });
      });

      res.json({
        success: true,
        order: createdOrder,
        cielo: cieloResult
      });
    } catch (err: any) {
      console.error("Erro no processamento Cielo:", err);
      res.status(500).json({ error: err.message || "Erro no gateway Cielo." });
    }
  });

  // Consultar status de pedido Cielo
  app.get("/api/cielo/order/:orderId", (req, res) => {
    try {
      const order = entitiesStore.get("Order", req.params.orderId) || 
        entitiesStore.list("Order").find((o: any) => o.order_number === req.params.orderId);
      if (!order) return res.status(404).json({ error: "Pedido não encontrado." });
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Confirmação de Pix Cielo (webhook ou simulação instantânea)
  app.post("/api/cielo/confirm-pix/:orderId", (req, res) => {
    try {
      const target = entitiesStore.get("Order", req.params.orderId) ||
        entitiesStore.list("Order").find((o: any) => o.order_number === req.params.orderId);
      if (!target) return res.status(404).json({ error: "Pedido não encontrado." });

      const updated = entitiesStore.update("Order", target.id, {
        status: "paid",
        payment_status: "approved",
        cielo_return_code: "00",
        cielo_return_message: "Pix confirmado com sucesso.",
        updated_date: new Date().toISOString()
      });
      res.json({ success: true, order: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Webhook Cielo
  app.post("/api/cielo/webhook", (req, res) => {
    try {
      const { PaymentId, ChangeType } = req.body || {};
      if (PaymentId) {
        const order = entitiesStore.list("Order").find((o: any) => o.cielo_payment_id === PaymentId);
        if (order) {
          entitiesStore.update("Order", order.id, {
            status: ChangeType === "1" ? "paid" : order.status,
            updated_date: new Date().toISOString()
          });
        }
      }
      res.json({ received: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // App Public Settings (resolves Base44 initialization & public checks)
  // ----------------------------------------------------
  app.get([
    "/apps/public/prod/public-settings/by-id/:appId",
    "/api/apps/public/prod/public-settings/by-id/:appId",
    "/prod/public-settings/by-id/:appId",
    "/apps/public/*all",
    "/api/apps/public/*all",
  ], (req, res) => {
    res.json({
      id: req.params.appId || "ceu-criativa",
      public_settings: {
        auth_required: false,
        name: "Céu Criativa",
      },
    });
  });

  // ----------------------------------------------------
  // App Logs & Analytics (Base44 NavigationTracker & logging)
  // ----------------------------------------------------
  app.post([
    "/app-logs/:appId/log-user-in-app/:pageName",
    "/api/app-logs/:appId/log-user-in-app/:pageName",
    "/app-logs/*all",
    "/api/app-logs/*all",
  ], (_req, res) => {
    res.json({ success: true });
  });

  app.get([
    "/app-logs/:appId",
    "/api/app-logs/:appId",
    "/app-logs/:appId/stats",
    "/api/app-logs/:appId/stats",
    "/app-logs/*all",
    "/api/app-logs/*all",
  ], (_req, res) => {
    res.json({ logs: [], stats: {} });
  });

  app.post([
    "/apps/:appId/analytics/track/batch",
    "/api/apps/:appId/analytics/track/batch",
    "/apps/:appId/analytics/*all",
    "/api/apps/:appId/analytics/*all",
  ], (_req, res) => {
    res.json({ success: true, processed: true });
  });

  app.get([
    "/apps/:appId/external-auth/tokens/:type",
    "/api/apps/:appId/external-auth/tokens/:type",
    "/apps/:appId/external-auth/tokens/connectors/:id",
    "/api/apps/:appId/external-auth/tokens/connectors/:id",
    "/apps/:appId/external-auth/*all",
    "/api/apps/:appId/external-auth/*all",
  ], (_req, res) => {
    res.json({ access_token: "mock-token", connection_config: {} });
  });

  app.get([
    "/apps/:appId/users",
    "/api/apps/:appId/users",
    "/api/apps/:appId/runtime/users",
    "/api/users",
  ], (_req, res) => {
    res.json(entitiesStore.list("User", {}));
  });

  // ----------------------------------------------------
  // User Authentication & Current Profile
  // ----------------------------------------------------
  app.get([
    "/api/apps/:appId/entities/User/me",
    "/apps/:appId/entities/User/me",
    "/api/apps/:appId/auth/me",
    "/apps/:appId/auth/me",
    "/api/apps/auth/me",
    "/api/entities/User/me",
    "/api/auth/me",
  ], (_req, res) => {
    const user = { ...entitiesStore.currentUser };
    if (!user.name) user.name = user.full_name || "Felipe Silvério";
    res.json(user);
  });

  app.put([
    "/api/apps/:appId/entities/User/me",
    "/apps/:appId/entities/User/me",
    "/api/entities/User/me",
  ], (req, res) => {
    const updated = entitiesStore.updateMe(req.body);
    res.json(updated);
  });

  // Specific entity sub-routes (bulk, update-many, delete-many) BEFORE /:id
  // ----------------------------------------------------
  // Product Fits (Modelagens com persistência e auto-cadastro)
  // ----------------------------------------------------
  const DEFAULT_INDUSTRY_FITS = [
    "Tradicional",
    "Regular Fit",
    "Oversized",
    "Streetwear Boxy",
    "Baby Look",
    "Slim Fit",
    "Raglan",
    "Regata",
    "Muscle Tee",
    "Gola V",
    "Moletom Canguru",
    "Moletom Careca",
    "Manga Longa",
    "Camisa Polo",
    "Cropped",
    "Infantil",
    "Longline",
    "Heavyweight Streetwear",
  ];

  app.get("/api/product-fits", (_req, res) => {
    try {
      const coll = entitiesStore.getCollection("ProductFit");
      if (coll.length === 0) {
        DEFAULT_INDUSTRY_FITS.forEach((name) => {
          entitiesStore.create("ProductFit", { name, is_default: true });
        });
      }
      const allFits = entitiesStore.getCollection("ProductFit");
      const products = entitiesStore.getCollection("Product") || [];
      const productFits = products.map((p: any) => p.fit).filter(Boolean);
      
      const fitNames = Array.from(new Set([
        ...allFits.map((f: any) => f.name),
        ...productFits,
        ...DEFAULT_INDUSTRY_FITS
      ])).filter(Boolean);
      
      res.json(fitNames);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/product-fits", (req, res) => {
    try {
      const rawName = (req.body?.name || req.body?.fit || "").trim();
      if (!rawName) return res.status(400).json({ error: "Nome da modelagem é obrigatório" });
      
      const coll = entitiesStore.getCollection("ProductFit");
      const exists = coll.some((f: any) => f.name?.toLowerCase() === rawName.toLowerCase());
      let created = null;
      if (!exists) {
        created = entitiesStore.create("ProductFit", { name: rawName, is_default: false });
      }
      const allFits = Array.from(new Set([
        ...entitiesStore.getCollection("ProductFit").map((f: any) => f.name),
        ...DEFAULT_INDUSTRY_FITS
      ]));
      res.json({ success: true, created, fits: allFits, name: rawName });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // Bulk Inventory Management Endpoints
  // ----------------------------------------------------
  app.get("/api/inventory/overview", (_req, res) => {
    try {
      const products = entitiesStore.list("Product", { q: { catalog_product: true } });
      const variants = entitiesStore.getCollection("BaseProductVariant") || [];
      
      const productsWithGrid = products.map((prod: any) => {
        const prodVariants = variants.filter((v: any) => String(v.base_product_id) === String(prod.id));
        const colors = prod.colors_available || [];
        const sizes = prod.sizes_available || [];
        
        const possibleCombinations: any[] = [];
        colors.forEach((color: string) => {
          sizes.forEach((size: string) => {
            const existing = prodVariants.find((v: any) => v.color?.toLowerCase() === color.toLowerCase() && v.size?.toLowerCase() === size.toLowerCase());
            possibleCombinations.push({
              color,
              size,
              exists: !!existing,
              variant: existing || null,
            });
          });
        });

        return {
          ...prod,
          variants: prodVariants,
          total_stock: prodVariants.reduce((sum: number, v: any) => sum + (Number(v.stock_quantity) || 0), 0),
          combinations: possibleCombinations,
          missing_count: possibleCombinations.filter((c: any) => !c.exists).length,
        };
      });

      const totalUnits = variants.reduce((sum: number, v: any) => sum + (Number(v.stock_quantity) || 0), 0);
      const zeroStockCount = variants.filter((v: any) => (Number(v.stock_quantity) || 0) <= 0).length;

      res.json({
        products: productsWithGrid,
        variants,
        metrics: {
          total_products: products.length,
          total_variants: variants.length,
          total_units: totalUnits,
          zero_stock_variants: zeroStockCount,
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/inventory/bulk-update", (req, res) => {
    try {
      const { variantIds, action, quantity, isActive } = req.body || {};
      if (!Array.isArray(variantIds) || variantIds.length === 0) {
        return res.status(400).json({ error: "Nenhuma variação selecionada." });
      }

      const variants = entitiesStore.getCollection("BaseProductVariant");
      const updatedList: any[] = [];

      variantIds.forEach((id: string) => {
        const variant = variants.find((v: any) => String(v.id) === String(id));
        if (!variant) return;

        const currentQty = Number(variant.stock_quantity) || 0;
        let newQty = currentQty;

        if (action === "set") {
          newQty = Math.max(0, Number(quantity) || 0);
        } else if (action === "add") {
          newQty = Math.max(0, currentQty + (Number(quantity) || 0));
        } else if (action === "subtract") {
          newQty = Math.max(0, currentQty - (Number(quantity) || 0));
        } else if (action === "zero") {
          newQty = 0;
        }

        const patch: any = { stock_quantity: newQty };
        if (isActive !== undefined) {
          patch.is_active = Boolean(isActive);
        }

        const updated = entitiesStore.update("BaseProductVariant", variant.id, patch);
        if (updated) updatedList.push(updated);
      });

      res.json({ success: true, count: updatedList.length, updated: updatedList });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/inventory/generate-grid", (req, res) => {
    try {
      const { productId, defaultStock = 0 } = req.body || {};
      if (!productId) return res.status(400).json({ error: "ID do produto é obrigatório" });

      const product = entitiesStore.get("Product", productId);
      if (!product) return res.status(404).json({ error: "Produto não encontrado" });

      const colors = product.colors_available || [];
      const sizes = product.sizes_available || [];
      const variants = entitiesStore.getCollection("BaseProductVariant");

      const createdList: any[] = [];
      const stock = Math.max(0, Number(defaultStock) || 0);

      colors.forEach((color: string) => {
        sizes.forEach((size: string) => {
          const exists = variants.some(
            (v: any) => String(v.base_product_id) === String(productId) &&
                        v.color?.toLowerCase() === color.toLowerCase() &&
                        v.size?.toLowerCase() === size.toLowerCase()
          );
          if (!exists) {
            const created = entitiesStore.create("BaseProductVariant", {
              base_product_id: productId,
              color,
              size,
              stock_quantity: stock,
              is_active: true,
              debited_order_ids: [],
              released_order_ids: [],
            });
            createdList.push(created);
          }
        });
      });

      res.json({ success: true, count: createdList.length, created: createdList });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.all([
    "/api/apps/:appId/entities/:entityName/update-many",
    "/apps/:appId/entities/:entityName/update-many",
    "/api/entities/:entityName/update-many",
  ], (req, res) => {
    try {
      const { ids, data } = req.body || {};
      if (Array.isArray(ids) && data && typeof data === "object") {
        const updated = ids.map((id) => entitiesStore.update(req.params.entityName, id, data));
        return res.json({ success: true, count: updated.length, items: updated });
      }
      res.json({ success: true, count: 0 });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post([
    "/api/apps/:appId/entities/:entityName/bulk",
    "/apps/:appId/entities/:entityName/bulk",
    "/api/entities/:entityName/bulk",
  ], (req, res) => {
    try {
      const items = Array.isArray(req.body) ? req.body : [];
      const created = items.map((item) => entitiesStore.create(req.params.entityName, item));
      res.json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put([
    "/api/apps/:appId/entities/:entityName/bulk",
    "/apps/:appId/entities/:entityName/bulk",
    "/api/entities/:entityName/bulk",
  ], (req, res) => {
    try {
      const items = Array.isArray(req.body) ? req.body : [];
      const updated = items.map((item) => entitiesStore.update(req.params.entityName, item.id, item));
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.all([
    "/api/apps/:appId/entities/:entityName/delete-many",
    "/apps/:appId/entities/:entityName/delete-many",
    "/api/entities/:entityName/delete-many",
    "/api/apps/:appId/entities/:entityName/bulk-delete",
    "/apps/:appId/entities/:entityName/bulk-delete",
    "/api/entities/:entityName/bulk-delete",
  ], (req, res) => {
    try {
      const count = entitiesStore.deleteMany(req.params.entityName, req.body);
      res.json({ success: true, count });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // Generic Entity CRUD Endpoints (Base44 & REST Data Provider)
  // ----------------------------------------------------
  // List or filter entities
  app.get([
    "/api/apps/:appId/entities/:entityName",
    "/apps/:appId/entities/:entityName",
    "/api/entities/:entityName",
  ], (req, res) => {
    try {
      const entityName = req.params.entityName;
      let q: any = undefined;
      if (req.query.q) {
        try {
          q = JSON.parse(req.query.q as string);
        } catch {}
      } else if (req.query.filter) {
        try {
          q = typeof req.query.filter === "string" ? JSON.parse(req.query.filter) : req.query.filter;
        } catch {}
      }

      // Merge direct query params (e.g. ?artist_id=xxx or ?status=aprovado)
      const specialKeys = new Set(["q", "filter", "sort", "limit", "skip", "fields", "appId"]);
      const directFilters: Record<string, any> = {};
      for (const [key, val] of Object.entries(req.query)) {
        if (!specialKeys.has(key) && val !== undefined) {
          directFilters[key] = val;
        }
      }
      if (Object.keys(directFilters).length > 0) {
        q = { ...(q || {}), ...directFilters };
      }

      const sort = req.query.sort as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : undefined;

      const results = entitiesStore.list(entityName, { q, sort, limit, skip });
      res.json(results);
    } catch (err: any) {
      console.error("Erro ao listar entidade:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get single entity by ID
  app.get([
    "/api/apps/:appId/entities/:entityName/:id",
    "/apps/:appId/entities/:entityName/:id",
    "/api/entities/:entityName/:id",
  ], (req, res) => {
    const item = entitiesStore.get(req.params.entityName, req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item não encontrado." });
    }
    res.json(item);
  });

  // Create entity
  app.post([
    "/api/apps/:appId/entities/:entityName",
    "/apps/:appId/entities/:entityName",
    "/api/entities/:entityName",
  ], (req, res) => {
    try {
      const created = entitiesStore.create(req.params.entityName, req.body);
      res.json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update entity
  app.put([
    "/api/apps/:appId/entities/:entityName/:id",
    "/apps/:appId/entities/:entityName/:id",
    "/api/entities/:entityName/:id",
  ], (req, res) => {
    try {
      const updated = entitiesStore.update(req.params.entityName, req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete entity
  app.delete([
    "/api/apps/:appId/entities/:entityName/:id",
    "/apps/:appId/entities/:entityName/:id",
    "/api/entities/:entityName/:id",
  ], (req, res) => {
    const success = entitiesStore.delete(req.params.entityName, req.params.id);
    res.json({ success });
  });

  // Delete with body query
  app.delete([
    "/api/apps/:appId/entities/:entityName",
    "/apps/:appId/entities/:entityName",
    "/api/entities/:entityName",
  ], (req, res) => {
    const count = entitiesStore.deleteMany(req.params.entityName, req.body);
    res.json({ success: true, count });
  });

  // User invite / auth mocks
  app.post([
    "/api/apps/:appId/users/invite-user",
    "/apps/:appId/users/invite-user",
    "/api/apps/:appId/runtime/users/invite-user",
  ], (_req, res) => {
    res.json({ success: true, message: "Convite registrado." });
  });

  // Functions mock endpoint
  app.post([
    "/apps/:appId/functions/:functionName",
    "/api/apps/:appId/functions/:functionName",
    "/api/functions/:functionName",
    "/functions/:functionName",
  ], (_req, res) => {
    res.json({ ok: true, result: {} });
  });

  // Catch-all for any unmatched Base44 endpoints to prevent 404 SDK errors
  app.all([
    "/apps/:appId/*all",
    "/api/apps/*all",
    "/app-logs/*all",
    "/api/app-logs/*all",
  ], (req, res) => {
    if (req.method === "GET") {
      res.json([]);
    } else {
      res.json({ success: true });
    }
  });

  // ----------------------------------------------------
  // Vite Integration (Dev Middleware or Production Static)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
