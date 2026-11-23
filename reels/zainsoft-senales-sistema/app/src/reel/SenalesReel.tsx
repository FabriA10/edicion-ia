import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import amplitudes from './amplitud.json';
import palabras from './palabras.json';
import {BitRig, BitRigPose} from '../bit/BitRig';
import {blendGestures, blinkAt, mix, mouthFrom, Gesture} from '../bit/bitMotion';

// Reel informativo «3 señales de que tu negocio necesita un sistema» (ZainSoft). Fondo crema, todo en código.
// Subtítulos con volumen (regla fija de ZainSoft, primera vez en fondo claro). Logo: ícono original, «Zain» negro.
// Tiempos atados a las palabras de la voz real.

const FPS = 30;
const NARANJA = '#F2602E';
const CREMA = '#F5EFE6';
const TINTA = '#14151A';
const ROJO = '#D93025';
const VERDE_C = '#00A35C';
const GRIS_C = '#6B7280';
const PAPEL = '#FFFDF8';
const CARD = '#1A1C22';
const WA = '#25D366';
const FONT = "HandoBold, 'Segoe UI', Arial, sans-serif";
const UI = "'Segoe UI', Arial, sans-serif";
const MANO = "'Segoe Print', 'Comic Sans MS', cursive";

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...cl, easing: ease});
const vis = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], cl);
const pop = (t: number, t0: number, damping = 12) => (t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {damping, stiffness: 150}}));

// ───────────────────────── Tiempos atados a la voz
type W = {text: string; startMs: number; endMs: number};
const PAL = (palabras as W[]).map((w) => ({t: w.text.trim(), s: w.startMs / 1000, e: w.endMs / 1000}));
const limpia = (w: string) => w.toLowerCase().replace(/[¿?¡!.,:;…]/g, '');
const at = (p: string, desde = 0) => PAL.find((w) => w.s >= desde - 0.01 && limpia(w.t) === limpia(p))?.s ?? desde;
const VOZ_FIN = PAL.length ? PAL[PAL.length - 1].e : 30;

const T = (() => {
	const senales = at('señales');
	const tercera = at('tercera', senales);
	const uno = at('uno', tercera);
	const cuaderno = at('cuaderno', uno);
	const excel = at('excel', cuaderno);
	const dos = at('dos', excel);
	const mes = at('mes', dos);
	const ganaste = at('ganaste', mes);
	const vende = at('vende', ganaste);
	const tres = at('tres', vende);
	const pierden = at('pierden', tres);
	const whatsapp = at('whatsapp', pierden);
	const papelitos = at('papelitos', whatsapp);
	const memoria = at('memoria', papelitos);
	const con = at('con', memoria);
	const lugar = at('lugar', con);
	const ventas = at('ventas', lugar);
	const stock = at('stock', ventas);
	const clientes = at('clientes', stock);
	const numeros = at('números', clientes);
	const toque = at('toque', numeros);
	const te = at('¿te', toque);
	const guarda = at('guardá', te);
	const escribinos = at('escribinos', guarda);
	return {senales, tercera, uno, cuaderno, excel, dos, mes, ganaste, vende, tres, pierden, whatsapp, papelitos, memoria, con, lugar, ventas, stock, clientes, numeros, toque, te, guarda, escribinos};
})();
const END = VOZ_FIN + 1.4;
export const REEL_FRAMES = Math.ceil(END * FPS);

