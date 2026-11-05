// Contenido pedagógico editable.
// Cada reto: id estable (se guarda el progreso por id), level, q, ctx (texto opcional que se muestra citado),
// options, correct (posición en options), hint, explain y wrong (explicación por cada opción incorrecta).
// Las opciones se barajan al mostrarse, así que el orden aquí no importa.

export const LEVELS = [
  { name: 'Descubro', icon: '🌱', blurb: 'Entiendo qué es un prompt y cómo cuidarme al usarlo.' },
  { name: 'Construyo', icon: '✏️', blurb: 'Armo prompts claros y mejoro las respuestas.' },
  { name: 'Experimento', icon: '🚀', blurb: 'Uso la IA con criterio: verifico, comparo y pruebo.' }
];

export const challenges = [
  // ---------- DESCUBRO (5) ----------
  {
    id: 'd1', level: 'Descubro',
    q: '«Hazme una carta». ¿Qué información sería más útil agregar?',
    options: ['Muchos emojis', 'A quién va dirigida y qué se solicita', 'Palabras complicadas'],
    correct: 1,
    hint: 'Piensa en lo que preguntarías si alguien te pidiera escribirle una carta.',
    explain: '¡Exacto! El destinatario y el propósito ayudan a obtener una carta útil.',
    wrong: ['Los emojis pueden decorar una carta, pero no explican para quién es ni qué necesitas.', null, 'Las palabras difíciles no reemplazan los datos que necesita una carta.']
  },
  {
    id: 'd2', level: 'Descubro',
    q: '¿Cuál de estas instrucciones es más clara?',
    options: ['Dame ideas', 'Dame tres ideas económicas para una actividad familiar en casa', 'Haz algo bonito'],
    correct: 1,
    hint: 'Busca la opción que explica qué quiere y cuántas ideas necesita.',
    explain: '¡Bien! La cantidad y el contexto hacen más concreta la petición.',
    wrong: ['«Dame ideas» no explica para qué actividad ni cuántas necesitas.', null, '«Algo bonito» es muy abierto: la IA tendría que adivinar tu objetivo.']
  },
  {
    id: 'd3', level: 'Descubro',
    q: 'Quieres aprender a usar el celular. ¿Cuál es el mejor prompt?',
    options: ['Celular', 'Explícame en pasos sencillos cómo enviar una foto por WhatsApp desde mi celular', 'Dime cualquier cosa'],
    correct: 1,
    hint: 'Elige la frase que diga qué quieres aprender.',
    explain: '¡Bien! Explicar la tarea permite recibir instrucciones útiles.',
    wrong: ['Una sola palabra no describe lo que quieres aprender.', null, '«Cualquier cosa» no indica una tarea concreta.']
  },
  {
    id: 'd4', level: 'Descubro',
    q: '¿Qué debes hacer si una palabra de ChatGPT no se entiende?',
    options: ['Pedir que la explique con palabras sencillas', 'Dejar de usar la herramienta', 'Suponer lo que significa'],
    correct: 0,
    hint: 'Recuerda que puedes pedir explicaciones más fáciles.',
    explain: '¡Exacto! Puedes pedir aclaraciones cuantas veces quieras.',
    wrong: [null, 'Puedes pedir aclaraciones sin abandonar la herramienta.', 'Adivinar el significado puede llevarte a un error.']
  },
  {
    id: 'd5', level: 'Descubro',
    q: '¿Cuál de estos datos NO deberías escribir en un prompt?',
    options: ['El tema que quieres aprender', 'Tu número de cédula y la clave de tu banco', 'Cuántas personas van a comer'],
    correct: 1,
    hint: 'Piensa en los datos que, si alguien los viera, podrían usarse para hacerte daño.',
    explain: '¡Muy bien! Nunca escribas cédulas, claves, números de tarjeta ni datos médicos o de otras personas. Puedes describir tu situación sin esos datos.',
    wrong: ['Un tema de estudio no es un dato privado: puedes escribirlo sin problema.', null, 'Cuántas personas comen es un dato general y ayuda a que la receta sea útil.']
  },

  // ---------- CONSTRUYO (4) ----------
  {
    id: 'c1', level: 'Construyo',
    q: '¿Qué instrucción ayuda a obtener una respuesta fácil de seguir?',
    options: ['Escribe lo que quieras', 'Explícalo en cinco pasos sencillos', 'No me expliques nada'],
    correct: 1,
    hint: '¿Cuál especifica cómo presentar la información?',
    explain: '¡Correcto! Pedir pasos es una manera de definir el formato.',
    wrong: ['Dejar el formato abierto puede dar una explicación difícil de seguir.', null, 'Si no pides explicación, no podrás aprender el procedimiento.']
  },
  {
    id: 'c2', level: 'Construyo',
    q: 'ChatGPT dio una respuesta muy extensa. ¿Qué haces?',
    options: ['Abandono la conversación', 'Le pido que la resuma en un párrafo sencillo', 'Copio todo sin leer'],
    correct: 1,
    hint: 'Puedes seguir conversando y ajustar la respuesta.',
    explain: '¡Muy bien! Refinar una respuesta es parte de aprender a usar IA.',
    wrong: ['No necesitas abandonar: puedes pedir una versión más corta.', null, 'Copiar sin leer no garantiza que hayas entendido la respuesta.']
  },
  {
    id: 'c3', level: 'Construyo',
    q: 'Quieres ideas para una comida económica. ¿Qué dato ayuda más?',
    options: ['Tu color favorito', 'Tu presupuesto y los ingredientes disponibles', 'Una frase sin contexto'],
    correct: 1,
    hint: 'Piensa en los datos que cambiarían la receta.',
    explain: '¡Muy bien! El presupuesto y los ingredientes hacen la respuesta más práctica.',
    wrong: ['El color favorito no suele ayudar a planear una comida económica.', null, 'Sin datos concretos, la recomendación podría no ajustarse a tu situación.']
  },
  {
    id: 'c4', level: 'Construyo',
    q: 'Necesitas comparar dos opciones. ¿Qué formato conviene pedir?',
    options: ['Una tabla con ventajas y desventajas', 'Una respuesta sin orden', 'Solo una palabra'],
    correct: 0,
    hint: 'Busca un formato que facilite ver diferencias.',
    explain: '¡Excelente! Una tabla ayuda a comparar.',
    wrong: [null, 'Sin orden, comparar las opciones será más difícil.', 'Una palabra no permite ver ventajas y desventajas.']
  },

  // ---------- EXPERIMENTO (5) ----------
  {
    id: 'e1', level: 'Experimento',
    q: 'La IA te da una fecha importante sin fuente. ¿Qué haces?',
    options: ['La compartes sin comprobar', 'Solicitas una fuente y verificas en un sitio confiable', 'Asumes que siempre acierta'],
    correct: 1,
    hint: 'La IA también puede equivocarse.',
    explain: '¡Correcto! Siempre verifica información importante.',
    wrong: ['Compartir una fecha sin verificar puede difundir un error.', null, 'La IA puede equivocarse incluso cuando responde con seguridad.']
  },
  {
    id: 'e2', level: 'Experimento',
    q: '¿Qué técnica sirve para obtener un estilo parecido a un ejemplo?',
    options: ['Compartir un ejemplo del estilo deseado', 'Repetir muchas veces «hazlo bien»', 'No explicar el resultado esperado'],
    correct: 0,
    hint: 'Puedes mostrarle a la IA cómo quieres que sea la respuesta.',
    explain: '¡Muy bien! Los ejemplos ayudan a orientar el formato y el estilo.',
    wrong: [null, 'Decir «hazlo bien» no explica qué estilo deseas.', 'Sin ejemplos, el resultado puede no parecerse a lo que esperas.']
  },
  {
    id: 'e3', level: 'Experimento',
    q: 'Necesitas un presupuesto pero no conoces todos los costos. ¿Qué prompt es más responsable?',
    options: ['Inventa los precios como si fueran reales', 'Separa costos conocidos de estimaciones y explica qué falta verificar', 'Asegura que todo es exacto'],
    correct: 1,
    hint: 'Una respuesta útil también reconoce sus límites.',
    explain: '¡Exacto! Es importante distinguir los datos confirmados de las estimaciones.',
    wrong: ['Inventar precios como si fueran reales puede producir un presupuesto engañoso.', null, 'Afirmar que todo es exacto sin comprobarlo es poco responsable.']
  },
  {
    id: 'e4', level: 'Experimento',
    q: 'Quieres que ChatGPT te ayude a organizar un evento, pero faltan datos. ¿Qué conviene pedir?',
    options: ['Que adivine la fecha', 'Que primero te haga preguntas necesarias', 'Que no te permita responder'],
    correct: 1,
    hint: 'No tienes que dar toda la información en un solo mensaje.',
    explain: '¡Excelente! Pedir preguntas de aclaración mejora el trabajo conjunto.',
    wrong: ['Adivinar una fecha puede generar un plan equivocado.', null, 'Responder preguntas de aclaración ayuda a obtener un plan útil.']
  },
  {
    id: 'e5', level: 'Experimento',
    q: 'Esta respuesta de una IA tiene un error. ¿Qué parte conviene verificar?',
    ctx: 'Pregunta: ¿Quién escribió «Cien años de soledad»?\nRespuesta de la IA: «Fue escrita por Gabriel García Márquez en 1975 y ese mismo año ganó el Premio Nobel de Literatura.»',
    options: ['El nombre del autor', 'Las fechas: el año de publicación y el del Nobel', 'Nada: la IA nunca se equivoca en literatura'],
    correct: 1,
    hint: 'La IA acierta en lo general, pero suele fallar en fechas y cifras concretas.',
    explain: '¡Muy bien! El autor es correcto, pero la novela se publicó en 1967 y el Nobel fue en 1982. Las fechas y cifras son lo primero que hay que comprobar.',
    wrong: ['El autor sí es correcto; el error está en otro dato.', null, 'La IA puede equivocarse incluso en temas muy conocidos, sobre todo en fechas y cifras.']
  }
];

