"""Procedural PBR maps for the 3D shop (colour, roughness, normal). Run: python scripts/gen_textures.py"""
import numpy as np
from PIL import Image

N = 1024
OUT = "public/shop3d/"


def fbm(shape, seed, beta=2.0, aniso=(1.0, 1.0), octave_mix=None):
    """Tileable noise from a random-phase spectrum. aniso stretches features along an axis (lower = longer)."""
    rng = np.random.default_rng(seed)
    h, w = shape
    fy = np.fft.fftfreq(h)[:, None] * aniso[0]
    fx = np.fft.fftfreq(w)[None, :] * aniso[1]
    f = np.sqrt(fx**2 + fy**2)
    f[0, 0] = 1
    amp = 1 / f**(beta / 2)
    amp[0, 0] = 0
    phase = np.exp(2j * np.pi * rng.random(shape))
    n = np.fft.ifft2(amp * phase).real
    n = (n - n.min()) / (n.max() - n.min())
    return n


def norm(a):
    return (a - a.min()) / (a.max() - a.min() + 1e-9)


def normal_from_height(hm, strength):
    gx = np.roll(hm, -1, 1) - np.roll(hm, 1, 1)
    gy = np.roll(hm, -1, 0) - np.roll(hm, 1, 0)
    nx, ny, nz = -gx * strength, gy * strength, np.ones_like(hm)
    ln = np.sqrt(nx**2 + ny**2 + nz**2)
    n = np.stack([nx / ln, ny / ln, nz / ln], -1)
    return ((n * 0.5 + 0.5) * 255).astype(np.uint8)


def save(arr, name, q=90):
    Image.fromarray(arr).save(OUT + name, quality=q) if name.endswith(".jpg") else Image.fromarray(arr).save(OUT + name)


