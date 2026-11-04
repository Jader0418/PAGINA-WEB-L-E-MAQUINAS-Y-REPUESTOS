import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

const DATA_CONSENT_TEXT =
  "Autorizo de manera libre, previa, expresa e informada a L&E MÁQUINAS Y REPUESTOS para recolectar, almacenar y tratar mis datos personales con la finalidad de elaborar y responder mi cotización, prestarme asesoría relacionada con esta solicitud y gestionar pedidos, garantías y soporte que yo solicite. También autorizo el registro de datos técnicos de esta solicitud, como dirección IP, fecha y hora y versión de la política, para seguridad y trazabilidad, conforme a la Política de Tratamiento de Datos Personales. Conozco mis derechos de conocer, actualizar, rectificar y solicitar la supresión de mis datos, así como los canales para ejercerlos.";

const MARKETING_CONSENT_TEXT =
  "Autorizo opcionalmente a L&E MÁQUINAS Y REPUESTOS para enviarme información comercial, novedades y promociones por correo electrónico o WhatsApp. Entiendo que puedo retirar esta autorización y que no es necesaria para solicitar una cotización.";

function jsonResponse(body: unknown, status: number, origin: string | null) {
  const headers = new Headers({
    ...corsHeaders,
    "Content-Type": "application/json; charset=utf-8",
  });
  if (origin) headers.set("Access-Control-Allow-Origin", origin);
  return new Response(JSON.stringify(body), { status, headers });
}

function getJsonEnv(name: string): Record<string, string> {
  const value = Deno.env.get(name);
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getServiceKey(): string {
  const keyMap = getJsonEnv("SUPABASE_SECRET_KEYS");
  return keyMap.default || keyMap.service_role ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_SECRET_KEY") || "";
}

function getPublishableKeys(): string[] {
  const keyMap = getJsonEnv("SUPABASE_PUBLISHABLE_KEYS");
  const mapped = Object.values(keyMap);
  const legacy = [
    Deno.env.get("SUPABASE_ANON_KEY") || "",
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "",
  ];
  return [...mapped, ...legacy].filter(Boolean);
}

function validIp(value: string | null): string | null {
  if (!value) return null;
  const ip = value.trim();
  const ipv4 = ip.split(".");
  if (ipv4.length === 4 && ipv4.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255)) {
    return ip;
  }
  if (ip.includes(":") && /^[0-9a-fA-F:]+$/.test(ip) && ip.length <= 45) {
    const halves = ip.split("::");
    if (halves.length > 2) return null;
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
    const groups = [...left, ...right];
    if (!groups.every((part) => /^[0-9a-fA-F]{1,4}$/.test(part))) return null;
    if (halves.length === 2 && groups.length < 8) return ip;
    if (halves.length === 1 && groups.length === 8) return ip;
  }
  return null;
}

function getClientIp(request: Request): string | null {
  const direct = request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip");
  if (direct) return validIp(direct);
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? validIp(forwarded.split(",")[0]) : null;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character] || character));
}

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function validatePayload(payload: Record<string, unknown>) {
  const customer = payload.customer;
  if (!customer || typeof customer !== "object" || Array.isArray(customer)) {
    throw new Error("INVALID_CUSTOMER");
  }
  const c = customer as Record<string, unknown>;
  const normalizedCustomer = {
    firstName: normalizeText(c.firstName, 80),
    lastName: normalizeText(c.lastName, 80),
    phone: normalizeText(c.phone, 25),
    email: normalizeText(c.email, 120).toLowerCase(),
    address: normalizeText(c.address, 160),
    city: normalizeText(c.city, 100),
  };
  if (Object.values(normalizedCustomer).some((value) => !value)) {
    throw new Error("INVALID_CUSTOMER");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedCustomer.email)) {
    throw new Error("INVALID_EMAIL");
  }
  if (!/^[0-9+() -]{7,25}$/.test(normalizedCustomer.phone)) {
    throw new Error("INVALID_PHONE");
  }

  const items = payload.items;
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) {
    throw new Error("INVALID_ITEMS");
  }
  const normalizedItems = items.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("INVALID_PRODUCT");
    const item = raw as Record<string, unknown>;
    const productId = normalizeText(item.productId, 80);
    const quantity = Number(item.quantity);
    if (!/^[a-z0-9-]+$/.test(productId)) throw new Error("INVALID_PRODUCT");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) throw new Error("INVALID_QUANTITY");
    return { productId, quantity };
  });

  const consent = payload.consent;
  const legacyConsent = payload.dataConsent === true;
  const accepted = Boolean(
    consent && typeof consent === "object" && !Array.isArray(consent)
      ? (consent as Record<string, unknown>).accepted === true
      : legacyConsent
  );
  if (!accepted) throw new Error("CONSENT_REQUIRED");

  const marketingConsent = Boolean(
    consent && typeof consent === "object" && !Array.isArray(consent) &&
      (consent as Record<string, unknown>).marketingAccepted === true
  );

  const submissionId = normalizeText(payload.submissionId, 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) {
    throw new Error("IDEMPOTENCY_KEY_REQUIRED");
  }

  return { customer: normalizedCustomer, items: normalizedItems, marketingConsent, submissionId };
}

