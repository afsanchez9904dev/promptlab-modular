// Respaldo voluntario en la carpeta privada de datos de la aplicación en Google Drive.
// Nunca guarda tokens en localStorage. Requiere configurar GOOGLE_CLIENT_ID.
import { GOOGLE_CLIENT_ID } from './google-config.js';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'promptlab-v3-progreso.json';
let client, accessToken = null;
const status = (message) => { const node = document.getElementById('driveStatus'); if (node) node.textContent = message; };
const api = async (url, options = {}) => {
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) } });
  if (!response.ok) {
    if (response.status === 401) accessToken = null;
    throw new Error(`Google Drive respondió ${response.status}. ${response.status === 401 ? 'Vuelve a conectar tu cuenta.' : 'Revisa los permisos y vuelve a intentar.'}`);
  }
  return response;
};
const waitGoogle = async () => {
  for (let i = 0; i < 40 && !window.google?.accounts?.oauth2; i++) await new Promise(r => setTimeout(r, 100));
  if (!window.google?.accounts?.oauth2) throw new Error('No se pudo cargar el acceso a Google. Revisa tu conexión.');
};
async function authorize() {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('REEMPLAZAR')) throw new Error('Falta configurar el ID de cliente de Google en js/google-config.js.');
  if (accessToken) return;
  await waitGoogle();
  if (!client) client = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID, scope: SCOPE,
    callback: () => {}
  });
  await new Promise((resolve, reject) => {
    client.callback = (response) => {
      if (response.error || !response.access_token) reject(new Error(response.error || 'No se autorizó el acceso a Drive.'));
      else { accessToken = response.access_token; resolve(); }
    };
    client.error_callback = () => reject(new Error('Se cerró o bloqueó la ventana de Google.'));
    client.requestAccessToken({ prompt: '' });
  });
}
async function findBackup() {
  const q = new URLSearchParams({ spaces: 'appDataFolder', fields: 'nextPageToken,files(id,name,modifiedTime)', pageSize: '100', q: `name = '${FILE_NAME}' and trashed = false` });
  const response = await api(`https://www.googleapis.com/drive/v3/files?${q}`);
  const data = await response.json();
  return (data.files || []).sort((a,b) => (b.modifiedTime || '').localeCompare(a.modifiedTime || ''))[0];
}
async function uploadNew(data) {
  const boundary = 'promptlab_' + Math.random().toString(36).slice(2);
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:FILE_NAME,parents:['appDataFolder'],mimeType:'application/json'})}\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(data)}\r\n--${boundary}--`;
  await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', { method:'POST', headers:{'Content-Type':`multipart/related; boundary=${boundary}`}, body });
}
async function updateExisting(id, data) {
  await api(`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(id)}?uploadType=media`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
}
export function initDriveBackup({ exportData, importData }) {
  const save = document.getElementById('driveSave');
  const restore = document.getElementById('driveRestore');
  if (!save || !restore) return;
  const run = async (button, task) => {
    save.disabled = restore.disabled = true;
    status('Conectando con Google Drive…');
    try { await authorize(); await task(); }
    catch (e) { status(`No se completó la operación: ${e.message}`); }
    finally { save.disabled = restore.disabled = false; }
  };
  save.addEventListener('click', () => run(save, async () => {
    const existing = await findBackup();
    if (existing && !confirm('Ya hay una copia en Google Drive. ¿Quieres reemplazarla con los avances de este dispositivo?')) { status('Guardado cancelado.'); return; }
    const data = exportData();
    if (existing) await updateExisting(existing.id, data);
    else await uploadNew(data);
    status(`Copia guardada en Google Drive: ${new Date().toLocaleString('es-CO')}. Recuerda pulsar este botón cuando quieras actualizarla.`);
  }));
  restore.addEventListener('click', () => run(restore, async () => {
    const existing = await findBackup();
    if (!existing) { status('Esta cuenta de Google todavía no tiene una copia de PromptLab.'); return; }
    const response = await api(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(existing.id)}?alt=media`);
    const data = await response.json();
    if (!confirm('¿Restaurar la copia de Drive? Reemplazará los avances actuales de este navegador. Antes puedes guardar una copia en Drive desde el otro equipo.')) { status('Restauración cancelada.'); return; }
    importData(data);
    status('Copia restaurada. Actualizando la plataforma…');
    window.location.reload();
  }));
  status('Guardado local automático activado. Google Drive solo se actualiza cuando pulsas «Guardar en Drive».');
}
