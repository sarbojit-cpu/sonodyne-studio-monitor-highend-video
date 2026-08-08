import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {dipToBlack, bladeWipe, rackPull} from '../components/transitions';
import {LongIntro, LongOutro} from './LongIntroOutro';
import {LongProductScene} from './LongProduct';
import {LongSubScene} from './LongSub';
import {LowerThirdLogo, LowerThirdContact} from './LongLayout';
import {LONG_PRODUCTS} from './longProducts';
import {STARTS, SEG_FRAMES, LONG_XFADE, LONG_DURATION} from './timeline';
import {CONTACTS} from '../data/contacts';
import {COLOR} from '../theme';
import audioFlags from '../data/audio.json';

const flags = audioFlags as {hasMusic: boolean; hasLongformAudio?: boolean};

/**
 * The ~10-minute long-form cut. Aesthetic system inherited from the reel;
 * branding paced for an attentive viewer: Shivansh lower-thirds at segment
 * transitions plus a full presence in the outro, instead of the reel's
 * continuous cycling. The soundtrack is synthesized from the same timeline
 * JSON this file reads, then embedded here so the rendered mp4 ships with
 * audio in it.
 */

const XF = LONG_XFADE;

/** Branding moments, scheduled at the segment handovers. */
const BrandingTrack: React.FC = () => (
	<AbsoluteFill>
		{/* intro close, as the range lineup lands */}
		<LowerThirdLogo from={STARTS.intro + 1180} duration={220} align="left" />
		<LowerThirdContact
			from={STARTS.intro + 1230}
			duration={170}
			contact={CONTACTS[0]}
			align="right"
		/>

		{/* each product handover gets one calm lower-third pass */}
		<LowerThirdLogo from={STARTS.srp350 + 60} duration={200} align="right" width={430} />
		<LowerThirdLogo from={STARTS.srp400 + 60} duration={200} align="left" width={430} />
		<LowerThirdContact
			from={STARTS.srp400 + 1500}
			duration={180}
			contact={CONTACTS[1]}
			align="right"
		/>
		<LowerThirdLogo from={STARTS.srp501 + 60} duration={200} align="right" width={430} />
		<LowerThirdLogo from={STARTS.srp601 + 60} duration={200} align="left" width={430} />
		<LowerThirdContact
			from={STARTS.srp601 + 1500}
			duration={180}
			contact={CONTACTS[3]}
			align="right"
		/>
		<LowerThirdLogo from={STARTS.slf210 + 520} duration={220} align="right" width={430} />
		<LowerThirdContact
			from={STARTS.slf210 + 2100}
			duration={180}
			contact={CONTACTS[5]}
			align="left"
		/>
		{/* outro renders its own full block; no extra layer needed there */}
	</AbsoluteFill>
);

export const LongForm: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: COLOR.void}}>
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={SEG_FRAMES.intro}>
				<LongIntro duration={SEG_FRAMES.intro} />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={dipToBlack()}
				timing={linearTiming({durationInFrames: XF})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG_FRAMES.srp350}>
				<LongProductScene
					product={LONG_PRODUCTS.srp350}
					duration={SEG_FRAMES.srp350}
					index={0}
					total={5}
				/>
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={bladeWipe('left')}
				timing={linearTiming({durationInFrames: XF})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG_FRAMES.srp400}>
				<LongProductScene
					product={LONG_PRODUCTS.srp400}
					duration={SEG_FRAMES.srp400}
					index={1}
					total={5}
				/>
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={rackPull()}
				timing={linearTiming({durationInFrames: XF})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG_FRAMES.srp501}>
				<LongProductScene
					product={LONG_PRODUCTS.srp501}
					duration={SEG_FRAMES.srp501}
					index={2}
					total={5}
				/>
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={bladeWipe('right')}
				timing={linearTiming({durationInFrames: XF})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG_FRAMES.srp601}>
				<LongProductScene
					product={LONG_PRODUCTS.srp601}
					duration={SEG_FRAMES.srp601}
					index={3}
					total={5}
				/>
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={dipToBlack()}
				timing={linearTiming({durationInFrames: XF})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG_FRAMES.slf210}>
				<LongSubScene duration={SEG_FRAMES.slf210} />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={rackPull()}
				timing={linearTiming({durationInFrames: XF})}
			/>
			<TransitionSeries.Sequence durationInFrames={SEG_FRAMES.outro}>
				<LongOutro duration={SEG_FRAMES.outro} />
			</TransitionSeries.Sequence>
		</TransitionSeries>

		<BrandingTrack />

		{/* The synthesized soundtrack, generated from the same timeline JSON the
		    composition above is built from, so every hit lands on its cut. */}
		{flags.hasLongformAudio ? (
			<Audio src={staticFile('audio/longform.wav')} />
		) : null}
	</AbsoluteFill>
);

export {LONG_DURATION};
