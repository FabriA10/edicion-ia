// Parte el crudo en pasadas delimitadas por silencio real.
//
// Es el primer paso de la selección de tomas, y el que más tiempo ahorra: cada
// línea que sale de acá **ya es un corte válido**, porque arranca y termina en
// silencio por construcción. Elegir sobre esta lista en vez de sobre tiempos
// sueltos de Whisper es lo que hace que la revisión de bordes dé cero avisos.
//
//   node scripts/pasadas.mjs trabajo/vNN/mic16.wav > pasadas.json
//   node scripts/pasadas.mjs trabajo/vNN/mic16.wav 0 120     (ver un tramo)
//
// El umbral se calibra solo contra el modo de nivel de la voz del archivo, que
// es lo único que se mantiene entre un micrófono de estudio con compuerta y el
// del celular con el ruido de sala a -55 dB.
//
// Después de esto va la transcripción de CADA pasada por separado (ver
// `references/cortes.md`, "el menú de pasadas"): sobre el recorte exacto Whisper
// clava las palabras, sobre el archivo entero las funde.

import { readFileSync, writeFileSync } from "node:fs";

const [RUTA, DESDE, HASTA] = process.argv.slice(2);
if (!RUTA) {
  console.error("uso: node pasadas.mjs <wav> [desde] [hasta]");
  process.exit(2);
}

const HOP = 0.01;
const HUECO = 0.22; // silencio que separa una pasada de la siguiente
const MINIMO = 0.25; // más corto que esto es un ruido, no una pasada
const BAJO_LA_VOZ = 13.5; // mismo offset que scripts/revisar-bloques.mjs

const leerWav = (ruta) => {
  const b = readFileSync(ruta);
  let pos = 12, sr = 48000, datos = null, canales = 1;
  while (pos + 8 <= b.length) {
    const id = b.toString("ascii", pos, pos + 4);
    const tam = b.readUInt32LE(pos + 4);
    const cuerpo = pos + 8;
    if (id === "fmt ") { canales = b.readUInt16LE(cuerpo + 2); sr = b.readUInt32LE(cuerpo + 4); }
    else if (id === "data") { datos = { desde: cuerpo, tam: Math.min(tam, b.length - cuerpo) }; break; }
    pos = cuerpo + tam + (tam % 2);
  }
  const n = Math.floor(Math.floor(datos.tam / 2) / canales);
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) m[i] = b.readInt16LE(datos.desde + i * canales * 2) / 32768;
  return { m, sr };
};

const { m, sr } = leerWav(RUTA);
const paso = Math.round(HOP * sr);
const env = [];
for (let i = 0; i + paso <= m.length; i += paso) {
  let s = 0;
  for (let j = 0; j < paso; j++) s += m[i + j] ** 2;
  env.push(20 * Math.log10(Math.sqrt(s / paso) + 1e-9));
}

// Modo de la voz: el pico del histograma por encima de -30 dB.
const cubos = new Array(90).fill(0);
for (const db of env) { const k = Math.floor(db + 90); if (k >= 0 && k < 90) cubos[k]++; }
let modo = -12, cuenta = -1;
for (let k = 60; k < 90; k++) if (cubos[k] > cuenta) { cuenta = cubos[k]; modo = k - 90 + 0.5; }
const UMBRAL = modo - BAJO_LA_VOZ;

const pasadas = [];
let inicio = null, ultima = 0, mudo = 0;
env.forEach((db, i) => {
  const t = i * HOP;
  if (db >= UMBRAL) {
    if (inicio === null) inicio = t;
    ultima = t;
    mudo = 0;
  } else if (inicio !== null && ++mudo * HOP > HUECO) {
    if (ultima - inicio >= MINIMO) pasadas.push([+inicio.toFixed(2), +(ultima + 0.02).toFixed(2)]);
    inicio = null;
  }
});
if (inicio !== null && ultima - inicio >= MINIMO) pasadas.push([+inicio.toFixed(2), +(ultima + 0.02).toFixed(2)]);

const salida = RUTA.replace(/[^/\\]+$/, "pasadas.json");
writeFileSync(salida, JSON.stringify(pasadas), "utf8");
console.error(`voz en ${modo.toFixed(1)} dB, umbral ${UMBRAL.toFixed(1)} → ${pasadas.length} pasadas`);
console.error(`escrito ${salida}`);

const a = parseFloat(DESDE ?? "0"), b = parseFloat(HASTA ?? "1e9");
for (const [i, f] of pasadas) if (i >= a && i <= b) console.log(`  ${i.toFixed(2)} - ${f.toFixed(2)}   (${(f - i).toFixed(2)} s)`);
