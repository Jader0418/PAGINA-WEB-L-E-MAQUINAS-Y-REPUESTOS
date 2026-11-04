const products = [
  { id: "plana-electronica", name: "Máquina plana electrónica", category: "Planas", subcategory: "Electrónica", brand: "Marca por confirmar", description: "Costura recta para operaciones de confección. Consulta la referencia adecuada para tu material y ritmo de producción.", use: ["workshop", "home"], tile: "#DCEBFA", kind: "machine", featured: true, model: "Referencia por confirmar", price: null, oldPrice: null, discountPercent: null, photoUrls: [], videoUrl: "", specs: {} },
  { id: "fileteadora-mecatronica", name: "Fileteadora mecatrónica", category: "Fileteadoras", subcategory: "Mecatrónica", brand: "Marca por confirmar", description: "Para operaciones de fileteado y acabado de prendas. Configuración y prestaciones por confirmar según modelo.", use: ["workshop"], tile: "#E8EDE9", kind: "machine", model: "Referencia por confirmar", price: null, oldPrice: null, discountPercent: null, photoUrls: [], videoUrl: "", specs: {} },
  { id: "fileteadora-industrial", name: "Fileteadora industrial", category: "Fileteadoras", subcategory: "Industrial", brand: "Marca por confirmar", description: "Alternativa para procesos de sobrehilado. Consulta puntadas, calibre y configuración del equipo.", use: ["workshop"], tile: "#E8E3D9", kind: "machine", model: "Referencia por confirmar", price: null, oldPrice: null, discountPercent: null, photoUrls: [], videoUrl: "", specs: {} },
  { id: "collarin-industrial", name: "Collarín industrial", category: "Collarines", subcategory: "Recubrimiento", brand: "Marca por confirmar", description: "Equipo para acabados y recubrimiento en prendas. Verifica aplicaciones y accesorios con nuestro equipo.", use: ["workshop"], tile: "#DCE8E8", kind: "machine", model: "Referencia por confirmar", price: null, oldPrice: null, discountPercent: null, photoUrls: [], videoUrl: "", specs: {} },
  { id: "bordadora", name: "Bordadora computarizada", category: "Bordadoras", subcategory: "Bordado", brand: "Marca por confirmar", description: "Soluciones de bordado para personalizar prendas y desarrollar nuevos servicios. Modelos y cabezales por confirmar.", use: ["workshop", "home"], tile: "#EAE2F1", kind: "machine", model: "Referencia por confirmar", price: null, oldPrice: null, discountPercent: null, photoUrls: [], videoUrl: "", specs: {} },
  { id: "presilladora", name: "Presilladora industrial", category: "Presilladoras", subcategory: "Refuerzo", brand: "Marca por confirmar", description: "Para operaciones de refuerzo y presillas. Consulta patrones, área de costura y funciones según referencia.", use: ["workshop"], tile: "#F2E5DD", kind: "machine", model: "Referencia por confirmar", price: null, oldPrice: null, discountPercent: null, photoUrls: [], videoUrl: "", specs: {} },
  { id: "repuestos", name: "Repuestos para máquinas", category: "Repuestos", subcategory: "Componentes", brand: "Marca por confirmar", description: "Componentes y piezas para mantenimiento y operación. Indica marca y referencia de tu máquina para validar compatibilidad.", use: ["workshop", "home"], tile: "#E3E8EF", kind: "parts", model: "Referencia por confirmar", price: null, oldPrice: null, discountPercent: null, photoUrls: [], videoUrl: "", specs: {} },
  { id: "accesorios", name: "Accesorios de confección", category: "Accesorios", subcategory: "Complementos", brand: "Marca por confirmar", description: "Complementos y herramientas para tu espacio de costura. Disponibilidad y compatibilidad bajo consulta.", use: ["workshop", "home"], tile: "#F3EBD7", kind: "parts", model: "Referencia por confirmar", price: null, oldPrice: null, discountPercent: null, photoUrls: [], videoUrl: "", specs: {} }
];

const brandNames = ["JACK", "KANSEW SPECIAL", "SIRUBA", "JUKI", "BROTHER", "SINGER", "SERVEX", "KANSAI SPECIAL"];
const machineImage = "assets/sewing-machine-specimen.svg";
const partsImage = "assets/parts-specimen.svg";
const quote = new Map();
let activeCategory = "all";
let activeBrand = "all";
let activeAudience = "workshop";
let lastPdfUrl = null;
let toastTimer = null;

