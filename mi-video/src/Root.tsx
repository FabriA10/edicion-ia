import React from 'react';
import {Composition} from 'remotion';
import {BitPromoReel, TOTAL_FRAMES} from './BitPromoReel';
import {BitMixedReality} from './BitMixedReality';
import {PierinaReel} from './PierinaReel';
import {BitStudioReel, BIT_STUDIO_FRAMES} from './BitStudioReel';
import {BitRigTest, BIT_RIG_TEST_FRAMES} from './BitRigTest';
import {PierinaBitReel, PIERINA_BIT_FRAMES} from './PierinaBitReel';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="BitMixedReality"
				component={BitMixedReality}
				durationInFrames={TOTAL_FRAMES}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="BitPromoReel"
				component={BitPromoReel}
				durationInFrames={TOTAL_FRAMES}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="PierinaReel"
				component={PierinaReel}
				durationInFrames={745}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="PierinaBitReel"
				component={PierinaBitReel}
				durationInFrames={PIERINA_BIT_FRAMES}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="BitRigTest"
				component={BitRigTest}
				durationInFrames={BIT_RIG_TEST_FRAMES}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="BitStudioReel"
				component={BitStudioReel}
				durationInFrames={BIT_STUDIO_FRAMES}
				fps={30}
				width={1080}
				height={1920}
			/>
		</>
	);
};
