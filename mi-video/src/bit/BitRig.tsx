import React from 'react';

// Marioneta vectorial de Bit, calcada de bit-principal.png (1000×1000).
// Coordenadas locales: origen en el piso, entre los dos pies; y negativa hacia arriba.
// Brazos y piernas son de dos segmentos con cinemática inversa: se les da adónde
// tienen que llegar la mano o el pie y el codo/rodilla se calcula solo.

const NEGRO = '#111216';
const NARANJA = '#F05A2B';
const NARANJA_OSC = '#C2410C';
const DETALLE = '#B5452A';

export type Pt = {x: number; y: number};

export interface BitRigPose {
	bodyY?: number; // desplazamiento del cuerpo (local)
	sx?: number; // squash & stretch, con pivote en las caderas
	sy?: number;
	lean?: number; // grados, pivote en las caderas
	handL: Pt; // destinos en coordenadas locales
	handR: Pt;
	footL: Pt;
	footR: Pt;
	mouth?: number; // 0 cerrada (sonrisa) … 1 bien abierta
	effort?: number; // 0..1: ceño y boca apretada al hacer fuerza
	blink?: number; // 0 abiertos … 1 cerrados
	look?: Pt; // pupila, -1..1
	antenna?: number; // grados de balanceo de la antena
	handsFront?: boolean; // manos por delante del cuerpo (agarrado al borde)
	laptop?: number; // 0..1: notebook en las manos
}

const HIP_Y = -108;
const SHOULDER_Y = -388;
const ARM = [92, 92];
const LEG = [48, 48];

