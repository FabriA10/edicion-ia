import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import amplitudes from './amplitud.json';
import palabras from './palabras.json';
import M from '../tarjetas-medidas.json';
import {BitRig, BitRigPose} from '../bit/BitRig';
import {blendGestures, blinkAt, kf, mix, mouthFrom, walkFeet, Gesture} from '../bit/bitMotion';

// Reel «Esta invitación no se imprime» (ZainSoft · tarjetas digitales).
// Capturas reales de las tarjetas publicadas (public/tarjetas/, sacadas cuadro a cuadro con un navegador automatizado),
// dentro de un celular generado en código. Sin rostros humanos. Tiempos de la voz real (palabras.json).

const FPS = 30;
const NARANJA = '#F2602E';
const CREMA = '#F5EFE6';
const TINTA = '#14151A';
const VERDE_C = '#00A35C';
const CARD = '#1A1C22';
const WA = '#25D366';
const FONT = "HandoBold, 'Segoe UI', Arial, sans-serif";

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...cl, easing: ease});
const pop = (t: number, t0: number, damping = 12) => (t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {damping, stiffness: 150}}));
const pad = (n: number) => String(n).padStart(3, '0');

const END = 28.0;
export const REEL_FRAMES = Math.ceil(END * FPS);

// ───────────────────────── Celular
const SW = 432; // pantalla en px del reel
const SH = 936;
const K = SW / M.cssAncho; // px del reel por px CSS de la tarjeta
const BEZ = 14;
const PX = 540; // centro del celular
const PY = 750;

type Contenido = {k: 'img'; src: string} | {k: 'pagina'; tarjeta: 'quince'; scroll: number};

const Pantalla: React.FC<{c: Contenido; children?: React.ReactNode}> = ({c, children}) => {
	if (c.k === 'img')
		return (
			<>
				<Img src={staticFile(c.src)} style={{position: 'absolute', left: 0, top: 0, width: SW, height: SH}} />
				{children}
			</>
		);
	return (
		<>
			<Img src={staticFile(`tarjetas/${c.tarjeta}-pagina.png`)} style={{position: 'absolute', left: 0, top: -c.scroll * K, width: SW}} />
			<div style={{position: 'absolute', left: 0, top: -c.scroll * K, width: SW}}>{children}</div>
		</>
	);
};

const Celular: React.FC<{x?: number; y?: number; s?: number; rot?: number; rotY?: number; op?: number; children: React.ReactNode}> = ({
	x = PX,
	y = PY,
	s = 1,
	rot = 0,
	rotY = 0,
	op = 1,
	children,
}) => (
	<div
		style={{
			position: 'absolute',
			left: x - SW / 2 - BEZ,
			top: y - SH / 2 - BEZ,
			width: SW + BEZ * 2,
			height: SH + BEZ * 2,
			borderRadius: 60,
			background: CARD,
			boxShadow: '0 40px 80px rgba(58,42,32,0.28), 0 10px 24px rgba(58,42,32,0.18)',
			transform: `perspective(2200px) scale(${s}) rotate(${rot}deg) rotateY(${rotY}deg)`,
			opacity: op,
		}}
	>
		<div style={{position: 'absolute', left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: 46, overflow: 'hidden', background: '#000'}}>{children}</div>
		<div style={{position: 'absolute', left: (SW + BEZ * 2) / 2 - 60, top: BEZ + 12, width: 120, height: 30, borderRadius: 15, background: '#000'}} />
	</div>
);

// Anillo que marca un toque (coordenadas CSS de la tarjeta)
const Toque: React.FC<{t: number; t0: number; x: number; y: number}> = ({t, t0, x, y}) => {
	const p = (t - t0) / 0.5;
	if (p < 0 || p > 1) return null;
	const r = 18 + 46 * p;
	return (
		<div
			style={{
				position: 'absolute',
				left: x * K - r,
				top: y * K - r,
				width: r * 2,
				height: r * 2,
				borderRadius: '50%',
				border: `6px solid rgba(255,255,255,${0.95 * (1 - p)})`,
				background: `rgba(255,255,255,${0.35 * (1 - p)})`,
			}}
		/>
	);
};

