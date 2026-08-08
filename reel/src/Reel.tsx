import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {Hook} from './scenes/Hook';
import {ProductSegment} from './scenes/ProductSegment';
import {SubwooferSegment} from './scenes/SubwooferSegment';
import {Cta} from './scenes/Cta';
import {LogoShivansh, LogoSonodyne, ContactLockup} from './components/Branding';
import {dipToBlack, bladeWipe, rackPull} from './components/transitions';
import {byId} from './data/products';
import {CONTACTS} from './data/contacts';
import {Music} from './components/Music';
import {COLOR} from './theme';

/**
 * Segment lengths in frames at 30fps. Every one of the five products gets a full
 * dedicated sequence rather than a compressed flash-cut, per the client's
 * instruction overriding the brief's 178-second / 25-seconds-per-monitor plan.
 * The runtime is whatever that honestly requires.
 */
const SEG = {
	hook: 225,
	srp350: 435,
	srp400: 435,
	srp501: 435,
	srp601: 465,
	slf210: 620,
	cta: 400,
} as const;

const XFADE = 22;

const ORDER = ['srp350', 'srp400', 'srp501', 'srp601'] as const;

/** Absolute start frame of each sequence, accounting for transition overlap. */
const starts = (() => {
	const lens = [
		SEG.hook,
		SEG.srp350,
		SEG.srp400,
		SEG.srp501,
		SEG.srp601,
		SEG.slf210,
		SEG.cta,
	];
	const out: number[] = [];
	let at = 0;
	lens.forEach((len, i) => {
		out.push(at);
		at += len - (i < lens.length - 1 ? XFADE : 0);
	});
	return out;
})();

export const REEL_DURATION =
	Object.values(SEG).reduce((a, b) => a + b, 0) - XFADE * 6;

const [S_HOOK, S_350, S_400, S_501, S_601, S_SLF, S_CTA] = starts;

/**
 * The dynamic Shivansh Electronics branding track.
 *
 * This layer sits above the scenes and runs on absolute frames, so branding is
 * an architectural band rather than something bolted into each scene. It moves:
 * the logo appears, holds, clears, and comes back in a different zone and
 * alignment, and the contact list rotates through across the runtime. At most
 * one logo and one contact lockup are on screen at a time, and they are always
 * in opposite bands so neither crowds the other.
 *
 * The CTA carries its own full Shivansh block in Zone B, so no second Shivansh
 * logo is scheduled there. Zone C instead takes the single Sonodyne placement
 * that closes the reel, rather than being left empty on the final held frame.
 */
