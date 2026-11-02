import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import amplitudes from './amplitud.json';
import palabras from './palabras.json';
import {BitRig, BitRigPose} from '../bit/BitRig';
import {blendGestures, blinkAt, kf, mix, mouthFrom, Gesture} from '../bit/bitMotion';

// Reel «Una sola computadora» (ZainSoft): el hackeo a Binance y la semana de hackeos, contado por Bit.
// Look de película sobre fondo crema: viñeta y una sola luz en el problema; la luz se abre cálida en la solución.
// Todo en código salvo dos capturas (public/capturas/). Sin rostros humanos. Tiempos de la voz real (palabras.json).

const FPS = 30;
const NARANJA = '#F2602E';
const CREMA = '#F5EFE6';
const TINTA = '#14151A';
const ROJO = '#D93025';
const VERDE_C = '#00A35C';
const GRIS_C = '#6B7280';
const PAPEL = '#FFFDF8';
const FONT = "HandoBold, 'Segoe UI', Arial, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...cl, easing: ease});
const vis = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], cl);
const pop = (t: number, t0: number, damping = 12) => (t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {damping, stiffness: 150}}));

const END = 59.5;
export const REEL_FRAMES = Math.ceil(END * FPS);

// Límites de escena (s), de la voz real
const S = {gancho: 0, promesa: 4.6, acto1: 8.4, origen: 15.2, bucle1: 20.3, poly: 22.0, gmo: 26.6, bucle2: 31.7, climax: 33.6, iconos: 37.3, giro: 41.1, consejos: 44.2, cta: 50.4};

const Abs: React.FC<{op?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({op = 1, style, children}) =>
	op <= 0 ? null : <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: op, ...style}}>{children}</div>;

const Txt: React.FC<{y: number; size: number; color?: string; font?: string; op?: number; dy?: number; ls?: number; children: React.ReactNode}> = ({
	y,
	size,
	color = TINTA,
	font = FONT,
	op = 1,
	dy = 0,
	ls = 0,
	children,
}) => (
	<div style={{position: 'absolute', left: 120, right: 120, top: y + dy, textAlign: 'center', fontFamily: font, fontWeight: 'bold', fontSize: size, lineHeight: 1.1, color, opacity: op, letterSpacing: ls}}>
		{children}
	</div>
);

// ───────────────────────── Íconos (SVG, caja -60..60)
const Notebook: React.FC<{glow?: number; hi?: number}> = ({glow = 0, hi = 0}) => (
	<g>
		<rect x={-110} y={-80} width={220} height={140} rx={10} fill={TINTA} />
		<rect x={-98} y={-68} width={196} height={116} rx={4} fill={`rgba(217,48,37,${0.25 + 0.6 * glow})`} />
		<path d="M-140 66 H140 L124 84 H-124 Z" fill={TINTA} />
		{hi > 0 && <rect x={-128} y={-98} width={256} height={200} rx={18} fill="none" stroke={ROJO} strokeWidth={6} opacity={hi} />}
	</g>
);
const Servidor: React.FC = () => (
	<g>
		{[-60, -10, 40].map((y) => (
			<g key={y}>
				<rect x={-70} y={y} width={140} height={42} rx={8} fill={TINTA} />
				<circle cx={-44} cy={y + 21} r={6} fill={ROJO} />
				<rect x={-20} y={y + 17} width={70} height={8} rx={4} fill="#3a3d47" />
			</g>
		))}
	</g>
);
const Billetera: React.FC = () => (
	<g>
		<rect x={-74} y={-50} width={148} height={104} rx={16} fill={TINTA} />
		<rect x={20} y={-16} width={64} height={38} rx={10} fill="#2b2e36" />
		<circle cx={44} cy={3} r={8} fill={ROJO} />
	</g>
);
const Enchufe: React.FC<{c?: string}> = ({c = TINTA}) => (
	<g fill={c}>
		<rect x={-40} y={-30} width={80} height={60} rx={12} />
		<rect x={-26} y={-62} width={12} height={34} rx={4} />
		<rect x={14} y={-62} width={12} height={34} rx={4} />
		<rect x={-10} y={30} width={20} height={36} rx={4} />
	</g>
);
const Silueta: React.FC<{c?: string}> = ({c = TINTA}) => (
	<g fill={c}>
		<circle cy={-28} r={24} />
		<path d="M-44 52 Q-44 6 0 6 Q44 6 44 52 Z" />
	</g>
);
const OjoTachado: React.FC<{c?: string}> = ({c = TINTA}) => (
	<g fill="none" stroke={c} strokeWidth={9} strokeLinecap="round">
		<path d="M-52 0 Q0 -46 52 0 Q0 46 -52 0 Z" />
		<circle r={14} fill={c} stroke="none" />
		<path d="M-46 -40 L46 40" />
	</g>
);
const Candado: React.FC<{open?: number; c?: string}> = ({open = 0, c = TINTA}) => (
	<g>
		<path d={`M-50 -20 V-60 A50 50 0 0 1 50 -60 V${-20 - 40 * open}`} fill="none" stroke={c} strokeWidth={22} strokeLinecap="round" transform={`translate(0 ${-30 * open})`} />
		<rect x={-80} y={-24} width={160} height={130} rx={22} fill={c} />
		<circle cy={30} r={16} fill={CREMA} />
		<rect x={-6} y={34} width={12} height={34} rx={4} fill={CREMA} />
	</g>
);
const Llave: React.FC<{c?: string}> = ({c = NARANJA}) => (
	<g fill="none" stroke={c} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round">
		<circle cx={-30} r={24} />
		<path d="M-6 0 H52 M30 0 V18 M46 0 V14" />
	</g>
);
const Tilde: React.FC = () => (
	<g>
		<circle r={30} fill={VERDE_C} />
		<path d="M-14 1 L-4 11 L15 -10" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</g>
);

