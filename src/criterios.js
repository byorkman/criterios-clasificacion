// Criterios diagnósticos y de clasificación. ESTOS CRITERIOS DEBEN SER
// REVISADOS POR EL MÉDICO ANTES DE USAR LA HERRAMIENTA CON PACIENTES.
//
// Cada criterio declara sus campos (casillas, números u opciones agrupados
// por sección) y una función evaluar(valores) que devuelve:
//   { cumple: true | false | null, resultado, detalle: [] }
// cumple es null cuando faltan datos para decidir.

const si = (v) => v === true;
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

// ---------------------------------------------------------------- AIJ ILAR
// Petty RE, et al. J Rheumatol 2004;31:390-2.

const aij = {
  id: "aij",
  nombre: "Artritis idiopática juvenil (ILAR)",
  corto: "AIJ · ILAR",
  fuente: "Petty RE, et al. J Rheumatol 2004;31:390-2.",
  nota: "Artritis de causa desconocida que empieza antes de los 16 años y dura al menos 6 semanas, descartadas otras causas.",
  campos: [
    { id: "edad16", tipo: "check", grupo: "Requisitos", texto: "Inicio antes de los 16 años" },
    { id: "seisSemanas", tipo: "check", grupo: "Requisitos", texto: "Artritis de al menos 6 semanas" },
    { id: "articulaciones", tipo: "numero", grupo: "Artritis", texto: "Articulaciones afectadas en los primeros 6 meses", min: 0 },
    { id: "extendida", tipo: "check", grupo: "Artritis", texto: "Más de 4 articulaciones después de los 6 meses" },
    { id: "fiebre", tipo: "check", grupo: "sistémica", texto: "Fiebre de al menos 2 semanas, diaria (cotidiana) durante al menos 3 días" },
    { id: "rash", tipo: "check", grupo: "sistémica", texto: "Exantema evanescente eritematoso" },
    { id: "adenopatias", tipo: "check", grupo: "sistémica", texto: "Adenopatías generalizadas" },
    { id: "visceromegalia", tipo: "check", grupo: "sistémica", texto: "Hepatomegalia o esplenomegalia" },
    { id: "serositis", tipo: "check", grupo: "sistémica", texto: "Serositis" },
    { id: "fr", tipo: "check", grupo: "Laboratorio", texto: "Factor reumatoideo IgM positivo 2 veces, separadas por al menos 3 meses" },
    { id: "hlab27", tipo: "check", grupo: "Laboratorio", texto: "HLA-B27 positivo" },
    { id: "psoriasis", tipo: "check", grupo: "Psoriasis", texto: "Psoriasis (actual o previa)" },
    { id: "dactilitis", tipo: "check", grupo: "Psoriasis", texto: "Dactilitis" },
    { id: "unas", tipo: "check", grupo: "Psoriasis", texto: "Pits ungueales u onicólisis" },
    { id: "familiarPsoriasis", tipo: "check", grupo: "Psoriasis", texto: "Psoriasis en un familiar de primer grado" },
    { id: "entesitis", tipo: "check", grupo: "Entesitis", texto: "Entesitis" },
    { id: "sacroiliaco", tipo: "check", grupo: "Entesitis", texto: "Dolor sacroilíaco a la palpación o dolor lumbosacro inflamatorio" },
    { id: "varonMayor6", tipo: "check", grupo: "Entesitis", texto: "Varón con artritis que empezó después de los 6 años" },
    { id: "uveitisAguda", tipo: "check", grupo: "Entesitis", texto: "Uveítis anterior aguda (sintomática)" },
    { id: "familiarEspondilo", tipo: "check", grupo: "Entesitis", texto: "Familiar de primer grado con espondilitis anquilosante, artritis relacionada con entesitis, sacroileítis con EII, artritis reactiva o uveítis anterior aguda" },
  ],
  evaluar(v) {
    if (!si(v.edad16) || !si(v.seisSemanas)) {
      return { cumple: false, resultado: "No cumple los requisitos de AIJ", detalle: ["Hacen falta inicio antes de los 16 años y artritis de al menos 6 semanas."] };
    }
    const n = num(v.articulaciones);
    const sistemicos = ["rash", "adenopatias", "visceromegalia", "serositis"].filter((k) => si(v[k])).length;
    const esSistemica = si(v.fiebre) && sistemicos >= 1;
    const menoresERA = ["sacroiliaco", "hlab27", "varonMayor6", "uveitisAguda", "familiarEspondilo"].filter((k) => si(v[k])).length;
    const esERA = si(v.entesitis) || menoresERA >= 2;
    const menoresPso = ["dactilitis", "unas", "familiarPsoriasis"].filter((k) => si(v[k])).length;
    const esPso = si(v.psoriasis) || menoresPso >= 2;

    // Exclusiones de ILAR.
    const exc = {
      a: si(v.psoriasis) || si(v.familiarPsoriasis),
      b: si(v.hlab27) && si(v.varonMayor6),
      c: si(v.uveitisAguda) || si(v.familiarEspondilo) || esERA,
      d: si(v.fr),
      e: esSistemica,
    };
    const libre = (...letras) => letras.every((l) => !exc[l]);

    const categorias = [];
    if (esSistemica && libre("a", "b", "c", "d")) categorias.push("sistémica");
    if (n !== null && n >= 1 && n <= 4 && libre("a", "b", "c", "d", "e")) {
      categorias.push(si(v.extendida) ? "oligoarticular extendida" : "oligoarticular persistente");
    }
    if (n !== null && n >= 5 && !si(v.fr) && libre("a", "b", "c", "d", "e")) categorias.push("poliarticular FR negativo");
    if (n !== null && n >= 5 && si(v.fr) && libre("a", "b", "c", "e")) categorias.push("poliarticular FR positivo");
    if (esPso && libre("b", "c", "d", "e")) categorias.push("artritis psoriásica");
    if (esERA && libre("a", "d", "e")) categorias.push("artritis relacionada con entesitis");

    if (n === null && !esSistemica && !esPso && !esERA) {
      return { cumple: null, resultado: "Faltan datos", detalle: ["Cargar cuántas articulaciones se afectaron en los primeros 6 meses."] };
    }
    const nombres = { a: "psoriasis propia o familiar", b: "varón HLA-B27 con inicio después de los 6 años", c: "espondiloartritis o uveítis anterior aguda propia o familiar", d: "FR positivo", e: "AIJ sistémica" };
    const presentes = Object.keys(exc).filter((l) => exc[l]).map((l) => nombres[l]);
    const detalle = presentes.length ? [`Exclusiones presentes: ${presentes.join("; ")}.`] : [];
    if (categorias.length === 1) return { cumple: true, resultado: `AIJ ${categorias[0]}`, detalle };
    if (categorias.length > 1) {
      return { cumple: true, resultado: "AIJ indiferenciada", detalle: [`Cumple más de una categoría: ${categorias.join(", ")}.`, ...detalle] };
    }
    return { cumple: true, resultado: "AIJ indiferenciada", detalle: ["No cumple ninguna categoría.", ...detalle] };
  },
};

