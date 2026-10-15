# Verificación final de la mezcla: transcribe con small (no esconde trabas) y con
# medium (entiende mejor), imprime por segmento y barre repeticiones de 1 a 7
# palabras por raíz. Si aparece "REP" o una frase rara en small, el corte está mal.
#   python verificar.py trabajo/v01/mezcla.wav
import os, sys, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gpu import modelo as cargar  # Whisper en la placa si se puede, si no en CPU


def raiz(w):
    w = unicodedata.normalize("NFD", w.lower().strip(",.¿?¡!…")).encode("ascii", "ignore").decode()
    return w[:-1] if len(w) > 3 and w.endswith("s") else w


for modelo in ("small", "medium"):
    m = cargar(modelo)
    s, _ = m.transcribe(sys.argv[1], language="es", temperature=0, condition_on_previous_text=False)
    segs = [(round(x.start, 1), x.text.strip()) for x in s]
    print(f"== {modelo}")
    for a, t in segs:
        print(f"  {a:6.1f}  {t}")
    pal = " ".join(t for _, t in segs).split()
    r = [raiz(w) for w in pal]
    for n in range(7, 0, -1):
        for i in range(len(r) - 2 * n + 1):
            if r[i : i + n] == r[i + n : i + 2 * n]:
                print("  REP", n, " ".join(pal[max(0, i - 3) : i + 2 * n + 3]))
