#!/usr/bin/env python3
"""
Sonodyne Studio Series -- long-form soundtrack synthesizer.

Reads src/data/longform-timeline.json -- the SAME file the Remotion composition
is built from -- and renders public/audio/longform.wav to the composition's
exact duration, so every transition sound lands on its cut by construction.
The composition embeds the file via <Audio>, so the rendered mp4 ships with
the soundtrack in it.

Musical architecture, per the brief's Section 10 arc:

  minimal  (intro, SRP 350, SRP 400)
      Subdued ambient bed: root-and-fifth drone in A, slow breathing, airy
      filtered noise, and a sparse, quiet pentatonic micro-arpeggio --
      "micro and intricate", matching the desktop scale of the small units.

  driving  (SRP 501, SRP 601)
      The bed widens: a soft mid-tempo pulse enters at 96 BPM (felt more than
      heard), stereo width opens, the arpeggio drops out in favour of a slow
      pad swell an octave up.

  sub      (SLF 210)
      The floor arrives: a 36-48Hz sub layer swells beneath everything, the
      pulse deepens, exactly the "music demonstrates the subwoofer" beat the
      brief asks for.

  settle   (outro)
      Everything strips back to the airy bed and a closing shimmer, leaving
      room for the CTA to read.

Transition language (matched to transitions.tsx, same mapping as the reel):
  dip        -> low thud + sub drop + hairline click, on the black frame
  bladeLeft  -> filtered whoosh panned right-to-left with an edge tick
  bladeRight -> the same, panned left-to-right
  rack       -> muffled-to-clear swell resolving onto a soft two-note chime

Everything is synthesized -- no samples, no external audio, nothing licensed.
"""

import json
import math
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
TL = json.loads((ROOT / "src" / "data" / "longform-timeline.json").read_text())

SR = 44100
FPS = TL["fps"]
XFADE = TL["xfade"]

segs = TL["segments"]
starts = {}
at = 0
for i, seg in enumerate(segs):
    starts[seg["id"]] = at
    at += seg["frames"] - (XFADE if i < len(segs) - 1 else 0)
TOTAL_FRAMES = at
DUR = TOTAL_FRAMES / FPS
N = round(DUR * SR)

print(f"timeline: {TOTAL_FRAMES} frames -> {DUR:.3f}s -> {N} samples")

rng = np.random.default_rng(17)
t = np.arange(N, dtype=np.float64) / SR

# ---------------------------------------------------------------------------
# Phase envelopes: one 0..1 curve per music phase, crossfaded over 5 seconds
# at segment boundaries, driven by the shared timeline's musicPhase map.
# ---------------------------------------------------------------------------
PHASES = ["minimal", "driving", "sub", "settle"]
phase_of = TL["musicPhase"]
XF_S = 5.0

def phase_env(name: str) -> np.ndarray:
    """Analytic ramp envelope: merge this phase's contiguous segments into
    runs, then linearly ramp XF_S/2 either side of each run boundary. Exact
    and O(N) - a convolution over 26M samples with a 441k kernel is not."""
    runs = []
    for seg in segs:
        if phase_of[seg["id"]] != name:
            continue
        s0 = starts[seg["id"]] / FPS
        s1 = (starts[seg["id"]] + seg["frames"]) / FPS
        if runs and s0 <= runs[-1][1] + XF_S:
            runs[-1][1] = s1
        else:
            runs.append([s0, s1])
    xp = [0.0]
    fp = [1.0 if runs and runs[0][0] <= 0.0 else 0.0]
    h = XF_S / 2
    for s0, s1 in runs:
        if s0 > 0.0:
            xp += [max(0.0, s0 - h), min(DUR, s0 + h)]
            fp += [0.0, 1.0]
        if s1 < DUR:
            xp += [max(0.0, s1 - h), min(DUR, s1 + h)]
            fp += [1.0, 0.0]
    xp.append(DUR)
    fp.append(1.0 if runs and runs[-1][1] >= DUR else 0.0)
    return np.interp(t, xp, fp)

env_minimal = phase_env("minimal")
env_driving = phase_env("driving")
env_sub = phase_env("sub")
env_settle = phase_env("settle")
print("phase envelopes done")

# ---------------------------------------------------------------------------
# Bed: drone + air, always on (its level rides the phase envelopes a little).
# ---------------------------------------------------------------------------
def sine(freq, phase=0.0):
    return np.sin(2 * np.pi * freq * t + phase)

breathe = 0.74 + 0.26 * np.sin(2 * np.pi * t / 19.0)
width_lfo = 0.5 + 0.5 * np.sin(2 * np.pi * t / 27.0)

