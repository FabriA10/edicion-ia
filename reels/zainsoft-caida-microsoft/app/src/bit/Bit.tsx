import React from 'react';
import {interpolate} from 'remotion';

// Bit, rearmado en SVG a partir de bit-principal.png (viewBox 1000x1000) para poder
// animarlo por partes: brazos, piernas, ojos, boca y antena.

export type Pose = 'idle' | 'wave' | 'point' | 'warn' | 'build' | 'open' | 'nod';

export type BitProps = {
	frame: number;
	pose: Pose;
	walking: boolean;
	mouth: number; // 0..1 apertura de la boca (sale de la amplitud de la voz)
	lookX?: number; // -1..1 hacia dónde mira
	facing?: 1 | -1;
};

const NEGRO = '#111216';
const NARANJA = '#F05A2B';
const NARANJA_OSC = '#C4410E';
const CIRCUITO = '#B5482A';

const blinkAt = (f: number) => {
	// parpadeo cada ~2,7 s con un doble parpadeo cada tanto
	const cycle = f % 82;
	const b1 = cycle < 6 ? Math.sin((cycle / 6) * Math.PI) : 0;
	const c2 = f % 247;
	const b2 = c2 > 10 && c2 < 16 ? Math.sin(((c2 - 10) / 6) * Math.PI) : 0;
	return 1 - Math.max(b1, b2) * 0.92;
};

