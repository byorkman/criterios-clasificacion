import { test } from "node:test";
import assert from "node:assert/strict";
import { CRITERIOS } from "../src/criterios.js";

const c = (id) => CRITERIOS.find((x) => x.id === id);
const AIJ = { edad16: true, seisSemanas: true };

test("cada criterio tiene campos con id único, fuente y evaluación", () => {
  for (const cr of CRITERIOS) {
    assert.ok(cr.fuente && cr.nombre && cr.corto, cr.id);
    const ids = cr.campos.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, cr.id);
    const r = cr.evaluar({});
    assert.ok([true, false, null].includes(r.cumple), cr.id);
    assert.ok(Array.isArray(r.detalle), cr.id);
  }
});

test("AIJ: sin requisitos no es AIJ", () => {
  assert.equal(c("aij").evaluar({ articulaciones: 2 }).cumple, false);
});

test("AIJ: oligoarticular persistente y extendida", () => {
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 2 }).resultado, "AIJ oligoarticular persistente");
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 3, extendida: true }).resultado, "AIJ oligoarticular extendida");
});

test("AIJ: poliarticular según FR", () => {
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 6 }).resultado, "AIJ poliarticular FR negativo");
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 6, fr: true }).resultado, "AIJ poliarticular FR positivo");
});

test("AIJ: sistémica necesita fiebre y un signo sistémico", () => {
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 1, fiebre: true, rash: true }).resultado, "AIJ sistémica");
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 1, fiebre: true }).resultado, "AIJ oligoarticular persistente");
});

test("AIJ: psoriasis excluye oligo y da psoriásica", () => {
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 2, psoriasis: true }).resultado, "AIJ artritis psoriásica");
  // Sin psoriasis propia ni familiar no se excluye la oligoartritis: ILAR la deja indiferenciada.
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 2, dactilitis: true, unas: true }).resultado, "AIJ indiferenciada");
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 2, dactilitis: true, familiarPsoriasis: true }).resultado, "AIJ artritis psoriásica");
});

test("AIJ: entesitis da artritis relacionada con entesitis", () => {
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 2, entesitis: true }).resultado, "AIJ artritis relacionada con entesitis");
  assert.equal(c("aij").evaluar({ ...AIJ, articulaciones: 2, hlab27: true, varonMayor6: true }).resultado, "AIJ artritis relacionada con entesitis");
});

test("AIJ: psoriasis y entesitis juntas es indiferenciada", () => {
  const r = c("aij").evaluar({ ...AIJ, articulaciones: 2, psoriasis: true, entesitis: true });
  assert.equal(r.resultado, "AIJ indiferenciada");
});

test("LES: sin ANA no se aplica", () => {
  assert.equal(c("les").evaluar({ lupusAgudo: true, antiDNA: true }).cumple, false);
});

test("LES: suma el mayor ítem de cada dominio", () => {
  const r = c("les").evaluar({ ana: true, alopecia: true, lupusAgudo: true, c3oc4: true, c3yc4: true });
  assert.equal(r.puntaje, 10);
  assert.equal(r.cumple, true);
});

test("LES: hace falta un criterio clínico", () => {
  const r = c("les").evaluar({ ana: true, antiDNA: true, c3yc4: true, aaf: true });
  assert.equal(r.puntaje, 12);
  assert.equal(r.cumple, false);
});

test("Kawasaki completo con 4 criterios y 5 días", () => {
  const r = c("kawasaki").evaluar({ diasFiebre: 5, conjuntivas: true, boca: true, exantema: true, adenopatia: true });
  assert.equal(r.resultado, "Kawasaki completo");
});

test("Kawasaki incompleto: tratar con 3 criterios de laboratorio", () => {
  const r = c("kawasaki").evaluar({ diasFiebre: 6, conjuntivas: true, boca: true, pcr: 5, anemia: true, albumina: true, leucocitos: true });
  assert.equal(r.resultado, "Kawasaki incompleto: tratar");
});

test("Kawasaki incompleto: con PCR y VSG bajas se reevalúa", () => {
  const r = c("kawasaki").evaluar({ diasFiebre: 6, conjuntivas: true, boca: true, pcr: 1, vsg: 20 });
  assert.equal(r.cumple, false);
});

test("Kawasaki incompleto: pocos laboratorios pide ecocardiograma", () => {
  const r = c("kawasaki").evaluar({ diasFiebre: 6, conjuntivas: true, exantema: true, vsg: 60, anemia: true });
  assert.equal(r.resultado, "Kawasaki incompleto: pedir ecocardiograma");
});

test("Schönlein-Henoch: púrpura más un criterio", () => {
  assert.equal(c("iga").evaluar({ purpura: true, articular: true }).cumple, true);
  assert.equal(c("iga").evaluar({ purpura: true }).cumple, false);
  assert.equal(c("iga").evaluar({ purpura: true, atipica: true, articular: true }).cumple, false);
  assert.equal(c("iga").evaluar({ purpura: true, atipica: true, biopsiaIgA: true }).cumple, true);
});

test("SAM: ferritina > 684 y 2 criterios", () => {
  const base = { febril: true, ferritina: 1500 };
  assert.equal(c("sam").evaluar({ ...base, plaquetas: 150, got: 80, trigliceridos: 100, fibrinogeno: 400 }).cumple, true);
  assert.equal(c("sam").evaluar({ ...base, plaquetas: 250, got: 80, trigliceridos: 100, fibrinogeno: 400 }).cumple, false);
  assert.equal(c("sam").evaluar({ ...base, got: 80 }).cumple, null);
  assert.equal(c("sam").evaluar({ febril: true, ferritina: 500, plaquetas: 100, got: 100 }).cumple, false);
});
