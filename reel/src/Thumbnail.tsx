import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {Void, Grid, img} from './components/Frame';
import {COLOR, FONT, ZONE, PAD} from './theme';
import cutouts from './data/cutout-manifest.json';

const CUTS = cutouts as Record<string, {file: string; width: number; height: number}>;

export type Lang = 'en' | 'hi' | 'bn';

/**
 * All three thumbnails share one composition - same hero shot, same layout, same
 * branding treatment. Only the headline language changes.
 *
 * Technical terms and brand names stay in Roman script in every language, per
 * the account's existing convention. The font stack puts Archivo first so those
 * Roman words keep the display face, and falls through to Noto only for the
 * Devanagari and Bengali glyphs.
 */
const HEADLINE: Record<Lang, string> = {
	en: "Studio Monitors That Don't Lie",
	hi: 'Studio Monitors जो सच बोलते हैं',
	bn: 'Studio Monitors যা সত্যি বলে',
};

const EYEBROW: Record<Lang, string> = {
	en: 'Sonodyne Studio Series',
	hi: 'Sonodyne Studio Series',
	bn: 'Sonodyne Studio Series',
};

const STACK: Record<Lang, string> = {
	en: `'Archivo', sans-serif`,
	hi: `'Archivo', 'Noto Sans Devanagari', sans-serif`,
	bn: `'Archivo', 'Noto Sans Bengali', sans-serif`,
};

/** The flagship reads strongest as a single clear focus at thumbnail scale. */
const HERO = 'srp601-08';

export const Thumbnail: React.FC<{lang: Lang}> = ({lang}) => {
	const hero = CUTS[HERO];
	const heroH = 900;

	return (
		<Void>
			<Grid opacity={0.07} />

			{/* Zone A - branding, logo applied directly to the frame. */}
			<div
				style={{
					position: 'absolute',
					top: ZONE.A.top,
					left: 0,
					width: '100%',
					height: ZONE.A.height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{/* Sized so the lockup sits fully inside Zone A rather than clipping
				    against the top of the frame. */}
				<Img
					src={img('img/logo-shivansh-trim.png')}
					style={{
						width: 620,
						height: 'auto',
						filter: 'drop-shadow(0 12px 36px rgba(0,0,0,0.7))',
					}}
				/>
			</div>

			{/* Zone B - hero product and one short headline. */}
			<div
				style={{
					position: 'absolute',
					top: ZONE.B.top,
					left: 0,
					width: '100%',
					height: ZONE.B.height,
					paddingLeft: PAD,
					paddingRight: PAD,
					boxSizing: 'border-box',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'space-between',
					paddingTop: 24,
					paddingBottom: 20,
				}}
			>
				<div
					style={{
						fontFamily: FONT.data,
						fontWeight: 600,
						fontSize: 38,
						letterSpacing: 7,
						textTransform: 'uppercase',
						color: COLOR.accentSoft,
					}}
				>
					{EYEBROW[lang]}
				</div>

				<div
					style={{
						position: 'relative',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<div
						style={{
							position: 'absolute',
							width: 760,
							height: 420,
							background:
								'radial-gradient(50% 50% at 50% 50%, rgba(0,129,194,0.18) 0%, rgba(0,0,0,0) 70%)',
							filter: 'blur(30px)',
						}}
					/>
					<Img
						src={img(hero.file)}
						style={{
							height: heroH,
							width: (hero.width / hero.height) * heroH,
							objectFit: 'contain',
							filter: 'drop-shadow(0 50px 80px rgba(0,0,0,0.8))',
						}}
					/>
				</div>

				<div
					style={{
						fontFamily: STACK[lang],
						fontWeight: 800,
						fontSize: lang === 'en' ? 104 : 92,
						lineHeight: 1.1,
						letterSpacing: lang === 'en' ? -2 : 0,
						textAlign: 'center',
						color: COLOR.text,
						textShadow: '0 8px 40px rgba(0,0,0,0.8)',
					}}
				>
					{HEADLINE[lang]}
				</div>
			</div>

			{/* Zone C - branding, contact only. */}
			<div
				style={{
					position: 'absolute',
					top: ZONE.C.top,
					left: 0,
					width: '100%',
					height: ZONE.C.height,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 8,
				}}
			>
				<div
					style={{
						fontFamily: FONT.display,
						fontWeight: 700,
						fontSize: 44,
						color: COLOR.text,
					}}
				>
					shivanshelectronics.in
				</div>
				<div
					style={{
						fontFamily: FONT.data,
						fontWeight: 500,
						fontSize: 30,
						letterSpacing: 3,
						textTransform: 'uppercase',
						color: COLOR.textFaint,
					}}
				>
					Kolkata · +91 98316 62458
				</div>
			</div>

			<AbsoluteFill
				style={{
					background:
						'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, transparent 16%, transparent 84%, rgba(0,0,0,0.34) 100%)',
					pointerEvents: 'none',
				}}
			/>
		</Void>
	);
};
