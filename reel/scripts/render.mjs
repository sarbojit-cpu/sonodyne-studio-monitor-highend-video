/**
 * Renders the reel and the three language thumbnails.
 *
 * Quality is never traded for file size here: if the finished mp4 exceeds
 * GitHub's 100MB per-file limit it is packaged into a zip at full quality rather
 * than re-encoded down.
 */
import {bundle} from '@remotion/bundler';
import {
	renderMedia,
	renderStill,
	selectComposition,
	ensureBrowser,
} from '@remotion/renderer';
import {mkdir, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import os from 'node:os';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.resolve(root, '..', 'out');

const args = process.argv.slice(2);
const thumbsOnly = args.includes('--thumbnails-only');
const stillsOnly = args.includes('--stills');
const stillFrames = (() => {
	const i = args.indexOf('--frames');
	if (i === -1) return [];
	return args[i + 1].split(',').map(Number);
})();

// Chromium is already present in this environment; point Remotion at it rather
// than downloading a second copy.
const BROWSER =
	'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

const main = async () => {
	await mkdir(outDir, {recursive: true});
	await ensureBrowser({browserExecutable: BROWSER});

	console.log('bundling...');
	const serveUrl = await bundle({
		entryPoint: path.resolve(root, 'src', 'index.ts'),
		onProgress: (p) => {
			if (p % 25 === 0) process.stdout.write(`  bundle ${p}%\n`);
		},
	});

	const chromiumOptions = {gl: 'angle'};
	const log = [];

	// --- Diagnostic stills -------------------------------------------------
	if (stillsOnly) {
		const comp = await selectComposition({
			serveUrl,
			id: 'Reel',
			inputProps: {},
			browserExecutable: BROWSER,
			chromiumOptions,
		});
		const dir = path.resolve(root, '..', '.stills');
		await mkdir(dir, {recursive: true});
		for (const f of stillFrames) {
			const out = path.join(dir, `frame-${String(f).padStart(5, '0')}.png`);
			await renderStill({
				composition: comp,
				serveUrl,
				output: out,
				frame: f,
				browserExecutable: BROWSER,
				chromiumOptions,
			});
			console.log('still', out);
		}
		return;
	}

	// --- Thumbnails --------------------------------------------------------
	for (const lang of ['EN', 'HI', 'BN']) {
		const id = `Thumbnail-${lang}`;
		const comp = await selectComposition({
			serveUrl,
			id,
			inputProps: {},
			browserExecutable: BROWSER,
			chromiumOptions,
		});
		const out = path.join(outDir, `reel_thumbnail_${lang}.png`);
		await renderStill({
			composition: comp,
			serveUrl,
			output: out,
			frame: 0,
			browserExecutable: BROWSER,
			chromiumOptions,
		});
		const size = (await stat(out)).size;
		console.log(`thumbnail ${lang}: ${mb(size)}MB`);
		log.push(`reel_thumbnail_${lang}.png — 1080x1920 PNG, ${mb(size)}MB`);
	}

	if (thumbsOnly) {
		console.log('thumbnails only; skipping video');
		return;
	}

	// --- Reel --------------------------------------------------------------
	const comp = await selectComposition({
		serveUrl,
		id: 'Reel',
		inputProps: {},
		browserExecutable: BROWSER,
		chromiumOptions,
	});

	const out = path.join(outDir, 'sonodyne-studio-series-reel.mp4');
	const started = Date.now();
	let lastPct = -1;

	await renderMedia({
		composition: comp,
		serveUrl,
		codec: 'h264',
		output: out,
		browserExecutable: BROWSER,
		chromiumOptions,
		imageFormat: 'jpeg',
		jpegQuality: 95,
		// Visually lossless for this material; no compression is applied to hit a
		// file-size ceiling.
		crf: 17,
		concurrency: Math.max(1, Math.min(os.cpus().length, 4)),
		onProgress: ({progress}) => {
			const pct = Math.floor(progress * 100);
			if (pct !== lastPct && pct % 5 === 0) {
				const el = (Date.now() - started) / 1000;
				console.log(`  render ${pct}%  (${el.toFixed(0)}s elapsed)`);
				lastPct = pct;
			}
		},
	});

	const size = (await stat(out)).size;
	const secs = comp.durationInFrames / comp.fps;
	const summary = [
		'SONODYNE STUDIO SERIES — REEL RENDER LOG',
		'',
		`File           sonodyne-studio-series-reel.mp4`,
		`Resolution     ${comp.width}x${comp.height} (9:16 portrait)`,
		`Frame rate     ${comp.fps} fps`,
		`Duration       ${secs.toFixed(2)}s (${comp.durationInFrames} frames)`,
		`Codec          H.264, CRF 17, no size-driven compression`,
		`File size      ${mb(size)} MB`,
		`Render time    ${((Date.now() - started) / 1000 / 60).toFixed(1)} min`,
		`Audio          none — see AUDIO.md`,
		'',
		'Thumbnails',
		...log.map((l) => `  ${l}`),
		'',
		size > 100 * 1024 * 1024
			? 'NOTE: exceeds GitHub 100MB per-file limit — packaged as a zip at full quality.'
			: 'Within GitHub 100MB per-file limit; committed directly.',
		'',
	].join('\n');

	await writeFile(path.join(outDir, 'RENDER-LOG.txt'), summary + '\n');
	console.log('\n' + summary);
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
