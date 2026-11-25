"""Generates the narration with ElevenLabs text-to-speech -> vo/<id>.wav (48 kHz mono).
The API key is injected by the session's network proxy, so the header below carries a placeholder.
Lines and their styles are read from the film page (window.cues().VO). Usage: python3 vo.py [voice_id]"""
import os, sys, json, subprocess, urllib.request
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'vo'); os.makedirs(OUT, exist_ok=True)
VOICE = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('VOICE_ID', 'JBFqnCBsd6RMkjVDRZzb')
MODEL = os.environ.get('VO_MODEL', 'eleven_multilingual_v2')
STYLE = {'dark': dict(stability=.55, similarity_boost=.8, style=.35, use_speaker_boost=True, speed=.88),
         'whisper': dict(stability=.35, similarity_boost=.75, style=.6, use_speaker_boost=True, speed=.82),
         'warm': dict(stability=.5, similarity_boost=.8, style=.45, use_speaker_boost=True, speed=.98)}
exe = '/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=exe, args=['--allow-file-access-from-files', '--no-sandbox'])
    pg = b.new_page(); pg.goto('file://' + os.path.join(HERE, 'film.html')); pg.wait_for_timeout(400)
    VO = json.loads(pg.evaluate('JSON.stringify(cues().VO)')); b.close()
for vid, start, text, style in VO:
    body = json.dumps({'text': text, 'model_id': MODEL, 'voice_settings': STYLE[style]}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192', data=body, method='POST',
                                 headers={'xi-api-key': 'proxy-injected', 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    mp3 = os.path.join(OUT, f'{vid}.mp3')
    with urllib.request.urlopen(req, timeout=60) as r, open(mp3, 'wb') as f: f.write(r.read())
    wav = os.path.join(OUT, f'{vid}.wav')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ac', '1', '-ar', '48000', '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse', wav], check=True)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], capture_output=True, text=True).stdout)
    print(f'{vid}  start {start:6.2f}  dur {dur:5.2f}  ends {start + dur:6.2f}  {text}')
