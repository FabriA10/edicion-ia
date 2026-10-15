# Sonidos de la vuelta 3 (30/09), todos sintetizados acá (no se baja nada). Una sola pista, trabajo/extras-v4.wav, que
# cierre3.py suma DESPUÉS del limitador de la voz.
#
#   GANCHO      un clima oscuro y PAREJO debajo del susurro (zumbido grave, aire, un tono fino que late), que no crece: es
#               el clima del cuento, no un aviso. Se corta seco en el búh.
#   SUSTO       "que el scream sea más repentino, que no le dé tiempo a la audiencia a esperarlo". Lo de la vuelta 2 lo
#               anunciaba: una cama de tensión que crecía mientras él se preparaba, dos cuadros de silencio y un grito que
#               subía de 430 a 1040 Hz en 90 ms. Ahora todo arranca en el mismo instante y al máximo: el golpe (crack de
#               ruido + bombo), el grito ya en el agudo (dos voces ásperas, formantes de /a/ abierta), un chillido de
#               cuerdas disonante, y ráfagas digitales en los cuadros a umbral y en la rotura del final. Lo más fuerte son
#               los primeros 250 ms; se calla antes de "perdón por asustarte".
#               (30/09 noche, "cambiale el sonido del scream, que dé más miedo") El grito ahora es el de grito4.py.
#   TRANSICIÓN  la luz que se prende (clic, barrido); el destello ahora más suave, porque ahí cae el drop de la música.
#   PARTE 2     lo del 29/09 (sfx-v2.py, aprobado): un pop por tarjeta que entra, tics y detalles en cada mecanismo, whoosh
#               y golpecitos en los subtítulos animados, y los dos motion graphics (entrada, pin, ondas, viajes de cámara,
#               neón, la A y la Z, el avión del privado).
#
#   python sfx4.py      -> trabajo/extras-v4.wav (+ public/extras-v4.wav para el Studio, stems en trabajo/sfx4stems/)
#
# VUELTA 4 (01/10): es sfx3.py con los tiempos de src/v4 (sin el bloque 8: se fueron los sonidos de la bolsa de "vender"
# y de la semana de "constante"), el logo del consultorio con su flecha, y la guía nueva: la tapa que se abre, cada hoja
# que pasa, la A y la Z.
import io, json, math, os, re, subprocess, wave
from types import SimpleNamespace
import numpy as np
from scipy import signal
from scipy.signal import butter, fftconvolve, sosfilt

RAIZ = "F:/edicion con ia/proyectos/10-gancho-susto-tarjetas/"
SR, FPS = 48000, 30
rng = np.random.default_rng(3009)
db = lambda x: 10 ** (x / 20)
redondo = lambda x: int(math.floor(x + 0.5))
cuadro = lambda t: redondo(t * FPS)

