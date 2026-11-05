// Contenido pedagógico editable.
//
// TIPOS DE RETO (campo `type`):
//   mcq       opción única                  → options, correct (posición), wrong (explicación por opción)
//   multi     marcar todas las correctas    → options, correct: [posiciones]
//   classify  clasificar piezas             → categories, items: [{ t, a }]  (a = posición en categories)
//   fill      completar con listas          → template con {0},{1}…, blanks: [{ options, correct }]
//   write     redactar y autoevaluarse      → task, minWords, rubric, need, hints, reflect?
//
// Cada reto lleva un `id` único y estable (el progreso se guarda por id).
// En mcq/multi/fill/classify el orden de las opciones se baraja al mostrarse.
// En `write` las palabras clave de `hints` son SOLO orientación: nunca aprueban ni reprueban.

export const LEVELS = [
  { name: 'Descubro', icon: '🌱', blurb: 'Entiendo qué es un prompt y cómo cuidarme al usarlo.' },
  { name: 'Construyo', icon: '✏️', blurb: 'Armo prompts claros y mejoro las respuestas.' },
  { name: 'Experimento', icon: '🚀', blurb: 'Uso la IA con criterio: verifico, comparo y pruebo.' }
];

// Utilidades para las pruebas de orientación
const has = (re) => (t) => re.test(t);
const hasNone = (re) => (t) => !re.test(t);
const countAtLeast = (re, n) => (t) => new Set(t.match(new RegExp(re.source, 'g')) || []).size >= n;