const ik = (a: Pt, target: Pt, l1: number, l2: number, bend: 1 | -1): [Pt, Pt] => {
	const dx = target.x - a.x;
	const dy = target.y - a.y;
	const dist = Math.hypot(dx, dy);
	const d = Math.min(Math.max(dist, Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
	const base = Math.atan2(dy, dx);
	const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
	const ang = base + bend * Math.acos(Math.max(-1, Math.min(1, cosA)));
	const joint = {x: a.x + Math.cos(ang) * l1, y: a.y + Math.sin(ang) * l1};
	// si el destino queda fuera de alcance, el extremo llega hasta donde da el brazo
	const end = {x: a.x + (dx / (dist || 1)) * d, y: a.y + (dy / (dist || 1)) * d};
	return [joint, end];
};

export const BitRig: React.FC<{pose: BitRigPose}> = ({pose}) => {
	const {bodyY = 0, sx = 1, sy = 1, lean = 0, mouth = 0, effort = 0, blink = 0, look = {x: 0, y: 0}, antenna = 0, handsFront = false, laptop = 0} = pose;

	// transforma un punto del cuerpo (pivote: centro de caderas)
	const rad = (lean * Math.PI) / 180;
	const tp = (p: Pt): Pt => {
		const x = p.x * sx;
		const y = (p.y - HIP_Y) * sy;
		return {
			x: x * Math.cos(rad) - y * Math.sin(rad),
			y: x * Math.sin(rad) + y * Math.cos(rad) + HIP_Y + bodyY,
		};
	};
	const bodyT = `translate(0 ${HIP_Y + bodyY}) rotate(${lean}) scale(${sx} ${sy}) translate(0 ${-HIP_Y})`;

	const shL = tp({x: -250, y: SHOULDER_Y});
	const shR = tp({x: 250, y: SHOULDER_Y});
	const hipL = tp({x: -142, y: HIP_Y + 10});
	const hipR = tp({x: 142, y: HIP_Y + 10});
	const [elL, hL] = ik(shL, pose.handL, ARM[0], ARM[1], -1);
	const [elR, hR] = ik(shR, pose.handR, ARM[0], ARM[1], 1);
	const [knL, fL] = ik(hipL, {x: pose.footL.x, y: pose.footL.y - 36}, LEG[0], LEG[1], 1);
	const [knR, fR] = ik(hipR, {x: pose.footR.x, y: pose.footR.y - 36}, LEG[0], LEG[1], -1);

	const limb = (a: Pt, b: Pt, c: Pt) => `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y}`;

	// boca: con 0 queda la sonrisa del dibujo original, al abrir se separan los dos labios
	const m = Math.max(0, Math.min(1, mouth));
	const topC = -268 - m * 34 + effort * 40;
	const botC = -268 + m * 96 - effort * 20;
	const mouthW = 95 - effort * 25;
	const mouthD = `M ${-mouthW} -330 Q 0 ${topC} ${mouthW} -330 Q 0 ${botC} ${-mouthW} -330 Z`;

	const eyeSY = Math.max(0.08, 1 - blink) * (1 - effort * 0.45);

	return (
		<g>
			{/* piernas */}
			<path d={limb(hipL, knL, fL)} stroke={NEGRO} strokeWidth={56} fill="none" strokeLinejoin="round" />
			<path d={limb(hipR, knR, fR)} stroke={NARANJA_OSC} strokeWidth={56} fill="none" strokeLinejoin="round" strokeLinecap="round" />
			<rect x={fL.x - 50} y={fL.y} width={100} height={36} fill={NEGRO} />
			<rect x={fR.x - 50} y={fR.y} width={100} height={36} rx={18} fill={NARANJA_OSC} />

			{/* brazos (detrás del cuerpo) */}
			<path d={limb(shL, elL, hL)} stroke={NEGRO} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={hL.x} cy={hL.y} r={26} fill={NEGRO} />
			<path d={limb(shR, elR, hR)} stroke={NARANJA} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={hR.x} cy={hR.y} r={26} fill={NARANJA} />

			<g transform={bodyT}>
				{/* antena con resorte */}
				<g transform={`rotate(${antenna} 0 -648)`}>
					<line x1={0} y1={-648} x2={0} y2={-760} stroke={NEGRO} strokeWidth={12} />
					<circle cx={0} cy={-788} r={36} fill={NARANJA} />
					<circle cx={0} cy={-788} r={14} fill="#F7F7F2" />
				</g>
				{/* cuerpo */}
				<rect x={-260} y={-648} width={262} height={540} fill={NEGRO} />
				<path d="M 0 -648 H 160 Q 260 -648 260 -548 V -208 Q 260 -108 160 -108 H 0 Z" fill={NARANJA} />
				<path d="M 185 -622 Q 235 -615 237 -565" stroke="#FF8A65" strokeWidth={16} fill="none" strokeLinecap="round" />
				<polyline points="-222,-565 -222,-603 -180,-603" stroke={DETALLE} strokeWidth={10} fill="none" />
				<polyline points="-212,-236 -150,-236 -115,-190 -40,-190" stroke={DETALLE} strokeWidth={10} fill="none" />
				<circle cx={-34} cy={-190} r={12} fill={NARANJA} />
				<line x1={-212} y1={-162} x2={-80} y2={-162} stroke={DETALLE} strokeWidth={10} />
				<circle cx={-74} cy={-162} r={12} fill={NARANJA} />

				{/* ojos */}
				<g transform={`translate(-137 -478) scale(1 ${eyeSY})`}>
					<rect x={-43} y={-43} width={86} height={86} rx={10} fill="#fff" />
					<rect x={-20 + look.x * 10} y={-20 + look.y * 10} width={40} height={40} fill={NEGRO} />
				</g>
				<g transform={`translate(133 -478) scale(1 ${eyeSY})`}>
					<circle r={46} fill="#fff" />
					<circle cx={look.x * 14} cy={look.y * 14} r={22} fill={NEGRO} />
					<circle cx={look.x * 14 + 8} cy={look.y * 14 - 9} r={6} fill="#fff" />
				</g>
				{/* ceño al hacer fuerza */}
				{effort > 0.05 && (
					<g opacity={effort} stroke="#fff" strokeWidth={12} strokeLinecap="round">
						<line x1={-180} y1={-545} x2={-100} y2={-528} />
						<line x1={95} y1={-528} x2={175} y2={-545} />
					</g>
				)}

				{/* boca */}
				<path d={mouthD} fill="#3A0E06" stroke="#fff" strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" />
				{m > 0.35 && <ellipse cx={0} cy={-330 + (botC + 330) * 0.42} rx={34 * m} ry={14 * m} fill="#E8735A" />}

				{/* notebook (se ve la tapa, con el logo de código) */}
				{laptop > 0.01 && (
					<g opacity={Math.min(1, laptop * 1.5)} transform={`translate(0 ${(1 - laptop) * 120})`}>
						<rect x={-230} y={-300} width={460} height={250} rx={18} fill="#2B2D33" stroke="#4A4D55" strokeWidth={6} />
						<text x={0} y={-152} textAnchor="middle" fontFamily="Consolas, monospace" fontWeight={700} fontSize={84} fill={NARANJA}>
							{'</>'}
						</text>
						<rect x={-260} y={-56} width={520} height={34} rx={10} fill="#3A3D45" />
					</g>
				)}
			</g>
			{handsFront && (
				<>
					<circle cx={hL.x} cy={hL.y} r={30} fill={NEGRO} stroke="#000" strokeOpacity={0.25} strokeWidth={4} />
					<circle cx={hR.x} cy={hR.y} r={30} fill={NARANJA} stroke="#000" strokeOpacity={0.2} strokeWidth={4} />
				</>
			)}
		</g>
	);
};

// Pose de reposo (brazos a los costados, pies separados)
export const REST: BitRigPose = {
	handL: {x: -330, y: -250},
	handR: {x: 330, y: -250},
	footL: {x: -150, y: 0},
	footR: {x: 150, y: 0},
};
