"""Synthesises the synced soundtrack for Ep. 6 "Raat ke 3 baje." -> sound.wav (48 kHz stereo).
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
T = CU['T']; BEAT = CU['BEAT']; G0 = CU['G0']; END = CU['END']; g = lambda n: G0 + n * BEAT
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

# ---------- SCORE ----------
fz = T['freeze']
put(sfx, wind(fz + .2), 0, 1, -.2)
put(sfx, wind(fz + .2), .05, 1, .3)
cricket_bed(0, T['crickets'], 1.)
put(sfx, lamp_hum(fz), 0, 1, -.5)
put(sfx, howl(2.6, 540, 1.), .35, .9, -.7, .9)                            # far dog howl
for s in CU['stepsA'] + CU['stepsB']: put(sfx, step(.55, 115) + 0, s, .6, -.2)
put(sfx, payal(1.), T['ch1'], .9, .55, .5); put(sfx, payal(.8), T['ch1'] + .36, .8, .55, .5)
put(sfx, payal(1.1), T['ch2'], 1., .5, .5); put(sfx, payal(.9), T['ch2'] + .3, .9, .5, .5)
put(sfx, tick(1400, .3), T['winOff'], .4, -.1, .6)                         # the last window goes dark
put(sfx, drone(T['turn'] - T['koi0'], 55, 1., att=3.), T['koi0'], 1., 0, .2)
for k, dt in enumerate([0, .04, .1, .16, .24, .3, .36]):                     # lamp flicker
    put(sfx, fade(filt(noise(.04), 'high', 2500) * np.exp(-tt(.04) * 60) * .3, .001, .01), T['flick'] + dt, .6, -.6)
d = T['turn'] - T['sh0']; t_ = tt(d)
put(sfx, fade(filt(noise(d), 'band', [200, 1800]) * (t_ / d) ** 3 * .25, .05, .005), T['sh0'], 1., .3, .3)   # reverse swell into the turn
for dt in (0, .04, .16, .2): put(sfx, fade(filt(noise(.05), 'high', 2500) * np.exp(-tt(.05) * 60) * .35, .001, .01), T['off'] + dt, .6, -.6)
put(sfx, whoosh(.25, 700, 1600, 500, .7), T['turn'] - .05, .6, .3)
put(sfx, breath(.7, 300, 1600, 1.2), T['relief'], 1., -.1, .15)            # relief exhale
put(sfx, drone(T['freeze'] - T['diya'], 49, 1.2, att=1.5), T['diya'], 1., 0, .2)
put(sfx, breath(.3, 600, 3000, .7), T['diya'] - .05, .6, .4)               # the diya blows out
put(sfx, creak(1.1, 210, .8), T['gIn0'] - .1, .8, .5, .5)                  # branch creak
put(sfx, howl(1.6, 680, .9), T['gIn0'] + .2, .55, .8, .9)
x = np.zeros(int(1.4 * SR))
for f0 in (110, 116.5, 164.8, 233): x += pad([69 + 12 * np.log2(f0 / 440)], 1.2, 1., att=.05, rel=.2, cut=900)[:len(x)]
put(sfx, x * 1.4, T['gIn0'] + .05, 1., 0, .4)                              # sting on the reveal
hb = T['see']; bpm = 66
while hb < fz - .2:
    put(sfx, heart(1.), hb, .95); bpm = min(150, bpm * 1.07); hb += 60 / bpm
for k, dt in enumerate([.35, .95, 1.55]):                                  # payal in the close-up
    put(sfx, payal(1.1), T['cu0'] + dt, 1., -.1 + k * .2, .4)
d = T['cu1'] - T['cu0'] - .2; put(sfx, fade(filt(noise(d), 'band', [300, 1600]) * .05, .2, .3), T['cu0'] + .2, 1., .1)   # cloth drag
put(sfx, breath(.5, 500, 2600, .9), T['lift0'] + .2, .8, -.3)              # sharp intake
put(sfx, screech(fz - T['lift0'], 1.), T['lift0'], 1., 0, .3)
put(sfx, whoosh(fz - T['lunge0'], 300, 2400, 3000, 1.), T['lunge0'], 1., 0, .2)
# FREEZE: tape stop + scratch, then near silence
d = .5; t_ = tt(d); fr = 233 * (1 - t_ / d) ** 1.6
ts = np.sin(2 * np.pi * np.cumsum(fr) / SR) + .5 * signal.sawtooth(2 * np.pi * np.cumsum(fr * 1.5) / SR)
put(sfx, filt(ts, 'low', 1800) * (1 - t_ / d) * .25, fz, 1., 0, .1)
sc = tt(.18); put(sfx, fade(filt(noise(.18), 'band', [900, 4000]) * np.sin(np.pi * sc / .18) * .4 * (.5 + .5 * signal.square(2 * np.pi * 26 * sc)), .002, .02), fz + .02, .8)
put(sfx, tick(1800, .9), T['pause'], .6, 0, .3)
# CreatorChahiye side: warm groove under the reveal
put(sfx, whoosh(T['pull1'] - T['pull0'], 400, 1400, 700, .9), T['pull0'], .7, .1, .2)
gstop = T['gag'] - .05
groove(G0, g(3), [(F9, 41)], full=False, vol=.75)
groove(g(3), gstop, [(F9, 41), (CE, 40), (DM9, 38), (BB7, 34)], full=True)
put(music, pad(F9, gstop - G0, .8, att=.5, rel=.3, cut=1300), G0, 1, 0, .25)
put(sfx, pop(560, 840, .11), T['ruk0'] + .02, .7, 0, .2)
put(sfx, kick(1.), T['hk0'] + .4, .7); put(sfx, bell(mf(88), .8, .6), T['hk0'] + .42, .6, 0, .5)
put(sfx, pop(600, 900, .1), T['sc0'] + .05, .6, 0, .2); put(sfx, pop(700, 1000, .1), T['sc1'] + .05, .6, 0, .2)
put(sfx, pop(520, 780, .1, .8), T['ctaA'] + .05, .6, 0, .3); put(sfx, pop(700, 900, .08, .6), T['ctaB'] + .05, .5, 0, .3)
for i, m in enumerate([53, 60, 69, 76, 79]): put(music, rhodes(m, 2.2, .9), T['logo'] + i * .09, 1., (i - 2) * .2, .4)   # warm chord under the logo
# the gag: the paused ghost looks at the monk
d = .35; t_ = tt(d); put(music, -np.zeros(1), 0)
put(sfx, payal(.9), T['gag'] + .1, .8, .3, .6)
put(sfx, pad([45, 46, 52], 1.3, .8, att=.1, rel=.6, cut=700), T['gag'] + .05, 1., .2, .4)
put(sfx, tick(2600, .5), T['take'] + .05, .4, -.2)
for s in CU['moonSteps']: put(sfx, fade(filt(noise(.13), 'band', [500, 3200]) * np.sin(np.pi * tt(.13) / .13) ** 2 * .13, .005, .02), s, .8, -.4)
for i, s in enumerate(CU['moonSteps']): put(music, bass([41, 41, 36, 41][i % 4], .16, .6), s, .6)
tb = T['moon1'] + .05
put(music, kick(.9), tb, .9); put(music, bass(41, BEAT * 3, 1), tb, 1.)
for i, m in enumerate(F9): put(music, rhodes(m, 2.2, 1.), tb + i * .03, 1., (i - 2) * .16, .3)
put(music, pad(F9 + [72], END - tb - .3, 1.2, att=.1, rel=1., cut=1500), tb, 1, 0, .35)

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
