import React from 'react';
import {Composition} from 'remotion';
import {SenalesReel, REEL_FRAMES} from './reel/SenalesReel';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="SenalesReel" component={SenalesReel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
		</>
	);
};
