# PromptLab Intergeneracional · v3 «Modo desafío»

Sitio educativo estático, sin backend, listo para GitHub Pages. Pensado para una clase virtual: el facilitador muestra la plataforma y los participantes practican por su cuenta, con ChatGPT en otra pestaña.

## Qué incluye

| Sección | Qué hace |
|---|---|
| Inicio | «Tu ruta de hoy»: 10 pasos que se marcan solos y resaltan el siguiente. |
| 1. Aprender | Seguridad, cinco ingredientes, siete trucos, voz y fotos, cómo entrar a ChatGPT. |
| 2. Antes y después | 3 comparaciones de prompt vago vs. mejorado. |
| 3. Retos | **24 retos en 3 niveles** (Descubro 6, Construyo 8, Experimento 10) de 5 tipos: opción única, marcar varias, clasificar, completar y redactar. |
| 4. Misiones | 5 misiones con cuaderno de experimentos y comparador de versiones. |
| Constructor | Herramienta de apoyo para ordenar un prompt (rol, tarea, contexto, formato, límites). |
| Mi cuaderno | Resumen y descarga de todo el trabajo (.txt). |
| Certificados | 4 certificados (PNG descargable / imprimir o PDF). |
| Tarea | «Mi laboratorio personal de prompts». |

## Misiones

| | Misión | Tipo |
|---|---|---|
| 1 | Rescata el prompt (5 casos: reescribir + explicar qué agregó y por qué) | Obligatoria |
| 2 | La IA necesita instrucciones (prompt → prueba → mejora ×2) | Obligatoria |
| 3 | Detective de respuestas (qué inventa la IA ante datos incompletos) | Obligatoria |
| 4 | Mi asistente personal (prompt reutilizable con [CORCHETES]) | Opcional |
| 5 | El desafío del profesor (caso con información contradictoria) | Opcional |

La plataforma **no califica el contenido** de lo que se escribe: una misión se termina cuando cada campo llega a su mínimo de palabras. La persona prueba en ChatGPT y escribe lo que observó. El botón «Comparar mis versiones» marca palabra por palabra qué se agregó y qué se quitó entre versiones.

## Certificados

- **Descubro:** los 6 retos del nivel.
- **Construyo:** los 8 retos + Misión 1 (3 de 5 casos).
- **Experimento:** los 10 retos + misiones 2 y 3.
- **Maestro de prompts:** misiones 4 y 5.

Son reconocimientos de participación y llevan escrito que **no son un título ni un documento oficial**; no quites esa frase sin autorización de la Universidad. Verifica el uso de los logos según https://www.ucaldas.edu.co/portal/identidad-institucional/.

## Los retos de redacción y las «palabras clave»

Los retos de tipo *redactar* y los casos de la Misión 1 incluyen una «Revisión del asistente» que busca palabras clave. **Es solo orientación y nunca aprueba ni reprueba.** Se completan con autoevaluación (casillas) y mínimo de palabras, porque hay muchas formas válidas de escribir un buen prompt.

## Estructura

```text
index.html            Estructura y textos de las secciones
css/styles.css        Diseño, accesibilidad, móvil, impresión
js/app.js             Motor: retos por tipo, misiones, cuaderno, comparador, certificados
js/challenges.js      Retos, casos de la Misión 1 y comparaciones (editable)
js/missions.js        Las 5 misiones y sus campos (editable)
assets/               Logos, mascota y favicon (mantener los nombres de archivo)
GUIA-FACILITADOR.md   Guion de la sesión de 90 min
```

## Publicar en GitHub Pages

1. Sube todos los archivos a la raíz de un repositorio.
2. Settings → Pages → Deploy from a branch → `main` / `(root)`.
3. Comparte el enlace (o un código QR).

Los módulos JavaScript requieren HTTP(S). Para probar en local: `python -m http.server 8000` y abre `http://localhost:8000` (no `file://`).

## Cómo editar contenido

- **Retos:** `js/challenges.js`. Cada reto lleva un `id` único y estable (el progreso se guarda por id). Los campos de cada tipo están descritos al inicio del archivo. Las opciones se barajan solas.
- **Misiones:** `js/missions.js`. Cada campo tiene `key`, `label`, `min` (palabras) y `required`. `compare` indica qué campos se comparan.
- **Requisitos de certificado:** constante `CERTS` en `js/app.js`.

## Privacidad

No hay servidor, registro ni conexión a un modelo de IA. Todo (avance, nombre, escritos) se guarda en `localStorage` del navegador de cada persona. El facilitador no puede ver el progreso: la evidencia es el cuaderno descargado (.txt) o el certificado. La sección «Tarea» tiene un botón para borrar todo en equipos compartidos. Si actualizas desde la v2, el avance anterior no se conserva (cambian las claves de almacenamiento).
