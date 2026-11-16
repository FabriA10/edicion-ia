import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import amplitudes from './amplitud.json';
import palabras from './palabras.json';
import {BitRig, BitRigPose} from '../bit/BitRig';
import {blendGestures, blinkAt, mix, mouthFrom, Gesture} from '../bit/bitMotion';

// Reel «Son las 23 y tu WhatsApp no para» (ZainSoft · turnos online). Todo dibujado en código: la web no tiene demo de
// turnos (es un concepto). Rubro: barbería. Sin rostros humanos. Todos los tiempos salen de las palabras de la voz real.

const FPS = 30;
const NARANJA = '#F2602E';
const CREMA = '#F5EFE6';
const TINTA = '#14151A';
const ROJO = '#D93025';
const VERDE_C = '#00A35C';
const GRIS_C = '#6B7280';
const CARD = '#1A1C22';
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
	const once = at('once');
	const whatsapp = at('whatsapp', once);
	const tenes1 = at('tenés', whatsapp);
	const contestas = at('contestás', tenes1);
	const uno2 = at('uno', at('por', contestas));
	const otro = at('otro', contestas);
	const viene = at('viene', otro);
	const con = at('con', viene);
	const cliente = at('cliente', con);
	const elige = at('elige', cliente);
	const libre = at('libre', elige);
	const vos = at('vos', libre);
	const anotado = at('anotado', vos);
	const mensaje = at('mensaje', anotado);
	const antes = at('antes', mensaje);
	const recordatorio = at('recordatorio', antes);
	const menos = at('menos', recordatorio);
	const llamadas = at('llamadas', menos);
	const mensajes = at('mensajes', llamadas);
	const perdidos = at('perdidos', mensajes);
	const tenes2 = at('tenés', perdidos);
	const escribinos = at('escribinos', tenes2);
	return {once, whatsapp, tenes1, contestas, uno2, otro, viene, con, cliente, elige, libre, vos, anotado, mensaje, antes, recordatorio, menos, llamadas, mensajes, perdidos, tenes2, escribinos};
})();
const END = VOZ_FIN + 1.4;
export const REEL_FRAMES = Math.ceil(END * FPS);

// ───────────────────────── Celular dibujado
const PW = 440;
const PH = 900;
const BEZ = 14;
const SW = PW - BEZ * 2;
const SH = PH - BEZ * 2;

const Celular: React.FC<{x: number; y: number; s?: number; op?: number; children: React.ReactNode}> = ({x, y, s = 1, op = 1, children}) => (
	<div
		style={{
			position: 'absolute',
			left: x - PW / 2,
			top: y - PH / 2,
			width: PW,
			height: PH,
			borderRadius: 58,
			background: CARD,
			boxShadow: '0 40px 80px rgba(58,42,32,0.28), 0 10px 24px rgba(58,42,32,0.18)',
			transform: `scale(${s})`,
			opacity: op,
		}}
	>
		<div style={{position: 'absolute', left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: 46, overflow: 'hidden', background: '#fff'}}>{children}</div>
		<div style={{position: 'absolute', left: PW / 2 - 56, top: BEZ + 12, width: 112, height: 28, borderRadius: 14, background: '#000'}} />
	</div>
);

const Barra: React.FC<{hora: string; oscura?: boolean}> = ({hora, oscura}) => (
	<div style={{height: 54, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 30px 6px', fontFamily: UI, fontWeight: 700, fontSize: 19, color: oscura ? '#fff' : TINTA}}>
		<span>{hora}</span>
		<span style={{letterSpacing: 2}}>▮▮▮ ●</span>
	</div>
);

const LogoWA: React.FC<{s?: number}> = ({s = 60}) => (
	<svg width={s} height={s} viewBox="-32 -32 64 64" style={{flex: 'none'}}>
		<circle r={30} fill={WA} />
		<path d="M-14 16 L-11 6 A15 15 0 1 1 -4 13 Z" fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
		<path d="M-6 -6 Q-6 6 6 6" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
	</svg>
);

// Toque (coordenadas de pantalla del celular)
const Toque: React.FC<{t: number; t0: number; x: number; y: number}> = ({t, t0, x, y}) => {
	const p = (t - t0) / 0.5;
	if (p < 0 || p > 1) return null;
	const r = 16 + 40 * p;
	return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `6px solid rgba(20,21,26,${0.7 * (1 - p)})`, background: `rgba(255,255,255,${0.45 * (1 - p)})`}} />;
};

