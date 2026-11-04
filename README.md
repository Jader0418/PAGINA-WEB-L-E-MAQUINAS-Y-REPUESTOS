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
- [x] Generación local de PDF preliminar en el navegador cuando la librería está disponible.
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


## Configuración e integraciones pendientes

El archivo `config.js` permite configurar la URL pública del backend:

```javascript
window.LE_CONFIG = {
  apiBaseUrl: ""
};
```

Cuando exista un backend, `app.js` podrá enviar la solicitud como JSON al endpoint `POST /quotes`. La respuesta esperada debe incluir, como mínimo, un consecutivo y los datos del PDF y del estado de envío del correo.

**Importante:** en la configuración actual el formulario trabaja en modo de demostración. El PDF generado en el navegador es una vista previa; los datos personales no se almacenan en una base de datos ni se envían automáticamente por correo. Para producción es necesario desarrollar y conectar:

- API segura para crear cotizaciones.
- Base de datos para clientes, productos, detalle de cotización, fechas y evidencia de consentimiento.
- Generación de PDF oficial desde el servidor.
- Servicio de correo transaccional.
- Consecutivo único generado en el backend.
- Controles de acceso, protección de datos, retención y registro de eventos.

No se deben guardar contraseñas, claves privadas ni secretos en `config.js` o en el código público del frontend.

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
