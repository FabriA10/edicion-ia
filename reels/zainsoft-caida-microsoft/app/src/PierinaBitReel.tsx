import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Easing,
	Img,
	OffthreadVideo,
	Sequence,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';
import amplitudes from './pierina-bit/amplitud.json';
import {FONDO, PANTALLA_ANCHO, PANTALLA_CENTRO, bordeY, cantoY, mesaY, rectAPantalla} from './pierina-bit/fondo';
import {BitRig, BitRigPose, Pt} from './bit/BitRig';
import {Gesture, blendGestures, blinkAt, climbState, kf, landSquash, mouthFrom, walkFeet} from './bit/bitMotion';
import subtitulos from './pierina-bit/subtitulos.json';

const {fontFamily: POPPINS} = loadFont('normal', {weights: ['600', '800'], subsets: ['latin']});

// Corte de voz: se saca desde "Programamos tu tienda a medida…" hasta "…todo lo que te exige la ley." (cuadros 1107–1311 del armado original)
const CUT_FROM = 1107;
const CUT_LEN = 204;
export const PIERINA_BIT_FRAMES = 1710 - CUT_LEN; // ≈50,2 s
const FPS = 30;
const VOICE_OFFSET = 3.5; // Bit habla recién arriba del mostrador
const NARANJA = '#F2602E';
const OSCURO = '#0E0F13';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const lerp = (t: number, a: number[], b: number[], e: (n: number) => number = ease) =>
	interpolate(t, a, b, {...clamp, easing: e});

// ─── Geometría de la foto de fondo (ver pierina-bit/fondo.ts)
// La pantalla de la foto está en perspectiva: la grabación se arma en una caja recta y se deforma a sus 4 esquinas
const PHOTO_BOX = {w: 272, h: 640};
const PHOTO_SCREEN_C = PANTALLA_CENTRO;
const SCREEN_R = 62;
// Escala a la que la pantalla de la foto coincide con el celular del escenario
const STAGE_SCREEN = {w: 470, h: 1045, cx: 540, cy: 735};
const STAGE_SCALE = Math.min(3.2, STAGE_SCREEN.w / PANTALLA_ANCHO);
const SUB_TOP = 1300; // franja de subtítulos: entre el celular y la cabeza de Bit
const BIT_FLOOR = 1730; // pies de Bit en el escenario (queda debajo de los subtítulos)
const STAGE_TOP = STAGE_SCREEN.cy - STAGE_SCREEN.h / 2;

// ─── Tramos de la grabación de la tienda (segundos del reel → segundo de pierina.mp4)
type Clip = {from: number; to: number; src: number; rate?: number};
const CLIPS: Clip[] = [
	{from: 5.9, to: 9.7, src: 2.6},
	{from: 9.7, to: 12.0, src: 10.0},
	{from: 12.0, to: 14.5, src: 72.6},
	{from: 14.5, to: 15.9, src: 17.0, rate: 1.6},
	{from: 15.9, to: 17.6, src: 12.0},
	{from: 17.6, to: 19.0, src: 22.4},
	{from: 19.0, to: 20.8, src: 30.2},
	{from: 20.8, to: 23.2, src: 45.0, rate: 0.6},
	{from: 23.2, to: 27.6, src: 55.2},
	{from: 27.6, to: 31.5, src: 75.0},
	{from: 31.5, to: 34.4, src: 78.0},
	{from: 34.4, to: 40.3, src: 81.0},
	{from: 40.3, to: 43.8, src: 62.4, rate: 0.25},
	{from: 43.8, to: 50.0, src: 2.6},
];

// Carteles de sección arriba del celular
const VERDE = '#00FF88';
const AMARILLO = '#FFE600';
const PILLS: {from: number; to: number; text: string; accent: string}[] = [
	{from: 8.9, to: 9.6, text: '📍 Tucumán', accent: AMARILLO},
	{from: 9.8, to: 11.9, text: 'Tienda online', accent: VERDE},
	{from: 12.0, to: 14.4, text: 'Filtros por categoría y talle', accent: AMARILLO},
	{from: 16.0, to: 17.5, text: 'Fotos por prenda', accent: VERDE},
	{from: 17.6, to: 18.9, text: 'Stock real', accent: AMARILLO},
	{from: 19.0, to: 20.7, text: 'Guía de medidas', accent: VERDE},
	{from: 23.2, to: 27.4, text: 'Pedido directo a WhatsApp', accent: VERDE},
	{from: 27.6, to: 34.2, text: '100 % autogestionable', accent: AMARILLO},
	// el arrepentimiento queda solo en pantalla, con "Del resto, nos encargamos nosotros"
	{from: 47.7, to: 48.9, text: 'Botón de arrepentimiento ✓', accent: VERDE},
	{from: 48.9, to: 50.0, text: 'Cumple la ley ✓', accent: AMARILLO},
];

