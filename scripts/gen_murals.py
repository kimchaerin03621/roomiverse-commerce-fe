"""Graffiti murals and raw-concrete maps for the 3D shop. Run: python scripts/gen_murals.py
Outputs (public/shop3d): mural_back.jpg, mural_side.jpg, concrete_wall_normal.jpg, drum_color.jpg, dark_metal_color.jpg
"""
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = "public/shop3d/"
FONTS = "C:/Windows/Fonts/"
PINK = (247, 29, 100)
PURPLE = (193, 78, 212)
PEACH = (255, 183, 146)
WHITE = (240, 240, 240)
BLACK = (14, 11, 16)


def font(name, size):
    return ImageFont.truetype(FONTS + name, size)


def fbm(shape, seed, beta=2.0, aniso=(1.0, 1.0)):
    rng = np.random.default_rng(seed)
    h, w = shape
    fy = np.fft.fftfreq(h)[:, None] * aniso[0]
    fx = np.fft.fftfreq(w)[None, :] * aniso[1]
    f = np.sqrt(fx**2 + fy**2)
    f[0, 0] = 1
    amp = 1 / f ** (beta / 2)
    amp[0, 0] = 0
    n = np.fft.ifft2(amp * np.exp(2j * np.pi * rng.random(shape))).real
    return (n - n.min()) / (n.max() - n.min())


def normal_from_height(hm, strength):
    gx = np.roll(hm, -1, 1) - np.roll(hm, 1, 1)
    gy = np.roll(hm, -1, 0) - np.roll(hm, 1, 0)
    nx, ny, nz = -gx * strength, gy * strength, np.ones_like(hm)
    ln = np.sqrt(nx**2 + ny**2 + nz**2)
    n = np.stack([nx / ln, ny / ln, nz / ln], -1)
    return ((n * 0.5 + 0.5) * 255).astype(np.uint8)


def concrete(w, h, seed, tone=0.30):
    """Raw cast concrete: mottling, pores, form-work seams and tie holes. Returns (rgb float, height)."""
    rng = np.random.default_rng(seed)
    big = fbm((h, w), seed, beta=2.8)
    mid = fbm((h, w), seed + 1, beta=2.0)
    fine = fbm((h, w), seed + 2, beta=1.2)
    stain = fbm((h, w), seed + 3, beta=2.6, aniso=(0.08, 1.0))
    v = tone + 0.22 * (big - 0.5) + 0.12 * (mid - 0.5) + 0.07 * (fine - 0.5) - 0.12 * np.clip(stain - 0.55, 0, 1) * 2
    pores = (fbm((h, w), seed + 4, beta=1.0) > 0.86) * 0.1
    v = np.clip(v - pores, 0, 1)
    yy, xx = np.mgrid[0:h, 0:w]
    panel_w, panel_h = w // 4, h // 2
    seam = (((xx % panel_w) < 3) | ((yy % panel_h) < 3)).astype(float)
    v = v * (1 - 0.35 * seam)
    # tie holes on a grid
    for gy in range(2):
        for gx in range(4):
            for ox, oy in ((0.25, 0.25), (0.75, 0.25), (0.25, 0.75), (0.75, 0.75)):
                cx, cy = int((gx + ox) * panel_w), int((gy + oy) * panel_h)
                d = ((xx - cx) ** 2 + (yy - cy) ** 2) / 49
                v = v * (1 - 0.5 * np.clip(1.4 - d, 0, 1))
    height = 0.55 * big + 0.25 * mid + 0.2 * fine - 0.8 * seam - pores * 3
    rgb = np.stack([v * 1.0, v * 0.99, v * 1.03], -1)
    return rgb, height