function sanitizePdfText(value: string): string {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/•/g, "-")
    .replace(/[^\x20-\xFF]/g, "");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = sanitizePdfText(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? line + " " + word : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function buildQuotePdf(quote: Record<string, any>): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [595.28, 841.89];
  const margin = 44;
  let page = pdf.addPage(pageSize);
  let y = 800;

  const addPage = () => {
    page = pdf.addPage(pageSize);
    y = 800;
  };
  const drawLine = (text: string, options: { size?: number; font?: typeof regular; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
    const size = options.size ?? 10;
    const font = options.font ?? regular;
    const color = options.color ?? rgb(0.12, 0.17, 0.24);
    const lines = wrapText(text, 96);
    for (const line of lines) {
      if (y < 64) addPage();
      page.drawText(line, { x: margin, y, size, font, color, maxWidth: pageSize[0] - margin * 2 });
      y -= options.gap ?? 15;
    }
  };

  page.drawRectangle({ x: 0, y: 746, width: pageSize[0], height: 96, color: rgb(0, 0.4, 0.8) });
  page.drawText("L&E MÁQUINAS Y REPUESTOS", {
    x: margin, y: 794, size: 19, font: bold, color: rgb(1, 1, 1),
  });
  page.drawText("Unidos por la costura, contigo en cada puntada.", {
    x: margin, y: 775, size: 9, font: regular, color: rgb(0.9, 0.95, 1),
  });
  page.drawText("COTIZACIÓN", {
    x: pageSize[0] - 155, y: 794, size: 13, font: bold, color: rgb(1, 1, 1),
  });

  y = 720;
  drawLine(quote.quote_number, { size: 13, font: bold, color: rgb(0, 0.32, 0.64), gap: 19 });
  drawLine("Fecha de emisión: " + new Date(quote.created_at).toLocaleString("es-CO", {
    timeZone: "America/Bogota", dateStyle: "long", timeStyle: "short",
  }), { size: 9, color: rgb(0.35, 0.4, 0.48) });
  y -= 8;
  drawLine("DATOS DEL CLIENTE", { size: 10, font: bold });
  const customer = quote.customer;
  drawLine("Nombre: " + customer.firstName + " " + customer.lastName);
  drawLine("Celular: " + customer.phone);
  drawLine("Correo: " + customer.email);
  drawLine("Dirección: " + customer.address);
  drawLine("Ciudad / municipio: " + customer.city);
  y -= 8;
  drawLine("PRODUCTOS SOLICITADOS", { size: 10, font: bold });

  let allPriced = true;
  let subtotal = 0;
  for (let index = 0; index < quote.items.length; index++) {
    const item = quote.items[index];
    const base = (index + 1) + ". " + item.name + " | Marca: " + (item.brand || "Por confirmar") +
      " | Ref.: " + (item.model || "Por confirmar") + " | Cantidad: " + item.quantity;
    drawLine(base, { size: 9, font: bold, gap: 13 });
    if (item.unitPrice === null || item.unitPrice === undefined) {
      allPriced = false;
      drawLine("Precio unitario: Por confirmar con asesor.", { size: 9, color: rgb(0.35, 0.4, 0.48) });
    } else {
      const price = Number(item.unitPrice);
      const lineTotal = price * Number(item.quantity);
      subtotal += lineTotal;
      drawLine("Precio unitario: " + formatCOP(price) + " | Total línea: " + formatCOP(lineTotal), {
        size: 9, color: rgb(0.35, 0.4, 0.48),
      });
    }
    y -= 3;
  }

  y -= 5;
  drawLine("RESUMEN", { size: 10, font: bold });
  if (allPriced) {
    drawLine("Subtotal: " + formatCOP(subtotal), { size: 11, font: bold });
    drawLine("Impuestos: se discriminan según corresponda al producto y la operación comercial.", { size: 8 });
    drawLine("Total: " + formatCOP(subtotal) + " (antes de confirmar impuestos y condiciones de entrega).", { size: 9, font: bold });
  } else {
    drawLine("Precios y total: pendientes de validación comercial por L&E.", { size: 9, font: bold });
  }

  y -= 9;
  drawLine("CONDICIONES COMERCIALES", { size: 10, font: bold });
  drawLine("Esta cotización tiene una vigencia de 15 días calendario desde su emisión o hasta agotar existencias, sujeta a confirmación de disponibilidad. Los impuestos, forma de pago, entrega, garantía y especificaciones aplicables deben quedar confirmados con el asesor antes de formalizar el pedido.", { size: 8, gap: 12 });
  drawLine("La garantía y sus condiciones se aplican conforme a la normativa colombiana y a la información específica del producto. Las condiciones particulares se detallarán antes de la compra.", { size: 8, gap: 12 });

  y -= 7;
  drawLine("ATENCIÓN L&E", { size: 10, font: bold });
  drawLine("Bogotá, Colombia | WhatsApp: +57 350 521 8141 | @lye.maquinas.repuestos", { size: 9 });
  drawLine("Documento generado por el sistema de cotizaciones L&E. Conserva el consecutivo para cualquier consulta.", { size: 8, color: rgb(0.4, 0.45, 0.52) });

  return await pdf.save();
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(value);
}

function base64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function sendResendEmail(args: {
  apiKey: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  attachmentBase64: string;
  filename: string;
  idempotencyKey: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + args.apiKey,
      "Content-Type": "application/json",
      "Idempotency-Key": args.idempotencyKey,
    },
    body: JSON.stringify({
      from: args.from,
      to: [args.to],
      ...(args.replyTo ? { reply_to: args.replyTo } : {}),
      subject: args.subject,
      html: args.html,
      text: args.text,
      attachments: [{
        filename: args.filename,
        content: args.attachmentBase64,
      }],
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Resend rejected email:", response.status, result?.name || result?.message || "provider_error");
    return { ok: false, error: "El proveedor de correo no confirmó el envío." };
  }
  return { ok: true, id: result.id };
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:5500,http://127.0.0.1:5500")
    .split(",").map((value) => value.trim()).filter(Boolean);

  if (request.method === "OPTIONS") {
    if (origin && !allowedOrigins.includes(origin)) {
      return jsonResponse({ error: "Origen no autorizado." }, 403, null);
    }
    return new Response("ok", { headers: { ...corsHeaders, ...(origin ? { "Access-Control-Allow-Origin": origin } : {}) } });
  }

  if (request.method !== "POST") return jsonResponse({ error: "Método no permitido." }, 405, origin);
  if (origin && !allowedOrigins.includes(origin)) return jsonResponse({ error: "Origen no autorizado." }, 403, null);

  const publicKeys = getPublishableKeys();
  const incomingKey = request.headers.get("apikey") || "";
  if (!incomingKey || !publicKeys.includes(incomingKey)) {
    return jsonResponse({ error: "Credencial pública inválida." }, 401, origin);
  }

  if (Deno.env.get("PRIVACY_POLICY_APPROVED") !== "true") {
    return jsonResponse({
      error: "El cotizador está pendiente de la aprobación de la Política de Tratamiento de Datos Personales de L&E.",
      code: "PRIVACY_POLICY_NOT_APPROVED",
    }, 503, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = getServiceKey();
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing Supabase server configuration.");
    return jsonResponse({ error: "El servicio de cotizaciones no está configurado." }, 503, origin);
  }

  let payload: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 30_000) return jsonResponse({ error: "La solicitud es demasiado grande." }, 413, origin);
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "El cuerpo de la solicitud no es JSON válido." }, 400, origin);
  }

  if (normalizeText(payload.website, 120)) {
    return jsonResponse({ error: "No fue posible procesar la solicitud." }, 400, origin);
  }

  let validated: ReturnType<typeof validatePayload>;
  try {
    validated = validatePayload(payload);
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_PAYLOAD";
    return jsonResponse({ error: code, code }, 400, origin);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const clientIp = getClientIp(request);
  const userAgent = normalizeText(request.headers.get("user-agent"), 500);
  const policyVersion = Deno.env.get("PRIVACY_POLICY_VERSION") || "v1.0-borrador";
  const clientPolicyVersion = normalizeText(payload.policyVersion, 80);
  if (!clientPolicyVersion || clientPolicyVersion !== policyVersion) {
    return jsonResponse({
      error: "La versión de la política no coincide. Actualiza la página antes de enviar la cotización.",
      code: "POLICY_VERSION_MISMATCH",
    }, 409, origin);
  }
  const dataConsent = { accepted: true };
  const marketingConsent = { accepted: validated.marketingConsent };

  const { data: quoteData, error: quoteError } = await supabase.rpc("create_quote_with_items", {
    p_idempotency_key: validated.submissionId,
    p_customer: validated.customer,
    p_items: validated.items,
    p_data_consent: dataConsent,
    p_marketing_consent: marketingConsent,
    p_client_ip: clientIp,
    p_user_agent: userAgent,
    p_policy_version: policyVersion,
    p_data_consent_text: DATA_CONSENT_TEXT,
    p_marketing_consent_text: MARKETING_CONSENT_TEXT,
  });

  if (quoteError || !quoteData) {
    const message = quoteError?.message || "database_error";
    const known = ["RATE_LIMITED", "CONSENT_REQUIRED", "PRODUCT_NOT_AVAILABLE", "INVALID_QUANTITY", "INVALID_PRODUCT", "INVALID_CUSTOMER", "IDEMPOTENCY_KEY_REQUIRED"];
    const matched = known.find((code) => message.includes(code));
    const status = matched === "RATE_LIMITED" ? 429 : matched === "PRODUCT_NOT_AVAILABLE" ? 409 : matched ? 400 : 500;
    console.error("Quote database operation failed:", matched || "database_error");
    return jsonResponse({
      error: matched === "RATE_LIMITED"
        ? "Has enviado varias solicitudes. Intenta nuevamente más tarde."
        : matched === "PRODUCT_NOT_AVAILABLE"
          ? "Uno de los productos ya no está disponible en el catálogo."
          : matched
            ? "Revisa los datos del formulario y vuelve a intentarlo."
            : "No fue posible registrar la solicitud. Intenta nuevamente.",
      code: matched || "DATABASE_ERROR",
    }, status, origin);
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await buildQuotePdf(quoteData);
  } catch (error) {
    console.error("PDF generation failed:", error instanceof Error ? error.message : "unknown");
    await supabase.from("quotes").update({
      email_status: "failed",
      email_error: "No fue posible generar el documento PDF.",
      updated_at: new Date().toISOString(),
    }).eq("id", quoteData.id);
    return jsonResponse({
      quoteId: quoteData.id,
      quoteNumber: quoteData.quoteNumber,
      createdAt: quoteData.createdAt,
      emailSent: false,
      emailStatus: "failed",
      pdfSignedUrl: null,
      warning: "La solicitud quedó registrada, pero el PDF no pudo generarse. Contacta a L&E con el consecutivo.",
    }, 201, origin);
  }

  const filename = quoteData.quoteNumber + ".pdf";
  const year = new Date(quoteData.createdAt).toLocaleDateString("en-CA", { timeZone: "America/Bogota" }).slice(0, 4);
  const storagePath = year + "/" + filename;
  let pdfSignedUrl: string | null = null;
  let pdfStored = false;

  const upload = await supabase.storage.from("quote-pdfs").upload(storagePath, pdfBytes, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (upload.error) {
    // Puede ser un reintento de la misma cotización cuyo PDF ya existe.
    console.error("Quote PDF storage upload:", upload.error.message);
  }

  const signed = await supabase.storage.from("quote-pdfs").createSignedUrl(storagePath, 60 * 60 * 24 * 7, {
    download: filename,
  });
  if (!signed.error) {
    pdfSignedUrl = signed.data.signedUrl;
    pdfStored = true;
    await supabase.from("quotes").update({
      pdf_path: storagePath,
      updated_at: new Date().toISOString(),
    }).eq("id", quoteData.id);
  } else {
    console.error("Quote PDF signed URL failed:", signed.error.message);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "";
  const businessEmail = Deno.env.get("QUOTE_NOTIFICATION_EMAIL") || "";
  const replyTo = Deno.env.get("QUOTE_REPLY_TO") || "";
  let emailStatus = "not_configured";
  let customerEmailSent = false;
  let businessEmailSent = false;
  const emailErrors: string[] = [];

  if (resendApiKey && fromEmail && businessEmail) {
    const attachment = base64(pdfBytes);
    const quoteNumber = quoteData.quoteNumber;
    customerEmailSent = Boolean(quoteData.customerEmailSentAt);
    businessEmailSent = Boolean(quoteData.businessEmailSentAt);
    const customer = quoteData.customer;
    const itemLines = quoteData.items.map((item: Record<string, unknown>) =>
      "<li>" + escapeHtml(item.name) + " - cantidad: " + escapeHtml(item.quantity) + "</li>"
    ).join("");
    const safeName = escapeHtml(customer.firstName);
    const safeLastName = escapeHtml(customer.lastName);
    if (!customerEmailSent) {
    const customerEmail = await sendResendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: customer.email,
      replyTo: replyTo || businessEmail,
      subject: "Tu cotización " + quoteNumber + " - L&E Máquinas y Repuestos",
      html: "<p>Hola " + safeName + ",</p><p>Recibimos tu solicitud de cotización <strong>" + quoteNumber +
        "</strong>. Adjuntamos el documento para que puedas consultarlo.</p><ul>" + itemLines +
        "</ul><p>Un asesor de L&E validará las especificaciones, precios y disponibilidad cuando corresponda.</p><p>WhatsApp: +57 350 521 8141</p>",
      text: "Hola " + safeName + ". Adjuntamos tu solicitud de cotización " + quoteNumber +
        ". Un asesor de L&E validará precios y disponibilidad. WhatsApp +57 350 521 8141.",
      attachmentBase64: attachment,
      filename,
      idempotencyKey: quoteNumber + "-customer",
    });
    customerEmailSent = customerEmail.ok;
    if (!customerEmail.ok) emailErrors.push("customer");
    }

    if (!businessEmailSent) {
    const businessEmailResult = await sendResendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: businessEmail,
      replyTo: customer.email,
      subject: "Nueva solicitud " + quoteNumber + " - " + customer.firstName + " " + customer.lastName,
      html: "<h2>Nueva solicitud de cotización</h2><p><strong>Consecutivo:</strong> " + quoteNumber +
        "</p><p><strong>Cliente:</strong> " + safeName + " " + safeLastName +
        "</p><p><strong>Correo:</strong> " + escapeHtml(customer.email) + "</p><p><strong>Celular:</strong> " + escapeHtml(customer.phone) +
        "</p><p><strong>Ciudad:</strong> " + escapeHtml(customer.city) + "</p><ul>" + itemLines + "</ul><p>Se adjunta PDF.</p>",
      text: "Nueva solicitud " + quoteNumber + " de " + customer.firstName + " " + customer.lastName +
        ". Correo: " + customer.email + ". Celular: " + customer.phone + ".",
      attachmentBase64: attachment,
      filename,
      idempotencyKey: quoteNumber + "-business",
    });
    businessEmailSent = businessEmailResult.ok;
    if (!businessEmailResult.ok) emailErrors.push("business");
    }

    emailStatus = customerEmailSent && businessEmailSent
      ? "sent"
      : customerEmailSent || businessEmailSent
        ? "partial"
        : "failed";
  }

  const now = new Date().toISOString();
  await supabase.from("quotes").update({
    email_status: emailStatus,
    customer_email_sent_at: customerEmailSent ? now : null,
    business_email_sent_at: businessEmailSent ? now : null,
    email_error: emailErrors.length ? "Falló el envío para: " + emailErrors.join(", ") : null,
    updated_at: now,
  }).eq("id", quoteData.id);

  if (pdfSignedUrl && !pdfStored) pdfSignedUrl = null;

  return jsonResponse({
    quoteId: quoteData.id,
    quoteNumber: quoteData.quoteNumber,
    createdAt: quoteData.createdAt,
    emailSent: customerEmailSent && businessEmailSent,
    customerEmailSent,
    businessEmailSent,
    emailStatus,
    pdfStored,
    pdfSignedUrl,
    idempotentReplay: Boolean(quoteData.idempotentReplay),
    warning: !customerEmailSent
      ? "La solicitud quedó registrada. El correo no pudo confirmarse; conserva el consecutivo y contacta a L&E."
      : null,
  }, 201, origin);
});