const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("productSearch");
const brandFilter = document.getElementById("brandFilter");
const quoteDialog = document.getElementById("quoteDialog");
const productDialog = document.getElementById("productDialog");
const quoteForm = document.getElementById("quoteForm");
const quoteResult = document.getElementById("quoteResult");
const quoteItems = document.getElementById("quoteItems");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
  });
}

function imageFor(product) {
  return product.kind === "parts" ? partsImage : machineImage;
}

function primaryImageFor(product) {
  return product.photoUrls && product.photoUrls.length ? product.photoUrls[0] : imageFor(product);
}

function formatCOP(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function renderBrandOptions() {
  const brands = brandNames.slice();
  brandFilter.innerHTML = '<option value="all">Todas las marcas</option>' + brands.map(function (brand) {
    return '<option value="' + escapeHtml(brand) + '">' + escapeHtml(brand) + '</option>';
  }).join("");
}

function filteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  return products.filter(function (product) {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesBrand = activeBrand === "all" || product.brand === activeBrand;
    const haystack = [product.name, product.category, product.subcategory, product.brand, product.description].join(" ").toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    return matchesCategory && matchesBrand && matchesSearch;
  }).sort(function (a, b) {
    const aPreferred = a.use.includes(activeAudience) ? 0 : 1;
    const bPreferred = b.use.includes(activeAudience) ? 0 : 1;
    return aPreferred - bPreferred;
  });
}

function renderProducts() {
  const items = filteredProducts();
  document.getElementById("catalogResultCount").textContent = items.length + (items.length === 1 ? " resultado" : " resultados");
  if (!items.length) {
    grid.innerHTML = '<div class="empty-results"><strong>' + (activeBrand !== "all" ? "Aún no hay referencias de " + escapeHtml(activeBrand) + " cargadas en el catálogo." : "No encontramos productos con esos filtros.") + '</strong><br>' + (activeBrand !== "all" ? "Escríbenos y confirmaremos los modelos y disponibilidad de esta marca." : "Prueba otra búsqueda o limpia los filtros.") + '</div>';
    return;
  }

  grid.innerHTML = items.map(function (product) {
    const hasPhoto = product.photoUrls && product.photoUrls.length > 0;
    const hasPrice = Number.isFinite(product.price) && product.price > 0;
    const hasDiscount = hasPrice && Number.isFinite(product.oldPrice) && product.oldPrice > product.price;
    const badge = hasDiscount
      ? '<span class="specimen-badge specimen-badge--discount">-' + (product.discountPercent || Math.round((1 - product.price / product.oldPrice) * 100)) + '%</span>'
      : (product.featured ? '<span class="specimen-badge">Destacado</span>' : "");
    const priceMarkup = hasPrice
      ? formatCOP(product.price) + (hasDiscount ? '<small><s>' + formatCOP(product.oldPrice) + '</s> Precio promocional</small>' : '<small>Precio sujeto a confirmación</small>')
      : 'Consultar precio<small>Precio y disponibilidad por confirmar</small>';
    return '<article class="specimen-card" data-kind="' + product.kind + '">' +
      '<div class="specimen-art" style="--tile:' + product.tile + '">' + badge +
      '<img src="' + escapeHtml(primaryImageFor(product)) + '" alt="' + (hasPhoto ? 'Fotografía de ' : 'Ilustración referencial de ') + escapeHtml(product.name) + '" loading="lazy">' +
      (!hasPhoto ? '<span class="specimen-image-note">Imagen referencial</span>' : '') + '</div>' +
      '<div class="specimen-content"><div class="specimen-meta"><span>' + escapeHtml(product.category.toUpperCase()) + ' / ' + escapeHtml(product.subcategory.toUpperCase()) + '</span><span>' + escapeHtml(product.brand) + '</span></div>' +
      '<h3>' + escapeHtml(product.name) + '</h3><p>' + escapeHtml(product.description) + '</p>' +
      '<div class="specimen-bottom"><div class="specimen-price">' + priceMarkup + '</div>' +
      '<div class="specimen-actions"><button class="detail-link" type="button" data-detail="' + product.id + '">Ver ficha</button><button class="add-link" type="button" data-add="' + product.id + '">＋ Cotizar</button></div></div></div></article>';
  }).join("");
}

