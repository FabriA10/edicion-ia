import React from 'react';
import {Composition} from 'remotion';
import {TurnosReel, REEL_FRAMES} from './reel/TurnosReel';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="TurnosReel" component={TurnosReel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
		</>
	);
};