// ───────────────────────── Casilleros (arriba, durante todo el reel salvo la solución)
const Casilleros: React.FC<{t: number}> = ({t}) => {
	// se van cuando arranca la solución; en el cierre vuelven como parte de <Cierre />
	const op = ramp(t, 0.1, 0.4) * (1 - ramp(t, T.con - 0.2, T.con + 0.1));
	if (op <= 0) return null;
	const tildes = [T.uno, T.dos, T.tres];
	const titulo = pop(t, 0.05, 12);
	const arriba = ramp(t, T.uno - 0.3, T.uno + 0.2);
	const yBox = mix(860, 300, arriba);
	const sBox = mix(1.5, 1, arriba);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: op}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: FONT, fontWeight: 'bold', fontSize: 150, color: TINTA, lineHeight: 1, opacity: 1 - arriba, transform: `scale(${0.7 + 0.3 * titulo})`}}>
				<span style={{color: NARANJA}}>3</span> señales
				<div style={{fontSize: 52, color: GRIS_C, marginTop: 20}}>de que tu negocio necesita un sistema</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: yBox, display: 'flex', justifyContent: 'center', gap: 40 * sBox, transform: `scale(${sBox})`, transformOrigin: '50% 0'}}>
				{[0, 1, 2].map((i) => {
					const p = pop(t, 0.5 + i * 0.25, 11);
					const tilde = pop(t, tildes[i], 9);
					const late = i === 2 && t > T.tercera - 0.05 && t < T.tres ? 1 + 0.08 * Math.sin((t - T.tercera) * 9) : 1;
					return (
						<div key={i} style={{width: 110, height: 110, borderRadius: 24, border: `8px solid ${i === 2 && t > T.tercera - 0.05 ? NARANJA : TINTA}`, background: PAPEL, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p * late})`, boxShadow: '0 10px 24px rgba(58,42,32,0.15)'}}>
							{tilde > 0 && (
								<svg width={80} height={80} viewBox="-40 -40 80 80" style={{transform: `scale(${tilde})`}}>
									<path d="M-24 2 L-8 18 L26 -20" stroke={VERDE_C} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

// Número grande de cada señal
const Numero: React.FC<{t: number; t0: number; t1: number; n: string}> = ({t, t0, t1, n}) => {
	const op = vis(t, t0 - 0.05, t1, 0.15, 0.25);
	if (op <= 0) return null;
	const p = pop(t, t0 - 0.05, 10);
	return (
		<div style={{position: 'absolute', left: 130, top: 455, fontFamily: FONT, fontWeight: 'bold', fontSize: 170, color: NARANJA, opacity: op, transform: `scale(${0.5 + 0.5 * p}) rotate(${-8 * p}deg)`, textShadow: volumen(NARANJA, 6)}}>
			{n}
		</div>
	);
};

// ───────────────────────── Señal 1: cuaderno y Excel
const Cuaderno: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.uno + 0.1, T.dos - 0.05, 0.25, 0.3);
	if (op <= 0) return null;
	const p = pop(t, T.uno + 0.15, 13);
	const sale = ramp(t, T.excel - 0.15, T.excel + 0.2);
	const lineas = ['1 remera M — $', 'Juli debe $ ¿?', 'pedido zapas (llamar)', 'caja: 45... o 54?', 'proveedor jueves', '~~3 buzos~~ 2'];
	return (
		<div style={{position: 'absolute', left: 540 - 300, top: 600, width: 600, height: 560, opacity: op * (1 - sale * 0.85), transform: `translateY(${(1 - p) * 200}px) rotate(${-4 + 4 * p}deg) translateX(${-sale * 140}px) scale(${1 - sale * 0.2})`}}>
			<div style={{position: 'absolute', inset: 0, background: '#fffbe9', borderRadius: 14, boxShadow: '0 30px 60px rgba(58,42,32,0.25)', backgroundImage: 'repeating-linear-gradient(transparent 0 58px, #c9d8ef 58px 60px)', borderLeft: '10px solid #e9b6a8'}} />
			{lineas.map((l, i) => {
				const tach = l.includes('~~');
				const txt = l.replace(/~~/g, '');
				return (
					<div key={i} style={{position: 'absolute', left: 50, top: 18 + i * 60, fontFamily: MANO, fontSize: 34, color: '#2b3b77', textDecoration: tach || i === 3 ? 'line-through' : undefined, opacity: ramp(t, T.uno + 0.35 + i * 0.12, T.uno + 0.55 + i * 0.12), transform: `rotate(${(i % 2 ? 1.5 : -1.2)}deg)`}}>
						{txt}
					</div>
				);
			})}
			<svg width={600} height={560} style={{position: 'absolute', left: 0, top: 0}}>
				<path d="M420 60 C 520 120, 380 220, 470 300" stroke={ROJO} strokeWidth={5} fill="none" strokeDasharray="10 8" />
				<path d="M460 290 l14 18 l8 -24" stroke={ROJO} strokeWidth={5} fill="none" />
			</svg>
		</div>
	);
};

// Captura de un Excel real con una planilla de ejemplo (public/excel/, datos inventados; ver CREDITOS.md)
const XL_W = 840;
const XL_K = XL_W / 1100; // la captura mide 1100x572 (recortada en la fila 12)
const Planilla: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.excel - 0.15, T.dos - 0.05, 0.25, 0.3);
	if (op <= 0) return null;
	const p = pop(t, T.excel - 0.15, 12);
	const left = 540 - XL_W / 2;
	const top = 660;
	const aro = pop(t, T.excel + 0.35, 10);
	const late = 1 + 0.06 * Math.sin((t - T.excel) * 9);
	return (
		<div style={{position: 'absolute', left, top, width: XL_W, opacity: op, transform: `translateX(${(1 - p) * 700}px) rotate(${1.2 * p}deg)`}}>
			<Img src={staticFile('excel/excel.png')} style={{width: XL_W, display: 'block', borderRadius: 10, boxShadow: '0 30px 60px rgba(58,42,32,0.3)'}} />
			{aro > 0 && (
				<div style={{position: 'absolute', left: 535 * XL_K - 10, top: 488 * XL_K - 10, width: 107 * XL_K + 20, height: 27 * XL_K + 20, border: `6px solid ${NARANJA}`, borderRadius: 10, transform: `scale(${aro * late})`, boxShadow: '0 0 18px rgba(242,96,46,0.55)'}} />
			)}
		</div>
	);
};

// ───────────────────────── Señal 2: fin de mes
const FinDeMes: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.dos + 0.1, T.tres - 0.05, 0.25, 0.3);
	if (op <= 0) return null;
	const dia = Math.min(30, Math.max(1, Math.round(interpolate(t, [T.dos + 0.6, T.mes + 0.2], [12, 30], cl))));
	const calc = pop(t, T.ganaste - 0.2, 11);
	const caen = ramp(t, T.vende - 0.3, T.vende + 0.6);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: op}}>
			<div style={{position: 'absolute', left: 200, top: 640, width: 330, height: 380, borderRadius: 22, background: PAPEL, boxShadow: '0 30px 60px rgba(58,42,32,0.22)', overflow: 'hidden', transform: `scale(${pop(t, T.dos + 0.1, 12)})`}}>
				<div style={{height: 90, background: ROJO, color: '#fff', fontFamily: FONT, fontWeight: 'bold', fontSize: 48, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>NOVIEMBRE</div>
				<div style={{fontFamily: FONT, fontWeight: 'bold', fontSize: 210, color: TINTA, textAlign: 'center', lineHeight: '270px'}}>{dia}</div>
			</div>
			<div style={{position: 'absolute', left: 580, top: 640, width: 300, height: 420, borderRadius: 30, background: CARD, padding: 24, transform: `scale(${calc}) rotate(${4 * calc}deg)`, boxShadow: '0 30px 60px rgba(58,42,32,0.3)'}}>
				<div style={{height: 110, borderRadius: 14, background: '#c7d2bf', fontFamily: 'Consolas, monospace', fontWeight: 'bold', fontSize: 84, color: TINTA, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 20}}>
					{Math.floor(t * 3) % 2 ? '?' : '¿?'}
				</div>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20}}>
					{Array.from({length: 12}).map((_, i) => (
						<div key={i} style={{height: 54, borderRadius: 12, background: i % 4 === 3 ? NARANJA : '#3a3d47'}} />
					))}
				</div>
			</div>
			{Array.from({length: 7}).map((_, i) => {
				const x = 300 + i * 70 + (i % 2) * 20;
				const y = 1080 + caen * (140 + i * 25);
				const r = -20 + i * 9 + caen * (i % 2 ? 50 : -40);
				return (
					<div key={i} style={{position: 'absolute', left: x, top: y - i * 18, width: 120, height: 150, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, transform: `rotate(${r}deg)`, opacity: 1 - caen * 0.7, boxShadow: '0 6px 12px rgba(58,42,32,0.15)', padding: 12}}>
						{[0, 1, 2, 3].map((k) => (
							<div key={k} style={{height: 6, borderRadius: 3, background: '#d1d5db', marginBottom: 14, width: `${60 + ((i + k) % 3) * 15}%`}} />
						))}
					</div>
				);
			})}
		</div>
	);
};

// ───────────────────────── Señal 3: WhatsApp, papelitos y memoria
const PAPELITOS = [
	{txt: 'turno 10hs?', x: 180, y: 640, r: -10, c: '#fde68a'},
	{txt: 'pedido Lu: 2 talle S', x: 690, y: 690, r: 8, c: '#fbcfe8'},
	{txt: 'llamar a Nico!!', x: 160, y: 950, r: 6, c: '#bfdbfe'},
	{txt: 'seña $5000 (¿quién?)', x: 700, y: 1000, r: -7, c: '#bbf7d0'},
];
const Senal3: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.tres + 0.1, T.con, 0.25, 0.3);
	if (op <= 0) return null;
	const cel = pop(t, T.tres + 0.1, 12);
	const temblor = Math.sin(t * 38) * 3 * (t > T.whatsapp - 0.1 ? 1 : 0);
	const vuela = ramp(t, T.memoria - 0.4, T.memoria + 0.5);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: op}}>
			<div style={{position: 'absolute', left: 540 - 170 + temblor, top: 600, width: 340, height: 560, borderRadius: 44, background: CARD, padding: 12, transform: `scale(${cel})`, boxShadow: '0 30px 60px rgba(58,42,32,0.3)'}}>
				<div style={{width: '100%', height: '100%', borderRadius: 34, background: '#efe7de', overflow: 'hidden', fontFamily: UI}}>
					<div style={{background: '#008069', color: '#fff', fontWeight: 700, fontSize: 24, padding: '30px 18px 12px', display: 'flex', justifyContent: 'space-between'}}>
						WhatsApp <span style={{background: '#fff', color: '#008069', borderRadius: 12, fontSize: 16, padding: '2px 8px'}}>{Math.min(47, Math.round(interpolate(t, [T.tres, T.memoria], [9, 47], cl)))}</span>
					</div>
					{['¿tenés en talle M?', '¿me reservás el martes?', '¿te llegó la seña?', '¿hacés envíos?', 'holaaa??'].map((m, i) => {
						const p = pop(t, T.pierden - 0.2 + i * 0.22, 12);
						return (
							<div key={i} style={{margin: '10px 12px 0', background: '#fff', borderRadius: 12, padding: '10px 14px', fontSize: 19, color: TINTA, transform: `scale(${p})`, transformOrigin: '0 50%'}}>
								{m}
							</div>
						);
					})}
				</div>
			</div>
			{PAPELITOS.map((p, i) => {
				const a = pop(t, T.papelitos - 0.25 + i * 0.12, 10);
				const ultimo = i === 3;
				const dx = ultimo ? vuela * 420 : 0;
				const dy = ultimo ? -vuela * 260 : 0;
				return (
					<div key={i} style={{position: 'absolute', left: p.x + dx, top: p.y + dy, width: 220, padding: '22px 16px', background: p.c, fontFamily: MANO, fontSize: 26, color: TINTA, transform: `rotate(${p.r + (ultimo ? vuela * 120 : 0)}deg) scale(${a})`, boxShadow: '0 10px 20px rgba(58,42,32,0.2)', opacity: ultimo ? 1 - vuela * 0.8 : 1}}>
						{p.txt}
					</div>
				);
			})}
			{t > T.memoria - 0.2 && (
				<div style={{position: 'absolute', left: 560, top: 470, transform: `scale(${pop(t, T.memoria - 0.2, 10)})`}}>
					<svg width={380} height={170} viewBox="0 0 380 170">
						<path d="M60 120 C 0 120, 0 40, 70 46 C 80 0, 170 0, 190 34 C 230 0, 330 10, 320 60 C 380 70, 370 140, 300 130 C 260 165, 120 165, 60 120 Z" fill="#fff" stroke={TINTA} strokeWidth={5} />
						<text x={190} y={98} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={36} fill={TINTA}>
							¿era el martes?
						</text>
					</svg>
				</div>
			)}
		</div>
	);
};

// ───────────────────────── Solución: panel en orden
const Panel: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.con - 0.1, T.te + 0.1, 0.3, 0.3);
	if (op <= 0) return null;
	const p = pop(t, T.con, 13);
	const tarjetas = [
		{t0: T.ventas, titulo: 'Ventas', valor: 'hoy', c: NARANJA, ico: '🧾'},
		{t0: T.stock, titulo: 'Stock', valor: 'al día', c: VERDE_C, ico: '📦'},
		{t0: T.clientes, titulo: 'Clientes', valor: 'ordenados', c: '#2563eb', ico: '👥'},
	];
	const barras = [0.45, 0.62, 0.38, 0.8, 0.7, 0.92];
	const dibuja = ramp(t, T.numeros - 0.1, T.numeros + 0.7);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: op}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT, fontWeight: 'bold', fontSize: 66, color: TINTA, transform: `scale(${pop(t, T.lugar - 0.2, 11)})`}}>
				todo en <span style={{color: VERDE_C}}>un solo lugar</span>
			</div>
			<div style={{position: 'absolute', left: 540 - 380, top: 430, width: 760, height: 720, borderRadius: 32, background: '#fff', boxShadow: '0 40px 80px rgba(58,42,32,0.22)', transform: `scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 2), padding: 32, fontFamily: UI}}>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<span style={{fontFamily: FONT, fontWeight: 'bold', fontSize: 36, color: TINTA}}>Tu negocio</span>
					<span style={{fontSize: 20, color: GRIS_C}}>panel</span>
				</div>
				<div style={{display: 'flex', gap: 18, marginTop: 26}}>
					{tarjetas.map((c) => {
						const q = pop(t, c.t0 - 0.1, 11);
						return (
							<div key={c.titulo} style={{flex: 1, borderRadius: 22, background: '#f8f6f2', borderTop: `8px solid ${c.c}`, padding: '18px 16px', transform: `scale(${q})`}}>
								<div style={{fontSize: 40}}>{c.ico}</div>
								<div style={{fontWeight: 800, fontSize: 28, color: TINTA, marginTop: 6}}>{c.titulo}</div>
								<div style={{fontSize: 20, color: GRIS_C}}>{c.valor}</div>
							</div>
						);
					})}
				</div>
				<div style={{marginTop: 30, fontWeight: 800, fontSize: 24, color: TINTA}}>Reportes</div>
				<svg width={696} height={300} style={{marginTop: 10}}>
					{barras.map((h, i) => {
						const hh = 240 * h * Math.min(1, Math.max(0, dibuja * 1.6 - i * 0.12));
						return <rect key={i} x={30 + i * 110} y={260 - hh} width={70} height={hh} rx={12} fill={i === barras.length - 1 ? NARANJA : '#d6d0c4'} />;
					})}
					<line x1={10} y1={262} x2={686} y2={262} stroke="#d1d5db" strokeWidth={3} />
				</svg>
			</div>
			{(() => {
				const k = (t - (T.toque - 0.05)) / 0.5;
				if (k < 0 || k > 1) return null;
				const r = 16 + 40 * k;
				return <div style={{position: 'absolute', left: 540 + 260 - r, top: 430 + 560 - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `6px solid rgba(20,21,26,${0.7 * (1 - k)})`, background: `rgba(255,255,255,${0.45 * (1 - k)})`}} />;
			})()}
		</div>
	);
};