// Marco naranja que late alrededor de un elemento (coordenadas CSS)
const Marco: React.FC<{t: number; a: number; b: number; r: {x: number; y: number; w: number; h: number}}> = ({t, a, b, r}) => {
	const op = interpolate(t, [a, a + 0.15, b - 0.15, b], [0, 1, 1, 0], cl);
	if (op <= 0) return null;
	const g = 8 + Math.sin((t - a) * 9) * 3;
	return (
		<div
			style={{
				position: 'absolute',
				left: r.x * K - g,
				top: r.y * K - g,
				width: r.w * K + g * 2,
				height: r.h * K + g * 2,
				borderRadius: 18,
				border: `5px solid ${NARANJA}`,
				boxShadow: `0 0 24px rgba(242,96,46,0.6)`,
				opacity: op,
			}}
		/>
	);
};

// ───────────────────────── Línea de tiempo del celular principal
const SOBRE_T0 = 2.63; // «Se abre»
const SOBRE_FIN = SOBRE_T0 + 43 / FPS;
const PAGINA_T0 = 4.4;
const FORM_T0 = 11.2;

const SCROLL: [number, number][] = [
	[PAGINA_T0, 0],
	[4.6, 0],
	[6.4, 560],
	[6.9, 560],
	[7.35, M.quince.countdown - 300],
	[8.12, M.quince.countdown - 300],
	[8.55, M.quince.comoLlegar - 420],
	[9.1, M.quince.comoLlegar - 420],
	[9.55, M.quince.copiarAlias - 420],
	[10.7, M.quince.copiarAlias - 420],
	[11.15, M.formScroll],
];

const FORM: [number, number][] = [
	[FORM_T0, 0], [11.35, 1], [11.5, 2], [11.65, 3], [11.8, 4], [11.95, 5], [12.05, 6], [12.3, 7], [12.75, 8], [13.8, 25], [14.05, 26], [14.35, 25],
];
const formFrame = (t: number) => {
	let f = 0;
	for (let i = 0; i < FORM.length; i++) {
		const [t0, v] = FORM[i];
		if (t < t0) break;
		const nx = FORM[i + 1];
		f = nx && v === 8 && nx[1] === 25 ? Math.min(25, Math.round(8 + ((t - t0) / (nx[0] - t0)) * 17)) : v;
	}
	return f;
};

// Escala y posición del celular principal
const ESCALA: [number, number][] = [
	[0, 1.06], [2.5, 1.0], [2.62, 1.0], [2.75, 1.1], [3.7, 1.0], [6.4, 1.05], [7.1, 1.05], [7.3, 1.12], [8.0, 1.06],
	[10.7, 1.06], [11.2, 1.1], [14.6, 1.1], [15.0, 0.8], [17.3, 0.8], [17.45, 1.0],
];
const ALTO: [number, number][] = [[0, PY], [14.6, PY], [15.0, 700], [17.3, 700], [17.45, PY]];

// Escenas 6 (17,38-21,57): portadas y giros
const GIRO1 = 18.75;
const GIRO2 = 19.66;
const GIRO_D = 0.36;
const ABANICO = 20.62;
const SALIDA = 21.57;
const VUELTA = 26.3; // el celular vuelve con el sobre cerrado (bucle)

const giroAng = (t: number) => {
	const g = (t0: number) => ramp(t, t0, t0 + GIRO_D) * 180;
	return t < GIRO2 ? g(GIRO1) : g(GIRO2);
};

