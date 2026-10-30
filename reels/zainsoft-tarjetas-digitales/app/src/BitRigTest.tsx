import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BitRig, BitRigPose, Pt} from './bit/BitRig';
import amplitudes from './pierina-bit/amplitud.json';

// Prueba de 8,5 s: Bit trepa el mostrador, respira, habla y camina sobre la madera.
export const BIT_RIG_TEST_FRAMES = 255;

const S = 0.4; // escala de la marioneta en la foto
const edge = (x: number) => 1458 + 0.237 * x; // borde frontal del mostrador
const underDesk = (x: number) => 1505 + 0.25 * x; // fin del canto, empieza la sombra
const STAND_X = 200;
const STAND_Y = 1488;
const deskY = (x: number) => STAND_Y + 0.237 * (x - STAND_X);

const io = Easing.bezier(0.45, 0, 0.25, 1);
// keyframes: [[t, v], ...] con easing por tramo
const kf = (t: number, keys: [number, number][], e: (n: number) => number = io) => {
	if (t <= keys[0][0]) return keys[0][1];
	for (let i = 0; i < keys.length - 1; i++) {
		const [t0, v0] = keys[i];
		const [t1, v1] = keys[i + 1];
		if (t <= t1) return v0 + (v1 - v0) * e((t - t0) / (t1 - t0));
	}
	return keys[keys.length - 1][1];
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// Voz: "Hola, soy Bit, de ZainSoft." desde el segundo 4
const VOICE_AT = 4.0;
const VOICE_LEN = 2.15;

export const BitRigTest: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;

	// ── raíz (pies) en coordenadas de la foto
	let rx = STAND_X;
	let ry = STAND_Y;
	let lean = 0;
	let sx = 1;
	let sy = 1;
	let bodyY = 0;
	let effort = 0;
	let mouth = 0;
	let look: Pt = {x: 0, y: 0};
	let antenna = 0;
	const toLocal = (p: Pt): Pt => ({x: (p.x - rx) / S, y: (p.y - ry) / S});

	let handL: Pt;
	let handR: Pt;
	let footL: Pt;
	let footR: Pt;

	const gripL = {x: STAND_X - 122, y: edge(STAND_X - 122) + 4};
	const gripR = {x: STAND_X + 122, y: edge(STAND_X + 122) + 4};

	if (t < 2.45) {
		// ═══ TREPADA
		ry = kf(t, [
			[0, 2010],
			[0.38, 1715], // manotazo al borde
			[0.55, 1758], // el peso lo tira para abajo
			[0.75, 1738],
			[1.05, 1700], // primer intento
			[1.3, 1745], // no llega
			[1.5, 1740],
			[1.95, 1560], // tirón fuerte
			[2.45, STAND_Y],
		]);
		rx = STAND_X + kf(t, [[0, -10], [1.5, 0], [2.45, 0]]);
		lean = kf(t, [[0, -4], [0.6, 3], [1.0, -2], [1.4, 2], [1.95, 12], [2.45, 0]]);
		effort = kf(t, [[0.4, 0], [0.6, 0.6], [1.05, 1], [1.35, 0.5], [1.8, 1], [2.3, 0.4], [2.45, 0]]);
		look = {x: 0, y: kf(t, [[0, -1], [1.5, -0.6], [2.2, 0]])};
		// manos: suben estiradas, se clavan en el borde y se sueltan al final
		const reach = (g: Pt): Pt => (t < 0.38 ? {x: g.x, y: mix(ry - 260, g.y, kf(t, [[0, 0], [0.38, 1]]))} : g);
		const release = kf(t, [[2.15, 0], [2.45, 1]]);
		const restL = {x: rx - 132, y: ry - 100};
		const restR = {x: rx + 132, y: ry - 100};
		const gl = reach(gripL);
		const gr = reach(gripR);
		handL = {x: mix(gl.x, restL.x, release), y: mix(gl.y, restL.y, release)};
		handR = {x: mix(gr.x, restR.x, release), y: mix(gr.y, restR.y, release)};
		// piernas: patalean colgando; en el tirón la derecha se apoya en el canto
		const kick = t > 0.4 && t < 1.55 ? Math.sin(t * 15) : 0;
		const hang = {L: {x: rx - 70 + kick * 18, y: ry + kick * 10}, R: {x: rx + 70 - kick * 18, y: ry - kick * 10}};
		const plantR = {x: STAND_X + 60, y: edge(STAND_X + 60) + 2};
		const plantK = kf(t, [[1.55, 0], [1.85, 1], [2.25, 1], [2.45, 0]]);
		const upK = kf(t, [[1.9, 0], [2.45, 1]]);
		footR = {x: mix(mix(hang.R.x, plantR.x, plantK), STAND_X + 60, upK), y: mix(mix(hang.R.y, plantR.y, plantK), STAND_Y, upK)};
		footL = {x: mix(hang.L.x, STAND_X - 60, upK), y: mix(hang.L.y, STAND_Y, upK)};
		antenna = Math.sin(t * 9) * kf(t, [[0.35, 14], [2.45, 4]]);
	} else {
		// ═══ ARRIBA: aterrizaje, respiración, voz y caminata
		const walkStart = 6.35;
		const walkEnd = 8.15;
		const walkK = kf(t, [[walkStart, 0], [walkStart + 0.25, 1], [walkEnd - 0.25, 1], [walkEnd, 0]]);
		rx = kf(t, [[walkStart, STAND_X], [walkEnd, 350]], Easing.bezier(0.3, 0, 0.7, 1));
		ry = deskY(rx);

		// aterrizaje con squash y rebote
		const land = kf(t, [[2.45, 0], [2.55, 1], [2.75, -0.35], [2.95, 0.1], [3.1, 0]], (n) => n);
		sy = 1 - land * 0.13;
		sx = 1 + land * 0.09;

		// respiración continua
		const breathe = Math.sin((t - 2.45) * 2.4);
		sy *= 1 + breathe * 0.012;
		bodyY = breathe * 5;

		// voz
		const vf = frame - Math.round(VOICE_AT * 30) + Math.round(3.5 * 30);
		const amp = t >= VOICE_AT && t < VOICE_AT + VOICE_LEN ? amplitudes[vf] || 0 : 0;
		const ampSm = t >= VOICE_AT && t < VOICE_AT + VOICE_LEN ? ((amplitudes[vf - 1] || 0) + amp * 2 + (amplitudes[vf + 1] || 0)) / 4 : 0;
		mouth = Math.min(1, ampSm * 1.5);
		bodyY += -ampSm * 14;
		lean = Math.sin(t * 5.5) * 2.5 * ampSm;

		// caminata: un ciclo por segundo, pies alternados
		const T = 0.9;
		const c = (t - walkStart) / T;
		const stride = 100;
		const foot = (phase: number, baseX: number): Pt => {
			const f = (((c + phase) % 1) + 1) % 1;
			const swing = f >= 0.5;
			const off = swing ? mix(-stride / 2, stride / 2, io((f - 0.5) / 0.5)) : mix(stride / 2, -stride / 2, f / 0.5);
			const lift = swing ? Math.sin(Math.PI * ((f - 0.5) / 0.5)) * 55 : 0;
			return {x: baseX + off * walkK, y: -lift * walkK};
		};
		const fl = foot(0, -150);
		const fr = foot(0.5, 150);
		footL = {x: rx + fl.x * S, y: ry + fl.y * S};
		footR = {x: rx + fr.x * S, y: ry + fr.y * S};
		bodyY += -Math.abs(Math.sin(c * Math.PI * 2)) * 16 * walkK;
		lean += 4 * walkK + Math.sin(c * Math.PI * 2) * 2 * walkK;

		// brazos: balanceo al caminar, saludo con "Hola"
		const swingA = Math.sin(c * Math.PI * 2) * 45 * walkK;
		const wave = kf(t, [[3.85, 0], [4.1, 1], [5.0, 1], [5.3, 0]]);
		const waveOsc = Math.sin(t * 16) * 40;
		handL = {x: rx + (-330 - swingA) * S, y: ry + (-250 + bodyY + Math.abs(swingA) * 0.2) * S};
		handR = {
			x: rx + mix(330 + swingA, 360 + waveOsc, wave) * S,
			y: ry + mix(-250 + bodyY, -720, wave) * S,
		};

		look = {x: walkK * 0.7, y: 0};
		antenna = Math.sin(t * 7) * (3 + 6 * walkK + 8 * ampSm) + land * -10;
	}

	// parpadeos
	const blink = Math.max(
		...[3.3, 5.45, 7.6].map((b) => kf(t, [[b, 0], [b + 0.06, 1], [b + 0.14, 0]], (n) => n)),
	);

	const pose: BitRigPose = {
		bodyY,
		sx,
		sy,
		lean,
		effort,
		mouth,
		blink,
		look,
		antenna,
		handsFront: t > 0.36 && t < 2.2,
		handL: toLocal(handL),
		handR: toLocal(handR),
		footL: toLocal(footL),
		footR: toLocal(footR),
	};

	// sombra de contacto sobre la madera (solo cuando está arriba)
	const onDesk = interpolate(t, [2.2, 2.45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const lift = Math.max(0, -bodyY) / 40;

	// cámara fija, cerrada sobre el borde izquierdo del mostrador
	const camS = 1.5;
	const camF = {x: 360, y: 1290};
	const camT = `translate(${540 - camF.x * camS}px, ${960 - camF.y * camS}px) scale(${camS})`;

	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<Sequence from={Math.round(VOICE_AT * 30)} durationInFrames={Math.round(VOICE_LEN * 30)}>
				<Audio src={staticFile('bit_voz.mp3')} volume={1.585} />
			</Sequence>
			<div style={{position: 'absolute', width: 1080, height: 1920, transformOrigin: '0 0', transform: camT}}>
				<div style={{position: 'absolute', left: 401, top: 674, width: 286, height: 636, borderRadius: 34, background: 'linear-gradient(155deg, #1b1d22, #07080a 55%, #15171b)'}} />
				<Img src={staticFile('escritorio_transparente.png')} style={{position: 'absolute', width: 1080, height: 1920}} />
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
					<defs>
						<filter id="blurSombra" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="7" />
						</filter>
						<linearGradient id="bajoMesa" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#000" stopOpacity="0.15" />
							<stop offset="0.25" stopColor="#000" stopOpacity="0.6" />
							<stop offset="1" stopColor="#000" stopOpacity="0.75" />
						</linearGradient>
					</defs>
					{/* sombra de contacto */}
					<ellipse
						cx={rx}
						cy={ry + 4}
						rx={115 * (1 - lift * 0.25)}
						ry={16 * (1 - lift * 0.25)}
						fill="#2a1306"
						opacity={0.55 * onDesk * (1 - lift * 0.4)}
						filter="url(#blurSombra)"
					/>
					<g transform={`translate(${rx} ${ry}) scale(${S})`}>
						<BitRig pose={pose} />
					</g>
					{/* lo que cuelga debajo del canto queda en la sombra del mostrador */}
					<path
							d={`M 0 ${underDesk(0)} L 1080 ${underDesk(1080)} L 1080 1920 L 0 1920 Z`}
							fill="url(#bajoMesa)"
						/>
				</svg>
			</div>
		</AbsoluteFill>
	);
};
