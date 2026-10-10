/**
 * Gemini & Local Integrations
 * Replaces Base44 Core integrations (GenerateImage, InvokeLLM, UploadFile)
 * with direct calls to our server-side Google Gemini & upload endpoints.
 */

// Helper to convert Blob or File to Base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function GenerateImage(params) {
  const { prompt, existing_image_urls, aspectRatio } = params || {};
  if (!prompt) throw new Error("Prompt é obrigatório para geração de imagem.");

  const response = await fetch("/api/gemini/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      existing_image_urls: existing_image_urls || [],
      aspectRatio: aspectRatio || "1:1",
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao gerar imagem com Gemini.");
  }

  return { url: data.url };
}

export async function InvokeLLM(params) {
  const { prompt, add_context_from_internet, response_json_schema, file_urls } = params || {};
  if (!prompt) throw new Error("Prompt é obrigatório para invocar o LLM.");

  const response = await fetch("/api/gemini/invoke-llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      add_context_from_internet,
      response_json_schema,
      file_urls,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao consultar Gemini.");
  }

  return data.result;
}

export async function UploadFile(params) {
  const { file } = params || {};
  if (!file) throw new Error("Nenhum arquivo fornecido para upload.");

  const base64 = await fileToBase64(file);
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: base64,
      filename: file.name || "upload.png",
      mimeType: file.type || "image/png",
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao fazer upload da imagem.");
  }

  return {
    file_url: data.file_url,
    url: data.file_url,
    filename: data.filename,
  };
}

export async function UploadPrivateFile(params) {
  const res = await UploadFile(params);
  return {
    file_uri: res.file_url,
    file_url: res.file_url,
  };
}

export async function EnhancePrompt(prompt, productType, style, productColor, colorName) {
  if (!prompt) return prompt;
  const response = await fetch("/api/gemini/enhance-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, productType, style, productColor, colorName }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao aprimorar prompt com Gemini.");
  }

  return data.enhancedPrompt || prompt;
}

export async function ReconstructArtwork(params) {
  const { image_url, base64_image, instructions, style, productColor, colorName } = params || {};
  const response = await fetch("/api/gemini/reconstruct-artwork", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url, base64_image, instructions, style, productColor, colorName }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao reconstruir imagem com IA.");
  }

  return data;
}

export const GeminiCore = {
  GenerateImage,
  InvokeLLM,
  UploadFile,
  UploadPrivateFile,
  ReconstructArtwork,
  SendEmail: async () => ({ success: true }),
  SendSMS: async () => ({ success: true }),
  ExtractDataFromUploadedFile: async () => ({}),
  EnhancePrompt,
};
