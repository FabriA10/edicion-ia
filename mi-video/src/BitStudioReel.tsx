import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {BitRig, BitRigPose} from './bit/BitRig';
import {Gesture, blendGestures, blinkAt, kf, mouthFrom} from './bit/bitMotion';
import amplitudes from './bit-studio/amplitud.json';
import palabras from './bit-studio/palabras.json';

// Reel estilo "Presentamos Se7en Studio" (referencias/analisis-se7en-studio.md):
// fondo negro con grilla, titulares grotescos, un solo acento naranja, Bit como hilo conductor
// y Pierina Glow como caso real. Voz: public/bit_voz_v2.mp3.

const {fontFamily: TITULO} = loadInterTight('normal', {weights: ['600', '800', '900'], subsets: ['latin']});
const {fontFamily: MONO} = loadMono('normal', {weights: ['500', '700'], subsets: ['latin']});

export const BIT_STUDIO_FRAMES = 1590; // 53 s
// la voz termina en "¿Tu marca es la próxima?" (después decía "a zainsoft punto dev", que no es nuestra cuenta,
// y "por DM a zainsoft" va de corrido, sin pausa donde cortar). El "Escribinos por DM" queda escrito.
const VOICE_END = 49.05;
// contactos reales de ZainSoft (cierre)
const CONTACTOS: {icono: 'ig' | 'fb' | 'web'; texto: string}[] = [
	{icono: 'ig', texto: '@zainsoft_'},
	{icono: 'fb', texto: 'ZainSoft'},
	{icono: 'web', texto: 'zainsoft.sofdev.workers.dev'},
];

const Icono: React.FC<{tipo: 'ig' | 'fb' | 'web'; size: number}> = ({tipo, size}) => (
	<svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
		{tipo === 'ig' && (
			<>
				<rect x={6} y={6} width={36} height={36} rx={11} />
				<circle cx={24} cy={24} r={8.5} />
				<circle cx={34.5} cy={13.5} r={1.6} fill="#fff" stroke="none" />
			</>
		)}
		{tipo === 'fb' && (
			<>
				<circle cx={24} cy={24} r={19} />
				<path d="M27.5 15.5h-2.6c-2.4 0-3.9 1.5-3.9 4v3.5h-3.2M21 23v14.5M21 23h6.3" />
			</>
		)}
		{tipo === 'web' && (
			<>
				<circle cx={24} cy={24} r={18} />
				<ellipse cx={24} cy={24} rx={7.5} ry={18} />
				<path d="M7 18h34M7 30h34" />
			</>
		)}
	</svg>
);
const FPS = 30;
const VOICE_AT = 0.4;
const NARANJA = '#F2602E';
const FONDO = '#0B0B0C';
const GRIS = '#8C8C93';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const lerp = (t: number, a: number[], b: number[], e: (n: number) => number = ease) => interpolate(t, a, b, {...clamp, easing: e});

// momento en que Bit dice una palabra (primera aparición desde "desde")
const limpia = (w: string) => w.toLowerCase().replace(/[¿?¡!.,]/g, '');
const at = (palabra: string, desde = 0) => palabras.find((w) => w.s >= desde && limpia(w.t).startsWith(limpia(palabra)))?.s ?? desde;

// ─── Bloques
const B = {
	gancho: [0, 4.55],
	dolor: [4.55, 10.5],
	suena: [10.5, 16.25],
	marca: [16.4, 21.55],
	promesa: [21.55, 25.4],
	caso: [25.4, 43.25],
	entrega: [43.25, 47.7],
	cierre: [47.7, 54.67],
} as const;

// ─── Bit: posiciones por bloque (salta de una a otra) y gestos
type Spot = [t: number, x: number, y: number, s: number, flip: boolean];
const SPOTS: Spot[] = [
	[0, 540, 1760, 0.45, false],
	[10.5, 830, 1760, 0.45, true],
	[16.45, 540, 1720, 0.55, false],
	[21.55, 830, 1760, 0.45, true],
	[25.4, 190, 1240, 0.4, false],
	[43.25, 830, 1760, 0.45, true],
	[47.7, 960, 1860, 0.38, true],
];
const HOP = 0.45;

