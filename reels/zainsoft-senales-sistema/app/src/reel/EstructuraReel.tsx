import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import amplitudes from './amplitud.json';
import palabras from './palabras.json';
import {BitRig, BitRigPose} from '../bit/BitRig';
import {blendGestures, blinkAt, kf, mix, mouthFrom, walkFeet, Gesture} from '../bit/bitMotion';

// Reel 2 de la serie «Qué es un sistema» (ZainSoft): cómo se construye un sistema (ciclo de vida en 5 etapas).
// Todo generado en código, sin rostros humanos. Tiempos reales de la voz (palabras.json, ver alinear-palabras.mjs).

const FPS = 30;
const NARANJA = '#F2602E';
const CREMA = '#F5EFE6';
const TINTA = '#14151A';
const VERDE_C = '#00A35C';
const GRIS_C = '#6B7280';
const CARD = '#1A1C22';
const LINEA = '#2B2E36';
const VERDE = '#00FF88';
const AMARILLO = '#FFE600';
const GRIS = '#9AA0AC';
const FONT = "HandoBold, 'Segoe UI', Arial, sans-serif";

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...cl, easing: ease});
const fade = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], cl);
const pop = (t: number, t0: number, damping = 12) => (t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {damping, stiffness: 140}}));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// Límites de escena (s), de las marcas de voz reales
const E = [0, 5.0, 8.6, 13.6, 20.0, 24.2, 28.8, 34.6, 39.6];
const END = 43.4;
export const REEL_FRAMES = Math.ceil(END * FPS);

const T: React.FC<{x: number; y: number; size: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; children: React.ReactNode; op?: number}> = ({
	x,
	y,
	size,
	fill = '#fff',
	anchor = 'middle',
	children,
	op = 1,
}) => (
	<text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontFamily={FONT} fontWeight="bold" opacity={op}>
		{children}
	</text>
);

// ───────────────────────── Íconos (caja -50..50, sin rostros)
const CAMISA = 'M-30 -30 L-12 -40 Q0 -26 12 -40 L30 -30 L44 -8 L28 0 L28 40 L-28 40 L-28 0 L-44 -8 Z';
const Ico: React.FC<{k: string; c: string; s?: number}> = ({k, c, s = 1}) => {
	let body: React.ReactNode = null;
	if (k === 'idea')
		body = (
			<g>
				<path d="M-40 -30 Q-40 -42 -28 -42 H28 Q40 -42 40 -30 V10 Q40 22 28 22 H0 L-18 42 V22 H-28 Q-40 22 -40 10 Z" fill={c} />
				<path d="M-22 -20 H22 M-22 -6 H22 M-22 8 H4" stroke={CARD} strokeWidth={6} strokeLinecap="round" />
			</g>
		);
	if (k === 'plano')
		body = (
			<g fill="none" stroke={c} strokeWidth={5} strokeLinejoin="round">
				<rect x={-42} y={-36} width={84} height={72} rx={4} />
				<path d="M-42 -4 H-8 V36 M-8 -4 V-36 M10 -36 V8 H42 M10 8 V36" />
			</g>
		);
	if (k === 'ladrillos')
		body = (
			<g fill={c}>
				<rect x={-44} y={-36} width={40} height={20} rx={3} />
				<rect x={0} y={-36} width={44} height={20} rx={3} />
				<rect x={-22} y={-8} width={44} height={20} rx={3} />
				<rect x={-44} y={20} width={40} height={20} rx={3} />
				<rect x={0} y={20} width={44} height={20} rx={3} />
			</g>
		);
	if (k === 'cinta')
		body = (
			<g fill={c}>
				<path d="M0 0 L-40 -28 Q-46 -2 -40 24 Z" />
				<path d="M0 0 L40 -28 Q46 -2 40 24 Z" />
				<path d="M-8 6 L-24 42 L-10 34 L0 44 Z" />
				<path d="M8 6 L24 42 L10 34 L0 44 Z" />
				<circle r={12} />
			</g>
		);
	if (k === 'llave')
		body = (
			<g fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
				<circle cx={-20} cy={-14} r={22} />
				<path d="M-4 2 L38 44 M24 30 L36 18 M12 18 L22 8" />
			</g>
		);
	if (k === 'camisa') body = <path d={CAMISA} fill={c} strokeLinejoin="round" />;
	if (k === 'pelota')
		body = (
			<g fill="none" stroke={c} strokeWidth={7}>
				<circle r={40} />
				<path d="M-40 0 H40 M0 -40 V40" strokeWidth={5} />
			</g>
		);
	if (k === 'cubiertos')
		body = (
			<g fill="none" stroke={c} strokeWidth={7} strokeLinecap="round">
				<path d="M-24 -42 V42 M-34 -42 V-6 Q-24 6 -14 -6 V-42" />
				<path d="M26 -42 Q46 -20 26 8 V42" />
			</g>
		);
	if (k === 'reloj')
		body = (
			<g fill="none" stroke={c} strokeWidth={7} strokeLinecap="round">
				<circle r={40} />
				<path d="M0 -22 V0 L16 10" />
			</g>
		);
	return <g transform={`scale(${s})`}>{body}</g>;
};

const Check: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = VERDE}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<circle r={26} fill={color} />
		<path d="M-12 1 L-3 10 L13 -9" stroke={CARD} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</g>
);

const SceneSvg: React.FC<{op?: number; children: React.ReactNode}> = ({op = 1, children}) => (
	<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: op}}>
		{children}
	</svg>
);

// ───────────────────────── Camino de 5 etapas (arriba, y 360)
const NODE_X = [0, 1, 2, 3, 4].map((i) => 190 + 175 * i);
const NODE_Y = 360;
const ETAPAS = ['Relevamiento', 'Diseño', 'Desarrollo y documentación', 'Implementación', 'Mantenimiento'];
const LIT2 = [6.03, 6.53, 7.03, 7.53, 8.03]; // escena 2: cada nodo se enciende
const SCENE_NODE = (t: number) => (t >= E[2] && t < E[3] ? 0 : t >= E[3] && t < E[4] ? 1 : t >= E[4] && t < E[5] ? 2 : t >= E[5] && t < E[6] ? 3 : t >= E[6] && t < E[7] ? 4 : -1);

