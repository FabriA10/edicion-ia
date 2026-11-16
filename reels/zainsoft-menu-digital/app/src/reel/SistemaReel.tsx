import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import amplitudes from './amplitud.json';
import palabras from './palabras.json';
import {BitRig, BitRigPose} from '../bit/BitRig';
import {blendGestures, blinkAt, kf, mix, mouthFrom, walkFeet, Gesture} from '../bit/bitMotion';

// Reel 1 de la serie «Qué es un sistema» (ZainSoft). Todo generado en código, sin rostros humanos.
// Tiempos: sacados de la voz (src/reel/palabras.json, ver alinear-palabras.mjs).

const FPS = 30;
const NARANJA = '#F2602E';
const OSCURO = '#0E0F13';
const CREMA = '#F5EFE6';
const TINTA = '#14151A';
const VERDE_C = '#00A35C'; // verde legible sobre fondo claro
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

// ───────────────────────── Íconos simples (caja 100x100, sin rostros)
const ICON_PATH = {
	camisa: 'M20 20 L38 10 Q50 24 62 10 L80 20 L94 42 L78 50 L78 90 L22 90 L22 50 L6 42 Z',
	pantalon: 'M28 8 H72 L78 92 H55 L50 40 L45 92 H22 Z',
	vestido: 'M38 6 H62 L57 30 L82 94 H18 L43 30 Z',
};
const Icon: React.FC<{k: keyof typeof ICON_PATH; x: number; y: number; s: number; fill: string}> = ({k, x, y, s, fill}) => (
	<g transform={`translate(${x - 50 * s} ${y - 50 * s}) scale(${s})`}>
		<path d={ICON_PATH[k]} fill={fill} strokeLinejoin="round" />
	</g>
);
const Check: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = VERDE}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<circle r={26} fill={color} />
		<path d="M-12 1 L-3 10 L13 -9" stroke={OSCURO} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</g>
);
const Cruz: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<circle r={26} fill="#FF4D4D" />
		<path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
	</g>
);
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

const SceneSvg: React.FC<{op: number; children: React.ReactNode}> = ({op, children}) => (
	<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: op}}>
		{children}
	</svg>
);

