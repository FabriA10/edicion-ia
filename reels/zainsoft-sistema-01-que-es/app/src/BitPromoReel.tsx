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
import {BitSprite, BitSpritePose} from './bit/BitSprite';
import amplitudes from './bit/amplitud.json';
import subtitulos from './bit/subtitulos.json';

// Duración total: 1570 frames (52.33 segundos a 30 fps)
export const TOTAL_FRAMES = 1570;

// Palabras clave de alto impacto para colorear (Estilo Hormozi / Retención)
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

export const BitPromoReel: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	// Amplitud de la voz calculada para sincronía orgánica (Bit rebota al hablar)
	const speechBounce = amplitudes[frame] || 0;

	// ══════════════════════════════════════════════════════════════
	// 1. CÁMARA DINÁMICA 2.5D (ZOOMS Y PANEOS CON SPRING / ELÁSTICOS)
	// ══════════════════════════════════════════════════════════════

	// f 0..60 (0:00 - 0:02): Hook inicial con entrada rápida
	const hookSpring = spring({
		frame,
		fps,
		config: {damping: 14, stiffness: 120},
	});
	const hookScale = interpolate(hookSpring, [0, 1], [0.92, 1.05]);

	// f 60..270 (0:02 - 0:09): Zoom in rápido (scale 1.52x) al catálogo
	const catalogZoomSpring = spring({
		frame: Math.max(0, frame - 60),
		fps,
		config: {damping: 15, stiffness: 130},
	});

	// f 270..420 (0:09 - 0:14): Paneo hacia filtros por categoría/talle
	const filterPanSpring = spring({
		frame: Math.max(0, frame - 270),
		fps,
		config: {damping: 16, stiffness: 140},
	});

	// f 420..570 (0:14 - 0:19): Zoom y paneo a "fotos", "stock real" y "guía de medidas"
	const medidasPanSpring = spring({
		frame: Math.max(0, frame - 420),
		fps,
		config: {damping: 15, stiffness: 140},
	});

	// f 570..750 (0:19 - 0:25): Paneo hacia el botón verde de WhatsApp
	const waPanSpring = spring({
		frame: Math.max(0, frame - 570),
		fps,
		config: {damping: 14, stiffness: 150},
	});

	// f 750..960 (0:25 - 0:32): Reencuadre para 100% autogestionable
	const autoPanSpring = spring({
		frame: Math.max(0, frame - 750),
		fps,
		config: {damping: 16, stiffness: 120},
	});

	// f 960..1120 (0:32 - 0:37): Paneo lateral para mostrar a Bit programando a medida
	const codePanSpring = spring({
		frame: Math.max(0, frame - 960),
		fps,
		config: {damping: 15, stiffness: 130},
	});

	// f 1120..1280 (0:37 - 0:42): Paneo al botón de arrepentimiento / Ley
	const legalPanSpring = spring({
		frame: Math.max(0, frame - 1120),
		fps,
		config: {damping: 15, stiffness: 140},
	});

	// f 1280..1415 (0:42 - 0:47): Plano de confianza "solo fotos y datos"
	const photosPanSpring = spring({
		frame: Math.max(0, frame - 1280),
		fps,
		config: {damping: 15, stiffness: 120},
	});

	// f 1415..1570 (0:47 - 0:52.3): Cierre elegante y zoom out suave
	const exitPanSpring = spring({
		frame: Math.max(0, frame - 1415),
		fps,
		config: {damping: 18, stiffness: 90},
	});

	// Cálculo del Transform de la cámara 2.5D (enfocada en el teléfono)
	let camScale = hookScale;
	let camPanX = 0;
	let camPanY = 0;

	if (frame < 60) {
		camScale = hookScale;
		camPanX = 0;
		camPanY = 15;
	} else if (frame < 270) {
		camScale = interpolate(catalogZoomSpring, [0, 1], [1.05, 1.52]);
		camPanX = 0;
		camPanY = interpolate(catalogZoomSpring, [0, 1], [15, 65]);
	} else if (frame < 420) {
		camScale = interpolate(filterPanSpring, [0, 1], [1.52, 1.54]);
		camPanX = interpolate(filterPanSpring, [0, 1], [0, -30]);
		camPanY = interpolate(filterPanSpring, [0, 1], [65, 120]);
	} else if (frame < 570) {
		camScale = interpolate(medidasPanSpring, [0, 1], [1.54, 1.62]);
		camPanX = interpolate(medidasPanSpring, [0, 1], [-30, 0]);
		camPanY = interpolate(medidasPanSpring, [0, 1], [120, 80]);
	} else if (frame < 750) {
		// Paneo centrado hacia el botón verde de WhatsApp en la esquina inferior del cel
		camScale = interpolate(waPanSpring, [0, 1], [1.62, 1.65]);
		camPanX = interpolate(waPanSpring, [0, 1], [0, -60]);
		camPanY = interpolate(waPanSpring, [0, 1], [80, -180]);
	} else if (frame < 960) {
		camScale = interpolate(autoPanSpring, [0, 1], [1.65, 1.25]);
		camPanX = interpolate(autoPanSpring, [0, 1], [-60, 40]);
		camPanY = interpolate(autoPanSpring, [0, 1], [-180, 15]);
	} else if (frame < 1120) {
		camScale = interpolate(codePanSpring, [0, 1], [1.25, 1.32]);
		camPanX = interpolate(codePanSpring, [0, 1], [40, 90]);
		camPanY = interpolate(codePanSpring, [0, 1], [15, 15]);
	} else if (frame < 1280) {
		camScale = interpolate(legalPanSpring, [0, 1], [1.32, 1.56]);
		camPanX = interpolate(legalPanSpring, [0, 1], [90, 0]);
		camPanY = interpolate(legalPanSpring, [0, 1], [15, 210]);
	} else if (frame < 1415) {
		camScale = interpolate(photosPanSpring, [0, 1], [1.56, 1.12]);
		camPanX = interpolate(photosPanSpring, [0, 1], [0, 0]);
		camPanY = interpolate(photosPanSpring, [0, 1], [210, 10]);
	} else {
		camScale = interpolate(exitPanSpring, [0, 1], [1.12, 0.95]);
		camPanX = 0;
		camPanY = 0;
	}

	// ══════════════════════════════════════════════════════════════
	// 2. COREOGRAFÍA Y POSES DINÁMICAS DE BIT (BitSprite.tsx)
	// Posicionado en capa frontal 2.5D: NUNCA se corta, siempre visible
	// ══════════════════════════════════════════════════════════════
	let bitPose: BitSpritePose = 'principal';
	let bitWalking = false;
	let bitFacing: 1 | -1 = 1;
	let bitX = 1100;
	let bitY = 1240;
	let bitScale = 0.58;

	// ── 0:00 - 0:02 (f 0..60): Hook. Entra rápido por la derecha con spring bounce
	if (frame < 60) {
		const bitEntry = spring({
			frame,
			fps,
			config: {damping: 12, stiffness: 180},
		});
		bitX = interpolate(bitEntry, [0, 1], [1150, 780]);
		bitY = 1240;
		bitWalking = frame < 35;
		bitFacing = -1;
		bitPose = frame < 40 ? 'principal' : 'saludando';
	}
	// ── 0:02 - 0:09 (f 60..270): Slide lateral hacia la izquierda acompañando el zoom
	else if (frame >= 60 && frame < 270) {
		const slideLeft = spring({
			frame: frame - 60,
			fps,
			config: {damping: 14, stiffness: 120},
		});
		bitX = interpolate(slideLeft, [0, 1], [780, 140]);
		bitY = 1240;
		bitWalking = frame >= 60 && frame < 95;
		bitFacing = 1; // Mirando hacia la pantalla del celular
		bitPose = 'pensando'; // Señala la pantalla
	}
	// ── 0:09 - 0:14 (f 270..420): Filtros y categorías
	else if (frame >= 270 && frame < 420) {
		bitX = 140;
		bitY = 1240;
		bitFacing = 1;
		bitPose = 'principal';
	}
	// ── 0:14 - 0:19 (f 420..570): Guía de medidas y stock
	else if (frame >= 420 && frame < 570) {
		bitX = 140;
		bitY = 1240;
		bitFacing = 1;
		bitPose = 'pensando';
	}
	// ── 0:19 - 0:25 (f 570..750): ¡Llega a WhatsApp! Festejo y salto
	else if (frame >= 570 && frame < 750) {
		const hopSpring = spring({
			frame: Math.max(0, frame - 610),
			fps,
			config: {damping: 11, stiffness: 210},
		});
		const hopY = interpolate(hopSpring, [0, 0.5, 1], [0, -45, 0]);
		bitX = 140;
		bitY = 1240 + hopY;
		bitFacing = 1;
		bitPose = 'festejando';
	}
	// ── 0:25 - 0:32 (f 750..960): 100% autogestionable
	else if (frame >= 750 && frame < 960) {
		bitX = 140;
		bitY = 1240;
		bitFacing = 1;
		bitPose = 'principal';
	}
	// ── 0:32 - 0:37 (f 960..1120): "Ojo acá no usamos plantillas... programamos tu tienda"
	else if (frame >= 960 && frame < 1120) {
		const codeSlide = spring({
			frame: frame - 960,
			fps,
			config: {damping: 14, stiffness: 120},
		});
		bitX = interpolate(codeSlide, [0, 1], [140, 180]);
		bitY = 1240;
		bitWalking = frame >= 960 && frame < 990;
		bitFacing = 1;
		bitPose = 'programando'; // Bit con su laptop tecleando
	}
	// ── 0:37 - 0:42 (f 1120..1280): Botón de arrepentimiento / ley
	else if (frame >= 1120 && frame < 1280) {
		bitX = 140;
		bitY = 1240;
		bitFacing = 1;
		bitPose = 'pensando';
	}
	// ── 0:42 - 0:47 (f 1280..1415): "Solo pasarnos las fotos... del resto nos encargamos"
	else if (frame >= 1280 && frame < 1415) {
		bitX = 140;
		bitY = 1240;
		bitFacing = 1;
		bitPose = 'festejando';
	}
	// ── 0:47 - 0:52.3 (f 1415..1570): Cierre final señalando el logo de ZainSoft
	else {
		const finalMove = spring({
			frame: frame - 1415,
			fps,
			config: {damping: 15, stiffness: 110},
		});
		bitX = interpolate(finalMove, [0, 1], [140, 640]);
		bitY = 1250;
		bitWalking = frame >= 1415 && frame < 1450;
		bitFacing = -1; // Mirando hacia el logo a la izquierda
		bitPose = 'saludando'; // Señala el logo
		bitScale = 0.65;
	}

	// ══════════════════════════════════════════════════════════════
	// 3. POP-UPS 2D DINÁMICOS (ESTÍMULOS CADA 2-3 SEGUNDOS)
	// ══════════════════════════════════════════════════════════════

	// f 85..200: Tienda Online
	const showBadgeOnline = frame >= 85 && frame < 220;
	const sBadgeOnline = spring({
		frame: Math.max(0, frame - 85),
		fps,
		config: {damping: 12, stiffness: 180},
	});

	// f 230..350: Filtro rápido
	const showBadgeFilter = frame >= 230 && frame < 360;
	const sBadgeFilter = spring({
		frame: Math.max(0, frame - 230),
		fps,
		config: {damping: 12, stiffness: 180},
	});

	// f 420..540: Guía de medidas + stock
	const showBadgeMedidas = frame >= 420 && frame < 550;
	const sBadgeMedidas = spring({
		frame: Math.max(0, frame - 420),
		fps,
		config: {damping: 12, stiffness: 180},
	});

	// f 605..740: Pop-up estelar de WhatsApp (Click/Pop elástico)
	const showBadgeWhatsApp = frame >= 605 && frame < 740;
	const sBadgeWhatsApp = spring({
		frame: Math.max(0, frame - 612),
		fps,
		config: {damping: 11, stiffness: 220},
	});

	// f 760..890: 100% autogestionable
	const showBadgeAuto = frame >= 760 && frame < 900;
	const sBadgeAuto = spring({
		frame: Math.max(0, frame - 760),
		fps,
		config: {damping: 12, stiffness: 180},
	});

	// f 975..1100: Código a medida
	const showBadgeCode = frame >= 975 && frame < 1110;
	const sBadgeCode = spring({
		frame: Math.max(0, frame - 975),
		fps,
		config: {damping: 12, stiffness: 180},
	});

	// f 1130..1260: Botón de arrepentimiento
	const showBadgeLegal = frame >= 1130 && frame < 1260;
	const sBadgeLegal = spring({
		frame: Math.max(0, frame - 1135),
		fps,
		config: {damping: 12, stiffness: 190},
	});

	// f 1275..1395: Solo fotos
	const showBadgePhotos = frame >= 1275 && frame < 1400;
	const sBadgePhotos = spring({
		frame: Math.max(0, frame - 1275),
		fps,
		config: {damping: 12, stiffness: 180},
	});

	// Cierre final con ZainSoft
	const isFinalLogoScreen = frame >= 1415;
	const logoFade = interpolate(frame, [1415, 1440], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// ══════════════════════════════════════════════════════════════
	// 4. SUBTÍTULOS DE RETENCIÓN EXTREMA (CENTRO-ALTO, HANDO BOLD)
	// ══════════════════════════════════════════════════════════════

	// Cue activo según el tiempo actual
	const activeCue = subtitulos.find((s) => t >= s.start && t < s.end);

	// Animación pop-up rápida para cada cambio de subtítulo
	const cueStartFrame = activeCue ? Math.round(activeCue.start * fps) : 0;
	const cueAge = frame - cueStartFrame;
	const cuePopSpring = spring({
		frame: Math.max(0, cueAge),
		fps,
		config: {damping: 13, stiffness: 240},
	});
	const cueScale = interpolate(cuePopSpring, [0, 1], [0.82, 1.0]);

	// Función para renderizar palabras con color de alta retención
	const renderRetentionWords = (text: string) => {
		const words = text.split(' ');
		return words.map((w, i) => {
			const clean = w.toLowerCase().replace(/[^a-záéíóúñ0-9%]/gi, '');
			let color = '#FFFFFF';
			let textGlow = '0 0 14px rgba(255, 255, 255, 0.25)';

			if (KEYWORDS_GREEN.has(clean)) {
				color = '#00FF88'; // Verde brillante neón
				textGlow = '0 0 20px rgba(0, 255, 136, 0.65)';
			} else if (KEYWORDS_YELLOW.has(clean)) {
				color = '#FFE600'; // Amarillo vibrante
				textGlow = '0 0 20px rgba(255, 230, 0, 0.65)';
			}

			return (
				<span
					key={i}
					style={{
						color,
						textShadow: `0 4px 18px rgba(0, 0, 0, 0.98), 0 2px 4px rgba(0, 0, 0, 0.95), ${textGlow}`,
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
				backgroundColor: '#0A0B0E',
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
			    AUDIO MASTERIZADO (-14.5 LUFS) + EFECTOS CADA 2-3 SEGUNDOS
			══════════════════════════════════════════════════════════════ */}
			{/* Voz principal de Bit */}
			<Audio src={staticFile('bit_voz.mp3')} volume={1.0} />

			{/* Estímulos de audio cada 2-3 segundos según paquete-efectos-cada-3s.md */}
			{/* 0:00 Hook Whoosh de inicio */}
			<Sequence from={0} durationInFrames={35}>
				<Audio src={staticFile('Paper in Air.aac')} volume={0.4} />
			</Sequence>
			{/* 0:01 Bit Pop in */}
			<Sequence from={20} durationInFrames={30}>
				<Audio src={staticFile('Drop.aac')} volume={0.35} />
			</Sequence>
			{/* 0:02 Zoom in rápido al catálogo */}
			<Sequence from={60} durationInFrames={35}>
				<Audio src={staticFile('Spinning.aac')} volume={0.3} />
			</Sequence>
			{/* 0:04 Badge Tienda Online */}
			<Sequence from={130} durationInFrames={30}>
				<Audio src={staticFile('Scan.aac')} volume={0.3} />
			</Sequence>
			{/* 0:07 Búsqueda y Filtros */}
			<Sequence from={220} durationInFrames={30}>
				<Audio src={staticFile('Counter.aac')} volume={0.3} />
			</Sequence>
			{/* 0:10 Ropa y Stock */}
			<Sequence from={310} durationInFrames={30}>
				<Audio src={staticFile('Drop.aac')} volume={0.35} />
			</Sequence>
			{/* 0:13 Guía de Medidas (Marker sound) */}
			<Sequence from={410} durationInFrames={30}>
				<Audio src={staticFile('Marker.aac')} volume={0.35} />
			</Sequence>
			{/* 0:16 Fotos reales (Camera flash) */}
			<Sequence from={480} durationInFrames={30}>
				<Audio src={staticFile('camera flash.aac')} volume={0.35} />
			</Sequence>
			{/* 0:19 Paneo rápido hacia WhatsApp */}
			<Sequence from={585} durationInFrames={30}>
				<Audio src={staticFile('Stone motion.aac')} volume={0.35} />
			</Sequence>
			{/* 0:20 Pop-up WhatsApp Click/Pop */}
			<Sequence from={612} durationInFrames={35}>
				<Audio src={staticFile('poof.aac')} volume={0.45} />
			</Sequence>
			{/* 0:25 Autogestionable 100% */}
			<Sequence from={760} durationInFrames={30}>
				<Audio src={staticFile('Electricity.aac')} volume={0.3} />
			</Sequence>
			{/* 0:29 Cambio de precios en vivo */}
			<Sequence from={880} durationInFrames={30}>
				<Audio src={staticFile('Flicker.aac')} volume={0.3} />
			</Sequence>
			{/* 0:32 "Ojo acá no usamos plantillas" */}
			<Sequence from={970} durationInFrames={30}>
				<Audio src={staticFile('Glitch.aac')} volume={0.35} />
			</Sequence>
			{/* 0:35 Código línea por línea */}
			<Sequence from={1060} durationInFrames={30}>
				<Audio src={staticFile('Counter.aac')} volume={0.3} />
			</Sequence>
			{/* 0:38 Botón de Arrepentimiento */}
			<Sequence from={1135} durationInFrames={30}>
				<Audio src={staticFile('poof.aac')} volume={0.4} />
			</Sequence>
			{/* 0:42 Solo pasarnos fotos */}
			<Sequence from={1265} durationInFrames={30}>
				<Audio src={staticFile('camera flash.aac')} volume={0.35} />
			</Sequence>
			{/* 0:45 Del resto nos encargamos nosotros */}
			<Sequence from={1340} durationInFrames={30}>
				<Audio src={staticFile('Drop.aac')} volume={0.35} />
			</Sequence>
			{/* 0:47 Cierre épico ZainSoft */}
			<Sequence from={1415} durationInFrames={50}>
				<Audio src={staticFile('Bass Drop.aac')} volume={0.45} />
			</Sequence>

			{/* ══════════════════════════════════════════════════════════════
			    FONDO 2.5D: ILUMINACIÓN VOLUMÉTRICA DE MARCA
			══════════════════════════════════════════════════════════════ */}
			<AbsoluteFill>
				<div
					style={{
						position: 'absolute',
						top: -120,
						left: -120,
						width: 750,
						height: 750,
						borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(240, 90, 43, 0.22) 0%, transparent 68%)',
						filter: 'blur(90px)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						bottom: -100,
						right: -100,
						width: 850,
						height: 850,
						borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(16, 45, 110, 0.28) 0%, transparent 70%)',
						filter: 'blur(90px)',
					}}
				/>
			</AbsoluteFill>

			{/* ══════════════════════════════════════════════════════════════
			    ESCENARIO 2.5D (CÁMARA VIRTUAL CON SCALE Y PANEOS DINÁMICOS)
			══════════════════════════════════════════════════════════════ */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transform: `scale(${camScale}) translate(${camPanX}px, ${camPanY}px)`,
					transformOrigin: '50% 50%',
					opacity: isFinalLogoScreen ? 1 - logoFade : 1,
				}}
			>
				{/* ── CELULAR 2.5D CON PANTALLA ULTRA NÍTIDA ── */}
				<div
					style={{
						position: 'absolute',
						top: 360,
						left: 275,
						width: 530,
						height: 1100,
						zIndex: 20,
					}}
				>
					{/* Sombra 2.5D suave en el piso */}
					<div
						style={{
							position: 'absolute',
							bottom: -70,
							left: '8%',
							width: '84%',
							height: 48,
							borderRadius: '50%',
							backgroundColor: 'rgba(0, 0, 0, 0.75)',
							filter: 'blur(22px)',
						}}
					/>

					{/* Marco metálico realista */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							borderRadius: 50,
							padding: 8,
							background:
								'linear-gradient(145deg, #3E434F 0%, #15171E 35%, #2B303C 70%, #121418 100%)',
							boxShadow:
								'0 25px 70px rgba(0, 0, 0, 0.85), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 5px rgba(0, 0, 0, 0.8)',
							border: '1.5px solid rgba(255, 255, 255, 0.16)',
							overflow: 'hidden',
						}}
					>
						{/* Pantalla del celular con Pierina Glow */}
						<div
							style={{
								position: 'absolute',
								inset: 4,
								borderRadius: 44,
								backgroundColor: '#000',
								overflow: 'hidden',
							}}
						>
							{/* Dynamic Island */}
							<div
								style={{
									position: 'absolute',
									top: 12,
									left: '50%',
									transform: 'translateX(-50%)',
									width: 114,
									height: 26,
									borderRadius: 18,
									backgroundColor: '#000',
									zIndex: 35,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'flex-end',
									paddingRight: 8,
								}}
							>
								<div
									style={{
										width: 10,
										height: 10,
										borderRadius: '50%',
										backgroundColor: '#0A1224',
										border: '1.5px solid #1A2538',
									}}
								/>
							</div>

							{/* Video real en bucle continuo de Pierina Glow (scroll rápido y sin vacíos) */}
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

							{/* Sutil brillo de cristal en diagonal */}
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background:
										'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 32%, transparent 60%)',
									pointerEvents: 'none',
									zIndex: 30,
								}}
							/>
						</div>
					</div>

					{/* ── POP-UP 2D ESTELAR: WHATSAPP DIRECTO (f 605..740) ── */}
					{showBadgeWhatsApp && (
						<div
							style={{
								position: 'absolute',
								top: '48%',
								left: '50%',
								transform: `translate(-50%, -50%) scale(${interpolate(sBadgeWhatsApp, [0, 1], [0, 1.05])})`,
								padding: '18px 28px',
								borderRadius: 32,
								background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
								boxShadow:
									'0 20px 50px rgba(37, 211, 102, 0.65), 0 0 25px rgba(255, 255, 255, 0.4)',
								border: '2px solid rgba(255, 255, 255, 0.75)',
								display: 'flex',
								alignItems: 'center',
								gap: 16,
								zIndex: 45,
								color: '#FFFFFF',
								fontFamily: 'HandoBold, sans-serif',
								whiteSpace: 'nowrap',
							}}
						>
							<svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
								<path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.059-2.02-.489-1.579-.654-2.58-2.28-2.658-2.384-.077-.104-.637-.847-.637-1.614 0-.767.4-1.144.542-1.299.143-.155.312-.194.417-.194.104 0 .208.002.299.006.096.004.224-.037.35.267.129.312.441 1.077.48 1.156.039.078.065.17.013.273-.052.104-.078.169-.156.26-.078.091-.163.203-.233.273-.078.078-.16.162-.069.318.091.156.405.668.868 1.08.597.532 1.1.697 1.256.775.156.078.247.065.338-.039.091-.104.39-.455.494-.611.104-.156.208-.13.35-.078.143.052.909.429 1.065.507.156.078.26.117.299.182.039.065.039.377-.105.782z" />
							</svg>
							<div>
								<div style={{fontSize: 26, fontWeight: 'bold', lineHeight: 1.1}}>
									¡Pedido al WhatsApp!
								</div>
								<div style={{fontSize: 16, opacity: 0.9, marginTop: 2}}>
									Cerrá la venta al instante
								</div>
							</div>
						</div>
					)}

					{/* ── POP-UP 2D: BOTÓN DE ARREPENTIMIENTO (LEY) ── */}
					{showBadgeLegal && (
						<div
							style={{
								position: 'absolute',
								bottom: 110,
								left: '50%',
								transform: `translateX(-50%) scale(${interpolate(sBadgeLegal, [0, 1], [0, 1.05])})`,
								padding: '14px 24px',
								borderRadius: 26,
								background: 'linear-gradient(135deg, #F05A2B 0%, #D4380D 100%)',
								boxShadow: '0 12px 35px rgba(240, 90, 43, 0.65)',
								border: '2px solid rgba(255, 255, 255, 0.85)',
								color: '#FFFFFF',
								fontFamily: 'HandoBold, sans-serif',
								fontSize: 22,
								fontWeight: 'bold',
								whiteSpace: 'nowrap',
								zIndex: 45,
							}}
						>
							⚖️ Botón de Arrepentimiento (Ley)
						</div>
					)}
				</div>

				{/* ── BADGES FLOTANTES 2D EN EL ESCENARIO ── */}
				{showBadgeOnline && (
					<div
						style={{
							position: 'absolute',
							top: 540,
							left: 450,
							transform: `scale(${interpolate(sBadgeOnline, [0, 1], [0, 1])})`,
							padding: '12px 22px',
							borderRadius: 22,
							backgroundColor: 'rgba(10, 11, 14, 0.88)',
							backdropFilter: 'blur(10px)',
							border: '1.5px solid #00FF88',
							boxShadow: '0 10px 30px rgba(0, 255, 136, 0.35)',
							color: '#FFFFFF',
							fontFamily: 'HandoBold, sans-serif',
							zIndex: 35,
						}}
					>
						<div style={{fontSize: 22, color: '#00FF88', fontWeight: 'bold'}}>
							👗 Tienda Online Activa
						</div>
						<div style={{fontSize: 15, color: '#EAECEF', marginTop: 2}}>
							Ropa & Moda Tucumán
						</div>
					</div>
				)}

				{showBadgeFilter && (
					<div
						style={{
							position: 'absolute',
							top: 540,
							left: 450,
							transform: `scale(${interpolate(sBadgeFilter, [0, 1], [0, 1])})`,
							padding: '12px 22px',
							borderRadius: 22,
							backgroundColor: 'rgba(10, 11, 14, 0.88)',
							backdropFilter: 'blur(10px)',
							border: '1.5px solid #FFE600',
							boxShadow: '0 10px 30px rgba(255, 230, 0, 0.35)',
							color: '#FFFFFF',
							fontFamily: 'HandoBold, sans-serif',
							zIndex: 35,
						}}
					>
						<div style={{fontSize: 22, color: '#FFE600', fontWeight: 'bold'}}>
							⚡ Filtros por Talle
						</div>
						<div style={{fontSize: 15, color: '#EAECEF', marginTop: 2}}>
							Búsqueda rápida en catálogo
						</div>
					</div>
				)}

				{showBadgeMedidas && (
					<div
						style={{
							position: 'absolute',
							top: 540,
							left: 450,
							transform: `scale(${interpolate(sBadgeMedidas, [0, 1], [0, 1])})`,
							padding: '12px 22px',
							borderRadius: 22,
							backgroundColor: 'rgba(10, 11, 14, 0.88)',
							backdropFilter: 'blur(10px)',
							border: '1.5px solid #00FF88',
							boxShadow: '0 10px 30px rgba(0, 255, 136, 0.35)',
							color: '#FFFFFF',
							fontFamily: 'HandoBold, sans-serif',
							zIndex: 35,
						}}
					>
						<div style={{fontSize: 22, color: '#00FF88', fontWeight: 'bold'}}>
							📏 Guía de Medidas + Stock
						</div>
						<div style={{fontSize: 15, color: '#EAECEF', marginTop: 2}}>
							¡Para no pifiarle al talle!
						</div>
					</div>
				)}

				{showBadgeAuto && (
					<div
						style={{
							position: 'absolute',
							top: 540,
							left: 450,
							transform: `scale(${interpolate(sBadgeAuto, [0, 1], [0, 1])})`,
							padding: '12px 24px',
							borderRadius: 22,
							backgroundColor: 'rgba(10, 11, 14, 0.88)',
							backdropFilter: 'blur(10px)',
							border: '1.5px solid #00FF88',
							boxShadow: '0 10px 30px rgba(0, 255, 136, 0.35)',
							color: '#FFFFFF',
							fontFamily: 'HandoBold, sans-serif',
							zIndex: 35,
						}}
					>
						<div style={{fontSize: 22, color: '#00FF88', fontWeight: 'bold'}}>
							⚙️ 100% Autogestionable
						</div>
						<div style={{fontSize: 15, color: '#EAECEF', marginTop: 2}}>
							Vos misma cambiás precios y stock
						</div>
					</div>
				)}

				{showBadgeCode && (
					<div
						style={{
							position: 'absolute',
							top: 540,
							left: 450,
							transform: `scale(${interpolate(sBadgeCode, [0, 1], [0, 1])})`,
							padding: '12px 24px',
							borderRadius: 22,
							backgroundColor: 'rgba(10, 11, 14, 0.88)',
							backdropFilter: 'blur(10px)',
							border: '1.5px solid #F05A2B',
							boxShadow: '0 10px 30px rgba(240, 90, 43, 0.4)',
							color: '#FFFFFF',
							fontFamily: 'HandoBold, sans-serif',
							zIndex: 35,
						}}
					>
						<div style={{fontSize: 22, color: '#F05A2B', fontWeight: 'bold'}}>
							💻 Código 100% a Medida
						</div>
						<div style={{fontSize: 15, color: '#EAECEF', marginTop: 2}}>
							Línea por línea · Cero plantillas
						</div>
					</div>
				)}

				{showBadgePhotos && (
					<div
						style={{
							position: 'absolute',
							top: 540,
							left: 450,
							transform: `scale(${interpolate(sBadgePhotos, [0, 1], [0, 1])})`,
							padding: '12px 24px',
							borderRadius: 22,
							backgroundColor: 'rgba(10, 11, 14, 0.88)',
							backdropFilter: 'blur(10px)',
							border: '1.5px solid #FFE600',
							boxShadow: '0 10px 30px rgba(255, 230, 0, 0.35)',
							color: '#FFFFFF',
							fontFamily: 'HandoBold, sans-serif',
							zIndex: 35,
						}}
					>
						<div style={{fontSize: 22, color: '#FFE600', fontWeight: 'bold'}}>
							📸 Solo Fotos y Datos
						</div>
						<div style={{fontSize: 15, color: '#EAECEF', marginTop: 2}}>
							Del resto nos encargamos nosotros
						</div>
					</div>
				)}

			</div>

			{/* ── BIT PERSONAJE EN PRIMER PLANO 2.5D (NUNCA SE SALE DE CUADRO) ── */}
			{!isFinalLogoScreen && (
				<div
					style={{
						position: 'absolute',
						left: bitX,
						top: bitY,
						width: 500 * bitScale,
						height: 500 * bitScale,
						zIndex: 35,
						pointerEvents: 'none',
					}}
				>
					<BitSprite
						frame={frame}
						pose={bitPose}
						walking={bitWalking}
						speechBounce={speechBounce}
						facing={bitFacing}
					/>
				</div>
			)}

			{/* ══════════════════════════════════════════════════════════════
			    SUBTÍTULOS DE ALTA RETENCIÓN (CENTRO-ALTO, HANDO BOLD)
			    Respetando márgenes de 120px de zona roja y zona superior
			══════════════════════════════════════════════════════════════ */}
			{!isFinalLogoScreen && (
				<div
					style={{
						position: 'absolute',
						top: 270, // Ubicado en el centro-alto de la pantalla
						left: 120, // Márgenes de 120px para celulares 20:9
						right: 120,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 45,
						pointerEvents: 'none',
					}}
				>
					{/* 0:00 - 0:02: Hook visual con subtítulo gigante */}
					{frame < 60 ? (
						<div
							style={{
								fontFamily: 'HandoBold, sans-serif',
								fontSize: 56,
								fontWeight: 'bold',
								textAlign: 'center',
								lineHeight: 1.15,
								letterSpacing: -0.5,
								textTransform: 'lowercase',
								transform: `scale(${cueScale})`,
								padding: '12px 28px',
								borderRadius: 24,
								backgroundColor: 'rgba(10, 11, 14, 0.72)',
								backdropFilter: 'blur(10px)',
								WebkitBackdropFilter: 'blur(10px)',
								border: '1.5px solid rgba(255, 230, 0, 0.35)',
								boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
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
								fontSize: 48,
								fontWeight: 'bold',
								textAlign: 'center',
								lineHeight: 1.15,
								letterSpacing: -0.5,
								textTransform: 'lowercase',
								transform: `scale(${cueScale})`,
								padding: '12px 26px',
								borderRadius: 22,
								backgroundColor: 'rgba(10, 11, 14, 0.72)',
								backdropFilter: 'blur(10px)',
								WebkitBackdropFilter: 'blur(10px)',
								border: '1px solid rgba(255, 255, 255, 0.14)',
								boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
							}}
						>
							{renderRetentionWords(activeCue.text)}
						</div>
					) : null}
				</div>
			)}

			{/* ══════════════════════════════════════════════════════════════
			    CIERRE FINAL: PANTALLA LIMPIA, PLANA CON LOGO DE ZAINSOFT
			    Zoom out suave, Bit señalando el logo, CTA claro
			══════════════════════════════════════════════════════════════ */}
			{isFinalLogoScreen && (
				<AbsoluteFill
					style={{
						backgroundColor: '#0A0B0E',
						opacity: logoFade,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 50,
						paddingLeft: 120,
						paddingRight: 120,
					}}
				>
					{/* Logo grande, limpio y plano de ZainSoft */}
					<Img
						src={staticFile('zainsoft_logo_transp.png')}
						style={{
							width: 620,
							maxWidth: '85%',
							objectFit: 'contain',
							display: 'block',
							filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.8))',
						}}
					/>

					<div
						style={{
							marginTop: 38,
							color: '#FFFFFF',
							fontFamily: 'HandoBold, sans-serif',
							fontSize: 34,
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
							marginTop: 14,
							color: '#F05A2B',
							fontFamily: 'HandoBold, sans-serif',
							fontSize: 28,
							fontWeight: 'bold',
							letterSpacing: 1.2,
							textTransform: 'lowercase',
							textShadow: '0 0 20px rgba(240, 90, 43, 0.5)',
						}}
					>
						escribinos hoy
					</div>

					{/* Bit señalando el logo en la pantalla de cierre */}
					<div
						style={{
							position: 'absolute',
							bottom: 120,
							right: 140,
							width: 300,
							height: 300,
						}}
					>
						<BitSprite
							frame={frame}
							pose="saludando"
							speechBounce={speechBounce}
							facing={-1}
						/>
					</div>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};
