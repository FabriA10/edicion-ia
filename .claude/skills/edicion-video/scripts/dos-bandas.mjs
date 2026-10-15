// Muestra la envolvente en las dos bandas a la vez, alineadas por tiempo.
//
//   node dos-bandas.mjs audio.wav 917.0 0.9
//
// La banda completa dice dónde están las vocales; la de agudos dice dónde están
// las eses. Mirar sólo la completa es lo que deja palabras cortadas: una /s/
// final puede estar 40 dB abajo de la vocal y no aparecer, y el silencio de una
// oclusiva (/k/, /t/, /p/) se ve igual que el final de la frase.
//
// Columnas: tiempo | dB banda completa | V si supera el umbral de voz |
//           dB arriba de 4 kHz | S si hay sibilante.

import { envolvente, UMBRAL_VOZ } from "./envolvente.mjs";

const [archivo, desde, dur] = process.argv.slice(2);
if (!archivo) {
  console.error("uso: node dos-bandas.mjs <audio.wav> <desde> [dur]");
  process.exit(1);
}

const d = parseFloat(desde);
const n = parseFloat(dur ?? "1.0");
const completa = envolvente(archivo, d, n);
const agudos = envolvente(archivo, d, n, { agudos: true });

// El umbral de sibilante va contra el piso real de la banda, no contra un número
// fijo: una ese de final de frase puede picar a -52 dB y ser clarísima si el
// piso está en -91.
const orden = agudos.map((e) => e.db).sort((a, b) => a - b);
const piso = orden[Math.floor(orden.length * 0.1)];
const umbralSibilante = Math.max(piso + 25, -70);

console.log(`piso de agudos ${piso.toFixed(1)} dB | sibilante desde ${umbralSibilante.toFixed(1)} dB`);
console.log("   t      completa           >4 kHz");
for (let i = 0; i < completa.length; i++) {
  const c = completa[i];
  const a = agudos[i] ?? { db: -120 };
  const barra = (db) => "#".repeat(Math.max(0, Math.round((db + 70) / 3)));
  console.log(
    `${c.t.toFixed(2)} ${c.db.toFixed(1).padStart(6)}${c.db >= UMBRAL_VOZ ? " V" : "  "} ${barra(c.db).padEnd(16)} ` +
      `${a.db.toFixed(1).padStart(6)}${a.db >= umbralSibilante ? " S" : "  "} ${barra(a.db)}`,
  );
}
