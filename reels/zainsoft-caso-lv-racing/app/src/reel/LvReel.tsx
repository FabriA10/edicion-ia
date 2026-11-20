import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import amplitudes from './amplitud.json';
import palabras from './palabras.json';
import {BitRig, BitRigPose} from '../bit/BitRig';
import {blendGestures, blinkAt, mix, mouthFrom, Gesture} from '../bit/bitMotion';

// Reel «¿Ya está lista mi moto?» (ZainSoft · caso real LV Racing). Fondo OSCURO (pedido del usuario).
// Capturas reales de lo público del sitio (public/lv/: portada y login de Mi Garage, sin iniciar sesión).
// Lo interno (tablero, cámara, portal) es una recreación en código con datos inventados. Sin rostros humanos.

const FPS = 30;
const FONDO = '#0E0F13';
const NARANJA = '#F2602E';
const ROJO = '#DC2626';
const VERDE = '#00FF88';
const AMARILLO = '#FFE600';
const BLANCO = '#F5F5F4';
const LOGO_TINTA = '#14151A'; // tinta del logo oficial: no se invierte en fondos oscuros
const GRIS = '#9AA0AC';
const PANEL = '#18181B';
const PANEL2 = '#232329';
const WA = '#25D366';
const WA_OSC = '#008069';
const FONT = "HandoBold, 'Segoe UI', Arial, sans-serif";
const UI = "'Segoe UI', Arial, sans-serif";

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
	const dias = at('días');
	const mira = at('mirá', dias);
	const lv = at('lv', mira);
	const tucuman = at('tucumán', lv);
	const en = at('en', tucuman);
	const tablero = at('tablero', en);
	const recibida = at('recibida', tablero);
	const diagnostico = at('diagnóstico', recibida);
	const repuestos = at('repuestos', diagnostico);
	const reparacion = at('reparación', repuestos);
	const lista = at('lista', reparacion);
	const mecanico = at('mecánico', lista);
	const fotos = at('fotos', mecanico);
	const celular = at('celular', fotos);
	const quedan = at('quedan', celular);
	const orden = at('orden', quedan);
	const cliente = at('cliente', orden);
	const garage = at('garage', cliente);
	const avance = at('avance', garage);
	const fotos2 = at('fotos', avance);
	const llamar = at('llamar', fotos2);
	const menos = at('menos', llamar);
	const confian = at('confían', menos);
	const queres = at('querés', confian);
	const link = at('link', queres);
	return {dias, mira, lv, tucuman, en, tablero, recibida, diagnostico, repuestos, reparacion, lista, mecanico, fotos, celular, quedan, orden, cliente, garage, avance, fotos2, llamar, menos, confian, queres, link};
})();
const END = VOZ_FIN + 1.4;
export const REEL_FRAMES = Math.ceil(END * FPS);

// ───────────────────────── Celular
const PW = 440;
const PH = 900;
const BEZ = 14;
const SW = PW - BEZ * 2;
const SH = PH - BEZ * 2;
const Celular: React.FC<{x?: number; y?: number; s?: number; op?: number; children: React.ReactNode}> = ({x = 540, y = 790, s = 1, op = 1, children}) => (
	<div style={{position: 'absolute', left: x - PW / 2, top: y - PH / 2, width: PW, height: PH, borderRadius: 58, background: '#050506', boxShadow: '0 0 0 3px #2c2f38, 0 40px 90px rgba(0,0,0,0.65), 0 0 60px rgba(242,96,46,0.10)', transform: `scale(${s})`, opacity: op}}>
		<div style={{position: 'absolute', left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: 46, overflow: 'hidden', background: '#000'}}>{children}</div>
		<div style={{position: 'absolute', left: PW / 2 - 56, top: BEZ + 12, width: 112, height: 28, borderRadius: 14, background: '#000'}} />
	</div>
);
const Barra: React.FC<{hora: string; color?: string}> = ({hora, color = '#fff'}) => (
	<div style={{height: 54, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 30px 6px', fontFamily: UI, fontWeight: 700, fontSize: 19, color}}>
		<span>{hora}</span>
		<span style={{letterSpacing: 2}}>▮▮▮ ●</span>
	</div>
);
const Toque: React.FC<{t: number; t0: number; x: number; y: number}> = ({t, t0, x, y}) => {
	const p = (t - t0) / 0.5;
	if (p < 0 || p > 1) return null;
	const r = 16 + 40 * p;
	return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `6px solid rgba(255,255,255,${0.85 * (1 - p)})`, background: `rgba(255,255,255,${0.3 * (1 - p)})`}} />;
};
const LogoWA: React.FC<{s?: number}> = ({s = 60}) => (
	<svg width={s} height={s} viewBox="-32 -32 64 64" style={{flex: 'none'}}>
		<circle r={30} fill={WA} />
		<path d="M-14 16 L-11 6 A15 15 0 1 1 -4 13 Z" fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
		<path d="M-6 -6 Q-6 6 6 6" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
	</svg>
);