// Gestos de Bit en el escenario (desde el segundo indicado)
const STAGE_GESTURES: [number, Gesture][] = [
	[0, 'rest'],
	[9.7, 'point'],
	[12.0, 'think'],
	[14.5, 'celebrate'],
	[15.9, 'point'],
	[19.0, 'think'],
	[20.8, 'wave'],
	[23.2, 'celebrate'],
	[27.6, 'point'],
	[31.5, 'celebrate'],
	[34.4, 'think'],
	[40.3, 'point'],
	[45.1, 'rest'],
	[48.3, 'press'],
	[49.2, 'rest'],
	[50.1, 'walk'],
];

// Efectos como detalle sutil: ~-11 dB respecto de la tabla
const SFX_GAIN = 0.28;
const VOICE_GAIN = 1.585; // +4 dB
// Solo dos detalles sutiles: encendido de pantalla y entrada del logo
const SFX: [number, string, number][] = [
	[6.0, 'flash.aac', 0.35],
	[51.5, 'Lightning bolt .aac', 0.3],
];

// Palabras clave del subtítulo
const CLAVE_VERDE = ['Pierina', 'Glow,', 'WhatsApp,', 'medida,', '100 %', 'autogestionable.'];
const CLAVE_AMARILLA = ['Bit,', 'ZainSoft.', 'stock', 'real', 'guía', 'medidas', 'rapidísimo.', 'plantillas', 'arrepentimiento', 'ley.', 'mensaje', 'tuya.'];

// ─── Piezas
const S_BIT = 0.4; // escala de la marioneta

// Marioneta en un SVG del tamaño del cuadro (o del mundo de la foto)
const RigLayer: React.FC<{rx: number; ry: number; scale: number; pose: BitRigPose; shadow: number; shadowColor?: string; children?: React.ReactNode}> = ({
	rx,
	ry,
	scale,
	pose,
	shadow,
	shadowColor = '#2a1306',
	children,
}) => {
	const lift = Math.max(0, -(pose.bodyY ?? 0)) / 40;
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
			<defs>
				<filter id="blurSombra" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="7" />
				</filter>
			</defs>
			<ellipse
				cx={rx}
				cy={ry + 4}
				rx={((115 * scale) / 0.4) * (1 - Math.min(0.5, lift * 0.25))}
				ry={((16 * scale) / 0.4) * (1 - Math.min(0.5, lift * 0.25))}
				fill={shadowColor}
				opacity={0.55 * shadow * (1 - Math.min(0.6, lift * 0.4))}
				filter="url(#blurSombra)"
			/>
			<g transform={`translate(${rx} ${ry}) scale(${scale})`}>
				<BitRig pose={pose} />
			</g>
			{children}
		</svg>
	);
};

const toLocal = (p: Pt, rx: number, ry: number, sc: number): Pt => ({x: (p.x - rx) / sc, y: (p.y - ry) / sc});