// ------------------------------------------------------- LES EULAR/ACR 2019
// Aringer M, et al. Arthritis Rheumatol 2019;71:1400-12.

const DOMINIOS_LES = [
  { dominio: "Constitucional", clinico: true, items: [["fiebre", "Fiebre > 38,3 °C", 2]] },
  { dominio: "Hematológico", clinico: true, items: [["leucopenia", "Leucopenia < 4.000/mm³", 3], ["plaquetopenia", "Plaquetopenia < 100.000/mm³", 4], ["hemolisis", "Hemólisis autoinmune", 4]] },
  { dominio: "Neuropsiquiátrico", clinico: true, items: [["delirio", "Delirio", 2], ["psicosis", "Psicosis", 3], ["convulsiones", "Convulsiones", 5]] },
  { dominio: "Mucocutáneo", clinico: true, items: [["alopecia", "Alopecia no cicatrizal", 2], ["ulceras", "Úlceras orales", 2], ["lupusSubagudo", "Lupus cutáneo subagudo o discoide", 4], ["lupusAgudo", "Lupus cutáneo agudo", 6]] },
  { dominio: "Serosas", clinico: true, items: [["derrame", "Derrame pleural o pericárdico", 5], ["pericarditis", "Pericarditis aguda", 6]] },
  { dominio: "Musculoesquelético", clinico: true, items: [["articular", "Compromiso articular (sinovitis en ≥ 2 articulaciones o dolor con ≥ 30 min de rigidez)", 6]] },
  { dominio: "Renal", clinico: true, items: [["proteinuria", "Proteinuria > 0,5 g/24 h", 4], ["nefritisIIoV", "Biopsia: nefritis lúpica clase II o V", 8], ["nefritisIIIoIV", "Biopsia: nefritis lúpica clase III o IV", 10]] },
  { dominio: "Antifosfolípidos", clinico: false, items: [["aaf", "Anticardiolipinas, anti-β2GP1 o anticoagulante lúpico", 2]] },
  { dominio: "Complemento", clinico: false, items: [["c3oc4", "C3 bajo o C4 bajo", 3], ["c3yc4", "C3 y C4 bajos", 4]] },
  { dominio: "Anticuerpos específicos", clinico: false, items: [["antiDNA", "Anti-DNA de doble cadena o anti-Sm", 6]] },
];

