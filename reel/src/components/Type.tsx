import React from 'react';
import {interpolate, Easing} from 'remotion';
import {COLOR, FONT, EASE} from '../theme';
import type {SpecChip} from '../data/products';

/**
 * The brief's information hierarchy (section 8), expressed as timing and
 * animation choreography rather than as a static layout:
 *
 *   maximum   Headline-level claim  - short, defines the product's identity
 *   high      Subheadline           - the "why this matters" statement
 *   medium    Specification callout - exact verified numbers and materials
 *   low       Micro callout         - finish and MRP, purchasing context only
 *
 * Elements are sequenced so the eye always has one clear read order. They never
 * all arrive at full opacity at the same moment.
 */

const easeText = Easing.bezier(...EASE.text);

const rise = (local: number, delay: number, travel = 26) => {
	const e = interpolate(local, [delay, delay + 18], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeText,
	});
	return {opacity: e, transform: `translateY(${(1 - e) * travel}px)`};
};

/** Fades a block out near the end of its segment so the frame clears cleanly. */
const settle = (local: number, duration: number, out = 16) =>
	interpolate(local, [duration - out, duration], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

export const Headline: React.FC<{
	name: string;
	tagline: string;
	local: number;
	duration: number;
	delay?: number;
}> = ({name, tagline, local, duration, delay = 4}) => (
	<div style={{opacity: settle(local, duration)}}>
		<div
			style={{
				...rise(local, delay),
				fontFamily: FONT.display,
				fontWeight: 800,
				fontSize: 96,
				letterSpacing: -2,
				lineHeight: 0.98,
				color: COLOR.text,
				textShadow: '0 6px 30px rgba(0,0,0,0.6)',
			}}
		>
			{name}
		</div>
		<div
			style={{
				...rise(local, delay + 7),
				marginTop: 14,
				fontFamily: FONT.data,
				fontWeight: 600,
				fontSize: 44,
				letterSpacing: 5,
				textTransform: 'uppercase',
				color: COLOR.accentSoft,
			}}
		>
			{tagline}
		</div>
	</div>
);

export const Subhead: React.FC<{
	text: string;
	local: number;
	duration: number;
	delay?: number;
}> = ({text, local, duration, delay = 20}) => (
	<div
		style={{
			...rise(local, delay, 20),
			opacity: Math.min(rise(local, delay, 20).opacity, settle(local, duration)),
			fontFamily: FONT.display,
			fontWeight: 400,
			fontSize: 38,
			lineHeight: 1.36,
			color: COLOR.textDim,
			maxWidth: 900,
		}}
	>
		{text}
	</div>
);

/**
 * Spec callouts rotate rather than stacking. Two are on screen at a time, each
 * handing over to the next, so the segment stays dense without becoming a wall.
 */
export const SpecRotator: React.FC<{
	specs: SpecChip[];
	local: number;
	duration: number;
	start: number;
}> = ({specs, local, duration, start}) => {
	const window = Math.max(1, Math.floor((duration - start - 20) / specs.length));

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'flex-end',
				gap: 12,
				opacity: settle(local, duration),
				minHeight: 190,
			}}
		>
			{specs.map((s, i) => {
				const at = start + i * window;
				// Each chip holds for two windows, so pairs overlap on screen.
				const life = window * 2;
				const l = local - at;
				if (l < -4 || l > life) return null;
				const e = interpolate(l, [0, 14], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: easeText,
				});
				const o = interpolate(l, [life - 14, life], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				return (
					<div
						key={s.label}
						style={{
							display: 'flex',
							alignItems: 'baseline',
							gap: 18,
							opacity: Math.min(e, o),
							transform: `translateX(${(1 - e) * -22}px)`,
						}}
					>
						<span
							style={{
								display: 'inline-block',
								width: 6,
								height: 34,
								background: COLOR.accent,
								transform: `scaleY(${e})`,
								transformOrigin: 'bottom',
							}}
						/>
						<span
							style={{
								fontFamily: FONT.data,
								fontWeight: 500,
								fontSize: 26,
								letterSpacing: 2.6,
								textTransform: 'uppercase',
								color: COLOR.textFaint,
								minWidth: 250,
							}}
						>
							{s.label}
						</span>
						<span
							style={{
								fontFamily: FONT.display,
								fontWeight: 700,
								fontSize: 42,
								color: COLOR.text,
							}}
						>
							{s.value}
						</span>
					</div>
				);
			})}
		</div>
	);
};

/**
 * Low-prominence purchasing context. Deliberately small - it must never compete
 * with the headline, and the price is never framed as final or fixed.
 */
export const PriceTag: React.FC<{
	mrp: string;
	local: number;
	duration: number;
	delay: number;
}> = ({mrp, local, duration, delay}) => {
	const r = rise(local, delay, 14);
	return (
		<div
			style={{
				...r,
				opacity: Math.min(r.opacity, settle(local, duration)),
				display: 'inline-flex',
				alignItems: 'center',
				gap: 14,
				alignSelf: 'flex-start',
				padding: '10px 20px',
				border: `1px solid ${COLOR.line}`,
				borderRadius: 4,
				background: 'rgba(255,255,255,0.02)',
			}}
		>
			<span
				style={{
					fontFamily: FONT.data,
					fontWeight: 500,
					fontSize: 24,
					letterSpacing: 2.4,
					textTransform: 'uppercase',
					color: COLOR.textFaint,
				}}
			>
				MRP
			</span>
			<span
				style={{
					fontFamily: FONT.display,
					fontWeight: 700,
					fontSize: 34,
					color: COLOR.textDim,
				}}
			>
				₹{mrp}
			</span>
			<span
				style={{
					fontFamily: FONT.data,
					fontWeight: 500,
					fontSize: 22,
					letterSpacing: 1.4,
					color: COLOR.textFaint,
				}}
			>
				incl. all taxes
			</span>
		</div>
	);
};

/** Punchy single-line beat used by the hook. */
export const HookLine: React.FC<{
	text: string;
	local: number;
	duration: number;
	emphasis?: boolean;
}> = ({text, local, duration, emphasis}) => {
	const e = interpolate(local, [0, 12], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeText,
	});
	const o = interpolate(local, [duration - 10, duration], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div
			style={{
				opacity: Math.min(e, o),
				transform: `translateY(${(1 - e) * 30}px)`,
				fontFamily: FONT.display,
				fontWeight: emphasis ? 800 : 600,
				fontSize: emphasis ? 92 : 72,
				lineHeight: 1.06,
				letterSpacing: emphasis ? -2 : -1,
				color: emphasis ? COLOR.text : COLOR.textDim,
				textShadow: '0 6px 34px rgba(0,0,0,0.7)',
			}}
		>
			{text}
		</div>
	);
};
