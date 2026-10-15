# Control de subtítulos contra la voz del render (Juanpi, 06/10/2026: "buscá una forma de
# siempre revisar o corroborar que los subtítulos están correctos").
# Transcribe la mezcla final con small y medium (palabras con tiempo) y, para cada
# subtítulo, busca su primera palabra en la voz cerca de donde aparece. Marca:
#   DESTIEMPO  el subtítulo aparece más de 0,25 s antes o después de la palabra
#   NO SE OYE  ninguna de las dos transcripciones tiene la palabra cerca (revisar a mano)
#   python verificar_subs.py <datos.ts> <mezcla.wav> [prompt]
import json, os, re, sys, subprocess, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gpu import modelo

TS, WAV = sys.argv[1], sys.argv[2]
PROMPT = sys.argv[3] if len(sys.argv) > 3 else None
TOL, VENTANA = 0.25, 2.0

NUM = {"cero": "0", "uno": "1", "un": "1", "una": "1", "dos": "2", "tres": "3", "cuatro": "4", "cinco": "5",
       "seis": "6", "siete": "7", "ocho": "8", "nueve": "9", "diez": "10", "doce": "12", "dieciseis": "16",
       # voseo: el subtítulo dice "podés" y Whisper suele escribir "puedes"
       "puedes": "podes", "quieres": "queres", "tienes": "tenes", "sabes": "sabes", "prefieres": "preferis"}


def norm(w):
    w = unicodedata.normalize("NFD", w.lower()).encode("ascii", "ignore").decode()
    w = re.sub(r"[^a-z0-9]", "", w)
    return NUM.get(w, w)


def igual(a, b):
    if not a or not b:
        return False
    if a == b:
        return True
    n = min(len(a), len(b), 5)
    return n >= 3 and a[:n] == b[:n] or (a.isdigit() and b.isdigit() and (a.startswith(b) or b.startswith(a)))


s = open(TS, encoding="utf-8").read()
cues = json.loads(re.search(r"CUES: \w+\[\] = (\[.*?\n\]);", s, re.S).group(1))

ms = {k: modelo(k) for k in ("small", "medium")}
voz = {}
for k in ("small", "medium"):
    m = ms[k]
    seg, _ = m.transcribe(WAV, language="es", temperature=0, condition_on_previous_text=False,
                          word_timestamps=True, initial_prompt=PROMPT if k == "medium" else None)
    # "16GB", "1TB": cada parte cuenta como palabra con el mismo arranque
    voz[k] = [(t, w.start) for x in seg for w in x.words for t in ([norm(w.word)] + re.findall(r"\d+|[a-z]+", norm(w.word))) if t]

TMP = os.path.join(os.path.dirname(os.path.abspath(WAV)), "_subs.wav")


def oir_tramo(a, b):
    """la transcripción larga a veces se corre: el tramo se vuelve a escuchar solo"""
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(a), "-to", str(b), "-i", WAV, "-ar", "16000", "-ac", "1", TMP], check=True)
    out = {}
    for k, m in ms.items():
        seg, _ = m.transcribe(TMP, language="es", temperature=0, condition_on_previous_text=False, word_timestamps=True,
                              initial_prompt=PROMPT if k == "medium" else None)
        out[k] = [(t, a + w.start) for x in seg for w in x.words
                  for t in ([norm(w.word)] + re.findall(r"\d+|[a-z]+", norm(w.word))) if t]
    return out


def medir(c, voz):
    palabras = [norm(p) for p in c["texto"].replace("*", "").split()]
    # las palabras de una o dos letras ("o", "y", "un") se confunden: se busca la primera más larga
    largas = [(j, p) for j, p in enumerate(palabras) if len(p) > 2 or p.isdigit() and p != "1"]
    if not largas:
        return "ok", None
    j, p0 = largas[0]
    deltas = {}
    for k, ws in voz.items():
        cand = [t for w, t in ws if igual(w, p0) and abs(t - c["desde"]) < VENTANA + j * 0.4]
        if cand:
            deltas[k] = min(cand, key=lambda t: abs(t - c["desde"])) - c["desde"]
    if not deltas:
        return "NO SE OYE", deltas
    d = min(deltas.values(), key=abs)  # el modelo que mejor coincide (Whisper deriva ~0,1 s)
    # si la palabra buscada no es la primera, la voz llega después de las cortas de antes
    if d < -TOL or d > TOL + 0.35 * j:
        return "DESTIEMPO", deltas
    return "ok", deltas


malos = 0
for c in cues:
    r, deltas = medir(c, voz)
    if r != "ok":
        r, deltas = medir(c, oir_tramo(max(0, c["desde"] - 1.5), c["desde"] + 2.5))
    if r == "ok":
        continue
    malos += 1
    if r == "NO SE OYE":
        print(f"NO SE OYE  {c['desde']:7.2f}  '{c['texto']}' (revisar a mano)")
    else:
        d = min(deltas.values(), key=abs)
        print(f"DESTIEMPO  {c['desde']:7.2f}  '{c['texto']}': aparece {abs(d):.2f} s {'antes' if d > 0 else 'después'} de la voz "
              f"({', '.join(f'{k} {v:+.2f}' for k, v in deltas.items())})")
if os.path.exists(TMP):
    os.remove(TMP)
print(f"{len(cues)} subtítulos, {malos} para revisar")
