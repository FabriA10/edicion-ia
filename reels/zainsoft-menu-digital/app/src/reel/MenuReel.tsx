import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import amplitudes from './amplitud.json';
import palabras from './palabras.json';
import M from '../menu-medidas.json';
import {BitRig, BitRigPose} from '../bit/BitRig';
import {blendGestures, blinkAt, kf, mix, mouthFrom, Gesture} from '../bit/bitMotion';

// Reel «El menú en PDF que nadie puede leer» (ZainSoft · menú digital con QR).
// El «celular» es la maqueta de la demo de la web (capturas reales en public/demo/, sin enviar nada); el PDF y el escaneo
// se dibujan en código con el mismo marco. Sin rostros humanos. Todos los tiempos salen de las palabras de la voz real.

const FPS = 30;
const NARANJA = '#F2602E';
const CREMA = '#F5EFE6';
const TINTA = '#14151A';
const ROJO = '#D93025';
const VERDE_C = '#00A35C';
const GRIS_C = '#6B7280';
const FONT = "HandoBold, 'Segoe UI', Arial, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";

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
	const pdf = at('pdf');
	const nadie = at('nadie');
	const hay = at('hay');
	const borroso = at('borroso', hay);
	const con = at('con', borroso);
	const escanea = at('escanea', con);
	const instalar = at('instalar', escanea);
	const elige = at('elige', instalar);
	const categoria = at('categoría', elige);
	const toque = at('toque', categoria);
	const pedido = at('pedido', toque);
	const whatsapp = at('whatsapp', pedido);
	const mesa = at('mesa', whatsapp);
	const total = at('total', mesa);
	const vos = at('vos', total);
	const precios = at('precios', vos);
	const comisiones = at('comisiones', precios);
	const querés = at('querés', comisiones);
	const proba = at('probá', querés);
	const bio = at('bio', proba);
	return {pdf, nadie, hay, borroso, con, escanea, instalar, elige, categoria, toque, pedido, whatsapp, mesa, total, vos, precios, comisiones, querés, proba, bio};
})();
const END = VOZ_FIN + 1.4;
export const REEL_FRAMES = Math.ceil(END * FPS);

// ───────────────────────── El «celular» (maqueta de la demo)
const S = 1.45; // px del reel por px CSS de la maqueta
const TW = M.tel.w * S;
const TH = M.tel.h * S;
const RAD = 40 * S;
const BORDE = 10 * S;

const Telefono: React.FC<{x: number; y: number; s?: number; op?: number; children: React.ReactNode}> = ({x, y, s = 1, op = 1, children}) => (
	<div
		style={{
			position: 'absolute',
			left: x - TW / 2,
			top: y - TH / 2,
			width: TW,
			height: TH,
			borderRadius: RAD,
			overflow: 'hidden',
			background: '#fff',
			boxShadow: '0 40px 80px rgba(58,42,32,0.28), 0 10px 24px rgba(58,42,32,0.18)',
			transform: `scale(${s})`,
			opacity: op,
		}}
	>
		{children}
	</div>
);

const Captura: React.FC<{src: string}> = ({src}) => <Img src={staticFile(`demo/${src}.png`)} style={{position: 'absolute', left: 0, top: 0, width: TW, height: TH}} />;

// Anillo de toque (coordenadas CSS de la maqueta)
const Toque: React.FC<{t: number; t0: number; x: number; y: number}> = ({t, t0, x, y}) => {
	const p = (t - t0) / 0.5;
	if (p < 0 || p > 1) return null;
	const r = 16 + 40 * p;
	return (
		<div
			style={{
				position: 'absolute',
				left: x * S - r,
				top: y * S - r,
				width: r * 2,
				height: r * 2,
				borderRadius: '50%',
				border: `6px solid rgba(20,21,26,${0.7 * (1 - p)})`,
				background: `rgba(255,255,255,${0.45 * (1 - p)})`,
			}}
		/>
	);
};
const centro = (r: {x: number; y: number; w: number; h: number}) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});

