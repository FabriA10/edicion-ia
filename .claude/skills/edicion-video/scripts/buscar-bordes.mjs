// Encuentra el arranque y el final de voz alrededor de un punto, para poner los
// cortes donde corresponde: el IN exactamente donde empieza la voz, el OUT apenas
// después de la última voz.
//
//   node buscar-bordes.mjs audio.wav in 249.4
//   node buscar-bordes.mjs audio.wav out 253.0
//   node buscar-bordes.mjs audio.wav bloque 249.4 253.0
//
// El resultado son los segundos que hay que usar en la lista de cortes.

import { envolvente, UMBRAL_VOZ } from "./envolvente.mjs";

const SOSTEN = 3; // 30 ms: descarta chasquidos y ruidos de boca

const esVoz = (env, i) => env[i] && env[i].db >= UMBRAL_VOZ;

/** Transiciones silencio -> voz dentro de la ventana. */
const arranques = (env) => {
  const puntos = [];
  for (let i = SOSTEN; i < env.length - SOSTEN; i++) {
    const antes = [1, 2, 3].every((k) => !esVoz(env, i - k));
    const ahora = [0, 1, 2].every((k) => esVoz(env, i + k));
    if (antes && ahora) puntos.push(env[i].t);
  }
  return puntos;
};

/**
 * Arranque de voz más cercano al punto buscado.
 * El IN va exactamente acá: sin colchón, el frame entra con voz ya sonando.
 */
export const bordeEntrada = (archivo, objetivo) => {
  const env = envolvente(archivo, objetivo - 0.9, 1.8);
  const puntos = arranques(env);
  if (!puntos.length) return null;
  return puntos.reduce((a, b) => (Math.abs(b - objetivo) < Math.abs(a - objetivo) ? b : a));
};

// Una palabra tiene baches internos: entre la vocal y la /s/ final hay unos 30 ms
// de casi nada. Si el rastreo se corta ahí, la ese queda afuera. Pero si tolera
// demasiado, se cuelga con la palabra siguiente. 60 ms separa bien las dos cosas.
const BACHE_TOLERADO = 6;

/**
 * Final del bloque de habla al que pertenece el punto buscado.
 * El OUT va unos 20 ms después: corta antes de que la cola termine de caer.
 */
export const bordeSalida = (archivo, objetivo) => {
  const env = envolvente(archivo, objetivo - 1.8, 2.6);
  const i0 = env.findIndex((e) => e.t >= objetivo);
  if (i0 < 0) return null;

  // Hacia adelante mientras siga siendo el mismo bloque de habla.
  let ultima = null;
  let mudo = 0;
  for (let i = i0; i < env.length; i++) {
    if (esVoz(env, i)) {
      ultima = env[i].t;
      mudo = 0;
    } else if (++mudo > BACHE_TOLERADO) {
      break;
    }
  }
  if (ultima !== null) return ultima;

  // Si en el punto ya había silencio, la última voz quedó atrás.
  for (let i = i0; i >= 0; i--) if (esVoz(env, i)) return env[i].t;
  return null;
};

/**
 * Revisa si el corte de salida está por comerse una sibilante.
 * Las /s/ y /f/ viven arriba de 4 kHz y no se ven en la banda completa: un corte
 * puede caer en el bache entre la vocal y la ese, y dejar "hicimo".
 *
 * Dos cosas que esta función tuvo que aprender a la mala, con "pacientes":
 *
 * - El umbral no puede ser fijo. Esa /s/ picaba a -52 dB y el corte absoluto de
 *   -45 la dejó pasar. Contra el piso de la banda —que ahí estaba en -91— eran
 *   39 dB de señal, o sea una sibilante clarísima. El umbral va contra el piso.
 * - 80 ms de ventana es poco. Cuando la frase cierra despacio, la ese se
 *   despega de la vocal: en "pacientes" arrancó 150 ms después del corte.
 *
 * Avisa de más a propósito. Que te haga mirar la envolvente de gusto cuesta un
 * minuto; que no avise cuesta un render entero y que Isaias lo escuche antes que vos.
 */