// Local en miniatura (tu negocio), puerta que se cierra
const Local: React.FC<{puerta: number}> = ({puerta}) => (
	<g>
		<rect x={-200} y={-120} width={400} height={260} rx={10} fill={PAPEL} stroke={TINTA} strokeWidth={6} />
		<g>
			{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
				<path key={i} d={`M${-220 + i * 55} -150 h55 v46 a27.5 27.5 0 0 1 -55 0 Z`} fill={i % 2 ? PAPEL : NARANJA} stroke={TINTA} strokeWidth={4} />
			))}
		</g>
		<rect x={-170} y={-40} width={170} height={110} rx={6} fill="#E9DFD0" stroke={TINTA} strokeWidth={5} />
		<rect x={40} y={-40} width={110} height={180} fill="#3a2a20" />
		<g transform={`translate(40 0) scale(${mix(0.08, 1, puerta)} 1)`}>
			<rect x={0} y={-40} width={110} height={180} fill={NARANJA} stroke={TINTA} strokeWidth={5} />
			<circle cx={92} cy={56} r={7} fill={TINTA} />
		</g>
		<text x={0} y={200} fontFamily={FONT} fontWeight="bold" fontSize={40} fill={TINTA} textAnchor="middle">
			tu negocio
		</text>
	</g>
);

// ───────────────────────── Escenas
const Gancho: React.FC<{t: number}> = ({t}) => {
	const op = 1 - ramp(t, 4.4, 5.0);
	if (op <= 0) return null;
	const s = mix(1, 1.15, ramp(t, 0, 4.6));
	const cuenta = interpolate(t, [2.76, 4.3], [0, 6_300_000_000], {...cl, easing: Easing.out(Easing.cubic)});
	const cP = pop(t, 2.76, 14);
	return (
		<Abs op={op}>
			{/* cono de luz */}
			<div style={{position: 'absolute', left: 140, top: 200, width: 800, height: 1100, background: 'radial-gradient(ellipse 50% 60% at 50% 70%, rgba(255,250,240,0.95), rgba(255,250,240,0) 70%)'}} />
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<g transform={`translate(540 960) scale(${s}) translate(-540 -960)`}>
					<rect x={160} y={1050} width={760} height={18} rx={9} fill={TINTA} opacity={0.85} />
					<path d="M640 1068 L1080 1180 L1080 1220 L600 1068 Z" fill="#3a2a20" opacity={0.12} />
					<g transform="translate(540 980) scale(1.6)">
						<Notebook glow={0.5 + 0.5 * Math.sin(t * 3)} />
					</g>
				</g>
			</svg>
			<div style={{opacity: Math.min(1, cP * 2), transform: `translateY(${(1 - cP) * 30}px)`}}>
				<Txt y={430} size={92} color={TINTA}>
					<span style={{whiteSpace: 'nowrap'}}>
						<span style={{fontSize: 50, color: GRIS_C}}>US$ </span>
						{Math.round(cuenta).toLocaleString('es-AR')}
					</span>
				</Txt>
				<Txt y={570} size={30} color={GRIS_C} font={MONO} op={ramp(t, 3.4, 3.8)}>
					impacto estimado por Binance
				</Txt>
			</div>
		</Abs>
	);
};

const Promesa: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, 5.1, 8.55, 0.25, 0.3);
	const a = pop(t, 5.59, 14);
	const b = pop(t, 7.41, 14);
	return (
		<Abs op={op}>
			<Txt y={560} size={110} op={a} dy={(1 - a) * 40}>
				cómo pasó
			</Txt>
			<Txt y={720} size={110} op={b} dy={(1 - b) * 40}>
				y <span style={{color: NARANJA}}>tu negocio</span>
			</Txt>
		</Abs>
	);
};

