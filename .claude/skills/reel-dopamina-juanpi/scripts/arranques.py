# Falsos arranques: transcribe aparte el comienzo de cada bloque del crudo (los
# primeros 0,45 s y los primeros 0,9 s) con small y medium. Si lo que se oye no es
# el comienzo de la frase del bloque ("¿No es?" antes de "no es la más cara",
# "Ahem", "un Ryzen"), hay un falso arranque o un ruido pegado.
#   python scripts/arranques.py trabajo/v01   (usa montaje.json y voz48.wav de ahí)
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gpu import modelo  # Whisper en la placa si se puede, si no en CPU

D = sys.argv[1]
M = json.load(open(os.path.join(D, "montaje.json"), encoding="utf-8"))
TMP = os.path.join(D, "_arr.wav")
ms = {k: modelo(k) for k in ("small", "medium")}
for i, c in enumerate(M["cortes"]):
    a = c["desde"]
    linea = []
    for largo in (0.45, 0.9):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(a), "-t", str(largo), "-i", os.path.join(D, "voz48.wav"),
                        "-ac", "1", "-ar", "16000", TMP], check=True)
        for n, m in ms.items():
            s, _ = m.transcribe(TMP, language="es", temperature=0, condition_on_previous_text=False)
            linea.append(f"{n[0]}{largo}: {' '.join(x.text.strip() for x in s) or '—'}")
    print(f"{i:2} {a:8.2f} {c['motivo'][:40]:40} | " + " | ".join(linea), flush=True)
os.remove(TMP)