const Camino: React.FC<{t: number}> = ({t}) => {
	const op = ramp(t, 4.4, 5.0) * (1 - ramp(t, 39.6, 39.9));
	if (op <= 0) return null;
	const status = (i: number): 'pend' | 'activo' | 'hecho' => {
		if (t < E[2]) {
			if (t < LIT2[i]) return 'pend';
			return i < 4 && t >= LIT2[i + 1] ? 'hecho' : 'activo';
		}
		if (t >= E[7]) return 'hecho';
		const a = SCENE_NODE(t);
		return i < a ? 'hecho' : i === a ? 'activo' : 'pend';
	};
	// progreso de la línea
	const nLit = t < E[2] ? LIT2.filter((x) => t >= x).length : t >= E[7] ? 5 : SCENE_NODE(t) + 1;
	const progX = nLit <= 0 ? NODE_X[0] : NODE_X[Math.min(4, nLit - 1)];
	// luz que recorre en bucle (escena 8)
	const ph = t >= E[7] ? ((t - 34.7) / 1.7) % 1 : -1;
	const lightP = ph >= 0 && ph < 0.75 ? (4 * ph) / 0.75 : ph >= 0.75 ? 4 : -9;
	const back = ph >= 0.75 ? (ph - 0.75) / 0.25 : -1;
	const active = t < E[2] ? ([0, 1, 2, 3, 4].filter((i) => status(i) === 'activo')[0] ?? -1) : SCENE_NODE(t);
	const w = ETAPAS[active] ? ETAPAS[active].length * 0.56 * 34 : 0;
	const labX = active >= 0 ? clamp(NODE_X[active], 120 + w / 2, 960 - w / 2) : 540;
	const showLabel = t >= E[2] && t < E[7] && active >= 0;
	return (
		<SceneSvg op={op}>
			<line x1={NODE_X[0]} y1={NODE_Y} x2={NODE_X[4]} y2={NODE_Y} stroke="#D6CBBA" strokeWidth={8} strokeLinecap="round" />
			<line x1={NODE_X[0]} y1={NODE_Y} x2={progX} y2={NODE_Y} stroke={TINTA} strokeOpacity={0.55} strokeWidth={8} strokeLinecap="round" />
			{t >= E[7] && <path d={`M ${NODE_X[4]} ${NODE_Y + 32} Q 540 ${NODE_Y + 110} ${NODE_X[0]} ${NODE_Y + 32}`} fill="none" stroke={NARANJA} strokeWidth={5} strokeDasharray="12 10" strokeDashoffset={-t * 60} opacity={0.7} />}
			{NODE_X.map((x, i) => {
				const st = status(i);
				const glow = t >= E[7] ? Math.max(0, 1 - Math.abs(i - lightP) * 1.6) : 0;
				const act = st === 'activo' ? 1 : glow;
				const sc = 1 + 0.18 * act + (st === 'activo' && t < E[2] ? 0.25 * (1 - ramp(t, LIT2[i], LIT2[i] + 0.35)) : 0);
				const fill = act > 0.4 ? NARANJA : st === 'hecho' ? 'rgba(20,21,26,0.62)' : '#E4DACB';
				return (
					<g key={i} transform={`translate(${x} ${NODE_Y}) scale(${sc})`}>
						<circle r={32} fill={fill} stroke={st === 'pend' && act <= 0.4 ? '#C9BEAD' : 'none'} strokeWidth={3} />
						<T x={0} y={12} size={34} fill={st === 'pend' && act <= 0.4 ? GRIS_C : '#fff'}>
							{String(i + 1)}
						</T>
					</g>
				);
			})}
			{back >= 0 && (
				<circle
					cx={mix(NODE_X[4], NODE_X[0], back)}
					cy={NODE_Y + 32 + 78 * Math.sin(back * Math.PI) * 0.97}
					r={11}
					fill={NARANJA}
				/>
			)}
			{showLabel && (
				<T x={labX} y={452} size={34} fill={TINTA} op={fade(t, [E[2], E[3], E[4], E[5], E[6], E[7]][active], [E[3], E[4], E[5], E[6], E[7], 99][active], 0.2, 0.2)}>
					{ETAPAS[active]}
				</T>
			)}
		</SceneSvg>
	);
};

// ───────────────────────── Edificio (capa persistente)
const FH = 85;
const GROUND = 1010;
const lit = (t: number, i: number, j: number) => {
	if (t < 2.9) return 0;
	if (t < 20) return 1;
	if (t < 25.4) return 0;
	if (i >= 5) return ramp(t, 33.5 + j * 0.1, 33.7 + j * 0.1);
	return ramp(t, 25.4 + (i * 3 + j) * 0.06, 25.58 + (i * 3 + j) * 0.06);
};

type BState = {show: boolean; rubble: boolean; cx: number; gy: number; sc: number; f: number[]; op: number; app: number; ribbon: number};
const bState = (t: number): BState => {
	const base = {show: false, rubble: false, cx: 540, gy: GROUND, sc: 1, f: [1, 1, 1, 1, 1], op: 1, app: 1, ribbon: 0};
	if (t < 1.3) return {...base, show: true, app: pop(t, 0.05, 11)};
	if (t < 2.88) return {...base, rubble: true};
	if (t < 5.4) return {...base, show: true, app: pop(t, 2.9, 10), op: 1 - ramp(t, 5.0, 5.4), ribbon: pop(t, 3.75, 9)};
	if (t < 7.3) return base;
	if (t < 8.8) return {...base, show: true, sc: 0.5, app: 0.8 + 0.2 * pop(t, 7.3, 10), op: ramp(t, 7.3, 7.6) * (1 - ramp(t, 8.4, 8.8))};
	if (t < 20) return base;
	if (t < 39.8) {
		const f = [0, 1, 2, 3, 4].map((i) => Math.min(1.07, pop(t, 20.25 + 0.38 * i, 9)));
		if (t >= 33.2) f.push(Math.min(1.07, pop(t, 33.23, 9)));
		const cx = kf(t, [[20, 400], [24.0, 400], [24.7, 540]]);
		const sc = kf(t, [[28.4, 1], [29.0, 0.85], [34.3, 0.85], [35.0, 0.42]]);
		const gy = kf(t, [[34.3, GROUND], [35.0, 937]]);
		return {...base, show: true, cx, sc, gy, f, op: ramp(t, 20.0, 20.2) * (1 - ramp(t, 39.4, 39.8))};
	}
	if (t < 42.6) return base;
	return {...base, show: true, sc: 0.9, op: ramp(t, 42.8, 43.4) * 0.55};
};