// ───────────────────────── Escena 1-2: WhatsApp a las 23:04
const CHATS: {n: string; m: string; c: string}[] = [
	{n: 'Mati', m: '¿tenés turno mañana?', c: '#7c3aed'},
	{n: 'Lu', m: '¿a qué hora cerrás?', c: '#db2777'},
	{n: 'Nico', m: '¿hay lugar el sábado?', c: '#2563eb'},
	{n: 'Caro', m: '¿mañana a las 10 puede ser?', c: '#ea580c'},
	{n: 'Fede', m: 'hola!! turno para barba?', c: '#059669'},
	{n: '+54 381 …', m: 'buenas, ¿atendés hoy?', c: '#64748b'},
];
const ListaWA: React.FC<{t: number}> = ({t}) => {
	const llegan = CHATS.map((_, i) => T.once - 0.6 + i * ((T.tenes1 + 0.4 - (T.once - 0.6)) / CHATS.length));
	const n = llegan.filter((x) => t >= x).length;
	const total = llegan.reduce((a, x, i) => a + (t >= x ? i + 1 : 0), 0);
	return (
		<div style={{position: 'absolute', inset: 0, background: '#fff'}}>
			<div style={{background: WA_OSC, color: '#fff'}}>
				<Barra hora="23:04" oscura />
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 26px 16px', fontFamily: UI, fontWeight: 700, fontSize: 30}}>
					<span>WhatsApp</span>
					<span style={{fontSize: 18, background: '#fff', color: WA_OSC, borderRadius: 14, padding: '2px 10px'}}>{total} sin leer</span>
				</div>
			</div>
			{CHATS.slice(0, n)
				.map((c, i) => ({c, i}))
				.reverse()
				.map(({c, i}, k) => {
					const p = pop(t, llegan[i], 13);
					return (
						<div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: '1px solid #eef0f2', transform: `translateY(${(1 - p) * -40}px)`, opacity: Math.min(1, p * 2), background: k === 0 ? `rgba(37,211,102,${0.12 * (1 - ramp(t, llegan[i] + 0.4, llegan[i] + 1.2))})` : '#fff'}}>
							<div style={{width: 58, height: 58, borderRadius: '50%', background: c.c, opacity: 0.85, flex: 'none'}} />
							<div style={{flex: 1, minWidth: 0, fontFamily: UI}}>
								<div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 22, color: TINTA}}>
									<span>{c.n}</span>
									<span style={{fontSize: 15, color: WA}}>23:04</span>
								</div>
								<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 19, color: GRIS_C, marginTop: 4}}>
									<span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.m}</span>
									<span style={{background: WA, color: '#fff', borderRadius: 12, minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: 700, padding: '1px 6px'}}>{i + 1}</span>
								</div>
							</div>
						</div>
					);
				})}
		</div>
	);
};

