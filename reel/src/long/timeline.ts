import raw from '../data/longform-timeline.json';

/**
 * The long-form timeline, computed once from the shared JSON so the Remotion
 * composition and the Python audio synthesizer can never disagree about where
 * a cut lands. Same start-frame formula the reel's branding track uses.
 */

export type SegmentId =
	| 'intro'
	| 'srp350'
	| 'srp400'
	| 'srp501'
	| 'srp601'
	| 'slf210'
	| 'outro';

export const LONG_FPS: number = raw.fps;
export const LONG_XFADE: number = raw.xfade;

export const SEGMENTS = raw.segments as {id: SegmentId; frames: number}[];
export const TRANSITIONS = raw.transitions as (
	| 'dip'
	| 'bladeLeft'
	| 'bladeRight'
	| 'rack'
)[];

export const STARTS: Record<SegmentId, number> = (() => {
	const out = {} as Record<SegmentId, number>;
	let at = 0;
	SEGMENTS.forEach((seg, i) => {
		out[seg.id] = at;
		at += seg.frames - (i < SEGMENTS.length - 1 ? LONG_XFADE : 0);
	});
	return out;
})();

export const LONG_DURATION: number =
	SEGMENTS.reduce((a, s) => a + s.frames, 0) - LONG_XFADE * (SEGMENTS.length - 1);

export const SEG_FRAMES: Record<SegmentId, number> = Object.fromEntries(
	SEGMENTS.map((s) => [s.id, s.frames])
) as Record<SegmentId, number>;

export const CUES = raw.cues as {
	intro: {beats: number[]; lineup: number};
	product: {psych: number[]; overlay: number; specSheet: number; shotLen: number};
	slf210: {
		recapOut: number;
		psych: number[];
		bassMgmt: number;
		phaseDial: number;
		specSheet: number;
		shotLen: number;
	};
	outro: {headline: number; heritage: number; contactsFrom: number; addressAt: number};
};