const RUBBLE = [
	{dx: -250, rot: -24, fall: 0}, {dx: 30, rot: 18, fall: 0}, {dx: -140, rot: 9, fall: 1}, {dx: 190, rot: -30, fall: 1},
	{dx: -60, rot: 40, fall: 2}, {dx: 270, rot: 12, fall: 2}, {dx: -290, rot: 55, fall: 3}, {dx: 90, rot: -15, fall: 3},
	{dx: -10, rot: 28, fall: 4}, {dx: 150, rot: -48, fall: 4},
];
const drop = (t: number, t0: number, dur: number) => {
	const u = (t - t0) / dur;
	if (u <= 0) return 0;
	if (u < 1) return u * u;
	return 1 - 0.22 * Math.exp(-(u - 1) * 4) * Math.abs(Math.sin((u - 1) * Math.PI * 2.2));
};

const Edificio: React.FC<{t: number}> = ({t}) => {
	const s = bState(t);
	if (s.rubble) {
		const op = 1 - ramp(t, 2.45, 2.85);
		return (
			<SceneSvg op={op}>
				{RUBBLE.map((r, k) => {
					const floor = r.fall;
					const left = k % 2 === 0;
					const y0 = GROUND - (floor + 0.5) * FH;
					const t0 = 1.3 + (4 - floor) * 0.06 + (left ? 0 : 0.04);
					const yEnd = GROUND - 42;
					const p = drop(t, t0, 0.5);
					const y = mix(y0, yEnd - (k % 3) * 6, p);
					const x0 = left ? 450 : 630;
					const x = mix(x0, 540 + r.dx, clamp((t - t0) / 0.5, 0, 1));
					const rot = r.rot * clamp((t - t0) / 0.5, 0, 1);
					return (
						<g key={k} transform={`translate(${x} ${y}) rotate(${rot})`}>
							<rect x={-90} y={-42} width={180} height={84} rx={6} fill={CARD} stroke={LINEA} strokeWidth={3} />
							<rect x={-60} y={-18} width={44} height={34} rx={4} fill="#23262D" stroke={LINEA} strokeWidth={2} />
							<rect x={16} y={-18} width={44} height={34} rx={4} fill="#23262D" stroke={LINEA} strokeWidth={2} />
						</g>
					);
				})}
			</SceneSvg>
		);
	}
	if (!s.show || s.op <= 0) return null;
	const nTop = s.f.reduce((a, v, i) => (v > 0.02 ? i : a), 0);
	const topY = -(nTop * FH + FH * s.f[nTop]);
	return (
		<SceneSvg op={s.op}>
			<g transform={`translate(${s.cx} ${s.gy}) scale(${s.sc * s.app})`}>
				{s.f.map((f, i) => {
					if (f <= 0.02) return null;
					const h = FH * f;
					const y = -i * FH - h;
					return (
						<g key={i}>
							<rect x={-190} y={y} width={380} height={h} fill={CARD} stroke={LINEA} strokeWidth={3} />
							{f > 0.85 &&
								[0, 1, 2].map((j) => {
									const cx = (j - 1) * 110;
									const cy = -i * FH - FH / 2;
									if (i === 0 && j === 1)
										return (
											<g key={j}>
												<rect x={-32} y={-66} width={64} height={66} rx={6} fill={NARANJA} />
												<circle cx={18} cy={-32} r={4} fill="#fff" />
											</g>
										);
									const L = lit(t, i, j);
									return (
										<g key={j}>
											<rect x={cx - 34} y={cy - 24} width={68} height={48} rx={7} fill="#23262D" stroke="#3A3D45" strokeWidth={2} />
											<rect x={cx - 34} y={cy - 24} width={68} height={48} rx={7} fill={AMARILLO} opacity={L * 0.95} />
										</g>
									);
								})}
						</g>
					);
				})}
				<rect x={-202} y={topY - 14} width={404} height={16} rx={5} fill={NARANJA} />
				{s.ribbon > 0 && (
					<g transform={`scale(${s.ribbon})`}>
						<rect x={-190} y={-2.5 * FH - 11} width={380} height={22} fill={NARANJA} />
						<g transform={`translate(0 ${-2.5 * FH})`}>
							<path d="M0 0 L-56 -34 Q-66 0 -56 34 Z" fill={NARANJA} stroke="#B8431B" strokeWidth={3} />
							<path d="M0 0 L56 -34 Q66 0 56 34 Z" fill={NARANJA} stroke="#B8431B" strokeWidth={3} />
							<circle r={17} fill="#D94E1F" />
						</g>
					</g>
				)}
			</g>
		</SceneSvg>
	);
};

const Suelo: React.FC<{t: number}> = ({t}) => {
	const op =
		t < 13.3
			? ramp(t, 0.05, 0.3) * (1 - ramp(t, 13.0, 13.3))
			: t < 39.4
				? ramp(t, 19.9, 20.2) * (1 - ramp(t, 39.1, 39.4))
				: t >= 42.6
					? ramp(t, 42.8, 43.4) * 0.55
					: 0;
	if (op <= 0) return null;
	return (
		<SceneSvg op={op}>
			<line x1={190} y1={GROUND + 4} x2={890} y2={GROUND + 4} stroke={TINTA} strokeOpacity={0.55} strokeWidth={6} strokeLinecap="round" />
		</SceneSvg>
	);
};

