import React from 'react';
import {Audio, staticFile, useCurrentFrame, interpolate} from 'remotion';
import audio from '../data/audio.json';
import {FPS} from '../theme';

/**
 * Optional music bed.
 *
 * No soundtrack ships with this render - see AUDIO.md for why. The project is
 * wired so that dropping a single file at reel/public/audio/music.mp3 and
 * re-running `npm run render` mixes it in automatically, with the dynamic arc
 * the brief asks for already applied:
 *
 *   SRP 350 / 400   minimal and intricate, held back
 *   SRP 501 / 601   opens up as the monitors get larger
 *   SLF 210 V3 BL   low end takes over the mix
 *   CTA             settles back so the closing text reads
 *
 * The envelope below is a level arc, not a substitute for a track that actually
 * has that dynamic range - pick or generate one that does.
 */
const {hasMusic} = audio as {hasMusic: boolean};

/** Segment boundaries in seconds, matching the timeline in Reel.tsx. */
const ARC: {at: number; level: number}[] = [
	{at: 0, level: 0.0},
	{at: 1, level: 0.16},
	{at: 7, level: 0.2},
	{at: 21, level: 0.22},
	{at: 35, level: 0.3},
	{at: 49, level: 0.38},
	{at: 62, level: 0.44},
	{at: 76, level: 0.5},
	{at: 83, level: 0.46},
	{at: 92, level: 0.3},
	{at: 96, level: 0.0},
];

export const Music: React.FC = () => {
	const frame = useCurrentFrame();
	if (!hasMusic) return null;

	const t = frame / FPS;
	const volume = interpolate(
		t,
		ARC.map((a) => a.at),
		ARC.map((a) => a.level),
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	return <Audio src={staticFile('audio/music.mp3')} volume={volume} />;
};
