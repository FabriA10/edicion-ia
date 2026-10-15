# Los sonidos de la vuelta 3 ("dopamina") + el audio de los posts -> trabajo/extras-v3.wav
# (y public/extras-v3.wav para el Studio). Se suma DESPUÉS del limitador de la voz.
#
#   zooms (plan.json "escala"): whoosh / whoosh largo / slide / tic / riser
#   posts y b-rolls: whoosh + pop al entrar, whoosh al salir
#   subtítulos animados: whoosh cuando la letra se posa, golpecito por palabra
#   motion graphics: golpe de entrada, zumbido de cada tubo que se prende, pop de
#   cada ícono, whoosh en cada viaje de cámara, estrellas que suben de tono, el
#   contador que tiquea, el ≠, la flecha, el reloj que gira, whoosh de salida
#   el chasquido: la subida hacia el golpe y el golpe grave
#
# Todo sintetizado y pasado por una reverb (respuesta al impulso sintética,
# 1,4 s): lo pidió él, "utilizá mucho reverb".
import json, re, subprocess, wave
import numpy as np
from scipy import signal

R = "F:/edicion con ia/proyectos/09-reaccion-a-posts/"
SR = 48000
rng = np.random.default_rng(3009)
db = lambda x: 10 ** (x / 20)
cuadro = lambda t: int(np.floor(t * 30 + 0.5))
T = open(R + "src/v3/tiempos.ts", encoding="utf-8").read()
TOTAL = int(re.search(r"TOTAL = (\d+)", T).group(1)); SNAP = int(re.search(r"SNAP = (\d+)", T).group(1))
POSTS = json.loads(re.search(r"POSTS = (\[.*?\]);", T).group(1))
PL = json.load(open(R + "src/v3/plan.json", encoding="utf-8"))
CUES = json.loads(re.search(r"CUES: Cue\[\] = (\[[\s\S]*\]);", open(R + "src/v3/subtitulos.ts", encoding="utf-8").read()).group(1))
N = int(TOTAL / 30 * SR)
seco = np.zeros(N + SR * 3); humedo = np.zeros(N + SR * 3)

def pone(x, t, rev=0.45, destino=None):
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    seco[i:i + len(x)] += x[:len(seco) - i]
    humedo[i:i + len(x)] += rev * x[:len(humedo) - i]

def barrido(dur, f0, f1, pico, grave=0.0, cae=0.72):
    n = int(dur * SR); ruido = rng.standard_normal(n); sal = np.zeros(n); zi = None
    for k in range(0, n, 256):
        fc = f0 * (f1 / f0) ** (k / n)
        sos = signal.butter(2, [fc / 1.6, min(fc * 1.6, SR / 2 - 100)], btype="bandpass", fs=SR, output="sos")
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        sal[k:k + 256], zi = signal.sosfilt(sos, ruido[k:k + 256], zi=zi)
    t = np.arange(n) / SR
    env = np.where(t < dur * cae, (t / (dur * cae)) ** 2.2, np.exp(-(t - dur * cae) / 0.05))
    sal *= env
    if grave: sal += grave * np.sin(2 * np.pi * np.cumsum(55 + 45 * t / dur) / SR) * env
    return sal / np.abs(sal).max() * db(pico)

def pop(f0=1100, pico=-22, dur=0.09):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (0.5 + 0.5 * np.exp(-t / 0.045))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.028) + rng.standard_normal(n) * np.exp(-t / 0.002) * 0.35
    return x / np.abs(x).max() * db(pico)

def burbuja(pico=-21):
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = 380 + 560 * (1 - np.exp(-t / 0.018))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035) * np.minimum(1, t / 0.002)
    return x / np.abs(x).max() * db(pico)

