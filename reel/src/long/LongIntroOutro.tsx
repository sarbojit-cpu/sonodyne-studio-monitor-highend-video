import React from 'react';
import {useCurrentFrame, interpolate, Img} from 'remotion';
import {Void, Grid, img} from '../components/Frame';
import {AmbientPlate} from '../components/ProductStage';
import {rise, settle, easeText, LONG_W, LONG_H, LPAD} from './LongLayout';
import {CUES} from './timeline';
import {COLOR, FONT} from '../theme';
import {CONTACTS, ADDRESS} from '../data/contacts';
import cutouts from '../data/cutout-manifest.json';

const CUTS = cutouts as Record<string, {file: string; width: number; height: number}>;

/**
 * Intro: 60 seconds on the Problem and the Pain - concrete failure scenarios,
 * per the brief's Story Arc. No heritage material here; that single line lives
 * in the outro where the arc has earned it. The segment closes by introducing
 * the full range as the solution: all five units, smallest to largest.
 */
export const LongIntro: React.FC<{duration: number}> = ({duration}) => {
	const frame = useCurrentFrame();
	const C = CUES.intro;

	const beats = [
		{head: 'The mix was perfect.', sub: 'Hours of EQ moves. Every level exact. In your room, it was done.'},
		{head: 'Then the phone speaker.', sub: 'The low end vanished. The vocal turned harsh. The balance you swore by — gone.'},
		{head: 'Then the car.', sub: 'Mud at 200 hertz you never heard at the desk. Another export. Another guess.'},
		{head: 'Your room was lying.', sub: 'Flexing cabinet walls and untreated reflections colour everything you hear.'},
	];
	const HOLD = 250;

	const lineupLocal = frame - C.lineup;
	const lineup = ['srp350-09', 'srp400-08', 'srp501-04', 'srp601-08', 'slf210-02'];

	return (
		<Void>
			<AmbientPlate slug="generic-00" local={frame} duration={C.lineup + 60} intensity={0.24} />
			<Grid opacity={0.04} />

			{/* Problem / Pain beats - centered, one at a time. */}
			{beats.map((b, i) => {
				const l = frame - C.beats[i];
				if (l < -6 || l > HOLD) return null;
				const e = interpolate(l, [0, 18], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: easeText,
				});
				const o = interpolate(l, [HOLD - 22, HOLD], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 22,
							opacity: Math.min(e, o),
							transform: `translateY(${(1 - e) * 26}px)`,
							paddingLeft: LPAD * 2,
							paddingRight: LPAD * 2,
							textAlign: 'center',
						}}
					>
						<div
							style={{
								fontFamily: FONT.display,
								fontWeight: 800,
								fontSize: 92,
								letterSpacing: -2,
								color: COLOR.text,
								textShadow: '0 8px 34px rgba(0,0,0,0.7)',
							}}
						>
							{b.head}
						</div>
						<div
							style={{
								fontFamily: FONT.display,
								fontWeight: 400,
								fontSize: 36,
								lineHeight: 1.4,
								color: COLOR.textDim,
								maxWidth: 1100,
							}}
						>
							{b.sub}
						</div>
					</div>
				);
			})}

			{/* Solution: the range, smallest to largest, then the series title. */}
			{lineupLocal > -10 ? (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 50,
						opacity: settle(frame, duration, 20),
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'flex-end',
							justifyContent: 'center',
							gap: 34,
						}}
					>
						{lineup.map((slug, i) => {
							const cut = CUTS[slug];
							const e = interpolate(lineupLocal, [i * 12, i * 12 + 22], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: easeText,
							});
							const h = 200 + i * 52;
							return (
								<Img
									key={slug}
									src={img(cut.file)}
									style={{
										height: h,
										width: (cut.width / cut.height) * h,
										objectFit: 'contain',
										opacity: e,
										transform: `translateY(${(1 - e) * 36}px)`,
										filter: 'drop-shadow(0 26px 44px rgba(0,0,0,0.7)) brightness(1.06)',
									}}
								/>
							);
						})}
					</div>
					<div style={{textAlign: 'center'}}>
						<div
							style={{
								...rise(lineupLocal, 70),
								fontFamily: FONT.display,
								fontWeight: 800,
								fontSize: 74,
								letterSpacing: -1.4,
								color: COLOR.text,
							}}
						>
							The Sonodyne Studio Series
						</div>
						<div
							style={{
								...rise(lineupLocal, 84),
								marginTop: 14,
								fontFamily: FONT.data,
								fontWeight: 600,
								fontSize: 32,
								letterSpacing: 5,
								textTransform: 'uppercase',
								color: COLOR.accentSoft,
							}}
						>
							Five instruments of acoustic truth
						</div>
					</div>
				</div>
			) : null}
		</Void>
	);
};

/**
 * Outro: the CTA, the fuller Shivansh branding presence, and the single earned
 * heritage line - the brief's "Proof" beat, one sentence, never a biography.
 */
