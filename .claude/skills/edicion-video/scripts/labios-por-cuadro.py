# Sincronía de labios, medida sin correlación de movimiento.
#
# El método viejo —correlacionar el movimiento de la boca del render contra un
# recorte del MOV— depende de un salto de búsqueda en el MOV y de una señal
# ruidosa. En el video 6 dio "+89 ms" con una correlación de video de 0,46, y
# era mentira: el error real eran 5 ms. Si la r del video baja de 0,6, ese
# número no vale nada.
#
# Éste no correlaciona movimiento: pregunta **qué cuadro del crudo es cada
# cuadro del render**, comparando la imagen. El grade es una transformación
# monótona por píxel, así que la estructura se mantiene y el cuadro correcto
# gana por varios puntos. Después el audio se mide contra la pista procesada, no
# contra el MOV, y ahí no hay redondeo de búsqueda que se meta.
#
#   python scripts/labios-por-cuadro.py <render> <crudo> <pista.wav> \
#          <cuadro_render> <cuadro_crudo>
#
# Los dos cuadros salen del mapa de bloques: el primer cuadro de un bloque largo
# en la edición y el cuadro del crudo del que salió, round(desde*fps).
import subprocess, sys
import numpy as np

REN, CRUDO, PISTA = sys.argv[1], sys.argv[2], sys.argv[3]
C_REN, C_CRUDO = int(sys.argv[4]), int(sys.argv[5])
FPS = 30
# Zona de boca y mentón sobre el lienzo de 1080×1920. Ajustala al encuadre.
X0, Y0, CW, CH = 444, 900, 200, 356
VENTANA = 8  # cuántos cuadros del crudo se prueban a cada lado


def tira(archivo, desde, cuantos):
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", archivo,
         "-vf", f"select='between(n,{desde},{desde+cuantos-1})',setpts=N/FRAME_RATE/TB,"
                f"crop={CW}:{CH}:{X0}:{Y0},format=gray",
         "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True)
    n = len(p.stdout) // (CW * CH)
    return np.frombuffer(p.stdout, np.uint8)[: n * CW * CH].reshape(n, CH, CW).astype(np.float64)


def r(a, b):
    a, b = a - a.mean(), b - b.mean()
    return float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) + 1e-9))


def audio(archivo, desde, dur):
    p = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(desde), "-t", str(dur),
                        "-i", archivo, "-af", "pan=mono|c0=c0", "-ar", "48000",
                        "-f", "s16le", "-"], capture_output=True)
    return np.frombuffer(p.stdout, np.int16).astype(np.float64) / 32768


def env(x, k=48):  # ventanas de 1 ms
    x = x[: len(x) // k * k].reshape(-1, k)
    return np.log10(np.sqrt((x ** 2).mean(1)) + 1e-6)


# --- video: ¿qué cuadro del crudo es cada cuadro del render? ---
LARGO = 6
ren = tira(REN, C_REN, LARGO)
cru = tira(CRUDO, C_CRUDO - VENTANA, LARGO + 2 * VENTANA)
desfases = []
for k in range(ren.shape[0]):
    puntos = sorted(((r(ren[k], cru[j]), C_CRUDO - VENTANA + j) for j in range(cru.shape[0])), reverse=True)
    mejor, seg = puntos[0], puntos[1]
    d = mejor[1] - (C_CRUDO + k)
    desfases.append(d)
    print(f"  render {C_REN+k} -> crudo {mejor[1]} (r={mejor[0]:.3f}, segundo {seg[0]:.3f})  desfase {d:+d} cuadros")
if len(set(desfases)) == 1 and desfases[0] == 0:
    print("  VIDEO: exacto, cuadro por cuadro")
else:
    print(f"  VIDEO: !! desfase {desfases}")

# --- audio: contra la pista procesada, no contra el MOV ---
DUR = 7.0
t_ren, t_src = C_REN / FPS, C_CRUDO / FPS
b = env(audio(REN, t_ren - 0.2, DUR + 0.4))
a = env(audio(PISTA, t_src, DUR))
mejor = (-2, 0)
for ms in range(-300, 301):
    j = 200 + ms
    if j < 0 or j + len(a) > len(b):
        continue
    x, y = a, b[j:j + len(a)]
    xn, yn = x - x.mean(), y - y.mean()
    rr = float((xn * yn).sum() / (np.sqrt((xn * xn).sum() * (yn * yn).sum()) + 1e-12))
    if rr > mejor[0]:
        mejor = (rr, ms)
print(f"  AUDIO: {mejor[1]:+d} ms respecto de donde tiene que estar   r={mejor[0]:.4f}")
print(f"\n  ERROR DE LABIOS = {mejor[1] + desfases[0] * 1000 // FPS:+d} ms  (positivo = el audio va tarde)")
print("  umbral de percepción: ~45 ms si el audio ADELANTA, ~125 ms si ATRASA")
