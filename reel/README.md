# Sonodyne Studio Series — portrait reel

Remotion project producing the 1080×1920 reel and the three language thumbnails
for Shivansh Electronics.

## Build

```bash
cd reel
npm install
npm run assets       # convert photography, key cutouts, fetch fonts (cached)
npm run studio       # preview in Remotion Studio
npm run render       # reel + 3 thumbnails → ../out/
npm run thumbnails   # thumbnails only
```

Outputs land in `../out/`:

| File | What |
|------|------|
| `sonodyne-studio-series-reel.mp4` | 1080×1920, 30fps, H.264 CRF 17 |
| `reel_thumbnail_EN.png` | English thumbnail |
| `reel_thumbnail_HI.png` | Hindi (Devanagari) thumbnail |
| `reel_thumbnail_BN.png` | Bengali thumbnail |
| `RENDER-LOG.txt` | Runtime, resolution, fps, file size |

## Asset pipeline

`npm run assets` runs three cached steps. None of them re-do work that is
already up to date, so repeated renders cost nothing.

1. **`fetch-fonts.mjs`** — downloads Archivo, Barlow Condensed, Noto Sans
   Devanagari and Noto Sans Bengali into `public/fonts`, so rendering never
   touches the network and every frame is reproducible.
2. **`prepare-assets.mjs`** — converts the repo's `.webp` photography to PNG and
   trims the transparent padding off both brand logos.
3. **`cutouts.mjs`** — keys the white seamless backdrop out of the genuine
   product photography.

### Why the cutouts exist

Every source photograph is **1200×800 landscape**, shot on white seamless. The
reel is 1080×1920 portrait. Dropping a landscape plate into a portrait frame
would either stretch the product or waste most of the screen, and a white
backdrop is the opposite of the deep charcoal void the brief asks for.

Keying the backdrop out solves both at once: the products become tall,
free-standing subjects that compose vertically in the charcoal void, at their
true proportions, with no stretching.

The key floods the backdrop inward from the frame border rather than applying a
global luminance threshold — rear-panel shots have large white spec labels and
the woofer cones have bright highlights, and a global threshold would punch holes
straight through them. A second flood from the crop boundary clears the backdrop
trapped between the feet and the cabinet base. Upscaling is capped at 2.2×.

## Structure

```
src/
  theme.ts                 zones, palette, type stack, easing curves
  Reel.tsx                 segment timeline + dynamic branding track
  Thumbnail.tsx            one composition, three languages
  data/
    products.ts            VERIFIED specs only — the single source of claims
    contacts.ts            Shivansh contact points, rotated across the runtime
  components/
    Frame.tsx              the three-zone architecture
    Branding.tsx           logo + contact behaviour
    ProductStage.tsx       the brief's camera moves
    Type.tsx               the information hierarchy
    Overlays.tsx           resonance / 2.1 bass management / phase dial
    transitions.tsx        dip to black, blade wipe, rack pull
    Music.tsx              optional music bed (see ../AUDIO.md)
  scenes/                  Hook, ProductSegment, SubwooferSegment, Cta
```

## Editing content

- **Specs, prices, headlines** — `src/data/products.ts`. Every number there is
  copied from the brief's verified master table. Do not add a figure that is not
  in it.
- **Contact rotation** — `src/data/contacts.ts` for the list,
  `BrandingTrack` in `src/Reel.tsx` for when and where each one appears.
- **Segment lengths** — the `SEG` map at the top of `src/Reel.tsx`.
- **Music** — see `../AUDIO.md`.

## Notes

- Rendering uses the Chromium already present at
  `/opt/pw-browsers/chromium_headless_shell-1194/`. On another machine, delete
  the `BROWSER` constant in `scripts/render.mjs` and Remotion will fetch its own.
- The composition is authored in 30fps frame units. Re-rating it to 60fps means
  re-timing those constants, not just changing `FPS` in `theme.ts`.
