# El grito del susto, cuarta versión (30/09 noche): "cambiale el sonido del scream, que dé más miedo".
#
# El de la vuelta 3 eran dos voces sintéticas con el tono FIJO todo el tiempo: arrancaba de golpe, pero sostenido así
# suena más a alarma que a algo vivo. Lo que hace que un grito dé miedo (y que lo diferencia de cualquier otro sonido
# fuerte) es la ASPEREZA: modulaciones rápidas de 30-150 Hz, quiebres, ruido de garganta; y lo que lo vuelve no humano es
# que haya algo que no debería estar ahí. Capas, todas arrancando en el mismo instante:
#
#   alarido   tres gargantas con caos de verdad: el tono se mueve, salta de registro (un quiebre a ~0,55 s), duplica el
#             período (subarmónicos) y se parte en dos tonos a ratos (bifonación), con aspereza de 50-120 Hz y aire de
#             garganta que late con cada ciclo; al final se cae, como un grito que se apaga.
#   chillido  una cuarta voz una octava arriba, finita: lo que perfora.
#   demonio   SU búh (el que queda en el video), bajado una octava y saturado, debajo del grito: la voz de él con algo
#             adentro. Es el mismo búh y en el mismo instante: no es un segundo búh.
#   rugido    un gruñido grave con subarmónicos, sostenido debajo de todo.
#   cuerdas   el chillido disonante de la vuelta 3, con ruido de arco.
#   golpe     "Glass break" y "explosion-1" de su carpeta Sound effects (los dos sin nada antes del golpe: los "impact"
#             tienen una subida que avisaría), más un bombo y un crack sintetizados.
#
#   python grito4.py          -> trabajo/sfx4/grito4.wav (para mirarlo) y la comparación con el de la vuelta 3
import math, re, subprocess, wave
import numpy as np
from scipy.signal import butter, fftconvolve, hilbert, resample_poly, sosfilt

RAIZ = "F:/edicion con ia/proyectos/10-gancho-susto-tarjetas/"
LIB = "F:/edicion con ia/sonidos/"
SR = 48000
db = lambda x: 10 ** (x / 20)

def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def unidad(x): return x / (np.max(np.abs(x)) + 1e-12)

def lento(r, n, fc):
    """Ruido pasado por un pasa-bajos, desvío 1: para mover cosas sin que se note un patrón."""
    y = lp(r.standard_normal(n), fc)
    return y / (np.std(y) + 1e-12)

def ventana(t, a, b, borde):
    """1 entre a y b, con bordes suaves de `borde` segundos."""
    return np.clip((t - a) / borde, 0, 1) * np.clip((b - t) / borde, 0, 1)

def reverb(x, rt60, r, pre=0.01, amortigua=4500, mojado=0.22):
    n = int(rt60 * 1.25 * SR)
    ir = r.standard_normal(n) * np.exp(-6.91 * np.arange(n) / SR / rt60)
    ir = lp(ir, amortigua)
    ir = np.concatenate([np.zeros(int(pre * SR)), ir]); ir /= np.sqrt((ir ** 2).sum())
    h = fftconvolve(x, ir)[: len(x)]
    return x + mojado * h * (np.std(x) / (np.std(h) + 1e-12))

def garganta(dur, f0b, semilla, quiebre=0.55, caida=0.32, aspereza=0.65):
    r = np.random.default_rng(semilla)
    n = int(dur * SR); t = np.arange(n) / SR
    c = 1 + 0.07 * np.exp(-t / 0.035)                                   # el primer instante, un poco más arriba
    c *= 1 + 0.035 * np.sin(2 * np.pi * 5.3 * t + r.uniform(0, 6)) + 0.03 * lento(r, n, 7)
    c *= 1 + 0.18 * ventana(t, quiebre, quiebre + 0.08, 0.012)          # se quiebra hacia arriba un instante
    c *= 1 - caida * np.clip((t - 0.62 * dur) / (0.38 * dur), 0, 1) ** 1.4
    f0 = f0b * c * (1 + 0.035 * lento(r, n, 45))                        # jitter
    fase = 2 * np.pi * np.cumsum(f0) / SR
    src = np.zeros(n)
    for k in range(1, 40):
        src += (k * f0 < 11000) * k ** -0.75 * np.sin(k * fase + r.uniform(0, 6.28))
    # subarmónicos (el período se duplica a ratos) y bifonación (otro tono que aparece y se va)
    d = np.clip(0.2 + 0.45 * lento(r, n, 3), 0, 0.85)
    src *= 1 + 0.7 * d * np.sin(0.5 * fase)
    f2 = f0 * (1.41 + 0.04 * lento(r, n, 2))
    fase2 = 2 * np.pi * np.cumsum(f2) / SR
    b2 = np.clip(0.45 * lento(r, n, 2.5) - 0.1, 0, 0.55)
    src += b2 * sum(k ** -1.0 * np.sin(k * fase2) for k in range(1, 7))
    # aspereza: modulación caótica de 50-120 Hz, la firma acústica del grito
    fr = 85 + 22 * lento(r, n, 6)
    src *= 1 + aspereza * np.sin(2 * np.pi * np.cumsum(fr) / SR)
    # aire de garganta que late con cada ciclo
    aire = bp(r.standard_normal(n), 1200, 9500) * (0.55 + 0.45 * np.cos(fase))
    exc = unidad(src) + 0.55 * unidad(aire)
    y = np.zeros(n)
    for f, bw, g in ((1050, 280, 1.0), (1650, 300, 0.8), (2900, 380, 0.7), (4000, 520, 0.45), (5300, 800, 0.28)):
        y += g * bp(exc, f - bw / 2, f + bw / 2)
    y = unidad(y) + 0.3 * unidad(aire)
    y = np.tanh(4 * (y + 0.15)) - np.tanh(0.6)                          # saturación asimétrica: más áspero
    y = hp(unidad(y), 200)
    e = np.minimum(1, t / 0.001) * (0.8 + 0.2 * np.exp(-t / 0.22)) * (1 + 0.12 * np.sin(2 * np.pi * 7.7 * t + r.uniform(0, 6)))
    e *= np.clip((dur - t) / 0.16, 0, 1) ** 1.3
    return y * e

