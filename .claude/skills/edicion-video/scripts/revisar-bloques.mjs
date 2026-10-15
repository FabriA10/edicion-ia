// Revisión de los bordes de TODOS los bloques, antes de renderizar.
//
// Existe porque las cinco correcciones del video 4 eran el mismo defecto y todas
// se podían ver sin escuchar el video: el corte entraba o salía adentro de una
// corrida de voz, apoyado en un bajón de nivel de uno o dos cuadros, y arrastraba
// un pedazo de la palabra vecina ("dem la sexta es", "dial que responde",
// "afía o una tomografía").
//
// La verificación que ya estaba en la skill —transcribir el render de vuelta— no
// los agarra, porque el texto sale entero igual. Ésta sí, y corre en segundos
// contra el wav del micrófono, antes de gastar diez minutos de render.
//
//   node scripts/revisar-bloques.mjs <mic.wav> <src/cortes-04.ts>
//
// Devuelve código 1 si hay algo que mirar, así se puede encadenar antes del
// render.

import { readFileSync } from "node:fs";

const [RUTA_WAV, RUTA_CORTES] = process.argv.slice(2);
if (!RUTA_WAV || !RUTA_CORTES) {
  console.error("uso: node revisar-bloques.mjs <mic.wav> <cortes.ts|cortes.json>");
  process.exit(2);
}

// Los umbrales NO son fijos: se calibran contra el material.
//
// Los números de abajo salieron del video 4 —micrófono de estudio con compuerta
// de OBS, voz en -12,5 dB—, y contra ese corte encontraron los cinco defectos
// que marcó Isaias más uno que se le había pasado. Pero el video 6 se grabó con
// el micrófono del celular, sin compuerta: la voz está en -15,5 y el piso de
// sala en -55 en vez de silencio digital. Copiar los umbrales tal cual lo
// dejaba ciego.
//
// Entonces se guarda la DISTANCIA de cada umbral al modo de la voz, que es lo
// que se mantiene de un video a otro, y el modo se mide acá abajo.
const BAJO_LA_VOZ = {
  voz: 13.5,      // por debajo de esto ya no es voz sostenida
  resto: 15.5,    // un resto audible de la palabra anterior
  caida: 22.5,    // la cola de la última palabra ya cayó
  piso: 32.5,     // debajo de esto es sala, no señal
};

const SILENCIO_ANTES = 0.10;
const SILENCIO_DESPUES = 0.06;
const DESVIO_NIVEL = 5; // dB por debajo de la mediana que enciende la alarma
const MINIMO_RESTO = 0.02; // 20 ms: menos que eso es un chasquido, no una sílaba

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
  const total = Math.floor(datos.tam / 2);
  const n = Math.floor(total / canales);
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) m[i] = b.readInt16LE(datos.desde + i * canales * 2) / 32768;
  return { m, sr };
};

const AUDIO = leerWav(RUTA_WAV);
const HOP = 0.01;

/** Nivel RMS en dB de la ventana de 10 ms que arranca en t. */
const nivel = (t) => {
  const paso = Math.round(HOP * AUDIO.sr);
  const i0 = Math.round(t * AUDIO.sr);
  if (i0 < 0 || i0 + paso > AUDIO.m.length) return -120;
  let s = 0;
  for (let j = 0; j < paso; j++) s += AUDIO.m[i0 + j] ** 2;
  return 20 * Math.log10(Math.sqrt(s / paso) + 1e-9);
};

const tramo = (desde, dur) => {
  const out = [];
  for (let k = 0; k < Math.round(dur / HOP); k++) out.push({ t: +(desde + k * HOP).toFixed(3), db: nivel(desde + k * HOP) });
  return out;
};

// El modo de la voz: el pico del histograma de niveles por encima de -30 dB.
// Es más estable que la mediana, que se mueve con cuánto silencio tiene el
// crudo, y que el pico, que se mueve con un solo golpe al micrófono.
const modoDeVoz = () => {
  const paso = Math.round(HOP * AUDIO.sr);
  const cubos = new Array(90).fill(0);
  for (let i = 0; i + paso <= AUDIO.m.length; i += paso) {
    let s = 0;
    for (let j = 0; j < paso; j++) s += AUDIO.m[i + j] ** 2;
    const db = 20 * Math.log10(Math.sqrt(s / paso) + 1e-9);
    const k = Math.floor(db + 90);
    if (k >= 0 && k < 90) cubos[k]++;
  }
  let mejor = -12, cuenta = -1;
  for (let k = 60; k < 90; k++) if (cubos[k] > cuenta) { cuenta = cubos[k]; mejor = k - 90 + 0.5; }
  return mejor;
};

const VOZ_MODO = modoDeVoz();
const VOZ = VOZ_MODO - BAJO_LA_VOZ.voz;
const RESTO_AUDIBLE = VOZ_MODO - BAJO_LA_VOZ.resto;
const CAIDA_FINAL = VOZ_MODO - BAJO_LA_VOZ.caida;
const PISO = VOZ_MODO - BAJO_LA_VOZ.piso;

const texto = readFileSync(RUTA_CORTES, "utf8");
const bloque = texto.match(/export const CORTES[^=]*=\s*(\[[\s\S]*?\n\]);/);
const CORTES = JSON.parse(bloque ? bloque[1] : texto);

