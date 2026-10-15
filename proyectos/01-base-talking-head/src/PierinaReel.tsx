import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Easing,
	Img,
	interpolate,
	OffthreadVideo,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// Cortes de salto del video
const JUMP_CUTS = [203, 375];
// El outro arranca en el frame 410 (~13.6s), cuando empieza a hablar de ZainSoft
const OUTRO_START = 410;

// Subtítulos sobrios, elegantes, SIN EMOJIS, con el estilo tipográfico de la web
const CAPTIONS = [
	{start: 0.0, end: 1.8, text: 'La dueña de Pierina Glow nos dijo:', highlight: 'Pierina Glow'},
	{start: 1.9, end: 3.6, text: '"Quiero una web linda para mi ropa..."', highlight: 'web linda'},
	{start: 3.6, end: 6.2, text: '...y creo que se nos fue un poco la mano', highlight: 'se nos fue'},
	{start: 6.5, end: 8.5, text: 'Animación de entrada con brillo', highlight: 'brillo'},
	{start: 8.7, end: 10.3, text: 'Fotos que cargan al instante', highlight: 'al instante'},
	{start: 10.3, end: 13.4, text: 'Un catálogo que te da ganas de comprarte todo', highlight: 'comprarte todo'},
	{start: 13.7, end: 17.4, text: 'En ZainSoft somos cuatro estudiantes de la UTN', highlight: 'ZainSoft'},
	{start: 17.6, end: 19.5, text: 'Cero plantillas genéricas', highlight: 'Cero plantillas'},
	{start: 19.5, end: 21.4, text: 'Hacemos sistemas que venden', highlight: 'que venden'},
	{start: 21.6, end: 24.5, text: 'Escribinos si querés que tu marca juegue en primera', highlight: 'Escribinos'},
];

// Pantalla del celular mucho más grande y protagonista
const SCREEN_W = 660; // Antes 560
const SCREEN_H = 1328; // Proporcional al video (576 x 1160)
const BEZEL = 7;

