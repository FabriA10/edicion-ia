import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const HolaMundo: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'}}>
			<h1 style={{fontSize: 120, fontFamily: 'sans-serif', opacity}}>¡Hola Remotion!</h1>
		</AbsoluteFill>
	);
};