const GESTOS: [number, Gesture][] = [
	[0, 'rest'],
	[1.6, 'wave'],
	[3.0, 'rest'],
	[4.55, 'think'],
	[10.6, 'think'],
	[16.4, 'wave'],
	[18.6, 'rest'],
	[21.6, 'point'],
	[25.5, 'point'],
	[28.1, 'think'],
	[29.3, 'point'],
	[35.8, 'celebrate'],
	[37.4, 'point'],
	[42.0, 'rest'],
	[46.29, 'celebrate'],
	[47.8, 'rest'],
	[49.3, 'wave'],
];

// ─── Caso Pierina: tarjetas (tiempos atados a la voz)
type Card = {from: number; num: string; texto: string; pills: string[]; clips: {at: number; src: number; rate?: number}[]};
const CARDS: Card[] = [
	{from: 25.4, num: '', texto: 'Tienda online de indumentaria femenina.', pills: ['Catálogo', 'Pedidos por WhatsApp', 'Autogestionable'], clips: [{at: 25.4, src: 2.6}]},
	{from: 28.05, num: '01', texto: 'Filtros por categoría y talle: encuentran todo al toque.', pills: ['Categorías', 'Talles', 'Búsqueda'], clips: [{at: 28.05, src: 72.6}]},
	{from: 32.4, num: '02', texto: 'Stock real y guía de medidas para no pifiarle.', pills: ['Stock en vivo', 'Guía de talles'], clips: [{at: 32.4, src: 22.4}, {at: 33.6, src: 30.2}]},
	{from: 35.75, num: '03', texto: 'El pedido llega armado directo al WhatsApp.', pills: ['Carrito', 'Pedido por WhatsApp'], clips: [{at: 35.75, src: 45.0, rate: 0.6}, {at: 37.3, src: 55.2}]},
	{from: 39.05, num: '04', texto: 'La dueña sube prendas y cambia precios sola.', pills: ['Panel propio', 'Precios al instante', 'Botón de arrepentimiento ✓'], clips: [{at: 39.05, src: 75.0}]},
];

// ─── Utilidades de escena
const useEnter = (t: number, [a, b]: readonly [number, number]) => {
	const inK = lerp(t, [a, a + 0.25], [0, 1]);
	const outK = lerp(t, [b, b + 0.18], [1, 0]);
	return {visible: t >= a - 0.02 && t <= b + 0.2, style: {opacity: Math.min(inK, outK), transform: `translateY(${(1 - inK) * 30}px) scale(${1.03 - inK * 0.03})`}};
};

