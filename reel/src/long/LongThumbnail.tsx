import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {Void, Grid, img} from '../components/Frame';
import {COLOR, FONT} from '../theme';
import cutouts from '../data/cutout-manifest.json';
import type {Lang} from '../Thumbnail';

const CUTS = cutouts as Record<string, {file: string; width: number; height: number}>;

/**
 * Long-form thumbnails, 1920x1080. Unlike the reel's single-hero portrait
 * composition, these signal "this covers the full range": all five units in
 * the smallest-to-largest lineup. Same composition across all three languages;
 * only the headline text changes, and technical/brand terms stay in Roman
 * script inside the Hindi and Bengali versions.
 */

const HEADLINE: Record<Lang, string> = {
	en: 'The Complete Studio Monitor Range',
	hi: 'सम्पूर्ण Studio Monitor Range',
	bn: 'সম্পূর্ণ Studio Monitor Range',
};

const STACK: Record<Lang, string> = {
	en: `'Archivo', sans-serif`,
	hi: `'Archivo', 'Noto Sans Devanagari', sans-serif`,
	bn: `'Archivo', 'Noto Sans Bengali', sans-serif`,
};

const LINEUP = ['srp350-09', 'srp400-08', 'srp501-04', 'srp601-08', 'slf210-02'];

export const LongThumbnail: React.FC<{lang: Lang}> = ({lang}) => (
	<Void>
		<Grid opacity={0.06} />

		{/* Branding: logo direct on the frame, top center. */}
		<div
			style={{
				position: 'absolute',
				top: 44,
				left: 0,
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<Img
				src={img('img/logo-shivansh-trim.png')}
				style={{
					width: 560,
					height: 'auto',
					filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.7))',
				}}
			/>
		</div>

		{/* The range, smallest to largest. */}
		<div
			style={{
				position: 'absolute',
				top: 230,
				left: 0,
				width: '100%',
				height: 520,
				display: 'flex',
				alignItems: 'flex-end',
				justifyContent: 'center',
				gap: 44,
			}}
		>
			<div
				style={{
					position: 'absolute',
					width: 1150,
					height: 380,
					background:
						'radial-gradient(50% 50% at 50% 60%, rgba(0,129,194,0.16) 0%, rgba(0,0,0,0) 70%)',
					filter: 'blur(28px)',
				}}
			/>
			{LINEUP.map((slug, i) => {
				const cut = CUTS[slug];
				const h = 250 + i * 62;
				return (
					<Img
						key={slug}
						src={img(cut.file)}
						style={{
							height: h,
							width: (cut.width / cut.height) * h,
							objectFit: 'contain',
							filter: 'drop-shadow(0 34px 54px rgba(0,0,0,0.8)) brightness(1.07)',
						}}
					/>
				);
			})}
		</div>

		{/* Headline + eyebrow. */}
		<div
			style={{
				position: 'absolute',
				bottom: 90,
				left: 0,
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 16,
				textAlign: 'center',
			}}
		>
			<div
				style={{
					fontFamily: FONT.data,
					fontWeight: 600,
					fontSize: 34,
					letterSpacing: 6,
					textTransform: 'uppercase',
					color: COLOR.accentSoft,
				}}
			>
				Sonodyne SRP · SLF
			</div>
			<div
				style={{
					fontFamily: STACK[lang],
					fontWeight: 800,
					fontSize: lang === 'en' ? 84 : 76,
					lineHeight: 1.08,
					letterSpacing: lang === 'en' ? -1.8 : 0,
					color: COLOR.text,
					textShadow: '0 8px 40px rgba(0,0,0,0.8)',
					maxWidth: 1500,
				}}
			>
				{HEADLINE[lang]}
			</div>
			<div
				style={{
					fontFamily: FONT.display,
					fontWeight: 700,
					fontSize: 32,
					color: COLOR.textDim,
				}}
			>
				shivanshelectronics.in · Kolkata
			</div>
		</div>

		<AbsoluteFill
			style={{
				background:
					'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 14%, transparent 86%, rgba(0,0,0,0.32) 100%)',
				pointerEvents: 'none',
			}}
		/>
	</Void>
);