const les = {
  id: "les",
  nombre: "Lupus eritematoso sistémico (EULAR/ACR 2019)",
  corto: "LES · EULAR/ACR",
  fuente: "Aringer M, et al. Arthritis Rheumatol 2019;71:1400-12.",
  nota: "Cada ítem cuenta solo si no hay otra explicación más probable. En cada dominio suma solo el ítem de mayor puntaje.",
  campos: [
    { id: "ana", tipo: "check", grupo: "Criterio de entrada", texto: "ANA ≥ 1:80 en HEp-2 alguna vez" },
    ...DOMINIOS_LES.flatMap((d) => d.items.map(([id, texto, puntos]) => ({ id, tipo: "check", grupo: d.dominio, texto, puntos }))),
  ],
  evaluar(v) {
    if (!si(v.ana)) return { cumple: false, resultado: "No cumple el criterio de entrada", detalle: ["Sin ANA ≥ 1:80 no se aplican los criterios."] };
    let total = 0;
    let clinicos = 0;
    const detalle = [];
    for (const d of DOMINIOS_LES) {
      const max = Math.max(0, ...d.items.filter(([id]) => si(v[id])).map(([, , p]) => p));
      if (!max) continue;
      total += max;
      if (d.clinico) clinicos++;
      detalle.push(`${d.dominio}: ${max}`);
    }
    const cumple = total >= 10 && clinicos >= 1;
    const resultado = `${total} puntos · ${cumple ? "clasifica como LES" : "no clasifica como LES"}`;
    if (total >= 10 && !clinicos) detalle.push("Hace falta al menos un criterio clínico.");
    detalle.push("Se clasifica con ≥ 10 puntos y al menos un criterio clínico.");
    return { cumple, resultado, detalle, puntaje: total };
  },
};

// ------------------------------------------------------- Kawasaki AHA 2017
// McCrindle BW, et al. Circulation 2017;135:e927-99.

const PRINCIPALES_KW = ["conjuntivas", "boca", "exantema", "extremidades", "adenopatia"];
const LAB_KW = ["anemia", "plaquetas", "albumina", "alt", "leucocitos", "orina"];