const Sello: React.FC<{t: number; t0: number; txt: string; color: string; x: number; y: number; rot: number; size?: number}> = ({t, t0, txt, color, x, y, rot, size = 92}) => {
	if (t < t0) return null;
	const p = pop(t, t0, 9);
	const s = mix(2.2, 1, p);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`,
				opacity: Math.min(1, p * 3) * 0.92,
				padding: '10px 34px',
				border: `9px solid ${color}`,
				borderRadius: 18,
				color,
				fontFamily: FONT,
				fontWeight: 'bold',
				fontSize: size,
				letterSpacing: 6,
				whiteSpace: 'nowrap',
				background: 'rgba(255,253,248,0.55)',
			}}
		>
			{txt}
		</div>
	);
};

const Rotulo: React.FC<{y: number; op: number; children: React.ReactNode; color?: string}> = ({y, op, children, color = GRIS_C}) => (
	<Txt y={y} size={30} color={color} font={MONO} op={op} ls={3}>
		{children}
	</Txt>
);

const Acto1: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, 8.5, 15.35, 0.3, 0.35);
	const p = pop(t, 8.66, 14);
	return (
		<Abs op={op}>
			<Rotulo y={290} op={ramp(t, 8.6, 9.0)}>
				EXPEDIENTE 01 · BINANCE
			</Rotulo>
			<div
				style={{
					position: 'absolute',
					left: 540 - 300,
					top: 360,
					width: 600,
					height: 750,
					borderRadius: 26,
					overflow: 'hidden',
					boxShadow: '0 40px 80px rgba(58,42,32,0.3)',
					transform: `translateY(${(1 - p) * 120}px) rotate(${-3 * p}deg) scale(${mix(0.9, 1, p) * mix(1, 1.04, ramp(t, 9, 15))})`,
					opacity: Math.min(1, p * 2),
				}}
			>
				<Img src={staticFile('capturas/ingenia-binance.png')} style={{width: 600, height: 750}} />
			</div>
			<Txt y={1130} size={24} color={GRIS_C} font={MONO} op={ramp(t, 9.2, 9.6)}>
				post de @ingenia.ai
			</Txt>
			<Sello t={t} t0={12.98} txt="HACKEO" color={ROJO} x={560} y={900} rot={-12} />
		</Abs>
	);
};

const Origen: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, 15.3, 20.45, 0.3, 0.3);
	const linea = (a: number) => ramp(t, a, a + 0.6);
	const dim = 1 - 0.75 * ramp(t, 18.4, 18.8);
	const card = pop(t, 18.5, 13);
	const hi = t > 18.3 && t < 19.4 ? 0.6 + 0.4 * Math.sin((t - 18.3) * 12) : 0;
	return (
		<Abs op={op}>
			<Rotulo y={440} op={ramp(t, 15.5, 15.9) * dim}>
				PRIMER INFORME DE BINANCE · 29/10
			</Rotulo>
			<svg width={1080} height={1920} style={{position: 'absolute', opacity: dim}}>
				<line x1={300} y1={720} x2={300 + 140 * linea(16.3)} y2={720} stroke={ROJO} strokeWidth={8} strokeDasharray="18 12" />
				<line x1={630} y1={720} x2={630 + 120 * linea(17.0)} y2={720} stroke={ROJO} strokeWidth={8} strokeDasharray="18 12" />
				<g transform={`translate(220 720) scale(${0.7 * pop(t, 15.6)})`}>
					<Notebook glow={0.6} hi={hi} />
				</g>
				<g transform={`translate(540 720) scale(${0.9 * pop(t, 16.4)})`}>
					<Servidor />
				</g>
				<g transform={`translate(840 720) scale(${0.85 * pop(t, 17.1)})`}>
					<Billetera />
				</g>
				<text x={220} y={850} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={30} fill={TINTA} opacity={ramp(t, 15.8, 16.1)}>
					notebook
				</text>
				<text x={540} y={850} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={30} fill={TINTA} opacity={ramp(t, 16.6, 16.9)}>
					servidor
				</text>
				<text x={840} y={850} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={30} fill={TINTA} opacity={ramp(t, 17.3, 17.6)}>
					billeteras
				</text>
			</svg>
			{card > 0 && (
				<div
					style={{
						position: 'absolute',
						left: 540 - 380,
						top: 520,
						width: 760,
						transform: `translateY(${(1 - card) * 160}px) rotate(${2 * card}deg)`,
						opacity: Math.min(1, card * 2),
						borderRadius: 22,
						overflow: 'hidden',
						background: '#fff',
						boxShadow: '0 36px 70px rgba(58,42,32,0.3)',
					}}
				>
					<Img src={staticFile('capturas/infobae-titular.png')} style={{width: 760, display: 'block'}} />
					<div style={{fontFamily: MONO, fontSize: 22, color: GRIS_C, padding: '0 28px 18px'}}>infobae.com · 30/10/2026</div>
				</div>
			)}
			<Sello t={t} t0={18.85} txt="ACTUALIZACIÓN 30/10" color={NARANJA} x={560} y={1110} rot={-6} size={48} />
		</Abs>
	);
};

// Puntos rojos del bucle 1 → de ellos nacen los expedientes 02 y 03
const DOT1 = {x: 250, y: 560};
const DOT2 = {x: 830, y: 980};
const Bucle1: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, 20.4, 22.4, 0.2, 0.4);
	const d = (t0: number) => pop(t, t0, 8);
	const pulso = 1 + 0.12 * Math.sin(t * 8);
	return (
		<Abs op={op}>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<g transform={`translate(540 760) scale(${0.3 * (1 - ramp(t, 20.4, 21.0)) + 0.0001})`} opacity={1 - ramp(t, 20.4, 21)}>
					<circle r={60} fill={ROJO} />
				</g>
				<circle cx={540} cy={760} r={26 * pulso} fill={ROJO} opacity={ramp(t, 20.5, 20.8)} />
				<circle cx={DOT1.x} cy={DOT1.y} r={26 * d(20.95) * pulso} fill={ROJO} />
				<circle cx={DOT2.x} cy={DOT2.y} r={26 * d(21.25) * pulso} fill={ROJO} />
				<circle cx={DOT1.x} cy={DOT1.y} r={26 + 60 * ((t * 1.2) % 1)} fill="none" stroke={ROJO} strokeWidth={3} opacity={d(20.95) * (1 - ((t * 1.2) % 1))} />
				<circle cx={DOT2.x} cy={DOT2.y} r={26 + 60 * ((t * 1.2 + 0.5) % 1)} fill="none" stroke={ROJO} strokeWidth={3} opacity={d(21.25) * (1 - ((t * 1.2 + 0.5) % 1))} />
			</svg>
		</Abs>
	);
};

const Expediente: React.FC<{num: string; nombre: string; sub?: string; children?: React.ReactNode; w?: number; h?: number}> = ({num, nombre, sub, children, w = 720, h = 640}) => (
	<div style={{position: 'relative', width: w, height: h, background: PAPEL, borderRadius: 22, boxShadow: '0 36px 70px rgba(58,42,32,0.26)', border: `2px solid #E4DACB`, overflow: 'hidden'}}>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, background: TINTA, color: '#fff', fontFamily: MONO, fontSize: 26, letterSpacing: 4, display: 'flex', alignItems: 'center', paddingLeft: 30}}>
			EXPEDIENTE {num}
		</div>
		<div style={{position: 'absolute', left: 40, right: 40, top: 96, fontFamily: FONT, fontWeight: 'bold', fontSize: 78, color: TINTA, lineHeight: 1}}>{nombre}</div>
		{sub && <div style={{position: 'absolute', left: 40, right: 40, top: 190, fontFamily: FONT, fontWeight: 'bold', fontSize: 34, color: GRIS_C, lineHeight: 1.2}}>{sub}</div>}
		{children}
	</div>
);