# ── tiempos (los mismos del código de la composición) ────────────────────────
TT = open(RAIZ + "src/v4/tiempos.ts", encoding="utf-8").read()
TOTAL = int(re.search(r"TOTAL = (\d+)", TT).group(1))
GOLPE = int(re.search(r"GOLPE = (\d+)", TT).group(1))
SUSTO_FIN = int(re.search(r"SUSTO_FIN = (\d+)", TT).group(1))
TRANS = int(re.search(r"TRANSICION = (\d+)", TT).group(1))
MM = open(RAIZ + "src/v4/momentos.ts", encoding="utf-8").read()
T = SimpleNamespace(**{k: float(v) for k, v in re.findall(r"(\w+):\s*([\d.]+),", re.search(r"export const T = \{([\s\S]*?)\} as const;", MM).group(1))})
BL = {k: int(v) for k, v in re.findall(r"(b\w+|fin): (\d+)", re.search(r"export const BLOQUES = \{([\s\S]*?)\} as const;", MM).group(1))}
BL["b1"] = TRANS
MG1 = (BL["b2"], BL["b3"])
MG2 = (BL["b10b"], BL["b10c"])
N = TOTAL * (SR // FPS)

TJ = open(RAIZ + "src/v4/Tarjetas.tsx", encoding="utf-8").read().split("export const MOMENTOS")[1].split("= [", 1)[1].split("];")[0]
ev = lambda expr: float(eval(expr.strip(), {"T": T}))
TARJETAS = [(cuadro(ev(a)), n) for a, n in re.findall(r"\{ desde: ([^,]+), hasta: [^,]+, glifo: .+?, nombre: \"(\w+)\"", TJ)]
assert len(TARJETAS) == TJ.count("nombre:"), (len(TARJETAS), TJ.count("nombre:"))
CUES = json.loads(re.search(r"CUES: Cue3\[\] = (\[.*\]);", open(RAIZ + "src/v4/cues4.ts", encoding="utf-8").read(), re.S).group(1))
ANIMADOS = [c for c in CUES if c.get("animacion")]

# ── herramientas ─────────────────────────────────────────────────────────────
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def saturar(x, g): return np.tanh(g * x) / np.tanh(g)
def norm(x, pico): return x / (np.max(np.abs(x)) + 1e-12) * db(pico)
def dbfs(x): return 20 * np.log10(np.max(np.abs(x)) + 1e-12)

def reverb(x, rt60, pre=0.012, amortigua=5500, mojado=0.25):
    n = int(rt60 * 1.25 * SR)
    ir = rng.standard_normal(n) * np.exp(-6.91 * np.arange(n) / SR / rt60)
    ir = lp(ir, amortigua)
    ir = np.concatenate([np.zeros(int(pre * SR)), ir])
    ir /= np.sqrt((ir ** 2).sum())
    humedo = fftconvolve(x, ir)
    seco = np.concatenate([x, np.zeros(len(humedo) - len(x))])
    return seco + mojado * humedo * (np.std(x) / (np.std(humedo) + 1e-12))

pista = np.zeros(N)
stems = {}
def pone(x, t, nombre=None):
    i = int(round(t * SR))
    if i < 0: x, i = x[-i:], 0
    j = min(N, i + len(x))
    if j > i: pista[i:j] += x[: j - i]
    if nombre:
        s = stems.setdefault(nombre, np.zeros(N))
        if j > i: s[i:j] += x[: j - i]
def pone_cuadro(x, f, antes=0.0, nombre=None): pone(x, f / FPS - antes, nombre)

def leer(ruta):
    w = wave.open(ruta); x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768
    return x
def leer_tramo(ruta, desde, dur):
    w = wave.open(ruta); sr = w.getframerate()
    w.setpos(int(round(desde * sr)))
    return np.frombuffer(w.readframes(int(round(dur * sr))), "<i2").astype(float) / 32768
def escribir(ruta, x):
    o = wave.open(ruta, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR)
    o.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()); o.close()