// PDF de menú (dentro del marco): hoja escaneada con letra chica
const LINEAS = [
	['Empanadas (docena)', '$ 9.000'], ['Provoleta', '$ 6.800'], ['Milanesa napolitana', '$ 12.500'], ['Ravioles caseros', '$ 10.900'],
	['Hamburguesa completa', '$ 11.800'], ['Bife de chorizo', '$ 15.400'], ['Ensalada mixta', '$ 4.900'], ['Papas fritas', '$ 4.200'],
	['Gaseosa 500 ml', '$ 2.800'], ['Agua mineral', '$ 2.200'], ['Limonada', '$ 5.200'], ['Flan casero', '$ 4.200'], ['Helado', '$ 4.600'],
];
const PDF: React.FC<{zoom: number; blur: number}> = ({zoom, blur}) => (
	<div style={{position: 'absolute', inset: 0, background: '#3a3d47'}}>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 60, background: '#24262d', color: '#cfd2da', fontFamily: 'Arial', fontSize: 22, display: 'flex', alignItems: 'center', paddingLeft: 30, gap: 16}}>
			<span style={{background: ROJO, color: '#fff', fontWeight: 'bold', fontSize: 15, padding: '3px 7px', borderRadius: 4}}>PDF</span>
			menu_2026_FINAL(3).pdf
		</div>
		<div
			style={{
				position: 'absolute',
				left: 40,
				top: 100,
				width: TW - 80,
				height: TH - 150,
				background: '#e9e2d3',
				boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
				transform: `scale(${zoom}) rotate(-2.2deg)`,
				transformOrigin: '42% 48%',
				filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
				padding: '26px 22px',
				fontFamily: "'Times New Roman', serif",
				color: '#3b3630',
			}}
		>
			<div style={{textAlign: 'center', fontSize: 30, fontWeight: 'bold', letterSpacing: 6}}>MENÚ</div>
			<div style={{textAlign: 'center', fontSize: 11, marginBottom: 14, opacity: 0.7}}>precios sujetos a cambios sin previo aviso</div>
			{LINEAS.map(([a, b], i) => (
				<div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, lineHeight: '21px', borderBottom: '1px dotted #b9b2a6', opacity: 0.85}}>
					<span>{a}</span>
					<span>{b}</span>
				</div>
			))}
		</div>
	</div>
);

// QR decorativo, determinista (no lleva a ningún lado)
const QR: React.FC<{size: number}> = ({size}) => {
	const N = 25;
	const c = size / N;
	const finder = (x: number, y: number) => (
		<g key={`f${x}${y}`}>
			<rect x={x * c} y={y * c} width={7 * c} height={7 * c} fill={TINTA} />
			<rect x={(x + 1) * c} y={(y + 1) * c} width={5 * c} height={5 * c} fill="#fff" />
			<rect x={(x + 2) * c} y={(y + 2) * c} width={3 * c} height={3 * c} fill={TINTA} />
		</g>
	);
	const cells: React.ReactNode[] = [];
	for (let i = 0; i < N; i++)
		for (let j = 0; j < N; j++) {
			const enFinder = (i < 8 && j < 8) || (i < 8 && j >= N - 8) || (i >= N - 8 && j < 8);
			if (enFinder) continue;
			const h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
			if (h - Math.floor(h) > 0.52) cells.push(<rect key={`${i}-${j}`} x={j * c} y={i * c} width={c} height={c} fill={TINTA} />);
		}
	return (
		<svg width={size} height={size}>
			<rect width={size} height={size} fill="#fff" />
			{cells}
			{finder(0, 0)}
			{finder(N - 7, 0)}
			{finder(0, N - 7)}
		</svg>
	);
};

