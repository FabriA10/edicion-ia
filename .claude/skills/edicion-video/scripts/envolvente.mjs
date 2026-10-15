// Mide la envolvente de voz de un audio en ventanas de 10 ms.
//
// silencedetect sólo dice "hay o no hay sonido" contra un umbral fijo; esto da el
// nivel real cuadro a cuadro, que es lo que hace falta para poner el corte justo
// donde arranca la voz y justo antes de que la última palabra termine de caer.
//
// Uso directo, para mirar una zona:
//   node envolvente.mjs audio.wav 252.6 1.0
//   node envolvente.mjs audio.wav 252.6 1.0 --agudos    (filtra >4 kHz: sibilantes)
//
// Uso como módulo:
//   import { envolvente, UMBRAL_VOZ } from "./envolvente.mjs";

import { execFileSync } from "child_process";

export const HOP = 0.01; // 10 ms por ventana
const MUESTRAS_POR_HOP = 160; // 10 ms a 16 kHz

// El piso de ruido de la sala de Isaias ronda los -66 dB y es muy parejo, así que
// un umbral absoluto funciona mejor que recalcularlo por ventana: las ventanas que
// son casi todas voz dan un piso falsamente alto y se pierde el final de la frase.
// Medilo de nuevo con pisoDeRuido() si cambia el lugar de grabación.
export const UMBRAL_VOZ = -50;

/**
 * Nivel RMS por ventana de 10 ms.
 * @param {string} archivo  wav mono 16 kHz
 * @param {number} desde    segundos
 * @param {number} dur      segundos
 * @param {{agudos?: boolean}} opciones  agudos: filtra por arriba de 4 kHz
 * @returns {{t: number, db: number}[]}
 */
export const envolvente = (archivo, desde, dur, opciones = {}) => {
  const filtros = [
    opciones.agudos ? "highpass=f=4000" : null,
    `asetnsamples=${MUESTRAS_POR_HOP}`,
    "astats=metadata=1:reset=1",
    "ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-",
  ]
    .filter(Boolean)
    .join(",");

  const salida = execFileSync(
    "ffmpeg",
    ["-ss", String(desde), "-t", String(dur), "-i", archivo, "-af", filtros, "-f", "null", "-"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 },
  );

  const niveles = [];
  for (const linea of salida.split(/\r?\n/)) {
    const m = linea.match(/RMS_level=(-?[0-9.]+|-inf)/);
    if (m) niveles.push(m[1] === "-inf" ? -120 : parseFloat(m[1]));
  }
  return niveles.map((db, i) => ({ t: +(desde + i * HOP).toFixed(3), db }));
};

/** Piso de ruido de la sala. Pasale una pausa larga y real del crudo. */
export const pisoDeRuido = (archivo, desde, dur) => {
  const orden = envolvente(archivo, desde, dur)
    .map((e) => e.db)
    .sort((a, b) => a - b);
  return orden[Math.floor(orden.length * 0.5)];
};

if (process.argv[1]?.endsWith("envolvente.mjs")) {
  const [archivo, desde, dur] = process.argv.slice(2);
  if (!archivo) {
    console.error("uso: node envolvente.mjs <audio.wav> <desde> [dur] [--agudos]");
    process.exit(1);
  }
  const agudos = process.argv.includes("--agudos");
  const env = envolvente(archivo, parseFloat(desde), parseFloat(dur ?? "1.5"), { agudos });

  console.log(agudos ? "banda >4 kHz (sibilantes)" : "banda completa");
  for (const e of env) {
    const barra = "#".repeat(Math.max(0, Math.round((e.db + 70) / 2)));
    const marca = e.db >= UMBRAL_VOZ ? "voz " : "    ";
    console.log(`${e.t.toFixed(2)} ${e.db.toFixed(1).padStart(6)} ${marca}${barra}`);
  }
}
