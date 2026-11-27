"""Soundtrack for Ep. 8 "Follower City" -> sound.wav (48 kHz stereo): music and effects synthesised here, cut to the shot list,
with the narration (audio/narration_source.mp3) cleaned up and mixed on top.
Cue times are read from the film page itself (window.cues()), so picture and sound can never drift.
Usage: python3 sound.py"""
import os, json, wave, numpy as np
from scipy import signal
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000
exe = '/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=exe, args=['--allow-file-access-from-files', '--no-sandbox'])
    pg = b.new_page(); pg.goto('file://' + os.path.join(HERE, 'film.html')); pg.wait_for_timeout(500)
    CU = json.loads(pg.evaluate('JSON.stringify(cues())')); b.close()
BEAT = 60 / 112; END = CU['END']; CUTS = CU['cuts']; NAMES = CU['names']; WD = CU['words']
N = int((END + .05) * SR); rng = np.random.default_rng(5)
music = np.zeros((N, 2)); sfx = np.zeros((N, 2)); wet = np.zeros((N, 2))   # wet = reverb send

# ---------- building blocks ----------
tt = lambda d: np.arange(int(d * SR)) / SR
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def filt(x, kind, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, kind, fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def fade(x, a=.004, r=.01):
    n = len(x); e = np.ones(n); na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return x * e
def put(bus, x, t, gain=1., pan=0., send=0.):
    i = int(round(t * SR))
    if i >= N or i + len(x) <= 0: return
    if i < 0: x = x[-i:]; i = 0
    x = x[:N - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    st = np.stack([x * l, x * r], 1) * gain * 1.41
    bus[i:i + len(x)] += st
    if send: wet[i:i + len(x)] += st * send
def sweep(f0, f1, d, curve=1.):
    t = tt(d); f = f0 + (f1 - f0) * (t / d) ** curve; return np.sin(2 * np.pi * np.cumsum(f) / SR)
xpan = lambda x: float(np.clip((x - 540) / 540, -1, 1)) * .6

# ---------- drums / instruments ----------
def kick(v=1.):
    t = tt(.34); f = 46 + 95 * np.exp(-t * 34); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9.5)
    return fade((x + .25 * filt(noise(.34), 'high', 3000) * np.exp(-t * 320)) * v, .001, .04)
def clap(v=1.):
    t = tt(.2); e = sum(np.exp(-np.maximum(t - d, 0) * 85) * (t >= d) for d in (0, .011, .023)) * .5 + np.exp(-t * 26) * .5
    return fade(filt(filt(noise(.2), 'high', 900), 'low', 5200) * e * v * .6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 60) * .15 * v, .001, .03)
def rim(v=1.):
    t = tt(.06); return fade((np.sin(2 * np.pi * 1650 * t) * .5 + np.sin(2 * np.pi * 830 * t) * .4) * np.exp(-t * 110) * v + filt(noise(.06), 'high', 4000) * np.exp(-t * 300) * .2 * v, .0005, .01)
def hat(v=1., d=.045):
    t = tt(d + .02); return fade(filt(noise(d + .02), 'high', 7200, 4) * np.exp(-t / d * 3.2) * v * .5, .0005, .01)
def shaker(v=1.):
    t = tt(.09); return fade(filt(filt(noise(.09), 'high', 4500), 'low', 9500) * np.sin(np.pi * np.minimum(t / .09, 1)) ** 2 * v * .32, .002, .01)
def bass(m, d, v=1.):
    t = tt(d + .08); f = mf(m); x = np.sin(2 * np.pi * f * t) + .35 * np.tanh(3 * np.sin(2 * np.pi * f * t)) + .12 * np.sin(4 * np.pi * f * t)
    e = np.minimum(t / .008, 1) * np.exp(-t * 1.6) * (1 - np.clip((t - d) / .08, 0, 1))
    return filt(x * e, 'low', 420) * v * .55
def rhodes(m, d, v=1.):
    t = tt(d + .5); f = mf(m)
    x = np.sin(2 * np.pi * f * t + 1.5 * np.exp(-t * 5) * np.sin(2 * np.pi * f * t)) + .16 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 13) + .3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 4)
    e = np.minimum(t / .006, 1) * np.exp(-t * 2.0) * (1 - np.clip((t - d) / .5, 0, 1)) * (1 + .12 * np.sin(2 * np.pi * 4.6 * t))
    return filt(x * e, 'low', 3200) * v * .2
