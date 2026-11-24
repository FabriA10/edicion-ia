import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import amplitudes from './amplitud.json';
import palabras from './palabras.json';
import {BitRig, BitRigPose} from '../bit/BitRig';
import {blendGestures, blinkAt, mix, mouthFrom, Gesture} from '../bit/bitMotion';

// Reel noticia «Microsoft se cayó un día entero» (ZainSoft). Fondo OSCURO. Datos verificados en BRIEF.md.
// Sin logos oficiales de Microsoft (nombres en tipografía, íconos genéricos); titular de Infobae como cita.
// Logo ZainSoft: ícono original, «Zain» blanco (regla de fondo oscuro). Subtítulos con volumen. Sin rostros humanos.

const FPS = 30;
const FONDO = '#0E0F13';
const NARANJA = '#F2602E';
const ROJO = '#EF4444';
const VERDE = '#00FF88';
const AMARILLO = '#FFE600';
const BLANCO = '#F5F5F4';
const GRIS = '#9AA0AC';
const PANEL = '#18181B';
const PANEL2 = '#232329';
const LOGO_TINTA = '#14151A';
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
	const microsoft = at('microsoft');
	const dia = at('día', microsoft);
	const outlook = at('outlook', dia);
	const teams = at('teams', outlook);
	const onedrive = at('onedrive', teams);
	const setenta = at('setenta', onedrive);
	const fue = at('¿fue', setenta);
	const no = at('no', fue);
	const error = at('error', no);
	const julio = at('julio', error);
	const meses = at('meses', julio);
	const y = at('y', meses);
	const microsoft2 = at('microsoft', y);
	const negocio = at('negocio', microsoft2);
	const tres = at('tres', negocio);
	const copias = at('copias', tres);
	const dependas = at('dependas', copias);
	const revise = at('revise', dependas);
	const zainsoft = at('zainsoft', revise);
	const mantenemos = at('mantenemos', zainsoft);
	const preparado = at('preparado', mantenemos);
	const escribinos = at('escribinos', preparado);
	return {microsoft, dia, outlook, teams, onedrive, setenta, fue, no, error, julio, meses, y, microsoft2, negocio, tres, copias, dependas, revise, zainsoft, mantenemos, preparado, escribinos};
})();
const END = VOZ_FIN + 1.4;
export const REEL_FRAMES = Math.ceil(END * FPS);

// ───────────────────────── Escena 1: «casi un día entero»
const Gancho: React.FC<{t: number}> = ({t}) => {
	const op = 1 - ramp(t, T.outlook - 0.3, T.outlook);
	if (op <= 0) return null;
	const rot = pop(t, 0.05, 11);
	const horas = interpolate(t, [T.microsoft, T.dia + 0.4], [0, 23 + 50 / 60], {...cl, easing: Easing.out(Easing.cubic)});
	const hh = Math.floor(horas);
	const mm = Math.floor((horas - hh) * 60);
	const glitch = Math.sin(t * 47) > 0.93 ? 6 : 0;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: op}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center'}}>
				<div style={{padding: '12px 30px', borderRadius: 12, background: ROJO, color: '#fff', fontFamily: MONO, fontWeight: 'bold', fontSize: 34, letterSpacing: 4, transform: `scale(${rot})`}}>
					● ÚLTIMA NOTICIA · 12/11
				</div>
			</div>
			<div style={{position: 'absolute', left: 540 - 380, top: 470, width: 760, height: 560, borderRadius: 30, background: '#050506', boxShadow: '0 0 0 4px #2c2f38, 0 40px 90px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
				<div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 6px)'}} />
				<div style={{position: 'absolute', left: glitch, right: -glitch, top: 120, textAlign: 'center', fontFamily: MONO, fontWeight: 'bold', fontSize: 150, color: BLANCO, letterSpacing: 4}}>
					{String(hh).padStart(2, '0')}:{String(mm).padStart(2, '0')}
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: MONO, fontSize: 34, color: ROJO, opacity: 0.6 + 0.4 * Math.sin(t * 6)}}>
					⚠ sin servicio
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: FONT, fontWeight: 'bold', fontSize: 46, color: GRIS, opacity: ramp(t, T.dia - 0.2, T.dia + 0.2)}}>
					casi un día entero
				</div>
			</div>
		</div>
	);
};