// ───────────────────────── Escena 1: «¿ya está lista mi moto?» por WhatsApp
const CHATS = [
	{n: 'Mati', m: '¿ya está lista mi moto?', c: '#7c3aed'},
	{n: 'Juan', m: '¿y la KTM? 🙏', c: '#db2777'},
	{n: 'Seba', m: '¿cuándo la retiro?', c: '#2563eb'},
	{n: 'Pablo', m: '¿ya está lista?', c: '#ea580c'},
	{n: 'Ramiro', m: '¿me mandás una foto?', c: '#059669'},
	{n: 'Diego', m: '¿llamo mañana entonces?', c: '#64748b'},
];
const llegada = (i: number) => 0.15 + i * ((T.dias + 0.2 - 0.15) / CHATS.length);
const ListaWA: React.FC<{t: number}> = ({t}) => {
	const n = CHATS.filter((_, i) => t >= llegada(i)).length;
	const total = CHATS.reduce((a, _, i) => a + (t >= llegada(i) ? i + 1 : 0), 0);
	return (
		<div style={{position: 'absolute', inset: 0, background: '#111b21'}}>
			<div style={{background: '#202c33', color: '#fff'}}>
				<Barra hora="18:42" />
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 26px 16px', fontFamily: UI, fontWeight: 700, fontSize: 30}}>
					<span>WhatsApp</span>
					<span style={{fontSize: 18, background: WA, color: '#111b21', borderRadius: 14, padding: '2px 10px'}}>{total} sin leer</span>
				</div>
			</div>
			{CHATS.slice(0, n)
				.map((c, i) => ({c, i}))
				.reverse()
				.map(({c, i}) => {
					const p = pop(t, llegada(i), 13);
					return (
						<div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: '1px solid #222d34', transform: `translateY(${(1 - p) * -40}px)`, opacity: Math.min(1, p * 2)}}>
							<div style={{width: 58, height: 58, borderRadius: '50%', background: c.c, opacity: 0.85, flex: 'none'}} />
							<div style={{flex: 1, minWidth: 0, fontFamily: UI}}>
								<div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 22, color: '#e9edef'}}>
									<span>{c.n}</span>
									<span style={{fontSize: 15, color: WA}}>18:42</span>
								</div>
								<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 19, color: '#8696a0', marginTop: 4}}>
									<span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.m}</span>
									<span style={{background: WA, color: '#111b21', borderRadius: 12, minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: 700, padding: '1px 6px'}}>{i + 1}</span>
								</div>
							</div>
						</div>
					);
				})}
		</div>
	);
};

