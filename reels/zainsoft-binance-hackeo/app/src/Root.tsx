import React from 'react';
import {Composition} from 'remotion';
import {BinanceReel, REEL_FRAMES} from './reel/BinanceReel';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="BinanceReel" component={BinanceReel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
		</>
	);
};