# ---------- Floor: worn oak planks, long grain, scuffs, brand-colour paint ----------
planks = 12
pw = N // planks
rng = np.random.default_rng(4)
yy, xx = np.mgrid[0:N, 0:N]
plank_id = (xx // pw).clip(0, planks - 1)
tone = rng.random(planks)
shift = rng.integers(0, N, planks)
grain = fbm((N, N), 1, beta=2.4, aniso=(0.05, 1.0))          # long streaks
fine = fbm((N, N), 2, beta=1.6, aniso=(0.12, 1.0))
blotch = fbm((N, N), 3, beta=3.2)
wear = fbm((N, N), 5, beta=2.8)

# butt joints: each plank is cut at 1-2 places, with its own phase so rows do not line up
v = (yy + shift[plank_id]) % N
joint_pos = rng.integers(200, 800, (planks, 2))
joint = np.zeros((N, N))
for i in range(planks):
    for j in range(2):
        d = np.abs(v - joint_pos[i, j])
        joint = np.maximum(joint, np.where(plank_id == i, np.clip(1 - d / 3.0, 0, 1), 0))
edge = np.clip(1 - np.abs((xx % pw) - 1) / 2.5, 0, 1) + np.clip(1 - np.abs((xx % pw) - (pw - 2)) / 2.5, 0, 1)
gap = np.clip(edge + joint, 0, 1)

base_h = 0.075 + 0.04 * tone[plank_id]                       # oak hue/lightness per plank
light = 0.40 + 0.14 * tone[plank_id] + 0.34 * (grain - 0.5) + 0.12 * (fine - 0.5) + 0.2 * (blotch - 0.5)
light *= 1 - 0.28 * np.clip(wear - 0.55, 0, 1) * 2
col = np.zeros((N, N, 3))
import colorsys
for c, fn in enumerate([0, 1, 2]):
    pass
hue = base_h
sat = 0.46 - 0.12 * np.clip(wear - 0.5, 0, 1)
r = light * (0.9 + 0.4 * sat)
g = light * (0.68 + 0.2 * sat)
b = light * (0.5 + 0.1 * sat)
col = np.stack([r, g, b], -1)
col *= (1 - 0.7 * gap)[..., None]
# paint splatters and a few long scuffs
paint = [(0.97, 0.11, 0.39), (0.76, 0.31, 0.83), (1.0, 0.72, 0.57), (0.94, 0.94, 0.94)]
for _ in range(7):
    cx, cy = rng.integers(0, N, 2)
    pc = np.array(paint[rng.integers(0, 4)])
    big = rng.integers(10, 38)
    for k in range(rng.integers(8, 26)):
        ox, oy = rng.normal(0, 70, 2)
        rad = max(1.5, rng.exponential(big / 3 if k < 3 else 5))
        d2 = ((xx - cx - ox) ** 2 + (yy - cy - oy) ** 2) / rad**2
        m = np.clip(1.6 - d2, 0, 1) ** 2 * (0.8 if k else 0.9)
        col = col * (1 - m[..., None]) + pc * m[..., None] * (0.75 + 0.25 * fine[..., None])
rgb = (np.clip(col, 0, 1) ** 0.95 * 255).astype(np.uint8)
save(rgb, "floor_color.jpg")

height = 0.5 * grain + 0.3 * fine + 0.2 * wear - 0.9 * gap
save(normal_from_height(height, 7.0), "floor_normal.png")
rough = np.clip(0.56 + 0.32 * (wear - 0.5) + 0.2 * gap + 0.12 * (fine - 0.5), 0.25, 0.95)
save((rough * 255).astype(np.uint8), "floor_rough.jpg")

# ---------- Wall: painted corrugated steel, scratches, dirt, rust streaks near the bottom ----------
ribs = 16
rib_w = N / ribs
wave = np.sin((xx / rib_w) * 2 * np.pi)
trap = np.clip(wave * 2.2, -1, 1)                           # trapezoid profile like a real container panel
dirt = fbm((N, N), 11, beta=2.6)
streak = fbm((N, N), 12, beta=2.2, aniso=(0.06, 1.0))       # vertical drips
scratch = np.zeros((N, N))
for _ in range(180):
    x0 = rng.integers(0, N)
    y0 = rng.integers(0, N)
    ln = rng.integers(20, 170)
    ang = rng.normal(0, 0.45) + np.pi / 2
    for t in range(ln):
        px = int(x0 + np.cos(ang) * t) % N
        py = int(y0 + np.sin(ang) * t) % N
        scratch[py, px] = max(scratch[py, px], rng.random() * 0.8)
paintc = np.array([0.90, 0.88, 0.86])
base = 0.80 + 0.03 * trap + 0.22 * (dirt - 0.5) + 0.2 * (streak - 0.5)
base *= 1 - 0.28 * np.clip(streak - 0.55, 0, 1) * 2.4
col = np.stack([base * paintc[0], base * paintc[1], base * paintc[2]], -1)
rust = np.clip(streak - 0.66, 0, 1) * np.clip((yy / N) - 0.55, 0, 1) * 2.4
col = col * (1 - rust[..., None]) + np.array([0.52, 0.27, 0.15]) * rust[..., None] * 0.9
col = col * (1 - 0.05 * np.clip(1 - np.abs(((xx % rib_w) / rib_w) - 0.5) * 2 - 0.88, 0, 1)[..., None])
col = np.where((scratch > 0.1)[..., None], col * 0.55 + 0.35 * scratch[..., None], col)
save((np.clip(col, 0, 1) ** 0.95 * 255).astype(np.uint8), "wall_color.jpg")

h2 = 0.75 * trap + 0.25 * (dirt - 0.5) - 0.3 * scratch
save(normal_from_height(h2, 4.0), "wall_normal.png")
rough2 = np.clip(0.5 + 0.35 * (streak - 0.5) + 0.3 * (dirt - 0.5) + 0.3 * scratch, 0.25, 0.95)
save((rough2 * 255).astype(np.uint8), "wall_rough.jpg")

# ---------- Concrete blocks, backdrop and misc ----------
conc = 0.55 + 0.28 * (fbm((N, N), 21, beta=2.2) - 0.5) + 0.12 * (fbm((N, N), 22, beta=1.4) - 0.5)
pores = (fbm((N, N), 23, beta=1.2) > 0.82) * 0.25
conc = np.clip(conc - pores, 0, 1)
save((np.stack([conc * 0.96, conc * 0.95, conc * 0.93], -1) * 255).astype(np.uint8), "concrete_color.jpg")
save(normal_from_height(conc, 5.0), "concrete_normal.png")
print("textures ok")


# ---------- Carpet tiles: 4 x 4 modular tiles per map, quarter-turned fibre, brand-colour accents ----------
T = 4
ts = N // T
rng2 = np.random.default_rng(31)
fib = fbm((N, N), 41, beta=0.6)                      # near-white noise: loose fibres
fib2 = fbm((N, N), 42, beta=1.1)
ccol = np.zeros((N, N, 3))
hmap = np.zeros((N, N))
for ty in range(T):
    for tx in range(T):
        y0, x0 = ty * ts, tx * ts
        pick = rng2.random()
        if pick < 0.03:
            base = np.array([0.30, 0.09, 0.19])      # a rare muted pink tile
        elif pick < 0.10:
            base = np.array([0.20, 0.14, 0.23])      # a rare muted plum tile
        else:
            base = np.array([0.17, 0.165, 0.185]) * (0.9 + 0.2 * rng2.random())
        patch = fib[y0:y0 + ts, x0:x0 + ts]
        patch2 = fib2[y0:y0 + ts, x0:x0 + ts]
        # quarter-turn ribbed weave per tile
        turn = rng2.integers(0, 2)
        yy2, xx2 = np.mgrid[0:ts, 0:ts]
        ribs2 = 0.5 + 0.5 * np.sin((xx2 if turn else yy2) / 2.2)
        shade = 0.82 + 0.34 * (patch - 0.5) + 0.2 * (patch2 - 0.5) + 0.08 * ribs2
        ccol[y0:y0 + ts, x0:x0 + ts] = base * shade[..., None]
        hmap[y0:y0 + ts, x0:x0 + ts] = 0.6 * patch + 0.25 * patch2 + 0.15 * ribs2
yy, xx = np.mgrid[0:N, 0:N]
seam = ((xx % ts) < 2) | ((yy % ts) < 2)
ccol[seam] *= 0.45
hmap[seam] -= 0.6
save((np.clip(ccol, 0, 1) ** 0.9 * 255).astype(np.uint8), "carpet_color.jpg")
save(normal_from_height(hmap, 5.0), "carpet_normal.png")

# ---------- Fabric weave normal (sofa, rug) ----------
M = 512
y3, x3 = np.mgrid[0:M, 0:M]
weave = np.sin(x3 / 2.4) * np.sin(y3 / 2.4) * 0.5 + 0.5
fh = 0.7 * weave + 0.3 * fbm((M, M), 51, beta=1.4)
save(normal_from_height(fh, 3.0), "fabric_normal.png")
print("carpet + fabric ok")
