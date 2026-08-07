import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Void, ZoneB, Grid} from '../components/Frame';
import {AmbientPlate} from '../components/ProductStage';
import {HookLine} from '../components/Type';
import {COLOR, FONT} from '../theme';

/**
 * Cold open on the problem, not the product (brief section 5). A mix that sounds
 * perfect in the room and collapses everywhere else.
 *
 * The backdrop here uses the two generic "studio monitor" frames. Those are
 * atmospheric renders rather than accurate product photography, so they are
 * heavily blurred, darkened and desaturated, and they carry no product claim -
 * no model name or specification is attached to them anywhere in this scene.
 * Every frame that does name a product uses only genuine Sonodyne photography.
 */
export const Hook: React.FC<{duration: number}> = ({duration}) => {
	const frame = useCurrentFrame();

	const beats = [
		{text: 'It sounded perfect', at: 6, len: 62, emphasis: false},
		{text: 'in your room.', at: 30, len: 62, emphasis: true},
		{text: 'Then you played it', at: 96, len: 60, emphasis: false},
		{text: 'in the car.', at: 118, len: 62, emphasis: true},
	];

	const scan = interpolate(frame, [0, duration], [0, 1]);

	return (
		<Void>
			<AmbientPlate slug="generic-00" local={frame} duration={110} intensity={0.3} />
			<AmbientPlate
				slug="generic-02"
				local={frame - 100}
				duration={duration - 100}
				intensity={0.28}
			/>
			<Grid opacity={0.045} />

			{/* A single sweep of light across the void, timed to the last beat. */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `linear-gradient(105deg, transparent ${scan * 130 - 24}%, rgba(0,129,194,0.10) ${
						scan * 130 - 10
					}%, transparent ${scan * 130 + 6}%)`,
				}}
			/>

			<ZoneB style={{justifyContent: 'center'}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
					{beats.map((b) => (
						<HookLine
							key={b.text}
							text={b.text}
							local={frame - b.at}
							duration={b.len}
							emphasis={b.emphasis}
						/>
					))}
				</div>

				<div
					style={{
						marginTop: 70,
						opacity: interpolate(frame, [150, 170, duration - 8, duration], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						fontFamily: FONT.data,
						fontWeight: 600,
						fontSize: 40,
						letterSpacing: 5,
						textTransform: 'uppercase',
						color: COLOR.accentSoft,
					}}
				>
					Your room was lying to you
				</div>
			</ZoneB>
		</Void>
	);
};
