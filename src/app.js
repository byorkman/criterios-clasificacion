import { CRITERIOS } from "./criterios.js";

const selector = document.getElementById("selector");
const titulo = document.getElementById("titulo");
const nota = document.getElementById("nota");
const form = document.getElementById("form");
const resultado = document.getElementById("resultado");
const fuente = document.getElementById("fuente");
const estado = document.getElementById("estado");

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
let actual = CRITERIOS[0];

selector.innerHTML = CRITERIOS.map((c) =>
  `<button type="button" class="chip" data-id="${c.id}">${esc(c.corto)}</button>`).join("");

function campo(c) {
  if (c.tipo === "check") {
    const puntos = c.puntos ? ` <span class="puntos">${c.puntos}</span>` : "";
    return `<label class="check"><input type="checkbox" name="${c.id}"> <span>${esc(c.texto)}${puntos}</span></label>`;
  }
  const unidad = c.unidad ? ` <span class="rango">${esc(c.unidad)}</span>` : "";
  return `<div class="campo"><label for="c-${c.id}">${esc(c.texto)}${unidad}</label>
    <input type="number" id="c-${c.id}" name="${c.id}" inputmode="decimal" min="${c.min ?? 0}" step="any"></div>`;
}

function mostrar(criterio) {
  actual = criterio;
  for (const b of selector.children) b.setAttribute("aria-pressed", String(b.dataset.id === criterio.id));
  titulo.textContent = criterio.nombre;
  nota.textContent = criterio.nota;
  fuente.textContent = `Fuente: ${criterio.fuente}`;
  const grupos = [...new Set(criterio.campos.map((c) => c.grupo))];
  form.innerHTML = grupos.map((g) => `<fieldset><legend>${esc(g)}</legend>
    ${criterio.campos.filter((c) => c.grupo === g).map(campo).join("")}</fieldset>`).join("");
  estado.textContent = "";
  evaluar();
}

function valores() {
  const v = {};
  for (const c of actual.campos) {
    const el = form.elements[c.id];
    if (c.tipo === "check") v[c.id] = el.checked;
    else v[c.id] = el.value.trim() === "" ? null : Number(el.value.replace(",", "."));
  }
  return v;
}

function texto(r) {
  return `${actual.nombre}: ${r.resultado}.${r.detalle.length ? " " + r.detalle.join(" ") : ""}`;
}

let ultimo = null;
function evaluar() {
  const r = actual.evaluar(valores());
  ultimo = r;
  const clase = r.cumple === true ? "si" : r.cumple === false ? "no" : "falta";
  resultado.className = `resultado ${clase}`;
  resultado.innerHTML = `<strong>${esc(r.resultado)}</strong>
    ${r.detalle.length ? `<ul>${r.detalle.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}`;
}

selector.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-id]");
  if (b) mostrar(CRITERIOS.find((c) => c.id === b.dataset.id));
});
form.addEventListener("input", evaluar);
form.addEventListener("change", evaluar);

document.getElementById("copiar").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(texto(ultimo));
    estado.textContent = "Resultado copiado.";
  } catch {
    estado.textContent = "No se pudo copiar.";
  }
});
document.getElementById("limpiar").addEventListener("click", () => {
  form.reset();
  estado.textContent = "";
  evaluar();
});

mostrar(CRITERIOS[0]);