const Pop: React.FC<{t: number; at: number; children: React.ReactNode; dy?: number; style?: React.CSSProperties}> = ({t, at: t0, children, dy = 26, style}) => {
	const {fps} = useVideoConfig();
	const s = spring({frame: (t - t0) * fps, fps, config: {damping: 11, stiffness: 200, mass: 0.7}});
	if (t < t0 - 0.02) return <span style={{...style, opacity: 0}}>{children}</span>;
	return <span style={{display: 'inline-block', opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * dy}px)`, ...style}}>{children}</span>;
};

// palabras que aparecen cuando Bit las dice
const Dicho: React.FC<{t: number; texto: string; desde: number; color?: (w: string) => string | undefined}> = ({t, texto, desde, color}) => {
	let cursor = desde;
	return (
		<>
			{texto.split(' ').map((w, i) => {
				const s = at(w.replace(/[¿?.,]/g, ''), cursor - 0.05);
				cursor = s + 0.01;
				return (
					<React.Fragment key={i}>
						<Pop t={t} at={s} style={{color: color?.(w)}}>
							{w}
						</Pop>{' '}
					</React.Fragment>
				);
			})}
		</>
	);
};

const Mono: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = GRIS, size = 26, style}) => (
	<div style={{fontFamily: MONO, fontWeight: 500, fontSize: size, letterSpacing: size * 0.12, textTransform: 'uppercase', color, ...style}}>{children}</div>
);

const Logo: React.FC<{size: number}> = ({size}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * 0.22, fontFamily: TITULO, fontWeight: 900}}>
		<div
			style={{
				width: size,
				height: size,
				borderRadius: size * 0.24,
				background: '#16171B',
				border: '3px solid rgba(255,255,255,0.12)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: size * 0.56,
				letterSpacing: -size * 0.04,
			}}
		>
			<span style={{color: '#fff'}}>Z</span>
			<span style={{color: NARANJA}}>S</span>
		</div>
		<div style={{fontSize: size * 0.52, letterSpacing: -size * 0.015}}>
			<span style={{color: '#fff'}}>Zain</span>
			<span style={{color: NARANJA}}>Soft</span>
		</div>
	</div>
);

// Grabación de la tienda, entera dentro de la pantalla (sin barras del Android)
const REC = {w: 576, h: 1155, top: 50, full: 1280};
const Grabacion: React.FC<{clips: {from: number; to: number; src: number; rate?: number}[]; w: number; h: number}> = ({clips, w, h}) => {
	const sc = Math.min(w / REC.w, h / REC.h);
	const cw = REC.w * sc;
	const ch = REC.h * sc;
	return (
		<AbsoluteFill style={{background: '#0b0b0d'}}>
			<div style={{position: 'absolute', left: (w - cw) / 2, top: (h - ch) / 2, width: cw, height: ch, overflow: 'hidden', background: '#fff'}}>
				{clips.map((c, i) => (
					<Sequence key={i} from={Math.round(c.from * FPS)} durationInFrames={Math.max(1, Math.round((c.to - c.from) * FPS))} layout="none">
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
		</AbsoluteFill>
	);
};

// ─── Composición
export const BitStudioReel: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	// después del corte de voz Bit no mueve la boca: solo saluda
	const mouth = t < VOICE_END - 0.05 ? mouthFrom(amplitudes, frame) : 0;
	const blink = blinkAt(t, [2.6, 6.9, 11.9, 15.1, 20.2, 27.3, 31.6, 37.0, 41.4, 45.0, 49.6, 53.2]);

	// ── Bit: posición con saltos entre bloques
	let iS = 0;
	for (let k = 0; k < SPOTS.length; k++) if (t >= SPOTS[k][0]) iS = k;
	const cur = SPOTS[iS];
	const prev = SPOTS[Math.max(0, iS - 1)];
	const hp = iS === 0 ? 1 : Math.min(1, (t - cur[0]) / HOP);
	const hpE = ease(hp);
	let bx = prev[1] + (cur[1] - prev[1]) * hpE;
	let by = prev[2] + (cur[2] - prev[2]) * hpE - Math.sin(hp * Math.PI) * (iS === 0 ? 0 : 170);
	const bs = prev[3] + (cur[3] - prev[3]) * hpE;
	const flip = hp < 0.5 ? prev[4] : cur[4];
	const land = iS === 0 ? 0 : kf(t - cur[0], [[HOP - 0.02, 0], [HOP + 0.08, 1], [HOP + 0.25, -0.3], [HOP + 0.4, 0]], (n) => n);
	const inAir = hp > 0 && hp < 1;
	// entrada: asoma desde abajo
	by += lerp(t, [0.9, 1.5], [520, 0], Easing.out(Easing.back(1.4)));

	const g0 = blendGestures(GESTOS, t);
	// mirando a la izquierda: se espeja el gesto, no el cuerpo (la mitad naranja queda siempre a la derecha)
	const g = flip ? {...g0, L: {x: -g0.R.x, y: g0.R.y}, R: {x: -g0.L.x, y: g0.L.y}, look: {x: -g0.look.x, y: g0.look.y}} : g0;
	const dolor = lerp(t, [4.6, 5.2], [0, 1]) * lerp(t, [10.3, 10.6], [1, 0]);
	const breathe = Math.sin(t * 2.4);
	const jump = (g.jump * 60) / bs;
	const pose: BitRigPose = {
		bodyY: breathe * 5 - mouth * 14 - jump + (inAir ? -20 : 0),
		sx: 1 + land * 0.09,
		sy: (1 - land * 0.13) * (1 + breathe * 0.012),
		lean: Math.sin(t * 5.5) * 2.5 * mouth + Math.sin(t * 31) * 3 * dolor,
		mouth,
		effort: dolor * 0.7,
		blink,
		look: dolor > 0.1 ? {x: Math.sin(t * 3) * 0.8, y: -0.8} : g.look,
		antenna: Math.sin(t * 7) * (3 + 8 * mouth + 10 * dolor) + (inAir ? 18 : 0) - land * 10,
		handsFront: g.front,
		handL: inAir ? {x: -400, y: -620} : {x: g.L.x, y: g.L.y - jump},
		handR: inAir ? {x: 400, y: -620} : {x: g.R.x, y: g.R.y - jump},
		footL: inAir ? {x: -110, y: -60} : {x: -150, y: -jump},
		footR: inAir ? {x: 110, y: -60} : {x: 150, y: -jump},
	};

	// ── Reloj (gancho → dolor)
	const relojTop = lerp(t, [4.55, 5.0], [760, 300]);
	const relojSize = lerp(t, [4.55, 5.0], [230, 140]);
	const medianoche = t >= at('12') - 0.1;
	const relojFlip = lerp(t, [at('12') - 0.1, at('12') + 0.15], [0, 1]);

	// ── Escenas
	const sGancho = useEnter(t, B.gancho);
	const sDolor = useEnter(t, B.dolor);
	const sSuena = useEnter(t, B.suena);
	const sMarca = useEnter(t, B.marca);
	const sPromesa = useEnter(t, B.promesa);
	const sCaso = useEnter(t, B.caso);
	const sEntrega = useEnter(t, B.entrega);
	const sCierre = useEnter(t, [B.cierre[0], 99]);

	// barrido naranja antes de la marca
	const wipeIn = lerp(t, [16.0, 16.22], [100, 0], Easing.in(Easing.cubic));
	const wipeOut = lerp(t, [16.32, 16.6], [0, -100], Easing.out(Easing.cubic));

	// caso: tarjeta activa
	let iC = 0;
	for (let k = 0; k < CARDS.length; k++) if (t >= CARDS[k].from) iC = k;
	const card = CARDS[iC];
	const cardK = spring({frame: (t - card.from) * fps, fps, config: {damping: 14, stiffness: 170}});
	const clipsCaso: {from: number; to: number; src: number; rate?: number}[] = [];
	CARDS.forEach((c, i) =>
		c.clips.forEach((cl, j) => clipsCaso.push({from: cl.at, to: c.clips[j + 1]?.at ?? CARDS[i + 1]?.from ?? B.caso[1] + 0.3, src: cl.src, rate: cl.rate})),
	);
	const punch = CARDS.reduce((acc, c) => acc + lerp(t, [c.from, c.from + 0.1, c.from + 0.45], [0, 0.04, 0], (n) => n), 0);
	const casoProg = lerp(t, [B.caso[0], B.caso[1]], [0, 1], (n) => n);

	// notificaciones del dolor (la más nueva arriba)
	const NOTIS: {at: number; txt: string; mia?: boolean}[] = [
		{at: 5.0, txt: 'hola! buenas 👋'},
		{at: 6.07, txt: 'te paso fotos y precios por acá 🙏', mia: true},
		{at: at('¿Precio', 6), txt: '¿precio?'},
		{at: at('talle', 7), txt: '¿tenés talle M?'},
		{at: at('¿Hacen', 8), txt: '¿hacen envíos?'},
		{at: 9.95, txt: '¿y el envío cuánto sale?'},
		{at: 10.2, txt: '???'},
	];
	const notisVis = NOTIS.filter((n) => t >= n.at);

	// tipeo del "¿te suena?"
	const FRASE = 'Respondo lo mismo 50 veces por día y nadie ve todo lo que tengo.';
	const tipeo = Math.floor(lerp(t, [at('Respondés', 10), at('tenés.', 14) + 0.3], [0, FRASE.length], (n) => n));

	return (
		<AbsoluteFill style={{background: FONDO, overflow: 'hidden', color: '#fff'}}>
			<Sequence from={Math.round(VOICE_AT * FPS)} durationInFrames={Math.round((VOICE_END - VOICE_AT) * FPS)}>
				<Audio src={staticFile('bit_voz_v2.mp3')} volume={(f) => 1.4 * interpolate(f, [(VOICE_END - VOICE_AT) * FPS - 3, (VOICE_END - VOICE_AT) * FPS], [1, 0], clamp)} />
			</Sequence>

			{/* grilla de fondo */}
			<AbsoluteFill
				style={{
					backgroundImage:
						'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
					backgroundSize: '60px 60px',
					backgroundPosition: `0 ${(t * 12) % 60}px`,
				}}
			/>

			{/* ═══ 1 · GANCHO ═══ */}
			{sGancho.visible && (
				<AbsoluteFill style={sGancho.style}>
					<div style={{position: 'absolute', top: 470, left: 60, right: 60, textAlign: 'center', fontFamily: TITULO, fontWeight: 800, fontSize: 66, lineHeight: 1.08, letterSpacing: -1.5}}>
						<Dicho t={t} desde={0} texto="¿Tenés una marca de ropa y tus clientas no saben dónde comprarte?" color={(w) => (['dónde', 'comprarte?'].includes(w) ? NARANJA : undefined)} />
					</div>
				</AbsoluteFill>
			)}

			{/* reloj 23:59 → 00:00 */}
			{t < B.dolor[1] + 0.2 && (
				<div
					style={{
						position: 'absolute',
						top: relojTop,
						left: 0,
						right: 0,
						textAlign: 'center',
						fontFamily: TITULO,
						fontWeight: 900,
						fontSize: relojSize,
						letterSpacing: -relojSize * 0.04,
						opacity: lerp(t, [0.25, 0.6], [0, 1]) * lerp(t, [B.dolor[1], B.dolor[1] + 0.2], [1, 0]),
						color: medianoche ? NARANJA : '#fff',
						transform: `scale(${1 + Math.sin(relojFlip * Math.PI) * 0.12})`,
					}}
				>
					{medianoche ? '00' : '23'}
					<span style={{opacity: Math.floor(t * 2) % 2 ? 0.25 : 1}}>:</span>
					{medianoche ? '00' : '59'}
				</div>
			)}

			{/* ═══ 2 · DOLOR: mensajes que se apilan ═══ */}
			{sDolor.visible && (
				<AbsoluteFill style={sDolor.style}>
					<div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontFamily: TITULO, fontWeight: 600, fontSize: 34, color: GRIS}}>
						<Dicho t={t} desde={4.5} texto="y seguís contestando" />
					</div>
					<div style={{position: 'absolute', top: 560, left: 70, right: 70, display: 'flex', flexDirection: 'column', gap: 18}}>
						{[...notisVis].reverse().map((n) => {
							const s = spring({frame: (t - n.at) * fps, fps, config: {damping: 13, stiffness: 190}});
							return n.mia ? (
								<div
									key={n.txt}
									style={{
										alignSelf: 'flex-end',
										background: NARANJA,
										borderRadius: 28,
										padding: '20px 28px',
										fontFamily: TITULO,
										fontWeight: 600,
										fontSize: 34,
										transform: `translateY(${(1 - s) * -40}px) scale(${0.9 + 0.1 * s})`,
										opacity: s,
									}}
								>
									{n.txt}
									<div style={{fontSize: 20, opacity: 0.75, textAlign: 'right', marginTop: 4}}>00:00 ✓✓</div>
								</div>
							) : (
								<div
									key={n.txt}
									style={{
										display: 'flex',
										gap: 20,
										alignItems: 'center',
										background: 'rgba(38,38,42,0.92)',
										border: '1px solid rgba(255,255,255,0.08)',
										borderRadius: 30,
										padding: '20px 24px',
										transform: `translateY(${(1 - s) * -60}px) scale(${0.92 + 0.08 * s})`,
										opacity: s,
										boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
									}}
								>
									<div style={{width: 64, height: 64, borderRadius: 16, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0}}>💬</div>
									<div style={{flex: 1}}>
										<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: TITULO, fontWeight: 600, fontSize: 24, color: GRIS}}>
											<span>WhatsApp · clienta</span>
											<span>ahora</span>
										</div>
										<div style={{fontFamily: TITULO, fontWeight: 600, fontSize: 36, marginTop: 4}}>{n.txt}</div>
									</div>
								</div>
							);
						})}
					</div>
				</AbsoluteFill>
			)}

			{/* ═══ 3 · ¿TE SUENA? ═══ */}
			{sSuena.visible && (
				<AbsoluteFill style={sSuena.style}>
					{/* manchas de color */}
					{[
						['#6D3CFF', 300, 620, 0],
						['#2F6BFF', 760, 760, 1.7],
						[NARANJA, 520, 980, 3.1],
					].map(([c, x, y, ph], i) => (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: (x as number) - 330 + Math.sin(t * 0.9 + (ph as number)) * 60,
								top: (y as number) - 330 + Math.cos(t * 0.7 + (ph as number)) * 60,
								width: 660,
								height: 660,
								borderRadius: '50%',
								background: c as string,
								filter: 'blur(140px)',
								opacity: 0.55,
							}}
						/>
					))}
					<div style={{position: 'absolute', top: 520, left: 70, right: 70}}>
						<Pop t={t} at={at('suena', 10)} style={{display: 'block'}}>
							<div style={{fontFamily: TITULO, fontWeight: 900, fontSize: 92, letterSpacing: -2, marginBottom: 34}}>¿Te suena?</div>
						</Pop>
						<div
							style={{
								background: 'rgba(22,22,26,0.9)',
								border: '1px solid rgba(255,255,255,0.12)',
								borderRadius: 34,
								padding: '30px 34px 92px',
								position: 'relative',
								boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
							}}
						>
							<Mono size={22}>Lo que pensás</Mono>
							<div style={{fontFamily: TITULO, fontWeight: 600, fontSize: 44, lineHeight: 1.3, marginTop: 14, minHeight: 172}}>
								{FRASE.slice(0, tipeo)}
								<span style={{color: NARANJA, opacity: Math.floor(t * 3) % 2 ? 0 : 1}}>|</span>
							</div>
							<div style={{position: 'absolute', right: 26, bottom: 22, width: 60, height: 60, borderRadius: 30, background: '#fff', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900}}>↑</div>
						</div>
					</div>
				</AbsoluteFill>
			)}

			{/* ═══ 4 · MARCA ═══ */}
			{sMarca.visible && (
				<AbsoluteFill style={sMarca.style}>
					{/* grilla inclinada con capturas de Pierina */}
					<div style={{position: 'absolute', left: -260, top: -380, width: 1600, transform: `rotate(-12deg) translateY(${-(t - 16.4) * 40}px)`, display: 'flex', gap: 26, opacity: 0.32}}>
						{[0, 1, 2, 3].map((col) => (
							<div key={col} style={{display: 'flex', flexDirection: 'column', gap: 26, marginTop: col % 2 ? 160 : 0}}>
								{[0, 1, 2].map((row) => (
									<Img key={row} src={staticFile(`pierina_shots/${((col * 3 + row) % 8) + 1}.jpg`)} style={{width: 340, borderRadius: 22, border: '1px solid rgba(255,255,255,0.15)'}} />
								))}
							</div>
						))}
					</div>
					<AbsoluteFill style={{background: `radial-gradient(ellipse 70% 45% at 50% 40%, ${FONDO}EE 30%, ${FONDO}88 100%)`}} />
					<div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center'}}>
						{t < at('ZainSoft', 16) - 0.05 ? (
							<Pop t={t} at={at('Tranqui', 16)}>
								<div style={{fontFamily: TITULO, fontWeight: 900, fontSize: 104, letterSpacing: -2.5}}>Tranqui.</div>
							</Pop>
						) : (
							<>
								<Pop t={t} at={at('ZainSoft', 16) - 0.05}>
									<div style={{display: 'flex', justifyContent: 'center'}}>
										<Logo size={150} />
									</div>
								</Pop>
								<Pop t={t} at={at('tiendas', 18)} style={{display: 'block', marginTop: 36}}>
									<Mono color="#fff" size={30}>
										Tiendas online para marcas
									</Mono>
								</Pop>
							</>
						)}
					</div>
				</AbsoluteFill>
			)}

			{/* ═══ 5 · PROMESA ═══ */}
			{sPromesa.visible && (
				<AbsoluteFill style={sPromesa.style}>
					<div style={{position: 'absolute', top: 470, left: 70, right: 70, fontFamily: TITULO, fontWeight: 900, fontSize: 112, lineHeight: 1.0, letterSpacing: -3.5}}>
						<div>
							<Pop t={t} at={at('Una', 21)}>Una</Pop> <Pop t={t} at={at('tienda', 21.5)}>tienda</Pop>
						</div>
						<div>
							<Pop t={t} at={at('que', 22)}>que</Pop> <Pop t={t} at={at('muestra', 22)}>muestra,</Pop>
						</div>
						<div>
							<Pop t={t} at={at('responde', 23)}>responde</Pop> <Pop t={t} at={at('y', 23.9)}>y</Pop>
						</div>
						<div style={{color: NARANJA, position: 'relative', display: 'inline-block'}}>
							<Pop t={t} at={at('vende', 24)}>vende</Pop> <Pop t={t} at={at('por', 24.3)}>por</Pop> <Pop t={t} at={at('vos', 24.5)}>vos.</Pop>
							<div style={{position: 'absolute', left: 0, bottom: -14, height: 10, borderRadius: 5, background: NARANJA, width: `${lerp(t, [at('vos', 24.5), at('vos', 24.5) + 0.4], [0, 100])}%`}} />
						</div>
					</div>
				</AbsoluteFill>
			)}

			{/* ═══ 6 · CASO PIERINA GLOW ═══ */}
			{sCaso.visible && (
				<AbsoluteFill style={sCaso.style}>
					<div style={{position: 'absolute', top: 240, left: 70, right: 70, display: 'flex', justifyContent: 'space-between'}}>
						<Mono color={NARANJA}>📍 San Andrés, Tucumán</Mono>
						<Mono>{card.num ? `${card.num} / 04` : 'Caso real'}</Mono>
					</div>
					<div style={{position: 'absolute', top: 284, left: 70, fontFamily: TITULO, fontWeight: 900, fontSize: 104, letterSpacing: -3}}>
						<Pop t={t} at={at('Pierina', 25)}>Pierina Glow</Pop>
					</div>
					{/* celular */}
					<div style={{position: 'absolute', left: 420, top: 440, width: 400, height: 800, transform: `scale(${1 + punch})`}}>
						<div style={{position: 'absolute', inset: -14, borderRadius: 62, background: '#0b0b0d', border: '3px solid #3a3a40', boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}} />
						<div style={{position: 'absolute', inset: 0, borderRadius: 50, overflow: 'hidden'}}>
							<Grabacion clips={clipsCaso} w={400} h={800} />
						</div>
						{t > at('WhatsApp', 37) && t < 39.05 && (
							<div
								style={{
									position: 'absolute',
									left: 20,
									right: 20,
									top: 250,
									transform: `scale(${spring({frame: (t - at('WhatsApp', 37)) * fps, fps, config: {damping: 12}})})`,
									background: '#fff',
									color: '#111',
									borderRadius: 24,
									padding: '18px 20px',
									fontFamily: TITULO,
									boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
								}}
							>
								<div style={{fontWeight: 800, fontSize: 24, marginBottom: 10}}>
									<span style={{color: '#25D366'}}>●</span> Nuevo pedido
								</div>
								<div style={{background: '#DCF8C6', borderRadius: 16, padding: '12px 14px', fontSize: 20, fontWeight: 600, lineHeight: 1.45}}>
									¡Hola! Quiero pedir:
									<br />• Top Aurora · talle M
									<br />• Jean Mom Glow · talle 38
								</div>
							</div>
						)}
					</div>
					{/* qué hicimos */}
					<div key={iC} style={{position: 'absolute', top: 1290, left: 70, right: 70, opacity: cardK, transform: `translateY(${(1 - cardK) * 24}px)`}}>
						<Mono>Qué hicimos</Mono>
						<div style={{fontFamily: TITULO, fontWeight: 800, fontSize: 44, lineHeight: 1.15, marginTop: 10, letterSpacing: -0.8}}>{card.texto}</div>
						<div style={{display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap'}}>
							{card.pills.map((p, i) => {
								const s = spring({frame: (t - card.from - 0.15 - i * 0.08) * fps, fps, config: {damping: 12, stiffness: 200}});
								return (
									<div key={p} style={{border: `2px solid ${NARANJA}`, borderRadius: 999, padding: '8px 18px', fontFamily: TITULO, fontWeight: 600, fontSize: 24, transform: `scale(${s})`, opacity: s}}>
										{p}
									</div>
								);
							})}
						</div>
					</div>
					{/* barra de progreso */}
					<div style={{position: 'absolute', left: 70, right: 70, top: 1505, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2}}>
						<div style={{width: `${casoProg * 100}%`, height: '100%', background: NARANJA, borderRadius: 2}} />
					</div>
				</AbsoluteFill>
			)}

			{/* ═══ 7 · ENTREGA ═══ */}
			{sEntrega.visible && (
				<AbsoluteFill style={sEntrega.style}>
					<div style={{position: 'absolute', top: 470, left: 70, right: 70, fontFamily: TITULO, fontWeight: 900, fontSize: 96, lineHeight: 1.05, letterSpacing: -3}}>
						<Pop t={t} at={at('Vos', 43)} style={{display: 'block'}}>
							Vos:
						</Pop>
						<div style={{display: 'flex', gap: 18, margin: '22px 0 50px'}}>
							{[
								['📸 Fotos', at('fotos', 44)],
								['📝 Datos', at('datos', 44.5)],
							].map(([p, s]) => (
								<Pop key={p as string} t={t} at={s as number}>
									<div style={{border: '2px solid rgba(255,255,255,0.5)', borderRadius: 999, padding: '14px 30px', fontSize: 48, fontWeight: 800}}>{p}</div>
								</Pop>
							))}
						</div>
						<Pop t={t} at={at('Del', 45)} style={{display: 'block'}}>
							Nosotros:
						</Pop>
						<Pop t={t} at={at('encargamos', 46)} style={{display: 'block', color: NARANJA}}>
							todo lo demás.
						</Pop>
					</div>
				</AbsoluteFill>
			)}

			{/* ═══ 8 · CIERRE ═══ */}
			{sCierre.visible && (
				<AbsoluteFill style={sCierre.style}>
					<AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(242,96,46,0.32), transparent 58%)`}} />
					<div style={{position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						<Pop t={t} at={47.75}>
							<Logo size={130} />
						</Pop>
						<div style={{marginTop: 60, textAlign: 'center', fontFamily: TITULO, fontWeight: 900, fontSize: 98, lineHeight: 1.02, letterSpacing: -3}}>
							<Pop t={t} at={at('¿Tu', 47.5)}>¿Tu</Pop> <Pop t={t} at={at('marca', 47.8)}>marca</Pop> <Pop t={t} at={at('es', 48)}>es</Pop>
							<br />
							<span style={{color: NARANJA}}>
								<Pop t={t} at={at('la', 48.2)}>la</Pop> <Pop t={t} at={at('próxima', 48.3)}>próxima?</Pop>
							</span>
						</div>
						<Pop t={t} at={49.25} style={{marginTop: 54}}>
							<div style={{background: NARANJA, borderRadius: 999, padding: '20px 46px', fontFamily: TITULO, fontWeight: 800, fontSize: 46, boxShadow: '0 14px 40px rgba(242,96,46,0.45)'}}>Escribinos por DM</div>
						</Pop>
						<div style={{marginTop: 46, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'stretch'}}>
							{CONTACTOS.map((c, i) => (
								<Pop key={c.icono} t={t} at={49.85 + i * 0.35} dy={20}>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 20,
											background: 'rgba(255,255,255,0.06)',
											border: '1.5px solid rgba(255,255,255,0.18)',
											borderRadius: 999,
											padding: '12px 34px 12px 14px',
										}}
									>
										<div style={{width: 62, height: 62, borderRadius: 31, background: NARANJA, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
											<Icono tipo={c.icono} size={38} />
										</div>
										<span style={{fontFamily: MONO, fontWeight: 700, fontSize: c.icono === 'web' ? 30 : 36, letterSpacing: 1}}>{c.texto}</span>
									</div>
								</Pop>
							))}
						</div>
					</div>
				</AbsoluteFill>
			)}

			{/* barrido naranja */}
			{t > 15.95 && t < 16.65 && <AbsoluteFill style={{background: NARANJA, transform: `translateY(${t < 16.3 ? wipeIn : wipeOut}%)`}} />}

			{/* Bit (hilo conductor) */}
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				<ellipse cx={bx} cy={by + 6 + (inAir ? Math.sin(hp * Math.PI) * 170 : 0)} rx={(118 * bs) / 0.4} ry={(16 * bs) / 0.4} fill="#000" opacity={inAir ? 0.25 : 0.6} />
				<g transform={`translate(${bx} ${by}) scale(${bs})`}>
					<BitRig pose={pose} />
				</g>
			</svg>
		</AbsoluteFill>
	);
};
