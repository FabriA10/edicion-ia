"""Detecta los tramos con notificaciones (pastilla oscura arriba) y mide cuánto se mueve la página por segundo."""
import subprocess, numpy as np

SRC = r"pierina-glow\trabajo\pierina_cfr30.mp4"
W, H = 576, 1280
cmd = ["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo", "-pix_fmt", "gray", "-"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
size = W * H
i = 0
dark, motion = [], []
prev = None
while True:
    buf = p.stdout.read(size)
    if len(buf) < size:
        break
    f = np.frombuffer(buf, np.uint8).reshape(H, W)
    band = f[78:108, 120:460]
    dark.append(band.mean())
    body = f[200:1100:4, ::4].astype(np.int16)
    motion.append(0 if prev is None else np.abs(body - prev).mean())
    prev = body
    i += 1

dark = np.array(dark); motion = np.array(motion)
fps = 30
notif = dark < 90
segs, start = [], None
for k, v in enumerate(notif):
    if v and start is None: start = k
    if not v and start is not None:
        segs.append((start, k)); start = None
if start is not None: segs.append((start, len(notif)))
print("Tramos con notificación (s):")
for a, b in segs:
    if b - a > 3:
        print(f"  {a/fps:6.2f} - {b/fps:6.2f}")
print("\nMovimiento por segundo (0 = quieto):")
for s in range(0, len(motion) // fps):
    m = motion[s*fps:(s+1)*fps].mean()
    print(f"{s:3d}s {m:5.1f} {'#' * int(m)}")
