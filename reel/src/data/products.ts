/**
 * Every quantitative claim below is copied from the brief's section 4 "Verified
 * Technical Specification Master Table". Nothing here is rounded, inferred or
 * invented, and no cell that was not marked VERIFIED appears on screen.
 *
 * Two corrections the brief flags explicitly are enforced here:
 *   - SRP 350 G is a 3" woofer, never the third-party "3.5 inch".
 *   - SRP 601 G is Glass Fibre, never the older "Kevlar", and is named
 *     "SRP 601 G", never the outdated "SRP 600".
 * Kevlar is not attributed to any product: the verified table lists only Glass
 * Fibre and CURV across the entire range.
 */

export type Shot = {
	/** Cutout slug in public/cut. */
	slug: string;
	/** Motion block from the brief's section 7 camera language. */
	move: 'orbit' | 'push' | 'crawl' | 'rear' | 'tilt';
	/** Fraction of the segment this shot occupies. */
	weight: number;
	/** Normalised focal point (0-1) the move converges on. */
	focus?: {x: number; y: number};
};

export type SpecChip = {
	label: string;
	value: string;
};

export type Product = {
	id: string;
	/** Exact model designation. Never abbreviated on screen. */
	name: string;
	/** Short identity line, distinct per product. */
	tagline: string;
	/** The "why this matters" statement, grounded in that product's buyer. */
	subhead: string;
	/** MRP in rupees, shown at low prominence, inclusive of all taxes. */
	mrp: string;
	specs: SpecChip[];
	shots: Shot[];
	/** On-screen height of the product, as a share of the stage it sits in. */
	scale: number;
};

export const PRODUCTS: Product[] = [
	{
		id: 'srp350',
		name: 'SRP 350 G',
		tagline: 'The Micro-Nearfield Reference',
		subhead:
			'Uncoloured truth on a desk too small for a studio monitor — without waking the room modes that ruin the mix.',
		mrp: '25,000',
		specs: [
			{label: 'Woofer', value: '3" Glass Fibre Cone'},
			{label: 'Amplification', value: '15W + 15W Class AB'},
			{label: 'Max SPL @ 1m', value: '95 dB'},
			{label: 'Enclosure', value: 'Pressure Die-Cast Aluminium'},
		],
		shots: [
			{slug: 'srp350-02', move: 'push', weight: 1, focus: {x: 0.5, y: 0.3}},
			{slug: 'srp350-09', move: 'orbit', weight: 1},
			{slug: 'srp350-07', move: 'rear', weight: 0.85},
		],
		scale: 0.74,
	},
	{
		id: 'srp400',
		name: 'SRP 400 G',
		tagline: 'The Nearfield Standard',
		subhead:
			'CURV cone transients that defy the footprint — so the mix stops falling apart in the car.',
		mrp: '35,000',
		specs: [
			{label: 'Woofer', value: '4.5" CURV Cone'},
			{label: 'Amplification', value: '25W + 25W Class AB'},
			{label: 'Max SPL @ 1m', value: '100 dB'},
			{label: 'Frequency Response', value: '75Hz ~ 22kHz (±2dB)'},
		],
		shots: [
			{slug: 'srp400-03', move: 'crawl', weight: 1, focus: {x: 0.5, y: 0.58}},
			{slug: 'srp400-08', move: 'orbit', weight: 1},
			{slug: 'srp400-06', move: 'rear', weight: 0.85},
		],
		scale: 0.79,
	},
	{
		id: 'srp501',
		name: 'SRP 501 G',
		tagline: 'The Project Studio Standard',
		subhead:
			'Stop guessing the 100–300Hz mud. Carve EQ where amateur mixes go undefined.',
		mrp: '53,500',
		specs: [
			{label: 'Woofer', value: '5.25" Glass Fibre Cone'},
			{label: 'Amplification', value: '50W + 50W Class AB'},
			{label: 'Tweeter', value: '26mm Neodymium Silk Dome'},
			{label: 'Frequency Response', value: '58Hz ~ 21kHz (±3dB)'},
		],
		shots: [
			{slug: 'srp501-04', move: 'orbit', weight: 1},
			{slug: 'srp501-03', move: 'push', weight: 1, focus: {x: 0.5, y: 0.22}},
			{slug: 'srp501-06', move: 'rear', weight: 0.85},
		],
		scale: 0.85,
	},
	{
		id: 'srp601',
		name: 'SRP 601 G',
		tagline: 'The Flagship',
		subhead:
			'Full-spectrum authority down to 48Hz, at 107dB, with the vocal range still perfectly transparent.',
		mrp: '74,000',
		specs: [
			{label: 'Woofer', value: '6.5" Glass Fibre Cone'},
			{label: 'Amplification', value: '80W + 50W Class AB'},
			{label: 'Max SPL @ 1m', value: '107 dB'},
			{label: 'Frequency Response', value: '48Hz ~ 21kHz (±3dB)'},
		],
		shots: [
			{slug: 'srp601-08', move: 'orbit', weight: 1},
			{slug: 'srp601-07', move: 'crawl', weight: 1, focus: {x: 0.5, y: 0.6}},
			{slug: 'srp601-05', move: 'rear', weight: 0.85},
		],
		scale: 0.90,
	},
	{
		id: 'slf210',
		name: 'SLF 210 V3 BL',
		tagline: 'Complete The 2.1 Ecosystem',
		subhead:
			'Hand the sub-bass to the subwoofer. Hear what your monitors were straining to hide.',
		mrp: '60,000',
		specs: [
			{label: 'Transducer', value: '10" High-Excursion'},
			{label: 'Amplification', value: '200W Class D'},
			{label: 'Max SPL @ 1m', value: '112 dB'},
			{label: 'Low Frequency', value: '35Hz ~ Crossover (-6dB)'},
			{label: 'Phase Control', value: '0° ~ 180° Sweepable'},
			{label: 'Enclosure', value: '18mm MDF'},
		],
		shots: [
			{slug: 'slf210-08', move: 'tilt', weight: 1, focus: {x: 0.5, y: 0.55}},
			{slug: 'slf210-02', move: 'orbit', weight: 1},
			{slug: 'slf210-04', move: 'rear', weight: 1},
		],
		scale: 0.84,
	},
];

export const byId = (id: string): Product => {
	const found = PRODUCTS.find((p) => p.id === id);
	if (!found) throw new Error(`unknown product ${id}`);
	return found;
};
