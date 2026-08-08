import React from 'react';
import {interpolate} from 'remotion';
import {COLOR, FONT} from '../theme';
import {easeText} from './LongLayout';

/**
 * Long-form-only motion graphics, completing the brief's Section 11 set. The
 * reel built Resonance Rejection, 2.1 Bass Management and the Phase Dial;
 * long-form adds the Waveguide Dispersion Graphic (arcs of semi-transparent
 * lines radiating from the tweeter, showing the widened off-axis sweet spot)
 * plus two lightweight data graphics for the 501/601 stories: a frequency-range
 * bar and an SPL headroom meter. All stay at the brief's medium/low prominence.
 */

const fadeEnv = (local: number, duration: number) =>
	Math.min(
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

/** Arcs radiating from a tweeter point, opening to show the widened sweet spot. */
export const WaveguideDispersion: React.FC<{
	local: number;
	duration: number;
	width: number;
}> = ({local, duration, width}) => {
	const fade = fadeEnv(local, duration);
	const open = interpolate(local, [12, 80], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeText,
	});
	const h = 230;
	const cx = width * 0.12;
	const cy = h * 0.5;
	const arcs = [70, 120, 170, 220, 270];
	// The waveguide widens the linear window: the outer angle grows as `open`.
	const halfAngle = interpolate(open, [0, 1], [14, 38]);

	return (
		<div style={{opacity: fade}}>
			<svg width={width} height={h} style={{display: 'block', overflow: 'visible'}}>
				{arcs.map((r, i) => {
					const a = (halfAngle * Math.PI) / 180;
					const x1 = cx + r * Math.cos(-a);
					const y1 = cy + r * Math.sin(-a);
					const x2 = cx + r * Math.cos(a);
					const y2 = cy + r * Math.sin(a);
					const reveal = interpolate(open, [i * 0.12, i * 0.12 + 0.5], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					return (
						<path
							key={r}
							d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
							fill="none"
							stroke={COLOR.accentSoft}
							strokeWidth={2.4}
							opacity={reveal * (0.85 - i * 0.13)}
						/>
					);
				})}
				<circle cx={cx} cy={cy} r={7} fill={COLOR.accent} />
				{/* the widened linear window, marked at the outer arc */}
				<line
					x1={cx}
					y1={cy}
					x2={cx + 290 * Math.cos((-halfAngle * Math.PI) / 180)}
					y2={cy + 290 * Math.sin((-halfAngle * Math.PI) / 180)}
					stroke={COLOR.textFaint}
					strokeWidth={1}
					strokeDasharray="4 7"
					opacity={open}
				/>
				<line
					x1={cx}
					y1={cy}
					x2={cx + 290 * Math.cos((halfAngle * Math.PI) / 180)}
					y2={cy + 290 * Math.sin((halfAngle * Math.PI) / 180)}
					stroke={COLOR.textFaint}
					strokeWidth={1}
					strokeDasharray="4 7"
					opacity={open}
				/>
			</svg>
			<div
				style={{
					marginTop: 4,
					fontFamily: FONT.data,
					fontWeight: 500,
					fontSize: 22,
					letterSpacing: 2.4,
					textTransform: 'uppercase',
					color: COLOR.textFaint,
				}}
			>
				Elliptical waveguide — the off-axis sweet spot, widened
			</div>
		</div>
	);
};

/** Frequency-range bar with the difficult 100-300Hz band highlighted. */
export const FreqRangeBar: React.FC<{
	local: number;
	duration: number;
	width: number;
	lowHz: number;
	highLabel: string;
}> = ({local, duration, width, lowHz, highLabel}) => {
	const fade = fadeEnv(local, duration);
	const grow = interpolate(local, [10, 70], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeText,
	});
	// Log scale from 20Hz to 22kHz.
	const x = (hz: number) =>
		(Math.log10(hz / 20) / Math.log10(22000 / 20)) * width;
	const h = 110;
	const barY = 46;

	return (
		<div style={{opacity: fade}}>
			<svg width={width} height={h} style={{display: 'block'}}>
				<line x1={0} y1={barY} x2={width} y2={barY} stroke={COLOR.lineSoft} strokeWidth={8} />
				<line
					x1={x(lowHz)}
					y1={barY}
					x2={x(lowHz) + (x(21000) - x(lowHz)) * grow}
					y2={barY}
					stroke={COLOR.accent}
					strokeWidth={8}
					strokeLinecap="round"
				/>
				{/* the 100-300Hz problem band */}
				<rect
					x={x(100)}
					y={barY - 16}
					width={x(300) - x(100)}
					height={32}
					fill="none"
					stroke={COLOR.textDim}
					strokeWidth={1.4}
					strokeDasharray="5 6"
					opacity={grow}
				/>
				<text x={x(100)} y={barY - 24} fill={COLOR.textDim} fontFamily={FONT.data} fontSize={20} letterSpacing={1.6} opacity={grow}>
					100–300Hz — where mixes go muddy
				</text>
				<text x={x(lowHz)} y={barY + 38} fill={COLOR.text} fontFamily={FONT.display} fontWeight={700} fontSize={24} textAnchor="middle">
					{lowHz}Hz
				</text>
				<text x={x(21000)} y={barY + 38} fill={COLOR.text} fontFamily={FONT.display} fontWeight={700} fontSize={24} textAnchor="end">
					{highLabel}
				</text>
			</svg>
		</div>
	);
};

/** SPL headroom meter: the level rises to the verified max and holds, clean. */
export const HeadroomMeter: React.FC<{
	local: number;
	duration: number;
	width: number;
	maxDb: number;
}> = ({local, duration, width, maxDb}) => {
	const fade = fadeEnv(local, duration);
	const level = interpolate(local, [10, 90], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeText,
	});
	const segments = 24;
	const segW = (width - (segments - 1) * 6) / segments;
	const lit = Math.round(level * segments);
	const shown = Math.round(interpolate(level, [0, 1], [70, maxDb]));

	return (
		<div style={{opacity: fade}}>
			<div style={{display: 'flex', gap: 6, alignItems: 'flex-end'}}>
				{Array.from({length: segments}).map((_, i) => (
					<div
						key={i}
						style={{
							width: segW,
							height: 30 + (i / segments) * 26,
							background: i < lit ? (i > segments * 0.82 ? COLOR.accentSoft : COLOR.accent) : COLOR.lineSoft,
							opacity: i < lit ? 1 : 0.5,
						}}
					/>
				))}
			</div>
			<div
				style={{
					marginTop: 12,
					display: 'flex',
					alignItems: 'baseline',
					gap: 16,
				}}
			>
				<span style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 46, color: COLOR.text}}>
					{shown} dB
				</span>
				<span
					style={{
						fontFamily: FONT.data,
						fontWeight: 500,
						fontSize: 22,
						letterSpacing: 2.4,
						textTransform: 'uppercase',
						color: COLOR.textFaint,
					}}
				>
					Max SPL @ 1m — clean, uncompressed
				</span>
			</div>
		</div>
	);
};