def lufs(x):
    tmp = RAIZ + "trabajo/_medir3.wav"
    escribir(tmp, np.concatenate([np.zeros(SR // 2), x, np.zeros(SR // 2)]))
    s = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", tmp, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(s.split("Integrated loudness:")[1].split("I:")[1].split("LUFS")[0])

# ── el clima del gancho ──────────────────────────────────────────────────────
def clima(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * 49 * t) + 0.6 * np.sin(2 * np.pi * 73.6 * t + 1.1) + 0.35 * np.sin(2 * np.pi * 98.3 * t + 0.4)
    y *= 1 + 0.18 * np.sin(2 * np.pi * 0.37 * t)                       # late muy lento, parejo
    aire = bp(rng.standard_normal(n), 900, 4200) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.21 * t + 2))
    fino = np.sin(2 * np.pi * 2093 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * t)) * 0.05
    y = y / np.max(np.abs(y)) + 0.35 * aire / np.max(np.abs(aire)) + fino
    y *= np.minimum(1, t / 1.5)                                        # entra en 1,5 s y queda igual
    return y

# ── el susto ─────────────────────────────────────────────────────────────────
def voz_grito(dur, f0p, semilla, aspereza=0.55):
    """El grito YA en el agudo desde la primera muestra: sin la subida de la vuelta 2."""
    r = np.random.default_rng(semilla)
    n = int(dur * SR); t = np.arange(n) / SR
    f0 = f0p * (1 + 0.035 * np.sin(2 * np.pi * 6.2 * t + 0.6 * np.sin(2 * np.pi * 0.9 * t)))
    f0 *= 1 - 0.28 * np.clip((t - 0.75 * dur) / (0.3 * dur), 0, 1) ** 1.3     # se quiebra hacia abajo al final
    jit = lp(r.standard_normal(n), 45); f0 *= 1 + 0.02 * jit / (np.std(jit) + 1e-12)
    fase = 2 * np.pi * np.cumsum(f0) / SR
    src = np.zeros(n)
    for k in range(1, 30):
        src += (k * f0 < 10000) * (1.0 / k ** 0.75) * np.sin(k * fase + 0.37 * k * k % 6.28)
    src += 0.4 * np.sin(0.5 * fase)
    rough = lp(r.standard_normal(n), 30)
    src *= 1 + aspereza * np.sin(2 * np.pi * (70 + 25 * rough / (np.std(rough) + 1e-12)) * t)
    y = np.zeros(n)
    for f, bw, g in ((1080, 260, 1.0), (1800, 320, 0.85), (2950, 360, 0.6), (3950, 480, 0.35), (5300, 700, 0.2)):
        y += g * bp(src, max(80, f - bw / 2), f + bw / 2)
    aire = bp(r.standard_normal(n), 2200, 9000)
    y = y / np.max(np.abs(y)) + 0.25 * aire / np.max(np.abs(aire))
    y = hp(saturar(y, 6.0), 250)
    # lo más fuerte al principio: 250 ms arriba de todo, después sostiene con temblor
    e = np.minimum(1, t / 0.0015) * (0.72 + 0.28 * np.exp(-t / 0.25)) * (1 + 0.1 * np.sin(2 * np.pi * 7.5 * t))
    e *= np.clip((dur - t) / 0.18, 0, 1) ** 1.4
    return y * e

def chillido(dur, semilla):
    r = np.random.default_rng(semilla)
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for f, g in ((1865, 1.0), (1976, 0.95), (2794, 0.6), (2960, 0.5), (3729, 0.3)):
        vib = 1 + 0.014 * np.sin(2 * np.pi * 6.4 * t + r.uniform(0, 6))
        fase = 2 * np.pi * np.cumsum(f * vib) / SR
        y += g * (2 * ((fase / (2 * np.pi)) % 1) - 1)
    y = saturar(bp(y, 1200, 8000) / 3, 3)
    # arco que ataca en seco: el golpe del arco es lo primero que se oye
    e = np.minimum(1, t / 0.002) * (0.4 + 0.6 * np.exp(-t / 0.3)) * np.clip((dur - t) / 0.25, 0, 1) ** 1.5
    return y * e

def rafaga(dur=0.05, semilla=0):
    """Ráfaga digital: ruido reducido a 4 bits y a 6 kHz de muestreo, cortada en seco."""
    r = np.random.default_rng(semilla)
    n = int(dur * SR)
    x = r.standard_normal(n)
    paso = 8
    x = np.repeat(x[::paso], paso)[:n]
    x = np.round(np.clip(x / 2.5, -1, 1) * 8) / 8
    e = np.ones(n); k = int(0.002 * SR); e[:k] = np.linspace(0, 1, k); e[-k:] = np.linspace(1, 0, k)
    return x * e

def susto(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    g1 = voz_grito(dur, 1010, 31)
    g2 = voz_grito(dur, 1105, 32, aspereza=0.65)
    grito = g1 / np.max(np.abs(g1)) + 0.7 * g2 / np.max(np.abs(g2))
    ch = chillido(dur * 0.9, 41); ch = np.concatenate([ch, np.zeros(n - len(ch))])
    f = 38 + 95 * np.exp(-t / 0.07)
    bombo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5) * np.minimum(1, t / 0.001)
    crack = np.zeros(n); m = int(0.06 * SR)
    crack[:m] = hp(rng.standard_normal(m), 600) * np.exp(-np.arange(m) / SR / 0.012)
    sub = lp(rng.standard_normal(n), 60) * np.exp(-t / 0.9)
    mezcla = (db(-3) * grito / np.max(np.abs(grito)) + db(-9) * ch / np.max(np.abs(ch)) + db(-3.5) * bombo
              + db(-5) * crack / np.max(np.abs(crack)) + db(-12) * sub / np.max(np.abs(sub)))
    mezcla = reverb(mezcla, 1.0, mojado=0.2)[:n]
    k = int(0.06 * SR); mezcla[-k:] *= np.linspace(1, 0, k) ** 2
    return mezcla / np.max(np.abs(mezcla))

# ── la transición (de la vuelta 2) ───────────────────────────────────────────
def clic():
    def tic_(f, dur=0.05, caida=0.012):
        n = int(dur * SR); t = np.arange(n) / SR
        y = bp(rng.standard_normal(n), f * 0.6, f * 1.6) * np.exp(-t / caida) + 0.6 * np.sin(2 * np.pi * f * t) * np.exp(-t / (caida * 1.3))
        return y / np.max(np.abs(y))
    out = np.zeros(int(0.12 * SR)); out[: int(0.05 * SR)] += tic_(3200)
    k = int(0.046 * SR); out[k: k + int(0.05 * SR)] += 0.8 * tic_(2100)
    return db(-13) * out

def barrido_luz(dur):
    n = int(dur * SR); t = np.arange(n) / SR; u = t / dur
    base = rng.standard_normal(n); y = np.zeros(n); trozos = 28
    for k in range(trozos):
        a, b = int(n * k / trozos), int(n * (k + 1) / trozos)
        fc = 400 * (6000 / 400) ** ((k + 0.5) / trozos)
        y[a:b] = bp(base, fc * 0.7, min(fc * 1.45, 11000))[a:b]
    return db(-13) * y * u ** 1.8 / np.max(np.abs(y))

def destello():
    n = int(1.1 * SR); t = np.arange(n) / SR
    aire = lp(rng.standard_normal(n), 4200) * np.exp(-t / 0.09)
    brillo_ = sum(np.sin(2 * np.pi * fk * t + p) * g for fk, g, p in ((2093, 1.0, 0.0), (3136, 0.6, 1.3), (4186, 0.4, 2.1), (5274, 0.25, 0.4)))
    brillo_ *= np.exp(-t / 0.35) * np.minimum(1, t / 0.002)
    y = db(-24) * aire / np.max(np.abs(aire)) + db(-33) * brillo_ / np.max(np.abs(brillo_))
    y = reverb(y, 0.9, mojado=0.30)[:n]
    k = int(0.25 * SR); y[-k:] *= np.linspace(1, 0, k) ** 2
    return y

# ── los de la parte 2 (sfx-v2.py del 29/09) ──────────────────────────────────
def barrido(dur, f0, f1, pico, grave=0.0):
    n = int(dur * SR); ruido = rng.standard_normal(n); salida = np.zeros(n); zi = None
    for k in range(0, n, 256):
        p = k / n; fc = f0 * (f1 / f0) ** p
        sos = signal.butter(2, [fc / 1.6, min(fc * 1.6, SR / 2 - 100)], btype="bandpass", fs=SR, output="sos")
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        salida[k:k + 256], zi = signal.sosfilt(sos, ruido[k:k + 256], zi=zi)
    t = np.arange(n) / SR
    env = np.where(t < dur * 0.72, (t / (dur * 0.72)) ** 2.2, np.exp(-(t - dur * 0.72) / 0.035))
    salida *= env
    if grave: salida += grave * np.sin(2 * np.pi * np.cumsum(60 + 40 * t / dur) / SR) * env
    return norm(salida, pico)

def pop(dur=0.09, f0=1100, pico=-21):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (0.5 + 0.5 * np.exp(-t / 0.045))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.028) + rng.standard_normal(n) * np.exp(-t / 0.002) * 0.35
    return norm(x, pico)

