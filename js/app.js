import { challenges, LEVELS, doctorCases, comparisons } from './challenges.js';
import { missions } from './missions.js';

// PromptLab funciona sin backend: las preferencias y avances son locales (localStorage).
const KEYS = Object.freeze({
  progress: 'pl3_done', doctor: 'pl3_doctor', doctorWork: 'pl3_doctorwork', writes: 'pl3_writes',
  notebook: 'pl3_notebook', library: 'pl3_library', seen: 'pl3_seen', unlocked: 'pl3_unlocked',
  font: 'pl3_font', contrast: 'pl3_contrast', name: 'pl3_name'
});
const SECTIONS = ['home', 'learn', 'compare', 'practice', 'missions', 'builder', 'library', 'certificates', 'homework'];
const DOCTOR_NEEDED = 3;   // casos de la Misión 1 necesarios para considerarla cumplida
const $ = (id) => document.getElementById(id);
const wc = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;

// ---------- almacenamiento seguro ----------
function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch { return fallback; }
}
function readObj(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
function readText(key, fallback = '') {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function store(key, value) {
  try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); }
  catch { toast('No se pudo guardar en este navegador. Descarga tu trabajo para no perderlo.'); }
}

const challengeIds = challenges.map((c) => c.id);
const doctorIds = doctorCases.map((c) => c.id);
const state = {
  index: 0, hints: 0, attempts: 0, grader: null,
  doctorIndex: 0, compareIndex: 0, missionOpen: null,
  completed: readJSON(KEYS.progress, []).filter((id) => challengeIds.includes(id)),
  doctor: readJSON(KEYS.doctor, []).filter((id) => doctorIds.includes(id)),
  doctorWork: readObj(KEYS.doctorWork),
  writes: readObj(KEYS.writes),
  notebook: readObj(KEYS.notebook),
  library: readJSON(KEYS.library, []).filter((item) => typeof item?.text === 'string'),
  seen: readJSON(KEYS.seen, []),
  unlocked: readJSON(KEYS.unlocked, []),
  font: Math.max(16, Math.min(28, Number(readText(KEYS.font)) || 19)),
  name: readText(KEYS.name),
  currentPrompt: '', cert: null, current: 'home'
};

// ---------- utilidades de interfaz ----------
let toastTimer;
function toast(message, ms = 4500) {
  const box = $('toast');
  box.textContent = message;
  box.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.add('hidden'), ms);
}
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  });
  children.flat().forEach((c) => { if (c !== null && c !== undefined && c !== false) node.append(c); });
  return node;
}
const button = (label, action, cls = '') => el('button', { type: 'button', class: cls, 'data-action': action, text: label });
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function feedback(message, type = 'info', target = 'feedback') {
  const symbols = { success: '✅', retry: '💡', hint: '🔎', info: '🤖' };
  const titles = { success: '¡Muy bien!', retry: 'Vamos a mejorar', hint: 'Una pista para ti', info: 'Te acompaño' };
  const box = el('div', { class: `feedback feedback--${type}` },
    el('strong', { text: `${symbols[type]} Profe IA · ${titles[type]}` }),
    el('p', { text: message }));
  $(target).replaceChildren(box);
}

// ---------- accesibilidad ----------
function applyAccessibility() {
  document.documentElement.style.fontSize = `${state.font}px`;
  document.body.classList.toggle('contrast', readText(KEYS.contrast) === 'yes');
}
function changeFont(direction) {
  state.font = Math.max(16, Math.min(28, state.font + direction * 2));
  store(KEYS.font, String(state.font));
  applyAccessibility();
}
function toggleContrast() {
  store(KEYS.contrast, document.body.classList.contains('contrast') ? 'no' : 'yes');
  applyAccessibility();
}
function resetAccessibility() {
  state.font = 19;
  store(KEYS.font, '19');
  store(KEYS.contrast, 'no');
  applyAccessibility();
}

// ---------- progreso, misiones y certificados ----------
const levelList = (level) => challenges.filter((c) => c.level === level);
function levelStats(level) {
  const list = levelList(level);
  return { done: list.filter((c) => state.completed.includes(c.id)).length, total: list.length };
}
const missionById = (id) => missions.find((m) => m.id === id);
const missionDone = (id) => (id === 'm1' ? state.doctor.length >= DOCTOR_NEEDED : Boolean(state.notebook[id]?.done));
function missionStarted(id) {
  if (id === 'm1') return state.doctor.length > 0 || Object.keys(state.doctorWork).length > 0;
  return Object.values(state.notebook[id]?.fields || {}).some((v) => wc(v) > 0);
}
const labMissions = missions.filter((m) => m.kind === 'lab');

// Cada certificado define cuándo se gana (check) y cómo se dibuja.
const CERTS = [
  {
    id: 'Descubro', icon: '🌱', color: '#1f7a4a', stars: 1, verb: 'por completar con éxito el nivel',
    blurb: LEVELS[0].blurb, req: 'Completa los 6 retos del nivel.',
    line: () => `${levelStats('Descubro').total} retos superados`,
    check: () => levelMissing('Descubro')
  },
  {
    id: 'Construyo', icon: '✏️', color: '#245fa8', stars: 2, verb: 'por completar con éxito el nivel',
    blurb: LEVELS[1].blurb, req: `Completa los 8 retos del nivel y la Misión 1 (${DOCTOR_NEEDED} casos de «Rescata el prompt»).`,
    line: () => `${levelStats('Construyo').total} retos y ${state.doctor.length} casos de la Misión 1`,
    check: () => [...levelMissing('Construyo'), ...(missionDone('m1') ? [] : [`${DOCTOR_NEEDED - state.doctor.length} ${DOCTOR_NEEDED - state.doctor.length === 1 ? 'caso' : 'casos'} de la Misión 1`])]
  },
  {
    id: 'Experimento', icon: '🚀', color: '#7a3b9e', stars: 3, verb: 'por completar con éxito el nivel',
    blurb: LEVELS[2].blurb, req: 'Completa los 10 retos del nivel y las misiones 2 y 3.',
    line: () => `${levelStats('Experimento').total} retos y las misiones 2 y 3`,
    check: () => [...levelMissing('Experimento'), ...['m2', 'm3'].filter((id) => !missionDone(id)).map((id) => `la ${missionById(id).title.split(' · ')[0]}`)]
  },
  {
    id: 'Maestro', icon: '🏆', color: '#a45a00', stars: 4, verb: 'por completar las misiones avanzadas', title: 'MAESTRO DE PROMPTS',
    blurb: 'Diseño asistentes y resuelvo casos difíciles con criterio.', req: 'Completa las misiones 4 y 5 (opcionales).',
    line: () => 'Asistente personal reutilizable y desafío del profesor',
    check: () => ['m4', 'm5'].filter((id) => !missionDone(id)).map((id) => `la ${missionById(id).title.split(' · ')[0]}`)
  }
];
function levelMissing(level) {
  const { done, total } = levelStats(level);
  return done < total ? [`${total - done} ${total - done === 1 ? 'reto' : 'retos'} de este nivel`] : [];
}
const certStatus = (id) => {
  const missing = CERTS.find((c) => c.id === id).check();
  return { ok: missing.length === 0, missing };
};
function checkUnlocks() {
  CERTS.forEach(({ id }) => {
    if (certStatus(id).ok && !state.unlocked.includes(id)) {
      state.unlocked.push(id);
      store(KEYS.unlocked, state.unlocked);
      toast(`🎓 ¡Desbloqueaste el certificado «${id}»! Búscalo en «Certificados».`, 9000);
    }
  });
}
function updateProgress() {
  const total = challenges.length + doctorCases.length + labMissions.length;
  const done = state.completed.length + state.doctor.length + labMissions.filter((m) => missionDone(m.id)).length;
  $('bar').style.width = `${done / total * 100}%`;
  $('barWrap').setAttribute('aria-valuenow', String(Math.round(done / total * 100)));
  $('progressText').textContent = `${done} de ${total} actividades completadas (${challenges.length} retos, ${doctorCases.length} casos de la Misión 1 y ${labMissions.length} misiones de laboratorio)`;
  renderMission();
}
function markSeen(section) {
  if (!state.seen.includes(section)) { state.seen.push(section); store(KEYS.seen, state.seen); }
}