// Antes de la solución: los objetos «vuelan» hacia el centro
const Absorcion: React.FC<{t: number}> = ({t}) => {
	const a = ramp(t, T.con - 0.35, T.con + 0.15);
	if (a <= 0 || a >= 1) return null;
	const items = [
		{x: 240, y: 700, c: '#fffbe9'},
		{x: 830, y: 760, c: '#fff'},
		{x: 220, y: 1050, c: '#fde68a'},
		{x: 860, y: 1050, c: '#bbf7d0'},
		{x: 540, y: 1200, c: '#fbcfe8'},
	];
	return (
		<>
			{items.map((it, i) => (
				<div key={i} style={{position: 'absolute', left: mix(it.x, 540, a) - 60, top: mix(it.y, 790, a) - 50, width: 120, height: 100, background: it.c, borderRadius: 10, transform: `rotate(${(1 - a) * (i % 2 ? 30 : -25) + a * 180}deg) scale(${1 - a})`, boxShadow: '0 8px 16px rgba(58,42,32,0.2)'}} />
			))}
		</>
	);
};

const Destello: React.FC<{t: number}> = ({t}) => {
	const d = t > T.con - 0.15 && t < T.con + 0.45 ? Math.sin(((t - (T.con - 0.15)) / 0.6) * Math.PI) * 0.55 : 0;
	return d > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(255,250,240,${d})`}} /> : null;
};

// ───────────────────────── Cierre
const IcoGuardar: React.FC<{lleno: number}> = ({lleno}) => (
	<svg width={150} height={170} viewBox="-50 -58 100 116">
		<defs>
			<clipPath id="marca">
				<path d="M-34 -52 H34 Q40 -52 40 -46 V52 L0 26 L-40 52 V-46 Q-40 -52 -34 -52 Z" />
			</clipPath>
		</defs>
		<g clipPath="url(#marca)">
			<rect x={-50} y={-58} width={100} height={116} fill={PAPEL} />
			<rect x={-50} y={58 - 116 * lleno} width={100} height={116} fill={NARANJA} />
		</g>
		<path d="M-34 -52 H34 Q40 -52 40 -46 V52 L0 26 L-40 52 V-46 Q-40 -52 -34 -52 Z" fill="none" stroke={TINTA} strokeWidth={7} strokeLinejoin="round" />
	</svg>
);
const Cierre: React.FC<{t: number}> = ({t}) => {
	if (t < T.te - 0.1) return null;
	const casillas = pop(t, T.te - 0.05, 11);
	const guardar = pop(t, T.guarda - 0.15, 10);
	const lleno = ramp(t, T.guarda, T.guarda + 0.5);
	const logo = pop(t, T.escribinos - 0.4, 11);
	const dm = pop(t, T.escribinos, 10);
	const ig = pop(t, T.escribinos + 0.45, 10);
	return (
		<div style={{position: 'absolute', inset: 0}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', gap: 26, transform: `scale(${casillas})`}}>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{width: 84, height: 84, borderRadius: 20, border: `7px solid ${TINTA}`, background: PAPEL, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<svg width={60} height={60} viewBox="-40 -40 80 80">
							<path d="M-24 2 L-8 18 L26 -20" stroke={VERDE_C} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
				))}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, transform: `scale(${guardar})`}}>
				<IcoGuardar lleno={lleno} />
				<span style={{fontFamily: FONT, fontWeight: 'bold', fontSize: 64, color: TINTA}}>guardalo</span>
			</div>
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				<g transform={`translate(492 760) scale(${0.7 + 0.3 * logo})`} opacity={Math.min(1, logo * 2)}>
					{/* logo oficial: ícono negro con Z blanca y S naranja; sobre fondo claro «Zain» va en negro */}
					<rect x={-330} y={-80} width={160} height={160} rx={36} fill={TINTA} />
					<text x={-298} y={34} fontSize={92} fontFamily={FONT} fontWeight="bold" fill="#fff">
						Z
					</text>
					<text x={-246} y={34} fontSize={92} fontFamily={FONT} fontWeight="bold" fill={NARANJA}>
						S
					</text>
					<text x={-140} y={36} fontSize={118} fontFamily={FONT} fontWeight="bold">
						<tspan fill={TINTA}>Zain</tspan>
						<tspan fill={NARANJA}>Soft</tspan>
					</text>
				</g>
				<g transform={`translate(540 960) scale(${dm})`}>
					<rect x={-310} y={-70} width={620} height={140} rx={70} fill={NARANJA} />
					<text y={22} textAnchor="middle" fontSize={62} fontFamily={FONT} fontWeight="bold" fill="#fff">
						Escribinos por DM
					</text>
				</g>
				<g transform={`translate(540 1110) scale(${ig})`}>
					<text textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight="bold" fill={TINTA}>
						@zainsoft_
					</text>
				</g>
			</svg>
		</div>
	);
};

// ───────────────────────── Subtítulos con volumen (fondo claro)
const PROFUNDIDAD: Record<string, string> = {[TINTA]: '#8A8173', [NARANJA]: '#A8401C', [VERDE_C]: '#006B3C', [ROJO]: '#8E1B12'};
function volumen(color: string, capas = 7) {
	const d = PROFUNDIDAD[color] ?? '#8A8173';
	const pasos = Array.from({length: capas}, (_, i) => `${i + 1}px ${i + 1}px 0 ${d}`);
	return [...pasos, `${capas + 2}px ${capas + 4}px 14px rgba(58,42,32,0.35)`].join(', ');
}
const FUNC = new Set(['de', 'que', 'y', 'en', 'un', 'una', 'el', 'la', 'los', 'a', 'por', 'te', 'se', 'le', 'es', 'no', 'lo', 'tu', 'con', 'o', 'para', 'del', 'qué', 'al', 'sin', 'ni', 'ya']);
const NOMBRES: Record<string, string> = {dm: 'dm'};
const ROJAS = new Set(['cuaderno', 'excel', 'pierden']);
const NARANJAS = new Set(['uno', 'dos', 'tres', 'sistema', 'dm', 'guardá']);
const VERDES = new Set(['solo', 'lugar']);
type Cue = {s: number; e: number; words: {t: string; color: string}[]};
const CUES: Cue[] = (() => {
	const out: Cue[] = [];
	let cur: typeof PAL = [];
	const flush = () => {
		if (!cur.length) return;
		const enLugar = cur.some((w) => limpia(w.t) === 'lugar');
		out.push({
			s: cur[0].s,
			e: cur[cur.length - 1].e,
			words: cur.map((w) => {
				const n = limpia(w.t);
				const verde = enLugar && VERDES.has(n);
				return {t: NOMBRES[n] ?? n, color: ROJAS.has(n) ? ROJO : NARANJAS.has(n) ? NARANJA : verde ? VERDE_C : TINTA};
			}),
		});
		cur = [];
	};
	PAL.forEach((w, i) => {
		cur.push(w);
		const nxt = PAL[i + 1];
		const len = cur.map((x) => x.t).join(' ').length;
		const lleno = cur.length >= 3 || (cur.length >= 2 && len > 16);
		const antesDeYO = nxt && ['y', 'o'].includes(limpia(nxt.t)) && cur.length >= 2;
		if (/[.?,:!…]$/.test(w.t) || !nxt || cur.length >= 4 || antesDeYO || (lleno && !FUNC.has(limpia(w.t)))) flush();
	});
	out.forEach((c, i) => {
		const n = out[i + 1];
		c.e = n && n.s - c.e < 0.45 ? n.s : c.e + 0.2;
	});
	return out;
})();
const Subtitulos: React.FC<{t: number}> = ({t}) => {
	const cue = CUES.find((c) => t >= c.s && t < c.e);
	if (!cue) return null;
	const p = spring({frame: (t - cue.s) * FPS, fps: FPS, config: {damping: 11, stiffness: 220}});
	const len = cue.words.map((w) => w.t).join(' ').length;
	const size = Math.max(56, Math.min(88, 88 - Math.max(0, len - 13) * 2.4));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 1290, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{position: 'relative', fontFamily: FONT, fontWeight: 'bold', fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', transform: `translateY(${(1 - p) * 20}px) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 1.5)}}>
				{cue.words.map((w, i) => (
					<span key={i} style={{color: w.color, marginRight: i < cue.words.length - 1 ? '0.28em' : 0, textShadow: volumen(w.color)}}>
						{w.t}
					</span>
				))}
			</div>
		</div>
	);
};