const kawasaki = {
  id: "kawasaki",
  nombre: "Enfermedad de Kawasaki (AHA 2017)",
  corto: "Kawasaki · AHA",
  fuente: "McCrindle BW, et al. Circulation 2017;135:e927-99.",
  nota: "Descartar otras causas con hallazgos similares. Con 4 o más criterios principales, sobre todo con cambios en manos y pies, el diagnóstico puede hacerse al 4.º día de fiebre.",
  campos: [
    { id: "diasFiebre", tipo: "numero", grupo: "Fiebre", texto: "Días de fiebre", min: 0 },
    { id: "lactante", tipo: "check", grupo: "Fiebre", texto: "Lactante con ≥ 7 días de fiebre sin otra causa" },
    { id: "conjuntivas", tipo: "check", grupo: "Criterios principales", texto: "Inyección conjuntival bilateral sin exudado" },
    { id: "boca", tipo: "check", grupo: "Criterios principales", texto: "Labios rojos o fisurados, lengua aframbuesada o eritema orofaríngeo" },
    { id: "exantema", tipo: "check", grupo: "Criterios principales", texto: "Exantema (maculopapular, eritrodermia o eritema multiforme)" },
    { id: "extremidades", tipo: "check", grupo: "Criterios principales", texto: "Eritema y edema de manos y pies (agudo) o descamación periungueal (subagudo)" },
    { id: "adenopatia", tipo: "check", grupo: "Criterios principales", texto: "Adenopatía cervical ≥ 1,5 cm, generalmente unilateral" },
    { id: "pcr", tipo: "numero", grupo: "Laboratorio (forma incompleta)", texto: "PCR", unidad: "mg/dL", min: 0 },
    { id: "vsg", tipo: "numero", grupo: "Laboratorio (forma incompleta)", texto: "VSG", unidad: "mm/h", min: 0 },
    { id: "anemia", tipo: "check", grupo: "Laboratorio (forma incompleta)", texto: "Anemia para la edad" },
    { id: "plaquetas", tipo: "check", grupo: "Laboratorio (forma incompleta)", texto: "Plaquetas ≥ 450.000/mm³ después del 7.º día" },
    { id: "albumina", tipo: "check", grupo: "Laboratorio (forma incompleta)", texto: "Albúmina ≤ 3 g/dL" },
    { id: "alt", tipo: "check", grupo: "Laboratorio (forma incompleta)", texto: "ALT elevada" },
    { id: "leucocitos", tipo: "check", grupo: "Laboratorio (forma incompleta)", texto: "Leucocitos ≥ 15.000/mm³" },
    { id: "orina", tipo: "check", grupo: "Laboratorio (forma incompleta)", texto: "Orina con ≥ 10 leucocitos por campo" },
    { id: "eco", tipo: "check", grupo: "Ecocardiograma", texto: "Ecocardiograma positivo (Z ≥ 2,5 en DA o CD, o ≥ 3 hallazgos sugestivos)" },
  ],
  evaluar(v) {
    const dias = num(v.diasFiebre);
    const principales = PRINCIPALES_KW.filter((k) => si(v[k])).length;
    const detalle = [`Criterios principales: ${principales} de 5.`];
    if (dias === null) return { cumple: null, resultado: "Faltan datos", detalle: ["Cargar los días de fiebre."] };
    if (principales >= 4 && dias >= 4) {
      return { cumple: true, resultado: "Kawasaki completo", detalle: [...detalle, dias < 5 ? "Con 4 o más criterios el diagnóstico puede hacerse al 4.º día." : "Fiebre ≥ 5 días con ≥ 4 criterios principales."] };
    }
    const candidato = (dias >= 5 && principales >= 2) || si(v.lactante);
    if (!candidato) {
      return { cumple: false, resultado: "No cumple criterios de Kawasaki", detalle: [...detalle, "La forma incompleta se evalúa con fiebre ≥ 5 días y 2 o 3 criterios, o en lactantes con ≥ 7 días de fiebre sin causa."] };
    }
    const pcr = num(v.pcr);
    const vsg = num(v.vsg);
    if (pcr === null && vsg === null) {
      return { cumple: null, resultado: "Sospecha de Kawasaki incompleto", detalle: [...detalle, "Cargar PCR y VSG para seguir el algoritmo."] };
    }
    const inflamacion = (pcr !== null && pcr >= 3) || (vsg !== null && vsg >= 40);
    if (!inflamacion) {
      return { cumple: false, resultado: "Kawasaki incompleto poco probable por ahora", detalle: [...detalle, "PCR < 3 mg/dL y VSG < 40 mm/h: reevaluar en forma seriada. Si la fiebre persiste, pedir ecocardiograma. Si aparece descamación típica, pedir ecocardiograma."] };
    }
    const labs = LAB_KW.filter((k) => si(v[k])).length;
    detalle.push(`Criterios de laboratorio complementarios: ${labs} de 6.`);
    if (labs >= 3 || si(v.eco)) {
      return { cumple: true, resultado: "Kawasaki incompleto: tratar", detalle: [...detalle, labs >= 3 ? "≥ 3 criterios de laboratorio: tratar y pedir ecocardiograma." : "Ecocardiograma positivo: tratar."] };
    }
    return { cumple: null, resultado: "Kawasaki incompleto: pedir ecocardiograma", detalle: [...detalle, "< 3 criterios de laboratorio: pedir ecocardiograma; si es positivo, tratar. Si es negativo y la fiebre persiste, repetirlo."] };
  },
};

// ------------------------------------- Vasculitis IgA (Schönlein-Henoch)
// Ozen S, et al. Ann Rheum Dis 2010;69:798-806 (EULAR/PRINTO/PRES).

