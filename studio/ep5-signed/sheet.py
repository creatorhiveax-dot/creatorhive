"""Contact sheet of stills: python3 sheet.py out.jpg t1 t2 ... (renders missing stills first)"""
import sys, os, subprocess
from PIL import Image
here=os.path.dirname(os.path.abspath(__file__)); out=sys.argv[1]; ts=sys.argv[2:]
subprocess.run([sys.executable, os.path.join(here,'render.py'),'test',*ts],check=True)
ims=[Image.open(os.path.join(here,'stills',f'still_{float(t):06.2f}.png')).convert('RGB') for t in ts]
cols=int(os.environ.get('COLS',3)); w=int(os.environ.get('TW',540)); h=w*16//9; rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(cols*w,rows*h),'#000')
for i,im in enumerate(ims): sh.paste(im.resize((w,h),Image.LANCZOS),((i%cols)*w,(i//cols)*h))
sh.save(out,quality=90)