const RESP = ['sí, a las 10 ✓', 'cerramos a las 20', 'el sábado solo 10:30', 'dale, te anoto'];
const ChatWA: React.FC<{t: number}> = ({t}) => {
	const t0 = T.contestas;
	const t1 = T.otro - 0.2;
	return (
		<div style={{position: 'absolute', inset: 0, background: '#efe7de'}}>
			<div style={{background: WA_OSC, color: '#fff'}}>
				<Barra hora="23:06" oscura />
				<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '8px 22px 14px', fontFamily: UI, fontWeight: 700, fontSize: 24}}>
					<div style={{width: 46, height: 46, borderRadius: '50%', background: '#7c3aed', opacity: 0.85}} />
					Mati
				</div>
			</div>
			<div style={{padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 12, fontFamily: UI, fontSize: 21}}>
				<div style={{alignSelf: 'flex-start', background: '#fff', borderRadius: 14, padding: '10px 16px', color: TINTA}}>¿tenés turno mañana?</div>
				{RESP.map((r, i) => {
					const a = t0 + 0.2 + i * ((t1 - t0 - 0.2) / RESP.length);
					if (t < a) return null;
					const n = Math.min(r.length, Math.floor((t - a) * 34));
					return (
						<div key={i} style={{alignSelf: 'flex-end', background: '#d9fdd3', borderRadius: 14, padding: '10px 16px', color: TINTA, minWidth: 40}}>
							{r.slice(0, n)}
							{n < r.length && <span style={{opacity: 0.5}}>|</span>}
						</div>
					);
				})}
			</div>
		</div>
	);
};

// Sillón de barbería (vacío o con tijera)
const Sillon: React.FC<{tijera?: number}> = ({tijera = 0}) => (
	<g>
		<rect x={-70} y={-150} width={140} height={120} rx={26} fill={TINTA} />
		<rect x={-100} y={-40} width={200} height={60} rx={20} fill={TINTA} />
		<rect x={-112} y={-70} width={30} height={70} rx={10} fill="#2b2e36" />
		<rect x={82} y={-70} width={30} height={70} rx={10} fill="#2b2e36" />
		<rect x={-10} y={20} width={20} height={70} fill="#3a3d47" />
		<ellipse cx={0} cy={100} rx={80} ry={14} fill="#3a3d47" />
		<rect x={-40} y={-176} width={80} height={30} rx={12} fill="#2b2e36" />
		{tijera > 0 && (
			<g transform={`translate(0 -90) scale(${tijera})`} stroke={NARANJA} strokeWidth={8} fill="none" strokeLinecap="round">
				<circle cx={-20} cy={22} r={12} />
				<circle cx={20} cy={22} r={12} />
				<path d="M-12 12 L18 -30 M12 12 L-18 -30" />
			</g>
		)}
	</g>
);

const NoVino: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.otro - 0.15, T.con + 0.1, 0.2, 0.25);
	if (op <= 0) return null;
	const p = pop(t, T.viene, 9);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: op}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: FONT, fontWeight: 'bold', fontSize: 54, color: GRIS_C}}>al otro día…</div>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<g transform="translate(540 820) scale(2.1)">
					<Sillon />
				</g>
				<g transform="translate(540 470)">
					<rect x={-150} y={-36} width={300} height={72} rx={14} fill="#fff" stroke={TINTA} strokeWidth={4} />
					<text y={14} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={38} fill={TINTA}>
						10:00 · Mati
					</text>
				</g>
			</svg>
			{p > 0 && (
				<div style={{position: 'absolute', left: 540, top: 700, transform: `translate(-50%,-50%) rotate(-10deg) scale(${mix(2.2, 1, p)})`, opacity: Math.min(1, p * 3) * 0.92, padding: '10px 34px', border: `9px solid ${ROJO}`, borderRadius: 18, color: ROJO, fontFamily: FONT, fontWeight: 'bold', fontSize: 90, letterSpacing: 6, background: 'rgba(255,253,248,0.6)', whiteSpace: 'nowrap'}}>
					NO VINO
				</div>
			)}
		</div>
	);
};