export const LongOutro: React.FC<{duration: number}> = ({duration}) => {
	const frame = useCurrentFrame();
	const C = CUES.outro;

	// Contacts rotate in pairs through the close.
	const pairs = [
		[CONTACTS[1], CONTACTS[3]],
		[CONTACTS[5], CONTACTS[0]],
		[CONTACTS[7], CONTACTS[6]],
		[CONTACTS[9], CONTACTS[12]],
	];
	const PAIR_LEN = 200;
	const contactLocal = Math.max(0, frame - C.contactsFrom);
	const pairIndex = Math.min(pairs.length - 1, Math.floor(contactLocal / PAIR_LEN));
	const pairLocal = contactLocal - pairIndex * PAIR_LEN;
	const isLastPair = pairIndex === pairs.length - 1;
	// The final pair holds through the close instead of rotating out - an outro
	// should never end with no way to reach out on screen.
	const pairFade = Math.min(
		interpolate(pairLocal, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
		isLastPair
			? settle(frame, duration, 22)
			: interpolate(pairLocal, [PAIR_LEN - 16, PAIR_LEN], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})
	);

	const heritageLocal = frame - C.heritage;

	return (
		<Void>
			<Grid opacity={0.05} />

			{/* Logo, applied straight onto the frame at its largest. */}
			<div
				style={{
					position: 'absolute',
					top: 110,
					left: 0,
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					...rise(frame, 8, 30),
				}}
			>
				<Img
					src={img('img/logo-shivansh-trim.png')}
					style={{
						width: 780,
						height: 'auto',
						filter: 'drop-shadow(0 16px 44px rgba(0,0,0,0.7))',
					}}
				/>
			</div>

			<div
				style={{
					position: 'absolute',
					top: 400,
					left: 0,
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 26,
					paddingLeft: LPAD * 2,
					paddingRight: LPAD * 2,
					boxSizing: 'border-box',
					textAlign: 'center',
				}}
			>
				<div
					style={{
						...rise(frame, C.headline),
						fontFamily: FONT.display,
						fontWeight: 800,
						fontSize: 78,
						letterSpacing: -1.6,
						color: COLOR.text,
					}}
				>
					Build your system.
				</div>
				<div
					style={{
						...rise(frame, C.headline + 16),
						fontFamily: FONT.display,
						fontWeight: 500,
						fontSize: 36,
						lineHeight: 1.35,
						color: COLOR.accentSoft,
						maxWidth: 1100,
					}}
				>
					DM or call Shivansh Electronics for the best price and expert advice on
					pairing the right monitor to your room.
				</div>

				{/* Rotating contact pairs - never the whole list at once. */}
				<div
					style={{
						minHeight: 150,
						display: 'flex',
						gap: 90,
						alignItems: 'center',
						justifyContent: 'center',
						opacity: pairFade,
						marginTop: 10,
					}}
				>
					{pairs[pairIndex].map((c) => (
						<div key={`${c.label}-${c.value}`} style={{display: 'flex', alignItems: 'center', gap: 16}}>
							<span style={{fontSize: 32, lineHeight: 1}}>{c.icon}</span>
							<div style={{textAlign: 'left'}}>
								<div
									style={{
										fontFamily: FONT.data,
										fontWeight: 500,
										fontSize: 22,
										letterSpacing: 2.4,
										textTransform: 'uppercase',
										color: COLOR.textFaint,
									}}
								>
									{c.label}
								</div>
								<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: COLOR.text}}>
									{c.value}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* The one heritage line - the arc's Proof beat, and nothing more. */}
				{heritageLocal > -6 ? (
					<div
						style={{
							...rise(heritageLocal, 0, 18),
							opacity: Math.min(rise(heritageLocal, 0, 18).opacity, settle(frame, duration, 24)),
							fontFamily: FONT.data,
							fontWeight: 600,
							fontSize: 30,
							letterSpacing: 4.6,
							textTransform: 'uppercase',
							color: COLOR.textDim,
							marginTop: 8,
						}}
					>
						Engineered in India since 1970
					</div>
				) : null}

				{/* Address block, then the frame settles out. */}
				<div
					style={{
						...rise(frame, C.addressAt, 16),
						opacity: Math.min(
							rise(frame, C.addressAt, 16).opacity,
							settle(frame, duration, 22)
						),
						borderTop: `1px solid ${COLOR.lineSoft}`,
						paddingTop: 18,
						fontFamily: FONT.data,
						fontWeight: 500,
						fontSize: 24,
						letterSpacing: 1.2,
						lineHeight: 1.5,
						color: COLOR.textFaint,
					}}
				>
					{ADDRESS.line1} · {ADDRESS.line2}, {ADDRESS.line3}
				</div>
			</div>

			{/* Sonodyne closes small and quiet, bottom center. */}
			<div
				style={{
					position: 'absolute',
					bottom: 54,
					left: 0,
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					opacity: Math.min(
						interpolate(frame, [C.heritage + 30, C.heritage + 50], [0, 0.9], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						settle(frame, duration, 20)
					),
				}}
			>
				<Img src={img('img/logo-sonodyne-trim.png')} style={{width: 300, height: 'auto'}} />
			</div>
		</Void>
	);
};
