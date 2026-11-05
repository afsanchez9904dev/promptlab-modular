import { challenges } from './challenges.js';

// PromptLab funciona sin backend: las preferencias y avances son locales.
const KEYS = Object.freeze({ progress: 'pl_done', library: 'pl_library', font: 'pl_font', contrast: 'pl_contrast' });
const SECTIONS = ['home', 'learn', 'practice', 'builder', 'library', 'homework'];
const $ = (id) => document.getElementById(id);

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
function store(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { window.alert('No se pudo guardar en este navegador. Puedes descargar tu trabajo.'); }
}

const state = {
  index: 0,
  hints: 0,
  completed: readJSON(KEYS.progress, []).filter((n) => Number.isInteger(n) && n >= 0 && n < challenges.length),
  library: readJSON(KEYS.library, []).filter((item) => typeof item?.text === 'string'),
  font: Math.max(16, Math.min(28, Number(localStorage.getItem(KEYS.font)) || 19)),
  currentPrompt: ''
};

function applyAccessibility() {
  document.documentElement.style.fontSize = `${state.font}px`;
  document.body.classList.toggle('contrast', localStorage.getItem(KEYS.contrast) === 'yes');
}
function changeFont(direction) {
  state.font = Math.max(16, Math.min(28, state.font + direction * 2));
  store(KEYS.font, state.font);
  applyAccessibility();
}
function toggleContrast() {
  localStorage.setItem(KEYS.contrast, document.body.classList.contains('contrast') ? 'no' : 'yes');
  applyAccessibility();
}
function resetAccessibility() {
  state.font = 19;
  store(KEYS.font, state.font);
  localStorage.setItem(KEYS.contrast, 'no');
  applyAccessibility();
}

function show(section) {
  if (!SECTIONS.includes(section)) return;
  SECTIONS.forEach((name) => $(name).classList.toggle('hidden', name !== section));
  if (section === 'practice') renderChallenge();
  if (section === 'library') renderLibrary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateProgress() {
  $('bar').style.width = `${state.completed.length / challenges.length * 100}%`;
  $('progressText').textContent = `${state.completed.length} de ${challenges.length} retos completados`;
}
function renderChallenge() {
  state.hints = 0;
  const challenge = challenges[state.index];
  const wrapper = document.createElement('div');
  wrapper.className = 'card';
  const heading = document.createElement('h3');
  heading.textContent = challenge.q;
  const tag = document.createElement('span');
  tag.className = 'pill';
  tag.textContent = `${challenge.level} · Reto ${state.index + 1} de ${challenges.length}`;
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'answer-options';
  const legend = document.createElement('legend');
  legend.className = 'small muted';
  legend.textContent = 'Selecciona una respuesta';
  fieldset.append(legend);
  challenge.options.forEach((option, index) => {
    const label = document.createElement('label');
    label.className = 'choice';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(index);
    label.append(input, document.createTextNode(option));
    fieldset.append(label);
  });
  const controls = document.createElement('div');
  controls.className = 'tools';
  [['Comprobar', 'checkAnswer'], ['Necesito una pista', 'hint']].forEach(([name, action], i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    button.dataset.action = `${action}()`;
    if (i) button.className = 'secondary';
    controls.append(button);
  });
  const feedback = document.createElement('div');
  feedback.id = 'feedback';
  feedback.setAttribute('aria-live', 'polite');
  wrapper.append(tag, heading, fieldset, controls, feedback);
  $('challenge').replaceChildren(wrapper);
}
function feedback(message) {
  const box = document.createElement('div');
  box.className = 'feedback';
  box.textContent = `🤖 Profe IA: ${message}`;
  $('feedback').replaceChildren(box);
}
function hint() {
  state.hints++;
  const message = challenges[state.index].hint;
  feedback(state.hints > 1 ? `${message} Relee las opciones y busca la más específica.` : message);
}
function checkAnswer() {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) return hint();
  const challenge = challenges[state.index];
  if (Number(selected.value) !== challenge.correct) return feedback(`Todavía no. ${challenge.hint} Intenta otra opción.`);
  if (!state.completed.includes(state.index)) {
    state.completed.push(state.index);
    store(KEYS.progress, state.completed);
    updateProgress();
  }
  feedback(`${challenge.explain} ¡Puedes continuar cuando quieras!`);
}
function jumpLevel(index) { state.index = index; renderChallenge(); }
function next() { state.index = (state.index + 1) % challenges.length; renderChallenge(); }
function prev() { state.index = (state.index + challenges.length - 1) % challenges.length; renderChallenge(); }

