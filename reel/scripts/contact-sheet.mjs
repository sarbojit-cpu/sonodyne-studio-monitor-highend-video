/**
 * Builds labelled contact sheets so every source photo can be inspected before
 * shot planning. Development aid only - not part of the render pipeline.
 */
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.resolve(here, '..', 'public', 'img');
const outDir = process.argv[3] ?? path.resolve(here, '..', '..', '.contact');
const manifest = JSON.parse(
	await import('node:fs').then((fs) =>
		fs.readFileSync(path.resolve(here, '..', 'src', 'data', 'asset-manifest.json'), 'utf8')
	)
);

const CELL_W = 520;
const CELL_H = 347;
const LABEL_H = 34;
const COLS = 3;
const ROWS = 3;
const PER_SHEET = COLS * ROWS;

const slugs = Object.keys(manifest)
	.filter((s) => !s.startsWith('logo'))
	.sort();

await mkdir(outDir, {recursive: true});

for (let sheet = 0; sheet * PER_SHEET < slugs.length; sheet++) {
	const batch = slugs.slice(sheet * PER_SHEET, (sheet + 1) * PER_SHEET);
	const sheetW = COLS * CELL_W;
	const sheetH = Math.ceil(batch.length / COLS) * (CELL_H + LABEL_H);

	const composites = [];
	for (let i = 0; i < batch.length; i++) {
		const slug = batch[i];
		const col = i % COLS;
		const row = Math.floor(i / COLS);
		const top = row * (CELL_H + LABEL_H);
		const left = col * CELL_W;

		composites.push({
			input: await sharp(path.join(imgDir, `${slug}.png`))
				.resize(CELL_W - 8, CELL_H - 8, {fit: 'contain', background: '#000'})
				.toBuffer(),
			top: top + 4,
			left: left + 4,
		});

		const label = Buffer.from(
			`<svg width="${CELL_W}" height="${LABEL_H}">
        <rect width="100%" height="100%" fill="#111"/>
        <text x="10" y="24" font-family="monospace" font-size="22" fill="#0f0">${slug}</text>
      </svg>`
		);
		composites.push({input: label, top: top + CELL_H, left});
	}

	const out = path.join(outDir, `sheet-${String(sheet + 1).padStart(2, '0')}.png`);
	await sharp({
		create: {width: sheetW, height: sheetH, channels: 3, background: '#000'},
	})
		.composite(composites)
		.png()
		.toFile(out);
	console.log(out, batch.join(' '));
}