def pad(ms, d, v=1., att=.6, rel=1.2, cut=1100):
    t = tt(d + rel); x = np.zeros(len(t))
    for m in ms:
        for det in (-.07, 0, .08):
            f = mf(m + det); x += signal.sawtooth(2 * np.pi * f * t + rng.uniform(0, 6)) * .33
    e = np.clip(t / att, 0, 1) ** 1.5 * (1 - np.clip((t - d) / rel, 0, 1)) ** 1.6
    return filt(x, 'low', cut, 3) * e * v * .055 / max(1, len(ms) / 4)
def bell(f, d=1.2, v=1.):
    t = tt(d); x = np.sin(2 * np.pi * f * t) * np.exp(-t * 5 / d * 1.4) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 11 / d * 1.4) + .2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 20 / d * 1.4)
    return fade(x * v * .3, .002, .05)
def pluck(m, v=1.):
    t = tt(.5); f = mf(m); x = (np.sin(2 * np.pi * f * t) + .5 * np.sin(4 * np.pi * f * t) * np.exp(-t * 9)) * np.exp(-t * 7.5)
    return fade(x * v * .2, .003, .05)

F9 = [53, 57, 60, 64, 67]; CE = [52, 55, 60, 62, 67]; DM9 = [50, 53, 57, 60, 64]; BB7 = [46, 58, 62, 65, 69]; CADD = [48, 55, 60, 64, 67]
def groove(t0, t1, bars, full=False, vol=1.):
    """bars: list of (chord, bass midi), one per 4 beats, looping; 16th-step sequencer between t0 and t1."""
    st = BEAT / 4; n = 0
    while True:
        t = t0 + n * st
        if t >= t1 - .01: break
        s = n % 16; ch, bm = bars[(n // 16) % len(bars)]; sw = .014 if s % 2 else 0   # light swing on off 16ths
        if s in ((0, 7, 10) if full else (0, 10)): put(music, kick(1 if s == 0 else .8), t, .95 * vol)
        if s in (4, 12): put(music, clap(1) if full else rim(1), t, (.6 if full else .5) * vol, .08, .12)
        if full:
            put(music, hat(.9 if s % 4 == 2 else .5 if s % 2 == 0 else .28), t + sw, .5 * vol, .25)
            if s == 14: put(music, hat(.8, .16), t, .4 * vol, .25)
            if s % 4 == 3: put(music, shaker(.8), t + sw, .5 * vol, -.3)
        elif s % 2 == 0: put(music, hat(.75 if s % 4 == 2 else .4), t, .42 * vol, .25)
        if s in (0, 6, 11): put(music, bass(bm if s != 11 else bm + (12 if full else 0), st * (5 if s == 0 else 3), 1 if s == 0 else .75), t, .95 * vol)
        if s == 0:
            for i, m in enumerate(ch): put(music, rhodes(m, BEAT * 2.2, .95), t + i * .012, vol, (i - 2) * .16, .2)
        if s == 10:
            for i, m in enumerate(ch[1:]): put(music, rhodes(m, BEAT * .8, .6), t + i * .008, vol, (i - 1.5) * .2, .2)
        if full and s in (2, 5, 8, 13):
            mel = {2: ch[-1] + 12, 5: ch[-2] + 12, 8: ch[-1] + 12, 13: ch[2] + 12}[s]; put(music, pluck(mel, .8), t, .6 * vol, .3 if s % 2 else -.3, .35)
        n += 1


# ---------- SFX helpers (Ep. 5) ----------

def buzz(d=.26, f=158):
    t = tt(d); x = np.tanh(4 * np.sin(2 * np.pi * f * t)) * (.5 + .5 * signal.square(2 * np.pi * 29 * t))
    return fade(filt(x, 'band', [90, 900]) * .5 + filt(noise(d), 'high', 2500) * .03, .01, .04)
def ping(f, v=1.):
    return np.concatenate([bell(f, .22, v), np.zeros(1)])
def pop(f0, f1, d=.12, v=1.):
    t = tt(d); return fade(sweep(f0, f1, d, .5) * np.exp(-t * 26) * v * .5, .002, .02)
def whoosh(d, f0, f1, f2, v=1.):
    n = noise(d); t = tt(d); out = np.zeros(len(t)); seg = 12
    for i in range(seg):                                   # crude time-varying band-pass
        a, b_ = int(i * len(t) / seg), int((i + 1) * len(t) / seg); k = (i + .5) / seg
        fc = f0 + (f1 - f0) * k * 2 if k < .5 else f1 + (f2 - f1) * (k - .5) * 2
        w = np.zeros(len(t)); w[a:b_] = 1; w = np.convolve(w, np.hanning(int(len(t) / seg) | 1) / (len(t) / seg / 2), 'same')
        out += filt(n, 'band', [fc * .6, fc * 1.6]) * np.clip(w, 0, 1)
    return out * np.sin(np.pi * t / d) ** 2 * v * .35
def thud(f0=95, f1=44, d=.3, v=1., body=.5):
    t = tt(d); return fade((sweep(f0, f1, d, .5) * np.exp(-t * 11) + filt(noise(d), 'low', 500) * np.exp(-t * 40) * body) * v, .001, .05)
def breath(d, lo, hi, v=1.):
    t = tt(d); return filt(noise(d), 'band', [lo, hi]) * (np.minimum(t / (.3 * d), 1) ** 1.5) * np.exp(-np.maximum(t - .3 * d, 0) * 5.5) * v * .22
def step(v=1., f=105): return thud(f, f * .6, .09, v * .5, .9)
def tick(f=2100, v=1.):
    t = tt(.05); return fade((np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 120) * v * .3, .0005, .01)


# ---------- night / horror sounds ----------
def payal(v=1., n=9):
    out = np.zeros(int(.5 * SR))
    for k in range(n):
        f = rng.uniform(3200, 7600); d0 = rng.uniform(0, .07); x = bell(f, rng.uniform(.18, .34), rng.uniform(.4, 1.))
        i = int(d0 * SR); out[i:i + len(x)] += x[:len(out) - i]
    return out * v * .8
def creak(d=.7, f0=300, v=1.):
    t = tt(d); f = f0 + 170 * np.sin(np.pi * t / d * .9) + 26 * np.sin(2 * np.pi * 6.5 * t)
    cr = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (.5 + .5 * np.sin(2 * np.pi * np.cumsum(34 + 16 * np.sin(2 * np.pi * 3 * t)) / SR)) ** 2
    return fade((filt(cr, 'band', [600, 1100]) + .6 * filt(cr, 'band', [1700, 2600])) * np.sin(np.pi * t / d) ** .8 * .09 * v, .03, .1)
def howl(d=2.4, f=560, v=1.):
    t = tt(d); fr = f * (.78 + .26 * np.sin(np.pi * np.minimum(t / (d * .45), 1) / 2) - .14 * np.clip((t - d * .6) / (d * .4), 0, 1)) * (1 + .012 * np.sin(2 * np.pi * 5.2 * t))
    ph = 2 * np.pi * np.cumsum(fr) / SR; x = np.sin(ph) + .35 * np.sin(2 * ph) + .12 * np.sin(3 * ph)
    e = np.minimum(t / .35, 1) * (1 - np.clip((t - d * .7) / (d * .3), 0, 1)) ** 1.5
    return filt(x * e, 'band', [300, 2600]) * v * .12
def cricket_bed(t0, t1, v=1.):
    for j in range(int((t1 - t0) * 3.2)):
        st = t0 + rng.uniform(0, t1 - t0); f = rng.choice([4300, 4650, 5100]); pan = rng.uniform(-.8, .8)
        for k in range(3):
            tc = tt(.045); x = np.sin(2 * np.pi * f * tc) * np.sin(np.pi * tc / .045) ** 2 * (.5 + .5 * np.sin(2 * np.pi * 280 * tc))
            if st + k * .065 < t1: put(sfx, x * .05 * v, st + k * .065, 1, pan, .2)
def wind(d, v=1.):
    t = tt(d); x = filt(noise(d), 'low', 420) * (.55 + .45 * np.sin(2 * np.pi * .13 * t + 1) * np.sin(2 * np.pi * .31 * t))
    return x * v * .1
def drone(d, f=55, v=1., att=2.):
    t = tt(d); x = np.zeros(len(t))
    for ff in (f, f * 1.06, f * 1.5, f * 2.02): x += signal.sawtooth(2 * np.pi * ff * t + rng.uniform(0, 6)) * .25
    x = filt(x, 'low', 260, 3) + .5 * np.sin(2 * np.pi * f / 2 * t)
    return x * np.clip(t / att, 0, 1) ** 2 * v * .12
def heart(v=1.):
    return np.concatenate([thud(62, 38, .16, v, .2), np.zeros(int(.12 * SR)), thud(54, 34, .16, v * .7, .2)])
def screech(d, v=1.):
    t = tt(d); x = np.zeros(len(t))
    for ff in (1830, 1902, 1991, 2120): x += signal.sawtooth(2 * np.pi * ff * (1 + .02 * t / d) * t + rng.uniform(0, 6))
    x = filt(x, 'band', [1200, 5200]) * (.6 + .4 * np.sin(2 * np.pi * 9 * t)) * (t / d) ** 2.2
    return x * v * .035
def lamp_hum(d, v=1.):
    t = tt(d); return (np.tanh(3 * np.sin(2 * np.pi * 100 * t)) * .5 + .2 * np.sin(2 * np.pi * 300 * t)) * v * .012

# ---------- helpers for this episode ----------
import subprocess
def W(txt, n=0):
    c = 0
    for w in WD:
        if w[0].lower().rstrip('.,?!"') == txt.lower():
            if c == n: return w[1]
            c += 1
    raise KeyError(txt)
SH = dict(zip(NAMES, CUTS))
def sweep_noise(d, f0, f1, v=1.):
    t = tt(d); out = np.zeros(len(t)); n = noise(d); seg = 16
    for i in range(seg):
        a, b_ = int(i * len(t) / seg), int((i + 1) * len(t) / seg); fc = f0 * (f1 / f0) ** ((i + .5) / seg)
        out[a:b_] = filt(n, 'band', [fc * .7, fc * 1.4])[a:b_]
    return fade(out * v, .01, .03)
def ding(v=1.): return bell(mf(88), .9, v) + np.pad(bell(mf(95), .9, v * .8), (int(.08 * SR), 0))[:int(.9 * SR)]
def poof(v=1.):
    t = tt(.35); return fade(filt(noise(.35), 'band', [300, 3000]) * np.exp(-t * 10) * v * .4, .003, .05)
def rain(d, v=1.):
    t = tt(d); return filt(noise(d), 'band', [1500, 9000]) * (.8 + .2 * np.sin(2 * np.pi * .3 * t)) * v * .05
def tick_roll(t0, t1, n, f0=1600, f1=2600, v=.5):
    for k in range(n):
        q = k / max(1, n - 1); put(sfx, tick(f0 + (f1 - f0) * q, v), t0 + (t1 - t0) * q ** .7, .45, (q - .5) * .6)
def drop_roll(t0, t1, n):
    for k in range(n):
        q = k / max(1, n - 1); put(sfx, tick(2600 - 2000 * q, .55), t0 + (t1 - t0) * (1 - (1 - q) ** 2), .5, 0)

# ---------- music ----------
F9 = [53, 57, 60, 64, 67]; DM9 = [50, 53, 57, 60, 64]; BB7 = [46, 58, 62, 65, 69]; CE = [52, 55, 60, 62, 67]; GM = [43, 55, 58, 62, 65]
# A: cold open (rain, dark pad, low pulse)
put(sfx, rain(SH['shRewind'] + .2, 1.), 0, 1., 0)
put(music, pad([38, 45, 50, 53], SH['shRewind'] - .1, 1.1, att=1.2, rel=.4, cut=700), 0, 1, 0, .3)
for k in range(int(SH['shRewind'] / BEAT)): put(music, kick(.55), k * BEAT, .6)
put(sfx, thud(70, 34, .9, 1.2, .3), W('everything'), .9, 0, .3)                          # "lost everything"
put(sfx, tick(1200, .5), W('cat') + .05, .4, .4)
# rewind into day
d = SH['shDayCity'] - SH['shRewind']; t_ = tt(d)
put(sfx, fade(filt(noise(d), 'band', [600, 5000]) * (.4 + .6 * t_ / d) * .25 * (.6 + .4 * signal.square(2 * np.pi * (14 + 40 * t_ / d) * t_)), .01, .02), SH['shRewind'], 1., 0, .1)
put(sfx, fade(np.sin(2 * np.pi * np.cumsum(200 + 900 * (t_ / d) ** 2) / SR) * .12, .01, .02), SH['shRewind'], 1., 0)
# B: the funky city groove
gB0, gB1 = SH['shDayCity'], SH['shBots']
groove(gB0, gB1, [(F9, 41), (DM9, 38), (BB7, 34), (CE, 36)], full=True)
put(music, pad(F9, gB1 - gB0, .7, att=.3, rel=.5, cut=1400), gB0, 1, 0, .25)
# tension under the bots list
put(music, pad([45, 52, 56], SH['shNightfall'] - gB1 + .2, 1.1, att=.6, rel=.3, cut=900), gB1, 1, 0, .3)
for k in range(int((SH['shNightfall'] - gB1) / (BEAT / 2))): put(music, hat(.5), gB1 + k * BEAT / 2, .35, .2)
put(sfx, screech(SH['shNightfall'] - W('nobody'), .5), W('nobody'), .7, 0, .3)
# C: night, countdown, blackout, the drop
c0 = SH['shNightfall']
put(music, drone(SH['shDrop'] - c0 + 1.5, 55, 1., att=2.), c0, 1., 0, .2)
k = 0
while c0 + k * .5 < SH['shBlackout'] + .3:
    put(sfx, tick(2200 if k % 2 else 1800, .45), c0 + k * .5, .5, -.4); k += 1
put(sfx, ding(.9), W('update') - .05, .6, .2, .4)
put(sfx, tick(900, 1.), W('delete'), .9, 0, .2); put(sfx, thud(160, 90, .1, .7, .6), W('delete'), .7)
bo = W('midnight') + .25; d = W('dark') + .3 - bo; t_ = tt(d)
put(sfx, fade(np.sin(2 * np.pi * np.cumsum(120 * (1 - .8 * t_ / d)) / SR) * (1 - t_ / d) * .3 + filt(noise(d), 'low', 600) * (1 - t_ / d) * .15, .01, .05), bo, 1., 0, .3)   # power down
for j in range(6): put(sfx, thud(90, 50, .12, .6, .8), bo + j * (d / 6), .6, -.6 + j * .24, .3)
hb = SH['shDrop']; bpm = 80
while hb < W('dropped') - .1:
    put(sfx, heart(1.), hb, .8); bpm = min(140, bpm * 1.08); hb += 60 / bpm
drop_roll(W('dropped'), W('dropped') + .75, 26)
put(sfx, thud(60, 28, 1.0, 1.4, .3), W('dropped') + .8, 1., 0, .4)
for t0, f in ((W('took'), 41), (W('disappeared') - .1, 39), (W('unfollowed'), 36)):   # three sad bass hits
    put(music, bass(f, .5, 1.1), t0, 1.); put(music, rhodes(f + 24, .6, .8), t0, .7, 0, .3)
for k in range(4): put(sfx, tick(1000, .7), SH['shTow'] + .15 + k * .32, .45, -.3)   # tow truck beeps
for i in range(4): put(sfx, poof(.9), W('disappeared') - .35 + i * .18 + .25, .7, -.5 + i * .33, .2)
put(sfx, tick(1400, .9), W('unfollowed') + .1, .8, 0, .2)
# D: sunrise, the comeback groove
d0 = SH['shSunrise']
put(music, pad(F9 + [72], SH['shOneOpen'] - d0 + 1.2, 1.2, att=1.5, rel=1., cut=1300), d0, 1, 0, .35)
gD0 = W('one', 1); gD1 = SH['shAsk']
put(music, kick(1.1), gD0, 1.); put(music, clap(.9), gD0, .5, 0, .3)
groove(gD0, gD1, [(F9, 41), (CE, 40), (DM9, 38), (BB7, 34)], full=True)
put(music, pad(F9, gD1 - gD0, .7, att=.3, rel=.6, cut=1400), gD0, 1, 0, .25)
put(music, pad([46, 53, 57, 62], SH['shEnd'] - gD1 + .2, 1., att=.4, rel=.2, cut=1100), gD1, 1, 0, .3)
# end card
e0 = SH['shEnd']
put(music, kick(.9), e0, .9); put(music, bass(41, BEAT * 3, 1), e0, 1.)
for i, m in enumerate([53, 60, 69, 76, 79]): put(music, rhodes(m, 2.4, 1.), e0 + .25 + i * .09, 1., (i - 2) * .2, .4)
put(music, pad(F9 + [72], END - e0 - .4, 1.1, att=.2, rel=1., cut=1500), e0, 1, 0, .35)
put(sfx, tick(3000, .5), e0 + 1.6, .4, 0, .3); put(sfx, bell(mf(100), 1.2, .28), e0 + 1.64, .4, 0, .8)

# ---------- effects on cuts and moments ----------
for i, (c, nm) in enumerate(zip(CUTS[1:], NAMES[1:])):
    if nm in ('shRewind', 'shEnd'): continue
    put(sfx, whoosh(.32, 500, 2200 + 300 * (i % 3), 900, .8), c - .14, .5, (i % 2 - .5) * .5, .15)
put(sfx, pop(500, 900, .12), W('followers') + .05, .7, 0, .25); put(sfx, bell(mf(91), .8, .5), W('followers') + .1, .5, 0, .5)
put(sfx, tick(1800, .8), W('50') + .1, .6, .3); put(sfx, ding(.7), W('50') + .15, .5, .3, .3)
put(sfx, pop(420, 640, .12), W('200,000') + .02, .8, 0, .2)
put(sfx, whoosh(.7, 300, 1500, 400, 1.), W('green') - .3, .8, -.3, .1); put(sfx, tick(2600, .6), W('green'), .6, -.6)
tick_roll(W('10') + .02, W('10') + .9, 18)
put(sfx, pop(500, 820, .12), W('rocky') + .02, .6, 0, .25); put(sfx, pop(560, 880, .12), W('tara') + .02, .6, 0, .25)
for i in range(4): put(sfx, tick(1500 + 200 * i, .5), SH['shQueue'] + .3 + i * .35, .4, .3)
put(sfx, tick(2000, .6), W('except') + .05, .5, -.4)
d = SH['shTaraDeadpan'] - SH['shLaugh']; put(sfx, fade(filt(noise(d), 'band', [400, 2400]) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 7 * tt(d)))) * .16, .05, .2), SH['shLaugh'], 1., 0, .4)   # crowd laughter bed
put(sfx, tick(1100, .5), W('11:59') - .02, .6, 0, .3)
put(sfx, ding(.7), W('one', 1) + .1, .5, 0, .4)
put(sfx, bell(mf(96), .7, .5), W('sunglasses') + .1, .6, .3, .5)
put(sfx, pop(700, 1000, .1, .8), SH['shMonkQuiet'] + .25, .6, .2, .3)
tick_roll(W('40,000') + .02, W('40,000') + .7, 12, 1400, 2400, .45)
for i in range(20): put(sfx, tick(1800 + (i % 5) * 140, .5), W('every', 4) + i * .055, .3, (i % 4 - 1.5) * .3)
put(sfx, pop(520, 900, .14), W('real') + .02, .7, 0, .3)
put(sfx, tick(1300, .6), SH['shAdShoot'] + .2, .45, -.3); put(sfx, pop(380, 520, .16, .9), W('background') + .05, .7, .3, .3)

