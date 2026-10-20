import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Img,
	interpolate,
	Loop,
	OffthreadVideo,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import amplitudes from './bit/amplitud.json';
import subtitulos from './bit/subtitulos.json';

export const TOTAL_FRAMES = 1570;

// Palabras clave para resaltado dinámico de alta retención
const KEYWORDS_GREEN = new Set([
	'whatsapp',
	'autogestionable',
	'tienda',
	'online',
	'stock',
	'medidas',
	'precios',
	'ley',
	'profesional',
	'rapidísimo',
	'filtrar',
	'filtran',
	'talle',
	'categoría',
	'actualiza',
]);

const KEYWORDS_YELLOW = new Set([
	'bit',
	'zainsoft',
	'pierina',
	'glow',
	'ropa',
	'fotos',
	'plantillas',
	'medida',
	'arrepentimiento',
	'armar',
	'trabajo',
	'trabajo...',
	'línea',
	'ojo',
	'código',
]);

export const BitMixedReality: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	// Curva RMS de amplitud para rebote acústico
	const speechBounce = amplitudes[frame] || 0;

	// ══════════════════════════════════════════════════════════════
	// 1. ESTADO DE LA PANTALLA DEL CELULAR (CAPA 1)
	// Encendido exacto en frame 180 tras el botón; apagado en frame 1450
	// ══════════════════════════════════════════════════════════════
	const isScreenOn = frame >= 180 && frame < 1450;

	// Destello de encendido (f 180..188)
	const turnOnFlash =
		frame >= 180 && frame <= 188
			? interpolate(frame, [180, 182, 188], [0, 0.85, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
			  })
			: 0;

	// Fade de apagado suave (f 1448..1452)
	const screenOpacity = isScreenOn
		? interpolate(frame, [180, 184], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
		  })
		: 0;

	// ══════════════════════════════════════════════════════════════
	// 2. COREOGRAFÍA Y ANIMACIÓN DE BIT (CAPA 3)
	// ══════════════════════════════════════════════════════════════
	let bitSprite = 'bit_4_saludo.png';
	let bitX = 185;
	let bitY = 1380;
	let bitFacing: 1 | -1 = 1;
	let bitScale = 0.42;
	let bitRot = 0;

	// ── f 0 a 20: bit_1_salto.png subiendo desde abajo y cayendo levemente
	if (frame < 20) {
		bitSprite = 'bit_1_salto.png';
		const jumpProgress = spring({
			frame,
			fps,
			config: {damping: 12, stiffness: 160},
		});
		bitX = 185;
		bitY = interpolate(jumpProgress, [0, 0.65, 1], [1920, 1530, 1610]);
		bitScale = 0.44;
	}
	// ── f 20 a 45: bit_2_colgado.png agarrado del borde inferior de la mesa
	else if (frame >= 20 && frame < 45) {
		bitSprite = 'bit_2_colgado.png';
		bitX = 185;
		// Balanceo sutil de estar colgado
		const hangSwing = Math.sin((frame - 20) * 0.35) * 6;
		bitY = 1610 + hangSwing;
		bitRot = Math.sin((frame - 20) * 0.3) * 3;
		bitScale = 0.43;
	}
	// ── f 45 a 65: bit_3_trepando.png subiendo a la superficie
	else if (frame >= 45 && frame < 65) {
		bitSprite = 'bit_3_trepando.png';
		const climbProgress = spring({
			frame: frame - 45,
			fps,
			config: {damping: 14, stiffness: 140},
		});
		bitX = 185;
		bitY = interpolate(climbProgress, [0, 1], [1610, 1380]);
		bitScale = 0.42;
	}
	// ── f 65 a 150: bit_4_saludo.png de pie junto al celular saludando
	else if (frame >= 65 && frame < 150) {
		bitSprite = 'bit_4_saludo.png';
		bitX = 185;
		bitY = 1380 - speechBounce * 12;
		bitScale = 0.42;
	}
	// ── f 150 a 180 (Salto y encendido): Salto hacia el botón lateral físico
	else if (frame >= 150 && frame < 180) {
		bitSprite = 'bit_6_boton.png';
		const jumpProg = (frame - 150) / 30; // 0 a 1
		// Curva parabólica suave: sube rápido, toca el botón y cae
		const jumpCurve = Math.sin(jumpProg * Math.PI);
		// X viaja hasta el botón lateral (X: 185 -> 345 -> 185)
		bitX = interpolate(jumpProg, [0, 0.55, 1], [185, 345, 185]);
		// Y asciende hasta la altura del botón del celular (Y: 1380 -> 900 -> 1380)
		bitY = 1380 - jumpCurve * 480;
		bitScale = 0.42;
	}
	// ── f 180 a 350: bit_5_senala.png señalando la tienda mientras corre el scroll
	else if (frame >= 180 && frame < 350) {
		bitSprite = 'bit_5_senala.png';
		bitX = 185;
		bitY = 1380 - speechBounce * 10;
		bitScale = 0.42;
	}
	// ── f 350 a 570: Ficha de producto y medidas (Bit atento señalando)
	else if (frame >= 350 && frame < 570) {
		bitSprite = frame % 120 < 60 ? 'bit_5_senala.png' : 'bit_4_saludo.png';
		bitX = 185;
		bitY = 1380 - speechBounce * 12;
		bitScale = 0.42;
	}
	// ── f 570 a 750: bit_7_festejo.png rebotando al hablar de WhatsApp
	else if (frame >= 570 && frame < 750) {
		bitSprite = 'bit_7_festejo.png';
		// Saltitos rítmicos de alegría
		const danceHop = Math.abs(Math.sin((frame - 570) * 0.45)) * -28;
		bitX = 185;
		bitY = 1380 + danceHop - speechBounce * 15;
		bitScale = 0.43;
	}
	// ── f 750 a 960: Autogestionable (Bit explicando)
	else if (frame >= 750 && frame < 960) {
		bitSprite = 'bit_4_saludo.png';
		bitX = 185;
		bitY = 1380 - speechBounce * 12;
		bitScale = 0.42;
	}
	// ── f 960 a 1120: bit-programando.png con su mini laptop (código a medida)
	else if (frame >= 960 && frame < 1120) {
		bitSprite = 'bit-programando.png';
		bitX = 175;
		bitY = 1395 - speechBounce * 8;
		bitScale = 0.46;
	}
	// ── f 1120 a 1410: Botón de arrepentimiento y fotos (señala)
	else if (frame >= 1120 && frame < 1410) {
		bitSprite = 'bit_5_senala.png';
		bitX = 185;
		bitY = 1380 - speechBounce * 12;
		bitScale = 0.42;
	}
	// ── f 1410 a 1450 (Apagado): Salto dinámico tocando de nuevo el botón lateral
	else if (frame >= 1410 && frame < 1450) {
		bitSprite = 'bit_6_boton.png';
		const offProg = (frame - 1410) / 40; // 0 a 1
		const offJumpCurve = Math.sin(offProg * Math.PI);
		bitX = interpolate(offProg, [0, 0.55, 1], [185, 345, 185]);
		bitY = 1380 - offJumpCurve * 480;
		bitScale = 0.42;
	}
	// ── f 1450 a 1570 (Salida): bit_8_camina.png trotando hacia la derecha
	else {
		bitSprite = 'bit_8_camina.png';
		// Trota cruzando la mesa hacia la derecha de frame 1450 a 1535
		const exitProgress = interpolate(frame, [1450, 1535], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
		bitX = interpolate(exitProgress, [0, 1], [185, 1150]);
		const trotBob = Math.abs(Math.sin((frame - 1450) * 0.75)) * -20;
		bitY = 1380 + trotBob;
		bitFacing = 1; // Mirando hacia la derecha
		bitScale = 0.42;
	}

	// ══════════════════════════════════════════════════════════════
	// 3. CAPA 4: CIERRE ZAINSOFT Y SUBTÍTULOS
	// ══════════════════════════════════════════════════════════════
	const showFinalBranding = frame >= 1455;
	const finalBrandingSpring = spring({
		frame: Math.max(0, frame - 1455),
		fps,
		config: {damping: 14, stiffness: 110},
	});

	// Subtítulo activo de subtitulos.json
	const activeCue = subtitulos.find((s) => t >= s.start && t < s.end);
	const cueStartFrame = activeCue ? Math.round(activeCue.start * fps) : 0;
	const cueAge = frame - cueStartFrame;
	const cuePop = spring({
		frame: Math.max(0, cueAge),
		fps,
		config: {damping: 13, stiffness: 240},
	});
	const cueScale = interpolate(cuePop, [0, 1], [0.85, 1.0]);

	const renderWords = (text: string) => {
		const words = text.split(' ');
		return words.map((w, i) => {
			const clean = w.toLowerCase().replace(/[^a-záéíóúñ0-9%]/gi, '');
			let color = '#FFFFFF';
			let glow = '0 0 14px rgba(255, 255, 255, 0.3)';

			if (KEYWORDS_GREEN.has(clean)) {
				color = '#00FF88';
				glow = '0 0 20px rgba(0, 255, 136, 0.65)';
			} else if (KEYWORDS_YELLOW.has(clean)) {
				color = '#FFE600';
				glow = '0 0 20px rgba(255, 230, 0, 0.65)';
			}

			return (
				<span
					key={i}
					style={{
						color,
						textShadow: `0 4px 18px rgba(0, 0, 0, 0.98), 0 2px 4px rgba(0, 0, 0, 0.95), ${glow}`,
						marginRight: i < words.length - 1 ? 12 : 0,
						display: 'inline-block',
					}}
				>
					{w}
				</span>
			);
		});
	};

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#000000',
				overflow: 'hidden',
			}}
		>
			<style>{`
				@font-face {
					font-family: 'HandoBold';
					src: url('${staticFile('Hando.otf')}') format('opentype');
					font-weight: bold;
				}
			`}</style>

			{/* ══════════════════════════════════════════════════════════════
			    AUDIO: VOZ PRINCIPAL + EFECTOS DE CLIC MECÁNICO
			══════════════════════════════════════════════════════════════ */}
			{/* Voz oficial de Bit */}
			<Audio src={staticFile('bit_voz.mp3')} volume={1.0} />

			{/* Sonidos complementarios y clic mecánico al tocar el botón lateral */}
			{/* f 0: Entrada inicial de Bit */}
			<Sequence from={0} durationInFrames={25}>
				<Audio src={staticFile('Drop.aac')} volume={0.35} />
			</Sequence>

			{/* f 170: Clic mecánico de encendido */}
			<Sequence from={172} durationInFrames={25}>
				<Audio src={staticFile('poof.aac')} volume={0.5} />
			</Sequence>
			<Sequence from={175} durationInFrames={30}>
				<Audio src={staticFile('Scan.aac')} volume={0.3} />
			</Sequence>

			{/* f 605: WhatsApp audio */}
			<Sequence from={605} durationInFrames={30}>
				<Audio src={staticFile('poof.aac')} volume={0.45} />
			</Sequence>

			{/* f 1440: Clic mecánico de apagado */}
			<Sequence from={1440} durationInFrames={25}>
				<Audio src={staticFile('poof.aac')} volume={0.5} />
			</Sequence>

			{/* f 1460: Drop de cierre con ZainSoft */}
			<Sequence from={1460} durationInFrames={50}>
				<Audio src={staticFile('Bass Drop.aac')} volume={0.45} />
			</Sequence>

			{/* ══════════════════════════════════════════════════════════════
			    CAPA 1: VIDEO WEB (pierina.mp4)
			    Ubicado y escalado exactamente dentro del marco del portacelular
			    Bounds exactos en 1080x1920: Left 401, Top 674, Width 285, Height 635
			══════════════════════════════════════════════════════════════ */}
			<div
				style={{
					position: 'absolute',
					left: 401,
					top: 674,
					width: 286,
					height: 636,
					backgroundColor: '#000000',
					overflow: 'hidden',
					zIndex: 10,
					borderRadius: 22,
				}}
			>
				{/* Contenedor del video con opacidad controlada */}
				<div
					style={{
						width: '100%',
						height: '100%',
						opacity: screenOpacity,
					}}
				>
					<Loop durationInFrames={745}>
						<OffthreadVideo
							src={staticFile('pierina.mp4')}
							muted
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
					</Loop>
				</div>

				{/* Flash blanco momentáneo de encendido en frame 180 */}
				{turnOnFlash > 0 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundColor: '#FFFFFF',
							opacity: turnOnFlash,
							pointerEvents: 'none',
						}}
					/>
				)}
			</div>

			{/* ══════════════════════════════════════════════════════════════
			    CAPA 2: ESCENARIO REAL (escritorio_transparente.png)
			    Cubre toda la pantalla con la pantalla del celular transparente
			══════════════════════════════════════════════════════════════ */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					zIndex: 20,
					pointerEvents: 'none',
				}}
			>
				<Img
					src={staticFile('assets/escritorio_transparente.png')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						display: 'block',
					}}
				/>
			</div>

			{/* ══════════════════════════════════════════════════════════════
			    CAPA 3: ANIMACIÓN Y COREOGRAFÍA FÍSICA DE BIT
			    Interacción física 2.5D sobre el escritorio
			══════════════════════════════════════════════════════════════ */}
			<div
				style={{
					position: 'absolute',
					left: bitX,
					top: bitY,
					zIndex: 60,
					transform: `scaleX(${bitFacing}) rotate(${bitRot}deg)`,
					transformOrigin: '50% 90%',
					filter: 'drop-shadow(0 14px 20px rgba(0, 0, 0, 0.65))',
					pointerEvents: 'none',
				}}
			>
				{/* Sombra de Bit en la superficie de la mesa */}
				<div
					style={{
						position: 'absolute',
						bottom: 8,
						left: '15%',
						width: '70%',
						height: 18,
						borderRadius: '50%',
						backgroundColor: 'rgba(0, 0, 0, 0.45)',
						filter: 'blur(6px)',
					}}
				/>

				<Img
					src={staticFile(`assets/${bitSprite}`)}
					style={{
						width: 500 * bitScale,
						height: 500 * bitScale,
						objectFit: 'contain',
						display: 'block',
					}}
				/>
			</div>

			{/* ══════════════════════════════════════════════════════════════
			    CAPA 4: SUBTÍTULOS DE ALTA RETENCIÓN (PARTE SUPERIOR)
			    Margen seguro de 120px, Hando Bold, sin tapar el celular
			══════════════════════════════════════════════════════════════ */}
			{!showFinalBranding && (
				<div
					style={{
						position: 'absolute',
						top: 160, // Ubicado en la parte superior para no tapar el teléfono
						left: 120,
						right: 120,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 40,
						pointerEvents: 'none',
					}}
				>
					{frame < 60 ? (
						<div
							style={{
								fontFamily: 'HandoBold, sans-serif',
								fontSize: 54,
								fontWeight: 'bold',
								textAlign: 'center',
								lineHeight: 1.15,
								letterSpacing: -0.5,
								textTransform: 'lowercase',
								transform: `scale(${cueScale})`,
								padding: '12px 28px',
								borderRadius: 24,
								backgroundColor: 'rgba(10, 11, 14, 0.82)',
								backdropFilter: 'blur(12px)',
								WebkitBackdropFilter: 'blur(12px)',
								border: '1.5px solid rgba(255, 230, 0, 0.35)',
								boxShadow: '0 10px 35px rgba(0, 0, 0, 0.75)',
							}}
						>
							<span
								style={{
									color: '#FFFFFF',
									textShadow: '0 4px 18px rgba(0,0,0,0.98), 0 2px 4px rgba(0,0,0,0.95)',
									marginRight: 12,
								}}
							>
								mirá
							</span>
							<span
								style={{
									color: '#FFFFFF',
									textShadow: '0 4px 18px rgba(0,0,0,0.98), 0 2px 4px rgba(0,0,0,0.95)',
									marginRight: 12,
								}}
							>
								el
							</span>
							<span
								style={{
									color: '#FFE600',
									textShadow:
										'0 4px 18px rgba(0,0,0,0.98), 0 0 20px rgba(255, 230, 0, 0.75)',
								}}
							>
								trabajo...
							</span>
						</div>
					) : activeCue ? (
						<div
							style={{
								fontFamily: 'HandoBold, sans-serif',
								fontSize: 46,
								fontWeight: 'bold',
								textAlign: 'center',
								lineHeight: 1.15,
								letterSpacing: -0.5,
								textTransform: 'lowercase',
								transform: `scale(${cueScale})`,
								padding: '12px 26px',
								borderRadius: 22,
								backgroundColor: 'rgba(10, 11, 14, 0.82)',
								backdropFilter: 'blur(12px)',
								WebkitBackdropFilter: 'blur(12px)',
								border: '1.5px solid rgba(255, 255, 255, 0.16)',
								boxShadow: '0 10px 35px rgba(0, 0, 0, 0.75)',
							}}
						>
							{renderWords(activeCue.text)}
						</div>
					) : null}
				</div>
			)}

			{/* ══════════════════════════════════════════════════════════════
			    CAPA 4: CIERRE ZAINSOFT CON SPRING Y LLAMADO A LA ACCIÓN
			    Al apagarse el teléfono y salir Bit (f 1450+)
			══════════════════════════════════════════════════════════════ */}
			{showFinalBranding && (
				<AbsoluteFill
					style={{
						backgroundColor: 'rgba(10, 11, 14, 0.94)',
						opacity: interpolate(finalBrandingSpring, [0, 1], [0, 1]),
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 50,
						paddingLeft: 120,
						paddingRight: 120,
					}}
				>
					{/* Logo gigante de ZainSoft centrado */}
					<Img
						src={staticFile('zainsoft_logo_transp.png')}
						style={{
							width: 650,
							maxWidth: '85%',
							objectFit: 'contain',
							display: 'block',
							transform: `scale(${interpolate(finalBrandingSpring, [0, 1], [0.85, 1])})`,
							filter: 'drop-shadow(0 20px 45px rgba(0,0,0,0.9))',
						}}
					/>

					<div
						style={{
							marginTop: 40,
							color: '#FFFFFF',
							fontFamily: 'HandoBold, sans-serif',
							fontSize: 36,
							fontWeight: 'bold',
							letterSpacing: 1.5,
							textTransform: 'lowercase',
							textAlign: 'center',
							textShadow: '0 4px 18px rgba(0, 0, 0, 0.95)',
						}}
					>
						desarrollo web a medida
					</div>

					<div
						style={{
							marginTop: 16,
							color: '#F05A2B',
							fontFamily: 'HandoBold, sans-serif',
							fontSize: 30,
							fontWeight: 'bold',
							letterSpacing: 1.2,
							textTransform: 'lowercase',
							textShadow: '0 0 24px rgba(240, 90, 43, 0.6)',
						}}
					>
						escribinos hoy
					</div>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};
