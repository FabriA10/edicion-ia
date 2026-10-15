# Ataques exactos (envolvente de banda completa, 1 ms) del drop y de los
# compases siguientes: confirma la grilla de 3,000 s (80 BPM) sobre el tramo
# que se va a usar.
import numpy as np
from scipy.io import wavfile
W = "F:/edicion con ia/proyectos/04-dos-camaras/trabajo/doscam01/"
sr, x = wavfile.read(W + "musica-48k.wav")
m = x.mean(1)
H = sr // 1000
n = len(m) // H
E = 20 * np.log10(np.sqrt((m[: n * H].reshape(n, H) ** 2).mean(1)) + 1e-9)

print("drop, ms a ms:", " ".join(f"{i/1000:.3f}:{E[i]:.0f}" for i in range(12060, 12090)))
# muestra exacta: primer |x| por encima de 30 dB sobre el piso del hueco
piso = np.sqrt(np.mean(m[int(11.6*sr):int(12.0*sr)]**2))
j = int(12.05*sr) + int(np.argmax(np.abs(m[int(12.05*sr):int(12.1*sr)]) > piso * 10**(30/20)))
print(f"primera muestra 30 dB sobre el piso del hueco: {j} = {j/sr:.4f} s")

def ataque(t0, t1, salto):
    for i in range(int(t0 * 1000), int(t1 * 1000)):
        if E[i] - E[i - 30:i].min() >= salto:
            return i / 1000
    return None

for k in range(0, 13):
    t = 12.081 + 3.0 * k
    a = ataque(t - 0.06, t + 0.06, 8)
    print(f"  compás {k:2d} esperado {t:7.3f}  ataque {a}  ({'-' if a is None else f'{(a-t)*1000:+.0f} ms'})")
