// Alinea el guion conocido con la voz SIN reconocimiento de voz (esta PC es un Pentium sin AVX: whisper.cpp se cierra).
// 1) frases separadas por silencios reales medidos en el audio; 2) palabras repartidas por sílabas; 3) cada corte se ajusta al valle de energía más cercano.
// Salidas: src/reel/palabras.json (palabra por palabra, mismo formato que toCaptions) y src/reel/amplitud.json (boca por cuadro).
import fs from 'node:fs';

const FPS = 30;
const buf = fs.readFileSync('trabajo/voz16.wav');
const pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, Math.floor((buf.byteLength - 44) / 2));
const SR = 16000;
const dur = pcm.length / SR;

// Las frases salen de audio/texto-para-elevenlabs.txt: se parte en . ? ! : (las comas no cortan, la pausa de una coma es corta).
const FRASES = fs
	.readFileSync('../audio/texto-para-elevenlabs.txt', 'utf8')
	.split(/(?<=[.?!:])\s+/)
	.map((f) => f.trim())
	.filter(Boolean);
const SILABAS_FIJAS = {zainsoft: 3, whatsapp: 3, dm: 4, web: 1, webs: 1, stock: 2, sí: 1, binance: 3, polymarket: 4, gmo: 4, hackeo: 3}

const silabas = (w) => {
	const k = w.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
	if (SILABAS_FIJAS[k]) return SILABAS_FIJAS[k];
	const grupos = k.match(/[aeiouáéíóúü]+/g) || ['a'];
	let n = 0;
	for (const g of grupos) n += /[áéíóú]/.test(g) && g.length > 1 ? Math.min(g.length, 2) : g.length > 2 ? 2 : 1;
	return Math.max(1, n);
};

// ── Energía cada 10 ms (dB)
const HOP = SR / 100;
const nE = Math.floor(pcm.length / HOP);
const db = new Float32Array(nE);
for (let i = 0; i < nE; i++) {
	let s = 0;
	for (let j = 0; j < HOP; j++) {
		const v = pcm[i * HOP + j] / 32768;
		s += v * v;
	}
	db[i] = 10 * Math.log10(s / HOP + 1e-10);
}
const suave = db.map((_, i) => {
	let a = 0, c = 0;
	for (let k = -1; k <= 1; k++) if (db[i + k] !== undefined) (a += db[i + k]), c++;
	return a / c;
});

// ── Segmentos de voz: silencio < -42 dB durante >= 0.3 s separa frases
const UMBRAL = -42;
const MIN_SIL = 33;
const segs = [];
let ini = null, silRun = 0, ultimaVoz = 0;
for (let i = 0; i < nE; i++) {
	if (suave[i] > UMBRAL) {
		if (ini === null) ini = i;
		ultimaVoz = i;
		silRun = 0;
	} else if (ini !== null) {
		silRun++;
		if (silRun >= MIN_SIL) {
			segs.push([ini, ultimaVoz + 1]);
			ini = null;
		}
	}
}
if (ini !== null) segs.push([ini, ultimaVoz + 1]);
console.log(`Duración ${dur.toFixed(2)} s · segmentos de voz: ${segs.length} · frases del guion: ${FRASES.length}`);
// Si falta una pausa audible, se unen las frases separadas por «:» (la pausa de dos puntos a veces no llega a 0,3 s).
const grupos = FRASES.map((f, i) => ({palabras: f.split(/\s+/).map((p) => ({p, fi: i})), fin: f}));
while (segs.length < grupos.length) {
	const k = grupos.findIndex((g) => /:$/.test(g.fin));
	if (k < 0 || k >= grupos.length - 1) break;
	grupos.splice(k, 2, {palabras: [...grupos[k].palabras, ...grupos[k + 1].palabras], fin: grupos[k + 1].fin});
}
if (segs.length !== grupos.length) {
	console.error('Los segmentos no coinciden con las frases; ajustar UMBRAL/MIN_SIL o el texto.');
	console.error(segs.map(([a, b]) => `${(a / 100).toFixed(2)}-${(b / 100).toFixed(2)}`).join('  '));
	process.exit(1);
}

// ── Reparto por sílabas y ajuste a valles
const out = [];
grupos.forEach((g, gi) => {
	const [a, b] = segs[gi];
	const pesos = g.palabras.map((w) => silabas(w.p));
	const total = pesos.reduce((x, y) => x + y, 0);
	const cortes = [a];
	let acum = 0;
	for (let w = 0; w < g.palabras.length - 1; w++) {
		acum += pesos[w];
		const c = Math.round(a + ((b - a) * acum) / total);
		let mejor = c, mejorV = Infinity;
		for (let k = Math.max(a + 1, c - 7); k <= Math.min(b - 1, c + 7); k++) {
			if (suave[k] < mejorV) (mejorV = suave[k]), (mejor = k);
		}
		cortes.push(Math.max(mejor, cortes[cortes.length - 1] + 3));
	}
	cortes.push(b);
	g.palabras.forEach((w, i) => {
		out.push({text: (out.length ? ' ' : '') + w.p, startMs: Math.round(cortes[i] * 10), endMs: Math.round(cortes[i + 1] * 10), frase: w.fi});
	});
});
fs.mkdirSync('src/reel', {recursive: true});
fs.writeFileSync('src/reel/palabras.json', JSON.stringify(out, null, 2));

// ── Amplitud de boca por cuadro (misma curva que calcular-amplitud.mjs del equipo)
const total = Math.ceil(dur * FPS) + 1;
const spf = SR / FPS;
const amp = [];
for (let f = 0; f < total; f++) {
	const s0 = Math.floor(f * spf), s1 = Math.min(pcm.length, Math.floor((f + 1) * spf));
	let sum = 0, n = 0;
	for (let i = s0; i < s1; i++) (sum += (pcm[i] / 32768) ** 2), n++;
	const rms = n ? Math.sqrt(sum / n) : 0;
	const raw = Math.min(1, rms * 7.5);
	amp.push(Number((raw > 0.08 ? Math.pow((raw - 0.08) / 0.92, 0.8) : 0).toFixed(3)));
}
fs.writeFileSync('src/reel/amplitud.json', JSON.stringify(amp));
console.log(`Palabras: ${out.length} · cuadros: ${total}`);
for (const w of out) console.log(`${(w.startMs / 1000).toFixed(2)}-${(w.endMs / 1000).toFixed(2)} ${w.text.trim()}`);
