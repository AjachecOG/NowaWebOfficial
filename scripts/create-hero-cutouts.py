from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
HERO_DIR = ROOT / "public" / "assets" / "nowaweb" / "hero"

ASSETS = {
    "monitor.png": "monitor-cutout.png",
    "notebook.png": "notebook-cutout.png",
    "cup.png": "cup-cutout.png",
    "logo-card.png": "logo-card-cutout.png",
    "poster.png": "poster-cutout.png",
    "poland-note.png": "poland-note-cutout.png",
    "tool-rail.png": "tool-rail-cutout.png",
}

MONITOR_SCREEN_ASSETS = (
    ("monitor-screen-1.source.png", "monitor-screen-1.png"),
    ("monitor-screen-2.source.png", "monitor-screen-2.png"),
    ("monitor-screen-3.source.png", "monitor-screen-3.png"),
)


def border_color(rgb: np.ndarray) -> np.ndarray:
    border = np.concatenate(
        [
            rgb[:12, :, :].reshape(-1, 3),
            rgb[-12:, :, :].reshape(-1, 3),
            rgb[:, :12, :].reshape(-1, 3),
            rgb[:, -12:, :].reshape(-1, 3),
        ],
        axis=0,
    )
    return np.median(border, axis=0)


def border_connected_background(likely_bg: np.ndarray) -> np.ndarray:
    height, width = likely_bg.shape
    visited = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(y: int, x: int) -> None:
        if likely_bg[y, x] and not visited[y, x]:
            visited[y, x] = True
            queue.append((y, x))

    for x in range(width):
        enqueue(0, x)
        enqueue(height - 1, x)
    for y in range(height):
        enqueue(y, 0)
        enqueue(y, width - 1)

    while queue:
        y, x = queue.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < height and 0 <= nx < width:
                enqueue(ny, nx)

    return visited


def remove_light_background(source: Path, output: Path) -> None:
    image = Image.open(source).convert("RGBA")
    rgba = np.asarray(image).astype(np.float32)
    rgb = rgba[:, :, :3]
    source_alpha = rgba[:, :, 3]

    bg = border_color(rgb)
    dist = np.linalg.norm(rgb - bg, axis=2)
    brightness = rgb.max(axis=2)
    darkness = rgb.min(axis=2)
    saturation = rgb.max(axis=2) - rgb.min(axis=2)

    likely_bg = (
        (dist < 48)
        | ((brightness > 230) & (saturation < 55))
        | ((brightness > 188) & (saturation < 30))
        | ((brightness > 205) & (darkness > 178) & (dist < 92))
    )

    connected_bg = border_connected_background(likely_bg)
    matte = Image.fromarray((connected_bg.astype(np.uint8) * 255), mode="L")
    matte = matte.filter(ImageFilter.GaussianBlur(radius=1.15))
    matte_np = np.asarray(matte).astype(np.float32) / 255

    alpha = np.clip(source_alpha * (1 - matte_np), 0, 255)

    # Pull pale edge pixels away from the removed paper color to reduce halos.
    alpha_norm = np.clip(alpha / 255, 0.05, 1)[:, :, None]
    corrected_rgb = np.clip((rgb - bg * (1 - alpha_norm)) / alpha_norm, 0, 255)
    edge = (alpha > 0) & (alpha < 250)
    rgb[edge] = corrected_rgb[edge]

    out = np.dstack([rgb, alpha]).astype(np.uint8)
    Image.fromarray(out, mode="RGBA").save(output)


def monitor_alpha_mask(reference: Path, target_size: tuple[int, int]) -> np.ndarray:
    image = Image.open(reference).convert("RGBA")
    alpha = np.asarray(image)[:, :, 3].astype(np.float32) / 255
    mask = Image.fromarray((alpha * 255).astype(np.uint8), mode="L")
    mask = mask.resize(target_size, Image.Resampling.LANCZOS)
    return np.asarray(mask).astype(np.float32) / 255


def patch_monitor_hardware_from_cutout(
    rgb: np.ndarray, alpha: np.ndarray, cutout: np.ndarray
) -> int:
    height, width = alpha.shape
    bezel_start_y = int(height * 0.8)
    stand_start_y = int(height * 0.865)
    patched = 0

    for y in range(bezel_start_y, height):
        for x in range(width):
            cutout_alpha = cutout[y, x, 3]
            if cutout_alpha < 20:
                alpha[y, x] = 0
                continue

            cutout_pixel = cutout[y, x, :3]
            brightness = cutout_pixel.max()
            saturation = brightness - cutout_pixel.min()
            is_dark_hardware = brightness < 92 and saturation < 36

            if y >= stand_start_y or is_dark_hardware:
                rgb[y, x] = cutout_pixel
                alpha[y, x] = cutout_alpha
                patched += 1

    return patched


def remove_monitor_screen_background(source: Path, output: Path, reference_cutout: Path) -> None:
    image = Image.open(source).convert("RGBA")
    rgba = np.asarray(image).astype(np.float32)
    rgb = rgba[:, :, :3]
    source_alpha = rgba[:, :, 3]

    bg = border_color(rgb)
    dist = np.linalg.norm(rgb - bg, axis=2)
    brightness = rgb.max(axis=2)
    darkness = rgb.min(axis=2)
    saturation = rgb.max(axis=2) - rgb.min(axis=2)

    likely_bg = (
        (dist < 56)
        | ((brightness > 228) & (saturation < 60))
        | ((brightness > 186) & (saturation < 34))
        | ((brightness > 200) & (darkness > 172) & (dist < 98))
    )

    connected_bg = border_connected_background(likely_bg)
    matte = Image.fromarray((connected_bg.astype(np.uint8) * 255), mode="L")
    matte = matte.filter(ImageFilter.GaussianBlur(radius=1.25))
    matte_np = np.asarray(matte).astype(np.float32) / 255

    cutout_mask = monitor_alpha_mask(reference_cutout, image.size)
    combined_matte = np.clip(np.maximum(matte_np, 1 - cutout_mask), 0, 1)

    alpha = np.clip(source_alpha * (1 - combined_matte), 0, 255)
    alpha = np.minimum(alpha, cutout_mask * 255)

    alpha_norm = np.clip(alpha / 255, 0.05, 1)[:, :, None]
    corrected_rgb = np.clip((rgb - bg * (1 - alpha_norm)) / alpha_norm, 0, 255)
    edge = (alpha > 0) & (alpha < 250)
    rgb[edge] = corrected_rgb[edge]

    cutout = np.asarray(Image.open(reference_cutout).convert("RGBA").resize(image.size))
    patch_monitor_hardware_from_cutout(rgb, alpha, cutout)

    out = np.dstack([rgb, alpha]).astype(np.uint8)
    Image.fromarray(out, mode="RGBA").save(output)


def main() -> None:
    for source_name, output_name in ASSETS.items():
        source = HERO_DIR / source_name
        output = HERO_DIR / output_name
        remove_light_background(source, output)
        print(f"{source.name} -> {output.name}")

    reference_cutout = HERO_DIR / "monitor-cutout.png"
    for source_name, output_name in MONITOR_SCREEN_ASSETS:
        source = HERO_DIR / source_name
        output = HERO_DIR / output_name
        if not source.exists():
            source = output
        remove_monitor_screen_background(source, output, reference_cutout)
        print(f"{source.name} -> {output.name} (monitor screen cutout)")


if __name__ == "__main__":
    main()