// ───────────────────────── Escena 1 (0-5): gancho
const Escena1: React.FC<{t: number}> = ({t}) => {
	const c1 = fade(t, 0.06, 2.4, 0.2, 0.25);
	const c2 = fade(t, 2.65, 5.0, 0.2, 0.3);
	const strike = ramp(t, 1.15, 1.5);
	const flag = pop(t, 4.0, 10);
	const arrow = ramp(t, 4.0, 4.7);
	return (
		<SceneSvg op={t < 5.2 ? 1 : 0}>
			<g opacity={c1}>
				<T x={540} y={430} size={68} fill={TINTA}>
					no se arma
				</T>
				<T x={540} y={512} size={84} fill={NARANJA}>
					de un día
				</T>
				<line x1={540 - 215} y1={486} x2={540 - 215 + 430 * strike} y2={486} stroke={TINTA} strokeWidth={10} strokeLinecap="round" opacity={strike > 0 ? 1 : 0} />
			</g>
			<g opacity={c2}>
				<text x={540} y={480} fontSize={58} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fill={TINTA}>
					ni termina <tspan fill={VERDE_C}>al entregarlo</tspan>
				</text>
			</g>
			{/* meta de entrega y línea que sigue */}
			<g opacity={Math.min(1, flag * 1.5)}>
				<line x1={830} y1={640} x2={830} y2={GROUND} stroke={TINTA} strokeWidth={5} strokeDasharray="12 10" />
				<g transform={`translate(830 600) scale(${flag})`}>
					<rect x={-90} y={-30} width={180} height={60} rx={30} fill={TINTA} />
					<T x={0} y={10} size={28}>
						ENTREGA
					</T>
				</g>
			</g>
			<g opacity={arrow}>
				<path d={`M 250 ${GROUND + 44} H ${250 + 640 * arrow}`} stroke={NARANJA} strokeWidth={10} strokeLinecap="round" strokeDasharray="22 14" strokeDashoffset={-t * 80} />
				<path d={`M ${250 + 640 * arrow - 8} ${GROUND + 22} L ${250 + 640 * arrow + 20} ${GROUND + 44} L ${250 + 640 * arrow - 8} ${GROUND + 66}`} fill="none" stroke={NARANJA} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Escena 2 (5-8,6): cinco etapas
const CARD_ICONS = ['idea', 'plano', 'ladrillos', 'cinta', 'llave'];
const CARD_X = [190, 365, 540, 715, 890];
const Escena2: React.FC<{t: number}> = ({t}) => {
	const op = fade(t, 5.0, 8.6, 0.25, 0.3);
	const big = pop(t, 5.95, 10);
	return (
		<SceneSvg op={op}>
			<g transform={`translate(540 500) scale(${0.7 + 0.3 * big})`} opacity={Math.min(1, big * 2)}>
				<T x={0} y={0} size={84} fill={NARANJA}>
					5 ETAPAS
				</T>
			</g>
			{CARD_X.map((x, i) => {
				const p = pop(t, LIT2[i], 11);
				return (
					<g key={i} transform={`translate(${x} 640) scale(${p})`} opacity={Math.min(1, p * 2)}>
						<rect x={-70} y={-70} width={140} height={140} rx={28} fill={CARD} stroke={i === 4 ? NARANJA : LINEA} strokeWidth={4} />
						<g transform="scale(0.95)">
							<Ico k={CARD_ICONS[i]} c={i % 2 ? '#fff' : NARANJA} />
						</g>
						<circle cx={-52} cy={-52} r={0} />
					</g>
				);
			})}
		</SceneSvg>
	);
};

// ───────────────────────── Escena 3 (8,6-13,6): relevamiento
const Escena3: React.FC<{t: number}> = ({t}) => {
	const op = fade(t, E[2], E[3], 0.3, 0.3);
	const BUB = [
		{x: 260, k: 'camisa', c: '#F3C6B8', t0: 11.1},
		{x: 540, k: 'pelota', c: '#9ED4A6', t0: 11.5},
		{x: 820, k: 'cubiertos', c: '#F5D18A', t0: 11.9},
	];
	const clock = pop(t, 12.7, 10);
	const strike = ramp(t, 13.0, 13.3);
	const ring = (k: number) => {
		const u = (((t - 9.2 - k * 0.45) % 1.35) + 1.35) % 1.35;
		return t < 9.2 ? 0 : u / 1.35;
	};
	return (
		<SceneSvg op={op}>
			{/* solar vacío */}
			<rect x={360} y={780} width={360} height={230} fill="none" stroke={NARANJA} strokeWidth={5} strokeDasharray="16 12" opacity={0.5 * pop(t, 8.8, 14)} />
			{[360, 720].map((x, i) => (
				<g key={i} opacity={pop(t, 8.8, 14)}>
					<rect x={x - 5} y={750} width={10} height={260} fill={TINTA} opacity={0.55} />
					<rect x={x - 5} y={750} width={10} height={36} fill={NARANJA} />
				</g>
			))}
			{/* ondas de «escuchar» */}
			{[0, 1, 2].map((k) => {
				const p = ring(k);
				return <circle key={k} cx={540} cy={900} r={40 + 220 * p} fill="none" stroke={NARANJA} strokeWidth={5} opacity={t < 9.2 || t > 11.2 ? 0 : (1 - p) * 0.55} />;
			})}
			{BUB.map((b, i) => {
				const p = pop(t, b.t0, 10);
				const rise = (1 - p) * 40;
				return (
					<g key={i} transform={`translate(${b.x} ${600 + rise}) scale(${p})`} opacity={Math.min(1, p * 2)}>
						<path d="M-18 74 L0 106 L18 74 Z" fill={CARD} />
						<rect x={-80} y={-80} width={160} height={160} rx={36} fill={CARD} stroke={b.c} strokeWidth={5} />
						<g transform="scale(0.95)">
							<Ico k={b.k} c={b.c} />
						</g>
					</g>
				);
			})}
			<g transform={`translate(540 850) scale(${clock})`} opacity={Math.min(1, clock * 2)}>
				<circle r={72} fill={CARD} stroke="#9AA0AC" strokeWidth={5} />
				<g transform="scale(1.15)">
					<Ico k="reloj" c="#fff" />
				</g>
				<line x1={-84} y1={-84} x2={-84 + 168 * strike} y2={-84 + 168 * strike} stroke="#FF4D4D" strokeWidth={14} strokeLinecap="round" />
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Escena 4 (13,6-20): diseño / planos
const SALAS: [number, number, number, number][] = [
	[280, 690, 160, 110],
	[640, 690, 160, 110],
	[280, 890, 160, 100],
	[640, 890, 160, 100],
	[470, 780, 140, 100],
];
const HUB = {x: 540, y: 830};
const Escena4: React.FC<{t: number}> = ({t}) => {
	const op = fade(t, E[3], E[4], 0.3, 0.3);
	const panel = pop(t, 13.7, 14);
	const c1 = pop(t, 17.3, 11);
	const c2 = pop(t, 18.5, 11);
	return (
		<SceneSvg op={op}>
			<g opacity={panel} transform={`translate(540 ${835}) scale(${0.9 + 0.1 * panel}) translate(-540 -835)`}>
				<rect x={240} y={650} width={600} height={370} rx={30} fill={CARD} stroke={LINEA} strokeWidth={4} />
				{Array.from({length: 14}).map((_, i) => (
					<line key={`v${i}`} x1={260 + i * 40} y1={665} x2={260 + i * 40} y2={1005} stroke="#252830" strokeWidth={2} />
				))}
				{Array.from({length: 8}).map((_, i) => (
					<line key={`h${i}`} x1={255} y1={680 + i * 44} x2={825} y2={680 + i * 44} stroke="#252830" strokeWidth={2} />
				))}
				{SALAS.map(([x, y, w, h], i) => {
					const per = 2 * (w + h);
					const p = ramp(t, 13.95 + i * 0.45, 14.45 + i * 0.45);
					return <rect key={i} x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={GRIS} strokeWidth={4} strokeDasharray={per} strokeDashoffset={per * (1 - p)} />;
				})}
				{SALAS.slice(0, 4).map(([x, y, w, h], i) => {
					const cx = x + w / 2;
					const cy = y + h / 2;
					const g = ramp(t, 19.0 + i * 0.22, 19.3 + i * 0.22);
					return <line key={i} x1={cx} y1={cy} x2={cx < 540 ? 470 : 610} y2={cy < 830 ? 790 : 870} stroke={NARANJA} strokeWidth={7} strokeLinecap="round" opacity={g} />;
				})}
				{SALAS.slice(0, 4).map(([x, y, w, h], i) => (
					<circle key={i} cx={x + w / 2} cy={y + h / 2} r={11} fill={NARANJA} opacity={ramp(t, 19.0 + i * 0.22, 19.3 + i * 0.22)} />
				))}
				<rect x={470} y={780} width={140} height={100} rx={8} fill={NARANJA} opacity={ramp(t, 19.8, 20.0) * 0.9} />
			</g>
			{/* tarjetas: tu negocio / el sistema */}
			<g transform={`translate(305 545) scale(${c1})`} opacity={Math.min(1, c1 * 2)}>
				<rect x={-165} y={-48} width={330} height={96} rx={30} fill={CARD} stroke={VERDE} strokeWidth={4} />
				<T x={0} y={13} size={38}>
					TU NEGOCIO
				</T>
			</g>
			<g transform={`translate(775 545) scale(${c2})`} opacity={Math.min(1, c2 * 2)}>
				<rect x={-165} y={-48} width={330} height={96} rx={30} fill={CARD} stroke={NARANJA} strokeWidth={4} />
				<T x={0} y={13} size={38}>
					EL SISTEMA
				</T>
			</g>
			<line x1={305} y1={596} x2={305} y2={650} stroke={VERDE_C} strokeWidth={7} strokeDasharray="10 8" strokeDashoffset={-t * 60} opacity={c1} />
			<line x1={775} y1={596} x2={775} y2={650} stroke={NARANJA} strokeWidth={7} strokeDasharray="10 8" strokeDashoffset={-t * 60} opacity={c2} />
		</SceneSvg>
	);
};

// ───────────────────────── Escena 5 (20-24,2): desarrollo y documentación
const Escena5: React.FC<{t: number}> = ({t}) => {
	const op = fade(t, E[4], E[5], 0.2, 0.3);
	const crane = ramp(t, 20.0, 20.4) * (1 - ramp(t, 22.4, 22.8));
	const hookY = 720 + 90 * Math.sin(Math.max(0, t - 20.2) * 3.2) ** 2 + 90 * ramp(t, 20.2, 22);
	const book = pop(t, 22.78, 9);
	const open = ramp(t, 22.85, 23.35);
	const check = pop(t, 23.55, 9);
	return (
		<SceneSvg op={op}>
			<g opacity={crane}>
				<rect x={852} y={560} width={16} height={450} fill={TINTA} opacity={0.75} />
				<rect x={620} y={548} width={300} height={16} fill={NARANJA} />
				<path d="M860 548 L770 548" stroke={NARANJA} strokeWidth={6} />
				<line x1={660} y1={564} x2={660} y2={hookY} stroke={TINTA} strokeWidth={4} />
				<rect x={630} y={hookY} width={60} height={22} rx={4} fill={NARANJA} />
			</g>
			<g transform={`translate(770 880)`} opacity={Math.min(1, book * 2)}>
				<g transform={`scale(${book})`}>
					<g transform={`scale(${0.2 + 0.8 * open} 1)`}>
						<rect x={-110} y={-80} width={110} height={160} rx={8} fill="#F7F0E8" stroke="#CFC6BE" strokeWidth={3} />
						<rect x={0} y={-80} width={110} height={160} rx={8} fill="#F7F0E8" stroke="#CFC6BE" strokeWidth={3} />
						{[-50, -24, 2, 28, 54].map((y, i) => (
							<g key={i}>
								<rect x={-90} y={y} width={i % 2 ? 56 : 70} height={9} rx={4} fill="#BDB3A8" />
								<rect x={22} y={y} width={i % 2 ? 62 : 48} height={9} rx={4} fill="#BDB3A8" />
							</g>
						))}
					</g>
					<rect x={-4} y={-84} width={8} height={168} fill={NARANJA} />
				</g>
				<Check x={105} y={-85} s={check} />
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Escena 6 (24,2-28,8): implementación
const Tijera: React.FC<{open: number}> = ({open}) => (
	<g>
		<g transform={`rotate(${-open * 28})`}>
			<rect x={0} y={-5} width={74} height={10} rx={5} fill={GRIS} />
			<circle cx={-26} cy={-14} r={15} fill="none" stroke={TINTA} strokeWidth={7} />
		</g>
		<g transform={`rotate(${open * 28})`}>
			<rect x={0} y={-5} width={74} height={10} rx={5} fill="#D6D9DF" />
			<circle cx={-26} cy={14} r={15} fill="none" stroke={TINTA} strokeWidth={7} />
		</g>
		<circle r={8} fill={NARANJA} />
	</g>
);
const Escena6: React.FC<{t: number}> = ({t}) => {
	const op = fade(t, E[5], E[6], 0.3, 0.3);
	const cut = 25.32;
	const rib = pop(t, 24.35, 12);
	const fall = ramp(t, cut, cut + 0.5);
	const sciss = kf(t, [[24.4, 0], [24.9, 0], [25.15, 1], [cut, 0], [cut + 0.2, 1]]);
	const sx = kf(t, [[24.4, 780], [25.1, 600]]);
	const sign = pop(t, 25.8, 10);
	const rubro = t < 26.78 ? -1 : t < 27.08 ? 0 : t < 27.58 ? 1 : t < 27.69 ? 1 : 2;
	const rubroT0 = [26.78, 27.08, 27.69][Math.max(0, rubro)];
	const bb = pop(t, rubroT0, 8);
	const RK = [
		{k: 'camisa', c: '#F3C6B8'},
		{k: 'pelota', c: '#9ED4A6'},
		{k: 'cubiertos', c: '#F5D18A'},
	];
	return (
		<SceneSvg op={op}>
			{/* cinta */}
			<g opacity={t < cut ? 1 : 1 - ramp(t, cut + 0.2, cut + 0.7)}>
				<g transform={`translate(400 972) rotate(${60 * fall})`}>
					<rect x={0} y={-8} width={110 * rib} height={16} rx={8} fill={NARANJA} />
				</g>
				<g transform={`translate(680 972) rotate(${-60 * fall})`}>
					<rect x={-110 * rib} y={-8} width={110 * rib} height={16} rx={8} fill={NARANJA} />
				</g>
				<circle cx={400} cy={972} r={12 * rib} fill="#D94E1F" />
				<circle cx={680} cy={972} r={12 * rib} fill="#D94E1F" />
			</g>
			{t > 24.35 && t < cut + 0.9 && (
				<g transform={`translate(${sx} 972)`}>
					<Tijera open={sciss} />
				</g>
			)}
			{/* cartel abierto */}
			<g transform={`translate(540 882) scale(${sign})`}>
				<rect x={-110} y={-30} width={220} height={60} rx={30} fill={NARANJA} />
				<T x={0} y={11} size={32}>
					ABIERTO
				</T>
			</g>
			{/* letrero rotativo */}
			{rubro >= 0 && (
				<g transform={`translate(540 528) scale(${bb})`}>
					<rect x={-48} y={-48} width={96} height={96} rx={24} fill={CARD} stroke={RK[rubro].c} strokeWidth={5} />
					<g transform="scale(0.8)">
						<Ico k={RK[rubro].k} c={RK[rubro].c} />
					</g>
				</g>
			)}
		</SceneSvg>
	);
};

// ───────────────────────── Escena 7 (28,8-34,6): mantenimiento
const Engranaje: React.FC<{r: number; rot: number}> = ({r, rot}) => (
	<g transform={`rotate(${rot})`}>
		{Array.from({length: 8}).map((_, i) => (
			<rect key={i} x={-r * 0.17} y={-r * 1.18} width={r * 0.34} height={r * 0.4} rx={5} fill={NARANJA} transform={`rotate(${i * 45})`} />
		))}
		<circle r={r} fill={NARANJA} />
		<circle r={r * 0.4} fill={CREMA} />
	</g>
);
const Escena7: React.FC<{t: number}> = ({t}) => {
	const op = fade(t, E[6], E[7], 0.3, 0.3);
	const gear = pop(t, 30.9, 10);
	const wr = pop(t, 30.95, 9);
	const hit = Math.sin(clamp((t - 31.14) / 0.3, 0, 1) * Math.PI);
	const orb = ramp(t, 29.3, 29.8) * (1 - ramp(t, 34.0, 34.4));
	return (
		<SceneSvg op={op}>
			<g opacity={orb}>
				<ellipse cx={540} cy={800} rx={330} ry={250} fill="none" stroke={NARANJA} strokeWidth={6} strokeDasharray="22 18" strokeDashoffset={-t * 60} opacity={0.7} />
				{[0, 1].map((k) => {
					const a = t * 1.3 + k * Math.PI;
					return <circle key={k} cx={540 + 330 * Math.cos(a)} cy={800 + 250 * Math.sin(a)} r={14} fill={NARANJA} />;
				})}
			</g>
			<g transform={`translate(790 690) scale(${gear})`} opacity={Math.min(1, gear * 2)}>
				<Engranaje r={62} rot={(t - 30.9) * 70} />
			</g>
			<g transform={`translate(310 ${700 + 6 * hit}) rotate(${-35 + 30 * hit}) scale(${wr})`} opacity={Math.min(1, wr * 2)}>
				<path d="M-14 -70 L-14 40 Q-34 46 -34 70 Q-34 96 0 96 Q34 96 34 70 Q34 46 14 40 L14 -70 Q30 -78 30 -102 L10 -102 L0 -84 L-10 -102 L-30 -102 Q-30 -78 -14 -70 Z" fill={TINTA} />
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Escena 8 (34,6-39,6): remate / bucle
const RING_C = {x: 540, y: 830, r: 200};
const Escena8: React.FC<{t: number}> = ({t}) => {
	const op = fade(t, E[7], E[8], 0.3, 0.3);
	const ring = pop(t, 34.8, 14);
	const c1 = fade(t, 35.5, 37.7, 0.25, 0.25);
	const c2 = pop(t, 37.84, 10);
	const flag = pop(t, 38.2, 10);
	const pass = ramp(t, 38.45, 39.2);
	const nodes = [0, 1, 2, 3, 4].map((i) => {
		const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
		return {x: RING_C.x + RING_C.r * Math.cos(a), y: RING_C.y + RING_C.r * Math.sin(a), a};
	});
	const spin = ((t - 34.9) / 3.4) % 1;
	const lp = spin * 5;
	return (
		<SceneSvg op={op}>
			<g opacity={c1}>
				<text x={540} y={535} fontSize={60} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fill={TINTA}>
					empieza en <tspan fill={NARANJA}>tu negocio</tspan>
				</text>
			</g>
			<g transform={`translate(540 545) scale(${c2})`} opacity={Math.min(1, c2 * 2)}>
				<T x={0} y={0} size={96} fill={NARANJA}>
					no termina
				</T>
			</g>
			<g opacity={ring}>
				<circle cx={RING_C.x} cy={RING_C.y} r={RING_C.r} fill="none" stroke="#D6CBBA" strokeWidth={8} />
				<circle cx={RING_C.x} cy={RING_C.y} r={RING_C.r} fill="none" stroke={NARANJA} strokeWidth={8} strokeDasharray="60 1291" strokeDashoffset={-spin * 1351} strokeLinecap="round" />
				{nodes.map((n, i) => {
					const act = Math.max(0, 1 - Math.min(Math.abs(i - lp), Math.abs(i - lp + 5), Math.abs(i - lp - 5)) * 1.8);
					return (
						<g key={i} transform={`translate(${n.x} ${n.y}) scale(${1 + 0.2 * act})`}>
							<circle r={34} fill={act > 0.4 ? NARANJA : 'rgba(20,21,26,0.62)'} />
							<T x={0} y={12} size={34}>
								{String(i + 1)}
							</T>
						</g>
					);
				})}
			</g>
			{/* meta de entrega que se atraviesa */}
			<g opacity={Math.min(1, flag * 1.5)}>
				<line x1={850} y1={670} x2={850} y2={990} stroke={TINTA} strokeWidth={5} strokeDasharray="12 10" />
				<g transform={`translate(850 640) scale(${flag})`}>
					<rect x={-82} y={-28} width={164} height={56} rx={28} fill={TINTA} />
					<T x={0} y={9} size={24}>
						ENTREGA
					</T>
				</g>
			</g>
			<g opacity={pass}>
				<path d={`M 750 830 H ${750 + 180 * pass}`} stroke={NARANJA} strokeWidth={9} strokeLinecap="round" strokeDasharray="20 12" strokeDashoffset={-t * 80} />
				<path d={`M ${750 + 180 * pass - 8} 810 L ${750 + 180 * pass + 18} 830 L ${750 + 180 * pass - 8} 850`} fill="none" stroke={NARANJA} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Escena 9 (39,6-fin): cierre
const Escena9: React.FC<{t: number}> = ({t}) => {
	const logo = pop(t, 39.85, 11);
	const ig = pop(t, 40.3, 10);
	const dm = pop(t, 40.9, 10);
	const out = 1 - ramp(t, 42.5, 42.95);
	return (
		<SceneSvg op={t >= 39.6 ? out : 0}>
			<g transform={`translate(492 560) scale(${0.7 + 0.3 * logo})`} opacity={Math.min(1, logo * 2)}>
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
			<g transform={`translate(540 790) scale(${ig})`}>
				<rect x={-250} y={-60} width={500} height={120} rx={60} fill={NARANJA} />
				<T x={0} y={20} size={66}>
					@zainsoft_
				</T>
			</g>
			<g transform={`translate(540 920) scale(${dm})`}>
				<T x={20} y={14} size={42} fill={TINTA}>
					ESCRIBINOS POR DM
				</T>
				<path d="M-292 -22 H-250 Q-238 -22 -238 -10 V12 Q-238 24 -250 24 H-268 L-282 38 V24 H-292 Q-304 24 -304 12 V-10 Q-304 -22 -292 -22 Z" fill={TINTA} transform="translate(-30 0)" />
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Subtítulos
type W = {text: string; startMs: number; endMs: number};
const norm = (s: string) => s.toLowerCase().replace(/[¿?¡!.,:;]/g, '');
const FUNC = new Set(['de', 'que', 'y', 'en', 'un', 'una', 'el', 'la', 'los', 'a', 'por', 'te', 'se', 'le', 'es', 'no', 'todo', 'lo', 'tu', 'con', 'o', 'sea', 'como', 'del', 'qué', 'cómo']);
const NOMBRES: Record<string, string> = {zainsoft: 'ZainSoft', dm: 'DM'};
const VERDES = new Set(['escuchamos', 'planos', 'documentado', 'marcha', 'mantenemos']);
const NARANJAS = new Set(['sistema', 'negocio', 'zainsoft', 'dm', 'cinco', 'etapas']);

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
				return {t: NOMBRES[n] ?? n, color: VERDES.has(n) ? VERDE_C : NARANJAS.has(n) ? NARANJA : TINTA};
			}),
		});
		cur = [];
	};
	words.forEach((w, i) => {
		cur.push(w);
		const nxt = words[i + 1];
		const len = cur.map((x) => x.raw).join(' ').length;
		const lleno = cur.length >= 3 || (cur.length >= 2 && len > 18);
		if (/[.?,:!]$/.test(w.raw) || !nxt || cur.length >= 4 || (lleno && !FUNC.has(norm(w.raw)))) flush();
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
	const size = Math.max(62, Math.min(100, 100 - Math.max(0, len - 13) * 2.6));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 1110, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{position: 'absolute', width: 720, height: 150, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.45), rgba(255,255,255,0) 70%)'}} />
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
const S_BIT = 0.52;
const BIT_FLOOR = 1660;
const BIT_X: [number, number][] = [
	[0, 540], [0.8, 540], [1.5, 270], [E[3] + 0.1, 270], [E[3] + 0.8, 360], [E[4] + 0.1, 360],
	[E[4] + 0.8, 450], [E[5] + 0.1, 450], [E[5] + 0.8, 540], [E[6] + 0.1, 540], [E[6] + 0.8, 640], [E[7] + 0.1, 640], [E[7] + 0.8, 540], [E[8] + 0.2, 540], [E[8] + 0.9, 760],
];
const GEST: [number, Gesture][] = [
	[0, 'rest'], [0.3, 'think'], [2.5, 'rest'], [3.9, 'point'], [5.0, 'rest'],
	[5.9, 'point'], [8.5, 'rest'], [8.8, 'think'], [13.3, 'rest'],
	[13.8, 'point'], [20.0, 'rest'], [20.4, 'press'], [24.0, 'rest'],
	[24.4, 'rest'], [25.3, 'celebrate'], [27.0, 'rest'],
	[29.0, 'point'], [34.4, 'rest'], [38.3, 'celebrate'], [39.5, 'rest'], [40.1, 'wave'],
];
const BLINKS = [1.9, 5.8, 9.4, 13.1, 17.6, 22.0, 26.3, 30.1, 34.9, 38.8, 41.6];

const BitLayer: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const x = kf(t, BIT_X, ease);
	const speed = Math.abs(x - kf(t - 1 / FPS, BIT_X, ease)) * FPS;
	const walkK = Math.min(1, speed / 220);
	const wc = t / 0.45;
	const wf = walkFeet(wc, walkK, 165, 70);
	const swing = Math.sin(wc * Math.PI * 2) * 45 * walkK;
	const mouth = mouthFrom(amplitudes as number[], frame);
	const blink = blinkAt(t, BLINKS);
	const g = blendGestures(GEST, t);
	const br = Math.sin(t * 2.4);
	const jump = (g.jump * 60) / S_BIT;
	const pose: BitRigPose = {
		bodyY: br * 5 - mouth * 14 + wf.bob - jump,
		sy: 1 + br * 0.012 - g.jump * 0.05,
		lean: Math.sin(t * 5.5) * 2.5 * mouth + 5 * walkK,
		mouth,
		blink,
		look: {x: g.look.x + walkK * 0.7, y: g.look.y},
		antenna: Math.sin(t * 7) * (3 + 8 * mouth + 6 * walkK + 10 * g.jump),
		handsFront: g.front,
		handL: {x: mix(g.L.x, -330 - swing, walkK), y: mix(g.L.y, -250, walkK) - jump},
		handR: {x: mix(g.R.x, 330 + swing, walkK), y: mix(g.R.y, -250, walkK) - jump},
		footL: walkK > 0.05 ? wf.L : {x: -150, y: -jump},
		footR: walkK > 0.05 ? wf.R : {x: 150, y: -jump},
	};
	const lift = Math.max(0, -(pose.bodyY ?? 0)) / 40;
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<radialGradient id="sombraBit">
					<stop offset="0%" stopColor="#3a2a20" stopOpacity={0.5} />
					<stop offset="60%" stopColor="#3a2a20" stopOpacity={0.22} />
					<stop offset="100%" stopColor="#3a2a20" stopOpacity={0} />
				</radialGradient>
			</defs>
			<ellipse cx={x} cy={BIT_FLOOR + 4} rx={((115 * S_BIT) / 0.4) * 1.25} ry={((16 * S_BIT) / 0.4) * 1.6} fill="url(#sombraBit)" opacity={1 - Math.min(0.6, lift * 0.4)} />
			<g transform={`translate(${x} ${BIT_FLOOR}) scale(${S_BIT})`}>
				<BitRig pose={pose} />
			</g>
		</svg>
	);
};

// ───────────────────────── Composición
const SFX: {t: number; f: string; v: number; d: number}[] = [
	{t: 1.3, f: 'Stone motion.aac', v: 0.12, d: 40},
	{t: 3.75, f: 'poof.aac', v: 0.12, d: 30},
	{t: 6.03, f: 'poof.aac', v: 0.08, d: 20},
	{t: 6.53, f: 'poof.aac', v: 0.08, d: 20},
	{t: 7.03, f: 'poof.aac', v: 0.08, d: 20},
	{t: 7.53, f: 'poof.aac', v: 0.08, d: 20},
	{t: 8.03, f: 'poof.aac', v: 0.08, d: 20},
	{t: 11.1, f: 'poof.aac', v: 0.08, d: 20},
	{t: 11.5, f: 'poof.aac', v: 0.08, d: 20},
	{t: 11.9, f: 'poof.aac', v: 0.08, d: 20},
	{t: 13.0, f: 'Stone motion.aac', v: 0.07, d: 15},
	{t: 20.5, f: 'Stone motion.aac', v: 0.08, d: 15},
	{t: 21.25, f: 'Stone motion.aac', v: 0.08, d: 15},
	{t: 22.0, f: 'Stone motion.aac', v: 0.08, d: 15},
	{t: 22.78, f: 'Paper in Air.aac', v: 0.08, d: 40},
	{t: 25.32, f: 'flash.aac', v: 0.08, d: 40},
	{t: 31.14, f: 'Stone motion.aac', v: 0.08, d: 20},
	{t: 33.23, f: 'poof.aac', v: 0.1, d: 30},
	{t: 39.85, f: 'flash.aac', v: 0.08, d: 40},
];

export const EstructuraReel: React.FC = () => {
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
				<Suelo t={t} />
				<Edificio t={t} />
				<Camino t={t} />
				<Escena1 t={t} />
				<Escena2 t={t} />
				<Escena3 t={t} />
				<Escena4 t={t} />
				<Escena5 t={t} />
				<Escena6 t={t} />
				<Escena7 t={t} />
				<Escena8 t={t} />
				<Escena9 t={t} />
				<BitLayer t={t} frame={frame} />
				<Subtitulos t={t} />
			</AbsoluteFill>

			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', background: `rgba(245,239,230,${0.003 + (frame % 2) * 0.004})`}} />
		</AbsoluteFill>
	);
};