// ───────────────────────── Bit
const S_BIT = 0.34;
const BIT_FLOOR = 1650;
const BIT_X = 200;
const BitLayer: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const GEST: [number, Gesture][] = [
		[0, 'point'], [T.tercera + 0.8, 'rest'], [T.cuaderno - 0.2, 'think'], [T.dos - 0.1, 'rest'], [T.ganaste - 0.1, 'think'],
		[T.tres - 0.1, 'rest'], [T.memoria - 0.3, 'point'], [T.con, 'rest'], [T.lugar, 'celebrate'], [T.stock + 0.6, 'rest'],
		[T.numeros, 'point'], [T.te, 'rest'], [T.guarda - 0.1, 'point'], [VOZ_FIN + 0.1, 'wave'],
	];
	const mouth = t < VOZ_FIN ? mouthFrom(amplitudes as number[], frame) : 0;
	const blink = blinkAt(t, [1.9, 5.6, 9.3, 13.0, 16.8, 20.5, 24.1, 27.8, 31.4]);
	const g = blendGestures(GEST, t);
	const br = Math.sin(t * 2.4);
	const jump = (g.jump * 60) / S_BIT;
	const pose: BitRigPose = {
		bodyY: br * 5 - mouth * 14 - jump,
		sy: 1 + br * 0.012 - g.jump * 0.05,
		lean: Math.sin(t * 5.5) * 2.5 * mouth,
		mouth,
		blink,
		look: {x: g.look.x, y: g.look.y},
		antenna: Math.sin(t * 7) * (3 + 8 * mouth + 10 * g.jump),
		handsFront: g.front,
		handL: {x: g.L.x, y: g.L.y - jump},
		handR: {x: g.R.x, y: g.R.y - jump},
		footL: {x: -150, y: -jump},
		footR: {x: 150, y: -jump},
	};
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<radialGradient id="sombraBit">
					<stop offset="0%" stopColor="#3a2a20" stopOpacity={0.5} />
					<stop offset="60%" stopColor="#3a2a20" stopOpacity={0.22} />
					<stop offset="100%" stopColor="#3a2a20" stopOpacity={0} />
				</radialGradient>
			</defs>
			<ellipse cx={BIT_X} cy={BIT_FLOOR + 4} rx={((115 * S_BIT) / 0.4) * 1.25} ry={((16 * S_BIT) / 0.4) * 1.6} fill="url(#sombraBit)" />
			<g transform={`translate(${BIT_X} ${BIT_FLOOR}) scale(${S_BIT})`}>
				<BitRig pose={pose} />
			</g>
		</svg>
	);
};

