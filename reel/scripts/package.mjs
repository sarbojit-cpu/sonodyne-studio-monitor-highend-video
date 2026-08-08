/**
 * Packages the deliverables. If the finished mp4 exceeds GitHub's 100MB
 * per-file limit it is zipped at full quality — the video is never re-encoded
 * down to fit a size ceiling.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, statSync, rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '..', '..', 'out');
const video = path.join(outDir, 'sonodyne-studio-series-reel.mp4');
const zip = path.join(outDir, 'sonodyne-studio-series-reel.zip');
const LIMIT = 100 * 1024 * 1024;

if (!existsSync(video)) {
	console.error('no render found at', video);
	process.exit(1);
}

const size = statSync(video).size;
const mb = (size / 1024 / 1024).toFixed(1);

if (size > LIMIT) {
	if (existsSync(zip)) rmSync(zip);
	execFileSync('zip', ['-j', '-9', zip, video], {stdio: 'inherit'});
	const zmb = (statSync(zip).size / 1024 / 1024).toFixed(1);
	console.log(`video ${mb}MB exceeds the 100MB limit → zipped to ${zmb}MB (no quality loss)`);
	console.log('KEEP_ZIP=1');
} else {
	console.log(`video ${mb}MB is within the 100MB limit → committed directly`);
	console.log('KEEP_ZIP=0');
}
