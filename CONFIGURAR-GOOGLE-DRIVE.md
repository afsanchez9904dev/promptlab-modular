# Configurar Google Drive en PromptLab v3

1. En https://console.cloud.google.com/ crea o selecciona un proyecto, por ejemplo «PromptLab Intergeneracional».
2. En «APIs y servicios» > «Biblioteca», habilita **Google Drive API**.
3. En «Google Auth Platform» configura la pantalla de consentimiento (Branding): nombre, correo de soporte y correo de contacto. Selecciona audiencia **Externa** si los estudiantes usan cuentas personales de Google.
4. En «Data Access» agrega el permiso **https://www.googleapis.com/auth/drive.appdata**. Permite únicamente crear y consultar los datos privados de la aplicación, no todos los archivos personales del estudiante.
5. En «Clients» crea un cliente OAuth 2.0 de tipo **Aplicación web**. Agrega los **orígenes JavaScript autorizados**:
   - `https://afsanchez9904dev.github.io`
   - `http://localhost:8000` (solo si pruebas localmente con servidor web)
   No incluyas la ruta `/promptlab-modular/` en los orígenes: Google solicita solamente protocolo + dominio + puerto opcional.
6. Copia el **Client ID** (termina en `.apps.googleusercontent.com`) y reemplaza `REEMPLAZAR_CON_CLIENT_ID.apps.googleusercontent.com` en `js/google-config.js`. **Nunca publiques el Client Secret**; esta app no lo necesita.
7. Si la aplicación está en modo **Testing**, agrega cada correo de estudiante en «Audience > Test users»; para un grupo numeroso y abierto, configura el estado de publicación según las instrucciones de Google. Según el alcance de la aplicación, Google podría solicitar verificación.
8. Publica los archivos actualizados en GitHub Pages y comprueba «Guardar en Drive» y «Recuperar de Drive» usando una cuenta de prueba, dos navegadores y datos ficticios.

## Funcionamiento

- Los retos, misiones, cuaderno, nombre y preferencias se guardan **automáticamente en localStorage** como antes.
- «Guardar en Drive» solicita autorización de Google cuando haga falta y crea o actualiza **un archivo JSON en appDataFolder**, carpeta oculta y privada de la aplicación en Google Drive.
- «Recuperar de Drive» pide confirmación antes de **reemplazar** todos los datos locales y recarga la página.
- No existe sincronización automática: cada estudiante debe guardar en Drive al terminar y recuperar en el otro dispositivo antes de trabajar.
- El permiso no permite leer archivos personales normales de Drive. El archivo de respaldo no aparecerá en «Mi unidad».
- El token de Google se mantiene solo en memoria de la pestaña. Si cierran el navegador o vence el token, Google puede volver a solicitar autorización.
- Si una cuenta institucional restringe el acceso a aplicaciones externas, el administrador de Workspace debe autorizarla.
- Si una cuenta de Google se usa en dos equipos y ambos tienen cambios, el último «Guardar en Drive» reemplaza la copia anterior. **No fusiona avances**.

## Pruebas recomendadas

1. Completa un reto y escribe en una misión.
2. Pulsa «Guardar en Drive» y autoriza la cuenta.
3. En otro navegador con el mismo sitio, pulsa «Recuperar de Drive».
4. Confirma que el reto, misión, nombre y cuaderno reaparecen.
5. Comprueba cancelación de autorización, sin conexión, y recuperación sin copia previa.

## Privacidad

Evita escribir información sensible en prompts o cuadernos. Los datos se transfieren directamente desde el navegador a Google Drive bajo la autorización de cada estudiante. PromptLab no dispone de servidor ni almacena contraseñas. Si se usa institucionalmente, prepara una nota de privacidad que explique finalidad, almacenamiento, derechos y contacto responsable.