export const Bit: React.FC<BitProps> = ({frame: f, pose, walking, mouth, lookX = 0, facing = 1}) => {
	const t = f / 30;
	const walkPhase = walking ? Math.sin(t * Math.PI * 4) : 0; // 2 pasos por segundo
	const bob = walking ? Math.abs(Math.sin(t * Math.PI * 4)) * -22 : Math.sin(t * 2.2) * 6;
	const breathe = 1 + Math.sin(t * 2.2) * 0.012;

	// ── Brazos: ángulo en grados alrededor del hombro (0 = la pose del dibujo)
	let lArm = Math.sin(t * 2.2) * 4;
	let rArm = -Math.sin(t * 2.2 + 1) * 4;
	let tilt = 0;
	let nod = 0;
	if (walking) {
		lArm = walkPhase * 22;
		rArm = walkPhase * 22;
	}
	if (pose === 'wave') {
		rArm = -55 + Math.sin(t * Math.PI * 5) * 22;
		tilt = Math.sin(t * Math.PI * 2.5) * 3;
	}
	if (pose === 'point') {
		rArm = 38 + Math.sin(t * 6) * 4; // apunta hacia adelante/abajo, al teléfono
		tilt = 4;
	}
	if (pose === 'warn') {
		rArm = -78 + Math.sin(t * Math.PI * 6) * 8; // dedo arriba: "ojo"
		tilt = -5;
	}
	if (pose === 'build') {
		const h = Math.sin(t * Math.PI * 6);
		lArm = 25 + h * 30;
		rArm = 25 - h * 30;
		nod = Math.max(0, h) * 4;
	}
	if (pose === 'open') {
		lArm = -32 + Math.sin(t * 3) * 3;
		rArm = -32 + Math.sin(t * 3 + 1) * 3;
	}
	if (pose === 'nod') {
		nod = Math.sin(t * Math.PI * 3.2) * 7;
	}

	const blink = blinkAt(f);
	const eyeDx = lookX * 14;
	const antenna = Math.sin(t * 5) * 6 + (walking ? walkPhase * 10 : 0);

	// Boca: la sonrisa se abre en una boca oscura según la voz
	const open = Math.min(1, mouth);
	const mouthH = interpolate(open, [0, 1], [0, 70]);

	return (
		<svg viewBox="0 0 1000 1000" width="100%" height="100%" style={{overflow: 'visible'}}>
			<defs>
				<linearGradient id="bitBrillo" x1="0" x2="1" y1="0" y2="1">
					<stop offset="0" stopColor="#fff" stopOpacity="0.22" />
					<stop offset="0.5" stopColor="#fff" stopOpacity="0" />
				</linearGradient>
				<clipPath id="bitMouthClip">
					<path d={`M392 612 Q500 ${640 + mouthH * 1.4} 608 612 Q500 ${660 + mouthH * 1.9} 392 612 Z`} />
				</clipPath>
			</defs>

			{/* sombra en el piso */}
			<ellipse cx="500" cy="958" rx={300 - bob * 2} ry="24" fill="#000" opacity={0.28 + bob * 0.004} />

			<g transform={`translate(${facing === -1 ? 1000 : 0} 0) scale(${facing} 1)`}>
				{/* piernas */}
				<g transform={`translate(0 ${walking ? Math.max(0, walkPhase) * -26 : 0})`}>
					<rect x="328" y="830" width="58" height="88" fill={NEGRO} />
					<rect x="300" y="910" width="100" height="40" fill={NEGRO} />
				</g>
				<g transform={`translate(0 ${walking ? Math.max(0, -walkPhase) * -26 : 0})`}>
					<rect x="614" y="830" width="58" height="92" rx="10" fill={NARANJA_OSC} />
					<rect x="600" y="910" width="100" height="40" rx="20" fill={NARANJA_OSC} />
				</g>

				<g transform={`translate(0 ${bob}) rotate(${tilt + nod} 500 840) scale(1 ${breathe})`} style={{transformOrigin: '500px 840px'}}>
					{/* antena */}
					<g transform={`rotate(${antenna} 500 300)`}>
						<line x1="500" y1="300" x2="500" y2="190" stroke={NEGRO} strokeWidth="14" />
						<circle cx="500" cy="160" r="36" fill={NARANJA} />
						<circle cx="500" cy="160" r="14" fill="#fafafa" opacity={0.7 + Math.sin(t * 8) * 0.3} />
					</g>

					{/* brazo izquierdo (negro, llave) */}
					<g transform={`rotate(${lArm} 240 575)`}>
						<line x1="240" y1="575" x2="148" y2="500" stroke={NEGRO} strokeWidth="30" strokeLinecap="round" />
						<path d="M148 505 L110 400" stroke="#9EA3AD" strokeWidth="26" strokeLinecap="round" />
						<path d="M66 350 A40 40 0 1 0 112 330" stroke="#9EA3AD" strokeWidth="28" fill="none" strokeLinecap="round" />
						<circle cx="146" cy="500" r="27" fill={NEGRO} />
					</g>
					{/* brazo derecho (naranja, pincel) */}
					<g transform={`rotate(${-rArm} 760 575)`}>
						<line x1="760" y1="575" x2="858" y2="500" stroke={NARANJA} strokeWidth="30" strokeLinecap="round" />
						<path d="M858 505 L895 390" stroke="#8B5A2B" strokeWidth="20" strokeLinecap="round" />
						<rect x="876" y="372" width="40" height="30" rx="6" fill="#CBD3DD" transform="rotate(17 896 387)" />
						<path d="M885 375 Q900 320 925 310 Q935 345 915 385 Z" fill="#F4A522" />
						<circle cx="860" cy="500" r="27" fill={NARANJA} />
					</g>

					{/* cuerpo */}
					<rect x="240" y="300" width="262" height="540" fill={NEGRO} />
					<path d="M500 300 H660 Q760 300 760 400 V740 Q760 840 660 840 H500 Z" fill={NARANJA} />
					<path d="M240 300 H660 Q760 300 760 400 V740 Q760 840 660 840 H240 Z" fill="url(#bitBrillo)" />
					<path d="M688 326 Q735 340 738 385" stroke="#FF8A63" strokeWidth="16" fill="none" strokeLinecap="round" />
					<path d="M278 385 V345 H320" stroke={CIRCUITO} strokeWidth="10" fill="none" />
					<path d="M287 713 H352 L387 760 H466" stroke={CIRCUITO} strokeWidth="9" fill="none" />
					<circle cx="466" cy="760" r="13" fill={NARANJA} />
					<path d="M287 787 H426" stroke={CIRCUITO} strokeWidth="9" />
					<circle cx="426" cy="787" r="13" fill={NARANJA} />

					{/* ojos */}
					<g transform={`translate(${eyeDx} 0)`}>
						<g transform={`translate(0 ${470 * (1 - blink)}) scale(1 ${blink})`}>
							<rect x="320" y="427" width="86" height="86" rx="10" fill="#fff" />
							<rect x={343 + eyeDx * 0.4} y="450" width="40" height="40" fill={NEGRO} />
							<circle cx="633" cy="470" r="46" fill="#fff" />
							<circle cx={633 + eyeDx * 0.5} cy="470" r="22" fill={NEGRO} />
							<circle cx={641 + eyeDx * 0.5} cy="461" r="6" fill="#fff" />
						</g>
					</g>

					{/* boca */}
					<path
						d={`M392 612 Q500 ${640 + mouthH * 1.4} 608 612 Q500 ${660 + mouthH * 1.9} 392 612 Z`}
						fill="#3A1208"
						opacity={open > 0.04 ? 1 : 0}
					/>
					<g clipPath="url(#bitMouthClip)">
						<ellipse cx="500" cy={670 + mouthH * 1.2} rx="55" ry={18 + mouthH * 0.35} fill="#FF7A8A" />
					</g>
					<path
						d={`M405 618 Q500 ${690 + mouthH * 0.6} 595 618`}
						stroke="#fff"
						strokeWidth="18"
						fill="none"
						strokeLinecap="round"
						opacity={open > 0.04 ? 0.9 : 1}
					/>
				</g>
			</g>
		</svg>
	);
};
