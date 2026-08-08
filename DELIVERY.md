# Sonodyne Studio Series — reel delivery notes

Deliverables are in `out/`. The Remotion project that produces them is in
`reel/` (see `reel/README.md` to rebuild or edit).

| File | What |
|------|------|
| `out/sonodyne-studio-series-reel.mp4` | 1080×1920 portrait, 30fps, H.264 CRF 17 |
| `out/reel_thumbnail_EN.png` | English thumbnail, 1080×1920 |
| `out/reel_thumbnail_HI.png` | Hindi (Devanagari) thumbnail |
| `out/reel_thumbnail_BN.png` | Bengali thumbnail |
| `out/RENDER-LOG.txt` | Runtime, resolution, fps, file size |

## Structure

```
Hook 7.5s → SRP 350 G → SRP 400 G → SRP 501 G → SRP 601 G → SLF 210 V3 BL → CTA
```

Smallest to largest, exactly as the brief specifies, with the subwoofer closing
as the "complete the 2.1 ecosystem" climax. Each of the five products gets a full
dedicated sequence — the brief's 178-second / 25-seconds-per-monitor short-form
plan is deliberately **not** followed, per the client's override. Runtime is
whatever full treatment required.

Every frame obeys the three-zone architecture: dynamic branding band (Zone A),
content with 56px left/right safe padding (Zone B), dynamic branding band
(Zone C).

## Decisions you should know about

### 1. Products are cut out of their backgrounds

Every source photograph is 1200×800 **landscape** on white seamless. The reel is
portrait, and the brief calls for products floating in a deep charcoal void.
Rather than stretch a landscape plate or waste most of the screen, the white
backdrop is keyed out so each product becomes a tall free-standing subject at its
true proportions. Nothing is stretched; upscaling is capped at 2.2×.

### 2. The AI-rendered lifestyle shots are used only in the hook

Roughly half the supplied photography is AI-rendered studio-room imagery, and
several of those frames show a monitor that does **not** match the real Sonodyne
product — different cabinet, different cone. Attaching a model name and a
verified spec to one of those would misrepresent the product just as badly as a
wrong number would.

So: **every frame that names a product uses only genuine Sonodyne photography.**
The AI renders appear only in the opening hook, heavily blurred and darkened, in
a beat that is about the *problem* and makes no product claim. Also excluded:
one frame containing a prominently branded third-party microphone.

### 3. The logo keeps its white plate

Both supplied logos are dark artwork on the brand's own opaque white rounded
plate — the transparency is only outside the rounding. I kept that artwork
intact rather than keying the plate off and inverting the wordmark, because
recolouring a registered mark isn't a call I should make unilaterally.

What the client actually objected to is fixed: the logo is applied straight onto
the frame, never inside a box shared with other text, never shrunk to fit around
anything. It runs 480–860px wide (well above the 140–220px floor), moves between
zones and alignments across the runtime, and contact details are always separate
typography in the *opposite* band.

**If you have a white/knockout version of the Shivansh logo**, drop it in as
`reel/public/img/logo-shivansh-trim.png` and re-render — it will look better
against the charcoal, and nothing else needs to change.

### 4. No audio — see `AUDIO.md`

The one part of the brief I could not complete here. No licensed music library,
no generation API keys, and an allowlisting proxy that blocks audio CDNs.
Shipping synthesized filler would have hurt a premium brand more than silence.

The project is already wired for it: drop a track at
`reel/public/audio/music.mp3`, re-render, and the brief's dynamic arc is applied
automatically. `AUDIO.md` has the cue sheet and a ready-to-run generation command.

### 5. 30fps, not 60

The brief asks for 30fps minimum and prefers 60 "if the pipeline allows".
The pipeline does allow it, but the composition is authored in 30fps frame units
throughout, so re-rating means re-timing every constant rather than flipping one
value — a real change with real regression risk, for a marginal gain on
deliberately slow camera moves that most portrait platforms re-encode to 30fps
anyway. Say the word and I'll do the re-time properly.

### 6. Heritage line omitted

Skipped entirely, as instructed. At reel pace there was no beat where one clean
sentence would land without displacing product content or breaking the branding
rhythm. Long-form is the right home for it.

## Compliance

- All specs match the brief's VERIFIED master table exactly. No invented,
  rounded or UNVERIFIED figures.
- SRP 350 G = **3"** (never 3.5"). SRP 601 G = **Glass Fibre** (never Kevlar),
  named **SRP 601 G** (never SRP 600). Kevlar appears nowhere.
- Prices shown as MRP inclusive of all taxes, at low prominence. No price is
  framed as final, negotiated or fixed; the CTA directs viewers to DM or call
  for the best price.
- Zero competitor mentions. The words "distributor", "dealer" and "reseller"
  appear nowhere in on-screen text.
- Sonodyne branding is minimal: three placements total (one per product
  transition beat, one at the close). No catalogue framing beyond the five
  products shown.