drone_L = 0.050 * sine(55.00) + 0.026 * sine(82.30) + 0.009 * sine(164.81) * (0.6 + 0.4 * width_lfo)
drone_R = 0.050 * sine(55.06, 0.4) + 0.026 * sine(82.49, 0.9) + 0.009 * sine(164.81, 1.7) * (0.6 + 0.4 * (1 - width_lfo))
bed_gain = 0.9 + 0.25 * env_driving + 0.3 * env_sub - 0.25 * env_settle
L = drone_L * breathe * bed_gain
R = drone_R * breathe * bed_gain

# Air: filtered noise (one-pole lowpass on highpassed noise), very quiet.
noise = rng.standard_normal(N)
air = np.zeros(N)
lp = 0.0
# vectorized one-pole via lfilter-style recursion using cumulative trick is
# messy; a strided loop at control rate is fine: filter at 1/8 SR then expand.
dec = 8
nd = noise[::dec].copy()
lpv = np.zeros(nd.shape[0])
acc = 0.0
for i in range(nd.shape[0]):
    acc += 0.24 * (nd[i] - acc)
    lpv[i] = acc
air_small = np.repeat(lpv, dec)[:N]
L += 0.012 * air_small
R += 0.012 * np.roll(air_small, 353)

print("bed done")

# ---------------------------------------------------------------------------
# Micro-arpeggio (minimal phase): sparse pentatonic plucks, A minor pent,
# quiet and high, one note every ~1.6s with a gentle random gate.
# ---------------------------------------------------------------------------
PENT = [440.0, 523.25, 587.33, 659.25, 783.99]  # A C D E G
arp = np.zeros(N)
step_s = 1.6
n_steps = int(DUR / step_s)
for k in range(n_steps):
    if rng.random() < 0.35:
        continue  # sparse
    t0 = k * step_s + rng.uniform(-0.08, 0.08)
    a0 = int(t0 * SR)
    if a0 >= N:
        break
    f = PENT[int(rng.integers(0, len(PENT)))]
    dur_n = int(1.1 * SR)
    seg_t = np.arange(min(dur_n, N - a0)) / SR
    tone = np.sin(2 * np.pi * f * seg_t) * np.exp(-seg_t / 0.38) * 0.020
    tone += np.sin(2 * np.pi * f * 2 * seg_t) * np.exp(-seg_t / 0.2) * 0.006
    arp[a0:a0 + tone.shape[0]] += tone
L += arp * env_minimal
R += np.roll(arp, 210) * env_minimal
print("arpeggio done")

# ---------------------------------------------------------------------------
# Driving pulse (501/601): 96 BPM soft low pulse + off-beat pad swell.
# ---------------------------------------------------------------------------
pulse = np.zeros(N)
beat_s = 60.0 / 96.0
n_beats = int(DUR / beat_s)
for k in range(n_beats):
    a0 = int(k * beat_s * SR)
    if a0 >= N:
        break
    dur_n = int(0.42 * SR)
    seg_t = np.arange(min(dur_n, N - a0)) / SR
    # soft kick: pitch glides 96->52Hz, short body, no click
    f_gl = 96.0 * np.exp(-seg_t / 0.09) + 52.0
    ph = 2 * np.pi * np.cumsum(f_gl) / SR
    body = np.sin(ph) * np.exp(-seg_t / 0.16) * 0.11
    pulse[a0:a0 + body.shape[0]] += body
pad = 0.016 * np.sin(2 * np.pi * 220.0 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 7.3))
L += (pulse + pad) * env_driving
R += (np.roll(pulse, 90) + np.roll(pad, 500)) * env_driving
print("pulse done")

# ---------------------------------------------------------------------------
# Sub swell (SLF 210): 36.71Hz (D1) + 44Hz layers breathing beneath the bed,
# and the pulse deepens (reuse pulse, pitched perception via added sub layer).
# ---------------------------------------------------------------------------
sub_layer = (0.075 * np.sin(2 * np.pi * 36.71 * t) + 0.05 * np.sin(2 * np.pi * 44.0 * t)) * (
    0.7 + 0.3 * np.sin(2 * np.pi * t / 9.0)
)
L += (sub_layer + pulse * 0.7) * env_sub
R += (sub_layer + np.roll(pulse, 120) * 0.7) * env_sub
print("sub layer done")

