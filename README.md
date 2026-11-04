# L&E MÁQUINAS Y REPUESTOS

<p align="center">
  <img src="https://img.shields.io/badge/L%26E-M%C3%A1quinas%20y%20Repuestos-0066CC?style=for-the-badge" alt="L&E Máquinas y Repuestos" />
  <img src="https://img.shields.io/badge/Distribuidor%20autorizado-JACK-0066CC?style=for-the-badge" alt="Distribuidor autorizado JACK" />
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-F59E0B?style=for-the-badge" alt="Proyecto en desarrollo" />
</p>

<h3 align="center">Unidos por la costura, contigo en cada puntada.</h3>

<p align="center">
  Plataforma web oficial para descubrir maquinaria de confección, consultar especificaciones y solicitar cotizaciones personalizadas.
</p>

---

## Tabla de contenido

- [Acerca de L&E](#-acerca-de-le)
- [Objetivo de la plataforma](#-objetivo-de-la-plataforma)
- [Dirección de diseño](#-dirección-de-diseño)
- [Catálogo y navegación](#-catálogo-y-navegación)
- [Experiencia de cotización](#-experiencia-de-cotización)
- [Protección de datos y aspectos legales](#-protección-de-datos-y-aspectos-legales)
- [Promociones y canales de atención](#-promociones-y-canales-de-atención)
- [Arquitectura y tecnologías](#-arquitectura-y-tecnologías)
- [Estado y hoja de ruta](#-estado-y-hoja-de-ruta)
- [Configuración local](#-configuración-local)
- [Información de contacto](#-información-de-contacto)
- [Desarrollo](#-desarrollo)

## 🏢 Acerca de L&E

**L&E MÁQUINAS Y REPUESTOS** es una empresa colombiana dedicada a la comercialización de máquinas de coser industriales, repuestos y accesorios para el sector de la confección.

Somos **distribuidores autorizados de JACK** y trabajamos con marcas reconocidas para ofrecer alternativas a propietarios de talleres, empresas de confección, emprendedores, modistas y personas que cosen desde casa.

Nuestro propósito es acompañar a cada cliente en la elección de maquinaria y soluciones adecuadas para su trabajo, con asesoría comercial y atención cercana.

## 🎯 Objetivo de la plataforma

Construir el sitio web oficial de L&E como un catálogo digital especializado y un canal de generación de cotizaciones. La experiencia debe permitir que los visitantes encuentren equipos por tipo, subtipo o marca, conozcan sus características y envíen una solicitud de cotización sin fricciones.

La web estará diseñada para dos públicos principales:

- **Talleres y producción:** personas que necesitan comparar datos técnicos como tipo de motor, velocidad en puntadas por minuto, lubricación, voltaje, garantía y disponibilidad de repuestos.
- **Hogar y emprendimiento:** personas que buscan información clara, precios transparentes, orientación y una forma sencilla de hablar con un asesor.

## 🎨 Dirección de diseño

La interfaz seguirá el concepto **`specimen-catalogue`**, apoyado en la skill **`design-taste-frontend`**: un catálogo editorial de especímenes mecánicos donde cada máquina es protagonista y sus prestaciones se presentan con precisión.

> La ingeniería de precisión de las máquinas de coser se presenta como un catálogo de especímenes de alto rendimiento: cada equipo expone su silueta, potencia y ficha técnica sin adornos superfluos.

### Principios visuales

- Diseño **mobile-first**, responsive y cómodo de utilizar desde el celular.
- Composición editorial, ordenada y con jerarquía visual clara.
- Fotografías de producto nítidas, sobre fondos neutros y superficies sólidas.
- Sin apariencia de plantilla genérica de comercio electrónico.
- Sin gradientes decorativos, brillos artificiales ni sombras innecesarias.
- Titulares directos y breves, con máximo dos líneas siempre que sea posible.
- Controles táctiles amplios y navegación accesible con el pulgar.
- Precios, modelos y velocidades con cifras tabulares para facilitar su lectura.

### Paleta visual

| Función | Color | Uso |
|---|---|---|
| Identidad de marca | `#0066CC` | Azul corporativo de L&E, inspirado en JACK |
| Fondo | `#F8F9FA` | Fondo general claro |
| Superficie | `#FFFFFF` | Fichas, paneles y contenido |
| Superficie técnica | `#EDF0F3` | Áreas de producto y datos |
| Texto principal | `#0F172A` | Títulos y lectura principal |
| Texto secundario | `#475569` | Descripciones y especificaciones |
| Acción comercial | `#D9381E` / `#E11D48` | Cotizar, promociones y descuentos |
| WhatsApp | `#25D366` | Canal de atención directa |

El azul `#0066CC` mantiene el vínculo visual con la identidad de L&E y JACK. El rojo industrial se reserva para acciones comerciales importantes; el verde se utiliza únicamente para identificar WhatsApp.

### Tipografía

Familia recomendada: **Plus Jakarta Sans** o **Inter Tight**. Se priorizará una lectura cómoda, escalas tipográficas fluidas con `clamp()` y cifras tabulares para precios, referencias y especificaciones.

### Interacción principal: selector de uso

En la cabecera del catálogo se contempla un selector rápido:

- **Para mi taller / producción**
- **Para mi hogar / emprendimiento**

Al cambiar la opción, la plataforma podrá priorizar categorías, equipos y recomendaciones relevantes para cada necesidad.

## 🧵 Catálogo y navegación

El catálogo se organizará de dos formas complementarias: por **tipo y subtipo de máquina**, y por **marca**.

### Categorías previstas

| Categoría | Ejemplos de subcategorías o productos |
|---|---|
| Máquinas planas | Mecánicas, electrónicas y Direct Drive |
| Fileteadoras | Mecánicas, mecatrónicas y electrónicas |
| Collarines | Equipos para recubrimiento y acabados |
| Presilladoras | Equipos para refuerzos y presillas |
| Bordadoras | Equipos de bordado |
| Repuestos | Piezas y componentes para maquinaria |
| Accesorios | Complementos y herramientas de confección |

Las categorías y subcategorías definitivas se podrán ajustar según el inventario y la organización comercial de L&E.

### Marcas

La navegación también permitirá explorar productos por marca:

**JACK · KANSEW SPECIAL · SIRUBA · JUKI · BROTHER · SINGER · SERVEX · KANSAI SPECIAL**

### Ficha individual de cada máquina

Cada producto tendrá una ficha que podrá incluir:

- Nombre comercial, marca y referencia.
- Galería de fotografías y, cuando esté disponible, video demostrativo.
- Descripción del equipo y aplicaciones recomendadas.
- Ficha técnica con especificaciones verificadas.
- Precio y descuento, cuando aplique.
- Disponibilidad, cuando esta información esté confirmada.
- Condiciones de garantía correspondientes al producto.
- Botón **Agregar a cotización**.
- Acceso a asesoría por WhatsApp.

Los datos técnicos y comerciales deberán corresponder al producto real y mantenerse actualizados. No se mostrarán especificaciones, existencias o descuentos inventados.

## 🧾 Experiencia de cotización

El cotizador será una funcionalidad central de la plataforma y estará diseñado para que el cliente pueda reunir varios equipos en una única solicitud.

### 1. Selección de productos

El visitante podrá agregar máquinas o repuestos desde el catálogo mediante el botón **Agregar a cotización**.

La interfaz mantendrá visible un contador, por ejemplo: **Mi cotización (3 equipos)**, y permitirá revisar o modificar los productos seleccionados.

### 2. Formulario de datos

Para solicitar la cotización se solicitarán los datos necesarios:

- Nombres.
- Apellidos.
- Número de celular, con indicativo de Colombia (+57).
- Correo electrónico.
- Dirección.
- Ciudad o municipio.
- Casilla obligatoria y desmarcada por defecto para autorizar el tratamiento de datos personales.

Se validarán los campos y el formato de correo y teléfono antes de enviar la solicitud.

### 3. Generación y entrega del documento

El flujo esperado al confirmar la solicitud es:

1. Registrar la solicitud y los productos seleccionados en la base de datos.
2. Generar un número consecutivo único, por ejemplo `COT-2026-0042`.
3. Generar el PDF de la cotización con los datos del cliente, productos, cantidades, precios y condiciones aplicables.
4. Enviar el documento al correo electrónico suministrado.
5. Mostrar una confirmación con el número de cotización.
6. Ofrecer la descarga inmediata del PDF.
7. Ofrecer un acceso a WhatsApp para conversar con un asesor sobre esa solicitud.

El consecutivo es un ejemplo de formato; deberá generarse de forma única desde el backend. El sistema deberá informar claramente si el registro, la generación del PDF o el envío del correo no se completan.

### 4. Registro y trazabilidad

La base de datos conservará, como mínimo:

- Identificador y consecutivo de la cotización.
- Datos de contacto del cliente.
- Productos, referencias, cantidades y precios cotizados.
- Fecha y hora de creación.
- Estado de la solicitud.
- Evidencia y versión de la autorización de tratamiento de datos.
- Fecha y hora de aceptación de la autorización.

El registro de dirección IP solo se incorporará si existe una finalidad legítima, se informa al titular y se implementan medidas apropiadas de seguridad y retención. No se almacenarán datos personales innecesarios.

## 🔐 Protección de datos y aspectos legales

La plataforma deberá implementar el tratamiento de datos personales de acuerdo con la normativa colombiana aplicable, incluida la **Ley 1581 de 2012** y su reglamentación vigente. La redacción definitiva de los documentos y los mecanismos de autorización deberá ser revisada para el funcionamiento real de la empresa.

### Autorización expresa

La casilla de autorización:

- Estará desmarcada por defecto.
- Será obligatoria para enviar la solicitud de cotización.
- Presentará el texto de autorización de forma visible y comprensible.
- Enlazará a la Política de Tratamiento de Datos Personales.
- Guardará evidencia de la versión aceptada y la fecha y hora del consentimiento.

**Texto de autorización propuesto para revisión jurídica:**

> Autorizo de manera libre, previa, expresa e informada a L&E MÁQUINAS Y REPUESTOS para recolectar, almacenar y tratar mis datos personales con la finalidad de elaborar mi cotización, prestarme asesoría comercial por correo o WhatsApp, gestionar garantías y enviarme información sobre productos y repuestos, conforme a la Ley 1581 de 2012 y su Política de Tratamiento de Datos. Manifiesto que conozco mis derechos de conocer, actualizar y solicitar la supresión de mis datos.

La autorización para finalidades adicionales, como recibir publicidad o comunicaciones comerciales no relacionadas con la cotización, deberá evaluarse y, cuando corresponda, solicitarse de forma separada y opcional. La aceptación de la cotización no debe confundirse con una autorización general e ilimitada de mercadeo.

### Evidencia de autorización

Se contempla conservar un registro estructurado similar al siguiente:

```json
{
  "autorizacion_datos": true,
  "fecha_hora_autorizacion": "2026-11-04T10:15:22-05:00",
  "version_politica": "v1.0"
}
```

La fecha y hora deberán generarse en el servidor. Cualquier dato técnico adicional, como la IP, deberá tratarse de manera proporcional, segura y transparente.

### Documentos del sitio

El pie de página deberá ofrecer acceso público a:

- **Política de Tratamiento de Datos Personales:** finalidades, derechos de los titulares, canales de atención y procedimientos para consultas y reclamos.
- **Términos y condiciones:** reglas de uso del sitio y condiciones aplicables a las solicitudes y cotizaciones.
- **Políticas de garantía, devoluciones y soporte técnico:** cobertura, exclusiones válidas, procedimientos y canales de atención.

## ⚖️ Información comercial y condiciones de cotización

La información comercial deberá ser clara, verificable y coherente en el catálogo y en el PDF. Se tendrán en cuenta las obligaciones aplicables del Estatuto del Consumidor colombiano (Ley 1480 de 2011).

### Vigencia y disponibilidad

Texto comercial propuesto, sujeto a revisión:

> Esta cotización tiene una vigencia de 15 días calendario a partir de su emisión o hasta agotar existencias. La disponibilidad física del producto se confirmará al momento de formalizar el pedido.

La vigencia y cualquier condición de disponibilidad deben ser visibles antes de que el cliente tome una decisión. Esta cláusula no sustituye las obligaciones legales de información y protección al consumidor.

### Precios e impuestos

- Mostrar el precio de forma clara.
- Informar si los valores incluyen IVA o si este se discrimina por separado, según corresponda.
- Identificar descuentos y condiciones de aplicación.
- Evitar precios o promociones que no puedan respaldarse.

### Garantía y recomendaciones técnicas

Cada ficha y cotización deberá reflejar las condiciones de garantía que correspondan al producto y las obligaciones legales aplicables. Las exclusiones no podrán eliminar derechos irrenunciables del consumidor ni cubrir defectos de fabricación que deban estar amparados.

Cuando corresponda, se podrá incluir una recomendación de instalación o puesta en marcha por personal técnico calificado, explicando su alcance sin presentar recomendaciones como renuncias automáticas a la garantía.

## 📣 Promociones y canales de atención

La página tendrá un espacio para **promociones destacadas**, con vigencia, condiciones, precio anterior y precio promocional cuando aplique. Las promociones vencidas deberán retirarse o identificarse claramente.

También incluirá un botón de contacto directo por **WhatsApp**, especialmente accesible desde dispositivos móviles. El canal permitirá iniciar una conversación con información contextual del producto o de la cotización, sin exponer datos personales innecesarios en enlaces públicos.

## 🛠️ Arquitectura y tecnologías

La arquitectura técnica definitiva se documentará cuando se confirme el stack del proyecto. La implementación deberá separar responsabilidades para facilitar mantenimiento, seguridad y crecimiento.

Componentes funcionales previstos:

- **Frontend:** interfaz responsive, catálogo, navegación por categorías y marcas, fichas de producto y cotizador.
- **Backend:** validación de solicitudes, reglas de cotización, generación de consecutivos y coordinación de servicios.
- **Base de datos:** clientes, productos, categorías, marcas, cotizaciones, detalle de cotizaciones y consentimientos.
- **Documentos:** generación y almacenamiento controlado de PDFs.
- **Correo electrónico:** entrega de cotizaciones y notificaciones.
- **Integraciones:** enlace contextual a WhatsApp.
- **Seguridad:** validación de entradas, control de acceso, protección de secretos y políticas de retención de datos.

> Las tecnologías, versiones, comandos y variables de entorno se agregarán aquí cuando estén definidas y comprobadas en el repositorio. No se asume un framework o proveedor que todavía no haya sido confirmado.

## ✅ Estado y hoja de ruta

El proyecto se encuentra en desarrollo. La siguiente lista representa el alcance planeado y deberá actualizarse conforme cada funcionalidad esté implementada y probada.

- [ ] Definir arquitectura y stack tecnológico.
- [ ] Construir identidad visual y sistema de componentes con `design-taste-frontend`.
- [ ] Diseñar navegación mobile-first.
- [ ] Crear inicio y presentación de la empresa.
- [ ] Construir catálogo por categorías y subcategorías.
- [ ] Implementar navegación por marcas.
- [ ] Crear fichas de producto con galería, video y ficha técnica.
- [ ] Incorporar precios, descuentos y disponibilidad verificada.
- [ ] Crear selector de uso: taller / hogar.
- [ ] Implementar promociones destacadas.
- [ ] Implementar carrito o lista de cotización.
- [ ] Construir formulario y validaciones.
- [ ] Implementar autorización de tratamiento de datos y trazabilidad.
- [ ] Diseñar modelo de datos para clientes y cotizaciones.
- [ ] Generar consecutivo único de cotización.
- [ ] Generar PDF descargable.
- [ ] Integrar envío de cotizaciones por correo.
- [ ] Integrar WhatsApp contextual.
- [ ] Publicar políticas y documentos legales revisados.
- [ ] Realizar pruebas funcionales, responsive, accesibilidad y seguridad.
- [ ] Preparar despliegue y monitoreo.

## 🚀 Configuración local

Clona el repositorio:

```bash
git clone https://github.com/Jader0418/PAGINA-WEB-L-E-MAQUINAS-Y-REPUESTOS.git
cd PAGINA-WEB-L-E-MAQUINAS-Y-REPUESTOS
```

Los pasos para instalar dependencias y ejecutar el entorno se documentarán cuando el stack tecnológico esté definido. No se incluyen comandos de instalación ficticios.

## 📍 Información de contacto

**L&E MÁQUINAS Y REPUESTOS**

- **Ubicación:** Bogotá, Colombia.
- **Dirección comercial:** Cra. 13 # 3-47 Sur, barrio Policarpa.
- **Teléfono / WhatsApp:** [+57 350 521 8141](https://wa.me/573505218141).
- **TikTok:** [@lye.maquinas.repuestos](https://www.tiktok.com/@lye.maquinas.repuestos).
- **Atención comercial:** asesoría sobre maquinaria, repuestos y accesorios.
- **Cobertura:** entregas en Bogotá y envíos a nivel nacional, según condiciones del producto.

## 👨‍💻 Desarrollo

**Responsable del desarrollo:** Jader Santiago Nieves Tami.

Este repositorio contiene el desarrollo de la plataforma web oficial de L&E MÁQUINAS Y REPUESTOS.

---

<p align="center">
  <strong>L&E MÁQUINAS Y REPUESTOS</strong><br />
  Unidos por la costura, contigo en cada puntada.<br />
  <sub>Ingeniería, precisión y soluciones para cada puntada.</sub>
</p>
