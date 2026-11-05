# L&E MÁQUINAS Y REPUESTOS

<p align="center">
  <img src="https://img.shields.io/badge/L%26E-M%C3%A1quinas%20y%20Repuestos-0066CC?style=for-the-badge" alt="L&E Máquinas y Repuestos" />
  <img src="https://img.shields.io/badge/Distribuidor%20autorizado-JACK-0066CC?style=for-the-badge" alt="Distribuidor autorizado JACK" />
  <img src="https://img.shields.io/badge/Sitio%20web-Primera%20versi%C3%B3n-0066CC?style=for-the-badge" alt="Primera versión del sitio" />
</p>

<h3 align="center">Unidos por la costura, contigo en cada puntada.</h3>

<p align="center">Sitio web corporativo y catálogo digital de máquinas de coser industriales, repuestos y accesorios.</p>

---

## Acerca de L&E

**L&E MÁQUINAS Y REPUESTOS** es una empresa colombiana dedicada a la comercialización de máquinas de coser industriales, repuestos y accesorios para el sector de la confección. Somos distribuidores autorizados de **JACK** y trabajamos con marcas como Kansew Special, Siruba, Juki, Brother, Singer, Servex y Kansai Special.

El sitio está dirigido a propietarios de talleres, empresas de confección, emprendedores y personas que cosen desde casa.

## Dirección de diseño

La interfaz sigue la dirección **`specimen-catalogue`** de la skill **`design-taste-frontend`**: un catálogo editorial de especímenes mecánicos que da protagonismo a cada equipo, su categoría y su información técnica.

- Mobile-first y responsive.
- Paleta corporativa basada en azul `#0066CC`, fondos claros y tinta grafito.
- Rojo industrial reservado para acciones comerciales.
- Tipografía Plus Jakarta Sans.
- Catálogo visual sin gradientes decorativos ni sombras artificiales.
- Selector de uso: taller / hogar y emprendimiento.

## Funcionalidades implementadas en el frontend

- [x] Portada y presentación de L&E.
- [x] Catálogo inicial con búsqueda.
- [x] Filtros por categoría y marca.
- [x] Selector de uso para taller u hogar / emprendimiento.
- [x] Fichas de producto con campos técnicos pendientes de confirmar.
- [x] Lista de cotización con cantidades y eliminación de productos.
- [x] Formulario de datos del cliente y autorización de tratamiento de datos desmarcada por defecto.
- [x] PDF preliminar local en modo demostración; PDF del servidor cuando Supabase esté configurado.
- [x] Acceso contextual a WhatsApp.
- [x] Sección de promociones, marcas, empresa y contacto.
- [x] Página informativa legal en preparación.
- [x] Diseño adaptable a celulares, tablets y escritorio.

## Catálogo inicial

La estructura contempla estas categorías:

| Categoría | Ejemplos |
|---|---|
| Planas | Mecánicas y electrónicas |
| Fileteadoras | Mecánicas y mecatrónicas |
| Collarines | Equipos de recubrimiento |
| Bordadoras | Equipos de bordado |
| Presilladoras | Equipos de refuerzo |
| Repuestos | Componentes y piezas |
| Accesorios | Complementos de confección |

Las referencias incluidas en esta primera versión son registros de catálogo ilustrativos. Los modelos exactos, fotografías propias, precios, descuentos, existencias y fichas técnicas deben ser cargados y validados por L&E antes de publicar información comercial definitiva.

## Estructura del proyecto

```text
.
├── index.html
├── styles.css
├── app.js
├── config.js
├── legal.html
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   ├── functions/
│   └── tests/
└── assets/
    ├── credits.json
    ├── sewing-machine-specimen.svg
    ├── parts-specimen.svg
    ├── singer-sewing-machine-detail1.jpg
    ├── two-threads-threaded-sewing-machine.jpg
    └── woman-sewing-a-face-mask-with-a.jpg
```

## Ejecutar localmente

No se requiere un framework de compilación para esta primera versión. Puedes ejecutar la página con un servidor estático desde la carpeta raíz.

Con Python:

```bash
python -m http.server 5500
```

Después abre:

```text
http://localhost:5500
```

También puedes abrir la carpeta en Visual Studio Code y utilizar la extensión Live Server.


## Publicar en GitHub Pages