const CelularPrincipal: React.FC<{t: number}> = ({t}) => {
	if (t >= ABANICO && t < VUELTA) return null;

	// Vuelta al inicio (bucle): cae desde arriba con rebote
	if (t >= VUELTA) {
		const p = pop(t, VUELTA, 13);
		const s = kf(t, [[VUELTA, 1.0], [27.9, 1.06]]);
		return (
			<Celular y={mix(-700, PY, p)} s={s}>
				<Pantalla c={{k: 'img', src: 'tarjetas/sobre/000.png'}} />
			</Celular>
		);
	}

	const s = kf(t, ESCALA, ease);
	const y = kf(t, ALTO, ease);

	if (t >= 17.38) {
		const ang = giroAng(t);
		const cual = t < GIRO1 + GIRO_D / 2 ? 'quince' : t < GIRO2 + GIRO_D / 2 ? 'casamiento' : 'baby-shower';
		const rotY = ang > 90 ? ang - 180 : ang;
		const entra = pop(t, 17.38, 14);
		return (
			<Celular y={y} s={s * (0.92 + 0.08 * entra)} rotY={rotY}>
				<Pantalla c={{k: 'img', src: `tarjetas/${cual}-portada.png`}} />
			</Celular>
		);
	}

	let c: Contenido;
	let extra: React.ReactNode = null;
	if (t < SOBRE_T0) c = {k: 'img', src: 'tarjetas/sobre/000.png'};
	else if (t < PAGINA_T0) c = {k: 'img', src: `tarjetas/sobre/${pad(Math.min(43, 1 + Math.floor((t - SOBRE_T0) * FPS)))}.png`};
	else if (t < FORM_T0) c = {k: 'pagina', tarjeta: 'quince', scroll: kf(t, SCROLL, ease)};
	else c = {k: 'img', src: `tarjetas/form/${pad(formFrame(t))}.png`};

	if (c.k === 'pagina')
		extra = (
			<>
				<Marco t={t} a={7.3} b={8.15} r={{x: 20, y: 1289, w: 350, h: 80}} />
				<Marco t={t} a={8.5} b={9.15} r={{x: 126, y: 2277, w: 138, h: 48}} />
				<Toque t={t} t0={8.7} x={195} y={2277 + 24} />
				<Marco t={t} a={9.5} b={10.75} r={{x: 127, y: 4032, w: 136, h: 48}} />
				<Toque t={t} t0={9.75} x={195} y={4032 + 24} />
			</>
		);
	if (c.k === 'img' && t < SOBRE_T0 + 0.5) extra = <Toque t={t} t0={2.58} x={195} y={402} />;
	if (t >= FORM_T0) extra = <Toque t={t} t0={14.02} x={M.btnConfirmar.x + M.btnConfirmar.w / 2} y={M.btnConfirmar.y + M.btnConfirmar.h / 2} />;

	// fundido corto entre el último cuadro del sobre y la página, y entre la página y el formulario
	const sobreOp = t >= PAGINA_T0 && t < PAGINA_T0 + 0.2 ? 1 - ramp(t, PAGINA_T0, PAGINA_T0 + 0.2) : 0;
	const pagOp = t >= FORM_T0 && t < FORM_T0 + 0.15 ? 1 - ramp(t, FORM_T0, FORM_T0 + 0.15) : 0;
	return (
		<Celular y={y} s={s}>
			<Pantalla c={c}>{extra}</Pantalla>
			{sobreOp > 0 && (
				<div style={{position: 'absolute', inset: 0, opacity: sobreOp}}>
					<Pantalla c={{k: 'img', src: 'tarjetas/sobre/043.png'}} />
				</div>
			)}
			{pagOp > 0 && (
				<div style={{position: 'absolute', inset: 0, opacity: pagOp}}>
					<Pantalla c={{k: 'pagina', tarjeta: 'quince', scroll: M.formScroll}} />
				</div>
			)}
		</Celular>
	);
};

// ───────────────────────── Abanico de las 3 tarjetas (20,62-21,95)
const Abanico: React.FC<{t: number}> = ({t}) => {
	if (t < ABANICO || t >= SALIDA + 0.4) return null;
	const lista: {src: string; x: number; rot: number; d: number}[] = [
		{src: 'quince', x: 300, rot: -8, d: 0.08},
		{src: 'baby-shower', x: 780, rot: 8, d: 0.16},
		{src: 'casamiento', x: 540, rot: 0, d: 0},
	];
	const sale = ramp(t, SALIDA, SALIDA + 0.38);
	return (
		<>
			{lista.map((c, i) => {
				const p = pop(t, ABANICO + c.d, 11);
				return (
					<Celular key={i} x={mix(PX, c.x, p)} y={mix(PY, 760, p) + sale * 900} s={mix(1, 0.6, p)} rot={c.rot * p} op={1 - sale}>
						<Pantalla c={{k: 'img', src: `tarjetas/${c.src}-portada.png`}} />
					</Celular>
				);
			})}
		</>
	);
};

// ───────────────────────── Carteles e íconos (SVG del reel)
const SceneSvg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
		{children}
	</svg>
);

const Impresora: React.FC = () => (
	<g fill="none" stroke={TINTA} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
		<rect x={-26} y={-34} width={52} height={22} rx={3} />
		<rect x={-40} y={-12} width={80} height={36} rx={8} fill={TINTA} />
		<rect x={-24} y={12} width={48} height={28} rx={3} fill="#fff" />
		<path d="M-50 -46 L50 50" stroke={NARANJA} strokeWidth={9} />
	</g>
);