// ───────────────────────── Composición
const sfx = (): {t: number; f: string; v: number; d: number}[] => [
	{t: 0.05, f: 'flash.aac', v: 0.07, d: 30},
	{t: 0.5, f: 'poof.aac', v: 0.05, d: 15},
	{t: 0.75, f: 'poof.aac', v: 0.05, d: 15},
	{t: 1.0, f: 'poof.aac', v: 0.05, d: 15},
	{t: T.uno, f: 'Stone motion.aac', v: 0.07, d: 15},
	{t: T.cuaderno - 0.4, f: 'Paper in Air.aac', v: 0.08, d: 40},
	{t: T.excel - 0.15, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.dos, f: 'Stone motion.aac', v: 0.07, d: 15},
	{t: T.ganaste - 0.2, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.vende - 0.3, f: 'Paper in Air.aac', v: 0.07, d: 40},
	{t: T.tres, f: 'Stone motion.aac', v: 0.07, d: 15},
	{t: T.papelitos - 0.25, f: 'poof.aac', v: 0.05, d: 15},
	{t: T.memoria - 0.4, f: 'Paper in Air.aac', v: 0.06, d: 40},
	{t: T.con - 0.15, f: 'flash.aac', v: 0.08, d: 40},
	{t: T.ventas - 0.1, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.stock - 0.1, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.clientes - 0.1, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.guarda, f: 'poof.aac', v: 0.07, d: 20},
	{t: T.escribinos - 0.4, f: 'flash.aac', v: 0.08, d: 40},
];

