from pathlib import Path
import struct
import zlib


ROOT = Path(__file__).resolve().parent.parent / 'public'
GREEN = (0x19, 0x87, 0x54, 255)
WHITE = (255, 255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)
VIEWBOX = 64.0
BG_RECT = (4.0, 4.0, 56.0, 56.0, 16.0)

OUTER_SHIELD = [
    (32.0, 14.0),
    (46.0, 20.0),
    (46.0, 31.5),
    (44.8, 36.5),
    (42.5, 41.0),
    (39.3, 44.9),
    (35.9, 47.7),
    (32.0, 49.3),
    (28.1, 47.7),
    (24.7, 44.9),
    (21.5, 41.0),
    (19.2, 36.5),
    (18.0, 31.5),
    (18.0, 20.0),
]

INNER_SHIELD = [
    (32.0, 20.2),
    (40.6, 24.0),
    (40.6, 31.2),
    (39.8, 35.1),
    (38.1, 38.6),
    (35.7, 41.5),
    (33.0, 43.5),
    (32.0, 44.0),
    (31.0, 43.5),
    (28.3, 41.5),
    (25.9, 38.6),
    (24.2, 35.1),
    (23.4, 31.2),
    (23.4, 24.0),
]

CHECK_CIRCLES = [
    (25.7, 33.0, 2.3),
    (28.9, 29.8, 2.3),
    (35.6, 23.1, 2.3),
    (38.8, 26.3, 2.3),
]

CHECK_CAPSULES = [
    ((25.7, 33.0), (29.4, 36.6), 2.3),
    ((29.4, 36.6), (38.8, 27.2), 2.3),
]


def rounded_rect_contains(x: float, y: float, rect: tuple[float, float, float, float, float]) -> bool:
    rx, ry, width, height, radius = rect
    cx = min(max(x, rx + radius), rx + width - radius)
    cy = min(max(y, ry + radius), ry + height - radius)
    dx = x - cx
    dy = y - cy
    return dx * dx + dy * dy <= radius * radius


def polygon_contains(x: float, y: float, points: list[tuple[float, float]]) -> bool:
    inside = False
    j = len(points) - 1
    for i, (xi, yi) in enumerate(points):
        xj, yj = points[j]
        if (yi > y) != (yj > y):
            edge_x = (xj - xi) * (y - yi) / (yj - yi) + xi
            if x < edge_x:
                inside = not inside
        j = i
    return inside


def circle_contains(x: float, y: float, circle: tuple[float, float, float]) -> bool:
    cx, cy, radius = circle
    dx = x - cx
    dy = y - cy
    return dx * dx + dy * dy <= radius * radius


def capsule_contains(x: float, y: float, capsule: tuple[tuple[float, float], tuple[float, float], float]) -> bool:
    (ax, ay), (bx, by), radius = capsule
    abx = bx - ax
    aby = by - ay
    apx = x - ax
    apy = y - ay
    ab_len_sq = abx * abx + aby * aby
    if ab_len_sq == 0:
        t = 0.0
    else:
        t = max(0.0, min(1.0, (apx * abx + apy * aby) / ab_len_sq))

    cx = ax + abx * t
    cy = ay + aby * t
    dx = x - cx
    dy = y - cy
    return dx * dx + dy * dy <= radius * radius


def check_contains(x: float, y: float) -> bool:
    return any(circle_contains(x, y, circle) for circle in CHECK_CIRCLES) or any(
        capsule_contains(x, y, capsule) for capsule in CHECK_CAPSULES
    )


def sample_pixel(x: float, y: float) -> tuple[int, int, int, int]:
    if not rounded_rect_contains(x, y, BG_RECT):
        return TRANSPARENT

    if polygon_contains(x, y, OUTER_SHIELD):
        if polygon_contains(x, y, INNER_SHIELD):
            return WHITE if check_contains(x, y) else GREEN
        return WHITE

    return GREEN


def render_rgba(size: int, supersample: int) -> bytes:
    scale = VIEWBOX / size
    stride = size * 4
    pixels = bytearray(size * stride)
    total_samples = supersample * supersample

    for py in range(size):
        for px in range(size):
            r = g = b = a = 0.0
            for sy in range(supersample):
                for sx in range(supersample):
                    x = (px + (sx + 0.5) / supersample) * scale
                    y = (py + (sy + 0.5) / supersample) * scale
                    sr, sg, sb, sa = sample_pixel(x, y)
                    r += sr
                    g += sg
                    b += sb
                    a += sa

            offset = py * stride + px * 4
            pixels[offset] = round(r / total_samples)
            pixels[offset + 1] = round(g / total_samples)
            pixels[offset + 2] = round(b / total_samples)
            pixels[offset + 3] = round(a / total_samples)

    return bytes(pixels)


def build_png(size: int, rgba: bytes) -> bytes:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack('>I', len(data))
            + tag
            + data
            + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    stride = size * 4
    for y in range(size):
        raw.append(0)
        start = y * stride
        raw.extend(rgba[start : start + stride])

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    output = bytearray(b'\x89PNG\r\n\x1a\n')
    output.extend(chunk(b'IHDR', ihdr))
    output.extend(chunk(b'IDAT', zlib.compress(bytes(raw), 9)))
    output.extend(chunk(b'IEND', b''))
    return bytes(output)


def write_png(name: str, size: int, supersample: int) -> bytes:
    png = build_png(size, render_rgba(size, supersample))
    (ROOT / name).write_bytes(png)
    return png


def write_ico(images: list[tuple[int, bytes]]) -> None:
    header = struct.pack('<HHH', 0, 1, len(images))
    directory = bytearray()
    payload = bytearray()
    offset = 6 + 16 * len(images)

    for size, data in images:
        width = 0 if size >= 256 else size
        height = 0 if size >= 256 else size
        directory.extend(
            struct.pack('<BBBBHHII', width, height, 0, 0, 1, 32, len(data), offset)
        )
        payload.extend(data)
        offset += len(data)

    (ROOT / 'favicon.ico').write_bytes(header + directory + payload)


def main() -> None:
    ROOT.mkdir(exist_ok=True)

    for name, size in [
        ('apple-touch-icon.png', 180),
        ('icon-192.png', 192),
        ('icon-512.png', 512),
    ]:
        write_png(name, size, 4)

    ico_images: list[tuple[int, bytes]] = []
    for size in (16, 32, 48):
        ico_images.append((size, write_png(f'favicon-{size}x{size}.png', size, 8)))

    write_ico(ico_images)


if __name__ == '__main__':
    main()
