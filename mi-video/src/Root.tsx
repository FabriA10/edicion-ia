import React from 'react';
import {Composition} from 'remotion';
import {HolaMundo} from './HolaMundo';
import {PierinaReel} from './PierinaReel';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="PierinaReel"
				component={PierinaReel}
				durationInFrames={745}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="HolaMundo"
				component={HolaMundo}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};

