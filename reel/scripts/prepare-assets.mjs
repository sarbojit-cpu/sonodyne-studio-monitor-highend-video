/**
 * Converts the repository's .webp product photography into PNGs that Remotion
 * can load deterministically, and copies the two brand logos into public/img.
 *
 * The conversion is cached: a file is only re-encoded when the source is newer
 * than the output, so repeated `npm run render` calls cost nothing.
 */
import {createHash} from 'node:crypto';
import {mkdir, readdir, stat, writeFile, copyFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const outDir = path.resolve(here, '..', 'public', 'img');
const manifestPath = path.resolve(here, '..', 'src', 'data', 'asset-manifest.json');

/** Maps a source filename to a stable, code-friendly slug. */
const slugFor = (file) => {
	const base = file.replace(/\.(webp|png)$/i, '');
	if (base === 'SHIVANSH ELECTRONICS BRAND LOGO') return 'logo-shivansh';
	if (base === 'SONODYNE BRAND LOGO') return 'logo-sonodyne';

	const numbered = base.match(/^SONODYNE (.+?) \((\d+)\)$/);
	const plain = base.match(/^SONODYNE (.+?)$/);
	const raw = numbered ? numbered[1] : plain ? plain[1] : base;
	const index = numbered ? Number(numbered[2]) : 0;

	const family = raw
		.replace(/SRP (\d+)/, 'srp$1')
		.replace(/SLF 210 V3/, 'slf210')
		.replace(/STUDIO MONITOR/, 'generic')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-');

	return `${family}-${String(index).padStart(2, '0')}`;
};

const run = async () => {
	await mkdir(outDir, {recursive: true});
	await mkdir(path.dirname(manifestPath), {recursive: true});

	const files = (await readdir(repoRoot)).filter(
		(f) => /\.webp$/i.test(f) || /BRAND LOGO\.png$/i.test(f)
	);

	const manifest = {};
	let converted = 0;
	let cached = 0;

	for (const file of files.sort()) {
		const slug = slugFor(file);
		const src = path.join(repoRoot, file);
		const dest = path.join(outDir, `${slug}.png`);

		const srcStat = await stat(src);
		const isFresh =
			existsSync(dest) && (await stat(dest)).mtimeMs >= srcStat.mtimeMs;

		if (!isFresh) {
			if (/\.png$/i.test(file)) {
				await copyFile(src, dest);
			} else {
				await sharp(src).png({compressionLevel: 9}).toFile(dest);
			}
			converted += 1;
		} else {
			cached += 1;
		}

		const meta = await sharp(dest).metadata();
		manifest[slug] = {
			src: file,
			file: `img/${slug}.png`,
			width: meta.width,
			height: meta.height,
			// Identical source bytes appear more than once in the folder; the hash
			// lets the catalog step spot true duplicates instead of guessing.
			hash: createHash('md5')
				.update(await sharp(src).raw().toBuffer())
				.digest('hex')
				.slice(0, 12),
		};
	}

	// Both brand logos ship as artwork on an opaque white rounded plate with
	// transparent padding around it. Trimming that padding means the plate can be
	// placed flush on the frame at a generous size, with nothing else inside it.
	for (const slug of ['logo-shivansh', 'logo-sonodyne']) {
		const dest = path.join(outDir, `${slug}-trim.png`);
		if (!existsSync(dest)) {
			await sharp(path.join(outDir, `${slug}.png`))
				.trim({threshold: 1})
				.png({compressionLevel: 9})
				.toFile(dest);
		}
		const meta = await sharp(dest).metadata();
		manifest[`${slug}-trim`] = {
			src: `${slug}.png`,
			file: `img/${slug}-trim.png`,
			width: meta.width,
			height: meta.height,
		};
	}

	await writeFile(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');

	// The reel renders silent unless a music bed is dropped in. Recording that
	// here keeps the composition free of any runtime filesystem check.
	const hasMusic = existsSync(path.resolve(here, '..', 'public', 'audio', 'music.mp3'));
	await writeFile(
		path.resolve(here, '..', 'src', 'data', 'audio.json'),
		JSON.stringify({hasMusic}, null, '\t') + '\n'
	);
	console.log(
		`prepare-assets: ${converted} converted, ${cached} cached, ${
			Object.keys(manifest).length
		} total → public/img`
	);
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
