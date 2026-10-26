import sys,os
from PIL import Image,ImageDraw
out=sys.argv[1]; files=sys.argv[2:]; c=4; W,H=480,270
r=(len(files)+c-1)//c; im=Image.new("RGB",(c*W,r*H),"white"); d=ImageDraw.Draw(im)
for i,f in enumerate(files):
    t=Image.open(f).convert("RGB").resize((W,H)); x,y=(i%c)*W,(i//c)*H; im.paste(t,(x,y))
    d.rectangle([x,y,x+60,y+22],fill="black"); d.text((x+5,y+5),os.path.basename(f)[:-4],fill="white")
im.save(out,quality=80)
