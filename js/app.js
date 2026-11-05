import { challenges, LEVELS, doctorCases, comparisons } from './challenges.js';

// PromptLab funciona sin backend: las preferencias y avances son locales (localStorage).
const KEYS = Object.freeze({
  progress: 'pl2_done', doctor: 'pl2_doctor', library: 'pl2_library', seen: 'pl2_seen',
  unlocked: 'pl2_unlocked', font: 'pl2_font', contrast: 'pl2_contrast', name: 'pl2_name'
});
const SECTIONS = ['home', 'learn', 'compare', 'practice', 'doctor', 'builder', 'library', 'certificates', 'homework'];
const DOCTOR_PASS = 3;          // revisiones aprobadas (de 4) para completar un caso
const DOCTOR_NEEDED = 3;        // casos del Doctor necesarios para el certificado Construyo
const $ = (id) => document.getElementById(id);

// ---------- almacenamiento seguro ----------
function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch { return fallback; }
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
  index: 0, hints: 0, attempts: 0, order: [],
  doctorIndex: 0, doctorDrafts: {}, compareIndex: 0,
  completed: readJSON(KEYS.progress, []).filter((id) => challengeIds.includes(id)),
  doctor: readJSON(KEYS.doctor, []).filter((id) => doctorIds.includes(id)),
  library: readJSON(KEYS.library, []).filter((item) => typeof item?.text === 'string'),
  seen: readJSON(KEYS.seen, []),
  unlocked: readJSON(KEYS.unlocked, []),
  font: Math.max(16, Math.min(28, Number(readText(KEYS.font)) || 19)),
  name: readText(KEYS.name),
  currentPrompt: '', cert: null, current: 'home'
};

// ---------- avisos en pantalla (reemplazan a alert) ----------
let toastTimer;
function toast(message, ms = 4500) {
  const box = $('toast');
  box.textContent = message;
  box.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.add('hidden'), ms);
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

// ---------- progreso y certificados ----------
const levelList = (level) => challenges.filter((c) => c.level === level);
function levelStats(level) {
  const list = levelList(level);
  return { done: list.filter((c) => state.completed.includes(c.id)).length, total: list.length };
}
const libraryReady = () => state.library.some((i) => i.answer?.trim() && i.improve?.trim());
function certStatus(level) {
  const { done, total } = levelStats(level);
  const missing = [];
  if (done < total) missing.push(`${total - done} ${total - done === 1 ? 'reto' : 'retos'} de este nivel`);
  if (level === 'Construyo' && state.doctor.length < DOCTOR_NEEDED) {
    const n = DOCTOR_NEEDED - state.doctor.length;
    missing.push(`${n} ${n === 1 ? 'caso' : 'casos'} del Doctor de prompts`);
  }
  if (level === 'Experimento' && !libraryReady()) missing.push('crear un prompt, probarlo en ChatGPT y guardarlo con tu mejora');
  return { ok: missing.length === 0, done, total, missing };
}
function checkUnlocks() {
  LEVELS.forEach(({ name }) => {
    if (certStatus(name).ok && !state.unlocked.includes(name)) {
      state.unlocked.push(name);
      store(KEYS.unlocked, state.unlocked);
      toast(`🎓 ¡Desbloqueaste el certificado del nivel ${name}! Búscalo en «Certificados».`, 9000);
    }
  });
}
function updateProgress() {
  const total = challenges.length + doctorCases.length;
  const done = state.completed.length + state.doctor.length;
  $('bar').style.width = `${done / total * 100}%`;
  $('barWrap').setAttribute('aria-valuenow', String(Math.round(done / total * 100)));
  $('progressText').textContent = `${done} de ${total} actividades completadas (${challenges.length} retos y ${doctorCases.length} casos del Doctor de prompts)`;
  renderMission();
}
function markSeen(section) {
  if (!state.seen.includes(section)) { state.seen.push(section); store(KEYS.seen, state.seen); }
}

