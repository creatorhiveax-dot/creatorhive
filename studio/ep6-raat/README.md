# CreatorChahiye Reel, Ep. 6: "Raat ke 3 baje."

Source for the animated Reel (≈32.6 s, 9:16, 60 fps): a plain night-time ghost story that freezes into a paused Reel and turns into a CreatorChahiye hook. Everything is code, so the film can be re-rendered or edited at any time.

| File | What it is |
| --- | --- |
| `film.html`, `film.js` | The film. `render(t)` draws the frame for time `t`; all timings live in the `T` object at the top of `film.js`. |
| `chars.js` | Ep. 4 character library (Creator, Founder, Drip Monk), same file as Ep. 5. The ghost is drawn in `film.js`. |
| `render.py` | Frame renderer (Playwright + Chromium): stills, 540p preview frames, thumbnail, resumable 4K frames with motion blur. |
| `sound.py` | Synthesises the synced soundtrack (`sound.wav`). Cue times are read from the film page, so sound cannot drift from picture. |
| `sheet.py` | Contact sheet of stills for QA. |
| `fonts/` | Outfit and Baloo 2 (Google Fonts, OFL), stored locally so renders are deterministic. |

```bash
python3 sheet.py stills/sheet.jpg 2.0 9.0 13.3 16.8 24.5 # stills
python3 sound.py                                        # sound.wav
python3 render.py thumb                                 # thumbnail.jpg
python3 render.py full 0 1956                           # 4K frames into fr/ (resumable; run ranges in parallel)
ffmpeg -framerate 60 -i fr/%05d.jpg -i sound.wav -c:v libx264 -profile:v high -b:v 45M -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart final_4k.mp4
```

Needs Python with `playwright`, `numpy`, `scipy`, `pillow`, plus `ffmpeg`.
