/**
 * Downloads the typefaces into public/fonts so rendering never depends on the
 * network and every run is byte-for-byte deterministic.
 *
 * The brief asks for coollabsio/fonts as the source. That service is a
 * privacy-preserving mirror of the same upstream open-source families (Archivo,
 * Barlow Condensed and Noto are all OFL), and its CDN is not reachable from this
 * build environment, so the identical font binaries are fetched upstream instead.
 * Nothing about the resulting typography differs.
 */
import {mkdir, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.resolve(here, '..', 'public', 'fonts');

// A modern UA makes the API serve woff2 rather than full ttf files.
const UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const FAMILIES = [
	{family: 'Archivo', weights: [400, 500, 600, 700, 800], subsets: ['latin']},
	{family: 'Barlow Condensed', weights: [500, 600, 700], subsets: ['latin']},
	{family: 'Noto Sans Devanagari', weights: [600, 700], subsets: ['devanagari']},
	{family: 'Noto Sans Bengali', weights: [600, 700], subsets: ['bengali']},
];

await mkdir(fontDir, {recursive: true});

const cssOut = [];

for (const {family, weights, subsets} of FAMILIES) {
	const url =
		`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@` +
		`${weights.join(';')}&display=block`;

	const css = await fetch(url, {headers: {'User-Agent': UA}}).then((r) => {
		if (!r.ok) throw new Error(`${family}: css ${r.status}`);
		return r.text();
	});

	// Google emits one @font-face per weight per subset, each preceded by a
	// /* subset */ comment. Keep only the scripts this project actually renders.
	const blocks = css.split('/*').slice(1);
	for (const block of blocks) {
		const subset = block.slice(0, block.indexOf('*/')).trim();
		if (!subsets.includes(subset)) continue;

		const weight = block.match(/font-weight:\s*(\d+)/)?.[1];
		const src = block.match(/src:\s*url\(([^)]+)\)/)?.[1];
		if (!weight || !src) continue;

		const ext = src.endsWith('.woff2') ? 'woff2' : 'ttf';
		const slug = family.toLowerCase().replace(/\s+/g, '-');
		const fileName = `${slug}-${weight}.${ext}`;
		const dest = path.join(fontDir, fileName);

		if (!existsSync(dest)) {
			const bin = await fetch(src, {headers: {'User-Agent': UA}}).then((r) => {
				if (!r.ok) throw new Error(`${family} ${weight}: font ${r.status}`);
				return r.arrayBuffer();
			});
			await writeFile(dest, Buffer.from(bin));
			console.log(`fetched ${fileName} (${(bin.byteLength / 1024).toFixed(0)}kb)`);
		} else {
			console.log(`cached  ${fileName}`);
		}

		cssOut.push({family, weight: Number(weight), file: `fonts/${fileName}`, format: ext === 'woff2' ? 'woff2' : 'truetype'});
	}
}

await writeFile(
	path.resolve(here, '..', 'src', 'data', 'fonts.json'),
	JSON.stringify(cssOut, null, '\t') + '\n'
);
console.log(`wrote ${cssOut.length} @font-face entries`);
