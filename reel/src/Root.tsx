import React from 'react';
import {Composition} from 'remotion';
import {Reel, REEL_DURATION} from './Reel';
import {Thumbnail} from './Thumbnail';
import {LongForm} from './long/LongForm';
import {LongThumbnail} from './long/LongThumbnail';
import {LONG_DURATION} from './long/timeline';
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
const LongFormWithFonts = withFonts(LongForm);
const LongThumbWithFonts = withFonts(LongThumbnail);

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
		<Composition
			id="LongForm"
			component={LongFormWithFonts}
			durationInFrames={LONG_DURATION}
			fps={FPS}
			width={1920}
			height={1080}
		/>
		{(['en', 'hi', 'bn'] as const).map((lang) => (
			<Composition
				key={`long-${lang}`}
				id={`LongThumbnail-${lang.toUpperCase()}`}
				component={LongThumbWithFonts}
				durationInFrames={1}
				fps={FPS}
				width={1920}
				height={1080}
				defaultProps={{lang}}
			/>
		))}
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