export const PierinaReel: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// ── Entrada suave del teléfono
	const intro = spring({frame, fps, config: {damping: 200}, durationInFrames: 20});

	// ── Zoom sutil en los cortes de salto
	const bump = JUMP_CUTS.reduce((acc, cut) => {
		const d = frame - cut;
		if (d < -4 || d > 14) return acc;
		return acc + interpolate(d, [-4, 0, 14], [0, 0.03, 0], {
			easing: Easing.out(Easing.cubic),
		});
	}, 0);

	// ── Cierre: cuando habla de ZainSoft (frame 410 en adelante)
	// El teléfono se reduce de forma suave y elegante hacia arriba
	const outro = spring({
		frame: frame - OUTRO_START,
		fps,
		config: {damping: 180},
		durationInFrames: 26,
	});

	const phoneScale = interpolate(intro, [0, 1], [0.95, 1.0]) * (1 + bump) * interpolate(outro, [0, 1], [1.0, 0.62]);
	const phoneY = interpolate(outro, [0, 1], [-20, -320]);

	// Animación de la tarjeta premium de ZainSoft
	const card = spring({
		frame: frame - (OUTRO_START + 6),
		fps,
		config: {damping: 18, stiffness: 120},
	});

	// ── Subtítulo activo
	const t = frame / fps;
	const cap = CAPTIONS.find((c) => t >= c.start && t < c.end);
	const capIn = cap
		? interpolate(t - cap.start, [0, 0.15], [0, 1], {
				extrapolateRight: 'clamp',
				easing: Easing.out(Easing.cubic),
		  })
		: 0;

	const badgeOpacity = interpolate(frame, [6, 18, OUTRO_START, OUTRO_START + 10], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0c0a09',
				fontFamily: '"Plus Jakarta Sans", "Segoe UI", Inter, system-ui, sans-serif',
				overflow: 'hidden',
			}}
		>
			{/* ── AUDIO: Locución normalizada ── */}
			<Audio src={staticFile('voz.mp3')} volume={1.0} />

			{/* ── AUDIO: Música de fondo ── */}
			<Audio
				src={staticFile('musica.mp3')}
				volume={(f) =>
					interpolate(f, [0, 15, OUTRO_START, OUTRO_START + 20, 720, 745], [0, 0.10, 0.10, 0.18, 0.18, 0], {
						extrapolateRight: 'clamp',
					})
				}
			/>

			{/* Efectos de sonido muy sutiles */}
			{JUMP_CUTS.map((c) => (
				<Sequence key={c} from={c - 8} durationInFrames={30}>
					<Audio src={staticFile('whoosh.mp3')} volume={0.12} />
				</Sequence>
			))}
			<Sequence from={OUTRO_START + 4} durationInFrames={30}>
				<Audio src={staticFile('pop.mp3')} volume={0.18} />
			</Sequence>

			{/* ── FONDO: video desenfocado con atmósfera cálida Pierina ── */}
			<AbsoluteFill style={{opacity: 0.35, filter: 'blur(70px) saturate(1.2)', transform: 'scale(1.3)'}}>
				<OffthreadVideo
					src={staticFile('pierina_pagina.mp4')}
					muted
					style={{width: '100%', height: '100%', objectFit: 'cover'}}
				/>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse at 50% 35%, rgba(232, 146, 124, 0.15) 0%, rgba(12, 10, 9, 0.94) 75%)',
				}}
			/>

			{/* ── BADGE SUPERIOR ESTILO WEB PIERINA ── */}
			<div
				style={{
					position: 'absolute',
					top: 130,
					left: 0,
					right: 0,
					display: 'flex',
					justifyContent: 'center',
					opacity: badgeOpacity,
					zIndex: 30,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 10,
						padding: '10px 24px',
						borderRadius: 50,
						background: 'rgba(255, 255, 255, 0.06)',
						backdropFilter: 'blur(16px)',
						WebkitBackdropFilter: 'blur(16px)',
						border: '1px solid rgba(255, 255, 255, 0.12)',
						boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
					}}
				>
					<span
						style={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							backgroundColor: '#ff7b54',
							boxShadow: '0 0 10px #ff7b54',
						}}
					/>
					<span
						style={{
							color: '#fff',
							fontSize: 22,
							fontWeight: 600,
							letterSpacing: 1.5,
							textTransform: 'lowercase',
							fontFamily: 'monospace',
						}}
					>
						bypierina.netlify.app
					</span>
				</div>
			</div>

			{/* ── TELÉFONO CENTRAL (MÁS GRANDE Y PROTAGONISTA) ── */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					transform: `translateY(${phoneY}px) scale(${phoneScale})`,
					opacity: intro,
					zIndex: 20,
				}}
			>
				<div
					style={{
						width: SCREEN_W + BEZEL * 2,
						height: SCREEN_H + BEZEL * 2,
						padding: BEZEL,
						borderRadius: 62,
						background: 'linear-gradient(160deg, #383432, #181514)',
						boxShadow: '0 45px 100px rgba(0, 0, 0, 0.85), 0 0 50px rgba(232, 146, 124, 0.15)',
						boxSizing: 'border-box',
					}}
				>
					<div
						style={{
							width: SCREEN_W,
							height: SCREEN_H,
							borderRadius: 55,
							overflow: 'hidden',
							background: '#f7f1ec',
						}}
					>
						<OffthreadVideo
							src={staticFile('pierina_pagina.mp4')}
							muted
							style={{width: '100%', height: '100%', objectFit: 'cover'}}
						/>
					</div>
				</div>
			</div>

			{/* ── CIERRE: PRESENTACIÓN ZAINSOFT (SIN CUADRO DE FONDO) ── */}
			{frame >= OUTRO_START && (
				<div
					style={{
						position: 'absolute',
						top: 1110,
						left: 0,
						right: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						zIndex: 40,
						opacity: card,
						transform: `translateY(${(1 - card) * 35}px)`,
						gap: 16,
					}}
				>
					<div
						style={{
							fontSize: 20,
							color: '#c49b88', // Tono cálido apagado más sobrio
							fontWeight: 600,
							letterSpacing: 2.5,
							textTransform: 'uppercase',
							textShadow: '0 2px 8px rgba(0,0,0,0.6)',
						}}
					>
						Desarrollo web a medida
					</div>

					{/* Logo ZainSoft exacto: icono negro original y tipografía clara suave */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Img
							src={staticFile('zainsoft_exacto.png')}
							style={{
								width: 360,
								filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))',
							}}
						/>
					</div>

					<div
						style={{
							fontSize: 26,
							color: '#d6cfc7', // Blanco templado apagado en vez de blanco chillón
							textAlign: 'center',
							fontWeight: 500,
							letterSpacing: 0.3,
							textShadow: '0 2px 8px rgba(0,0,0,0.7)',
						}}
					>
						4 estudiantes de ingeniería en sistemas · UTN
					</div>

					{/* Botón flotante con tono naranja sobrio mate, sin resplandor excesivo */}
					<div
						style={{
							marginTop: 4,
							padding: '15px 44px',
							borderRadius: 50,
							background: 'linear-gradient(135deg, #e06038, #c84e27)',
							color: '#ffffff',
							fontSize: 28,
							fontWeight: 700,
							letterSpacing: 0.5,
							boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45)',
						}}
					>
						Link en bio · Hablemos
					</div>
				</div>
			)}

			{/* ── SUBTÍTULOS ELEGANTES SIN CUADRO DE FONDO (TEXTO PURO CINEMATOGRÁFICO) ── */}
			{cap && (
				<div
					style={{
						position: 'absolute',
						top: frame >= OUTRO_START ? 1630 : 1620,
						left: 40,
						right: 40,
						display: 'flex',
						justifyContent: 'center',
						zIndex: 50,
						opacity: capIn,
						transform: `translateY(${(1 - capIn) * 12}px)`,
					}}
				>
					<span
						style={{
							fontSize: 44,
							fontWeight: 800,
							color: '#ffffff',
							letterSpacing: '-0.3px',
							lineHeight: 1.25,
							textAlign: 'center',
							textShadow:
								'0 3px 6px rgba(0,0,0,0.9), 0 6px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.8)',
							maxWidth: '92%',
						}}
					>
						{cap.text.split(cap.highlight).map((part, i, arr) => (
							<React.Fragment key={i}>
								{part}
								{i < arr.length - 1 && (
									<span
										style={{
											color: '#ff9a76',
											textShadow:
												'0 0 25px rgba(255, 154, 118, 0.7), 0 3px 6px rgba(0,0,0,0.9)',
											padding: '0 4px',
										}}
									>
										{cap.highlight}
									</span>
								)}
							</React.Fragment>
						))}
					</span>
				</div>
			)}
		</AbsoluteFill>
	);
};