export const SenalesReel: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	return (
		<AbsoluteFill style={{background: CREMA, overflow: 'hidden'}}>
			<style>{`@font-face { font-family: 'HandoBold'; src: url('${staticFile('Hando.otf')}') format('opentype'); font-weight: bold; }`}</style>
			<Audio src={staticFile('voz_master.wav')} volume={1} />
			{sfx().map((s, i) => (
				<Sequence key={i} from={Math.max(0, Math.round(s.t * FPS))} durationInFrames={s.d}>
					<Audio src={staticFile(s.f)} volume={s.v} />
				</Sequence>
			))}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(242,96,46,0.20) 0%, rgba(245,239,230,0) 62%)'}} />
			<svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.8}}>
				<defs>
					<pattern id="rejilla" width={90} height={90} patternUnits="userSpaceOnUse">
						<path d="M90 0 H0 V90" fill="none" stroke="#E4DACB" strokeWidth={2} />
					</pattern>
				</defs>
				<rect width={1080} height={1920} fill="url(#rejilla)" />
			</svg>

			{/* visuales recreados en cada cuadro (key={frame}); el audio queda fuera */}
			<AbsoluteFill key={frame}>
				<Casilleros t={t} />
				<Numero t={t} t0={T.uno} t1={T.dos - 0.05} n="1" />
				<Numero t={t} t0={T.dos} t1={T.tres - 0.05} n="2" />
				<Numero t={t} t0={T.tres} t1={T.con} n="3" />
				<Cuaderno t={t} />
				<Planilla t={t} />
				<FinDeMes t={t} />
				<Senal3 t={t} />
				<Absorcion t={t} />
				<Panel t={t} />
				<Destello t={t} />
				<Cierre t={t} />
				<BitLayer t={t} frame={frame} />
				<Subtitulos t={t} />
			</AbsoluteFill>

			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', background: `rgba(245,239,230,${0.003 + (frame % 2) * 0.004})`}} />
		</AbsoluteFill>
	);
};
