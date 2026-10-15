# Sincroniza la cámara 2 contra la cámara 1 por el audio.
#
# Los dos wav ya están alineados cada uno con SU video (la cámara 1 lleva los
# 880 muestras de relleno del start_time del MOV), así que el desfase de audio
# entre los dos es el desfase de imagen entre las dos cámaras.
#
#   t_cam2 = a + b * t_cam1
#
# Primero una correlación gruesa de envolventes sobre el archivo entero, después
# una fina de forma de onda en ventanas repartidas por todo el archivo, y una
# recta por mínimos cuadrados para ver si los relojes derivan.
import sys, wave
import numpy as np
from scipy.signal import fftconvolve, resample_poly

W = "F:/edicion con ia/proyectos/04-dos-camaras/trabajo/doscam01/"


def leer(ruta):
    w = wave.open(ruta)
    n, ch, ancho, sr = w.getnframes(), w.getnchannels(), w.getsampwidth(), w.getframerate()
    raw = np.frombuffer(w.readframes(n), np.uint8)
    assert ancho == 3
    # 24 bits little endian -> int32
    b = raw.reshape(-1, 3).astype(np.int32)
    v = (b[:, 0] | (b[:, 1] << 8) | (b[:, 2] << 16))
    v = np.where(v >= 1 << 23, v - (1 << 24), v).astype(np.float64) / (1 << 23)
    v = v.reshape(-1, ch)
    return v, sr


a1, sr = leer(W + "cam1-fp0.wav")
a2, sr2 = leer(W + "cam2-fp0.wav")
assert sr == sr2 == 48000
print("cam1", a1.shape, "cam2", a2.shape)

for nombre, a in (("cam1", a1), ("cam2", a2)):
    L, R = a[:, 0], a[:, 1]
    c = np.corrcoef(L[: sr * 60], R[: sr * 60])[0, 1]
    rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
    print(f"{nombre}: rms L {rms(L):.1f} dB  R {rms(R):.1f} dB  corr L/R {c:.3f}  pico {20*np.log10(np.abs(a).max()):.1f} dBFS")

m1 = a1.mean(1)
m2 = a2.mean(1)

# --- gruesa: envolvente de 10 ms
H = 480
def env(m):
    n = len(m) // H
    e = np.sqrt((m[: n * H].reshape(n, H) ** 2).mean(1))
    e = 20 * np.log10(e + 1e-9)
    e = np.clip(e, -70, 0)
    return e - e.mean()

e1, e2 = env(m1), env(m2)
cc = fftconvolve(e2, e1[::-1], mode="full")
lag = np.argmax(cc) - (len(e1) - 1)  # e2[k+lag] ~ e1[k]
print(f"gruesa: cam2 = cam1 + {lag*H/sr:.3f} s")
grueso = lag * H  # en muestras

# --- fina: forma de onda filtrada, ventanas de 8 s cada ~20 s
from scipy.signal import butter, sosfiltfilt
sos = butter(4, [150, 4000], btype="band", fs=sr, output="sos")
f1 = sosfiltfilt(sos, m1)
f2 = sosfiltfilt(sos, m2)
VENT = 8 * sr
BUSCA = int(0.05 * sr)  # +-50 ms alrededor del grueso
puntos = []
for t0 in np.arange(5, len(m1) / sr - 15, 12.0):
    i0 = int(t0 * sr)
    x = f1[i0: i0 + VENT]
    j0 = i0 + grueso - BUSCA
    if j0 < 0 or j0 + VENT + 2 * BUSCA > len(f2):
        continue
    if np.sqrt(np.mean(x ** 2)) < 1e-4:
        continue
    y = f2[j0: j0 + VENT + 2 * BUSCA]
    c = fftconvolve(y, x[::-1], mode="valid")  # len 2*BUSCA+1
    # normalizar
    ex = np.sqrt(np.sum(x ** 2))
    ey = np.sqrt(fftconvolve(y ** 2, np.ones(VENT), mode="valid"))
    cn = c / (ex * ey + 1e-12)
    k = int(np.argmax(cn))
    # interpolación parabólica
    if 0 < k < len(cn) - 1:
        a_, b_, c_ = cn[k - 1], cn[k], cn[k + 1]
        d = 0.5 * (a_ - c_) / (a_ - 2 * b_ + c_)
    else:
        d = 0
    desf = (j0 + k + d) - i0  # muestras: t2 = t1 + desf
    puntos.append((t0 + 4, desf / sr, cn[k]))

P = np.array(puntos)
buenos = P[P[:, 2] > 0.5]
print(f"{len(P)} ventanas, {len(buenos)} con r>0.5")
for t, d, r in P:
    print(f"  t={t:7.1f}  desfase={d*1000:9.3f} ms  r={r:.3f}")
b, a = np.polyfit(buenos[:, 0], buenos[:, 1], 1)
res = buenos[:, 1] - (a + b * buenos[:, 0])
print(f"recta: cam2 = cam1 + {a*1000:.3f} ms + {b*1e6:.2f} ppm * t   (residuo std {res.std()*1000:.3f} ms, max {np.abs(res).max()*1000:.3f} ms)")
print(f"deriva total en 412 s: {b*412*1000:.2f} ms")
np.save(W + "sync.npy", np.array([a, b]))
