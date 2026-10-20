import {Easing} from 'remotion';
import type {Pt} from './BitRig';

// Movimiento compartido de la marioneta: trepada, gestos de brazos, caminata y lip-sync.

export const io = Easing.bezier(0.45, 0, 0.25, 1);
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// keyframes: [[t, v], ...] con easing por tramo
export const kf = (t: number, keys: [number, number][], e: (n: number) => number = io) => {
	if (t <= keys[0][0]) return keys[0][1];
	for (let i = 0; i < keys.length - 1; i++) {
		const [t0, v0] = keys[i];
		const [t1, v1] = keys[i + 1];
		if (t <= t1) return v0 + (v1 - v0) * e((t - t0) / (t1 - t0));
	}
	return keys[keys.length - 1][1];
};

export const blinkAt = (t: number, times: number[]) =>
	Math.max(0, ...times.map((b) => kf(t, [[b, 0], [b + 0.06, 1], [b + 0.14, 0]], (n) => n)));

// Boca: amplitud de la voz suavizada sobre 3 cuadros
export const mouthFrom = (amp: number[], frame: number) => {
	const a = ((amp[frame - 1] || 0) + (amp[frame] || 0) * 2 + (amp[frame + 1] || 0)) / 4;
	return Math.min(1, a * 1.5);
};

// ─── Trepada (tc: 0 → 2,45 s). Todo en coordenadas de la foto.
export type ClimbGeo = {edge: (x: number) => number; standX: number; standY: number; scale: number};

export const climbState = (tc: number, g: ClimbGeo) => {
	const {edge, standX: X, standY: Y, scale: S} = g;
	const ry =
		tc < 0
			? 2400
			: kf(tc, [
					[0, 2010],
					[0.38, 1715], // manotazo al borde
					[0.55, 1758], // el peso lo tira para abajo
					[0.75, 1738],
					[1.05, 1700], // primer intento
					[1.3, 1745], // no llega
					[1.5, 1740],
					[1.95, 1560], // tirón fuerte
					[2.45, Y],
				]);
	const rx = X + kf(tc, [[0, -10], [1.5, 0], [2.45, 0]]);
	const lean = kf(tc, [[0, -4], [0.6, 3], [1.0, -2], [1.4, 2], [1.95, 12], [2.45, 0]]);
	const effort = kf(tc, [[0.4, 0], [0.6, 0.6], [1.05, 1], [1.35, 0.5], [1.8, 1], [2.3, 0.4], [2.45, 0]]);
	const look = {x: 0, y: kf(tc, [[0, -1], [1.5, -0.6], [2.2, 0]])};

	const gripL = {x: X - 122, y: edge(X - 122) + 4};
	const gripR = {x: X + 122, y: edge(X + 122) + 4};
	const reach = (p: Pt): Pt => (tc < 0.38 ? {x: p.x, y: mix(ry - 260, p.y, kf(tc, [[0, 0], [0.38, 1]]))} : p);
	const release = kf(tc, [[2.15, 0], [2.45, 1]]);
	const restL = {x: rx - 330 * S, y: ry - 250 * S};
	const restR = {x: rx + 330 * S, y: ry - 250 * S};
	const gl = reach(gripL);
	const gr = reach(gripR);
	const handL = {x: mix(gl.x, restL.x, release), y: mix(gl.y, restL.y, release)};
	const handR = {x: mix(gr.x, restR.x, release), y: mix(gr.y, restR.y, release)};

	// piernas: patalean colgando; en el tirón la derecha se apoya en el canto
	const kick = tc > 0.4 && tc < 1.55 ? Math.sin(tc * 15) : 0;
	const hangL = {x: rx - 70 + kick * 18, y: ry + kick * 10};
	const hangR = {x: rx + 70 - kick * 18, y: ry - kick * 10};
	const plantR = {x: X + 60, y: edge(X + 60) + 2};
	const plantK = kf(tc, [[1.55, 0], [1.85, 1], [2.25, 1], [2.45, 0]]);
	const upK = kf(tc, [[1.9, 0], [2.45, 1]]);
	const footR = {x: mix(mix(hangR.x, plantR.x, plantK), X + 60, upK), y: mix(mix(hangR.y, plantR.y, plantK), Y, upK)};
	const footL = {x: mix(hangL.x, X - 60, upK), y: mix(hangL.y, Y, upK)};
	const antenna = Math.sin(tc * 9) * kf(tc, [[0.35, 14], [2.45, 4]]);

	return {rx, ry, lean, effort, look, handL, handR, footL, footR, antenna, handsFront: tc > 0.36 && tc < 2.2};
};