def tic(pico=-27, fc=3200):
    n = int(0.03 * SR); t = np.arange(n) / SR
    x = signal.sosfilt(signal.butter(2, [fc / 1.8, fc * 1.8], "bandpass", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / 0.006)
    x += 0.5 * np.sin(2 * np.pi * fc * 0.5 * t) * np.exp(-t / 0.01)
    return x / np.abs(x).max() * db(pico)

def golpe(pico=-14, dur=0.55):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 42 + 80 * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.17) * np.minimum(1, t / 0.003)
    x += 0.3 * signal.sosfilt(signal.butter(2, 900, "lowpass", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / 0.03)
    return x / np.abs(x).max() * db(pico)

def zumbido(pico=-24):
    """Un tubo de neón que se prende: chispazo + zumbido corto que parpadea."""
    n = int(0.28 * SR); t = np.arange(n) / SR
    zum = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.3 + np.sin(2 * np.pi * 240 * t) * 0.5
    parpadeo = np.interp(t, [0, 0.03, 0.05, 0.08, 0.1, 0.28], [1, 0.2, 1, 0.4, 1, 0])
    chispa = signal.sosfilt(signal.butter(2, [2500, 9000], "bandpass", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / 0.01)
    x = zum * parpadeo * 0.5 + chispa
    return x / np.abs(x).max() * db(pico)

def slide(dur, sube=True, pico=-24):
    n = int(dur * SR); t = np.arange(n) / SR
    f = (300 + 900 * (t / dur) ** 1.5) if sube else (1200 - 900 * (t / dur) ** 0.7)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 1.5
    x += 0.5 * barrido(dur, 400 if sube else 3000, 3000 if sube else 400, 0)[:n]
    return x / np.abs(x).max() * db(pico)

def llega(x, t):
    """Pone x para que termine en t (whoosh que se posa)."""
    pone(x, t - len(x) / SR)

# ── zooms ────────────────────────────────────────────────────────────────────
for e in PL["escala"]:
    t = e["t"]; s = e["sonido"]; d = e["cuadros"] / 30
    if s == "whoosh": pone(barrido(0.32, 3800, 500, -19), t - 0.06)
    elif s == "whoosh-largo": pone(barrido(1.1, 5000, 300, -20, cae=0.2), t)
    elif s == "slide": pone(slide(max(0.35, d), True, -25), t)
    elif s == "tic": pone(tic(-29, 2600), t, rev=0.3)
    elif s == "riser": llega(barrido(SNAP / 30 - t, 300, 7000, -21, cae=0.97), SNAP / 30)

# ── posts y b-rolls ──────────────────────────────────────────────────────────
tarjetas = [(p["inicio"] / 30, (p["inicio"] + p["dur"]) / 30, 0) for p in POSTS]
tarjetas += [(b["desde"], b["hasta"], -4) for b in PL["broll"]]
for a, b, g in tarjetas:
    llega(barrido(0.4, 600, 5200, -17 + g, grave=0.4), a + 0.2)
    pone(burbuja(-20 + g), a + 0.18)
    pone(barrido(0.3, 4500, 500, -22 + g), b - 0.2)

# ── subtítulos animados ──────────────────────────────────────────────────────
for c in CUES:
    if not c.get("animacion"): continue
    if c["animacion"] == "smooth-line-up":
        llega(barrido(0.34, 900, 5000, -21), c["desde"] + 0.2)
        pone(pop(1300, -26), c["desde"] + 0.2)
    else:
        llega(barrido(0.3, 900, 4500, -23), c["palabras"][0] + 0.15)
        for k, w in enumerate(c["palabras"]):
            pone(pop(900 + 120 * k, -25), w + 0.05)

# ── motion graphics (cuadros locales, los mismos de Resena.tsx y Viralidad.tsx) ──
def mg(desde, largo, zumbidos, pops, viajes, chicas, extra):
    t0 = cuadro(desde) / 30
    pone(golpe(-15), t0); pone(barrido(0.5, 6000, 400, -18, cae=0.15), t0)
    for f in zumbidos: pone(zumbido(-22), t0 + f / 30)
    for f, tono in pops: pone(pop(tono, -21), t0 + f / 30)
    for llega_, dura in viajes: llega(barrido(dura / 30 + 0.1, 500, 5500, -18, grave=0.3), t0 + llega_ / 30)
    for f in chicas: pone(tic(-30, 3600), t0 + f / 30, rev=0.25)
    for fn in extra: fn(t0)
    pone(barrido(0.35, 4000, 400, -20), t0 + largo / 30 - 0.12)

def estrellas(t0):
    for k, f in enumerate([100, 110, 120, 134, 150]):
        pone(pop(700 * 2 ** (k / 5), -20, 0.14), t0 + f / 30)
def flecha(t0): pone(slide(0.62, True, -21), t0 + 214 / 30)
def contador(t0):
    for k in range(40):
        p = k / 39; pone(tic(-31, 2000 + 3000 * p), t0 + (12 + 68 * p ** 0.6) / 30, rev=0.15)
def distinto(t0): pone(golpe(-17, 0.35), t0 + 124 / 30)
def reloj(t0): pone(barrido(0.45, 700, 4000, -21), t0 + 222 / 30); pone(tic(-24, 1500), t0 + 236 / 30)
def linea(t0): pone(slide(0.8, False, -26), t0 + 136 / 30)

M = {m["id"]: m for m in PL["mg"]}
mg(M["resena"]["desde"], cuadro(M["resena"]["hasta"]) - cuadro(M["resena"]["desde"]),
   zumbidos=[51, 71, 212], pops=[(0, 800), (4, 950)], viajes=[(56, 20), (205, 24)],
   chicas=[0, 3, 13, 23, 32, 41, 88, 94, 99, 105, 116, 124, 174, 186, 189, 192, 227], extra=[estrellas, flecha])
mg(M["viralidad"]["desde"], cuadro(M["viralidad"]["hasta"]) - cuadro(M["viralidad"]["desde"]),
   zumbidos=[0, 7, 131, 186, 222, 233], pops=[(90, 850), (127, 1000)], viajes=[(92, 20), (194, 24)],
   chicas=[33, 34, 46, 56, 62, 80, 86, 95, 108, 120, 152, 159, 165, 185, 192, 216], extra=[contador, distinto, reloj, linea])

# ── el chasquido ─────────────────────────────────────────────────────────────
pone(golpe(-9, 0.9), SNAP / 30, rev=0.8)
pone(barrido(0.7, 7000, 200, -16, cae=0.08), SNAP / 30, rev=0.8)

# ── reverb ───────────────────────────────────────────────────────────────────
n_ir = int(1.4 * SR); t = np.arange(n_ir) / SR
ir = rng.standard_normal(n_ir) * np.exp(-t / 0.35)
ir = signal.sosfilt(signal.butter(2, [250, 7000], "bandpass", fs=SR, output="sos"), ir)
ir /= np.sqrt((ir ** 2).sum())
hum = signal.fftconvolve(humedo, ir)[:len(seco)] * 0.8
sfx = (seco + hum)[:N]

# ── el audio de los posts, cada uno a -15 LUFS con limitador ─────────────────
def lee(args):
    r = subprocess.run(["ffmpeg", "-v", "error", *args, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(r, np.float32)
posts = np.zeros(N)
for p in POSTS:
    d = p["dur"] / 30
    a = lee(["-ss", str(p["desde"]), "-t", str(d), "-i", R + f"public/post{p['n']}.mp4",
             "-af", f"loudnorm=I=-15:TP=-3.5:LRA=11,alimiter=limit=0.6:level=false,afade=t=in:d=0.08,afade=t=out:st={d - 0.18:.3f}:d=0.18"])
    i = int(p["inicio"] / 30 * SR); posts[i:i + len(a)] += a[:N - i]

pico = np.abs(sfx).max()
if pico > db(-3): sfx *= db(-3) / pico
o = np.clip(sfx + posts, -1, 1)
w = wave.open(R + "trabajo/extras-v3.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((o * 32767).astype("<i2").tobytes()); w.close()
import shutil; shutil.copy(R + "trabajo/extras-v3.wav", R + "public/extras-v3.wav")
print(f"ok {TOTAL} cuadros, pico sfx {20*np.log10(pico):.1f} dBFS")
