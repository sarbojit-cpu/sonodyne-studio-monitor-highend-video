import React from 'react';
import {useCurrentFrame, interpolate, Img, Easing} from 'remotion';
import {Void, ZoneB, Grid, img} from '../components/Frame';
import {ProductStage} from '../components/ProductStage';
import {Headline, Subhead, SpecRotator, PriceTag} from '../components/Type';
import {BassManagementDiagram, PhaseDial} from '../components/Overlays';
import {COLOR, FONT, CONTENT_W, EASE, WIDTH} from '../theme';
import {byId} from '../data/products';
import cutouts from '../data/cutout-manifest.json';

const CUTS = cutouts as Record<string, {file: string; width: number; height: number}>;

/**
 * The climax, not simply "product five of five". The subwoofer arrives as the
 * upgrade that unifies everything already shown into one full-range 2.1 system.
 *
 * This is the single place in the reel where gesturing back at earlier segments
 * is earned: the four SRP monitors flash back as an ecosystem row, then the
 * signal-split diagram shows lows routed down to the SLF and mids/highs routed
 * up to the monitors.
 */
const STAGE_H = 900;

export const SubwooferSegment: React.FC<{duration: number}> = ({duration}) => {
	const frame = useCurrentFrame();
	const product = byId('slf210');

	// Phase 1: recap the four SRP units. Phase 2: the SLF itself.
	const RECAP = 132;
	const recapOut = interpolate(frame, [RECAP - 20, RECAP], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const recapUnits = ['srp350-09', 'srp400-08', 'srp501-04', 'srp601-08'];

	const bodyLocal = frame - RECAP;
	const bodyLen = duration - RECAP;

	const totalWeight = product.shots.reduce((a, s) => a + s.weight, 0);
	let cursor = 0;
	const timeline = product.shots.map((shot) => {
		const len = Math.round((shot.weight / totalWeight) * bodyLen);
		const entry = {shot, from: cursor, len};
		cursor += len;
		return entry;
	});
	timeline[timeline.length - 1].len += bodyLen - cursor;
	const active = timeline.find(
		(e) => bodyLocal >= e.from && bodyLocal < e.from + e.len
	);

	return (
		<Void>
			<Grid opacity={0.05} />

			{/* --- Phase 1: the four monitors already shown, lined up --- */}
			{frame < RECAP ? (
				<div
					style={{
						position: 'absolute',
						top: 200,
						left: 0,
						width: '100%',
						height: STAGE_H,
						display: 'flex',
						alignItems: 'flex-end',
						justifyContent: 'center',
						gap: 14,
						opacity: recapOut,
					}}
				>
					{recapUnits.map((slug, i) => {
						const cut = CUTS[slug];
						const e = interpolate(frame, [i * 11, i * 11 + 20], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(...EASE.text),
						});
						// Each unit scales with its real place in the range.
						const h = 215 + i * 52;
						return (
							<Img
								key={slug}
								src={img(cut.file)}
								style={{
									height: h,
									width: (cut.width / cut.height) * h,
									objectFit: 'contain',
									opacity: e,
									transform: `translateY(${(1 - e) * 40}px)`,
									filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.7))',
								}}
							/>
						);
					})}
				</div>
			) : null}

			{/* --- Phase 2: the subwoofer --- */}
			{frame >= RECAP - 12 && active ? (
				<div
					style={{
						position: 'absolute',
						top: 200,
						left: 0,
						width: '100%',
						height: STAGE_H,
					}}
				>
					<ProductStage
						shot={active.shot}
						local={bodyLocal - active.from}
						duration={active.len}
						scale={product.scale}
						stageW={WIDTH}
						stageH={STAGE_H}
					/>
				</div>
			) : null}

			<ZoneB style={{justifyContent: 'flex-end', paddingBottom: 26}}>
				{frame < RECAP ? (
					<div
						style={{
							opacity: recapOut,
							display: 'flex',
							flexDirection: 'column',
							gap: 16,
						}}
					>
						<div
							style={{
								fontFamily: FONT.display,
								fontWeight: 800,
								fontSize: 84,
								letterSpacing: -2,
								lineHeight: 1,
								color: COLOR.text,
								opacity: interpolate(frame, [8, 30], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
							}}
						>
							Four monitors.
						</div>
						<div
							style={{
								fontFamily: FONT.display,
								fontWeight: 800,
								fontSize: 84,
								letterSpacing: -2,
								lineHeight: 1,
								color: COLOR.accentSoft,
								opacity: interpolate(frame, [40, 62], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
							}}
						>
							One thing missing.
						</div>
					</div>
				) : (
					<div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
						<Headline
							name={product.name}
							tagline={product.tagline}
							local={bodyLocal}
							duration={bodyLen}
						/>
						<Subhead text={product.subhead} local={bodyLocal} duration={bodyLen} />

						{/* Bass management first, then the phase dial, then the specs. */}
						{bodyLocal < 190 ? (
							<BassManagementDiagram
								local={bodyLocal - 44}
								duration={150}
								width={CONTENT_W - 240}
							/>
						) : bodyLocal < 320 ? (
							<div style={{minHeight: 260, display: 'flex', alignItems: 'center'}}>
								<PhaseDial local={bodyLocal - 196} duration={120} size={210} />
							</div>
						) : (
							<SpecRotator
								specs={product.specs}
								local={bodyLocal - 326}
								duration={bodyLen - 326}
								start={0}
							/>
						)}

						<PriceTag
							mrp={product.mrp}
							local={bodyLocal}
							duration={bodyLen}
							delay={Math.round(bodyLen * 0.72)}
						/>
					</div>
				)}
			</ZoneB>
		</Void>
	);
};