// ───────────────────────── Escena 1 (0-5,0): ¿página web? → SISTEMAS
const Escena1: React.FC<{t: number}> = ({t}) => {
	const enter = pop(t, 0);
	const strike = ramp(t, 2.93, 3.2);
	const dim = ramp(t, 3.25, 3.6);
	const slam = pop(t, 3.67, 9);
	const underline = ramp(t, 4.0, 4.5);
	return (
		<SceneSvg op={fade(t, 0, 5.1, 0.01, 0.3)}>
			<defs>
				<filter id="glow1" filterUnits="userSpaceOnUse" x={-600} y={-250} width={1200} height={500}>
					<feGaussianBlur stdDeviation="18" />
				</filter>
			</defs>
			<g transform={`translate(540 600) scale(${0.85 + 0.15 * enter})`} opacity={enter * (1 - 0.88 * dim)}>
				<rect x={-300} y={-200} width={600} height={400} rx={30} fill={CARD} stroke={LINEA} strokeWidth={4} />
				<path d="M-300 -144 H300 V-170 Q300 -200 270 -200 H-270 Q-300 -200 -300 -170 Z" fill="#23262D" />
				{[-262, -226, -190].map((cx, i) => (
					<circle key={i} cx={cx} cy={-172} r={9} fill={['#FF5F57', '#FEBC2E', '#28C840'][i]} />
				))}
				<rect x={-120} y={-186} width={360} height={28} rx={14} fill="#2F323A" />
				<rect x={-260} y={-110} width={520} height={130} rx={16} fill={LINEA} />
				<rect x={-260} y={40} width={250} height={110} rx={16} fill="#23262D" />
				<rect x={20} y={40} width={240} height={110} rx={16} fill="#23262D" />
				<T x={0} y={250} size={50} fill={GRIS_C}>
					PÁGINA WEB
				</T>
				<line x1={-340} y1={-230} x2={-340 + 680 * strike} y2={-230 + 460 * strike} stroke={NARANJA} strokeWidth={18} strokeLinecap="round" />
			</g>
			<g transform={`translate(540 ${700}) scale(${0.6 + 0.4 * slam})`} opacity={Math.min(1, slam * 2)}>
				<g filter="url(#glow1)">
					<T x={0} y={50} size={150} fill={NARANJA} op={0.8}>
						SISTEMAS
					</T>
				</g>
				<T x={0} y={50} size={150} fill={NARANJA}>
					SISTEMAS
				</T>
				<rect x={-330} y={90} width={660 * underline} height={14} rx={7} fill={VERDE_C} />
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Escena 2 (5,2-10,7): la vidriera se abre y aparece el sistema
const Fachada: React.FC = () => (
	<g>
		{Array.from({length: 8}).map((_, i) => (
			<g key={i}>
				<rect x={-260 + i * 65} y={-250} width={65} height={90} fill={i % 2 ? '#F7F0E8' : NARANJA} />
				<circle cx={-227.5 + i * 65} cy={-160} r={32.5} fill={i % 2 ? '#F7F0E8' : NARANJA} />
			</g>
		))}
		<rect x={-240} y={-160} width={480} height={400} fill="#1F2128" stroke={LINEA} strokeWidth={4} />
		<rect x={-200} y={-100} width={250} height={230} rx={12} fill="#2C3A4A" />
		<path d="M-170 120 L-60 -90 H-20 L-130 120 Z" fill="#fff" opacity={0.08} />
		<rect x={80} y={-100} width={120} height={340} rx={10} fill="#14151A" stroke={NARANJA} strokeWidth={5} />
		<circle cx={180} cy={80} r={8} fill={NARANJA} />
	</g>
);
const NODOS = [
	{x: -190, y: -170, label: 'STOCK', t0: 8.1},
	{x: 190, y: -170, label: 'PEDIDOS', t0: 8.5},
	{x: -190, y: 170, label: 'VENTAS', t0: 9.0},
	{x: 190, y: 170, label: 'AVISOS', t0: 9.5},
];
const Escena2: React.FC<{t: number}> = ({t}) => {
	const split = ramp(t, 7.18, 7.8);
	const sign = pop(t, 5.71);
	const hub = pop(t, 7.31);
	const glowWin = ramp(t, 6.17, 6.6) * (1 - split);
	return (
		<SceneSvg op={fade(t, 5.2, 10.7)}>
			<defs>
				<clipPath id="clipL">
					<rect x={-400} y={-400} width={400} height={800} />
				</clipPath>
				<clipPath id="clipR">
					<rect x={0} y={-400} width={400} height={800} />
				</clipPath>
			</defs>
			<g transform="translate(540 720) scale(1.15)">
				{/* sistema detrás */}
				<g opacity={ramp(t, 7.3, 7.7)}>
					{NODOS.map((n, i) => (
						<line key={i} x1={0} y1={0} x2={n.x} y2={n.y} stroke={NARANJA} strokeWidth={5} strokeDasharray="14 10" strokeDashoffset={-t * 70} opacity={pop(t, n.t0) * 0.8} />
					))}
					<g transform={`scale(${hub})`}>
						<circle r={74} fill={NARANJA} />
						<T x={0} y={9} size={26} fill="#fff">
							SISTEMA
						</T>
					</g>
					{NODOS.map((n, i) => (
						<g key={i} transform={`translate(${n.x} ${n.y}) scale(${pop(t, n.t0)})`}>
							<rect x={-95} y={-45} width={190} height={90} rx={22} fill={CARD} stroke={NARANJA} strokeWidth={4} />
							<T x={0} y={11} size={32}>
								{n.label}
							</T>
						</g>
					))}
				</g>
				{/* vidriera: dos mitades que se abren */}
				<g opacity={1 - split}>
					<g clipPath="url(#clipL)" transform={`translate(${-300 * split} 0)`}>
						<Fachada />
					</g>
					<g clipPath="url(#clipR)" transform={`translate(${300 * split} 0)`}>
						<Fachada />
					</g>
					<rect x={-200} y={-100} width={250} height={230} rx={12} fill="none" stroke={VERDE} strokeWidth={6} opacity={glowWin} />
				</g>
				<g transform={`translate(0 -300) scale(${sign * (1 - split)})`}>
					<rect x={-100} y={-35} width={200} height={70} rx={14} fill={CARD} stroke={NARANJA} strokeWidth={4} />
					<T x={0} y={17} size={48} fill={NARANJA}>
						WEB
					</T>
				</g>
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Escena 3 (10,7-17,1): tienda de ropa
const TILES = [
	{x: -88, y: -200, c: '#F3C6B8', k: 'camisa' as const},
	{x: 88, y: -200, c: '#B8D4E8', k: 'pantalon' as const},
	{x: -88, y: 50, c: '#D9C7F0', k: 'vestido' as const},
	{x: 88, y: 50, c: '#F5E1A4', k: 'camisa' as const},
];
const Escena3: React.FC<{t: number}> = ({t}) => {
	const phone = pop(t, 11.31, 14);
	const cStock = pop(t, 12.51, 10);
	const cWa = pop(t, 14.12, 10);
	const cVen = pop(t, 15.81, 10);
	return (
		<SceneSvg op={fade(t, 10.7, 17.1)}>
			<g transform={`translate(540 660) scale(${0.85 + 0.15 * phone})`} opacity={phone}>
				<rect x={-190} y={-380} width={380} height={760} rx={58} fill="#0B0C0F" stroke="#3A3D45" strokeWidth={8} />
				<rect x={-175} y={-365} width={350} height={730} rx={46} fill="#F7F1EC" />
				<rect x={-50} y={-352} width={100} height={22} rx={11} fill="#0B0C0F" />
				<T x={-110} y={-290} size={32} fill="#2A2A2A" anchor="start">
					Mi Tienda
				</T>
				<circle cx={125} cy={-300} r={20} fill="none" stroke="#2A2A2A" strokeWidth={4} />
				{TILES.map((tl, i) => (
					<g key={i} transform={`translate(${tl.x} ${tl.y})`}>
						<rect x={-72} y={0} width={144} height={170} rx={16} fill={tl.c} />
						<Icon k={tl.k} x={0} y={85} s={0.9} fill="#fff" />
						<rect x={-72} y={182} width={100} height={12} rx={6} fill="#CFC6BE" />
						<rect x={-72} y={204} width={60} height={12} rx={6} fill="#B7ADA4" />
					</g>
				))}
				<circle cx={125} cy={320} r={34} fill="#25D366" />
				<path d="M110 305 Q125 295 140 305 Q148 325 128 335 L116 340 L118 332 Q106 322 110 305 Z" fill="#fff" />
			</g>
			{/* STOCK */}
			<g transform={`translate(270 460) scale(${cStock})`}>
				<rect x={-150} y={-60} width={300} height={120} rx={26} fill={CARD} stroke={NARANJA} strokeWidth={4} />
				<rect x={-122} y={-26} width={52} height={14} rx={4} fill={NARANJA} />
				<rect x={-122} y={-6} width={52} height={14} rx={4} fill={NARANJA} />
				<rect x={-122} y={14} width={52} height={14} rx={4} fill={NARANJA} opacity={0.4} />
				<T x={-48} y={14} size={44} anchor="start">
					STOCK
				</T>
			</g>
			{/* PEDIDOS */}
			<g transform={`translate(800 690) scale(${cWa})`}>
				<rect x={-160} y={-65} width={320} height={130} rx={26} fill={CARD} stroke="#25D366" strokeWidth={4} />
				<circle cx={-112} cy={0} r={32} fill="#25D366" />
				<path d="M-126 -12 Q-112 -22 -98 -12 Q-90 8 -108 16 L-120 20 L-118 12 Q-130 4 -126 -12 Z" fill="#fff" />
				<T x={-62} y={-4} size={38} anchor="start">
					PEDIDOS
				</T>
				<T x={-62} y={34} size={28} anchor="start" fill="#25D366">
					por WhatsApp
				</T>
			</g>
			{/* VENTAS */}
			<g transform={`translate(270 930) scale(${cVen})`}>
				<rect x={-150} y={-75} width={300} height={150} rx={26} fill={CARD} stroke={VERDE} strokeWidth={4} />
				<T x={-122} y={-22} size={38} anchor="start">
					VENTAS
				</T>
				{[30, 52, 40, 72, 96].map((h, i) => (
					<rect key={i} x={-122 + i * 38} y={60 - h * ramp(t, 15.9, 16.6)} width={26} height={h * ramp(t, 15.9, 16.6)} rx={5} fill={VERDE} opacity={0.5 + i * 0.12} />
				))}
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Escena 4 (17,1-21,3): turnos que no se pisan
const COLX = [-190, 0, 190];
const ROWY = [-110, 40, 190];
const Escena4: React.FC<{t: number}> = ({t}) => {
	const panel = pop(t, 17.22, 14);
	const bx = kf(t, [[19.5, 420], [20.0, 0], [20.2, 90], [20.32, 90], [20.75, 190]]);
	const by = kf(t, [[19.5, 40], [20.0, 40], [20.32, 40], [20.75, 190]]);
	const choque = t > 19.98 && t < 20.4;
	const ok = t >= 20.75;
	const shake = choque ? Math.sin(t * 90) * 8 : 0;
	const color = ok ? '#1DBA6A' : choque ? '#FF4D4D' : '#4C8DFF';
	const reservados = [
		{c: 0, r: 0, t0: 17.56},
		{c: 1, r: 1, t0: 18.14},
		{c: 2, r: 0, t0: 18.65},
	];
	return (
		<SceneSvg op={fade(t, 17.1, 21.3)}>
			<g transform={`translate(540 650) scale(${0.85 + 0.15 * panel})`} opacity={panel}>
				<rect x={-320} y={-350} width={640} height={700} rx={40} fill={CARD} stroke={LINEA} strokeWidth={4} />
				<T x={0} y={-285} size={46}>
					TURNOS
				</T>
				{COLX.map((x, i) => (
					<T key={i} x={x} y={-215} size={22} fill={GRIS}>
						{`CANCHA ${i + 1}`}
					</T>
				))}
				{COLX.map((x, c) =>
					ROWY.map((y, r) => <rect key={`${c}${r}`} x={x - 85} y={y - 65} width={170} height={130} rx={18} fill="#22252C" stroke={LINEA} strokeWidth={2} />),
				)}
				{reservados.map((b, i) => (
					<g key={i} transform={`translate(${COLX[b.c]} ${ROWY[b.r]}) scale(${pop(t, b.t0)})`}>
						<rect x={-85} y={-65} width={170} height={130} rx={18} fill={NARANJA} />
						<T x={0} y={9} size={26}>
							RESERVADO
						</T>
					</g>
				))}
				{t > 19.5 && (
					<g transform={`translate(${bx + shake} ${by})`}>
						<rect x={-85} y={-65} width={170} height={130} rx={18} fill={color} />
						<T x={0} y={9} size={26}>
							NUEVA
						</T>
						{choque && <Cruz x={60} y={-48} s={0.8} />}
						{ok && <Check x={60} y={-48} s={0.8} color="#fff" />}
					</g>
				)}
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Escena 5 (21,4-25,0): cocina y caja hablan
const Escena5: React.FC<{t: number}> = ({t}) => {
	const pa = pop(t, 21.54, 14);
	const pb = pop(t, 21.9, 14);
	const tk = pop(t, 22.73, 10);
	const ty = kf(t, [[23.2, 470], [23.8, 930]]);
	const ts = 1 - 0.2 * ramp(t, 23.2, 23.8);
	const tx = 540 + 170 * ramp(t, 23.5, 23.9);
	const ok = pop(t, 24.16, 10);
	const Panel: React.FC<{y: number; label: string; s: number; icon: 'olla' | 'ticket'}> = ({y, label, s, icon}) => (
		<g transform={`translate(540 ${y}) scale(${s})`}>
			<rect x={-280} y={-130} width={560} height={260} rx={34} fill={CARD} stroke={LINEA} strokeWidth={4} />
			<T x={-150} y={20} size={56} anchor="start">
				{label}
			</T>
			{icon === 'olla' ? (
				<g transform="translate(-215 0)">
					<rect x={-40} y={-18} width={80} height={52} rx={10} fill={NARANJA} />
					<rect x={-52} y={-26} width={104} height={12} rx={6} fill={NARANJA} />
					<path d="M-18 -50 Q-10 -70 -18 -85 M6 -50 Q14 -70 6 -85" stroke={GRIS} strokeWidth={6} fill="none" strokeLinecap="round" />
				</g>
			) : (
				<g transform="translate(-215 0)">
					<path d="M-34 -50 H34 V50 L22 40 L11 50 L0 40 L-11 50 L-22 40 L-34 50 Z" fill={VERDE} />
					<path d="M-18 -26 H18 M-18 -8 H18 M-18 10 H6" stroke={OSCURO} strokeWidth={6} strokeLinecap="round" />
				</g>
			)}
			{ok > 0 && <Check x={225} y={-85} s={ok} />}
		</g>
	);
	return (
		<SceneSvg op={fade(t, 21.4, 25.0)}>
			<Panel y={470} label="COCINA" s={pa} icon="olla" />
			<Panel y={930} label="CAJA" s={pb} icon="ticket" />
			<line x1={540} y1={600} x2={540} y2={800} stroke={NARANJA} strokeWidth={8} strokeDasharray="16 12" strokeDashoffset={-t * 90} opacity={pb} />
			{tk > 0 && (
				<g transform={`translate(${tx} ${t < 23.2 ? 470 : ty}) scale(${tk * ts})`}>
					<rect x={-80} y={-60} width={160} height={120} rx={12} fill="#F7F0E8" />
					<rect x={-56} y={-36} width={112} height={10} rx={5} fill="#BDB3A8" />
					<rect x={-56} y={-12} width={84} height={10} rx={5} fill="#BDB3A8" />
					<rect x={-56} y={12} width={100} height={10} rx={5} fill="#BDB3A8" />
				</g>
			)}
		</SceneSvg>
	);
};

// ───────────────────────── Escena 6 (25,1-31,9): mismo concepto, a medida
const RUBROS = [
	{x: 270, label: 'ROPA', t0: 25.52, c: '#F3C6B8'},
	{x: 540, label: 'CANCHAS', t0: 25.9, c: '#9ED4A6'},
	{x: 810, label: 'RESTAURANTE', t0: 26.24, c: '#F5D18A'},
];
const Escena6: React.FC<{t: number}> = ({t}) => {
	const bar = ramp(t, 26.79, 27.3);
	const strike = ramp(t, 28.15, 28.5);
	const tpl = fade(t, 27.72, 29.0, 0.3, 0.3);
	const medida = pop(t, 29.25, 10);
	const regla = ramp(t, 29.86, 30.6);
	return (
		<SceneSvg op={fade(t, 25.1, 31.9)}>
			{RUBROS.map((r, i) => (
				<g key={i} transform={`translate(${r.x} 520) scale(${pop(t, r.t0)})`}>
					<rect x={-110} y={-110} width={220} height={220} rx={36} fill={CARD} stroke={r.c} strokeWidth={5} />
					{i === 0 && <Icon k="camisa" x={0} y={-20} s={0.9} fill={r.c} />}
					{i === 1 && (
						<g transform="translate(0 -20)">
							<circle r={42} fill="none" stroke={r.c} strokeWidth={7} />
							<path d="M-42 0 H42 M0 -42 V42" stroke={r.c} strokeWidth={5} />
						</g>
					)}
					{i === 2 && (
						<g transform="translate(0 -20)">
							<path d="M-24 -42 V42 M-34 -42 V-6 Q-24 6 -14 -6 V-42" stroke={r.c} strokeWidth={7} fill="none" strokeLinecap="round" />
							<path d="M26 -42 Q46 -20 26 8 V42" stroke={r.c} strokeWidth={7} fill="none" strokeLinecap="round" />
						</g>
					)}
					<T x={0} y={82} size={r.label.length > 8 ? 25 : 32} fill={r.c}>
						{r.label}
					</T>
				</g>
			))}
			{RUBROS.map((r, i) => (
				<line key={i} x1={r.x} y1={640} x2={r.x} y2={720 } stroke={NARANJA} strokeWidth={6} strokeDasharray="10 8" opacity={bar} strokeDashoffset={-t * 60} />
			))}
			<g opacity={bar} transform={`translate(540 770) scale(${0.8 + 0.2 * bar})`}>
				<rect x={-380} y={-48} width={760} height={96} rx={28} fill={NARANJA} />
				<T x={0} y={14} size={46}>
					MISMO SISTEMA
				</T>
			</g>
			{/* plantillas tachadas */}
			<g transform="translate(540 960)" opacity={tpl}>
				{Array.from({length: 9}).map((_, i) => (
					<rect key={i} x={-150 + (i % 3) * 104} y={-75 + Math.floor(i / 3) * 52} width={92} height={42} rx={8} fill="#2F323A" />
				))}
				<line x1={-190} y1={-90} x2={-190 + 380 * strike} y2={-90 + 180 * strike} stroke="#FF4D4D" strokeWidth={14} strokeLinecap="round" />
			</g>
			{/* a medida */}
			<g transform={`translate(540 970) scale(${0.7 + 0.3 * medida})`} opacity={Math.min(1, medida * 2)}>
				<T x={0} y={30} size={120} fill={VERDE_C}>
					A MEDIDA
				</T>
				<g opacity={regla > 0 ? 1 : 0}>
					<rect x={-300} y={62} width={600 * regla} height={18} rx={4} fill={VERDE_C} opacity={0.9} />
					{Array.from({length: 16}).map((_, i) => (
						<line key={i} x1={-300 + i * 40} y1={62} x2={-300 + i * 40} y2={i % 2 ? 52 : 44} stroke={VERDE_C} strokeWidth={4} opacity={-300 + i * 40 < -300 + 600 * regla ? 1 : 0} />
					))}
				</g>
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Escena 7 (31,9-fin): cierre
const Escena7: React.FC<{t: number}> = ({t}) => {
	const logo = pop(t, 32.0, 11);
	const prox = pop(t, 32.3, 12);
	const ig = pop(t, 34.43, 10);
	const dm = pop(t, 35.4, 10);
	return (
		<SceneSvg op={fade(t, 31.9, 40, 0.3, 0.01)}>
			<g transform={`translate(492 540) scale(${0.7 + 0.3 * logo})`} opacity={Math.min(1, logo * 2)}>
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
			<g transform={`translate(540 760) scale(${prox})`}>
				<rect x={-330} y={-44} width={660} height={88} rx={44} fill={CARD} stroke={NARANJA} strokeWidth={4} />
				<T x={0} y={12} size={34} fill={GRIS}>
					PRÓXIMO: CÓMO SE ESTRUCTURA
				</T>
			</g>
			<g transform={`translate(540 930) scale(${ig})`}>
				<rect x={-250} y={-60} width={500} height={120} rx={60} fill={NARANJA} />
				<T x={0} y={20} size={66}>
					@zainsoft_
				</T>
			</g>
			<g transform={`translate(540 1030) scale(${dm})`}>
				<T x={20} y={14} size={42} fill={TINTA}>
					ESCRIBINOS POR DM
				</T>
				<path d="M-292 -22 H-250 Q-238 -22 -238 -10 V12 Q-238 24 -250 24 H-268 L-282 38 V24 H-292 Q-304 24 -304 12 V-10 Q-304 -22 -292 -22 Z" fill={TINTA} transform="translate(-30 0)" />
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Subtítulos (1-3 palabras, Hando, palabras clave en color)
type W = {text: string; startMs: number; endMs: number};
const norm = (s: string) => s.toLowerCase().replace(/[¿?¡!.,:;]/g, '');
const FUNC = new Set(['de', 'que', 'y', 'en', 'un', 'una', 'el', 'la', 'los', 'a', 'por', 'te', 'se', 'le', 'es', 'no', 'todo']);
const NOMBRES: Record<string, string> = {zainsoft: 'ZainSoft', whatsapp: 'WhatsApp', dm: 'DM'};
const VERDES = new Set(['sistemas', 'sistema', 'vidriera', 'detrás', 'medida', 'estructura']);
const AMARILLOS = new Set(['zainsoft', 'whatsapp', 'stock', 'turnos', 'plantillas', 'dm', 'restaurante']);

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
				return {t: NOMBRES[n] ?? n, color: VERDES.has(n) ? VERDE_C : AMARILLOS.has(n) ? NARANJA : TINTA};
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
	// cada subtítulo se queda hasta el siguiente si la pausa es corta
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

// ───────────────────────── Bit (marioneta SVG del equipo)
const S_BIT = 0.52;
const BIT_FLOOR = 1660;
const BIT_X: [number, number][] = [[0, 540], [5.0, 540], [5.55, 270], [31.8, 270], [32.4, 800]];
const GEST: [number, Gesture][] = [
	[0, 'rest'], [0.35, 'think'], [2.9, 'rest'], [3.6, 'celebrate'], [4.95, 'rest'],
	[5.3, 'point'], [10.6, 'rest'], [10.9, 'point'], [17.0, 'rest'], [17.3, 'point'], [21.3, 'rest'], [21.6, 'point'], [25.0, 'rest'],
	[25.4, 'point'], [29.1, 'press'], [31.8, 'rest'], [34.4, 'wave'],
];
const BLINKS = [1.9, 5.8, 9.4, 13.1, 17.6, 22.0, 26.3, 30.1, 34.9];

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

// ───────────────────────── Mapa de tiempos
// Las escenas están escritas con los tiempos de la primera voz (OLD). Si se cambia el audio, las frases nuevas
// (palabras.json) se hacen corresponder una a una con las viejas y todo se estira/acorta a las pausas reales.
const OLD_STARTS = [0.07, 2.93, 3.67, 5.28, 7.18, 10.86, 17.22, 21.54, 25.2, 27.72, 29.16, 32.01, 34.43];
const OLD_END = 36.17;
const NEW_STARTS: number[] = [];
(palabras as (W & {frase: number})[]).forEach((w) => {
	if (NEW_STARTS[w.frase] === undefined) NEW_STARTS[w.frase] = w.startMs / 1000;
});
const NEW_END = (palabras as W[])[palabras.length - 1].endMs / 1000;
const A = [...OLD_STARTS, OLD_END];
const B = [...NEW_STARTS, NEW_END];
const ext = {extrapolateLeft: 'extend', extrapolateRight: 'extend'} as const;
const toOld = (t: number) => interpolate(t, B, A, ext);
const toNew = (t: number) => interpolate(t, A, B, ext);
export const REEL_FRAMES = Math.ceil((NEW_END + 0.7) * FPS);

// ───────────────────────── Composición
const PUNCHES: [number, number][] = [[4.06, 0.06], [7.31, 0.05], [15.81, 0.05], [29.25, 0.06]];

export const SistemaReel: React.FC = () => {
	const frame = useCurrentFrame();
	const tr = frame / FPS;
	const t = toOld(tr);
	const punch = PUNCHES.reduce((acc, [a, k]) => acc + k * interpolate(t, [a - 0.05, a + 0.2, a + 0.65], [0, 1, 0], cl), 0);
	return (
		<AbsoluteFill style={{background: CREMA, overflow: 'hidden'}}>
			<style>{`@font-face { font-family: 'HandoBold'; src: url('${staticFile('Hando.otf')}') format('opentype'); font-weight: bold; }`}</style>
			<Audio src={staticFile('voz_master.wav')} volume={1} />
			<Sequence from={Math.round(toNew(3.67) * FPS)} durationInFrames={45}>
				<Audio src={staticFile('poof.aac')} volume={0.14} />
			</Sequence>
			<Sequence from={Math.round(toNew(32.0) * FPS)} durationInFrames={60}>
				<Audio src={staticFile('flash.aac')} volume={0.1} />
			</Sequence>

			{/* fondo */}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(242,96,46,0.20) 0%, rgba(245,239,230,0) 62%)'}} />
			<svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.8}}>
				<defs>
					<pattern id="rejilla" width={90} height={90} patternUnits="userSpaceOnUse">
						<path d="M90 0 H0 V90" fill="none" stroke="#E4DACB" strokeWidth={2} />
					</pattern>
				</defs>
				<rect width={1080} height={1920} fill="url(#rejilla)" />
			</svg>

			{/* Los elementos visuales se recrean en cada cuadro (key={frame}): evita bordes fantasma de elementos que se achican. El audio queda fuera. */}
			<AbsoluteFill key={frame}>
			{/* contenido con punch-in */}
				<AbsoluteFill style={{transformOrigin: '540px 680px', transform: `scale(${1 + punch})`}}>
					<Escena1 t={t} />
					<Escena2 t={t} />
					<Escena3 t={t} />
					<Escena4 t={t} />
					<Escena5 t={t} />
					<Escena6 t={t} />
					<Escena7 t={t} />
				</AbsoluteFill>

				<BitLayer t={t} frame={frame} />
				<Subtitulos t={tr} />

			</AbsoluteFill>

			{/* Fuerza el repintado completo en cada cuadro: sin esto Chrome deja bordes fantasma de elementos que se achican (rebotes) */}
			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', background: `rgba(245,239,230,${0.003 + (frame % 2) * 0.004})`}} />
		</AbsoluteFill>
	);
};