# ---------------------------------------------------------------------------
# Transition events + section cues, from the shared timeline.
# ---------------------------------------------------------------------------
AUX = np.zeros(N)  # mono transient bus -> reverb send
AUX_L = np.zeros(N)
AUX_R = np.zeros(N)


def add(sig, at_sample, pan=0.5):
    a0 = max(0, at_sample)
    a1 = min(N, at_sample + sig.shape[0])
    if a1 <= a0:
        return
    piece = sig[: a1 - a0]
    AUX_L[a0:a1] += piece * math.sqrt(1 - pan)
    AUX_R[a0:a1] += piece * math.sqrt(pan)
    AUX[a0:a1] += piece


def dip_hit(center_s, big=False):
    dur = 1.3 if big else 0.7
    n = int(dur * SR)
    tt = np.arange(n) / SR
    thump = (0.30 if big else 0.17) * np.sin(2 * np.pi * 86.0 * tt) * np.exp(-tt / (0.6 if big else 0.28))
    sub = (0.16 * np.sin(2 * np.pi * 47.0 * tt) * np.exp(-tt / 0.9)) if big else 0.0
    click_n = int(0.012 * SR)
    click = np.zeros(n)
    click[:click_n] = 0.05 * (1 - np.arange(click_n) / click_n) * rng.standard_normal(click_n)
    add(thump + sub + click, int(center_s * SR))


def blade_whoosh(center_s, direction):
    dur = 1.0
    n = int(dur * SR)
    tt = np.arange(n) / SR
    pos = tt / dur
    env = np.sin(np.pi * pos) ** 1.5
    nz = rng.standard_normal(n)
    # sweepable one-pole lowpass, coefficient opens then closes
    coef = 0.03 + 0.36 * np.sin(np.pi * pos) ** 1.2
    out = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += coef[i] * (nz[i] - acc)
        out[i] = acc
    sig = 0.14 * env * out
    # edge tick at the landing
    tick_at = int(0.72 * n)
    tick_n = int(0.02 * SR)
    sig[tick_at:tick_at + tick_n] += 0.06 * np.exp(-np.arange(tick_n) / (0.006 * SR)) * rng.standard_normal(tick_n)
    a0 = int((center_s - dur * 0.5) * SR)
    a1 = min(N, a0 + n)
    if a1 <= a0:
        return
    piece = sig[: a1 - a0]
    # pan travels across the field to match the wipe direction
    pan = pos[: a1 - a0] if direction == "right" else (1 - pos[: a1 - a0])
    AUX_L[a0:a1] += piece * np.sqrt(1 - pan)
    AUX_R[a0:a1] += piece * np.sqrt(pan)
    AUX[a0:a1] += piece


def rack_resolve(center_s):
    dur = 1.35
    n = int(dur * SR)
    tt = np.arange(n) / SR
    pos = tt / dur
    env = np.sin(np.pi * pos) ** 1.3
    nz = rng.standard_normal(n)
    coef = 0.015 + 0.24 * pos
    out = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += coef[i] * (nz[i] - acc)
        out[i] = acc
    sig = 0.08 * env * out
    # settle chime at the resolve point (~55% in)
    ch_at = int(0.55 * n)
    ch_t = tt[: n - ch_at]
    chime = 0.02 * np.exp(-ch_t / 0.7) * (
        np.sin(2 * np.pi * 1174.66 * ch_t) + 0.55 * np.sin(2 * np.pi * 1760.0 * ch_t)
    )
    sig[ch_at:] += chime
    add(sig, int((center_s - dur * 0.55) * SR))


def soft_tick(center_s, gain=1.0):
    dur = 0.4
    n = int(dur * SR)
    tt = np.arange(n) / SR
    env = np.sin(np.pi * tt / dur) ** 3
    nz = rng.standard_normal(n)
    hp = np.diff(nz, prepend=0.0)
    add(0.013 * gain * env * hp, int(center_s * SR))


def shimmer(center_s):
    dur = 1.6
    n = int(dur * SR)
    tt = np.arange(n) / SR
    sig = 0.015 * np.exp(-tt / 1.0) * (
        np.sin(2 * np.pi * 880.0 * tt) + 0.5 * np.sin(2 * np.pi * 1318.51 * tt)
    )
    add(sig, int(center_s * SR))


# -- transition hits at the crossfade centers -------------------------------
types = TL["transitions"]
for i in range(1, len(segs)):
    seg_id = segs[i]["id"]
    s = starts[seg_id]
    center = (s - XFADE / 2) / FPS
    kind = types[i - 1]
    if kind == "dip":
        dip_hit(center, big=(seg_id == "slf210"))
    elif kind == "bladeLeft":
        blade_whoosh(center, "left")
    elif kind == "bladeRight":
        blade_whoosh(center, "right")
    else:
        rack_resolve(center)
    print(f"  transition {kind:>10} @ {center:8.3f}s -> {seg_id}")

