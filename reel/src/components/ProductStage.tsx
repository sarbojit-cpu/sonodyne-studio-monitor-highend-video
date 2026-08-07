import React from 'react';
import {interpolate, useCurrentFrame, Img, Easing} from 'remotion';
import {COLOR, EASE} from '../theme';
import {img} from './Frame';
import cutouts from '../data/cutout-manifest.json';
import type {Shot} from '../data/products';

/**
 * The brief's motion vocabulary (section 7), rebuilt as Remotion transforms on
 * real still photography. There is no 3D or video footage in this project, so
 * each move is expressed as scale / translate / focus-blur over a keyed product
 * cutout - the same read as a geared studio dolly, achieved in code.
 *
 *   orbit  - Monolith Orbit: slow horizontal nodal drift around the enclosure.
 *   push   - Waveguide Push: slow Z push toward the tweeter with a rack focus.
 *   crawl  - Transducer Macro-Crawl: lateral crawl across the cone under a
 *            static raking kicker light, so the weave shimmers as it passes.
 *   rear   - Rear-Panel Reveal: decisive snap that settles instantly on the I/O.
 *   tilt   - Low-angle tilt-up from the port shadow to the 10" driver.
 *
 * Upscaling is capped at 2.2x in the asset step and product height is kept below
 * the full band, so nothing is ever stretched past what the photography supports.
 */

type Cutouts = Record<string, {file: string; width: number; height: number}>;
const CUTS = cutouts as Cutouts;

const easeDolly = Easing.bezier(...EASE.dolly);
const easeSnap = Easing.bezier(...EASE.snap);