El repositorio incluye un workflow en `.github/workflows/pages.yml` que prepara y publica solamente los archivos del sitio y la carpeta `assets` cada vez que se actualiza la web en `main`.

Para activar la publicación por primera vez:

1. Abre **Settings → Pages** en el repositorio.
2. En **Build and deployment**, selecciona **GitHub Actions** como fuente.
3. Abre la pestaña **Actions** y revisa la ejecución de **Deploy L&E website to GitHub Pages**.
4. Cuando el workflow termine correctamente, GitHub mostrará la URL pública en **Settings → Pages** y en el resumen de la ejecución.


## Sistema de cotizaciones: backend

La integración de cotizaciones está preparada con **Supabase (PostgreSQL, Edge Functions y Storage privado)** y **Gmail API** (OAuth 2.0) para correo transaccional.

**Estado de conexión (4 de noviembre de 2026):** el proyecto principal de Supabase `LE-MAQUINAS-REPUESTOS` está activo en `sa-east-1` (São Paulo). La migración de cotizaciones está aplicada y coincide con el archivo versionado en `supabase/migrations/20261104182721_create_quotes_system.sql`. Las siete tablas, ocho marcas de demostración y el bucket privado `quote-pdfs` existen. Se verificó que `anon` y `authenticated` no pueden leer los datos personales ni ejecutar la función RPC. La Edge Function `create-quote` ya está desplegada y activa en Supabase. GitHub Pages también quedó habilitado y la publicación del sitio terminó correctamente en el workflow #20. Aún faltan configurar el origen permitido y los secretos de correo, aprobar la política definitiva, cargar el catálogo real y activar `config.js`; por seguridad, el formulario sigue en modo demostración.

### Flujo implementado en el servidor

1. El navegador envía los datos de contacto, los identificadores de producto, cantidades y consentimientos.
2. La Edge Function valida los campos, limita el tamaño del formulario y rechaza el campo trampa anti-spam.
3. PostgreSQL valida que cada producto exista y esté activo, guarda o actualiza el registro del cliente y crea la cotización con sus líneas en una sola transacción.
4. El consecutivo se genera de forma transaccional por año: `COT-AAAA-0001`.
5. Se guarda evidencia separada de autorización para gestionar la cotización y de autorización opcional de mercadeo.
6. El servidor genera el PDF, intenta almacenarlo en el bucket privado `quote-pdfs` y crea un enlace firmado de duración limitada.
7. Gmail API envía el PDF al correo que escribió el cliente en el formulario y una notificación independiente a `lyemaquinasyrepuestos@gmail.com`, desde la cuenta Gmail de L&E. Ambos mensajes incluyen consecutivo, cliente, datos del producto, cantidades y valores; el PDF adjunto incluye además la descripción y ficha técnica disponible en el catálogo.
8. La base de datos conserva el estado de generación y entrega de correo.

### Archivos principales del backend

```text
supabase/
├── config.toml
├── migrations/
│   └── 20261104182721_create_quotes_system.sql
├── functions/
│   ├── create-quote/
│   │   └── index.ts
│   └── .env.example
└── tests/
    └── quote_security.test.sql
```

### Tablas creadas por la migración

| Tabla | Propósito |
|---|---|
| `catalog_brands` | Marcas disponibles |
| `catalog_products` | Catálogo maestro, referencias, fotos, videos y precios |
| `customers` | Datos de contacto de los clientes |
| `quote_sequences` | Consecutivos anuales sin colisiones |
| `quotes` | Encabezado de la cotización, fechas y estado |
| `quote_items` | Productos, cantidades y valores históricos |
| `privacy_consents` | Evidencia de autorizaciones por finalidad |

Las tablas operativas tienen Row Level Security habilitado y los permisos de lectura/escritura se revocan a `anon` y `authenticated`. La Edge Function utiliza la clave secreta del servidor; nunca se incluye en el frontend. Las operaciones administrativas del catálogo deberán realizarse posteriormente desde un panel seguro o procesos internos autorizados.

### Preparación de Supabase

1. El proyecto principal ya está creado en Supabase: `cyjrgeljtbbrlpgzzfso` (`sa-east-1`, São Paulo).
2. Instala Node.js y ejecuta la CLI de Supabase mediante `npx`.
3. Copia el archivo de entorno de ejemplo para desarrollo local:

