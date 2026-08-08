/**
 * Packages the long-form render for delivery without quality loss.
 *
 * GitHub's 100MB hard cap applies to every committed file - including a zip -
 * so a render that exceeds it is stored as a SPLIT zip archive (parts each
 * under 95MB). Rejoin with any modern unzip, or:
 *
 *   zip -s 0 sonodyne-studio-series-longform.zip --out joined.zip && unzip joined.zip
 *
 * The video itself is never re-encoded to fit the ceiling.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, statSync, rmSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '..', '..', 'out');
const video = path.join(outDir, 'sonodyne-studio-series-longform.mp4');
const zipBase = path.join(outDir, 'sonodyne-studio-series-longform.zip');
const LIMIT = 100 * 1024 * 1024;

if (!existsSync(video)) {
	console.error('no render found at', video);
	process.exit(1);
}

const size = statSync(video).size;
const mb = (b) => (b / 1024 / 1024).toFixed(1);

if (size <= LIMIT) {
	console.log(`video ${mb(size)}MB is within the 100MB limit → committed directly`);
	process.exit(0);
}

// Clean any previous parts, then split-zip at store-level compression (H.264
// doesn't compress further; -0 keeps packaging fast and bit-identical).
for (const f of readdirSync(outDir)) {
	if (f.startsWith('sonodyne-studio-series-longform.z')) {
		rmSync(path.join(outDir, f));
	}
}
execFileSync('zip', ['-0', '-j', '-s', '95m', zipBase, video], {stdio: 'inherit'});

const parts = readdirSync(outDir)
	.filter((f) => f.startsWith('sonodyne-studio-series-longform.z'))
	.sort();
console.log(`video ${mb(size)}MB exceeds the 100MB limit → split zip, no quality loss:`);
for (const p of parts) {
	console.log(`  ${p}  ${mb(statSync(path.join(outDir, p)).size)}MB`);
}
