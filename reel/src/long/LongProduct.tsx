import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Void, Grid} from '../components/Frame';
import {ProductStage} from '../components/ProductStage';
import {ResonanceOverlay, BassManagementDiagram} from '../components/Overlays';
import {WaveguideDispersion, FreqRangeBar, HeadroomMeter} from './LongOverlays';
import {SpecSheet} from './SpecSheet';
import {
	StagePane,
	TextPane,
	LongHeadline,
	PsychBeats,
	LONG_W,
	LONG_H,
} from './LongLayout';
import {CUES} from './timeline';
import {COLOR, FONT} from '../theme';
import type {LongProduct as LP} from './longProducts';

/**
 * One 90-second product segment. Not the reel slowed down: everything the reel
 * segment had, plus the full psychology narrative, the complete verified spec
 * row, a longer shot list, and the product's most relevant acoustic-concept
 * graphic walked through at readable pace.
 *
 * Text-pane phasing (frames, from the shared timeline):
 *   0 ......... headline + tagline + room context
 *   340-1180 .. psychology beats, one sentence at a time
 *   1180-1780 . acoustic-concept overlay, given real time to animate
 *   1800-end .. the full verified spec sheet, staggered row by row
 */
export const LongProductScene: React.FC<{
	product: LP;
	duration: number;
	index: number;
	total: number;
}> = ({product, duration, index, total}) => {
	const frame = useCurrentFrame();
	const C = CUES.product;

	// Shot timeline across the whole segment.
	const totalWeight = product.shots.reduce((a, s) => a + s.weight, 0);
	let cursor = 0;
	const shots = product.shots.map((shot) => {
		const len = Math.round((shot.weight / totalWeight) * duration);
		const entry = {shot, from: cursor, len};
		cursor += len;
		return entry;
	});
	shots[shots.length - 1].len += duration - cursor;
	const active = shots.find((e) => frame >= e.from && frame < e.from + e.len);

	const overlayLocal = frame - C.overlay;
	const overlayDur = C.specSheet - C.overlay - 40;
	const sheetLocal = frame - C.specSheet;
	const overlayW = LONG_W * 0.45 - 120;

	const phase: 'psych' | 'overlay' | 'sheet' =
		frame >= C.specSheet ? 'sheet' : frame >= C.overlay ? 'overlay' : 'psych';

	return (
		<Void>
			<Grid opacity={0.045} />

			<StagePane>
				{active ? (
					<ProductStage
						shot={active.shot}
						local={frame - active.from}
						duration={active.len}
						scale={Math.min(0.86, product.base.scale + 0.04)}
						stageW={LONG_W * 0.56}
						stageH={LONG_H}
					/>
				) : null}
			</StagePane>

			<TextPane>
				<LongHeadline
					name={product.base.name}
					tagline={product.base.tagline}
					room={product.roomLabel}
					local={frame}
					duration={duration}
				/>

				{phase === 'psych' ? (
					<PsychBeats beats={product.psych} cueFrames={C.psych} local={frame} />
				) : null}

				{phase === 'overlay' ? (
					<div style={{minHeight: 300, display: 'flex', alignItems: 'center'}}>
						{product.overlay === 'resonance' ? (
							<ResonanceOverlay local={overlayLocal} duration={overlayDur} width={overlayW} />
						) : product.overlay === 'waveguide' ? (
							<WaveguideDispersion local={overlayLocal} duration={overlayDur} width={overlayW} />
						) : product.overlay === 'freqRange' ? (
							<FreqRangeBar
								local={overlayLocal}
								duration={overlayDur}
								width={overlayW}
								lowHz={58}
								highLabel="21kHz"
							/>
						) : product.overlay === 'headroom' ? (
							<HeadroomMeter local={overlayLocal} duration={overlayDur} width={overlayW} maxDb={107} />
						) : (
							<BassManagementDiagram local={overlayLocal} duration={overlayDur} width={overlayW - 200} />
						)}
					</div>
				) : null}

				{phase === 'sheet' ? (
					<SpecSheet
						specs={product.fullSpecs}
						mrp={product.base.mrp}
						local={sheetLocal}
						duration={duration - C.specSheet}
					/>
				) : null}
			</TextPane>

			{/* Range position marker, top right. */}
			<div
				style={{
					position: 'absolute',
					top: 64,
					right: 84,
					display: 'flex',
					gap: 8,
					opacity: interpolate(frame, [12, 34, duration - 16, duration], [0, 1, 1, 0], {
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

			{/* Shot label, bottom left of the stage - the brief's own vocabulary. */}
			{active ? (
				<div
					style={{
						position: 'absolute',
						top: 64,
						left: 84,
						fontFamily: FONT.data,
						fontWeight: 500,
						fontSize: 20,
						letterSpacing: 2.8,
						textTransform: 'uppercase',
						color: COLOR.textFaint,
						opacity: interpolate(
							frame - active.from,
							[8, 24, active.len - 14, active.len],
							[0, 0.8, 0.8, 0],
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
