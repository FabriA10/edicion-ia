import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {BitRig, BitRigPose} from './bit/BitRig';
import {Gesture, blendGestures, blinkAt, kf, mouthFrom} from './bit/bitMotion';
import amplitudes from './octubre/amplitud.json';
import palabras from './octubre/palabras.json';

// Reel informativo "Octubre Negro": Bit explica la ola de ciberataques de octubre 2026
// en lenguaje simple y cierra con lo que hace ZainSoft. Guion: cosas de mi video/guion-voz-octubre-negro.md
// Voz: public/bit_voz_octubre_edit.wav (pausas largas recortadas) reproducida a 1,18x.

const {fontFamily: TITULO} = loadInterTight('normal', {weights: ['600', '800', '900'], subsets: ['latin']});
const {fontFamily: MONO} = loadMono('normal', {weights: ['500', '700'], subsets: ['latin']});

export const OCTUBRE_FRAMES = 1800; // 60 s
const FPS = 30;
const VOICE_AT = 0.3;
const VOICE_RATE = 1.18;
const NARANJA = '#F2602E';
const ROJO = '#FF3B30';
const FONDO = '#0B0B0C';
const CREMA = '#F3EEE6'; // estilo claro de la marca (último video de ZainSoft)
const TINTA = '#141414';
const GRIS = '#8C8C93';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const lerp = (t: number, a: number[], b: number[], e: (n: number) => number = ease) => interpolate(t, a, b, {...clamp, easing: e});

const limpia = (w: string) => w.toLowerCase().replace(/[¿?¡!.,:]/g, '');
const at = (palabra: string, desde = 0) => palabras.find((w) => w.s >= desde && limpia(w.t).startsWith(limpia(palabra)))?.s ?? desde;
const VOICE_END = palabras[palabras.length - 1].e;

// ─── Bloques (atados a la voz)
const T = {
	gancho: 0,
	ia: at('Hackers') - 0.1,
	empresas: at('Con', at('descanso')) - 0.1,
	falla: at('Al', at('horas')) - 0.1,
	japon: at('Japón') - 0.25,
	argentina: at('Y', at('noche')) - 0.1,
	consejos: at('¿Hay') - 0.1,
	zainsoft: at('Y', at('seguridad')) - 0.1,
	cierre: at('¿Arrancamos') - 0.1,
	fin: 60,
};
const ORDEN: (keyof typeof T)[] = ['gancho', 'ia', 'empresas', 'falla', 'japon', 'argentina', 'consejos', 'zainsoft', 'cierre', 'fin'];
const rango = (k: keyof typeof T): [number, number] => [T[k], T[ORDEN[ORDEN.indexOf(k) + 1]]];

// ─── Bit: dónde está en cada bloque y qué gesto hace
type Spot = [t: number, x: number, y: number, s: number, flip: boolean];
const SPOTS: Spot[] = [
	[0, 540, 1780, 0.42, false],
	[T.ia, 830, 1780, 0.42, true],
	[T.argentina, 250, 1780, 0.42, false],
	[T.consejos, 830, 1780, 0.42, true],
	[T.zainsoft, 250, 1780, 0.42, false],
	[T.cierre, 960, 1860, 0.38, true],
];
const HOP = 0.45;
const GESTOS: [number, Gesture][] = [
	[0, 'rest'],
	[at('octubre') - 0.1, 'point'],
	[T.ia, 'think'],
	[T.empresas, 'point'],
	[at('millones') - 0.1, 'celebrate'],
	[at('millones') + 0.9, 'think'],
	[T.japon, 'point'],
	[T.argentina, 'rest'],
	[at('15') - 0.1, 'point'],
	[T.consejos, 'think'],
	[at('No.', at('pánico')) - 0.05, 'wave'],
	[at('Pero', at('pánico')), 'point'],
	[at('Mantener'), 'point'],
	[T.zainsoft, 'rest'],
	[at('ZainSoft') - 0.1, 'celebrate'],
	[at('También', at('ZainSoft')), 'point'],
	[T.cierre, 'rest'],
	[VOICE_END + 0.1, 'wave'],
];

// ─── Contactos reales de ZainSoft
const CONTACTOS: {icono: 'ig' | 'fb' | 'web'; texto: string}[] = [
	{icono: 'ig', texto: '@zainsoft_'},
	{icono: 'fb', texto: 'ZainSoft'},
	{icono: 'web', texto: 'zainsoft.sofdev.workers.dev'},
];