def drip(draw, x, y, color, length, width):
    draw.rectangle([x - width // 2, y, x + width // 2, y + length], fill=color)
    draw.ellipse([x - width, y + length - width, x + width, y + length + width], fill=color)


def outlined(draw, xy, text, fnt, fill, outline, width, shadow=None, angle=0):
    x, y = xy
    if shadow:
        for d in range(1, 9):
            draw.text((x + d, y + d), text, font=fnt, fill=shadow, stroke_width=width, stroke_fill=shadow)
    draw.text((x, y), text, font=fnt, fill=fill, stroke_width=width, stroke_fill=outline)


def tag_layer(size, items, seed):
    """Draw marker tags on a transparent layer, each rotated a little, with drips."""
    rnd = random.Random(seed)
    W, H = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    for text, fname, fsize, color, pos, ang, style in items:
        tmp = Image.new("RGBA", (int(W * 0.7), int(fsize * 2.2)), (0, 0, 0, 0))
        d = ImageDraw.Draw(tmp)
        f = font(fname, fsize)
        if style == "throw":
            outlined(d, (20, 10), text, f, color, BLACK, max(4, fsize // 14), shadow=PINK if color != PINK else PURPLE)
        elif style == "outline":
            outlined(d, (20, 10), text, f, color, BLACK, max(3, fsize // 18))
        else:
            d.text((20, 10), text, font=f, fill=color)
        bb = tmp.getbbox()
        if not bb:
            continue
        tmp = tmp.crop(bb).rotate(ang, expand=True, resample=Image.BICUBIC)
        layer.alpha_composite(tmp, (int(pos[0] * W), int(pos[1] * H)))
        # spray drips under the bigger letters
        if fsize > 140:
            dd = ImageDraw.Draw(layer)
            for _ in range(5):
                x = int(pos[0] * W + rnd.random() * tmp.width)
                y = int(pos[1] * H + tmp.height * (0.62 + rnd.random() * 0.2))
                drip(dd, x, y, color + (235,), rnd.randint(30, 150), rnd.choice([3, 4, 5]))
    return layer


def doodles(layer, seed, n, W, H):
    rnd = random.Random(seed)
    d = ImageDraw.Draw(layer)
    cols = [WHITE, PINK, PURPLE, PEACH]
    for _ in range(n):
        kind = rnd.choice(["star", "arrow", "wire", "burst", "heart", "crown"])
        x, y = rnd.randint(40, W - 200), rnd.randint(40, H - 200)
        c = rnd.choice(cols) + (230,)
        s = rnd.randint(40, 120)
        if kind == "star":
            pts = []
            for i in range(10):
                r = s if i % 2 == 0 else s * 0.4
                a = -math.pi / 2 + i * math.pi / 5
                pts.append((x + r * math.cos(a), y + r * math.sin(a)))
            d.line(pts + [pts[0]], fill=c, width=5, joint="curve")
        elif kind == "arrow":
            d.line([(x, y + s), (x + s * 1.8, y + s * 0.4), (x + s * 2.6, y + s * 0.9)], fill=c, width=6)
            d.line([(x + s * 2.6, y + s * 0.9), (x + s * 2.3, y + s * 0.5)], fill=c, width=6)
            d.line([(x + s * 2.6, y + s * 0.9), (x + s * 2.2, y + s * 1.1)], fill=c, width=6)
        elif kind == "wire":
            pts = [(x + i * 14, y + math.sin(i * 0.9) * 14) for i in range(30)]
            d.line(pts, fill=c, width=4)
            for i in range(2, 30, 5):
                d.line([(pts[i][0] - 9, pts[i][1] - 11), (pts[i][0] + 9, pts[i][1] + 11)], fill=c, width=4)
                d.line([(pts[i][0] - 9, pts[i][1] + 11), (pts[i][0] + 9, pts[i][1] - 11)], fill=c, width=4)
        elif kind == "burst":
            for i in range(10):
                a = i * math.pi / 5
                d.line([(x + math.cos(a) * s * 0.35, y + math.sin(a) * s * 0.35), (x + math.cos(a) * s * 0.9, y + math.sin(a) * s * 0.9)], fill=c, width=5)
        elif kind == "heart":
            d.line([(x, y + s * 0.5), (x - s * 0.5, y), (x - s * 0.25, y - s * 0.4), (x, y - s * 0.15), (x + s * 0.25, y - s * 0.4), (x + s * 0.5, y), (x, y + s * 0.5)], fill=c, width=6, joint="curve")
        else:
            d.line([(x, y + s * 0.5), (x, y), (x + s * 0.3, y + s * 0.25), (x + s * 0.5, y - s * 0.1), (x + s * 0.7, y + s * 0.25), (x + s, y), (x + s, y + s * 0.5), (x, y + s * 0.5)], fill=c, width=6, joint="curve")


def scribble_text(layer, lines, x0, y0, size, color, line_h, rnd, W):
    d = ImageDraw.Draw(layer)
    f = font("Inkfree.ttf", size)
    for i, t in enumerate(lines):
        d.text((x0 + rnd.randint(-6, 6), y0 + i * line_h), t, font=f, fill=color + (170,))


def make_mural(name, w, h, seed, tags, doodle_n, lines_block):
    rgb, height = concrete(w, h, seed, tone=0.27)
    base = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)).convert("RGBA")
    # soft vignette of grime at the bottom
    g = np.linspace(0, 1, h)[:, None] ** 3
    grime = np.zeros((h, w, 4), np.uint8)
    grime[..., 3] = (g * 90).astype(np.uint8)
    layer = tag_layer((w, h), tags, seed)
    rnd = random.Random(seed)
    doodles(layer, seed + 9, doodle_n, w, h)
    for (x0, y0, size, lines, color) in lines_block:
        scribble_text(layer, lines, x0, y0, size, color, int(size * 1.3), rnd, w)
    # spray bleed: a slightly blurred copy underneath
    blur = layer.filter(ImageFilter.GaussianBlur(3))
    out = Image.alpha_composite(base, Image.fromarray(grime))
    out = Image.alpha_composite(out, blur)
    out = Image.alpha_composite(out, layer)
    out.convert("RGB").save(OUT + name, quality=90)


# ---------- Back wall: one big mural, ROOMi lyrics and tags ----------
tags_back = [
    ("PLAY", "ariblk.ttf", 260, WHITE, (0.04, 0.10), -6, "throw"),
    ("IMMERSE", "ariblk.ttf", 200, PINK, (0.30, 0.34), 3, "throw"),
    ("EXPAND", "ariblk.ttf", 190, PEACH, (0.52, 0.06), -4, "throw"),
    ("ROOMi", "ariblk.ttf", 140, WHITE, (0.70, 0.50), 5, "outline"),
    ("party", "BRADHITC.TTF", 190, PURPLE, (0.06, 0.58), -8, "marker"),
    ("my own universe", "Inkfree.ttf", 130, WHITE, (0.30, 0.74), -2, "marker"),
    ("anywhere", "BRADHITC.TTF", 140, PINK, (0.62, 0.78), 4, "marker"),
]
lyrics = [
    (60, 40, 40, ["turn the room into a dance floor", "bring the beat, bring your people", "no gear, no stress, just play"], WHITE),
    (1250, 640, 38, ["anyone, anywhere, with anyone", "make the party you want", "RMV-001 / RMV-002 / RMV-003"], PEACH),
    (1500, 420, 36, ["we got fun and games", "we got everything you want", "honey, we know the names"], WHITE),
]
make_mural("mural_back.jpg", 2048, 1024, 11, tags_back, 14, lyrics)

# ---------- Side walls: scattered tags and marker lines ----------
tags_side = [
    ("RAVE", "ariblk.ttf", 180, WHITE, (0.06, 0.12), -5, "throw"),
    ("HOUSE", "BRADHITC.TTF", 190, PINK, (0.45, 0.30), 4, "marker"),
    ("after", "Inkfree.ttf", 150, PEACH, (0.12, 0.62), -3, "marker"),
    ("DAY", "ariblk.ttf", 150, PURPLE, (0.62, 0.66), 6, "outline"),
    ("listen", "Inkfree.ttf", 120, WHITE, (0.66, 0.08), -7, "marker"),
    ("THEMED", "ariblk.ttf", 130, WHITE, (0.30, 0.80), 3, "throw"),
]
lyrics_side = [
    (80, 560, 36, ["keep it loud, keep it small", "the room is yours tonight"], WHITE),
    (1100, 800, 34, ["play it yourself", "ROOMi / ROOMiVERSE"], PEACH),
]
make_mural("mural_side.jpg", 2048, 1024, 23, tags_side, 12, lyrics_side)

# ---------- Concrete normal (shared) ----------
_, hm = concrete(1024, 512, 31)
Image.fromarray(normal_from_height(hm, 6.0)).convert("RGB").save(OUT + "concrete_wall_normal.jpg", quality=88)

# ---------- Oil drum wrap (graffiti on dark steel) ----------
dw, dh = 1024, 512
rgb, hm2 = concrete(dw, dh, 41, tone=0.14)
img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)).convert("RGBA")
lay = tag_layer((dw, dh), [("ROOMi", "ariblk.ttf", 200, WHITE, (0.05, 0.14), -4, "throw"), ("PLAY", "BRADHITC.TTF", 160, PINK, (0.55, 0.40), 5, "marker")], 5)
doodles(lay, 6, 6, dw, dh)
Image.alpha_composite(img, lay).convert("RGB").save(OUT + "drum_color.jpg", quality=90)

# ---------- Dark painted metal (ceiling ducts, pipes, frames) ----------
mw = 512
nz = fbm((mw, mw), 51, beta=2.2)
fine = fbm((mw, mw), 52, beta=1.1)
m = 0.2 + 0.08 * (nz - 0.5) + 0.05 * (fine - 0.5)
Image.fromarray((np.stack([m, m, m * 1.05], -1) * 255).clip(0, 255).astype(np.uint8)).save(OUT + "dark_metal_color.jpg", quality=88)
print("murals ok")
