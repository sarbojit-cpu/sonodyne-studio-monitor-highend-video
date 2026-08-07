import React from 'react';
import {useCurrentFrame, interpolate, Img, Easing} from 'remotion';
import {Void, ZoneB, Grid, img} from '../components/Frame';
import {COLOR, FONT, EASE} from '../theme';
import {CONTACTS, ADDRESS} from '../data/contacts';

/**
 * The closing beat. The audience is directed to reach out to Shivansh
 * Electronics by DM or call for the best price. No price is shown here as final
 * or negotiated, and nothing implies prices are fixed.
 *
 * This is also where the fullest Shivansh contact block appears - the logo
 * applied straight onto the frame at its largest size in the reel, with the
 * contact rotation as separate typography well clear of it.
 */
export const Cta: React.FC<{duration: number}> = ({duration}) => {
	const frame = useCurrentFrame();
	const ease = Easing.bezier(...EASE.text);

	const rise = (delay: number, travel = 26) => {
		const e = interpolate(frame, [delay, delay + 20], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: ease,
		});
		return {opacity: e, transform: `translateY(${(1 - e) * travel}px)`};
	};

	// Contact points cycle in pairs through the closing frames. Between the
	// branding track and this block, every entry in CONTACTS appears at least
	// once across the runtime.
	const pairs = [
		[CONTACTS[1], CONTACTS[3]],
		[CONTACTS[5], CONTACTS[0]],
		[CONTACTS[7], CONTACTS[12]],
	];
	const PAIR_LEN = 84;
	const pairIndex = Math.min(
		pairs.length - 1,
		Math.floor(Math.max(0, frame - 96) / PAIR_LEN)
	);
	const pairLocal = Math.max(0, frame - 96) - pairIndex * PAIR_LEN;
	const pairFade = Math.min(
		interpolate(pairLocal, [0, 14], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}),
		interpolate(pairLocal, [PAIR_LEN - 14, PAIR_LEN], [1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
	);

	return (
		<Void>
			<Grid opacity={0.06} />

			{/* Logo applied directly to the frame - no card, nothing inside it. */}
			<div
				style={{
					position: 'absolute',
					top: 236,
					left: 0,
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					...rise(4, 34),
				}}
			>
				<Img
					src={img('img/logo-shivansh-trim.png')}
					style={{
						width: 860,
						height: 'auto',
						filter: 'drop-shadow(0 16px 44px rgba(0,0,0,0.7))',
					}}
				/>
			</div>

			<ZoneB style={{justifyContent: 'flex-end', paddingBottom: 20}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
					<div
						style={{
							...rise(34),
							fontFamily: FONT.display,
							fontWeight: 800,
							fontSize: 82,
							letterSpacing: -1.6,
							lineHeight: 1.04,
							color: COLOR.text,
						}}
					>
						Build your system.
					</div>

					<div
						style={{
							...rise(50),
							fontFamily: FONT.display,
							fontWeight: 500,
							fontSize: 42,
							lineHeight: 1.3,
							color: COLOR.accentSoft,
							maxWidth: 900,
						}}
					>
						DM or call Shivansh Electronics for the best price and expert advice on
						pairing the right monitor to your room.
					</div>

					{/* Rotating contact pair - never the whole list at once. */}
					<div
						style={{
							minHeight: 190,
							display: 'flex',
							flexDirection: 'column',
							gap: 14,
							opacity: pairFade,
						}}
					>
						{pairs[pairIndex].map((c) => (
							<div
								key={`${c.label}-${c.value}`}
								style={{display: 'flex', alignItems: 'center', gap: 16}}
							>
								<span style={{fontSize: 34, lineHeight: 1}}>{c.icon}</span>
								<span
									style={{
										fontFamily: FONT.data,
										fontWeight: 500,
										fontSize: 26,
										letterSpacing: 2.6,
										textTransform: 'uppercase',
										color: COLOR.textFaint,
										minWidth: 250,
									}}
								>
									{c.label}
								</span>
								<span
									style={{
										fontFamily: FONT.display,
										fontWeight: 700,
										fontSize: 40,
										color: COLOR.text,
									}}
								>
									{c.value}
								</span>
							</div>
						))}
					</div>

					<div
						style={{
							...rise(70),
							opacity: Math.min(
								rise(70).opacity,
								interpolate(frame, [duration - 16, duration], [1, 0], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})
							),
							borderTop: `1px solid ${COLOR.lineSoft}`,
							paddingTop: 18,
							fontFamily: FONT.data,
							fontWeight: 500,
							fontSize: 26,
							letterSpacing: 1.2,
							lineHeight: 1.45,
							color: COLOR.textFaint,
						}}
					>
						{ADDRESS.line1}
						<br />
						{ADDRESS.line2}, {ADDRESS.line3}
					</div>
				</div>
			</ZoneB>
		</Void>
	);
};