function updateQuoteCount() {
  const count = Array.from(quote.values()).reduce(function (total, item) { return total + item.quantity; }, 0);
  document.getElementById("headerQuoteCount").textContent = count;
  document.getElementById("mobileQuoteCount").textContent = count;
  document.getElementById("quoteItemCount").textContent = count + (count === 1 ? " producto" : " productos");
  return count;
}

function addToQuote(id) {
  const product = products.find(function (item) { return item.id === id; });
  if (!product) return;
  const existing = quote.get(id);
  if (existing) existing.quantity += 1;
  else quote.set(id, { product: product, quantity: 1 });
  updateQuoteCount();
  renderQuoteItems();
  showToast("Agregaste " + product.name + " a tu cotización.");
}

function changeQuantity(id, delta) {
  const item = quote.get(id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) quote.delete(id);
  updateQuoteCount();
  renderQuoteItems();
}

function renderQuoteItems() {
  const entries = Array.from(quote.entries());
  if (!entries.length) {
    quoteItems.innerHTML = '<p class="empty-quote">Todavía no agregas productos. Explora el catálogo para comenzar.</p>';
    return;
  }
  quoteItems.innerHTML = entries.map(function (entry) {
    const id = entry[0];
    const item = entry[1];
    return '<article class="quote-item" style="--tile:' + item.product.tile + '">' +
      '<img src="' + imageFor(item.product) + '" alt="" aria-hidden="true">' +
      '<div><h4>' + escapeHtml(item.product.name) + '</h4><p>' + escapeHtml(item.product.brand) + ' · ' + escapeHtml(item.product.category) + '</p></div>' +
      '<div class="quote-item-actions"><button class="qty-button" type="button" data-qty="' + id + '" data-delta="-1" aria-label="Restar uno">−</button><span class="qty-value">' + item.quantity + '</span><button class="qty-button" type="button" data-qty="' + id + '" data-delta="1" aria-label="Agregar uno">+</button></div>' +
      '<button class="remove-item" type="button" data-remove="' + id + '">Quitar</button></article>';
  }).join("");
}

function openQuote() {
  renderQuoteItems();
  quoteResult.hidden = true;
  if (typeof quoteDialog.showModal === "function") quoteDialog.showModal();
  else quoteDialog.setAttribute("open", "");
  document.body.classList.add("dialog-open");
}

function closeDialog(dialog) {
  if (dialog && typeof dialog.close === "function") dialog.close();
  else if (dialog) dialog.removeAttribute("open");
  if (!productDialog.open && !quoteDialog.open) document.body.classList.remove("dialog-open");
}