// Aterrizaje: squash & rebote (tl = segundos desde que pisa)
export const landSquash = (tl: number) => kf(tl, [[0, 0], [0.1, 1], [0.3, -0.35], [0.5, 0.1], [0.65, 0]], (n) => n);

// ─── Caminata: pies alternados (offsets locales, a sumar a la posición de reposo)
export const walkFeet = (c: number, walkK: number, stride = 100, liftH = 55) => {
	const foot = (phase: number, baseX: number): Pt => {
		const f = (((c + phase) % 1) + 1) % 1;
		const swing = f >= 0.5;
		const off = swing ? mix(-stride / 2, stride / 2, io((f - 0.5) / 0.5)) : mix(stride / 2, -stride / 2, f / 0.5);
		const lift = swing ? Math.sin(Math.PI * ((f - 0.5) / 0.5)) * liftH : 0;
		return {x: baseX + off * walkK, y: -lift * walkK};
	};
	return {L: foot(0, -150), R: foot(0.5, 150), bob: -Math.abs(Math.sin(c * Math.PI * 2)) * 16 * walkK};
};

// ─── Gestos de brazos (manos en coordenadas locales de la marioneta)
export type Gesture = 'rest' | 'wave' | 'point' | 'think' | 'celebrate' | 'laptop' | 'press' | 'walk';

type GestureOut = {L: Pt; R: Pt; front: boolean; look: Pt; jump: number; laptop: number};

const gestureAt = (g: Gesture, t: number, tg: number): GestureOut => {
	const base = {front: false, look: {x: 0, y: 0}, jump: 0, laptop: 0};
	switch (g) {
		case 'wave':
			return {...base, L: {x: -330, y: -250}, R: {x: 360 + Math.sin(t * 16) * 40, y: -720}};
		case 'point':
			return {...base, L: {x: -320, y: -240}, R: {x: 540, y: -560 + Math.sin(t * 6) * 10}, look: {x: 1, y: -0.2}};
		case 'think':
			return {...base, L: {x: -330, y: -250}, R: {x: 250, y: -690 + Math.sin(t * 10) * 12}, look: {x: -0.6, y: -0.9}};
		case 'celebrate': {
			const j = Math.abs(Math.sin(tg * Math.PI * 2.6));
			return {...base, L: {x: -400, y: -760 - j * 30}, R: {x: 400, y: -760 - j * 30}, jump: j * (tg < 1.6 ? 1 : 0)};
		}
		case 'laptop': {
			const k = Math.sin(t * 22);
			return {...base, L: {x: -150, y: -175 - Math.max(0, k) * 22}, R: {x: 150, y: -175 - Math.max(0, -k) * 22}, front: true, look: {x: 0, y: 0.6}, laptop: 1};
		}
		case 'press':
			return {...base, L: {x: -320, y: -240}, R: {x: 470, y: -470}, look: {x: 1, y: 0}};
		default:
			return {...base, L: {x: -330, y: -250}, R: {x: 330, y: -250}};
	}
};

export const blendGestures = (list: [number, Gesture][], t: number) => {
	let i = 0;
	for (let k = 0; k < list.length; k++) if (t >= list[k][0]) i = k;
	const [t1, g1] = list[i];
	const cur = gestureAt(g1, t, t - t1);
	if (i === 0) return {...cur, name: g1};
	const prev = gestureAt(list[i - 1][1], t, t - list[i - 1][0]);
	const k = io(Math.min(1, (t - t1) / 0.28));
	const m = (a: Pt, b: Pt): Pt => ({x: mix(a.x, b.x, k), y: mix(a.y, b.y, k)});
	return {
		name: g1,
		L: m(prev.L, cur.L),
		R: m(prev.R, cur.R),
		front: k > 0.5 ? cur.front : prev.front,
		look: m(prev.look, cur.look),
		jump: mix(prev.jump, cur.jump, k),
		laptop: mix(prev.laptop, cur.laptop, k),
	};
};