// ───────────────────────── Escena 3: tablero de órdenes (recreación)
const COLS = ['Recibida', 'En diagnóstico', 'Esperando repuestos', 'Reparación', 'Lista'];
const OTRAS: [number, string][] = [[0, 'GasGas · #131'], [1, 'Fantic XE 300 · #127'], [2, 'KTM 250 · #124'], [3, 'GasGas · #119'], [4, 'Husqvarna · #116'], [1, 'Honda XR · #129']];
const CW = 164;
const Tablero: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.en - 0.1, T.mecanico + 0.05, 0.3, 0.3);
	if (op <= 0) return null;
	const p = pop(t, T.en - 0.1, 14);
	const hitos = [T.recibida, T.diagnostico, T.repuestos, T.reparacion, T.lista];
	let col = 0;
	hitos.forEach((h, i) => {
		if (t >= h - 0.05) col = i;
	});
	const moverDesde = hitos[col] - 0.05;
	const k = col === 0 ? 1 : ramp(t, moverDesde, moverDesde + 0.3);
	const xDe = (c: number) => 20 + c * (CW + 6);
	const x = mix(xDe(Math.max(0, col - 1)), xDe(col), k);
	const lista = t >= T.lista;
	return (
		<div style={{position: 'absolute', left: 540 - 440, top: 420, width: 880, height: 640, borderRadius: 26, background: PANEL, boxShadow: '0 0 0 2px #2c2f38, 0 40px 90px rgba(0,0,0,0.6)', opacity: op, transform: `translateY(${(1 - p) * 120}px) scale(${0.94 + 0.06 * p})`, fontFamily: UI, overflow: 'hidden'}}>
			<div style={{height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', borderBottom: '1px solid #2c2f38'}}>
				<span style={{color: BLANCO, fontWeight: 800, fontSize: 26}}>
					<span style={{color: ROJO}}>LV</span> Racing · Órdenes del taller
				</span>
				<span style={{color: GRIS, fontSize: 17}}>recreación</span>
			</div>
			{COLS.map((c, i) => (
				<div key={c} style={{position: 'absolute', left: xDe(i), top: 86, width: CW, height: 530, borderRadius: 16, background: col === i ? '#2a1d1d' : PANEL2, border: `2px solid ${col === i ? (i === 4 ? VERDE : ROJO) : 'transparent'}`}}>
					<div style={{padding: '12px 12px 0', color: i === 4 ? VERDE : '#e4e4e7', fontWeight: 700, fontSize: 17, minHeight: 50}}>{c}</div>
					{OTRAS.filter(([ci]) => ci === i).map(([, txt], j) => (
						<div key={txt} style={{margin: '10px 10px 0', marginTop: j === 0 ? 70 + 0 : 10, borderRadius: 12, background: '#2f2f37', padding: '10px 10px', color: '#a1a1aa', fontSize: 15, fontWeight: 600}}>
							{txt}
						</div>
					))}
				</div>
			))}
			<div style={{position: 'absolute', left: x + 8, top: 150, width: CW - 16, borderRadius: 14, background: lista ? '#0f2e22' : '#3a1515', border: `3px solid ${lista ? VERDE : ROJO}`, padding: '12px 12px', color: BLANCO, fontWeight: 800, fontSize: 24, boxShadow: '0 10px 24px rgba(0,0,0,0.5)', transform: `translateY(${-Math.sin(k * Math.PI) * 18}px)`}}>
				KTM 350
				<div style={{fontSize: 18, fontWeight: 600, color: '#d4d4d8', marginTop: 4}}>Orden #128</div>
				{lista && <div style={{marginTop: 6, color: VERDE, fontSize: 18}}>✓ lista</div>}
			</div>
		</div>
	);
};

// ───────────────────────── Escena 4: fotos desde el celular (recreación)
const Pieza: React.FC<{k: number; s?: number}> = ({k, s = 1}) => (
	<g transform={`scale(${s})`}>
		{k === 0 && (
			<g>
				<circle r={60} fill="#9ca3af" />
				<circle r={44} fill="#6b7280" />
				{Array.from({length: 10}).map((_, i) => (
					<circle key={i} cx={Math.cos((i / 10) * Math.PI * 2) * 52} cy={Math.sin((i / 10) * Math.PI * 2) * 52} r={4} fill="#374151" />
				))}
				<circle r={16} fill="#1f2937" />
				<path d="M-70 -30 Q-80 0 -70 30 L-50 24 Q-58 0 -50 -24 Z" fill={ROJO} />
			</g>
		)}
		{k === 1 && (
			<g fill="none" stroke="#9ca3af" strokeWidth={10}>
				{Array.from({length: 6}).map((_, i) => (
					<rect key={i} x={-75 + i * 25} y={-12} width={30} height={24} rx={12} />
				))}
			</g>
		)}
		{k === 2 && (
			<g>
				<rect x={-50} y={-60} width={100} height={120} rx={14} fill="#4b5563" />
				<rect x={-34} y={-44} width={68} height={30} rx={6} fill="#9ca3af" />
				<circle cx={0} cy={22} r={18} fill={ROJO} />
			</g>
		)}
	</g>
);
// Fotos reales de piezas (Pexels, licencia libre; ver CREDITOS.md): freno, cadena, motor abierto
const FOTOS = ['fotos/pexels-1683406.jpg', 'fotos/pexels-34240236.jpg', 'fotos/pexels-37609825.jpg'];
const Foto: React.FC<{i: number; w: number | string; h: number; zoom?: number}> = ({i, w, h, zoom = 1}) => (
	<Img src={staticFile(FOTOS[i])} style={{width: w, height: h, objectFit: 'cover', display: 'block', transform: `scale(${zoom})`}} />
);
const Camara: React.FC<{t: number}> = ({t}) => {
	const shots = [T.fotos, T.celular, T.quedan];
	const n = shots.filter((s) => t >= s).length;
	const ultimo = shots.filter((s) => t >= s).pop() ?? -10;
	const flash = t - ultimo < 0.25 ? 1 - (t - ultimo) / 0.25 : 0;
	const guardado = pop(t, T.orden - 0.1, 11);
	const pieza = Math.min(2, n); // en el visor, la próxima foto a sacar
	return (
		<div style={{position: 'absolute', inset: 0, background: '#000', fontFamily: UI}}>
			<Barra hora="10:20" />
			<div style={{padding: '4px 22px 10px', color: '#fff', fontWeight: 700, fontSize: 20}}>
				Orden #128 · KTM 350 <span style={{color: GRIS, fontWeight: 600}}>· evidencias</span>
			</div>
			<div style={{position: 'absolute', left: 16, right: 16, top: 110, height: 520, borderRadius: 20, background: 'radial-gradient(ellipse at 50% 45%, #3a3d47, #15161b 75%)', overflow: 'hidden'}}>
				<div style={{position: 'absolute', inset: 0}}>
					<Foto i={pieza} w={SW - 32} h={520} zoom={1.04 + 0.03 * Math.sin(t * 1.3)} />
				</div>
				<svg width={SW - 32} height={520} style={{position: 'absolute'}}>
					{[
						[30, 30, 1, 1],
						[SW - 62, 30, -1, 1],
						[30, 490, 1, -1],
						[SW - 62, 490, -1, -1],
					].map(([x, y, sx, sy], i) => (
						<path key={i} d={`M${x} ${y + 40 * sy} V${y} H${x + 40 * sx}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
					))}
				</svg>
				{flash > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${flash})`}} />}
			</div>
			<div style={{position: 'absolute', left: 16, right: 16, top: 650, display: 'flex', gap: 10}}>
				{[0, 1, 2].map((i) => {
					const p = pop(t, shots[i], 11);
					return (
						<div key={i} style={{width: 92, height: 92, borderRadius: 14, background: '#26272e', border: '2px solid #3f414b', transform: `scale(${i < n ? p : 0.001})`, overflow: 'hidden'}}>
							<Foto i={i} w={92} h={92} />
						</div>
					);
				})}
				<div style={{marginLeft: 'auto', alignSelf: 'center', color: '#fff', fontWeight: 700, fontSize: 20}}>Evidencias ({n})</div>
			</div>
			<div style={{position: 'absolute', left: SW / 2 - 44, top: 770, width: 88, height: 88, borderRadius: '50%', border: '6px solid #fff', background: flash > 0 ? '#ddd' : 'transparent'}} />
			{guardado > 0 && (
				<div style={{position: 'absolute', left: 30, right: 30, top: 560, borderRadius: 18, background: '#0f2e22', border: `3px solid ${VERDE}`, color: BLANCO, fontWeight: 800, fontSize: 22, padding: '14px 18px', textAlign: 'center', transform: `scale(${guardado})`}}>
					✓ Guardadas en la orden #128
				</div>
			)}
		</div>
	);
};

// ───────────────────────── Escena 5: Mi Garage (login real + portal recreado)
const BOTON = {x: 49 + 146, y: 702 + 27}; // centro del botón «Ingresar» en CSS (captura 390x844)
const K_CAP = SW / 390;
const PASOS = ['Recibida', 'Diagnóstico', 'Repuestos', 'Reparación', 'Lista'];
const Portal: React.FC<{t: number}> = ({t}) => {
	const llenado = ramp(t, T.avance - 0.1, T.avance + 0.9) * 0.75;
	const fotos = (i: number) => pop(t, T.fotos2 - 0.1 + i * 0.12, 11);
	return (
		<div style={{position: 'absolute', inset: 0, background: '#0b0b0d', fontFamily: UI, color: BLANCO}}>
			<Barra hora="19:05" />
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 24px 16px', borderBottom: '1px solid #222'}}>
				<span style={{fontWeight: 900, fontSize: 28, letterSpacing: 1}}>
					MI <span style={{color: ROJO}}>GARAGE</span>
				</span>
				<span style={{fontSize: 15, color: GRIS}}>recreación</span>
			</div>
			<div style={{margin: '18px 18px 0', borderRadius: 20, background: PANEL, padding: '18px 18px 22px'}}>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<div>
						<div style={{fontWeight: 900, fontSize: 30}}>KTM 350</div>
						<div style={{color: GRIS, fontSize: 17}}>Orden #128</div>
					</div>
					<span style={{background: ROJO, borderRadius: 20, padding: '6px 14px', fontWeight: 800, fontSize: 17}}>En reparación</span>
				</div>
				<div style={{marginTop: 22, height: 14, borderRadius: 7, background: '#2c2f38', overflow: 'hidden'}}>
					<div style={{width: `${llenado * 100}%`, height: '100%', background: `linear-gradient(90deg, ${ROJO}, #f97316)`}} />
				</div>
				<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: GRIS}}>
					{PASOS.map((p, i) => (
						<span key={p} style={{color: llenado >= i * 0.25 - 0.001 && llenado > 0 ? '#fca5a5' : GRIS, fontWeight: 700}}>
							{p}
						</span>
					))}
				</div>
			</div>
			<div style={{margin: '22px 22px 10px', fontWeight: 800, fontSize: 20}}>Evidencias del mecánico</div>
			<div style={{display: 'flex', gap: 12, padding: '0 18px'}}>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{flex: 1, height: 116, borderRadius: 16, background: '#26272e', transform: `scale(${fotos(i)})`, overflow: 'hidden'}}>
						<Foto i={i} w="100%" h={116} />
					</div>
				))}
			</div>
			<div style={{margin: '26px 22px 8px', fontWeight: 800, fontSize: 20}}>Historial</div>
			{['Service general', 'Cambio de kit de transmisión'].map((h, i) => (
				<div key={h} style={{margin: '8px 18px', borderRadius: 14, background: PANEL, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 17, color: '#d4d4d8'}}>
					<span>{h}</span>
					<span style={{color: GRIS}}>{i === 0 ? 'ago 2026' : 'may 2026'}</span>
				</div>
			))}
		</div>
	);
};