def rugido(dur, semilla):
    r = np.random.default_rng(semilla)
    n = int(dur * SR); t = np.arange(n) / SR
    f0 = 78 * (1 + 0.08 * lento(r, n, 20)) * (1 - 0.15 * np.clip((t - 0.6 * dur) / (0.4 * dur), 0, 1))
    fase = 2 * np.pi * np.cumsum(f0) / SR
    src = sum((k * f0 < 5000) * k ** -0.9 * np.sin(k * fase + r.uniform(0, 6.28)) for k in range(1, 64))
    src *= (1 + 0.8 * np.sin(0.5 * fase)) * (1 + 0.5 * np.sin(fase / 3))
    raspa = bp(r.standard_normal(n), 300, 3200) * (0.5 + 0.5 * np.cos(fase))
    exc = unidad(src) + 0.8 * unidad(raspa)
    y = sum(g * bp(exc, f - bw / 2, f + bw / 2) for f, bw, g in ((450, 140, 1.0), (800, 180, 0.8), (2500, 400, 0.35)))
    y = np.tanh(6 * unidad(y)) / np.tanh(6)
    e = np.minimum(1, t / 0.002) * np.clip((dur - t) / 0.2, 0, 1) ** 1.2
    return hp(y * e, 45)

def cuerdas(dur, semilla):
    r = np.random.default_rng(semilla)
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for f, g in ((1865, 1.0), (1976, 0.95), (2794, 0.6), (2960, 0.5), (3729, 0.3)):
        vib = 1 + 0.014 * np.sin(2 * np.pi * 6.4 * t + r.uniform(0, 6))
        fase = 2 * np.pi * np.cumsum(f * vib) / SR
        y += g * (2 * ((fase / (2 * np.pi)) % 1) - 1)
    arco = bp(r.standard_normal(n), 2500, 9000) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t))
    y = np.tanh(3 * unidad(bp(y, 1200, 8000)) + 0.5 * unidad(arco)) / np.tanh(3)
    e = np.minimum(1, t / 0.002) * (0.35 + 0.65 * np.exp(-t / 0.3)) * np.clip((dur - t) / 0.25, 0, 1) ** 1.5
    return y * e

def leer(ruta, desde=0.0, dur=None):
    a = ["ffmpeg", "-v", "error", "-ss", f"{desde:.4f}"] + (["-t", f"{dur:.4f}"] if dur else []) + ["-i", ruta, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"]
    return np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, "<i2").astype(float) / 32768

def golpe_libreria(n):
    """El vidrio que estalla y el bombazo, recortados en su propio ataque (sin lo que tienen antes)."""
    def desde_ataque(x, ancho=0.012):
        e = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(96) / 96, "same")) + 1e-9)
        i = int(np.argmax(e > e.max() - 24))
        y = x[max(0, i - int(0.001 * SR)):]
        k = int(0.001 * SR); y[:k] *= np.linspace(0, 1, k)
        return y
    vidrio = desde_ataque(leer(LIB + "Glass break.mp3"))
    bomba = desde_ataque(leer(LIB + "explosion-1.mp3"))
    out_v, out_b = np.zeros(n), np.zeros(n)
    out_v[: min(n, len(vidrio))] = vidrio[:n]
    out_b[: min(n, len(bomba))] = bomba[:n]
    return unidad(out_v), unidad(out_b)