const medianas = CORTES.map((c) => {
  const e = tramo(c.desde, c.hasta - c.desde).map((x) => x.db).filter((d) => d > PISO).sort((a, b) => a - b);
  return e.length ? e[Math.floor(e.length * 0.5)] : -120;
});
const ordenadas = [...medianas].sort((a, b) => a - b);
const mediana = ordenadas[Math.floor(ordenadas.length / 2)];

let avisos = 0;
const aviso = (i, txt) => { avisos++; console.log(`  [${String(i).padStart(2)}] ${txt}`); };

console.log(`revisando ${CORTES.length} bloques contra ${RUTA_WAV}`);
console.log(
  `voz en ${VOZ_MODO.toFixed(1)} dB → umbrales: voz ${VOZ.toFixed(1)}, ` +
    `resto ${RESTO_AUDIBLE.toFixed(1)}, cola ${CAIDA_FINAL.toFixed(1)}, piso ${PISO.toFixed(1)}`,
);
console.log(`mediana de nivel del corte: ${mediana.toFixed(1)} dB\n`);

CORTES.forEach((c, i) => {
  // --- 1. ¿Hay silencio de verdad antes de la entrada?
  const antes = tramo(c.desde - SILENCIO_ANTES, SILENCIO_ANTES);
  const ruidoAntes = antes.filter((x) => x.db > RESTO_AUDIBLE);
  if (ruidoAntes.length * HOP >= MINIMO_RESTO) {
    const pico = Math.max(...ruidoAntes.map((x) => x.db));
    // Dos defectos distintos con el mismo síntoma, y el arreglo va para lados
    // opuestos: si la señal llega pegada al corte, le estás comiendo el arranque
    // a la primera palabra y hay que ADELANTAR la entrada; si hay un resto y
    // después silencio, es cola de la palabra anterior y hay que ATRASARLA.
    const pegada = antes[antes.length - 1].db > RESTO_AUDIBLE;
    if (pegada) {
      let arranque = c.desde;
      for (let k = antes.length - 1; k >= 0; k--) {
        if (antes[k].db > RESTO_AUDIBLE) arranque = antes[k].t;
        else break;
      }
      aviso(i, `ENTRADA tardía: la palabra arranca en ${arranque.toFixed(3)} y el corte entra en ` +
        `${c.desde}, o sea ${Math.round((c.desde - arranque) * 1000)} ms después. Le come el ataque. ` +
        `Entrá en ${arranque.toFixed(2)}.`);
    } else {
      aviso(i, `ENTRADA sin silencio: ${ruidoAntes.length * 10} ms con señal antes de ${c.desde} ` +
        `(pico ${pico.toFixed(1)} dB) y después silencio. Es cola de la palabra anterior: atrasá la entrada.`);
    }
  }

  // --- 2. ¿La salida corta adentro de una corrida de voz?
  const despues = tramo(c.hasta, SILENCIO_DESPUES);
  const vozDespues = despues.filter((x) => x.db > VOZ);
  if (vozDespues.length) {
    aviso(i, `SALIDA adentro de voz: sigue habiendo habla ${vozDespues.length * 10} ms después de ${c.hasta}. ` +
      `O la frase no terminó, o el corte parte una palabra.`);
  }

  // --- 3. ¿La última palabra terminó de caer?
  // Sólo importa en el ÚLTIMO bloque, que es el único cuya cola queda al
  // descubierto: en todos los demás el bloque siguiente arranca pegado —los
  // tramos se ponen uno atrás del otro, sin aire— y la tapa.
  //
  // Antes esto se decidía mirando si en el CRUDO había silencio después del
  // corte, y eso era mirar el lugar equivocado: en el crudo todos los bloques
  // terminan en una pausa, porque justamente por eso son bloques. Con el
  // micrófono de estudio no se notaba —la compuerta de OBS cortaba la cola de
  // golpe y todo pasaba— pero con el micrófono del celular, que deja la cola
  // caer despacio hasta el ruido de sala, saltaban trece avisos de trece
  // cortes sanos.
  const cierra = i === CORTES.length - 1;
  const cola = tramo(c.hasta - 0.02, 0.05);
  const dbCola = Math.min(...cola.map((x) => x.db));
  if (cierra && dbCola > CAIDA_FINAL && !vozDespues.length) {
    aviso(i, `COLA cortada: este bloque cierra una idea y la última palabra todavía está en ` +
      `${dbCola.toFixed(1)} dB en ${c.hasta}. Estirá la salida hasta que baje de ${CAIDA_FINAL} dB.`);
  }

  // --- 4. ¿Este bloque está mucho más bajo que el resto?
  if (medianas[i] < mediana - DESVIO_NIVEL) {
    aviso(i, `NIVEL bajo: mediana ${medianas[i].toFixed(1)} dB contra ${mediana.toFixed(1)} del video. ` +
      `Se alejó del micrófono; buscá otra pasada de esa frase.`);
  }
});

console.log(avisos === 0
  ? "\nsin avisos: todos los bloques entran y salen en silencio y están a nivel."
  : `\n${avisos} aviso(s) que mirar antes de renderizar.`);
process.exit(avisos === 0 ? 0 : 1);
