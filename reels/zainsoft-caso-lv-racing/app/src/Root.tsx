import React from 'react';
import {Composition} from 'remotion';
import {LvReel, REEL_FRAMES} from './reel/LvReel';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			{/* subtítulos con volumen (extrusión): aprobado por el usuario el 2026-11-20 */}
			<Composition id="LvReel" component={LvReel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} defaultProps={{sub3d: true}} />
		</>
	);
};