// Expediente que nace del punto rojo y crece al centro
const Crece: React.FC<{t: number; t0: number; from: {x: number; y: number}; to?: {x: number; y: number}; s1?: number; children: React.ReactNode}> = ({t, t0, from, to = {x: 540, y: 740}, s1 = 1, children}) => {
	const p = pop(t, t0, 15);
	return (
		<div style={{position: 'absolute', left: mix(from.x, to.x, p), top: mix(from.y, to.y, p), transform: `translate(-50%, -50%) scale(${mix(0.05, s1, p)})`, opacity: Math.min(1, p * 3)}}>
			{children}
		</div>
	);
};

// Recorte de diario (titular capturado) pegado arriba del expediente
const Recorte: React.FC<{t: number; t0: number; src: string; alto: number; fuente: string; rot: number; w?: number}> = ({t, t0, src, alto, fuente, rot, w = 640}) => {
	const p = pop(t, t0, 12);
	if (p <= 0) return null;
	return (
		<div
			style={{
				position: 'absolute',
				left: 540 - w / 2,
				top: 262,
				width: w,
				background: '#fff',
				borderRadius: 14,
				overflow: 'hidden',
				boxShadow: '0 22px 44px rgba(58,42,32,0.25)',
				transform: `translateY(${(1 - p) * -60}px) rotate(${rot * p}deg)`,
				opacity: Math.min(1, p * 2),
			}}
		>
			<Img src={staticFile(src)} style={{width: w, height: alto, display: 'block'}} />
			<div style={{fontFamily: MONO, fontSize: 20, color: GRIS_C, padding: '4px 20px 12px'}}>{fuente}</div>
		</div>
	);
};