// Grabación de la tienda contenida entera en la pantalla (sin barra de estado ni de navegación)
const REC = {w: 576, h: 1155, top: 50, full: 1280};
const ScreenContent: React.FC<{t: number; w: number; h: number}> = ({t, w, h}) => {
	const on = lerp(t, [5.95, 6.25], [0, 1]);
	const sc = Math.min(w / REC.w, h / REC.h);
	const cw = REC.w * sc;
	const ch = REC.h * sc;
	return (
		<AbsoluteFill style={{background: '#0b0b0d', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: (w - cw) / 2, top: (h - ch) / 2, width: cw, height: ch, overflow: 'hidden', background: '#fff'}}>
				{CLIPS.map((c, i) => (
					<Sequence key={i} from={Math.round(c.from * FPS)} durationInFrames={Math.round((c.to - c.from) * FPS)} layout="none">
						<OffthreadVideo
							src={staticFile('pierina.mp4')}
							muted
							trimBefore={Math.round(c.src * FPS)}
							playbackRate={c.rate ?? 1}
							style={{position: 'absolute', left: 0, top: -REC.top * sc, width: cw, height: REC.full * sc}}
						/>
					</Sequence>
				))}
			</div>
			{/* destello de encendido */}
			<AbsoluteFill style={{background: '#fff', opacity: lerp(t, [5.95, 6.05, 6.45], [0, 1, 0])}} />
			{/* pantalla apagada con reflejo */}
			<AbsoluteFill
				style={{
					opacity: 1 - on,
					background: 'linear-gradient(155deg, #1b1d22 0%, #07080a 55%, #15171b 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};

const Pill: React.FC<{text: string; t: number; from: number; to: number; accent: string}> = ({text, t, from, to, accent}) => {
	const {fps} = useVideoConfig();
	const s = spring({frame: (t - from) * fps, fps, config: {damping: 8, stiffness: 190, mass: 0.7}});
	const o = spring({frame: (t - (to - 0.28)) * fps, fps, config: {damping: 20, stiffness: 220}});
	const dot = 1 + Math.sin((t - from) * 8) * 0.18;
	return (
		<div
			style={{
				position: 'absolute',
				left: '50%',
				top: STAGE_TOP + 34,
				transform: `translate(-50%, ${(1 - s) * -50 - o * 40}px) scale(${1 - o * 0.08})`,
				opacity: Math.min(1, s * 1.8) * (1 - o),
				filter: o > 0.01 ? `blur(${o * 10}px)` : undefined,
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				background: 'rgba(12,13,17,0.86)',
				border: `3px solid ${accent}`,
				color: '#fff',
				fontFamily: POPPINS,
				fontWeight: 800,
				fontSize: 40,
				padding: '14px 34px 14px 24px',
				borderRadius: 999,
				whiteSpace: 'nowrap',
				boxShadow: `0 0 34px ${accent}55, 0 14px 30px rgba(0,0,0,0.45)`,
			}}
		>
			<div style={{width: 18, height: 18, borderRadius: 9, background: accent, transform: `scale(${dot})`, boxShadow: `0 0 14px ${accent}`}} />
			{text}
		</div>
	);
};

const Logo: React.FC<{size: number}> = ({size}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * 0.22, fontFamily: POPPINS, fontWeight: 800}}>
		<div
			style={{
				width: size,
				height: size,
				borderRadius: size * 0.24,
				background: '#141519',
				border: '3px solid rgba(255,255,255,0.12)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: size * 0.56,
				letterSpacing: -size * 0.04,
				boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
			}}
		>
			<span style={{color: '#fff'}}>Z</span>
			<span style={{color: NARANJA}}>S</span>
		</div>
		<div style={{fontSize: size * 0.5, letterSpacing: -size * 0.01}}>
			<span style={{color: '#fff'}}>Zain</span>
			<span style={{color: NARANJA}}>Soft</span>
		</div>
	</div>
);

const Subtitulo: React.FC<{t: number}> = ({t}) => {
	const {fps} = useVideoConfig();
	const cue = subtitulos.find((c) => t >= c.start - 0.05 && t < c.end + 0.2);
	// frases recortadas de la voz ("Programamos… línea por línea")
	if (!cue || (cue.start > CUT_FROM / FPS - 0.1 && cue.start < (CUT_FROM + CUT_LEN) / FPS - 0.1)) return null;
	const out = lerp(t, [cue.end + 0.08, cue.end + 0.2], [0, 1]);
	const cueIn = spring({frame: (t - cue.start + 0.05) * fps, fps, config: {damping: 14, stiffness: 180}});
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				top: t >= 51.5 ? 1420 : t < 8.6 ? 1470 : SUB_TOP,
				padding: '14px 80px 22px',
				textAlign: 'center',
				display: 'flex',
				justifyContent: 'center',
				flexWrap: 'wrap',
				gap: '0 18px',
				background: 'radial-gradient(ellipse 32% 42% at 50% 50%, rgba(0,0,0,0.32), transparent 100%)',
				opacity: 1 - out,
				transform: `translateY(${(1 - cueIn) * 20 - out * 18}px)`,
			}}
		>
			{cue.words.map((w, i) => {
				const s = spring({frame: (t - w.s + 0.03) * fps, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
				const color = CLAVE_VERDE.includes(w.t) ? VERDE : CLAVE_AMARILLA.includes(w.t) ? AMARILLO : '#fff';
				const clave = color !== '#fff';
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							fontFamily: 'HandoBold, sans-serif',
							fontWeight: 'bold',
							fontSize: clave ? 74 : 68,
							lineHeight: 1.1,
							color,
							opacity: t >= w.s - 0.03 ? Math.min(1, s * 1.6) : 0,
							transform: `translateY(${(1 - s) * 34}px) scale(${0.45 + 0.55 * s})`,
							transformOrigin: '50% 80%',
							WebkitTextStroke: '11px #0b0b0d',
							paintOrder: 'stroke fill',
							textShadow: clave ? `0 0 26px ${color}88, 0 6px 18px rgba(0,0,0,0.5)` : '0 6px 18px rgba(0,0,0,0.5)',
						}}
					>
						{w.t}
					</span>
				);
			})}
		</div>
	);
};

