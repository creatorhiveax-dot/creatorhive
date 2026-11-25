"""Frame-accurate renderer for the CreatorChahiye episodes (Ep. 4 pipeline, adapted for Ep. 7).
Usage:  python3 render.py test 1.0 5.5 12.0        -> 1080x1920 PNG stills into stills/
        python3 render.py prev 0 990               -> 540x960 preview frames (30fps numbering) into pv/
        python3 render.py thumb                    -> thumbnail.png / thumbnail.jpg (1080x1920)
        python3 render.py full 0 2796              -> 4K (2160x3840) JPG frames into $FR (default fr/), resumable
The HTML page must define a global render(t) that draws the frame for time t (seconds).
Motion blur: frames inside HI windows average 4 sub-frames across a 180-degree shutter."""
import sys, io, os, numpy as np
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(HERE, 'film.html'); FPS = 60
FR = os.environ.get('FR', os.path.join(HERE, 'fr'))
# fast-motion windows (seconds): glass moves, the boom, the wave, the faint
HI = [(12.9, 14.0), (19.1, 22.5), (26.3, 29.5), (30.95, 31.4), (34.0, 35.7), (43.9, 44.6)]
mode = sys.argv[1]
exe = '/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=exe, args=['--allow-file-access-from-files', '--no-sandbox'])
    vp = {'width': 1080, 'height': 1920}
    dsf = 2 if mode == 'full' else (0.5 if mode == 'prev' else 1)
    ctx = b.new_context(viewport=vp, device_scale_factor=dsf)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(PAGE); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(1200)
    pg.evaluate('render(0.5)'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(300)
    if mode == 'test':
        os.makedirs(os.path.join(HERE, 'stills'), exist_ok=True)
        for t in sys.argv[2:]:
            pg.evaluate(f'render({t})'); pg.screenshot(path=os.path.join(HERE, 'stills', f'still_{float(t):06.2f}.png'))
        print('errors:', errs[:3])
    elif mode == 'thumb':
        pg.evaluate('renderThumb()'); pg.screenshot(path=os.path.join(HERE, 'thumbnail.png'))
        Image.open(os.path.join(HERE, 'thumbnail.png')).convert('RGB').save(os.path.join(HERE, 'thumbnail.jpg'), quality=93); print('errors:', errs[:3])
    elif mode == 'prev':
        out = os.path.join(HERE, 'pv'); os.makedirs(out, exist_ok=True); a, z = int(sys.argv[2]), int(sys.argv[3])
        for f in range(a, z):
            pg.evaluate(f'render({f/30})'); pg.screenshot(path=f'{out}/{f:05d}.jpg', type='jpeg', quality=88)
        print('errors:', errs[:3])
    else:
        os.makedirs(FR, exist_ok=True); a, z = int(sys.argv[2]), int(sys.argv[3]); tmp = f'{FR}/tmp_{a}.jpg'
        for f in range(a, z):
            if os.path.exists(f'{FR}/{f:05d}.jpg'): continue
            tt = f / FPS; S = 4 if any(x <= tt <= y for x, y in HI) else 1; acc = None
            for s in range(S):
                t = (f + ((s / (S - 1) - .5) * .5 if S > 1 else 0)) / FPS
                pg.evaluate(f'render({max(0, t)})')
                im = np.asarray(Image.open(io.BytesIO(pg.screenshot(type='jpeg', quality=95))), dtype=np.float32)
                acc = im if acc is None else acc + im
            Image.fromarray((acc / S + .5).astype(np.uint8)).save(tmp, quality=95, subsampling=0); os.replace(tmp, f'{FR}/{f:05d}.jpg')
        if errs: print('errors:', errs[:3])
    b.close()
# Encode (in segments if needed):
# ffmpeg -framerate 60 -i fr/%05d.jpg -i sound.wav -c:v libx264 -profile:v high -b:v 45M -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart final_4k.mp4
