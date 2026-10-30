import React from 'react';
import {Composition} from 'remotion';
import {TarjetasReel, REEL_FRAMES} from './reel/TarjetasReel';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="TarjetasReel" component={TarjetasReel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
		</>
	);
};
