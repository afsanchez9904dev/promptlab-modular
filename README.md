# PromptLab Intergeneracional

Sitio educativo estático, adaptable y sin backend, preparado para GitHub Pages.

## Estructura

```text
promptlab-intergeneracional/
├── index.html              # Estructura semántica y contenido de las secciones
├── css/
│   └── styles.css          # Diseño, accesibilidad y adaptación móvil
├── js/
│   ├── app.js              # Estado, navegación, eventos, progreso y biblioteca
│   └── challenges.js       # Banco editable de 12 preguntas
├── assets/
│   ├── profe-ia.svg        # Mascota original
│   └── logo-ucaldas.svg    # Referencia temporal; reemplazar por logo autorizado
└── README.md
```

## Publicación en GitHub Pages

1. Sube **todos los archivos y carpetas** a la raíz de un repositorio de GitHub.
2. Abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**, `main` y `/(root)`.
4. Guarda y abre la dirección que GitHub indique.

> Los módulos JavaScript requieren un servidor HTTP(S). Para pruebas locales usa `python -m http.server 8000` desde la carpeta del proyecto y abre `http://localhost:8000`. No abras `index.html` directamente con `file://`.

## Identidad institucional

`assets/logo-ucaldas.svg` es una referencia temporal, **no un logotipo oficial verificado**. Antes de distribuir la plataforma, reemplázalo por el recurso autorizado de la Universidad de Caldas. Verifica las pautas en https://www.ucaldas.edu.co/portal/identidad-institucional/.

## Cómo modificar

- **Diseño y tamaño:** `css/styles.css`.
- **Preguntas y respuestas:** `js/challenges.js` (mantener propiedades `level`, `q`, `options`, `correct`, `hint`, `explain`).
- **Navegación, progreso, biblioteca:** `js/app.js`.
- **Textos de lecciones y secciones:** `index.html`.

## Privacidad y limitaciones

No hay servidor, registro de usuarios ni conexión a un modelo de IA. Profe IA ofrece pistas programadas. Los avances y prompts se almacenan únicamente en `localStorage` del navegador; no se sincronizan entre dispositivos. Se pueden descargar copias en texto plano.

## Identidad visual

El encabezado utiliza `assets/universidad-de-caldas.png` y `assets/universidad-intergeneracional.png`, suministrados para este proyecto. Mantén ambos archivos en la carpeta `assets` al publicar en GitHub Pages.

## Identidad visual

Los dos logos institucionales suministrados están en `assets/`. El favicon usa un recorte del símbolo central del logo de la Universidad de Caldas. Para actualizar la identidad visual, reemplaza los archivos manteniendo sus nombres.