// ───────────────────────── Escena 2: las apps se apagan + mapa
const IcoMail: React.FC<{c: string}> = ({c}) => (
	<g>
		<rect x={-46} y={-32} width={92} height={64} rx={10} fill={c} />
		<path d="M-40 -24 L0 6 L40 -24" stroke={FONDO} strokeWidth={7} fill="none" strokeLinejoin="round" />
	</g>
);
const IcoChat: React.FC<{c: string}> = ({c}) => (
	<g>
		<path d="M-44 -30 Q-44 -40 -34 -40 H34 Q44 -40 44 -30 V14 Q44 24 34 24 H-4 L-22 42 V24 H-34 Q-44 24 -44 14 Z" fill={c} />
		<circle cx={-16} cy={-8} r={6} fill={FONDO} />
		<circle cx={0} cy={-8} r={6} fill={FONDO} />
		<circle cx={16} cy={-8} r={6} fill={FONDO} />
	</g>
);
const IcoNube: React.FC<{c: string}> = ({c}) => <path d="M-36 26 Q-58 26 -56 6 Q-54 -12 -34 -12 Q-30 -40 0 -40 Q28 -40 34 -14 Q56 -14 56 6 Q56 26 34 26 Z" fill={c} />;
const APPS: {n: string; k: 'mail' | 'chat' | 'nube'; c: string}[] = [
	{n: 'Outlook', k: 'mail', c: '#3b82f6'},
	{n: 'Teams', k: 'chat', c: '#7c3aed'},
	{n: 'OneDrive', k: 'nube', c: '#0ea5e9'},
];
// puntos del «mapa» (continentes aproximados, deterministas)
const PUNTOS: [number, number][] = (() => {
	const out: [number, number][] = [];
	const zonas: [number, number, number, number][] = [
		[120, 120, 230, 150], [190, 250, 90, 160], [470, 110, 150, 120], [500, 230, 120, 150], [640, 100, 220, 170], [760, 300, 90, 60],
	];
	let s = 7;
	const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
	zonas.forEach(([x, y, w, h]) => {
		for (let i = 0; i < 26; i++) out.push([x + rnd() * w, y + rnd() * h]);
	});
	return out;
})();
const Apps: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.outlook - 0.3, T.fue, 0.3, 0.3);
	if (op <= 0) return null;
	const apagados = [T.outlook, T.teams, T.onedrive];
	const mapa = ramp(t, T.onedrive + 0.4, T.onedrive + 0.9);
	const rojo = ramp(t, T.setenta - 0.3, T.setenta + 0.7);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: op}}>
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				{APPS.map((a, i) => {
					const off = t >= apagados[i];
					const p = pop(t, T.outlook - 0.3 + i * 0.12, 12);
					const x = 270 + i * 270;
					const y = mix(560, 400, mapa);
					const s = p * mix(1, 0.7, mapa);
					const c = off ? '#3f414b' : a.c;
					return (
						<g key={a.n} transform={`translate(${x} ${y}) scale(${s})`}>
							<rect x={-95} y={-95} width={190} height={190} rx={40} fill={PANEL} stroke={off ? ROJO : '#2c2f38'} strokeWidth={4} />
							<g transform="scale(1.2)">{a.k === 'mail' ? <IcoMail c={c} /> : a.k === 'chat' ? <IcoChat c={c} /> : <IcoNube c={c} />}</g>
							{off && (
								<g transform="translate(70 -70)">
									<circle r={30} fill={ROJO} />
									<text y={14} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={40} fill="#fff">
										!
									</text>
								</g>
							)}
							<text y={140} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={40} fill={off ? GRIS : BLANCO}>
								{a.n}
							</text>
						</g>
					);
				})}
				{mapa > 0 && (
					<g transform="translate(90 640)" opacity={mapa}>
						{PUNTOS.map(([x, y], i) => {
							const r = rojo > (i % 17) / 17;
							return <circle key={i} cx={x} cy={y} r={r ? 9 : 7} fill={r ? ROJO : '#3a3d47'} opacity={r ? 0.95 : 0.8} />;
						})}
					</g>
				)}
			</svg>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1100, textAlign: 'center', fontFamily: FONT, fontWeight: 'bold', fontSize: 74, color: BLANCO, opacity: rojo, transform: `scale(${pop(t, T.setenta - 0.1, 10)})`}}>
				<span style={{color: ROJO}}>+70</span> países
			</div>
		</div>
	);
};