def burbuja(pico=-23):
    n = int(0.11 * SR); t = np.arange(n) / SR
    f = 380 + 520 * (1 - np.exp(-t / 0.018))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035) * np.minimum(1, t / 0.002), pico)

def tic(pico=-27, fc=3200):
    n = int(0.03 * SR); t = np.arange(n) / SR
    x = signal.sosfilt(signal.butter(2, [fc / 1.8, fc * 1.8], "bandpass", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / 0.006)
    x += 0.5 * np.sin(2 * np.pi * fc * 0.5 * t) * np.exp(-t / 0.01)
    return norm(x, pico)

def tecla(pico=-24):
    n = int(0.05 * SR); t = np.arange(n) / SR
    clic_ = signal.sosfilt(signal.butter(2, [1800, 6500], "bandpass", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / 0.004)
    return norm(clic_ + np.sin(2 * np.pi * 420 * t) * np.exp(-t / 0.012) * 0.6, pico)

def mensaje(pico=-22):
    partes = []
    for f, d in ((880, 0.07), (1320, 0.12)):
        n = int(d * SR); t = np.arange(n) / SR
        partes.append((np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / 0.004) * np.exp(-t / (d * 0.5)))
    return norm(np.concatenate([partes[0], np.zeros(int(0.015 * SR)), partes[1]]), pico)

def timbre(pico=-23):
    """Ding-dong de la puerta."""
    partes = []
    for f, d in ((659.3, 0.32), (523.3, 0.5)):
        n = int(d * SR); t = np.arange(n) / SR
        partes.append((np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.08)) * np.minimum(1, t / 0.003) * np.exp(-t / (d * 0.45)))
    return norm(np.concatenate([partes[0], partes[1]]), pico)

def golpe(pico=-13):
    n = int(0.5 * SR); t = np.arange(n) / SR
    f = 42 + 70 * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16) * np.minimum(1, t / 0.003)
    x += 0.3 * lp(rng.standard_normal(n), 900) * np.exp(-t / 0.03)
    return norm(x, pico)