const BrandingTrack: React.FC = () => (
	<AbsoluteFill>
		{/* --- Open --- */}
		<LogoShivansh zone="A" align="center" width={620} from={S_HOOK + 6} duration={104} />
		<ContactLockup
			zone="C"
			align="center"
			items={[CONTACTS[0]]}
			from={S_HOOK + 132}
			duration={86}
		/>

		{/* --- SRP 350 G --- */}
		<LogoSonodyne zone="A" align="center" width={430} from={S_350 + 14} duration={104} />
		<LogoShivansh zone="C" align="right" width={520} from={S_350 + 168} duration={150} />
		<ContactLockup
			zone="A"
			align="left"
			items={[CONTACTS[1]]}
			from={S_350 + 196}
			duration={132}
		/>
		<LogoShivansh zone="A" align="left" width={480} from={S_350 + 348} duration={110} />

		{/* --- SRP 400 G --- */}
		<ContactLockup
			zone="C"
			align="center"
			items={[CONTACTS[2]]}
			from={S_400 + 40}
			duration={128}
		/>
		<LogoShivansh zone="A" align="right" width={500} from={S_400 + 62} duration={140} />
		<LogoShivansh zone="C" align="left" width={540} from={S_400 + 250} duration={150} />
		<ContactLockup
			zone="A"
			align="right"
			items={[CONTACTS[3]]}
			from={S_400 + 276}
			duration={132}
		/>

		{/* --- SRP 501 G --- */}
		<LogoShivansh zone="A" align="center" width={560} from={S_501 + 24} duration={132} />
		<ContactLockup
			zone="C"
			align="center"
			items={[CONTACTS[4]]}
			from={S_501 + 62}
			duration={130}
		/>
		<LogoShivansh zone="C" align="right" width={520} from={S_501 + 240} duration={150} />
		<ContactLockup
			zone="A"
			align="left"
			items={[CONTACTS[5]]}
			from={S_501 + 268}
			duration={130}
		/>

		{/* --- SRP 601 G --- */}
		<LogoSonodyne zone="C" align="center" width={400} from={S_601 + 16} duration={96} />
		<LogoShivansh zone="A" align="left" width={520} from={S_601 + 44} duration={144} />
		<ContactLockup
			zone="C"
			align="right"
			items={[CONTACTS[6]]}
			from={S_601 + 150}
			duration={128}
		/>
		<LogoShivansh zone="C" align="center" width={560} from={S_601 + 300} duration={140} />
		<ContactLockup
			zone="A"
			align="right"
			items={[CONTACTS[7]]}
			from={S_601 + 322}
			duration={120}
		/>

		{/* --- SLF 210 V3 BL --- */}
		<LogoShivansh zone="A" align="right" width={520} from={S_SLF + 20} duration={140} />
		<ContactLockup
			zone="C"
			align="left"
			items={[CONTACTS[8]]}
			from={S_SLF + 54}
			duration={128}
		/>
		<LogoShivansh zone="C" align="left" width={540} from={S_SLF + 218} duration={148} />
		<ContactLockup
			zone="A"
			align="right"
			items={[CONTACTS[9]]}
			from={S_SLF + 244}
			duration={128}
		/>
		<LogoShivansh zone="A" align="center" width={580} from={S_SLF + 400} duration={140} />
		<ContactLockup
			zone="C"
			align="center"
			items={[CONTACTS[10], CONTACTS[11]]}
			from={S_SLF + 432}
			duration={150}
		/>

		{/* --- Close --- */}
		<LogoSonodyne
			zone="C"
			align="center"
			width={380}
			from={S_CTA + 108}
			duration={SEG.cta - 122}
		/>
	</AbsoluteFill>
);

export const Reel: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: COLOR.void}}>
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={SEG.hook}>
				<Hook duration={SEG.hook} />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={dipToBlack()}
				timing={linearTiming({durationInFrames: XFADE})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG.srp350}>
				<ProductSegment
					product={byId(ORDER[0])}
					duration={SEG.srp350}
					index={0}
					total={5}
				/>
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={bladeWipe('up')}
				timing={linearTiming({durationInFrames: XFADE})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG.srp400}>
				<ProductSegment
					product={byId(ORDER[1])}
					duration={SEG.srp400}
					index={1}
					total={5}
					showResonance
				/>
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={rackPull()}
				timing={linearTiming({durationInFrames: XFADE})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG.srp501}>
				<ProductSegment
					product={byId(ORDER[2])}
					duration={SEG.srp501}
					index={2}
					total={5}
				/>
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={bladeWipe('left')}
				timing={linearTiming({durationInFrames: XFADE})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG.srp601}>
				<ProductSegment
					product={byId(ORDER[3])}
					duration={SEG.srp601}
					index={3}
					total={5}
				/>
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={dipToBlack()}
				timing={linearTiming({durationInFrames: XFADE})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG.slf210}>
				<SubwooferSegment duration={SEG.slf210} />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={rackPull()}
				timing={linearTiming({durationInFrames: XFADE})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG.cta}>
				<Cta duration={SEG.cta} />
			</TransitionSeries.Sequence>
		</TransitionSeries>

		<BrandingTrack />
		<Music />
	</AbsoluteFill>
);