// ---------- navegación ----------
function show(section, { focus = true } = {}) {
  if (!SECTIONS.includes(section)) return;
  state.current = section;
  SECTIONS.forEach((name) => $(name).classList.toggle('hidden', name !== section));
  document.querySelectorAll('nav button').forEach((b) => {
    const on = b.dataset.section === section;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (section === 'learn' || section === 'compare') markSeen(section);
  if (section === 'home') renderMission();
  if (section === 'compare') renderCompare();
  if (section === 'practice') renderChallenge();
  if (section === 'doctor') renderDoctor();
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
    { done: state.doctor.length >= DOCTOR_NEEDED, text: `Doctor de prompts: ${Math.min(state.doctor.length, DOCTOR_NEEDED)} de ${DOCTOR_NEEDED} casos.`, go: ['Ir al Doctor', "show('doctor')"] },
    { done: c.done === c.total, text: `Nivel ✏️ Construyo: ${c.done} de ${c.total} retos.`, go: ['Ir a los retos', "jumpLevel('Construyo')"] },
    { done: libraryReady(), text: 'Crea un prompt, pruébalo en ChatGPT, cuéntanos qué mejoró y guárdalo.', go: ['Crear mi prompt', "show('builder')"] },
    { done: e.done === e.total, text: `Nivel 🚀 Experimento: ${e.done} de ${e.total} retos.`, go: ['Ir a los retos', "jumpLevel('Experimento')"] },
    { done: LEVELS.every((l) => certStatus(l.name).ok), text: 'Escribe tu nombre y descarga tus certificados.', go: ['Ver certificados', "show('certificates')"] }
  ];
  const firstPending = steps.findIndex((s) => !s.done);
  list.replaceChildren(...steps.map((step, i) => {
    const li = document.createElement('li');
    li.className = `mission-step${step.done ? ' is-done' : ''}${i === firstPending ? ' is-current' : ''}`;
    const mark = document.createElement('span');
    mark.className = 'mission-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = step.done ? '✅' : String(i + 1);
    const text = document.createElement('span');
    text.className = 'mission-text';
    text.textContent = step.text;
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = step.done ? ' (completado)' : i === firstPending ? ' (siguiente paso)' : '';
    text.append(sr);
    li.append(mark, text);
    if (!step.done) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = i === firstPending ? '' : 'secondary';
      btn.textContent = step.go[0];
      btn.dataset.action = step.go[1];
      li.append(btn);
    }
    return li;
  }));
}

// ---------- antes y después ----------
function renderRichText(container, text) {
  text.split('\n\n').forEach((para) => {
    const lines = para.split('\n');
    if (lines.length > 1 && lines.every((l) => l.includes(' | '))) {
      const table = document.createElement('table');
      lines.forEach((l, i) => {
        const tr = document.createElement('tr');
        l.split(' | ').forEach((cell) => {
          const td = document.createElement(i === 0 ? 'th' : 'td');
          td.textContent = cell;
          tr.append(td);
        });
        table.append(tr);
      });
      container.append(table);
    } else {
      const p = document.createElement('p');
      p.className = 'rich';
      p.textContent = para;
      container.append(p);
    }
  });
}
function renderCompare() {
  const tabs = $('compareTabs');
  tabs.replaceChildren(...comparisons.map((item, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = i === state.compareIndex ? '' : 'secondary';
    b.textContent = `${i + 1}. ${item.title}`;
    b.dataset.action = `openCompare(${i})`;
    if (i === state.compareIndex) b.setAttribute('aria-pressed', 'true');
    return b;
  }));
  const item = comparisons[state.compareIndex];
  const column = (cls, title, prompt, answer) => {
    const card = document.createElement('div');
    card.className = `card compare-${cls}`;
    const h = document.createElement('h3'); h.textContent = title;
    const l1 = document.createElement('div'); l1.className = 'small muted'; l1.textContent = 'Lo que escribes:';
    const p = document.createElement('div'); p.className = 'prompt'; p.textContent = prompt;
    const l2 = document.createElement('div'); l2.className = 'small muted space-top'; l2.textContent = 'Lo que responde:';
    const a = document.createElement('div'); a.className = 'answer'; renderRichText(a, answer);
    card.append(h, l1, p, l2, a);
    return card;
  };
  const grid = document.createElement('div');
  grid.className = 'compare-grid';
  grid.append(
    column('bad', '😕 Prompt vago', item.vague, item.vagueAnswer),
    column('good', '😊 Prompt mejorado', item.good, item.goodAnswer)
  );
  const lesson = document.createElement('div');
  lesson.className = 'card lesson-card';
  const strong = document.createElement('strong');
  strong.textContent = '💡 Lo que aprendemos: ';
  lesson.append(strong, document.createTextNode(item.lesson));
  const tools = document.createElement('div');
  tools.className = 'tools space-top';
  [['Ahora practico yo: Doctor de prompts', "show('doctor')", ''], ['Ir a los retos', "show('practice')", 'secondary']].forEach(([label, action, cls]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.textContent = label; b.dataset.action = action;
    tools.append(b);
  });
  lesson.append(tools);
  $('compareBody').replaceChildren(grid, lesson);
}
function openCompare(i) { state.compareIndex = Number(i) || 0; renderCompare(); }

