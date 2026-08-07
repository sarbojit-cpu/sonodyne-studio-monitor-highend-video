import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {COLOR, ZONE, PAD, WIDTH} from '../theme';

/** The deep charcoal void every scene sits in. */
export const Void: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{backgroundColor: COLOR.void}}>
		<AbsoluteFill
			style={{
				background: `radial-gradient(120% 62% at 50% 44%, ${COLOR.charcoalLift} 0%, ${COLOR.charcoal} 38%, ${COLOR.void} 78%)`,
			}}
		/>
		{children}
	</AbsoluteFill>
);

/**
 * Zone B - the content band. Left/right safe padding is applied here and only
 * here, so the reel still reads correctly when a platform crops or letterboxes
 * for laptop preview, iPad or older Android aspect ratios.
 */
export const ZoneB: React.FC<{
	children?: React.ReactNode;
	style?: React.CSSProperties;
}> = ({children, style}) => (
	<div
		style={{
			position: 'absolute',
			top: ZONE.B.top,
			left: 0,
			width: WIDTH,
			height: ZONE.B.height,
			paddingLeft: PAD,
			paddingRight: PAD,
			boxSizing: 'border-box',
			display: 'flex',
			flexDirection: 'column',
			...style,
		}}
	>
		{children}
	</div>
);

/** A branding band. Compact lockups may sit tighter than Zone B, never flush. */
export const Band: React.FC<{
	zone: 'A' | 'C';
	align: 'left' | 'center' | 'right';
	children?: React.ReactNode;
}> = ({zone, align, children}) => {
	const z = ZONE[zone];
	return (
		<div
			style={{
				position: 'absolute',
				top: z.top,
				left: 0,
				width: WIDTH,
				height: z.height,
				paddingLeft: 40,
				paddingRight: 40,
				boxSizing: 'border-box',
				display: 'flex',
				alignItems: 'center',
				justifyContent:
					align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
			}}
		>
			{children}
		</div>
	);
};

/**
 * A faint engineering grid. Keeps the void from reading as an empty black block
 * without introducing a competing bright background system.
 */
export const Grid: React.FC<{opacity?: number}> = ({opacity = 0.05}) => (
	<AbsoluteFill
		style={{
			opacity,
			backgroundImage: `linear-gradient(${COLOR.line} 1px, transparent 1px), linear-gradient(90deg, ${COLOR.line} 1px, transparent 1px)`,
			backgroundSize: '90px 90px',
			maskImage: 'radial-gradient(70% 50% at 50% 45%, #000 0%, transparent 100%)',
			WebkitMaskImage:
				'radial-gradient(70% 50% at 50% 45%, #000 0%, transparent 100%)',
		}}
	/>
);

export const img = (file: string) => staticFile(file);
