import React from 'react';
import {interpolate, Easing} from 'remotion';
import {COLOR, FONT, EASE} from '../theme';

/**
 * The SVG/CSS motion graphics from the brief's section 11. These are secondary
 * information rendered at medium/low prominence - they support the product
 * photography, they never compete with it.
 */

const easeText = Easing.bezier(...EASE.text);

/**
 * Resonance Rejection Overlay: a waveform strikes the cabinet wall and dies
 * instantly, showing that a pressure die-cast aluminium enclosure returns no
 * resonance where a flexing wooden cabinet would ring on.
 */
export const ResonanceOverlay: React.FC<{
	local: number;
	duration: number;
	width: number;
}> = ({local, duration, width}) => {
	const t = interpolate(local, [0, duration], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const fade = Math.min(
		interpolate(local, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
		interpolate(local, [duration - 14, duration], [1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
	);

	const h = 120;
	const strike = 0.18;
	const pts: string[] = [];
	const N = 240;
	for (let i = 0; i <= N; i++) {
		const x = i / N;
		let y = 0;
		if (x > strike && x < t) {
			// Impact energy decays to nothing almost immediately.
			const age = (x - strike) * 26;
			y = Math.sin(age * 5.2) * Math.exp(-age * 2.9);
		}
		pts.push(`${(x * width).toFixed(1)},${(h / 2 - y * (h / 2.3)).toFixed(1)}`);
	}

	return (
		<div style={{opacity: fade}}>
			<svg width={width} height={h} style={{display: 'block'}}>
				<line
					x1={0}
					y1={h / 2}
					x2={width}
					y2={h / 2}
					stroke={COLOR.line}
					strokeWidth={1}
				/>
				<polyline
					points={pts.join(' ')}
					fill="none"
					stroke={COLOR.accentSoft}
					strokeWidth={3}
					strokeLinejoin="round"
				/>
				<line
					x1={width * strike}
					y1={12}
					x2={width * strike}
					y2={h - 12}
					stroke={COLOR.textFaint}
					strokeWidth={1}
					strokeDasharray="4 6"
				/>
			</svg>
			<div
				style={{
					marginTop: 6,
					fontFamily: FONT.data,
					fontWeight: 500,
					fontSize: 24,
					letterSpacing: 2.6,
					textTransform: 'uppercase',
					color: COLOR.textFaint,
				}}
			>
				Cabinet resonance — struck, and gone
			</div>
		</div>
	);
};

/**
 * 2.1 Bass Management Diagram: the full-range signal splits, lows routed down to
 * the SLF 210 V3 BL and mids/highs routed up to the SRP monitors.
 */
export const BassManagementDiagram: React.FC<{
	local: number;
	duration: number;
	width: number;
}> = ({local, duration, width}) => {
	const fade = Math.min(
		interpolate(local, [0, 18], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: easeText,
		}),
		interpolate(local, [duration - 16, duration], [1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
	);
	const draw = interpolate(local, [10, 60], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeText,
	});
	// Signal pulse travelling down each branch.
	const pulse = ((local - 40) % 46) / 46;

	const h = 260;
	const midY = h / 2;
	const splitX = width * 0.34;
	const endX = width * 0.9;

	// Position along the branch is solved directly from the cubic rather than
	// driven by SMIL: SMIL runs on wall-clock time, which would sample
	// inconsistently under frame-by-frame rendering.
	const cubicAt = (u: number, p0: number, p1: number, p2: number, p3: number) => {
		const v = 1 - u;
		return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3;
	};

	const branch = (toY: number, label: string, sub: string, colour: string) => {
		const path = `M ${splitX} ${midY} C ${splitX + 90} ${midY}, ${splitX + 90} ${toY}, ${endX} ${toY}`;
		const px = cubicAt(pulse, splitX, splitX + 90, splitX + 90, endX);
		const py = cubicAt(pulse, midY, midY, toY, toY);
		return (
			<g>
				<path
					d={path}
					fill="none"
					stroke={colour}
					strokeWidth={3}
					strokeDasharray={520}
					strokeDashoffset={520 * (1 - draw)}
					opacity={0.9}
				/>
				{draw > 0.98 && pulse >= 0 && pulse <= 1 ? (
					<circle
						cx={px}
						cy={py}
						r={7}
						fill={colour}
						opacity={Math.max(0, 1 - Math.abs(pulse - 0.5) * 1.6)}
					/>
				) : null}
				<text
					x={endX + 16}
					y={toY - 6}
					fill={COLOR.text}
					fontFamily={FONT.display}
					fontWeight={700}
					fontSize={30}
					opacity={draw}
				>
					{label}
				</text>
				<text
					x={endX + 16}
					y={toY + 26}
					fill={COLOR.textFaint}
					fontFamily={FONT.data}
					fontWeight={500}
					fontSize={24}
					letterSpacing={2}
					opacity={draw}
				>
					{sub}
				</text>
			</g>
		);
	};

	return (
		<div style={{opacity: fade}}>
			<svg width={width} height={h} style={{display: 'block', overflow: 'visible'}}>
				<line
					x1={0}
					y1={midY}
					x2={splitX}
					y2={midY}
					stroke={COLOR.textDim}
					strokeWidth={3}
					strokeDasharray={splitX}
					strokeDashoffset={splitX * (1 - draw)}
				/>
				<text
					x={0}
					y={midY - 20}
					fill={COLOR.textFaint}
					fontFamily={FONT.data}
					fontWeight={500}
					fontSize={24}
					letterSpacing={2.4}
				>
					FULL-RANGE IN
				</text>
				<circle cx={splitX} cy={midY} r={9} fill={COLOR.accent} opacity={draw} />
				{branch(46, 'SRP MONITORS', 'ABOVE 80Hz', COLOR.accentSoft)}
				{branch(h - 46, 'SLF 210 V3 BL', 'BELOW 80Hz', COLOR.accent)}
			</svg>
		</div>
	);
};

/** Phase Alignment Dial: a minimal 0°-180° radial control. */
export const PhaseDial: React.FC<{
	local: number;
	duration: number;
	size: number;
}> = ({local, duration, size}) => {
	const fade = Math.min(
		interpolate(local, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
		interpolate(local, [duration - 14, duration], [1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
	);
	const deg = interpolate(local, [14, 74], [0, 180], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeText,
	});

	const r = size / 2 - 16;
	const cx = size / 2;
	const cy = size / 2;
	const rad = ((deg - 180) * Math.PI) / 180;
	const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
	const len = Math.PI * r;

	return (
		<div style={{opacity: fade, display: 'flex', alignItems: 'center', gap: 22}}>
			<svg width={size} height={size / 2 + 24} style={{display: 'block'}}>
				<path d={arc} fill="none" stroke={COLOR.lineSoft} strokeWidth={6} />
				<path
					d={arc}
					fill="none"
					stroke={COLOR.accent}
					strokeWidth={6}
					strokeDasharray={len}
					strokeDashoffset={len * (1 - deg / 180)}
					strokeLinecap="round"
				/>
				<line
					x1={cx}
					y1={cy}
					x2={cx + Math.cos(rad) * r}
					y2={cy + Math.sin(rad) * r}
					stroke={COLOR.text}
					strokeWidth={4}
					strokeLinecap="round"
				/>
				<circle cx={cx} cy={cy} r={8} fill={COLOR.text} />
			</svg>
			<div>
				<div
					style={{
						fontFamily: FONT.display,
						fontWeight: 700,
						fontSize: 40,
						color: COLOR.text,
					}}
				>
					{Math.round(deg)}°
				</div>
				<div
					style={{
						fontFamily: FONT.data,
						fontWeight: 500,
						fontSize: 24,
						letterSpacing: 2.4,
						textTransform: 'uppercase',
						color: COLOR.textFaint,
					}}
				>
					Phase alignment
				</div>
			</div>
		</div>
	);
};