// ───────────────────────── Celulares a lo largo del reel
const Celulares: React.FC<{t: number}> = ({t}) => {
	const piezas: React.ReactNode[] = [];
	const o1 = 1 - ramp(t, T.mira - 0.25, T.mira + 0.05);
	if (o1 > 0) {
		const temblor = Math.sin(t * 40) * 3 * (t < T.dias ? 1 : 0);
		piezas.push(
			<div key="wa" style={{position: 'absolute', inset: 0, transform: `translateX(${temblor}px)`}}>
				<Celular op={o1}>
					<ListaWA t={t} />
				</Celular>
			</div>,
		);
	}
	const o2 = vis(t, T.mira - 0.15, T.en + 0.05, 0.3, 0.3);
	if (o2 > 0) {
		const z = mix(1, 1.06, ramp(t, T.mira, T.en));
		piezas.push(
			<Celular key="lv" op={o2} s={z * mix(0.9, 1, pop(t, T.mira - 0.15, 14))}>
				<Img src={staticFile('lv/portada.png')} style={{width: SW, display: 'block'}} />
			</Celular>,
		);
	}
	const o4 = vis(t, T.mecanico - 0.15, T.cliente + 0.05, 0.3, 0.3);
	if (o4 > 0)
		piezas.push(
			<Celular key="cam" op={o4} s={mix(0.9, 1, pop(t, T.mecanico - 0.15, 14))}>
				<Camara t={t} />
			</Celular>,
		);
	const o5 = vis(t, T.cliente - 0.15, T.menos + 0.05, 0.3, 0.3);
	if (o5 > 0)
		piezas.push(
			<Celular key="garage" op={o5} s={mix(0.9, 1, pop(t, T.cliente - 0.15, 14))}>
				{t < T.garage + 0.35 ? (
					<>
						<Img src={staticFile('lv/login.png')} style={{width: SW, display: 'block'}} />
						<Toque t={t} t0={T.garage - 0.05} x={BOTON.x * K_CAP} y={BOTON.y * K_CAP} />
					</>
				) : (
					<Portal t={t} />
				)}
			</Celular>,
		);
	return <>{piezas}</>;
};

