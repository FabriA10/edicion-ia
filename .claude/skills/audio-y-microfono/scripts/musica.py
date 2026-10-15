# Cama de música armada sobre la voz (trabajo/musica/cama.wav, sin nivelar ni agachar: eso va en cierre.py).
# "biscuit" (lukrembo, la de los videos anteriores): intro suave 0-11,5 s, medio segundo de silencio, el drop
# en 12,072 s, el tema hasta 60, un respiro más liviano 60-72, vuelve entero en 72,07 y se apaga desde 120.
#
#   A  la intro debajo de la presentación y el drop justo en "Martín sube sus videos" (donde empieza su historia);
#      se corta seco en "desaparecían" (el chiste del silencio, con el fantasma y los grillos).
#   B  vuelve en "Martín no entiende nada" en un tiempo fuerte (54,07); el respiro liviano del tema cae debajo
#      del perfil marcado en rojo y la vuelta entera (72,07) en "ahí justo entiende algo".
#   C  el segundo drop en "Martín no lo dudó ni un segundo más" (el tema desde 72,07); se apaga en "rendirse…".
# La intro viene 23 dB abajo del resto: sube 14 dB (como en el video del cliente, references de feedback_musica_drop).
import json, re, subprocess, wave
import numpy as np

R = "F:/edicion con ia/proyectos/11-animacion-2d-personajes"
SR = 48000
FPS = 30
src = open(f"{R}/src/anim/voz.ts", encoding="utf-8").read()
TOTAL = int(re.search(r"TOTAL = (\d+)", src).group(1))
M = json.loads(re.search(r"export const M = (\{.*?\}) as const", src, re.S).group(1))
DROP = 12.072

x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{R}/trabajo/musica/biscuit.wav", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
# la intro sube 14 dB (con un empalme de 50 ms antes del silencio del drop)
fin_intro = int(11.6 * SR)
x[:fin_intro] *= 10 ** (14 / 20)

N = int(np.ceil(TOTAL / FPS * SR))
cama = np.zeros((N, 2), np.float32)


def tramo(v0, v1, s0, entra=0.0, sale=0.08):
    """video [v0, v1) <- canción desde s0, con fundidos de entrada y salida (s)."""
    i0, i1 = int(round(v0 * SR)), int(round(v1 * SR))
    j0 = int(round(s0 * SR))
    if j0 < 0:
        i0 -= j0
        j0 = 0
    n = min(i1 - i0, len(x) - j0)
    seg = x[j0 : j0 + n].copy()
    if entra > 0:
        k = int(entra * SR)
        seg[:k] *= np.linspace(0, 1, k)[:, None]
    if sale > 0:
        k = int(sale * SR)
        seg[-k:] *= np.linspace(1, 0, k)[:, None]
    cama[i0 : i0 + n] += seg
    print(f"  video {v0:7.2f}-{v1:7.2f}  <- canción {s0:6.2f}-{s0 + n / SR:6.2f}")


t_sube = M["martinSube"] / FPS
tramo(0.0, M["desaparecian"] / FPS + 0.05, DROP - t_sube, sale=0.06)  # A
tramo((M["martin6"] - 3) / FPS, (M["martin8"] - 4) / FPS, 54.07 - 0.0, entra=0.12, sale=0.35)  # B
tramo((M["martin8"] - 3) / FPS, (M["rendirse"] - 2) / FPS, 72.07, entra=0.0, sale=0.45)  # C

w = wave.open(f"{R}/trabajo/musica/cama.wav", "wb")
w.setnchannels(2)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes((np.clip(cama, -1, 1) * 32767).astype("<i2").tobytes())
w.close()
print("drop en", round(t_sube, 3), "s (Martín sube) y en", round((M["martin8"] - 3) / FPS, 3), "s (no lo dudó)")
