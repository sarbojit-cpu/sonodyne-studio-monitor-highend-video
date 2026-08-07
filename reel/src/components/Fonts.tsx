import React from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import fonts from '../data/fonts.json';

/**
 * Fonts are served from public/fonts rather than a webfont CDN, so rendering
 * never touches the network and every frame is reproducible. Rendering is held
 * until the faces are actually parsed - otherwise the first frames can be
 * composed against a fallback face and shift once the real one lands.
 */
type FontEntry = {family: string; weight: number; file: string; format: string};

const CSS = (fonts as FontEntry[])
	.map(
		(f) =>
			`@font-face{font-family:'${f.family}';font-style:normal;font-weight:${f.weight};` +
			`font-display:block;src:url('${staticFile(f.file)}') format('${f.format}');}`
	)
	.join('\n');

export const Fonts: React.FC = () => {
	const [handle] = React.useState(() => delayRender('Loading typefaces'));

	React.useEffect(() => {
		let cancelled = false;
		document.fonts.ready.then(() => {
			if (!cancelled) continueRender(handle);
		});
		return () => {
			cancelled = true;
		};
	}, [handle]);

	return <style dangerouslySetInnerHTML={{__html: CSS}} />;
};
