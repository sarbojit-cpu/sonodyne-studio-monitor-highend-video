import React from 'react';
import {interpolate, useCurrentFrame, Img, Easing} from 'remotion';
import {img} from '../components/Frame';
import {COLOR, FONT, EASE} from '../theme';
import type {Contact} from '../data/contacts';

/**
 * Landscape composition system for the long-form cut (1920x1080).
 *
 * The reel's strict three-zone portrait split is deliberately NOT ported here -
 * landscape documentary composition works differently. The same underlying
 * principles hold instead: branding present but never overwhelming, generous
 * safe padding on all sides, no dead frame space, no clutter. Product segments
 * run a stage pane and a text pane side by side; branding lives as lower-third
 * moments at segment transitions rather than the reel's continuous cycling,
 * because a 10-minute viewer is watching, not scrolling.
 */

export const LONG_W = 1920;
export const LONG_H = 1080;
export const LPAD = 84;

export const easeText = Easing.bezier(...EASE.text);

export const rise = (local: number, delay: number, travel = 24) => {
	const e = interpolate(local, [delay, delay + 20], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeText,
	});
	return {opacity: e, transform: `translateY(${(1 - e) * travel}px)`};
};

export const settle = (local: number, duration: number, out = 18) =>
	interpolate(local, [duration - out, duration], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

/** Left product stage: ~55% of the frame, full height under the padding. */
export const StagePane: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			top: 0,
			width: LONG_W * 0.56,
			height: LONG_H,
		}}
	>
		{children}
	</div>
);

/** Right text column with the safe padding applied. */
export const TextPane: React.FC<{
	children?: React.ReactNode;
	style?: React.CSSProperties;
}> = ({children, style}) => (
	<div
		style={{
			position: 'absolute',
			left: LONG_W * 0.55,
			top: 0,
			width: LONG_W * 0.45 - LPAD,
			height: LONG_H,
			paddingTop: LPAD,
			paddingBottom: LPAD,
			boxSizing: 'border-box',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			gap: 26,
			...style,
		}}
	>
		{children}
	</div>
);

/**
 * Lower-third Shivansh logo moment. Same non-negotiables as the reel: applied
 * straight onto the frame, never boxed with other content, never shrunk to
 * share space. Long-form just schedules these at transitions instead of
 * cycling them continuously.
 */
export const LowerThirdLogo: React.FC<{
	from: number;
	duration: number;
	align?: 'left' | 'right';
	width?: number;
}> = ({from, duration, align = 'left', width = 460}) => {
	const frame = useCurrentFrame();
	const local = frame - from;
	if (local < 0 || local > duration) return null;
	const e = interpolate(local, [0, 18], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeText,
	});
	const o = interpolate(local, [duration - 16, duration], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div
			style={{
				position: 'absolute',
				bottom: 64,
				[align]: 72,
				opacity: Math.min(e, o),
				transform: `translateX(${(1 - e) * (align === 'left' ? -36 : 36)}px)`,
			}}
		>
			<Img
				src={img('img/logo-shivansh-trim.png')}
				style={{
					width,
					height: 'auto',
					filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.6))',
				}}
			/>
		</div>
	);
};

/** A single contact lockup in the opposite lower corner from the logo. */
export const LowerThirdContact: React.FC<{
	from: number;
	duration: number;
	contact: Contact;
	align?: 'left' | 'right';
}> = ({from, duration, contact, align = 'right'}) => {
	const frame = useCurrentFrame();
	const local = frame - from;
	if (local < 0 || local > duration) return null;
	const e = interpolate(local, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeText,
	});
	const o = interpolate(local, [duration - 14, duration], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div
			style={{
				position: 'absolute',
				bottom: 72,
				[align]: 84,
				display: 'flex',
				alignItems: 'center',
				gap: 14,
				opacity: Math.min(e, o),
				transform: `translateY(${(1 - e) * 18}px)`,
			}}
		>
			<span style={{fontSize: 28, lineHeight: 1}}>{contact.icon}</span>
			<div>
				<div
					style={{
						fontFamily: FONT.data,
						fontWeight: 600,
						fontSize: 20,
						letterSpacing: 2.2,
						textTransform: 'uppercase',
						color: COLOR.textFaint,
					}}
				>
					{contact.label}
				</div>
				<div
					style={{
						fontFamily: FONT.display,
						fontWeight: 600,
						fontSize: 28,
						color: COLOR.text,
					}}
				>
					{contact.value}
				</div>
			</div>
		</div>
	);
};

/** Landscape headline block - same hierarchy as the reel, scaled for 16:9. */
export const LongHeadline: React.FC<{
	name: string;
	tagline: string;
	room: string;
	local: number;
	duration: number;
}> = ({name, tagline, room, local, duration}) => (
	<div style={{opacity: settle(local, duration)}}>
		<div
			style={{
				...rise(local, 6),
				fontFamily: FONT.display,
				fontWeight: 800,
				fontSize: 84,
				letterSpacing: -1.8,
				lineHeight: 1,
				color: COLOR.text,
				textShadow: '0 6px 28px rgba(0,0,0,0.6)',
			}}
		>
			{name}
		</div>
		<div
			style={{
				...rise(local, 13),
				marginTop: 12,
				fontFamily: FONT.data,
				fontWeight: 600,
				fontSize: 36,
				letterSpacing: 4.4,
				textTransform: 'uppercase',
				color: COLOR.accentSoft,
			}}
		>
			{tagline}
		</div>
		<div
			style={{
				...rise(local, 20),
				marginTop: 14,
				fontFamily: FONT.data,
				fontWeight: 500,
				fontSize: 24,
				letterSpacing: 2.2,
				textTransform: 'uppercase',
				color: COLOR.textFaint,
			}}
		>
			{room}
		</div>
	</div>
);

/**
 * A psychology beat: one narrative sentence at a time, held long enough to
 * read at a natural pace, then handed to the next. Content depth, not padding.
 */
export const PsychBeats: React.FC<{
	beats: readonly string[];
	cueFrames: readonly number[];
	local: number;
	holdFrames?: number;
}> = ({beats, cueFrames, local, holdFrames = 290}) => (
	<div style={{position: 'relative', minHeight: 210}}>
		{beats.map((text, i) => {
			const at = cueFrames[i];
			const l = local - at;
			if (l < -6 || l > holdFrames) return null;
			const e = interpolate(l, [0, 18], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: easeText,
			});
			const o = interpolate(l, [holdFrames - 20, holdFrames], [1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						inset: 0,
						opacity: Math.min(e, o),
						transform: `translateY(${(1 - e) * 22}px)`,
						fontFamily: FONT.display,
						fontWeight: 400,
						fontSize: 35,
						lineHeight: 1.42,
						color: COLOR.textDim,
					}}
				>
					{text}
				</div>
			);
		})}
	</div>
);
