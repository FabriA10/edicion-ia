import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';

export type BitSpritePose = 'saludando' | 'principal' | 'pensando' | 'programando' | 'festejando';

export interface BitSpriteProps {
	frame: number;
	pose: BitSpritePose;
	walking?: boolean;
	speechBounce?: number; // 0..1 derivado de la amplitud del audio
	facing?: 1 | -1;
	style?: React.CSSProperties;
}

const POSE_IMAGES: Record<BitSpritePose, string> = {
	saludando: 'bit-saludando.png',
	principal: 'bit-principal.png',
	pensando: 'bit-pensando.png',
	programando: 'bit-programando.png',
	festejando: 'bit-festejando.png',
};

export const BitSprite: React.FC<BitSpriteProps> = ({
	frame,
	pose,
	walking = false,
	speechBounce = 0,
	facing = 1,
	style,
}) => {
	const t = frame / 30;

	// ── Caminata: balanceo y paso
	const walkCycle = walking ? Math.sin(t * Math.PI * 5) : 0;
	const walkBobY = walking ? Math.abs(Math.sin(t * Math.PI * 5)) * -18 : 0;
	const walkTilt = walking ? walkCycle * 4 : 0;

	// ── Rebote suave al hablar (habla orgánica al ritmo de la voz)
	const speechBobY = speechBounce > 0.04 ? Math.sin(t * 14) * 8 * speechBounce : 0;
	const speechScaleY = 1 + (speechBounce > 0.04 ? Math.sin(t * 14) * 0.025 * speechBounce : 0);
	const speechScaleX = 1 - (speechBounce > 0.04 ? Math.sin(t * 14) * 0.015 * speechBounce : 0);

	// Respiración sutil en reposo
	const idleBreathe = Math.sin(t * 2.2) * 4;

	const totalY = walkBobY + speechBobY + (walking ? 0 : idleBreathe);
	const totalTilt = walkTilt + (speechBounce > 0.08 ? Math.sin(t * 7) * 1.5 : 0);

	const imgSrc = staticFile(POSE_IMAGES[pose] || 'bit-principal.png');

	return (
		<div
			style={{
				position: 'relative',
				display: 'inline-block',
				transform: `scaleX(${facing}) translate3d(0, ${totalY}px, 0) rotate(${totalTilt * facing}deg) scale(${speechScaleX}, ${speechScaleY})`,
				transformOrigin: '50% 90%',
				filter: 'drop-shadow(0 18px 24px rgba(0, 0, 0, 0.55))',
				...style,
			}}
		>
			{/* Sombra en el piso */}
			<div
				style={{
					position: 'absolute',
					bottom: 15,
					left: '18%',
					width: '64%',
					height: 24,
					borderRadius: '50%',
					backgroundColor: 'rgba(0, 0, 0, 0.45)',
					filter: 'blur(8px)',
					transform: `scale(${1 - totalY * 0.01})`,
				}}
			/>

			{/* Imagen original del personaje Bit (fiel, sin deformaciones de rostro) */}
			<Img
				src={imgSrc}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'contain',
					display: 'block',
				}}
			/>
		</div>
	);
};