def neon(pico=-25):
    n = int(0.2 * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * 100 * k * t) / k for k in (1, 2, 3, 5, 7))
    x += 0.3 * bp(rng.standard_normal(n), 2000, 6000)
    patron = [0, 0.9, 0.18, 1, 0.5, 1]
    env = np.array([patron[min(int(tt * FPS), len(patron) - 1)] for tt in t])
    env = np.convolve(env, np.ones(96) / 96, "same") * np.exp(-np.maximum(0, t - 0.12) / 0.04)
    return norm(x * env, pico)

def brillo(pico=-28, dur=0.45, cuantos=9):
    n = int(dur * SR); x = np.zeros(n)
    for k in range(cuantos):
        i = int(rng.uniform(0, dur * 0.66) * SR); m = int(0.08 * SR)
        f = rng.uniform(2400, 5200); t = np.arange(m) / SR
        s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.02) * np.minimum(1, t / 0.002)
        x[i:i + m] += s[: max(0, min(m, n - i))]
    return norm(x, pico)

def sonar(pico=-25):
    """Onda de radar: un ping que baja apenas, con cola."""
    n = int(0.5 * SR); t = np.arange(n) / SR
    f = 1250 * (1 - 0.08 * t / 0.5)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * np.minimum(1, t / 0.003)
    return norm(reverb(x, 0.6, mojado=0.35)[:n], pico)

def cruz(pico=-24):
    """Error suave: dos notas que bajan."""
    partes = []
    for f, d in ((392, 0.08), (311, 0.14)):
        n = int(d * SR); t = np.arange(n) / SR
        partes.append(np.sign(np.sin(2 * np.pi * f * t)) * 0.3 * np.exp(-t / (d * 0.6)) * np.minimum(1, t / 0.003))
    return norm(lp(np.concatenate(partes), 2500), pico)

def hoja_que_pasa(dur, semilla):
    """Una hoja que pasa: el aire del papel (ruido de 1-7 kHz que sube y corta) y el golpecito cuando cae."""
    r = np.random.default_rng(semilla)
    n = int((dur + 0.12) * SR); t = np.arange(n) / SR
    aire = bp(r.standard_normal(n), 1100, 7000)
    u = np.clip(t / dur, 0, 1)
    e = np.sin(np.pi * u) ** 1.5 * (t < dur)
    cae = np.zeros(n); k = int(dur * SR)
    m = n - k; tt = np.arange(m) / SR
    cae[k:] = lp(r.standard_normal(m), 900) * np.exp(-tt / 0.018)
    x = aire * e + 0.9 * cae / (np.max(np.abs(cae)) + 1e-9) * np.max(np.abs(aire * e))
    return norm(x, -25)

def tapa_que_abre(dur):
    """La tapa: un barrido grave y lento de cartón que se abre, y el golpe suave cuando apoya."""
    n = int((dur + 0.25) * SR); t = np.arange(n) / SR
    k = int(dur * SR)
    aire = bp(rng.standard_normal(n), 250, 3200)
    e = np.where(t < dur, np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.2, 0)
    x = aire * e
    f = 70 + 50 * np.exp(-(t - dur).clip(0) / 0.04)
    golpe_ = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-(t - dur).clip(0) / 0.09) * (t >= dur)
    x = x / (np.max(np.abs(x)) + 1e-9) + 0.8 * golpe_
    return norm(x, -21)

