import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Void, ZoneB, Grid} from '../components/Frame';
import {ProductStage} from '../components/ProductStage';
import {Headline, Subhead, SpecRotator, PriceTag} from '../components/Type';
import {ResonanceOverlay} from '../components/Overlays';
import {COLOR, FONT, CONTENT_W, WIDTH} from '../theme';
import type {Product} from '../data/products';

/**
 * One dedicated segment per monitor. Each gets a full screen sequence rather
 * than a compressed flash-cut, per the client's build instruction that overrides
 * the brief's 25-seconds-per-monitor short-form plan.
 *
 * Layout inside Zone B: the product occupies the upper two thirds with the
 * camera move running under it, and the typography stack sits beneath. Elements
 * are sequenced so there is one clear focus at any moment - never four things
 * competing, and never an empty block either.
 */
/** Product stage occupies the upper part of Zone B. */
const STAGE_H = 920;

export const ProductSegment: React.FC<{
	product: Product;
	duration: number;
	/** Position in the range, shown as a quiet progress marker. */
	index: number;
	total: number;
	/** Draw the resonance graphic in this segment. */
	showResonance?: boolean;
}> = ({product, duration, index, total, showResonance}) => {
	const frame = useCurrentFrame();

	// Split the segment across the product's shots by weight.
	const totalWeight = product.shots.reduce((a, s) => a + s.weight, 0);
	let cursor = 0;
	const timeline = product.shots.map((shot) => {
		const len = Math.round((shot.weight / totalWeight) * duration);
		const entry = {shot, from: cursor, len};
		cursor += len;
		return entry;
	});
	// Absorb rounding drift into the final shot.
	timeline[timeline.length - 1].len += duration - cursor;

	const active = timeline.find((e) => frame >= e.from && frame < e.from + e.len);

	return (
		<Void>
			<Grid opacity={0.05} />

			{/* Product stage occupies the upper portion of Zone B. */}
			<div
				style={{
					position: 'absolute',
					top: 200,
					left: 0,
					width: '100%',
					height: STAGE_H,
				}}
			>
				{active ? (
					<ProductStage
						shot={active.shot}
						local={frame - active.from}
						duration={active.len}
						scale={product.scale}
						stageW={WIDTH}
						stageH={STAGE_H}
					/>
				) : null}
			</div>

			<ZoneB style={{justifyContent: 'flex-end', paddingBottom: 26}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
					<Headline
						name={product.name}
						tagline={product.tagline}
						local={frame}
						duration={duration}
					/>
					<Subhead text={product.subhead} local={frame} duration={duration} />

					{showResonance ? (
						<ResonanceOverlay
							local={frame - Math.round(duration * 0.46)}
							duration={Math.round(duration * 0.4)}
							width={CONTENT_W}
						/>
					) : (
						<SpecRotator
							specs={product.specs}
							local={frame}
							duration={duration}
							start={44}
						/>
					)}

					<PriceTag
						mrp={product.mrp}
						local={frame}
						duration={duration}
						delay={Math.round(duration * 0.42)}
					/>
				</div>
			</ZoneB>

			{/* Quiet position marker: where this unit sits in the range. */}
			<div
				style={{
					position: 'absolute',
					top: 214,
					right: 56,
					display: 'flex',
					gap: 8,
					opacity: interpolate(frame, [10, 30, duration - 14, duration], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				{Array.from({length: total}).map((_, i) => (
					<span
						key={i}
						style={{
							width: i === index ? 30 : 10,
							height: 4,
							background: i === index ? COLOR.accent : COLOR.line,
						}}
					/>
				))}
			</div>

			{/* Shot label: names the move honestly, in the brief's own vocabulary. */}
			{active ? (
				<div
					style={{
						position: 'absolute',
						top: 214,
						left: 56,
						fontFamily: FONT.data,
						fontWeight: 500,
						fontSize: 22,
						letterSpacing: 3,
						textTransform: 'uppercase',
						color: COLOR.textFaint,
						opacity: interpolate(
							frame - active.from,
							[6, 22, active.len - 12, active.len],
							[0, 0.85, 0.85, 0],
							{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
						),
					}}
				>
					{
						{
							orbit: 'Monolith Orbit',
							push: 'Waveguide Push',
							crawl: 'Transducer Macro-Crawl',
							rear: 'Rear-Panel Reveal',
							tilt: 'Low-Angle Reveal',
						}[active.shot.move]
					}
				</div>
			) : null}
		</Void>
	);
};