# ---------- narration: clean up (high-pass, presence, gentle compression), then duck everything under it ----------
raw = os.path.join(HERE, 'audio', 'narration_source.mp3'); tmpw = os.path.join(HERE, 'audio', 'narration_48k.wav')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-ac', '1', '-ar', str(SR), '-af', 'highpass=f=80,equalizer=f=3200:t=q:w=1:g=3,equalizer=f=220:t=q:w=1:g=-2,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=4,alimiter=limit=0.9', tmpw], check=True)
with wave.open(tmpw) as w: vo = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float64) / 32768
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]; vo = vo / max(1e-9, np.sqrt((vo[vo != 0] ** 2).mean())) * .1
env = np.convolve((np.abs(vo) > .006).astype(float), np.ones(int(.3 * SR)) / int(.3 * SR), 'same'); env = np.clip(env * 3, 0, 1)
music *= (1 - .55 * env)[:, None]; sfx *= (1 - .3 * env)[:, None]
wet[:, 0] += vo * .06; wet[:, 1] += vo * .06
music += np.stack([vo, vo], 1) * 1.9 / .82

# ---------- reverb + master ----------
ir_t = tt(1.5); ir = np.stack([filt(rng.standard_normal(len(ir_t)), 'low', 5200) * np.exp(-ir_t / .32) for _ in range(2)], 1); ir[:int(.012 * SR)] = 0
rev = np.stack([signal.fftconvolve(wet[:, c], ir[:, c])[:N] for c in range(2)], 1) * .028
mix = music * .82 + sfx * .95 + rev
mix += np.stack([filt(rng.standard_normal(N), 'band', [120, 1800]) for _ in range(2)], 1) * .0012     # faint room tone so silences feel alive
mix = np.stack([filt(mix[:, c], 'high', 28) for c in range(2)], 1)
env = np.ones(N); nf = int(.9 * SR); env[-nf:] = np.linspace(1, 0, nf) ** 1.5; env[:int(.01 * SR)] = np.linspace(0, 1, int(.01 * SR)); mix *= env[:, None]
mix = np.tanh(mix * 1.5 / max(1e-9, np.percentile(np.abs(mix), 99.9))) * .89
print('peak %.3f  rms %.3f' % (np.abs(mix).max(), np.sqrt((mix ** 2).mean())))
with wave.open(os.path.join(HERE, 'sound.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote sound.wav', round(N / SR, 2), 's')
