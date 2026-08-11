import numpy as np
from PIL import Image

ASH = np.array([0x16, 0x14, 0x0F], dtype=np.float64)
CORE = np.array([0xFD, 0xE6, 0xC8], dtype=np.float64)   # warm near-white core
FLAME = np.array([0xE8, 0x70, 0x3A], dtype=np.float64)  # brand accent
EDGE = np.array([0x7A, 0x2A, 0x12], dtype=np.float64)   # deep ember red, fades to ash


def make_icon(size: int, safe_zone: float, path: str) -> None:
    """safe_zone: fraction of the canvas radius the glow is confined to.
    Use ~0.42 for regular icons and ~0.34 for maskable (OS may crop to a
    circle/squircle, so keep content inside the guaranteed-visible area)."""
    y, x = np.mgrid[0:size, 0:size].astype(np.float64)
    cx = cy = size / 2
    r = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / (size * safe_zone)

    # Three-stop radial gradient: core -> flame -> edge -> ash, by distance.
    t1 = np.clip(r / 0.55, 0, 1)
    stop1 = CORE[None, None, :] * (1 - t1[..., None]) + FLAME[None, None, :] * t1[..., None]

    t2 = np.clip((r - 0.55) / 0.55, 0, 1)
    stop2 = FLAME[None, None, :] * (1 - t2[..., None]) + EDGE[None, None, :] * t2[..., None]

    t3 = np.clip((r - 1.1) / 0.9, 0, 1)
    stop3 = EDGE[None, None, :] * (1 - t3[..., None]) + ASH[None, None, :] * t3[..., None]

    rgb = np.where(r[..., None] < 0.55, stop1, np.where(r[..., None] < 1.1, stop2, stop3))
    rgb = np.clip(rgb, 0, 255).astype(np.uint8)

    img = Image.fromarray(rgb, mode="RGB")
    img.save(path)


make_icon(192, 0.26, "public/icons/icon-192.png")
make_icon(512, 0.26, "public/icons/icon-512.png")
make_icon(512, 0.19, "public/icons/icon-maskable-512.png")  # tighter safe zone
print("done")