// ---------- retos ----------
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function renderLevelButtons() {
  const wrap = $('levelButtons');
  wrap.replaceChildren(...LEVELS.map(({ name, icon }) => {
    const { done, total } = levelStats(name);
    const b = document.createElement('button');
    b.type = 'button';
    const active = challenges[state.index].level === name;
    b.className = active ? '' : 'secondary';
    b.textContent = `${icon} ${name} · ${done}/${total}`;
    b.dataset.action = `jumpLevel('${name}')`;
    if (active) b.setAttribute('aria-pressed', 'true');
    return b;
  }));
}
function renderChallenge() {
  state.hints = 0;
  state.attempts = 0;
  const challenge = challenges[state.index];
  const inLevel = levelList(challenge.level);
  const wrapper = document.createElement('div');
  wrapper.className = 'card';
  const tag = document.createElement('span');
  tag.className = 'pill';
  tag.textContent = `${challenge.level} · Reto ${inLevel.indexOf(challenge) + 1} de ${inLevel.length}${state.completed.includes(challenge.id) ? ' · ✅ resuelto' : ''}`;
  const heading = document.createElement('h3');
  heading.textContent = challenge.q;
  wrapper.append(tag, heading);
  if (challenge.ctx) {
    const quote = document.createElement('blockquote');
    quote.className = 'ctx';
    quote.textContent = challenge.ctx;
    wrapper.append(quote);
  }
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'answer-options';
  const legend = document.createElement('legend');
  legend.className = 'small muted';
  legend.textContent = 'Selecciona una respuesta';
  fieldset.append(legend);
  state.order = shuffle(challenge.options.map((_, i) => i));
  state.order.forEach((originalIndex) => {
    const label = document.createElement('label');
    label.className = 'choice';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(originalIndex);
    input.addEventListener('change', () => {
      fieldset.querySelectorAll('.choice').forEach((item) => item.classList.remove('choice-correct', 'choice-incorrect'));
      $('feedback')?.replaceChildren();
    });
    label.append(input, document.createTextNode(challenge.options[originalIndex]));
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
  const feedbackBox = document.createElement('div');
  feedbackBox.id = 'feedback';
  feedbackBox.setAttribute('aria-live', 'polite');
  wrapper.append(fieldset, controls, feedbackBox);
  $('challenge').replaceChildren(wrapper);
  renderLevelButtons();
}
function feedback(message, type = 'info', target = 'feedback') {
  const box = document.createElement('div');
  box.className = `feedback feedback--${type}`;
  const symbols = { success: '✅', retry: '💡', hint: '🔎', info: '🤖' };
  const titles = { success: '¡Muy bien!', retry: 'Vamos a mejorar', hint: 'Una pista para ti', info: 'Te acompaño' };
  const title = document.createElement('strong');
  title.textContent = `${symbols[type]} Profe IA · ${titles[type]}`;
  const detail = document.createElement('p');
  detail.textContent = message;
  box.append(title, detail);
  $(target).replaceChildren(box);
}
function hint() {
  state.hints++;
  const challenge = challenges[state.index];
  let message;
  if (state.hints === 1) message = challenge.hint;
  else {
    const wrongIndex = challenge.options.findIndex((_, i) => i !== challenge.correct);
    message = state.hints === 2
      ? `Segunda pista: descarta esta opción, no es la correcta: «${challenge.options[wrongIndex]}».`
      : 'Ya no tengo más pistas. Lee con calma las opciones y elige la que mejor explique qué quieres y para qué.';
  }
  feedback(message, 'hint');
}
function checkAnswer() {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) {
    feedback('Selecciona una opción antes de comprobar. Puedes pedir una pista si lo necesitas.', 'hint');
    return;
  }
  const challenge = challenges[state.index];
  const answerIndex = Number(selected.value);
  const isCorrect = answerIndex === challenge.correct;
  document.querySelectorAll('.choice').forEach((label) => label.classList.remove('choice-correct', 'choice-incorrect'));
  selected.closest('.choice').classList.add(isCorrect ? 'choice-correct' : 'choice-incorrect');
  if (!isCorrect) {
    state.attempts++;
    const explanation = challenge.wrong?.[answerIndex] || `La opción «${challenge.options[answerIndex]}» no resuelve lo que pide el ejercicio.`;
    feedback(`${explanation} ${state.attempts > 1 ? 'Puedes pedir una pista y volver a intentarlo.' : challenge.hint}`, 'retry');
    return;
  }
  let extra = '';
  if (!state.completed.includes(challenge.id)) {
    state.completed.push(challenge.id);
    store(KEYS.progress, state.completed);
    const { done, total } = levelStats(challenge.level);
    if (done === total && !certStatus(challenge.level).ok) extra = ` Terminaste los retos de ${challenge.level}. Para el certificado te falta: ${certStatus(challenge.level).missing.join(' y ')}.`;
    renderLevelButtons();
    updateProgress();
    checkUnlocks();
  }
  feedback(`${challenge.explain}${extra} ¡Puedes continuar cuando quieras!`, 'success');
}
function jumpLevel(level) {
  const list = levelList(level);
  if (!list.length) return;
  const target = list.find((c) => !state.completed.includes(c.id)) || list[0];
  state.index = challenges.indexOf(target);
  show('practice');
}
function next() { state.index = (state.index + 1) % challenges.length; renderChallenge(); }
function prev() { state.index = (state.index + challenges.length - 1) % challenges.length; renderChallenge(); }

// ---------- Doctor de prompts ----------
function renderDoctor() {
  const tabs = $('doctorTabs');
  tabs.replaceChildren(...doctorCases.map((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = i === state.doctorIndex ? '' : 'secondary';
    b.textContent = `${state.doctor.includes(c.id) ? '✅ ' : ''}${i + 1}. ${c.title}`;
    b.dataset.action = `openDoctor(${i})`;
    if (i === state.doctorIndex) b.setAttribute('aria-pressed', 'true');
    return b;
  }));
  const c = doctorCases[state.doctorIndex];
  const body = $('doctorBody');
  const pill = document.createElement('span');
  pill.className = 'pill';
  pill.textContent = `Caso ${state.doctorIndex + 1} de ${doctorCases.length}${state.doctor.includes(c.id) ? ' · ✅ completo' : ''}`;
  const h = document.createElement('h3'); h.textContent = c.title;
  const scenario = document.createElement('p');
  const sStrong = document.createElement('strong'); sStrong.textContent = 'Situación: ';
  scenario.append(sStrong, document.createTextNode(c.scenario));
  const badLabel = document.createElement('div'); badLabel.className = 'small muted'; badLabel.textContent = 'Prompt enfermo 🤒';
  const bad = document.createElement('div'); bad.className = 'prompt'; bad.textContent = c.bad;
  const label = document.createElement('label'); label.setAttribute('for', 'doctorInput'); label.textContent = 'Escribe tu versión mejorada con tus propias palabras';
  const area = document.createElement('textarea');
  area.id = 'doctorInput';
  area.value = state.doctorDrafts[c.id] || '';
  area.placeholder = 'Escribe aquí tu prompt…';
  area.addEventListener('input', () => { state.doctorDrafts[c.id] = area.value; });
  const tools = document.createElement('div');
  tools.className = 'tools space-top';
  [['Revisar mi prompt', 'checkDoctor()', ''], ['Ver un ejemplo', 'showExample()', 'secondary']].forEach(([name, action, cls]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.textContent = name; b.dataset.action = action;
    tools.append(b);
  });
  const out = document.createElement('div'); out.id = 'doctorResult'; out.setAttribute('aria-live', 'polite');
  body.replaceChildren(pill, h, scenario, badLabel, bad, label, area, tools, out);
}
function openDoctor(i) { state.doctorIndex = Number(i) || 0; renderDoctor(); }
function checkDoctor() {
  const c = doctorCases[state.doctorIndex];
  const text = ($('doctorInput').value || '').trim();
  const out = $('doctorResult');
  if (text.split(/\s+/).filter(Boolean).length < 8) {
    out.replaceChildren();
    feedback('Escribe una versión más completa (al menos una frase de unas 8 palabras) y luego la reviso.', 'hint', 'doctorResult');
    return;
  }
  const lower = text.toLowerCase();
  const results = c.checks.map((check) => ({ ...check, ok: check.test(lower) }));
  const score = results.filter((r) => r.ok).length;
  const list = document.createElement('ul');
  list.className = 'checklist';
  results.forEach((r) => {
    const li = document.createElement('li');
    li.className = r.ok ? 'ok' : 'miss';
    const strong = document.createElement('strong');
    strong.textContent = `${r.ok ? '✅' : '💡'} ${r.label}`;
    li.append(strong);
    if (!r.ok) li.append(document.createElement('br'), document.createTextNode(r.tip));
    list.append(li);
  });
  let type, message;
  if (score === c.checks.length) { type = 'success'; message = '¡Prompt sano! Cumple las 4 revisiones.'; }
  else if (score >= DOCTOR_PASS) { type = 'success'; message = `Muy bien: ${score} de ${c.checks.length}. Aprobado. Si quieres, agrega lo que falta y revísalo otra vez.`; }
  else { type = 'retry'; message = `Llevas ${score} de ${c.checks.length}. Agrega lo que falta y vuelve a revisar: necesitas ${DOCTOR_PASS}.`; }
  feedback(message, type, 'doctorResult');
  const note = document.createElement('p');
  note.className = 'small muted';
  note.textContent = 'El doctor busca palabras clave. Si tu prompt te parece bueno y no se marca algo, pruébalo en ChatGPT: tu criterio también cuenta.';
  $('doctorResult').append(list, note);
  if (score >= DOCTOR_PASS && !state.doctor.includes(c.id)) {
    state.doctor.push(c.id);
    store(KEYS.doctor, state.doctor);
    updateProgress();
    checkUnlocks();
    const tab = $('doctorTabs').children[state.doctorIndex];
    if (tab && !tab.textContent.startsWith('✅')) tab.textContent = `✅ ${tab.textContent}`;
  }
}
function showExample() {
  const c = doctorCases[state.doctorIndex];
  const out = $('doctorResult');
  const box = document.createElement('div');
  box.className = 'card example';
  const t = document.createElement('strong'); t.textContent = '✨ Un ejemplo de prompt sano';
  const p = document.createElement('div'); p.className = 'prompt'; p.textContent = c.example;
  const n = document.createElement('p'); n.className = 'small muted'; n.textContent = 'No lo copies tal cual: escribe el tuyo con tus palabras y con tus propios datos.';
  box.append(t, p, n);
  out.replaceChildren(box);
}

// ---------- constructor ----------
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
    date: new Date().toLocaleDateString('es-CO'),
    text: state.currentPrompt,
    answer: $('answerText').value.trim(),
    improve: $('improveText').value.trim()
  });
  store(KEYS.library, state.library);
  toast(libraryReady() ? '✅ Guardado en Mis prompts.' : '✅ Guardado. Para el certificado Experimento, también pega la respuesta y cuenta qué mejoraste.', 7000);
  $('answerText').value = '';
  $('improveText').value = '';
  updateProgress();
  checkUnlocks();
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
  download('PROMPTLAB INTERGENERACIONAL — MISIÓN EN CASA\n\n1. Termina los tres niveles de Retos.\n2. Completa los cinco casos del Doctor de prompts.\n3. Crea un prompt propio y pruébalo en ChatGPT.\n4. Pide una mejora, cuenta qué cambió y guárdalo.\n5. Descarga tu biblioteca y tus certificados.\n\nNo compartas información privada.', 'practica-en-casa.txt');
}
function exportLibrary() {
  const content = state.library.map((item, i) => [
    `PROMPT ${i + 1} (${item.date})`, item.text,
    item.answer && `RESPUESTA DE CHATGPT (fragmento):\n${item.answer}`,
    item.improve && `MI MEJORA:\n${item.improve}`
  ].filter(Boolean).join('\n\n')).join('\n\n----------------\n\n');
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
    card.append(heading, body);
    [['Respuesta de ChatGPT (fragmento)', item.answer], ['Mi mejora', item.improve]].forEach(([label, value]) => {
      if (!value) return;
      const l = document.createElement('div'); l.className = 'small muted space-top'; l.textContent = label;
      const v = document.createElement('div'); v.className = 'prompt'; v.textContent = value;
      card.append(l, v);
    });
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary space-top';
    button.textContent = 'Eliminar';
    button.addEventListener('click', () => {
      if (!window.confirm('¿Eliminar este prompt de tu biblioteca?')) return;
      state.library.splice(index, 1);
      store(KEYS.library, state.library);
      renderLibrary();
      updateProgress();
    });
    card.append(button);
    container.append(card);
  });
}

