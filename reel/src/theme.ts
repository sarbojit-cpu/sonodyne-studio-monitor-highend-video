/**
 * Visual language per the creative brief, section 6: monolithic weight,
 * industrial durability, surgical acoustic precision. Deep charcoal voids, a
 * monochromatic and shadowy palette, and the product's own grey powder-coat and
 * black finish carrying the contrast rather than a competing brand wash.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** The three-zone screen architecture. Every frame obeys these bands. */
export const ZONE = {
	/** Top branding band - dynamic, appears and clears. */
	A: {top: 0, height: 200},
	/** Main content band - product, typography, motion graphics. */
	B: {top: 200, height: 1500},
	/** Bottom branding band - dynamic, appears and clears. */
	C: {top: 1700, height: 220},
} as const;

/** Left/right safe padding, applied to Zone B content only. */
export const PAD = 56;
export const CONTENT_W = WIDTH - PAD * 2;

export const COLOR = {
	void: '#080909',
	charcoal: '#111417',
	charcoalLift: '#1a1e22',
	line: '#2a2f35',
	lineSoft: '#20242a',
	text: '#f4f6f7',
	textDim: '#98a1a9',
	textFaint: '#5f686f',
	/** Drawn from the Sonodyne mark; used sparingly for data and emphasis. */
	accent: '#0081c2',
	accentSoft: '#3ba3d8',
	white: '#ffffff',
} as const;

export const FONT = {
	display: "'Archivo', system-ui, sans-serif",
	data: "'Barlow Condensed', system-ui, sans-serif",
	devanagari: "'Noto Sans Devanagari', system-ui, sans-serif",
	bengali: "'Noto Sans Bengali', system-ui, sans-serif",
} as const;

/**
 * Deliberate, mechanical smoothness (brief section 7). Nothing frantic, nothing
 * bouncy - this is precision-instrument branding, not consumer-gadget energy.
 */
export const EASE = {
	/** Heavy geared dolly: slow to start, slow to settle. */
	dolly: [0.65, 0.02, 0.2, 1] as const,
	/** Decisive snap that settles instantly, for rear-panel reveals. */
	snap: [0.16, 1, 0.3, 1] as const,
	/** Plain confident entrance for typography. */
	text: [0.22, 0.65, 0.24, 1] as const,
} as const;

export const seconds = (s: number) => Math.round(s * FPS);
