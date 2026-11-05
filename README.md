# PromptLab Intergeneracional

Sitio educativo estático, sin backend, listo para GitHub Pages. Pensado para una clase virtual en la que el facilitador muestra la plataforma y los participantes practican por su cuenta.

## Qué incluye

| Sección | Qué hace |
|---|---|
| Inicio | «Tu ruta de hoy»: 8 pasos que se marcan solos y dicen qué sigue. |
| 1. Aprender | Seguridad, cinco ingredientes, cinco trucos, voz y fotos, cómo entrar a ChatGPT. |
| 2. Antes y después | 3 comparaciones de prompt vago vs. mejorado, con respuestas de ejemplo. |
| 3. Retos | 14 retos en 3 niveles (Descubro 5, Construyo 4, Experimento 5), con opciones barajadas y 2 pistas. |
| 4. Doctor de prompts | 5 casos: la persona reescribe un prompt y recibe una revisión de 4 puntos. |
| 5. Crear mi prompt | Constructor (rol, tarea, contexto, formato, límites) + pegar la respuesta de ChatGPT y contar la mejora. |
| Mis prompts | Biblioteca local descargable. |
| Certificados | Un certificado por nivel (imagen PNG descargable / imprimir o PDF). |

## Certificados

- **Descubro:** los 5 retos del nivel.
- **Construyo:** los 4 retos + 3 casos del Doctor de prompts.
- **Experimento:** los 5 retos + un prompt guardado con la respuesta pegada y la mejora contada.

Son reconocimientos de participación. Llevan escrito que **no son un título ni un documento oficial**; no quites esa frase sin autorización de la Universidad. Verifica el uso de los logos según https://www.ucaldas.edu.co/portal/identidad-institucional/.

## Estructura

```text
index.html            Estructura y textos de las secciones
css/styles.css        Diseño, accesibilidad, móvil, impresión
js/app.js             Navegación, progreso, doctor, constructor, certificados
js/challenges.js      Retos, casos del Doctor y comparaciones (editable)
assets/               Logos, mascota y favicon (mantener los nombres de archivo)
GUIA-FACILITADOR.md   Guion de la sesión de 1 h 15 min
```

## Publicar en GitHub Pages

1. Sube todos los archivos a la raíz de un repositorio.
2. Settings → Pages → Deploy from a branch → `main` / `(root)`.
3. Comparte el enlace (o un código QR) con los participantes.

Los módulos JavaScript requieren HTTP(S). Para probar en local: `python -m http.server 8000` y abre `http://localhost:8000` (no `file://`).

## Cómo editar contenido

- **Retos:** `js/challenges.js` → `challenges`. Cada reto lleva un `id` único y estable (el progreso se guarda por id). Propiedades: `level`, `q`, `ctx` (opcional), `options`, `correct`, `hint`, `explain`, `wrong`. El orden de las opciones se baraja solo.
- **Doctor de prompts:** `doctorCases`. Cada revisión tiene `label`, `tip` y `test` (expresión regular sobre el texto en minúsculas). Es una revisión por palabras clave: ajústala si ves que rechaza prompts buenos.
- **Antes y después:** `comparisons`. Las respuestas son de ejemplo, escritas a mano.
- **Requisitos de certificado:** `certStatus` en `js/app.js`.

## Privacidad

No hay servidor, registro ni conexión a un modelo de IA. El avance, el nombre y los prompts se guardan solo en `localStorage` del navegador de cada persona. El facilitador no puede ver el progreso: si necesitas evidencia, pide que descarguen su biblioteca o su certificado. En «En casa» hay un botón para borrar todo en equipos compartidos.
