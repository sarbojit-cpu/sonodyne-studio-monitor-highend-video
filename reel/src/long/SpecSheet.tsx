import React from 'react';
import {interpolate} from 'remotion';
import {COLOR, FONT} from '../theme';
import {easeText} from './LongLayout';

/**
 * The full verified spec row as an on-screen "spec sheet" moment - the depth
 * the reel could not afford. Rows stagger in top to bottom so the sheet reads
 * as narrated data, not a flashed table, and the MRP sits as the final,
 * low-prominence row per the pricing rules.
 */
export const SpecSheet: React.FC<{
	specs: {label: string; value: string}[];
	mrp: string;
	local: number;
	duration: number;
}> = ({specs, mrp, local, duration}) => {
	const out = interpolate(local, [duration - 20, duration], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const STAGGER = 9;

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 0,
				opacity: out,
			}}
		>
			<div
				style={{
					fontFamily: FONT.data,
					fontWeight: 600,
					fontSize: 24,
					letterSpacing: 3.4,
					textTransform: 'uppercase',
					color: COLOR.accentSoft,
					marginBottom: 14,
					opacity: interpolate(local, [0, 14], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				Verified specification
			</div>
			{specs.map((s, i) => {
				const l = local - 8 - i * STAGGER;
				const e = interpolate(l, [0, 14], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: easeText,
				});
				return (
					<div
						key={s.label}
						style={{
							display: 'flex',
							alignItems: 'baseline',
							gap: 18,
							padding: '7px 0',
							borderBottom: `1px solid ${COLOR.lineSoft}`,
							opacity: e,
							transform: `translateX(${(1 - e) * -18}px)`,
						}}
					>
						<span
							style={{
								fontFamily: FONT.data,
								fontWeight: 500,
								fontSize: 21,
								letterSpacing: 2,
								textTransform: 'uppercase',
								color: COLOR.textFaint,
								width: 260,
								flexShrink: 0,
							}}
						>
							{s.label}
						</span>
						<span
							style={{
								fontFamily: FONT.display,
								fontWeight: 600,
								fontSize: 26,
								color: COLOR.text,
							}}
						>
							{s.value}
						</span>
					</div>
				);
			})}
			{/* Price: last row, low prominence, never the headline. */}
			<div
				style={{
					display: 'flex',
					alignItems: 'baseline',
					gap: 16,
					marginTop: 16,
					opacity: interpolate(local - 8 - specs.length * STAGGER, [0, 16], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: easeText,
					}),
				}}
			>
				<span
					style={{
						fontFamily: FONT.data,
						fontWeight: 500,
						fontSize: 21,
						letterSpacing: 2.2,
						textTransform: 'uppercase',
						color: COLOR.textFaint,
					}}
				>
					MRP
				</span>
				<span style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 30, color: COLOR.textDim}}>
					₹{mrp}
				</span>
				<span
					style={{
						fontFamily: FONT.data,
						fontWeight: 500,
						fontSize: 20,
						letterSpacing: 1.4,
						color: COLOR.textFaint,
					}}
				>
					incl. all taxes — DM or call for the best price
				</span>
			</div>
		</div>
	);
};
