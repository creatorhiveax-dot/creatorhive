"""Synthesises the synced soundtrack for Ep. 5 "Signed." -> sound.wav (48 kHz stereo).
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

# ---------- MUSIC ----------
stop1 = T['b'][1] + .26                                  # contract unrolls -> the beat drops out
groove(0, stop1, [(DM9, 38), (BB7, 34)])
groove(T['b'][2], T['tub'], [(BB7, 34), (DM9, 38)])      # back in with "Payment next month", killed by the tub landing
# door opens: warm pad, then a light swagger for the monk
put(music, pad([46, 58, 62, 65, 69], T['tap'] - T['door'], 1.1, att=1.0, rel=.9), T['door'], 1, 0, .3)
put(music, pad([48, 60, 64, 67, 74], T['cardOut'] - T['tap'] - .1, 1.1, att=.3, rel=.8, cut=1500), T['tap'], 1, 0, .3)
for i, s in enumerate(CU['monkSteps']):
    put(music, shaker(.9), s, .55, -.2); put(music, bass(34 if i % 4 < 2 else 41, .16, .7), s, .7)
    if i % 2: put(music, rim(.8), s, .4, .1, .15)
# anticipation under the last stroke of the signature
x = pad([65, 72, 77], .75, 1., att=.75, rel=.05, cut=2400); put(music, x, T['stamp'] - .78, .8, 0, .2)
# life after signing: the full beat lands exactly on the stamp
PROG = [(F9, 41), (CE, 40), (DM9, 38), (BB7, 34), (F9, 41)]
groove(G0, g(20), PROG, full=True)
put(music, pad(F9, g(20) - G0, .9, att=.4, rel=.6, cut=1300), G0, 1, 0, .25)
# tagline: two warm hits, then resolve
for t0, ch, bm in ((T['tag1'], BB7, 34), (T['tag2'], CADD, 36)):
    put(music, kick(1), t0, 1.); put(music, bass(bm, BEAT * 1.8, 1), t0, 1.); put(music, clap(.8), t0, .35, 0, .3)
    for i, m in enumerate(ch): put(music, rhodes(m, BEAT * 1.9, 1.1), t0 + i * .014, 1.1, (i - 2) * .16, .3)
    put(music, pad(ch, BEAT * 1.9, 1.2, att=.05, rel=.5, cut=1700), t0, 1, 0, .3)
    put(music, fade(filt(noise(.45), 'band', [500, 4000]) * np.linspace(0, 1, int(.45 * SR)) ** 3 * .1, .01, .01), t0 - .45, 1)
tr = g(24)
put(music, kick(.9), tr, .9); put(music, bass(29 + 12, BEAT * 3, 1), tr, 1.)
for i, m in enumerate(F9): put(music, rhodes(m, 2.5, 1.1), tr + i * .03, 1.1, (i - 2) * .16, .3)
put(music, pad(F9 + [72], END - tr - 1.3, 1.4, att=.15, rel=1.2, cut=1500), tr, 1, 0, .35)
for i, m in enumerate([53, 60, 69, 76, 79]): put(music, rhodes(m, 2.2, .9), T['logo'] + i * .09, 1., (i - 2) * .2, .4)   # warm chord under the logo

# ---------- SFX ----------
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

# hook: five phones buzz
PX = [540, 288, 792, 228, 852]
for i, t0 in enumerate(T['buzz']):
    put(sfx, buzz(.27, 150 + i * 9), t0, .62, xpan(PX[i])); put(sfx, ping(1320 * [1, 1.122, 1.26, .944, 1.335][i], .8), t0, .5, xpan(PX[i]), .25)
put(sfx, thud(70, 40, .5, .5, .2), T['h2'], .7)                               # "Paanch kaam." lands
put(sfx, whoosh(.8, 300, 1700, 400), T['pan0'] + .02, .55, 0, .1)
# grind
for i, t0 in enumerate(T['b']):
    put(sfx, pop(560, 820, .11), t0, .8, -.35, .15); put(sfx, pop(700, 520, .1, .7), t0 + .09, .7, -.35, .15); put(sfx, buzz(.16, 165), t0 + .02, .22, .35)
put(sfx, breath(.75, 250, 1400), T['b'][0] + .86, 1.0, .25)                    # sigh
d = .85; t = tt(d); fl = .55 + .45 * np.sin(2 * np.pi * np.cumsum(18 + 22 * t / d) / SR)
put(sfx, fade(filt(noise(d), 'band', [1400, 6500]) * fl * np.sin(np.pi * np.minimum(t / d, 1)) ** .7 * .16, .02, .12), T['b'][1] + .28, 1, .2, .08)   # paper unrolls
for k in range(9): put(sfx, tick(900 + 40 * k, .5), T['b'][1] + .42 + k * .075 * (1 + k * .04), .5, .2 - k * .07)
put(sfx, whoosh(.3, 3000, 1500, 600, .7), T['b'][2] - .12, .5, .2)             # ...and snaps back up
for k, t0 in enumerate(CU['flips']):
    put(sfx, fade(filt(noise(.09), 'high', 1500 + 300 * k) * np.exp(-tt(.09) * 30) * .35, .002, .02), t0 + .03, .9, -.55, .1); put(sfx, tick(1300 + 150 * k, .5), t0 + .3, .6, -.55)
put(sfx, whoosh(.36, 900, 500, 250, .6), T['tub'] - .4, .5, -.4)
put(sfx, thud(105, 42, .42, 1.1, .8), T['tub'], 1., -.4, .15); put(sfx, tick(700, .8), T['tub'] + .012, .5, -.4)
put(sfx, thud(60, 36, .3, .35, .2), T['tub'] + .16, .6, -.4)
for dt in (.0, .1, .22, .35):                                                 # ring light flickers
    tb = tt(.06); put(sfx, fade((np.tanh(3 * np.sin(2 * np.pi * 100 * tb)) * .25 + filt(noise(.06), 'high', 3000) * .22) * np.exp(-tb * 18), .001, .01), T['flick'] + dt, .6, .3)
    put(sfx, tick(3200, .5), T['flick'] + dt, .35, .3)
put(sfx, fade(sweep(170, 78, .34, .7) * np.exp(-tt(.34) * 5) * .22, .01, .08), T['slump'], .8, .25)
# offer
d = .72; t = tt(d); f = 300 + 170 * np.sin(np.pi * t / d * .9) + 26 * np.sin(2 * np.pi * 6.5 * t)
cr = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (.5 + .5 * np.sin(2 * np.pi * np.cumsum(34 + 16 * np.sin(2 * np.pi * 3 * t)) / SR)) ** 2
put(sfx, fade((filt(cr, 'band', [600, 1100]) + .6 * filt(cr, 'band', [1700, 2600])) * np.sin(np.pi * t / d) ** .8 * .09, .03, .1), T['door'], 1., -.7, .25)   # door creak
put(sfx, thud(80, 50, .2, .3, .5), T['door'] + .02, .7, -.7)
for i, s in enumerate(CU['monkSteps']): put(sfx, step(1., 100 + 14 * (i % 2)), s, .8, xpan(178 + (470 - 178) * i / max(1, len(CU['monkSteps']) - 1)))
put(sfx, thud(190, 120, .08, .5, 1.), T['place1'] - .02, .7, .12)              # folder on the table
put(sfx, tick(880, 1.2), T['tap'], 1., .12, .2); put(sfx, thud(230, 150, .07, .6, .3), T['tap'], .9, .12)   # one-finger tap
put(sfx, whoosh(.26, 1200, 2600, 1500, .5), T['open0'], .5, .1)
for k, m in enumerate([77, 81, 84, 88]): put(sfx, bell(mf(m), 1.1, .5), T['card0'] + .06 + k * .075, .55, -.2 + k * .1, .6)   # card rises
put(sfx, tick(1500, .6), T['pen0'] + .32, .5, .25)                             # pen picked up
# the signature (pen scratch follows the stroke speed)
d = T['sig1'] - T['sig0']; t = tt(d); x = t / d
spd = (.82 * np.sin(np.pi * x) * np.pi / 2 + .18) * (.55 + .45 * np.abs(np.sin(2 * np.pi * 5.6 * t + .7))) * (.8 + .2 * np.sin(2 * np.pi * 31 * t))
put(sfx, fade(filt(noise(d), 'band', [2200, 7500]) * spd * .26 + filt(noise(d), 'band', [600, 1500]) * spd * .08, .03, .05), T['sig0'], 1., .22, .06)
put(sfx, tick(2400, .4), T['sig1'] + .05, .3, .3)
# SIGNED stamp
put(sfx, whoosh(.17, 500, 1400, 900, .6), T['stamp'] - .17, .5)
put(sfx, thud(86, 34, .7, 1.5, .5), T['stamp'], 1.1, 0, .3); put(sfx, thud(210, 120, .1, .9, 1.), T['stamp'], .9, 0, .2)
put(sfx, fade(filt(noise(.07), 'high', 900) * np.exp(-tt(.07) * 55) * .5, .0005, .01), T['stamp'], .8, 0, .2)
# soft chimes for the gold particles
PENT = [89, 91, 93, 96, 98, 101]
for k in range(13):
    put(sfx, bell(mf(PENT[int(rng.integers(0, 6))]), 1.5, .32), T['stamp'] + .12 + k * .2 + rng.uniform(-.05, .05), .42, rng.uniform(-.6, .6), .8)
put(sfx, breath(.6, 350, 2400, 1.1), T['exhale'], 1., .25, .1)                 # exhale
put(sfx, bell(mf(84), 1.3, .5), T['smile'], .5, .25, .7); put(sfx, bell(mf(88), 1.3, .5), T['smile'] + .09, .5, .25, .7)   # first smile
# life after signing
for i, t0 in enumerate(CU['lands']):
    put(sfx, whoosh(.5, 500, 2200 + 200 * i, 900, .7), t0 - .62, .42, .3 - i * .12)
    put(sfx, tick(1900 * 1.122 ** i, 1.), t0, .7, -.45, .3); put(sfx, bell(mf(84 + [0, 2, 4, 7, 9][i]), .5, .35), t0, .5, -.45, .4)
put(sfx, tick(1200, .8), T['gim0'] + .22, .55, .4)
for k in range(6): put(sfx, tick(1700 + 90 * k, .5), T['gim0'] + .42 + k * .042, .45, .4)
for s in CU['moonSteps']: put(sfx, fade(filt(noise(.13), 'band', [500, 3200]) * np.sin(np.pi * tt(.13) / .13) ** 2 * .13, .005, .02), s, .8, -.4)
for i, t0 in enumerate(T['cards']):
    put(sfx, whoosh(.2, 800, 1900, 1200, .5), t0 - .02, .4, -.5); put(sfx, pop(620 * 1.122 ** i, 930 * 1.122 ** i, .1), t0 + .13, .75, -.45, .25); put(sfx, tick(2600, .5), t0 + .13, .4, -.45)
for i, s in enumerate(CU['founderSteps']):
    put(sfx, tick(1500 + 100 * (i % 2), .5), s, .45, xpan(178 + 262 * i / max(1, len(CU['founderSteps']) - 1))); put(sfx, step(.8, 130), s, .6, xpan(178 + 262 * i / max(1, len(CU['founderSteps']) - 1)))
put(sfx, pop(420, 980, .1), T['fit'], .9, .1, .25)
for k in range(9): put(sfx, tick(1500 + 110 * k, .45), T['fit'] + .1 + .62 * (1 - (1 - k / 9) ** 2.2), .4, .1)
put(sfx, bell(mf(81), .9, .6), T['fit'] + .72, .6, .1, .5); put(sfx, bell(mf(88), .9, .5), T['fit'] + .72, .5, .1, .5)
put(sfx, thud(150, 90, .12, .6, 1.), T['hand1'] + .18, .8, .15, .1)            # box on the table
tp = T['pay']                                                                 # cha-ching
put(sfx, tick(900, .9), tp, .6); put(sfx, bell(mf(95), .7, .8), tp + .05, .7, -.1, .5); put(sfx, bell(mf(100), 1.1, .8), tp + .15, .75, .1, .5)
tc = tt(.3); put(sfx, fade(filt(noise(.3), 'high', 6000) * (.5 + .5 * signal.square(2 * np.pi * 38 * tc)) * np.exp(-tc * 9) * .12, .002, .05), tp + .13, .8, 0, .3)
# end card
put(sfx, pop(700, 900, .08, .6), T['badge'] + .05, .5, 0, .3); put(sfx, pop(520, 780, .1, .8), T['cta'] + .05, .6, 0, .3)
put(sfx, tick(3000, .5), T['shades'] + .28, .4, -.35, .3); put(sfx, bell(mf(100), 1.2, .28), T['shades'] + .32, .4, -.35, .8)

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