const MIRAR_ADELANTE = 0.45;
const SIBILANTE_MINIMA = 0.03; // 30 ms: menos que eso es un chasquido

export const revisarSibilante = (archivo, salida) => {
  // Piso real de la banda de agudos alrededor del corte, no un número de tabla.
  const vecindad = envolvente(archivo, Math.max(0, salida - 1.5), 3.0, { agudos: true })
    .map((e) => e.db)
    .sort((a, b) => a - b);
  const piso = vecindad[Math.floor(vecindad.length * 0.1)];
  const umbral = Math.max(piso + 25, -70);

  const env = envolvente(archivo, salida, MIRAR_ADELANTE, { agudos: true });
  const lleno = envolvente(archivo, salida, MIRAR_ADELANTE);

  // Tramos seguidos por encima del umbral.
  const tramos = [];
  let actual = null;
  const cerrar = () => {
    if (actual && actual.hasta - actual.desde >= SIBILANTE_MINIMA) tramos.push(actual);
    actual = null;
  };
  for (const [i, e] of env.entries()) {
    if (e.db >= umbral) {
      const dif = (lleno[i]?.db ?? -120) - e.db;
      if (!actual) actual = { desde: e.t, hasta: e.t, pico: e.db, dif: [dif] };
      else {
        actual.hasta = e.t;
        actual.pico = Math.max(actual.pico, e.db);
        actual.dif.push(dif);
      }
    } else cerrar();
  }
  cerrar();

  // Una sibilante tiene casi toda su energía arriba de 4 kHz: la banda completa
  // mide casi lo mismo que la de agudos. Si la completa está muy por encima, lo
  // que suena es una vocal, o sea la palabra siguiente, y avisar por eso sería
  // ruido. Así se separa la ese de "pacientes" del "lo cual" que venía después.
  const DIFERENCIA_VOCAL = 12;
  const sibilantes = tramos.filter((t) => {
    const orden = [...t.dif].sort((a, b) => a - b);
    return orden[Math.floor(orden.length / 2)] <= DIFERENCIA_VOCAL;
  });
  if (!sibilantes.length) return null;

  const ultimo = sibilantes[sibilantes.length - 1];
  return {
    aviso: "hay energía de sibilante después del corte: la palabra puede quedar sin la ese",
    pisoDb: +piso.toFixed(1),
    umbralDb: +umbral.toFixed(1),
    picoDb: +ultimo.pico.toFixed(1),
    tramos: sibilantes.map((t) => `${t.desde.toFixed(3)}-${t.hasta.toFixed(3)} (${t.pico.toFixed(1)} dB)`),
    sugerido: +(ultimo.hasta + 0.02).toFixed(3),
  };
};

if (process.argv[1]?.endsWith("buscar-bordes.mjs")) {
  const [archivo, modo, a, b] = process.argv.slice(2);
  if (!archivo || !modo) {
    console.error("uso: node buscar-bordes.mjs <audio.wav> <in|out|bloque> <t> [t2]");
    process.exit(1);
  }

  if (modo === "in" || modo === "bloque") {
    const t = bordeEntrada(archivo, parseFloat(a));
    console.log(`IN  -> ${t !== null ? t.toFixed(3) : "no encontrado"}`);
  }
  if (modo === "out" || modo === "bloque") {
    const objetivo = parseFloat(modo === "bloque" ? b : a);
    const t = bordeSalida(archivo, objetivo);
    if (t === null) {
      console.log("OUT -> no encontrado");
    } else {
      const salida = +(t + 0.02).toFixed(3);
      console.log(`OUT -> ${salida.toFixed(3)}  (última voz en ${t.toFixed(3)})`);
      const sib = revisarSibilante(archivo, salida);
      if (sib) console.log(`  ! ${sib.aviso} — pico ${sib.picoDb} dB, probá ${sib.sugerido}`);
    }
  }
}