// ---------- DOCTOR DE PROMPTS ----------
// Cada caso tiene 4 revisiones. "test" recibe el texto en minúsculas y devuelve true si cumple.
const has = (re) => (t) => re.test(t);
const hasNone = (re) => (t) => !re.test(t);

export const doctorCases = [
  {
    id: 'p1',
    title: 'La receta',
    scenario: 'Vives con tu pareja, tienes poco tiempo y en la nevera hay arroz, huevos y tomate.',
    bad: 'Dame una receta.',
    checks: [
      { label: 'Dice qué ingredientes tienes', tip: 'Cuéntale qué hay en tu cocina (arroz, huevos, tomate…).', test: has(/arroz|huevo|tomate|ingrediente|nevera/) },
      { label: 'Dice para cuántas personas', tip: 'Indica para cuántas personas es la comida.', test: has(/\b(\d+|dos|tres|cuatro|cinco|seis)\b|personas|porciones|pareja/) },
      { label: 'Pone un límite de tiempo o de costo', tip: 'Agrega cuánto tiempo tienes o qué tan económica debe ser.', test: has(/minuto|hora|rápid|económic|barat|presupuesto/) },
      { label: 'Pide un formato claro', tip: 'Pide los pasos numerados, con palabras sencillas.', test: has(/paso|lista|numerad|sencill|fácil|viñeta|tabla/) }
    ],
    example: 'Sugiéreme una cena para dos personas con arroz, huevos y tomate, lista en 20 minutos. Explícame los pasos numerados con palabras sencillas.'
  },
  {
    id: 'p2',
    title: 'El mensaje de WhatsApp',
    scenario: 'Tu nieta Camila cumple 15 años el sábado y quieres invitarla a almorzar el domingo.',
    bad: 'Escríbeme un mensaje.',
    checks: [
      { label: 'Dice para quién es el mensaje', tip: 'Di quién va a recibir el mensaje (tu nieta, un amigo, el médico…).', test: has(/nieta|nieto|hij[oa]|amig[oa]|vecin[oa]|familia|abuel[oa]|camila|para (mi|un|una)/) },
      { label: 'Dice para qué es', tip: 'Explica el propósito: felicitar, invitar, agradecer, recordar…', test: has(/felicit|invit|agradec|recordar|cumplea|almuerzo|almorzar|disculp|avis/) },
      { label: 'Indica el tono', tip: 'Pide un tono: cariñoso, formal, alegre, respetuoso…', test: has(/cariñ|formal|respetuos|amable|alegre|tono|afectuos|cálid/) },
      { label: 'Limita la extensión', tip: 'Pide que sea corto: por ejemplo, máximo cuatro líneas.', test: has(/corto|breve|líneas|renglones|palabras|máximo|sencillo/) }
    ],
    example: 'Escribe un mensaje de WhatsApp para mi nieta Camila, que cumple 15 años el sábado. Quiero felicitarla e invitarla a almorzar el domingo. Tono cariñoso, máximo cuatro líneas.'
  },
  {
    id: 'p3',
    title: 'El resultado de un examen',
    scenario: 'Te entregaron un resultado de laboratorio con palabras que no entiendes. Quieres una explicación, sin dar tus datos personales.',
    bad: 'Explícame mi examen.',
    checks: [
      { label: 'Pide palabras sencillas', tip: 'Pide que lo explique con palabras sencillas, como a alguien sin estudios médicos.', test: has(/sencill|simple|fácil|claro|no soy médic|sin tecnicismos/) },
      { label: 'Dice qué quieres saber', tip: 'Aclara qué necesitas: qué significa cada término, qué preguntar al médico…', test: has(/significa|qué es|término|palabra|valor|pregunt/) },
      { label: 'Recuerda confirmar con el médico', tip: 'Pide que te recuerde confirmar todo con tu médico.', test: has(/médic|doctor|profesional|consultar|confirm/) },
      { label: 'No incluye datos personales', tip: 'Quita tu nombre, cédula o número de historia. No los necesitas para que te expliquen.', test: hasNone(/cédula|cedula|\b\d{7,}\b|c\.c|identificaci/) }
    ],
    example: 'Voy a pegar los términos de un examen de laboratorio, sin mis datos personales. Explícame con palabras sencillas qué significa cada término y qué preguntas debería hacerle a mi médico. Recuérdame que debo confirmar todo con él.'
  },
  {
    id: 'p4',
    title: 'El evento familiar',
    scenario: 'Quieres organizar el cumpleaños de tu mamá, pero todavía no tienes definidos fecha, lugar ni presupuesto.',
    bad: 'Organiza mi evento.',
    checks: [
      { label: 'Cuenta qué tipo de evento es', tip: 'Di qué celebras y para cuántas personas, aproximadamente.', test: has(/cumplea|reunión|fiesta|celebr|aniversario|boda|encuentro/) },
      { label: 'Pide que te haga preguntas', tip: 'Pídele que te haga las preguntas necesarias antes de proponer algo.', test: has(/pregunt/) },
      { label: 'Menciona algún límite', tip: 'Menciona presupuesto, fecha o número de invitados aunque sea aproximado.', test: has(/presupuesto|pesos|\$|fecha|invitados|personas|económic/) },
      { label: 'Pide un formato útil', tip: 'Pide una lista de tareas, un cronograma o un paso a paso.', test: has(/lista|cronograma|pasos|tareas|checklist|tabla|plan/) }
    ],
    example: 'Quiero organizar el cumpleaños de mi mamá con unas 15 personas. Antes de proponerme nada, hazme las preguntas que necesites (fecha, lugar, presupuesto). Después arma una lista de tareas con orden.'
  },
  {
    id: 'p5',
    title: 'El resumen',
    scenario: 'Tienes un texto largo de un trámite y quieres entender lo importante, sin que se invente nada.',
    bad: 'Resume este texto.',
    checks: [
      { label: 'Dice cuánto resumir', tip: 'Pide una extensión: un párrafo, cinco puntos, diez líneas…', test: has(/párrafo|puntos|líneas|palabras|viñeta|resumen corto|breve/) },
      { label: 'Dice para quién o con qué nivel', tip: 'Pide que sea fácil de entender, para una persona sin conocimientos del tema.', test: has(/sencill|fácil|claro|para (mi|un|una|alguien)|mayor|sin conocimientos/) },
      { label: 'Pide conservar lo importante', tip: 'Pide que conserve fechas, plazos, cifras y requisitos.', test: has(/fecha|plazo|requisito|cifra|important|clave|conserv/) },
      { label: 'Pide no inventar', tip: 'Agrega «no inventes información; si algo no está en el texto, dilo».', test: has(/no inventes|no inventar|sin inventar|solo lo que|únicamente|no agregues|no supongas/) }
    ],
    example: 'Resume el siguiente texto en un máximo de cinco puntos, con palabras sencillas para alguien sin conocimientos del trámite. Conserva las fechas, plazos y requisitos. No inventes información; si algo no aparece en el texto, dilo.'
  }
];