// Escena 1: sticker «no se imprime»
const NoSeImprime: React.FC<{t: number}> = ({t}) => {
	if (t < 1.4 || t > 2.75) return null;
	const p = pop(t, 1.42, 10);
	const out = 1 - ramp(t, 2.45, 2.7);
	return (
		<SceneSvg>
			<g transform={`translate(540 1060) rotate(-6) scale(${p * out})`}>
				<rect x={-250} y={-62} width={500} height={124} rx={62} fill="#fff" />
				<rect x={-250} y={-62} width={500} height={124} rx={62} fill="none" stroke={TINTA} strokeWidth={5} />
				<g transform="translate(-170 0) scale(0.95)">
					<Impresora />
				</g>
				<text x={50} y={18} fontSize={52} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fill={TINTA}>
					no se imprime
				</text>
			</g>
		</SceneSvg>
	);
};

// Escena 3: insignias al costado del celular
const Insignia: React.FC<{t: number; a: number; b: number; y: number; k: 'reloj' | 'pin' | 'regalo'}> = ({t, a, b, y, k}) => {
	if (t < a || t > b) return null;
	const p = pop(t, a, 10) * (1 - ramp(t, b - 0.2, b));
	let ico: React.ReactNode;
	if (k === 'reloj')
		ico = (
			<g fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round">
				<circle r={24} />
				<path d="M0 -13 V0 L10 7" />
			</g>
		);
	else if (k === 'pin')
		ico = (
			<g>
				<path d="M0 30 C-6 18 -24 4 -24 -8 A24 24 0 0 1 24 -8 C24 4 6 18 0 30 Z" fill="#fff" />
				<circle cy={-8} r={9} fill={NARANJA} />
			</g>
		);
	else
		ico = (
			<g fill="#fff">
				<rect x={-26} y={-6} width={52} height={32} rx={4} />
				<rect x={-30} y={-18} width={60} height={14} rx={4} />
				<rect x={-4} y={-18} width={8} height={44} fill={NARANJA} />
				<path d="M0 -18 C-8 -34 -26 -30 -16 -20 Z M0 -18 C8 -34 26 -30 16 -20 Z" />
			</g>
		);
	return (
		<SceneSvg>
			<g transform={`translate(${PX + 262} ${y}) scale(${p})`}>
				<circle r={52} fill={NARANJA} />
				<circle r={52} fill="none" stroke="#fff" strokeWidth={5} />
				{ico}
			</g>
		</SceneSvg>
	);
};

// Escena 4: el mensaje de WhatsApp sale del celular
const MensajeWA: React.FC<{t: number}> = ({t}) => {
	if (t < 14.1 || t > 14.9) return null;
	const p = pop(t, 14.1, 11);
	const out = 1 - ramp(t, 14.65, 14.9);
	return (
		<div
			style={{
				position: 'absolute',
				left: 300,
				top: 1010 - 120 * p,
				width: 560,
				transform: `scale(${0.5 + 0.5 * p})`,
				opacity: Math.min(1, p * 2) * out,
				display: 'flex',
				alignItems: 'center',
				gap: 18,
				padding: '22px 28px',
				borderRadius: 34,
				background: '#fff',
				boxShadow: '0 18px 40px rgba(58,42,32,0.25)',
				fontFamily: FONT,
				fontWeight: 'bold',
				fontSize: 38,
				color: TINTA,
			}}
		>
			<LogoWA />
			<span>¡Obvio que voy! · 2 personas</span>
		</div>
	);
};

const LogoWA: React.FC<{s?: number}> = ({s = 64}) => (
	<svg width={s} height={s} viewBox="-32 -32 64 64" style={{flex: 'none'}}>
		<circle r={30} fill={WA} />
		<path d="M-14 16 L-11 6 A15 15 0 1 1 -4 13 Z" fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
		<path d="M-6 -6 Q-6 6 6 6" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
	</svg>
);