const Polymarket: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, 22.1, 26.75, 0.2, 0.3);
	const ench = ramp(t, 24.84, 25.5);
	const pieza = pop(t, 25.85, 9);
	return (
		<Abs op={op}>
			<Crece t={t} t0={22.2} from={DOT1} to={{x: 540, y: 820}}>
				<Expediente num="02" nombre="POLYMARKET" sub="le entraron por el programa de un proveedor">
					<svg width={720} height={640} style={{position: 'absolute', left: 0, top: 0}}>
						<rect x={420} y={340} width={200} height={220} rx={18} fill="#E9DFD0" stroke={TINTA} strokeWidth={5} />
						<rect x={470} y={410} width={30} height={60} rx={6} fill={TINTA} />
						<rect x={540} y={410} width={30} height={60} rx={6} fill={TINTA} />
						<g transform={`translate(${mix(120, 360, ench)} 450) rotate(90)`}>
							<Enchufe />
							<g transform={`translate(0 0) scale(${pieza})`}>
								<circle r={20} fill={ROJO} />
							</g>
						</g>
						<path d={`M${mix(120, 360, ench) - 66} 450 H40`} stroke={TINTA} strokeWidth={10} />
						<text x={40} y={600} fontFamily={MONO} fontSize={24} fill={GRIS_C}>
							29/10 · ~US$ 2,5 M
						</text>
					</svg>
				</Expediente>
			</Crece>
			<Recorte t={t} t0={23.0} src="capturas/polymarket-titular.png" alto={164} fuente="bleepingcomputer.com · 29/10/2026" rot={-2} />
		</Abs>
	);
};

const GMO: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, 26.7, 31.85, 0.2, 0.3);
	const cifra = 'US$ 50.000.000';
	const n = Math.floor(ramp(t, 29.1, 30.4) * cifra.length + 0.0001);
	return (
		<Abs op={op}>
			<Crece t={t} t0={26.8} from={DOT2} to={{x: 540, y: 820}}>
				<Expediente num="03" nombre="GMO · JAPÓN" sub="les pidieron un rescate">
					<div
						style={{
							position: 'absolute',
							left: 70,
							right: 70,
							top: 290,
							height: 270,
							background: '#fff',
							border: `3px dashed ${ROJO}`,
							borderRadius: 12,
							transform: 'rotate(-2deg)',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 14,
						}}
					>
						<div style={{fontFamily: MONO, fontSize: 30, color: ROJO, letterSpacing: 6}}>RESCATE</div>
						<div style={{fontFamily: MONO, fontWeight: 'bold', fontSize: 62, color: TINTA, minHeight: 70}}>
							{cifra.slice(0, n)}
							{n < cifra.length && t >= 29.1 && <span style={{opacity: Math.floor(t * 4) % 2 ? 1 : 0.2}}>▌</span>}
						</div>
						<div style={{fontFamily: MONO, fontSize: 22, color: GRIS_C}}>la empresa no pagó</div>
					</div>
				</Expediente>
			</Crece>
			<Recorte t={t} t0={27.5} src="capturas/gmo-titular.png" w={780} alto={111} fuente="tokyoreporter.com · 26/10/2026" rot={2} />
		</Abs>
	);
};

const Bucle2: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, 31.75, 33.75, 0.15, 0.3);
	const j = (d: number) => pop(t, 31.85 + d, 13);
	const q = pop(t, 33.04, 9);
	const mini = (i: number, contenido: React.ReactNode) => {
		const p = j(i * 0.12);
		const xs = [250, 540, 830];
		return (
			<div key={i} style={{position: 'absolute', left: mix(xs[i], 540 + (i - 1) * 40, ramp(t, 32.4, 33.0)), top: mix(760, 740 + (i - 1) * 20, ramp(t, 32.4, 33.0)), transform: `translate(-50%, -50%) rotate(${(i - 1) * 7}deg) scale(${0.36 * p})`}}>
				{contenido}
			</div>
		);
	};
	return (
		<Abs op={op}>
			{mini(0, <Img src={staticFile('capturas/ingenia-binance.png')} style={{width: 600, height: 750, borderRadius: 26, boxShadow: '0 30px 60px rgba(58,42,32,0.3)'}} />)}
			{mini(1, <Expediente num="02" nombre="POLYMARKET" />)}
			{mini(2, <Expediente num="03" nombre="GMO · JAPÓN" />)}
			<Txt y={430} size={220} color={NARANJA} op={Math.min(1, q * 2)} dy={(1 - q) * -40}>
				?
			</Txt>
		</Abs>
	);
};