// ---------- ANTES Y DESPUÉS ----------
// Respuestas escritas por el taller como ejemplo ilustrativo (no generadas en vivo).
export const comparisons = [
  {
    id: 'a1', title: 'La receta',
    vague: 'Dame una receta.',
    vagueAnswer: 'Claro. Aquí tienes una receta de lasaña de carne.\n\nIngredientes: carne molida, láminas de lasaña, salsa bechamel, salsa de tomate, queso mozzarella, cebolla, ajo, vino tinto…\n\nPreparación: 1. Precalienta el horno. 2. Prepara la salsa boloñesa durante una hora. 3. Prepara la bechamel. 4. Arma las capas… (siguen más de diez pasos; tiempo total: más de dos horas).',
    good: 'Sugiéreme una cena para dos personas con arroz, huevos y tomate, lista en 20 minutos. Explícame los pasos numerados con palabras sencillas.',
    goodAnswer: 'Arroz con huevo y tomate (20 minutos)\n\nIngredientes: 1 taza de arroz, 2 huevos, 2 tomates, sal y un poco de aceite.\n\n1. Cocina el arroz en agua con sal.\n2. Pica los tomates en cuadritos.\n3. Calienta aceite y sofríe el tomate 3 minutos.\n4. Agrega los huevos y revuelve hasta que cuajen.\n5. Sirve la mezcla sobre el arroz.',
    lesson: 'La respuesta vaga sirve para cualquiera… y por eso no le sirve a nadie. La buena usa tus ingredientes, tu tiempo y tu nivel.'
  },
  {
    id: 'a2', title: 'El mensaje',
    vague: 'Escríbeme un mensaje.',
    vagueAnswer: '¡Hola! Espero que estés muy bien. Quería escribirte para saludarte y saber cómo has estado. ¡Un abrazo grande y que tengas un excelente día!',
    good: 'Escribe un mensaje de WhatsApp para mi nieta Camila, que cumple 15 años el sábado. Quiero felicitarla e invitarla a almorzar el domingo. Tono cariñoso, máximo cuatro líneas.',
    goodAnswer: '¡Feliz cumpleaños adelantado, mi Cami! 🎂 Cumplir 15 años es un día muy especial y quiero celebrarlo contigo. ¿Te gustaría venir a almorzar a mi casa el domingo? Te preparo lo que más te gusta. Te quiero mucho. 💛',
    lesson: 'Sin destinatario ni propósito, la IA escribe un mensaje que nadie necesita. Con tres datos, queda listo para enviar.'
  },
  {
    id: 'a3', title: 'Comparar celulares',
    vague: 'Compárame dos celulares.',
    vagueAnswer: 'Los celulares de gama media ofrecen un buen equilibrio entre precio y rendimiento, mientras que los de gama alta incorporan procesadores más potentes, cámaras avanzadas y pantallas de mayor calidad. Es importante considerar el sistema operativo, la memoria, el procesador, la autonomía de la batería y el ecosistema de aplicaciones antes de decidir cuál se adapta mejor a tus necesidades…',
    good: 'Compárame un celular de gama media y uno de gama alta para alguien que solo usa WhatsApp, fotos y videollamadas. Hazlo en una tabla con precio, batería, cámara y facilidad de uso, y dime qué datos debo confirmar en la tienda.',
    goodAnswer: 'Criterio | Gama media | Gama alta\nPrecio | Más económico | Mucho más costoso\nBatería | Suele alcanzar para el día | Similar; depende del modelo\nCámara | Buena para fotos de familia | Mejor con poca luz\nFacilidad de uso | Igual de sencilla | Igual de sencilla\n\nPara WhatsApp, fotos y videollamadas, la gama media suele ser suficiente. Confirma en la tienda: precio actual, duración real de la batería y garantía.',
    lesson: 'Pedir una tabla y un público concreto convierte un párrafo largo en una respuesta que sirve para decidir.'
  }
];