// Rótulos fuera del celular
const Chip: React.FC<{t: number; t0: number; t1: number; y: number; children: React.ReactNode; bg?: string; color?: string}> = ({t, t0, t1, y, children, bg = BLANCO, color = FONDO}) => {
	if (t < t0 || t > t1) return null;
	const p = pop(t, t0, 10) * (1 - ramp(t, t1 - 0.25, t1));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 32px', borderRadius: 50, background: bg, color, fontFamily: FONT, fontWeight: 'bold', fontSize: 44, transform: `scale(${p})`, boxShadow: '0 14px 30px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{children}</div>
		</div>
	);
};

// Escena 6: menos llamadas · clientes que confían
const Remate: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.menos - 0.15, T.queres + 0.05, 0.2, 0.3);
	if (op <= 0) return null;
	const a = pop(t, T.menos, 10);
	const b = pop(t, T.confian - 0.1, 10);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: op}}>
			<g transform={`translate(350 720) scale(${a})`}>
				<circle r={150} fill={PANEL} stroke="#2c2f38" strokeWidth={4} />
				<path transform="scale(2.4)" d="M-26 -34 Q-38 -30 -36 -12 Q-30 18 0 34 Q16 40 24 30 L30 18 Q32 12 26 8 L12 0 Q6 -2 2 4 L-2 10 Q-14 4 -20 -10 L-14 -14 Q-8 -18 -10 -24 L-16 -36 Q-20 -40 -26 -34 Z" fill={BLANCO} />
				<g transform="translate(108 -108)">
					<circle r={44} fill={VERDE} />
					<path d="M0 -20 V18 M-16 3 L0 20 L16 3" stroke={FONDO} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</g>
				<text y={215} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={46} fill={BLANCO}>
					<tspan x={0}>menos</tspan>
					<tspan x={0} dy={52}>llamadas</tspan>
				</text>
			</g>
			<g transform={`translate(730 720) scale(${b})`}>
				<circle r={150} fill={PANEL} stroke="#2c2f38" strokeWidth={4} />
				<path transform="scale(2.2)" d="M0 -40 L32 -28 V0 Q32 26 0 40 Q-32 26 -32 0 V-28 Z" fill={BLANCO} />
				<path transform="scale(2.2)" d="M-14 0 L-4 10 L16 -12" stroke={VERDE} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				<text y={215} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={46} fill={BLANCO}>
					<tspan x={0}>clientes</tspan>
					<tspan x={0} dy={52}>que confían</tspan>
				</text>
			</g>
		</svg>
	);
};

