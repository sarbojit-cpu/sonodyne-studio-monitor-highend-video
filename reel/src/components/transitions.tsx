import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '@remotion/transitions';
import {COLOR} from '../theme';

/**
 * Custom transitions for this reel. The brief calls for premium, mechanical
 * smoothness - nothing frantic, nothing bouncy or playful. These are built to
 * feel like precision instruments moving, not like consumer-gadget motion.
 */

type Empty = Record<string, never>;

/**
 * Dip to black. The outgoing frame recedes into the void and the incoming frame
 * emerges from it, with a brief moment of true black between - the cleanest way
 * to change subject without implying a relationship between two products.
 */
const DipComponent: React.FC<
	TransitionPresentationComponentProps<Empty>
> = ({children, presentationProgress, presentationDirection}) => {
	const p = presentationProgress;
	const opacity =
		presentationDirection === 'exiting'
			? interpolate(p, [0, 0.48], [1, 0], {extrapolateRight: 'clamp'})
			: interpolate(p, [0.52, 1], [0, 1], {extrapolateLeft: 'clamp'});
	const scale =
		presentationDirection === 'exiting'
			? 1 - p * 0.03
			: interpolate(p, [0.52, 1], [1.035, 1], {extrapolateLeft: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: COLOR.void}}>
			<AbsoluteFill style={{opacity, transform: `scale(${scale})`}}>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const dipToBlack = (): TransitionPresentation<Empty> => ({
	component: DipComponent,
	props: {} as Empty,
});

/**
 * Blade wipe. A hard-edged linear sweep led by a thin accent rule, like a
 * machined edge passing across the frame. Direction is configurable so repeated
 * use never reads as the same move twice.
 */
type BladeProps = {direction: 'up' | 'down' | 'left' | 'right'};

const BladeComponent: React.FC<
	TransitionPresentationComponentProps<BladeProps>
> = ({children, presentationProgress, presentationDirection, passedProps}) => {
	const {direction} = passedProps;
	const p = presentationProgress;
	const vertical = direction === 'up' || direction === 'down';
	const sign = direction === 'up' || direction === 'left' ? -1 : 1;

	if (presentationDirection === 'exiting') {
		// The outgoing frame simply holds and is covered.
		return <AbsoluteFill>{children}</AbsoluteFill>;
	}

	const travel = (1 - p) * 100 * sign;
	const clip = vertical
		? sign < 0
			? `inset(${p * 0}% 0 ${(1 - p) * 100}% 0)`
			: `inset(${(1 - p) * 100}% 0 0 0)`
		: sign < 0
			? `inset(0 ${(1 - p) * 100}% 0 0)`
			: `inset(0 0 0 ${(1 - p) * 100}%)`;

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					clipPath: clip,
					WebkitClipPath: clip,
				}}
			>
				{children}
			</AbsoluteFill>
			{/* Leading rule that travels with the wipe edge. */}
			<AbsoluteFill
				style={{
					opacity: p > 0.02 && p < 0.98 ? 0.9 : 0,
					transform: vertical
						? `translateY(${travel}%)`
						: `translateX(${travel}%)`,
					background: vertical
						? `linear-gradient(${sign < 0 ? 180 : 0}deg, transparent 0%, transparent calc(100% - 3px), ${COLOR.accent} 100%)`
						: `linear-gradient(${sign < 0 ? 90 : 270}deg, transparent 0%, transparent calc(100% - 3px), ${COLOR.accent} 100%)`,
				}}
			/>
		</AbsoluteFill>
	);
};

export const bladeWipe = (
	direction: BladeProps['direction']
): TransitionPresentation<BladeProps> => ({
	component: BladeComponent,
	props: {direction},
});

/**
 * Rack pull. The outgoing frame defocuses and lifts away while the incoming
 * frame resolves - a camera changing subject rather than a graphic effect.
 */
const RackComponent: React.FC<
	TransitionPresentationComponentProps<Empty>
> = ({children, presentationProgress, presentationDirection}) => {
	const p = presentationProgress;
	if (presentationDirection === 'exiting') {
		return (
			<AbsoluteFill
				style={{
					filter: `blur(${p * 14}px)`,
					opacity: interpolate(p, [0.2, 0.9], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					transform: `scale(${1 + p * 0.06})`,
				}}
			>
				{children}
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill
			style={{
				filter: `blur(${(1 - p) * 12}px)`,
				opacity: interpolate(p, [0.15, 0.75], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				transform: `scale(${1.05 - p * 0.05})`,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

export const rackPull = (): TransitionPresentation<Empty> => ({
	component: RackComponent,
	props: {} as Empty,
});