// ───────────────────────── Escena 3: agenda web (cliente)
const SLOTS: {h: string; libre: boolean}[] = [
	{h: '09:00', libre: false}, {h: '09:30', libre: false}, {h: '10:00', libre: true}, {h: '10:30', libre: true},
	{h: '11:00', libre: false}, {h: '11:30', libre: true}, {h: '12:00', libre: false}, {h: '12:30', libre: true},
];
const SLOT_ELEGIDO = 3;
const slotPos = (i: number) => ({x: 26 + (i % 2) * 192, y: 300 + Math.floor(i / 2) * 96, w: 178, h: 80});
const AgendaCliente: React.FC<{t: number}> = ({t}) => {
	const elegido = t >= T.libre;
	const okBtn = pop(t, T.libre + 0.35, 12);
	return (
		<div style={{position: 'absolute', inset: 0, background: '#fafafa', fontFamily: UI}}>
			<Barra hora="10:12" />
			<div style={{margin: '6px 18px', background: '#eef0f2', borderRadius: 12, padding: '8px 14px', fontSize: 16, color: GRIS_C}}>🔒 agenda web · reservá tu turno</div>
			<div style={{padding: '14px 26px 6px', fontFamily: FONT, fontWeight: 'bold', fontSize: 34, color: TINTA}}>Tu barbería</div>
			<div style={{padding: '0 26px', fontSize: 19, color: GRIS_C}}>Elegí tu turno · corte o barba</div>
			<div style={{display: 'flex', gap: 10, padding: '18px 26px 0'}}>
				{['Jue 14', 'Vie 15', 'Sáb 16'].map((d, i) => (
					<div key={d} style={{flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 14, fontWeight: 700, fontSize: 19, background: i === 2 ? TINTA : '#fff', color: i === 2 ? '#fff' : TINTA, border: '1px solid #e5e7eb'}}>
						{d}
					</div>
				))}
			</div>
			{SLOTS.map((s, i) => {
				const p = slotPos(i);
				const sel = elegido && i === SLOT_ELEGIDO;
				return (
					<div
						key={s.h}
						style={{
							position: 'absolute',
							left: p.x,
							top: p.y,
							width: p.w,
							height: p.h,
							borderRadius: 16,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							fontWeight: 700,
							fontSize: 26,
							background: sel ? NARANJA : s.libre ? '#fff' : '#e5e7eb',
							color: sel ? '#fff' : s.libre ? TINTA : '#9ca3af',
							border: s.libre ? `2px solid ${sel ? NARANJA : '#d1d5db'}` : 'none',
							transform: sel ? `scale(${1 + 0.06 * Math.sin(Math.min(1, (t - T.libre) / 0.3) * Math.PI)})` : undefined,
						}}
					>
						{s.h}
						<span style={{fontSize: 14, fontWeight: 600, opacity: 0.85}}>{sel ? 'elegido ✓' : s.libre ? 'libre' : 'ocupado'}</span>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: 26, right: 26, top: 712, height: 70, borderRadius: 18, background: VERDE_C, color: '#fff', fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: okBtn, transform: `scale(${0.9 + 0.1 * okBtn})`}}>
				Sáb 16 · 10:30 · reservado ✓
			</div>
			<Toque t={t} t0={T.libre - 0.05} x={slotPos(SLOT_ELEGIDO).x + 89} y={slotPos(SLOT_ELEGIDO).y + 40} />
		</div>
	);
};

// ───────────────────────── Escena 4: la agenda del dueño
const DIA: {h: string; n?: string}[] = [{h: '09:00', n: 'Lucas · corte'}, {h: '09:30', n: 'Tomi · barba'}, {h: '10:00'}, {h: '10:30', n: 'Juli · corte'}, {h: '11:00', n: 'Santi · corte'}, {h: '11:30'}, {h: '12:00', n: 'Nacho · corte y barba'}];
const AgendaDueño: React.FC<{t: number}> = ({t}) => {
	const cae = pop(t, T.anotado, 11);
	return (
		<div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: UI}}>
			<Barra hora="10:12" />
			<div style={{padding: '6px 24px 14px', borderBottom: '1px solid #eef0f2'}}>
				<div style={{fontFamily: FONT, fontWeight: 'bold', fontSize: 30, color: TINTA}}>Tu agenda</div>
				<div style={{fontSize: 18, color: GRIS_C}}>Sábado 16</div>
			</div>
			{DIA.map((d, i) => {
				const nuevo = d.h === '10:30';
				const p = nuevo ? cae : 1;
				return (
					<div key={d.h} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', height: 96, borderBottom: '1px solid #f1f2f4'}}>
						<span style={{width: 62, fontSize: 19, fontWeight: 700, color: GRIS_C}}>{d.h}</span>
						{d.n && p > 0 && (
							<div style={{flex: 1, borderRadius: 14, padding: '12px 14px', background: nuevo ? '#fff3ec' : '#f3f4f6', borderLeft: `6px solid ${nuevo ? NARANJA : '#9ca3af'}`, fontSize: 20, fontWeight: 700, color: TINTA, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transform: `translateY(${(1 - p) * -60}px)`, opacity: Math.min(1, p * 2)}}>
								{d.n}
								{nuevo && <span style={{background: NARANJA, color: '#fff', borderRadius: 10, fontSize: 14, padding: '2px 8px'}}>nuevo</span>}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

// ───────────────────────── Escena 5: el recordatorio (pantalla bloqueada)
const Recordatorio: React.FC<{t: number}> = ({t}) => {
	const n = pop(t, T.recordatorio - 0.1, 12);
	const chips = (i: number) => pop(t, T.recordatorio + 0.5 + i * 0.25, 11);
	return (
		<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #2c3e66, #1b2236 60%, #141824)', fontFamily: UI, color: '#fff'}}>
			<Barra hora="" oscura />
			<div style={{textAlign: 'center', marginTop: 30, fontSize: 22, opacity: 0.8}}>viernes 15</div>
			<div style={{textAlign: 'center', fontSize: 110, fontWeight: 300, lineHeight: 1}}>18:00</div>
			<div style={{position: 'absolute', left: 16, right: 16, top: 250, borderRadius: 26, background: 'rgba(255,255,255,0.92)', color: TINTA, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', transform: `translateY(${(1 - n) * -160}px)`, opacity: Math.min(1, n * 2), boxShadow: '0 14px 30px rgba(0,0,0,0.3)'}}>
				<LogoWA s={52} />
				<div style={{flex: 1}}>
					<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 16, color: GRIS_C}}>
						<span style={{fontWeight: 700}}>WHATSAPP · Tu barbería</span>
						<span>ahora</span>
					</div>
					<div style={{fontSize: 21, fontWeight: 700, marginTop: 4}}>🔔 Recordatorio</div>
					<div style={{fontSize: 20, marginTop: 2}}>Tu turno es mañana, sábado, a las 10:30 ✂️</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontSize: 19, opacity: ramp(t, T.recordatorio + 0.4, T.recordatorio + 0.7) * 0.85}}>también puede llegar por</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 510, display: 'flex', justifyContent: 'center', gap: 12}}>
				{[
					{txt: 'WhatsApp', c: WA},
					{txt: 'Mail', c: '#3b82f6'},
					{txt: 'SMS', c: '#a855f7'},
				].map((c, i) => (
					<div key={c.txt} style={{background: c.c, borderRadius: 30, padding: '10px 20px', fontWeight: 700, fontSize: 22, transform: `scale(${chips(i)})`}}>
						{c.txt}
					</div>
				))}
			</div>
		</div>
	);
};

// ───────────────────────── Escena 6: menos llamadas, mensajes y turnos perdidos
const IcoTel: React.FC = () => <path d="M-26 -34 Q-38 -30 -36 -12 Q-30 18 0 34 Q16 40 24 30 L30 18 Q32 12 26 8 L12 0 Q6 -2 2 4 L-2 10 Q-14 4 -20 -10 L-14 -14 Q-8 -18 -10 -24 L-16 -36 Q-20 -40 -26 -34 Z" fill={TINTA} />;
const IcoMsj: React.FC = () => (
	<g>
		<path d="M-38 -30 Q-38 -40 -28 -40 H28 Q38 -40 38 -30 V10 Q38 20 28 20 H-6 L-24 38 V20 H-28 Q-38 20 -38 10 Z" fill={TINTA} />
		<circle cx={-14} cy={-10} r={5} fill="#fff" />
		<circle cx={0} cy={-10} r={5} fill="#fff" />
		<circle cx={14} cy={-10} r={5} fill="#fff" />
	</g>
);
const Menos: React.FC<{t: number}> = ({t}) => {
	const op = vis(t, T.menos - 0.15, T.tenes2 + 0.05, 0.2, 0.3);
	if (op <= 0) return null;
	const items = [
		{t0: T.llamadas, label: 'llamadas', ico: <IcoTel />},
		{t0: T.mensajes, label: 'mensajes', ico: <IcoMsj />},
		{t0: T.perdidos - 0.2, label: 'turnos perdidos', ico: <g transform="scale(0.36) translate(0 40)"><Sillon tijera={1} /></g>},
	];
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: op}}>
			<text x={540} y={430} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={80} fill={TINTA} opacity={ramp(t, T.menos, T.menos + 0.3)}>
				menos…
			</text>
			{items.map((it, i) => {
				const p = pop(t, it.t0, 10);
				const x = 250 + i * 290;
				return (
					<g key={i} transform={`translate(${x} 720) scale(${p})`}>
						<circle r={110} fill="#fff" stroke={TINTA} strokeWidth={5} />
						<g transform="scale(1.6)">{it.ico}</g>
						<g transform="translate(78 -78)">
							<circle r={34} fill={VERDE_C} />
							<path d="M0 -16 V14 M-13 2 L0 16 L13 2" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</g>
						<text y={170} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={i === 2 ? 38 : 44} fill={TINTA}>
							{it.label}
						</text>
					</g>
				);
			})}
		</svg>
	);
};

// ───────────────────────── Escena 7: cierre
const Poste: React.FC<{t: number}> = ({t}) => (
	<g>
		<rect x={-16} y={-70} width={32} height={140} rx={14} fill="#fff" stroke={TINTA} strokeWidth={4} />
		<clipPath id="poste">
			<rect x={-14} y={-68} width={28} height={136} rx={12} />
		</clipPath>
		<g clipPath="url(#poste)">
			{[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((k) => (
				<path key={k} d={`M-20 ${k * 26 + ((t * 40) % 26)} l40 -22 v12 l-40 22 Z`} fill={k % 2 ? ROJO : '#2563eb'} />
			))}
		</g>
		<rect x={-22} y={-82} width={44} height={16} rx={8} fill={TINTA} />
		<rect x={-22} y={66} width={44} height={16} rx={8} fill={TINTA} />
	</g>
);
const Cierre: React.FC<{t: number}> = ({t}) => {
	if (t < T.tenes2 - 0.05) return null;
	const logo = pop(t, T.tenes2, 11);
	const poste = pop(t, T.tenes2 + 0.35, 11);
	const dm = pop(t, T.escribinos - 0.05, 10);
	const ig = pop(t, T.escribinos + 0.4, 10);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
			<g transform={`translate(492 430) scale(${0.7 + 0.3 * logo})`} opacity={Math.min(1, logo * 2)}>
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
			<g transform={`translate(540 680) scale(${poste * 1.3})`}>
				<Poste t={t} />
			</g>
			<g transform={`translate(540 900) scale(${dm})`}>
				<rect x={-310} y={-70} width={620} height={140} rx={70} fill={NARANJA} />
				<text y={22} textAnchor="middle" fontSize={62} fontFamily={FONT} fontWeight="bold" fill="#fff">
					Escribinos por DM
				</text>
			</g>
			<g transform={`translate(540 1050) scale(${ig})`}>
				<text textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight="bold" fill={TINTA}>
					@zainsoft_
				</text>
			</g>
		</svg>
	);
};

// ───────────────────────── Celulares a lo largo del reel
const Celulares: React.FC<{t: number}> = ({t}) => {
	// 1-2: WhatsApp del dueño (lista → chat); se va antes de «al otro día»
	const n1 = 1 - ramp(t, T.otro - 0.3, T.otro);
	const temblor = t < T.tenes1 + 0.4 ? Math.sin(t * 40) * 3 * ramp(t, T.once, T.once + 0.3) : 0;
	const piezas: React.ReactNode[] = [];
	if (n1 > 0)
		piezas.push(
			<div key="wa" style={{position: 'absolute', inset: 0, transform: `translateX(${temblor}px)`}}>
				<Celular x={540} y={800} op={n1} s={mix(0.94, 1, n1)}>
					{t < T.contestas ? <ListaWA t={t} /> : <ChatWA t={t} />}
				</Celular>
			</div>,
		);
	// 3: agenda del cliente
	const a = vis(t, T.con - 0.1, T.vos + 0.05, 0.3, 0.01);
	const parLado = ramp(t, T.vos - 0.2, T.vos + 0.4);
	const fin4 = 1 - ramp(t, T.antes - 0.3, T.antes);
	if (t >= T.con - 0.1 && t < T.antes) {
		const pIn = pop(t, T.con - 0.1, 14);
		piezas.push(
			<Celular key="cli" x={mix(540, 320, parLado)} y={mix(800 + (1 - pIn) * 200, 790, parLado)} s={mix(1, 0.66, parLado)} op={Math.max(a, parLado > 0 ? fin4 : 0)}>
				<AgendaCliente t={t} />
			</Celular>,
		);
	}
	// 4: agenda del dueño, al lado
	if (t >= T.vos - 0.2 && t < T.antes) {
		const pIn = pop(t, T.vos - 0.1, 14);
		piezas.push(
			<Celular key="due" x={mix(1100, 760, pIn)} y={790} s={0.66} op={fin4}>
				<AgendaDueño t={t} />
			</Celular>,
		);
	}
	// 5: recordatorio
	const r = vis(t, T.antes - 0.15, T.menos - 0.05, 0.3, 0.3);
	if (r > 0)
		piezas.push(
			<Celular key="rec" x={540} y={800} s={mix(0.9, 1, pop(t, T.antes - 0.15, 14))} op={r}>
				<Recordatorio t={t} />
			</Celular>,
		);
	return <>{piezas}</>;
};

// Chip «0 mensajes» de la escena 4
const CeroMensajes: React.FC<{t: number}> = ({t}) => {
	const p = pop(t, T.mensaje - 0.2, 10);
	if (p <= 0 || t > T.antes) return null;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', opacity: 1 - ramp(t, T.antes - 0.3, T.antes)}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 50, padding: '12px 30px', boxShadow: '0 12px 28px rgba(58,42,32,0.2)', transform: `scale(${p})`, fontFamily: FONT, fontWeight: 'bold', fontSize: 44, color: TINTA}}>
				<LogoWA s={54} />0 mensajes
			</div>
		</div>
	);
};

