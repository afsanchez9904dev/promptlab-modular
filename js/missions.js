// Misiones del cuaderno de experimentos.
// - kind 'doctor': la Misión 1 usa los casos de `doctorCases` (challenges.js).
// - kind 'lab': misión con campos de escritura. Se termina cuando cada campo requerido
//   alcanza su mínimo de palabras. La plataforma NO califica el contenido: la persona
//   prueba en ChatGPT y escribe lo que observó.
// - field: { key, label, help?, min (palabras), required (por defecto true), rows? }
// - compare: claves de campos (en orden) cuyas versiones se pueden comparar.

export const missions = [
  {
    id: 'm1', kind: 'doctor', required: true, tag: 'Inicial', time: '15–20 min',
    title: 'Misión 1 · Rescata el prompt',
    summary: 'Recibes cinco prompts mal formulados. Los corriges y explicas qué información agregaste y por qué.'
  },
  {
    id: 'm2', kind: 'lab', required: true, tag: 'Intermedio', time: '20–25 min',
    title: 'Misión 2 · La IA necesita instrucciones',
    summary: 'Organiza una actividad con presupuesto limitado, pruébala en ChatGPT y mejora tu prompt dos veces.',
    intro: [
      'Elige una actividad real o imaginaria: una reunión familiar, una novena en la cuadra, una salida con tus compañeros de clase, una charla en tu comunidad… Debe tener un presupuesto limitado.',
      'Vas a escribir un primer prompt, probarlo en ChatGPT y mejorarlo dos veces. Al final podrás ver, palabra por palabra, qué fue cambiando.'
    ],
    steps: [
      'Escribe tu primer prompt (Versión 1). No tiene que ser perfecto.',
      'Pruébalo en ChatGPT y pega un fragmento de la respuesta.',
      'Cuenta qué mejorarías y escribe la Versión 2. Pruébala.',
      'Repite una vez más con la Versión 3.',
      'Pulsa «Comparar mis versiones» y cuéntanos qué aprendiste.'
    ],
    tips: ['No escribas datos personales (cédula, teléfono, direcciones exactas).', 'En cada versión cambia una o dos cosas, no todo: así se nota qué funcionó.'],
    compare: ['p1', 'p2', 'p3'],
    fields: [
      { key: 'p1', label: 'Versión 1 de mi prompt', help: 'Tu primer intento.', min: 12, rows: 4 },
      { key: 'r1', label: 'Lo que respondió ChatGPT (fragmento)', help: 'Pega solo un pedazo, sin datos personales.', min: 8, rows: 3 },
      { key: 'c1', label: '¿Qué le faltaba a mi prompt y qué voy a cambiar?', min: 8, rows: 3 },
      { key: 'p2', label: 'Versión 2 de mi prompt', min: 15, rows: 4 },
      { key: 'r2', label: 'Lo que respondió ChatGPT esta vez (fragmento)', min: 8, rows: 3 },
      { key: 'c2', label: '¿Qué cambió en la respuesta y qué sigo queriendo mejorar?', min: 8, rows: 3 },
      { key: 'p3', label: 'Versión 3 de mi prompt', min: 15, rows: 4 },
      { key: 'learn', label: '¿Qué aprendí con esta misión?', min: 10, rows: 3 }
    ]
  },
  {
    id: 'm3', kind: 'lab', required: true, tag: 'Intermedio', time: '15–20 min',
    title: 'Misión 3 · Detective de respuestas',
    summary: 'ChatGPT recibe un caso con información incompleta. Descubre qué inventa y cómo reducirlo.',
    intro: ['Lee el caso. Fíjate en todo lo que NO dice. Luego pídele a ChatGPT que lo resuelva y observa qué datos se inventa.'],
    caseText: 'Marta quiere organizar una excursión de un día para su grupo de la iglesia. Dice: «Necesito el plan para ir a un lugar bonito cerca, con almuerzo, que no sea caro y que todos puedan caminar.»\n\nMarta NO dijo: cuántas personas son, qué día es, desde dónde salen, cuánto dinero tienen ni cuánto pueden caminar.',
    steps: [
      'Copia el caso (botón «Copiar el caso») y pégalo en ChatGPT con tu primera instrucción, por ejemplo: «Arma el plan completo de la excursión de Marta».',
      'Pega un fragmento de la respuesta.',
      'Busca qué datos se supuso o inventó la IA (precios, lugares, número de personas…).',
      'Escribe qué información le faltaba de verdad.',
      'Escribe un prompt mejorado que reduzca las invenciones. Pruébalo y compara.'
    ],
    tips: ['Una buena señal: que la IA te haga preguntas en lugar de inventar.', 'Prueba con: «Antes de armar el plan, dime qué datos te faltan y no inventes ninguno».'],
    compare: ['p1', 'p2'],
    fields: [
      { key: 'p1', label: 'Mi primer prompt', min: 6, rows: 3 },
      { key: 'r1', label: 'Fragmento de la respuesta de ChatGPT', min: 8, rows: 3 },
      { key: 'supuestos', label: 'Datos que la IA supuso o inventó', help: 'Por ejemplo: «supuso que éramos 20 personas», «inventó un precio».', min: 8, rows: 3 },
      { key: 'faltaba', label: 'Información que realmente le hacía falta', min: 8, rows: 3 },
      { key: 'p2', label: 'Mi prompt mejorado para reducir las invenciones', min: 20, rows: 4 },
      { key: 'r2', label: 'Fragmento de la nueva respuesta', min: 8, rows: 3 },
      { key: 'diff', label: '¿Qué cambió entre la primera y la segunda respuesta?', min: 8, rows: 3 }
    ]
  },
  {
    id: 'm4', kind: 'lab', required: false, tag: 'Avanzado', time: '20–30 min',
    title: 'Misión 4 · Mi asistente personal',
    summary: 'Diseña un prompt reutilizable para una necesidad tuya y pruébalo con dos casos distintos.',
    intro: [
      'Un prompt reutilizable tiene partes que cambian entre corchetes, como [TEMA] o [PERSONA]. Lo escribes una vez y lo usas muchas veces.',
      'Elige una necesidad tuya: estudiar, organizar gastos, redactar documentos, planear un emprendimiento, aprender una habilidad…'
    ],
    steps: [
      'Describe la necesidad que quieres resolver.',
      'Escribe el prompt reutilizable con al menos un [CORCHETE] que se pueda cambiar.',
      'Pruébalo con un primer caso y con un segundo caso distinto.',
      'Ajústalo y deja tu versión final.'
    ],
    tips: ['Ejemplo: «Actúa como un tutor paciente. Explícame [TEMA] en cinco pasos, con un ejemplo cotidiano y sin palabras técnicas.»', 'Si el prompt solo sirve para un caso, todavía no es reutilizable.'],
    compare: ['p1', 'p2'],
    fields: [
      { key: 'need', label: 'La necesidad que quiero resolver', min: 8, rows: 3 },
      { key: 'p1', label: 'Mi prompt reutilizable (con [CORCHETES] para lo que cambia)', min: 25, rows: 5 },
      { key: 'r1', label: 'Prueba 1: qué respondió ChatGPT con mi primer caso', min: 8, rows: 3 },
      { key: 'r2', label: 'Prueba 2: qué respondió con un caso distinto', min: 8, rows: 3 },
      { key: 'p2', label: 'Mi versión final ajustada', min: 25, rows: 5 },
      { key: 'learn', label: '¿Qué ajusté y por qué?', min: 10, rows: 3 }
    ]
  },
  {
    id: 'm5', kind: 'lab', required: false, tag: 'Reto final', time: '25–35 min',
    title: 'Misión 5 · El desafío del profesor',
    summary: 'Un caso con información contradictoria y varias restricciones. Construye, prueba, detecta errores y justifica.',
    intro: ['Este caso tiene trampas: datos que se contradicen y condiciones que chocan entre sí. Tu misión es que ChatGPT las detecte, en lugar de taparlas.'],
    caseText: 'Debes organizar la novena de aguinaldos de tu cuadra.\n\n1. Participarán 40 personas, pero el salón comunal solo admite 25.\n2. El presupuesto es de $150.000 y quieres ofrecer natilla y buñuelos para todos.\n3. Tu vecina dice que la novena es el lunes; el presidente de la junta dice que el salón solo se presta martes y jueves.\n4. No quieres comprar nada que requiera nevera, pero la natilla se refrigera.\n5. Todo debe quedar listo en una semana.',
    steps: [
      'Escribe tu primer prompt con el caso (Versión 1) y pruébalo.',
      'Revisa la respuesta: ¿detectó las contradicciones o las ignoró? ¿Inventó algo?',
      'Anota los errores que encontraste.',
      'Escribe una versión mejorada que pida detectar los problemas y hacer preguntas, y pruébala.',
      'Justifica cada cambio que hiciste.'
    ],
    tips: ['Cuenta cuántas contradicciones tiene el caso y verifica si la IA las nombró todas.', 'Pide que separe «lo que sí se puede hacer» de «lo que hay que decidir primero».'],
    compare: ['p1', 'p2'],
    fields: [
      { key: 'p1', label: 'Mi prompt (Versión 1)', min: 20, rows: 5 },
      { key: 'r1', label: 'Fragmento de la respuesta de ChatGPT', min: 8, rows: 3 },
      { key: 'errores', label: 'Errores o invenciones que detecté (¿cuántas contradicciones nombró la IA?)', min: 10, rows: 4 },
      { key: 'p2', label: 'Mi prompt mejorado (Versión 2)', min: 25, rows: 5 },
      { key: 'r2', label: 'Fragmento de la nueva respuesta', min: 8, rows: 3 },
      { key: 'justif', label: 'Justifico mis cambios: ¿por qué cada ajuste mejora el resultado?', min: 15, rows: 4 }
    ]
  }
];
