import React from 'react';
import {Composition} from 'remotion';
import {CaidaReel, REEL_FRAMES} from './reel/CaidaReel';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="CaidaReel" component={CaidaReel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
		</>
	);
};
