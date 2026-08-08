import React from 'react';
import {useCurrentFrame, interpolate, Img} from 'remotion';
import {Void, Grid, img} from '../components/Frame';
import {ProductStage} from '../components/ProductStage';
import {BassManagementDiagram, PhaseDial} from '../components/Overlays';
import {SpecSheet} from './SpecSheet';
import {
	StagePane,
	TextPane,
	LongHeadline,
	PsychBeats,
	easeText,
	LONG_W,
	LONG_H,
} from './LongLayout';
import {CUES} from './timeline';
import {COLOR, FONT} from '../theme';
import {LONG_PRODUCTS} from './longProducts';
import cutouts from '../data/cutout-manifest.json';

const CUTS = cutouts as Record<string, {file: string; width: number; height: number}>;

/**
 * The 120-second subwoofer segment - the climax, given the extra time the
 * brief allocates specifically so bass management, crossover routing and phase
 * alignment can be explained rather than flashed. Opens on the four monitors
 * already shown, then hands the frame to the SLF.
 */
export const LongSubScene: React.FC<{duration: number}> = ({duration}) => {
	const frame = useCurrentFrame();
	const C = CUES.slf210;
	const product = LONG_PRODUCTS.slf210;

	const recapOut = interpolate(frame, [C.recapOut - 26, C.recapOut], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const recapUnits = ['srp350-09', 'srp400-08', 'srp501-04', 'srp601-08'];

	const bodyLocal = frame - C.recapOut;
	const bodyLen = duration - C.recapOut;

	const totalWeight = product.shots.reduce((a, s) => a + s.weight, 0);
	let cursor = 0;
	const shots = product.shots.map((shot) => {
		const len = Math.round((shot.weight / totalWeight) * bodyLen);
		const entry = {shot, from: cursor, len};
		cursor += len;
		return entry;
	});
	shots[shots.length - 1].len += bodyLen - cursor;
	const active = shots.find(
		(e) => bodyLocal >= e.from && bodyLocal < e.from + e.len
	);

	const overlayW = LONG_W * 0.45 - 140;
	const phase: 'psych' | 'bass' | 'phase' | 'sheet' =
		frame >= C.specSheet
			? 'sheet'
			: frame >= C.phaseDial
				? 'phase'
				: frame >= C.bassMgmt
					? 'bass'
					: 'psych';

	return (
		<Void>
			<Grid opacity={0.045} />

			{/* Recap: the four monitors, full width, before the SLF takes over. */}
			{frame < C.recapOut ? (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 44,
						opacity: recapOut,
					}}
				>
					<div style={{display: 'flex', alignItems: 'flex-end', gap: 30}}>
						{recapUnits.map((slug, i) => {
							const cut = CUTS[slug];
							const e = interpolate(frame, [i * 12, i * 12 + 22], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: easeText,
							});
							const h = 210 + i * 56;
							return (
								<Img
									key={slug}
									src={img(cut.file)}
									style={{
										height: h,
										width: (cut.width / cut.height) * h,
										objectFit: 'contain',
										opacity: e,
										transform: `translateY(${(1 - e) * 34}px)`,
										filter: 'drop-shadow(0 26px 44px rgba(0,0,0,0.7)) brightness(1.06)',
									}}
								/>
							);
						})}
					</div>
					<div style={{textAlign: 'center'}}>
						<span
							style={{
								fontFamily: FONT.display,
								fontWeight: 800,
								fontSize: 72,
								letterSpacing: -1.6,
								color: COLOR.text,
								opacity: interpolate(frame, [60, 84], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
							}}
						>
							Four monitors.{' '}
						</span>
						<span
							style={{
								fontFamily: FONT.display,
								fontWeight: 800,
								fontSize: 72,
								letterSpacing: -1.6,
								color: COLOR.accentSoft,
								opacity: interpolate(frame, [130, 156], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
							}}
						>
							One thing missing.
						</span>
					</div>
				</div>
			) : null}

			{/* The SLF itself. */}
			{frame >= C.recapOut - 14 && active ? (
				<StagePane>
					<ProductStage
						shot={active.shot}
						local={bodyLocal - active.from}
						duration={active.len}
						scale={0.8}
						stageW={LONG_W * 0.56}
						stageH={LONG_H}
					/>
				</StagePane>
			) : null}

			{frame >= C.recapOut ? (
				<TextPane>
					<LongHeadline
						name={product.base.name}
						tagline={product.base.tagline}
						room={product.roomLabel}
						local={bodyLocal}
						duration={bodyLen}
					/>

					{phase === 'psych' ? (
						<PsychBeats
							beats={[product.psych[0], product.psych[1]]}
							cueFrames={[C.psych[0] - C.recapOut, C.psych[1] - C.recapOut]}
							local={bodyLocal}
							holdFrames={260}
						/>
					) : null}

					{phase === 'bass' ? (
						<div style={{minHeight: 320, display: 'flex', alignItems: 'center'}}>
							<BassManagementDiagram
								local={frame - C.bassMgmt}
								duration={C.phaseDial - C.bassMgmt - 30}
								width={overlayW - 180}
							/>
						</div>
					) : null}

					{phase === 'phase' ? (
						<div
							style={{
								minHeight: 320,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								gap: 26,
							}}
						>
							<PhaseDial
								local={frame - C.phaseDial}
								duration={C.specSheet - C.phaseDial - 30}
								size={230}
							/>
							<div
								style={{
									fontFamily: FONT.display,
									fontWeight: 400,
									fontSize: 32,
									lineHeight: 1.42,
									color: COLOR.textDim,
									opacity: interpolate(frame - C.phaseDial, [30, 52], [0, 1], {
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									}),
								}}
							>
								{product.psych[2]}
							</div>
						</div>
					) : null}

					{phase === 'sheet' ? (
						<SpecSheet
							specs={product.fullSpecs}
							mrp={product.base.mrp}
							local={frame - C.specSheet}
							duration={duration - C.specSheet}
						/>
					) : null}
				</TextPane>
			) : null}
		</Void>
	);
};