function build() {
  const task = $('task').value.trim();
  if (!task) { window.alert('Primero escribe qué necesitas hacer.'); $('task').focus(); return; }
  const context = $('context').value.trim();
  const format = $('format').value.trim();
  const limits = $('limits').value.trim();
  state.currentPrompt = [
    `Necesito que me ayudes a ${task}.`,
    context && `Contexto: ${context}.`,
    format && `Presenta la respuesta así: ${format}.`,
    limits && `Ten en cuenta: ${limits}.`,
    'Si falta información importante, pregúntame antes de asumirla.'
  ].filter(Boolean).join('\n\n');
  $('output').textContent = state.currentPrompt;
  $('built').classList.remove('hidden');
}
async function copyPrompt() {
  try { await navigator.clipboard.writeText(state.currentPrompt); window.alert('Prompt copiado.'); }
  catch { window.alert('Selecciona el texto para copiarlo manualmente.'); }
}
function savePrompt() {
  if (!state.currentPrompt) return;
  state.library.push({ date: new Date().toLocaleDateString('es-CO'), text: state.currentPrompt });
  store(KEYS.library, state.library);
  window.alert('Guardado en este navegador.');
}
function download(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function downloadPrompt() { if (state.currentPrompt) download(state.currentPrompt, 'mi-prompt.txt'); }
function downloadHomework() {
  download('PROMPTLAB INTERGENERACIONAL — MISIÓN EN CASA\n\n1. Lee la sección Aprender.\n2. Completa cuatro retos a tu ritmo.\n3. Construye un prompt propio.\n4. Pruébalo en ChatGPT y mejora la respuesta.\n5. Guarda y descarga tu biblioteca.\n\nOpcional: completa los doce retos y crea otro prompt.\n\nNo compartas información privada.', 'practica-en-casa.txt');
}
function exportLibrary() {
  const content = state.library.map((item, index) => `PROMPT ${index + 1} (${item.date})\n${item.text}`).join('\n\n----------------\n\n');
  download(content || 'Aún no has guardado prompts.', 'mi-biblioteca-promptlab.txt');
}
function renderLibrary() {
  const container = $('saved');
  container.replaceChildren();
  if (!state.library.length) { container.textContent = 'Todavía no has guardado prompts. ¡Crea el primero!'; return; }
  state.library.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const heading = document.createElement('h3');
    heading.textContent = `Prompt ${index + 1} · ${item.date}`;
    const body = document.createElement('div');
    body.className = 'prompt';
    body.textContent = item.text;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary';
    button.textContent = 'Eliminar';
    button.addEventListener('click', () => {
      if (!window.confirm('¿Eliminar este prompt de tu biblioteca?')) return;
      state.library.splice(index, 1);
      store(KEYS.library, state.library);
      renderLibrary();
    });
    card.append(heading, body, button);
    container.append(card);
  });
}

// Delegación centralizada: el HTML describe acciones, el JS implementa su comportamiento.
const actions = { show, changeFont, toggleContrast, resetAccessibility, jumpLevel, prev, next, hint, checkAnswer, build, copyPrompt, savePrompt, downloadPrompt, downloadHomework, exportLibrary };
document.addEventListener('click', (event) => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const match = /^([a-zA-Z]+)\((?:'([^']+)'|(-?\d+))?\)$/.exec(control.dataset.action);
  if (!match || !Object.hasOwn(actions, match[1])) return;
  const arg = match[2] ?? (match[3] === undefined ? undefined : Number(match[3]));
  actions[match[1]](arg);
});
applyAccessibility();
updateProgress();