# ── armado ───────────────────────────────────────────────────────────────────
def main():
    # el gancho: clima parejo hasta el búh, cortado en seco (2 ms)
    voz = leer(RAIZ + "public/voz-v4.wav")
    susurro = voz[: int(GOLPE / FPS * SR)]
    # la voz se lleva entera a -14,5: el susurro queda a (su nivel + lo que le falta a toda la voz). El clima va 16 dB abajo.
    ganancia = -14.5 - lufs(voz)
    nivel_susurro = lufs(susurro) + ganancia
    cl = clima(GOLPE / FPS - 0.002)
    cl = cl * db(nivel_susurro - 16 - lufs(cl))
    k = int(0.002 * SR); cl = np.concatenate([cl, cl[-1] * np.linspace(1, 0, k)])
    pone(cl, 0.0, "clima")
    print(f"susurro ~{nivel_susurro:.1f} LUFS después de la ganancia; clima {lufs(cl):.1f} LUFS")

    # el susto: arranca 4 ms antes del cuadro del búh, así el golpe cae con la imagen. El grito y las ráfagas digitales
    # (en los cuadros a umbral, k = 0-1, 13 y 27, y en la rotura del final) se arman juntos y se saturan juntos: así el
    # pico es uno solo y la densidad sube (un susto tiene que sonar MÁS fuerte que la voz con el mismo techo).
    t_golpe = GOLPE / FPS - 0.004
    dur = (SUSTO_FIN - GOLPE) / FPS - 0.12
    largo_total = (SUSTO_FIN - GOLPE) / FPS + 0.004
    seg = np.zeros(int(largo_total * SR))
    # (30/09 noche) "cambiale el sonido del scream, que dé más miedo": el grito es el de grito4.py (gargantas con caos y
    # aspereza, su búh una octava abajo, rugido, cuerdas, vidrio y bombazo de su carpeta Sound effects). El de la vuelta 3
    # —dos voces con el tono fijo— queda en susto() y en trabajo/extras-v3-grito3.wav.
    from grito4 import grito4
    buh = leer_tramo(RAIZ + "public/voz-v4.wav", GOLPE / FPS - 0.03, 0.5)
    g = grito4(dur, buh)
    seg[: len(g)] += g
    def en(kk): return int(round(((GOLPE + kk) / FPS - t_golpe) * SR))
    for kk, d, gan in ((0, 0.066, -5), (13, 0.045, -8), (27, 0.045, -8)):
        r_ = norm(rafaga(d, kk), gan); seg[en(kk): en(kk) + len(r_)] += r_[: len(seg) - en(kk)]
    for kk in range(SUSTO_FIN - GOLPE - 5, SUSTO_FIN - GOLPE):
        r_ = norm(rafaga(0.03, 100 + kk), -12); i = en(kk); seg[i: i + len(r_)] += r_[: max(0, len(seg) - i)]
    # saturación 4,5: -7,9 LUFS en el susto (el de la vuelta 3, -10,0), 6,6 LU arriba de la voz, sin perder la aspereza
    seg = saturar(seg / np.max(np.abs(seg)), 4.5)
    k = int(0.003 * SR); seg[-k:] *= np.linspace(1, 0, k)
    seg = seg / np.max(np.abs(seg)) * db(-2.6)
    pone(seg, t_golpe, "susto")
    ini = seg[: int(0.4 * SR)]
    print(f"susto: de {t_golpe:.3f} a {t_golpe + largo_total:.3f} s (grito hasta {t_golpe + dur:.3f}; 'perdón' en {SUSTO_FIN / FPS:.3f}); "
          f"pico {dbfs(seg):.1f} dBFS, {lufs(seg):.1f} LUFS el susto entero, {lufs(ini):.1f} LUFS los primeros 400 ms")

    # la transición
    t_c = TRANS / FPS
    pone(clic(), t_c - 9 / FPS, "transicion")
    pone(barrido_luz(7 / FPS), t_c - 8 / FPS, "transicion")
    pone(destello(), t_c - 1 / FPS, "transicion")

    # las tarjetas: un pop cuando entra cada una
    B_ = burbuja()
    for f, n in TARJETAS:
        pone_cuadro(B_, f + 1, nombre="tarjetas")
    # y los mecanismos
    E = lambda x, t, antes=0.0: pone(x, t - antes, "tarjetas")
    E(pop(f0=1500, pico=-22), T.no1 - 1 / FPS)                                     # ✕ del embudo
    for i, t in enumerate([T.que1 - 2 / FPS, T.personas1 - 4 / FPS + 3 / FPS, T.personas1 - 4 / FPS + 6 / FPS]):
        E(tic(-26, 2400 + 300 * i), t)                                                # los "?"
    for i in range(4):
        E(tic(-27, 1800 + 450 * i), T.estadisticas - 3 / FPS + i * 3 / FPS)          # las barras
    E(mensaje(-27), T.apuntados - 2 / FPS)                                           # la mira se cierra
    E(pop(f0=700, pico=-21), T.ciudad1 - 3 / FPS + 8 / FPS)                          # cae el pin
    t0 = T.pacientes1 - 4 / FPS
    for i in range(6):
        E(tic(-28, 2000 + 200 * i), t0 + i * 4 / FPS)                                # se prenden las personas
    E(brillo(-27), T.tratamientos - 2 / FPS)
    E(barrido(0.18, 1200, 5200, -25), T.confianza1 - 2 / FPS)                        # el tilde del escudo
    E(brillo(-30, 0.6, 6), T.redes5 - 4 / FPS)                                       # corazones
    E(pop(f0=700, pico=-21), T.ciudad2 - 4 / FPS + 8 / FPS)                          # cae el pin
    a, b = T.consigue - 2 / FPS, T.n25a + 1 / FPS                                     # el contador
    for i in range(12):
        E(tic(-29, 1500 + 110 * i), a + (b - a) * i / 12)
    E(pop(f0=1400, pico=-21), b)
    E(pop(f0=1400, pico=-23), T.n25b - 2 / FPS)
    t_logo = (cuadro(T.consultorio6) - 1) / FPS
    E(burbuja(-20), t_logo + 1 / FPS)                                                # aparece el logo del consultorio
    E(barrido(0.42, 700, 4200, -22), t_logo + 5 / FPS)                               # la flecha que lo señala
    E(tic(-24, 2400), t_logo + 18 / FPS)                                             # la punta
    E(mensaje(-24), T.eligieron - 3 / FPS)                                           # llega la pregunta
    E(barrido(0.25, 3000, 600, -27), T.otro - 6 / FPS)                               # se apagan los demás
    E(tic(-25, 3000), T.otro)
    E(pop(f0=1200, pico=-22), T.confianza2 - 2 / FPS)                                # el corazón
    E(pop(f0=900, pico=-23), T.anuncio - 2 / FPS)                                    # el megáfono
    for t in [T.subir, T.cada, T.vez, T.mas, T.videos7]:
        E(pop(f0=1300, pico=-25), t - 2 / FPS)                                       # los reels
    E(barrido(0.3, 800, 3600, -24), T.mismo - 3 / FPS)                               # la flecha que gira
    E(barrido(0.18, 1200, 5200, -25), T.distinta - 2 / FPS)                          # ? → tilde
    for t in (T.segunda, T.tercera):
        E(tic(-24, 2600), t - 3 / FPS)                                               # 2ª, 3ª
    for t in (T.anuncios10 - 2 / FPS, T.correcta - 6 / FPS, T.correcta - 1 / FPS):
        E(tic(-25, 3000), t)                                                         # la lista
    E(mensaje(-24), T.precio - 3 / FPS)                                              # "¿precio?"
    E(cruz(-25), T.consulta - 4 / FPS)                                               # nunca agenda
    E(barrido(0.35, 400, 1800, -26), T.yendo - 2 / FPS)                              # se abre la puerta
    E(timbre(-23), T.puerta - 2 / FPS)                                               # ding-dong
    for i in range(4):
        E(tecla(-24), T.guia2 - 2 / FPS + i * 2 / FPS)                               # G-U-Í-A
    E(pop(f0=1250, pico=-21), T.mando - 2 / FPS)                                     # enviar
    E(barrido(0.4, 700, 5200, -21), T.privado - 4 / FPS)                             # el avión

    # los subtítulos animados (sfx4c.py): whoosh cuando la letra se posa, golpecito por palabra en los Delayed Up
    W_ = barrido(0.30, 450, 4200, -17)
    for c in ANIMADOS:
        pone(W_, c["desde"] + 4 / FPS - 0.30 * 0.72, "subtitulos")
        if c["animacion"] == "delayed-up-slide":
            for tw in c.get("palabras", []):
                pone(pop(), tw - 2 / FPS + 3 / FPS, "subtitulos")
        else:
            pone(pop(f0=900), c["desde"] + 5 / FPS, "subtitulos")

    # motion graphic 1: el mapa
    ENTRA_MG = barrido(0.30, 300, 3800, -17, grave=0.3)
    loc1 = lambda t: cuadro(t) - MG1[0]
    pone_cuadro(ENTRA_MG, MG1[0] + 4, antes=0.30 * 0.72, nombre="mg1")
    pone_cuadro(pop(f0=650, pico=-20), MG1[0] + loc1(T.clinica) - 3 + 9, nombre="mg1")      # cae el pin
    pone_cuadro(golpe(-26), MG1[0] + loc1(T.clinica) - 3 + 9, nombre="mg1")
    pone_cuadro(neon(-24), MG1[0] + loc1(T.buenos) - 1, nombre="mg1")                        # BUENOS AIRES
    pone_cuadro(pop(f0=1000, pico=-24), MG1[0] + loc1(T.instagram2) - 2, nombre="mg1")       # el logo
    for i in range(4):
        pone_cuadro(sonar(-26 - i), MG1[0] + loc1(T.instagram2) + 2 + i * 9, nombre="mg1")   # las ondas
    pone_cuadro(barrido(0.7, 2600, 350, -19), MG1[0] + loc1(T.todo) - 8, nombre="mg1")      # la cámara se aleja
    pone_cuadro(neon(-23), MG1[0] + loc1(T.todo) - 1, nombre="mg1")                          # A TODO EL PAÍS
    pone_cuadro(brillo(-26, 0.6, 14), MG1[0] + loc1(T.todo) - 2, nombre="mg1")               # los puntitos
    pone_cuadro(barrido(0.7, 2600, 350, -20), MG1[0] + loc1(T.incluso) - 5, nombre="mg1")   # se aleja otra vez
    pone_cuadro(neon(-23), MG1[0] + loc1(T.otros) - 1, nombre="mg1")                         # A OTROS PAÍSES
    pone_cuadro(brillo(-27, 0.5, 12), MG1[0] + loc1(T.otros) - 5, nombre="mg1")              # los otros países

    # motion graphic 2: la guía (vuelta 4: el libro se abre y pasan las hojas; los tiempos son los de MGGuia.tsx)
    loc2 = lambda t: cuadro(t) - MG2[0]
    pone_cuadro(ENTRA_MG, MG2[0] + 4, antes=0.30 * 0.72, nombre="mg2")
    pone_cuadro(neon(-22), MG2[0] + loc2(T.guia1) - 1, nombre="mg2")                         # GUÍA
    viaje = MG2[0] + loc2(T.aca) - 6
    pone_cuadro(barrido(0.55, 350, 2800, -19), viaje + 2, nombre="mg2")                      # la cámara baja
    pone_cuadro(golpe(-25), viaje + 17, nombre="mg2")                                        # el libro se asienta
    pone_cuadro(barrido(0.22, 900, 4000, -24), MG2[0] + loc2(T.aca) - 3, nombre="mg2")      # la flecha
    abre = loc2(T.explicamos) - 1
    vueltas = [(abre, 22), (abre + 23, 7), (abre + 31, 7), (abre + 39, 7), (abre + 47, 7),
               (loc2(T.letraA) - 9, 7), (loc2(T.como) - 8, 8)]
    d0, n0 = vueltas[0]
    pone_cuadro(tapa_que_abre(n0 / FPS), MG2[0] + d0, nombre="mg2")                           # la tapa
    for i, (d, n) in enumerate(vueltas[1:]):
        pone_cuadro(hoja_que_pasa(n / FPS, 700 + i), MG2[0] + d, nombre="mg2")               # cada hoja
    pone_cuadro(pop(f0=620, pico=-21), MG2[0] + loc2(T.letraA) - 2, nombre="mg2")             # la A
    pone_cuadro(pop(f0=560, pico=-21), MG2[0] + loc2(T.letraZ) - 2, nombre="mg2")             # la Z
    pone_cuadro(pop(f0=1300, pico=-22), MG2[0] + loc2(T.pacientes10) - 2, nombre="mg2")       # "pacientes"

    print(f"{len(TARJETAS)} tarjetas, {len(ANIMADOS)} subtítulos animados; pico de la pista {dbfs(pista):.1f} dBFS")
    escribir(RAIZ + "trabajo/extras-v4.wav", pista)
    escribir(RAIZ + "public/extras-v4.wav", pista)
    os.makedirs(RAIZ + "trabajo/sfx4stems", exist_ok=True)
    for k, x in stems.items():
        escribir(RAIZ + f"trabajo/sfx4stems/{k}.wav", x)
        print(f"  {k:11s} pico {dbfs(x):6.1f} dBFS")
    print(f"extras-v4.wav: {N} muestras = {N / SR:.3f} s")

if __name__ == "__main__":
    main()