// Escena 5: confirmaciones que llegan
const CONFIRMAN: {txt: string; x: number; y: number; t: number}[] = [
	{txt: 'Tía Marta · va', x: 150, y: 400, t: 15.0},
	{txt: 'Juli · van 2', x: 530, y: 560, t: 15.35},
	{txt: 'Primo Nico · va', x: 130, y: 760, t: 15.7},
	{txt: 'Abuela Rosa · va', x: 470, y: 930, t: 16.05},
];
const Confirmaciones: React.FC<{t: number}> = ({t}) => {
	if (t < 14.9 || t > 17.5) return null;
	const out = 1 - ramp(t, 17.15, 17.45);
	return (
		<>
			{CONFIRMAN.map((c, i) => {
				const p = pop(t, c.t, 10);
				if (p <= 0) return null;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: c.x,
							top: c.y + (1 - p) * 40,
							transform: `scale(${p})`,
							opacity: out,
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							padding: '16px 26px 16px 18px',
							borderRadius: 30,
							background: '#DCF8C6',
							boxShadow: '0 14px 30px rgba(58,42,32,0.22)',
							fontFamily: FONT,
							fontWeight: 'bold',
							fontSize: 38,
							color: TINTA,
							whiteSpace: 'nowrap',
						}}
					>
						<svg width={44} height={44} viewBox="-22 -22 44 44">
							<circle r={20} fill={VERDE_C} />
							<path d="M-9 1 L-3 7 L10 -7" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						{c.txt}
					</div>
				);
			})}
		</>
	);
};

// Escena 6: rótulo del tipo de evento
const Rotulo: React.FC<{t: number}> = ({t}) => {
	if (t < 18.4 || t >= ABANICO) return null;
	const txt = t < GIRO1 + GIRO_D / 2 ? '15 años' : t < GIRO2 + GIRO_D / 2 ? 'casamientos' : 'baby shower';
	const t0 = t < GIRO1 + GIRO_D / 2 ? 18.44 : t < GIRO2 + GIRO_D / 2 ? GIRO1 + GIRO_D / 2 : GIRO2 + GIRO_D / 2;
	const p = pop(t, t0, 10);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 290 - (1 - p) * 50, display: 'flex', justifyContent: 'center', opacity: Math.min(1, p * 2)}}>
			<div style={{padding: '14px 40px', borderRadius: 50, background: NARANJA, color: '#fff', fontFamily: FONT, fontWeight: 'bold', fontSize: 52, transform: `scale(${0.8 + 0.2 * p})`, boxShadow: '0 12px 28px rgba(242,96,46,0.35)'}}>
				{txt}
			</div>
		</div>
	);
};

// Escena 7: cierre con logo, «link en la bio» y @zainsoft_
const CTA_T0 = 22.6;
const Cierre: React.FC<{t: number}> = ({t}) => {
	if (t < CTA_T0 || t > VUELTA + 0.1) return null;
	const logo = pop(t, CTA_T0 + 0.05, 11);
	const link = pop(t, CTA_T0 + 0.6, 10);
	const ig = pop(t, CTA_T0 + 1.2, 10);
	const out = 1 - ramp(t, VUELTA - 0.3, VUELTA);
	const flecha = Math.sin((t - CTA_T0) * 7) * 10;
	return (
		<SceneSvg>
			<g opacity={out}>
				<g transform={`translate(492 520) scale(${0.7 + 0.3 * logo})`} opacity={Math.min(1, logo * 2)}>
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
				<g transform={`translate(540 800) scale(${link})`}>
					<rect x={-300} y={-70} width={600} height={140} rx={70} fill={NARANJA} />
					<text x={36} y={22} fontSize={66} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fill="#fff">
						link en la bio
					</text>
					<g transform={`translate(-222 ${-4 - Math.abs(flecha)})`} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
						<path d="M0 28 V-26 M-22 -6 L0 -28 L22 -6" />
					</g>
				</g>
				<g transform={`translate(540 960) scale(${ig})`}>
					<text x={0} y={20} fontSize={60} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fill={TINTA}>
						@zainsoft_
					</text>
				</g>
				<g transform={`translate(540 1090) scale(${ig})`} opacity={0.75}>
					<text x={0} y={14} fontSize={40} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fill={TINTA}>
						invitaciones web para tu evento
					</text>
				</g>
			</g>
		</SceneSvg>
	);
};