// Hora grande del gancho
const Hora: React.FC<{t: number}> = ({t}) => {
	const op = 1 - ramp(t, T.contestas - 0.2, T.contestas + 0.2);
	if (op <= 0) return null;
	const p = pop(t, 0.05, 13);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: FONT, fontWeight: 'bold', fontSize: 64, color: '#fff', opacity: op * Math.min(1, p * 2), transform: `scale(${0.8 + 0.2 * p})`, textShadow: '0 4px 18px rgba(0,0,0,0.5)'}}>
			🌙 23:04
		</div>
	);
};

// Luz: noche (viñeta oscura) → cálida en «Con turnos online»
const Luz: React.FC<{t: number}> = ({t}) => {
	const noche = 1 - ramp(t, T.con - 0.2, T.con + 0.5);
	const flash = t > T.con - 0.2 && t < T.con + 0.5 ? Math.sin(((t - (T.con - 0.2)) / 0.7) * Math.PI) * 0.55 : 0;
	return (
		<>
			{noche > 0 && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(20,24,40,${0.12 * noche}) 35%, rgba(20,24,40,${0.6 * noche}) 100%)`}} />}
			{flash > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,248,236,${flash})`}} />}
		</>
	);
};

// ───────────────────────── Subtítulos
const FUNC = new Set(['de', 'que', 'y', 'en', 'un', 'una', 'el', 'la', 'los', 'a', 'por', 'te', 'se', 'le', 'es', 'no', 'lo', 'tu', 'con', 'o', 'para', 'del', 'qué', 'al', 'sin']);
const NOMBRES: Record<string, string> = {dm: 'dm'};
const ROJAS = new Set(['once', 'viene']);
const NARANJAS = new Set(['turnos', 'online', 'agenda', 'dm', 'peluquería', 'barbería']);
const VERDES = new Set(['recordatorio', 'whatsapp']);

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
		<div style={{position: 'absolute', left: 0, right: 0, top: 1290, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{position: 'absolute', width: 720, height: 130, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)'}} />
			<div style={{position: 'relative', fontFamily: FONT, fontWeight: 'bold', fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', transform: `translateY(${(1 - p) * 20}px) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 1.5), textShadow: '0 3px 14px rgba(255,255,255,0.8)'}}>
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
const BitLayer: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const GEST: [number, Gesture][] = [
		[0, 'think'], [T.contestas, 'rest'], [T.otro, 'think'], [T.con, 'rest'], [T.elige - 0.1, 'point'], [T.libre + 0.6, 'rest'],
		[T.anotado, 'celebrate'], [T.mensaje + 0.5, 'rest'], [T.recordatorio, 'point'], [T.recordatorio + 1.4, 'rest'],
		[T.llamadas, 'point'], [T.perdidos + 0.6, 'rest'], [T.escribinos, 'point'], [VOZ_FIN + 0.1, 'wave'],
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
	...CHATS.map((_, i) => ({t: T.once - 0.6 + i * ((T.tenes1 + 0.4 - (T.once - 0.6)) / CHATS.length), f: 'poof.aac', v: 0.05, d: 15})),
	{t: T.contestas + 0.2, f: 'Marker.aac', v: 0.04, d: 40},
	{t: T.viene, f: 'Stone motion.aac', v: 0.09, d: 20},
	{t: T.con - 0.2, f: 'flash.aac', v: 0.08, d: 40},
	{t: T.libre - 0.05, f: 'poof.aac', v: 0.07, d: 20},
	{t: T.anotado, f: 'poof.aac', v: 0.07, d: 20},
	{t: T.recordatorio - 0.1, f: 'flash.aac', v: 0.06, d: 30},
	{t: T.llamadas, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.mensajes, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.perdidos - 0.2, f: 'poof.aac', v: 0.06, d: 20},
	{t: T.tenes2, f: 'flash.aac', v: 0.08, d: 40},
];

export const TurnosReel: React.FC = () => {
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
				<Luz t={t} />
				<Celulares t={t} />
				<Hora t={t} />
				<NoVino t={t} />
				<CeroMensajes t={t} />
				<Menos t={t} />
				<Cierre t={t} />
				<BitLayer t={t} frame={frame} />
				<Subtitulos t={t} />
			</AbsoluteFill>

			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', background: `rgba(245,239,230,${0.003 + (frame % 2) * 0.004})`}} />
		</AbsoluteFill>
	);
};