// Escena 7: cierre
const Cierre: React.FC<{t: number}> = ({t}) => {
	if (t < T.queres - 0.05) return null;
	const logo = pop(t, T.queres, 11);
	const caso = pop(t, T.queres + 0.4, 11);
	const link = pop(t, T.link - 0.1, 10);
	const ig = pop(t, T.link + 0.4, 10);
	const flecha = Math.abs(Math.sin((t - T.link) * 7)) * 12;
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
			<g transform={`translate(492 430) scale(${0.7 + 0.3 * logo})`} opacity={Math.min(1, logo * 2)}>
				{/* logo oficial: ícono siempre negro con Z blanca y S naranja; sobre fondo oscuro «Zain» va en blanco (regla del usuario, 2026-11-20) */}
				<rect x={-330} y={-80} width={160} height={160} rx={36} fill={LOGO_TINTA} />
				<text x={-298} y={34} fontSize={92} fontFamily={FONT} fontWeight="bold" fill="#fff">
					Z
				</text>
				<text x={-246} y={34} fontSize={92} fontFamily={FONT} fontWeight="bold" fill={NARANJA}>
					S
				</text>
				<text x={-140} y={36} fontSize={118} fontFamily={FONT} fontWeight="bold">
					<tspan fill={BLANCO}>Zain</tspan>
					<tspan fill={NARANJA}>Soft</tspan>
				</text>
			</g>
			<g transform={`translate(540 600) scale(${caso})`}>
				<text textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight="bold" fill={GRIS}>
					caso real · <tspan fill={ROJO}>LV</tspan>
					<tspan fill={BLANCO}> Racing</tspan>
				</text>
			</g>
			<g transform={`translate(540 760) scale(${link})`}>
				<rect x={-270} y={-66} width={540} height={132} rx={66} fill={NARANJA} />
				<text x={34} y={21} fontSize={60} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fill="#fff">
					link en la bio
				</text>
				<g transform={`translate(-194 ${-4 - flecha})`} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
					<path d="M0 26 V-24 M-20 -6 L0 -26 L20 -6" />
				</g>
			</g>
			<g transform={`translate(540 910) scale(${ig})`}>
				<text textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight="bold" fill={BLANCO}>
					@zainsoft_
				</text>
			</g>
		</svg>
	);
};

