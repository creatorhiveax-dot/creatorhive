# CreatorChahiye Reel, Ep. 8: "Follower City"

A narrated story (about 76 s, 9:16, 60 fps): a city where followers are money, until the night an app update deletes fake followers.
The cuts and the word-by-word captions are timed from `words.js`, the speech-to-text word timings of the narration in `audio/narration_source.mp3`.

| File | What it is |
| --- | --- |
| `film.html`, `film.js` | The film. `render(t)` draws the frame for time `t`; each shot is a function and `SHOTS` maps it to the word that starts it. |
| `chars.js` | The character library with Ep. 8 additions: new hairstyles, Rocky's shades and chain, and the redesigned Drip Monk (`monk2`). Older options draw exactly as before. |
| `words.js` | Narration word timings. Re-create it from a new voice file with speech-to-text if the narration changes. |
| `render.py` | Frame renderer (stills, 540p preview, thumbnail, resumable 4K frames with motion blur). |
| `sound.py` | Music and effects cut to the shot list, plus the cleaned-up narration with music ducking. |

```bash
python3 sound.py
python3 render.py thumb
python3 render.py full 0 4576
```
