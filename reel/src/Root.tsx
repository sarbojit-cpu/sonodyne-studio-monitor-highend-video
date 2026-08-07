import React from 'react';
import {Composition} from 'remotion';
import {Reel, REEL_DURATION} from './Reel';
import {Thumbnail} from './Thumbnail';
import {Fonts} from './components/Fonts';
import {FPS, WIDTH, HEIGHT} from './theme';

const withFonts =
	(Inner: React.FC<any>): React.FC<any> =>
	(props) => (
		<>
			<Fonts />
			<Inner {...props} />
		</>
	);

const ReelWithFonts = withFonts(Reel);
const ThumbWithFonts = withFonts(Thumbnail);

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="Reel"
			component={ReelWithFonts}
			durationInFrames={REEL_DURATION}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
		/>
		{(['en', 'hi', 'bn'] as const).map((lang) => (
			<Composition
				key={lang}
				id={`Thumbnail-${lang.toUpperCase()}`}
				component={ThumbWithFonts}
				durationInFrames={1}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				defaultProps={{lang}}
			/>
		))}
	</>
);