# -- in-segment content cues ------------------------------------------------
cues = TL["cues"]
for f in cues["intro"]["beats"]:
    soft_tick((starts["intro"] + f) / FPS, gain=0.9)
soft_tick((starts["intro"] + cues["intro"]["lineup"]) / FPS, gain=1.2)

for pid in ["srp350", "srp400", "srp501", "srp601"]:
    base = starts[pid]
    for f in cues["product"]["psych"]:
        soft_tick((base + f) / FPS, gain=0.7)
    soft_tick((base + cues["product"]["overlay"]) / FPS, gain=1.0)
    soft_tick((base + cues["product"]["specSheet"]) / FPS, gain=1.0)

slf = starts["slf210"]
soft_tick((slf + cues["slf210"]["recapOut"]) / FPS, gain=1.3)
for f in cues["slf210"]["psych"]:
    soft_tick((slf + f) / FPS, gain=0.7)
soft_tick((slf + cues["slf210"]["bassMgmt"]) / FPS, gain=1.0)
soft_tick((slf + cues["slf210"]["phaseDial"]) / FPS, gain=1.0)
soft_tick((slf + cues["slf210"]["specSheet"]) / FPS, gain=1.0)

outro = starts["outro"]
soft_tick((outro + cues["outro"]["headline"]) / FPS, gain=1.0)
shimmer((outro + cues["outro"]["heritage"]) / FPS)
shimmer(DUR - 2.2)

print("events done")

# ---------------------------------------------------------------------------
# Reverb send on the transient bus: 4 parallel combs + allpass (Schroeder),
# vectorized per-comb with a strided recursion.
# ---------------------------------------------------------------------------
def comb(x, delay, g):
    y = np.zeros_like(x)
    # y[n] = x[n] + g*y[n-delay] -- process in blocks of `delay`
    n_blocks = (x.shape[0] + delay - 1) // delay
    prev = np.zeros(delay)
    for b in range(n_blocks):
        a0 = b * delay
        a1 = min(x.shape[0], a0 + delay)
        blk = x[a0:a1] + g * prev[: a1 - a0]
        y[a0:a1] = blk
        prev = blk if blk.shape[0] == delay else np.concatenate([blk, prev[blk.shape[0]:]])
    return y


wet = np.zeros(N)
for d, g in [(1557, 0.42), (1617, 0.41), (1491, 0.40), (1422, 0.39)]:
    wet += comb(AUX, d, g) * 0.25

# allpass
d, g = 225, 0.5
ap = np.zeros(N)
buf = np.zeros(d)
for b in range((N + d - 1) // d):
    a0, a1 = b * d, min(N, b * d + d)
    x_blk = wet[a0:a1]
    delayed = buf[: a1 - a0]
    y_blk = -g * x_blk + delayed
    buf_new = x_blk + g * y_blk
    ap[a0:a1] = y_blk
    buf = buf_new if buf_new.shape[0] == d else np.concatenate([buf_new, buf[buf_new.shape[0]:]])
print("reverb done")

WIDTH = int(0.009 * SR)
L += AUX_L + 0.5 * ap
R += AUX_R + 0.5 * np.roll(ap, WIDTH)

# ---------------------------------------------------------------------------
# Master: gentle fade in/out, normalize to -3 dBFS, write 16-bit stereo WAV.
# ---------------------------------------------------------------------------
fade_in = int(1.8 * SR)
fade_out = int(2.6 * SR)
L[:fade_in] *= np.linspace(0, 1, fade_in)
R[:fade_in] *= np.linspace(0, 1, fade_in)
L[-fade_out:] *= np.linspace(1, 0, fade_out)
R[-fade_out:] *= np.linspace(1, 0, fade_out)

peak = max(np.abs(L).max(), np.abs(R).max())
gain = 0.71 / peak
print(f"peak {peak:.4f} -> gain {gain:.4f}")

out = np.empty(N * 2, dtype=np.int16)
out[0::2] = np.clip(L * gain, -1, 1) * 32767
out[1::2] = np.clip(R * gain, -1, 1) * 32767

dest = ROOT / "public" / "audio" / "longform.wav"
dest.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(dest), "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(out.tobytes())

print(f"wrote {dest} ({dest.stat().st_size/1024/1024:.1f} MB, {DUR:.3f}s)")
