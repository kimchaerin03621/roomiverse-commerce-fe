import sys, numpy as np
from PIL import Image
SRC="C:/OMG/roomiverse2-fe/docs/intro-originals/"
def smooth(x,a,b):
    t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)
def lum(a): return (0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2])/255.0
def gain(a, g, protect=0.35, lo=0.55, hi=0.9):
    """per-channel gain; bright warm lights keep part of their original colour."""
    out=a*np.array(g)[None,None,:] if np.ndim(g)==1 else a*g
    l=lum(a); keep=protect*smooth(l,lo,hi)[...,None]
    out=out*(1-keep)+a*keep
    return np.clip(out,0,255)
def sat(a, k):
    l=lum(a)[...,None]*255
    return np.clip(l+(a-l)*k,0,255)

def bg(sky=(0.88,1.52,1.34), sea=(0.46,1.46,1.62), ssat=0.92):
    im=Image.open(SRC+"bg-sky-sea.png").convert("RGB"); a=np.asarray(im).astype(np.float32)
    H,W=a.shape[:2]; y=np.arange(H,dtype=np.float32)[:,None]*np.ones((1,W),np.float32)
    w=smooth(y,248,285)[...,None]
    s=gain(a,sky); t=gain(a,sea,protect=0.85,lo=0.30,hi=0.55)
    # water only: pull what is still magenta/violet toward blue, but leave bright light reflections warm
    hsv=np.asarray(Image.fromarray(t.astype(np.uint8)).convert("HSV")).astype(np.float32)/255
    h,sa,v=hsv[...,0],hsv[...,1],hsv[...,2]
    magenta=smooth(h,0.66,0.74)*(1-smooth(h,0.95,0.99))  # violet..pink hues
    dark=1-smooth(v,0.50,0.80)
    wt=magenta*dark*0.85
    d=((0.60-h+0.5)%1.0)-0.5
    h2=h+d*wt
    sa2=sa*(1-0.12*wt)
    # light reflections that are still pink: slide to peach/amber so they match the sky's glow
    pink=np.where(h>0.5,smooth(h,0.84,0.92),1-smooth(h,0.03,0.07))
    lit=smooth(v,0.38,0.60)
    wp=pink*lit*0.9
    d2=((0.085-h2+0.5)%1.0)-0.5
    h2=np.where(wp>0,h2+d2*wp,h2)
    sa2=sa2*(1-0.10*wp)
    t=np.asarray(Image.fromarray((np.stack([h2%1.0,np.clip(sa2,0,1),v],-1)*255+0.5).astype(np.uint8),"HSV").convert("RGB")).astype(np.float32)
    out=s*(1-w)+t*w
    return Image.fromarray(sat(out,ssat).astype(np.uint8))
if __name__=="__main__":
    o=Image.open(SRC+"bg-sky-sea.png").convert("RGB"); n=bg()
    s=Image.new("RGB",(1672,941*2//1)); 
    s=Image.new("RGB",(1672,1882)); s.paste(o,(0,0)); s.paste(n,(0,941)); s.resize((836,941)).save("C:/Users/user/AppData/Local/Temp/claude/C--OMG-roomiverse2-fe/cdea2054-c8fe-4f88-8315-016a53a69bdc/scratchpad/prev/bg.png")


DST="C:/OMG/roomiverse2-fe/public/intro/"
def save(name, rgb, alpha=None):
    im=Image.fromarray(rgb.astype(np.uint8),"RGB")
    if alpha is not None: im.putalpha(Image.fromarray(alpha,"L"))
    im.save(DST+name+".png",optimize=True); im.save(DST+name+".webp",quality=88,method=6)

def layer(name, g, protect=0.6, lo=0.35, hi=0.7, s=0.95):
    arr=np.asarray(Image.open(SRC+name+".png").convert("RGBA"))
    rgb=arr[...,:3].astype(np.float32); alpha=arr[...,3]
    out=sat(gain(rgb,g,protect,lo,hi),s)
    save(name,out,alpha)

def apply_all():
    save("bg-sky-sea", np.asarray(bg()).astype(np.float32))
    layer("mid-yard",(0.77,1.29,1.34))
    layer("fg-left-crane",(0.80,1.35,1.26))
    print("applied")

if __name__=="__main__" and len(sys.argv)>1 and sys.argv[1]=="apply":
    apply_all()