const Climax: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, 33.65, 44.6, 0.2, 0.4);
	const cand = pop(t, 33.93, 12) * (1 - ramp(t, 36.3, 36.7));
	const acc = pop(t, 36.68, 9);
	const sube = ramp(t, 41.3, 42.2);
	const rojo = 1 - ramp(t, 41.5, 42.3);
	const icon = (i: number, t0: number, el: React.ReactNode, label: string) => {
		const p = pop(t, t0, 10);
		const x = 270 + i * 270;
		return (
			<g key={i} transform={`translate(${x} 1010) scale(${p})`} opacity={1 - ramp(t, 41.2, 41.6)}>
				<circle r={86} fill={PAPEL} stroke={ROJO} strokeWidth={6} />
				<g transform="scale(0.95)">{el}</g>
				<text y={136} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={32} fill={TINTA}>
					{label}
				</text>
			</g>
		);
	};
	return (
		<Abs op={op}>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<g transform={`translate(540 700) scale(${1.7 * cand})`} opacity={Math.min(1, cand * 2)}>
					<Candado />
				</g>
				{icon(0, 37.87, <Silueta c={ROJO} />, 'una persona')}
				{icon(1, 38.58, <g transform="scale(0.9)"><Enchufe c={ROJO} /></g>, 'un proveedor')}
				{icon(2, 39.71, <OjoTachado c={ROJO} />, 'nadie revisa')}
			</svg>
			{acc > 0 && (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: mix(600, 300, sube),
						textAlign: 'center',
						fontFamily: FONT,
						fontWeight: 'bold',
						fontSize: mix(190, 96, sube),
						letterSpacing: mix(10, 4, sube),
						color: rojo > 0.5 ? ROJO : TINTA,
						opacity: Math.min(1, acc * 2) * (1 - ramp(t, 44.0, 44.5)),
						transform: `scale(${mix(1.4, 1, acc)})`,
					}}
				>
					ACCESO
				</div>
			)}
		</Abs>
	);
};

const CONSEJOS: {txt: string; t: number}[] = [
	{txt: 'contraseñas propias', t: 44.6},
	{txt: 'accesos que se cierran', t: 46.3},
	{txt: 'todo actualizado', t: 49.1},
];
const Negocio: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, 41.6, 50.7, 0.3, 0.35);
	const p = pop(t, 41.73, 13);
	const arriba = ramp(t, 44.2, 44.8);
	const puerta = 1 - ramp(t, 46.86, 47.3);
	const llave = ramp(t, 47.4, 48.1);
	return (
		<Abs op={op}>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<g transform={`translate(${mix(540, 600, arriba)} ${mix(760, 900, arriba)}) scale(${p * mix(1.25, 0.95, arriba)})`}>
					<Local puerta={puerta} />
				</g>
				{t > 47.3 && (
					<g transform={`translate(${mix(700, 330, llave)} ${mix(940, 1180, llave) - Math.sin(llave * Math.PI) * 140}) rotate(${llave * 360}) scale(0.9)`} opacity={1 - ramp(t, 48.4, 48.7)}>
						<Llave />
					</g>
				)}
			</svg>
			{CONSEJOS.map((c, i) => {
				const q = pop(t, c.t, 11);
				return (
					<div key={i} style={{position: 'absolute', left: 170, top: 330 + i * 92, display: 'flex', alignItems: 'center', gap: 22, opacity: Math.min(1, q * 2), transform: `translateX(${(1 - q) * -60}px)`}}>
						<svg width={64} height={64} viewBox="-32 -32 64 64">
							<g transform={`scale(${q})`}>
								<Tilde />
							</g>
						</svg>
						<span style={{fontFamily: FONT, fontWeight: 'bold', fontSize: 50, color: TINTA}}>{c.txt}</span>
					</div>
				);
			})}
		</Abs>
	);
};