const iga = {
  id: "iga",
  nombre: "Vasculitis IgA · Schönlein-Henoch (EULAR/PRINTO/PRES)",
  corto: "Schönlein-Henoch",
  fuente: "Ozen S, et al. Ann Rheum Dis 2010;69:798-806.",
  nota: "La púrpura es obligatoria. Si tiene una distribución atípica, hace falta una biopsia con depósitos de IgA.",
  campos: [
    { id: "purpura", tipo: "check", grupo: "Criterio obligatorio", texto: "Púrpura palpable o petequias con predominio en miembros inferiores" },
    { id: "atipica", tipo: "check", grupo: "Criterio obligatorio", texto: "Distribución atípica de la púrpura" },
    { id: "dolorAbdominal", tipo: "check", grupo: "Al menos uno", texto: "Dolor abdominal difuso, cólico, de comienzo agudo" },
    { id: "biopsiaIgA", tipo: "check", grupo: "Al menos uno", texto: "Biopsia: vasculitis leucocitoclástica o glomerulonefritis con depósitos de IgA" },
    { id: "articular", tipo: "check", grupo: "Al menos uno", texto: "Artritis o artralgias agudas" },
    { id: "renal", tipo: "check", grupo: "Al menos uno", texto: "Proteinuria > 0,3 g/24 h o hematuria (> 5 GR por campo o cilindros hemáticos)" },
  ],
  evaluar(v) {
    if (!si(v.purpura)) return { cumple: false, resultado: "No cumple el criterio obligatorio", detalle: ["Hace falta púrpura o petequias."] };
    if (si(v.atipica) && !si(v.biopsiaIgA)) {
      return { cumple: false, resultado: "Falta biopsia con IgA", detalle: ["Con distribución atípica de la púrpura hace falta demostrar depósitos de IgA."] };
    }
    const n = ["dolorAbdominal", "biopsiaIgA", "articular", "renal"].filter((k) => si(v[k])).length;
    return n >= 1
      ? { cumple: true, resultado: "Clasifica como vasculitis IgA", detalle: [`Púrpura y ${n} de 4 criterios.`] }
      : { cumple: false, resultado: "No clasifica como vasculitis IgA", detalle: ["Además de la púrpura hace falta al menos 1 de los 4 criterios."] };
  },
};

// --------------------------------------------- Síndrome de activación macrofágica
// Ravelli AM, et al. Ann Rheum Dis 2016;75:481-9 (EULAR/ACR/PRINTO).

const sam = {
  id: "sam",
  nombre: "Síndrome de activación macrofágica en AIJ sistémica (2016)",
  corto: "SAM · AIJ sistémica",
  fuente: "Ravelli AM, et al. Ann Rheum Dis 2016;75:481-9.",
  nota: "Para un paciente febril con AIJ sistémica conocida o sospechada. Los criterios no se aplican si tiene otra causa de los cambios de laboratorio (por ejemplo, plaquetopenia inmune o hepatitis infecciosa).",
  campos: [
    { id: "febril", tipo: "check", grupo: "Contexto", texto: "Paciente febril con AIJ sistémica conocida o sospechada" },
    { id: "ferritina", tipo: "numero", grupo: "Laboratorio", texto: "Ferritina", unidad: "ng/mL", min: 0 },
    { id: "plaquetas", tipo: "numero", grupo: "Laboratorio", texto: "Plaquetas", unidad: "×10³/mm³", min: 0 },
    { id: "got", tipo: "numero", grupo: "Laboratorio", texto: "TGO (AST)", unidad: "U/L", min: 0 },
    { id: "trigliceridos", tipo: "numero", grupo: "Laboratorio", texto: "Triglicéridos", unidad: "mg/dL", min: 0 },
    { id: "fibrinogeno", tipo: "numero", grupo: "Laboratorio", texto: "Fibrinógeno", unidad: "mg/dL", min: 0 },
  ],
  evaluar(v) {
    if (!si(v.febril)) return { cumple: false, resultado: "No aplica", detalle: ["Los criterios son para un paciente febril con AIJ sistémica conocida o sospechada."] };
    const ferritina = num(v.ferritina);
    if (ferritina === null) return { cumple: null, resultado: "Faltan datos", detalle: ["Cargar la ferritina."] };
    const otros = [
      ["Plaquetas ≤ 181 ×10³/mm³", num(v.plaquetas), (x) => x <= 181],
      ["TGO > 48 U/L", num(v.got), (x) => x > 48],
      ["Triglicéridos > 156 mg/dL", num(v.trigliceridos), (x) => x > 156],
      ["Fibrinógeno ≤ 360 mg/dL", num(v.fibrinogeno), (x) => x <= 360],
    ];
    const presentes = otros.filter(([, x, f]) => x !== null && f(x)).map(([t]) => t);
    const faltantes = otros.filter(([, x]) => x === null).length;
    const detalle = [`Ferritina ${ferritina > 684 ? ">" : "≤"} 684 ng/mL.`, presentes.length ? `Presentes: ${presentes.join(", ")}.` : "Ningún otro criterio presente."];
    if (ferritina > 684 && presentes.length >= 2) return { cumple: true, resultado: "Clasifica como síndrome de activación macrofágica", detalle };
    if (ferritina > 684 && presentes.length + faltantes >= 2) {
      return { cumple: null, resultado: "Faltan datos", detalle: [...detalle, "Completar el resto del laboratorio."] };
    }
    return { cumple: false, resultado: "No clasifica como síndrome de activación macrofágica", detalle: [...detalle, "Hacen falta ferritina > 684 ng/mL y 2 de los otros 4 criterios."] };
  },
};

export const CRITERIOS = [aij, les, kawasaki, iga, sam];