export const challenges = [
  // =============== DESCUBRO (6) ===============
  {
    id: 'd1', level: 'Descubro', type: 'mcq',
    q: '«Hazme una carta». ¿Qué información sería más útil agregar?',
    options: ['Muchos emojis', 'A quién va dirigida y qué se solicita', 'Palabras complicadas'],
    correct: 1,
    hint: 'Piensa en lo que preguntarías si alguien te pidiera escribirle una carta.',
    explain: '¡Exacto! El destinatario y el propósito ayudan a obtener una carta útil.',
    wrong: ['Los emojis pueden decorar una carta, pero no explican para quién es ni qué necesitas.', null, 'Las palabras difíciles no reemplazan los datos que necesita una carta.']
  },
  {
    id: 'd2', level: 'Descubro', type: 'classify',
    q: 'Cada pieza de un prompt cumple una función. Clasifica cada frase.',
    ctx: '«Actúa como un profesor paciente. Necesito entender mi factura de energía. Soy una persona mayor y la leo con dificultad. Explícamela en cinco pasos numerados. No uses palabras técnicas.»',
    categories: ['Rol', 'Tarea', 'Contexto', 'Formato', 'Límite'],
    items: [
      { t: 'Actúa como un profesor paciente', a: 0 },
      { t: 'Necesito entender mi factura de energía', a: 1 },
      { t: 'Soy una persona mayor y la leo con dificultad', a: 2 },
      { t: 'Explícamela en cinco pasos numerados', a: 3 },
      { t: 'No uses palabras técnicas', a: 4 }
    ],
    hint: 'El Rol dice quién ayuda; la Tarea, qué hacer; el Contexto, tu situación; el Formato, cómo presentarlo; el Límite, qué evitar.',
    explain: '¡Muy bien! Cuando reconoces cada pieza, puedes armar tus propios prompts sin que se te olvide ninguna.'
  },
  {
    id: 'd3', level: 'Descubro', type: 'mcq',
    q: '¿Cuál de estos datos NO deberías escribir en un prompt?',
    options: ['El tema que quieres aprender', 'Tu número de cédula y la clave de tu banco', 'Cuántas personas van a comer'],
    correct: 1,
    hint: 'Piensa en los datos que, si alguien los viera, podrían usarse para hacerte daño.',
    explain: '¡Muy bien! Nunca escribas cédulas, claves, números de tarjeta ni datos médicos o de otras personas. Puedes describir tu situación sin esos datos.',
    wrong: ['Un tema de estudio no es un dato privado: puedes escribirlo sin problema.', null, 'Cuántas personas comen es un dato general y ayuda a que la receta sea útil.']
  },
  {
    id: 'd4', level: 'Descubro', type: 'multi',
    q: 'Este prompt es muy corto: «Escríbeme un mensaje.» Marca TODO lo que le falta para que sirva.',
    options: [
      'Para quién es el mensaje',
      'Para qué lo necesito (felicitar, invitar, pedir…)',
      'El tono que quiero (cariñoso, formal…)',
      'Que use muchos emojis',
      'Un color de letra bonito'
    ],
    correct: [0, 1, 2],
    hint: 'Son tres datos: quién, para qué y cómo debe sonar.',
    explain: '¡Exacto! Destinatario, propósito y tono. Los emojis y los colores no cambian lo que el mensaje necesita decir.'
  },
  {
    id: 'd5', level: 'Descubro', type: 'mcq',
    q: 'Quieres aprender a usar el celular. ¿Cuál es el mejor prompt?',
    options: ['Celular', 'Explícame en pasos sencillos cómo enviar una foto por WhatsApp desde mi celular', 'Dime cualquier cosa'],
    correct: 1,
    hint: 'Elige la frase que diga qué quieres aprender.',
    explain: '¡Bien! Explicar la tarea permite recibir instrucciones útiles.',
    wrong: ['Una sola palabra no describe lo que quieres aprender.', null, '«Cualquier cosa» no indica una tarea concreta.']
  },
  {
    id: 'd6', level: 'Descubro', type: 'fill',
    q: 'Completa el prompt eligiendo la mejor opción en cada espacio.',
    template: 'Explícame {0} cómo enviar una foto por WhatsApp. Hazlo para {1}, y usa {2}.',
    blanks: [
      { options: ['paso a paso', 'como quieras', 'muy rápido'], correct: 0 },
      { options: ['una persona que nunca ha usado WhatsApp', 'alguien que sabe mucho de tecnología', 'nadie en particular'], correct: 0 },
      { options: ['palabras sencillas', 'términos técnicos', 'palabras en inglés'], correct: 0 }
    ],
    hint: 'Elige lo que haría más fácil de seguir la explicación a alguien que apenas empieza.',
    explain: '¡Bien! Pasos, nivel de quien pregunta y lenguaje: tres decisiones que cambian toda la respuesta.'
  },

  // =============== CONSTRUYO (8) ===============
  {
    id: 'c1', level: 'Construyo', type: 'classify',
    q: 'Clasifica cada frase de este prompt. ¡Ojo: hay dos Límites!',
    ctx: '«Eres un nutricionista que trabaja con personas mayores. Quiero un menú semanal. Vivo solo y cocino con pocos utensilios. Preséntalo en una tabla de lunes a domingo. Que cada comida cueste menos de 15.000 pesos. Evita recetas que lleven horno.»',
    categories: ['Rol', 'Tarea', 'Contexto', 'Formato', 'Límite'],
    items: [
      { t: 'Eres un nutricionista que trabaja con personas mayores', a: 0 },
      { t: 'Quiero un menú semanal', a: 1 },
      { t: 'Vivo solo y cocino con pocos utensilios', a: 2 },
      { t: 'Preséntalo en una tabla de lunes a domingo', a: 3 },
      { t: 'Que cada comida cueste menos de 15.000 pesos', a: 4 },
      { t: 'Evita recetas que lleven horno', a: 4 }
    ],
    hint: 'Un Límite es una condición que la respuesta debe respetar: un tope de dinero, algo que evitar.',
    explain: '¡Excelente! Precio máximo y cosas que evitar son límites. Dar varios límites claros evita respuestas que no puedes usar.'
  },
  {
    id: 'c2', level: 'Construyo', type: 'multi',
    q: 'Versión 1 de un prompt: «Hazme un plan para mi cumpleaños.» ¿Qué cambios la mejoran de verdad? Marca todos.',
    options: [
      'Decir cuántas personas van y cuánto dinero hay',
      'Pedir que te haga preguntas antes de proponer el plan',
      'Pedir el plan como lista de tareas con fechas',
      'Escribir «por favor» cinco veces',
      'Escribirlo todo en mayúsculas',
      'Pedir «el mejor plan del mundo, perfecto»'
    ],
    correct: [0, 1, 2],
    hint: 'Busca los cambios que le dan información o estructura a la IA, no los que solo suenan más fuertes.',
    explain: '¡Muy bien! Datos concretos, preguntas y formato son los que cambian la respuesta. Gritar o pedir «perfecto» no le da información útil.'
  },
  {
    id: 'c3', level: 'Construyo', type: 'mcq',
    q: 'Pediste una receta y la IA te dio 12 pasos. Solo tienes 20 minutos y no tienes horno. ¿Cuál es el mejor mensaje para mejorarla?',
    options: [
      'Hazla otra vez',
      'Más corto',
      'Redúcela a máximo 5 pasos, que se cocine en 20 minutos y sin usar horno',
      'Dame otra receta distinta'
    ],
    correct: 2,
    hint: 'La mejor mejora dice exactamente qué cambiar: cuántos pasos, cuánto tiempo y qué no usar.',
    explain: '¡Correcto! Una mejora con números y condiciones concretas le dice a la IA qué ajustar.',
    wrong: ['«Hazla otra vez» no dice qué debe cambiar: puede salir igual de larga.', 'Va por buen camino, pero «más corto» no dice cuánto ni tiene en cuenta tu tiempo y el horno.', null, 'Otra receta distinta tampoco garantiza que se ajuste a 20 minutos y sin horno.']
  },
  {
    id: 'c4', level: 'Construyo', type: 'fill',
    q: 'Completa este prompt para comparar dos planes de internet.',
    template: 'Compárame dos planes de internet para mi casa. Presenta la comparación en {0}, con estas columnas: {1}. Como somos cuatro personas que ven videos, {2}. Al final, {3}.',
    blanks: [
      { options: ['una tabla', 'una lista de pros y contras sin orden', 'un párrafo largo'], correct: 0 },
      { options: ['precio, velocidad y permanencia mínima', 'nombre y color', 'lo que te parezca'], correct: 0 },
      { options: ['recomiéndame uno y explica por qué', 'elige uno al azar', 'no recomiendes nada'], correct: 0 },
      { options: ['dime qué datos debo confirmar con el proveedor', 'asegura que los precios son exactos', 'invéntalos si no los sabes'], correct: 0 }
    ],
    hint: 'Una tabla permite ver los dos planes lado a lado; y al final siempre conviene verificar los datos que cambian.',
    explain: '¡Muy bien! Formato (tabla), criterios, contexto de uso y verificación: un prompt de comparación completo.'
  },
  {
    id: 'c5', level: 'Construyo', type: 'mcq',
    q: 'Quieres comparar tres celulares por cuatro criterios. ¿Qué instrucción da la tabla más útil?',
    options: [
      'Compáralos',
      'Haz una tabla con los 3 celulares en filas y estas columnas: precio, batería, cámara y facilidad de uso',
      'Dime cuál es mejor',
      'Haz una tabla bonita'
    ],
    correct: 1,
    hint: 'Una buena instrucción de formato dice qué va en las filas y qué va en las columnas.',
    explain: '¡Excelente! Decir filas y columnas evita adivinar: obtienes exactamente la comparación que necesitas.',
    wrong: ['«Compáralos» deja todo abierto: puede salir un párrafo largo.', null, 'Pedir «cuál es mejor» no te muestra las diferencias para decidir tú.', '«Bonita» no dice qué información debe tener la tabla.']
  },
  {
    id: 'c6', level: 'Construyo', type: 'mcq',
    q: 'Quieres reclamar un cobro doble en tu factura del agua. ¿Cuál prompt es el mejor?',
    options: [
      'Escribe una carta de reclamo por un cobro doble en mi factura del agua. Tono firme y respetuoso, máximo 10 líneas. Deja espacios entre corchetes donde van mis datos (nombre, número de contrato).',
      'Escribe una carta de reclamo firme. Mi nombre es Carlos Pérez, mi cédula es 10.234.567 y mi número de contrato es 8890123.',
      'Escribe una carta de reclamo larguísima, con mucho detalle, para que se asusten.'
    ],
    correct: 0,
    hint: 'Fíjate cuál da instrucciones claras sin entregar datos privados.',
    explain: '¡Muy bien! La primera pide tono y extensión, y deja espacios para tus datos: los completas tú después, sin enviarlos por internet.',
    wrong: [null, 'Esta entrega cédula y contrato. Mejor deja espacios [así] y completa tú esos datos al final.', 'Pedir algo «larguísimo para asustar» no ayuda: una carta clara y respetuosa suele funcionar mejor.']
  },
  {
    id: 'c7', level: 'Construyo', type: 'write',
    q: 'Redacta: rescata este prompt',
    ctx: 'Prompt enfermo: «Ayúdame con mi hoja de vida.»',
    task: 'Escribe una versión mejorada de este prompt con tus palabras. Piensa en un trabajo real o imaginario. No escribas tu cédula ni tu teléfono.',
    minWords: 15, need: 3,
    rubric: [
      'Dice a qué cargo o tipo de trabajo aplico',
      'Cuenta mi experiencia o estudios en pocas palabras',
      'Pide un formato concreto (viñetas, una página, secciones)',
      'Pone un límite: no inventar experiencia que no tengo'
    ],
    hints: [
      { label: 'Menciona el cargo o tipo de trabajo', tip: 'Di a qué aplicas: «cargo de auxiliar administrativo».', test: has(/cargo|puesto|trabajo|empleo|vacante|aplic|postul/) },
      { label: 'Cuenta experiencia o estudios', tip: 'Agrega en una frase tu experiencia o estudios.', test: has(/experiencia|estudi|años|trabaj[eé]|curso|tecnólog|profesional|bachiller/) },
      { label: 'Pide un formato', tip: 'Pide, por ejemplo, «en una página con viñetas».', test: has(/viñeta|una página|1 página|secciones|formato|lista|título|resumen/) },
      { label: 'Pide no inventar', tip: 'Agrega «no inventes experiencia que no te di».', test: has(/no inventes|no inventar|sin inventar|solo lo que|únicamente|no agregues|no exager/) }
    ],
    hint: 'Revisa las casillas: cada una es una pieza que mejora el prompt. Con tres es suficiente.',
    explain: '¡Buen trabajo! Probar tu versión en ChatGPT y compararla con «Ayúdame con mi hoja de vida» te mostrará la diferencia.'
  },
  {
    id: 'c8', level: 'Construyo', type: 'write',
    q: 'Redacta: pide ayuda con un trámite',
    ctx: 'Situación: tienes un trámite pendiente y nunca lo has hecho (renovar un documento, pedir un certificado, afiliarte a un servicio…).',
    task: 'Escribe un prompt para que ChatGPT te explique ese trámite. No pongas datos personales.',
    minWords: 20, need: 3,
    rubric: [
      'Dice qué trámite es',
      'Pide palabras sencillas (porque nunca lo he hecho)',
      'Le pide que me haga preguntas antes de responder',
      'Le pide que me diga qué debo verificar en la página oficial'
    ],
    hints: [
      { label: 'Dice qué trámite es', tip: 'Nombra el trámite con claridad.', test: has(/trámite|tramite|renov|solicit|certificad|licencia|pasaporte|cédula|impuesto|subsidio|afili|inscrib|document/) },
      { label: 'Pide palabras sencillas', tip: 'Agrega «explícamelo con palabras sencillas, nunca lo he hecho».', test: has(/sencill|simple|fácil|claro|nunca (lo )?he/) },
      { label: 'Pide preguntas antes de responder', tip: 'Agrega «antes de responder, hazme las preguntas que necesites».', test: has(/pregunt/) },
      { label: 'Pide verificar en la fuente oficial', tip: 'Agrega «dime qué debo confirmar en la página oficial».', test: has(/verific|oficial|confirm|página|fuente/) }
    ],
    hint: 'Piensa: ¿qué le falta saber a la IA sobre ti y tu trámite? Que pregunte es parte de la solución.',
    explain: '¡Muy bien! Un prompt que pide preguntas y verificación convierte a ChatGPT en un buen ayudante, no en una autoridad.'
  },

  // =============== EXPERIMENTO (10) ===============
  {
    id: 'e1', level: 'Experimento', type: 'mcq',
    q: 'La IA te da una fecha importante sin fuente. ¿Qué haces?',
    options: ['La compartes sin comprobar', 'Solicitas una fuente y verificas en un sitio confiable', 'Asumes que siempre acierta'],
    correct: 1,
    hint: 'La IA también puede equivocarse.',
    explain: '¡Correcto! Siempre verifica información importante.',
    wrong: ['Compartir una fecha sin verificar puede difundir un error.', null, 'La IA puede equivocarse incluso cuando responde con seguridad.']
  },
  {
    id: 'e2', level: 'Experimento', type: 'multi',
    q: 'Marca TODO lo que conviene verificar antes de actuar según esta respuesta.',
    ctx: 'Respuesta de una IA (ejemplo): «Para renovar la licencia de conducción debes pagar $215.000 en cualquier banco, llevar tu cédula y pedir la cita en la página del Ministerio de Transporte. El trámite tarda exactamente 3 días hábiles.»',
    options: [
      'El valor exacto del trámite',
      'El plazo de «exactamente 3 días hábiles»',
      'Que la página para pedir la cita sea la oficial',
      'Que el texto esté escrito en español',
      'Que el párrafo tenga dos frases'
    ],
    correct: [0, 1, 2],
    hint: 'Verifica lo que cambia con el tiempo o puede costarte dinero: valores, plazos y dónde hacer el trámite.',
    explain: '¡Muy bien! Valores, plazos y direcciones se desactualizan o se inventan. El idioma o la cantidad de frases no afectan si es verdad.'
  },
  {
    id: 'e3', level: 'Experimento', type: 'mcq',
    q: 'Esta respuesta de una IA tiene un error. ¿Qué parte conviene verificar?',
    ctx: 'Pregunta: ¿Quién escribió «Cien años de soledad»?\nRespuesta de la IA: «Fue escrita por Gabriel García Márquez en 1975 y ese mismo año ganó el Premio Nobel de Literatura.»',
    options: ['El nombre del autor', 'Las fechas: el año de publicación y el del Nobel', 'Nada: la IA nunca se equivoca en literatura'],
    correct: 1,
    hint: 'La IA acierta en lo general, pero suele fallar en fechas y cifras concretas.',
    explain: '¡Muy bien! El autor es correcto, pero la novela se publicó en 1967 y el Nobel fue en 1982. Las fechas y cifras son lo primero que hay que comprobar.',
    wrong: ['El autor sí es correcto; el error está en otro dato.', null, 'La IA puede equivocarse incluso en temas muy conocidos, sobre todo en fechas y cifras.']
  },
  {
    id: 'e4', level: 'Experimento', type: 'multi',
    q: 'Un prompt dice: «Escribe una carta a la alcaldía con mis datos. Si no los tienes, invéntalos para que se vea completa. Cita la ley que aplica.» ¿Qué frases invitan a la IA a inventar? Marca las que invitan.',
    options: [
      'Si no los tienes, invéntalos para que se vea completa',
      'Cita la ley que aplica (sin dar el texto ni la fuente)',
      'Deja espacios entre corchetes donde van mis datos',
      'Dime qué datos te faltan antes de escribir'
    ],
    correct: [0, 1],
    hint: 'Inventar es pedirle datos que no tiene y no ofrecerle forma de decir «no sé».',
    explain: '¡Exacto! Pedir «inventa» es la invitación más directa. Citar una ley sin darle la fuente también la empuja a fabricar una. Las otras dos frases son buenas prácticas.'
  },
  {
    id: 'e5', level: 'Experimento', type: 'classify',
    q: 'Detective de respuestas: clasifica cada frase de esta respuesta de la IA.',
    ctx: 'Pregunta: «¿Puedo sembrar aguacate en mi casa de Manizales?»\nRespuesta de la IA (ejemplo): «Manizales está a más de 2.000 metros sobre el nivel del mar. Seguramente tienes un patio con buen sol. Este árbol tarda entre 3 y 5 años en dar fruto. Supongo que tu presupuesto es alto. Sembrar con paciencia suele dar mejores resultados.»',
    categories: ['Dato que debo verificar', 'Suposición de la IA', 'Opinión o consejo general'],
    items: [
      { t: 'Manizales está a más de 2.000 metros sobre el nivel del mar', a: 0 },
      { t: 'Seguramente tienes un patio con buen sol', a: 1 },
      { t: 'Este árbol tarda entre 3 y 5 años en dar fruto', a: 0 },
      { t: 'Supongo que tu presupuesto es alto', a: 1 },
      { t: 'Sembrar con paciencia suele dar mejores resultados', a: 2 }
    ],
    hint: 'Un dato tiene cifras que puedes comprobar. Una suposición habla de TU situación sin que se la hayas contado.',
    explain: '¡Excelente ojo! La IA asumió que tienes patio y presupuesto: datos que tú no le diste. Saber distinguir suposiciones de datos te enseña qué corregir en tu prompt.'
  },
  {
    id: 'e6', level: 'Experimento', type: 'fill',
    q: 'Completa un prompt «anti-invención» para una carta de reclamo.',
    template: 'Redacta una carta de reclamo por un cobro doble. {0} los datos que no te di, como mi nombre o mi dirección. Si no estás seguro de una cifra, {1}. Al terminar, {2}.',
    blanks: [
      { options: ['No inventes y deja un espacio entre corchetes para', 'Completa con datos de ejemplo parecidos a', 'Imagina'], correct: 0 },
      { options: ['dímelo y márcala para que yo la verifique', 'dala de todos modos con seguridad', 'escribe la que parezca mejor'], correct: 0 },
      { options: ['haz una lista de lo que supusiste y de lo que debo confirmar', 'agrega una despedida muy larga', 'di que todo es exacto'], correct: 0 }
    ],
    hint: 'Elige siempre la opción que le permite a la IA decir «no lo sé» en vez de inventar.',
    explain: '¡Muy bien! Corchetes, permiso para dudar y una lista de supuestos: tres trucos para reducir las invenciones.'
  },
  {
    id: 'e7', level: 'Experimento', type: 'mcq',
    q: 'Le preguntas lo mismo dos veces a la IA y te da respuestas diferentes. ¿Qué haces?',
    options: [
      'Elijo la que más me gusta',
      'Le pido que explique la diferencia y en qué se basa cada una, y verifico en una fuente oficial',
      'Pregunto una tercera vez y me quedo con la que se repita'
    ],
    correct: 1,
    hint: 'Cuando hay contradicción, la solución no es votar: es investigar de dónde salen los datos.',
    explain: '¡Correcto! Pedir en qué se basa cada respuesta y comprobar en una fuente oficial es lo único que realmente resuelve la duda.',
    wrong: ['Elegir la que te gusta es confirmar lo que ya querías creer, no comprobar la verdad.', null, 'Que una respuesta se repita no la hace cierta: la IA puede repetir el mismo error.']
  },
  {
    id: 'e8', level: 'Experimento', type: 'write',
    q: 'Redacta: la carta con datos faltantes',
    ctx: 'Situación: debes escribir una carta a la empresa de energía por un cobro duplicado. No tienes a la mano el número de contrato ni el valor exacto del cobro, y no quieres escribir tu cédula.',
    task: 'Escribe un prompt que impida que ChatGPT invente nombres, números o direcciones.',
    minWords: 25, need: 3,
    rubric: [
      'Dice claramente que NO invente datos',
      'Pide dejar espacios entre corchetes [así] para mis datos',
      'Pide que me avise qué información le falta',
      'Indica el tono y la extensión de la carta'
    ],
    hints: [
      { label: 'Pide no inventar', tip: 'Agrega «no inventes ningún dato».', test: has(/no inventes|no inventar|sin inventar|nada inventado|no supongas|no asumas/) },
      { label: 'Usa corchetes o espacios para mis datos', tip: 'Pide «deja [espacios entre corchetes] donde van mis datos».', test: has(/\[|corchete|espacio|en blanco|marcador/) },
      { label: 'Pide que avise qué falta', tip: 'Pide «dime qué información te falta antes de escribir».', test: has(/avís|dime qué|qué (datos|información) (te )?falta|pregunt/) },
      { label: 'Indica tono y extensión', tip: 'Agrega «tono respetuoso, máximo 10 líneas».', test: has(/tono|formal|respetuos|firme|líneas|párrafo|breve|corto|extensión/) }
    ],
    hint: 'Piensa en cómo darle a la IA una salida honesta: espacios en blanco y permiso para preguntar.',
    explain: '¡Muy bien! Un prompt así convierte «no sé» en una respuesta aceptable. Pruébalo en ChatGPT y busca si aun así inventó algo.'
  },
  {
    id: 'e9', level: 'Experimento', type: 'write',
    q: 'Redacta: el caso con contradicciones',
    ctx: 'Caso: organizas una reunión familiar. Tu primo dice que es el sábado y tu tía dice que es el domingo. El salón solo está disponible el sábado por la mañana. Hay 30 invitados y el salón admite 20. El presupuesto es de $200.000.',
    task: 'Escribe un prompt que le pida a la IA detectar las contradicciones y hacerte preguntas antes de proponer un plan.',
    minWords: 30, need: 3,
    rubric: [
      'Incluye los datos del caso (fecha, salón, invitados, presupuesto)',
      'Le pide que detecte contradicciones o problemas',
      'Le pide que me haga preguntas antes de proponer un plan',
      'Pide el plan en un formato concreto (lista, cronograma)'
    ],
    hints: [
      { label: 'Incluye los datos del caso', tip: 'Incluye el sábado/domingo, el salón, los invitados y el presupuesto.', test: countAtLeast(/sábado|domingo|salón|\b20\b|\b30\b|invitados|200\.?000|presupuesto/, 3) },
      { label: 'Pide detectar contradicciones', tip: 'Pide «dime qué datos se contradicen o no cuadran».', test: has(/contradic|inconsisten|problema|choca|no cuadr|conflicto|no coincid/) },
      { label: 'Pide preguntas antes del plan', tip: 'Agrega «antes de proponer, hazme las preguntas que necesites».', test: has(/pregunt/) },
      { label: 'Pide un formato concreto', tip: 'Pide una lista de tareas o un cronograma.', test: has(/lista|cronograma|pasos|plan|tabla|checklist|tareas/) }
    ],
    hint: 'No le pidas el plan todavía: primero que encuentre los problemas del caso.',
    explain: '¡Muy bien! Pedirle a la IA que busque contradicciones antes de planear evita que tape los problemas con un plan que se ve bonito pero no funciona.'
  },
  {
    id: 'e10', level: 'Experimento', type: 'write',
    q: 'Reto final: prueba, corrige y justifica',
    ctx: 'Elige una necesidad real tuya (estudiar, organizar gastos, redactar un documento, planear algo).',
    task: 'Escribe tu mejor prompt usando al menos cuatro de los cinco ingredientes. Pruébalo en ChatGPT. Luego cuenta qué cambiaste y por qué.',
    minWords: 30, need: 4,
    rubric: [
      'Tiene un Rol (quién me ayuda)',
      'Dice claramente la Tarea',
      'Da Contexto de mi situación',
      'Pide un Formato concreto',
      'Incluye Límites (qué evitar o respetar)'
    ],
    reflect: { label: '¿Qué cambiaste después de probarlo en ChatGPT y por qué?', min: 12 },
    hints: [
      { label: 'Rol', tip: 'Empieza con «Actúa como…».', test: has(/actúa|actua|eres un|eres una|como un|como una|rol/) },
      { label: 'Tarea', tip: 'Di claramente qué necesitas.', test: has(/necesito|quiero|ayúdame|escribe|explica|organiza|crea|haz|arma|dame|redacta/) },
      { label: 'Contexto', tip: 'Cuenta algo de tu situación.', test: has(/contexto|soy|tengo|vivo|somos|mi |para mi|porque/) },
      { label: 'Formato', tip: 'Pide tabla, lista, pasos, líneas…', test: has(/formato|tabla|lista|pasos|viñeta|párrafo|líneas|numerad/) },
      { label: 'Límites', tip: 'Agrega qué evitar o un máximo.', test: has(/\bno\b|evita|máximo|sin |límite|solo|únicamente|menos de/) }
    ],
    hint: 'Usa las casillas como lista de chequeo. Después de probarlo, ajusta UNA cosa y cuéntanos.',
    explain: '¡Reto final superado! Probar, corregir y justificar es exactamente lo que hace alguien que usa bien la IA.'
  }
];

// ---------- DOCTOR DE PROMPTS ----------
// Cada caso tiene 4 revisiones. "test" recibe el texto en minúsculas y devuelve true si cumple.
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