function showProduct(id) {
  const product = products.find(function (item) { return item.id === id; });
  if (!product) return;
  const specs = product.specs || {};
  const specifications = [
    ["Referencia", product.model || "Por confirmar"],
    ["Tipo de motor", specs.motor || "Confirmar según referencia"],
    ["Velocidad", specs.speed || "Consultar ficha del fabricante"],
    ["Lubricación", specs.lubrication || "Confirmar según modelo"],
    ["Voltaje", specs.voltage || "Confirmar antes de la compra"],
    ["Garantía", specs.warranty || "Condiciones por producto"]
  ];
  const hasPhoto = product.photoUrls && product.photoUrls.length > 0;
  const hasPrice = Number.isFinite(product.price) && product.price > 0;
  const priceText = hasPrice ? formatCOP(product.price) : "Consultar con asesor";
  const videoMarkup = product.videoUrl
    ? '<div class="detail-video-wrap"><h3>Video del equipo</h3><video class="detail-video" controls preload="metadata" src="' + escapeHtml(product.videoUrl) + '">Tu navegador no soporta video.</video></div>'
    : '<p class="detail-media-note">Video demostrativo pendiente de cargar para esta referencia.</p>';
  document.getElementById("productDetail").innerHTML =
    '<div class="product-detail-layout" style="--tile:' + product.tile + '">' +
    '<div class="product-detail-art"><img id="detailMainImage" src="' + escapeHtml(primaryImageFor(product)) + '" alt="' + (hasPhoto ? 'Fotografía de ' : 'Ilustración referencial de ') + escapeHtml(product.name) + '">' +
    (hasPhoto && product.photoUrls.length > 1 ? '<div class="detail-photo-strip">' + product.photoUrls.slice(1).map(function (url, index) { return '<button type="button" data-photo="' + escapeHtml(url) + '" aria-label="Ver fotografía ' + (index + 2) + '"><img src="' + escapeHtml(url) + '" alt=""></button>'; }).join("") + '</div>' : '') +
    '</div>' +
    '<div class="product-detail-copy"><p class="section-kicker">' + escapeHtml(product.brand) + ' · ' + escapeHtml(product.category) + '</p>' +
    '<h2 id="detailTitle">' + escapeHtml(product.name) + '</h2><p>' + escapeHtml(product.description) + '</p>' +
    '<dl class="detail-specs">' + specifications.map(function (spec) { return '<div><dt>' + spec[0] + '</dt><dd>' + escapeHtml(spec[1]) + '</dd></div>'; }).join("") + '</dl>' +
    '<div class="detail-price"><strong>' + priceText + '</strong>' + (hasPrice && product.oldPrice > product.price ? '<s>' + formatCOP(product.oldPrice) + '</s><span>-' + (product.discountPercent || Math.round((1 - product.price / product.oldPrice) * 100)) + '%</span>' : '') + '</div>' +
    videoMarkup +
    '<p class="detail-disclaimer">' + (hasPhoto ? "Fotografía de la referencia." : "Ilustración referencial; se cargarán fotografías propias de la referencia.") + ' Precio, descuentos, disponibilidad y condiciones se confirman antes de emitir la cotización oficial.</p>' +
    '<button class="button button-primary" type="button" data-add-detail="' + product.id + '">Agregar a cotización <span aria-hidden="true">→</span></button>' +
    '</div></div>';
  if (typeof productDialog.showModal === "function") productDialog.showModal();
  else productDialog.setAttribute("open", "");
  document.body.classList.add("dialog-open");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2500);
}