const IconoRed: React.FC<{tipo: 'ig' | 'fb' | 'web'}> = ({tipo}) => (
	<svg width={60} height={60} viewBox="-30 -30 60 60">
		<rect x={-28} y={-28} width={56} height={56} rx={16} fill={tipo === 'ig' ? NARANJA : TINTA} />
		{tipo === 'ig' && (
			<g fill="none" stroke="#fff" strokeWidth={5}>
				<rect x={-15} y={-15} width={30} height={30} rx={9} />
				<circle r={7} />
			</g>
		)}
		{tipo === 'fb' && <path d="M5 -16 H12 V-6 H5 V18 H-5 V-6 H-11 V2 H-5 V-6 Q-5 -16 5 -16 Z" fill="#fff" />}
		{tipo === 'web' && (
			<g fill="none" stroke="#fff" strokeWidth={4}>
				<circle r={15} />
				<path d="M-15 0 H15 M0 -15 Q-9 0 0 15 Q9 0 0 -15" />
			</g>
		)}
	</svg>
);
const CONTACTOS: {tipo: 'ig' | 'fb' | 'web'; txt: string}[] = [
	{tipo: 'ig', txt: '@zainsoft_'},
	{tipo: 'fb', txt: 'ZainSoft'},
	{tipo: 'web', txt: 'zainsoft.sofdev.workers.dev'},
];
const Cierre: React.FC<{t: number}> = ({t}) => {
	if (t < 50.6) return null;
	const logo = pop(t, 50.86, 11);
	const l1 = pop(t, 51.75, 12);
	const l2 = pop(t, 53.58, 12);
	const dm = pop(t, 56.13, 10);
	return (
		<Abs>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
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
			</svg>
			<Txt y={530} size={56} op={Math.min(1, l1 * 2)} dy={(1 - l1) * 30}>
				webs y sistemas
			</Txt>
			<Txt y={600} size={44} color={NARANJA} op={Math.min(1, l2 * 2)} dy={(1 - l2) * 30}>
				y los mantenemos al día
			</Txt>
			{CONTACTOS.map((c, i) => {
				const q = pop(t, 55.13 + i * 0.15, 11);
				return (
					<div key={i} style={{position: 'absolute', left: 230, top: 730 + i * 88, display: 'flex', alignItems: 'center', gap: 22, opacity: Math.min(1, q * 2), transform: `translateX(${(1 - q) * -50}px)`}}>
						<IconoRed tipo={c.tipo} />
						<span style={{fontFamily: FONT, fontWeight: 'bold', fontSize: c.tipo === 'web' ? 38 : 46, color: TINTA}}>{c.txt}</span>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: 0, right: 0, top: 1030, display: 'flex', justifyContent: 'center'}}>
				<div style={{padding: '22px 56px', borderRadius: 70, background: NARANJA, color: '#fff', fontFamily: FONT, fontWeight: 'bold', fontSize: 58, transform: `scale(${dm})`, boxShadow: '0 16px 36px rgba(242,96,46,0.35)'}}>
					Escribinos por DM
				</div>
			</div>
		</Abs>
	);
};

// ───────────────────────── Luz: viñeta (problema) → cálida (solución)
const Luz: React.FC<{t: number}> = ({t}) => {
	const vin = kf(t, [[0, 0.6], [4.6, 0.6], [5.2, 0.38], [33.6, 0.38], [34.0, 0.5], [41.1, 0.5], [42.2, 0]]);
	const calida = ramp(t, 41.2, 42.4);
	const flash = t > 41.2 && t < 41.9 ? Math.sin(((t - 41.2) / 0.7) * Math.PI) * 0.5 : 0;
	return (
		<>
			{calida > 0 && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, rgba(242,96,46,${0.22 * calida}), rgba(245,239,230,0) 65%)`}} />}
			{vin > 0 && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(20,21,26,0) 45%, rgba(20,21,26,${vin}) 100%)`}} />}
			{flash > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,248,236,${flash})`}} />}
		</>
	);
};

// ───────────────────────── Subtítulos
type W = {text: string; startMs: number; endMs: number};
const norm = (s: string) => s.toLowerCase().replace(/[¿?¡!.,:;…]/g, '');
const FUNC = new Set(['de', 'que', 'y', 'en', 'un', 'una', 'el', 'la', 'los', 'a', 'por', 'te', 'se', 'le', 'es', 'no', 'lo', 'tu', 'con', 'o', 'para', 'del', 'qué', 'cómo', 'más', 'al']);
const NOMBRES: Record<string, string> = {zainsoft: 'zainsoft', dm: 'dm', gmo: 'gmo'};
const ROJAS = new Set(['seis', 'mil', 'millones', 'hackeo', 'acceso', 'robaron']);
const NARANJAS = new Set(['negocio', 'negocios', 'zainsoft', 'dm']);
const VERDES = new Set(['actualizado']);

type Cue = {s: number; e: number; words: {t: string; color: string}[]};
const CUES: Cue[] = (() => {
	const words = (palabras as W[]).map((w) => ({raw: w.text.trim(), s: w.startMs / 1000, e: w.endMs / 1000}));
	const out: Cue[] = [];
	let cur: typeof words = [];
	const flush = () => {
		if (!cur.length) return;
		out.push({
			s: cur[0].s,
			e: cur[cur.length - 1].e,
			words: cur.map((w) => {
				const n = norm(w.raw);
				return {t: NOMBRES[n] ?? n, color: ROJAS.has(n) ? ROJO : NARANJAS.has(n) ? NARANJA : VERDES.has(n) ? VERDE_C : TINTA};
			}),
		});
		cur = [];
	};
	words.forEach((w, i) => {
		cur.push(w);
		const nxt = words[i + 1];
		const len = cur.map((x) => x.raw).join(' ').length;
		const lleno = cur.length >= 3 || (cur.length >= 2 && len > 16);
		const antesDeYO = nxt && ['y', 'o'].includes(norm(nxt.raw)) && cur.length >= 2;
		if (/[.?,:!…]$/.test(w.raw) || !nxt || cur.length >= 4 || antesDeYO || (lleno && !FUNC.has(norm(w.raw)))) flush();
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
const GEST: [number, Gesture][] = [
	[0, 'rest'], [8.66, 'point'], [11.0, 'rest'], [12.9, 'point'], [14.6, 'rest'], [16.2, 'point'], [19.9, 'rest'],
	[23.4, 'point'], [25.9, 'rest'], [27.0, 'point'], [28.6, 'rest'], [32.0, 'think'], [33.6, 'rest'], [37.8, 'point'], [40.4, 'rest'],
	[46.7, 'press'], [47.6, 'rest'], [49.3, 'celebrate'], [50.6, 'rest'], [55.1, 'point'], [57.4, 'wave'],
];
const BLINKS = [2.6, 6.4, 10.1, 14.0, 18.8, 23.0, 27.4, 31.0, 35.2, 39.0, 43.0, 47.9, 52.2, 55.9, 58.6];

const BitLayer: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const mouth = t < 57.4 ? mouthFrom(amplitudes as number[], frame) : 0;
	const blink = blinkAt(t, BLINKS);
	const g = blendGestures(GEST, t);
	const br = Math.sin(t * 2.4);
	const jump = (g.jump * 60) / S_BIT;
	// gancho: mira la pantalla de la notebook (a la derecha); después, a cámara
	const lookX = t < 4.8 ? 1 : g.look.x;
	const pose: BitRigPose = {
		bodyY: br * 5 - mouth * 14 - jump,
		sy: 1 + br * 0.012 - g.jump * 0.05,
		lean: Math.sin(t * 5.5) * 2.5 * mouth,
		mouth,
		blink,
		look: {x: lookX, y: g.look.y},
		antenna: Math.sin(t * 7) * (3 + 8 * mouth + 10 * g.jump),
		handsFront: g.front,
		handL: {x: g.L.x, y: g.L.y - jump},
		handR: {x: g.R.x, y: g.R.y - jump},
		footL: {x: -150, y: -jump},
		footR: {x: 150, y: -jump},
	};
	// contraluz en el gancho (brillo CSS, sin filtros SVG)
	const luz = mix(0.28, 1, ramp(t, 4.6, 5.4));
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, filter: luz < 1 ? `brightness(${luz})` : undefined}}>
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
const SFX: {t: number; f: string; v: number; d: number}[] = [
	{t: 0.0, f: 'Electricity.aac', v: 0.03, d: 130},
	{t: 2.76, f: 'Counter.aac', v: 0.05, d: 45},
	{t: 4.0, f: 'Drop.aac', v: 0.09, d: 30},
	{t: 8.66, f: 'Paper in Air.aac', v: 0.1, d: 40},
	{t: 12.98, f: 'Stone motion.aac', v: 0.11, d: 20},
	{t: 16.3, f: 'Scan.aac', v: 0.04, d: 40},
	{t: 18.5, f: 'Paper in Air.aac', v: 0.08, d: 40},
	{t: 18.85, f: 'Stone motion.aac', v: 0.09, d: 20},
	{t: 20.95, f: 'poof.aac', v: 0.06, d: 20},
	{t: 21.25, f: 'poof.aac', v: 0.06, d: 20},
	{t: 22.2, f: 'Paper in Air.aac', v: 0.08, d: 40},
	{t: 26.8, f: 'Paper in Air.aac', v: 0.08, d: 40},
	{t: 29.1, f: 'Marker.aac', v: 0.05, d: 40},
	{t: 31.85, f: 'Spinning.aac', v: 0.05, d: 20},
	{t: 36.68, f: 'Bass Drop.aac', v: 0.1, d: 45},
	{t: 37.87, f: 'poof.aac', v: 0.07, d: 20},
	{t: 38.58, f: 'poof.aac', v: 0.07, d: 20},
	{t: 39.71, f: 'poof.aac', v: 0.07, d: 20},
	{t: 41.25, f: 'flash.aac', v: 0.08, d: 40},
	{t: 44.6, f: 'poof.aac', v: 0.06, d: 20},
	{t: 46.3, f: 'poof.aac', v: 0.06, d: 20},
	{t: 46.86, f: 'Stone motion.aac', v: 0.06, d: 15},
	{t: 49.1, f: 'poof.aac', v: 0.06, d: 20},
	{t: 50.86, f: 'flash.aac', v: 0.08, d: 40},
	{t: 56.13, f: 'poof.aac', v: 0.07, d: 20},
];

export const BinanceReel: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	return (
		<AbsoluteFill style={{background: CREMA, overflow: 'hidden'}}>
			<style>{`@font-face { font-family: 'HandoBold'; src: url('${staticFile('Hando.otf')}') format('opentype'); font-weight: bold; }`}</style>
			<Audio src={staticFile('voz_master.wav')} volume={1} />
			{SFX.map((s, i) => (
				<Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={s.d}>
					<Audio src={staticFile(s.f)} volume={s.v} />
				</Sequence>
			))}

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
				<Gancho t={t} />
				<Promesa t={t} />
				<Acto1 t={t} />
				<Origen t={t} />
				<Bucle1 t={t} />
				<Polymarket t={t} />
				<GMO t={t} />
				<Bucle2 t={t} />
				<Climax t={t} />
				<Negocio t={t} />
				<Cierre t={t} />
				<Luz t={t} />
				<BitLayer t={t} frame={frame} />
				<Subtitulos t={t} />
			</AbsoluteFill>

			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', background: `rgba(245,239,230,${0.003 + (frame % 2) * 0.004})`}} />
		</AbsoluteFill>
	);
};