// Vista de cámara escaneando el cartelito de la mesa
const Escaneo: React.FC<{t: number}> = ({t}) => {
	const linea = ((t - T.con) * 0.9) % 1;
	return (
		<div style={{position: 'absolute', inset: 0, background: '#2b2620'}}>
			<div style={{position: 'absolute', left: TW / 2 - 170, top: TH / 2 - 230, width: 340, height: 420, background: '#fffdf8', borderRadius: 18, transform: 'rotate(-4deg)', boxShadow: '0 16px 40px rgba(0,0,0,0.45)', textAlign: 'center', paddingTop: 24}}>
				<div style={{fontFamily: FONT, fontWeight: 'bold', fontSize: 34, color: TINTA}}>MESA 4</div>
				<div style={{margin: '14px auto', width: 240}}>
					<QR size={240} />
				</div>
				<div style={{fontFamily: FONT, fontWeight: 'bold', fontSize: 26, color: NARANJA}}>escaneá el menú</div>
			</div>
			{/* esquinas del lector */}
			<svg width={TW} height={TH} style={{position: 'absolute', left: 0, top: 0}}>
				{[
					[TW / 2 - 165, TH / 2 - 160, 1, 1],
					[TW / 2 + 165, TH / 2 - 160, -1, 1],
					[TW / 2 - 165, TH / 2 + 160, 1, -1],
					[TW / 2 + 165, TH / 2 + 160, -1, -1],
				].map(([x, y, sx, sy], i) => (
					<path key={i} d={`M${x} ${y + 50 * sy} V${y} H${x + 50 * sx}`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
				))}
				<rect x={TW / 2 - 160} y={TH / 2 - 160 + 320 * linea} width={320} height={5} fill={VERDE_C} opacity={0.9} />
			</svg>
		</div>
	);
};

// ───────────────────────── Contenido del celular a lo largo del reel
const CelularPrincipal: React.FC<{t: number}> = ({t}) => {
	// posición y escala
	const sIn = kf(t, [[0, 1.04], [T.hay, 1.0]]);
	const sWa = 1 - 0.12 * ramp(t, T.pedido + 0.2, T.pedido + 0.6) + 0.12 * ramp(t, T.vos - 0.3, T.vos + 0.1);
	const sCta = mix(1, 0.52, ramp(t, T.querés - 0.1, T.querés + 0.5));
	const x = mix(540, 770, ramp(t, T.querés - 0.1, T.querés + 0.5));
	const y = mix(760, 1050, ramp(t, T.querés - 0.1, T.querés + 0.5));
	const punch = 1 + 0.08 * ramp(t, T.elige - 0.1, T.elige + 0.4) - 0.08 * ramp(t, T.pedido, T.pedido + 0.4);
	const s = sIn * sWa * sCta * punch;

	let contenido: React.ReactNode;
	let extra: React.ReactNode = null;
	if (t < T.con) {
		const z = mix(1, 2.6, ramp(t, T.hay + 0.3, T.borroso + 0.3));
		const b = mix(1.6, 5.5, ramp(t, T.hay + 0.6, T.borroso + 0.4)); // escaneo malo desde el principio
		contenido = <PDF zoom={z} blur={b} />;
		// pellizco: dos anillos que se separan
		const pz = ramp(t, T.hay + 0.3, T.borroso + 0.2);
		if (t > T.hay + 0.1 && t < T.borroso + 0.6) {
			const d = mix(30, 150, pz);
			const o = 1 - ramp(t, T.borroso + 0.3, T.borroso + 0.6);
			extra = (
				<>
					{[-1, 1].map((k) => (
						<div key={k} style={{position: 'absolute', left: TW / 2 + k * d * 0.7 - 34, top: TH / 2 + k * d - 34, width: 68, height: 68, borderRadius: '50%', border: '6px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.35)', opacity: o}} />
					))}
				</>
			);
		}
	} else if (t < T.instalar - 0.15) {
		contenido = <Escaneo t={t} />;
	} else if (t < T.elige) {
		contenido = <Captura src="m0" />;
	} else {
		const f = t < T.categoria ? 'm1' : t < T.toque ? 'm2' : 'm3';
		contenido = <Captura src={f} />;
		extra = (
			<>
				<Toque t={t} t0={T.elige - 0.05} {...centro(M.agregarEmp)} />
				<Toque t={t} t0={T.categoria - 0.05} {...centro(M.tabPrinc)} />
				<Toque t={t} t0={T.toque - 0.05} {...centro(M.agregarMila)} />
				<Toque t={t} t0={T.pedido - 0.05} {...centro(M.barra)} />
				<Precio t={t} />
			</>
		);
	}
	// destello al abrir la demo
	const flash = t > T.instalar - 0.25 && t < T.instalar + 0.25 ? Math.sin(((t - (T.instalar - 0.25)) / 0.5) * Math.PI) : 0;
	const conBorde = t < T.instalar - 0.15; // PDF y escaneo: mismo borde que la maqueta de la demo
	return (
		<Telefono x={x} y={y} s={s}>
			{contenido}
			{extra}
			{conBorde && <div style={{position: 'absolute', inset: 0, borderRadius: RAD, boxShadow: `inset 0 0 0 ${BORDE}px #111827`}} />}
			{flash > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${flash * 0.9})`}} />}
		</Telefono>
	);
};

// Escena 6: el precio de la milanesa cambia (ejemplo ilustrativo)
const Precio: React.FC<{t: number}> = ({t}) => {
	if (t < T.precios - 0.1) return null;
	const k = ramp(t, T.precios, T.precios + 0.7);
	const v = Math.round(mix(12500, 13200, k) / 100) * 100;
	const r = M.precioMila;
	return (
		<>
			<div style={{position: 'absolute', left: (r.x - 4) * S, top: (r.y - 2) * S, width: 96 * S, height: (r.h + 4) * S, background: '#fff'}} />
			<div style={{position: 'absolute', left: r.x * S, top: (r.y - 1) * S, fontFamily: 'Arial', fontWeight: 'bold', fontSize: 14 * S, color: '#dc2626', lineHeight: `${r.h * S}px`, display: 'flex', alignItems: 'center', gap: 10}}>
				${v.toLocaleString('es-AR')}
				<svg width={30} height={30} viewBox="-15 -15 30 30" style={{opacity: 1 - ramp(t, T.precios + 0.9, T.precios + 1.2)}}>
					<path d="M-9 9 L-7 3 L6 -10 L10 -6 L-3 7 Z" fill={NARANJA} />
				</svg>
			</div>
			<div style={{position: 'absolute', left: r.x * S, top: (r.y + r.h + 2) * S, fontFamily: MONO, fontSize: 18, color: GRIS_C, opacity: ramp(t, T.precios + 0.3, T.precios + 0.6)}}>(ejemplo)</div>
		</>
	);
};

// ───────────────────────── Piezas fuera del celular
const SceneSvg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
		{children}
	</svg>
);

const Sticker: React.FC<{t: number; t0: number; t1: number; y: number; rot: number; children: React.ReactNode}> = ({t, t0, t1, y, rot, children}) => {
	if (t < t0 || t > t1) return null;
	const p = pop(t, t0, 10) * (1 - ramp(t, t1 - 0.25, t1));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 18,
					padding: '18px 38px',
					borderRadius: 60,
					background: '#fff',
					border: `5px solid ${TINTA}`,
					fontFamily: FONT,
					fontWeight: 'bold',
					fontSize: 54,
					color: TINTA,
					transform: `rotate(${rot}deg) scale(${p})`,
					boxShadow: '0 16px 36px rgba(58,42,32,0.22)',
					whiteSpace: 'nowrap',
				}}
			>
				{children}
			</div>
		</div>
	);
};

const LupaTachada: React.FC = () => (
	<svg width={64} height={64} viewBox="-32 -32 64 64">
		<g fill="none" stroke={TINTA} strokeWidth={7} strokeLinecap="round">
			<circle cx={-5} cy={-5} r={17} />
			<path d="M8 8 L22 22" />
		</g>
		<path d="M-26 -26 L26 26" stroke={ROJO} strokeWidth={8} strokeLinecap="round" />
	</svg>
);

const LogoWA: React.FC<{s?: number}> = ({s = 70}) => (
	<svg width={s} height={s} viewBox="-32 -32 64 64" style={{flex: 'none'}}>
		<circle r={30} fill="#25D366" />
		<path d="M-14 16 L-11 6 A15 15 0 1 1 -4 13 Z" fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
		<path d="M-6 -6 Q-6 6 6 6" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
	</svg>
);

// Escena 5: la tarjeta «Así le llega al local por WhatsApp» (captura real) sale del celular
const WA_S = 2.15; // px del reel por px CSS de la tarjeta
const WaCard: React.FC<{t: number}> = ({t}) => {
	const t0 = T.pedido + 0.15;
	const t1 = T.vos;
	if (t < t0 || t > t1 + 0.1) return null;
	const p = pop(t, t0, 13);
	const out = 1 - ramp(t, t1 - 0.3, t1);
	const w = M.wa.w * WA_S;
	const h = M.wa.h * WA_S;
	const marco = (a: number, r: {x: number; y: number; w: number; h: number}) => {
		const op = vis(t, a, t1 - 0.2, 0.15, 0.2);
		if (op <= 0) return null;
		const g = 6 + 3 * Math.sin((t - a) * 9);
		return <div style={{position: 'absolute', left: r.x * WA_S - g, top: r.y * WA_S - g, width: r.w * WA_S + 2 * g, height: r.h * WA_S + 2 * g, border: `5px solid ${NARANJA}`, borderRadius: 14, opacity: op}} />;
	};
	return (
		<div style={{position: 'absolute', left: 540 - w / 2, top: 700 - h / 2 + (1 - p) * 300, width: w, height: h, transform: `scale(${mix(0.4, 1, p)})`, opacity: Math.min(1, p * 2) * out}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: 18 * WA_S * 0.5, overflow: 'hidden', boxShadow: '0 40px 80px rgba(58,42,32,0.3)'}}>
				<Img src={staticFile('demo/whatsapp.png')} style={{width: w, height: h}} />
			</div>
			{marco(T.mesa - 0.05, {x: 14, y: 50, w: 150, h: 22})}
			{marco(T.total - 0.05, {x: 14, y: 114, w: 120, h: 22})}
			<div style={{position: 'absolute', right: -30, top: -40, transform: `scale(${pop(t, t0 + 0.25, 9)})`}}>
				<LogoWA s={96} />
			</div>
		</div>
	);
};

const SelloComisiones: React.FC<{t: number}> = ({t}) => {
	const t0 = T.comisiones;
	if (t < t0 || t > T.querés + 0.2) return null;
	const p = pop(t, t0, 9);
	const out = 1 - ramp(t, T.querés - 0.2, T.querés + 0.2);
	return (
		<div
			style={{
				position: 'absolute',
				left: 540,
				top: 1120,
				transform: `translate(-50%, -50%) rotate(-7deg) scale(${mix(2.2, 1, p)})`,
				opacity: Math.min(1, p * 3) * out,
				padding: '10px 34px',
				border: `9px solid ${NARANJA}`,
				borderRadius: 18,
				color: NARANJA,
				fontFamily: FONT,
				fontWeight: 'bold',
				fontSize: 62,
				letterSpacing: 4,
				whiteSpace: 'nowrap',
				background: 'rgba(255,253,248,0.85)',
			}}
		>
			SIN COMISIONES
		</div>
	);
};

const Cierre: React.FC<{t: number}> = ({t}) => {
	if (t < T.querés) return null;
	const logo = pop(t, T.querés + 0.1, 11);
	const proba = pop(t, T.proba, 11);
	const link = pop(t, T.bio - 0.35, 10);
	const ig = pop(t, T.bio + 0.15, 10);
	const flecha = Math.abs(Math.sin((t - T.bio) * 7)) * 12;
	return (
		<SceneSvg>
			<g transform={`translate(492 400) scale(${0.7 + 0.3 * logo})`} opacity={Math.min(1, logo * 2)}>
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
			<g transform={`translate(540 590) scale(${proba})`}>
				<text textAnchor="middle" fontSize={72} fontFamily={FONT} fontWeight="bold" fill={TINTA}>
					Probá la demo
				</text>
			</g>
			<g transform={`translate(400 730) scale(${link})`}>
				<rect x={-250} y={-62} width={500} height={124} rx={62} fill={NARANJA} />
				<text x={30} y={20} fontSize={56} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fill="#fff">
					link en la bio
				</text>
				<g transform={`translate(-180 ${-4 - flecha})`} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
					<path d="M0 26 V-24 M-20 -6 L0 -26 L20 -6" />
				</g>
			</g>
			<g transform={`translate(330 860) scale(${ig})`}>
				<text textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight="bold" fill={TINTA}>
					@zainsoft_
				</text>
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Subtítulos
const FUNC = new Set(['de', 'que', 'y', 'en', 'un', 'una', 'el', 'la', 'los', 'a', 'por', 'te', 'se', 'le', 'es', 'no', 'lo', 'tu', 'con', 'o', 'para', 'del', 'qué', 'cómo', 'más', 'al', 'sin']);
const NOMBRES: Record<string, string> = {pdf: 'pdf', qr: 'qr'};
const ROJAS = new Set(['pdf', 'borroso', 'nadie']);
const NARANJAS = new Set(['qr', 'menú', 'digital', 'local', 'bio', 'demo', 'comisiones']);
const VERDES = new Set(['whatsapp']);

type Cue = {s: number; e: number; words: {t: string; color: string}[]};
const CUES: Cue[] = (() => {
	const out: Cue[] = [];
	let cur: typeof PAL = [];
	const flush = () => {
		if (!cur.length) return;
		out.push({
			s: cur[0].s,
			e: cur[cur.length - 1].e,
			words: cur.map((w) => {
				const n = limpia(w.t);
				return {t: NOMBRES[n] ?? n, color: ROJAS.has(n) ? ROJO : NARANJAS.has(n) ? NARANJA : VERDES.has(n) ? VERDE_C : TINTA};
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
		<div style={{position: 'absolute', left: 0, right: 0, top: 1280, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{position: 'absolute', width: 720, height: 130, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.5), rgba(255,255,255,0) 70%)'}} />
			<div
				style={{
					position: 'relative',
					fontFamily: FONT,
					fontWeight: 'bold',
					fontSize: size,
					lineHeight: 1,
					whiteSpace: 'nowrap',
					transform: `translateY(${(1 - p) * 20}px) scale(${0.85 + 0.15 * p})`,
					opacity: Math.min(1, p * 1.5),
					textShadow: '0 3px 14px rgba(255,255,255,0.8)',
				}}
			>
				{cue.words.map((w, i) => (
					<span key={i} style={{color: w.color, marginRight: i < cue.words.length - 1 ? '0.28em' : 0}}>
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
const gestos = (): [number, Gesture][] => [
	[0, 'think'], [T.hay, 'rest'], [T.borroso - 0.2, 'think'], [T.con, 'rest'], [T.escanea - 0.1, 'point'], [T.instalar + 0.4, 'rest'],
	[T.elige, 'point'], [T.toque + 0.6, 'rest'], [T.whatsapp, 'celebrate'], [T.mesa + 0.6, 'rest'], [T.precios - 0.1, 'point'],
	[T.comisiones + 0.6, 'rest'], [T.proba, 'point'], [VOZ_FIN + 0.1, 'wave'],
];
const BitLayer: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const GEST = gestos();
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
	{t: 0.05, f: 'Paper in Air.aac', v: 0.08, d: 40},
	{t: T.nadie, f: 'poof.aac', v: 0.09, d: 25},
	{t: T.hay + 0.3, f: 'Spinning.aac', v: 0.04, d: 30},
	{t: T.con, f: 'Scan.aac', v: 0.06, d: 45},
	{t: T.instalar - 0.25, f: 'flash.aac', v: 0.07, d: 40},
	{t: T.instalar, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.elige, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.categoria, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.toque, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.pedido, f: 'poof.aac', v: 0.07, d: 20},
	{t: T.pedido + 0.4, f: 'flash.aac', v: 0.07, d: 40},
	{t: T.precios, f: 'Counter.aac', v: 0.05, d: 25},
	{t: T.comisiones, f: 'Stone motion.aac', v: 0.09, d: 20},
	{t: T.querés + 0.1, f: 'flash.aac', v: 0.08, d: 40},
];

export const MenuReel: React.FC = () => {
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
				<CelularPrincipal t={t} />
				<Sticker t={t} t0={T.nadie} t1={T.hay + 0.2} y={300} rot={-5}>
					<LupaTachada />
					nadie lo lee
				</Sticker>
				<Sticker t={t} t0={T.instalar - 0.1} t1={T.elige - 0.1} y={280} rot={4}>
					sin instalar nada
				</Sticker>
				<WaCard t={t} />
				<SelloComisiones t={t} />
				<Cierre t={t} />
				<BitLayer t={t} frame={frame} />
				<Subtitulos t={t} />
			</AbsoluteFill>

			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', background: `rgba(245,239,230,${0.003 + (frame % 2) * 0.004})`}} />
		</AbsoluteFill>
	);
};
