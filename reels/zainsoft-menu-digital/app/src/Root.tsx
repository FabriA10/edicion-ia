import React from 'react';
import {Composition} from 'remotion';
import {MenuReel, REEL_FRAMES} from './reel/MenuReel';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="MenuReel" component={MenuReel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
		</>
	);
};