// ─── Composición
const PierinaBitReelBase: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const mouth = mouthFrom(amplitudes, frame);
	const blink = blinkAt(t, [4.3, 7.9, 11.2, 16.4, 21.7, 26.1, 30.5, 35.8, 39.2, 44.6, 47.3, 55.9]);

	// ── Cámara sobre la foto: plano general → push-in → zoom 2.5D a la pantalla
	const zoomP = lerp(t, [6.6, 8.6], [0, 1], Easing.bezier(0.6, 0, 0.15, 1));
	const sBase = t < 3.5 ? lerp(t, [0, 3.5], [1, 1.1]) : lerp(t, [3.5, 6.6], [1.1, 1.16]);
	const camS = sBase + (STAGE_SCALE - sBase) * zoomP;
	const fBase = {x: t < 3.5 ? lerp(t, [0, 3.5], [540, 480]) : lerp(t, [3.5, 6.6], [480, 470]), y: t < 3.5 ? lerp(t, [0, 3.5], [960, 1090]) : 1090};
	// en el zoom final, el centro de la pantalla de la foto va al centro del celular del escenario
	const targetF = {x: PHOTO_SCREEN_C.x + (540 - STAGE_SCREEN.cx) / STAGE_SCALE, y: PHOTO_SCREEN_C.y + (960 - STAGE_SCREEN.cy) / STAGE_SCALE};
	const camF = {x: fBase.x + (targetF.x - fBase.x) * zoomP, y: fBase.y + (targetF.y - fBase.y) * zoomP};
	const shake = t > 0.98 && t < 1.2 ? Math.sin(t * 90) * 3 : 0;
	const worldT = `translate(${540 - camF.x * camS + shake}px, ${960 - camF.y * camS}px) scale(${camS})`;
	const worldOpacity = lerp(t, [8.3, 8.75], [1, 0]);
	const depthBlur = lerp(t, [6.8, 8.4], [5, 18]);

	// ── Bit sobre el mostrador (marioneta, coordenadas de la foto)
	const CLIMB_AT = 0.6;
	const tc = t - CLIMB_AT;
	const geo = {edge: bordeY, standX: FONDO.parado.x, standY: FONDO.parado.y, scale: S_BIT};
	let w: {rx: number; ry: number; pose: BitRigPose};
	if (tc < 2.45) {
		const c = climbState(tc, geo);
		w = {
			rx: c.rx,
			ry: c.ry,
			pose: {
				lean: c.lean,
				effort: c.effort,
				look: c.look,
				antenna: c.antenna,
				handsFront: c.handsFront,
				blink,
				handL: toLocal(c.handL, c.rx, c.ry, S_BIT),
				handR: toLocal(c.handR, c.rx, c.ry, S_BIT),
				footL: toLocal(c.footL, c.rx, c.ry, S_BIT),
				footR: toLocal(c.footR, c.rx, c.ry, S_BIT),
			},
		};
	} else {
		const land = landSquash(tc - 2.45);
		const breathe = Math.sin((t - 3.05) * 2.4);
		// saltito hasta el celular para prenderlo
		const hop = kf(t, [[5.5, 0], [5.82, 1], [6.2, 0]]);
		const rx = kf(t, [[5.5, FONDO.parado.x], [5.8, FONDO.parado.x + 90]]);
		const ry = mesaY(rx) - hop * 40;
		const g = blendGestures([[0, 'rest'], [3.55, 'wave'], [4.9, 'rest'], [5.55, 'press'], [6.3, 'rest']], t);
		w = {
			rx,
			ry,
			pose: {
				bodyY: breathe * 5 - mouth * 14,
				sx: 1 + land * 0.09,
				sy: (1 - land * 0.13) * (1 + breathe * 0.012),
				lean: Math.sin(t * 5.5) * 2.5 * mouth - hop * 6,
				mouth,
				blink,
				look: g.look,
				antenna: Math.sin(t * 7) * (3 + 8 * mouth) - land * 10 + hop * 10,
				handL: g.L,
				handR: g.R,
				footL: {x: -150, y: -hop * 50},
				footR: {x: 150, y: -hop * 50},
			},
		};
	}
	const worldShadow = kf(tc, [[2.2, 0], [2.45, 1]]);
	const badgeS = spring({frame: (t - 4.75) * fps, fps, config: {damping: 11, stiffness: 160}});
	const badgeOut = lerp(t, [5.45, 5.6], [1, 0]);

	// ── Escenario (celular grande + Bit al costado)
	const stageIn = lerp(t, [8.2, 8.7], [0, 1]);
	// escena de código: el celular se va al fondo
	const codeP = lerp(t, [34.4, 34.9], [0, 1]) * (1 - lerp(t, [36.4, 36.9], [0, 1]));
	const phoneOff = t >= 48.6;
	const offY = lerp(t, [48.6, 48.85], [1, 0.012], Easing.in(Easing.quad));
	const offX = lerp(t, [48.85, 49.05], [1, 0], Easing.in(Easing.quad));
	const stageOut = lerp(t, [49.3, 49.8], [1, 0]);
	const stageBgOut = lerp(t, [51.4, 51.9], [1, 0]);
	const phoneScale = 1 - codeP * 0.42;
	const phoneT = `translate(${codeP * 250}px, ${-codeP * 330}px) scale(${phoneScale})`;
	const punch = [9.7, 12.0, 14.5, 15.9, 17.6, 19.0, 20.8, 23.2, 27.6, 31.5, 43.8].reduce(
		(acc, k) => acc + lerp(t, [k, k + 0.08, k + 0.35], [0, 0.04, 0], (n) => n),
		0,
	);

	// punch-in de cámara (5–10 %): guía de medidas, pedido por WhatsApp y código a medida
	const stageCam =
		1 +
		([
			[9.7, 12.0, 0.07],
			[19.0, 20.7, 0.06],
			[23.6, 27.3, 0.09],
		] as const).reduce((acc, [a, b, k]) => acc + k * kf(t, [[a, 0], [a + 0.45, 1], [b - 0.35, 1], [b, 0]]), 0);

	const sEnter = spring({frame: (t - 8.5) * fps, fps, config: {damping: 12}});
	const sg = blendGestures(STAGE_GESTURES, t);
	const walkK = kf(t, [[50.1, 0], [50.3, 1]]);
	const wc = (t - 50.1) / 0.45;
	const sScale = S_BIT;
	let sX = 135 - (1 - sEnter) * 300;
	if (t >= 50.1) sX = kf(t, [[50.1, 135], [51.7, 640]], (n) => n);
	const wf = walkFeet(wc, walkK, 165, 70);
	const swing = Math.sin(wc * Math.PI * 2) * 45 * walkK;
	const sBreathe = Math.sin(t * 2.4);
	const stagePose: BitRigPose = {
		bodyY: sBreathe * 5 - mouth * 14 + wf.bob - (sg.jump * 60) / sScale,
		sy: 1 + sBreathe * 0.012 - sg.jump * 0.05,
		lean: Math.sin(t * 5.5) * 2.5 * mouth + 5 * walkK,
		mouth,
		blink,
		look: {x: sg.look.x + walkK * 0.7, y: sg.look.y},
		antenna: Math.sin(t * 7) * (3 + 8 * mouth + 6 * walkK + 10 * sg.jump),
		handsFront: sg.front,
		laptop: sg.laptop,
		handL: walkK > 0 ? {x: -330 - swing, y: -250} : {x: sg.L.x, y: sg.L.y - (sg.jump * 60) / sScale},
		handR: walkK > 0 ? {x: 330 + swing, y: -250} : {x: sg.R.x, y: sg.R.y - (sg.jump * 60) / sScale},
		footL: walkK > 0 ? wf.L : {x: -150, y: -(sg.jump * 60) / sScale},
		footR: walkK > 0 ? wf.R : {x: 150, y: -(sg.jump * 60) / sScale},
	};

	// ── Cierre de marca
	const brand = lerp(t, [51.3, 51.9], [0, 1]);
	const logoS = spring({frame: (t - 51.5) * fps, fps, config: {damping: 10, stiffness: 120}});
	const ctaS = spring({frame: (t - 53.0) * fps, fps, config: {damping: 13}});
	const peek = spring({frame: (t - 56.0) * fps, fps, config: {damping: 11}});

	return (
		<AbsoluteFill style={{background: OSCURO, overflow: 'hidden'}}>
			<style>{`
				@font-face {
					font-family: 'HandoBold';
					src: url('${staticFile('Hando.otf')}') format('opentype');
					font-weight: bold;
				}
			`}</style>

			{/* Audio */}
			<Sequence from={Math.round(VOICE_OFFSET * FPS)}>
				<Audio src={staticFile('bit_voz.mp3')} volume={VOICE_GAIN} />
			</Sequence>
			
			{SFX.map(([s, f, v], i) => (
				<Sequence key={i} from={Math.round(s * FPS)} durationInFrames={90}>
					<Audio src={staticFile(f)} volume={v * SFX_GAIN} />
				</Sequence>
			))}

			{/* ═════ MUNDO: foto del local ═════ */}
			{worldOpacity > 0 && (
				<AbsoluteFill style={{opacity: worldOpacity}}>
					<div style={{position: 'absolute', width: 1080, height: 1920, transformOrigin: '0 0', transform: worldT}}>
						{/* pantalla (detrás del hueco de la foto) */}
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								width: PHOTO_BOX.w,
								height: PHOTO_BOX.h,
								transformOrigin: '0 0',
								transform: rectAPantalla(PHOTO_BOX.w, PHOTO_BOX.h),
								borderRadius: 14,
								overflow: 'hidden',
							}}
						>
							<ScreenContent t={t} w={PHOTO_BOX.w} h={PHOTO_BOX.h} />
						</div>
						<Img src={staticFile(FONDO.archivo)} style={{position: 'absolute', width: 1080, height: 1920}} />
						{/* percheros fuera de foco (todo lo de atrás del mostrador menos el celular) */}
						<div
							style={{
								position: 'absolute',
								width: 1080,
								height: 1920,
								WebkitMaskImage: `linear-gradient(to bottom, #000 0, #000 ${FONDO.desenfoqueHasta - 80}px, transparent ${FONDO.desenfoqueHasta}px)`,
							}}
						>
							<Img
								src={staticFile(FONDO.archivo)}
								style={{
									position: 'absolute',
									width: 1080,
									height: 1920,
									filter: `blur(${depthBlur}px)`,
									WebkitMaskImage: `radial-gradient(ellipse ${(FONDO.celular.x2 - FONDO.celular.x1) * 0.62}px ${(FONDO.desenfoqueHasta - FONDO.celular.y1) * 0.95}px at ${PHOTO_SCREEN_C.x}px ${PHOTO_SCREEN_C.y}px, transparent 75%, #000 100%)`,
								}}
							/>
						</div>
						{/* Bit (marioneta) + sombra del mostrador sobre lo que cuelga debajo del canto */}
						<RigLayer rx={w.rx} ry={w.ry} scale={S_BIT} pose={w.pose} shadow={worldShadow}>
							<defs>
								<linearGradient id="bajoMesa" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0" stopColor="#000" stopOpacity="0.15" />
									<stop offset="0.25" stopColor="#000" stopOpacity="0.6" />
									<stop offset="1" stopColor="#000" stopOpacity="0.75" />
								</linearGradient>
							</defs>
							{FONDO.canto && <path d={`M 0 ${cantoY(0)} L 1080 ${cantoY(1080)} L 1080 1920 L 0 1920 Z`} fill="url(#bajoMesa)" />}
						</RigLayer>
						{/* insignia ZainSoft al presentarse */}
						<div
							style={{
								position: 'absolute',
								left: FONDO.parado.x,
								top: FONDO.parado.y - 370,
								transform: `translate(-50%, -100%) scale(${0.45 * badgeS})`,
								transformOrigin: '50% 100%',
								opacity: badgeOut * Math.min(1, badgeS * 2),
								background: 'rgba(14,15,19,0.92)',
								padding: '18px 26px',
								borderRadius: 30,
							}}
						>
							<Logo size={110} />
						</div>
					</div>
					{/* viñeta */}
					<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(0,0,0,0.35) 100%)'}} />
				</AbsoluteFill>
			)}

			{/* ═════ ESCENARIO: celular a pantalla completa ═════ */}
			{stageIn > 0 && t < 51.9 && (
				<AbsoluteFill style={{opacity: stageIn * stageBgOut, transform: `scale(${stageCam})`, transformOrigin: '22% 45%'}}>
					<Img
						src={staticFile(FONDO.archivo)}
						style={{position: 'absolute', width: 1080, height: 1920, transform: 'scale(1.8)', filter: 'blur(28px) brightness(0.45) saturate(1.2)'}}
					/>
					<AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, rgba(242,96,46,0.28), transparent 60%)`}} />

					{/* plantillas genéricas tachadas */}
					{t > 34.7 && t < 37.1 && (
						<AbsoluteFill style={{opacity: lerp(t, [34.7, 34.95], [0, 1]) * lerp(t, [36.8, 37.1], [1, 0])}}>
							{[0, 1, 2].map((i) => {
								const s = spring({frame: (t - 34.75 - i * 0.12) * fps, fps, config: {damping: 12}});
								const x = lerp(t, [35.9 + i * 0.08, 36.1 + i * 0.08], [0, 1]);
								return (
									<div
										key={i}
										style={{
											position: 'absolute',
											left: 70 + i * 320,
											top: 820,
											width: 290,
											height: 420,
											borderRadius: 24,
											background: '#e9e9ec',
											transform: `scale(${s}) rotate(${(i - 1) * 4}deg)`,
											padding: 22,
											boxSizing: 'border-box',
										}}
									>
										<div style={{height: 26, width: '60%', background: '#c9c9cf', borderRadius: 6}} />
										<div style={{height: 150, marginTop: 18, background: '#d6d6dc', borderRadius: 12}} />
										<div style={{height: 18, marginTop: 18, width: '85%', background: '#c9c9cf', borderRadius: 6}} />
										<div style={{height: 18, marginTop: 12, width: '70%', background: '#c9c9cf', borderRadius: 6}} />
										<div style={{position: 'absolute', bottom: 22, left: 22, fontFamily: POPPINS, fontWeight: 800, fontSize: 26, color: '#9a9aa2'}}>PLANTILLA</div>
										<svg width="290" height="420" style={{position: 'absolute', left: 0, top: 0}}>
											<path d="M40 60 L250 360" stroke="#e5343a" strokeWidth="22" strokeLinecap="round" strokeDasharray="370" strokeDashoffset={370 * (1 - x)} />
											<path d="M250 60 L40 360" stroke="#e5343a" strokeWidth="22" strokeLinecap="round" strokeDasharray="370" strokeDashoffset={370 * (1 - x)} />
										</svg>
									</div>
								);
							})}
						</AbsoluteFill>
					)}


					{/* celular */}
					<div
						style={{
							position: 'absolute',
							left: STAGE_SCREEN.cx - STAGE_SCREEN.w / 2,
							top: STAGE_TOP,
							width: STAGE_SCREEN.w,
							height: STAGE_SCREEN.h,
							transform: `${phoneT} scale(${1 + punch})`,
							opacity: (1 - codeP * 0.88) * stageOut,
							filter: codeP > 0 ? `blur(${codeP * 5}px)` : undefined,
						}}
					>
						<div
							style={{
								position: 'absolute',
								inset: -16,
								borderRadius: SCREEN_R + 16,
								background: '#0b0b0d',
								border: '3px solid #b89a6a',
								boxShadow: '0 40px 90px rgba(0,0,0,0.6)',
							}}
						/>
						<div
							style={{
								position: 'absolute',
								inset: 0,
								borderRadius: SCREEN_R,
								overflow: 'hidden',
								background: '#000',
							}}
						>
							<div style={{position: 'absolute', inset: 0, transform: phoneOff ? `scale(${offX}, ${offY})` : undefined}}>
								<ScreenContent t={t} w={STAGE_SCREEN.w} h={STAGE_SCREEN.h} />
								{phoneOff && <AbsoluteFill style={{background: '#fff', opacity: 1 - offY}} />}
							</div>
						</div>
						{/* pedido llegando por WhatsApp */}
						{t > 23.6 && t < 27.5 && (
							<div
								style={{
									position: 'absolute',
									left: 30,
									right: 30,
									top: 330,
									transform: `scale(${spring({frame: (t - 23.6) * fps, fps, config: {damping: 12}})})`,
									opacity: lerp(t, [27.2, 27.5], [1, 0]),
									background: '#fff',
									borderRadius: 26,
									padding: '20px 24px',
									boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
									fontFamily: POPPINS,
								}}
							>
								<div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
									<div style={{width: 44, height: 44, borderRadius: 22, background: '#25D366', color: '#fff', fontWeight: 800, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
									<div style={{fontWeight: 800, fontSize: 26, color: '#111'}}>Nuevo pedido</div>
								</div>
								<div style={{background: '#DCF8C6', borderRadius: 18, padding: '14px 18px', fontSize: 22, color: '#111', lineHeight: 1.45, fontWeight: 600}}>
									¡Hola! Quiero pedir:
									<br />• Top Aurora · talle M
									<br />• Jean Mom Glow · talle 38
									<br />Total: $54.500
								</div>
							</div>
						)}
					</div>


					{/* íconos que vuelan al celular: fotos y datos */}
					{t > 45.0 && t < 47.9 &&
						['📸', '👕', '📝'].map((e, i) => {
							const p = lerp(t, [45.0 + i * 0.35, 45.9 + i * 0.35], [0, 1], Easing.inOut(Easing.cubic));
							const fade = lerp(t, [45.75 + i * 0.35, 45.95 + i * 0.35], [1, 0]);
							return (
								<div
									key={i}
									style={{
										position: 'absolute',
										left: lerp(p, [0, 1], [180, 540], (n) => n),
										top: lerp(p, [0, 1], [1250, 820], (n) => n) - Math.sin(p * Math.PI) * 260,
										fontSize: 110,
										transform: `translate(-50%, -50%) scale(${1.2 - p * 0.7})`,
										opacity: Math.min(lerp(p, [0, 0.1], [0, 1]), fade),
									}}
								>
									{e}
								</div>
							);
						})}

					{/* Bit al costado (marioneta) */}
					<RigLayer rx={sX} ry={BIT_FLOOR} scale={sScale} pose={stagePose} shadow={1} shadowColor="#000" />

					{PILLS.map((p) => (t >= p.from && t <= p.to ? <Pill key={p.text} {...p} t={t} /> : null))}
				</AbsoluteFill>
			)}

			{/* ═════ CIERRE: marca + CTA ═════ */}
			{brand > 0 && (
				<AbsoluteFill style={{opacity: brand, background: `radial-gradient(circle at 50% 38%, #2a1710 0%, ${OSCURO} 62%)`}}>
					<div style={{position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${0.8 + 0.2 * logoS})`, opacity: Math.min(1, logoS * 1.5)}}>
						<Logo size={190} />
					</div>
					<div
						style={{
							position: 'absolute',
							top: 900,
							left: 0,
							right: 0,
							textAlign: 'center',
							fontFamily: POPPINS,
							opacity: ctaS,
							transform: `translateY(${(1 - ctaS) * 40}px)`,
						}}
					>
						<div style={{color: '#fff', fontWeight: 600, fontSize: 50, lineHeight: 1.25}}>
							¿Querés tu tienda online
							<br />a medida?
						</div>
						<div style={{display: 'inline-block', marginTop: 40, background: NARANJA, color: '#fff', fontWeight: 800, fontSize: 52, padding: '20px 46px', borderRadius: 999, boxShadow: '0 14px 40px rgba(242,96,46,0.5)'}}>
							Escribinos por DM 📩
						</div>
						<div style={{marginTop: 34, color: '#fff', fontWeight: 800, fontSize: 60}}>@zainsoft_</div>
					</div>
					{t > 55.95 && (
						<RigLayer
							rx={1180 - 190 * peek}
							ry={1880}
							scale={S_BIT}
							shadow={0}
							pose={{
								lean: -14,
								blink,
								look: {x: -0.8, y: 0},
								antenna: Math.sin(t * 8) * 8,
								handL: {x: -330, y: -250},
								handR: {x: 360 + Math.sin(t * 16) * 40, y: -720},
								footL: {x: -150, y: 0},
								footR: {x: 150, y: 0},
							}}
						/>
					)}
				</AbsoluteFill>
			)}

			{t >= VOICE_OFFSET && <Subtitulo t={t} />}
		</AbsoluteFill>
	);
};

// Versión final: el armado original con la frase de "programar" recortada (voz e imagen cortan juntas)
export const PierinaBitReel: React.FC = () => (
	<AbsoluteFill>
		<Sequence durationInFrames={CUT_FROM}>
			<PierinaBitReelBase />
		</Sequence>
		<Sequence from={CUT_FROM}>
			<Sequence from={-(CUT_FROM + CUT_LEN)}>
				<PierinaBitReelBase />
			</Sequence>
		</Sequence>
	</AbsoluteFill>
);
