import {byId, type Product, type Shot} from '../data/products';

/**
 * Long-form extension of the product data. The reel's module stays the single
 * source for names, taglines, prices and the headline spec chips; this module
 * adds what only the 10-minute cut has room for:
 *
 *   fullSpecs   the COMPLETE verified row from the brief's Section 4 master
 *               table - every cell, exactly as verified, nothing invented.
 *   psych       three on-screen narrative beats per product, written fresh
 *               from the brief's Section 3 customer-psychology prose.
 *   roomLabel   the room/user context that justifies this size (Section 2).
 *   shots       a longer shot list than the reel used - long-form segments
 *               run 90s, so more of the real photography gets screen time.
 */

export type LongProduct = {
	base: Product;
	roomLabel: string;
	psych: [string, string, string];
	fullSpecs: {label: string; value: string}[];
	shots: Shot[];
	overlay: 'resonance' | 'waveguide' | 'freqRange' | 'headroom' | 'bassMgmt';
};

const P = (id: string) => byId(id);

export const LONG_PRODUCTS: Record<string, LongProduct> = {
	srp350: {
		base: P('srp350'),
		roomLabel: 'Broadcast desks · compact multimedia · extreme nearfield',
		psych: [
			'A small room turns long bass waves against you — they reflect off close walls and fold back over the mix.',
			'A controlled 3-inch driver in a sealed die-cast enclosure keeps that chaos out of the room entirely.',
			'What remains is the uncoloured truth of the midrange and treble, on a desk no monitor was supposed to fit.',
		],
		fullSpecs: [
			{label: 'LF Driver', value: '3" Glass Fibre cone'},
			{label: 'HF Driver', value: '26mm Silk dome on waveguide'},
			{label: 'Amplification', value: 'LF 15W + HF 15W (Class AB)'},
			{label: 'Frequency Response', value: '95Hz ~ 22kHz (±2dB)'},
			{label: 'Max SPL @ 1m', value: '95 dB'},
			{label: 'THD @ Rated Power', value: '< 0.1%'},
			{label: 'Inputs', value: 'Bal XLR, TRS, Unbal RCA'},
			{label: 'Enclosure', value: 'Pressure die-cast aluminium'},
			{label: 'Control / EQ', value: 'Bass tilt, Treble tilt'},
			{label: 'Finish', value: 'Grey (Powder coated)'},
			{label: 'Dimensions (WxHxD)', value: '125 × 184 × 120 mm'},
			{label: 'Net Weight', value: '2.5 kg'},
		],
		shots: [
			{slug: 'srp350-02', move: 'push', weight: 1, focus: {x: 0.5, y: 0.3}},
			{slug: 'srp350-09', move: 'orbit', weight: 1},
			{slug: 'srp350-05', move: 'orbit', weight: 0.9},
			{slug: 'srp350-07', move: 'rear', weight: 0.9},
		],
		overlay: 'resonance',
	},
	srp400: {
		base: P('srp400'),
		roomLabel: 'Desktop production · the first serious nearfield',
		psych: [
			'Poor translation is a loop: export the mix, test it in the car, hear the mud, go back, guess again.',
			'The 4.5-inch CURV cone stays pistonic through complex passages — no cone break-up, no false warmth.',
			'When the midrange tells the truth at your desk, the car stops having opinions.',
		],
		fullSpecs: [
			{label: 'LF Driver', value: '4.5" CURV cone'},
			{label: 'HF Driver', value: '26mm Silk dome on waveguide'},
			{label: 'Amplification', value: 'LF 25W + HF 25W (Class AB)'},
			{label: 'Frequency Response', value: '75Hz ~ 22kHz (±2dB)'},
			{label: 'Max SPL @ 1m', value: '100 dB'},
			{label: 'THD @ Rated Power', value: '< 0.1%'},
			{label: 'Inputs', value: 'Bal XLR & linked TRS'},
			{label: 'Enclosure', value: 'Pressure die-cast aluminium (vented)'},
			{label: 'Control / EQ', value: 'Bass tilt, Treble tilt'},
			{label: 'Finish', value: 'Grey (Powder coated)'},
			{label: 'Dimensions (WxHxD)', value: '160 × 232 × 155 mm'},
			{label: 'Net Weight', value: '4.4 kg'},
		],
		shots: [
			{slug: 'srp400-03', move: 'crawl', weight: 1, focus: {x: 0.5, y: 0.58}},
			{slug: 'srp400-08', move: 'orbit', weight: 1},
			{slug: 'srp400-09', move: 'orbit', weight: 0.9},
			{slug: 'srp400-06', move: 'rear', weight: 0.9},
		],
		overlay: 'waveguide',
	},
	srp501: {
		base: P('srp501'),
		roomLabel: 'Dedicated project studios · treated rooms · critical mixing',
		psych: [
			'Between 100 and 300 hertz is where amateur mixes go to die — dense, undefined, guessed at.',
			'A rigid die-cast chassis loses no energy to resonance, so the 5.25-inch glass fibre cone keeps its microscopic transient detail.',
			'That detail is what lets you carve EQ in the mud instead of guessing around it.',
		],
		fullSpecs: [
			{label: 'LF Driver', value: '5.25" Glass Fibre cone'},
			{label: 'HF Driver', value: '26mm Silk dome (Neodymium) on waveguide'},
			{label: 'Amplification', value: 'LF 50W + HF 50W'},
			{label: 'Frequency Response', value: '58Hz ~ 21kHz (±3dB)'},
			{label: 'Max SPL @ 1m', value: '104 dB'},
			{label: 'THD @ Rated Power', value: '< 0.04%'},
			{label: 'Inputs', value: 'Bal XLR & TRS'},
			{label: 'Enclosure', value: 'Pressure die-cast aluminium, front port'},
			{label: 'Control / EQ', value: 'Low/High shelf, Bass roll-off'},
			{label: 'Finish', value: 'Grey (Powder coated)'},
			{label: 'Dimensions (WxHxD)', value: '210 × 279 × 181 mm'},
			{label: 'Net Weight', value: '6.8 kg'},
		],
		shots: [
			{slug: 'srp501-04', move: 'orbit', weight: 1},
			{slug: 'srp501-03', move: 'push', weight: 1, focus: {x: 0.5, y: 0.22}},
			{slug: 'srp501-07', move: 'orbit', weight: 0.9},
			{slug: 'srp501-06', move: 'rear', weight: 0.9},
		],
		overlay: 'freqRange',
	},
	srp601: {
		base: P('srp601'),
		roomLabel: 'Larger control rooms · tracking and mixing at scale',
		psych: [
			'A big room demands authority: the physical sensation of a kick drum moving air, without the vocal range smearing.',
			'80 watts on the low driver means uncompressed transient peaks never clip — the micro-dynamics of a live take survive.',
			'Full-spectrum truth down to 48 hertz, at 107 decibels, with the mids still phase-coherent.',
		],
		fullSpecs: [
			{label: 'LF Driver', value: '6.5" Glass Fibre cone'},
			{label: 'HF Driver', value: '26mm Silk dome (Neodymium) on waveguide'},
			{label: 'Amplification', value: 'LF 80W + HF 50W'},
			{label: 'Frequency Response', value: '48Hz ~ 21kHz (±3dB)'},
			{label: 'Max SPL @ 1m', value: '107 dB'},
			{label: 'THD @ Rated Power', value: '< 0.04%'},
			{label: 'Inputs', value: 'Bal XLR & linked TRS'},
			{label: 'Enclosure', value: 'Pressure die-cast aluminium'},
			{label: 'Control / EQ', value: 'Bass/Treble tilt, Bass roll-off'},
			{label: 'Finish', value: 'Grey (Powder coated)'},
			{label: 'Dimensions (WxHxD)', value: '250 × 340 × 240 mm'},
			{label: 'Net Weight', value: '11.9 kg'},
		],
		shots: [
			{slug: 'srp601-08', move: 'orbit', weight: 1},
			{slug: 'srp601-07', move: 'crawl', weight: 1, focus: {x: 0.5, y: 0.6}},
			{slug: 'srp601-04', move: 'orbit', weight: 0.9},
			{slug: 'srp601-05', move: 'rear', weight: 0.9},
		],
		overlay: 'headroom',
	},
	slf210: {
		base: P('slf210'),
		roomLabel: 'Any stereo pair above · true 2.1 bass management',
		psych: [
			'A professional subwoofer is not about more bass. It is about relieving your monitors of the frequencies that strain them.',
			'Cross over at 80 hertz and the monitors stop wrestling 40-hertz waveforms — intermodulation distortion collapses, and the midrange opens.',
			'Sweep the phase control until the low end arrives at your ears in perfect time. That is when the system disappears.',
		],
		fullSpecs: [
			{label: 'LF Driver', value: '10" High-excursion transducer'},
			{label: 'Amplification', value: '200W (Class D)'},
			{label: 'Frequency Response', value: '35Hz ~ Crossover (-6dB)'},
			{label: 'Max SPL @ 1m', value: '112 dB'},
			{label: 'THD @ Rated Power', value: '0.1%'},
			{label: 'Inputs', value: 'L, R, LFE (Bal XLR)'},
			{label: 'Enclosure', value: '18mm MDF'},
			{label: 'Crossover', value: '50–150Hz variable'},
			{label: 'Phase', value: '0° ~ 180° sweepable'},
			{label: 'Controls', value: 'Gain, Polarity, Footswitch bypass'},
			{label: 'Finish', value: 'Black painted'},
			{label: 'Dimensions (WxHxD)', value: '349 × 422 × 446 mm'},
			{label: 'Net Weight', value: '18.5 kg'},
		],
		shots: [
			{slug: 'slf210-08', move: 'tilt', weight: 1, focus: {x: 0.5, y: 0.55}},
			{slug: 'slf210-02', move: 'orbit', weight: 1},
			{slug: 'slf210-06', move: 'orbit', weight: 0.9},
			{slug: 'slf210-04', move: 'rear', weight: 1},
		],
		overlay: 'bassMgmt',
	},
};