// ─── Piezas
const Pop: React.FC<{t: number; at: number; children: React.ReactNode; dy?: number; style?: React.CSSProperties}> = ({t, at: t0, children, dy = 26, style}) => {
	const {fps} = useVideoConfig();
	const s = spring({frame: (t - t0) * fps, fps, config: {damping: 11, stiffness: 200, mass: 0.7}});
	if (t < t0 - 0.02) return <span style={{...style, opacity: 0}}>{children}</span>;
	return <span style={{display: 'inline-block', opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * dy}px)`, ...style}}>{children}</span>;
};

const Mono: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = GRIS, size = 26, style}) => (
	<div style={{fontFamily: MONO, fontWeight: 500, fontSize: size, letterSpacing: size * 0.12, textTransform: 'uppercase', color, ...style}}>{children}</div>
);

const Titulo: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({children, size = 96, style}) => (
	<div style={{fontFamily: TITULO, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: -size * 0.03, ...style}}>{children}</div>
);

const Logo: React.FC<{size: number; dark?: boolean}> = ({size, dark}) => (
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
			<span style={{color: dark ? TINTA : '#fff'}}>Zain</span>
			<span style={{color: NARANJA}}>Soft</span>
		</div>
	</div>
);

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

// captura de la noticia como tarjeta que entra con rebote
const Tarjeta: React.FC<{t: number; at: number; src: string; width: number; rot?: number; style?: React.CSSProperties}> = ({t, at: t0, src, width, rot = 0, style}) => {
	const {fps} = useVideoConfig();
	const s = spring({frame: (t - t0) * fps, fps, config: {damping: 13, stiffness: 160}});
	if (t < t0) return null;
	return (
		<Img
			src={staticFile(src)}
			style={{
				position: 'absolute',
				width,
				borderRadius: 22,
				border: '1px solid rgba(255,255,255,0.18)',
				boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
				opacity: s,
				transform: `translateY(${(1 - s) * 80}px) rotate(${rot * s}deg) scale(${0.9 + 0.1 * s})`,
				...style,
			}}
		/>
	);
};

const Contador: React.FC<{t: number; desde: number; hasta: number; valor: number; fmt?: (n: number) => string}> = ({t, desde, hasta, valor, fmt = (n) => Math.round(n).toLocaleString('es-AR')}) => (
	<>{fmt(lerp(t, [desde, hasta], [0, valor], Easing.out(Easing.cubic)))}</>
);

// ─── Composición
export const OctubreNegroReel: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const mouth = t < VOICE_END - 0.05 ? mouthFrom(amplitudes, frame) : 0;
	const blink = blinkAt(t, [2.4, 6.6, 10.9, 15.2, 19.8, 24.4, 29.1, 33.5, 37.9, 42.7, 47.0, 51.8, 56.1, 58.7]);

	// visible + animación de entrada/salida por bloque
	const escena = (k: keyof typeof T) => {
		const [a, b] = rango(k);
		const inK = lerp(t, [a, a + 0.25], [0, 1]);
		const outK = lerp(t, [b - 0.05, b + 0.15], [1, 0]);
		return {on: t >= a - 0.02 && t <= b + 0.16, style: {opacity: Math.min(inK, outK), transform: `translateY(${(1 - inK) * 30}px) scale(${1.03 - inK * 0.03})`}};
	};

	// ── Bit
	let iS = 0;
	for (let k = 0; k < SPOTS.length; k++) if (t >= SPOTS[k][0]) iS = k;
	const cur = SPOTS[iS];
	const prev = SPOTS[Math.max(0, iS - 1)];
	const hp = iS === 0 ? 1 : Math.min(1, (t - cur[0]) / HOP);
	const hpE = ease(hp);
	const bx = prev[1] + (cur[1] - prev[1]) * hpE;
	let by = prev[2] + (cur[2] - prev[2]) * hpE - Math.sin(hp * Math.PI) * (iS === 0 ? 0 : 170);
	const bs = prev[3] + (cur[3] - prev[3]) * hpE;
	const flip = hp < 0.5 ? prev[4] : cur[4];
	const land = iS === 0 ? 0 : kf(t - cur[0], [[HOP - 0.02, 0], [HOP + 0.08, 1], [HOP + 0.25, -0.3], [HOP + 0.4, 0]], (n) => n);
	const inAir = hp > 0 && hp < 1;
	by += lerp(t, [0.2, 0.8], [520, 0], Easing.out(Easing.back(1.4)));
	const g0 = blendGestures(GESTOS, t);
	const g = flip ? {...g0, L: {x: -g0.R.x, y: g0.R.y}, R: {x: -g0.L.x, y: g0.L.y}, look: {x: -g0.look.x, y: g0.look.y}} : g0;
	// susto con el "Octubre Negro" y con los millones
	const susto = Math.max(lerp(t, [at('octubre') - 0.05, at('octubre') + 0.15, at('octubre') + 0.9], [0, 1, 0]), lerp(t, [at('millones') - 0.05, at('millones') + 0.1, at('millones') + 0.7], [0, 1, 0]));
	const breathe = Math.sin(t * 2.4);
	const jump = (g.jump * 60) / bs;
	const pose: BitRigPose = {
		bodyY: breathe * 5 - mouth * 14 - jump + (inAir ? -20 : 0) - susto * 40,
		sx: 1 + land * 0.09 - susto * 0.04,
		sy: (1 - land * 0.13) * (1 + breathe * 0.012) + susto * 0.08,
		lean: Math.sin(t * 5.5) * 2.5 * mouth,
		mouth: Math.max(mouth, susto * 0.8),
		effort: 0,
		blink,
		look: g.look,
		antenna: Math.sin(t * 7) * (3 + 8 * mouth) + (inAir ? 18 : 0) - land * 10 + susto * 25 * Math.sin(t * 40),
		handsFront: g.front,
		handL: inAir ? {x: -400, y: -620} : susto > 0.2 ? {x: -330, y: -780} : {x: g.L.x, y: g.L.y - jump},
		handR: inAir ? {x: 400, y: -620} : susto > 0.2 ? {x: 330, y: -780} : {x: g.R.x, y: g.R.y - jump},
		footL: inAir ? {x: -110, y: -60} : {x: -150, y: -jump},
		footR: inAir ? {x: 110, y: -60} : {x: 150, y: -jump},
	};

	const sG = escena('gancho');
	const sIA = escena('ia');
	const sEmp = escena('empresas');
	const sFalla = escena('falla');
	const sJap = escena('japon');
	const sArg = escena('argentina');
	const sCons = escena('consejos');
	const sZS = escena('zainsoft');
	const sCierre = escena('cierre');

	// tono de alerta: rojo en las noticias, se apaga en los consejos
	const alerta = lerp(t, [0.3, 1.0], [0, 1]) * lerp(t, [T.consejos, T.consejos + 0.6], [1, 0]);
	const pulso = 0.75 + Math.sin(t * 4) * 0.25;
	// dramático → simple: al decir "No." todo pasa al estilo claro de la marca
	const claro = lerp(t, [at('No.', at('pánico')) - 0.1, at('No.', at('pánico')) + 0.5], [0, 1]);
	// temblor de cámara en los golpes del principio
	const golpe = (t0: number, f = 1) => lerp(t, [t0, t0 + 0.05, t0 + 0.5], [0, f, 0]);
	const shake = golpe(at('octubre')) * 1.4 + golpe(at('millones')) + golpe(at('2000')) * 0.6 + golpe(at('15')) * 0.6;
	const camT = `translate(${Math.sin(t * 61) * 14 * shake}px, ${Math.cos(t * 53) * 10 * shake}px)`;
	const flash = golpe(at('octubre') - 0.02, 0.55);
	const glitch = lerp(t, [at('octubre') - 0.05, at('octubre') + 0.05, at('octubre') + 0.6], [0, 1, 0.15]);

	return (
		<AbsoluteFill style={{background: FONDO, overflow: 'hidden', color: '#fff'}}>
			<AbsoluteFill style={{background: CREMA, opacity: claro}} />
			<AbsoluteFill style={{background: `radial-gradient(ellipse 70% 45% at 50% 0%, rgba(242,96,46,${0.22 * claro}), transparent 70%)`}} />
			<Sequence from={Math.round(VOICE_AT * FPS)}>
				<Audio src={staticFile('bit_voz_octubre_edit.wav')} playbackRate={VOICE_RATE} volume={1.33} />
			</Sequence>

			{/* grilla + resplandor de alerta */}
			<AbsoluteFill
				style={{
					backgroundImage:
						`linear-gradient(rgba(${claro > 0.5 ? '0,0,0,0.05' : '255,255,255,0.035'}) 1px, transparent 1px), linear-gradient(90deg, rgba(${claro > 0.5 ? '0,0,0,0.05' : '255,255,255,0.035'}) 1px, transparent 1px)`,
					backgroundSize: '60px 60px',
					backgroundPosition: `0 ${(t * 12) % 60}px`,
				}}
			/>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% 38%, rgba(255,59,48,${0.28 * alerta * pulso}), transparent 70%)`}} />
			{/* viñeta y líneas de escaneo en la parte dramática */}
			<AbsoluteFill style={{opacity: 1 - claro, background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.65) 100%)'}} />
			<AbsoluteFill style={{opacity: (1 - claro) * 0.35, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 6px)'}} />
			<div style={{position: 'absolute', inset: 0, transform: camT}}>

			{/* ═══ 1 · GANCHO ═══ */}
			{sG.on && (
				<AbsoluteFill style={sG.style}>
					<div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center'}}>
						<Pop t={t} at={0.3}>
							<Mono color={ROJO} size={30}>
								⚠ Alerta global de ciberseguridad
							</Mono>
						</Pop>
					</div>
					<div style={{position: 'absolute', top: 420, left: 0, right: 0, textAlign: 'center'}}>
						<Titulo size={300} style={{letterSpacing: -14}}>
							<Contador t={t} desde={0.4} hasta={at('horas')} valor={48} />
						</Titulo>
						<Pop t={t} at={at('horas')}>
							<Titulo size={84}>HORAS</Titulo>
						</Pop>
					</div>
					<div style={{position: 'absolute', top: 870, left: 70, right: 70, textAlign: 'center'}}>
						<Pop t={t} at={at('año')}>
							<Titulo size={54} style={{fontWeight: 800, color: '#ddd'}}>
								= lo que pasa en <span style={{color: ROJO}}>un año entero</span>
							</Titulo>
						</Pop>
					</div>
					{t >= at('octubre') - 0.05 && (
						<div style={{position: 'absolute', top: 1040, left: 0, right: 0, textAlign: 'center'}}>
							<Pop t={t} at={at('octubre') - 0.05}>
								<div style={{position: 'relative'}}>
									{[
										['#00E5FF', -1],
										[ROJO, 1],
									].map(([c, d]) => (
										<Titulo key={c as string} size={128} style={{position: 'absolute', left: 0, right: 0, color: c as string, opacity: 0.8 * glitch, transform: `translate(${(d as number) * 10 * glitch}px, ${(d as number) * -4 * glitch}px)`}}>
											OCTUBRE NEGRO
										</Titulo>
									))}
									<Titulo size={128} style={{position: 'relative'}}>
										OCTUBRE NEGRO
									</Titulo>
								</div>
							</Pop>
						</div>
					)}
				</AbsoluteFill>
			)}

			{/* ═══ 2a · HACKERS + IA ═══ */}
			{sIA.on && (
				<AbsoluteFill style={sIA.style}>
					<div style={{position: 'absolute', top: 300, left: 70, right: 70}}>
						<Pop t={t} at={at('Hackers')}>
							<Mono color={ROJO}>Qué pasó</Mono>
						</Pop>
						<Titulo size={104} style={{marginTop: 14}}>
							<Pop t={t} at={at('Hackers')}>Hackers</Pop> <Pop t={t} at={at('inteligencia')} style={{color: ROJO}}>+ IA</Pop>
						</Titulo>
					</div>
					{/* "empleados" que trabajan solos */}
					<div style={{position: 'absolute', top: 640, left: 70, right: 70, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22}}>
						{Array.from({length: 12}).map((_, i) => {
							const t0 = at('empleados') + i * 0.09;
							const s = spring({frame: (t - t0) * fps, fps, config: {damping: 12, stiffness: 220}});
							const prog = ((t * 0.9 + i * 0.37) % 1) * 100;
							return (
								<div key={i} style={{background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.45)', borderRadius: 20, padding: '16px 0 14px', textAlign: 'center', opacity: t < t0 ? 0 : s, transform: `scale(${0.6 + 0.4 * s})`}}>
									<div style={{fontSize: 56}}>🤖</div>
									<div style={{margin: '10px 18px 0', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.12)'}}>
										<div style={{width: `${prog}%`, height: '100%', borderRadius: 3, background: ROJO}} />
									</div>
								</div>
							);
						})}
					</div>
					<div style={{position: 'absolute', top: 1250, left: 0, right: 0, textAlign: 'center'}}>
						<Pop t={t} at={at('solos')}>
							<Mono color="#fff" size={30}>
								Trabajan solos · <span style={{color: ROJO}}>24/7</span>
							</Mono>
						</Pop>
					</div>
				</AbsoluteFill>
			)}

			{/* ═══ 2b · +2.000 EMPRESAS ═══ */}
			{sEmp.on && (
				<AbsoluteFill style={sEmp.style}>
					<div style={{position: 'absolute', top: 300, left: 70, right: 70}}>
						<Mono color={ROJO}>En cuestión de horas</Mono>
						<Titulo size={210} style={{color: ROJO, marginTop: 6}}>
							+<Contador t={t} desde={at('intentaron')} hasta={at('empresas')} valor={2000} />
						</Titulo>
						<Pop t={t} at={at('empresas')}>
							<Titulo size={72}>empresas atacadas</Titulo>
						</Pop>
					</div>
					<Tarjeta t={t} at={at('cuestión')} src="octubre/c_microsoft.png" width={620} rot={-3} style={{left: 90, top: 820}} />
				</AbsoluteFill>
			)}

			{/* ═══ 2c · FALLA → MILLONES ═══ */}
			{sFalla.on && (
				<AbsoluteFill style={sFalla.style}>
					<div style={{position: 'absolute', top: 300, left: 70, right: 70}}>
						<Pop t={t} at={at('falla')}>
							<Mono color={ROJO}>Una falla en la base de la mayoría de las webs</Mono>
						</Pop>
						<Titulo size={96} style={{marginTop: 14}}>
							<Pop t={t} at={at('intentos')}>Intentos de ataque</Pop>
						</Titulo>
					</div>
					{t < at('intentos') + 0.1 && <Tarjeta t={t} at={at('falla') - 0.1} src="octubre/c_cloudflare.png" width={760} rot={-2} style={{left: 160, top: 640, opacity: lerp(t, [at('intentos') - 0.15, at('intentos') + 0.1], [1, 0])}} />}
					{/* barras: miles → millones */}
					<div style={{position: 'absolute', left: 70, right: 70, top: 600, height: 560, display: 'flex', alignItems: 'flex-end', gap: 24, opacity: lerp(t, [at('intentos'), at('intentos') + 0.25], [0, 1])}}>
						{[
							['miles', 0.06, at('miles')],
							['decenas de miles', 0.16, at('miles') + 0.35],
							['cientos de miles', 0.42, at('millones') - 0.35],
							['millones', 1, at('millones')],
						].map(([label, h, t0]) => {
							const k = lerp(t, [t0 as number, (t0 as number) + 0.45], [0, 1], Easing.out(Easing.back(1.2)));
							const top = label === 'millones';
							return (
								<div key={label as string} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'}}>
									<div style={{width: '100%', height: `${(h as number) * 440 * k}px`, minHeight: k > 0 ? 8 : 0, borderRadius: 14, background: top ? ROJO : 'rgba(255,255,255,0.25)', boxShadow: top ? `0 0 50px ${ROJO}88` : undefined}} />
									<div style={{marginTop: 14, height: 70, fontFamily: MONO, fontSize: 22, textAlign: 'center', color: top ? '#fff' : GRIS, opacity: k}}>{label as string}</div>
								</div>
							);
						})}
					</div>
					<div style={{position: 'absolute', top: 1210, left: 0, right: 0, textAlign: 'center'}}>
						<Pop t={t} at={at('tarde')}>
							<Titulo size={60} style={{fontWeight: 800}}>
								…en <span style={{color: ROJO}}>una tarde</span>
							</Titulo>
						</Pop>
					</div>
				</AbsoluteFill>
			)}

			{/* ═══ 2d · JAPÓN ═══ */}
			{sJap.on && (
				<AbsoluteFill style={sJap.style}>
					<div style={{position: 'absolute', top: 300, left: 70, right: 70}}>
						<Pop t={t} at={at('Japón')}>
							<Mono color={ROJO}>🇯🇵 Japón · gobierno</Mono>
						</Pop>
						<Titulo size={92} style={{marginTop: 14}}>
							<Pop t={t} at={at('pidió')}>"Arreglen</Pop> <Pop t={t} at={at('arreglaran')}>sus webs</Pop>{' '}
							<Pop t={t} at={at('noche')} style={{color: ROJO}}>
								esta noche."
							</Pop>
						</Titulo>
					</div>
					<Tarjeta t={t} at={at('gobierno')} src="octubre/c_japon.png" width={640} rot={2} style={{left: 220, top: 760}} />
				</AbsoluteFill>
			)}

			{/* ═══ 3 · ARGENTINA ═══ */}
			{sArg.on && (
				<AbsoluteFill style={sArg.style}>
					<div style={{position: 'absolute', top: 300, left: 70, right: 70}}>
						<Pop t={t} at={at('lejano')}>
							<Mono color={ROJO}>Y no es algo lejano</Mono>
						</Pop>
						<Pop t={t} at={at('Argentina')} style={{display: 'block', marginTop: 14}}>
							<Titulo size={96}>📍 Argentina</Titulo>
						</Pop>
					</div>
					<div style={{position: 'absolute', top: 560, left: 70, right: 70, display: 'flex', alignItems: 'baseline', gap: 26}}>
						<Titulo size={280} style={{color: ROJO, letterSpacing: -12, opacity: lerp(t, [at('15') - 0.25, at('15') - 0.1], [0, 1])}}>
							<Contador t={t} desde={at('15') - 0.2} hasta={at('15') + 0.4} valor={15} />
						</Titulo>
						<Pop t={t} at={at('organizaciones')}>
							<Titulo size={60} style={{fontWeight: 800}}>
								organizaciones
								<br />
								de salud atacadas
							</Titulo>
						</Pop>
					</div>
					<Tarjeta t={t} at={at('atacadas')} src="octubre/c_crowdstrike.png" width={560} rot={-2} style={{left: 400, top: 900}} />
				</AbsoluteFill>
			)}

			{/* ═══ 4 · QUÉ HACER ═══ */}
			{sCons.on && (
				<AbsoluteFill style={{...sCons.style, color: claro > 0.5 ? TINTA : '#fff'}}>
					<div style={{position: 'absolute', top: 300, left: 70, right: 70}}>
						<Titulo size={96}>
							<Pop t={t} at={at('¿Hay')}>¿Pánico?</Pop>{' '}
							<Pop t={t} at={at('No.', at('pánico'))} style={{color: '#3DDC84'}}>
								No.
							</Pop>
						</Titulo>
					</div>
					{t < at('Tres') - 0.05 ? (
						// tu web es como tu local: la puerta sin llave
						<div style={{position: 'absolute', left: 190, top: 560, width: 700, height: 640, opacity: lerp(t, [at('Pero', at('pánico')), at('Pero', at('pánico')) + 0.3], [0, 1])}}>
							<svg width={700} height={640} viewBox="0 0 700 640">
								{/* toldo */}
								{Array.from({length: 7}).map((_, i) => (
									<path key={i} d={`M ${i * 100} 120 h 100 v 50 q -50 30 -100 0 z`} fill={i % 2 ? '#fff' : NARANJA} />
								))}
								<rect x={0} y={60} width={700} height={64} rx={10} fill="#1d1e23" />
								<text x={350} y={104} textAnchor="middle" fontFamily={TITULO} fontWeight={900} fontSize={38} fill="#fff">
									TU WEB
								</text>
								{/* frente */}
								<rect x={20} y={170} width={660} height={470} fill="#17181c" stroke="rgba(255,255,255,0.15)" strokeWidth={3} />
								<rect x={60} y={230} width={250} height={200} rx={10} fill="#22242a" stroke="rgba(255,255,255,0.15)" strokeWidth={3} />
								{/* puerta que se abre */}
								<rect x={400} y={260} width={220} height={380} fill="#0b0b0c" />
								<g transform={`translate(400 260) scale(${lerp(t, [at('puerta'), at('puerta') + 0.4], [1, 0.45])} 1)`}>
									<rect width={220} height={380} fill={NARANJA} stroke="#000" strokeWidth={4} />
									<circle cx={190} cy={200} r={10} fill="#111" />
								</g>
								{/* alguien la prueba */}
								{t > at('probar') - 0.1 && (
									<g opacity={lerp(t, [at('probar') - 0.1, at('probar') + 0.2], [0, 1])}>
										<text x={510} y={470} textAnchor="middle" fontSize={120}>
											👀
										</text>
									</g>
								)}
							</svg>
							<div style={{textAlign: 'center', marginTop: 10}}>
								<Pop t={t} at={at('puerta')}>
									<Mono color={ROJO} size={28}>
										Puerta sin llave
									</Mono>
								</Pop>
							</div>
						</div>
					) : (
						<div style={{position: 'absolute', top: 560, left: 70, right: 70}}>
							<Pop t={t} at={at('Tres')}>
								<Mono color={TINTA} size={30}>
									3 cosas simples
								</Mono>
							</Pop>
							<div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 26}}>
								{[
									['🔄', 'Mantené todo actualizado', at('Mantener')],
									['🔑', 'Contraseñas fuertes + verificación en 2 pasos', at('contraseñas')],
									['💾', 'Tené una copia de seguridad', at('copia')],
								].map(([ic, txt, t0]) => {
									const s = spring({frame: (t - (t0 as number)) * fps, fps, config: {damping: 13, stiffness: 190}});
									return (
										<div
											key={txt as string}
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: 26,
												background: 'rgba(255,255,255,0.75)',
												border: '1.5px solid rgba(0,0,0,0.08)',
												boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
												borderRadius: 28,
												padding: '26px 30px',
												opacity: t < (t0 as number) ? 0 : s,
												transform: `translateX(${(1 - s) * -60}px)`,
											}}
										>
											<div style={{fontSize: 60}}>{ic}</div>
											<div style={{flex: 1, fontFamily: TITULO, fontWeight: 800, fontSize: 44, lineHeight: 1.15}}>{txt}</div>
											<div style={{width: 58, height: 58, borderRadius: 29, background: '#3DDC84', color: '#0b0b0c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, transform: `scale(${lerp(t, [(t0 as number) + 0.35, (t0 as number) + 0.6], [0, 1], Easing.out(Easing.back(2)))})`}}>✓</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</AbsoluteFill>
			)}

			{/* ═══ 5 · ZAINSOFT ═══ */}
			{sZS.on && (
				<AbsoluteFill style={{...sZS.style, color: TINTA}}>
					<div style={{position: 'absolute', left: -260, top: -380, width: 1600, transform: `rotate(-12deg) translateY(${-(t - T.zainsoft) * 40}px)`, display: 'flex', gap: 26, opacity: 0.2}}>
						{[0, 1, 2, 3].map((col) => (
							<div key={col} style={{display: 'flex', flexDirection: 'column', gap: 26, marginTop: col % 2 ? 160 : 0}}>
								{[0, 1, 2].map((row) => (
									<Img key={row} src={staticFile(`pierina_shots/${((col * 3 + row) % 8) + 1}.jpg`)} style={{width: 340, borderRadius: 22}} />
								))}
							</div>
						))}
					</div>
					<AbsoluteFill style={{background: `radial-gradient(ellipse 75% 55% at 50% 40%, ${CREMA}F2 35%, ${CREMA}AA 100%)`}} />
					<div style={{position: 'absolute', top: 300, left: 70, right: 70}}>
						<Titulo size={88}>
							<Pop t={t} at={at('web', T.zainsoft)}>Una web</Pop> <Pop t={t} at={at('no', at('web', T.zainsoft))}>no se hace</Pop>{' '}
							<Pop t={t} at={at('olvida')} style={{color: NARANJA}}>
								y se olvida.
							</Pop>
						</Titulo>
					</div>
					<div style={{position: 'absolute', top: 700, left: 70, right: 70}}>
						<Pop t={t} at={at('ZainSoft') - 0.05}>
							<Logo size={120} dark />
						</Pop>
						<div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 20}}>
							{[
								['✓ Hacemos tu web y tu tienda online', at('hacemos')],
								['✓ Y la mantenemos al día', at('mantenerlas')],
							].map(([p, t0]) => (
								<Pop key={p as string} t={t} at={t0 as number}>
									<div style={{border: `2px solid ${NARANJA}`, borderRadius: 999, padding: '16px 32px', fontFamily: TITULO, fontWeight: 800, fontSize: 40}}>{p}</div>
								</Pop>
							))}
						</div>
						<Pop t={t} at={at('mantenerlas') + 0.2} style={{display: 'block', marginTop: 34}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'}}>
								{['Relevamiento', 'Diseño', 'Desarrollo', 'Implementación', 'Mantenimiento'].map((e, i) => (
									<React.Fragment key={e}>
										{i > 0 && <span style={{color: '#B5B0A8', fontFamily: MONO, fontSize: 20}}>→</span>}
										<span style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: 1, padding: '6px 12px', borderRadius: 999, background: i === 4 ? NARANJA : 'rgba(0,0,0,0.06)', color: i === 4 ? '#fff' : '#5A5650'}}>
											{e.toUpperCase()}
										</span>
									</React.Fragment>
								))}
							</div>
						</Pop>
						<Pop t={t} at={at('vender')} style={{marginTop: 46}}>
							<Titulo size={76}>
								Vos: <span style={{color: NARANJA}}>vendé.</span>
							</Titulo>
						</Pop>
					</div>
				</AbsoluteFill>
			)}

			{/* ═══ 6 · CIERRE ═══ */}
			{sCierre.on && (
				<AbsoluteFill style={{...sCierre.style, color: TINTA}}>
					<AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(242,96,46,0.18), transparent 58%)`}} />
					<div style={{position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						<Pop t={t} at={T.cierre}>
							<Logo size={130} dark />
						</Pop>
						<div style={{marginTop: 60, textAlign: 'center'}}>
							<Titulo size={98}>
								<Pop t={t} at={at('¿Arrancamos')}>¿Arrancamos</Pop>
								<br />
								<span style={{color: NARANJA}}>
									<Pop t={t} at={at('la', at('¿Arrancamos'))}>la</Pop> <Pop t={t} at={at('tuya')}>tuya?</Pop>
								</span>
							</Titulo>
						</div>
						<Pop t={t} at={at('Escribinos')} style={{marginTop: 54}}>
							<div style={{background: NARANJA, borderRadius: 999, padding: '20px 46px', fontFamily: TITULO, fontWeight: 800, fontSize: 46, boxShadow: '0 14px 40px rgba(242,96,46,0.45)'}}>Escribinos por DM</div>
						</Pop>
						<div style={{marginTop: 46, display: 'flex', flexDirection: 'column', gap: 18}}>
							{CONTACTOS.map((c, i) => (
								<Pop key={c.icono} t={t} at={VOICE_END + 0.1 + i * 0.3} dy={20}>
									<div style={{display: 'flex', alignItems: 'center', gap: 20, background: '#fff', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 999, padding: '12px 34px 12px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)'}}>
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

			</div>
			<AbsoluteFill style={{background: ROJO, opacity: flash, mixBlendMode: 'screen'}} />

			{/* Bit */}
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				<defs>
					{/* resplandor blanco muy difuminado pegado a la silueta: separa la mitad negra del fondo negro */}
					<filter id="bitResplandor" x="-80%" y="-80%" width="260%" height="260%">
						<feMorphology in="SourceAlpha" operator="dilate" radius={30} result="grueso" />
						<feGaussianBlur in="grueso" stdDeviation={70} result="difuso" />
						<feFlood floodColor="#ffffff" floodOpacity={0.11} />
						<feComposite in2="difuso" operator="in" />
					</filter>
				</defs>
				<ellipse cx={bx} cy={by + 6 + (inAir ? Math.sin(hp * Math.PI) * 170 : 0)} rx={(118 * bs) / 0.4} ry={(16 * bs) / 0.4} fill="#000" opacity={(inAir ? 0.25 : 0.6) * (1 - claro * 0.6)} />
				{claro < 1 && (
					<g transform={`translate(${bx} ${by}) scale(${bs})`} filter="url(#bitResplandor)" opacity={1 - claro}>
						<BitRig pose={pose} />
					</g>
				)}
				<g transform={`translate(${bx} ${by}) scale(${bs})`}>
					<BitRig pose={pose} />
				</g>
			</svg>
		</AbsoluteFill>
	);
};