```bash
copy supabase\functions\.env.example supabase\functions\.env
```

En Linux o macOS:

```bash
cp supabase/functions/.env.example supabase/functions/.env
```

4. Completa los valores locales de Supabase y Resend en `supabase/functions/.env`. Este archivo está excluido de Git y no debe compartirse.
5. Inicia Supabase local y aplica la migración:

```bash
npx supabase start
npx supabase db reset
```

6. Sirve la Edge Function local:

```bash
npx supabase functions serve create-quote --env-file supabase/functions/.env
npx supabase test db
```

### Despliegue en Supabase

El repositorio ya contiene `supabase/config.toml` apuntando al proyecto principal de São Paulo. La integración GitHub–Supabase puede aplicar automáticamente las migraciones y desplegar la Edge Function cuando esté habilitada la opción **Deploy to production** en la configuración de GitHub Integration. Antes de activarla, verifica que la migración local tenga la misma versión que la ya registrada en la base de datos.

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
npx supabase functions deploy create-quote
```

Configura las variables de producción desde **Supabase Dashboard → Edge Functions → Secrets**. El destinatario comercial predeterminado ya está definido como `lyemaquinasyrepuestos@gmail.com`; solo se necesita `QUOTE_NOTIFICATION_EMAIL` si se desea reemplazarlo. Los secretos de Google OAuth son:

- `ALLOWED_ORIGINS`: `https://jader0418.github.io` (el código ya incluye este origen como valor predeterminado, salvo que se establezca otro en Secrets).
- `PRIVACY_POLICY_APPROVED`: debe permanecer `false` hasta que la empresa apruebe y publique la política definitiva.
- `PRIVACY_POLICY_VERSION`: versión real de la política publicada.
- `GMAIL_CLIENT_ID`: ID del cliente OAuth de Google Cloud.
- `GMAIL_CLIENT_SECRET`: secreto del cliente OAuth de Google Cloud.
- `GMAIL_REFRESH_TOKEN`: token de actualización autorizado por la cuenta Gmail de L&E.
- `GMAIL_SENDER_EMAIL`: `lyemaquinasyrepuestos@gmail.com`.
- `QUOTE_NOTIFICATION_EMAIL`: opcional; por defecto `lyemaquinasyrepuestos@gmail.com`.
- `QUOTE_REPLY_TO`: `lyemaquinasyrepuestos@gmail.com`, para que las respuestas del cliente lleguen a L&E.

Supabase proporciona las variables y claves propias del proyecto en el entorno de las Edge Functions. No intentes guardar claves reservadas `SUPABASE_*` como secretos personalizados si la plataforma ya las inyecta.

### Configurar el frontend

En `config.js` completa solamente los dos valores públicos:

```javascript
window.LE_CONFIG = {
  supabaseUrl: "https://TU_PROJECT_REF.supabase.co",
  publishableKey: "sb_publishable_TU_CLAVE_PUBLICA"
};
```

La clave publicable puede estar en el navegador con RLS y la función correctamente configurados. **Nunca** coloques `service_role`, `secret key` o `RESEND_API_KEY` en `config.js`.

### Preparación de Gmail API (una sola vez)