export const ProductStage: React.FC<{
	shot: Shot;
	/** Local frame within this shot. */
	local: number;
	duration: number;
	/** Product height as a fraction of the stage it sits in. */
	scale: number;
	/** Size of the stage this shot is composed inside. */
	stageW: number;
	stageH: number;
}> = ({shot, local, duration, scale, stageW, stageH}) => {
	const cut = CUTS[shot.slug];
	if (!cut) throw new Error(`no cutout for ${shot.slug}`);

	const t = interpolate(local, [0, duration], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Entrance and exit so a shot never pops.
	const fade = Math.min(
		interpolate(local, [0, 14], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: easeDolly,
		}),
		interpolate(local, [duration - 12, duration], [1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
	);

	const ar = cut.width / cut.height;

	// A macro crawl has to genuinely fill the frame. Sizing it to "contain" would
	// leave the keyed silhouette edge sitting in the middle of a close-up, which
	// reads as a mistake rather than as a macro shot. Every other move is sized to
	// sit fully inside the stage, so the container edge never slices the product.
	const isMacro = shot.move === 'crawl';
	const targetH = isMacro
		? Math.max(stageH, stageW / ar) * 1.55
		: stageH * scale;
	const baseW = ar * targetH;

	// For a macro, the focal point is placed by translation rather than by
	// transform-origin, because there is no scale change to pivot around.
	const focusDX = isMacro ? (0.5 - (shot.focus?.x ?? 0.5)) * baseW : 0;
	const focusDY = isMacro ? (0.5 - (shot.focus?.y ?? 0.5)) * targetH : 0;

	let zoom = 1;
	let dx = focusDX;
	let dy = focusDY;
	let blur = 0;
	let origin = '50% 50%';

	switch (shot.move) {
		case 'orbit': {
			const e = easeDolly(t);
			zoom = 1.0 + e * 0.07;
			dx += interpolate(e, [0, 1], [40, -40]);
			dy += interpolate(e, [0, 1], [6, -10]);
			break;
		}
		case 'push': {
			const e = easeDolly(t);
			zoom = 1.02 + e * 0.26;
			const f = shot.focus ?? {x: 0.5, y: 0.3};
			origin = `${f.x * 100}% ${f.y * 100}%`;
			dy += interpolate(e, [0, 1], [14, -8]);
			// Rack focus: the frame arrives soft at the waveguide edge and settles
			// crisp on the silk dome.
			blur = interpolate(e, [0, 0.55, 1], [5.5, 1.4, 0], {
				extrapolateRight: 'clamp',
			});
			break;
		}
		case 'crawl': {
			// Base sizing already covers the frame; the crawl is pure lateral travel
			// under a static raking light, so the weave shimmers as it passes.
			const e = easeDolly(t);
			zoom = 1.0 + e * 0.05;
			dx += interpolate(e, [0, 1], [120, -120]);
			dy += interpolate(e, [0, 1], [-12, 12]);
			break;
		}
		case 'rear': {
			// Snap in, settle instantly, then hold with only a breath of drift.
			const e = easeSnap(interpolate(t, [0, 0.32], [0, 1], {extrapolateRight: 'clamp'}));
			zoom = interpolate(e, [0, 1], [1.12, 1.0]) + t * 0.025;
			dx += interpolate(e, [0, 1], [72, 0]);
			blur = interpolate(e, [0, 1], [7, 0]);
			break;
		}
		case 'tilt': {
			const e = easeDolly(t);
			zoom = 1.2 - e * 0.16;
			const f = shot.focus ?? {x: 0.5, y: 0.6};
			origin = `${f.x * 100}% ${f.y * 100}%`;
			// Start low, inside the shadow of the front-firing port, and rise.
			dy += interpolate(e, [0, 1], [88, -14]);
			break;
		}
	}

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
			}}
		>
			{/* Broad, diffused key from above: smooth gradients down the chassis. */}
			<div
				style={{
					position: 'absolute',
					width: baseW * 1.5,
					height: targetH * 0.42,
					bottom: `calc(50% - ${targetH * 0.62}px)`,
					background:
						'radial-gradient(50% 50% at 50% 50%, rgba(125,158,185,0.24) 0%, rgba(0,0,0,0) 72%)',
					filter: 'blur(26px)',
					opacity: fade,
				}}
			/>
			<Img
				src={img(cut.file)}
				style={{
					height: targetH,
					width: baseW,
					objectFit: 'contain',
					opacity: fade,
					transform: `translate(${dx}px, ${dy}px) scale(${zoom})`,
					transformOrigin: origin,
					filter: `blur(${blur}px) brightness(1.07) contrast(1.05) drop-shadow(0 46px 70px rgba(0,0,0,0.72))`,
					willChange: 'transform',
				}}
			/>
			{/* The base of the product dissolves into the void, so the headline below
			    always sits on a clean field however far a move pushes in. */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					height: 240,
					background: `linear-gradient(180deg, rgba(8,9,9,0) 0%, rgba(8,9,9,0.72) 58%, ${COLOR.void} 100%)`,
					pointerEvents: 'none',
				}}
			/>
		</div>
	);
};

/** Muted, heavily treated backdrop plate. Used where no product claim attaches. */
export const AmbientPlate: React.FC<{
	slug: string;
	local: number;
	duration: number;
	intensity?: number;
}> = ({slug, local, duration, intensity = 0.32}) => {
	const t = interpolate(local, [0, duration], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const fade = Math.min(
		interpolate(local, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
		interpolate(local, [duration - 16, duration], [1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
	);
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
			<Img
				src={img(`img/${slug}.png`)}
				style={{
					position: 'absolute',
					width: '150%',
					height: '150%',
					left: '-25%',
					top: '-25%',
					objectFit: 'cover',
					opacity: fade * intensity,
					transform: `scale(${1.06 + t * 0.09})`,
					filter: 'blur(15px) saturate(0.35) brightness(0.62)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `linear-gradient(180deg, ${COLOR.void} 0%, rgba(8,9,9,0.42) 38%, rgba(8,9,9,0.55) 62%, ${COLOR.void} 100%)`,
				}}
			/>
		</div>
	);
};