function updateAudience(audience) {
  activeAudience = audience;
  document.querySelectorAll(".switch-option").forEach(function (button) {
    const active = button.dataset.audience === audience;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  document.getElementById("audienceHint").textContent = audience === "workshop"
    ? "Equipos para producción, trabajo continuo y especialización."
    : "Opciones para emprender, crear desde casa y elegir con asesoría.";
  renderProducts();
}

function resetFilters() {
  activeCategory = "all";
  activeBrand = "all";
  searchInput.value = "";
  brandFilter.value = "all";
  document.querySelectorAll(".filter-chip").forEach(function (button) {
    const active = button.dataset.category === "all";
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  renderProducts();
}

function quotePayload(formData) {
  const items = Array.from(quote.values()).map(function (item) {
    return {
      productId: item.product.id,
      name: item.product.name,
      brand: item.product.brand,
      category: item.product.category,
      quantity: item.quantity,
      model: item.product.model || "Referencia por confirmar",
      unitPrice: item.product.price,
      discountPercent: item.product.discountPercent
    };
  });
  return {
    customer: {
      firstName: formData.get("firstName").trim(),
      lastName: formData.get("lastName").trim(),
      phone: formData.get("phone").trim(),
      email: formData.get("email").trim(),
      address: formData.get("address").trim(),
      city: formData.get("city").trim()
    },
    items: items,
    dataConsent: true,
    privacyPolicyVersion: "borrador-v1",
    createdAt: new Date().toISOString(),
    source: "web-le"
  };
}

function createDraftPdf(payload) {
  if (!window.jspdf || !window.jspdf.jsPDF) return null;
  const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
  const margin = 17;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 21;
  doc.setFillColor(0, 102, 204);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("L&E MÁQUINAS Y REPUESTOS", margin, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Unidos por la costura, contigo en cada puntada.", margin, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SOLICITUD DE COTIZACIÓN - BORRADOR", margin, 47);
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Documento preliminar. No es una cotización comercial oficial ni confirma precios o existencias.", margin, 54);
  y = 68;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text("Datos del cliente", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  const c = payload.customer;
  const customerLines = [
    "Nombre: " + c.firstName + " " + c.lastName,
    "Celular: " + c.phone,
    "Correo: " + c.email,
    "Dirección: " + c.address,
    "Ciudad / municipio: " + c.city
  ];
  customerLines.forEach(function (line) {
    const parts = doc.splitTextToSize(line, pageWidth - margin * 2);
    doc.text(parts, margin, y);
    y += parts.length * 5;
  });
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Productos solicitados", margin, y);
  y += 7;
  payload.items.forEach(function (item, index) {
    const line = (index + 1) + ". " + item.name + " | " + item.brand + " | Ref.: " + (item.model || "Por confirmar") + " | Cantidad: " + item.quantity + " | Precio unitario: " + (item.unitPrice ? formatCOP(item.unitPrice) : "A confirmar") + (item.discountPercent ? " | Descuento: " + item.discountPercent + "%" : "");
    const parts = doc.splitTextToSize(line, pageWidth - margin * 2);
    if (y + parts.length * 5 > 275) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "normal");
    doc.text(parts, margin, y);
    y += parts.length * 5 + 2;
  });
  y += 6;
  if (y > 270) { doc.addPage(); y = 20; }
  doc.setFont("helvetica", "bold");
  doc.text("Precios y disponibilidad", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize("Pendientes de confirmación por L&E. Un asesor validará la referencia, precio, impuestos, disponibilidad y condiciones antes de emitir una oferta.", pageWidth - margin * 2), margin, y);
  y += 14;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Autorización de tratamiento de datos aceptada en el formulario: Sí.", margin, y);
  doc.text("Fecha de preparación: " + new Date().toLocaleString("es-CO"), margin, y + 5);
  doc.text("Contacto L&E: +57 350 521 8141 · Bogotá, Colombia", margin, y + 10);
  return doc;
}

function showQuoteResult(payload, pdfUrl, apiResult) {
  const customer = payload.customer;
  const summary = payload.items.map(function (item) { return "- " + item.name + " (" + item.brand + ") x" + item.quantity; }).join("\n");
  const message = "Hola, L&E. Quiero continuar con esta solicitud de cotización.\n\nNombre: " + customer.firstName + " " + customer.lastName +
    "\nCelular: " + customer.phone + "\nCorreo: " + customer.email + "\nDirección: " + customer.address + "\nCiudad: " + customer.city +
    "\n\nProductos:\n" + summary;
  const whatsappUrl = "https://wa.me/573505218141?text=" + encodeURIComponent(message);

  quoteResult.hidden = false;
  if (apiResult && apiResult.consecutive) {
    quoteResult.innerHTML = '<h4>Solicitud registrada: ' + escapeHtml(apiResult.consecutive) + '</h4><p>' +
      (apiResult.emailSent ? "El PDF fue enviado al correo indicado." : "La solicitud fue registrada. El envío del correo está pendiente de confirmación.") +
      '</p><div class="quote-result-actions">' +
      (apiResult.pdfUrl ? '<a href="' + escapeHtml(apiResult.pdfUrl) + '" target="_blank" rel="noopener">Descargar PDF</a>' : "") +
      '<a class="whatsapp-result" href="' + whatsappUrl + '" target="_blank" rel="noopener">Hablar con un asesor</a></div>';
    return;
  }

  quoteResult.innerHTML = '<h4>Vista previa preparada</h4><p>El formulario funciona en modo de demostración: el PDF puede descargarse desde este navegador, pero la solicitud todavía no se guarda en una base de datos ni se envía automáticamente por correo. Para compartirla con L&E, usa el botón de WhatsApp.</p>' +
    '<div class="quote-result-actions">' +
    (pdfUrl ? '<a href="' + pdfUrl + '" download="solicitud-cotizacion-LE.pdf">Descargar PDF</a>' : '<button type="button" id="printQuote">Imprimir / guardar PDF</button>') +
    '<a class="whatsapp-result" href="' + whatsappUrl + '" target="_blank" rel="noopener">Enviar por WhatsApp</a></div>';
  const printButton = document.getElementById("printQuote");
  if (printButton) printButton.addEventListener("click", function () { window.print(); });
}

async function handleQuoteSubmit(event) {
  event.preventDefault();
  if (quote.size === 0) {
    showToast("Agrega al menos un producto a tu cotización.");
    return;
  }
  if (!quoteForm.reportValidity()) return;

  const formData = new FormData(quoteForm);
  const payload = quotePayload(formData);
  const submitButton = document.getElementById("submitQuote");
  submitButton.disabled = true;
  submitButton.textContent = "Preparando solicitud…";

  try {
    const apiBaseUrl = window.LE_CONFIG && window.LE_CONFIG.apiBaseUrl ? window.LE_CONFIG.apiBaseUrl.replace(/\/$/, "") : "";
    if (apiBaseUrl) {
      const response = await fetch(apiBaseUrl + "/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(result.message || "No fue posible registrar la solicitud.");
      showQuoteResult(payload, null, result);
    } else {
      const pdf = createDraftPdf(payload);
      if (lastPdfUrl) URL.revokeObjectURL(lastPdfUrl);
      lastPdfUrl = null;
      if (pdf) {
        const blob = pdf.output("blob");
        lastPdfUrl = URL.createObjectURL(blob);
      }
      showQuoteResult(payload, lastPdfUrl, null);
    }
    quoteResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    quoteResult.hidden = false;
    quoteResult.innerHTML = '<div class="quote-error">' + escapeHtml(error.message || "Ocurrió un error al preparar tu solicitud.") + ' Tus datos siguen en el formulario. Intenta nuevamente o comunícate por WhatsApp.</div>';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Preparar solicitud de cotización <span aria-hidden="true">→</span>';
  }
}

grid.addEventListener("click", function (event) {
  const addButton = event.target.closest("[data-add]");
  const detailButton = event.target.closest("[data-detail]");
  if (addButton) addToQuote(addButton.dataset.add);
  if (detailButton) showProduct(detailButton.dataset.detail);
});

document.getElementById("productDetail").addEventListener("click", function (event) {
  const photoButton = event.target.closest("[data-photo]");
  const addButton = event.target.closest("[data-add-detail]");
  if (photoButton) {
    const mainImage = document.getElementById("detailMainImage");
    if (mainImage) mainImage.src = photoButton.dataset.photo;
    return;
  }
  if (addButton) {
    addToQuote(addButton.dataset.addDetail);
    closeDialog(productDialog);
  }
});

quoteItems.addEventListener("click", function (event) {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(quantityButton.dataset.qty, Number(quantityButton.dataset.delta));
  if (removeButton) {
    quote.delete(removeButton.dataset.remove);
    updateQuoteCount();
    renderQuoteItems();
  }
});

document.querySelectorAll(".quote-open").forEach(function (button) { button.addEventListener("click", openQuote); });
document.querySelectorAll("[data-close-quote]").forEach(function (button) { button.addEventListener("click", function () { closeDialog(quoteDialog); }); });
document.querySelectorAll("[data-close-product]").forEach(function (button) { button.addEventListener("click", function () { closeDialog(productDialog); }); });
quoteDialog.addEventListener("click", function (event) { if (event.target === quoteDialog) closeDialog(quoteDialog); });
productDialog.addEventListener("click", function (event) { if (event.target === productDialog) closeDialog(productDialog); });
quoteForm.addEventListener("submit", handleQuoteSubmit);
searchInput.addEventListener("input", renderProducts);
brandFilter.addEventListener("change", function () { activeBrand = brandFilter.value; renderProducts(); });

document.getElementById("categoryFilters").addEventListener("click", function (event) {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-chip").forEach(function (chip) {
    const active = chip === button;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", active ? "true" : "false");
  });
  renderProducts();
});

document.getElementById("clearFilters").addEventListener("click", resetFilters);
document.querySelectorAll(".switch-option").forEach(function (button) {
  button.addEventListener("click", function () { updateAudience(button.dataset.audience); });
});

document.getElementById("brandList").addEventListener("click", function (event) {
  const button = event.target.closest("[data-brand]");
  if (!button) return;
  activeBrand = button.dataset.brand;
  brandFilter.value = activeBrand;
  activeCategory = "all";
  document.querySelectorAll(".filter-chip").forEach(function (chip) {
    const active = chip.dataset.category === "all";
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", active ? "true" : "false");
  });
  renderProducts();
  document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
});

const menuToggle = document.getElementById("mobileMenuToggle");
const mobileMenu = document.getElementById("mobileMenu");
menuToggle.addEventListener("click", function () {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
  mobileMenu.hidden = isOpen;
});
mobileMenu.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    mobileMenu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("backToCatalog").addEventListener("click", function () {
  closeDialog(quoteDialog);
});
document.getElementById("currentYear").textContent = new Date().getFullYear();
renderBrandOptions();
renderProducts();
renderQuoteItems();
updateQuoteCount();