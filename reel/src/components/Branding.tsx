import React from 'react';
import {interpolate, useCurrentFrame, Img, Easing} from 'remotion';
import {Band, img} from './Frame';
import {COLOR, FONT, EASE} from '../theme';
import type {Contact} from '../data/contacts';

/**
 * Shivansh Electronics branding rules, from the client's direct instruction:
 *
 *   - The logo is applied straight onto the frame. It is never placed inside a
 *     bounded card or pill that forces it to shrink to share space with text.
 *   - It is rendered large enough to read on a phone at arm's length - far above
 *     the 140-220px floor - and never scaled to fit around other content.
 *   - It appears, holds, clears, and comes back somewhere else, so the branding
 *     reads as alive rather than as a static bar bolted to one spot.
 *   - Contact details are separate typography in the opposite band. They are
 *     never glued to the logo and never all shown at once.
 *
 * The supplied artwork is dark type on the brand's own white rounded plate. That
 * plate is part of the logo as delivered, so it is kept intact rather than
 * recoloured - but nothing else is ever placed inside or across it.
 */

/** Standard appear / hold / clear envelope shared by every branding element.
 * Plain function, not a hook - it must be callable after an early return. */
const envelope = (local: number, duration: number, travel: number) => {
	const IN = 16;
	const OUT = 14;
	const enter = interpolate(local, [0, IN], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(...EASE.text),
	});
	const exit = interpolate(local, [duration - OUT, duration], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(...EASE.text),
	});
	const opacity = Math.min(enter, exit);
	const offset = (1 - enter) * travel + (1 - exit) * -travel * 0.45;
	return {opacity, offset};
};

export const LogoShivansh: React.FC<{
	zone: 'A' | 'C';
	align: 'left' | 'center' | 'right';
	width: number;
	from: number;
	duration: number;
}> = ({zone, align, width, from, duration}) => {
	const frame = useCurrentFrame();
	const local = frame - from;
	if (local < 0 || local > duration) return null;

	const travel = align === 'right' ? 44 : align === 'left' ? -44 : 0;
	const {opacity, offset} = envelope(local, duration, travel);

	return (
		<Band zone={zone} align={align}>
			<Img
				src={img('img/logo-shivansh-trim.png')}
				style={{
					width,
					height: 'auto',
					opacity,
					transform: `translateX(${offset}px)`,
					filter: 'drop-shadow(0 10px 34px rgba(0,0,0,0.62))',
				}}
			/>
		</Band>
	);
};

/**
 * Sonodyne branding is intentionally minimal - one clean placement at the
 * moments that call for it, with no recurring dynamic system of its own.
 */
export const LogoSonodyne: React.FC<{
	zone: 'A' | 'C';
	align: 'left' | 'center' | 'right';
	width: number;
	from: number;
	duration: number;
}> = ({zone, align, width, from, duration}) => {
	const frame = useCurrentFrame();
	const local = frame - from;
	if (local < 0 || local > duration) return null;
	const {opacity, offset} = envelope(local, duration, 0);

	return (
		<Band zone={zone} align={align}>
			<Img
				src={img('img/logo-sonodyne-trim.png')}
				style={{
					width,
					height: 'auto',
					opacity: opacity * 0.96,
					transform: `translateY(${offset}px)`,
					filter: 'drop-shadow(0 8px 26px rgba(0,0,0,0.55))',
				}}
			/>
		</Band>
	);
};

/** One or two contact points as clean typography - never a hyperlink string. */
export const ContactLockup: React.FC<{
	zone: 'A' | 'C';
	align: 'left' | 'center' | 'right';
	items: Contact[];
	from: number;
	duration: number;
}> = ({zone, align, items, from, duration}) => {
	const frame = useCurrentFrame();
	const local = frame - from;
	if (local < 0 || local > duration) return null;
	const {opacity, offset} = envelope(local, duration, 30);

	return (
		<Band zone={zone} align={align}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 10,
					opacity,
					transform: `translateY(${offset * 0.5}px)`,
					alignItems:
						align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
				}}
			>
				{items.map((c) => (
					<div
						key={`${c.label}-${c.value}`}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 14,
						}}
					>
						<span style={{fontSize: 30, lineHeight: 1}}>{c.icon}</span>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'flex-start',
							}}
						>
							<span
								style={{
									fontFamily: FONT.data,
									fontWeight: 600,
									fontSize: 24,
									letterSpacing: 2.4,
									textTransform: 'uppercase',
									color: COLOR.textFaint,
									lineHeight: 1.1,
								}}
							>
								{c.label}
							</span>
							<span
								style={{
									fontFamily: FONT.display,
									fontWeight: 600,
									fontSize: 34,
									color: COLOR.text,
									lineHeight: 1.2,
								}}
							>
								{c.value}
							</span>
						</div>
					</div>
				))}
			</div>
		</Band>
	);
};