// ───────────────────────── Subtítulos (blancos sobre oscuro)
const FUNC = new Set(['de', 'que', 'y', 'en', 'un', 'una', 'el', 'la', 'los', 'a', 'por', 'te', 'se', 'le', 'es', 'no', 'lo', 'tu', 'con', 'o', 'para', 'del', 'qué', 'al', 'sin', 'las', 'su', 'mi']);
const NOMBRES: Record<string, string> = {lv: 'lv'};
const AMARILLAS = new Set(['lv', 'racing', 'garage', 'bio', 'link']);
const VERDES = new Set(['lista', 'confían']);
type Cue = {s: number; e: number; words: {t: string; color: string}[]};
const CUES: Cue[] = (() => {
	const out: Cue[] = [];
	let cur: typeof PAL = [];
	const flush = () => {
		if (!cur.length) return;
		out.push({s: cur[0].s, e: cur[cur.length - 1].e, words: cur.map((w) => {
			const n = limpia(w.t);
			return {t: NOMBRES[n] ?? n, color: AMARILLAS.has(n) ? AMARILLO : VERDES.has(n) ? VERDE : BLANCO};
		})});
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
// Volumen (extrusión): capas corridas hacia abajo-derecha en un tono oscuro del color de cada palabra
const PROFUNDIDAD: Record<string, string> = {[BLANCO]: '#6b6f7a', [AMARILLO]: '#8a7d00', [VERDE]: '#00804a'};
const volumen = (color: string, capas = 7) => {
	const d = PROFUNDIDAD[color] ?? '#55585f';
	const pasos = Array.from({length: capas}, (_, i) => `${i + 1}px ${i + 1}px 0 ${d}`);
	return [...pasos, `${capas + 2}px ${capas + 4}px 14px rgba(0,0,0,0.85)`, '0 0 3px rgba(0,0,0,0.6)'].join(', ');
};
const Subtitulos: React.FC<{t: number; sub3d?: boolean}> = ({t, sub3d}) => {
	const cue = CUES.find((c) => t >= c.s && t < c.e);
	if (!cue) return null;
	const p = spring({frame: (t - cue.s) * FPS, fps: FPS, config: {damping: 11, stiffness: 220}});
	const len = cue.words.map((w) => w.t).join(' ').length;
	const size = Math.max(56, Math.min(88, 88 - Math.max(0, len - 13) * 2.4));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 1290, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{position: 'relative', fontFamily: FONT, fontWeight: 'bold', fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', transform: `translateY(${(1 - p) * 20}px) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 1.5), textShadow: sub3d ? undefined : '0 4px 16px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)'}}>
				{cue.words.map((w, i) => (
					<span key={i} style={{color: w.color, marginRight: i < cue.words.length - 1 ? '0.28em' : 0, textShadow: sub3d ? volumen(w.color) : undefined}}>
						{w.t}
					</span>
				))}
			</div>
		</div>
	);
};

// ───────────────────────── Bit (con luz en el piso para que se lea su mitad negra)
const S_BIT = 0.34;
const BIT_FLOOR = 1650;
const BIT_X = 200;
const BitLayer: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const GEST: [number, Gesture][] = [
		[0, 'think'], [T.mira - 0.1, 'point'], [T.tucuman + 0.6, 'rest'], [T.recibida - 0.1, 'point'], [T.lista + 0.4, 'celebrate'],
		[T.mecanico, 'rest'], [T.fotos, 'point'], [T.orden + 0.4, 'rest'], [T.avance, 'point'], [T.llamar, 'celebrate'],
		[T.menos + 0.3, 'rest'], [T.link - 0.1, 'point'], [VOZ_FIN + 0.1, 'wave'],
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
				<radialGradient id="luzBit">
					<stop offset="0%" stopColor="#ffd9b8" stopOpacity={0.55} />
					<stop offset="45%" stopColor="#f2602e" stopOpacity={0.22} />
					<stop offset="100%" stopColor="#f2602e" stopOpacity={0} />
				</radialGradient>
				<radialGradient id="sombraBit">
					<stop offset="0%" stopColor="#000" stopOpacity={0.6} />
					<stop offset="100%" stopColor="#000" stopOpacity={0} />
				</radialGradient>
			</defs>
			<ellipse cx={BIT_X} cy={BIT_FLOOR - 120} rx={230} ry={230} fill="url(#luzBit)" />
			<ellipse cx={BIT_X} cy={BIT_FLOOR + 4} rx={((115 * S_BIT) / 0.4) * 1.25} ry={((16 * S_BIT) / 0.4) * 1.6} fill="url(#sombraBit)" />
			<g transform={`translate(${BIT_X} ${BIT_FLOOR}) scale(${S_BIT})`}>
				<BitRig pose={pose} />
			</g>
		</svg>
	);
};

// ───────────────────────── Composición
const sfx = (): {t: number; f: string; v: number; d: number}[] => [
	...CHATS.map((_, i) => ({t: llegada(i), f: 'poof.aac', v: 0.05, d: 15})),
	{t: T.mira - 0.1, f: 'flash.aac', v: 0.08, d: 40},
	{t: T.recibida, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.diagnostico, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.repuestos, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.reparacion, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.lista, f: 'flash.aac', v: 0.07, d: 30},
	{t: T.fotos, f: 'camera flash.aac', v: 0.07, d: 20},
	{t: T.celular, f: 'camera flash.aac', v: 0.07, d: 20},
	{t: T.quedan, f: 'camera flash.aac', v: 0.07, d: 20},
	{t: T.garage - 0.05, f: 'poof.aac', v: 0.07, d: 20},
	{t: T.menos, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.confian - 0.1, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.queres, f: 'flash.aac', v: 0.08, d: 40},
];

export const LvReel: React.FC<{sub3d?: boolean}> = ({sub3d = false}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	return (
		<AbsoluteFill style={{background: FONDO, overflow: 'hidden'}}>
			<style>{`@font-face { font-family: 'HandoBold'; src: url('${staticFile('Hando.otf')}') format('opentype'); font-weight: bold; }`}</style>
			<Audio src={staticFile('voz_master.wav')} volume={1} />
			{sfx().map((s, i) => (
				<Sequence key={i} from={Math.max(0, Math.round(s.t * FPS))} durationInFrames={s.d}>
					<Audio src={staticFile(s.f)} volume={s.v} />
				</Sequence>
			))}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, rgba(242,96,46,0.16) 0%, rgba(14,15,19,0) 62%)'}} />
			<svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.9}}>
				<defs>
					<pattern id="rejilla" width={90} height={90} patternUnits="userSpaceOnUse">
						<path d="M90 0 H0 V90" fill="none" stroke="#1B1D23" strokeWidth={2} />
					</pattern>
				</defs>
				<rect width={1080} height={1920} fill="url(#rejilla)" />
			</svg>

			{/* visuales recreados en cada cuadro (key={frame}); el audio queda fuera */}
			<AbsoluteFill key={frame}>
				<Celulares t={t} />
				<Tablero t={t} />
				<Chip t={t} t0={T.lv - 0.1} t1={T.en} y={250} bg={ROJO} color="#fff">
					CASO REAL
				</Chip>
				<Chip t={t} t0={T.tucuman - 0.05} t1={T.en} y={1180}>
					📍 Tucumán
				</Chip>
				<Chip t={t} t0={T.llamar - 0.1} t1={T.menos} y={260}>
					📵 0 llamadas
				</Chip>
				<Remate t={t} />
				<Cierre t={t} />
				<BitLayer t={t} frame={frame} />
				<Subtitulos t={t} sub3d={sub3d} />
			</AbsoluteFill>

			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', background: `rgba(14,15,19,${0.003 + (frame % 2) * 0.004})`}} />
		</AbsoluteFill>
	);
};
