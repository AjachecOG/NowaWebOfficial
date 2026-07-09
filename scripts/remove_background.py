from __future__ import annotations

from collections import deque
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageFilter


def estimate_background(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    border = np.concatenate(
        [
            rgb[: max(2, h // 80), :, :].reshape(-1, 3),
            rgb[-max(2, h // 80) :, :, :].reshape(-1, 3),
            rgb[:, : max(2, w // 80), :].reshape(-1, 3),
            rgb[:, -max(2, w // 80) :, :].reshape(-1, 3),
        ],
        axis=0,
    )
    return np.median(border.astype(np.float32), axis=0)


def connected_background_mask(rgb: np.ndarray, bg: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    arr = rgb.astype(np.int16)
    bg = bg.astype(np.int16)

    max_chan = arr.max(axis=2)
    min_chan = arr.min(axis=2)
    saturation = max_chan - min_chan
    brightness = arr.mean(axis=2)
    distance = np.linalg.norm(arr - bg, axis=2)

    # Generous enough to cross the off-white studio background and soft vignette,
    # but constrained to connected pixels so bright content inside the monitor stays intact.
    background_like = ((brightness > 214) & (saturation < 34)) | (distance < 44)

    seen = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def push(y: int, x: int) -> None:
        if 0 <= y < h and 0 <= x < w and (not seen[y, x]) and background_like[y, x]:
            seen[y, x] = True
            q.append((y, x))

    for x in range(w):
        push(0, x)
        push(h - 1, x)
    for y in range(h):
        push(y, 0)
        push(y, w - 1)

    while q:
        y, x = q.popleft()
        push(y - 1, x)
        push(y + 1, x)
        push(y, x - 1)
        push(y, x + 1)

    return seen


def make_cutout(input_path: Path, output_path: Path) -> None:
    image = Image.open(input_path).convert("RGBA")
    rgb = np.asarray(image.convert("RGB"))
    bg = estimate_background(rgb)
    bg_mask = connected_background_mask(rgb, bg)

    alpha = np.full(bg_mask.shape, 255, dtype=np.uint8)
    alpha[bg_mask] = 0

    # Feather only the transition: clean transparent background, smooth object edges.
    alpha_img = Image.fromarray(alpha, "L")
    soft = alpha_img.filter(ImageFilter.GaussianBlur(radius=1.2))
    alpha_img = Image.composite(soft, alpha_img, alpha_img.filter(ImageFilter.FIND_EDGES).point(lambda p: 255 if p else 0))

    result = image.copy()
    result.putalpha(alpha_img)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.save(output_path)


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: remove_background.py INPUT.png OUTPUT.png", file=sys.stderr)
        return 2
    make_cutout(Path(sys.argv[1]), Path(sys.argv[2]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