// ───────────────────────── Escena 3: ¿hackeo? NO · el error de julio
const Causa: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.fue - 0.1, T.y + 0.05, 0.25, 0.3);
	if (op <= 0) return null;
	const q = pop(t, T.fue - 0.05, 11);
	const sello = pop(t, T.no - 0.03, 9);
	const sube = ramp(t, T.error - 0.3, T.error + 0.2);
	const linea = ramp(t, T.error, T.julio + 0.2);
	const bicho = ramp(t, T.julio, T.meses + 0.3);
	const meses = ['jul', 'ago', 'sep', 'oct', 'nov'];
	const card = pop(t, T.meses - 0.4, 12);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: op}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: mix(600, 300, sube), textAlign: 'center', fontFamily: FONT, fontWeight: 'bold', fontSize: mix(130, 70, sube), color: BLANCO, transform: `scale(${q})`}}>
				¿hackeo?
				{sello > 0 && (
					<span style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) rotate(-10deg) scale(${mix(2.2, 1, sello)})`, opacity: Math.min(1, sello * 3), padding: '4px 30px', border: `9px solid ${VERDE}`, borderRadius: 18, color: VERDE, fontSize: '0.9em', letterSpacing: 6, background: 'rgba(14,15,19,0.75)'}}>NO</span>
				)}
			</div>
			{linea > 0 && (
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					<text x={540} y={520} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={50} fill={AMARILLO} opacity={ramp(t, T.error, T.error + 0.3)}>
						un error propio
					</text>
					<line x1={170} y1={640} x2={170 + 740 * linea} y2={640} stroke="#3f414b" strokeWidth={10} strokeLinecap="round" />
					<line x1={170} y1={640} x2={170 + 740 * bicho} y2={640} stroke={AMARILLO} strokeWidth={10} strokeLinecap="round" />
					{meses.map((m, i) => (
						<g key={m} opacity={ramp(t, T.error + i * 0.08, T.error + 0.3 + i * 0.08)}>
							<circle cx={170 + i * 185} cy={640} r={14} fill={i === 0 || 170 + i * 185 <= 170 + 740 * bicho ? AMARILLO : '#3f414b'} />
							<text x={170 + i * 185} y={700} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={36} fill={i === 0 ? AMARILLO : BLANCO}>
								{m}
							</text>
						</g>
					))}
					{bicho > 0 && (
						<g transform={`translate(${170 + 740 * bicho} ${598 + Math.abs(Math.sin(t * 14)) * -6})`}>
							<ellipse rx={24} ry={18} fill={AMARILLO} />
							<circle cx={20} cy={-6} r={9} fill={AMARILLO} />
							<path d="M-14 -16 L-20 -28 M0 -18 L0 -30 M14 -16 L20 -28" stroke={AMARILLO} strokeWidth={4} strokeLinecap="round" />
							<line x1={0} y1={-18} x2={0} y2={18} stroke={FONDO} strokeWidth={3} />
						</g>
					)}
					<text x={540} y={800} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={64} fill={BLANCO} opacity={ramp(t, T.meses - 0.3, T.meses)}>
						+3 meses sin que nadie lo vea
					</text>
				</svg>
			)}
			{card > 0 && (
				<div style={{position: 'absolute', left: 540 - 280, top: 860, width: 560, borderRadius: 18, background: '#fff', overflow: 'hidden', transform: `translateY(${(1 - card) * 120}px) rotate(${-1.5 * card}deg)`, opacity: Math.min(1, card * 2), boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
					<Img src={staticFile('capturas/infobae-microsoft.png')} style={{width: 560, display: 'block'}} />
					<div style={{fontFamily: MONO, fontSize: 20, color: '#6b7280', padding: '0 24px 14px'}}>infobae.com · 17/11/2026</div>
				</div>
			)}
		</div>
	);
};

// ───────────────────────── Escena 4: ¿y tu negocio?
const Local: React.FC = () => (
	<g>
		<rect x={-170} y={-100} width={340} height={220} rx={10} fill={PANEL2} stroke="#3f414b" strokeWidth={5} />
		{[0, 1, 2, 3, 4, 5, 6].map((i) => (
			<path key={i} d={`M${-185 + i * 53} -126 h53 v40 a26.5 26.5 0 0 1 -53 0 Z`} fill={i % 2 ? PANEL2 : NARANJA} stroke="#14151A" strokeWidth={3} />
		))}
		<rect x={-140} y={-30} width={150} height={100} rx={6} fill="#0b0b0d" stroke="#3f414b" strokeWidth={4} />
		<text x={-65} y={30} textAnchor="middle" fontSize={40} fill={ROJO}>
			⚠
		</text>
		<rect x={40} y={-30} width={100} height={150} fill={NARANJA} opacity={0.85} />
	</g>
);
const Giro: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.y - 0.1, T.tres + 0.05, 0.3, 0.3);
	if (op <= 0) return null;
	const z = ramp(t, T.y, T.microsoft2 + 0.6);
	const local = pop(t, T.negocio - 0.35, 11);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: op}}>
			<div style={{position: 'absolute', left: mix(160, 130, z), top: mix(470, 520, z), width: mix(760, 420, z), height: mix(560, 310, z), borderRadius: 26, background: '#050506', boxShadow: '0 0 0 4px #2c2f38', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
				<div style={{fontFamily: FONT, fontWeight: 'bold', fontSize: mix(90, 50, z), color: BLANCO}}>Microsoft</div>
				<div style={{fontFamily: MONO, fontSize: mix(36, 22, z), color: ROJO}}>⚠ sin servicio</div>
			</div>
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				<g transform={`translate(760 680) scale(${local})`}>
					<Local />
					<text y={190} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={44} fill={BLANCO}>
						tu negocio
					</text>
				</g>
				<text x={540} y={1000} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={120} fill={NARANJA} opacity={ramp(t, T.negocio, T.negocio + 0.3)}>
					?
				</text>
			</svg>
		</div>
	);
};

// ───────────────────────── Escena 5: tres consejos
const IcoCopias: React.FC = () => (
	<g fill="none" stroke={BLANCO} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
		<path d="M-30 24 Q-50 24 -48 6 Q-46 -10 -28 -10 Q-24 -34 0 -34 Q24 -34 28 -12 Q48 -12 48 6 Q48 24 30 24 Z" />
		<path d="M0 -4 V22 M-12 10 L0 22 L12 10" />
	</g>
);
const IcoCaminos: React.FC = () => (
	<g fill="none" stroke={BLANCO} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
		<path d="M0 36 V6 M0 6 L-28 -24 M0 6 L28 -24" />
		<path d="M-38 -14 L-28 -24 L-18 -14 M18 -14 L28 -24 L38 -14" />
	</g>
);
const IcoMant: React.FC = () => (
	<g>
		<path d="M0 -38 L30 -26 V0 Q30 24 0 38 Q-30 24 -30 0 V-26 Z" fill="none" stroke={BLANCO} strokeWidth={7} strokeLinejoin="round" />
		<path d="M-13 0 L-4 9 L14 -11" stroke={VERDE} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</g>
);
const CONSEJOS = [
	{k: 'copias', txt: 'copias de tus datos', ico: <IcoCopias />},
	{k: 'dependas', txt: 'más de una herramienta', ico: <IcoCaminos />},
	{k: 'revise', txt: 'que alguien lo mantenga', ico: <IcoMant />},
];
const Consejos: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.tres - 0.1, T.zainsoft, 0.25, 0.3);
	if (op <= 0) return null;
	const t0s = [T.copias - 0.15, T.dependas - 0.15, T.revise - 0.3];
	return (
		<div style={{position: 'absolute', inset: 0, opacity: op}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 310, textAlign: 'center', fontFamily: FONT, fontWeight: 'bold', fontSize: 72, color: BLANCO, transform: `scale(${pop(t, T.tres - 0.1, 11)})`}}>
				<span style={{color: NARANJA}}>3</span> cosas simples
			</div>
			{CONSEJOS.map((c, i) => {
				const p = pop(t, t0s[i], 11);
				return (
					<div key={c.k} style={{position: 'absolute', left: 150, right: 150, top: 470 + i * 200, height: 160, borderRadius: 28, background: PANEL, boxShadow: '0 0 0 3px #2c2f38', display: 'flex', alignItems: 'center', gap: 30, padding: '0 34px', transform: `translateX(${(1 - p) * -200}px)`, opacity: Math.min(1, p * 2)}}>
						<svg width={100} height={100} viewBox="-50 -50 100 100" style={{flex: 'none'}}>
							{c.ico}
						</svg>
						<span style={{flex: 1, fontFamily: FONT, fontWeight: 'bold', fontSize: 46, color: BLANCO}}>{c.txt}</span>
						<svg width={64} height={64} viewBox="-32 -32 64 64" style={{flex: 'none', transform: `scale(${pop(t, t0s[i] + 0.35, 9)})`}}>
							<circle r={30} fill={VERDE} />
							<path d="M-14 1 L-4 11 L15 -10" stroke={FONDO} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
				);
			})}
		</div>
	);
};

// ───────────────────────── Escena 6: cierre
const Cierre: React.FC<{t: number}> = ({t}) => {
	if (t < T.zainsoft - 0.1) return null;
	const logo = pop(t, T.zainsoft - 0.05, 11);
	const l1 = pop(t, T.zainsoft + 0.3, 12);
	const l2 = pop(t, T.mantenemos - 0.05, 12);
	const pr = pop(t, T.preparado - 0.3, 11);
	const dm = pop(t, T.escribinos - 0.05, 10);
	const ig = pop(t, T.escribinos + 0.45, 10);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
			<g transform={`translate(492 400) scale(${0.7 + 0.3 * logo})`} opacity={Math.min(1, logo * 2)}>
				{/* logo oficial: ícono negro con Z blanca y S naranja; sobre fondo oscuro «Zain» va en blanco (regla del usuario) */}
				<rect x={-330} y={-80} width={160} height={160} rx={36} fill={LOGO_TINTA} stroke="#2c2f38" strokeWidth={3} />
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
			<g transform={`translate(540 570) scale(${l1})`}>
				<text textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight="bold" fill={BLANCO}>
					hacemos sistemas
				</text>
			</g>
			<g transform={`translate(540 640) scale(${l2})`}>
				<text textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight="bold" fill={NARANJA}>
					y los mantenemos
				</text>
			</g>
			<g transform={`translate(540 790) scale(${pr})`}>
				<text textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight="bold" fill={BLANCO}>
					¿tu negocio está <tspan fill={VERDE}>preparado?</tspan>
				</text>
			</g>
			<g transform={`translate(540 950) scale(${dm})`}>
				<rect x={-310} y={-70} width={620} height={140} rx={70} fill={NARANJA} />
				<text y={22} textAnchor="middle" fontSize={62} fontFamily={FONT} fontWeight="bold" fill="#fff">
					Escribinos por DM
				</text>
			</g>
			<g transform={`translate(540 1100) scale(${ig})`}>
				<text textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight="bold" fill={BLANCO}>
					@zainsoft_
				</text>
			</g>
		</svg>
	);
};

// Luz: tensa (viñeta) hasta el giro; cálida desde «tu negocio»
const Luz: React.FC<{t: number}> = ({t}) => {
	const vin = 0.55 * (1 - ramp(t, T.negocio - 0.2, T.negocio + 0.8));
	const calida = ramp(t, T.negocio - 0.2, T.negocio + 0.8);
	return (
		<>
			{calida > 0 && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, rgba(242,96,46,${0.16 * calida}), rgba(14,15,19,0) 65%)`}} />}
			{vin > 0 && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${vin}) 100%)`}} />}
		</>
	);
};

// ───────────────────────── Subtítulos con volumen (fondo oscuro)
const PROFUNDIDAD: Record<string, string> = {[BLANCO]: '#6b6f7a', [AMARILLO]: '#8a7d00', [VERDE]: '#00804a', [ROJO]: '#7f1d1d'};
const volumen = (color: string, capas = 7) => {
	const d = PROFUNDIDAD[color] ?? '#55585f';
	const pasos = Array.from({length: capas}, (_, i) => `${i + 1}px ${i + 1}px 0 ${d}`);
	return [...pasos, `${capas + 2}px ${capas + 4}px 14px rgba(0,0,0,0.85)`, '0 0 3px rgba(0,0,0,0.6)'].join(', ');
};
const FUNC = new Set(['de', 'que', 'y', 'en', 'un', 'una', 'el', 'la', 'los', 'a', 'por', 'te', 'se', 'le', 'es', 'no', 'lo', 'tu', 'con', 'o', 'para', 'del', 'qué', 'al', 'sin', 'si', 'tus']);
const NOMBRES: Record<string, string> = {dm: 'dm'};
const AMARILLAS = new Set(['microsoft', 'setenta', 'error', 'julio', 'zainsoft']);
const ROJAS = new Set(['hackeo']);
const VERDES = new Set(['copias', 'preparado', 'día']);
type Cue = {s: number; e: number; words: {t: string; color: string}[]};
const CUES: Cue[] = (() => {
	const out: Cue[] = [];
	let cur: typeof PAL = [];
	const flush = () => {
		if (!cur.length) return;
		const consejo = cur.some((w) => ['todo', 'esté'].includes(limpia(w.t)));
		out.push({s: cur[0].s, e: cur[cur.length - 1].e, words: cur.map((w) => {
			const n = limpia(w.t);
			const verde = VERDES.has(n) && (n !== 'día' || consejo);
			return {t: NOMBRES[n] ?? n, color: ROJAS.has(n) ? ROJO : AMARILLAS.has(n) ? AMARILLO : verde ? VERDE : BLANCO};
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

// ───────────────────────── Bit (con luz detrás para que se lea su mitad negra)
const S_BIT = 0.34;
const BIT_FLOOR = 1650;
const BIT_X = 200;
const BitLayer: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const GEST: [number, Gesture][] = [
		[0, 'think'], [T.outlook - 0.1, 'point'], [T.setenta + 0.6, 'rest'], [T.fue, 'think'], [T.no + 0.5, 'rest'],
		[T.julio - 0.1, 'point'], [T.meses + 0.4, 'rest'], [T.negocio - 0.3, 'point'], [T.tres, 'rest'],
		[T.copias - 0.1, 'point'], [T.revise + 1.0, 'celebrate'], [T.zainsoft + 0.4, 'rest'], [T.escribinos - 0.1, 'point'], [VOZ_FIN + 0.1, 'wave'],
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
	{t: 0.05, f: 'Glitch.aac', v: 0.05, d: 20},
	{t: T.microsoft, f: 'Counter.aac', v: 0.05, d: 45},
	{t: T.outlook, f: 'Flicker.aac', v: 0.05, d: 15},
	{t: T.teams, f: 'Flicker.aac', v: 0.05, d: 15},
	{t: T.onedrive, f: 'Flicker.aac', v: 0.05, d: 15},
	{t: T.setenta - 0.2, f: 'Drop.aac', v: 0.07, d: 30},
	{t: T.fue - 0.05, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.no - 0.03, f: 'Stone motion.aac', v: 0.1, d: 20},
	{t: T.meses - 0.4, f: 'Paper in Air.aac', v: 0.07, d: 40},
	{t: T.negocio - 0.35, f: 'flash.aac', v: 0.07, d: 40},
	{t: T.copias - 0.15, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.dependas - 0.15, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.revise - 0.3, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.zainsoft - 0.05, f: 'flash.aac', v: 0.08, d: 40},
];

export const CaidaReel: React.FC = () => {
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
				<Luz t={t} />
				<Gancho t={t} />
				<Apps t={t} />
				<Causa t={t} />
				<Giro t={t} />
				<Consejos t={t} />
				<Cierre t={t} />
				<BitLayer t={t} frame={frame} />
				<Subtitulos t={t} />
			</AbsoluteFill>

			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', background: `rgba(14,15,19,${0.003 + (frame % 2) * 0.004})`}} />
		</AbsoluteFill>
	);
};