// ---------- navegación ----------
function show(section, { focus = true, keepMission = false } = {}) {
  if (!SECTIONS.includes(section)) return;
  state.current = section;
  if (section === 'missions' && !keepMission) state.missionOpen = null;
  SECTIONS.forEach((name) => $(name).classList.toggle('hidden', name !== section));
  document.querySelectorAll('nav button').forEach((b) => {
    const on = b.dataset.section === section;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (section === 'learn' || section === 'compare') markSeen(section);
  if (section === 'compare') renderCompare();
  if (section === 'practice') renderChallenge();
  if (section === 'missions') renderMissions();
  if (section === 'library') renderLibrary();
  if (section === 'certificates') renderCertificates();
  updateProgress();
  const heading = $(section).querySelector('h2');
  if (focus && heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- ruta de la clase ----------
function renderMission() {
  const list = $('mission');
  if (!list) return;
  const d = levelStats('Descubro'), c = levelStats('Construyo'), e = levelStats('Experimento');
  const steps = [
    { done: state.seen.includes('learn'), text: 'Lee «Aprender»: seguridad, los cinco ingredientes y los trucos.', go: ['Ir a Aprender', "show('learn')"] },
    { done: state.seen.includes('compare'), text: 'Mira un «Antes y después» para ver el efecto de un buen prompt.', go: ['Ver ejemplos', "show('compare')"] },
    { done: d.done === d.total, text: `Nivel 🌱 Descubro: ${d.done} de ${d.total} retos.`, go: ['Ir a los retos', "jumpLevel('Descubro')"] },
    { done: missionDone('m1'), text: `Misión 1 · Rescata el prompt: ${Math.min(state.doctor.length, DOCTOR_NEEDED)} de ${DOCTOR_NEEDED} casos.`, go: ['Ir a la Misión 1', "openMission('m1')"] },
    { done: c.done === c.total, text: `Nivel ✏️ Construyo: ${c.done} de ${c.total} retos.`, go: ['Ir a los retos', "jumpLevel('Construyo')"] },
    { done: missionDone('m2'), text: 'Misión 2 · La IA necesita instrucciones: mejora tu prompt dos veces.', go: ['Ir a la Misión 2', "openMission('m2')"] },
    { done: e.done === e.total, text: `Nivel 🚀 Experimento: ${e.done} de ${e.total} retos.`, go: ['Ir a los retos', "jumpLevel('Experimento')"] },
    { done: missionDone('m3'), text: 'Misión 3 · Detective de respuestas.', go: ['Ir a la Misión 3', "openMission('m3')"] },
    { done: ['Descubro', 'Construyo', 'Experimento'].every((id) => certStatus(id).ok), text: 'Escribe tu nombre y descarga tus certificados.', go: ['Ver certificados', "show('certificates')"] },
    { done: missionDone('m4') && missionDone('m5'), text: 'Profundización (opcional): misiones 4 y 5 para el certificado «Maestro de prompts».', go: ['Ver las misiones', "show('missions')"] }
  ];
  const firstPending = steps.findIndex((s) => !s.done);
  list.replaceChildren(...steps.map((step, i) => {
    const sr = el('span', { class: 'sr-only', text: step.done ? ' (completado)' : i === firstPending ? ' (siguiente paso)' : '' });
    const li = el('li', { class: `mission-step${step.done ? ' is-done' : ''}${i === firstPending ? ' is-current' : ''}` },
      el('span', { class: 'mission-mark', 'aria-hidden': 'true', text: step.done ? '✅' : String(i + 1) }),
      el('span', { class: 'mission-text' }, step.text, sr));
    if (!step.done) li.append(button(step.go[0], step.go[1], i === firstPending ? '' : 'secondary'));
    return li;
  }));
}

// ---------- antes y después ----------
function renderRichText(container, text) {
  text.split('\n\n').forEach((para) => {
    const lines = para.split('\n');
    if (lines.length > 1 && lines.every((l) => l.includes(' | '))) {
      container.append(el('table', {}, lines.map((l, i) => el('tr', {}, l.split(' | ').map((cell) => el(i === 0 ? 'th' : 'td', { text: cell }))))));
    } else container.append(el('p', { class: 'rich', text: para }));
  });
}
function renderCompare() {
  $('compareTabs').replaceChildren(...comparisons.map((item, i) => {
    const b = button(`${i + 1}. ${item.title}`, `openCompare(${i})`, i === state.compareIndex ? '' : 'secondary');
    if (i === state.compareIndex) b.setAttribute('aria-pressed', 'true');
    return b;
  }));
  const item = comparisons[state.compareIndex];
  const column = (cls, title, prompt, answer) => {
    const a = el('div', { class: 'answer' });
    renderRichText(a, answer);
    return el('div', { class: `card compare-${cls}` },
      el('h3', { text: title }),
      el('div', { class: 'small muted', text: 'Lo que escribes:' }),
      el('div', { class: 'prompt', text: prompt }),
      el('div', { class: 'small muted space-top', text: 'Lo que responde:' }), a);
  };
  const grid = el('div', { class: 'compare-grid' },
    column('bad', '😕 Prompt vago', item.vague, item.vagueAnswer),
    column('good', '😊 Prompt mejorado', item.good, item.goodAnswer));
  const lesson = el('div', { class: 'card lesson-card' },
    el('strong', { text: '💡 Lo que aprendemos: ' }), item.lesson,
    el('div', { class: 'tools space-top' },
      button('Ahora practico yo: Misión 1', "openMission('m1')"),
      button('Ir a los retos', "show('practice')", 'secondary')));
  $('compareBody').replaceChildren(grid, lesson);
}
function openCompare(i) { state.compareIndex = Number(i) || 0; renderCompare(); }

// ================= RETOS =================
const SELECT_PLACEHOLDER = 'Elige…';
function makeSelect(options, label) {
  const select = el('select', { 'aria-label': label });
  select.append(el('option', { value: '', text: SELECT_PLACEHOLDER }));
  shuffle(options.map((text, i) => ({ text, i }))).forEach(({ text, i }) => select.append(el('option', { value: String(i), text })));
  return select;
}
function gradeSelects(rows, selects, wrappers) {
  if (selects.some((s) => s.value === '')) return { empty: true, message: 'Elige una opción en cada espacio y vuelve a comprobar.' };
  let ok = 0;
  selects.forEach((s, i) => {
    const right = Number(s.value) === rows[i].correct;
    if (right) ok++;
    wrappers[i].classList.toggle('row-ok', right);
    wrappers[i].classList.toggle('row-miss', !right);
  });
  const wrongIndex = selects.findIndex((s, i) => Number(s.value) !== rows[i].correct);
  return { correct: ok === rows.length, message: `Llevas ${ok} de ${rows.length} bien. Revisa lo marcado con 💡.`, wrongIndex };
}

const BUILDERS = {
  mcq(ch) {
    const fieldset = el('fieldset', { class: 'answer-options' }, el('legend', { class: 'small muted', text: 'Selecciona una respuesta' }));
    shuffle(ch.options.map((_, i) => i)).forEach((i) => {
      const input = el('input', { type: 'radio', name: 'answer', value: String(i) });
      input.addEventListener('change', () => {
        fieldset.querySelectorAll('.choice').forEach((c) => c.classList.remove('choice-correct', 'choice-incorrect'));
        $('feedback')?.replaceChildren();
      });
      fieldset.append(el('label', { class: 'choice' }, input, ch.options[i]));
    });
    return {
      node: fieldset,
      grade() {
        const sel = fieldset.querySelector('input:checked');
        if (!sel) return { empty: true, message: 'Selecciona una opción antes de comprobar. Puedes pedir una pista si lo necesitas.' };
        const idx = Number(sel.value), ok = idx === ch.correct;
        fieldset.querySelectorAll('.choice').forEach((c) => c.classList.remove('choice-correct', 'choice-incorrect'));
        sel.closest('.choice').classList.add(ok ? 'choice-correct' : 'choice-incorrect');
        return { correct: ok, message: ok ? '' : (ch.wrong?.[idx] || `La opción «${ch.options[idx]}» no resuelve lo que pide el ejercicio.`) };
      },
      hint2() {
        const wrong = ch.options.findIndex((_, i) => i !== ch.correct);
        return `Segunda pista: descarta esta opción, no es la correcta: «${ch.options[wrong]}».`;
      }
    };
  },
  multi(ch) {
    const fieldset = el('fieldset', { class: 'answer-options' }, el('legend', { class: 'small muted', text: 'Marca todas las que correspondan' }));
    shuffle(ch.options.map((_, i) => i)).forEach((i) => {
      const input = el('input', { type: 'checkbox', name: 'answer', value: String(i) });
      input.addEventListener('change', () => $('feedback')?.replaceChildren());
      fieldset.append(el('label', { class: 'choice' }, input, ch.options[i]));
    });
    return {
      node: fieldset,
      grade() {
        const picked = [...fieldset.querySelectorAll('input:checked')].map((i) => Number(i.value));
        if (!picked.length) return { empty: true, message: 'Marca al menos una opción antes de comprobar.' };
        const right = picked.filter((i) => ch.correct.includes(i)).length;
        const extra = picked.length - right;
        const ok = right === ch.correct.length && extra === 0;
        const message = ok ? '' : `Tienes ${right} de ${ch.correct.length} correctas${extra ? ` y ${extra === 1 ? 'una de las que marcaste no corresponde' : `${extra} de las que marcaste no corresponden`}` : ' y todavía te falta alguna'}.`;
        return { correct: ok, message };
      },
      hint2() {
        const wrong = ch.options.findIndex((_, i) => !ch.correct.includes(i));
        return `Segunda pista: esta opción NO debes marcarla: «${ch.options[wrong]}».`;
      }
    };
  },
  classify(ch) {
    const rows = ch.items.map((it) => ({ correct: it.a }));
    const selects = [], wrappers = [];
    const list = el('div', { class: 'rows' });
    ch.items.forEach((it) => {
      const select = makeSelect(ch.categories, it.t);
      select.addEventListener('change', () => $('feedback')?.replaceChildren());
      selects.push(select);
      const w = el('div', { class: 'row' }, el('span', { class: 'row-text', text: `«${it.t}»` }), select);
      wrappers.push(w);
      list.append(w);
    });
    return {
      node: list,
      grade() { return gradeSelects(rows, selects, wrappers); },
      hint2() { return 'Segunda pista: empieza por la frase que más segura te parezca y deja para el final las que se parecen.'; }
    };
  },
  fill(ch) {
    const selects = [], wrappers = [];
    const p = el('p', { class: 'fill' });
    ch.template.split(/(\{\d+\})/).forEach((part) => {
      const m = /^\{(\d+)\}$/.exec(part);
      if (!m) { p.append(part); return; }
      const idx = Number(m[1]);
      const select = makeSelect(ch.blanks[idx].options, `Espacio ${idx + 1}`);
      select.addEventListener('change', () => $('feedback')?.replaceChildren());
      selects[idx] = select;
      const w = el('span', { class: 'blank' }, select);
      wrappers[idx] = w;
      p.append(w);
    });
    return {
      node: p,
      grade() { return gradeSelects(ch.blanks, selects, wrappers); },
      hint2() { return 'Segunda pista: en cada espacio, elige lo que le dé a la IA más información útil y menos oportunidades de adivinar.'; }
    };
  },
  write(ch) {
    const saved = state.writes[ch.id] || { text: '', ticks: [], reflect: '' };
    const persist = () => { state.writes[ch.id] = saved; store(KEYS.writes, state.writes); };
    const counter = el('div', { class: 'small muted', 'aria-live': 'off' });
    const refreshCounter = () => { counter.textContent = `${wc(saved.text)} palabras (mínimo ${ch.minWords})`; };
    const area = el('textarea', { id: 'writeText', rows: 6, placeholder: 'Escribe aquí tu prompt…' });
    area.value = saved.text || '';
    area.addEventListener('input', () => { saved.text = area.value; persist(); refreshCounter(); });
    refreshCounter();
    let reflectArea = null, reflectBlock = null;
    if (ch.reflect) {
      reflectArea = el('textarea', { id: 'writeReflect', rows: 4, placeholder: 'Cuéntalo con tus palabras…' });
      reflectArea.value = saved.reflect || '';
      reflectArea.addEventListener('input', () => { saved.reflect = reflectArea.value; persist(); });
      reflectBlock = [el('label', { for: 'writeReflect', text: `${ch.reflect.label} (mínimo ${ch.reflect.min} palabras)` }), reflectArea];
    }
    const boxes = ch.rubric.map((text, i) => {
      const input = el('input', { type: 'checkbox', value: String(i) });
      input.checked = Boolean(saved.ticks?.[i]);
      input.addEventListener('change', () => { saved.ticks = boxes.map((b) => b.checked); persist(); });
      return input;
    });
    const rubric = el('fieldset', { class: 'rubric' },
      el('legend', { text: `Autoevaluación: marca lo que tu prompt SÍ tiene (necesitas al menos ${ch.need})` }),
      ch.rubric.map((text, i) => el('label', { class: 'choice' }, boxes[i], text)));
    const node = el('div', { class: 'write-box' },
      el('p', {}, el('strong', { text: 'Tu tarea: ' }), ch.task),
      el('label', { for: 'writeText', text: `Tu prompt (mínimo ${ch.minWords} palabras)` }), area, counter,
      reflectBlock, rubric,
      el('div', { class: 'tools space-top' },
        button('Revisión del asistente (orientación)', 'reviewWrite()', 'secondary'),
        el('a', { class: 'btn btn-secondary', href: 'https://chatgpt.com', target: '_blank', rel: 'noopener noreferrer', text: 'Probarlo en ChatGPT' })),
      el('div', { id: 'writeHints', 'aria-live': 'polite' }));
    return {
      node,
      grade() {
        const missing = [];
        if (wc(saved.text) < ch.minWords) missing.push(`escribir al menos ${ch.minWords} palabras en tu prompt (llevas ${wc(saved.text)})`);
        const ticked = boxes.filter((b) => b.checked).length;
        if (ticked < ch.need) missing.push(`marcar al menos ${ch.need} casillas de autoevaluación (llevas ${ticked})`);
        if (ch.reflect && wc(saved.reflect) < ch.reflect.min) missing.push(`contar qué cambiaste (mínimo ${ch.reflect.min} palabras)`);
        return missing.length ? { correct: false, message: `Te falta: ${missing.join('; ')}.` } : { correct: true, message: '' };
      },
      hint2() { return 'Segunda pista: cada casilla es una pieza que suma. Pruébalo en ChatGPT, mira qué falta en la respuesta y agrega eso a tu prompt.'; },
      review() { return { text: saved.text, hints: ch.hints }; }
    };
  }
};

function renderLevelButtons() {
  $('levelButtons').replaceChildren(...LEVELS.map(({ name, icon }) => {
    const { done, total } = levelStats(name);
    const active = challenges[state.index].level === name;
    const b = button(`${icon} ${name} · ${done}/${total}`, `jumpLevel('${name}')`, active ? '' : 'secondary');
    if (active) b.setAttribute('aria-pressed', 'true');
    return b;
  }));
}
function renderChallenge() {
  state.hints = 0; state.attempts = 0;
  const ch = challenges[state.index];
  const inLevel = levelList(ch.level);
  const typeLabel = { mcq: 'opción única', multi: 'marca varias', classify: 'clasifica', fill: 'completa', write: 'redacta' }[ch.type];
  state.grader = BUILDERS[ch.type](ch);
  const wrapper = el('div', { class: 'card' },
    el('span', { class: 'pill', text: `${ch.level} · Reto ${inLevel.indexOf(ch) + 1} de ${inLevel.length} · ${typeLabel}${state.completed.includes(ch.id) ? ' · ✅ resuelto' : ''}` }),
    el('h3', { text: ch.q }),
    ch.ctx && el('blockquote', { class: 'ctx', text: ch.ctx }),
    state.grader.node,
    el('div', { class: 'tools space-top' },
      button(ch.type === 'write' ? 'Terminé el reto' : 'Comprobar', 'checkAnswer()'),
      button('Necesito una pista', 'hint()', 'secondary')),
    el('div', { id: 'feedback', 'aria-live': 'polite' }));
  $('challenge').replaceChildren(wrapper);
  renderLevelButtons();
}
function hint() {
  state.hints++;
  const ch = challenges[state.index];
  const message = state.hints === 1 ? ch.hint
    : state.hints === 2 ? state.grader.hint2()
      : 'Ya no tengo más pistas. Tómate tu tiempo, lee de nuevo con calma y confía en tu criterio.';
  feedback(message, 'hint');
}
function reviewWrite() {
  const ch = challenges[state.index];
  if (ch.type !== 'write') return;
  const { text, hints } = state.grader.review();
  const out = $('writeHints');
  if (wc(text) < 6) { out.replaceChildren(el('p', { class: 'small', text: 'Escribe primero tu prompt y luego pido la revisión.' })); return; }
  const lower = text.toLowerCase();
  const items = hints.map((h) => {
    const ok = h.test(lower);
    return el('li', { class: ok ? 'ok' : 'miss' }, el('strong', { text: `${ok ? '✅' : '💡'} ${h.label}` }), !ok && [el('br'), h.tip]);
  });
  out.replaceChildren(
    el('ul', { class: 'checklist' }, items),
    el('p', { class: 'small muted', text: 'Es solo orientación: busco palabras clave y existen muchas formas válidas de escribir un buen prompt. Tu autoevaluación y lo que ChatGPT responda valen más que esta revisión.' }));
}
function checkAnswer() {
  const ch = challenges[state.index];
  const res = state.grader.grade();
  if (res.empty) { feedback(res.message, 'hint'); return; }
  if (!res.correct) {
    state.attempts++;
    feedback(`${res.message} ${state.attempts > 1 ? 'Puedes pedir una pista y volver a intentarlo.' : ch.hint}`, 'retry');
    return;
  }
  let extra = '';
  if (!state.completed.includes(ch.id)) {
    state.completed.push(ch.id);
    store(KEYS.progress, state.completed);
    const { done, total } = levelStats(ch.level);
    const cs = CERTS.find((c) => c.id === ch.level);
    if (done === total && cs && !certStatus(ch.level).ok) extra = ` Terminaste los retos de ${ch.level}. Para el certificado te falta: ${certStatus(ch.level).missing.join(' y ')}.`;
    renderLevelButtons();
    updateProgress();
    checkUnlocks();
  }
  feedback(`${ch.explain}${extra} ¡Puedes continuar cuando quieras!`, 'success');
}
function jumpLevel(level) {
  const list = levelList(level);
  if (!list.length) return;
  state.index = challenges.indexOf(list.find((c) => !state.completed.includes(c.id)) || list[0]);
  show('practice');
}
function next() { state.index = (state.index + 1) % challenges.length; renderChallenge(); }
function prev() { state.index = (state.index + challenges.length - 1) % challenges.length; renderChallenge(); }

// ================= MISIONES =================
function renderMissions() {
  const body = $('missionBody');
  if (!state.missionOpen) {
    body.replaceChildren(el('div', { class: 'mission-list' }, missions.map((m) => {
      const done = missionDone(m.id);
      const status = m.id === 'm1' ? `${state.doctor.length} de ${doctorCases.length} casos terminados` : done ? '✅ Terminada' : missionStarted(m.id) ? '✏️ En curso' : 'Sin empezar';
      return el('div', { class: `card mission-card${done ? ' is-done' : ''}` },
        el('div', { class: 'pills' },
          el('span', { class: 'pill', text: m.tag }), el('span', { class: 'pill', text: `⏱ ${m.time}` }),
          el('span', { class: `pill ${m.required ? 'pill-req' : 'pill-opt'}`, text: m.required ? 'Obligatoria' : 'Opcional' })),
        el('h3', { text: m.title }), el('p', { text: m.summary }),
        el('p', { class: 'cert-status', text: status }),
        button(done ? 'Revisar' : missionStarted(m.id) ? 'Continuar' : 'Empezar', `openMission('${m.id}')`, done ? 'secondary' : ''));
    })));
    return;
  }
  const m = missionById(state.missionOpen);
  if (m.kind === 'doctor') renderDoctor(); else renderMissionDetail(m);
}
function openMission(id) {
  if (!missionById(id)) return;
  state.missionOpen = id;
  show('missions', { keepMission: true });
}
function backToMissions() { state.missionOpen = null; renderMissions(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

function missionEntry(id) {
  state.notebook[id] ??= { fields: {}, done: false };
  return state.notebook[id];
}
function renderMissionDetail(m) {
  const entry = missionEntry(m.id);
  const fields = m.fields.map((f) => {
    const area = el('textarea', { id: `mf-${f.key}`, rows: f.rows || 3 });
    area.value = entry.fields[f.key] || '';
    const counter = el('span', { class: 'small muted' });
    const refresh = () => { counter.textContent = `${wc(area.value)} palabras · mínimo ${f.min}`; counter.classList.toggle('counter-ok', wc(area.value) >= f.min); };
    area.addEventListener('input', () => { entry.fields[f.key] = area.value; store(KEYS.notebook, state.notebook); refresh(); });
    refresh();
    return el('div', { class: 'mfield' },
      el('label', { for: `mf-${f.key}`, text: f.label }),
      f.help && el('div', { class: 'small muted', text: f.help }), area, counter);
  });
  $('missionBody').replaceChildren(
    button('← Volver a las misiones', 'backToMissions()', 'secondary'),
    el('div', { class: 'card' },
      el('div', { class: 'pills' },
        el('span', { class: 'pill', text: m.tag }), el('span', { class: 'pill', text: `⏱ ${m.time}` }),
        el('span', { class: `pill ${m.required ? 'pill-req' : 'pill-opt'}`, text: m.required ? 'Obligatoria' : 'Opcional' }),
        entry.done && el('span', { class: 'pill pill-done', text: '✅ Terminada' })),
      el('h3', { text: m.title }),
      m.intro.map((t) => el('p', { text: t })),
      m.caseText && [el('blockquote', { class: 'ctx', id: 'caseText', text: m.caseText }),
        el('div', { class: 'tools' }, button('Copiar el caso', 'copyCase()', 'secondary'))],
      el('h4', { text: 'Paso a paso' }),
      el('ol', {}, m.steps.map((s) => el('li', { text: s }))),
      el('div', { class: 'tools space-top' },
        el('a', { class: 'btn btn-secondary', href: 'https://chatgpt.com', target: '_blank', rel: 'noopener noreferrer', text: 'Abrir ChatGPT en otra pestaña' })),
      el('div', { class: 'lesson' }, el('strong', { text: '💡 Ayudas' }), el('ul', {}, m.tips.map((t) => el('li', { text: t }))))),
    el('div', { class: 'card' },
      el('h3', { text: '📓 Mi cuaderno de esta misión' }),
      el('p', { class: 'small muted', text: 'Se guarda solo mientras escribes, en este navegador. Descárgalo al terminar.' }),
      fields,
      el('div', { class: 'tools space-top' },
        button('Terminar misión', 'finishMission()'),
        m.compare && button('Comparar mis versiones', 'compareVersions()', 'secondary'),
        button('Descargar esta misión (.txt)', 'downloadMission()', 'secondary')),
      el('div', { id: 'missionFeedback', 'aria-live': 'polite' }),
      el('div', { id: 'compareOut' })));
}
function copyCase() {
  const m = missionById(state.missionOpen);
  if (!m?.caseText) return;
  navigator.clipboard.writeText(m.caseText).then(
    () => toast('✅ Caso copiado. Pégalo en ChatGPT.'),
    () => toast('Selecciona el texto del caso y cópialo manualmente.'));
}
function finishMission() {
  const m = missionById(state.missionOpen);
  const entry = missionEntry(m.id);
  const missing = m.fields.filter((f) => f.required !== false && wc(entry.fields[f.key]) < f.min);
  if (missing.length) {
    $('missionFeedback').replaceChildren(el('div', { class: 'feedback feedback--retry' },
      el('strong', { text: '💡 Profe IA · Todavía falta un poco' }),
      el('p', { text: 'Completa estos espacios (cada uno tiene un mínimo de palabras):' }),
      el('ul', {}, missing.map((f) => el('li', { text: `${f.label} — mínimo ${f.min} palabras (llevas ${wc(entry.fields[f.key])})` })))));
    return;
  }
  const first = !entry.done;
  entry.done = true;
  store(KEYS.notebook, state.notebook);
  feedback('¡Misión terminada! Puedes descargar tu cuaderno o comparar tus versiones.', 'success', 'missionFeedback');
  if (first) { updateProgress(); checkUnlocks(); }
}

// Comparación de versiones palabra por palabra (LCS)
function diffWords(a, b) {
  const x = a.split(/\s+/).filter(Boolean), y = b.split(/\s+/).filter(Boolean);
  const n = x.length, m = y.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const oldOut = [], newOut = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) { oldOut.push({ w: x[i] }); newOut.push({ w: y[j] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { oldOut.push({ w: x[i], removed: true }); i++; }
    else { newOut.push({ w: y[j], added: true }); j++; }
  }
  while (i < n) oldOut.push({ w: x[i++], removed: true });
  while (j < m) newOut.push({ w: y[j++], added: true });
  return { oldOut, newOut };
}
function renderDiffText(parts) {
  const p = el('p', { class: 'diff' });
  parts.forEach((part, k) => {
    const node = part.removed ? el('del', { text: part.w }) : part.added ? el('ins', { text: part.w }) : document.createTextNode(part.w);
    p.append(node, k < parts.length - 1 ? ' ' : '');
  });
  return p;
}
function compareVersions() {
  const m = missionById(state.missionOpen);
  const entry = missionEntry(m.id);
  const versions = m.compare.map((key, i) => ({ label: `Versión ${i + 1}`, text: (entry.fields[key] || '').trim() })).filter((v) => v.text);
  const out = $('compareOut');
  if (versions.length < 2) {
    out.replaceChildren(el('div', { class: 'feedback feedback--hint' }, el('strong', { text: '🔎 Profe IA · Una pista para ti' }), el('p', { text: 'Escribe al menos dos versiones de tu prompt para poder compararlas.' })));
    return;
  }
  const blocks = [el('h4', { text: 'Cómo evolucionó tu prompt' }),
    el('p', { class: 'small muted', text: 'En la versión nueva, las palabras agregadas aparecen en negrita y subrayadas. En la versión anterior, las que quitaste aparecen tachadas.' })];
  for (let i = 0; i < versions.length - 1; i++) {
    const { oldOut, newOut } = diffWords(versions[i].text, versions[i + 1].text);
    const added = newOut.filter((p) => p.added).length, removed = oldOut.filter((p) => p.removed).length;
    blocks.push(el('div', { class: 'card diff-card' },
      el('h4', { text: `${versions[i].label} → ${versions[i + 1].label}: ${added} palabras agregadas, ${removed} quitadas` }),
      el('div', { class: 'compare-grid' },
        el('div', {}, el('div', { class: 'small muted', text: versions[i].label }), renderDiffText(oldOut)),
        el('div', {}, el('div', { class: 'small muted', text: versions[i + 1].label }), renderDiffText(newOut)))));
  }
  out.replaceChildren(...blocks);
}

// ---------- Misión 1: Rescata el prompt ----------
function doctorEntry(id) { state.doctorWork[id] ??= { text: '', why: '', reviewed: false }; return state.doctorWork[id]; }
function persistDoctor() { store(KEYS.doctorWork, state.doctorWork); }
function renderDoctor() {
  $('missionBody').replaceChildren(
    button('← Volver a las misiones', 'backToMissions()', 'secondary'),
    el('div', { class: 'card' },
      el('div', { class: 'pills' }, el('span', { class: 'pill', text: 'Inicial' }), el('span', { class: 'pill', text: '⏱ 15–20 min' }), el('span', { class: 'pill pill-req', text: 'Obligatoria' })),
      el('h3', { text: 'Misión 1 · Rescata el prompt' }),
      el('p', { text: `Te damos un prompt «enfermo». Escribe tu versión mejorada y explica qué información agregaste y por qué. Con ${DOCTOR_NEEDED} casos terminados cumples la misión; los cinco completan el desafío.` })),
    el('div', { class: 'tools', role: 'group', 'aria-label': 'Elegir caso', id: 'doctorTabs' }),
    el('div', { class: 'card', id: 'doctorBody' }));
  renderDoctorTabs();
  renderDoctorCase();
}
function renderDoctorTabs() {
  $('doctorTabs').replaceChildren(...doctorCases.map((c, i) => {
    const b = button(`${state.doctor.includes(c.id) ? '✅ ' : ''}${i + 1}. ${c.title}`, `openDoctor(${i})`, i === state.doctorIndex ? '' : 'secondary');
    if (i === state.doctorIndex) b.setAttribute('aria-pressed', 'true');
    return b;
  }));
}
function renderDoctorCase() {
  const c = doctorCases[state.doctorIndex];
  const w = doctorEntry(c.id);
  const area = el('textarea', { id: 'doctorInput', placeholder: 'Escribe aquí tu prompt…' });
  area.value = w.text;
  area.addEventListener('input', () => { w.text = area.value; persistDoctor(); });
  const why = el('textarea', { id: 'doctorWhy', rows: 3, placeholder: 'Por ejemplo: agregué para quién es y pedí un tono cariñoso, porque…' });
  why.value = w.why;
  why.addEventListener('input', () => { w.why = why.value; persistDoctor(); });
  $('doctorBody').replaceChildren(
    el('span', { class: 'pill', text: `Caso ${state.doctorIndex + 1} de ${doctorCases.length}${state.doctor.includes(c.id) ? ' · ✅ terminado' : ''}` }),
    el('h3', { text: c.title }),
    el('p', {}, el('strong', { text: 'Situación: ' }), c.scenario),
    el('div', { class: 'small muted', text: 'Prompt enfermo 🤒' }),
    el('div', { class: 'prompt', text: c.bad }),
    el('label', { for: 'doctorInput', text: 'Tu versión mejorada, con tus propias palabras (mínimo 10 palabras)' }), area,
    el('label', { for: 'doctorWhy', text: '¿Qué información agregaste y por qué? (mínimo 6 palabras)' }), why,
    el('div', { class: 'tools space-top' },
      button('Revisión del asistente (orientación)', 'checkDoctor()', 'secondary'),
      button('Ver un ejemplo', 'showExample()', 'secondary'),
      button('Terminé este caso', 'finishDoctorCase()')),
    el('div', { id: 'doctorResult', 'aria-live': 'polite' }));
}
function openDoctor(i) { state.doctorIndex = Number(i) || 0; renderDoctorTabs(); renderDoctorCase(); }
function checkDoctor() {
  const c = doctorCases[state.doctorIndex];
  const w = doctorEntry(c.id);
  const out = $('doctorResult');
  if (wc(w.text) < 8) {
    feedback('Escribe una versión más completa (al menos una frase de unas 8 palabras) y luego la reviso.', 'hint', 'doctorResult');
    return;
  }
  w.reviewed = true; persistDoctor();
  const lower = w.text.toLowerCase();
  const results = c.checks.map((check) => ({ ...check, ok: check.test(lower) }));
  const score = results.filter((r) => r.ok).length;
  feedback(score === c.checks.length ? 'Detecté los 4 elementos que buscaba. ¡Buen trabajo!' : `Detecté ${score} de ${c.checks.length} elementos. Mira abajo lo que podrías agregar.`, score >= 3 ? 'success' : 'info', 'doctorResult');
  out.append(
    el('ul', { class: 'checklist' }, results.map((r) => el('li', { class: r.ok ? 'ok' : 'miss' }, el('strong', { text: `${r.ok ? '✅' : '💡'} ${r.label}` }), !r.ok && [el('br'), r.tip]))),
    el('p', { class: 'small muted', text: 'Es solo orientación: busco palabras clave. Si tu prompt te parece bueno aunque no marque algo, pruébalo en ChatGPT. Tú decides cuándo terminar el caso.' }));
}
function finishDoctorCase() {
  const c = doctorCases[state.doctorIndex];
  const w = doctorEntry(c.id);
  const missing = [];
  if (wc(w.text) < 10) missing.push(`escribir tu versión mejorada (mínimo 10 palabras; llevas ${wc(w.text)})`);
  if (wc(w.why) < 6) missing.push(`explicar qué agregaste y por qué (mínimo 6 palabras; llevas ${wc(w.why)})`);
  if (!w.reviewed) missing.push('pedir una vez la «Revisión del asistente»');
  if (missing.length) { feedback(`Te falta: ${missing.join('; ')}.`, 'retry', 'doctorResult'); return; }
  if (!state.doctor.includes(c.id)) {
    state.doctor.push(c.id);
    store(KEYS.doctor, state.doctor);
    updateProgress();
    checkUnlocks();
  }
  renderDoctorTabs();
  feedback(`¡Caso terminado! Llevas ${state.doctor.length} de ${doctorCases.length}.${missionDone('m1') ? ' La Misión 1 ya está cumplida.' : ''}`, 'success', 'doctorResult');
}
function showExample() {
  const c = doctorCases[state.doctorIndex];
  $('doctorResult').replaceChildren(el('div', { class: 'card example' },
    el('strong', { text: '✨ Un ejemplo de prompt sano' }),
    el('div', { class: 'prompt', text: c.example }),
    el('p', { class: 'small muted', text: 'No lo copies tal cual: escribe el tuyo con tus palabras y con tus propios datos.' })));
}

// ================= CONSTRUCTOR Y CUADERNO =================
const clean = (s) => s.trim().replace(/[.\s]+$/, '');
function build() {
  const task = clean($('task').value);
  if (!task) { toast('Primero escribe qué necesitas.'); $('task').focus(); return; }
  const role = clean($('role').value), context = clean($('context').value);
  const format = clean($('format').value), limits = clean($('limits').value);
  state.currentPrompt = [
    role && `Actúa como ${role}.`,
    `Necesito lo siguiente: ${task}.`,
    context && `Contexto: ${context}.`,
    format && `Presenta la respuesta así: ${format}.`,
    limits && `Ten en cuenta: ${limits}.`,
    'Si falta información importante, pregúntame antes de asumirla.'
  ].filter(Boolean).join('\n\n');
  $('output').textContent = state.currentPrompt;
  $('built').classList.remove('hidden');
  $('output').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
async function copyPrompt() {
  if (!state.currentPrompt) return;
  try { await navigator.clipboard.writeText(state.currentPrompt); toast('✅ Prompt copiado. Ahora pégalo en ChatGPT.'); }
  catch {
    const range = document.createRange();
    range.selectNodeContents($('output'));
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    toast('Selecciona el texto resaltado y cópialo con Ctrl+C (o mantén presionado en el celular).');
  }
}
function savePrompt() {
  if (!state.currentPrompt) return;
  state.library.push({
    date: new Date().toLocaleDateString('es-CO'), text: state.currentPrompt,
    answer: $('answerText').value.trim(), improve: $('improveText').value.trim()
  });
  store(KEYS.library, state.library);
  toast('✅ Guardado en Mi cuaderno.');
  $('answerText').value = '';
  $('improveText').value = '';
}
function download(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function downloadPrompt() { if (state.currentPrompt) download(state.currentPrompt, 'mi-prompt.txt'); }
function downloadHomework() {
  download('PROMPTLAB INTERGENERACIONAL — TAREA: MI LABORATORIO PERSONAL DE PROMPTS\n\nENTREGA PRINCIPAL\n1. Completa los niveles Descubro y Construyo.\n2. Resuelve las misiones 1, 2 y 3.\n3. Crea un prompt propio y mejóralo dos veces (Misión 2).\n4. Descarga tu cuaderno y entrega: prompt inicial, prompt mejorado y una breve comparación de resultados.\n\nPROFUNDIZACIÓN OPCIONAL\n- Nivel Experimento y misiones 4 y 5 (certificado «Maestro de prompts»).\n\nNo compartas información privada.', 'tarea-promptlab.txt');
}
function notebookText() {
  const lines = [`CUADERNO DE EXPERIMENTOS · PROMPTLAB INTERGENERACIONAL`, `Nombre: ${state.name || '(sin nombre)'}`, `Fecha: ${new Date().toLocaleDateString('es-CO')}`, ''];
  const sep = '\n' + '-'.repeat(40) + '\n';
  const parts = [];
  const doctorParts = doctorCases.filter((c) => state.doctorWork[c.id]?.text).map((c) => {
    const w = state.doctorWork[c.id];
    return `Caso «${c.title}» ${state.doctor.includes(c.id) ? '(terminado)' : '(en curso)'}\nPrompt enfermo: ${c.bad}\nMi versión: ${w.text}\nQué agregué y por qué: ${w.why}`;
  });
  if (doctorParts.length) parts.push(`MISIÓN 1 · RESCATA EL PROMPT\n\n${doctorParts.join('\n\n')}`);
  labMissions.forEach((m) => {
    const entry = state.notebook[m.id];
    if (!entry || !Object.values(entry.fields).some((v) => wc(v))) return;
    parts.push(`${m.title.toUpperCase()}${entry.done ? ' (terminada)' : ' (en curso)'}\n\n${m.fields.map((f) => `${f.label}\n${entry.fields[f.key] || '(vacío)'}`).join('\n\n')}`);
  });
  const writes = challenges.filter((c) => c.type === 'write' && state.writes[c.id]?.text);
  if (writes.length) parts.push(`RETOS DE REDACCIÓN\n\n${writes.map((c) => `${c.q}\n${state.writes[c.id].text}${state.writes[c.id].reflect ? `\nLo que cambié: ${state.writes[c.id].reflect}` : ''}`).join('\n\n')}`);
  if (state.library.length) parts.push(`PROMPTS GUARDADOS\n\n${state.library.map((item, i) => [`Prompt ${i + 1} (${item.date})`, item.text, item.answer && `Respuesta de ChatGPT:\n${item.answer}`, item.improve && `Mi mejora:\n${item.improve}`].filter(Boolean).join('\n')).join('\n\n')}`);
  return lines.join('\n') + (parts.length ? parts.join(sep) : 'Todavía no hay trabajo guardado.');
}
function exportLibrary() { download(notebookText(), 'mi-cuaderno-promptlab.txt'); }
function downloadMission() {
  const m = missionById(state.missionOpen);
  const entry = missionEntry(m.id);
  download(`${m.title}\n${state.name ? `Nombre: ${state.name}\n` : ''}\n${m.fields.map((f) => `${f.label}\n${entry.fields[f.key] || '(vacío)'}`).join('\n\n')}`, `${m.id}-promptlab.txt`);
}
function renderLibrary() {
  const container = $('saved');
  container.replaceChildren();
  const status = labMissions.map((m) => `${m.title.split(' · ')[0]}: ${missionDone(m.id) ? '✅' : missionStarted(m.id) ? '✏️' : '—'}`);
  container.append(el('div', { class: 'card' },
    el('h3', { text: 'Resumen de mi trabajo' }),
    el('p', { text: `Misión 1: ${state.doctor.length} de ${doctorCases.length} casos · ${status.join(' · ')}` }),
    el('p', { class: 'small muted', text: 'Tus misiones y retos de redacción se guardan solos. Descarga todo en un archivo para entregarlo o conservarlo.' }),
    button('Descargar todo mi cuaderno (.txt)', 'exportLibrary()')));
  container.append(el('h3', { text: 'Prompts guardados del Constructor' }));
  if (!state.library.length) { container.append(el('p', { class: 'muted', text: 'Todavía no has guardado prompts del Constructor.' })); return; }
  state.library.forEach((item, index) => {
    const card = el('div', { class: 'card' },
      el('h3', { text: `Prompt ${index + 1} · ${item.date}` }),
      el('div', { class: 'prompt', text: item.text }));
    [['Respuesta de ChatGPT (fragmento)', item.answer], ['Mi mejora', item.improve]].forEach(([label, value]) => {
      if (value) card.append(el('div', { class: 'small muted space-top', text: label }), el('div', { class: 'prompt', text: value }));
    });
    const del = button('Eliminar', '', 'secondary space-top');
    del.removeAttribute('data-action');
    del.addEventListener('click', () => {
      if (!window.confirm('¿Eliminar este prompt de tu biblioteca?')) return;
      state.library.splice(index, 1);
      store(KEYS.library, state.library);
      renderLibrary();
    });
    card.append(del);
    container.append(card);
  });
}

// ================= CERTIFICADOS =================
function renderCertificates() {
  $('studentName').value = state.name;
  $('certList').replaceChildren(...CERTS.map((c) => {
    const st = certStatus(c.id);
    const b = st.ok ? button('Ver mi certificado', `showCert('${c.id}')`) : el('button', { type: 'button', class: 'secondary', disabled: true, text: 'Aún no disponible' });
    return el('div', { class: `card cert-card${st.ok ? ' is-ready' : ''}` },
      el('h3', { text: `${c.icon} ${c.title ? 'Maestro de prompts' : `Nivel ${c.id}`}` }),
      el('p', { text: c.blurb }), el('p', { class: 'small muted', text: c.req }),
      el('p', { class: 'cert-status', text: st.ok ? '✅ ¡Listo! Ya puedes recibirlo.' : `Te falta: ${st.missing.join(' y ')}.` }), b);
  }));
}
const imageCache = {};
function loadImage(src) {
  imageCache[src] ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  return imageCache[src];
}
function star(ctx, cx, cy, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45, angle = -Math.PI / 2 + i * Math.PI / 5;
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
async function drawCertificate(cert, name) {
  const W = 1754, H = 1240;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const navy = '#003e70', gold = '#f2a900', ink = '#172b4d';
  const title = cert.title || cert.id.toUpperCase();
  ctx.fillStyle = '#fffdf7'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = cert.color; ctx.lineWidth = 16; ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = gold; ctx.lineWidth = 4; ctx.strokeRect(74, 74, W - 148, H - 148);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const [logoA, logoB, mascot] = await Promise.all([loadImage('assets/universidad-de-caldas.png'), loadImage('assets/universidad-intergeneracional.png'), loadImage('assets/profe-ia.svg')]);
  const logos = [logoA, logoB].filter(Boolean), lh = 190, gap = 70;
  const widths = logos.map((img) => img.width / img.height * lh);
  let x = (W - (widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, logos.length - 1))) / 2;
  logos.forEach((img, i) => { ctx.drawImage(img, x, 100, widths[i], lh); x += widths[i] + gap; });
  ctx.fillStyle = navy; ctx.font = '700 46px system-ui, Arial, sans-serif';
  ctx.fillText('CERTIFICADO DE PARTICIPACIÓN', W / 2, 365);
  ctx.fillStyle = '#4d5d74'; ctx.font = '30px system-ui, Arial, sans-serif';
  ctx.fillText('Taller PromptLab · Programa Intergeneracional', W / 2, 410);
  ctx.fillStyle = ink; ctx.font = '34px system-ui, Arial, sans-serif';
  ctx.fillText('Se otorga a', W / 2, 520);
  let size = 112;
  do { ctx.font = `italic 700 ${size}px Georgia, "Times New Roman", serif`; size -= 4; } while (ctx.measureText(name).width > 1250 && size > 40);
  ctx.fillStyle = navy; ctx.fillText(name, W / 2, 640);
  ctx.strokeStyle = gold; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(W / 2 - 520, 668); ctx.lineTo(W / 2 + 520, 668); ctx.stroke();
  ctx.fillStyle = ink; ctx.font = '34px system-ui, Arial, sans-serif';
  ctx.fillText(cert.verb, W / 2, 745);
  let tsize = 104;
  do { ctx.font = `800 ${tsize}px system-ui, Arial, sans-serif`; tsize -= 4; } while (ctx.measureText(title).width > 1300 && tsize > 40);
  ctx.fillStyle = cert.color; ctx.fillText(title, W / 2, 855);
  ctx.fillStyle = ink; ctx.font = 'italic 32px system-ui, Arial, sans-serif';
  ctx.fillText(`«${cert.blurb}»`, W / 2, 920);
  ctx.font = '30px system-ui, Arial, sans-serif'; ctx.fillStyle = '#4d5d74';
  ctx.fillText(`Logros: ${cert.line()}`, W / 2, 975);
  ctx.fillText(new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 1040);
  if (mascot) ctx.drawImage(mascot, 185, 885, 170, 170);
  ctx.fillStyle = navy; ctx.font = '600 26px system-ui, Arial, sans-serif';
  ctx.fillText('Profe IA te felicita', 270, 1090);
  const sx = W - 300, sy = 1005, spacing = cert.stars > 3 ? 44 : 52;
  ctx.beginPath(); ctx.arc(sx, sy, 100, 0, Math.PI * 2); ctx.fillStyle = cert.color; ctx.fill();
  ctx.beginPath(); ctx.arc(sx, sy, 86, 0, Math.PI * 2); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
  for (let i = 0; i < cert.stars; i++) star(ctx, sx + (i - (cert.stars - 1) / 2) * spacing, sy - 8, 22, '#ffd54a');
  ctx.fillStyle = '#fff'; ctx.font = '700 20px system-ui, Arial, sans-serif';
  ctx.fillText(cert.id === 'Maestro' ? 'MAESTRO' : cert.id.toUpperCase(), sx, sy + 46);
  ctx.fillStyle = '#4d5d74'; ctx.font = '21px system-ui, Arial, sans-serif';
  ctx.fillText('Reconocimiento de participación en un taller didáctico. No es un título ni un documento oficial de la Universidad de Caldas.', W / 2, H - 98);
  return canvas.toDataURL('image/png');
}
async function showCert(id) {
  const cert = CERTS.find((c) => c.id === id);
  if (!cert || !certStatus(id).ok) return;
  const input = $('studentName');
  const name = input.value.trim();
  if (!name) { toast('Escribe tu nombre arriba para poder generar el certificado.'); input.focus(); return; }
  state.name = name;
  store(KEYS.name, name);
  const url = await drawCertificate(cert, name);
  state.cert = { id, url };
  $('certPreview').replaceChildren(el('img', { src: url, alt: `Certificado «${cert.title ? 'Maestro de prompts' : `nivel ${id}`}» otorgado a ${name}` }));
  $('certPreviewTitle').textContent = `Tu certificado · ${cert.title ? 'Maestro de prompts' : `Nivel ${id}`}`;
  $('certPreviewCard').classList.remove('hidden');
  $('certPreviewCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function downloadCert() {
  if (!state.cert) return;
  const a = document.createElement('a');
  a.href = state.cert.url;
  a.download = `certificado-promptlab-${state.cert.id.toLowerCase()}.png`;
  a.click();
}
function printCert() {
  if (!state.cert) return;
  document.body.classList.add('printing-cert');
  window.addEventListener('afterprint', () => document.body.classList.remove('printing-cert'), { once: true });
  window.print();
}

// ---------- borrar todo ----------
function resetAll() {
  if (!window.confirm('¿Borrar todo tu avance, tus prompts y tu nombre en este equipo? Esto no se puede deshacer.')) return;
  try { Object.values(KEYS).forEach((k) => localStorage.removeItem(k)); } catch { /* sin almacenamiento */ }
  window.location.reload();
}

// ---------- eventos ----------
const actions = {
  show, changeFont, toggleContrast, resetAccessibility, jumpLevel, prev, next, hint, checkAnswer, reviewWrite,
  openCompare, openMission, backToMissions, copyCase, finishMission, compareVersions, downloadMission,
  openDoctor, checkDoctor, finishDoctorCase, showExample, build, copyPrompt, savePrompt, downloadPrompt,
  downloadHomework, exportLibrary, showCert, downloadCert, printCert, resetAll
};
document.addEventListener('click', (event) => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const match = /^([a-zA-Z0-9]+)\((?:'([^']+)'|(-?\d+))?\)$/.exec(control.dataset.action);
  if (!match || !Object.hasOwn(actions, match[1])) return;
  const arg = match[2] ?? (match[3] === undefined ? undefined : Number(match[3]));
  actions[match[1]](arg);
});
$('studentName').addEventListener('input', (e) => { state.name = e.target.value; store(KEYS.name, e.target.value.trim()); });

applyAccessibility();
updateProgress();
show('home', { focus: false });
window.scrollTo(0, 0);
