#!/usr/bin/env python3
"""Slower, more romantic original waltz for the invitation."""
import math
import struct
import wave
from pathlib import Path

SR = 44100
BPM = 54
BEAT = 60 / BPM


def midi(n):
    return 440.0 * (2 ** ((n - 69) / 12))


def piano(t, f, vel, decay=1.7):
    if t < 0:
        return 0.0
    s = 0.0
    for i, amp in enumerate((1.0, 0.5, 0.28, 0.14, 0.08, 0.04, 0.02)):
        s += amp * math.sin(2 * math.pi * f * (i + 1) * t * (1 + i * 0.0012))
    env = math.exp(-t * decay) * (1 - math.exp(-min(t, 0.25) * 40))
    return s * env * vel


def pad(t, f, vel):
    s = math.sin(2 * math.pi * f * t)
    s += 0.4 * math.sin(2 * math.pi * f * 1.008 * t)
    s += 0.25 * math.sin(2 * math.pi * f * 0.5 * t)
    return s * vel * (0.6 + 0.4 * math.sin(2 * math.pi * t / 10))


# Long romantic phrases in D major.
MELODY = [
    (74, 2, 0.34), (78, 2, 0.32), (81, 4, 0.38),
    (83, 2, 0.34), (81, 2, 0.3), (78, 4, 0.32),
    (79, 2, 0.3), (81, 2, 0.32), (83, 4, 0.36),
    (81, 2, 0.3), (78, 2, 0.28), (74, 4, 0.32),
    (76, 2, 0.3), (78, 2, 0.32), (81, 4, 0.36),
    (85, 2, 0.34), (83, 2, 0.3), (81, 4, 0.3),
    (78, 4, 0.28), (76, 4, 0.26),
    (74, 8, 0.32),
]
HIGH = [
    (86, 4, 0.16), (88, 4, 0.15),
    (90, 4, 0.16), (88, 4, 0.14),
    (86, 4, 0.14), (85, 4, 0.13),
    (83, 4, 0.13), (81, 4, 0.12),
    (86, 4, 0.15), (88, 4, 0.14),
    (90, 4, 0.15), (86, 4, 0.13),
    (85, 4, 0.12), (83, 4, 0.12),
    (81, 8, 0.12),
]
BASS = [
    (50, 8, 0.2), (45, 8, 0.18),
    (47, 8, 0.18), (50, 8, 0.2),
    (53, 8, 0.18), (50, 8, 0.18),
    (47, 8, 0.16), (50, 8, 0.2),
]


def schedule(part):
    t = 0.0
    out = []
    for n, beats, vel in part:
        out.append((t, midi(n), vel))
        t += beats * BEAT
    return out, t


mel, mel_len = schedule(MELODY)
high, high_len = schedule(HIGH)
bass, bass_len = schedule(BASS)
loop = max(mel_len, high_len, bass_len)
loops = 2
duration = loop * loops
n_samples = int(duration * SR) + int(1.5 * SR)
samples = [0.0] * n_samples

events = []
for k in range(loops):
    off = k * loop
    for start, f, vel in mel:
        events.append(("m", start + off, f, vel, 1.55))
    for start, f, vel in high:
        events.append(("h", start + off, f, vel, 2.1))
    for start, f, vel in bass:
        events.append(("b", start + off, f, vel, 1.35))

for kind, start, f, vel, decay in events:
    i0 = int(start * SR)
    span = int(3.6 * SR)
    for i in range(span):
        idx = i0 + i
        if idx >= n_samples:
            break
        samples[idx] += piano(i / SR, f, vel, decay)

for i in range(n_samples):
    t = i / SR
    samples[i] += pad(t, midi(50), 0.055)
    samples[i] += pad(t, midi(57), 0.035)
    samples[i] += pad(t, midi(62), 0.02)

# Longer romantic hall reverb
for delay_s, mix in ((0.22, 0.28), (0.44, 0.16), (0.7, 0.1)):
    delay = int(delay_s * SR)
    wet = samples[:]
    for i in range(delay, n_samples):
        samples[i] += mix * wet[i - delay]

peak = max(abs(x) for x in samples) or 1.0
gain = 0.84 / peak
out_path = Path(__file__).resolve().parents[1] / "assets" / "music.wav"
with wave.open(str(out_path), "w") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(b"".join(
        struct.pack("<h", max(-32767, min(32767, int(x * gain * 32767))))
        for x in samples
    ))
print(out_path, "seconds", round(duration, 1))
