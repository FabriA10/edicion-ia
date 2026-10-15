// Mide la entonación al final de una frase: si el tono sube, la oración quedó
// abierta (iba a seguir hablando); si baja, cerró.
//
// Es un criterio que no se ve en la envolvente: una toma puede tener el audio
// perfecto, la frase completa y el corte bien medido, y aun así sonar mal porque
// terminó en agudo. Al oído se percibe como que falta algo.
//
//   node entonacion.mjs audio.wav 480.78 484.49
//
// Estima el tono por autocorrelación sobre ventanas de 40 ms. Para voz masculina
// el rango útil es 70-400 Hz; lo que queda fuera se descarta por no ser voz.

import { execFileSync } from "child_process";

const SR = 16000;
const VENTANA = 640; // 40 ms
const SALTO = 160; // 10 ms
const LAG_MIN = Math.floor(SR / 400); // 400 Hz
const LAG_MAX = Math.floor(SR / 70); // 70 Hz
const CLARIDAD_MIN = 0.3;

const leerPcm = (archivo, desde, dur) => {
  const bruto = execFileSync(
    "ffmpeg",
    [
      "-ss", String(desde),
      "-t", String(dur),
      "-i", archivo,
      "-f", "s16le",
      "-acodec", "pcm_s16le",
      "-ac", "1",
      "-ar", String(SR),
      "-",
    ],
    { stdio: ["ignore", "pipe", "ignore"], maxBuffer: 256 * 1024 * 1024 },
  );
  const n = Math.floor(bruto.length / 2);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = bruto.readInt16LE(i * 2) / 32768;
  return x;
};

export const tono = (archivo, desde, dur) => {
  const x = leerPcm(archivo, desde, dur);
  const puntos = [];

  for (let ini = 0; ini + VENTANA < x.length; ini += SALTO) {
    // Media cero: si no, la autocorrelación se domina por el offset.
    let media = 0;
    for (let i = 0; i < VENTANA; i++) media += x[ini + i];
    media /= VENTANA;

    let energia = 0;
    for (let i = 0; i < VENTANA; i++) {
      const v = x[ini + i] - media;
      energia += v * v;
    }
    const rms = Math.sqrt(energia / VENTANA);

    let mejorLag = 0;
    let mejorR = 0;
    for (let lag = LAG_MIN; lag <= LAG_MAX; lag++) {
      let num = 0;
      let den1 = 0;
      let den2 = 0;
      for (let i = 0; i + lag < VENTANA; i++) {
        const a = x[ini + i] - media;
        const b = x[ini + i + lag] - media;
        num += a * b;
        den1 += a * a;
        den2 += b * b;
      }
      const r = num / (Math.sqrt(den1 * den2) || 1);
      if (r > mejorR) {
        mejorR = r;
        mejorLag = lag;
      }
    }

    const sonoro = mejorR >= CLARIDAD_MIN && rms > 0.004;
    puntos.push({
      t: +(desde + ini / SR).toFixed(3),
      f0: sonoro ? +(SR / mejorLag).toFixed(1) : null,
      claridad: +mejorR.toFixed(2),
      rms: +(20 * Math.log10(rms || 1e-9)).toFixed(1),
    });
  }
  return puntos;
};

// Pendiente del tono en la parte final, en semitonos por segundo. Se usa escala
// musical y no Hz porque la percepción de "sube" o "baja" es logarítmica.
// Los últimos cuadros de una frase, con la voz ya apagándose, dan lecturas basura:
// la autocorrelación engancha un armónico y aparecen saltos a 200-400 Hz que no
// existen. Se reconocen por la claridad baja, así que se descartan antes de medir.
const CLARIDAD_CONFIABLE = 0.6;

export const cierre = (puntos, ventanaFinal = 0.45) => {
  const sonoros = puntos.filter(
    (p) => p.f0 !== null && p.claridad >= CLARIDAD_CONFIABLE,
  );
  if (sonoros.length < 4) return null;

  const fin = sonoros[sonoros.length - 1].t;
  const tramo = sonoros.filter((p) => p.t >= fin - ventanaFinal);
  if (tramo.length < 4) return null;

  const st = tramo.map((p) => ({ t: p.t, v: 12 * Math.log2(p.f0 / 100) }));
  const n = st.length;
  const mt = st.reduce((a, p) => a + p.t, 0) / n;
  const mv = st.reduce((a, p) => a + p.v, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of st) {
    num += (p.t - mt) * (p.v - mv);
    den += (p.t - mt) ** 2;
  }
  const pendiente = den ? num / den : 0;

  return {
    pendiente: +pendiente.toFixed(2),
    f0Inicial: tramo[0].f0,
    f0Final: tramo[tramo.length - 1].f0,
    veredicto:
      pendiente > 1.5
        ? "SUBE — la oración quedó abierta, iba a seguir"
        : pendiente < -1.5
          ? "BAJA — la oración cerró"
          : "plana — ni cierra ni abre del todo",
  };
};

if (process.argv[1]?.endsWith("entonacion.mjs")) {
  const [archivo, desdeStr, hastaStr, modo] = process.argv.slice(2);
  if (!archivo || !desdeStr) {
    console.error("uso: node entonacion.mjs <audio.wav> <desde> <hasta> [--detalle]");
    process.exit(1);
  }
  const desde = parseFloat(desdeStr);
  const hasta = parseFloat(hastaStr);
  const puntos = tono(archivo, desde, hasta - desde);

  if (modo === "--detalle") {
    for (const p of puntos) {
      if (p.f0 === null) continue;
      const alto = Math.round((p.f0 - 70) / 6);
      console.log(`${p.t.toFixed(2)} ${String(p.f0).padStart(6)} Hz ${" ".repeat(Math.max(0, alto))}o`);
    }
    console.log("");
  }

  const c = cierre(puntos);
  if (!c) {
    console.log("no hay suficiente voz sonora para medir el cierre");
  } else {
    console.log(
      `${c.f0Inicial} Hz -> ${c.f0Final} Hz | ${c.pendiente > 0 ? "+" : ""}${c.pendiente} semitonos/s`,
    );
    console.log(c.veredicto);
  }
}
