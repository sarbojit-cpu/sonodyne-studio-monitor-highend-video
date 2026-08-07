# Audio — not included in this render, and why

The reel currently renders **silent**. This is the one part of the brief I could
not complete in this build environment, and it is not a shortcut — it is a hard
block:

- **No licensed music library.** There is no music or SFX asset anywhere in the
  repository, and no rights-cleared library is reachable from here.
- **No generation credentials.** The toolkit's music path (`music_gen.py` via the
  ACE-Step / acemusic API, RunPod or Modal) and the ElevenLabs SFX path all
  require API keys. None are configured in this environment.
- **Restricted network.** Outbound traffic goes through an allowlisting proxy.
  Music and audio CDNs are not on it — the same proxy already refused the
  coollabs font CDN during this build.

Shipping a synthesized placeholder — sine pads and generated whooshes — would
have undercut a premium instrument brand more than silence does, so I left it
out rather than degrade the deliverable.

## The project is already wired for audio

Nothing needs rebuilding to add a soundtrack. Drop a single file in and re-render:

```bash
cp your-track.mp3 reel/public/audio/music.mp3
cd reel && npm run render
```

`scripts/prepare-assets.mjs` detects the file and `src/components/Music.tsx`
mixes it in automatically, with the brief's dynamic arc (section 10) already
applied as a level envelope:

| Time | Segment | Level | Intent |
|------|---------|-------|--------|
| 0:00–0:07 | Hook | 0.16 → 0.20 | Minimal, ambient, holding back |
| 0:07–0:21 | SRP 350 G | 0.20 → 0.22 | Micro, intricate, desktop scale |
| 0:21–0:35 | SRP 400 G | 0.22 → 0.30 | Still nearfield, beginning to open |
| 0:35–0:49 | SRP 501 G | 0.30 → 0.38 | Beat arrives, stereo width expands |
| 0:49–1:02 | SRP 601 G | 0.38 → 0.44 | Driving, confident, control-room scale |
| 1:02–1:23 | SLF 210 V3 BL | 0.44 → 0.50 | Sub-bass swell takes over the mix |
| 1:23–1:36 | CTA | 0.30 → 0.00 | Settles back so the closing text reads |

Edit the `ARC` array in `src/components/Music.tsx` to retime it.

## Choosing the track

The envelope is a level arc, **not** a substitute for a track that genuinely has
that dynamic range. The brief asks the music to *demonstrate* what adding a
bass-managed subwoofer does. Volume automation alone cannot fake that. Use
either:

- one track with real sectional dynamics (minimal intro → mid-tempo groove →
  sub-heavy final third), or
- layered stems that build, exported as one pre-mixed file.

If you have credentials, the toolkit can generate a suitable bed directly:

```bash
python tools/music_gen.py \
  --prompt "Minimal ambient electronic intro, precise synth arpeggios, opening \
into a driving confident mid-tempo analog drum groove, ending with a deep \
floor-shaking sub-bass swell. Monochromatic, premium, precision-engineered." \
  --duration 96 --bpm 110 --output reel/public/audio/music.mp3
```

## Transition SFX

Not included, for the same reason. If you add them, the natural sync points are
the six segment transitions and each branding-band entrance — the exact frames
are in `src/Reel.tsx` (`SEG`, `XFADE`, and the `from=` values in
`BrandingTrack`).