// ───────────────────────── Subtítulos
type W = {text: string; startMs: number; endMs: number};
const norm = (s: string) => s.toLowerCase().replace(/[¿?¡!.,:;]/g, '');
const FUNC = new Set(['de', 'que', 'y', 'en', 'un', 'una', 'el', 'la', 'los', 'a', 'por', 'te', 'se', 'le', 'es', 'no', 'lo', 'tu', 'con', 'o', 'para', 'desde', 'hasta', 'sin']);
const VERDES = new Set(['whatsapp']);
const NARANJAS = new Set(['web', 'quince', 'casamientos', 'baby', 'showers', 'link', 'bio', 'imprime']);

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
				return {t: n, color: VERDES.has(n) ? VERDE_C : NARANJAS.has(n) ? NARANJA : TINTA};
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
		if (/[.?,:!]$/.test(w.raw) || !nxt || cur.length >= 4 || antesDeYO || (lleno && !FUNC.has(norm(w.raw)))) flush();
	});
	out.forEach((c, i) => {
		const n = out[i + 1];
		c.e = n && n.s - c.e < 0.45 ? n.s : c.e + 0.2;
	});
	return out;
})();

const SUB_Y = 1280;
const Subtitulos: React.FC<{t: number}> = ({t}) => {
	const cue = CUES.find((c) => t >= c.s && t < c.e);
	if (!cue) return null;
	const p = spring({frame: (t - cue.s) * FPS, fps: FPS, config: {damping: 11, stiffness: 220}});
	const len = cue.words.map((w) => w.t).join(' ').length;
	const size = Math.max(56, Math.min(88, 88 - Math.max(0, len - 13) * 2.4));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: SUB_Y, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{position: 'absolute', width: 720, height: 130, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.45), rgba(255,255,255,0) 70%)'}} />
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
const S_BIT = 0.32;
const BIT_FLOOR = 1650;
const BIT_X: [number, number][] = [
	[0, 250], [14.7, 250], [15.3, 540], [17.2, 540], [17.8, 250], [21.4, 250], [22.0, 540], [VUELTA - 0.1, 540], [VUELTA + 0.6, 250],
];
const GEST: [number, Gesture][] = [
	[0, 'point'], [2.4, 'rest'], [3.7, 'point'], [6.6, 'rest'], [8.6, 'point'], [10.4, 'rest'],
	[15.3, 'celebrate'], [17.0, 'rest'], [18.3, 'point'], [20.5, 'rest'], [21.6, 'think'], [22.7, 'point'], [VUELTA - 0.2, 'rest'], [27.0, 'point'],
];
const BLINKS = [1.9, 5.8, 9.4, 13.1, 16.6, 19.9, 23.4, 26.0];

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
	{t: 1.42, f: 'poof.aac', v: 0.1, d: 25},
	{t: 2.6, f: 'Paper in Air.aac', v: 0.14, d: 45},
	{t: 2.75, f: 'flash.aac', v: 0.06, d: 40},
	{t: 7.3, f: 'poof.aac', v: 0.08, d: 20},
	{t: 8.5, f: 'poof.aac', v: 0.08, d: 20},
	{t: 9.5, f: 'poof.aac', v: 0.08, d: 20},
	{t: 11.3, f: 'Marker.aac', v: 0.05, d: 25},
	{t: 12.75, f: 'Marker.aac', v: 0.05, d: 32},
	{t: 14.02, f: 'poof.aac', v: 0.1, d: 25},
	{t: 14.12, f: 'flash.aac', v: 0.06, d: 40},
	...CONFIRMAN.map((c) => ({t: c.t, f: 'poof.aac', v: 0.07, d: 20})),
	{t: GIRO1, f: 'Spinning.aac', v: 0.06, d: 15},
	{t: GIRO2, f: 'Spinning.aac', v: 0.06, d: 15},
	{t: ABANICO, f: 'flash.aac', v: 0.07, d: 40},
	{t: CTA_T0 + 0.05, f: 'flash.aac', v: 0.08, d: 40},
	{t: VUELTA + 0.15, f: 'Stone motion.aac', v: 0.07, d: 20},
];

export const TarjetasReel: React.FC = () => {
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
				<CelularPrincipal t={t} />
				<Abanico t={t} />
				<NoSeImprime t={t} />
				<Insignia t={t} a={7.3} b={8.2} y={612} k="reloj" />
				<Insignia t={t} a={8.5} b={9.2} y={760} k="pin" />
				<Insignia t={t} a={9.5} b={10.75} y={760} k="regalo" />
				<MensajeWA t={t} />
				<Confirmaciones t={t} />
				<Rotulo t={t} />
				<Cierre t={t} />
				<BitLayer t={t} frame={frame} />
				<Subtitulos t={t} />
			</AbsoluteFill>

			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', background: `rgba(245,239,230,${0.003 + (frame % 2) * 0.004})`}} />
		</AbsoluteFill>
	);
};