1. Entra a [Google Cloud Console](https://console.cloud.google.com/) con la cuenta `lyemaquinasyrepuestos@gmail.com`, crea un proyecto y habilita **Gmail API**.
2. Configura la pantalla de consentimiento OAuth. Para una cuenta Gmail personal el tipo de usuario suele ser **External**. Añade `lyemaquinasyrepuestos@gmail.com` como usuario de prueba mientras haces la configuración inicial.
3. Crea un OAuth Client ID. Para generar el token con OAuth 2.0 Playground, utiliza un cliente de tipo **Web application** y registra como URI de redirección autorizada exactamente `https://developers.google.com/oauthplayground`.
4. Abre [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/), entra en la configuración (icono de engranaje), activa **Use your own OAuth credentials** y pega el Client ID y Client Secret.
5. En el paso 1 introduce únicamente el alcance `https://www.googleapis.com/auth/gmail.send`, autoriza la cuenta de L&E y concede el permiso.
6. En el paso 2 intercambia el código por tokens y copia el **Refresh token**. No compartas ese valor por chat ni lo guardes en GitHub.
7. En **Supabase Dashboard → Edge Functions → Secrets** registra `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` y `GMAIL_SENDER_EMAIL=lyemaquinasyrepuestos@gmail.com`. No es necesario desplegar de nuevo la función después de guardar Secrets.

**Importante sobre el modo de publicación OAuth:** mientras el consentimiento OAuth externo esté en estado **Testing**, Google limita la duración del refresh token a 7 días para este tipo de alcance. Para un uso estable se debe revisar la publicación en **Production** y los requisitos de verificación que Google aplique al alcance sensible `gmail.send`. Google puede mostrar una advertencia de aplicación no verificada o exigir verificación antes de habilitar el uso general. No se debe ignorar ese requisito ni asumir que un token de prueba es permanente.

El servidor solo solicita el alcance `gmail.send`; no necesita leer la bandeja de entrada.

### Controles y límites actuales

- El formulario público no permite leer ni consultar cotizaciones.
- La Edge Function comprueba la clave publicable, el origen, los datos y el consentimiento.
- La base de datos aplica un límite inicial de 8 cotizaciones por IP por hora.
- El consecutivo y la fecha/hora se generan en el servidor; el navegador no puede decidir esos valores.
- Cada envío lleva una clave idempotente: reintentar una solicitud no crea otro consecutivo ni vuelve a enviar correos ya confirmados.
- Los precios, marcas y referencias se toman del catálogo maestro del servidor, no de los valores manipulables enviados por el navegador.
- Los PDF se almacenan en bucket privado y el enlace firmado expira.
- El correo se considera enviado solo cuando Resend devuelve confirmación. El estado se registra en la cotización.
- La autorización de mercadeo es independiente y opcional.
- La dirección IP se registra para seguridad y trazabilidad cuando está disponible en los encabezados de red confiables; su uso, conservación y comunicación deberán quedar descritos en la política definitiva.

### Pendiente antes de activar solicitudes reales

- Confirmar que la integración GitHub–Supabase tiene habilitado **Deploy to production** y que `create-quote` aparece en Edge Functions.
- Crear el cliente OAuth de Google, autorizar la cuenta de L&E y guardar los tres secretos OAuth en Supabase.
- Verificar un dominio de envío en Resend.
- Completar `config.js` con la URL y clave publicable cuando la Edge Function esté desplegada y probada.
- Aprobar y publicar la Política de Tratamiento de Datos, completar los datos legales de la empresa y fijar la versión definitiva. La Edge Function rechaza solicitudes mientras `PRIVACY_POLICY_APPROVED` no esté en `true`.
- Cargar referencias, marcas, fotografías y precios reales en `catalog_products`. La migración incluye productos de demostración sin precio ni marca asignada.
- Ejecutar las pruebas de permisos y una prueba completa de cotización, PDF y correo en un entorno controlado.
- GitHub Pages ya está habilitado y la publicación está confirmada: [abrir la página de L&E](https://jader0418.github.io/PAGINA-WEB-L-E-MAQUINAS-Y-REPUESTOS/).

## Información legal

`legal.html` contiene una estructura inicial para la Política de Tratamiento de Datos Personales, términos y condiciones, y garantías. Está identificada como borrador porque faltan datos legales y canales oficiales de la empresa. Debe revisarse y aprobarse antes de utilizarse como documento jurídico definitivo.

Referencias normativas para la revisión: Ley 1581 de 2012 y Ley 1480 de 2011, junto con su reglamentación vigente.

## Contacto

**L&E MÁQUINAS Y REPUESTOS**

- Bogotá, Colombia.
- Dirección comercial: Cra. 13 # 3-47 Sur, barrio Policarpa.
- Teléfono / WhatsApp: [+57 350 521 8141](https://wa.me/573505218141).
- TikTok: [@lye.maquinas.repuestos](https://www.tiktok.com/@lye.maquinas.repuestos).
- Entregas en Bogotá y envíos a nivel nacional, según condiciones del producto.

## Desarrollo

**Responsable:** Jader Santiago Nieves Tami.

---

<p align="center">
  <strong>L&E MÁQUINAS Y REPUESTOS</strong><br />
  Unidos por la costura, contigo en cada puntada.
</p>