// ---------- certificados ----------
const CERT = {
  Descubro:    { color: '#1f7a4a', stars: 1, line: () => `${levelStats('Descubro').total} retos superados` },
  Construyo:   { color: '#245fa8', stars: 2, line: () => `${levelStats('Construyo').total} retos y ${state.doctor.length} casos del Doctor de prompts` },
  Experimento: { color: '#7a3b9e', stars: 3, line: () => `${levelStats('Experimento').total} retos y un prompt propio probado y mejorado` }
};
const REQUIREMENTS = {
  Descubro: 'Completa todos los retos del nivel.',
  Construyo: `Completa los retos del nivel y ${DOCTOR_NEEDED} casos del Doctor de prompts.`,
  Experimento: 'Completa los retos del nivel y guarda un prompt probado en ChatGPT, con tu mejora.'
};
function renderCertificates() {
  $('studentName').value = state.name;
  $('certList').replaceChildren(...LEVELS.map(({ name, icon, blurb }) => {
    const st = certStatus(name);
    const card = document.createElement('div');
    card.className = `card cert-card${st.ok ? ' is-ready' : ''}`;
    const h = document.createElement('h3'); h.textContent = `${icon} Nivel ${name}`;
    const p = document.createElement('p'); p.textContent = blurb;
    const req = document.createElement('p'); req.className = 'small muted'; req.textContent = REQUIREMENTS[name];
    const status = document.createElement('p');
    status.className = 'cert-status';
    status.textContent = st.ok ? '✅ ¡Listo! Ya puedes recibirlo.' : `Te falta: ${st.missing.join(' y ')}.`;
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = st.ok ? 'Ver mi certificado' : 'Aún no disponible';
    if (st.ok) b.dataset.action = `showCert('${name}')`; else { b.disabled = true; b.className = 'secondary'; }
    card.append(h, p, req, status, b);
    return card;
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
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
async function drawCertificate(level, name) {
  const W = 1754, H = 1240, cfg = CERT[level], info = LEVELS.find((l) => l.name === level);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const navy = '#003e70', gold = '#f2a900', ink = '#172b4d';
  ctx.fillStyle = '#fffdf7'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = cfg.color; ctx.lineWidth = 16; ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = gold; ctx.lineWidth = 4; ctx.strokeRect(74, 74, W - 148, H - 148);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

  const [logoA, logoB, mascot] = await Promise.all([
    loadImage('assets/universidad-de-caldas.png'), loadImage('assets/universidad-intergeneracional.png'), loadImage('assets/profe-ia.svg')
  ]);
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
  ctx.fillText('por completar con éxito el nivel', W / 2, 745);
  ctx.fillStyle = cfg.color; ctx.font = '800 104px system-ui, Arial, sans-serif';
  ctx.fillText(level.toUpperCase(), W / 2, 855);
  ctx.fillStyle = ink; ctx.font = 'italic 32px system-ui, Arial, sans-serif';
  ctx.fillText(`«${info.blurb}»`, W / 2, 920);
  ctx.font = '30px system-ui, Arial, sans-serif'; ctx.fillStyle = '#4d5d74';
  ctx.fillText(`Logros: ${cfg.line()}`, W / 2, 975);
  ctx.fillText(new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 1040);

  if (mascot) ctx.drawImage(mascot, 175, 850, 190, 190);
  ctx.fillStyle = navy; ctx.font = '600 26px system-ui, Arial, sans-serif';
  ctx.fillText('Profe IA te felicita', 270, 1075);

  const sx = W - 300, sy = 1005;
  ctx.beginPath(); ctx.arc(sx, sy, 100, 0, Math.PI * 2); ctx.fillStyle = cfg.color; ctx.fill();
  ctx.beginPath(); ctx.arc(sx, sy, 86, 0, Math.PI * 2); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
  for (let i = 0; i < cfg.stars; i++) star(ctx, sx + (i - (cfg.stars - 1) / 2) * 52, sy - 8, 24, '#ffd54a');
  ctx.fillStyle = '#fff'; ctx.font = '700 22px system-ui, Arial, sans-serif';
  ctx.fillText(level.toUpperCase(), sx, sy + 46);

  ctx.fillStyle = '#4d5d74'; ctx.font = '21px system-ui, Arial, sans-serif';
  ctx.fillText('Reconocimiento de participación en un taller didáctico. No es un título ni un documento oficial de la Universidad de Caldas.', W / 2, H - 98);
  return canvas.toDataURL('image/png');
}
async function showCert(level) {
  if (!certStatus(level).ok) return;
  const input = $('studentName');
  const name = input.value.trim();
  if (!name) {
    toast('Escribe tu nombre arriba para poder generar el certificado.');
    input.focus();
    return;
  }
  state.name = name;
  store(KEYS.name, name);
  const url = await drawCertificate(level, name);
  state.cert = { level, url };
  const img = document.createElement('img');
  img.src = url;
  img.alt = `Certificado del nivel ${level} otorgado a ${name}`;
  $('certPreview').replaceChildren(img);
  $('certPreviewTitle').textContent = `Tu certificado · Nivel ${level}`;
  $('certPreviewCard').classList.remove('hidden');
  $('certPreviewCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function downloadCert() {
  if (!state.cert) return;
  const a = document.createElement('a');
  a.href = state.cert.url;
  a.download = `certificado-promptlab-${state.cert.level.toLowerCase()}.png`;
  a.click();
}
function printCert() {
  if (!state.cert) return;
  document.body.classList.add('printing-cert');
  const cleanup = () => document.body.classList.remove('printing-cert');
  window.addEventListener('afterprint', cleanup, { once: true });
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
  show, changeFont, toggleContrast, resetAccessibility, jumpLevel, prev, next, hint, checkAnswer,
  openCompare, openDoctor, checkDoctor, showExample, build, copyPrompt, savePrompt, downloadPrompt,
  downloadHomework, exportLibrary, showCert, downloadCert, printCert, resetAll
};
document.addEventListener('click', (event) => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const match = /^([a-zA-Z]+)\((?:'([^']+)'|(-?\d+))?\)$/.exec(control.dataset.action);
  if (!match || !Object.hasOwn(actions, match[1])) return;
  const arg = match[2] ?? (match[3] === undefined ? undefined : Number(match[3]));
  actions[match[1]](arg);
});
$('studentName').addEventListener('input', (e) => { state.name = e.target.value; store(KEYS.name, e.target.value.trim()); });

applyAccessibility();
updateProgress();
show('home', { focus: false });
window.scrollTo(0, 0);
