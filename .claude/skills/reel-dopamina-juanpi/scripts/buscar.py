# Busca puntos de entrada limpios: valles de la envolvente en [a, b] y qué se
# escucha desde cada uno (small, sin condicionar: no "limpia" las trabas).
#   python buscar.py a b fin [a b fin ...]
import subprocess, sys, wave
import numpy as np
from faster_whisper import WhisperModel

w = wave.open("trabajo/v01/mic16.wav")
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
n = len(x) // 160
E = 20 * np.log10(np.sqrt((x[: n * 160].reshape(n, 160) ** 2).mean(1)) + 1e-9)
m = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=8)
TMP = "c:/Users/Juampi/AppData/Local/Temp/b.wav"


def oir(a, b):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(a), "-to", str(b), "-i", "trabajo/v01/voz48.wav", TMP], check=True)
    s, _ = m.transcribe(TMP, language="es", temperature=0, condition_on_previous_text=False)
    return " ".join(z.text.strip() for z in s)


args = [float(v) for v in sys.argv[1:]]
for k in range(0, len(args), 3):
    a, b, fin = args[k : k + 3]
    i0, i1 = int(a * 100), int(b * 100)
    valles = []
    j = i0
    while j < i1:
        if E[j] < -38:
            s = j
            while j < i1 and E[j] < -38:
                j += 1
            minimo = s + int(np.argmin(E[s:j]))
            valles.append((round(j / 100, 2), j - s, int(E[minimo])))
        j += 1
    print(f"== {a}-{b} (hasta {fin})")
    for t, largo, piso in valles:
        print(f"  desde {t} (valle {largo * 10} ms, {piso} dB): {oir(t - 0.01, fin)}")
