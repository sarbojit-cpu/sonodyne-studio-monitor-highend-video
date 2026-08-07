/**
 * The genuine product photography in this repo is shot on white seamless, but
 * the brief calls for products floating in a deep charcoal void. Rather than
 * letterboxing a 3:2 landscape plate into a 9:16 frame (which would either
 * stretch the product or waste most of the screen), we key the white backdrop
 * out and keep only the product pixels. That gives Remotion a tall, free-standing
 * subject it can compose vertically without distorting anything.
 *
 * Keying is done by flood-filling the background inward from the frame border,
 * NOT by a global luminance threshold: rear-panel shots have large white spec
 * labels and the woofer cones have bright highlights, and a global threshold
 * would punch holes straight through them.
 */
import {mkdir, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.resolve(here, '..', 'public', 'img');
const outDir = path.resolve(here, '..', 'public', 'cut');
const metaPath = path.resolve(here, '..', 'src', 'data', 'cutout-manifest.json');

// Only genuine white-seamless single-product frames. The lineup/hero frames use
// a grey gradient backdrop and the lifestyle frames are dark-room scenes, so
// neither belongs here.
const CUTOUT_SLUGS = [
	'srp350-02', 'srp350-03', 'srp350-04', 'srp350-05',
	'srp350-06', 'srp350-07', 'srp350-08', 'srp350-09',
	'srp400-03', 'srp400-04', 'srp400-05', 'srp400-06',
	'srp400-07', 'srp400-08', 'srp400-09',
	'srp501-03', 'srp501-04', 'srp501-05', 'srp501-06', 'srp501-07',
	'srp601-03', 'srp601-04', 'srp601-05', 'srp601-06', 'srp601-07', 'srp601-08',
	'slf210-02', 'slf210-04', 'slf210-05', 'slf210-06', 'slf210-07', 'slf210-08',
];

// The backdrops are not flat white - they are soft grey-to-white gradients with
// a contact shadow under the product. OUTSIDE therefore sits well below the
// darkest backdrop tone but comfortably above the light grey powder-coat, so the
// whole gradient floods away in one pass. Edge softness is recovered by blurring
// the binary mask rather than by a luminance ramp, which would leave the
// gradient itself semi-transparent.
const OUTSIDE = 175;
const TARGET_MAX = 1500;

const buildCutout = async (slug) => {
	const src = path.join(imgDir, `${slug}.png`);
	const {data, info} = await sharp(src)
		.ensureAlpha()
		.raw()
		.toBuffer({resolveWithObject: true});

	const {width: w, height: h, channels: ch} = info;
	const lum = new Uint8Array(w * h);
	for (let i = 0; i < w * h; i++) {
		const o = i * ch;
		lum[i] = (data[o] * 299 + data[o + 1] * 587 + data[o + 2] * 114) / 1000;
	}

	// Flood fill the backdrop inward from every border pixel.
	const outside = new Uint8Array(w * h);
	const stack = [];
	const push = (x, y) => {
		const i = y * w + x;
		if (!outside[i] && lum[i] >= OUTSIDE) {
			outside[i] = 1;
			stack.push(i);
		}
	};
	for (let x = 0; x < w; x++) {
		push(x, 0);
		push(x, h - 1);
	}
	for (let y = 0; y < h; y++) {
		push(0, y);
		push(w - 1, y);
	}
	while (stack.length) {
		const i = stack.pop();
		const x = i % w;
		const y = (i / w) | 0;
		if (x > 0) push(x - 1, y);
		if (x < w - 1) push(x + 1, y);
		if (y > 0) push(x, y - 1);
		if (y < h - 1) push(x, y + 1);
	}

	// Bounding box of the product as keyed so far.
	let bx0 = w, by0 = h, bx1 = -1, by1 = -1;
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (!outside[y * w + x]) {
				if (x < bx0) bx0 = x;
				if (x > bx1) bx1 = x;
				if (y < by0) by0 = y;
				if (y > by1) by1 = y;
			}
		}
	}
	if (bx1 < 0) throw new Error(`${slug}: keyed to nothing`);

	// Backdrop trapped between the feet and the cabinet base is enclosed by the
	// silhouette, so the first flood could never reach it from the frame border -
	// it survives as a bright sliver under the product. Flooding a second time
	// from the *bounding box* border catches it, while interior features like the
	// white rear-panel spec labels stay untouched because they never touch that
	// border.
	const stack2 = [];
	const push2 = (x, y) => {
		if (x < bx0 || x > bx1 || y < by0 || y > by1) return;
		const i = y * w + x;
		if (!outside[i] && lum[i] >= 245) {
			outside[i] = 1;
			stack2.push(i);
		}
	};
	for (let x = bx0; x <= bx1; x++) {
		push2(x, by0);
		push2(x, by1);
	}
	for (let y = by0; y <= by1; y++) {
		push2(bx0, y);
		push2(bx1, y);
	}
	while (stack2.length) {
		const i = stack2.pop();
		const x = i % w;
		const y = (i / w) | 0;
		push2(x - 1, y);
		push2(x + 1, y);
		push2(x, y - 1);
		push2(x, y + 1);
	}

	let floodedPx = 0;
	const alpha = Buffer.alloc(w * h);
	for (let i = 0; i < w * h; i++) {
		alpha[i] = outside[i] ? 0 : 255;
		floodedPx += outside[i];
	}

	const floodedPct = (floodedPx / (w * h)) * 100;
	// A healthy key removes most of the frame but never almost all of it. If the
	// flood leaked through a bright highlight into the product itself, bail loudly
	// instead of shipping a half-erased speaker.
	if (floodedPct > 97 || floodedPct < 20) {
		throw new Error(
			`${slug}: implausible key, ${floodedPct.toFixed(1)}% flooded as background`
		);
	}

	// sharp may hand a single-channel mask back as greyscale-expanded RGB, so the
	// stride has to be read from the result rather than assumed to be 1.
	const blurred = await sharp(alpha, {raw: {width: w, height: h, channels: 1}})
		.blur(1)
		.raw()
		.toBuffer({resolveWithObject: true});
	const stride = blurred.info.channels;
	const softAlpha = {get: (i) => blurred.data[i * stride]};

	// Bounding box of everything meaningfully opaque, so the exported asset is
	// tightly cropped to the product and carries no dead transparent margin.
	let minX = w, minY = h, maxX = -1, maxY = -1;
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (softAlpha.get(y * w + x) > 24) {
				if (x < minX) minX = x;
				if (x > maxX) maxX = x;
				if (y < minY) minY = y;
				if (y > maxY) maxY = y;
			}
		}
	}
	if (maxX < 0) throw new Error(`${slug}: keyed to nothing`);

	const rgba = Buffer.alloc(w * h * 4);
	for (let i = 0; i < w * h; i++) {
		const o = i * ch;
		rgba[i * 4] = data[o];
		rgba[i * 4 + 1] = data[o + 1];
		rgba[i * 4 + 2] = data[o + 2];
		rgba[i * 4 + 3] = softAlpha.get(i);
	}

	const cw = maxX - minX + 1;
	const chh = maxY - minY + 1;
	const scale = Math.min(TARGET_MAX / Math.max(cw, chh), 2.2);

	await sharp(rgba, {raw: {width: w, height: h, channels: 4}})
		.extract({left: minX, top: minY, width: cw, height: chh})
		.resize({
			width: Math.round(cw * scale),
			height: Math.round(chh * scale),
			kernel: 'lanczos3',
			fit: 'fill',
		})
		.sharpen({sigma: 0.6})
		.png({compressionLevel: 9})
		.toFile(path.join(outDir, `${slug}.png`));

	return {
		file: `cut/${slug}.png`,
		width: Math.round(cw * scale),
		height: Math.round(chh * scale),
		sourceBox: {w: cw, h: chh},
		upscale: Number(scale.toFixed(2)),
		floodedPct: Number(floodedPct.toFixed(1)),
	};
};

await mkdir(outDir, {recursive: true});
const meta = {};
for (const slug of CUTOUT_SLUGS) {
	if (!existsSync(path.join(imgDir, `${slug}.png`))) {
		throw new Error(`missing source ${slug}`);
	}
	meta[slug] = await buildCutout(slug);
	console.log(
		slug,
		`${meta[slug].sourceBox.w}x${meta[slug].sourceBox.h}`,
		`→ ${meta[slug].width}x${meta[slug].height}`,
		`(${meta[slug].upscale}x)`
	);
}
await writeFile(metaPath, JSON.stringify(meta, null, '\t') + '\n');
