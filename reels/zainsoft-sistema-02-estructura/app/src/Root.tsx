import React from 'react';
import {Composition} from 'remotion';
import {EstructuraReel, REEL_FRAMES} from './reel/EstructuraReel';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="SistemaReel02" component={EstructuraReel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
		</>
	);
};