def demonio(buh, n):
    """Su búh una octava abajo: el doble de largo, saturado y oscuro."""
    y = resample_poly(buh, 2, 1)                      # el doble de muestras a la misma frecuencia: una octava abajo
    y = np.tanh(3.5 * unidad(lp(y, 2600))) / np.tanh(3.5)
    out = np.zeros(n); out[: min(n, len(y))] = y[:n]
    k = int(0.08 * SR)
    fin = min(n, len(y))
    out[max(0, fin - k):fin] *= np.linspace(1, 0, fin - max(0, fin - k))
    return out

def grito4(dur, buh, semilla=4009):
    """Todo junto, sin normalizar al final (la saturación y el pico los pone quien lo usa)."""
    r = np.random.default_rng(semilla)
    n = int(dur * SR); t = np.arange(n) / SR
    voces = (unidad(garganta(dur, 1150, semilla + 1)) + db(-3) * unidad(garganta(dur, 1290, semilla + 2, quiebre=0.48))
             + db(-2) * unidad(garganta(dur, 760, semilla + 3, quiebre=0.62, caida=0.38)))
    chillido = bp(garganta(dur, 2250, semilla + 4, aspereza=0.5), 2000, 9000)
    vidrio, bomba = golpe_libreria(n)
    f = 38 + 100 * np.exp(-t / 0.06)
    bombo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5) * np.minimum(1, t / 0.0008)
    m = int(0.05 * SR); crack = np.zeros(n)
    crack[:m] = hp(r.standard_normal(m), 700) * np.exp(-np.arange(m) / SR / 0.01)
    cu = cuerdas(dur * 0.9, semilla + 6)
    cu = np.concatenate([cu, np.zeros(max(0, n - len(cu)))])[:n]
    bomba *= np.exp(-t / 0.25)                                          # un golpe, no un retumbe que tape
    # El grito manda: con la primera mezcla (voces -2, demonio -5, rugido -7, bombazo -6) la franja de 1-4 kHz, la del
    # alarido, quedaba en 27 % de la energía contra 47 % en la vuelta 3, y lo grave se lo comía.
    mezcla = (unidad(voces) + db(-6) * unidad(chillido) + db(-8) * unidad(demonio(buh, n))
              + db(-11) * unidad(rugido(dur, semilla + 5)) + db(-11) * unidad(cu)
              + db(-6) * vidrio + db(-8) * unidad(bomba) + db(-6) * unidad(bombo) + db(-7) * unidad(crack))
    mezcla = reverb(mezcla, 1.3, r, mojado=0.22)
    k = int(0.06 * SR); mezcla[-k:] *= np.linspace(1, 0, k) ** 2
    return unidad(mezcla)

# ── medidas para comparar (no se oye, se mide) ───────────────────────────────
def medidas(x):
    banda = bp(x, 1000, 6000)
    env = np.abs(hilbert(banda))
    env = resample_poly(env, 1, 24)                                     # 2 kHz
    env = env - env.mean()
    P = np.abs(np.fft.rfft(env * np.hanning(len(env)))) ** 2
    f = np.fft.rfftfreq(len(env), 1 / 2000)
    aspereza = P[(f >= 30) & (f <= 150)].sum() / P[(f >= 2) & (f < 30)].sum()
    S = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ** 2
    fs = np.fft.rfftfreq(len(x), 1 / SR)
    m = (fs >= 1000) & (fs <= 6000)
    planitud = np.exp(np.mean(np.log(S[m] + 1e-20))) / np.mean(S[m])   # 0 = tono puro, 1 = ruido
    centroide = (fs * S).sum() / S.sum()
    return aspereza, planitud, centroide

if __name__ == "__main__":
    import sys
    T = open(RAIZ + "src/v3/tiempos.ts", encoding="utf-8").read()
    GOLPE = int(re.search(r"GOLPE = (\d+)", T).group(1)); FIN = int(re.search(r"SUSTO_FIN = (\d+)", T).group(1))
    dur = (FIN - GOLPE) / 30 - 0.12
    buh = leer(RAIZ + "public/voz-v3.wav", GOLPE / 30 - 0.03, 0.5)
    g = grito4(dur, buh)
    o = wave.open(RAIZ + "trabajo/sfx4/grito4.wav", "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR)
    o.writeframes((np.clip(g * db(-3), -1, 1) * 32767).astype("<i2").tobytes()); o.close()
    viejo = leer(RAIZ + "trabajo/sfx3/susto.wav", GOLPE / 30 - 0.004, dur)
    for nombre, x in (("vuelta 3", viejo), ("nuevo   ", g)):
        a, p, c = medidas(x)
        print(f"{nombre}: aspereza (30-150 Hz / 2-30 Hz) {a:5.2f} · planitud 1-6 kHz {p:.3f} · centroide {c:5.0f} Hz")
